/**
 * ワールド13 の フォニックス問題（run8: questions.ts から 分けた。ブラウザでは ワールドごとの チャンクで あとから 読む）。
 * 登録と 読みこみは ../phonicsWorlds.ts（サーバーは ../bundledPhonics.ts で ぜんぶ 同期で 登録）。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import type { Question } from "../questions";
import type { WorldPhonics } from "../phonicsWorlds";
import { getLesson } from "../index";
import { shuffle } from "../shuffle";
import { CH_CHOICES, S_KANA, S_LABEL, W13_CH_FOCUS, W13_HE_FOCUS, W13_IZ_START, W13_START, W13_S_FOCUS, chBlank, heSpelling, sSound, type SSound } from "../w13Phonics";

/**
 * ワールド13 の 回（L361〜）で、フォーカスに ワールド13 の つづりが あれば、フォーカスの 順に ことばに あうもので 問う。
 * - "-s" / "-es": 「この ことばの おわりの s は どの おと？」（ス / ズ / イズ。イズは -es を ならう L366 から）。ことばを 画面に 出す。
 * - "-ies" / "goes" / "does" / "has": 「he / she の ときの ただしい つづりは どれ？」（studies / studys / studyes、plays / plaies …）
 * - "tch" / "dge"（ふりかえりの "ch" / "ge"）: 「＿ に はいる つづりは どれ？」（ca＿ → tch、tea＿ → ch）。みじかい母音の あとかで きまる。
 * あてはまらなければ null。語末（endingQuestion：複数形の -s）より 先に よぶ。
 */
export function w13Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W13_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W13_S_FOCUS as readonly string[]).includes(f)) {
      const s = sSound(w);
      if (!s) continue;
      const opts: SSound[] = item.lessonNo >= W13_IZ_START || s === "iz" ? ["s", "z", "iz"] : ["s", "z"];
      const why = s === "iz" ? "s・x・ch・sh の あとは es を つけて「イズ」と よむよ。"
        : s === "s" ? "p・t・k・f のような いきだけの おとの あとの s は「ス」と よむよ。"
        : "こえの でる おと（n・m・l・d・y や 母音）の あとの s は「ズ」と よむよ。";
      return { promptJa: "この ことばの おわりの s は どの おと？", display: item.text,
        choices: shuffle(opts, rng).map((x) => ({ id: x, label: S_LABEL[x] })), answer: s,
        explanationJa: `${item.text} の おわりは「${S_KANA[s]}」。${why}` };
    }
    if ((W13_HE_FOCUS as readonly string[]).includes(f)) {
      const h = heSpelling(w);
      if (!h) continue;
      const why = h.kind === "ies" ? `${h.base} は y の まえが 子音なので、y を i に かえて es を つけるよ。`
        : h.kind === "ys" ? `${h.base} は y の まえが 母音（a e i o u）なので、そのまま s を つけるよ。`
        : `${h.base} は he / she の とき とくべつな 形「${h.answer}」に なるよ。`;
      return { promptJa: "he / she の ときの ただしい つづりは どれ？", choices: pick([h.answer, ...h.wrong]), answer: h.answer,
        explanationJa: `ただしい つづりは「${h.answer}」。${why}` };
    }
    if ((W13_CH_FOCUS as readonly string[]).includes(f)) {
      const b = chBlank(w, focus);
      if (!b) continue;
      const short = b.answer === "tch" || b.answer === "dge";
      const sound = b.answer === "tch" || b.answer === "ch" ? "チ" : "ヂ";
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(CH_CHOICES[b.answer]), answer: b.answer,
        explanationJa: short
          ? `${item.text} は「${b.answer}」。みじかい 母音（${b.before}）の すぐ あとの「${sound}」は ${b.answer} と かくよ。`
          : `${item.text} は「${b.answer}」。みじかい 母音の すぐ あと では ない（${b.before} の あと）ので ${b.answer} と かくよ。` };
    }
  }
  return null;
}

export const phonics: WorldPhonics = { world: 13, start: W13_START, question: w13Question };
