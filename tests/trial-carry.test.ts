/**
 * run4 Phase 1: おためしの きろくの ひきつぎ と アバター。
 *  - 純粋な計算（planTrialMerge・れんぞく日数・コインの上限）
 *  - 端末の おためしの きろく（localStorage）
 *  - API: 自分の家の子どもにだけ ひきつげる・端末ごとに1回だけ・デモユーザーの きろくは そのまま
 *  - API: アバターの えらび・かえ（ほかの家の子どもは かえられない）
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => true, markDbDown: () => {} }));

const register = await import("@/app/api/auth/register/route");
const me = await import("@/app/api/auth/me/route");
const children = await import("@/app/api/children/route");
const child = await import("@/app/api/children/[id]/route");
const carry = await import("@/app/api/children/[id]/carry-over/route");
const avatar = await import("@/app/api/children/[id]/avatar/route");
const overview = await import("@/app/api/parent/overview/route");
const { DEMO_USER_ID } = await import("@/lib/auth");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");
const { SESSION_COOKIE } = await import("@/lib/auth/cookies");
const { planTrialMerge, trialStreak, maxTrialCoins, isTrialDataEmpty } = await import("@/lib/domain/trialMerge");
const { defaultAvatarForNewChild, avatarForOrder } = await import("@/lib/domain/avatars");
const { ALL_ITEMS, ASSESSMENTS, getAssessment, getItem, getLesson } = await import("@/lib/curriculum");
const { avatarFor } = await import("@/lib/auth/client");
const T = await import("@/lib/offline/trialLog");
const { LOCAL_PROGRESS_KEY } = await import("@/lib/offline/localProgress");

type AnyHandler = (req: Request, ctx: never) => Promise<Response>;
async function call(handler: AnyHandler, method: string, body?: unknown, params: Record<string, string> = {}) {
  const req = new Request("http://localhost:3000/api/test", { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const res = await handler(req, { params: Promise.resolve(params) } as never);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}
const token = () => jar.get(SESSION_COOKIE)?.value;
const useToken = (t: string | undefined) => { jar.clear(); if (t) jar.set(SESSION_COOKIE, t); };

async function registerAs(email: string) {
  jar.clear();
  const r = await call(register.POST, "POST", { email, password: "passw0rd-x", pin: "1234" });
  expect(r.status).toBe(201);
  return token()!;
}
async function addChild(nickname: string, extra: Record<string, unknown> = {}) {
  const r = await call(children.POST, "POST", { nickname, schoolGrade: 3, ...extra });
  expect(r.status).toBe(201);
  return r.body.child as { id: string; avatarCharacter: string };
}

const DAILY = ASSESSMENTS.find((a) => a.kind === "DAILY_CHECK")!;
const ARENA = ASSESSMENTS.find((a) => a.kind === "ARENA");
const ITEM1 = ALL_ITEMS[0].id;
const ITEM2 = ALL_ITEMS[1].id;
const NOW = new Date("2026-11-25T03:00:00Z"); // 日本時間 12:00
const TODAY = "2026-11-25";

const CATALOG = { isLesson: (n: number) => !!getLesson(n), assessmentKind: (id: string) => getAssessment(id)?.kind, isItem: (id: string) => !!getItem(id) };
const EMPTY_CHILD = { completedLessons: new Set<number>(), passedTests: new Set<string>(), memoryItemIds: new Set<string>(), streakDays: 0, longestStreak: 0, lastStudyDate: null };

function trial(over: Partial<import("@/lib/domain/trialMerge").TrialCarryData> = {}) {
  return { trialId: "trial-abcdef12", lessons: { 1: "2026-11-23", 2: "2026-11-24" }, tests: { [DAILY.id]: "2026-11-24" }, coins: 40, studyDates: ["2026-11-23", "2026-11-24"], items: { [ITEM1]: { t: NOW.getTime() - 86_400_000, ok: true } }, ...over };
}

// ---------------------------------------------------------------------------
describe("planTrialMerge（純粋な計算）", () => {
  it("まだ無い レッスン・テスト・記憶を たし、コインは たし算、れんぞくは 大きい方", () => {
    const p = planTrialMerge(EMPTY_CHILD, trial(), CATALOG, NOW, TODAY);
    expect(p.lessons).toEqual([{ lessonNo: 1, completedOn: "2026-11-23" }, { lessonNo: 2, completedOn: "2026-11-24" }]);
    expect(p.tests).toEqual([{ assessmentId: DAILY.id, takenOn: "2026-11-24" }]);
    expect(p.coins).toBe(40);
    expect(p.streak).toEqual({ streakDays: 2, longestStreak: 2, lastStudyDate: "2026-11-24" });
    expect(p.memories.map((m) => m.itemId)).toEqual([ITEM1]);
  });

  it("子どもが もう持っている きろくは 上書きしない・れんぞくは 子どもの方が大きければ そのまま", () => {
    const kid = { completedLessons: new Set([1]), passedTests: new Set([DAILY.id]), memoryItemIds: new Set([ITEM1]), streakDays: 5, longestStreak: 9, lastStudyDate: "2026-11-25" };
    const p = planTrialMerge(kid, trial(), CATALOG, NOW, TODAY);
    expect(p.lessons.map((l) => l.lessonNo)).toEqual([2]);
    expect(p.tests).toEqual([]);
    expect(p.memories).toEqual([]);
    expect(p.streak).toEqual({ streakDays: 5, longestStreak: 9, lastStudyDate: "2026-11-25" });
  });

  it("無いレッスン・未来の日付・アリーナ・知らない項目は すてる", () => {
    const p = planTrialMerge(EMPTY_CHILD, trial({
      lessons: { 1: "2026-11-24", 99999: "2026-11-24", 3: "2027-01-01", 4: "bad" },
      tests: { "no-such-test": "2026-11-24", ...(ARENA ? { [ARENA.id]: "2026-11-24" } : {}) },
      items: { "no-such-item": { t: NOW.getTime(), ok: true }, [ITEM2]: { t: NOW.getTime() + 9e9, ok: false } },
    }), CATALOG, NOW, TODAY);
    expect(p.lessons.map((l) => l.lessonNo)).toEqual([1]);
    expect(p.tests).toEqual([]);
    expect(p.memories.map((m) => m.itemId)).toEqual([ITEM2]);
    expect(p.memories[0].lastReviewedAt.getTime()).toBeLessThanOrEqual(NOW.getTime()); // 未来の時刻は いまに そろえる
  });

  it("コインは おためしで ありえる上限で おさえる・マイナスは 0", () => {
    const big = planTrialMerge(EMPTY_CHILD, trial({ coins: 999_999 }), CATALOG, NOW, TODAY);
    const cap = maxTrialCoins({ lessonCount: 2, testKinds: ["DAILY_CHECK"], studyDays: 2 });
    expect(big.coins).toBe(cap);
    expect(cap).toBeGreaterThan(40);
    expect(planTrialMerge(EMPTY_CHILD, trial({ coins: -5 }), CATALOG, NOW, TODAY).coins).toBe(0);
    expect(planTrialMerge(EMPTY_CHILD, trial({ lessons: {}, tests: {}, studyDates: [], coins: 500 }), CATALOG, NOW, TODAY).coins).toBe(0);
  });

  it("れんぞく日数: とびとびの日は きれる・いちばん長い れんぞくも 出す", () => {
    expect(trialStreak(["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-10", "2026-11-11"])).toEqual({ current: 2, longest: 3, last: "2026-11-11" });
    expect(trialStreak([])).toEqual({ current: 0, longest: 0, last: null });
    expect(trialStreak(["2026-11-24", "2026-11-24", "x"])).toEqual({ current: 1, longest: 1, last: "2026-11-24" });
  });

  it("なにも無ければ「ひきつぐ？」を出さない", () => {
    expect(isTrialDataEmpty({ lessons: {}, tests: {}, coins: 0 })).toBe(true);
    expect(isTrialDataEmpty({ lessons: { 1: TODAY }, tests: {}, coins: 0 })).toBe(false);
  });
});

describe("アバター", () => {
  it("新しい子は きょうだいが まだ使っていない顔・登録順の顔", () => {
    expect(defaultAvatarForNewChild([])).toBe("haru");
    expect(defaultAvatarForNewChild(["haru", "kiko"])).toBe("riko");
    expect(defaultAvatarForNewChild(["haru", "riko", "kiko", "birimo"])).toBe("haru");
    expect([0, 1, 2, 3, 4].map(avatarForOrder)).toEqual(["haru", "riko", "kiko", "birimo", "haru"]);
  });

  it("えらんだ顔が いちばん。無ければ 登録順・id", () => {
    expect(avatarFor("x", 0, "kiko").id).toBe("kiko");
    expect(avatarFor("x", 1, null).id).toBe("riko");
    expect(avatarFor("x", 1, "dragon").id).toBe("riko");
  });
});

// ---------------------------------------------------------------------------
describe("端末の おためしの きろく（localStorage）", () => {
  class MemStorage {
    m = new Map<string, string>();
    getItem(k: string) { return this.m.get(k) ?? null; }
    setItem(k: string, v: string) { this.m.set(k, String(v)); }
    removeItem(k: string) { this.m.delete(k); }
  }
  let store: MemStorage;
  beforeEach(() => {
    store = new MemStorage();
    vi.stubGlobal("window", { localStorage: store });
    return () => vi.unstubAllGlobals();
  });

  it("レッスン・テスト・コイン・あそんだ日・項目を のこし、以前の オフラインの きろくも いっしょに よむ", () => {
    store.setItem(LOCAL_PROGRESS_KEY, JSON.stringify({ lessons: { 1: "2026-11-20" }, tests: {} }));
    T.recordTrialLesson(2, { coins: 15, logs: [{ itemId: ITEM1, correct: true }, { itemId: ITEM1, correct: false }] }, NOW);
    T.recordTrialTest(DAILY.id, { passed: true, coins: 30 }, NOW);
    T.recordTrialTest("arena-1-30", { passed: true, coins: 15 }, NOW);
    const d = T.readTrialCarryData();
    expect(d.lessons).toEqual({ 1: "2026-11-20", 2: TODAY });
    expect(d.tests).toEqual({ [DAILY.id]: TODAY }); // アリーナは コインだけ
    expect(d.coins).toBe(60);
    expect(d.studyDates).toEqual(["2026-11-20", TODAY]);
    expect(d.items[ITEM1]).toEqual({ t: NOW.getTime(), ok: false });
    expect(T.readTrialCarryData().trialId).toBe(d.trialId); // ID は かわらない
  });

  it("「ひきつぐ？」は きろくがあって まだ きいていないときだけ・ひきついだら けす", () => {
    expect(T.shouldOfferCarryOver()).toBe(false);
    T.recordTrialLesson(1, {}, NOW);
    expect(T.shouldOfferCarryOver()).toBe(true);
    T.markCarryDeclined(null);
    expect(T.shouldOfferCarryOver()).toBe(false);
    // 「いいえ」の あとでも 「おうちの方」の ボタン用には「ある」
    expect(T.hasDeviceTrialProgress(null)).toBe(true);
    T.clearTrialRecords();
    expect(store.getItem(T.TRIAL_LOG_KEY)).toBeNull();
    expect(store.getItem(LOCAL_PROGRESS_KEY)).toBeNull();
    expect(T.hasDeviceTrialProgress(null)).toBe(false);
  });

  it("「いいえ」は その きろくにだけ。サーバーに あたらしい おためしの きろくが できたら また きく（run5）", () => {
    T.recordTrialLesson(1, {}, NOW);
    T.markCarryDeclined(null);
    expect(T.shouldOfferCarryOver(null)).toBe(false);
    const server = { hasProgress: true, ref: "ref-1", lessons: 2, tests: 0, coins: 30 };
    expect(T.shouldOfferCarryOver(server)).toBe(true);
    T.markCarryDeclined(server);
    expect(T.shouldOfferCarryOver(server)).toBe(false);
    expect(T.shouldOfferCarryOver({ ...server, ref: "ref-2" })).toBe(true);
    // ブラウザに きろくが なくても サーバーに あれば きく
    T.clearTrialRecords();
    expect(T.shouldOfferCarryOver(server)).toBe(true);
    expect(T.shouldOfferCarryOver({ ...server, hasProgress: false })).toBe(false);
  });

  it("run4 の しるし（\"declined\"）は ブラウザの きろくにだけ きく", () => {
    T.recordTrialLesson(1, {}, NOW);
    store.setItem(T.TRIAL_CARRY_FLAG_KEY, "declined");
    expect(T.shouldOfferCarryOver(null)).toBe(false);
    expect(T.shouldOfferCarryOver({ hasProgress: true, ref: "r", lessons: 1, tests: 0, coins: 0 })).toBe(true);
    store.setItem(T.TRIAL_CARRY_FLAG_KEY, "carried");
    expect(T.shouldOfferCarryOver(null)).toBe(true);
  });

  it("こわれた値でも 例外に しない", () => {
    expect(T.parseTrialLog("{oops").lessons).toEqual({});
    const p = T.parseTrialLog(JSON.stringify({ trialId: "x", lessons: { 1: 5 }, coins: "9", items: { a: { t: "no" } } }));
    expect(p.lessons).toEqual({});
    expect(p.coins).toBe(0);
    expect(p.items).toEqual({});
    expect(p.trialId.length).toBeGreaterThanOrEqual(8);
  });
});

// ---------------------------------------------------------------------------
describe("POST /api/children/:id/carry-over", () => {
  beforeEach(() => {
    db.reset();
    jar.clear();
    resetAllLimiters();
    db.table("user").push({ id: DEMO_USER_ID, parentId: null, nickname: "ハル", friendCode: "DEMO-0001", avatarCharacter: "haru", coins: 500, totalCoinsEarned: 500, streakDays: 3, longestStreak: 3, lastStudyDate: TODAY, schoolGrade: 3, birthYear: null, createdAt: new Date(0) });
    db.table("lessonProgress").push({ userId: DEMO_USER_ID, lessonNo: 1, status: "COMPLETED", completedOn: TODAY });
  });

  it("自分の子どもに ひきつぐ → レッスン・テスト・コイン・記憶が ふえる。デモユーザーは そのまま", async () => {
    await registerAs("a@example.com");
    const kid = await addChild("たろう");
    const demoBefore = JSON.stringify([db.table("user").find((u) => u.id === DEMO_USER_ID), db.table("lessonProgress").filter((l) => l.userId === DEMO_USER_ID)]);
    const r = await call(carry.POST, "POST", trial(), { id: kid.id });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, alreadyCarried: false, carried: { lessons: 2, tests: 1, coins: 40, memories: 1 } });
    expect(db.table("lessonProgress").filter((l) => l.userId === kid.id && l.status === "COMPLETED").map((l) => l.lessonNo).sort()).toEqual([1, 2]);
    expect(db.table("testAttempt").filter((t) => t.userId === kid.id && t.passed)).toHaveLength(1);
    expect(db.table("itemMemory").filter((m) => m.userId === kid.id)).toHaveLength(1);
    const u = db.table("user").find((x) => x.id === kid.id)!;
    expect(u).toMatchObject({ coins: 40, totalCoinsEarned: 40, streakDays: 2, lastStudyDate: "2026-11-24" });
    const ledger = db.table("coinLedger");
    expect(ledger).toHaveLength(1);
    expect(ledger[0]).toMatchObject({ userId: kid.id, reason: "TRIAL_CARRY_OVER", amount: 40, idempotencyKey: "trial-carry:trial-abcdef12" });
    // デモユーザー（ほかの おためしの人と共有）の きろくは 1つも かわらない
    expect(JSON.stringify([db.table("user").find((x) => x.id === DEMO_USER_ID), db.table("lessonProgress").filter((l) => l.userId === DEMO_USER_ID)])).toBe(demoBefore);
  });

  it("同じ端末の きろくは 1回だけ（2回目・ほかの子への 2回目は なにもしない）", async () => {
    await registerAs("a@example.com");
    const kid = await addChild("たろう");
    const kid2 = await addChild("じろう");
    expect((await call(carry.POST, "POST", trial(), { id: kid.id })).body.alreadyCarried).toBe(false);
    const again = await call(carry.POST, "POST", trial(), { id: kid.id });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ ok: true, alreadyCarried: true, carried: { coins: 0 } });
    expect((await call(carry.POST, "POST", trial(), { id: kid2.id })).body.alreadyCarried).toBe(true);
    expect(db.table("user").find((x) => x.id === kid.id)!.coins).toBe(40);
    expect(db.table("user").find((x) => x.id === kid2.id)!.coins).toBe(0);
    expect(db.table("coinLedger")).toHaveLength(1);
  });

  it("ほかの家の子どもには ひきつげない（404・なにも書かない）", async () => {
    await registerAs("a@example.com");
    const kidA = await addChild("たろう");
    await registerAs("b@example.com");
    const r = await call(carry.POST, "POST", trial(), { id: kidA.id });
    expect(r.status).toBe(404);
    expect(db.table("coinLedger")).toHaveLength(0);
    expect(db.table("lessonProgress").filter((l) => l.userId === kidA.id)).toHaveLength(0);
    // デモユーザーにも ひきつげない（保護者の子どもではない）
    expect((await call(carry.POST, "POST", trial(), { id: DEMO_USER_ID })).status).toBe(404);
  });

  it("ログインしていない → 401・形が おかしい → 400", async () => {
    jar.clear();
    expect((await call(carry.POST, "POST", trial(), { id: "x" })).status).toBe(401);
    await registerAs("a@example.com");
    const kid = await addChild("たろう");
    expect((await call(carry.POST, "POST", { ...trial(), trialId: "bad id!" }, { id: kid.id })).status).toBe(400);
    expect((await call(carry.POST, "POST", { ...trial(), coins: -1 }, { id: kid.id })).status).toBe(400);
    expect(db.table("coinLedger")).toHaveLength(0);
  });
});

describe("アバターの API", () => {
  beforeEach(() => { db.reset(); jar.clear(); resetAllLimiters(); });

  it("追加のとき えらべる・えらばなければ きょうだいと かぶらない顔", async () => {
    await registerAs("a@example.com");
    expect((await addChild("いち")).avatarCharacter).toBe("haru");
    expect((await addChild("に", { avatarCharacter: "birimo" })).avatarCharacter).toBe("birimo");
    expect((await addChild("さん")).avatarCharacter).toBe("riko");
    expect((await call(children.POST, "POST", { nickname: "よん", schoolGrade: 1, avatarCharacter: "dragon" })).status).toBe(400);
    const m = await call(me.GET, "GET");
    expect(m.body.children.map((c: { avatarCharacter: string }) => c.avatarCharacter)).toEqual(["haru", "birimo", "riko"]);
  });

  it("子どもが じぶんで かえられる（暗証番号なし）・おうちの方の編集でも かえられる・ようすにも出る", async () => {
    const t = await registerAs("a@example.com");
    const kid = await addChild("たろう");
    // 暗証番号の しるしを けして、子どもの そうさ と同じ状態にする
    for (const s of db.table("session")) s.pinVerifiedAt = null;
    useToken(t);
    const r = await call(avatar.PATCH, "PATCH", { avatarCharacter: "kiko" }, { id: kid.id });
    expect(r.status).toBe(200);
    expect(r.body.child.avatarCharacter).toBe("kiko");
    expect((await call(child.PATCH, "PATCH", { avatarCharacter: "riko" }, { id: kid.id })).status).toBe(403); // 編集は PIN が必要
    for (const s of db.table("session")) s.pinVerifiedAt = new Date();
    expect((await call(child.PATCH, "PATCH", { avatarCharacter: "riko" }, { id: kid.id })).body.child.avatarCharacter).toBe("riko");
    const o = await call(overview.GET, "GET");
    expect(o.body.children[0].avatarCharacter).toBe("riko");
    expect((await call(avatar.PATCH, "PATCH", { avatarCharacter: "nope" }, { id: kid.id })).status).toBe(400);
  });

  it("ほかの家の子どもの顔は かえられない", async () => {
    await registerAs("a@example.com");
    const kidA = await addChild("たろう");
    await registerAs("b@example.com");
    expect((await call(avatar.PATCH, "PATCH", { avatarCharacter: "kiko" }, { id: kidA.id })).status).toBe(404);
    expect(db.table("user").find((u) => u.id === kidA.id)!.avatarCharacter).toBe("haru");
    jar.clear();
    expect((await call(avatar.PATCH, "PATCH", { avatarCharacter: "kiko" }, { id: kidA.id })).status).toBe(401);
  });
});
