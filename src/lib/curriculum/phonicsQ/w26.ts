/**
 * ワールド26 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w26Say, w26Example, VOICE_CHOICES, W26_START, edIngDisplay, edIngOf, edIngWhy, punctOf, punctWhy, stressOf as meaningStressOf, stressWhy as meaningStressWhy, twisterDisplay, twisterOf, twisterWhy, voiceOf, voiceWhy } from "../w26Phonics";

/**
 * ワールド26（ひびきの劇場・L751〜）の フォニックス（きもちの こえ・-ed / -ing・セリフの くとうてん・いみを かえる 強勢・はやくちことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - きもちの こえ（"Really?!"）: 「この きもちで いうと、どんな こえ？」（↗ たかく げんきに / ↘ ひくく しずかに / → ずっと おなじ。選択肢は きまった 順）
 * - -ed / -ing（"exciting"）: 「＿＿ に あてはまる ことばは どれ？」（The play is ＿＿. → exciting / excited / exciteing）
 * - セリフ（'"Help!" shouted the princess.'）: 「セリフの かきかたが ただしいのは どれ？」
 * - 強勢（"I didn't eat YOUR cake"。focus は "YOUR"）: 「この いみに なるのは、どこを つよく いう とき？」
 * - はやくちことば: 「おなじ おとで はじまる ことばは どれ？」
 * あてはまらなければ null。ワールド25 の 問題より 先に よぶ（excited を ワールド11 の -ed の おとで 問わない）。
 */
export function w26Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W26_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const v = voiceOf(item.text);
  if (v && focus.includes(v.focus)) return { promptJa: "この きもちで いうと、どんな こえ？", display: `${item.text}（${v.feeling}）`, choices: VOICE_CHOICES.map((x) => ({ id: x, label: x })), answer: v.answer, explanationJa: voiceWhy(v) };
  const e = edIngOf(item.text);
  if (e && focus.includes(e.focus)) return { promptJa: "＿＿ に あてはまる ことばは どれ？", display: edIngDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: edIngWhy(e) };
  const p = punctOf(item.text);
  if (p && focus.includes(p.point)) return { promptJa: "セリフの かきかたが ただしいのは どれ？", display: p.meaning, choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: punctWhy(p) };
  const s = meaningStressOf(item.text);
  if (s && focus.includes(s.stressed)) return { promptJa: "この いみに なるのは、どこを つよく いう とき？", display: `（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: meaningStressWhy(s) };
  const t = twisterOf(item.text);
  if (t && focus.includes(t.sound)) return { promptJa: "はやくちことば！ おなじ おとで はじまる ことばは どれ？", display: twisterDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: twisterWhy(t) };
  return null;
}

export const phonics: WorldPhonics = { world: 26, start: W26_START, question: w26Question, say: w26Say, example: w26Example };
