/**
 * ワールド18 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { COMPARE_WHY, LY_WHY, W18_COMPARE_FOCUS, W18_FUL_FOCUS, W18_LY_FOCUS, W18_START, W18_UN_FOCUS, compareSpelling, fulLessOf, fulLessWhy, lySpelling, stressChoices, stressWhy, unOf, unWhy } from "../w18Phonics";

/**
 * ワールド18（こだまの谷・L511〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-er" "-est": 「くらべる かたちの ただしい つづりは？」（big → ？（もっと）→ bigger / biger / biggar）
 * - "el-e-phant" の ような まとまり（rule が "stress" の 回と ふりかえり）: 「つよく よむ ところは どこ？」（EL-e-phant / el-E-phant / el-e-PHANT）
 * - "-ly": 「ly を つけた ただしい つづりは？」（happy + ly → happily / happyly / happly）
 * - "-ful" "-less": 「いみに あう ことばは？」（「いろいろな いろの」→ colorful / colorless / colorfull）
 * - "un-": 「はんたいの いみの ことばは？」（happy → ？ → unhappy / inhappy / dishappy）
 * あてはまらなければ null。ワールド17 の 問題より 先に よぶ（shorter を or の つづり、careful を ワールド12 の まとまりで 問わない）。
 */
export function w18Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W18_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if ((W18_COMPARE_FOCUS as readonly string[]).includes(f)) {
      const c = compareSpelling(w);
      if (!c || `-${c.suffix}` !== f) continue;
      return { promptJa: "くらべる かたちの ただしい つづりは どれ？", display: `${c.base} → ？（${c.suffix === "er" ? "もっと" : "いちばん"} ${c.meaning}）`,
        choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: COMPARE_WHY[c.kind](c) };
    }
    if (f.includes("-") && f.replace(/-/g, "") === w) {
      const s = stressChoices(w, lesson.phonics.focus);
      if (!s) continue;
      return { promptJa: "つよく よむ ところは どこ？", display: `${w}（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: stressWhy(s) };
    }
    if (f === W18_LY_FOCUS) {
      const l = lySpelling(w);
      if (!l) continue;
      return { promptJa: "ly を つけた ただしい つづりは どれ？", display: `${l.base} + ly → ？`, choices: pick([l.answer, ...l.wrong]), answer: l.answer, explanationJa: LY_WHY[l.kind](l) };
    }
    if ((W18_FUL_FOCUS as readonly string[]).includes(f)) {
      const q = fulLessOf(w);
      if (!q || `-${q.suffix}` !== f) continue;
      return { promptJa: "いみに あう ことばは どれ？", display: `「${q.meaning}」`, choices: pick([q.answer, ...q.wrong]), answer: q.answer, explanationJa: fulLessWhy(q) };
    }
    if (f === W18_UN_FOCUS) {
      const u = unOf(w);
      if (!u) continue;
      return { promptJa: "はんたいの いみの ことばは どれ？", display: `${u.base} → ？（はんたいの いみ）`, choices: pick([u.answer, ...u.wrong]), answer: u.answer, explanationJa: unWhy(u) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 18, start: W18_START, question: w18Question };
