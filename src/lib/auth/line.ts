/**
 * LINE ログイン（OAuth 2.0 / OpenID Connect）— 保護者用。
 *
 * 流れ:
 *  1. /api/auth/line/start   … state・nonce・PKCE の code_verifier を作り、短い時間だけの httpOnly cookie に入れて
 *                               LINE の認可画面へ（bot_prompt=aggressive で公式アカウントの友だち追加もすすめる）
 *  2. /api/auth/line/callback … cookie の state と照合 → code をトークンに交換 → ID トークンを LINE の verify エンドポイントで検証
 *                               （署名・発行者・宛先・期限・nonce）。こちらでも iss / aud / exp / nonce / sub を確かめる（二重チェック）
 *
 * 環境変数（どれか1つでも無ければ LINE ログインは「未設定」= ボタンを出さない）:
 *   LINE_LOGIN_CHANNEL_ID, LINE_LOGIN_CHANNEL_SECRET, LINE_LOGIN_CALLBACK_URL
 * キーはコードに書かない。ログにトークン・コード・シークレットを出さない。
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
export const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
export const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";
export const LINE_ISSUER = "https://access.line.me";

/** state などを入れておく cookie（LINE の画面から戻ってくるまでの 10分だけ） */
export const LINE_OAUTH_COOKIE = "eq_line_oauth";
export const LINE_OAUTH_TTL_MS = 10 * 60_000;
const COOKIE_PATH = "/api/auth/line";
const FETCH_TIMEOUT_MS = 10_000;

export type LineMode = "login" | "link";

export interface LineConfig {
  channelId: string;
  channelSecret: string;
  callbackUrl: string;
}

/** 環境変数がそろっていれば設定、無ければ null（= LINE ログインを使わない） */
export function lineLoginConfig(env: Record<string, string | undefined> = process.env): LineConfig | null {
  const channelId = env.LINE_LOGIN_CHANNEL_ID?.trim();
  const channelSecret = env.LINE_LOGIN_CHANNEL_SECRET?.trim();
  const callbackUrl = env.LINE_LOGIN_CALLBACK_URL?.trim();
  if (!channelId || !channelSecret || !callbackUrl) return null;
  try {
    const u = new URL(callbackUrl);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  } catch {
    return null;
  }
  return { channelId, channelSecret, callbackUrl };
}

export function isLineLoginConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return lineLoginConfig(env) !== null;
}

// ---------------------------------------------------------------------------
// state / nonce / PKCE と cookie
// ---------------------------------------------------------------------------
export interface LineOAuthState {
  mode: LineMode;
  state: string;
  nonce: string;
  codeVerifier: string;
  /** link のときだけ: 連携を始めた保護者（戻ってきたときに同じ保護者か確かめる） */
  parentId: string | null;
  expiresAt: number;
}

const TOKEN_RE = /^[A-Za-z0-9_-]{20,128}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

function rand(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function newOAuthState(mode: LineMode, parentId: string | null, now = Date.now()): LineOAuthState {
  return { mode, state: rand(), nonce: rand(), codeVerifier: rand(48), parentId: mode === "link" ? parentId : null, expiresAt: now + LINE_OAUTH_TTL_MS };
}

/** cookie の署名に使う鍵（LINE ログインのチャネルシークレット）。未設定なら署名できない = cookie を受け付けない */
function cookieKey(): string | null {
  return lineLoginConfig()?.channelSecret ?? null;
}

function sign(body: string, key: string): string {
  return createHmac("sha256", key).update(`eq-line-oauth:${body}`).digest("base64url");
}

/**
 * cookie の値（すべて base64url なので "." でつなぐ）+ HMAC 署名。
 * 署名があるので、ブラウザで cookie を書きかえても（mode=link・parentId など）受け付けない。
 */
export function encodeOAuthState(s: LineOAuthState, key: string | null = cookieKey()): string {
  if (!key) throw new Error("LINE login is not configured");
  const body = [s.mode, s.state, s.nonce, s.codeVerifier, s.parentId ?? "-", String(s.expiresAt)].join(".");
  return `${body}.${sign(body, key)}`;
}

export function decodeOAuthState(raw: string | undefined | null, key: string | null = cookieKey()): LineOAuthState | null {
  if (!raw || !key || raw.length > 1024) return null;
  const parts = raw.split(".");
  if (parts.length !== 7) return null;
  const mac = parts.pop()!;
  if (!safeEqual(mac, sign(parts.join("."), key))) return null;
  const [mode, state, nonce, codeVerifier, parentId, exp] = parts;
  if (mode !== "login" && mode !== "link") return null;
  if (![state, nonce, codeVerifier].every((x) => TOKEN_RE.test(x))) return null;
  if (parentId !== "-" && !ID_RE.test(parentId)) return null;
  const expiresAt = Number(exp);
  if (!Number.isSafeInteger(expiresAt)) return null;
  return { mode, state, nonce, codeVerifier, parentId: parentId === "-" ? null : parentId, expiresAt };
}

export function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

/** 長さが違っても例外にしない、時間一定の文字列比較 */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function oauthCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // LINE の画面からのトップレベルの GET（リダイレクト）では Lax の cookie も送られる
    sameSite: "lax" as const,
    path: COOKIE_PATH,
    maxAge: maxAgeSec,
  };
}

