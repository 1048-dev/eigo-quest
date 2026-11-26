/**
 * ワールド20 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { w20Say, EAR_CHOICES, EAR_SOUNDS, URE_SOUNDS, W20_EAR_FOCUS, W20_START, W20_URE_FOCUS, earOf, earWhy, schwaBlank, schwaWhy, ureSound, ureWhy } from "../w20Phonics";

/**
 * ワールド20（まつりの島・L571〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-ure": 「この ことばの ure は どの おと？」（treasure → チャー / ジャー / ユア）
 * - "ear" "eer": 「イア」の ことばは「＿ に はいる つづりは？」（ch＿（おうえんする）→ eer / ear / ere / ier）、
 *   bear・learn の ような ear は「この ことばの ear は どの おと？」（イア / エア / アー）
 * - "a-bout" の ような はくの まとまり（あいまい母音の 表に ある ことば）: 「よわい『ア』の ところに はいる もじは？」（＿bout → a / u / e / o）
 * あてはまらなければ null（ステージ2 の つづりの まとめ -tch -dge -tion・だまっている もじ・-ed・-ing は まえの ワールドの 問題へ）。
 * ワールド19 の 問題より 先に よぶ（picture を ワールド17 の -ture、bear を ワールド9 の ear、banana を ワールド18 の 強勢で 問わない）。
 */
export function w20Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W20_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W20_URE_FOCUS) {
      const u = ureSound(w);
      if (!u) continue;
      return { promptJa: "この ことばの ure は どの おと？", display: `${item.text}（${u.meaning}）`, choices: URE_SOUNDS.map((s) => ({ id: s, label: s })), answer: u.answer,
        explanationJa: ureWhy(item.text, u) };
    }
    if ((W20_EAR_FOCUS as readonly string[]).includes(f)) {
      const e = earOf(w);
      if (!e || e.spelling !== f) continue;
      if (e.kind === "blank") {
        return { promptJa: "＿ に はいる つづりは どれ？", display: e.display, choices: pick(EAR_CHOICES), answer: e.answer, explanationJa: earWhy(item.text, e) };
      }
      return { promptJa: "この ことばの ear は どの おと？", display: `${item.text}（${e.meaning}）`, choices: EAR_SOUNDS.map((s) => ({ id: s, label: s })), answer: e.answer,
        explanationJa: earWhy(item.text, e) };
    }
    if (f.includes("-") && f.replace(/-/g, "") === w) {
      const s = schwaBlank(w);
      if (!s) continue;
      return { promptJa: "よわい「ア」の ところに はいる もじは どれ？", display: s.display, choices: pick(s.choices), answer: s.answer, explanationJa: schwaWhy(item.text, s) };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 20, start: W20_START, question: w20Question, say: w20Say };
