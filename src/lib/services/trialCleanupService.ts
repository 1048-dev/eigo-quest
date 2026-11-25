/**
 * つかわれなくなった おためし学習者の そうじ（run5 Phase 1）。scripts/cleanup-trial.ts から よぶ。
 *  - 対象: isTrial = true・保護者なし・さいごに あそんでから days 日（既定 60日）より前
 *    （lastActiveAt が無い古い行は つくった日で きめる）
 *  - 学習の行（レッスン・テスト・解答・記憶・コイン台帳・モンスター…）ごと 消す（deleteUsersData）
 *  - 少しずつ（batchSize 人ずつ）消す。消す直前に もう一度 条件を たしかめる（その間に あそんだ人は 消さない）
 *  - dryRun: 数えるだけ
 */
import { prisma } from "@/lib/db";
import { staleTrialWhere, TRIAL_STALE_DAYS } from "@/lib/auth/trialLearner";
import { deleteUsersData } from "@/lib/services/parentService";

export interface TrialCleanupOptions {
  now?: Date;
  days?: number;
  dryRun?: boolean;
  batchSize?: number;
  /** 進みぐあい（1バッチごと） */
  onProgress?: (p: { done: number; total: number }) => void;
  /** これを すぎたら とちゅうで やめる（ミリ秒の時刻） */
  deadline?: number;
}

export interface TrialCleanupResult {
  candidates: number;
  deleted: number;
  dryRun: boolean;
  timedOut: boolean;
}

export async function cleanupStaleTrialLearners(opts: TrialCleanupOptions = {}): Promise<TrialCleanupResult> {
  const now = opts.now ?? new Date();
  const days = opts.days ?? TRIAL_STALE_DAYS;
  const batchSize = Math.max(1, Math.min(1000, opts.batchSize ?? 200));
  const where = staleTrialWhere(now, days);
  const ids = (await prisma.user.findMany({ where, select: { id: true }, orderBy: { createdAt: "asc" } })).map((u) => u.id);
  const total = ids.length;
  if (opts.dryRun || total === 0) {
    opts.onProgress?.({ done: 0, total });
    return { candidates: total, deleted: 0, dryRun: !!opts.dryRun, timedOut: false };
  }
  let deleted = 0;
  for (let i = 0; i < ids.length; i += batchSize) {
    if (opts.deadline && Date.now() > opts.deadline) return { candidates: total, deleted, dryRun: false, timedOut: true };
    const chunk = ids.slice(i, i + batchSize);
    deleted += await prisma.$transaction(async (tx) => {
      // 消す直前に もう一度（その間に あそびはじめた人・保護者の子どもに なった人は 消さない）
      const still = (await tx.user.findMany({ where: { id: { in: chunk }, ...where }, select: { id: true } })).map((u) => u.id);
      await deleteUsersData(tx, still);
      return still.length;
    });
    opts.onProgress?.({ done: Math.min(i + batchSize, total), total });
  }
  return { candidates: total, deleted, dryRun: false, timedOut: false };
}
