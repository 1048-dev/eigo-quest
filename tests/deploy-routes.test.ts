/**
 * 公開の準備（run5 Phase 3）の API:
 *  - cron の認証（CRON_SECRET。無ければ 503、ちがえば 401）
 *  - /api/cron/line-monthly: 送る → LINE のリンク → /d/<token>/<file> が S3 互換の置き場所から流れてくる
 *  - /api/cron/trial-cleanup: 古い おためし学習者を消す
 *  - /api/health: DB・置き場所・LINE の状態（秘密・バケット名・ホスト名は出さない）
 * 置き場所は fetch をモックした S3（R2 のようなパス形式）、DB は メモリ内 Prisma。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
let dbUp = true;
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => dbUp, markDbDown: () => {} }));
vi.mock("@/lib/report/pdf", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/report/pdf")>();
  return { ...orig, renderReportPdf: orig.renderBasicReportPdf };
});

const { checkCronAuth, CRON_SECRET_MIN_LENGTH } = await import("@/lib/cron");
const cronMonthly = await import("@/app/api/cron/line-monthly/route");
const cronCleanup = await import("@/app/api/cron/trial-cleanup/route");
const health = await import("@/app/api/health/route");
const download = await import("@/app/d/[token]/[file]/route");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");

const CRON = "cron-secret-for-tests-0123456789";
const S3_SECRET = "s3-secret-for-tests-not-real";
const LINE_TOKEN = "line-access-token-for-tests";
const LINE_A = "U" + "a".repeat(32);
const BASE = "https://app.example.test";
const BUCKET = "eq-private-bucket";
const ENDPOINT_HOST = "acc999.r2.cloudflarestorage.com";

// --- S3（メモリ）+ LINE の push を 1つの fetch で まねる -------------------------
const objects = new Map<string, Uint8Array>();
const pushes: { body: { to: string; messages: { contents: unknown }[] } }[] = [];
let s3Down = false;
const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.host === "api.line.me") {
    pushes.push({ body: JSON.parse(String(init?.body)) });
    return Response.json({ sentMessages: [{ id: "1" }] });
  }
  if (url.host === ENDPOINT_HOST) {
    if (s3Down) return new Response("down", { status: 500 });
    const headers = (init?.headers ?? {}) as Record<string, string>;
    if (!headers.authorization?.startsWith("AWS4-HMAC-SHA256 ")) return new Response("denied", { status: 403 });
    const key = decodeURIComponent(url.pathname).replace(`/${BUCKET}/`, "");
    if (init?.method === "PUT") {
      objects.set(key, new Uint8Array(await new Response(init.body as BodyInit).arrayBuffer()));
      return new Response(null, { status: 200 });
    }
    if (url.searchParams.get("list-type") === "2") return new Response("<ListBucketResult/>");
    const o = objects.get(key);
    if (init?.method === "HEAD") return o ? new Response(null, { headers: { "content-length": String(o.length) } }) : new Response(null, { status: 404 });
    if (init?.method === "DELETE") { objects.delete(key); return new Response(null, { status: 204 }); }
    return o ? new Response(new Uint8Array(o), { headers: { "content-length": String(o.length) } }) : new Response("NoSuchKey", { status: 404 });
  }
  return new Response("unexpected host", { status: 599 });
});

function setEnv(over: Record<string, string> = {}) {
  const env: Record<string, string> = {
    CRON_SECRET: CRON,
    STORAGE_DRIVER: "s3",
    S3_BUCKET: BUCKET,
    S3_ENDPOINT: `https://${ENDPOINT_HOST}`,
    S3_ACCESS_KEY_ID: "AKIDTESTS",
    S3_SECRET_ACCESS_KEY: S3_SECRET,
    LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: LINE_TOKEN,
    LINE_MESSAGING_CHANNEL_SECRET: "line-channel-secret-tests",
    APP_BASE_URL: BASE,
    DATABASE_URL: "postgresql://user:dbpass-for-tests@db.example.test/eq",
    ...over,
  };
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
}

beforeEach(() => {
  db.reset();
  jar.clear();
  objects.clear();
  pushes.length = 0;
  dbUp = true;
  s3Down = false;
  resetAllLimiters();
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  setEnv();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const authed = (path: string, secret: string | null = CRON, method = "GET") =>
  new Request(`http://localhost${path}`, { method, headers: secret === null ? {} : { authorization: `Bearer ${secret}` } });

type Creator = { create: (a: unknown) => Promise<unknown> };
async function seedFamily() {
  const c = db.client();
  await (c.parent as Creator).create({ data: { id: "pA", email: "a@example.com", passwordHash: "x", pinHash: "x", lineUserId: LINE_A } });
  await (c.user as Creator).create({ data: { id: "kA", parentId: "pA", nickname: "はる", friendCode: "FC-kA", streakDays: 2, longestStreak: 5 } });
}

// ---------------------------------------------------------------------------
describe("cron の認証", () => {
  it("CRON_SECRET が無い・短い → 503。ヘッダーなし・ちがう → 401。正しければ OK（Bearer の大文字小文字は問わない）", () => {
    const req = (h?: string) => new Request("http://x/api/cron/x", { headers: h ? { authorization: h } : {} });
    expect(checkCronAuth(req(`Bearer ${CRON}`), {})).toEqual({ ok: false, status: 503, code: "CRON_NOT_CONFIGURED" });
    expect(checkCronAuth(req("Bearer short"), { CRON_SECRET: "x".repeat(CRON_SECRET_MIN_LENGTH - 1) })).toMatchObject({ status: 503 });
    expect(checkCronAuth(req(), { CRON_SECRET: CRON })).toMatchObject({ status: 401 });
    expect(checkCronAuth(req(`Bearer ${CRON}x`), { CRON_SECRET: CRON })).toMatchObject({ status: 401 });
    expect(checkCronAuth(req(CRON), { CRON_SECRET: CRON })).toMatchObject({ status: 401 });
    expect(checkCronAuth(req(`Basic ${CRON}`), { CRON_SECRET: CRON })).toMatchObject({ status: 401 });
    expect(checkCronAuth(req(`Bearer ${CRON}`), { CRON_SECRET: CRON })).toEqual({ ok: true });
    expect(checkCronAuth(req(`bearer  ${CRON} `), { CRON_SECRET: ` ${CRON} ` })).toEqual({ ok: true });
  });

  it("cron の API は 認証が無いと 何もしない（401 / 503）", async () => {
    await seedFamily();
    for (const handler of [cronMonthly.GET, cronCleanup.GET]) {
      const none = await handler(authed("/api/cron/x", null));
      expect(none.status).toBe(401);
      const wrong = await handler(authed("/api/cron/x", "wrong-secret-0123456789"));
      expect(wrong.status).toBe(401);
    }
    vi.stubEnv("CRON_SECRET", "");
    expect((await cronMonthly.GET(authed("/api/cron/line-monthly"))).status).toBe(503);
    expect((await cronCleanup.GET(authed("/api/cron/trial-cleanup"))).status).toBe(503);
    expect(pushes).toHaveLength(0);
    expect(db.table("reportDelivery")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
describe("/api/cron/line-monthly", () => {
  it("送る → LINE のリンクの /d/<token>/<file> が S3 の置き場所から流れてくる（レポート・ワークブック）", async () => {
    await seedFamily();
    objects.set("worksheets/monthly/world-01.pdf", new TextEncoder().encode("%PDF-1.4 world-01 workbook"));
    const res = await cronMonthly.GET(authed("/api/cron/line-monthly?month=2026-11"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, month: "2026-11", mode: "live", counts: { sent: 1 }, remaining: 0 });
    expect(pushes).toHaveLength(1);
    expect(pushes[0]!.body.to).toBe(LINE_A);
    // レポートは S3 の その家の場所に置かれた
    const reportKeys = [...objects.keys()].filter((k) => k.startsWith("reports/pA/2026-11/"));
    expect(reportKeys).toHaveLength(1);
    // LINE のボタンの URL → ダウンロード
    const uri = /"uri":"([^"]+\/d\/[^"]+)"/.exec(JSON.stringify(pushes[0]!.body))![1]!;
    expect(uri.startsWith(`${BASE}/d/`)).toBe(true);
    const token = uri.split("/d/")[1]!;
    for (const [file, expected] of [["report", "%PDF-"], ["worksheets", "%PDF-1.4 world-01 workbook"]] as const) {
      const r = await download.GET(new Request(`http://localhost/d/${token}/${file}`), { params: Promise.resolve({ token, file }) });
      expect(r.status).toBe(200);
      expect(r.headers.get("content-type")).toBe("application/pdf");
      expect(r.headers.get("cache-control")).toContain("no-store");
      const text = Buffer.from(await r.arrayBuffer()).toString("latin1");
      expect(text.startsWith(expected)).toBe(true);
      expect(Number(r.headers.get("content-length"))).toBe(Buffer.byteLength(text, "latin1"));
    }
    // もう一度 呼んでも 送信ずみには送らない（cron は 1〜3日に 毎日動く）
    const again = await (await cronMonthly.GET(authed("/api/cron/line-monthly?month=2026-11"))).json();
    expect(again.counts).toEqual({ skipped: 1 });
    expect(pushes).toHaveLength(1);
  });

  it("置き場所が こわれている → ダウンロードは 503（中身や キーは出さない）・ファイルが無い → 404", async () => {
    await seedFamily();
    await cronMonthly.GET(authed("/api/cron/line-monthly?month=2026-11"));
    const token = /\/d\/([A-Za-z0-9_-]{43})/.exec(JSON.stringify(pushes[0]!.body))![1]!;
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      s3Down = true;
      const down = await download.GET(new Request(`http://localhost/d/${token}/report`), { params: Promise.resolve({ token, file: "report" }) });
      expect(down.status).toBe(503);
      expect(await down.text()).not.toContain("reports/");
    } finally {
      err.mockRestore();
    }
    s3Down = false;
    objects.clear();
    const gone = await download.GET(new Request(`http://localhost/d/${token}/report`), { params: Promise.resolve({ token, file: "report" }) });
    expect(gone.status).toBe(404);
    // ワークブックが置き場所に無かった → レポートだけ（worksheets は 404）
    const ws = await download.GET(new Request(`http://localhost/d/${token}/worksheets`), { params: Promise.resolve({ token, file: "worksheets" }) });
    expect(ws.status).toBe(404);
  });

  it("LINE の送信が未設定なら 何もしない（ファイルを書かない）・月の形が おかしければ 400・DB 停止は 503", async () => {
    await seedFamily();
    vi.stubEnv("LINE_MESSAGING_CHANNEL_ACCESS_TOKEN", "");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(await (await cronMonthly.GET(authed("/api/cron/line-monthly"))).json()).toEqual({ ok: true, skipped: "LINE_NOT_CONFIGURED" });
      expect(db.table("reportDelivery")).toHaveLength(0);
      setEnv();
      expect((await cronMonthly.GET(authed("/api/cron/line-monthly?month=2026-13"))).status).toBe(400);
      dbUp = false;
      expect((await cronMonthly.GET(authed("/api/cron/line-monthly"))).status).toBe(503);
    } finally {
      log.mockRestore();
    }
  });

  it("POST でも呼べる（Vercel 以外のスケジューラ用）", async () => {
    await seedFamily();
    const res = await cronMonthly.POST(authed("/api/cron/line-monthly?month=2026-11", CRON, "POST"));
    expect(res.status).toBe(200);
    expect(pushes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
describe("/api/cron/trial-cleanup", () => {
  it("60日 あそばれていない おためし学習者だけ消す", async () => {
    const c = db.client();
    const old = new Date(Date.now() - 61 * 86_400_000);
    await (c.user as Creator).create({ data: { id: "trial-old", nickname: "おためし", friendCode: "T1", isTrial: true, lastActiveAt: old, createdAt: old } });
    await (c.user as Creator).create({ data: { id: "trial-new", nickname: "おためし", friendCode: "T2", isTrial: true, lastActiveAt: new Date() } });
    const res = await cronCleanup.GET(authed("/api/cron/trial-cleanup"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, trialCandidates: 1, trialDeleted: 1, timedOut: false });
    expect(db.table("user").map((u) => u.id)).toEqual(["trial-new"]);
  });
});

// ---------------------------------------------------------------------------
describe("/api/health", () => {
  it("DB と置き場所に つながれば 200。秘密・バケット名・ホスト名は出さない", async () => {
    const res = await health.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const raw = await res.text();
    const body = JSON.parse(raw);
    expect(body).toMatchObject({
      ok: true,
      db: { configured: true, reachable: true },
      storage: { driver: "s3", configured: true, reachable: true, persistent: true },
      line: { messaging: true, webhook: true },
      cron: { configured: true },
    });
    for (const secret of [CRON, S3_SECRET, LINE_TOKEN, "line-channel-secret-tests", "dbpass-for-tests", BUCKET, ENDPOINT_HOST, "AKIDTESTS", "db.example.test"]) {
      expect(raw).not.toContain(secret);
    }
  });

  it("DB 停止・置き場所の設定不足 → 503（どこが だめかは わかる）", async () => {
    dbUp = false;
    let body = await (await health.GET()).json();
    expect(body).toMatchObject({ ok: false, db: { reachable: false }, storage: { reachable: true } });
    dbUp = true;
    vi.stubEnv("S3_SECRET_ACCESS_KEY", "");
    const res = await health.GET();
    expect(res.status).toBe(503);
    body = await res.json();
    expect(body.storage).toMatchObject({ driver: "s3", configured: false, reachable: false });
    s3Down = true;
    setEnv();
    body = await (await health.GET()).json();
    expect(body.storage.reachable).toBe(false);
  });

  it("Vercel で local の置き場所 → persistent: false（ファイルが消える）", async () => {
    vi.stubEnv("STORAGE_DRIVER", "local");
    vi.stubEnv("VERCEL", "1");
    const body = await (await health.GET()).json();
    expect(body.storage).toMatchObject({ driver: "local", persistent: false });
  });
});
