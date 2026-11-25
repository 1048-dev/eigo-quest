import { checkCronAuth, cronDenied, cronJson } from "@/lib/cron";
import { isDbUp } from "@/lib/db";
import { canPush, lineMessagingConfig } from "@/lib/line/messaging";
import { isValidMonth } from "@/lib/report/monthlyReport";
import { runMonthlyDelivery } from "@/lib/services/monthlyDeliveryService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Vercel の関数の最長時間（プランの上限より長いと その上限になる） */
export const maxDuration = 300;
/** この時間を すぎたら 次の保護者へ進まない（のこりは 次の実行で。送信ずみの子には二重に送らない） */
const TIME_BUDGET_MS = 240_000;

/**
 * GET /api/cron/line-monthly — 毎月の学習レポートを LINE で送る（Authorization: Bearer <CRON_SECRET>）。
 * vercel.json の crons で 毎月1〜3日の 9:00（日本時間）に呼ぶ。2日目・3日目は 送れなかった分（時間切れ・LINE のエラー）だけ送る。
 * ?month=YYYY-MM で月を指定できる（省略時は先月）。LINE の送信が設定されていなければ 何もしない。
 */
async function handle(req: Request): Promise<Response> {
  const auth = checkCronAuth(req);
  if (!auth.ok) return cronDenied(auth);
  const month = new URL(req.url).searchParams.get("month") ?? undefined;
  if (month !== undefined && !isValidMonth(month)) return cronJson({ ok: false, code: "INVALID_MONTH" }, 400);
  if (!canPush(lineMessagingConfig())) {
    console.log("[cron:line-monthly] LINE の送信が未設定のため 何もしません（LINE_MESSAGING_CHANNEL_ACCESS_TOKEN / APP_BASE_URL）");
    return cronJson({ ok: true, skipped: "LINE_NOT_CONFIGURED" });
  }
  if (!(await isDbUp())) return cronJson({ ok: false, code: "DB_UNAVAILABLE" }, 503);

  const started = Date.now();
  console.log(`[cron:line-monthly] はじめます${month ? `（${month}）` : ""}`);
  const summary = await runMonthlyDelivery({
    month,
    deadline: started + TIME_BUDGET_MS,
    onProgress: ({ done, total, last }) => console.log(`[cron:line-monthly] ${done}/${total} ${last.status}${last.reason ? ` (${last.reason.slice(0, 40)})` : ""}`),
  });
  const count: Record<string, number> = {};
  for (const r of summary.results) count[r.status] = (count[r.status] ?? 0) + 1;
  const sec = Math.round((Date.now() - started) / 1000);
  console.log(`[cron:line-monthly] おわり ${summary.month}: ${JSON.stringify(count)} のこり ${summary.remaining}（${sec}秒）`);
  return cronJson({
    ok: (count.failed ?? 0) === 0,
    month: summary.month,
    mode: summary.mode,
    counts: count,
    remaining: summary.remaining,
    purgedExpired: summary.purged,
    seconds: sec,
  });
}

export const GET = handle;
export const POST = handle;
