/**
 * run5 Phase 2: パスワードの再設定・暗証番号を忘れた・メールアドレスの追加。
 * メモリ内 Prisma + メールは outbox（一時フォルダ）に書かせて、届いたリンクのトークンを使う。
 *  - トークン: DB にはハッシュだけ・30分で期限切れ・1回だけ・新しく送ると古いのは使えない
 *  - 登録の有無を教えない（答えが同じ・登録が無ければ メールも トークンも 作らない）
 *  - 再設定したら すべてのセッション（端末のログイン）が消える
 *  - 暗証番号を忘れた: パスワード / LINE の本人確認
 *  - LINE だけの保護者が メールアドレス + パスワードを追加（確認リンク）
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => true, markDbDown: () => {} }));

const register = await import("@/app/api/auth/register/route");
const login = await import("@/app/api/auth/login/route");
const me = await import("@/app/api/auth/me/route");
const forgot = await import("@/app/api/auth/password-reset/request/route");
const check = await import("@/app/api/auth/password-reset/check/route");
const complete = await import("@/app/api/auth/password-reset/complete/route");
const emailCheck = await import("@/app/api/auth/email/check/route");
const emailConfirm = await import("@/app/api/auth/email/confirm/route");
const addEmail = await import("@/app/api/parent/email/route");
const resetPin = await import("@/app/api/parent/reset-pin/route");
const settings = await import("@/app/api/parent/settings/route");
const verifyPin = await import("@/app/api/parent/verify-pin/route");
const account = await import("@/app/api/parent/account/route");
const lineStart = await import("@/app/api/auth/line/start/route");
const lineCallback = await import("@/app/api/auth/line/callback/route");
const L = await import("@/lib/auth/line");
const { SESSION_COOKIE } = await import("@/lib/auth/cookies");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");
const { verifySecret, hashSecret } = await import("@/lib/auth/password");
const { hashToken, LINE_REAUTH_MS } = await import("@/lib/auth/session");
const { flushBackgroundTasks } = await import("@/lib/mail/background");
const R = await import("@/lib/services/accountRecoveryService");
const { FORGOT_PASSWORD_SENT_JA } = await import("@/lib/auth/recoveryMessages");

const OUTBOX = mkdtempSync(path.join(tmpdir(), "eq-mail-"));
const BASE = "https://app.example.test";
const LINE_ENV = {
  LINE_LOGIN_CHANNEL_ID: "1234567890",
  LINE_LOGIN_CHANNEL_SECRET: "test-secret-not-real",
  LINE_LOGIN_CALLBACK_URL: `${BASE}/api/auth/line/callback`,
};
const LINE_A = "U" + "a".repeat(32);
const LINE_B = "U" + "b".repeat(32);
const A = { email: "a@example.com", password: "passw0rd-a", pin: "1111" };
const B = { email: "b@example.com", password: "passw0rd-b", pin: "2222" };

type AnyHandler = (req: Request, ctx: never) => Promise<Response>;
async function call(handler: AnyHandler, method: string, body?: unknown, headers: Record<string, string> = {}) {
  const req = new Request("http://localhost:3000/api/test", {
    method, headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body),
  });
  const res = await handler(req, { params: Promise.resolve({}) } as never);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}
async function get(handler: (req: Request) => Promise<Response>, url: string) {
  const res = await handler(new Request(url));
  const loc = res.headers.get("location") ?? "";
  return { status: res.status, path: loc ? new URL(loc).pathname + new URL(loc).search : "" };
}

const token = () => jar.get(SESSION_COOKIE)?.value;
const useToken = (t: string | undefined) => { jar.clear(); if (t) jar.set(SESSION_COOKIE, t); };

interface OutMail { to: string; subject: string; text: string; html: string }
function outbox(): OutMail[] {
  if (!existsSync(OUTBOX)) return [];
  return readdirSync(OUTBOX).filter((f) => f.endsWith(".json")).sort()
    .map((f) => JSON.parse(readFileSync(path.join(OUTBOX, f), "utf8")) as OutMail);
}
function linkToken(m: OutMail): string {
  const t = /token=([A-Za-z0-9_-]{43})/.exec(m.text)?.[1];
  if (!t) throw new Error("no token in mail");
  return t;
}
async function registerAs(p: typeof A) {
  jar.clear();
  const r = await call(register.POST, "POST", p);
  expect(r.status).toBe(201);
  return token()!;
}
async function forgotFor(email: string, headers: Record<string, string> = {}) {
  const r = await call(forgot.POST, "POST", { email }, headers);
  await flushBackgroundTasks();
  return r;
}

/** モックの LINE（line-login.test と同じ形） */
let lineSub = LINE_A;
const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  const body = new URLSearchParams(String(init?.body ?? ""));
  if (url === L.LINE_TOKEN_URL) return Response.json({ id_token: "fake.id.token" });
  if (url === L.LINE_VERIFY_URL) {
    const now = Math.floor(Date.now() / 1000);
    return Response.json({ iss: L.LINE_ISSUER, sub: lineSub, aud: LINE_ENV.LINE_LOGIN_CHANNEL_ID, exp: now + 3600, iat: now, nonce: body.get("nonce"), name: "ママ" });
  }
  return new Response("not found", { status: 404 });
});
async function lineFlow(mode: "login" | "link" | "reauth") {
  const s = await get(lineStart.GET, `http://localhost:3000/api/auth/line/start?mode=${mode}`);
  const saved = L.decodeOAuthState(jar.get(L.LINE_OAUTH_COOKIE)?.value);
  if (!saved) return { start: s, cb: null };
  const cb = await get(lineCallback.GET, `${LINE_ENV.LINE_LOGIN_CALLBACK_URL}?code=auth-code-123&state=${encodeURIComponent(saved.state)}`);
  return { start: s, cb };
}
/** LINE だけで登録した保護者（暗証番号 4321・おうちの方エリアを開いた状態） */
async function lineOnlyParent(sub = LINE_A) {
  jar.clear();
  lineSub = sub;
  await lineFlow("login");
  const r = await call((await import("@/app/api/auth/line/pin/route")).POST, "POST", { pin: "4321" });
  expect(r.status).toBe(200);
  return token()!;
}

