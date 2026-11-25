import { requireParentArea } from "@/lib/auth";
import { authFail, authOk, parseBody, withAuthApi } from "@/lib/auth/api";
import { LineMonthlyRequestSchema } from "@/lib/api/contracts";
import { getLineMonthlyStatus, sendNowForParent, setLineMonthlyEnabled } from "@/lib/services/monthlyDeliveryService";

export const runtime = "nodejs";
/** はじめてのワールドのワークシートを作るときは 数十秒かかることがある */
export const maxDuration = 120;

/** GET /api/parent/line-monthly — 毎月の LINE レポートの設定と状態（おうちの方エリア） */
export const GET = withAuthApi("line-monthly-get", async () => {
  const ctx = await requireParentArea();
  return authOk({ status: await getLineMonthlyStatus(ctx.parent.id) });
});

/** PATCH /api/parent/line-monthly { enabled } — 毎月の配信のオン/オフ */
export const PATCH = withAuthApi("line-monthly-patch", async (req) => {
  const ctx = await requireParentArea();
  const parsed = await parseBody(req, LineMonthlyRequestSchema);
  if (!parsed.success) return authFail("入力内容を確認してください。", 400, "INVALID_INPUT");
  await setLineMonthlyEnabled(ctx.parent.id, parsed.data.enabled);
  return authOk({
    status: await getLineMonthlyStatus(ctx.parent.id),
    messageJa: parsed.data.enabled ? "毎月の学習レポートを LINE でお届けします。" : "毎月の LINE での配信を止めました。",
  });
});

/**
 * POST /api/parent/line-monthly — 「今月のPDFを今すぐ送る」（今月のここまでの分）。
 * 回数制限: 前回から10分・24時間に3回まで（429）。LINE の送信が未設定なら dry-run（outbox に書き、リンクを返す）。
 */
export const POST = withAuthApi("line-monthly-send", async () => {
  const ctx = await requireParentArea();
  const r = await sendNowForParent(ctx.parent.id);
  if (!r.ok) {
    switch (r.reason) {
      case "RATE_LIMITED": {
        const min = Math.max(1, Math.ceil(r.retryAfterSec / 60));
        const wait = min >= 60 ? `${Math.ceil(min / 60)}時間` : `${min}分`;
        return authFail(`送信の回数が多すぎます。${wait}ほど待ってからもう一度お試しください。`, 429, "RATE_LIMITED", { retryAfterSec: r.retryAfterSec });
      }
      case "BUSY":
        return authFail("ただいま準備しています。少し待ってからもう一度お試しください。", 409, "BUSY");
      case "NOT_LINKED":
        return authFail("先に LINE と連携してください。", 409, "NOT_LINKED");
      case "NOT_FRIEND":
        return authFail("LINE の公式アカウントが友だち追加されていない（またはブロックされている）ため送れません。友だち追加してからもう一度お試しください。", 409, "NOT_FRIEND");
      case "NO_CHILDREN":
        return authFail("お子さまが登録されていません。", 409, "NO_CHILDREN");
      default:
        return authFail("LINE に送れませんでした。時間をおいてもう一度お試しください。", 502, "SEND_FAILED");
    }
  }
  const status = await getLineMonthlyStatus(ctx.parent.id);
  if (r.result.status === "dry-run") {
    return authOk({
      status,
      dryRun: true,
      // いま開いているサイトで開けるよう、パスだけを返す（APP_BASE_URL が未設定でも動く）
      links: r.result.children.map((c) => ({ childName: c.childName, url: new URL(c.url).pathname })),
      messageJa: "LINE の送信はまだ設定されていないため、LINE には送っていません（下のリンクから PDF を確認できます）。",
    });
  }
  return authOk({ status, dryRun: false, links: [], messageJa: "LINE に今月の学習レポートを送りました。" });
});
