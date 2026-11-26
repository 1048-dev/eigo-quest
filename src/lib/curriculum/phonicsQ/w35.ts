/**
 * ワールド35 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w35Say, w35Example, W35_START, contrastDisplay, contrastOf, contrastWhy, formalDisplay, formalOf, formalWhy, interCoDisplay, interCoOf, interCoWhy, ityDisplay, ityOf, ityWhy, rootDisplay, rootOf, rootWhy } from "../w35Phonics";

/**
 * ワールド35（ちえの議事堂・L1021〜）の フォニックス（-ity の 名詞・inter- と co-・対比の 強勢・あらたまった ことば・ステージ4 の 語根の まとめ）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - -ity（"responsibility"）: 「-ity の ことば。もとの ことば（形容詞）は どれ？」（responsible / responsable / responsibil）
 * - inter- と co-（"cooperate"）: 「inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？」（英語の 文 → cooperate / interview / intersection）
 * - 対比の 強勢（"I said Thursday"）: 「B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？」（A: Did you say Tuesday? → Thursday / I / said）
 * - あらたまった ことば（"receive"）: 「あらたまった ことば（手紙・発表で つかう）は どれ？」（ふだん: get → receive / recieve / receeve）
 * - 語根（"inspect"）: 「ステージ4 の 語根。＿＿ に 入る パーツは どれ？」（in＿＿（中まで よく 見る）→ spect / port / rupt）
 * あてはまらなければ null。ワールド34 の 問題より 先に よぶ。
 */
export function w35Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W35_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const t = ityOf(item.text);
  if (t && focus.includes("-ity")) return { promptJa: "-ity の ことば。もとの ことば（形容詞）は どれ？", display: ityDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: ityWhy(t) };
  const ic = interCoOf(item.text);
  if (ic && focus.includes(ic.prefix)) return { promptJa: "inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？", display: interCoDisplay(ic), choices: pick([ic.answer, ...ic.wrong]), answer: ic.answer, explanationJa: interCoWhy(ic) };
  const c = contrastOf(item.text);
  if (c && focus.includes(c.strong.toLowerCase())) return { promptJa: "B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？", display: contrastDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: contrastWhy(c) };
  const fm = formalOf(item.text);
  if (fm && focus.includes(fm.word)) return { promptJa: "あらたまった ことば（手紙・発表で つかう）は どれ？", display: formalDisplay(fm), choices: pick([fm.answer, ...fm.wrong]), answer: fm.answer, explanationJa: formalWhy(fm) };
  const r = rootOf(item.text);
  if (r && focus.includes(r.root)) return { promptJa: "ステージ4 の 語根。＿＿ に 入る パーツは どれ？", display: rootDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: rootWhy(r), audioText: r.word };
  return null;
}

export const phonics: WorldPhonics = { world: 35, start: W35_START, question: w35Question, say: w35Say, example: w35Example };
