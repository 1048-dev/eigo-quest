import { currentUserId } from "@/lib/auth";
import { getRanking } from "@/lib/services/progressService";
import { jsonOk, withApi } from "@/lib/api/server";
import type { RankingResponse } from "@/lib/api/contracts";

/** GET /api/ranking?scope=national|friends&metric=coins|streak */
export const GET = withApi("ranking", async (req) => {
  const u = new URL(req.url);
  const scope = u.searchParams.get("scope") === "friends" ? "friends" : "national";
  const metric = u.searchParams.get("metric") === "streak" ? "streak" : "coins";
  const rows = await getRanking(await currentUserId(), scope, metric);
  return jsonOk({ scope, metric, rows: rows.map((r) => ({ rank: r.rank, userId: r.userId, nickname: r.nickname, value: r.value })) } satisfies RankingResponse);
});