beforeEach(() => {
  db.reset();
  jar.clear();
  resetAllLimiters();
  rmSync(OUTBOX, { recursive: true, force: true });
  vi.stubEnv("MAIL_PROVIDER", "outbox");
  vi.stubEnv("MAIL_OUTBOX_DIR", OUTBOX);
  vi.stubEnv("APP_BASE_URL", BASE);
  for (const [k, v] of Object.entries(LINE_ENV)) vi.stubEnv(k, v);
  lineSub = LINE_A;
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(async () => {
  await flushBackgroundTasks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
afterAll(() => rmSync(OUTBOX, { recursive: true, force: true }));

describe("パスワードを忘れた: リンクを送る", () => {
  it("登録あり → 再設定のメール（リンク・30分・ていねいな文面）。DB にはトークンのハッシュだけ", async () => {
    await registerAs(A);
    const r = await forgotFor("A@Example.com");
    expect(r.status).toBe(200);
    expect(r.body.messageJa).toBe(FORGOT_PASSWORD_SENT_JA);
    const mails = outbox();
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe(A.email);
    expect(mails[0].subject).toContain("パスワード再設定");
    expect(mails[0].text).toContain(`${BASE}/reset-password?token=`);
    expect(mails[0].text).toContain("30分");
    expect(mails[0].html).toContain("新しいパスワードを設定する");
    const t = linkToken(mails[0]);
    const rows = db.table("authToken");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ purpose: "PASSWORD_RESET", tokenHash: hashToken(t), email: A.email, usedAt: null });
    expect(JSON.stringify(db.tables)).not.toContain(t);
    const ttl = (rows[0].expiresAt as Date).getTime() - (rows[0].createdAt as Date).getTime();
    expect(ttl).toBe(30 * 60_000);
  });

  it("登録なし → 答えは まったく同じ。メールも トークンも 作らない（登録の有無を教えない）", async () => {
    await registerAs(A);
    jar.clear();
    const yes = await forgotFor(A.email);
    const no = await forgotFor("nobody@example.com");
    expect(no.status).toBe(yes.status);
    expect(no.body).toEqual(yes.body);
    expect(outbox().map((m) => m.to)).toEqual([A.email]);
    expect(db.table("authToken")).toHaveLength(1);
  });

  it("LINE だけの保護者（メールなし）には 送らない", async () => {
    await lineOnlyParent();
    const r = await forgotFor("line@example.com");
    expect(r.status).toBe(200);
    expect(outbox()).toHaveLength(0);
  });

  it("メールアドレスの形が おかしい → 400（登録の有無とは関係ない）", async () => {
    expect((await call(forgot.POST, "POST", { email: "not-an-email" })).status).toBe(400);
    expect((await call(forgot.POST, "POST", {})).status).toBe(400);
  });

  it("同じメールへは 1時間に 3通まで（4回目も同じ答えで、だまって 送らない）", async () => {
    await registerAs(A);
    for (let i = 0; i < 4; i++) {
      const r = await forgotFor(A.email, { "x-forwarded-for": `10.0.0.${i}` });
      expect(r.status).toBe(200);
      expect(r.body.messageJa).toBe(FORGOT_PASSWORD_SENT_JA);
    }
    expect(outbox()).toHaveLength(3);
  });

  it("同じ IP からは 1時間に 10回まで（11回目は 429）", async () => {
    for (let i = 0; i < 10; i++) expect((await forgotFor(`u${i}@example.com`, { "x-forwarded-for": "10.9.9.9" })).status).toBe(200);
    const r = await forgotFor("u10@example.com", { "x-forwarded-for": "10.9.9.9" });
    expect(r.status).toBe(429);
    expect(r.body.code).toBe("RATE_LIMITED");
    expect((await forgotFor("u11@example.com", { "x-forwarded-for": "10.9.9.10" })).status).toBe(200);
  });

  it("新しく送ると 古いリンクは使えない（さいごのメールだけ）", async () => {
    await registerAs(A);
    await forgotFor(A.email);
    await forgotFor(A.email);
    const [first, second] = outbox().map(linkToken);
    expect((await call(check.POST, "POST", { token: first })).body.valid).toBe(false);
    expect((await call(check.POST, "POST", { token: second })).body).toMatchObject({ valid: true, maskedEmail: "a****@example.com" });
  });

  it("ほかのサイトからの POST は 403", async () => {
    await registerAs(A);
    const r = await call(forgot.POST, "POST", { email: A.email }, { origin: "https://evil.example", host: "localhost:3000" });
    expect(r.status).toBe(403);
    await flushBackgroundTasks();
    expect(outbox()).toHaveLength(0);
  });
});

describe("パスワードの再設定（リンクから）", () => {
  async function issued() {
    const first = await registerAs(A);
    await forgotFor(A.email);
    return { first, t: linkToken(outbox()[0]) };
  }

  it("check は リンクを使わない（何回でも valid）", async () => {
    const { t } = await issued();
    for (let i = 0; i < 3; i++) expect((await call(check.POST, "POST", { token: t })).body.valid).toBe(true);
    expect(db.table("authToken")[0].usedAt).toBeNull();
  });

  it("成功 → 新しいパスワードでログインでき、古いパスワードは だめ。お知らせメールも届く", async () => {
    const { t } = await issued();
    const r = await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" });
    expect(r.status).toBe(200);
    await flushBackgroundTasks();
    const p = db.table("parent")[0];
    expect(await verifySecret("newpassw0rd", p.passwordHash as string)).toBe(true);
    expect(await verifySecret(A.pin, p.pinHash as string)).toBe(true); // 暗証番号は そのまま
    jar.clear();
    expect((await call(login.POST, "POST", { email: A.email, password: A.password })).status).toBe(401);
    expect((await call(login.POST, "POST", { email: A.email, password: "newpassw0rd" })).status).toBe(200);
    const notice = outbox().at(-1)!;
    expect(notice.subject).toContain("パスワードを再設定しました");
    expect(notice.text).not.toMatch(/token=/);
  });

  it("再設定すると すべての端末のログイン（セッション）が消え、この端末の cookie も消える", async () => {
    const { first, t } = await issued();
    jar.clear();
    await call(login.POST, "POST", { email: A.email, password: A.password });
    const second = token()!;
    expect(db.table("session")).toHaveLength(2);
    useToken(second);
    const r = await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" });
    expect(r.status).toBe(200);
    expect(db.table("session")).toHaveLength(0);
    expect(token()).toBeUndefined();
    for (const old of [first, second]) {
      useToken(old);
      expect((await call(me.GET, "GET")).body.loggedIn).toBe(false);
    }
  });

  it("1回だけ: 2回目は INVALID_TOKEN（パスワードも かわらない）", async () => {
    const { t } = await issued();
    expect((await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" })).status).toBe(200);
    const again = await call(complete.POST, "POST", { token: t, newPassword: "otherpassw0rd" });
    expect(again.status).toBe(400);
    expect(again.body.code).toBe("INVALID_TOKEN");
    expect(await verifySecret("newpassw0rd", db.table("parent")[0].passwordHash as string)).toBe(true);
    expect((await call(check.POST, "POST", { token: t })).body.valid).toBe(false);
  });

  it("同時に 2回送られても 通るのは 1回だけ", async () => {
    const { t } = await issued();
    const rs = await Promise.all([
      call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd1" }),
      call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd2" }),
    ]);
    expect(rs.map((r) => r.status).sort()).toEqual([200, 400]);
  });

  it("30分を すぎたら使えない（サービスに時刻を わたして確認）", async () => {
    await registerAs(A);
    const now = new Date("2026-12-01T00:00:00Z");
    await R.requestPasswordReset(A.email, BASE, now);
    const t = linkToken(outbox()[0]);
    expect((await R.checkPasswordResetToken(t, new Date(now.getTime() + 29 * 60_000))).valid).toBe(true);
    const late = new Date(now.getTime() + 30 * 60_000);
    expect((await R.checkPasswordResetToken(t, late)).valid).toBe(false);
    expect(await R.resetPassword(t, "newpassw0rd", late)).toEqual({ ok: false, reason: "INVALID_TOKEN" });
    expect(await verifySecret(A.password, db.table("parent")[0].passwordHash as string)).toBe(true);
  });

  it("期限切れの行（DB）も ルートで INVALID_TOKEN", async () => {
    const { t } = await issued();
    db.table("authToken")[0].expiresAt = new Date(Date.now() - 1000);
    expect((await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" })).body.code).toBe("INVALID_TOKEN");
  });

  it("でたらめ・形の ちがう トークン・メール確認用の トークンは 使えない", async () => {
    await issued();
    for (const bad of ["x".repeat(43), "short", "", "A".repeat(200)]) {
      const r = await call(complete.POST, "POST", { token: bad, newPassword: "newpassw0rd" });
      expect(r.status).toBe(400);
    }
    // EMAIL_VERIFY のトークンを 再設定に 使えない
    const raw = "B".repeat(43);
    db.table("authToken").push({ id: "x1", parentId: db.table("parent")[0].id, purpose: "EMAIL_VERIFY", tokenHash: hashToken(raw), email: "z@example.com", passwordHash: "h", expiresAt: new Date(Date.now() + 60_000), usedAt: null, createdAt: new Date() });
    expect((await call(complete.POST, "POST", { token: raw, newPassword: "newpassw0rd" })).body.code).toBe("INVALID_TOKEN");
  });

  it("弱いパスワード → 400（リンクは 使われない）", async () => {
    const { t } = await issued();
    const r = await call(complete.POST, "POST", { token: t, newPassword: "short" });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe("INVALID_INPUT");
    expect((await call(check.POST, "POST", { token: t })).body.valid).toBe(true);
  });

  it("送ったあとで メールアドレスが かわっていたら 使えない", async () => {
    const { t } = await issued();
    db.table("parent")[0].email = "changed@example.com";
    expect((await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" })).body.code).toBe("INVALID_TOKEN");
  });

  it("設定画面で パスワードを変えたら、まだ使っていない 再設定リンクは 使えない", async () => {
    const { first, t } = await issued();
    useToken(first);
    const r = await call(settings.PATCH, "PATCH", { changePassword: { currentPassword: A.password, newPassword: "changedpassw0rd" } });
    expect(r.status).toBe(200);
    expect((await call(check.POST, "POST", { token: t })).body.valid).toBe(false);
  });

  it("ほかの保護者には 影響しない", async () => {
    const bToken = await registerAs(B);
    const { t } = await issued();
    await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" });
    useToken(bToken);
    expect((await call(me.GET, "GET")).body).toMatchObject({ loggedIn: true, parent: { email: B.email } });
    expect(await verifySecret(B.password, db.table("parent").find((p) => p.email === B.email)!.passwordHash as string)).toBe(true);
  });

  it("退会すると トークンも消える", async () => {
    const { first } = await issued();
    useToken(first);
    expect((await call(account.DELETE, "DELETE", { password: A.password })).status).toBe(200);
    expect(db.table("authToken")).toHaveLength(0);
  });
});

describe("リンクのもと（APP_BASE_URL）", () => {
  it("APP_BASE_URL → 開発中は リクエストの URL → 本番で 未設定なら null（Host ヘッダーを信用しない）", () => {
    const req = new Request("http://evil.example/api/x");
    expect(R.mailLinkBase(req, { APP_BASE_URL: "https://app.example.test/" })).toBe("https://app.example.test");
    expect(R.mailLinkBase(req, { NODE_ENV: "development" })).toBe("http://evil.example");
    expect(R.mailLinkBase(req, { NODE_ENV: "production" })).toBeNull();
  });

  it("本番で APP_BASE_URL が無いときは 再設定メールを送らない（答えは同じ）", async () => {
    await registerAs(A);
    vi.stubEnv("APP_BASE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await forgotFor(A.email);
    expect(r.body.messageJa).toBe(FORGOT_PASSWORD_SENT_JA);
    expect(outbox()).toHaveLength(0);
    expect(err.mock.calls.flat().join(" ")).toContain("APP_BASE_URL");
  });
});

describe("暗証番号を忘れた", () => {
  it("パスワードで本人確認 → 新しい暗証番号。そのまま おうちの方エリアに入れる", async () => {
    const t = await registerAs(A);
    jar.clear();
    await call(login.POST, "POST", { email: A.email, password: A.password });
    expect((await call(me.GET, "GET")).body.pinUnlocked).toBe(false);
    void t;
    const st = await call(resetPin.GET, "GET");
    expect(st.body).toMatchObject({ hasPassword: true, lineLinked: false, lineVerified: false });
    const wrong = await call(resetPin.POST, "POST", { password: "wrong-passw0rd", newPin: "9999" });
    expect(wrong.status).toBe(401);
    expect(wrong.body.code).toBe("WRONG_PASSWORD");
    const ok = await call(resetPin.POST, "POST", { password: A.password, newPin: "9999" });
    expect(ok.status).toBe(200);
    expect(await verifySecret("9999", db.table("parent")[0].pinHash as string)).toBe(true);
    expect((await call(me.GET, "GET")).body.pinUnlocked).toBe(true);
    expect((await call(verifyPin.POST, "POST", { pin: A.pin })).status).toBe(401);
  });

  it("未ログイン → 401。暗証番号の形が おかしい → 400。パスワードなしでは 403 REAUTH_REQUIRED", async () => {
    expect((await call(resetPin.POST, "POST", { password: "x", newPin: "1234" })).status).toBe(401);
    await registerAs(A);
    expect((await call(resetPin.POST, "POST", { password: A.password, newPin: "12a4" })).status).toBe(400);
    const noPw = await call(resetPin.POST, "POST", { newPin: "1234" });
    expect(noPw.status).toBe(403);
    expect(noPw.body.code).toBe("REAUTH_REQUIRED");
  });

  it("パスワードの まちがいが続くと 429", async () => {
    await registerAs(A);
    for (let i = 0; i < 8; i++) await call(resetPin.POST, "POST", { password: `wrong-${i}`, newPin: "1234" });
    expect((await call(resetPin.POST, "POST", { password: A.password, newPin: "1234" })).status).toBe(429);
  });

  it("LINE だけの保護者: LINE で本人確認 → 10分以内なら 新しい暗証番号（1回だけ）", async () => {
    await lineOnlyParent();
    // 暗証番号の期限を切らした状態
    db.table("session")[0].pinVerifiedAt = null;
    expect((await call(resetPin.GET, "GET")).body).toMatchObject({ hasPassword: false, lineLinked: true, lineVerified: false, lineLoginAvailable: true });
    expect((await call(resetPin.POST, "POST", { newPin: "7777" })).body.code).toBe("REAUTH_REQUIRED");
    expect((await call(resetPin.POST, "POST", { password: "4321", newPin: "7777" })).body.code).toBe("NO_PASSWORD");

    const { start, cb } = await lineFlow("reauth");
    expect(start.status).toBe(302);
    expect(cb!.path).toBe("/forgot-pin?line=reauth_ok");
    expect((await call(resetPin.GET, "GET")).body.lineVerified).toBe(true);
    const ok = await call(resetPin.POST, "POST", { newPin: "7777" });
    expect(ok.status).toBe(200);
    expect(await verifySecret("7777", db.table("parent")[0].pinHash as string)).toBe(true);
    expect((await call(me.GET, "GET")).body.pinUnlocked).toBe(true);
    // しるしは 1回で消える
    expect((await call(resetPin.POST, "POST", { newPin: "8888" })).body.code).toBe("REAUTH_REQUIRED");
  });

  it("LINE の本人確認から 10分すぎたら だめ", async () => {
    await lineOnlyParent();
    await lineFlow("reauth");
    db.table("session")[0].lineReauthAt = new Date(Date.now() - LINE_REAUTH_MS - 1000);
    expect((await call(resetPin.POST, "POST", { newPin: "7777" })).body.code).toBe("REAUTH_REQUIRED");
  });

  it("ちがう LINE アカウントで戻ってきたら 本人確認にならない", async () => {
    await lineOnlyParent(LINE_A);
    lineSub = LINE_B;
    const { cb } = await lineFlow("reauth");
    expect(cb!.path).toBe("/forgot-pin?line=reauth_mismatch");
    expect(db.table("session")[0].lineReauthAt).toBeNull();
    expect((await call(resetPin.POST, "POST", { newPin: "7777" })).body.code).toBe("REAUTH_REQUIRED");
  });

  it("LINE の本人確認: 未ログイン → /login、LINE と連携していない → reauth_not_linked（LINE へは行かない）", async () => {
    expect((await get(lineStart.GET, "http://localhost:3000/api/auth/line/start?mode=reauth")).path).toBe("/login?line=not_logged_in");
    await registerAs(A);
    expect((await get(lineStart.GET, "http://localhost:3000/api/auth/line/start?mode=reauth")).path).toBe("/forgot-pin?line=reauth_not_linked");
    expect(jar.get(L.LINE_OAUTH_COOKIE)).toBeUndefined();
  });

  it("LINE から戻る前に 別の保護者に切りかわっていたら しるしを付けない", async () => {
    await lineOnlyParent(LINE_A);
    await get(lineStart.GET, "http://localhost:3000/api/auth/line/start?mode=reauth");
    const saved = L.decodeOAuthState(jar.get(L.LINE_OAUTH_COOKIE)?.value)!;
    const oauth = jar.get(L.LINE_OAUTH_COOKIE)!.value;
    const bToken = await registerAs(B);
    useToken(bToken);
    jar.set(L.LINE_OAUTH_COOKIE, oauth);
    const cb = await get(lineCallback.GET, `${LINE_ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=${encodeURIComponent(saved.state)}`);
    expect(cb.path).toBe("/login?line=not_logged_in");
    expect(db.table("session").every((s) => !s.lineReauthAt)).toBe(true);
  });
});

describe("LINE だけの保護者が メールアドレス + パスワードを追加", () => {
  it("確認メール → リンクの画面で「確定」→ メール + パスワードで ログインできる", async () => {
    await lineOnlyParent();
    const r = await call(addEmail.POST, "POST", { email: "Line@Example.com", password: "linepassw0rd" });
    expect(r.status).toBe(200);
    expect(r.body.messageJa).toContain("line@example.com");
    await flushBackgroundTasks();
    const mails = outbox();
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe("line@example.com");
    expect(mails[0].text).toContain(`${BASE}/verify-email?token=`);
    expect(mails[0].text).toContain("24時間");
    const t = linkToken(mails[0]);
    const dump = JSON.stringify(db.tables);
    expect(dump).not.toContain(t);
    expect(dump).not.toContain("linepassw0rd");
    // まだ 追加されていない
    expect(db.table("parent")[0].email ?? null).toBeNull();

    expect((await call(emailCheck.POST, "POST", { token: t })).body).toMatchObject({ valid: true, maskedEmail: "li****@example.com" });
    const c = await call(emailConfirm.POST, "POST", { token: t });
    expect(c.status).toBe(200);
    const p = db.table("parent")[0];
    expect(p.email).toBe("line@example.com");
    expect(await verifySecret("linepassw0rd", p.passwordHash as string)).toBe(true);
    expect(p.lineUserId).toBe(LINE_A);
    expect((await call(me.GET, "GET")).body.parent).toMatchObject({ email: "line@example.com", hasPassword: true, lineLinked: true });

    // 2回目は 使えない
    expect((await call(emailConfirm.POST, "POST", { token: t })).body.code).toBe("INVALID_TOKEN");

    jar.clear();
    expect((await call(login.POST, "POST", { email: "line@example.com", password: "linepassw0rd" })).status).toBe(200);
    // これで パスワードを忘れた も 使える
    await forgotFor("line@example.com");
    expect(outbox().at(-1)!.subject).toContain("パスワード再設定");
  });

  it("ほかのアカウントで使われている メール → 答えは同じ。そのアドレスには お知らせ（確認リンクは作らない）", async () => {
    await registerAs(A);
    const lineTok = await lineOnlyParent();
    useToken(lineTok);
    const r = await call(addEmail.POST, "POST", { email: A.email, password: "linepassw0rd" });
    expect(r.status).toBe(200);
    expect(r.body.messageJa).toContain(A.email);
    await flushBackgroundTasks();
    const mails = outbox();
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe(A.email);
    expect(mails[0].subject).toContain("メールアドレスの追加について");
    expect(mails[0].text).not.toMatch(/token=/);
    expect(db.table("authToken")).toHaveLength(0);
  });

  it("確認までの あいだに 同じメールで ほかの人が登録 → EMAIL_TAKEN（上書きしない）", async () => {
    await lineOnlyParent();
    await call(addEmail.POST, "POST", { email: "race@example.com", password: "linepassw0rd" });
    await flushBackgroundTasks();
    const t = linkToken(outbox()[0]);
    await registerAs({ email: "race@example.com", password: "otherpassw0rd", pin: "5555" });
    const c = await call(emailConfirm.POST, "POST", { token: t });
    expect(c.status).toBe(409);
    expect(c.body.code).toBe("EMAIL_TAKEN");
    expect(db.table("parent").filter((p) => p.email === "race@example.com")).toHaveLength(1);
  });

  it("24時間を すぎたら 使えない", async () => {
    await lineOnlyParent();
    const parentId = db.table("parent")[0].id as string;
    const now = new Date("2026-12-01T00:00:00Z");
    await R.requestEmailAddition(parentId, "late@example.com", "linepassw0rd", BASE, now);
    const t = linkToken(outbox()[0]);
    const late = new Date(now.getTime() + 24 * 3_600_000);
    expect((await R.checkEmailToken(t, late)).valid).toBe(false);
    expect(await R.confirmEmailAddition(t, late)).toEqual({ ok: false, reason: "INVALID_TOKEN" });
  });

  it("メールがある保護者は 409、暗証番号を入れていない → 403、弱いパスワード → 400", async () => {
    await registerAs(A);
    expect((await call(addEmail.POST, "POST", { email: "x@example.com", password: "linepassw0rd" })).body.code).toBe("HAS_EMAIL");
    await lineOnlyParent();
    db.table("session").forEach((s) => { s.pinVerifiedAt = null; });
    expect((await call(addEmail.POST, "POST", { email: "x@example.com", password: "linepassw0rd" })).body.code).toBe("PIN_REQUIRED");
    db.table("session").forEach((s) => { s.pinVerifiedAt = new Date(); });
    const weak = await call(addEmail.POST, "POST", { email: "x@example.com", password: "short" });
    expect(weak.status).toBe(400);
    expect(weak.body.field).toBe("password");
  });

  it("確認メールは 1時間に 5回まで", async () => {
    await lineOnlyParent();
    for (let i = 0; i < 5; i++) expect((await call(addEmail.POST, "POST", { email: `x${i}@example.com`, password: "linepassw0rd" })).status).toBe(200);
    expect((await call(addEmail.POST, "POST", { email: "x9@example.com", password: "linepassw0rd" })).status).toBe(429);
    await flushBackgroundTasks();
    // 新しく送るたびに 古い確認リンクは 消える
    expect(db.table("authToken").filter((t) => t.purpose === "EMAIL_VERIFY")).toHaveLength(1);
  });

  it("確認リンクは 再設定には使えない", async () => {
    await lineOnlyParent();
    await call(addEmail.POST, "POST", { email: "line@example.com", password: "linepassw0rd" });
    await flushBackgroundTasks();
    const t = linkToken(outbox()[0]);
    expect((await call(check.POST, "POST", { token: t })).body.valid).toBe(false);
    expect((await call(complete.POST, "POST", { token: t, newPassword: "newpassw0rd" })).body.code).toBe("INVALID_TOKEN");
  });
});

describe("トークンの部品", () => {
  it("maskEmail", () => {
    expect(R.maskEmail("a@example.com")).toBe("a****@example.com");
    expect(R.maskEmail("abcdef@example.com")).toBe("ab****@example.com");
    expect(R.maskEmail("broken")).toBe("****");
  });
  it("hashSecret は 使える（テストの前提）", async () => {
    expect(await verifySecret("x1", await hashSecret("x1"))).toBe(true);
  });
});
