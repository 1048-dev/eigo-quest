/**
 * 「きょうのまとめ」動画のサービス層。
 *  - 完了したレッスンかどうかの判定（見られるかどうか）
 *  - 最後まで見たごほうび（1日1回・5コイン）。idempotencyKey = "<userId>:recap:<日付>" で同じ日の二重付与を防ぐ
 * DB が動いていないときは呼び出し側（ルート / ページ）で例外をひろって「コインなしで成功」にする。
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { localDate } from "@/lib/domain/dates";
import { rewardForRecap } from "@/lib/domain/coins";

/** CoinLedger.idempotencyKey は全ユーザーで一意なので userId を入れる */
export const recapIdempotencyKey = (userId: string, today: string) => `${userId}:recap:${today}`;

/** レッスンが完了済みか（DB エラーは例外のまま投げる） */
export async function isLessonCompleted(userId: string, lessonNo: number): Promise<boolean> {
  const row = await prisma.lessonProgress.findUnique({ where: { userId_lessonNo: { userId, lessonNo } } });
  return row?.status === "COMPLETED";
}

export type RecapWatchedResult =
  | { status: "AWARDED"; coins: number; labelJa: string }
  | { status: "ALREADY_TODAY" }
  | { status: "NOT_COMPLETED" };

export async function recordRecapWatched(userId: string, lessonNo: number, now = new Date()): Promise<RecapWatchedResult> {
  if (!(await isLessonCompleted(userId, lessonNo))) return { status: "NOT_COMPLETED" };
  const today = localDate(now);
  const key = recapIdempotencyKey(userId, today);
  const existing = await prisma.coinLedger.findUnique({ where: { idempotencyKey: key } });
  const reward = rewardForRecap({ alreadyRewardedToday: existing != null });
  const coin = reward.coins[0];
  if (!coin) return { status: "ALREADY_TODAY" };
  try {
    await prisma.$transaction(async (tx) => {
      await tx.coinLedger.create({
        data: { userId, amount: coin.amount, reason: coin.reason, multiplier: coin.multiplier, refType: "recap", refId: `${lessonNo}`, idempotencyKey: key },
      });
      await tx.user.update({ where: { id: userId }, data: { coins: { increment: reward.total }, totalCoinsEarned: { increment: reward.total } } });
    });
  } catch (e) {
    // 同時に2回送られた（ユニーク制約違反）→ もう今日の分はもらっている
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { status: "ALREADY_TODAY" };
    throw e;
  }
  return { status: "AWARDED", coins: reward.total, labelJa: coin.labelJa };
}
