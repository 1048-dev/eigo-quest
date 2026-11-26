/**
 * ワールド32 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w32Say, w32Example, W32_START, alDisplay, alOf, alWhy, dataDisplay, dataOf, dataWhy, directionDisplay, directionOf, directionWhy, geoDisplay, geoOf, geoWhy, numberDisplay, numberOf, numberWhy } from "../w32Phonics";

/**
 * ワールド32（たいようの砂漠・L931〜）の フォニックス（語根 geo・-al・方角の ことば・数と 分数と 割合の 読みかた・データの ことばの つづり）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - geo（"geology"）: 「geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？」（パーツと いみ → ことば）
 * - -al（"natural"）: 「-al を つけて ようすの ことばに。ただしい つづりは どれ？」（natural / natureal / naturel）
 * - 方角（"northern" "northeast" "upward"）: 「ほうがくの ことば。あう ことばは どれ？」（northern / northen / northal）
 * - 数（"1/2" "30%" "2.5"）: 「英語で なんと よむ？」（one half / one two / two ones）。音は 答えの よみで よむ（1/2 を 日づけと よまない ように）
 * - データの ことば（"average"）: 「ただしい つづりは どれ？」（average / averege / avrage）
 * あてはまらなければ null。ワールド31 の 問題より 先に よぶ（-al の ことばを ワールド31 の 家族、geologist を -ist で 問わない）。
 */
export function w32Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W32_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const g = geoOf(item.text);
  if (g && focus.includes("geo")) return { promptJa: "geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？", display: geoDisplay(g), choices: pick([g.answer, ...g.wrong]), answer: g.answer, explanationJa: geoWhy(g) };
  const a = alOf(item.text);
  if (a && focus.includes("-al")) return { promptJa: "-al を つけて ようすの ことばに。ただしい つづりは どれ？", display: alDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: alWhy(a) };
  const d = directionOf(item.text);
  if (d && focus.includes(d.focus)) return { promptJa: "ほうがくの ことば。あう ことばは どれ？", display: directionDisplay(d), choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: directionWhy(d) };
  const n = numberOf(item.text);
  if (n && focus.includes(n.word)) return { promptJa: "英語で なんと よむ？", display: numberDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: numberWhy(n), audioText: n.answer };
  const t = dataOf(item.text);
  if (t && focus.includes(t.focus)) return { promptJa: "ただしい つづりは どれ？", display: dataDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: dataWhy(t) };
  return null;
}

export const phonics: WorldPhonics = { world: 32, start: W32_START, question: w32Question, say: w32Say, example: w32Example };
