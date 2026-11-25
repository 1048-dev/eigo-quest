import { purgeExpiredRateLimits } from "@/lib/auth/rateLimit";
import { checkCronAuth, cronDenied, cronJson } from "@/lib/cron";
import { isDbUp } from "@/lib/db";
import { cleanupStaleTrialLearners } from "@/lib/services/trialCleanupService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const TIME_BUDGET_MS = 240_000;

/**
 * GET /api/cron/trial-cleanup — 毎日のそうじ（Authorization: Bearer <CRON_SECRET>）。
 *  - 60日 あそばれていない おためし学習者を 学習記録ごと消す（時間切れなら とちゅうで やめて 次の日に つづき）
 *  - 期限の切れた レート制限の行を消す
 */
async function handle(req: Request): Promise<Response> {
  const auth = checkCronAuth(req);
  if (!auth.ok) return cronDenied(auth);
  if (!(await isDbUp())) return cronJson({ ok: false, code: "DB_UNAVAILABLE" }, 503);
  const started = Date.now();
  console.log("[cron:trial-cleanup] はじめます");
  const r = await cleanupStaleTrialLearners({
    deadline: started + TIME_BUDGET_MS,
    onProgress: ({ done, total }) => console.log(`[cron:trial-cleanup] ${done}/${total} 人`),
  });
  let rateLimitRows = 0;
  try {
    rateLimitRows = await purgeExpiredRateLimits();
  } catch (e) {
    console.warn(`[cron:trial-cleanup] レート制限の そうじに失敗（${(e as Error)?.name ?? "Error"}）`);
  }
  const sec = Math.round((Date.now() - started) / 1000);
  console.log(`[cron:trial-cleanup] おわり: ${r.deleted}/${r.candidates} 人を消しました${r.timedOut ? "（時間切れ・のこりは次回）" : ""}・レート制限 ${rateLimitRows} 行（${sec}秒）`);
  return cronJson({ ok: true, trialCandidates: r.candidates, trialDeleted: r.deleted, timedOut: r.timedOut, rateLimitRowsPurged: rateLimitRows, seconds: sec });
}

export const GET = handle;
export const POST = handle;
