import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { getDashboard } from "@/lib/services/progressService";
import { jsonOk, withApi } from "@/lib/api/server";
import type { DashboardResponse } from "@/lib/api/contracts";

/** GET /api/dashboard — リアルタイム習得率（6軸 + 総合 + 進捗 + 推移 + にがて項目）+ ステータスボード用のユーザー情報 */
export const GET = withApi("dashboard", async () => {
  const userId = await currentUserId();
  const [d, user] = await Promise.all([
    getDashboard(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { nickname: true, coins: true, streakDays: true } }),
  ]);
  return jsonOk({
    user,
    scores: d.scores,
    overall: d.overall,
    coverage: d.coverage,
    lessonsCompleted: d.lessonsCompleted,
    totalLessons: TOTAL_LESSONS,
    weakest: d.weakest.filter((w): w is NonNullable<typeof w> => !!w),
    history: d.history.map((h) => ({ date: h.date, overall: h.overall })),
  } satisfies DashboardResponse);
});
