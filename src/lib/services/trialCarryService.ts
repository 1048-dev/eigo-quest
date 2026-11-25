/**
 * おためしモードの きろくを 子どもに ひきつぐ（run4 Phase 1 → run5 Phase 1）。
 *
 *  ひきつぐもの（どちらか片方でも よい）
 *   1. ブラウザの おためしの きろく（localStorage。オフラインで あそんだ分）— 送られてくる
 *   2. この端末の おためし学習者（DB の User, isTrial。cookie eq_trial_learner）の きろく — サーバーで読む
 *
 *  - ひきつげるのは ログイン中の保護者の 自分の子どもだけ（ほかの家の子どもは「存在しない」あつかい）。
 *  - それぞれ 1回だけ: CoinLedger の idempotencyKey（全体でユニーク）を しるしにする
 *      ブラウザ: trial-carry:<ブラウザの おためしID> / DB: trial-carry-db:<おためし学習者の User.id>
 *    同時に2回送られても、ほかの子ども・ほかの家に もう一度 送られても、2回目は なにも しない。
 *  - おためし学習者の 行は「コピー」して のこす（60日後に scripts/cleanup-trial.ts が消す）。
 *    ただし cookie の しるし（trialTokenHash）は けすので、この端末は もう その おためし学習者には もどらない。
 *  - 共有のデモユーザー（seed 用）の 行は 読みも 消しもしない。
 */
import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAssessment, getItem, getLesson } from "@/lib/curriculum";
import { localDate } from "@/lib/domain/dates";
import { isDbTrialEmpty, isTrialDataEmpty, planDeviceTrialMerge, type DbTrialSnapshot, type TrialCarryData } from "@/lib/domain/trialMerge";
import { getOwnedChild } from "@/lib/services/parentService";

export const trialCarryKey = (trialId: string) => `trial-carry:${trialId}`;
export const trialLearnerCarryKey = (userId: string) => `trial-carry-db:${userId}`;

export interface TrialCarrySummary {
  lessons: number;
  tests: number;
  coins: number;
  memories: number;
  streakDays: number;
  monsters: number;
}

export type TrialCarryResult =
  | { ok: true; alreadyCarried: boolean; nothing: boolean; carried: TrialCarrySummary }
  | { ok: false; reason: "NOT_FOUND" };

const ZERO: TrialCarrySummary = { lessons: 0, tests: 0, coins: 0, memories: 0, streakDays: 0, monsters: 0 };

const CATALOG = {
  isLesson: (n: number) => !!getLesson(n),
  assessmentKind: (id: string) => getAssessment(id)?.kind,
  isItem: (id: string) => !!getItem(id),
};

/** "YYYY-MM-DD" → その日の お昼（日本時間）。completedAt 用 */
const atNoonJst = (d: string) => new Date(`${d}T12:00:00+09:00`);

class AlreadyCarried extends Error {}

type Db = Pick<Prisma.TransactionClient, "user" | "lessonProgress" | "testAttempt" | "itemMemory" | "userMonster" | "coinLedger">;

/** おためし学習者の きろくを 読む（isTrial で 保護者なしの行だけ。ちがえば null） */
export async function readTrialSnapshot(trialUserId: string, db: Db = prisma): Promise<DbTrialSnapshot | null> {
  const user = await db.user.findFirst({ where: { id: trialUserId, isTrial: true, parentId: null } });
  if (!user) return null;
  const [lessons, passed, mems, monsters] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId: trialUserId, status: "COMPLETED" }, select: { lessonNo: true, completedOn: true, completedAt: true } }),
    db.testAttempt.findMany({ where: { userId: trialUserId, passed: true, source: "NORMAL" }, select: { assessmentId: true, takenOn: true } }),
    db.itemMemory.findMany({ where: { userId: trialUserId } }),
    db.userMonster.findMany({ where: { userId: trialUserId }, select: { monsterId: true, count: true } }),
  ]);
  const lessonDates: Record<string, string> = {};
  for (const l of lessons) {
    const d = l.completedOn ?? (l.completedAt ? localDate(l.completedAt) : null);
    if (d) lessonDates[String(l.lessonNo)] = d;
  }
  const testDates: Record<string, string> = {};
  for (const t of passed) if (!testDates[t.assessmentId] || t.takenOn < testDates[t.assessmentId]) testDates[t.assessmentId] = t.takenOn;
  return {
    userId: trialUserId,
    lessons: lessonDates,
    tests: testDates,
    coins: user.coins,
    streakDays: user.streakDays,
    longestStreak: user.longestStreak,
    lastStudyDate: user.lastStudyDate,
    memories: mems.map((m) => ({ itemId: m.itemId, stability: m.stability, difficulty: m.difficulty, reviewCount: m.reviewCount, lapses: m.lapses, accuracyEwma: m.accuracyEwma, lastReviewedAt: m.lastReviewedAt })),
    monsters,
  };
}

/** 「いいえ」を おぼえておくための しるし（User.id を そのまま 見せない） */
export function trialRef(trialUserId: string): string {
  return createHash("sha256").update(`trial-ref:${trialUserId}`).digest("base64url").slice(0, 16);
}

export interface TrialStatus {
  hasProgress: boolean;
  ref: string | null;
  lessons: number;
  tests: number;
  coins: number;
}

