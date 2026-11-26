/**
 * ワールド24 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w24Say, W24_CONTRACTION_FOCUS, W24_IMIN_FOCUS, W24_OU_FOCUS, W24_PP_FOCUS, W24_START, contrOf, contrWhy, imInOf, imInWhy, overUnderOf, overUnderWhy, placeOf, placeWhy, ppDisplay, ppOf, ppWhy } from "../w24Phonics";

/**
 * ワールド24（くもの上の鉄道・L691〜）の フォニックス（地名の 強勢・過去分詞・短縮形・over- / under-・im- / in-）。フォーカスの 順に ことばに あうもので 問う。
 * - "can-a-da" の ような はくの 形: 「つよく よむ ところは どれ？」（CAN-a-da / can-A-da / can-a-DA）
 * - "-een" "-one" "-en" "-wn" "-um": 「have の あとに くる かたちは どれ？」（seen / saw / see。written は writen も）
 * - "'ve" "n't" "'s": 「みじかい かたちは どれ？」（I have → I've / Ive / I'have、she has → she's）
 * - "over-" "under-": 「この ことばの over は どんな いみ？」（うえ・こえて・〜すぎる / した / まえ / もう いちど）
 * - "im-" "in-": 「ただしい ことばは どれ？」（possible（できる）の はんたい → impossible / inpossible / unpossible）
 * あてはまらなければ null。ワールド23 の 問題より 先に よぶ（she's を ワールド15 の she is、Canada を ワールド12 の はく、eaten を ブレンドで 問わない）。
 */
export function w24Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W24_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (/^[a-z]+(-[a-z]+)+$/.test(f) && f.replace(/-/g, "") === w) {
      const p = placeOf(w, [f]);
      if (!p) continue;
      return { promptJa: "つよく よむ ところは どれ？", display: `${item.text}（${p.meaning}）`, choices: p.choices.map((x) => ({ id: x, label: x })), answer: p.answer, explanationJa: placeWhy(item.text, p) };
    }
    if ((W24_PP_FOCUS as readonly string[]).includes(f)) {
      const p = ppOf(w);
      if (!p || !w.endsWith(f.slice(1))) continue;
      return { promptJa: "have の あとに くる かたちは どれ？", display: ppDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: ppWhy(p) };
    }
    if ((W24_CONTRACTION_FOCUS as readonly string[]).includes(f)) {
      const c = contrOf(item.text);
      if (!c || !w.includes(f)) continue;
      return { promptJa: "みじかい かたちは どれ？", display: `${c.full} → ？`, choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: contrWhy(c) };
    }
    if ((W24_OU_FOCUS as readonly string[]).includes(f)) {
      const o = overUnderOf(w, [f]);
      if (!o) continue;
      return { promptJa: `この ことばの ${o.part} は どんな いみ？`, display: `${item.text}（${o.meaning}）`, choices: pick(o.choices), answer: o.answer, explanationJa: overUnderWhy(item.text, o) };
    }
    if ((W24_IMIN_FOCUS as readonly string[]).includes(f)) {
      const x = imInOf(w);
      if (!x || x.prefix !== f.slice(0, -1)) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${x.base}（${x.baseMeaning}）の はんたい → ？（${x.meaning}）`, choices: pick([x.answer, ...x.wrong]), answer: x.answer, explanationJa: imInWhy(x) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 24, start: W24_START, question: w24Question, say: w24Say };
