/**
 * ワールド21 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w21Say, W21_DIS_FOCUS, W21_MISPRE_FOCUS, W21_PART_FOCUS, W21_START, W21_SUFFIX_FOCUS, disOf, disWhy, linkOf, linkWhy, misPreBlank, misPreWhy, partOf, partWhy, suffixOf, suffixWhy } from "../w21Phonics";

/**
 * ワールド21（ことづての塔・L601〜）の フォニックス（形態素の はじまり）。フォーカスの 順に ことばに あうもので 問う。
 * - "dis-": 「はんたいの いみの ことばは？」（agree → ？（さんせいしない）→ disagree / unagree / inagree）
 * - "mis-" "pre-": 「＿ に はいる パーツは？」（＿spell（つづりを まちがえる）→ mis / pre / dis）
 * - "tele-" "phone" "graph" "photo-": 「この ことばの tele は どんな いみ？」（とおく / かく・えがく / ひかり / じぶんで）
 * - "-ment" "-ness": 「ただしい ことばは どれ？」（kind → ？（やさしさ）→ kindness / kindment / kindnes）
 * - 音の つながり（focus が フレーズ そのもの）: 「つなげて いうと どう きこえる？」（hold on → ホウルドン / ホウルド・オン / …）
 * あてはまらなければ null。ワールド20 の 問題より 先に よぶ（telephone を ワールド14 の ph、disappear を ear で 問わない）。
 */
export function w21Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W21_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W21_DIS_FOCUS) {
      const d = disOf(w);
      if (!d) continue;
      return { promptJa: "はんたいの いみの ことばは どれ？", display: `${d.base}（${d.baseMeaning}）→ ？（${d.meaning}）`, choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: disWhy(d) };
    }
    if ((W21_MISPRE_FOCUS as readonly string[]).includes(f)) {
      const m = misPreBlank(w);
      if (!m || `${m.answer}-` !== f) continue;
      return { promptJa: "＿ に はいる パーツは どれ？", display: m.display, choices: pick(m.choices), answer: m.answer, explanationJa: misPreWhy(item.text, m) };
    }
    if ((W21_PART_FOCUS as readonly string[]).includes(f)) {
      const p = partOf(w, [f]);
      if (!p) continue;
      return { promptJa: `この ことばの ${p.part} は どんな いみ？`, display: `${item.text}（${p.meaning}）`, choices: pick(p.choices), answer: p.answer, explanationJa: partWhy(item.text, p) };
    }
    if ((W21_SUFFIX_FOCUS as readonly string[]).includes(f)) {
      const s = suffixOf(w);
      if (!s || `-${s.kind}` !== f) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${s.base}（${s.baseMeaning}）→ ？（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: suffixWhy(s) };
    }
    if (f.toLowerCase() === w) {
      const l = linkOf(w);
      if (!l) continue;
      const other = l.others[Math.floor(rng() * l.others.length)];
      return { promptJa: "つなげて いうと どう きこえる？", display: item.text, choices: pick([l.answer, l.split, other]), answer: l.answer, explanationJa: linkWhy(item.text, l) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 21, start: W21_START, question: w21Question, say: w21Say };
