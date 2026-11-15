/**
 * お宝復習アラート（デイリーおすすめ復習）。
 * ログイン時に「忘れかけているレッスン」を記憶モデルから自動判定し、ランダムに1件ポップアップ。
 *   - 対象: 2レッスン以上前に学習した項目のうち、レッスン平均想起率 < alertThreshold
 *   - 選び方: (1 - R) で重み付けした抽選（忘れかけほど出やすいが、毎回同じにならない）
 *   - 頻度: 1日1回まで。R が urgentThreshold 未満のレッスンがあれば必ず、それ以外は確率 alertProbability
 *   - クリア: そのレッスンの忘れかけ項目から6問、80%以上で基本報酬×2倍
 */
import { MEMORY_RULES as M } from "./config";
import { retrievability } from "./memory";
import type { LearningItemDef, MemoryState } from "./types";

export interface AlertCandidate {
  lessonNo: number;
  avgRetrievability: number;
  itemIds: string[]; // 想起率の低い順
}

export interface TreasureAlertDecision {
  show: boolean;
  candidate?: AlertCandidate;
  messageJa?: string;
}

export function findForgettingLessons(
  items: readonly LearningItemDef[],
  memories: ReadonlyMap<string, MemoryState>,
  currentLessonNo: number,
  now: Date,
): AlertCandidate[] {
  const byLesson = new Map<number, { id: string; r: number }[]>();
  for (const item of items) {
    if (item.lessonNo > currentLessonNo - 2) continue; // 昨日・今日の分は対象外（翌日テストが担当）
    const mem = memories.get(item.id);
    if (!mem) continue;
    const r = retrievability(mem, now);
    const list = byLesson.get(item.lessonNo) ?? [];
    list.push({ id: item.id, r });
    byLesson.set(item.lessonNo, list);
  }
  const out: AlertCandidate[] = [];
  for (const [lessonNo, list] of byLesson) {
    const avg = list.reduce((s, x) => s + x.r, 0) / list.length;
    if (avg < M.alertThreshold) {
      out.push({ lessonNo, avgRetrievability: avg, itemIds: list.sort((a, b) => a.r - b.r).map((x) => x.id) });
    }
  }
  return out.sort((a, b) => a.avgRetrievability - b.avgRetrievability);
}

export function decideTreasureAlert(args: {
  candidates: AlertCandidate[];
  alreadyOfferedToday: boolean;
  rng?: () => number;
}): TreasureAlertDecision {
  const rng = args.rng ?? Math.random;
  if (args.alreadyOfferedToday || args.candidates.length === 0) return { show: false };

  const urgent = args.candidates.some((c) => c.avgRetrievability < M.urgentThreshold);
  if (!urgent && rng() >= M.alertProbability) return { show: false };

  // (1 - R) 重み付き抽選
  const weights = args.candidates.map((c) => 1 - c.avgRetrievability);
  const sum = weights.reduce((a, b) => a + b, 0);
  let x = rng() * sum;
  let chosen = args.candidates[0];
  for (let i = 0; i < args.candidates.length; i++) {
    x -= weights[i];
    if (x <= 0) {
      chosen = args.candidates[i];
      break;
    }
  }
  return {
    show: true,
    candidate: chosen,
    messageJa: `きみ、少し前にやった Lesson ${chosen.lessonNo} の単語を忘れかけてるみたいだぞ！今クリアするとコイン2倍！`,
  };
}
