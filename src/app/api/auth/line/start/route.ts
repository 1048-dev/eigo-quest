import { currentParent } from "@/lib/auth";
import { isPinUnlocked } from "@/lib/auth/session";
import { authorizeUrl, lineLoginConfig, lineRedirect, newOAuthState, writeOAuthCookie, type LineMode } from "@/lib/auth/line";
import { isDbUp } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/line/start?mode=login|link
 *  - login: LINE でログイン（まだ連携していない LINE なら新しく登録）
 *  - link : ログイン中の保護者（暗証番号を入力ずみ）に LINE を連携する
 * state・nonce・PKCE を cookie に入れて LINE の認可画面へ移動する。
 * LINE が未設定・DB 停止のときは、元の画面にメッセージつきで戻す。
 */
export async function GET(req: Request) {
  const cfg = lineLoginConfig();
  const mode: LineMode = new URL(req.url).searchParams.get("mode") === "link" ? "link" : "login";
  const back = mode === "link" ? "/parent" : "/login";
  if (!cfg) return lineRedirect(null, `${back}?line=not_configured`, req);
  // ほかのサイトからのリンク・自動の移動では始めない（LINE アプリ内では同意画面なしでログインが終わることがあり、
  // 知らないうちに別のアカウントに切りかわる・アカウントが作られるのを防ぐ）。こちらの画面のボタンは same-origin
  const site = req.headers.get("sec-fetch-site");
  if (site === "cross-site" || site === "same-site") return lineRedirect(cfg, back, req);
  try {
    if (!(await isDbUp())) return lineRedirect(cfg, `${back}?line=offline`, req);
    let parentId: string | null = null;
    if (mode === "link") {
      const ctx = await currentParent();
      if (!ctx) return lineRedirect(cfg, "/login?line=not_logged_in", req);
      // 連携は「おうちの方」エリアの操作（子どもが勝手に自分の LINE をつながないように）
      if (!ctx.parent.pinHash || !isPinUnlocked(ctx.session)) return lineRedirect(cfg, "/parent?line=pin_required", req);
      if (ctx.parent.lineUserId) return lineRedirect(cfg, "/parent?line=has_other_line", req);
      parentId = ctx.parent.id;
    }
    const oauth = newOAuthState(mode, parentId);
    await writeOAuthCookie(oauth);
    return new Response(null, {
      status: 302,
      headers: { location: authorizeUrl(cfg, oauth), "cache-control": "no-store", "referrer-policy": "no-referrer" },
    });
  } catch (e) {
    console.error(`[auth:line-start] ${(e as { name?: string } | null)?.name ?? "Error"}`);
    return lineRedirect(cfg, `${back}?line=error`, req);
  }
}
