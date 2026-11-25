/**
 * ステージ・レベル・学校の英語との対応（docs/curriculum-6year.md §2・§6・§10）。純粋なデータと関数だけ（ブラウザでも使える）。
 *
 *  - ステージ: 1 = W1〜12（L1〜360）／2 = W13〜20／3 = W21〜28／4 = W29〜35／5 = W36〜40（L1051〜1200）
 *  - レベル（CEFR のめやす）: ワールドごと。"Pre-A1" / "A1" / "A1+" / "A2" / "A2+" / "B1" / "B1+"
 *  - 学校の英語: そのレッスンを 修了したら「小6 まで修了」「中2 まで修了」などを 保護者に出す
 */
import { CURRICULUM_RULES } from "@/lib/domain/config";

export const CEFR_LEVELS = ["Pre-A1", "A1", "A1+", "A2", "A2+", "B1", "B1+"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export interface StageDef {
  stage: number;
  nameJa: string;
  worlds: readonly [number, number];
  /** CEFR の はじめ → おわり（表示用） */
  cefrJa: string;
  /** 英検のめやす（会話・リスニング・読む力の感じ。合格の保証ではない） */
  eikenJa: string;
}

export const STAGES: readonly StageDef[] = [
  { stage: 1, nameJa: "はじまりの旅", worlds: [1, 12], cefrJa: "Pre-A1 → A1", eikenJa: "5級" },
  { stage: 2, nameJa: "ひろがる せかい", worlds: [13, 20], cefrJa: "A1 → A2", eikenJa: "4級 → 3級の入口" },
  { stage: 3, nameJa: "ことばで つながる", worlds: [21, 28], cefrJa: "A2 → A2+", eikenJa: "3級 → 準2級" },
  { stage: 4, nameJa: "じぶんの ことばで", worlds: [29, 35], cefrJa: "A2+ → B1", eikenJa: "準2級 → 準2級プラス" },
  { stage: 5, nameJa: "せかいへ はばたく", worlds: [36, 40], cefrJa: "B1 → B1+", eikenJa: "準2級プラス → 2級" },
];

/**
 * ワールドごとの レベル（その ワールドを 終えたときの めやす。§10 の見出しの 右がわ）。
 * ステージ1 は 前半（W1〜6）を Pre-A1、後半（W7〜12）を A1 とした。
 */
const WORLD_LEVELS: Readonly<Record<number, CefrLevel>> = {
  1: "Pre-A1", 2: "Pre-A1", 3: "Pre-A1", 4: "Pre-A1", 5: "Pre-A1", 6: "Pre-A1",
  7: "A1", 8: "A1", 9: "A1", 10: "A1", 11: "A1", 12: "A1",
  13: "A1+", 14: "A1+", 15: "A1+", 16: "A1+", 17: "A2", 18: "A2", 19: "A2", 20: "A2",
  21: "A2", 22: "A2", 23: "A2", 24: "A2+", 25: "A2+", 26: "A2+", 27: "A2+", 28: "A2+",
  29: "B1", 30: "B1", 31: "B1", 32: "B1", 33: "B1", 34: "B1", 35: "B1",
  36: "B1", 37: "B1+", 38: "B1+", 39: "B1+", 40: "B1+",
};

export function stageOfWorld(world: number): number {
  const s = STAGES.find((x) => world >= x.worlds[0] && world <= x.worlds[1]);
  return s?.stage ?? (world < 1 ? 1 : STAGES[STAGES.length - 1].stage);
}

export function levelOfWorld(world: number): CefrLevel {
  return WORLD_LEVELS[world] ?? (world < 1 ? "Pre-A1" : "B1+");
}

export const worldOfLesson = (lessonNo: number) => Math.max(1, Math.ceil(lessonNo / CURRICULUM_RULES.lessonsPerWorld));
export const stageOfLesson = (lessonNo: number) => stageOfWorld(worldOfLesson(lessonNo));
export const levelOfLesson = (lessonNo: number) => levelOfWorld(worldOfLesson(lessonNo));

export function stageDef(stage: number): StageDef {
  return STAGES.find((s) => s.stage === stage) ?? STAGES[0];
}

// ---------------------------------------------------------------------------
// 学校の英語との対応（§6）
// ---------------------------------------------------------------------------
/** このレッスンを 修了したら → 表示 */
export const SCHOOL_MILESTONES: readonly { lessonNo: number; labelJa: string }[] = [
  { lessonNo: 30, labelJa: "小1" },
  { lessonNo: 60, labelJa: "小2" },
  { lessonNo: 120, labelJa: "小3" },
  { lessonNo: 180, labelJa: "小4" },
  { lessonNo: 240, labelJa: "小5" },
  { lessonNo: 330, labelJa: "小6" },
  { lessonNo: 480, labelJa: "中1" },
  { lessonNo: 630, labelJa: "中2" },
  { lessonNo: 780, labelJa: "中3" },
  { lessonNo: 1050, labelJa: "高校初級の会話レベル" },
  { lessonNo: 1200, labelJa: "高校卒業程度の会話レベル" },
];

export interface SchoolProgress {
  /** 修了した いちばん上の 学年の表示（まだなら null） */
  completedJa: string | null;
  /** 保護者向けの 1 行（「学校の英語 小6 まで修了」など） */
  lineJa: string;
  /** つぎの めやす（全部おわっていれば null） */
  next: { lessonNo: number; labelJa: string } | null;
}

/**
 * 学校の英語「○○ まで修了」。lessonsCleared = 1 から順に クリアした レッスン数（= さいごに クリアした レッスン番号）。
 * 進み方は 1 から順番なので、完了した レッスンの数を そのまま使ってよい。
 */
export function schoolGradeCompleted(lessonsCleared: number): SchoolProgress {
  const done = SCHOOL_MILESTONES.filter((m) => lessonsCleared >= m.lessonNo);
  const last = done[done.length - 1] ?? null;
  const next = SCHOOL_MILESTONES.find((m) => lessonsCleared < m.lessonNo) ?? null;
  const completedJa = last?.labelJa ?? null;
  const lineJa = !last
    ? `学校の英語: これから（Lesson ${next?.lessonNo ?? 30} で 小1 の内容まで修了）`
    : last.lessonNo >= 1050
      ? `学校の英語: ${last.labelJa}に とうたつ`
      : `学校の英語: ${last.labelJa} の内容まで修了`;
  return { completedJa, lineJa, next };
}

// ---------------------------------------------------------------------------
// 月のワークブック（20 レッスンごと。平日ペースで 約1か月）
// ---------------------------------------------------------------------------
export const LESSONS_PER_MONTH_PACK = 20;

export interface MonthPack {
  /** 1 = L1〜20、2 = L21〜40 … */
  pack: number;
  start: number;
  end: number;
}

export function monthPackOfLesson(lessonNo: number): MonthPack {
  const pack = Math.max(1, Math.ceil(lessonNo / LESSONS_PER_MONTH_PACK));
  return monthPack(pack);
}

export function monthPack(pack: number): MonthPack {
  return { pack, start: (pack - 1) * LESSONS_PER_MONTH_PACK + 1, end: pack * LESSONS_PER_MONTH_PACK };
}

/** totalLessons までに 作れる パックの数（さいごが 20 に みたなくても 1 冊） */
export const monthPackCount = (totalLessons: number) => Math.ceil(totalLessons / LESSONS_PER_MONTH_PACK);
