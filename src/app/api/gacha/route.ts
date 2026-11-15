import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GACHA_RULES } from "@/lib/domain/config";
import { rollMonster } from "@/lib/domain/gacha";
import { MONSTERS } from "@/lib/game/monsters";
import { jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import type { GachaResponse } from "@/lib/api/contracts";

/** POST /api/gacha  body: { useRareTicket?: boolean } — コイン（またはレア券）でガチャを1回。図鑑100体から出る */
export const POST = withApi("gacha", async (req) => {
  const userId = await currentUserId();
  const body = (await readJsonBody(req)) as { useRareTicket?: unknown };
  const useRareTicket = body?.useRareTicket === true;

  const result: GachaResponse = await prisma.$transaction(async (tx) => {
    const fail = async (reasonJa: string): Promise<GachaResponse> => {
      const u = await tx.user.findUnique({ where: { id: userId }, select: { coins: true } });
      const t = await tx.gachaTicket.count({ where: { userId, kind: "RARE", usedAt: null } });
      return { ok: false, monster: null, isNew: false, coins: u?.coins ?? 0, rareTickets: t, reasonJa };
    };
    let kind: "NORMAL" | "RARE" = "NORMAL";
    if (useRareTicket) {
      const ticket = await tx.gachaTicket.findFirst({ where: { userId, kind: "RARE", usedAt: null } });
      if (!ticket) return fail("レアガチャ券がないよ。ボスをたおすともらえるよ！");
      await tx.gachaTicket.update({ where: { id: ticket.id }, data: { usedAt: new Date() } });
      kind = "RARE";
    } else {
      const u = await tx.user.findUnique({ where: { id: userId } });
      if (!u) return fail("ユーザーが見つからないよ。");
      if (u.coins < GACHA_RULES.normalCost) return fail("コインがたりないよ。アリーナでかせごう！");
      await tx.coinLedger.create({ data: { userId, amount: -GACHA_RULES.normalCost, reason: "GACHA_SPEND", refType: "gacha", idempotencyKey: `gacha:${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}` } });
      await tx.user.update({ where: { id: userId }, data: { coins: { decrement: GACHA_RULES.normalCost } } });
    }
    const m = rollMonster(MONSTERS, kind, Math.random);
    // 図鑑のマスタがまだDBにない環境（seed前）でも動くよう、先に登録しておく
    await tx.monster.upsert({
      where: { id: m.id },
      create: { id: m.id, nameEn: m.nameEn, nameJa: m.nameJa, rarity: m.rarity, theme: m.theme, imageKey: m.imageKey },
      update: {},
    });
    const before = await tx.userMonster.findUnique({ where: { userId_monsterId: { userId, monsterId: m.id } } });
    await tx.userMonster.upsert({ where: { userId_monsterId: { userId, monsterId: m.id } }, create: { userId, monsterId: m.id }, update: { count: { increment: 1 } } });
    const u = await tx.user.findUnique({ where: { id: userId }, select: { coins: true } });
    const t = await tx.gachaTicket.count({ where: { userId, kind: "RARE", usedAt: null } });
    return {
      ok: true,
      monster: { id: m.id, nameEn: m.nameEn, nameJa: m.nameJa, rarity: m.rarity, theme: m.theme, imageKey: m.imageKey },
      isNew: !before,
      coins: u?.coins ?? 0,
      rareTickets: t,
      reasonJa: "",
    };
  });
  return jsonOk(result, result.ok ? 200 : 400);
});
