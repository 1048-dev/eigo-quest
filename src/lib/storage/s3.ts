/**
 * S3 互換ストレージ（AWS S3・Cloudflare R2・Supabase Storage の S3 API・MinIO など）。
 * SDK を入れずに fetch + AWS Signature Version 4 だけで話す（使うのは PUT / GET / HEAD / DELETE / ListObjectsV2 の1件だけ）。
 * ログ・エラーには キーやトークンを出さない（HTTP のステータスだけ）。
 */
import { createHash, createHmac } from "node:crypto";
import type { ObjectStorage, StoredObject } from "./types";
import { StorageError, assertValidKey } from "./types";

export interface S3Config {
  bucket: string;
  /** 例: "us-east-1"。R2 は "auto" */
  region: string;
  /** 例: https://<account>.r2.cloudflarestorage.com / https://<ref>.supabase.co/storage/v1/s3。空なら AWS */
  endpoint: string | null;
  accessKeyId: string;
  secretAccessKey: string;
  /** true: <endpoint>/<bucket>/<key>（R2・Supabase・MinIO）、false: <bucket>.s3.<region>.amazonaws.com/<key> */
  forcePathStyle: boolean;
  /** すべてのキーの前につける（例: "eigo-quest/"）。空でもよい */
  prefix: string;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const HEADERS_TIMEOUT_MS = 15_000;
const PUT_TIMEOUT_MS = 60_000;

const sha256Hex = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
const hmac = (key: string | Buffer, data: string) => createHmac("sha256", key).update(data, "utf8").digest();

/** RFC 3986 の エンコード（S3 の署名で使う形。英数字と -._~ 以外はすべて %XX） */
export function rfc3986(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function amzDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export interface SignInput {
  method: string;
  url: URL;
  /** 署名に入れるヘッダー（host / x-amz-date / x-amz-content-sha256 は自動で入る） */
  headers?: Record<string, string>;
  payloadHash: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service?: string;
  now: Date;
}

/** AWS Signature Version 4。送るヘッダー（authorization を含む・host は除く）を返す */
export function signV4(input: SignInput): { headers: Record<string, string>; signature: string; canonicalRequest: string } {
  const service = input.service ?? "s3";
  const date = amzDate(input.now);
  const day = date.slice(0, 8);
  const all: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.headers ?? {})) all[k.toLowerCase()] = String(v).trim().replace(/\s+/g, " ");
  all.host = input.url.host;
  all["x-amz-date"] = date;
  all["x-amz-content-sha256"] = input.payloadHash;
  const names = Object.keys(all).sort();
  const canonicalHeaders = names.map((n) => `${n}:${all[n]}\n`).join("");
  const signedHeaders = names.join(";");
  const query = [...input.url.searchParams.entries()]
    .map(([k, v]) => [rfc3986(k), rfc3986(v)] as const)
    .sort((a, b) => (a[0] === b[0] ? (a[1] < b[1] ? -1 : 1) : a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const canonicalRequest = [input.method.toUpperCase(), input.url.pathname || "/", query, canonicalHeaders, signedHeaders, input.payloadHash].join("\n");
  const scope = `${day}/${input.region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", date, scope, sha256Hex(canonicalRequest)].join("\n");
  const kDate = hmac(`AWS4${input.secretAccessKey}`, day);
  const kRegion = hmac(kDate, input.region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");
  const headers: Record<string, string> = {};
  for (const n of names) if (n !== "host") headers[n] = all[n]!;
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return { headers, signature, canonicalRequest };
}

export class S3Storage implements ObjectStorage {
  readonly driver = "s3" as const;
  private readonly fetchImpl: FetchLike;
  private readonly now: () => Date;

  constructor(private readonly cfg: S3Config, opts: { fetchImpl?: FetchLike; now?: () => Date } = {}) {
    this.fetchImpl = opts.fetchImpl ?? ((input, init) => fetch(input, init));
    this.now = opts.now ?? (() => new Date());
  }

  /** 秘密を含まない説明（ログ・ヘルスチェック用） */
  get description(): string {
    const host = this.cfg.endpoint ? new URL(this.cfg.endpoint).host : `s3.${this.cfg.region}.amazonaws.com`;
    return `s3://${this.cfg.bucket}/${this.cfg.prefix}（${host}）`;
  }

  /** オブジェクトの URL（キーはセグメントごとに RFC 3986 でエンコード） */
  objectUrl(key: string | null, query: Record<string, string> = {}): URL {
    const objectPath = key == null ? "" : (this.cfg.prefix + key).split("/").map(rfc3986).join("/");
    let url: URL;
    if (this.cfg.endpoint) {
      const base = new URL(this.cfg.endpoint);
      const basePath = base.pathname.replace(/\/+$/, "");
      if (this.cfg.forcePathStyle) {
        url = new URL(`${base.origin}${basePath}/${rfc3986(this.cfg.bucket)}/${objectPath}`);
      } else {
        url = new URL(`${base.protocol}//${this.cfg.bucket}.${base.host}${basePath}/${objectPath}`);
      }
    } else if (this.cfg.forcePathStyle) {
      url = new URL(`https://s3.${this.cfg.region}.amazonaws.com/${rfc3986(this.cfg.bucket)}/${objectPath}`);
    } else {
      url = new URL(`https://${this.cfg.bucket}.s3.${this.cfg.region}.amazonaws.com/${objectPath}`);
    }
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return url;
  }

  private async send(
    method: string, url: URL, opts: { body?: Uint8Array; headers?: Record<string, string>; timeoutMs?: number; keepBody?: boolean } = {},
  ): Promise<Response> {
    const payloadHash = opts.body ? sha256Hex(opts.body) : EMPTY_SHA256;
    const { headers } = signV4({
      method, url, headers: opts.headers, payloadHash,
      accessKeyId: this.cfg.accessKeyId, secretAccessKey: this.cfg.secretAccessKey, region: this.cfg.region, now: this.now(),
    });
    // ヘッダーが届くまでだけ時間を区切る（大きなファイルの本文を読んでいる途中では切らない）
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? HEADERS_TIMEOUT_MS);
    try {
      return await this.fetchImpl(url.toString(), {
        method,
        headers,
        body: opts.body ? new Blob([new Uint8Array(opts.body)]) : undefined,
        signal: ctrl.signal,
        cache: "no-store",
      } as RequestInit);
    } catch (e) {
      throw new StorageError(ctrl.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR", `S3 ${method}: ${ctrl.signal.aborted ? "timeout" : (e as Error)?.name ?? "error"}`);
    } finally {
      clearTimeout(timer);
    }
  }

  private fail(op: string, res: Response): never {
    throw new StorageError(`HTTP_${res.status}`, `S3 ${op}: HTTP ${res.status}`);
  }

  async put(key: string, data: Uint8Array, contentType = "application/octet-stream"): Promise<void> {
    assertValidKey(key);
    const res = await this.send("PUT", this.objectUrl(key), { body: data, headers: { "content-type": contentType }, timeoutMs: PUT_TIMEOUT_MS });
    await res.body?.cancel().catch(() => {});
    if (!res.ok) this.fail("PUT", res);
  }

  async get(key: string): Promise<Uint8Array | null> {
    assertValidKey(key);
    const res = await this.send("GET", this.objectUrl(key));
    if (res.status === 404) { await res.body?.cancel().catch(() => {}); return null; }
    if (!res.ok) { await res.body?.cancel().catch(() => {}); this.fail("GET", res); }
    return new Uint8Array(await res.arrayBuffer());
  }

  async stream(key: string): Promise<StoredObject | null> {
    assertValidKey(key);
    const res = await this.send("GET", this.objectUrl(key));
    if (res.status === 404) { await res.body?.cancel().catch(() => {}); return null; }
    if (!res.ok || !res.body) { await res.body?.cancel().catch(() => {}); this.fail("GET", res); }
    const len = Number(res.headers.get("content-length"));
    return { body: res.body, size: Number.isFinite(len) && len >= 0 && res.headers.has("content-length") ? len : null };
  }

  async head(key: string): Promise<{ size: number } | null> {
    assertValidKey(key);
    const res = await this.send("HEAD", this.objectUrl(key));
    await res.body?.cancel().catch(() => {});
    if (res.status === 404) return null;
    if (!res.ok) this.fail("HEAD", res);
    return { size: Number(res.headers.get("content-length")) || 0 };
  }

  async delete(key: string): Promise<void> {
    assertValidKey(key);
    const res = await this.send("DELETE", this.objectUrl(key));
    await res.body?.cancel().catch(() => {});
    if (!res.ok && res.status !== 404) this.fail("DELETE", res);
  }

  /** つながるか（バケットを1件だけ一覧する。中身は見ない） */
  async ping(): Promise<{ ok: boolean; detail?: string }> {
    try {
      const query: Record<string, string> = { "list-type": "2", "max-keys": "1" };
      if (this.cfg.prefix) query.prefix = this.cfg.prefix;
      const res = await this.send("GET", this.objectUrl(null, query), { timeoutMs: 5_000 });
      await res.body?.cancel().catch(() => {});
      return res.ok ? { ok: true } : { ok: false, detail: `HTTP_${res.status}` };
    } catch (e) {
      return { ok: false, detail: e instanceof StorageError ? e.code : "ERROR" };
    }
  }
}
