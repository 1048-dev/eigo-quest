/**
 * LINE ログイン（run4 Phase 2）。LINE のトークン・verify エンドポイントは fetch をモックして試す。
 *  - state の不一致・nonce の不一致・期限切れのトークン・ほかの保護者に連携ずみの LINE・成功（新規登録 / ログイン / 連携）
 *  - 環境変数が無いときはボタンを出さない（lineLoginAvailable: false）・start は「未設定」で戻す
 *  - LINE だけの保護者（パスワードなし）: 暗証番号を決める・本人確認は暗証番号・連携は解除できない
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => true, markDbDown: () => {} }));

const start = await import("@/app/api/auth/line/start/route");
const callback = await import("@/app/api/auth/line/callback/route");
const setupPin = await import("@/app/api/auth/line/pin/route");
const cancel = await import("@/app/api/auth/line/cancel/route");
const unlink = await import("@/app/api/parent/line/route");
const register = await import("@/app/api/auth/register/route");
const login = await import("@/app/api/auth/login/route");
const me = await import("@/app/api/auth/me/route");
const overview = await import("@/app/api/parent/overview/route");
const settings = await import("@/app/api/parent/settings/route");
const account = await import("@/app/api/parent/account/route");
const verifyPin = await import("@/app/api/parent/verify-pin/route");
const L = await import("@/lib/auth/line");
const { SESSION_COOKIE } = await import("@/lib/auth/cookies");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");
const { verifySecret } = await import("@/lib/auth/password");

const ENV = {
  LINE_LOGIN_CHANNEL_ID: "1234567890",
  LINE_LOGIN_CHANNEL_SECRET: "test-secret-not-real",
  LINE_LOGIN_CALLBACK_URL: "https://app.example.test/api/auth/line/callback",
};
const LINE_A = "U" + "a".repeat(32);
const LINE_B = "U" + "b".repeat(32);
const EMAIL_A = { email: "a@example.com", password: "passw0rd-a", pin: "1111" };
const EMAIL_B = { email: "b@example.com", password: "passw0rd-b", pin: "2222" };

function setEnv(on: boolean) {
  for (const [k, v] of Object.entries(ENV)) {
    if (on) vi.stubEnv(k, v);
    else vi.stubEnv(k, "");
  }
}

/** モックの LINE。payload をテストごとに変えられる */
type Payload = Record<string, unknown>;
let tokenStatus = 200;
let verifyResponse: (body: URLSearchParams) => { status: number; json: Payload } = () => ({ status: 500, json: {} });
const fetchCalls: { url: string; body: URLSearchParams }[] = [];
const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  const body = new URLSearchParams(String(init?.body ?? ""));
  fetchCalls.push({ url, body });
  if (url === L.LINE_TOKEN_URL) {
    return tokenStatus === 200
      ? Response.json({ access_token: "at", token_type: "Bearer", id_token: "fake.id.token", expires_in: 2592000, scope: "profile openid" })
      : Response.json({ error: "invalid_grant", error_description: "invalid authorization code" }, { status: tokenStatus });
  }
  if (url === L.LINE_VERIFY_URL) {
    const r = verifyResponse(body);
    return Response.json(r.json, { status: r.status });
  }
  return new Response("not found", { status: 404 });
});

/** 正しい ID トークンの中身（verify エンドポイントが返すもの） */
function goodPayload(nonce: string, sub = LINE_A, extra: Payload = {}): Payload {
  const now = Math.floor(Date.now() / 1000);
  return { iss: L.LINE_ISSUER, sub, aud: ENV.LINE_LOGIN_CHANNEL_ID, exp: now + 3600, iat: now, nonce, amr: ["linesso"], name: "ママ", ...extra };
}
/** LINE の verify と同じく、送られた nonce をそのまま入れて返す */
function verifyOk(sub = LINE_A, extra: Payload = {}) {
  verifyResponse = (body) => ({ status: 200, json: goodPayload(body.get("nonce") ?? "", sub, extra) });
}

const token = () => jar.get(SESSION_COOKIE)?.value;
const oauthCookie = () => L.decodeOAuthState(jar.get(L.LINE_OAUTH_COOKIE)?.value);

