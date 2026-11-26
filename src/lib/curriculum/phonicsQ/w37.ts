/**
 * ワールド37 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w37Say, w37Example, W37_START, adverbDisplay, adverbOf, adverbWhy, simileDisplay, simileOf, simileWhy, soundWordDisplay, soundWordOf, soundWordWhy, storyVerbDisplay, storyVerbOf, storyVerbWhy, suspenseDisplay, suspenseOf, suspenseWhy } from "../w37Phonics";

/**
 * ワールド37（おとぎの迷宮・L1081〜）の フォニックス（物語の 動詞・音の ことば・語りの 間・-ly の 副詞・たとえ）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - 物語の 動詞（"whisper"）: 「物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？」（say very quietly, using only your breath → ＿＿ → whisper / grin / stumble）
 * - 音の ことば（"splash"）: 「音の ことば。この 場面の 音は どれ？」（The frog jumped into the pond. ＿＿! → splash / creak / hiss）
 * - 語りの 間（"She opened the box, and inside was a tiny dragon"）: 「お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？」（was / She / tiny）
 * - -ly（"silently"）: 「どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？」（英語の 文 → silently / proudly / eagerly）
 * - たとえ（"as brave as a lion"）: 「たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？」（as brave as a ＿＿ → lion / mouse / snail）
 * あてはまらなければ null。ワールド36 の 問題より 先に よぶ。
 */
export function w37Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W37_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const v = storyVerbOf(item.text);
  if (v && focus.includes(v.word)) return { promptJa: "物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？", display: storyVerbDisplay(v), choices: pick([v.answer, ...v.wrong]), answer: v.answer, explanationJa: storyVerbWhy(v) };
  const so = soundWordOf(item.text);
  if (so && focus.includes(so.word)) return { promptJa: "音の ことば。この 場面の 音は どれ？", display: soundWordDisplay(so), choices: pick([so.answer, ...so.wrong]), answer: so.answer, explanationJa: soundWordWhy(so) };
  const p = suspenseOf(item.text);
  if (p && focus.includes(p.pause.toLowerCase())) return { promptJa: "お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？", display: suspenseDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: suspenseWhy(p) };
  const a = adverbOf(item.text);
  if (a && focus.includes("-ly")) return { promptJa: "どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？", display: adverbDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: adverbWhy(a) };
  const m = simileOf(item.text);
  if (m && focus.includes(m.kind)) return { promptJa: "たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？", display: simileDisplay(m), choices: pick([m.answer, ...m.wrong]), answer: m.answer, explanationJa: simileWhy(m) };
  return null;
}

export const phonics: WorldPhonics = { world: 37, start: W37_START, question: w37Question, say: w37Say, example: w37Example };
