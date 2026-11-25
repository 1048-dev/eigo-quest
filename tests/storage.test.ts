/**
 * ファイルの置き場所（run5 Phase 3）: ローカル / S3 互換（fetch をモックした S3）。
 *  - キーの形（外に出られない）
 *  - put / get / head / stream / delete / ping
 *  - S3: 署名（AWS の公式の例と同じ値）・URL の形（AWS / R2・Supabase のパス形式）・404・エラーに秘密が入らない
 *  - 設定のえらび方（STORAGE_DRIVER / S3_BUCKET）
 *  - ワークブック: 置き場所にあれば そのキー、無ければ null（Python は呼ばない）
 */
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorage, resolveInRoot } from "@/lib/storage/local";
import { S3Storage, signV4, type S3Config } from "@/lib/storage/s3";
import { createStorage, isEphemeralLocal, isValidKey, storageConfig, StorageError } from "@/lib/storage";

const enc = (s: string) => new TextEncoder().encode(s);
const dec = (b: Uint8Array | null) => (b ? new TextDecoder().decode(b) : null);

async function readStream(s: ReadableStream<Uint8Array>): Promise<string> {
  return new TextDecoder().decode(new Uint8Array(await new Response(s).arrayBuffer()));
}

describe("キーの形", () => {
  it("英数字と ._-/ だけ・.. や 空のセグメントや 絶対パスは だめ", () => {
    for (const ok of ["reports/p1/2026-11/abc.pdf", "worksheets/monthly/world-01.pdf", "a", "A_b-c.d"]) expect(isValidKey(ok)).toBe(true);
    for (const bad of ["", "/abs.pdf", "../x", "a/../b", "a/./b", "a//b", "a/", "C:\\x.pdf", "a\\b", "a b", "日本語.pdf", "a\0b", ".hidden", "x".repeat(600), null, 3]) {
      expect(isValidKey(bad)).toBe(false);
    }
  });
});

