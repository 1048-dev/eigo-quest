/**
 * ワールド27 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w27Say, w27Example, FOR_SINCE_CHOICES, W27_START, ableDisplay, ableOf, ableWhy, chKOf, chKWhy, forSinceDisplay, forSinceOf, forSinceWhy, homoOf, homoWhy, silentOf, silentWhy } from "../w27Phonics";

/**
 * ワールド27（いずみの里・L781〜）の フォニックス（k の おとの ch と -ache・だまって いる もじ・for と since・-able・同音異義語 2）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - ch / -ache（"stomach" "headache"）: 「ただしい つづりは どれ？」（ずつう → headache / headake / hedache）
 * - だまって いる もじ（"knee"）: 「こえに ださない もじは どれ？」（k / n / e）
 * - for / since（"for ten years"）: 「＿＿ に 入る ことばは どれ？」（for / since / from。選択肢は きまった 順）
 * - -able（"comfortable"）: 「able の ことばで ただしい つづりは どれ？」
 * - 同音異義語（"weak"）: 「ぶんに あう ことばは どれ？」（weak / week / wake）
 * あてはまらなければ null。ワールド26 の 問題より 先に よぶ（knee を ワールド14 の kn、here を ワールド17 の 同音異義語で 問わない）。
 */
export function w27Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W27_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const c = chKOf(item.text);
  if (c && focus.includes(c.focus)) return { promptJa: "ただしい つづりは どれ？", display: `🔊（${c.meaning}）`, choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: chKWhy(c) };
  const s = silentOf(item.text);
  if (s && focus.includes(s.letter)) return { promptJa: "こえに ださない もじは どれ？", display: `${s.word}（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: silentWhy(s) };
  const f = forSinceOf(item.text);
  if (f && focus.includes(f.focus)) return { promptJa: "＿＿ に 入る ことばは どれ？", display: forSinceDisplay(f), choices: FOR_SINCE_CHOICES.map((x) => ({ id: x, label: x })), answer: f.answer, explanationJa: forSinceWhy(f) };
  const a = ableOf(item.text);
  if (a && focus.includes("-able")) return { promptJa: "able の ことばで ただしい つづりは どれ？", display: ableDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: ableWhy(a) };
  const h = homoOf(item.text);
  if (h && focus.includes(h.focus)) return { promptJa: "ぶんに あう ことばは どれ？", display: h.sentence, choices: pick([h.answer, ...h.wrong]), answer: h.answer, explanationJa: homoWhy(h) };
  return null;
}

export const phonics: WorldPhonics = { world: 27, start: W27_START, question: w27Question, say: w27Say, example: w27Example };
