/**
 * run5 Phase 1: 端末ごとの おためし学習者。
 *  - だれの きろくに なるか（えらんだ子ども > この端末の おためし学習者 > DB 停止なら だれでもない）
 *  - DB の おためしの きろくの ひきつぎ（ブラウザの きろくと いっしょに・1回だけ・cookie を けす・行は コピー）
 *  - 60日 つかわれていない おためし学習者の そうじ
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
let dbUp = true;
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => dbUp, markDbDown: () => {} }));

const register = await import("@/app/api/auth/register/route");
const logout = await import("@/app/api/auth/logout/route");
const children = await import("@/app/api/children/route");
const select = await import("@/app/api/children/[id]/select/route");
const carry = await import("@/app/api/children/[id]/carry-over/route");
const trialStatus = await import("@/app/api/trial/route");
const { currentUserId, resolveLearner, DEMO_USER_ID, NO_LEARNER_ID } = await import("@/lib/auth");
const { TRIAL_LEARNER_COOKIE, isStaleTrial, staleTrialWhere, TRIAL_STALE_DAYS } = await import("@/lib/auth/trialLearner");
const { hashToken } = await import("@/lib/auth/session");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");
const { SESSION_COOKIE } = await import("@/lib/auth/cookies");
const { planDeviceTrialMerge, isDbTrialEmpty } = await import("@/lib/domain/trialMerge");
const { cleanupStaleTrialLearners } = await import("@/lib/services/trialCleanupService");
const { trialLearnerCarryKey, trialCarryKey } = await import("@/lib/services/trialCarryService");
const { ALL_ITEMS, ASSESSMENTS, getAssessment, getItem, getLesson } = await import("@/lib/curriculum");
const { matches } = await import("./helpers/fakePrisma");

type AnyHandler = (req: Request, ctx: never) => Promise<Response>;
async function call(handler: AnyHandler, method: string, body?: unknown, params: Record<string, string> = {}) {
  const req = new Request("http://localhost:3000/api/test", { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const res = await handler(req, { params: Promise.resolve(params) } as never);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}
const trialCookie = () => jar.get(TRIAL_LEARNER_COOKIE)?.value;
const user = (id: string) => db.table("user").find((u) => u.id === id);

/** cookie（おためし）は のこしたまま 保護者として登録する */
async function registerHere(email: string) {
  const r = await call(register.POST, "POST", { email, password: "passw0rd-x", pin: "1234" });
  expect(r.status).toBe(201);
}
async function addChild(nickname: string) {
  const r = await call(children.POST, "POST", { nickname, schoolGrade: 3 });
  expect(r.status).toBe(201);
  return r.body.child.id as string;
}

const DAILY = ASSESSMENTS.find((a) => a.kind === "DAILY_CHECK")!;
const ITEM1 = ALL_ITEMS[0].id;
const ITEM2 = ALL_ITEMS[1].id;
const NOW = new Date("2026-11-25T03:00:00Z");
const TODAY = "2026-11-25";
const CATALOG = { isLesson: (n: number) => !!getLesson(n), assessmentKind: (id: string) => getAssessment(id)?.kind, isItem: (id: string) => !!getItem(id) };
const EMPTY_CHILD = { completedLessons: new Set<number>(), passedTests: new Set<string>(), memoryItemIds: new Set<string>(), streakDays: 0, longestStreak: 0, lastStudyDate: null };

beforeEach(() => {
  db.reset();
  jar.clear();
  dbUp = true;
  resetAllLimiters();
  db.table("user").push({ id: DEMO_USER_ID, parentId: null, nickname: "ハル", friendCode: "DEMO-0001", coins: 500, totalCoinsEarned: 500, streakDays: 3, longestStreak: 3, lastStudyDate: TODAY, schoolGrade: 3, birthYear: null, createdAt: new Date(0) });
});

