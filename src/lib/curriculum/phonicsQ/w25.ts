/**
 * ワールド25 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w25Say, INTONATION_CHOICES, W25_IVE_FOCUS, W25_NESS_FOCUS, W25_START, compoundDisplay, compoundOf, compoundWhy25, intonationOf, intonationWhy, iveDisplay, iveOf, iveWhy, nessDisplay, nessOf, nessWhy, synOf, synWhy } from "../w25Phonics";

/**
 * ワールド25（なぞときの洞くつ・L721〜）の フォニックス（-ness・-ive・複合語・にた いみの ことば・しつもんの イントネーション）。フォーカスの 順に ことばに あうもので 問う。
 * - "-ness": 「『〜さ』を あらわす ことばは どれ？」（dark（くらい）→ darkness / darkly / darker。happy は happyness も）
 * - "-ive": 「ive の ことばで ただしい つづりは どれ？」（create → creative / creativ / createive）
 * - "foot-print" の ような 2つに わけた 形: 「あと 1つの ことばは どれ？」（＿＿print（あしあと）→ foot / ear / sky）
 * - ことば そのもの（"huge"）: 「にた いみの ことばは どれ？」（huge → big / small / quiet）
 * - しつもん そのもの（"Is it bigger than a box"）: 「この しつもんの おわりは？」（↗ あがる / ↘ さがる / → かわらない。選択肢は きまった 順）
 * あてはまらなければ null。ワールド24 の 問題より 先に よぶ（kindness を ワールド21 の -ness、active を ワールド22 の 語の家族、something を ワールド15 の 複合語で 問わない）。
 */
export function w25Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W25_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W25_NESS_FOCUS) {
      const n = nessOf(w);
      if (!n) continue;
      return { promptJa: "「〜さ」を あらわす ことばは どれ？", display: nessDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: nessWhy(n) };
    }
    if (f === W25_IVE_FOCUS) {
      const x = iveOf(w);
      if (!x) continue;
      return { promptJa: "ive の ことばで ただしい つづりは どれ？", display: iveDisplay(x), choices: pick([x.answer, ...x.wrong]), answer: x.answer, explanationJa: iveWhy(x) };
    }
    if (/^[a-z]+-[a-z]+$/.test(f) && f.replace(/-/g, "") === w) {
      const c = compoundOf(w, [f]);
      if (!c) continue;
      return { promptJa: "あと 1つの ことばは どれ？", display: compoundDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: compoundWhy25(item.text, c) };
    }
    if (f.toLowerCase() === w) {
      const s = synOf(w, [f]);
      if (s) return { promptJa: "にた いみの ことばは どれ？", display: `${s.word}（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: synWhy(s) };
      const t = intonationOf(item.text);
      if (t) return { promptJa: "この しつもんの おわりは あがる？ さがる？", display: `${item.text}?`, choices: INTONATION_CHOICES.map((x) => ({ id: x, label: x })), answer: t.answer, explanationJa: intonationWhy(item.text, t) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 25, start: W25_START, question: w25Question, say: w25Say };
