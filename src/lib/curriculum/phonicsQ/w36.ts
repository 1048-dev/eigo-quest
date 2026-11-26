/**
 * ワールド36 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w36Say, w36Example, W36_START, academicDisplay, academicOf, academicWhy, bioDisplay, bioOf, bioWhy, ologyDisplay, ologyOf, ologyWhy, pauseDisplay, pauseOf, pauseWhy,unitDisplay, unitOf, unitWhy } from "../w36Phonics";

/**
 * ワールド36（しんかいの都・L1051〜）の フォニックス（語根 bio・学習語彙の 強勢・発表の 区切り・-ology と -ologist・数と たんいの 読みかた）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - bio（"biology"）: 「bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？」（＿＿: the study of living things → biology / biography / biosphere）
 * - 強勢（"research"）: 「つよく いう ところ（●）が あう ことばは どれ？」（○●（2つの 音の 2ばんめを つよく）→ research / summary / topic）
 * - 区切り（"In short, the deep sea is dark and cold"）: 「発表の 文。ひと いき いれる（｜）のは どの ことばの あと？」（short / the / deep）
 * - -ology（"zoology"）: 「-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？」（英語の 文 → zoology / zoologist / zooology）
 * - 数と たんい（"-2°C"）: 「数と たんいの 読みかた。英語で どう よむ？」（minus two degrees / two minus degrees / minus twenty degrees）
 * あてはまらなければ null。ワールド35 の 問題より 先に よぶ。
 */
export function w36Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W36_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const b = bioOf(item.text);
  if (b && focus.includes("bio")) return { promptJa: "bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？", display: bioDisplay(b), choices: pick([b.answer, ...b.wrong]), answer: b.answer, explanationJa: bioWhy(b) };
  const st = academicOf(item.text);
  if (st && focus.includes(st.word)) return { promptJa: "つよく いう ところ（●）が あう ことばは どれ？", display: academicDisplay(st), choices: pick([st.answer, ...st.wrong]), answer: st.answer, explanationJa: academicWhy(st) };
  const p = pauseOf(item.text);
  if (p && focus.includes(p.pause.toLowerCase())) return { promptJa: "発表の 文。ひと いき いれる（｜）のは どの ことばの あと？", display: pauseDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: pauseWhy(p) };
  const o = ologyOf(item.text);
  if (o && focus.includes(o.kind)) return { promptJa: "-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？", display: ologyDisplay(o), choices: pick([o.answer, ...o.wrong]), answer: o.answer, explanationJa: ologyWhy(o) };
  const u = unitOf(item.text);
  if (u && focus.includes(u.word)) return { promptJa: "数と たんいの 読みかた。英語で どう よむ？", display: unitDisplay(u), choices: pick([u.answer, ...u.wrong]), answer: u.answer, explanationJa: unitWhy(u), audioText: u.answer };
  return null;
}

export const phonics: WorldPhonics = { world: 36, start: W36_START, question: w36Question, say: w36Say, example: w36Example };