// ---------------------------------------------------------------------------
describe("だれの きろくに なるか（resolveLearner / currentUserId）", () => {
  it("cookie なし → 端末の おためし学習者を つくる。cookie は httpOnly・DB には トークンの ハッシュだけ", async () => {
    const r = await resolveLearner({ create: true });
    expect(r.kind).toBe("trial");
    expect(r.userId).not.toBe(DEMO_USER_ID);
    const token = trialCookie()!;
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(jar.store.get(TRIAL_LEARNER_COOKIE)!.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    const u = user(r.userId)!;
    expect(u).toMatchObject({ isTrial: true, parentId: null, trialTokenHash: hashToken(token) });
    expect(u.lastActiveAt).toBeInstanceOf(Date);
    expect(JSON.stringify(db.tables)).not.toContain(token);
    // 同じ端末は いつも同じ・デモユーザーの きろくは つかわない
    expect(await currentUserId()).toBe(r.userId);
    expect(db.table("user").filter((x) => x.isTrial)).toHaveLength(1);
  });

  it("べつの端末（cookie なし）は べつの おためし学習者", async () => {
    const a = await currentUserId();
    jar.clear();
    const b = await currentUserId();
    expect(a).not.toBe(b);
    expect(db.table("user").filter((x) => x.isTrial)).toHaveLength(2);
  });

  it("でたらめ・消えた cookie では だれにも なれない（あたらしく つくる）", async () => {
    const a = await currentUserId();
    jar.set(TRIAL_LEARNER_COOKIE, "x".repeat(43));
    const b = await currentUserId();
    expect(b).not.toBe(a);
    // 保護者の子どもに なった行の トークンでは なれない
    const token = trialCookie()!;
    user(b)!.parentId = "p-other";
    jar.set(TRIAL_LEARNER_COOKIE, token);
    expect(await currentUserId()).not.toBe(b);
  });

  it("順番: えらんだ子ども > 端末の おためし学習者。ログイン中でも 子どもを えらぶ前は おためし学習者", async () => {
    const trialId = await currentUserId();
    await registerHere("a@example.com");
    const kid = await addChild("たろう");
    expect(await resolveLearner({ create: true })).toEqual({ userId: trialId, kind: "trial" });
    await call(select.POST, "POST", undefined, { id: kid });
    expect(await resolveLearner({ create: true })).toEqual({ userId: kid, kind: "child" });
    // ログアウトすると 同じ端末の おためし学習者に もどる
    await call(logout.POST, "POST");
    expect(jar.get(SESSION_COOKIE)).toBeUndefined();
    expect(await resolveLearner({ create: true })).toEqual({ userId: trialId, kind: "trial" });
  });

  it("DB が止まっている → だれでもない（つくらない）", async () => {
    dbUp = false;
    const before = db.table("user").length;
    expect(await resolveLearner({ create: true })).toEqual({ userId: NO_LEARNER_ID, kind: "none" });
    expect(db.table("user")).toHaveLength(before);
    expect(trialCookie()).toBeUndefined();
  });

  it("create:false（描画中）は つくらない。いれば その人", async () => {
    expect(await resolveLearner({ create: false })).toEqual({ userId: NO_LEARNER_ID, kind: "none" });
    expect(db.table("user").filter((x) => x.isTrial)).toHaveLength(0);
    const id = await currentUserId();
    expect(await resolveLearner({ create: false })).toEqual({ userId: id, kind: "trial" });
  });

  it("lastActiveAt は 1時間に1回だけ 書く", async () => {
    const id = await currentUserId();
    const old = new Date(Date.now() - 2 * 3_600_000);
    user(id)!.lastActiveAt = old;
    db.calls = [];
    await currentUserId();
    expect((user(id)!.lastActiveAt as Date).getTime()).toBeGreaterThan(old.getTime());
    db.calls = [];
    await currentUserId();
    expect(db.calls.filter((c) => c.model === "user" && c.op === "updateMany")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
describe("planDeviceTrialMerge（ブラウザ + DB の おためし）", () => {
  const snap = (over: Partial<import("@/lib/domain/trialMerge").DbTrialSnapshot> = {}) => ({
    userId: "t1", lessons: { 1: "2026-11-20", 3: "2026-11-24" }, tests: {}, coins: 900, streakDays: 4, longestStreak: 6, lastStudyDate: "2026-11-24",
    memories: [{ itemId: ITEM1, stability: 3, difficulty: 5, reviewCount: 2, lapses: 0, accuracyEwma: 0.9, lastReviewedAt: new Date("2026-11-24T00:00:00Z") }],
    monsters: [{ monsterId: "m-cat", count: 2 }], ...over,
  });

  it("両方を あわせる（日付は 早い方）・DB の コインは 上限なし・ブラウザの コインは 上限つき", () => {
    const browser = { trialId: "browser-123", lessons: { 1: "2026-11-22", 2: "2026-11-23" }, tests: { [DAILY.id]: "2026-11-23" }, coins: 999_999, studyDates: [], items: { [ITEM1]: { t: NOW.getTime(), ok: false }, [ITEM2]: { t: NOW.getTime(), ok: true } } };
    const p = planDeviceTrialMerge(EMPTY_CHILD, browser, snap(), CATALOG, NOW, TODAY);
    expect(p.lessons).toEqual([{ lessonNo: 1, completedOn: "2026-11-20" }, { lessonNo: 2, completedOn: "2026-11-23" }, { lessonNo: 3, completedOn: "2026-11-24" }]);
    expect(p.tests.map((t) => t.assessmentId)).toEqual([DAILY.id]);
    expect(p.coinParts.db).toBe(900);
    expect(p.coinParts.browser).toBeLessThan(999_999);
    expect(p.coins).toBe(p.coinParts.db + p.coinParts.browser);
    // 記憶: DB の記憶は そのまま（ブラウザの ITEM1 では 上書きしない）、ITEM2 は ブラウザから
    expect(p.memories.map((m) => m.itemId).sort()).toEqual([ITEM1, ITEM2].sort());
    expect(p.memories.find((m) => m.itemId === ITEM1)!.accuracyEwma).toBe(0.9);
    expect(p.streak.longestStreak).toBe(6);
    expect(p.monsters).toEqual([{ monsterId: "m-cat", count: 2 }]);
  });

  it("DB だけ・子どもが もう持っている分は たさない", () => {
    const child = { ...EMPTY_CHILD, completedLessons: new Set([1]), memoryItemIds: new Set([ITEM1]), streakDays: 9, longestStreak: 9 };
    const p = planDeviceTrialMerge(child, null, snap(), CATALOG, NOW, TODAY);
    expect(p.lessons.map((l) => l.lessonNo)).toEqual([3]);
    expect(p.memories).toEqual([]);
    expect(p.coins).toBe(900);
    expect(p.streak.streakDays).toBe(9);
  });

  it("isDbTrialEmpty", () => {
    expect(isDbTrialEmpty(null)).toBe(true);
    expect(isDbTrialEmpty({ lessons: {}, tests: {}, coins: 0, monsters: [] })).toBe(true);
    expect(isDbTrialEmpty({ lessons: {}, tests: {}, coins: 5, monsters: [] })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("DB の おためしの きろくを ひきつぐ（POST /api/children/:id/carry-over）", () => {
  /** この端末で おためしで あそんだ（DB の おためし学習者に きろく） */
  async function playAsTrial() {
    const id = await currentUserId();
    db.table("lessonProgress").push({ userId: id, lessonNo: 1, status: "COMPLETED", completedOn: "2026-11-23" });
    db.table("lessonProgress").push({ userId: id, lessonNo: 2, status: "COMPLETED", completedOn: "2026-11-24" });
    db.table("lessonProgress").push({ userId: id, lessonNo: 3, status: "IN_PROGRESS", completedOn: null });
    db.table("testAttempt").push({ id: "ta1", userId: id, assessmentId: DAILY.id, source: "NORMAL", passed: true, takenOn: "2026-11-24" });
    db.table("itemMemory").push({ userId: id, itemId: ITEM1, stability: 2, difficulty: 5, reviewCount: 1, lapses: 0, accuracyEwma: 1, lastReviewedAt: new Date("2026-11-24T00:00:00Z") });
    db.table("userMonster").push({ userId: id, monsterId: "m-cat", count: 1 });
    Object.assign(user(id)!, { coins: 70, totalCoinsEarned: 90, streakDays: 2, longestStreak: 2, lastStudyDate: "2026-11-24" });
    return id;
  }
  const emptyBrowser = { trialId: "browser-abcdef12", lessons: {}, tests: {}, coins: 0, studyDates: [], items: {} };

  it("GET /api/trial: ひきつげる きろくの ようす（つくらない）", async () => {
    expect((await call(trialStatus.GET, "GET")).body).toMatchObject({ ok: true, hasProgress: false, ref: null });
    expect(db.table("user").filter((u) => u.isTrial)).toHaveLength(0);
    const id = await playAsTrial();
    const s = (await call(trialStatus.GET, "GET")).body;
    expect(s).toMatchObject({ ok: true, hasProgress: true, lessons: 2, tests: 1, coins: 70 });
    expect(s.ref).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(JSON.stringify(s)).not.toContain(id);
  });

  it("子どもに コピーする → 台帳に しるし・cookie を けす・おためし学習者の行は のこる・デモユーザーは そのまま", async () => {
    const trialId = await playAsTrial();
    await registerHere("a@example.com");
    const kid = await addChild("たろう");
    const demoBefore = JSON.stringify(user(DEMO_USER_ID));
    const r = await call(carry.POST, "POST", emptyBrowser, { id: kid });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, alreadyCarried: false, nothing: false, carried: { lessons: 2, tests: 1, coins: 70, memories: 1, monsters: 1 } });
    expect(db.table("lessonProgress").filter((l) => l.userId === kid && l.status === "COMPLETED").map((l) => l.lessonNo).sort()).toEqual([1, 2]);
    expect(db.table("testAttempt").filter((t) => t.userId === kid && t.passed)).toHaveLength(1);
    expect(db.table("itemMemory").filter((m) => m.userId === kid).map((m) => m.itemId)).toEqual([ITEM1]);
    expect(db.table("userMonster").filter((m) => m.userId === kid)).toEqual([expect.objectContaining({ monsterId: "m-cat", count: 1 })]);
    expect(user(kid)).toMatchObject({ coins: 70, totalCoinsEarned: 70, streakDays: 2, lastStudyDate: "2026-11-24" });
    const ledger = db.table("coinLedger");
    expect(ledger).toEqual([expect.objectContaining({ userId: kid, amount: 70, reason: "TRIAL_CARRY_OVER", idempotencyKey: trialLearnerCarryKey(trialId) })]);
    // ブラウザの きろくは 空なので しるしを つかわない（あとで オフラインで あそんだ分は ひきつげる）
    expect(ledger.some((l) => l.idempotencyKey === trialCarryKey(emptyBrowser.trialId))).toBe(false);
    // cookie は けす・おためし学習者の行は コピーなので のこる（もう この端末からは つかえない）
    expect(trialCookie()).toBeUndefined();
    expect(user(trialId)).toMatchObject({ isTrial: true, trialTokenHash: null, coins: 70 });
    expect(db.table("lessonProgress").filter((l) => l.userId === trialId)).toHaveLength(3);
    expect(JSON.stringify(user(DEMO_USER_ID))).toBe(demoBefore);
    expect((await call(trialStatus.GET, "GET")).body.hasProgress).toBe(false);
  });

  it("1回だけ: 同じ おためし学習者を もう一度（cookie を もどしても）→ alreadyCarried。ほかの子どもにも ふえない", async () => {
    await playAsTrial();
    const token = trialCookie()!;
    await registerHere("a@example.com");
    const kid = await addChild("たろう");
    const kid2 = await addChild("じろう");
    expect((await call(carry.POST, "POST", emptyBrowser, { id: kid })).body.alreadyCarried).toBe(false);
    jar.set(TRIAL_LEARNER_COOKIE, token); // 古い cookie を もどしても
    const again = await call(carry.POST, "POST", emptyBrowser, { id: kid2 });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ ok: true, nothing: true });
    expect(user(kid2)!.coins).toBe(0);
    expect(db.table("coinLedger")).toHaveLength(1);
  });

  it("ブラウザ（オフライン分）と DB を いっしょに: しるしは 2つ・コインは 両方", async () => {
    const trialId = await playAsTrial();
    await registerHere("a@example.com");
    const kid = await addChild("たろう");
    const browser = { trialId: "browser-abcdef12", lessons: { 4: "2026-11-25" }, tests: {}, coins: 10, studyDates: ["2026-11-25"], items: {} };
    const r = await call(carry.POST, "POST", browser, { id: kid });
    expect(r.body).toMatchObject({ ok: true, alreadyCarried: false, carried: { lessons: 3, coins: 80 } });
    expect(db.table("coinLedger").map((l) => [l.idempotencyKey, l.amount]).sort()).toEqual([[trialCarryKey(browser.trialId), 10], [trialLearnerCarryKey(trialId), 70]].sort());
    expect(user(kid)).toMatchObject({ coins: 80, streakDays: 3, lastStudyDate: "2026-11-25" });
    // 2回目は なにもしない
    expect((await call(carry.POST, "POST", browser, { id: kid })).body).toMatchObject({ ok: true, alreadyCarried: true });
    expect(user(kid)!.coins).toBe(80);
  });

  it("ほかの家の子どもには ひきつげない（404・なにも書かない・cookie も のこる）", async () => {
    await registerHere("a@example.com");
    const kidA = await addChild("たろう");
    jar.clear();
    await playAsTrial();
    await registerHere("b@example.com");
    const r = await call(carry.POST, "POST", emptyBrowser, { id: kidA });
    expect(r.status).toBe(404);
    expect(db.table("coinLedger")).toHaveLength(0);
    expect(trialCookie()).toBeDefined();
  });

  it("ひきつぐものが なにも無い → nothing", async () => {
    await registerHere("a@example.com");
    const kid = await addChild("たろう");
    const r = await call(carry.POST, "POST", emptyBrowser, { id: kid });
    expect(r.body).toMatchObject({ ok: true, alreadyCarried: false, nothing: true });
    expect(db.table("coinLedger")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
describe("おためし学習者の そうじ（60日）", () => {
  const DAY = 86_400_000;
  const now = new Date("2026-11-25T00:00:00Z");
  const ago = (d: number) => new Date(now.getTime() - d * DAY);
  function seed() {
    db.table("user").push(
      { id: "t-old", isTrial: true, parentId: null, lastActiveAt: ago(61), createdAt: ago(100), friendCode: "T1" },
      { id: "t-recent", isTrial: true, parentId: null, lastActiveAt: ago(59), createdAt: ago(100), friendCode: "T2" },
      { id: "t-nolast-old", isTrial: true, parentId: null, lastActiveAt: null, createdAt: ago(70), friendCode: "T3" },
      { id: "t-nolast-new", isTrial: true, parentId: null, lastActiveAt: null, createdAt: ago(3), friendCode: "T4" },
      { id: "child-old", isTrial: false, parentId: "p1", lastActiveAt: ago(400), createdAt: ago(400), friendCode: "C1" },
    );
    db.table("lessonProgress").push({ userId: "t-old", lessonNo: 1, status: "COMPLETED" }, { userId: "t-recent", lessonNo: 1, status: "COMPLETED" }, { userId: "child-old", lessonNo: 1, status: "COMPLETED" });
    db.table("coinLedger").push({ id: "l1", userId: "t-old", amount: 5, idempotencyKey: "k1" });
    db.table("itemMemory").push({ userId: "t-nolast-old", itemId: ITEM1 });
  }

  it("えらびかた（純粋な関数と DB の条件が 同じ）", () => {
    seed();
    const picked = db.table("user").filter((u) => isStaleTrial({ isTrial: !!u.isTrial, parentId: (u.parentId as string | null) ?? null, lastActiveAt: (u.lastActiveAt as Date | null) ?? null, createdAt: u.createdAt as Date }, now)).map((u) => u.id).sort();
    expect(picked).toEqual(["t-nolast-old", "t-old"]);
    expect(db.table("user").filter((u) => matches(u, staleTrialWhere(now))).map((u) => u.id).sort()).toEqual(picked);
    expect(TRIAL_STALE_DAYS).toBe(60);
    // 日数を かえる
    expect(db.table("user").filter((u) => matches(u, staleTrialWhere(now, 90))).map((u) => u.id)).toEqual([]);
  });

  it("dry-run は 数えるだけ", async () => {
    seed();
    const before = db.table("user").length;
    const r = await cleanupStaleTrialLearners({ now, dryRun: true });
    expect(r).toEqual({ candidates: 2, deleted: 0, dryRun: true, timedOut: false });
    expect(db.table("user")).toHaveLength(before);
  });

  it("消す: 学習の行ごと。新しい おためし・保護者の子ども・デモユーザーは のこる。進みぐあいを 知らせる", async () => {
    seed();
    const progress: { done: number; total: number }[] = [];
    const r = await cleanupStaleTrialLearners({ now, batchSize: 1, onProgress: (p) => progress.push(p) });
    expect(r).toEqual({ candidates: 2, deleted: 2, dryRun: false, timedOut: false });
    expect(progress).toEqual([{ done: 1, total: 2 }, { done: 2, total: 2 }]);
    expect(db.table("user").map((u) => u.id).sort()).toEqual([DEMO_USER_ID, "child-old", "t-nolast-new", "t-recent"].sort());
    expect(db.table("lessonProgress").map((l) => l.userId).sort()).toEqual(["child-old", "t-recent"]);
    expect(db.table("coinLedger")).toHaveLength(0);
    expect(db.table("itemMemory")).toHaveLength(0);
  });

  it("時間ぎれなら とちゅうで やめる（次の実行で つづき）", async () => {
    seed();
    const r1 = await cleanupStaleTrialLearners({ now, deadline: Date.now() - 1 });
    expect(r1).toMatchObject({ candidates: 2, deleted: 0, timedOut: true });
    expect(db.table("user").some((u) => u.id === "t-old")).toBe(true);
    const r2 = await cleanupStaleTrialLearners({ now });
    expect(r2).toMatchObject({ candidates: 2, deleted: 2, timedOut: false });
  });

  it("消す直前に もう一度 たしかめる（その間に あそびはじめた人は 消さない）", async () => {
    seed();
    // 1人目（つくった日が古い t-old）を 消したあと、2人目の t-nolast-old が あそんだ → のこる
    const r = await cleanupStaleTrialLearners({
      now, batchSize: 1,
      onProgress: () => { const u = db.table("user").find((x) => x.id === "t-nolast-old"); if (u) u.lastActiveAt = now; },
    });
    expect(r.candidates).toBe(2);
    expect(r.deleted).toBe(1);
    expect(db.table("user").some((u) => u.id === "t-old")).toBe(false);
    expect(db.table("user").some((u) => u.id === "t-nolast-old")).toBe(true);
  });
});
