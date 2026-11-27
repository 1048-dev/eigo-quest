/**
 * ワールド31 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w31Say, w31Example, W31_START, familyDisplay as family31Display, familyOf as family31Of, familyWhy as family31Why, personDisplay as person31Display, personOf as person31Of, personWhy as person31Why, portDisplay, portOf, portWhy, structDisplay, structOf, structWhy, yearDisplay, yearOf, yearWhy } from "../w31Phonics";

/**
 * ワールド31（ときの回廊・L901〜）の フォニックス（動詞と 名詞の 家族・年号の 読みかた・語根 struct・-ian / -ist・語根 port）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - 家族（"invention"）: 「動詞を 名詞（もの・こと）に すると？」（invent（はつめいする）→ ＿＿ → invention / inventment / invental）
 * - 年号（"1868"）: 「英語で なんと よむ？」（eighteen sixty-eight / one eight six eight / eighty-six eighteen）
 * - struct（"construction"）: 「struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？」
 * - -ian / -ist（"musician"）: 「〜を する 人は？ あう ことばは どれ？」（musician / musicist / musicer）
 * - port（"export"）: 「port の ことば。いみは どれ？」（ことば → いみ）
 * あてはまらなければ null。ワールド30 の 問題より 先に よぶ（invention を ワールド23 の -tion、magician を ワールド30 で 問わない）。
 */
export function w31Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W31_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const f = family31Of(item.text);
  if (f && focus.includes(f.ending)) return { promptJa: "動詞を 名詞（もの・こと）に すると？", display: family31Display(f), choices: pick([f.answer, ...f.wrong]), answer: f.answer, explanationJa: family31Why(f) };
  const y = yearOf(item.text);
  if (y && focus.includes(y.word)) return { promptJa: "英語で なんと よむ？", display: yearDisplay(y), choices: pick([y.answer, ...y.wrong]), answer: y.answer, explanationJa: yearWhy(y), audioText: y.answer };
  const s = structOf(item.text);
  if (s && focus.includes("struct")) return { promptJa: "struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？", display: structDisplay(s), choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: structWhy(s) };
  const p = person31Of(item.text);
  if (p && focus.includes(p.ending)) return { promptJa: "〜を する 人は？ あう ことばは どれ？", display: person31Display(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: person31Why(p) };
  const o = portOf(item.text);
  if (o && focus.includes("port")) return { promptJa: "port の ことば。いみは どれ？", display: portDisplay(o), choices: pick([o.answer, ...o.wrong]), answer: o.answer, explanationJa: portWhy(o) };
  return null;
}

export const phonics: WorldPhonics = { world: 31, start: W31_START, question: w31Question, say: w31Say, example: w31Example };
