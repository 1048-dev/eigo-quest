/**
 * ワールド22 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w22Say, MARK_CHOICES, W22_ADJ_FOCUS, W22_FAMILY_FOCUS, W22_PERSON_FOCUS, W22_START, adjOf, adjWhy, familyOf, familyWhy, markOf, markWhy, personOf, personWhy, schwaStressBlank, schwaStressWhy } from "../w22Phonics";

/**
 * ワールド22（こはくの図書館・L631〜）の フォニックス（形態素の つづき）。フォーカスの 順に ことばに あうもので 問う。
 * - "-er" "-or" "-ist": 「〜する 人を あらわす ことばは どれ？」（write → ？（さっか）→ writer / writor / writist）
 * - "act" "invent" "protect" "direct"（語の家族）: 「act の かぞくで「はいゆう」は どれ？」（actor / action / active）
 * - "pen-cil" の ような はくの 形（あいまい母音と 強勢）: 「よわい「ア」の ところに はいる もじは どれ？」（penc＿l（PEN・cil）→ i / u / a / e）
 * - "-ous" "-al": 「ただしい ことばは どれ？」（danger → ？（きけんな）→ dangerous / dangeral / dangerus）
 * - しるしの 回（focus が フレーズ そのもの）: 「おわりに つける しるしは どれ？」（Who are you ＿ → ? / ! / .）
 * あてはまらなければ null。ワールド21 の 問題より 先に よぶ（writer を ワールド11 の -er、pencil を ワールド20 で 問わない）。
 */
export function w22Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W22_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if ((W22_PERSON_FOCUS as readonly string[]).includes(f)) {
      const p = personOf(w);
      if (!p || `-${p.kind}` !== f) continue;
      return { promptJa: "「〜する 人」を あらわす ことばは どれ？", display: `${p.base}（${p.baseMeaning}）→ ？（${p.meaning}）`, choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: personWhy(p) };
    }
    if ((W22_FAMILY_FOCUS as readonly string[]).includes(f)) {
      const q = familyOf(w, [f]);
      if (!q) continue;
      return { promptJa: `${q.root} の かぞくで「${q.meaning}」の いみの ことばは どれ？`, display: `${q.root}（${q.baseMeaning}）の かぞく`, choices: pick(q.choices), answer: q.answer, explanationJa: familyWhy(q) };
    }
    if (/^[a-z]+(-[a-z]+)+$/.test(f) && f.replace(/-/g, "") === w) {
      const s = schwaStressBlank(w);
      if (!s) continue;
      return { promptJa: "よわい「ア」の ところに はいる もじは どれ？", display: s.display, choices: pick(s.choices), answer: s.answer, explanationJa: schwaStressWhy(item.text, s) };
    }
    if ((W22_ADJ_FOCUS as readonly string[]).includes(f)) {
      const a = adjOf(w);
      if (!a || `-${a.kind}` !== f) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${a.base}（${a.baseMeaning}）→ ？（${a.meaning}）`, choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: adjWhy(a) };
    }
    if (f.toLowerCase() === w) {
      const m = markOf(w);
      if (!m) continue;
      return { promptJa: "おわりに つける しるしは どれ？", display: `${item.text} ＿（${m.meaning}）`, choices: pick(MARK_CHOICES), answer: m.answer, explanationJa: markWhy(item.text, m) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 22, start: W22_START, question: w22Question, say: w22Say };
