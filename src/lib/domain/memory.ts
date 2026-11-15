/**
 * 記憶モデル（FSRS の考え方を子ども向けに簡略化）。
 *   想起率 R(t) = (1 + t / (9·S))^-1      t: 最終復習からの経過日数, S: 安定度（日）
 *   → t = S のとき R ≈ 0.9（targetRetention）
 * 正解すると S が伸び（忘れかけで正解するほど大きく伸びる＝望ましい困難）、不正解で S が縮む。
 */
import { MEMORY_RULES as M } from "./config";
import type { MemoryState } from "./types";

const DAY = 86_400_000;

export function retrievability(mem: Pick<MemoryState, "stability" | "lastReviewedAt">, now: Date): number {
  const t = Math.max(0, (now.getTime() - mem.lastReviewedAt.getTime()) / DAY);
  return 1 / (1 + t / (9 * Math.max(mem.stability, 0.1)));
}

export function initialMemory(itemId: string, correct: boolean, now: Date): MemoryState {
  return {
    itemId,
    stability: correct ? M.initialStability : M.initialStability * 0.5,
    difficulty: correct ? M.initialDifficulty - 1 : M.initialDifficulty + 1,
    reviewCount: 1,
    lapses: correct ? 0 : 1,
    accuracyEwma: correct ? 1 : 0,
    lastReviewedAt: now,
  };
}

/**
 * 1回の解答で記憶状態を更新。
 * 同じ日に何度も正解しても S はほぼ伸びない（R が高い＝簡単すぎる復習の効果は小さい）。
 */
export function updateMemory(prev: MemoryState | undefined, itemId: string, correct: boolean, now: Date, score?: number): MemoryState {
  if (!prev) return initialMemory(itemId, correct, now);
  const R = retrievability(prev, now);
  const quality = score ?? (correct ? 1 : 0);
  const ewma = M.ewmaAlpha * quality + (1 - M.ewmaAlpha) * prev.accuracyEwma;

  if (correct) {
    const d = clamp(prev.difficulty - 0.3 * (quality - 0.6), 1, 10);
    // 伸び率: 難易度が低い・忘れかけ(R低)・安定度が低いほど大きく伸びる
    const growth = 1 + Math.exp(0.9) * ((11 - d) / 10) * Math.pow(prev.stability, -0.15) * (Math.exp((1 - R) * 1.6) - 1);
    return {
      ...prev,
      stability: Math.min(prev.stability * Math.max(growth, 1.05), 365),
      difficulty: d,
      reviewCount: prev.reviewCount + 1,
      accuracyEwma: ewma,
      lastReviewedAt: now,
    };
  }
  return {
    ...prev,
    stability: Math.max(0.3, prev.stability * 0.35),
    difficulty: clamp(prev.difficulty + 0.8, 1, 10),
    reviewCount: prev.reviewCount + 1,
    lapses: prev.lapses + 1,
    accuracyEwma: ewma,
    lastReviewedAt: now,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
