/**
 * リアルタイム英語習得率アルゴリズム（純粋関数）。
 *
 * 1. 項目習得度  m(i) = R_i(now) × accuracyEwma_i
 *      R  : 記憶モデルによる「今この瞬間に思い出せる確率」（時間とともに下がる＝忘却を反映）
 *      EWMA: 直近重視の正答率（たまたまの1回正解で100%にならない）
 *    未解答の導入済み項目は 0 として平均に含める（やっていない所は習得していない）。
 * 2. 軸スコア = 対象スキルを持つ導入済み項目の m(i) の加重平均
 *      学校テスト対応度は schoolCore（教科書頻出）項目を2倍の重みで評価。
 * 3. 軸ごとの補正
 *      リスニング反射力 = 0.7×項目習得 + 0.3×反射スコア（速さ×再生速度）
 *      発音             = 0.5×項目習得 + 0.5×直近の発音判定スコア平均
 * 4. 総合 = 各軸の重み付き平均、進捗(coverage) = 導入済み項目 / カリキュラム全項目
 */
import { retrievability } from "./memory";
import type { LearningItemDef, MasteryScores, MemoryState, ResponseLog, Skill } from "./types";
import { SKILLS } from "./types";

export const OVERALL_WEIGHTS: Record<Skill, number> = {
  SCHOOL_TEST: 0.25,
  LISTENING: 0.2,
  PHONICS: 0.15,
  SPEAKING: 0.15,
  VOCABULARY: 0.15,
  WRITING: 0.1,
};

export const SKILL_LABELS_JA: Record<Skill, string> = {
  SCHOOL_TEST: "学校テスト対応度",
  PHONICS: "フォニックス定着度",
  LISTENING: "リスニング反射力",
  SPEAKING: "発音",
  VOCABULARY: "語彙",
  WRITING: "筆記・スペル",
};

export interface MasteryInput {
  introducedItems: readonly LearningItemDef[];
  totalItemCount: number;
  memories: ReadonlyMap<string, MemoryState>;
  /** 直近の解答ログ（例: 過去30日・最大500件） */
  recentResponses: readonly ResponseLog[];
  now: Date;
}

export interface MasteryResult {
  scores: MasteryScores; // 0..100
  overall: number; // 0..100
  coverage: number; // 0..100
  /** 弱点トップ（復習アリーナの出題・ダッシュボードの「にがて」表示に使う） */
  weakestItemIds: string[];
}

export function itemMastery(mem: MemoryState | undefined, now: Date): number {
  if (!mem) return 0;
  return retrievability(mem, now) * mem.accuracyEwma;
}

/** 反応速度 → 0.3..1（1.5秒以内=1.0、6秒以上=0.3） */
export function speedFactor(ms: number | null | undefined): number {
  if (ms == null) return 0.8;
  return clamp(1 - (ms - 1500) / 6430, 0.3, 1);
}

/** 再生速度ボーナス: 0.8倍速での正解は少し割り引き、1.2倍速は割り増し */
export function rateFactor(rate: number | null | undefined): number {
  if (rate == null) return 1;
  return clamp(0.25 + 0.75 * rate, 0.8, 1.15);
}

export function reflexScore(logs: readonly ResponseLog[]): number | null {
  const l = logs.filter((r) => r.skill === "LISTENING");
  if (l.length === 0) return null;
  const sum = l.reduce((s, r) => s + (r.correct ? Math.min(1, speedFactor(r.responseMs) * rateFactor(r.playbackRate)) : 0), 0);
  return sum / l.length;
}

export function pronunciationScore(logs: readonly ResponseLog[]): number | null {
  const s = logs.filter((r) => r.skill === "SPEAKING" && r.score != null);
  if (s.length === 0) return null;
  return s.reduce((a, r) => a + (r.score as number), 0) / s.length;
}

export function computeMastery(input: MasteryInput): MasteryResult {
  const { introducedItems, memories, now } = input;
  const raw = {} as MasteryScores;

  for (const skill of SKILLS) {
    let wsum = 0;
    let total = 0;
    for (const item of introducedItems) {
      if (!item.skills.includes(skill)) continue;
      const w = skill === "SCHOOL_TEST" && item.schoolCore ? 2 : 1;
      wsum += w;
      total += w * itemMastery(memories.get(item.id), now);
    }
    raw[skill] = wsum === 0 ? 0 : total / wsum;
  }

  const reflex = reflexScore(input.recentResponses);
  if (reflex != null) raw.LISTENING = 0.7 * raw.LISTENING + 0.3 * reflex;
  const pron = pronunciationScore(input.recentResponses);
  if (pron != null) raw.SPEAKING = 0.5 * raw.SPEAKING + 0.5 * pron;

  const scores = Object.fromEntries(SKILLS.map((s) => [s, round(raw[s] * 100)])) as MasteryScores;
  const overall = round(SKILLS.reduce((a, s) => a + raw[s] * OVERALL_WEIGHTS[s], 0) * 100);
  const coverage = input.totalItemCount === 0 ? 0 : round((introducedItems.length / input.totalItemCount) * 100);

  const weakestItemIds = [...introducedItems]
    .map((i) => ({ id: i.id, m: itemMastery(memories.get(i.id), now) }))
    .sort((a, b) => a.m - b.m)
    .slice(0, 10)
    .map((x) => x.id);

  return { scores, overall, coverage, weakestItemIds };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number) => Math.round(v * 10) / 10;
