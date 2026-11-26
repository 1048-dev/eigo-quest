/**
 * ワールド30 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w30Say, w30Example, W30_START, abbrDisplay, abbrOf, abbrWhy, autoDisplay, autoOf, autoWhy, casualDisplay, casualOf, casualPrompt, casualWhy, icDisplay, icOf, icWhy, transDisplay, transOf, transWhy } from "../w30Phonics";

/**
 * ワールド30（みらい都市・L871〜）の フォニックス（auto-・trans-・-ic の 強勢・略語の 読みかた・くだけた 話しことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - auto-（"autograph"）: 「auto（じぶんで）の ことば。いみに あう ことばは どれ？」（いみ → ことば）
 * - trans-（"transport"）: 「trans の あとに つづく パーツは どれ？」（trans ＋ ＿＿（はこぶ）→ port / form / mit）
 * - -ic（"electric"）: 「-ic の ことば。どこを いちばん つよく いう？」（e-LEC-tric / E-lec-tric / e-lec-TRIC）
 * - 略語（"km"）: 「なんと よむ？」（キロメーターズ / ケーエム / クム）
 * - 話しことば（"I'm gonna try it"）: 「gonna を ふつうの いいかたに すると？」（going to / gone to / go and）
 * あてはまらなければ null。ワールド29 の 問題より 先に よぶ（automatic を ワールド12 の はく、electric を ほかの ワールドで 問わない）。
 */
export function w30Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W30_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const a = autoOf(item.text);
  if (a && focus.includes("auto-")) return { promptJa: "auto（じぶんで）の ことば。いみに あう ことばは どれ？", display: autoDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: autoWhy(a) };
  const t = transOf(item.text);
  if (t && focus.includes("trans-")) return { promptJa: "trans の あとに つづく パーツは どれ？", display: transDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: transWhy(t) };
  const c = icOf(item.text);
  if (c && focus.includes("-ic")) return { promptJa: "-ic の ことば。どこを いちばん つよく いう？", display: icDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: icWhy(c) };
  const b = abbrOf(item.text);
  if (b && focus.includes(b.abbr)) return { promptJa: "なんと よむ？", display: abbrDisplay(b), choices: pick([b.answer, ...b.wrong]), answer: b.answer, explanationJa: abbrWhy(b) };
  const k = casualOf(item.text);
  if (k && focus.includes(k.form)) return { promptJa: casualPrompt(k), display: casualDisplay(k), choices: pick([k.answer, ...k.wrong]), answer: k.answer, explanationJa: casualWhy(k) };
  return null;
}

export const phonics: WorldPhonics = { world: 30, start: W30_START, question: w30Question, say: w30Say, example: w30Example };
