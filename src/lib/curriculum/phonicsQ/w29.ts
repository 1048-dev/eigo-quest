/**
 * ワールド29 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w29Say, w29Example, W29_START, dictOf, dictWhy, emphasisDisplay, emphasisOf, emphasisWhy, ibleOf, ibleWhy, spectDisplay, spectOf, spectWhy, weakDisplay, weakOf, weakPrompt, weakWhy } from "../w29Phonics";

/**
 * ワールド29（かんがえる灯台・L841〜）の フォニックス（語根 spect・語根 dict・意見を 強める 強勢・弱形・-ible / -able）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - spect（"inspect"）: 「spect（みる）の ことば。いみは どれ？」（答えも 選択肢も いみ）
 * - dict（"predict"）: 「ぶんに あう dict の ことばは どれ？」（Can you ＿＿ the weather for tomorrow?）
 * - 強勢（"I really think so"）: 「いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？」（really / think / so）
 * - 弱形（"I can help you"）: 「ふつうの はやさで いうと、can は どう きこえる？」（クン / キャン / カーン。選択肢は きまった 順）
 * - -ible / -able（"possible"）: 「ただしい つづりは どれ？」（possible / possable / posible）
 * あてはまらなければ null。ワールド28 の 問題より 先に よぶ（prediction を ワールド23 の -tion、respectable を ワールド27 の -able で 問わない）。
 */
export function w29Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W29_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const s = spectOf(item.text);
  if (s && focus.includes("spect")) return { promptJa: "spect（みる）の ことば。いみは どれ？", display: spectDisplay(s), choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: spectWhy(s) };
  const d = dictOf(item.text);
  if (d && focus.includes("dict")) return { promptJa: "ぶんに あう dict の ことばは どれ？", display: d.sentence, choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: dictWhy(d) };
  const e = emphasisOf(item.text);
  if (e && focus.includes(e.strong.toLowerCase())) return { promptJa: "いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？", display: emphasisDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: emphasisWhy(e) };
  const w = weakOf(item.text);
  if (w && focus.includes(w.weak)) return { promptJa: weakPrompt(w), display: weakDisplay(w), choices: w.choices.map((x) => ({ id: x, label: x })), answer: w.answer, explanationJa: weakWhy(w) };
  const b = ibleOf(item.text);
  if (b && focus.includes(b.focus)) return { promptJa: "ただしい つづりは どれ？", display: `🔊（${b.meaning}）`, choices: pick([b.answer, ...b.wrong]), answer: b.answer, explanationJa: ibleWhy(b) };
  return null;
}

export const phonics: WorldPhonics = { world: 29, start: W29_START, question: w29Question, say: w29Say, example: w29Example };
