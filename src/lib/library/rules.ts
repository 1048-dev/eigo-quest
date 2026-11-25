/**
 * えいごの としょかん の ルール（純粋関数。サーバーでも ブラウザでも 同じものを 使う）。
 *  - 解放: 「到達レッスン」（クリアした いちばん先の レッスン番号）>= unlockLesson で ひらく
 *  - おはなしの クイズの 採点
 *  - ごほうびの 対象に なる「やりきった」の 判定
 *  - データの チェック（テストと 索引スクリプトで 使う）
 */
import { LIBRARY_RULES } from "@/lib/domain/config";
import type { Chant, LibraryKind, Story, StoryMeta, TalkTheme } from "./types";

/** クリアした レッスン番号の 一覧 → 到達レッスン（なにも なければ 0） */
export function reachedLessonFrom(completed: Iterable<number>): number {
  let max = 0;
  for (const n of completed) if (Number.isInteger(n) && n > max) max = n;
  return max;
}

export function isUnlocked(item: { unlockLesson: number }, reachedLesson: number): boolean {
  return Math.max(0, Math.floor(reachedLesson || 0)) >= item.unlockLesson;
}

/** フリートークの テーマは、テーマごとの unlockLesson と「フリートーク そのものの 解放（W4〜）」の 両方を みる */
export function isTalkUnlocked(theme: { unlockLesson: number }, reachedLesson: number): boolean {
  return isUnlocked({ unlockLesson: Math.max(theme.unlockLesson, LIBRARY_RULES.freeTalkUnlockLesson) }, reachedLesson);
}

export function isItemUnlocked(kind: LibraryKind, item: { unlockLesson: number }, reachedLesson: number): boolean {
  return kind === "talk" ? isTalkUnlocked(item, reachedLesson) : isUnlocked(item, reachedLesson);
}

/** つぎに ひらく アイテム（まだ ひらいていない うちで いちばん はやい もの）。ぜんぶ ひらいていたら null */
export function nextToUnlock<T extends { unlockLesson: number }>(items: readonly T[], reachedLesson: number): T | null {
  return [...items].filter((i) => !isUnlocked(i, reachedLesson)).sort((a, b) => a.unlockLesson - b.unlockLesson)[0] ?? null;
}

/** いまの レベルに いちばん あう おはなし（ひらいている うちで いちばん あたらしい） */
export function recommendedStory(stories: readonly StoryMeta[], reachedLesson: number, readIds: ReadonlySet<string> = new Set()): StoryMeta | null {
  const open = stories.filter((s) => isUnlocked(s, reachedLesson)).sort((a, b) => b.unlockLesson - a.unlockLesson);
  return open.find((s) => !readIds.has(s.id)) ?? open[0] ?? null;
}

// ---------------------------------------------------------------------------
// おはなしの クイズ
// ---------------------------------------------------------------------------
export interface StoryGrade {
  correct: number;
  total: number;
  /** storyPassCorrect 問 以上 正解 */
  passed: boolean;
  /** 1問ずつの 正誤 */
  results: boolean[];
}

/** answers[i] = i 問目に えらんだ 選択肢の 位置。足りない・へんな値は まちがい あつかい */
export function gradeStory(story: Pick<Story, "questions">, answers: readonly unknown[]): StoryGrade {
  const results = story.questions.map((q, i) => answers[i] === q.answer);
  const correct = results.filter(Boolean).length;
  return { correct, total: story.questions.length, passed: correct >= Math.min(LIBRARY_RULES.storyPassCorrect, story.questions.length), results };
}

// ---------------------------------------------------------------------------
// ごほうびの 対象か（やりきったか）
// ---------------------------------------------------------------------------
export type LibraryActivity =
  | { kind: "story"; id: string; answers: number[] }
  | { kind: "chant"; id: string; finished: boolean }
  | { kind: "talk"; id: string; turns: number };

export function isActivityComplete(activity: LibraryActivity, story?: Pick<Story, "questions"> | null): boolean {
  switch (activity.kind) {
    case "story": return !!story && gradeStory(story, activity.answers).passed;
    case "chant": return activity.finished === true;
    case "talk": return Number.isFinite(activity.turns) && activity.turns >= LIBRARY_RULES.talkMinTurns;
  }
}

// 読み上げの ハイライト用（ことばの 位置）は words.ts（tts.ts からも 読むので 小さく 分けた）
export { bareWord, estimateWordDurations, wordIndexAt, wordRanges, type WordRange } from "./words";
import { wordRanges } from "./words";

