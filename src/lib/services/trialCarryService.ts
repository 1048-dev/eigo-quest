/**
 * おためしモードの きろくを 子どもに ひきつぐ（run4 Phase 1）。
 *
 *  - 送られてくるのは「この端末で あそんだ分」だけ（ブラウザの localStorage にある おためしの きろく）。
 *    デモユーザー（ほかの おためしの人と共有）の DB の行は 読みも 消しもしない = 「移動」ではなく「コピー」。
 *  - ひきつげるのは ログイン中の保護者の 自分の子どもだけ（ほかの家の子どもは「存在しない」あつかい）。
 *  - 端末の おためしIDごとに1回だけ。CoinLedger の idempotencyKey（全体でユニーク）を しるしにするので、
 *    同時に2回送られても、ほかの子ども・ほかの家に もう一度 送られても、2回目は なにも しない。
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAssessment, getItem, getLesson } from "@/lib/curriculum";
import { localDate } from "@/lib/domain/dates";
import { planTrialMerge, type TrialCarryData } from "@/lib/domain/trialMerge";
import { getOwnedChild } from "@/lib/services/parentService";

export const trialCarryKey = (trialId: string) => `trial-carry:${trialId}`;

export interface TrialCarrySummary {
  lessons: number;
  tests: number;
  coins: number;
  memories: number;
  streakDays: number;
}

export type TrialCarryResult =
  | { ok: true; alreadyCarried: boolean; carried: TrialCarrySummary }
  | { ok: false; reason: "NOT_FOUND" };

const ZERO: TrialCarrySummary = { lessons: 0, tests: 0, coins: 0, memories: 0, streakDays: 0 };

const CATALOG = {
  isLesson: (n: number) => !!getLesson(n),
  assessmentKind: (id: string) => getAssessment(id)?.kind,
  isItem: (id: string) => !!getItem(id),
};

/** "YYYY-MM-DD" → その日の お昼（日本時間）。completedAt 用 */
const atNoonJst = (d: string) => new Date(`${d}T12:00:00+09:00`);

class AlreadyCarried extends Error {}

export async function carryOverTrial(parentId: string, childId: string, trial: TrialCarryData, now = new Date()): Promise<TrialCarryResult> {
  const owned = await getOwnedChild(parentId, childId);
  if (!owned) return { ok: false, reason: "NOT_FOUND" };
  const key = trialCarryKey(trial.trialId);
  if (await prisma.coinLedger.findUnique({ where: { idempotencyKey: key }, select: { id: true } })) {
    return { ok: true, alreadyCarried: true, carried: ZERO };
  }
  const today = localDate(now);
  const userId = owned.id;

  try {
    const carried = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const [lessons, passed, user, mems] = await Promise.all([
        tx.lessonProgress.findMany({ where: { userId, status: "COMPLETED" }, select: { lessonNo: true } }),
        tx.testAttempt.findMany({ where: { userId, passed: true, source: "NORMAL" }, select: { assessmentId: true } }),
        tx.user.findUniqueOrThrow({ where: { id: userId } }),
        tx.itemMemory.findMany({ where: { userId, itemId: { in: Object.keys(trial.items ?? {}) } }, select: { itemId: true } }),
      ]);
      const plan = planTrialMerge({
        completedLessons: new Set(lessons.map((l) => l.lessonNo)),
        passedTests: new Set(passed.map((p) => p.assessmentId)),
        memoryItemIds: new Set(mems.map((m) => m.itemId)),
        streakDays: user.streakDays,
        longestStreak: user.longestStreak,
        lastStudyDate: user.lastStudyDate,
      }, trial, CATALOG, now, today);

      // さいしょに「ひきついだ」しるし（ユニーク）を書く → 同時に来た2回目はここで止まる
      try {
        await tx.coinLedger.create({
          data: { userId, amount: plan.coins, reason: "TRIAL_CARRY_OVER", refType: "trial", refId: trial.trialId, idempotencyKey: key },
        });
      } catch (e) {
        if ((e as { code?: string } | null)?.code === "P2002") throw new AlreadyCarried();
        throw e;
      }

      for (const l of plan.lessons) {
        await tx.lessonProgress.upsert({
          where: { userId_lessonNo: { userId, lessonNo: l.lessonNo } },
          create: { userId, lessonNo: l.lessonNo, status: "COMPLETED", completedAt: atNoonJst(l.completedOn), completedOn: l.completedOn },
          update: { status: "COMPLETED", completedAt: atNoonJst(l.completedOn), completedOn: l.completedOn },
        });
      }
      for (const t of plan.tests) {
        await tx.testAttempt.create({
          data: {
            userId, assessmentId: t.assessmentId, source: "NORMAL", score: getAssessment(t.assessmentId)?.passRate ?? 1,
            passed: true, isFirstAttempt: false, coinsAwarded: 0, takenOn: t.takenOn,
          },
        });
      }
      for (const m of plan.memories) {
        const { itemId, ...data } = m;
        await tx.itemMemory.create({ data: { userId, itemId, ...data } });
      }
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(plan.coins > 0 ? { coins: { increment: plan.coins }, totalCoinsEarned: { increment: plan.coins } } : {}),
          streakDays: plan.streak.streakDays,
          longestStreak: plan.streak.longestStreak,
          lastStudyDate: plan.streak.lastStudyDate,
        },
      });
      return { lessons: plan.lessons.length, tests: plan.tests.length, coins: plan.coins, memories: plan.memories.length, streakDays: plan.streak.streakDays };
    });
    return { ok: true, alreadyCarried: false, carried };
  } catch (e) {
    if (e instanceof AlreadyCarried) return { ok: true, alreadyCarried: true, carried: ZERO };
    throw e;
  }
}
