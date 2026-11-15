/**
 * 復習アリーナ（周回モード）。
 * ボス戦合格ごとに「直近30レッスン」「1〜n 累積」のアリーナが開放され、何度でも挑戦してコインを稼げる。
 * 出題は記憶モデルで重み付け: 忘れかけ（R低）・苦手（EWMA低）の項目ほど出やすい。
 * → 子どもは「コイン稼ぎ」のつもりで遊び、システム側は最適な間隔反復を実現する。
 */
import { itemMastery } from "./mastery";
import type { AssessmentDef, LearningItemDef, MemoryState } from "./types";

export type ArenaMode = "MIXED" | "LISTENING" | "SPEAKING" | "WRITING";

export interface ArenaInfo {
  assessment: AssessmentDef;
  unlocked: boolean;
  titleJa: string;
}

export function listArenas(assessments: readonly AssessmentDef[], passedTests: ReadonlyMap<string, string>): ArenaInfo[] {
  return assessments
    .filter((a) => a.kind === "ARENA")
    .map((a) => ({
      assessment: a,
      unlocked: passedTests.has(`boss-1-${a.rangeEnd}`),
      titleJa: a.rangeStart === 1 && a.rangeEnd > 30 ? `大アリーナ 1〜${a.rangeEnd}` : `アリーナ ${a.rangeStart}〜${a.rangeEnd}`,
    }));
}

/** 重み付き非復元抽出（Efraimidis–Spirakis） */
export function pickArenaItems(
  pool: readonly LearningItemDef[],
  memories: ReadonlyMap<string, MemoryState>,
  count: number,
  now: Date,
  rng: () => number = Math.random,
): LearningItemDef[] {
  return pool
    .map((item) => {
      const w = 0.15 + (1 - itemMastery(memories.get(item.id), now)); // 習得済みでも少しは出る
      return { item, key: Math.pow(rng(), 1 / w) };
    })
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((x) => x.item);
}
