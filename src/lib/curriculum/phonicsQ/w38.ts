/**
 * ワールド38 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w38Say, w38Example, W38_START, characterDisplay, characterOf, characterWhy, feelingSpellDisplay, feelingSpellOf, feelingSpellWhy, idiomDisplay, idiomOf, idiomWhy, phrasalDisplay, phrasalOf, phrasalWhy, toneDisplay, toneOf, toneWhy } from "../w38Phonics";

/**
 * ワールド38（こころの高原・L1111〜）の フォニックス（気持ちの ことばの つづり・句動詞・共感の イントネーション・慣用句・性格の ことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - つづり（"embarrassed"）: 「気持ちの ことばの つづり。ただしい つづりは どれ？」（I fell in front of everyone. I was so ＿＿. → embarrassed / embarassed / embarrased）
 * - 句動詞（"cheer up"）: 「気持ちの 句動詞。＿＿ に 入る ことばは どれ？」（Cheer ＿＿! You'll do better next time. → up / down / off）
 * - イントネーション（"Oh no"）: 「共感の イントネーション。この 返事は どんな 声で いう？」（↘ ひくく・ゆっくり・やさしく など）
 * - 慣用句（"over the moon"）: 「気持ちの 慣用句。＿＿ に 入る ことばは どれ？」（I'm over the ＿＿! → moon / sun / rain）
 * - 性格の ことば（"helpful"）: 「性格の ことば。＿＿ に 入る おわりは どれ？」（help＿＿ → -ful / -ive / -ous）
 * あてはまらなければ null。ワールド37 の 問題より 先に よぶ。
 */
export function w38Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W38_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const f = feelingSpellOf(item.text);
  if (f && focus.includes(f.word)) return { promptJa: "気持ちの ことばの つづり。ただしい つづりは どれ？", display: feelingSpellDisplay(f), choices: pick([f.answer, ...f.wrong]), answer: f.answer, explanationJa: feelingSpellWhy(f) };
  const p = phrasalOf(item.text);
  if (p && focus.includes(p.phrase)) return { promptJa: "気持ちの 句動詞。＿＿ に 入る ことばは どれ？", display: phrasalDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: phrasalWhy(p) };
  const t = toneOf(item.text);
  if (t && focus.includes(t.phrase.toLowerCase())) return { promptJa: "共感の イントネーション。この 返事は どんな 声で いう？", display: toneDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: toneWhy(t) };
  const i = idiomOf(item.text);
  if (i && focus.includes(i.key)) return { promptJa: "気持ちの 慣用句。＿＿ に 入る ことばは どれ？", display: idiomDisplay(i), choices: pick([i.answer, ...i.wrong]), answer: i.answer, explanationJa: idiomWhy(i) };
  const c = characterOf(item.text);
  if (c && focus.includes(c.suffix)) return { promptJa: "性格の ことば。＿＿ に 入る おわりは どれ？", display: characterDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: characterWhy(c) };
  return null;
}

export const phonics: WorldPhonics = { world: 38, start: W38_START, question: w38Question, say: w38Say, example: w38Example };