async function get(handler: (req: Request) => Promise<Response>, url: string) {
  const res = await handler(new Request(url));
  return { status: res.status, location: res.headers.get("location") ?? "" };
}
type AnyHandler = (req: Request, ctx: never) => Promise<Response>;
async function call(handler: AnyHandler, method: string, body?: unknown) {
  const req = new Request("http://localhost:3000/api/test", {
    method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body),
  });
  const res = await handler(req, { params: Promise.resolve({}) } as never);
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}

const path = (location: string) => { const u = new URL(location); return u.pathname + u.search; };

/** start → （LINE の画面）→ callback を通しで行う */
async function lineFlow(mode: "login" | "link" = "login", opts: { tamperState?: boolean } = {}) {
  const s = await get(start.GET, `http://localhost:3000/api/auth/line/start?mode=${mode}`);
  const saved = oauthCookie();
  if (!saved) return { start: s, cb: null };
  const state = opts.tamperState ? saved.state.replace(/^./, (c) => (c === "A" ? "B" : "A")) : saved.state;
  const cb = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=auth-code-123&state=${encodeURIComponent(state)}`);
  return { start: s, cb };
}

async function registerEmail(p = EMAIL_A) {
  jar.clear();
  const r = await call(register.POST, "POST", p);
  expect(r.status).toBe(201);
  return token()!;
}

beforeEach(() => {
  db.reset();
  jar.clear();
  resetAllLimiters();
  fetchCalls.length = 0;
  fetchMock.mockClear();
  tokenStatus = 200;
  verifyOk();
  setEnv(true);
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("設定（環境変数）", () => {
  it("3つそろっていないと未設定。me は lineLoginAvailable:false、start は「未設定」で戻す", async () => {
    setEnv(false);
    expect(L.lineLoginConfig()).toBeNull();
    expect(L.lineLoginConfig({ ...ENV, LINE_LOGIN_CALLBACK_URL: "not a url" })).toBeNull();
    expect(L.lineLoginConfig({ ...ENV, LINE_LOGIN_CHANNEL_SECRET: "" })).toBeNull();
    const m = await call(me.GET, "GET");
    expect(m.body).toMatchObject({ loggedIn: false, lineLoginAvailable: false });
    const s = await get(start.GET, "http://localhost:3000/api/auth/line/start");
    expect(s.status).toBe(303);
    expect(path(s.location)).toBe("/login?line=not_configured");
    expect(jar.get(L.LINE_OAUTH_COOKIE)).toBeUndefined();
    const cb = await get(callback.GET, "http://localhost:3000/api/auth/line/callback?code=x&state=y");
    expect(path(cb.location)).toBe("/login?line=not_configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("そろっていれば me は lineLoginAvailable:true", async () => {
    expect(L.isLineLoginConfigured()).toBe(true);
    const m = await call(me.GET, "GET");
    expect(m.body.lineLoginAvailable).toBe(true);
  });
});

describe("GET /api/auth/line/start", () => {
  it("state・nonce・PKCE を httpOnly cookie に入れて LINE の認可画面へ（bot_prompt=aggressive）", async () => {
    const s = await get(start.GET, "http://localhost:3000/api/auth/line/start?mode=login");
    expect(s.status).toBe(302);
    const u = new URL(s.location);
    expect(u.origin + u.pathname).toBe(L.LINE_AUTHORIZE_URL);
    const saved = oauthCookie()!;
    expect(saved.mode).toBe("login");
    expect(saved.parentId).toBeNull();
    const q = u.searchParams;
    expect(q.get("response_type")).toBe("code");
    expect(q.get("client_id")).toBe(ENV.LINE_LOGIN_CHANNEL_ID);
    expect(q.get("redirect_uri")).toBe(ENV.LINE_LOGIN_CALLBACK_URL);
    expect(q.get("scope")).toBe("profile openid");
    expect(q.get("bot_prompt")).toBe("aggressive");
    expect(q.get("state")).toBe(saved.state);
    expect(q.get("nonce")).toBe(saved.nonce);
    expect(q.get("code_challenge_method")).toBe("S256");
    expect(q.get("code_challenge")).toBe(L.codeChallenge(saved.codeVerifier));
    expect(s.location).not.toContain(saved.codeVerifier);
    expect(s.location).not.toContain(ENV.LINE_LOGIN_CHANNEL_SECRET);
    const c = jar.store.get(L.LINE_OAUTH_COOKIE)!;
    expect(c.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/api/auth/line", maxAge: 600 });
  });

  it("毎回ちがう state・nonce", async () => {
    await get(start.GET, "http://localhost:3000/api/auth/line/start");
    const a = oauthCookie()!;
    await get(start.GET, "http://localhost:3000/api/auth/line/start");
    const b = oauthCookie()!;
    expect(a.state).not.toBe(b.state);
    expect(a.nonce).not.toBe(b.nonce);
  });
});

describe("コールバック: 失敗", () => {
  it("state の不一致 → やり直し（LINE にも問い合わせない・保護者は作られない）", async () => {
    const { cb } = await lineFlow("login", { tamperState: true });
    expect(cb!.status).toBe(303);
    expect(path(cb!.location)).toBe("/login?line=state");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.table("parent")).toHaveLength(0);
    expect(token()).toBeUndefined();
    expect(jar.get(L.LINE_OAUTH_COOKIE)).toBeUndefined(); // 使った state は消える
  });

  it("cookie が無い・期限切れ・state が空 → state エラー", async () => {
    const noCookie = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=whatever-state-value-1234`);
    expect(path(noCookie.location)).toBe("/login?line=state");

    const old = L.newOAuthState("login", null, Date.now() - L.LINE_OAUTH_TTL_MS - 1000);
    jar.set(L.LINE_OAUTH_COOKIE, L.encodeOAuthState(old));
    const expired = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=${old.state}`);
    expect(path(expired.location)).toBe("/login?line=state");

    await get(start.GET, "http://localhost:3000/api/auth/line/start");
    const empty = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c`);
    expect(path(empty.location)).toBe("/login?line=state");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("同じ state を2回使えない（1回目で cookie が消える）", async () => {
    await get(start.GET, "http://localhost:3000/api/auth/line/start");
    const saved = oauthCookie()!;
    const first = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=${saved.state}`);
    expect(path(first.location)).toBe("/setup-pin");
    jar.set(SESSION_COOKIE, ""); // 別のブラウザから同じ URL を開いた想定
    const replay = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=${saved.state}`);
    expect(path(replay.location)).toBe("/login?line=state");
  });

  it("nonce の不一致（ID トークンの nonce が違う）→ nonce エラー・保護者は作られない", async () => {
    verifyResponse = () => ({ status: 200, json: goodPayload("some-other-nonce-value-xyz") });
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/login?line=nonce");
    expect(db.table("parent")).toHaveLength(0);
    expect(token()).toBeUndefined();
  });

  it("LINE の verify が nonce エラー（400）→ nonce エラー", async () => {
    verifyResponse = () => ({ status: 400, json: { error: "invalid_request", error_description: "Invalid IdToken Nonce." } });
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/login?line=nonce");
  });

  it("期限切れのトークン（exp が過去）→ expired", async () => {
    verifyResponse = (body) => ({ status: 200, json: goodPayload(body.get("nonce")!, LINE_A, { exp: Math.floor(Date.now() / 1000) - 10 }) });
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/login?line=expired");
    expect(db.table("parent")).toHaveLength(0);
  });

  it("LINE の verify が期限切れ（400 IdToken expired.）→ expired", async () => {
    verifyResponse = () => ({ status: 400, json: { error: "invalid_request", error_description: "IdToken expired." } });
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/login?line=expired");
  });

  it("宛先（aud）・発行者（iss）・ユーザーID の形がおかしい → error", async () => {
    for (const extra of [{ aud: "9999999999" }, { iss: "https://evil.example" }, { sub: "not-a-line-id" }]) {
      jar.clear();
      verifyResponse = (body) => ({ status: 200, json: { ...goodPayload(body.get("nonce")!), ...extra } });
      const { cb } = await lineFlow();
      expect(path(cb!.location)).toBe("/login?line=error");
    }
    expect(db.table("parent")).toHaveLength(0);
  });

  it("code の交換に失敗（400）→ error。verify は呼ばない", async () => {
    tokenStatus = 400;
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/login?line=error");
    expect(fetchCalls.map((c) => c.url)).toEqual([L.LINE_TOKEN_URL]);
  });

  it("LINE の画面でキャンセル（error=access_denied）→ canceled", async () => {
    await get(start.GET, "http://localhost:3000/api/auth/line/start");
    const s = oauthCookie()!;
    const cb = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?error=access_denied&error_description=user+cancel&state=${s.state}`);
    expect(path(cb.location)).toBe("/login?line=canceled");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("戻り先は LINE_LOGIN_CALLBACK_URL のオリジン（公開 URL）", async () => {
    const { cb } = await lineFlow("login", { tamperState: true });
    expect(new URL(cb!.location).origin).toBe("https://app.example.test");
  });
});

describe("コールバック: 成功（新規登録 → 暗証番号 → お子さま）", () => {
  it("はじめての LINE → 保護者を作ってログイン → /setup-pin。トークン交換に code_verifier、verify に nonce を送る", async () => {
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/setup-pin");
    const parents = db.table("parent");
    expect(parents).toHaveLength(1);
    expect(parents[0]).toMatchObject({ lineUserId: LINE_A, lineDisplayName: "ママ", email: null, passwordHash: null, pinHash: null });
    expect(token()).toBeTruthy();
    expect(jar.get(L.LINE_OAUTH_COOKIE)).toBeUndefined();

    const [tok, ver] = fetchCalls;
    expect(tok.url).toBe(L.LINE_TOKEN_URL);
    expect(tok.body.get("grant_type")).toBe("authorization_code");
    expect(tok.body.get("code")).toBe("auth-code-123");
    expect(tok.body.get("redirect_uri")).toBe(ENV.LINE_LOGIN_CALLBACK_URL);
    expect(tok.body.get("client_id")).toBe(ENV.LINE_LOGIN_CHANNEL_ID);
    expect(tok.body.get("client_secret")).toBe(ENV.LINE_LOGIN_CHANNEL_SECRET);
    expect(tok.body.get("code_verifier")).toMatch(/^[A-Za-z0-9_-]{43,}$/);
    expect(ver.url).toBe(L.LINE_VERIFY_URL);
    expect(ver.body.get("id_token")).toBe("fake.id.token");
    expect(ver.body.get("client_id")).toBe(ENV.LINE_LOGIN_CHANNEL_ID);
    expect(ver.body.get("nonce")).toBeTruthy();

    const m = await call(me.GET, "GET");
    expect(m.body).toMatchObject({
      loggedIn: true, pinUnlocked: false, lineLoginAvailable: true,
      parent: { email: "", lineLinked: true, lineDisplayName: "ママ", hasPassword: false, needsPin: true },
    });
  });

  it("暗証番号を決めるまで「おうちの方」エリアは PIN_SETUP_REQUIRED。決めたらそのまま入れる。2回目は 409", async () => {
    await lineFlow();
    const before = await call(overview.GET, "GET");
    expect(before.status).toBe(403);
    expect(before.body.code).toBe("PIN_SETUP_REQUIRED");
    const vp = await call(verifyPin.POST, "POST", { pin: "0000" });
    expect(vp.body.code).toBe("PIN_SETUP_REQUIRED");

    expect((await call(setupPin.POST, "POST", { pin: "12a4" })).status).toBe(400);
    const ok = await call(setupPin.POST, "POST", { pin: "4321" });
    expect(ok.status).toBe(200);
    expect(await verifySecret("4321", db.table("parent")[0].pinHash as string)).toBe(true);
    const m = await call(me.GET, "GET");
    expect(m.body).toMatchObject({ pinUnlocked: true, parent: { needsPin: false } });
    expect((await call(overview.GET, "GET")).status).toBe(200);

    const again = await call(setupPin.POST, "POST", { pin: "9999" });
    expect(again.status).toBe(409);
    expect(again.body.code).toBe("PIN_ALREADY_SET");
    expect(await verifySecret("4321", db.table("parent")[0].pinHash as string)).toBe(true);
  });

  it("連携ずみの LINE でもう一度ログイン → 同じ保護者で /who（新しい保護者は作らない・セッションは作り直す）", async () => {
    await lineFlow();
    await call(setupPin.POST, "POST", { pin: "4321" });
    const first = token();
    jar.clear();
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/who");
    expect(db.table("parent")).toHaveLength(1);
    expect(token()).toBeTruthy();
    expect(token()).not.toBe(first);
    const m = await call(me.GET, "GET");
    expect(m.body).toMatchObject({ loggedIn: true, pinUnlocked: false, parent: { needsPin: false } });
  });

  it("暗証番号を決めずに離れた LINE の保護者 → 次のログインも /setup-pin", async () => {
    await lineFlow();
    jar.clear();
    const { cb } = await lineFlow();
    expect(path(cb!.location)).toBe("/setup-pin");
    expect(db.table("parent")).toHaveLength(1);
  });

  it("「登録を取り消す」: 暗証番号を決める前なら消えてログアウト。決めたあとは 409", async () => {
    await lineFlow();
    const r = await call(cancel.POST, "POST");
    expect(r.status).toBe(200);
    expect(db.table("parent")).toHaveLength(0);
    expect(db.table("session")).toHaveLength(0);
    expect(token()).toBeUndefined();

    await lineFlow();
    await call(setupPin.POST, "POST", { pin: "4321" });
    const no = await call(cancel.POST, "POST");
    expect(no.status).toBe(409);
    expect(db.table("parent")).toHaveLength(1);

    // メールで登録した保護者も取り消せない
    await registerEmail();
    expect((await call(cancel.POST, "POST")).status).toBe(409);
  });
});

describe("LINE だけの保護者（パスワードなし）", () => {
  async function lineOnlyParent() {
    await lineFlow();
    await call(setupPin.POST, "POST", { pin: "4321" });
  }

  it("暗証番号の変更は今の暗証番号で確認。パスワードの変更は NO_PASSWORD", async () => {
    await lineOnlyParent();
    const wrong = await call(settings.PATCH, "PATCH", { changePin: { password: "0000", newPin: "5555" } });
    expect(wrong.status).toBe(401);
    expect(wrong.body.code).toBe("WRONG_PIN");
    const ok = await call(settings.PATCH, "PATCH", { changePin: { password: "4321", newPin: "5555" } });
    expect(ok.status).toBe(200);
    expect(await verifySecret("5555", db.table("parent")[0].pinHash as string)).toBe(true);
    const pw = await call(settings.PATCH, "PATCH", { changePassword: { currentPassword: "5555", newPassword: "newpassw0rd" } });
    expect(pw.status).toBe(400);
    expect(pw.body.code).toBe("NO_PASSWORD");
  });

  it("LINE の連携は解除できない（ログインできなくなるため）", async () => {
    await lineOnlyParent();
    const r = await call(unlink.DELETE, "DELETE");
    expect(r.status).toBe(409);
    expect(r.body.code).toBe("NEEDS_PASSWORD");
    expect(db.table("parent")[0].lineUserId).toBe(LINE_A);
  });

  it("退会の確認は暗証番号", async () => {
    await lineOnlyParent();
    expect((await call(account.DELETE, "DELETE", { password: "0000" })).body.code).toBe("WRONG_PIN");
    const ok = await call(account.DELETE, "DELETE", { password: "4321" });
    expect(ok.status).toBe(200);
    expect(db.table("parent")).toHaveLength(0);
  });

  it("メール + パスワードのログインには使えない（パスワードが無い）", async () => {
    await lineOnlyParent();
    jar.clear();
    const r = await call(login.POST, "POST", { email: "", password: "4321" });
    expect(r.status).toBe(400);
    expect(token()).toBeUndefined();
  });
});

describe("メールの保護者に LINE を連携（link）", () => {
  it("暗証番号を入力ずみ → 連携できる → /parent?line=linked。次からは LINE でログインできる", async () => {
    await registerEmail();
    const { start: s, cb } = await lineFlow("link");
    expect(s.status).toBe(302);
    expect(path(cb!.location)).toBe("/parent?line=linked");
    const p = db.table("parent")[0];
    expect(p).toMatchObject({ email: EMAIL_A.email, lineUserId: LINE_A, lineDisplayName: "ママ" });
    expect(p.lineLinkedAt).toBeInstanceOf(Date);
    expect((await call(me.GET, "GET")).body.parent).toMatchObject({ email: EMAIL_A.email, lineLinked: true, hasPassword: true, needsPin: false });

    jar.clear();
    const again = await lineFlow("login");
    expect(path(again.cb!.location)).toBe("/who");
    expect(db.table("parent")).toHaveLength(1);
  });

  it("ほかの保護者に連携ずみの LINE → already_linked（どちらも変わらない）", async () => {
    await registerEmail(EMAIL_B);
    await lineFlow("link"); // B が LINE_A を連携
    expect(db.table("parent")[0].lineUserId).toBe(LINE_A);

    await registerEmail(EMAIL_A);
    const { cb } = await lineFlow("link"); // A も LINE_A を連携しようとする
    expect(path(cb!.location)).toBe("/parent?line=already_linked");
    const [b, a] = db.table("parent");
    expect(b.lineUserId).toBe(LINE_A);
    expect(a.lineUserId ?? null).toBeNull();
  });

  it("LINE で作った保護者の LINE も、メールの保護者には連携できない", async () => {
    await lineFlow("login"); // LINE_A で新規登録
    await registerEmail(EMAIL_A);
    const { cb } = await lineFlow("link");
    expect(path(cb!.location)).toBe("/parent?line=already_linked");
  });

  it("すでに別の LINE と連携ずみ → start で has_other_line", async () => {
    await registerEmail();
    await lineFlow("link");
    verifyOk(LINE_B);
    const s = await get(start.GET, "http://localhost:3000/api/auth/line/start?mode=link");
    expect(path(s.location)).toBe("/parent?line=has_other_line");
    expect(db.table("parent")[0].lineUserId).toBe(LINE_A);
  });

  it("未ログイン → not_logged_in、暗証番号が切れている → pin_required（LINE へは行かない）", async () => {
    const noLogin = await get(start.GET, "http://localhost:3000/api/auth/line/start?mode=link");
    expect(path(noLogin.location)).toBe("/login?line=not_logged_in");

    await registerEmail();
    db.table("session")[0].pinVerifiedAt = new Date(Date.now() - 11 * 60_000);
    const locked = await get(start.GET, "http://localhost:3000/api/auth/line/start?mode=link");
    expect(path(locked.location)).toBe("/parent?line=pin_required");
    expect(jar.get(L.LINE_OAUTH_COOKIE)).toBeUndefined();
  });

  it("LINE から戻る前に別の保護者に切りかわっていた → 連携しない", async () => {
    await registerEmail(EMAIL_A);
    await get(start.GET, "http://localhost:3000/api/auth/line/start?mode=link");
    const saved = oauthCookie()!;
    // 同じブラウザで B がログインしなおした
    const keepOauth = jar.get(L.LINE_OAUTH_COOKIE)!.value;
    await registerEmail(EMAIL_B);
    jar.set(L.LINE_OAUTH_COOKIE, keepOauth);
    const cb = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=${saved.state}`);
    expect(path(cb.location)).toBe("/login?line=not_logged_in");
    expect(db.table("parent").every((p) => !p.lineUserId)).toBe(true);
  });

  it("連携の解除（メール + パスワードがある保護者）。解除後は LINE ログインで新しいアカウントになる", async () => {
    await registerEmail();
    await lineFlow("link");
    const r = await call(unlink.DELETE, "DELETE");
    expect(r.status).toBe(200);
    expect(db.table("parent")[0]).toMatchObject({ lineUserId: null, lineDisplayName: null, lineLinkedAt: null });
    expect((await call(unlink.DELETE, "DELETE")).body.code).toBe("NOT_LINKED");
    // メールのログインは今までどおり
    jar.clear();
    expect((await call(login.POST, "POST", { email: EMAIL_A.email, password: EMAIL_A.password })).status).toBe(200);
  });

  it("連携の解除は暗証番号が必要", async () => {
    await registerEmail();
    await lineFlow("link");
    db.table("session")[0].pinVerifiedAt = null;
    const r = await call(unlink.DELETE, "DELETE");
    expect(r.status).toBe(403);
    expect(r.body.code).toBe("PIN_REQUIRED");
  });
});

