/**
 * ワールド40 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w40Say, w40Example, W40_START, partsReviewDisplay, partsReviewOf, partsReviewWhy, pauseReviewDisplay, pauseReviewOf, pauseReviewWhy, rootReviewDisplay, rootReviewOf, rootReviewWhy, soundCheckDisplay, soundCheckOf, soundCheckWhy, spellReviewDisplay, spellReviewOf, spellReviewWhy } from "../w40Phonics";

/**
 * ワールド40（はじまりの星・L1171〜）の フォニックス（6 年間の 総まとめ: つづり・ことばの パーツ・語根・スピーチの 間・苦手な 音）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - つづり（"rain"）: 「つづりの まとめ。＿＿ に 入る つづりは どれ？」（r＿＿n（雨）→ ai / ay / ei）
 * - パーツ（"unhappy"）: 「ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？」（＿＿ ＋ happy → un / dis / re）
 * - 語根（"inspect"）: 「語根の まとめ。おなじ 語根の なかまは どれ？」（inspect（しらべる）→ spectator / structure / export）
 * - スピーチの 間（"Six years ago"）: 「スピーチの 間。どの ことばの あとで 間（‖）を とる？」（Six years ago I didn't know any English. → ago）
 * - 苦手な 音（"right"）: 「苦手な 音の 総点検。きこえた ことばは どれ？」（🔊 right → right / light / night）
 * あてはまらなければ null。ワールド39 の 問題より 先に よぶ。
 */
export function w40Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W40_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const s = spellReviewOf(item.text);
  if (s && focus.includes(s.word)) return { promptJa: "つづりの まとめ。＿＿ に 入る つづりは どれ？", display: spellReviewDisplay(s), choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: spellReviewWhy(s) };
  const p = partsReviewOf(item.text);
  if (p && focus.includes(p.word)) return { promptJa: "ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？", display: partsReviewDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: partsReviewWhy(p) };
  const r = rootReviewOf(item.text);
  if (r && focus.includes(r.word)) return { promptJa: "語根の まとめ。おなじ 語根の なかまは どれ？", display: rootReviewDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: rootReviewWhy(r) };
  const a = pauseReviewOf(item.text);
  if (a && focus.includes(a.phrase.toLowerCase())) return { promptJa: "スピーチの 間。どの ことばの あとで 間（‖）を とる？", display: pauseReviewDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: pauseReviewWhy(a), audioText: a.spoken };
  const o = soundCheckOf(item.text);
  if (o && focus.includes(o.word)) return { promptJa: "苦手な 音の 総点検。きこえた ことばは どれ？", display: soundCheckDisplay(o), choices: pick([o.answer, ...o.wrong]), answer: o.answer, explanationJa: soundCheckWhy(o), audioText: o.word };
  return null;
}

export const phonics: WorldPhonics = { world: 40, start: W40_START, question: w40Question, say: w40Say, example: w40Example };