/** この端末の おためし学習者に ひきつげる きろくが あるか（まだ ひきついでいない分だけ） */
export async function getTrialStatus(trialUserId: string | null): Promise<TrialStatus> {
  const none: TrialStatus = { hasProgress: false, ref: null, lessons: 0, tests: 0, coins: 0 };
  if (!trialUserId) return none;
  if (await prisma.coinLedger.findUnique({ where: { idempotencyKey: trialLearnerCarryKey(trialUserId) }, select: { id: true } })) return none;
  const snap = await readTrialSnapshot(trialUserId);
  if (!snap) return none;
  return {
    hasProgress: !isDbTrialEmpty(snap),
    ref: trialRef(trialUserId),
    lessons: Object.keys(snap.lessons).length,
    tests: Object.keys(snap.tests).length,
    coins: Math.max(0, snap.coins),
  };
}

/**
 * ひきつぐ。browser = ブラウザの きろく（無ければ null）、trialUserId = この端末の おためし学習者（無ければ null）。
 * もう ひきついだ方・空の方は つかわない。どちらも つかえなければ alreadyCarried（前に ひきついだ）か nothing（なにも無い）。
 */
export async function carryOverTrial(
  parentId: string,
  childId: string,
  browser: TrialCarryData | null,
  trialUserId: string | null = null,
  now = new Date(),
): Promise<TrialCarryResult> {
  const owned = await getOwnedChild(parentId, childId);
  if (!owned) return { ok: false, reason: "NOT_FOUND" };
  const userId = owned.id;
  if (trialUserId === userId) trialUserId = null; // 念のため（子どもは isTrial ではないので ふつうは おきない）

  const browserKey = browser ? trialCarryKey(browser.trialId) : null;
  const dbKey = trialUserId ? trialLearnerCarryKey(trialUserId) : null;
  const used = async (key: string | null) => !!key && !!(await prisma.coinLedger.findUnique({ where: { idempotencyKey: key }, select: { id: true } }));
  const [browserUsed, dbUsed] = await Promise.all([used(browserKey), used(dbKey)]);

  const useBrowser = browser && !browserUsed && !isTrialDataEmpty(browser) ? browser : null;
  const snap = trialUserId && !dbUsed ? await readTrialSnapshot(trialUserId) : null;
  const useDb = snap && !isDbTrialEmpty(snap) ? snap : null;
  if (!useBrowser && !useDb) {
    const already = browserUsed || dbUsed;
    return { ok: true, alreadyCarried: already, nothing: !already, carried: ZERO };
  }
  const today = localDate(now);

  try {
    const carried = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const [lessons, passed, user, mems] = await Promise.all([
        tx.lessonProgress.findMany({ where: { userId, status: "COMPLETED" }, select: { lessonNo: true } }),
        tx.testAttempt.findMany({ where: { userId, passed: true, source: "NORMAL" }, select: { assessmentId: true } }),
        tx.user.findUniqueOrThrow({ where: { id: userId } }),
        tx.itemMemory.findMany({
          where: { userId, itemId: { in: [...Object.keys(useBrowser?.items ?? {}), ...(useDb?.memories ?? []).map((m) => m.itemId)] } },
          select: { itemId: true },
        }),
      ]);
      const plan = planDeviceTrialMerge({
        completedLessons: new Set(lessons.map((l) => l.lessonNo)),
        passedTests: new Set(passed.map((p) => p.assessmentId)),
        memoryItemIds: new Set(mems.map((m) => m.itemId)),
        streakDays: user.streakDays,
        longestStreak: user.longestStreak,
        lastStudyDate: user.lastStudyDate,
      }, useBrowser, useDb, CATALOG, now, today);

      // さいしょに「ひきついだ」しるし（ユニーク）を書く → 同時に来た2回目はここで止まる
      const mark = async (key: string, amount: number, refType: string, refId: string) => {
        try {
          await tx.coinLedger.create({ data: { userId, amount, reason: "TRIAL_CARRY_OVER", refType, refId, idempotencyKey: key } });
        } catch (e) {
          if ((e as { code?: string } | null)?.code === "P2002") throw new AlreadyCarried();
          throw e;
        }
      };
      if (useBrowser) await mark(trialCarryKey(useBrowser.trialId), plan.coinParts.browser, "trial", useBrowser.trialId);
      if (useDb) await mark(trialLearnerCarryKey(useDb.userId), plan.coinParts.db, "trial-learner", useDb.userId);

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
      for (const m of plan.monsters) {
        await tx.userMonster.upsert({
          where: { userId_monsterId: { userId, monsterId: m.monsterId } },
          create: { userId, monsterId: m.monsterId, count: m.count },
          update: { count: { increment: m.count } },
        });
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
      // この端末は もう その おためし学習者に もどらない（行は のこして 60日後に そうじ）
      if (useDb) await tx.user.updateMany({ where: { id: useDb.userId, isTrial: true, parentId: null }, data: { trialTokenHash: null } });
      return {
        lessons: plan.lessons.length, tests: plan.tests.length, coins: plan.coins, memories: plan.memories.length,
        streakDays: plan.streak.streakDays, monsters: plan.monsters.length,
      };
    });
    return { ok: true, alreadyCarried: false, nothing: false, carried };
  } catch (e) {
    if (e instanceof AlreadyCarried) return { ok: true, alreadyCarried: true, nothing: false, carried: ZERO };
    throw e;
  }
}
