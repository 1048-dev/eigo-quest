import { beginSession, currentParent } from "@/lib/auth";
import {
  completeLineLogin, LINE_REASON_QUERY, LineAuthError, lineLoginConfig, lineModeBackPath, lineRedirect, takeOAuthCookie,
  type LineConfig, type LineIdentity, type LineOAuthState,
} from "@/lib/auth/line";
import { clientIp, registerLimiter } from "@/lib/auth/rateLimit";
import { isDbConnectionError } from "@/lib/api/server";
import { isDbUp, markDbDown, prisma } from "@/lib/db";
import { createLineParent, findParentByLineUserId, linkLine } from "@/lib/services/parentService";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/line/callback?code=...&state=...  （LINE の画面から戻ってくる）
 *  1. cookie の state と照合（違う・cookie が無い・期限切れ → やり直し）
 *  2. code を ID トークンに交換 → LINE の verify エンドポイントで検証（nonce・期限・宛先も確認）
 *  3. login: 連携ずみの保護者ならログイン。初めての LINE なら保護者を作ってログイン → 暗証番号を決める画面へ
 *     link : 始めたときと同じ保護者がログイン中なら連携（ほかの保護者に連携ずみの LINE は不可）
 * どんな結果でも画面（/login・/parent・/who・/setup-pin）に戻す。ログにトークン・code は出さない。
 */
export async function GET(req: Request) {
  const cfg = lineLoginConfig();
  const saved = await takeOAuthCookie();
  const back = lineModeBackPath(saved?.mode);
  if (!cfg) return lineRedirect(null, `${back}?line=not_configured`, req);

  const q = new URL(req.url).searchParams;
  // 保護者が LINE の画面で「キャンセル」した（error=access_denied など）
  if (q.get("error")) return lineRedirect(cfg, `${back}?line=canceled`, req);

  try {
    if (!(await isDbUp())) return lineRedirect(cfg, `${back}?line=offline`, req);
    const { oauth, identity } = await completeLineLogin(cfg, saved, { code: q.get("code"), state: q.get("state") });
    if (oauth.mode === "link") return await finishLink(cfg, req, oauth, identity);
    if (oauth.mode === "reauth") return await finishReauth(cfg, req, oauth, identity);
    return await finishLogin(cfg, req, identity);
  } catch (e) {
    if (e instanceof LineAuthError) {
      console.warn(`[auth:line-callback] ${e.reason}`);
      return lineRedirect(cfg, `${back}?line=${LINE_REASON_QUERY[e.reason]}`, req);
    }
    if (isDbConnectionError(e)) {
      markDbDown();
      return lineRedirect(cfg, `${back}?line=offline`, req);
    }
    const err = e as { name?: string; code?: string } | null;
    console.error(`[auth:line-callback] ${err?.name ?? "Error"}${err?.code ? ` (${err.code})` : ""}`);
    return lineRedirect(cfg, `${back}?line=error`, req);
  }
}

async function finishLogin(cfg: LineConfig, req: Request, identity: LineIdentity): Promise<Response> {
  const existing = await findParentByLineUserId(identity.lineUserId);
  if (existing) {
    await beginSession(existing.id);
    return lineRedirect(cfg, existing.hasPin ? "/who" : "/setup-pin", req);
  }
  // 新しい保護者を作る（メールの登録と同じく、同じ IP からの登録回数を制限）
  const limit = await registerLimiter.hit(clientIp(req));
  if (!limit.ok) return lineRedirect(cfg, "/login?line=rate_limited", req);
  const created = await createLineParent(identity);
  await beginSession(created.id);
  return lineRedirect(cfg, created.hasPin ? "/who" : "/setup-pin", req);
}

/**
 * 「暗証番号を忘れた」の本人確認: 始めた保護者が まだログイン中で、戻ってきた LINE が その保護者に連携ずみの LINE と同じなら、
 * この端末のセッションに しるし（lineReauthAt）を付ける → 10分以内なら 新しい暗証番号を決められる。
 */
async function finishReauth(cfg: LineConfig, req: Request, oauth: LineOAuthState, identity: LineIdentity): Promise<Response> {
  const ctx = await currentParent();
  if (!ctx || !oauth.parentId || ctx.parent.id !== oauth.parentId) return lineRedirect(cfg, "/login?line=not_logged_in", req);
  if (!ctx.parent.lineUserId || ctx.parent.lineUserId !== identity.lineUserId) return lineRedirect(cfg, "/forgot-pin?line=reauth_mismatch", req);
  await prisma.session.update({ where: { id: ctx.session.id }, data: { lineReauthAt: new Date() } });
  return lineRedirect(cfg, "/forgot-pin?line=reauth_ok", req);
}

async function finishLink(cfg: LineConfig, req: Request, oauth: LineOAuthState, identity: LineIdentity): Promise<Response> {
  const ctx = await currentParent();
  // 始めた保護者と、いまログインしている保護者が違う（途中でログアウト・別の人がログイン）→ 連携しない
  if (!ctx || !oauth.parentId || ctx.parent.id !== oauth.parentId) return lineRedirect(cfg, "/login?line=not_logged_in", req);
  const r = await linkLine(ctx.parent.id, identity);
  if (r.ok) return lineRedirect(cfg, "/parent?line=linked", req);
  if (r.reason === "ALREADY_LINKED_OTHER") return lineRedirect(cfg, "/parent?line=already_linked", req);
  if (r.reason === "HAS_OTHER_LINE") return lineRedirect(cfg, "/parent?line=has_other_line", req);
  return lineRedirect(cfg, "/login?line=not_logged_in", req);
}