export async function writeOAuthCookie(s: LineOAuthState): Promise<void> {
  (await cookies()).set(LINE_OAUTH_COOKIE, encodeOAuthState(s), oauthCookieOptions(Math.floor(LINE_OAUTH_TTL_MS / 1000)));
}

/** 読んだら必ず消す（同じ state を2回使わせない） */
export async function takeOAuthCookie(): Promise<LineOAuthState | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(LINE_OAUTH_COOKIE)?.value;
    jar.set(LINE_OAUTH_COOKIE, "", oauthCookieOptions(0));
    return decodeOAuthState(raw);
  } catch {
    return null;
  }
}

export function authorizeUrl(cfg: LineConfig, s: LineOAuthState): string {
  const u = new URL(LINE_AUTHORIZE_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", cfg.channelId);
  u.searchParams.set("redirect_uri", cfg.callbackUrl);
  u.searchParams.set("state", s.state);
  u.searchParams.set("scope", "profile openid");
  u.searchParams.set("nonce", s.nonce);
  u.searchParams.set("code_challenge", codeChallenge(s.codeVerifier));
  u.searchParams.set("code_challenge_method", "S256");
  // ログインのついでに 公式アカウント（月ごとのレポートを送る）を友だち追加してもらう
  u.searchParams.set("bot_prompt", "aggressive");
  return u.toString();
}

// ---------------------------------------------------------------------------
// コールバック: code → ID トークン → 検証
// ---------------------------------------------------------------------------
export type LineFailReason =
  | "STATE_MISMATCH" // cookie が無い・期限切れ・state が違う
  | "TOKEN_EXCHANGE_FAILED"
  | "NONCE_MISMATCH"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN";

export class LineAuthError extends Error {
  constructor(public readonly reason: LineFailReason) {
    super(reason);
    this.name = "LineAuthError";
  }
}

export interface LineIdentity {
  lineUserId: string;
  displayName: string | null;
}

type Fetch = typeof fetch;

async function postForm(fetchImpl: Fetch, url: string, form: Record<string, string>): Promise<{ status: number; json: Record<string, unknown> | null }> {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form).toString(),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  let json: Record<string, unknown> | null = null;
  try {
    const v = (await res.json()) as unknown;
    json = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

/** cookie と、LINE から戻ってきた state を照合（期限も見る） */
export function checkState(saved: LineOAuthState | null, returnedState: string | null, now = Date.now()): LineOAuthState {
  if (!saved || !returnedState || saved.expiresAt <= now || !safeEqual(saved.state, returnedState)) {
    throw new LineAuthError("STATE_MISMATCH");
  }
  return saved;
}

/** code を ID トークンに交換する */
export async function exchangeCode(cfg: LineConfig, code: string, codeVerifier: string, fetchImpl: Fetch = fetch): Promise<string> {
  if (!code || code.length > 512) throw new LineAuthError("TOKEN_EXCHANGE_FAILED");
  let r: Awaited<ReturnType<typeof postForm>>;
  try {
    r = await postForm(fetchImpl, LINE_TOKEN_URL, {
      grant_type: "authorization_code",
      code,
      redirect_uri: cfg.callbackUrl,
      client_id: cfg.channelId,
      client_secret: cfg.channelSecret,
      code_verifier: codeVerifier,
    });
  } catch {
    throw new LineAuthError("TOKEN_EXCHANGE_FAILED");
  }
  const idToken = r.json?.id_token;
  if (r.status !== 200 || typeof idToken !== "string" || !idToken) throw new LineAuthError("TOKEN_EXCHANGE_FAILED");
  return idToken;
}

/**
 * ID トークンを LINE の verify エンドポイントで検証し（署名・iss・aud・exp・nonce は LINE がしらべる）、
 * 戻ってきた中身もこちらで確かめる。
 */
export async function verifyIdToken(cfg: LineConfig, idToken: string, nonce: string, fetchImpl: Fetch = fetch, now = Date.now()): Promise<LineIdentity> {
  let r: Awaited<ReturnType<typeof postForm>>;
  try {
    r = await postForm(fetchImpl, LINE_VERIFY_URL, { id_token: idToken, client_id: cfg.channelId, nonce });
  } catch {
    throw new LineAuthError("INVALID_TOKEN");
  }
  const p = r.json;
  if (r.status !== 200 || !p) {
    const desc = String(p?.error_description ?? "").toLowerCase();
    if (desc.includes("expired")) throw new LineAuthError("TOKEN_EXPIRED");
    if (desc.includes("nonce")) throw new LineAuthError("NONCE_MISMATCH");
    throw new LineAuthError("INVALID_TOKEN");
  }
  if (p.iss !== LINE_ISSUER) throw new LineAuthError("INVALID_TOKEN");
  const aud = Array.isArray(p.aud) ? p.aud : [p.aud];
  if (!aud.includes(cfg.channelId)) throw new LineAuthError("INVALID_TOKEN");
  if (typeof p.exp !== "number" || p.exp * 1000 <= now) throw new LineAuthError("TOKEN_EXPIRED");
  if (typeof p.nonce !== "string" || !safeEqual(p.nonce, nonce)) throw new LineAuthError("NONCE_MISMATCH");
  const sub = p.sub;
  if (typeof sub !== "string" || !/^U[0-9a-f]{32}$/i.test(sub)) throw new LineAuthError("INVALID_TOKEN");
  const name = typeof p.name === "string" ? p.name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100) : "";
  return { lineUserId: sub, displayName: name || null };
}

/** コールバックの検証をまとめて行う */
export async function completeLineLogin(
  cfg: LineConfig,
  saved: LineOAuthState | null,
  query: { code: string | null; state: string | null },
  fetchImpl: Fetch = fetch,
  now = Date.now(),
): Promise<{ oauth: LineOAuthState; identity: LineIdentity }> {
  const oauth = checkState(saved, query.state, now);
  const idToken = await exchangeCode(cfg, query.code ?? "", oauth.codeVerifier, fetchImpl);
  const identity = await verifyIdToken(cfg, idToken, oauth.nonce, fetchImpl, now);
  return { oauth, identity };
}

/**
 * LINE から戻ったあとの行き先（画面のパス）。
 * LINE_LOGIN_CALLBACK_URL のオリジン（= 公開されている URL）を使う。プロキシの後ろでも正しい URL になる。
 */
export function appUrl(cfg: LineConfig | null, path: string, req: Request): URL {
  return new URL(path, cfg ? new URL(cfg.callbackUrl).origin : req.url);
}

/**
 * 画面へ戻す（303 = 次は GET。キャッシュさせない・code の入った URL を Referer に出さない）。
 * cookies() で書いた cookie（セッション・state の削除）は Next.js がこの応答に付けてくれる。
 */
export function lineRedirect(cfg: LineConfig | null, path: string, req: Request): Response {
  return new Response(null, {
    status: 303,
    headers: { location: appUrl(cfg, path, req).toString(), "cache-control": "no-store", "referrer-policy": "no-referrer" },
  });
}

/** 失敗の理由 → 画面に渡す短いコード（?line=...） */
export const LINE_REASON_QUERY: Record<LineFailReason, string> = {
  STATE_MISMATCH: "state",
  TOKEN_EXCHANGE_FAILED: "error",
  NONCE_MISMATCH: "nonce",
  TOKEN_EXPIRED: "expired",
  INVALID_TOKEN: "error",
};
