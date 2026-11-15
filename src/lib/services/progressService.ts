import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDashboard(userId: string = "demo-user") {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  }) ?? {
    nickname: "ゲスト",
    coins: 0,
    streakDays: 0,
    longestStreak: 0,
    lastStudyDate: null,
  };

  const todayStr = new Date().toISOString().split("T")[0];
  
  const responses = await prisma.itemResponse.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const todayResponses = responses.filter(r => r.createdAt.toISOString().startsWith(todayStr));

  return {
    user: {
      nickname: user.nickname,
      coins: user.coins,
      streakDays: user.streakDays,
      longestStreak: user.longestStreak,
      lastStudyDate: user.lastStudyDate,
    },
    todayStats: {
      count: todayResponses.length,
      correctCount: todayResponses.filter(r => r.correct).length,
    },
    weakest: [],
    history: [],
  };
}