describe("ローカルの置き場所", () => {
  let root = "";
  beforeEach(() => { root = mkdtempSync(path.join(tmpdir(), "eq-store-")); });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("put → head / get / stream → delete（無いものは null・delete は エラーにしない）", async () => {
    const s = new LocalStorage(root);
    expect(await s.head("reports/p/x.pdf")).toBeNull();
    expect(await s.get("reports/p/x.pdf")).toBeNull();
    expect(await s.stream("reports/p/x.pdf")).toBeNull();
    await s.put("reports/p/x.pdf", enc("%PDF-hello"));
    expect(existsSync(path.join(root, "reports", "p", "x.pdf"))).toBe(true);
    expect(await s.head("reports/p/x.pdf")).toEqual({ size: 10 });
    expect(dec(await s.get("reports/p/x.pdf"))).toBe("%PDF-hello");
    const st = (await s.stream("reports/p/x.pdf"))!;
    expect(st.size).toBe(10);
    expect(await readStream(st.body)).toBe("%PDF-hello");
    await s.delete("reports/p/x.pdf");
    await s.delete("reports/p/x.pdf");
    expect(await s.head("reports/p/x.pdf")).toBeNull();
    expect((await s.ping()).ok).toBe(true);
    expect(s.description).toContain(root);
  });

  it("おかしなキーは 読み書きしない（置き場所の外に出られない）", async () => {
    const s = new LocalStorage(root);
    await expect(s.put("../outside.pdf", enc("x"))).rejects.toThrow();
    await expect(s.get("a/../../b")).rejects.toThrow();
    expect(resolveInRoot(root, "../x")).toBeNull();
    expect(resolveInRoot(root, "reports/p/x.pdf")).toBe(path.join(root, "reports", "p", "x.pdf"));
    expect(existsSync(path.join(root, "..", "outside.pdf"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// S3（fetch のモック）
// ---------------------------------------------------------------------------
const SECRET = "test-secret-key-not-real-0123456789";
const AKID = "AKIDTESTNOTREAL";

/** かんたんな S3 のまね（メモリ）。届いたリクエストも おぼえる */
function fakeS3() {
  const objects = new Map<string, Uint8Array>();
  const calls: { method: string; url: URL; headers: Record<string, string> }[] = [];
  let denyAll = false;
  const fetchImpl = vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ method: init?.method ?? "GET", url, headers });
    if (denyAll) return new Response("<Error><Code>AccessDenied</Code></Error>", { status: 403 });
    if (!headers.authorization?.startsWith(`AWS4-HMAC-SHA256 Credential=${AKID}/`)) return new Response("no auth", { status: 403 });
    const k = decodeURIComponent(url.pathname);
    switch (init?.method) {
      case "PUT": {
        const body = new Uint8Array(await new Response(init.body as BodyInit).arrayBuffer());
        if (createHash("sha256").update(body).digest("hex") !== headers["x-amz-content-sha256"]) return new Response("bad hash", { status: 400 });
        objects.set(k, body);
        return new Response(null, { status: 200 });
      }
      case "HEAD": {
        const o = objects.get(k);
        return o ? new Response(null, { status: 200, headers: { "content-length": String(o.length) } }) : new Response(null, { status: 404 });
      }
      case "DELETE":
        objects.delete(k);
        return new Response(null, { status: 204 });
      default: {
        if (url.searchParams.get("list-type") === "2") return new Response("<ListBucketResult/>", { status: 200 });
        const o = objects.get(k);
        return o ? new Response(new Uint8Array(o), { status: 200, headers: { "content-length": String(o.length) } }) : new Response("NoSuchKey", { status: 404 });
      }
    }
  });
  return { objects, calls, fetchImpl, deny: (v: boolean) => { denyAll = v; } };
}

const r2: S3Config = {
  bucket: "eq-files", region: "auto", endpoint: "https://acc123.r2.cloudflarestorage.com",
  accessKeyId: AKID, secretAccessKey: SECRET, forcePathStyle: true, prefix: "",
};

describe("S3 互換の置き場所", () => {
  it("署名: AWS の公式の例（GET Object）と同じ署名になる", () => {
    const r = signV4({
      method: "GET",
      url: new URL("https://examplebucket.s3.amazonaws.com/test.txt"),
      headers: { range: "bytes=0-9" },
      payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      accessKeyId: "AKIAIOSFODNN7EXAMPLE",
      secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      region: "us-east-1",
      now: new Date("2013-05-24T00:00:00Z"),
    });
    expect(r.signature).toBe("f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41");
    expect(r.headers.authorization).toContain("SignedHeaders=host;range;x-amz-content-sha256;x-amz-date");
    expect(r.headers.host).toBeUndefined(); // host は fetch が付ける
  });

  it("put → head / get / stream → delete の往復（R2: パス形式）。署名つき・本文のハッシュも送る", async () => {
    const f = fakeS3();
    const s = new S3Storage(r2, { fetchImpl: f.fetchImpl });
    await s.put("reports/p1/2026-11/a.pdf", enc("%PDF-r2"), "application/pdf");
    expect(f.calls[0]!.url.toString()).toBe("https://acc123.r2.cloudflarestorage.com/eq-files/reports/p1/2026-11/a.pdf");
    expect(f.calls[0]!.headers["content-type"]).toBe("application/pdf");
    expect(f.calls[0]!.headers.authorization).toMatch(/Credential=AKIDTESTNOTREAL\/\d{8}\/auto\/s3\/aws4_request/);
    expect(await s.head("reports/p1/2026-11/a.pdf")).toEqual({ size: 7 });
    expect(dec(await s.get("reports/p1/2026-11/a.pdf"))).toBe("%PDF-r2");
    const st = (await s.stream("reports/p1/2026-11/a.pdf"))!;
    expect(st.size).toBe(7);
    expect(await readStream(st.body)).toBe("%PDF-r2");
    await s.delete("reports/p1/2026-11/a.pdf");
    expect(await s.head("reports/p1/2026-11/a.pdf")).toBeNull();
    expect(await s.get("reports/p1/2026-11/a.pdf")).toBeNull();
    expect(await s.stream("reports/p1/2026-11/a.pdf")).toBeNull();
    expect(await s.ping()).toEqual({ ok: true });
    expect(s.description).not.toContain(SECRET);
  });

  it("URL の形: AWS はバーチャルホスト形式、Supabase はエンドポイントのパスの下、プレフィックスもつく", () => {
    const aws = new S3Storage({ ...r2, endpoint: null, region: "ap-northeast-1", forcePathStyle: false });
    expect(aws.objectUrl("worksheets/monthly/world-01.pdf").toString()).toBe("https://eq-files.s3.ap-northeast-1.amazonaws.com/worksheets/monthly/world-01.pdf");
    const supa = new S3Storage({ ...r2, endpoint: "https://ref.supabase.co/storage/v1/s3", region: "ap-northeast-1", prefix: "eigo/" });
    expect(supa.objectUrl("a/b.pdf").toString()).toBe("https://ref.supabase.co/storage/v1/s3/eq-files/eigo/a/b.pdf");
    expect(supa.objectUrl(null, { "list-type": "2" }).toString()).toBe("https://ref.supabase.co/storage/v1/s3/eq-files/?list-type=2");
  });

  it("403 などは StorageError（ステータスだけ。キーや秘密は入らない）・ping は ok:false", async () => {
    const f = fakeS3();
    f.deny(true);
    const s = new S3Storage(r2, { fetchImpl: f.fetchImpl });
    const err = await s.get("reports/p1/x.pdf").catch((e) => e);
    expect(err).toBeInstanceOf(StorageError);
    expect(err.code).toBe("HTTP_403");
    expect(String(err.message)).not.toContain(SECRET);
    expect(String(err.message)).not.toContain("reports/p1");
    expect(await s.ping()).toEqual({ ok: false, detail: "HTTP_403" });
    await expect(s.put("../x", enc("x"))).rejects.toMatchObject({ code: "INVALID_KEY" });
  });

  it("ネットワークエラー・時間切れも StorageError", async () => {
    const s = new S3Storage(r2, { fetchImpl: async () => { throw new TypeError("fetch failed"); } });
    await expect(s.head("a.pdf")).rejects.toMatchObject({ name: "StorageError", code: "NETWORK_ERROR" });
    const slow = new S3Storage(r2, {
      fetchImpl: (_u, init) => new Promise((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new Error("aborted")))),
    });
    expect(await slow.ping()).toEqual({ ok: false, detail: "TIMEOUT" });
  }, 10_000);
});

describe("設定のえらび方", () => {
  it("STORAGE_DRIVER が空: S3_BUCKET があれば s3、なければ local", () => {
    expect(storageConfig({}).driver).toBe("local");
    expect(storageConfig({ REPORT_STORAGE_DIR: "/tmp/x" }).localRoot).toBe(path.resolve("/tmp/x"));
    const c = storageConfig({ S3_BUCKET: "b", S3_ACCESS_KEY_ID: "k", S3_SECRET_ACCESS_KEY: "s", S3_ENDPOINT: "https://e.example" });
    expect(c.driver).toBe("s3");
    expect(c.missing).toEqual([]);
    expect(c.s3).toMatchObject({ region: "auto", forcePathStyle: true, prefix: "" });
    expect(storageConfig({ STORAGE_DRIVER: "local", S3_BUCKET: "b" }).driver).toBe("local");
    expect(storageConfig({ S3_BUCKET: "b", S3_ACCESS_KEY_ID: "k", S3_SECRET_ACCESS_KEY: "s" }).s3).toMatchObject({ region: "us-east-1", forcePathStyle: false });
    expect(storageConfig({ S3_BUCKET: "b", S3_ACCESS_KEY_ID: "k", S3_SECRET_ACCESS_KEY: "s", S3_PREFIX: "/eq" }).s3!.prefix).toBe("eq/");
  });

  it("s3 で足りない変数は 名前だけ返す（値は入れない）・作ろうとすると エラー", () => {
    const c = storageConfig({ STORAGE_DRIVER: "s3", S3_SECRET_ACCESS_KEY: "zzz-secret" });
    expect(c.missing).toEqual(["S3_BUCKET", "S3_ACCESS_KEY_ID"]);
    expect(() => createStorage(c)).toThrow(/S3_BUCKET/);
    try { createStorage(c); } catch (e) { expect(String(e)).not.toContain("zzz-secret"); }
    expect(storageConfig({ STORAGE_DRIVER: "s3", S3_BUCKET: "b", S3_ACCESS_KEY_ID: "k", S3_SECRET_ACCESS_KEY: "s", S3_ENDPOINT: "ftp://x" }).missing).toEqual(["S3_ENDPOINT"]);
  });

  it("サーバーレスで local は「ファイルが残らない」", () => {
    expect(isEphemeralLocal({ VERCEL: "1" })).toBe(true);
    expect(isEphemeralLocal({ VERCEL: "1", S3_BUCKET: "b" })).toBe(false);
    expect(isEphemeralLocal({})).toBe(false);
  });
});

describe("ワークブック（置き場所にあるものを使う。Python は呼ばない）", () => {
  let root = "";
  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "eq-ws-"));
    vi.stubEnv("STORAGE_DRIVER", "local");
    vi.stubEnv("REPORT_STORAGE_DIR", root);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });

  it("置き場所にあれば そのキーと大きさ、無ければ null（警告だけ）", async () => {
    const { ensureWorksheetBundle, worksheetKey } = await import("@/lib/report/storage");
    const { getStorage } = await import("@/lib/storage");
    expect(worksheetKey(3)).toBe("worksheets/monthly/month-03.pdf");
    await getStorage().put(worksheetKey(3), enc("%PDF-ws3"));
    expect(await ensureWorksheetBundle(3)).toEqual({ key: "worksheets/monthly/month-03.pdf", bytes: 8 });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(await ensureWorksheetBundle(99)).toBeNull(); // worksheets/out/monthly にも無い
      expect(warn.mock.calls[0]![0]).toContain("worksheets:upload");
    } finally {
      warn.mockRestore();
    }
  });

  it("サーバーのコードから Python（child_process）を呼ばない", async () => {
    const { readFileSync } = await import("node:fs");
    for (const f of ["src/lib/report/pdf.ts", "src/lib/report/storage.ts", "src/lib/services/monthlyDeliveryService.ts"]) {
      const src = readFileSync(path.join(process.cwd(), f), "utf8");
      expect(src).not.toContain("child_process");
      expect(src).not.toMatch(/generate_worksheets\.py/);
    }
  });
});
