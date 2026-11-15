import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStageMap } from "@/lib/services/progressService";
import { jsonOk, withApi } from "@/lib/api/server";
import type { MapResponse } from "@/lib/api/contracts";

/** GET /api/map — ぼうけんマップのステージ状態 + ユーザーのコイン/連続日数 */
export const GET = withApi("map", async () => {
  const userId = await currentUserId();
  const [map, user] = await Promise.all([
    getStageMap(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { nickname: true, coins: true, streakDays: true } }),
  ]);
  return jsonOk({ nodes: map.nodes, current: map.current, arenas: map.arenas, user } satisfies MapResponse);
});
