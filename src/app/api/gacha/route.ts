import { NextResponse } from "next/server";
import monsters from "@content/curriculum/monsters.json";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GACHA_RULES } from "@/lib/domain/config";
import { rollMonster, type MonsterDef } from "@/lib/domain/gacha";

/** POST /api/gacha  body: { useRareTicket?: boolean } — コイン（またはレア券）でガチャを1回 */
export async function POST(req: Request) {
  const userId = await currentUserId();
  const { useRareTicket } = (await req.json().catch(() => ({}))) as { useRareTicket?: boolean };

  const result = await prisma.$transaction(async (tx) => {
    let kind: "NORMAL" | "RARE" = "NORMAL";
    if (useRareTicket) {
      const ticket = await tx.gachaTicket.findFirst({ where: { userId, kind: "RARE", usedAt: null } });
      if (!ticket) return { ok: false as const, reasonJa: "レアガチャ券がないよ" };
      await tx.gachaTicket.update({ where: { id: ticket.id }, data: { usedAt: new Date() } });
      kind = "RARE";
    } else {
      const u = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (u.coins < GACHA_RULES.normalCost) return { ok: false as const, reasonJa: "コインがたりないよ。アリーナでかせごう！" };
      await tx.coinLedger.create({ data: { userId, amount: -GACHA_RULES.normalCost, reason: "GACHA_SPEND", refType: "gacha", idempotencyKey: `gacha:${userId}:${Date.now()}` } });
      await tx.user.update({ where: { id: userId }, data: { coins: { decrement: GACHA_RULES.normalCost } } });
    }
    const m = rollMonster(monsters.monsters as MonsterDef[], kind, Math.random);
    await tx.userMonster.upsert({ where: { userId_monsterId: { userId, monsterId: m.id } }, create: { userId, monsterId: m.id }, update: { count: { increment: 1 } } });
    return { ok: true as const, monster: m };
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
