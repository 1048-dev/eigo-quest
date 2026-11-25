/**
 * おうちの方が決める「1日のレッスン回数」（既定は制限なし）
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
let uid = "c1";
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => true, markDbDown: () => {} }));
vi.mock("@/lib/auth", () => ({ currentUserId: async () => uid, DEMO_USER_ID: "demo-user" }));

const { checkDailyLessonLimit, parseParentSettings, withDailyLimit, DAILY_LIMIT_MESSAGE_JA } = await import("@/lib/services/dailyLimit");
const lessonRoute = await import("@/app/api/lessons/[lessonNo]/route");
const completeRoute = await import("@/app/api/lessons/[lessonNo]/complete/route");
const { localDate } = await import("@/lib/domain/dates");

const today = localDate(new Date());

function setup(limit: number | null, doneToday: number[], doneBefore: number[] = []) {
  db.reset();
  db.table("parent").push({ id: "p1", email: "a@b.jp", settings: limit == null ? {} : { dailyLessonLimits: { c1: limit } } });
  db.table("user").push({ id: "c1", parentId: "p1", nickname: "タロウ", streakDays: 0, longestStreak: 0, lastStudyDate: null, coins: 0, totalCoinsEarned: 0 });
  db.table("user").push({ id: "demo-user", parentId: null, nickname: "ハル", streakDays: 0, longestStreak: 0, lastStudyDate: null, coins: 0, totalCoinsEarned: 0 });
  for (const n of doneBefore) db.table("lessonProgress").push({ userId: "c1", lessonNo: n, status: "COMPLETED", completedOn: "2000-01-01" });
  for (const n of doneToday) db.table("lessonProgress").push({ userId: "c1", lessonNo: n, status: "COMPLETED", completedOn: today });
}

describe("settings の読みこみ", () => {
  it("おかしな値は捨てる", () => {
    expect(parseParentSettings(null)).toEqual({ dailyLessonLimits: {} });
    expect(parseParentSettings({ dailyLessonLimits: "x" })).toEqual({ dailyLessonLimits: {} });
    expect(parseParentSettings({ dailyLessonLimits: { a: 2, b: 0, c: 99, d: 1.5 } })).toEqual({ dailyLessonLimits: { a: 2 } });
  });
  it("withDailyLimit: 設定・解除（ほかの子はそのまま）", () => {
    const s = withDailyLimit({ dailyLessonLimits: { a: 1 } }, "b", 3);
    expect(s.dailyLessonLimits).toEqual({ a: 1, b: 3 });
    expect(withDailyLimit(s, "a", null).dailyLessonLimits).toEqual({ b: 3 });
  });
});

describe("checkDailyLessonLimit", () => {
  beforeEach(() => { uid = "c1"; });

  it("設定なし → いつでも OK", async () => {
    setup(null, [1, 2, 3, 4, 5]);
    expect(await checkDailyLessonLimit("c1", 6)).toEqual({ ok: true });
  });

  it("上限に届いたら新しいレッスンは NG（子ども向けのメッセージ）", async () => {
    setup(2, [1, 2]);
    expect(await checkDailyLessonLimit("c1", 3)).toEqual({ ok: false, reasonJa: DAILY_LIMIT_MESSAGE_JA, code: "DAILY_LIMIT" });
  });

  it("上限まではまだ OK・きのうまでの分は数えない", async () => {
    setup(2, [3], [1, 2]);
    expect((await checkDailyLessonLimit("c1", 4)).ok).toBe(true);
  });

  it("完了ずみレッスンの おさらいは OK", async () => {
    setup(1, [1]);
    expect((await checkDailyLessonLimit("c1", 1)).ok).toBe(true);
  });

  it("おためしモード（保護者なし）にはかからない", async () => {
    setup(1, [1]);
    expect((await checkDailyLessonLimit("demo-user", 2)).ok).toBe(true);
  });
});

describe("ルートでの制限", () => {
  const params = (n: number) => ({ params: Promise.resolve({ lessonNo: String(n) }) });
  beforeEach(() => { uid = "c1"; });

  it("GET /api/lessons/:n — 上限なら 403 + code DAILY_LIMIT", async () => {
    setup(1, [1]);
    process.env.SKIP_DAILY_LOCK = "1";
    try {
      const res = await lessonRoute.GET(new Request("http://x/api/lessons/2"), params(2));
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body).toMatchObject({ success: false, code: "DAILY_LIMIT", reasonJa: DAILY_LIMIT_MESSAGE_JA });
      // おさらい（完了ずみの L1）は開ける
      expect((await lessonRoute.GET(new Request("http://x/api/lessons/1"), params(1))).status).toBe(200);
    } finally {
      delete process.env.SKIP_DAILY_LOCK;
    }
  });

  it("GET /api/lessons/:n — 制限なしなら開ける", async () => {
    setup(null, [1]);
    process.env.SKIP_DAILY_LOCK = "1";
    try {
      expect((await lessonRoute.GET(new Request("http://x/api/lessons/2"), params(2))).status).toBe(200);
    } finally {
      delete process.env.SKIP_DAILY_LOCK;
    }
  });

  it("POST /api/lessons/:n/complete — 上限なら ok:false + code DAILY_LIMIT（記録しない）", async () => {
    setup(1, [1]);
    process.env.SKIP_DAILY_LOCK = "1";
    try {
      const req = new Request("http://x/api/lessons/2/complete", { method: "POST", body: JSON.stringify({ quizScore: 1, logs: [] }) });
      const res = await completeRoute.POST(req, params(2));
      expect(res.status).toBe(403);
      expect(await res.json()).toMatchObject({ ok: false, code: "DAILY_LIMIT", reasonJa: DAILY_LIMIT_MESSAGE_JA });
      expect(db.table("lessonProgress").some((l) => l.lessonNo === 2)).toBe(false);
    } finally {
      delete process.env.SKIP_DAILY_LOCK;
    }
  });
});
