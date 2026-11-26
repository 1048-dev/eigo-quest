/**
 * ワールド39 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w39Say, w39Example, W39_START, bigNumberDisplay, bigNumberOf, bigNumberWhy, debateDisplay, debateOf, debateWhy, ecoWordDisplay, ecoWordOf, ecoWordWhy, hedgeDisplay, hedgeOf, hedgeWhy, markerDisplay, markerOf, markerWhy } from "../w39Phonics";

/**
 * ワールド39（せかいの円卓・L1141〜）の フォニックス（環境の ことばの パーツ・大きな 数と 割合・ディベートの プロソディ・つなぎの ことば・ヘッジの ことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - パーツ（"renewable"）: 「環境の ことばの パーツ。＿＿ に 入る パーツは どれ？」（re ＋ ＿＿ ＋ able → new / cycle / duce）
 * - 数（"one million"）: 「大きな 数と 割合。英語で どう よむ？」（1,000,000 → one million / one billion / ten thousand）
 * - プロソディ（"We believe that"）: 「ディベートの プロソディ。いちばん つよく いう ことばは どれ？」（We believe that schools should have gardens. → believe）
 * - つなぎ（"However"）: 「つなぎの ことば。＿＿ に 入る ことばは どれ？」（Plastic is useful. ＿＿, it can harm the sea. → However）
 * - ヘッジ（"probably"）: 「ヘッジの ことば。いいすぎない ことばは どれ？」（It will ＿＿ rain this afternoon.（たぶん）→ probably / definitely / never）
 * あてはまらなければ null。ワールド38 の 問題より 先に よぶ。
 */
export function w39Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W39_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const e = ecoWordOf(item.text);
  if (e && focus.includes(e.word)) return { promptJa: "環境の ことばの パーツ。＿＿ に 入る パーツは どれ？", display: ecoWordDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: ecoWordWhy(e) };
  const n = bigNumberOf(item.text);
  if (n && focus.includes(n.word)) return { promptJa: "大きな 数と 割合。英語で どう よむ？", display: bigNumberDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: bigNumberWhy(n), audioText: n.answer };
  const d = debateOf(item.text);
  if (d && focus.includes(d.phrase.toLowerCase())) return { promptJa: "ディベートの プロソディ。いちばん つよく いう ことばは どれ？", display: debateDisplay(d), choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: debateWhy(d), audioText: d.sentence };
  const m = markerOf(item.text);
  if (m && focus.includes(m.marker.toLowerCase())) return { promptJa: "つなぎの ことば。＿＿ に 入る ことばは どれ？", display: markerDisplay(m), choices: pick([m.answer, ...m.wrong]), answer: m.answer, explanationJa: markerWhy(m) };
  const h = hedgeOf(item.text);
  if (h && focus.includes(h.word)) return { promptJa: "ヘッジの ことば。いいすぎない ことばは どれ？", display: hedgeDisplay(h), choices: pick([h.answer, ...h.wrong]), answer: h.answer, explanationJa: hedgeWhy(h) };
  return null;
}

export const phonics: WorldPhonics = { world: 39, start: W39_START, question: w39Question, say: w39Say, example: w39Example };
