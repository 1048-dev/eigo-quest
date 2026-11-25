import { currentUserId } from "@/lib/auth";
import { getYearlyStatus } from "@/lib/services/yearlyService";
import { jsonOk, withOffline } from "@/lib/api/server";
import type { YearlyStatusResponse } from "@/lib/api/contracts";

/**
 * GET /api/yearly — 力だめしの じょうたい（受ける ステージ・受けられるか・これまでの 結果）。
 * DB が 止まっていれば offline:true（画面は この ブラウザの きろくで きめる・おためしは 1 回）。
 */
export const GET = withOffline("yearly", async () => {
  const s = await getYearlyStatus(await currentUserId());
  return jsonOk({ ...s } satisfies YearlyStatusResponse);
}, () => ({ stage: 1, reachedLesson: 0, isTrial: true, availability: { available: true }, history: [] } satisfies YearlyStatusResponse));
