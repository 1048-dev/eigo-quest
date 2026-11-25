/**
 * えいごの としょかん の サービス層（DB）。
 *  - 到達レッスン（クリアした いちばん先の レッスン）→ 解放の 判定
 *  - 1日1回の ごほうび（5コイン）。idempotencyKey = "<userId>:library:<日付>" で 同じ日の 二重付与を 防ぐ
 * DB が 動いていない ときは 呼び出し側（ルート）で 例外を ひろって「コインなしで 成功」にする。
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { localDate } from "@/lib/domain/dates";
import { rewardForLibrary } from "@/lib/domain/coins";
import { loadStory, metaOf } from "@/lib/library/catalog";
import { isActivityComplete, isItemUnlocked, type LibraryActivity } from "@/lib/library/rules";

export const libraryIdempotencyKey = (userId: string, today: string) => `${userId}:library:${today}`;

/** クリアした いちばん先の レッスン番号（なにも なければ 0） */
export async function getReachedLesson(userId: string): Promise<number> {
  const row = await prisma.lessonProgress.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { lessonNo: "desc" },
    select: { lessonNo: true },
  });
  return row?.lessonNo ?? 0;
}

export async function isLibraryRewardedToday(userId: string, now = new Date()): Promise<boolean> {
  const row = await prisma.coinLedger.findUnique({ where: { idempotencyKey: libraryIdempotencyKey(userId, localDate(now)) }, select: { id: true } });
  return row != null;
}

export interface LibraryStatus {
  reachedLesson: number;
  rewardedToday: boolean;
  coins: number;
}

export async function getLibraryStatus(userId: string, now = new Date()): Promise<LibraryStatus> {
  const [reachedLesson, rewardedToday, user] = await Promise.all([
    getReachedLesson(userId),
    isLibraryRewardedToday(userId, now),
    prisma.user.findUnique({ where: { id: userId }, select: { coins: true } }),
  ]);
  return { reachedLesson, rewardedToday, coins: user?.coins ?? 0 };
}

export type LibraryRewardResult =
  | { status: "AWARDED"; coins: number; labelJa: string }
  | { status: "ALREADY_TODAY" }
  | { status: "NOT_COMPLETE" }
  | { status: "LOCKED"; unlockLesson: number }
  | { status: "NOT_FOUND" };

/** としょかんで やりきった → きょう はじめてなら 5コイン。採点・解放の 判定は サーバーで やりなおす（ブラウザの 申告を 信じない） */
export async function claimLibraryReward(userId: string, activity: LibraryActivity, now = new Date()): Promise<LibraryRewardResult> {
  const meta = metaOf(activity.kind, activity.id);
  if (!meta) return { status: "NOT_FOUND" };
  const reached = await getReachedLesson(userId);
  if (!isItemUnlocked(activity.kind, meta, reached)) return { status: "LOCKED", unlockLesson: meta.unlockLesson };
  const story = activity.kind === "story" ? await loadStory(activity.id) : null;
  if (!isActivityComplete(activity, story)) return { status: "NOT_COMPLETE" };

  const key = libraryIdempotencyKey(userId, localDate(now));
  const existing = await prisma.coinLedger.findUnique({ where: { idempotencyKey: key }, select: { id: true } });
  const reward = rewardForLibrary({ completed: true, alreadyRewardedToday: existing != null });
  const coin = reward.coins[0];
  if (!coin) return { status: "ALREADY_TODAY" };
  try {
    await prisma.$transaction(async (tx) => {
      await tx.coinLedger.create({
        data: { userId, amount: coin.amount, reason: coin.reason, multiplier: coin.multiplier, refType: `library-${activity.kind}`, refId: activity.id, idempotencyKey: key },
      });
      await tx.user.update({ where: { id: userId }, data: { coins: { increment: reward.total }, totalCoinsEarned: { increment: reward.total } } });
    });
  } catch (e) {
    // 同時に 2回 送られた（ユニーク制約違反）→ もう きょうの 分は もらっている
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { status: "ALREADY_TODAY" };
    throw e;
  }
  return { status: "AWARDED", coins: reward.total, labelJa: coin.labelJa };
}