describe("state cookie の形", () => {
  it("encode → decode でもとにもどる。壊れた値は null", () => {
    const s = L.newOAuthState("link", "parent_123");
    expect(L.decodeOAuthState(L.encodeOAuthState(s))).toEqual(s);
    expect(L.newOAuthState("login", "parent_123").parentId).toBeNull();
    for (const bad of ["", "x", "login.a.b.c.-.1", "admin.aaaaaaaaaaaaaaaaaaaaaaaa.aaaaaaaaaaaaaaaaaaaaaaaa.aaaaaaaaaaaaaaaaaaaaaaaa.-.1", `login.${"a".repeat(30)}.${"a".repeat(30)}.${"a".repeat(30)}.-.NaN`]) {
      expect(L.decodeOAuthState(bad)).toBeNull();
    }
    expect(L.safeEqual("abc", "abcd")).toBe(false);
    expect(L.safeEqual("abc", "abc")).toBe(true);
    expect(L.safeEqual(undefined, "abc")).toBe(false);
  });

  it("署名つき: 書きかえた cookie・ほかの鍵で作った cookie・鍵が無いときは受け付けない（run4 Phase 4）", () => {
    const s = L.newOAuthState("login", null);
    const raw = L.encodeOAuthState(s);
    expect(raw.split(".")).toHaveLength(7);
    // mode を link にして、ほかの保護者の ID を入れる
    const parts = raw.split(".");
    parts[0] = "link";
    parts[4] = "victim_parent";
    expect(L.decodeOAuthState(parts.join("."))).toBeNull();
    // 署名を外した（前の形式）
    expect(L.decodeOAuthState(raw.split(".").slice(0, 6).join("."))).toBeNull();
    expect(L.decodeOAuthState(L.encodeOAuthState(s, "other-key"))).toBeNull();
    expect(L.decodeOAuthState(raw, null)).toBeNull();
    expect(() => L.encodeOAuthState(s, null)).toThrow();
  });
});

