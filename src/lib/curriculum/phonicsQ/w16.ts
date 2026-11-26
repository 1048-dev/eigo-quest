/**
 * ワールド16 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { ED_KANA, ED_LABEL, edSound } from "../w11Phonics";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { ED_WHY, IRREGULAR_FOCUS_OF, IRREGULAR_WHY, W16_ED_FOCUS, W16_ED_SOUND_RULE, W16_IRREGULAR_FOCUS, W16_START, edSpelling, irregularPast } from "../w16Phonics";

/**
 * ワールド16（きおくの遺跡・L451〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-ed": 「ed を つけた ただしい つづりは？」（stop → stopped / stoped / stopeed、cry → cried / cryed / cryied）。
 *   rule が "ed-sounds" の 回は「おわりの -ed は どの おと？」（ト / ド / イド）
 * - "a" "o_e" "ew" "ought" "aught": 「すぎた ことの かたちは？」（sing → sang / singed / sanged、buy → bought / buyed / baught）。
 *   表に ある ふきそくな 過去形だけ
 * あてはまらなければ null。ワールド15 の 問題より 先に よぶ（wrote を マジック e、stopped を はじめの ブレンドで 問わない）。
 */
export function w16Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W16_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W16_ED_FOCUS as readonly string[]).includes(f)) {
      if (lesson.phonics.rule === W16_ED_SOUND_RULE) {
        const s = edSound(w);
        if (!s) continue;
        const why = s === "id" ? "t や d の あとの -ed は「イド」と よむよ。"
          : s === "t" ? "p・k・s・sh・ch のような いきだけの おとの あとの -ed は ちいさく「ト」と よむよ。"
          : "こえの でる おと（n・l・y など）の あとの -ed は「ド」と よむよ。";
        return { promptJa: "この ことばの おわりの -ed は どの おと？", display: item.text,
          choices: shuffle(["t", "d", "id"] as const, rng).map((x) => ({ id: x, label: ED_LABEL[x] })), answer: s,
          explanationJa: `${item.text} の -ed は「${ED_KANA[s]}」。${why}` };
      }
      const e = edSpelling(w);
      if (!e) continue;
      return { promptJa: "ed を つけた ただしい つづりは どれ？", display: `${e.base} → ？`, choices: pick([e.answer, ...e.wrong]), answer: e.answer,
        explanationJa: `${e.base} → ${e.answer}。${ED_WHY[e.kind](e.base)}` };
    }
    if ((W16_IRREGULAR_FOCUS as readonly string[]).includes(f)) {
      const p = irregularPast(w);
      if (!p || IRREGULAR_FOCUS_OF[p.kind] !== f) continue;
      return { promptJa: "すぎた ことの かたちは どれ？", display: `${p.base} → ？`, choices: pick([p.answer, ...p.wrong]), answer: p.answer,
        explanationJa: IRREGULAR_WHY[p.kind](p.base, p.answer) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 16, start: W16_START, question: w16Question };
