/**
 * ワールド28 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w28Say, w28Example, W28_START, katakanaDisplay, katakanaOf, katakanaWhy, linkOf as link28Of, linkWhy as link28Why, loanOf, loanWhy, partsDisplay, partsOf, partsWhy, rhythmDisplay, rhythmOf, rhythmWhy } from "../w28Phonics";

/**
 * ワールド28（にじの架け橋・L811〜）の フォニックス（カタカナ語と 英語の おと・英語に なった 日本語・英語の リズム・音の つながりの まとめ・ことばの パーツの まとめ）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - カタカナ語（"energy"）: 「英語で いうと、つよく よむ ところは どれ？」（EN-er-gy / en-ER-gy / en-er-GY。選択肢は きまった 順）
 * - 英語に なった 日本語（"tsunami"）: 「英語に なった 日本語。英語の つづりは どれ？」（tsunami / tunami / sunami）
 * - リズム（"I want to swim in the sea"）: 「ふつうに いう とき、よわく みじかく いう ことばは どれ？」（to / swim / sea）
 * - 音の つながり（"meet you"）: 「つなげて いうと どう きこえる？」（ミーチュー / ミート・ユー / …）
 * - ことばの パーツ（"unhappiness"）: 「パーツを くっつけた ことばで ただしい つづりは どれ？」
 * あてはまらなければ null。ワールド27 の 問題より 先に よぶ（video を ワールド12 の はく、unhappiness を ワールド21 の -ness で 問わない）。
 */
export function w28Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W28_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const k = katakanaOf(item.text);
  if (k && focus.includes(k.syllables)) return { promptJa: "英語で いうと、つよく よむ ところは どれ？", display: katakanaDisplay(k), choices: k.choices.map((x) => ({ id: x, label: x })), answer: k.answer, explanationJa: katakanaWhy(k) };
  const j = loanOf(item.text);
  if (j && focus.includes(j.word)) return { promptJa: "英語に なった 日本語。英語の つづりは どれ？", display: `🔊（${j.meaning}）`, choices: pick([j.answer, ...j.wrong]), answer: j.answer, explanationJa: loanWhy(j) };
  const r = rhythmOf(item.text);
  if (r && focus.includes(r.weak)) return { promptJa: "ふつうに いう とき、よわく みじかく いう ことばは どれ？", display: rhythmDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: rhythmWhy(r) };
  const l = link28Of(item.text);
  if (l && focus.includes(l.phrase)) return { promptJa: "つなげて いうと どう きこえる？", display: `${l.phrase}（${l.meaning}）`, choices: pick([l.answer, ...l.wrong]), answer: l.answer, explanationJa: link28Why(l) };
  const p = partsOf(item.text);
  if (p && focus.includes(p.focus)) return { promptJa: "パーツを くっつけた ことばで ただしい つづりは どれ？", display: partsDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: partsWhy(p) };
  return null;
}

export const phonics: WorldPhonics = { world: 28, start: W28_START, question: w28Question, say: w28Say, example: w28Example };
