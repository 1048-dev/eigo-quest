/**
 * run9 Phase 1: 「この英語、へん？」の 報告
 *  - API: 保存できたら saved:true・おなじ clientId は 1件・DB が 止まっていたら saved:false・形が ちがえば 400・送りすぎは 429
 *  - サービス: 制御文字を けす・長さを きる・同時の 2件目（P2002）は エラーに しない
 *  - 端末: おした ものは localStorage に のこり、送れたら 消える。送れなければ のこして あとで 送りなおす
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// DB（メモリ）
// ---------------------------------------------------------------------------
const rows: Record<string, unknown>[] = [];
let dbUp = true;
let failCreate: unknown = null;
const englishReport = {
  findUnique: vi.fn(async ({ where }: { where: { clientId: string } }) => rows.find((r) => r.clientId === where.clientId) ?? null),
  create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
    if (failCreate) throw failCreate;
    const row = { id: `id${rows.length + 1}`, status: "open", createdAt: new Date(), ...data };
    rows.push(row);
    return row;
  }),
};
vi.mock("@/lib/db", () => ({ isDbUp: async () => dbUp, markDbDown: () => {}, prisma: { englishReport } }));
vi.mock("@/lib/auth", () => ({ NO_LEARNER_ID: "no-learner", resolveLearner: async () => ({ userId: "u1", kind: "trial" }) }));

const { POST } = await import("@/app/api/english-report/route");
const { saveEnglishReport, cleanText } = await import("@/lib/services/englishReportService");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");

const valid = (over: Record<string, unknown> = {}) => ({
  clientId: "client-0001", page: "teacher", lessonNo: 12, segmentId: "teacher:3:words", text: "Look at this!", comment: "へん？", reportedAt: Date.now(), ...over,
});
const call = async (body: unknown, ip = "1.1.1.1") => {
  const res = await POST(new Request("http://x/api/english-report", { method: "POST", headers: { "x-forwarded-for": ip }, body: JSON.stringify(body) }), undefined);
  return { status: res.status, body: await res.json() };
};

beforeEach(() => {
  rows.length = 0;
  dbUp = true;
  failCreate = null;
  resetAllLimiters();
});

describe("POST /api/english-report", () => {
  it("保存できたら ok:true・saved:true（学習者の id も のこす）", async () => {
    const r = await call(valid());
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, saved: true });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ clientId: "client-0001", userId: "u1", page: "teacher", lessonNo: 12, segmentId: "teacher:3:words", text: "Look at this!", comment: "へん？" });
  });

  it("おなじ clientId を もう一度 送っても 1件だけ", async () => {
    await call(valid());
    const r = await call(valid());
    expect(r.body).toMatchObject({ ok: true, saved: true });
    expect(rows).toHaveLength(1);
  });

  it("DB が 止まっていたら saved:false（端末が あとで 送りなおす）", async () => {
    dbUp = false;
    const r = await call(valid());
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, saved: false });
    expect(rows).toHaveLength(0);
  });

  it("保存の とちゅうで DB エラー → saved:false", async () => {
    failCreate = Object.assign(new Error("Can't reach database server"), { code: "P1001" });
    expect((await call(valid())).body).toMatchObject({ ok: true, saved: false });
  });

  it("形が ちがえば 400（segmentId なし・ページ名が ちがう・レッスン番号が はんい外・comment が 長すぎ）", async () => {
    for (const bad of [
      { ...valid(), segmentId: undefined },
      valid({ page: "parent" }),
      valid({ lessonNo: 0 }),
      valid({ lessonNo: 1201 }),
      valid({ comment: "あ".repeat(201) }),
      valid({ clientId: "x" }),
      valid({ segmentId: "<script>" }),
    ]) {
      const r = await call(bad);
      expect(r.status).toBe(400);
      expect(r.body.ok).toBe(false);
    }
    expect(rows).toHaveLength(0);
  });

  it("おなじ IP から 送りすぎると 429", async () => {
    for (let i = 0; i < 30; i++) expect((await call(valid({ clientId: `client-${String(i).padStart(4, "0")}` }), "9.9.9.9")).status).toBe(200);
    const r = await call(valid({ clientId: "client-9999" }), "9.9.9.9");
    expect(r.status).toBe(429);
    expect((await call(valid({ clientId: "client-8888" }), "8.8.8.8")).status).toBe(200);
  });
});

describe("saveEnglishReport", () => {
  it("制御文字を けして 長さを きる・空の ひとことは null", async () => {
    await saveEnglishReport({ clientId: "client-0002", page: "lesson", segmentId: "step:quiz:6", text: `a\u0000b${"x".repeat(400)}`, comment: "   " }, null);
    expect(rows[0].text).toBe(`ab${"x".repeat(298)}`);
    expect(rows[0].comment).toBeNull();
    expect(rows[0].userId).toBeNull();
    expect(cleanText(" hi\u0007 ", 10)).toBe("hi");
  });

  it("未来すぎる 時刻は サーバーの 時刻に する", async () => {
    const now = new Date("2026-11-27T00:00:00Z");
    await saveEnglishReport({ clientId: "client-0003", page: "library", segmentId: "story:s1-01:2", reportedAt: now.getTime() + 3_600_000 }, "u1", now);
    expect(rows[0].reportedAt).toEqual(now);
  });

  it("同時の 2件目（P2002）は created:false で エラーに しない", async () => {
    failCreate = Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
    await expect(saveEnglishReport({ clientId: "client-0004", page: "lesson", segmentId: "step:tpr:2" }, null)).resolves.toEqual({ created: false });
  });
});

// ---------------------------------------------------------------------------
// 端末の キュー
// ---------------------------------------------------------------------------
class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
}
const storage = new MemoryStorage();
(globalThis as { window?: unknown }).window = { localStorage: storage };
const client = await import("@/lib/englishReport/client");

const respond = (status: number, body: unknown = {}) => async () => ({ status, json: async () => body });

describe("端末の 報告キュー", () => {
  beforeEach(() => storage.data.clear());
  const input = { page: "lesson" as const, lessonNo: 3, segmentId: "step:quiz:6", text: "What's this?", comment: " " };

  it("送れたら キューから 消える（空の ひとことは 送らない）", async () => {
    const f = vi.fn(respond(200, { ok: true, saved: true }));
    expect(await client.reportEnglish(input, f)).toBe("sent");
    expect(client.readQueue()).toHaveLength(0);
    const sent = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent).toMatchObject({ page: "lesson", lessonNo: 3, segmentId: "step:quiz:6", text: "What's this?" });
    expect(sent.comment).toBeUndefined();
    expect(sent.clientId).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });

  it("オフライン・5xx・saved:false・429 → のこして、あとで 送りなおす（おなじ clientId）", async () => {
    const offline = vi.fn(async () => { throw new TypeError("Failed to fetch"); });
    expect(await client.reportEnglish(input, offline)).toBe("queued");
    expect(await client.flushEnglishReports(respond(503))).toBe(0);
    expect(await client.flushEnglishReports(respond(200, { ok: true, saved: false }))).toBe(0);
    expect(await client.flushEnglishReports(respond(429))).toBe(0);
    const q = client.readQueue();
    expect(q).toHaveLength(1);
    expect(q[0].attempts).toBe(4);
    const id = q[0].report.clientId;

    const ok = vi.fn(respond(200, { ok: true, saved: true }));
    expect(await client.flushEnglishReports(ok)).toBe(1);
    expect(JSON.parse((ok.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).clientId).toBe(id);
    expect(client.readQueue()).toHaveLength(0);
  });

  it("400 など 形の まちがいは すてる", async () => {
    await client.reportEnglish(input, respond(400));
    expect(client.readQueue()).toHaveLength(0);
  });

  it("30日を すぎた もの・20回 失敗した ものは すてる", async () => {
    const now = Date.now();
    storage.setItem(client.ENGLISH_REPORT_QUEUE_KEY, JSON.stringify([
      { report: { clientId: "old-00001", page: "lesson", segmentId: "step:quiz:1", reportedAt: now - 31 * 24 * 3600 * 1000 }, attempts: 1 },
      { report: { clientId: "many-0001", page: "lesson", segmentId: "step:quiz:1", reportedAt: now }, attempts: 20 },
      { report: { clientId: "keep-0001", page: "lesson", segmentId: "step:quiz:1", reportedAt: now }, attempts: 2 },
    ]));
    const f = vi.fn(respond(503));
    await client.flushEnglishReports(f, now);
    expect(f).toHaveBeenCalledTimes(1);
    expect(client.readQueue().map((q) => q.report.clientId)).toEqual(["keep-0001"]);
  });

  it("こわれた 値でも 例外に しない", async () => {
    storage.setItem(client.ENGLISH_REPORT_QUEUE_KEY, "{not json");
    expect(client.readQueue()).toEqual([]);
    storage.setItem(client.ENGLISH_REPORT_QUEUE_KEY, JSON.stringify([1, null, { report: {} }]));
    expect(client.readQueue()).toEqual([]);
  });
});
