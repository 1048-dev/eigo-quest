/**
 * ワールド15 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { ING_WHY, W15_CONTRACTION_FOCUS, W15_ING_FOCUS, W15_START, W15_Y_FOCUS, Y3_LABEL, Y3_SOUNDS, Y3_WHY, compoundChoices, compoundSplit, compoundWhy, contractionOf, contractionWhy, ingSpelling, y3Sound } from "../w15Phonics";

/**
 * ワールド15（かぜの草原・L421〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-ing": 「ing を つけた ただしい つづりは？」（make → making / makeing / makking、run → running / runing）
 * - "sun-flower"（複合語）: 「2つの ことばに わけると？」（sun + flower / su + nflower / sunf + lower）
 * - "'m" "'s" "'re" "n't": 「みじかい かたちは？」（she is → she's / shes / she'is）
 * - "y": 「この ことばの y は どの おと？」（イェ / イー / アイ）
 * あてはまらなければ null。ワールド14 の 問題より 先に よぶ（running を 語末の -ing、sunflower を はくの 数で 問わない）。
 */
export function w15Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W15_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W15_ING_FOCUS as readonly string[]).includes(f)) {
      const g = ingSpelling(w);
      if (!g) continue;
      return { promptJa: "ing を つけた ただしい つづりは どれ？", display: `${g.base} → ？`, choices: pick([g.answer, ...g.wrong]), answer: g.answer,
        explanationJa: `${g.base} → ${g.answer}。${ING_WHY[g.kind](g.base)}` };
    }
    if (f.includes("-")) {
      const parts = compoundSplit(w, [f]);
      if (!parts) continue;
      const c = compoundChoices(parts[0], parts[1]);
      return { promptJa: "2つの ことばに わけると どれ？", display: item.text, choices: pick([c.answer, ...c.wrong]), answer: c.answer,
        explanationJa: compoundWhy(item.text, parts[0], parts[1]) };
    }
    if ((W15_CONTRACTION_FOCUS as readonly string[]).includes(f)) {
      const c = contractionOf(item.text);
      if (!c || !w.includes(f)) continue;
      return { promptJa: "みじかい かたちは どれ？", display: `${c.full} → ？`, choices: pick([c.answer, ...c.wrong]), answer: c.answer,
        explanationJa: contractionWhy(c.full, c.answer) };
    }
    if ((W15_Y_FOCUS as readonly string[]).includes(f)) {
      const y = y3Sound(w);
      if (!y) continue;
      return { promptJa: "この ことばの y は どの おと？", display: item.text, choices: Y3_SOUNDS.map((s) => ({ id: s, label: Y3_LABEL[s] })), answer: y,
        explanationJa: `${item.text} の y は「${y}」。${Y3_WHY[y]}` };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 15, start: W15_START, question: w15Question };
