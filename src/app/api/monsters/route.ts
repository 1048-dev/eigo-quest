import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMonster } from "@/lib/game/monsters";
import { jsonOk, withOffline } from "@/lib/api/server";
import { offlineCollection } from "@/lib/offline";
import type { CollectionResponse } from "@/lib/api/contracts";

/** GET /api/monsters — 図鑑: 持っているモンスターと、コイン・レアガチャ券の数 */
export const GET = withOffline("monsters", async () => {
  const userId = await currentUserId();
  const [rows, user, rareTickets] = await Promise.all([
    prisma.userMonster.findMany({ where: { userId }, select: { monsterId: true, count: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { coins: true } }),
    prisma.gachaTicket.count({ where: { userId, kind: "RARE", usedAt: null } }),
  ]);
  // 今の図鑑（100体）にあるものだけ返す（古いモンスターIDは図鑑の数に入れない）
  const owned = rows.filter((r) => !!getMonster(r.monsterId)).map((r) => ({ id: r.monsterId, count: r.count }));
  return jsonOk({ owned, coins: user?.coins ?? 0, rareTickets } satisfies CollectionResponse);
}, () => offlineCollection());
