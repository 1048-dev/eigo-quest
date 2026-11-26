/**
 * ワールド23 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w23Say, W23_MENT_FOCUS, W23_PART_FOCUS, W23_START, W23_TION_FOCUS, W23_Y_FOCUS, mentDisplay, mentOf, mentWhy, sciPartOf, sciPartWhy, shiftOf, shiftWhy, tionOf, tionWhy, yAdjOf, yAdjWhy } from "../w23Phonics";

/**
 * ワールド23（みどりの研究所・L661〜）の フォニックス（理科の ことばの パーツ）。フォーカスの 順に ことばに あうもので 問う。
 * - "micro-" "-scope" "-meter" "thermo-": 「この ことばの micro は どんな いみ？」（ちいさい / はかる どうぐ / ねつ・あたたかさ / とおく）
 * - "-ment": 「ただしい つづりは どれ？」（measure → ？（はかった あたい）→ measurement / measurment / measuremant）
 * - "pho-tog-ra-phy" の ような はくの 形（強勢の 移動）: 「つよく よむ ところは どれ？」（pho-TOG-ra-phy / PHO-tog-ra-phy / …。かぞくの PHO-to-graph を 見せる）
 * - "-y": 「ただしい ことばは どれ？」（shine → ？（ぴかぴかの）→ shiny / shiney / shinie）
 * - "-tion": 「ただしい ことばは どれ？」（observe → ？（かんさつ）→ observation / observetion / observasion）
 * あてはまらなければ null。ワールド22 の 問題より 先に よぶ（photography を ワールド22 の あいまい母音、measurement を ワールド21 の -ment、
 * cloudy を ワールド10 の -y、prediction を ワールド17 の -tion で 問わない）。
 */
export function w23Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W23_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if ((W23_PART_FOCUS as readonly string[]).includes(f)) {
      const p = sciPartOf(w, [f]);
      if (!p) continue;
      return { promptJa: `この ことばの ${p.part} は どんな いみ？`, display: `${item.text}（${p.meaning}）`, choices: pick(p.choices), answer: p.answer, explanationJa: sciPartWhy(item.text, p) };
    }
    if (f === W23_MENT_FOCUS) {
      const m = mentOf(w);
      if (!m) continue;
      return { promptJa: "ただしい つづりは どれ？", display: mentDisplay(m), choices: pick([m.answer, ...m.wrong]), answer: m.answer, explanationJa: mentWhy(m) };
    }
    if (/^[a-z]+(-[a-z]+)+$/.test(f) && f.replace(/-/g, "") === w) {
      const s = shiftOf(w, [f]);
      if (!s) continue;
      return { promptJa: "つよく よむ ところは どれ？", display: `${item.text}（${s.meaning}）　かぞく: ${s.pairStressed}`, choices: pick(s.choices), answer: s.answer, explanationJa: shiftWhy(item.text, s) };
    }
    if (f === W23_Y_FOCUS) {
      const y = yAdjOf(w);
      if (!y) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${y.base}（${y.baseMeaning}）→ ？（${y.meaning}）`, choices: pick([y.answer, ...y.wrong]), answer: y.answer, explanationJa: yAdjWhy(y) };
    }
    if (f === W23_TION_FOCUS) {
      const t = tionOf(w);
      if (!t) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${t.base}（${t.baseMeaning}）→ ？（${t.meaning}）`, choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: tionWhy(t) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 23, start: W23_START, question: w23Question, say: w23Say };