// ---------------------------------------------------------------------------
// データの チェック（tests/library.test.ts・scripts/library-index.ts）
// ---------------------------------------------------------------------------
const JA_CHARS = /[぀-ヿ㐀-鿿]/;
const STAGE_LESSONS: Record<number, [number, number]> = { 1: [0, 359], 2: [360, 599], 3: [600, 839], 4: [840, 1049], 5: [1050, 1199] };

export function validateStory(s: Story): string[] {
  const e: string[] = [];
  const at = (m: string) => e.push(`${s.id}: ${m}`);
  if (!/^s\d-\d{2}$/.test(s.id)) at("id の形が ちがう（s1-01 のように）");
  const range = STAGE_LESSONS[s.stage];
  if (!range) at(`stage ${s.stage} が ない`);
  else if (s.unlockLesson < range[0] || s.unlockLesson > range[1]) at(`unlockLesson ${s.unlockLesson} が ステージ${s.stage} の 範囲の 外`);
  if (!s.title || !s.titleJa || !s.emoji || !s.level) at("タイトル・絵文字・レベルが ない");
  if (s.lines.length < 6 || s.lines.length > 16) at(`本文の 行数 ${s.lines.length}（6〜16）`);
  for (const [i, l] of s.lines.entries()) {
    if (!l.en.trim() || !l.ja.trim()) at(`${i + 1}行目が からっぽ`);
    if (JA_CHARS.test(l.en)) at(`${i + 1}行目の 英語に 日本語が まじっている`);
    if (!JA_CHARS.test(l.ja)) at(`${i + 1}行目の 日本語訳が ない`);
  }
  if (s.words.length < 1 || s.words.length > 5) at("あたらしい ことばは 1〜5");
  if (s.questions.length !== 3) at(`しつもんは 3問（いま ${s.questions.length}）`);
  for (const [i, q] of s.questions.entries()) {
    if (!q.q.trim() || !q.qJa.trim()) at(`Q${i + 1} の 文が ない`);
    if (q.choices.length !== 3) at(`Q${i + 1} の 選択肢は 3つ`);
    if (new Set(q.choices.map((c) => c.toLowerCase())).size !== q.choices.length) at(`Q${i + 1} の 選択肢が かさなっている`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) at(`Q${i + 1} の answer が 範囲の 外`);
    if (q.choices.some((c) => JA_CHARS.test(c))) at(`Q${i + 1} の 選択肢に 日本語`);
  }
  return e;
}

export function validateChant(c: Chant): string[] {
  const e: string[] = [];
  if (!/^c-\d{2}$/.test(c.id)) e.push(`${c.id}: id の形`);
  if (c.lines.length < 3 || c.lines.length > 8) e.push(`${c.id}: 行数 ${c.lines.length}`);
  for (const l of c.lines) if (!l.en.trim() || JA_CHARS.test(l.en) || !JA_CHARS.test(l.ja)) e.push(`${c.id}: 行の 英語・日本語`);
  if (!c.focusJa) e.push(`${c.id}: focusJa が ない`);
  return e;
}

export function validateTalkTheme(t: TalkTheme): string[] {
  const e: string[] = [];
  if (!/^t-[a-z]+$/.test(t.id)) e.push(`${t.id}: id の形`);
  if (!["haru", "riko", "kiko", "birimo"].includes(t.character)) e.push(`${t.id}: character`);
  if (t.unlockLesson < LIBRARY_RULES.freeTalkUnlockLesson) e.push(`${t.id}: フリートークは Lesson ${LIBRARY_RULES.freeTalkUnlockLesson} から`);
  if (t.lines.length < 4) e.push(`${t.id}: 台本の 行が すくない`);
  if (t.targetExpressions.length < 2) e.push(`${t.id}: targetExpressions は 2つ以上`);
  if (!t.starterEn || JA_CHARS.test(t.starterEn) || !t.goalJa) e.push(`${t.id}: starterEn / goalJa`);
  // 個人情報を きく 台本に しない
  if (/\b(your name|address|what school|which school|phone|e-?mail|how old|your birthday|where do you live)\b/i.test([t.starterEn, ...t.lines.map((l) => l.en)].join(" "))) e.push(`${t.id}: 個人情報を きく ことばが ある`);
  return e;
}

export function storyWordCount(s: Pick<Story, "lines">): number {
  return s.lines.reduce((n, l) => n + wordRanges(l.en).length, 0);
}

/** 読む（2回 きく くらい）＋ クイズの めやす */
export const storyMinutes = (words: number) => Math.max(2, Math.round(words / 40) + 1);
