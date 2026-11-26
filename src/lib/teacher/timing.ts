/**
 * run8: 先生の 台本の 長さの 見つもり（docs/teacher-plan.md）。
 * テスト・バーチャル先生プレイヤー・動画エクスポーターで 同じ 計算を つかう。
 */
import type { LessonDef, TeacherScript, TeacherSegment } from "@/lib/domain/types";

/** 英語 1 語あたり（こども向けの ゆっくりめ。約 130 語/分） */
export const MS_PER_EN_WORD = 460;
/** 日本語 1 文字あたり（ひらがな多め。約 7 文字/秒） */
export const MS_PER_JA_CHAR = 145;
/** セグメントの きりかえ（スライドの 動き・ひと呼吸） */
export const MS_SEGMENT_GAP = 500;
/** 台本の 長さの はんい（ミリ秒）。3〜4 分 */
export const TEACHER_MIN_MS = 180_000;
export const TEACHER_MAX_MS = 240_000;

const JA_CHAR = /[぀-ヿ㐀-鿿ー々〆]/g;
const EN_WORD = /[A-Za-z][A-Za-z'’-]*/g;

export function countEnWords(text: string): number {
  return (text.match(EN_WORD) ?? []).length;
}
export function countJaChars(text: string): number {
  return (text.match(JA_CHAR) ?? []).length;
}

/** 話す 時間（まち時間を ふくまない） */
export function speechMs(text: string): number {
  return countEnWords(text) * MS_PER_EN_WORD + countJaChars(text) * MS_PER_JA_CHAR;
}

export function segmentMs(seg: TeacherSegment): number {
  return speechMs(seg.say) + (seg.pauseMs ?? 0) + MS_SEGMENT_GAP;
}

export function scriptMs(script: TeacherScript): number {
  return script.segments.reduce((sum, s) => sum + segmentMs(s), 0);
}

/** 英語で 話す 時間の わりあい（0〜1。まち時間は ふくまない） */
export function englishShare(script: TeacherScript): number {
  let en = 0;
  let all = 0;
  for (const s of script.segments) {
    const e = countEnWords(s.say) * MS_PER_EN_WORD;
    en += e;
    all += e + countJaChars(s.say) * MS_PER_JA_CHAR;
  }
  return all === 0 ? 0 : en / all;
}

/**
 * ワールドごとの「英語の わりあい」の めやす（BRIEF run8）。
 * W1-2: ほぼ 日本語の 説明 ＋ 英語の お手本 / W3-6: 半分ずつ / W7-12: ほぼ やさしい 英語 ＋ みじかい 日本語 /
 * W13-20: 英語 ＋ ちいさな 日本語ヒント / W21-40: 英語だけ（日本語字幕は ある）
 */
export interface ImmersionBand {
  label: string;
  labelJa: string;
  minEnglishShare: number;
  maxEnglishShare: number;
  /** ja の セグメントを つかって よいか */
  allowJaSegments: boolean;
}

export function immersionFor(world: number): ImmersionBand {
  if (world <= 2) return { label: "ja-led", labelJa: "日本語で 説明 ＋ 英語の お手本", minEnglishShare: 0.15, maxEnglishShare: 0.5, allowJaSegments: true };
  if (world <= 6) return { label: "half", labelJa: "英語と 日本語 半分ずつ", minEnglishShare: 0.4, maxEnglishShare: 0.7, allowJaSegments: true };
  if (world <= 12) return { label: "en-led", labelJa: "やさしい 英語 ＋ みじかい 日本語", minEnglishShare: 0.65, maxEnglishShare: 0.92, allowJaSegments: false };
  if (world <= 20) return { label: "en-hints", labelJa: "英語 ＋ ちいさな 日本語ヒント", minEnglishShare: 0.88, maxEnglishShare: 1, allowJaSegments: false };
  return { label: "en-only", labelJa: "英語だけ（日本語字幕あり）", minEnglishShare: 0.995, maxEnglishShare: 1, allowJaSegments: false };
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[.!?,。！？、]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** スライドに のせて よい ことば（レッスンに ある ことば・表現・フォニックス・会話） */
export function lessonSlideVocabulary(lesson: LessonDef): Set<string> {
  const out = new Set<string>();
  const add = (s: string | undefined) => {
    if (s && s.trim()) out.add(norm(s));
  };
  add(lesson.title);
  add(lesson.school.grammar);
  lesson.school.expressions.forEach((e) => add(e.en));
  lesson.tpr.forEach((t) => add(t.en));
  lesson.vocab.forEach((v) => add(v.en));
  lesson.phonics.focus.forEach(add);
  lesson.phonics.sounds.forEach(add);
  lesson.phonics.words.forEach(add);
  lesson.conversation?.lines.forEach((l) => add(l.en));
  lesson.conversation?.aiTask.targetExpressions.forEach(add);
  return out;
}

/** レッスンに ない スライドの ことば（空なら OK） */
export function unknownSlideItems(lesson: LessonDef): string[] {
  if (!lesson.teacher) return [];
  const ok = lessonSlideVocabulary(lesson);
  const bad: string[] = [];
  for (const s of lesson.teacher.segments) {
    for (const it of s.slide?.items ?? []) if (!ok.has(norm(it))) bad.push(it);
  }
  return bad;
}
