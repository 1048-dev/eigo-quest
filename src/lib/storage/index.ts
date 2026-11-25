/**
 * ファイルの置き場所（run5 Phase 3）。STORAGE_DRIVER で えらぶ:
 *  - local: REPORT_STORAGE_DIR（空なら <プロジェクト>/.data/reports）のフォルダ。開発・自分のサーバー用
 *  - s3   : S3 互換（AWS S3・Cloudflare R2・Supabase Storage の S3 API・MinIO など）。Vercel などのサーバーレスでは こちら
 * STORAGE_DRIVER が空なら、S3_BUCKET があれば s3、なければ local。
 *
 * 置くもの（キー）:
 *  reports/<保護者ID>/<YYYY-MM>/<ランダム>.pdf   … お子さまごとの学習レポート（その家だけのもの）
 *  worksheets/monthly/month-NN.pdf                … 20レッスンごとの 1か月ワークブック（どの家も同じ。npm run worksheets:upload で置く）
 */
import path from "node:path";
import { LocalStorage } from "./local";
import { S3Storage, type FetchLike, type S3Config } from "./s3";
import type { ObjectStorage } from "./types";

export type { ObjectStorage, StoredObject } from "./types";
export { isValidKey, StorageError } from "./types";

type Env = Record<string, string | undefined>;

export interface StorageConfig {
  driver: "local" | "s3";
  localRoot: string;
  s3: S3Config | null;
  /** 足りない設定（変数の名前だけ。値は入れない） */
  missing: string[];
}

const truthy = (v: string | undefined) => /^(1|true|yes|on)$/i.test(v?.trim() ?? "");
const falsy = (v: string | undefined) => /^(0|false|no|off)$/i.test(v?.trim() ?? "");

/**
 * S3_ENDPOINT は https だけ（お子さまの学習レポートを 暗号化なしで 送らない）。
 * http は 同じパソコンの中（localhost / 127.0.0.1 / ::1。手元の MinIO など）だけ みとめる（run5 Phase 4 のセキュリティの見直し）。
 */
export function isAllowedEndpoint(endpoint: string): boolean {
  let u: URL;
  try {
    u = new URL(endpoint);
  } catch {
    return false;
  }
  if (u.username || u.password) return false; // キーは URL に入れず S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY へ
  if (u.protocol === "https:") return true;
  return u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
}

export function storageConfig(env: Env = process.env): StorageConfig {
  const want = env.STORAGE_DRIVER?.trim().toLowerCase();
  const driver: "local" | "s3" = want === "s3" || want === "local" ? want : env.S3_BUCKET?.trim() ? "s3" : "local";
  const localRoot = path.resolve(env.REPORT_STORAGE_DIR?.trim() || path.join(process.cwd(), ".data", "reports"));
  if (driver === "local") return { driver, localRoot, s3: null, missing: [] };
  const endpoint = env.S3_ENDPOINT?.trim() || null;
  const values = {
    S3_BUCKET: env.S3_BUCKET?.trim() ?? "",
    S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID?.trim() ?? "",
    S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY?.trim() ?? "",
  };
  const missing = Object.entries(values).filter(([, v]) => !v).map(([k]) => k);
  if (endpoint && !isAllowedEndpoint(endpoint)) missing.push("S3_ENDPOINT");
  let prefix = (env.S3_PREFIX?.trim() ?? "").replace(/^\/+/, "");
  if (prefix && !prefix.endsWith("/")) prefix += "/";
  const s3: S3Config = {
    bucket: values.S3_BUCKET,
    region: env.S3_REGION?.trim() || (endpoint ? "auto" : "us-east-1"),
    endpoint,
    accessKeyId: values.S3_ACCESS_KEY_ID,
    secretAccessKey: values.S3_SECRET_ACCESS_KEY,
    // 既定: エンドポイントを指定したら パス形式（R2・Supabase・MinIO）。AWS なら バーチャルホスト形式
    forcePathStyle: truthy(env.S3_FORCE_PATH_STYLE) ? true : falsy(env.S3_FORCE_PATH_STYLE) ? false : !!endpoint,
    prefix,
  };
  return { driver, localRoot, s3, missing };
}

export function createStorage(cfg: StorageConfig, opts: { fetchImpl?: FetchLike } = {}): ObjectStorage {
  if (cfg.driver === "s3") {
    if (!cfg.s3 || cfg.missing.length) throw new Error(`STORAGE_DRIVER=s3 の設定が足りません: ${cfg.missing.join(", ")}`);
    return new S3Storage(cfg.s3, opts);
  }
  return new LocalStorage(cfg.localRoot);
}

let cached: { sig: string; storage: ObjectStorage } | null = null;

/** いまの環境変数の置き場所（同じ設定なら使い回す） */
export function getStorage(env: Env = process.env): ObjectStorage {
  const cfg = storageConfig(env);
  const sig = JSON.stringify(cfg);
  if (!cached || cached.sig !== sig) cached = { sig, storage: createStorage(cfg) };
  return cached.storage;
}

/** サーバーレス（Vercel など）で ローカルのフォルダを使っていないか（ファイルが消える） */
export function isEphemeralLocal(env: Env = process.env): boolean {
  return storageConfig(env).driver === "local" && !!(env.VERCEL || env.AWS_LAMBDA_FUNCTION_NAME || env.NETLIFY);
}
