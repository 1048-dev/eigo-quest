/**
 * ワールド14 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { PLURAL_WHY, SILENT_CHOICES, SILENT_WHY, W14_NUMBER_FOCUS, W14_PLURAL_FOCUS, W14_SILENT_FOCUS, W14_START, numberSpelling, pluralSpelling, silentBlank } from "../w14Phonics";

/**
 * ワールド14 の 回（L391〜）で、フォーカスに ワールド14 の つづりが あれば、フォーカスの 順に ことばに あうもので 問う。
 * - "es" / "ies" / "ys" / "ves": 「ふたつ いじょうの ときの ただしい つづりは どれ？」（box → boxes / boxs / boxis、knife → knives / knifes / knifs）
 * - "kn" / "wr" / "mb" / "ph": 「＿ に はいる つづりは どれ？」（＿ife → kn、la＿ → mb、＿one → ph）
 * - "-ty" / "-teen" / "hundred" / "thousand": 「きこえた 数の ただしい つづりは どれ？」（forty / fourty。-teen と -ty の 回は thirteen / thirty の ききわけ）
 * あてはまらなければ null。ワールド13 の 問題より 先に よぶ（ふりかえり回の ワールド13 の focus は w13Question へ）。
 */
export function w14Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W14_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W14_PLURAL_FOCUS as readonly string[]).includes(f)) {
      const p = pluralSpelling(w);
      if (!p) continue;
      return { promptJa: "ふたつ いじょうの ときの ただしい つづりは どれ？", display: `${p.base} → ？`, choices: pick([p.answer, ...p.wrong]), answer: p.answer,
        explanationJa: `${p.base} → ${p.answer}。${PLURAL_WHY[p.kind](p.base)}` };
    }
    if ((W14_SILENT_FOCUS as readonly string[]).includes(f)) {
      const b = silentBlank(w, f);
      if (!b) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(SILENT_CHOICES[b.answer]), answer: b.answer,
        explanationJa: `${item.text} は「${b.answer}」。${SILENT_WHY[b.answer]}` };
    }
    if ((W14_NUMBER_FOCUS as readonly string[]).includes(f)) {
      const n = numberSpelling(w, focus);
      if (!n) continue;
      return { promptJa: "きこえた 数の ただしい つづりは どれ？", choices: pick([n.answer, ...n.wrong]), answer: n.answer,
        explanationJa: `ただしい つづりは「${n.answer}」。${n.tip}` };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 14, start: W14_START, question: w14Question };
