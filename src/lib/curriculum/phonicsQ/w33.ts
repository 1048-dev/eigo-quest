/**
 * ワールド33 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w33Say, w33Example, W33_START, jectDisplay, jectOf, jectWhy, listDisplay, listOf, listPrompt, listWhy, nounEndDisplay, nounEndOf, nounEndWhy, proofDisplay, proofOf, proofWhy, ruptDisplay, ruptOf, ruptWhy } from "../w33Phonics";

/**
 * ワールド33（ほのおの火山島・L961〜）の フォニックス（語根 rupt・名詞の おわり -ance / -ence / -ency / -ty・-proof の 複合語・リストの 読みかた・語根 ject）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - rupt（"erupt"）: 「rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？」（文と いみ → erupt / eruption / interrupt）
 * - 名詞の おわり（"distance"）: 「ものの なまえ（名詞）に すると？ ただしい つづりは どれ？」（distance / distence / distanse）
 * - -proof（"waterproof"）: 「-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？」（waterproof / fireproof / soundproof）
 * - リスト（"We need water, food, and a flashlight"）: 「リストを いう ときの こえの 上がり下がりは どれ？」（water ↗, food ↗, and a flashlight ↘）。
 *   音は 文の おわりに . か ? を つけて よむ（? が ないと TTS が どっち？の 上がり下がりで よまない）
 * - ject（"project"）: 「ject（なげる）の まえに つく パーツは どれ？」（＿＿ject「けいかく」→ pro / in / ob）
 * あてはまらなければ null。ワールド32 の 問題より 先に よぶ。
 */
export function w33Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W33_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const r = ruptOf(item.text);
  if (r && focus.includes("rupt")) return { promptJa: "rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？", display: ruptDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: ruptWhy(r) };
  const e = nounEndOf(item.text);
  if (e && focus.includes(e.focus)) return { promptJa: "ものの なまえ（名詞）に すると？ ただしい つづりは どれ？", display: nounEndDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: nounEndWhy(e) };
  const p = proofOf(item.text);
  if (p && focus.includes("-proof")) return { promptJa: "-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？", display: proofDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: proofWhy(p) };
  const l = listOf(item.text);
  if (l && focus.includes(l.focus)) return { promptJa: listPrompt(l), display: listDisplay(l), choices: pick([l.answer, ...l.wrong]), answer: l.answer, explanationJa: listWhy(l), audioText: l.say };
  const j = jectOf(item.text);
  if (j && focus.includes("ject")) return { promptJa: "ject（なげる）の まえに つく パーツは どれ？", display: jectDisplay(j), choices: pick([j.answer, ...j.wrong]), answer: j.answer, explanationJa: jectWhy(j) };
  return null;
}

export const phonics: WorldPhonics = { world: 33, start: W33_START, question: w33Question, say: w33Say, example: w33Example };
