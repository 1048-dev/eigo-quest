/**
 * ワールド17 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { ENDING_WHY, OR_FOCUS_OF, OR_WHY, W17_CONTRACTION_FOCUS, W17_ENDING_FOCUS, W17_HOMOPHONE_RULE, W17_OR_FOCUS, W17_START, endingSpelling, homophoneOf, homophoneWhy, orSpelling, willContraction, willContractionWhy } from "../w17Phonics";

/**
 * ワールド17（ほしふる天文台・L481〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-tion" "-sion" "-ture": 「ただしい つづりは？」（sta＿＿＿＿（えき）→ station / stasion / stashun、fu＿＿＿＿ → future / fucher / fuchur）
 * - "'ll" "n't": 「みじかい かたちは？」（I will → I'll / I'will / Il'l、will not → won't / willn't / wo'nt）
 * - 同音異義語（rule が "homophones" の 回、ふりかえりでは 表に ある ことば）: 「ぶんに あう ことばは？」（I can ＿＿ the stars. → see / sea / meet）
 * - "or" "ore" "oar" "our": 「「オー」の ただしい つづりは？」（4（よん）→ four / for / fore / foar）
 * あてはまらなければ null。ワールド16 の 問題より 先に よぶ（blew を ew の 過去形、won't を ワールド15 の n't で 問わない）。
 */
export function w17Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W17_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const homophone = () => {
    const h = homophoneOf(w);
    if (!h) return null;
    return { promptJa: "ぶんに あう ことばは どれ？", display: h.sentence, choices: pick([w, ...h.choices]), answer: w, explanationJa: homophoneWhy(w, h) };
  };
  if (lesson.phonics.rule === W17_HOMOPHONE_RULE) return homophone();
  for (const f of lesson.phonics.focus) {
    if ((W17_ENDING_FOCUS as readonly string[]).includes(f)) {
      const e = endingSpelling(w);
      if (!e || `-${e.kind}` !== f) continue;
      return { promptJa: "ただしい つづりは どれ？", display: `${e.stem}＿＿＿＿（${e.meaning}）`, choices: pick([e.answer, ...e.wrong]), answer: e.answer,
        explanationJa: ENDING_WHY[e.kind](e.answer) };
    }
    if ((W17_CONTRACTION_FOCUS as readonly string[]).includes(f)) {
      const c = willContraction(item.text);
      if (!c || !w.includes(f)) continue;
      return { promptJa: "みじかい かたちは どれ？", display: `${c.full} → ？`, choices: pick([c.answer, ...c.wrong]), answer: c.answer,
        explanationJa: willContractionWhy(c.full, c.answer) };
    }
    if ((W17_OR_FOCUS as readonly string[]).includes(f)) {
      const o = orSpelling(w);
      if (!o || OR_FOCUS_OF[o.kind] !== f) continue;
      return { promptJa: "「オー」の ただしい つづりは どれ？", display: `「${o.meaning}」`, choices: pick([o.answer, ...o.wrong]), answer: o.answer,
        explanationJa: OR_WHY[o.kind](o.answer) };
    }
  }
  // ふりかえりの 回: 母音の つづりの focus（ee / ea / o …）の 同音異義語
  return homophone();
}

export const phonics: WorldPhonics = { world: 17, start: W17_START, question: w17Question };
