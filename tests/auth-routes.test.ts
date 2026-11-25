/**
 * 保護者アカウント API（ルートハンドラ）をメモリ内 Prisma で通しで試す。
 * とくに「ほかの保護者の子どもは、見る・変える・消す・選ぶ のどれもできない」ことを確認する。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
let dbUp = true;
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => dbUp, markDbDown: () => {} }));

const register = await import("@/app/api/auth/register/route");
const login = await import("@/app/api/auth/login/route");
const logout = await import("@/app/api/auth/logout/route");
const me = await import("@/app/api/auth/me/route");
const children = await import("@/app/api/children/route");
const child = await import("@/app/api/children/[id]/route");
const select = await import("@/app/api/children/[id]/select/route");
const verifyPin = await import("@/app/api/parent/verify-pin/route");
const overview = await import("@/app/api/parent/overview/route");
const settings = await import("@/app/api/parent/settings/route");
const account = await import("@/app/api/parent/account/route");
const { currentUserId, DEMO_USER_ID } = await import("@/lib/auth");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");
const { SESSION_COOKIE } = await import("@/lib/auth/cookies");
const { verifySecret } = await import("@/lib/auth/password");
const { hashToken, SESSION_ROTATE_AFTER_MS } = await import("@/lib/auth/session");
const C = await import("@/lib/api/contracts");

type AnyHandler = (req: Request, ctx: never) => Promise<Response>;
async function call(handler: AnyHandler, method: string, body?: unknown, params: Record<string, string> = {}, headers: Record<string, string> = {}) {
  const req = new Request("http://localhost:3000/api/test", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const res = await handler(req, { params: Promise.resolve(params) } as never);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}

const token = () => jar.get(SESSION_COOKIE)?.value;
const useToken = (t: string | undefined) => { jar.clear(); if (t) jar.set(SESSION_COOKIE, t); };

const A = { email: "a@example.com", password: "passw0rd-a", pin: "1111" };
const B = { email: "b@example.com", password: "passw0rd-b", pin: "2222" };

async function registerAs(p: typeof A) {
  jar.clear();
  const r = await call(register.POST, "POST", p);
  expect(r.status).toBe(201);
  return token()!;
}
async function addChild(nickname: string, schoolGrade = 3) {
  const r = await call(children.POST, "POST", { nickname, schoolGrade });
  expect(r.status).toBe(201);
  return r.body.child.id as string;
}

beforeEach(() => {
  db.reset();
  jar.clear();
  dbUp = true;
  resetAllLimiters();
  db.table("user").push({ id: DEMO_USER_ID, parentId: null, nickname: "ハル", friendCode: "DEMO-0001", coins: 0, streakDays: 0, longestStreak: 0, lastStudyDate: null, schoolGrade: 3, birthYear: null, createdAt: new Date(0) });
});

describe("POST /api/auth/register", () => {
  it("登録 → ログイン状態・PIN 入力ずみ。DB には平文が残らない", async () => {
    const r = await call(register.POST, "POST", { ...A, email: "  A@Example.COM " });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ success: true, ok: true });
    const cookie = jar.store.get(SESSION_COOKIE)!;
    expect(cookie.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", secure: false });
    const parent = db.table("parent")[0];
    expect(parent.email).toBe("a@example.com");
    const dump = JSON.stringify(db.tables);
    expect(dump).not.toContain(A.password);
    expect(dump).not.toContain(cookie.value);
    expect(await verifySecret(A.password, parent.passwordHash as string)).toBe(true);
    expect(await verifySecret(A.pin, parent.pinHash as string)).toBe(true);
    const m = await call(me.GET, "GET");
    expect(m.body).toMatchObject({ loggedIn: true, parent: { email: "a@example.com" }, children: [], selectedChildId: null, pinUnlocked: true });
  });

  it("入力が正しくない → 400 と、どこが悪いかのメッセージ", async () => {
    const weak = await call(register.POST, "POST", { ...A, password: "short1" });
    expect(weak.status).toBe(400);
    expect(weak.body).toMatchObject({ success: false, field: "password" });
    expect(weak.body.messageJa).toContain(C.PASSWORD_RULES_JA);
    expect((await call(register.POST, "POST", { ...A, password: "onlyletters" })).body.field).toBe("password");
    expect((await call(register.POST, "POST", { ...A, pin: "12a4" })).body.field).toBe("pin");
    expect((await call(register.POST, "POST", { ...A, email: "not-an-email" })).body.field).toBe("email");
    expect((await call(register.POST, "POST", undefined)).status).toBe(400);
    expect(db.table("parent")).toHaveLength(0);
  });

  it("同じメールアドレス（大文字小文字ちがい）は 409", async () => {
    await registerAs(A);
    const r = await call(register.POST, "POST", { ...A, email: "A@EXAMPLE.com" });
    expect(r.status).toBe(409);
    expect(r.body.code).toBe("EMAIL_TAKEN");
  });

  it("ほかのサイトからの POST は 403", async () => {
    const r = await call(register.POST, "POST", A, {}, { origin: "https://evil.example", host: "localhost:3000" });
    expect(r.status).toBe(403);
    expect(db.table("parent")).toHaveLength(0);
  });
});

describe("POST /api/auth/login・logout", () => {
  it("メール違い・パスワード違いは同じ文言で 401", async () => {
    await registerAs(A);
    jar.clear();
    const wrongPw = await call(login.POST, "POST", { email: A.email, password: "wrong-pass1" });
    const noUser = await call(login.POST, "POST", { email: "nobody@example.com", password: A.password });
    expect(wrongPw.status).toBe(401);
    expect(noUser.status).toBe(401);
    expect(wrongPw.body.messageJa).toBe(noUser.body.messageJa);
    expect(token()).toBeUndefined();
  });

  it("ログイン成功 → 新しいトークン（前のセッションは消える）。PIN はまだ", async () => {
    const first = await registerAs(A);
    const r = await call(login.POST, "POST", { email: "A@example.com", password: A.password });
    expect(r.status).toBe(200);
    expect(token()).toBeDefined();
    expect(token()).not.toBe(first);
    expect(db.table("session").some((s) => s.tokenHash === hashToken(first))).toBe(false);
    expect((await call(me.GET, "GET")).body).toMatchObject({ loggedIn: true, pinUnlocked: false });
  });

  it("失敗が続くと 429（レート制限）", async () => {
    await registerAs(A);
    jar.clear();
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await call(login.POST, "POST", { email: A.email, password: `bad-pass${i}` })).status);
    expect(statuses.slice(0, 8).every((s) => s === 401)).toBe(true);
    expect(statuses[8]).toBe(429);
    // 正しいパスワードでも、制限中は通さない
    expect((await call(login.POST, "POST", { email: A.email, password: A.password })).status).toBe(429);
  });

  it("ログアウト → cookie とセッションが消え、おためしモードに戻る", async () => {
    const t = await registerAs(A);
    const r = await call(logout.POST, "POST");
    expect(r.body.ok).toBe(true);
    expect(token()).toBeUndefined();
    expect(db.table("session").some((s) => s.tokenHash === hashToken(t))).toBe(false);
    expect((await call(me.GET, "GET")).body.loggedIn).toBe(false);
  });

  it("DB が止まっていてもログアウトは cookie を消す", async () => {
    await registerAs(A);
    dbUp = false;
    const r = await call(logout.POST, "POST");
    expect(r.status).toBe(200);
    expect(token()).toBeUndefined();
  });
});

describe("GET /api/auth/me", () => {
  it("未ログイン → loggedIn:false（success:true）", async () => {
    const r = await call(me.GET, "GET");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ success: true, loggedIn: false, children: [] });
  });

  it("消えたセッションの cookie は片づける", async () => {
    useToken("x".repeat(43));
    await call(me.GET, "GET");
    expect(token()).toBeUndefined();
  });

  it("1日たったセッションはトークンを入れ替える", async () => {
    const t = await registerAs(A);
    db.table("session")[0].createdAt = new Date(Date.now() - SESSION_ROTATE_AFTER_MS - 1000);
    const r = await call(me.GET, "GET");
    expect(r.body.loggedIn).toBe(true);
    expect(token()).not.toBe(t);
    useToken(t);
    expect((await call(me.GET, "GET")).body.loggedIn).toBe(false);
  });
});

describe("子ども（追加・選ぶ・変更・削除）と PIN", () => {
  it("未ログインは 401", async () => {
    expect((await call(children.GET, "GET")).status).toBe(401);
    expect((await call(children.POST, "POST", { nickname: "x", schoolGrade: 1 })).status).toBe(401);
    expect((await call(overview.GET, "GET")).status).toBe(401);
  });

  it("ログインしただけでは子どもを追加できない（PIN が必要）。PIN を入れると追加できる", async () => {
    await registerAs(A);
    await call(logout.POST, "POST");
    await call(login.POST, "POST", { email: A.email, password: A.password });
    const locked = await call(children.POST, "POST", { nickname: "タロウ", schoolGrade: 2 });
    expect(locked.status).toBe(403);
    expect(locked.body.code).toBe("PIN_REQUIRED");
    expect((await call(overview.GET, "GET")).body.code).toBe("PIN_REQUIRED");

    const wrong = await call(verifyPin.POST, "POST", { pin: "9999" });
    expect(wrong.status).toBe(401);
    expect((await call(verifyPin.POST, "POST", { pin: "11" })).status).toBe(400);
    const ok = await call(verifyPin.POST, "POST", { pin: A.pin });
    expect(ok.body.ok).toBe(true);
    expect(typeof ok.body.unlockedUntil).toBe("string");
    expect((await call(children.POST, "POST", { nickname: "タロウ", schoolGrade: 2 })).status).toBe(201);
  });

  it("PIN のまちがいが続くと 429", async () => {
    await registerAs(A);
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await call(verifyPin.POST, "POST", { pin: "0000" })).status);
    expect(statuses[8]).toBe(429);
  });

  it("追加の入力チェック・人数の上限", async () => {
    await registerAs(A);
    expect((await call(children.POST, "POST", { nickname: "", schoolGrade: 2 })).status).toBe(400);
    expect((await call(children.POST, "POST", { nickname: "あ", schoolGrade: 7 })).status).toBe(400);
    expect((await call(children.POST, "POST", { nickname: "<b>", schoolGrade: 2 })).status).toBe(400);
    expect((await call(children.POST, "POST", { nickname: "a".repeat(13), schoolGrade: 2 })).status).toBe(400);
    const r = await call(children.POST, "POST", { nickname: " ハナ ", schoolGrade: 1, birthYear: 2019 });
    expect(r.body.child).toMatchObject({ nickname: "ハナ", schoolGrade: 1, birthYear: 2019 });
    for (let i = 1; i < C.AUTH_LIMITS.maxChildren; i++) await addChild(`子${i}`);
    const over = await call(children.POST, "POST", { nickname: "おおい", schoolGrade: 1 });
    expect(over.status).toBe(409);
  });

  it("選ぶ → currentUserId がその子になる。変更・削除もできる", async () => {
    await registerAs(A);
    const c1 = await addChild("タロウ");
    const c2 = await addChild("ハナ", 5);
    expect(await currentUserId()).toBe(DEMO_USER_ID); // まだ選んでいない
    const s = await call(select.POST, "POST", undefined, { id: c2 });
    expect(s.body.child.id).toBe(c2);
    expect(await currentUserId()).toBe(c2);
    const list = await call(children.GET, "GET");
    expect(list.body.children.map((c: { id: string }) => c.id)).toEqual([c1, c2]);
    expect(list.body.selectedChildId).toBe(c2);

    const up = await call(child.PATCH, "PATCH", { nickname: "ハナコ", birthYear: null }, { id: c2 });
    expect(up.body.child).toMatchObject({ nickname: "ハナコ", schoolGrade: 5, birthYear: null });
    expect((await call(child.PATCH, "PATCH", {}, { id: c2 })).status).toBe(400);

    db.table("lessonProgress").push({ userId: c2, lessonNo: 1, status: "COMPLETED", completedOn: "2026-11-24" });
    db.table("coinLedger").push({ id: "l1", userId: c2, amount: 10 });
    const del = await call(child.DELETE, "DELETE", undefined, { id: c2 });
    expect(del.body.ok).toBe(true);
    expect(db.table("user").some((u) => u.id === c2)).toBe(false);
    expect(db.table("lessonProgress")).toHaveLength(0);
    expect(db.table("coinLedger")).toHaveLength(0);
    expect(db.table("session")[0].selectedChildId).toBeNull();
    expect(await currentUserId()).toBe(DEMO_USER_ID);
  });

  it("おかしな id は 404", async () => {
    await registerAs(A);
    expect((await call(select.POST, "POST", undefined, { id: "../../etc" })).status).toBe(404);
    expect((await call(child.PATCH, "PATCH", { nickname: "x" }, { id: "nope" })).status).toBe(404);
    expect((await call(child.DELETE, "DELETE", undefined, { id: "nope" })).status).toBe(404);
  });
});

describe("持ち主チェック: ほかの保護者の子どもには何もできない", () => {
  it("見る・選ぶ・変える・消す・回数制限・ようす のすべてで A の子どもは B から見えない", async () => {
    await registerAs(A);
    const aChild = await addChild("Aのこ");
    const tokenB = await registerAs(B);
    const bChild = await addChild("Bのこ");
    useToken(tokenB);

    const list = await call(children.GET, "GET");
    expect(list.body.children.map((c: { id: string }) => c.id)).toEqual([bChild]);

    expect((await call(select.POST, "POST", undefined, { id: aChild })).status).toBe(404);
    expect(db.table("session").find((s) => s.tokenHash === hashToken(tokenB))!.selectedChildId).toBeNull();
    expect(await currentUserId()).toBe(DEMO_USER_ID);

    expect((await call(child.PATCH, "PATCH", { nickname: "のっとり" }, { id: aChild })).status).toBe(404);
    expect(db.table("user").find((u) => u.id === aChild)!.nickname).toBe("Aのこ");

    expect((await call(child.DELETE, "DELETE", undefined, { id: aChild })).status).toBe(404);
    expect(db.table("user").some((u) => u.id === aChild)).toBe(true);

    expect((await call(settings.PATCH, "PATCH", { dailyLessonLimit: { childId: aChild, limit: 1 } })).status).toBe(404);

    const ov = await call(overview.GET, "GET");
    expect(ov.body.children.map((c: { id: string }) => c.id)).toEqual([bChild]);
    expect(JSON.stringify(ov.body)).not.toContain("Aのこ");
  });

  it("セッションに他人の子どもの id が入っていても、currentUserId はデモユーザー", async () => {
    await registerAs(A);
    const aChild = await addChild("Aのこ");
    const tokenB = await registerAs(B);
    db.table("session").find((s) => s.tokenHash === hashToken(tokenB))!.selectedChildId = aChild;
    useToken(tokenB);
    expect(await currentUserId()).toBe(DEMO_USER_ID);
    expect((await call(me.GET, "GET")).body.selectedChildId).toBeNull();
  });
});

describe("GET /api/parent/overview", () => {
  it("子どもごとの数字", async () => {
    await registerAs(A);
    const c1 = await addChild("タロウ", 4);
    Object.assign(db.table("user").find((u) => u.id === c1)!, { coins: 120, streakDays: 3, longestStreak: 5, lastStudyDate: "2026-11-24" });
    db.table("lessonProgress").push(
      { userId: c1, lessonNo: 1, status: "COMPLETED", completedOn: "2026-11-23" },
      { userId: c1, lessonNo: 2, status: "COMPLETED", completedOn: "2026-11-24" },
    );
    await call(settings.PATCH, "PATCH", { dailyLessonLimit: { childId: c1, limit: 2 } });
    const r = await call(overview.GET, "GET");
    expect(r.status).toBe(200);
    const row = C.ParentOverviewResponseSchema.parse(r.body).children[0];
    expect(row).toMatchObject({ id: c1, nickname: "タロウ", schoolGrade: 4, lessonsDone: 2, coins: 120, streakDays: 3, longestStreak: 5, lastStudyDate: "2026-11-24", dailyLessonLimit: 2 });
    expect(row.totalLessons).toBeGreaterThan(100);
    expect(row.weakestSkills).toHaveLength(3);
    expect(row.weakestSkills[0].labelJa).not.toBe("");
    expect(row.masteryOverall).toBeGreaterThanOrEqual(0);
  });

  it("まだ学習していない子どもは にがて なし", async () => {
    await registerAs(A);
    await addChild("ハナ");
    const r = await call(overview.GET, "GET");
    expect(r.body.children[0]).toMatchObject({ lessonsDone: 0, weakestSkills: [], dailyLessonLimit: null, lastStudyDate: null });
  });
});

describe("PATCH /api/parent/settings", () => {
  it("1日のレッスン回数: 設定・解除", async () => {
    await registerAs(A);
    const c1 = await addChild("タロウ");
    const r = await call(settings.PATCH, "PATCH", { dailyLessonLimit: { childId: c1, limit: 3 } });
    expect(r.body.settings.dailyLessonLimits).toEqual({ [c1]: 3 });
    expect((await call(settings.GET, "GET")).body.settings.dailyLessonLimits).toEqual({ [c1]: 3 });
    const off = await call(settings.PATCH, "PATCH", { dailyLessonLimit: { childId: c1, limit: null } });
    expect(off.body.settings.dailyLessonLimits).toEqual({});
    expect((await call(settings.PATCH, "PATCH", { dailyLessonLimit: { childId: c1, limit: 0 } })).status).toBe(400);
    expect((await call(settings.PATCH, "PATCH", {})).status).toBe(400);
  });

  it("PIN の変更: パスワードが違えば何も変わらない", async () => {
    await registerAs(A);
    const bad = await call(settings.PATCH, "PATCH", { changePin: { password: "wrong-pass1", newPin: "5555" } });
    expect(bad.status).toBe(401);
    expect(await verifySecret(A.pin, db.table("parent")[0].pinHash as string)).toBe(true);
    const ok = await call(settings.PATCH, "PATCH", { changePin: { password: A.password, newPin: "5555" } });
    expect(ok.body.ok).toBe(true);
    expect(await verifySecret("5555", db.table("parent")[0].pinHash as string)).toBe(true);
    expect((await call(verifyPin.POST, "POST", { pin: A.pin })).status).toBe(401);
    expect((await call(verifyPin.POST, "POST", { pin: "5555" })).status).toBe(200);
  });

  it("パスワードの変更: ほかの端末はログアウト、この端末はトークン入れ替え、新しいパスワードでログインできる", async () => {
    const t1 = await registerAs(A);
    jar.clear(); // 別の端末（cookie なしでログイン）
    await call(login.POST, "POST", { email: A.email, password: A.password });
    const other = token()!;
    useToken(t1);
    expect((await call(settings.PATCH, "PATCH", { changePassword: { currentPassword: A.password, newPassword: "short" } })).status).toBe(400);
    const r = await call(settings.PATCH, "PATCH", { changePassword: { currentPassword: A.password, newPassword: "newpass99" } });
    expect(r.body.ok).toBe(true);
    const t2 = token()!;
    expect(t2).not.toBe(t1);
    expect((await call(me.GET, "GET")).body.loggedIn).toBe(true);
    useToken(other);
    expect((await call(me.GET, "GET")).body.loggedIn).toBe(false);
    jar.clear();
    expect((await call(login.POST, "POST", { email: A.email, password: A.password })).status).toBe(401);
    expect((await call(login.POST, "POST", { email: A.email, password: "newpass99" })).status).toBe(200);
  });
});

describe("DELETE /api/parent/account", () => {
  it("パスワードが違えば消さない。正しければ保護者・子ども・学習記録・セッションをすべて消す", async () => {
    const tA = await registerAs(A);
    const c1 = await addChild("タロウ");
    const c2 = await addChild("ハナ");
    for (const [t, row] of [
      ["lessonProgress", { userId: c1, lessonNo: 1, status: "COMPLETED" }],
      ["itemResponse", { id: "r1", userId: c1 }],
      ["itemMemory", { userId: c2, itemId: "x" }],
      ["coinLedger", { id: "l1", userId: c2 }],
      ["userMonster", { userId: c1, monsterId: "m" }],
      ["friendship", { userId: DEMO_USER_ID, friendId: c1 }],
    ] as const) db.table(t).push({ ...row });
    const tB = await registerAs(B);
    const bChild = await addChild("Bのこ");
    db.table("lessonProgress").push({ userId: bChild, lessonNo: 1, status: "COMPLETED" });

    useToken(tA);
    expect((await call(account.DELETE, "DELETE", { password: "wrong-pass1" })).status).toBe(401);
    expect((await call(account.DELETE, "DELETE", {})).status).toBe(400);
    expect(db.table("parent")).toHaveLength(2);

    const r = await call(account.DELETE, "DELETE", { password: A.password });
    expect(r.body.ok).toBe(true);
    expect(token()).toBeUndefined();
    expect(db.table("parent").map((p) => p.email)).toEqual([B.email]);
    expect(db.table("user").map((u) => u.id).sort()).toEqual([DEMO_USER_ID, bChild].sort());
    for (const t of ["itemResponse", "itemMemory", "coinLedger", "userMonster", "friendship"]) expect(db.table(t)).toHaveLength(0);
    expect(db.table("lessonProgress").map((l) => l.userId)).toEqual([bChild]);
    expect(db.table("session").every((s) => s.tokenHash === hashToken(tB))).toBe(true);
  });

  it("PIN を入れていなければ退会できない", async () => {
    await registerAs(A);
    await call(logout.POST, "POST");
    await call(login.POST, "POST", { email: A.email, password: A.password });
    const r = await call(account.DELETE, "DELETE", { password: A.password });
    expect(r.status).toBe(403);
    expect(db.table("parent")).toHaveLength(1);
  });
});

describe("DB が止まっているとき", () => {
  it("登録・ログイン・子ども: success:false + ていねいなメッセージ（落ちない）", async () => {
    dbUp = false;
    for (const r of [
      await call(register.POST, "POST", A),
      await call(login.POST, "POST", { email: A.email, password: A.password }),
      await call(children.GET, "GET"),
      await call(overview.GET, "GET"),
    ]) {
      expect(r.status).toBe(503);
      expect(r.body).toMatchObject({ success: false, ok: false, offline: true });
      expect(r.body.messageJa).toContain("おためしモード");
    }
  });

  it("me は loggedIn:false（おためしモード）、currentUserId はデモユーザー", async () => {
    await registerAs(A);
    const c1 = await addChild("タロウ");
    await call(select.POST, "POST", undefined, { id: c1 });
    dbUp = false;
    const r = await call(me.GET, "GET");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ success: false, offline: true, loggedIn: false });
    expect(await currentUserId()).toBe(DEMO_USER_ID);
  });

  it("処理中に DB が切れても 503 の JSON", async () => {
    await registerAs(A);
    const orig = db.table.bind(db);
    db.table = (name: string) => {
      if (name === "user") throw Object.assign(new Error("Can't reach database server"), { name: "PrismaClientInitializationError" });
      return orig(name);
    };
    try {
      const r = await call(children.GET, "GET");
      expect(r.status).toBe(503);
      expect(r.body.success).toBe(false);
    } finally {
      db.table = orig;
    }
  });
});

describe("currentUserId", () => {
  it("cookie なし → デモユーザー（DB に問い合わせない）", async () => {
    db.calls = [];
    expect(await currentUserId()).toBe(DEMO_USER_ID);
    expect(db.calls).toHaveLength(0);
  });

  it("以前のスタブの uid cookie では、なりすませない", async () => {
    jar.set("uid", "someone-else");
    expect(await currentUserId()).toBe(DEMO_USER_ID);
  });
});
