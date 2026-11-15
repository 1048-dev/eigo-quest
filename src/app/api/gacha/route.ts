import monsters from "@content/curriculum/monsters.json";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GACHA_RULES } from "@/lib/domain/config";
import { rollMonster, type MonsterDef } from "@/lib/domain/gacha";
import { jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import type { GachaResponse } from "@/lib/api/contracts";

/** POST /api/gacha  body: { useRareTicket?: boolean } — コイン（またはレア券）でガチャを1回 */
export const POST = withApi("gacha", async (req) => {
  const userId = await currentUserId();
  const body = (await readJsonBody(req)) as { useRareTicket?: unknown };
  const useRareTicket = body?.useRareTicket === true;

  const result: GachaResponse = await prisma.$transaction(async (tx) => {
    let kind: "NORMAL" | "RARE" = "NORMAL";
    if (useRareTicket) {
      const ticket = await tx.gachaTicket.findFirst({ where: { userId, kind: "RARE", usedAt: null } });
      if (!ticket) return { ok: false, monster: null, reasonJa: "レアガチャ券がないよ" };
      await tx.gachaTicket.update({ where: { id: ticket.id }, data: { usedAt: new Date() } });
      kind = "RARE";
    } else {
      const u = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (u.coins < GACHA_RULES.normalCost) return { ok: false, monster: null, reasonJa: "コインがたりないよ。アリーナでかせごう！" };
      await tx.coinLedger.create({ data: { userId, amount: -GACHA_RULES.normalCost, reason: "GACHA_SPEND", refType: "gacha", idempotencyKey: `gacha:${userId}:${Date.now()}` } });
      await tx.user.update({ where: { id: userId }, data: { coins: { decrement: GACHA_RULES.normalCost } } });
    }
    const m = rollMonster(monsters.monsters as MonsterDef[], kind, Math.random);
    await tx.userMonster.upsert({ where: { userId_monsterId: { userId, monsterId: m.id } }, create: { userId, monsterId: m.id }, update: { count: { increment: 1 } } });
    return { ok: true, monster: m, reasonJa: "" };
  });
  return jsonOk(result, result.ok ? 200 : 400);
});
