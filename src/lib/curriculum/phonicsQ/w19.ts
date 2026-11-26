/**
 * ワールド19 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w19Say, QU_CHOICES, QU_WHY, SILENT19_CHOICES, SILENT19_WHY, TOOL_CHOICES, TOOL_WHY, W19_OU_FOCUS, W19_QU_FOCUS, W19_RE_FOCUS, W19_SILENT_FOCUS, W19_START, W19_TOOL_FOCUS, ouSound, ouWhy, quBlank, reOf, reWhy, silentBlank19, toolEnding } from "../w19Phonics";

/**
 * ワールド19（からくり工房・L541〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "re-": 「『もう いちど』の いみの ことばは？」（make → ？（つくりなおす）→ remake / unmake / rimake）
 * - "-er" "-or"（道具の ことば）: 「おわりの つづりは？」（elevat＿＿（エレベーター）→ or / er / ar）
 * - "wr" "kn" "mb" "gu" "-stle": 「＿ に はいる つづりは？」（＿ench（レンチ）→ wr / r / rr / wh、whi＿（ふえ）→ stle / sle / ssle / sel）
 * - "qu" "squ": 「＿ に はいる つづりは？」（＿iz（クイズ）→ qu / kw / cu / q、＿are → squ / skw / scu / sq）
 * - "ou" "ough": 「この ことばの ou（ough）は どの おと？」（touch → アウ / ア / ウー、enough → ウー / アフ / オウ / オー）
 * あてはまらなければ null。ワールド18 の 問題より 先に よぶ（opener を くらべる かたち、knob を ワールド14 の 問題で 問わない）。
 */
export function w19Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W19_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W19_RE_FOCUS) {
      const r = reOf(w);
      if (!r) continue;
      return { promptJa: "「もう いちど」の いみの ことばは どれ？", display: `${r.base} → ？（${r.meaning}）`, choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: reWhy(r) };
    }
    if ((W19_TOOL_FOCUS as readonly string[]).includes(f)) {
      const t = toolEnding(w);
      if (!t) continue;
      return { promptJa: "おわりの つづりは どれ？", display: t.display, choices: pick(TOOL_CHOICES), answer: t.answer, explanationJa: TOOL_WHY[t.kind](t) };
    }
    if ((W19_SILENT_FOCUS as readonly string[]).includes(f)) {
      const s = silentBlank19(w);
      if (!s || s.family !== f) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: s.display, choices: pick(SILENT19_CHOICES[s.family]), answer: s.answer,
        explanationJa: `${item.text} は「${s.answer}」。${SILENT19_WHY[s.family]}` };
    }
    if ((W19_QU_FOCUS as readonly string[]).includes(f)) {
      const b = quBlank(w);
      if (!b) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(QU_CHOICES[b.answer]), answer: b.answer,
        explanationJa: `${item.text} は「${b.answer}」。${QU_WHY[b.answer]}` };
    }
    if ((W19_OU_FOCUS as readonly string[]).includes(f)) {
      const o = ouSound(w);
      if (!o) continue;
      return { promptJa: `この ことばの ${o.team} は どの おと？`, display: `${item.text}（${o.meaning}）`, choices: o.choices.map((s) => ({ id: s, label: s })), answer: o.answer,
        explanationJa: ouWhy(item.text, o) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 19, start: W19_START, question: w19Question, say: w19Say };