describe("ほかのサイトから始めさせない（run4 Phase 4）", () => {
  it("Sec-Fetch-Site が cross-site / same-site なら LINE へ行かず、cookie も作らない。same-origin・直接入力は通る", async () => {
    for (const site of ["cross-site", "same-site"]) {
      jar.clear();
      const res = await start.GET(new Request("http://localhost:3000/api/auth/line/start?mode=login", { headers: { "sec-fetch-site": site } }));
      expect(res.status).toBe(303);
      expect(path(res.headers.get("location")!)).toBe("/login");
      expect(jar.get(L.LINE_OAUTH_COOKIE)).toBeUndefined();
    }
    for (const site of ["same-origin", "none"]) {
      jar.clear();
      const res = await start.GET(new Request("http://localhost:3000/api/auth/line/start?mode=login", { headers: { "sec-fetch-site": site } }));
      expect(res.status).toBe(302);
      expect(oauthCookie()).not.toBeNull();
    }
  });

  it("書きかえた cookie（mode=link・自分の ID）では、暗証番号なしで連携できない", async () => {
    await registerEmail();
    const me = db.table("parent")[0];
    db.table("session")[0].pinVerifiedAt = null; // 暗証番号は入れていない（子どもが操作している）
    await get(start.GET, "http://localhost:3000/api/auth/line/start?mode=login");
    const raw = jar.get(L.LINE_OAUTH_COOKIE)!.value.split(".");
    raw[0] = "link";
    raw[4] = String(me.id);
    jar.set(L.LINE_OAUTH_COOKIE, raw.join("."));
    const cb = await get(callback.GET, `${ENV.LINE_LOGIN_CALLBACK_URL}?code=c&state=${raw[1]}`);
    expect(path(cb.location)).toBe("/login?line=state");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.table("parent")[0].lineUserId ?? null).toBeNull();
  });
});
