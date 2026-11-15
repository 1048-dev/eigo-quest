import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStageMap } from "@/lib/services/progressService";

/** GET /api/map — ポケモン風マップのステージ状態 + ユーザーのコイン/連続日数 */
export async function GET() {
  const userId = await currentUserId();
  const [map, user] = await Promise.all([
    getStageMap(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { nickname: true, coins: true, streakDays: true, avatar: true } }),
  ]);
  return NextResponse.json({ ...map, user });
}
