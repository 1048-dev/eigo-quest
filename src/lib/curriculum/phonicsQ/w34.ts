/**
 * ワールド34 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w34Say, w34Example, W34_START, doubleDisplay, doubleOf, doubleWhy, izeDisplay, izeOf, izeWhy, travelNumberDisplay, travelNumberOf, travelNumberWhy, ukUsDisplay, ukUsOf, ukUsPrompt, ukUsWhy, visDisplay, visOf, visWhy } from "../w34Phonics";

/**
 * ワールド34（つばさの空港・L991〜）の フォニックス（空港の 数字の 読みかた・語根 vis・2つ ならぶ 文字・-ize の 動詞・イギリス英語と アメリカ英語）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - 数字（"Flight 205"）: 「空港の 数字。英語で なんと よむ？」（two oh five / twenty-five / two fifty）。音は 読みかたの 文（Flight two oh five.）
 * - vis（"visa"）: 「vis（見る）の ことば。英語の せつめいに あう ことばは どれ？」（a paper or stamp that lets you enter a country → visa / vision / visit）
 * - 2つ ならぶ 文字（"recommend"）: 「ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）」（recommend / reccomend / recomend）
 * - -ize（"apologize"）: 「-ize を つけて 動詞に すると？ ただしい つづりは どれ？」（apology → apologize / apologyize / appologize）
 * - イギリス英語と アメリカ英語（"lift"・"colour"）: 「イギリス英語では なんと いう？」（アメリカ: elevator → lift / flat / queue）・「イギリスの つづりは どれ？」
 * あてはまらなければ null。ワールド33 の 問題より 先に よぶ。
 */
export function w34Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W34_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const n = travelNumberOf(item.text);
  if (n && focus.includes(n.word)) return { promptJa: "空港の 数字。英語で なんと よむ？", display: travelNumberDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: travelNumberWhy(n), audioText: n.say };
  const v = visOf(item.text);
  if (v && focus.includes("vis")) return { promptJa: "vis（見る）の ことば。英語の せつめいに あう ことばは どれ？", display: visDisplay(v), choices: pick([v.answer, ...v.wrong]), answer: v.answer, explanationJa: visWhy(v) };
  const d = doubleOf(item.text);
  if (d && focus.includes(d.focus)) return { promptJa: "ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）", display: doubleDisplay(d), choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: doubleWhy(d) };
  const z = izeOf(item.text);
  if (z && focus.includes("-ize")) return { promptJa: "-ize を つけて 動詞に すると？ ただしい つづりは どれ？", display: izeDisplay(z), choices: pick([z.answer, ...z.wrong]), answer: z.answer, explanationJa: izeWhy(z) };
  const u = ukUsOf(item.text);
  if (u && focus.includes(u.word)) return { promptJa: ukUsPrompt(u), display: ukUsDisplay(u), choices: pick([u.answer, ...u.wrong]), answer: u.answer, explanationJa: ukUsWhy(u) };
  return null;
}

export const phonics: WorldPhonics = { world: 34, start: W34_START, question: w34Question, say: w34Say, example: w34Example };
