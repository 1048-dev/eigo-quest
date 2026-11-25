import { currentUserId } from "@/lib/auth";
import { getLibraryStatus } from "@/lib/services/libraryService";
import { jsonOk, withOffline } from "@/lib/api/server";
import { COIN_RULES } from "@/lib/domain/config";
import type { LibraryStatusResponse } from "@/lib/api/contracts";

/**
 * GET /api/library — えいごの としょかん の じょうたい（到達レッスン・きょうの ごほうび）。
 * DB が 止まっていれば offline:true（画面は この ブラウザの きろくで 解放を 決める）。
 */
export const GET = withOffline("library", async () => {
  const s = await getLibraryStatus(await currentUserId());
  return jsonOk({ ...s, dailyCoins: COIN_RULES.libraryDaily } satisfies LibraryStatusResponse);
}, () => ({ reachedLesson: 0, rewardedToday: false, coins: 0, dailyCoins: COIN_RULES.libraryDaily } satisfies LibraryStatusResponse));
