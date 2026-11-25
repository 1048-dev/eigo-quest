/**
 * ワールド21の フォニックス（形態素の はじまり: dis-・mis- / pre-・ことばの パーツ・-ment / -ness・音の つながり）の 問題と 表（src/lib/curriculum/w21Phonics.ts）。
 * - dis- は「はんたいの いみの ことばは？」（agree → ？（さんせいしない）→ disagree / unagree / inagree）
 * - mis- / pre- は「＿ に はいる パーツは？」（＿spell → mis / pre / dis。ほんとうに ある ことばに なる パーツは 選択肢に 出さない）
 * - tele- / phone / graph / photo- は「この ことばの tele は どんな いみ？」（もう 1つの パーツの いみは 選択肢に 出さない）
 * - -ment / -ness は「ただしい ことばは どれ？」（もう 1つの おわり・つづりの まちがい）
 * - 音の つながりは「つなげて いうと どう きこえる？」（hold on → ホウルドン / ホウルド・オン / …）
 * - ワールド20 までの 回では ワールド21 の 問題に ならない
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w21Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { disOf, linkOf, misPreBlank, partOf, suffixOf } from "@/lib/curriculum/w21Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW21 = !!getLesson(630);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド21の つづりの表", () => {
  it("dis-: もとの ことばと いみ、まちがいの 選択肢は ほんとうに ない ことば（unlike は 入れない）", () => {
    expect(disOf("disagree")).toEqual({ base: "agree", answer: "disagree", wrong: ["unagree", "inagree"], baseMeaning: "さんせいする", meaning: "さんせいしない" });
    expect(disOf("dislike")?.wrong).not.toContain("unlike");
    expect(disOf("disappear")?.base).toBe("appear");
    expect(["discover", "dish", "unhappy"].map(disOf)).toEqual([null, null, null]);
  });

  it("mis- / pre-: パーツを ＿ に して、ほんとうに ある ことば（review・replace・displace）に なる パーツは 選択肢に 出さない", () => {
    expect(misPreBlank("misspell")).toEqual({ base: "spell", answer: "mis", choices: ["mis", "pre", "dis"], display: "＿spell（つづりを まちがえる）", meaning: "つづりを まちがえる" });
    expect(misPreBlank("preview")).toMatchObject({ answer: "pre", choices: ["pre", "mis", "dis"], display: "＿view（まえもって みる・よこく）" });
    expect(misPreBlank("misplace")?.choices).toEqual(["mis", "pre", "un"]); // displace・replace は ある ことば
    expect(misPreBlank("prepay")?.choices).not.toContain("re");
    expect(["mister", "present", "dislike"].map(misPreBlank)).toEqual([null, null, null]);
  });

  it("ことばの パーツ: focus の パーツの いみを 問い、もう 1つの パーツの いみは 選択肢に 入れない", () => {
    const tel = partOf("telephone", ["tele-"])!;
    expect(tel).toMatchObject({ part: "tele", answer: "とおく", meaning: "でんわ" });
    expect(tel.choices).not.toContain("おと・こえ");
    expect(tel.choices).toHaveLength(4);
    expect(partOf("telephone", ["phone"])!.answer).toBe("おと・こえ");
    expect(partOf("microphone", ["phone"])!.choices).not.toContain("ちいさい");
    expect(partOf("autograph", ["graph"])).toMatchObject({ answer: "かく・えがく", parts: ["auto", "graph"] });
    expect(partOf("photographer", ["photo-", "graph"])!.part).toBe("photo");
    expect(partOf("telescope", ["graph"])).toBeNull();
    expect(partOf("phonics", ["phone"])).toBeNull();
  });

  it("-ment / -ness: もう 1つの おわりと つづりの まちがい（e を とる・y の まま・s が 1つ）", () => {
    expect(suffixOf("movement")).toMatchObject({ kind: "ment", base: "move", wrong: ["moveness", "movment"], trap: "drop-e" });
    expect(suffixOf("agreement")).toMatchObject({ wrong: ["agreeness", "agrement"], trap: "keep-ee" });
    expect(suffixOf("enjoyment")).toMatchObject({ wrong: ["enjoyness", "enjoiment"], trap: "keep-y" });
    expect(suffixOf("happiness")).toMatchObject({ kind: "ness", base: "happy", wrong: ["happiment", "happyness"], trap: "y-to-i" });
    expect(suffixOf("kindness")).toMatchObject({ wrong: ["kindment", "kindnes"], trap: "single-s" });
    expect(["moment", "business", "cement"].map(suffixOf)).toEqual([null, null, null]);
  });

  it("音の つながり: つなげた おと・1つずつの おと・つながる ところ", () => {
    expect(linkOf("hold on")).toMatchObject({ answer: "ホウルドン", split: "ホウルド・オン", joint: { end: "d", start: "o" } });
    expect(linkOf("Can I")).toMatchObject({ answer: "キャナイ", joint: { end: "n", start: "i" } });
    expect(linkOf("check it out")?.joint).toEqual({ end: "k", start: "i" });
    // おわりの e は よまない もじなので、その まえの しいんで つながる
    expect(linkOf("leave a message")?.joint).toEqual({ end: "v", start: "a" });
    expect(linkOf("come in")?.joint).toEqual({ end: "m", start: "i" });
    expect(linkOf("take a message")?.joint).toEqual({ end: "k", start: "a" });
    expect(linkOf("hello there")).toBeNull();
  });

  it("フォーカスの ボタン: dis- は「dis…」、-ment は「…ment」、フレーズは そのまま。読み上げは その回の ことば・フレーズ", () => {
    expect(focusLabel("dis-").main).toBe("dis…");
    expect(focusLabel("-ness").main).toBe("…ness");
    expect(focusLabel("hold on").main).toBe("hold on");
    expect(focusExampleWord("check it out", ["check it out", "pick it up"])).toBe("check it out");
    expect(focusSay("dis-", ["dislike", "disagree"])).toBe("dislike");
    expect(focusSay("pre-", ["mistake", "preview"])).toBe("preview");
    expect(focusSay("phone", ["telephone"])).toBe("telephone");
    expect(focusSay("-ment", ["kindness", "movement"])).toBe("movement");
    expect(focusSay("can I", ["can I"])).toBe("can I");
  });
});

describe("ワールド21の フォニックス問題", () => {
  it.skipIf(!hasW21)("dis-: はんたいの いみの ことばを えらぶ（ワールド20 の ear で disappear を 問わない）", () => {
    const a = q(601, "disappear");
    expect(a.promptJa).toBe("はんたいの いみの ことばは どれ？");
    expect(a.display).toBe("appear（あらわれる）→ ？（きえる）");
    expect(a.answer).toBe("disappear");
    expect(ids(a).sort()).toEqual(["disappear", "inappear", "unappear"]);
    expect(q(602, "disobey").explanationJa).toContain("はんたい");
    // L604 は un- と くらべる（un の ことばは ワールド18 の 問題）
    expect(q(604, "unhappy").answer).toBe("unhappy");
    expect(w21Question(item(604, "unhappy"), seededRng(1))).toBeNull();
  });

  it.skipIf(!hasW21)("mis- / pre-: ＿ に はいる パーツ", () => {
    const a = q(606, "misspell");
    expect(a.promptJa).toBe("＿ に はいる パーツは どれ？");
    expect(a.display).toBe("＿spell（つづりを まちがえる）");
    expect(a.answer).toBe("mis");
    expect(ids(a).sort()).toEqual(["dis", "mis", "pre"]);
    expect(q(608, "preheat").answer).toBe("pre");
    expect(q(609, "pretest").explanationJa).toContain("まえに");
  });

  it.skipIf(!hasW21)("ことばの パーツ: telephone を ワールド14 の ph で 問わない。L611 は tele、L612 の ことばは phone", () => {
    const a = q(611, "telephone");
    expect(a.promptJa).toBe("この ことばの tele は どんな いみ？");
    expect(a.display).toBe("telephone（でんわ）");
    expect(a.answer).toBe("とおく");
    expect(q(612, "xylophone")).toMatchObject({ promptJa: "この ことばの phone は どんな いみ？", answer: "おと・こえ" });
    expect(q(613, "paragraph").answer).toBe("かく・えがく");
    expect(q(614, "photocopy").answer).toBe("ひかり");
    expect(q(614, "telephone").answer).toBe("とおく");
  });

  it.skipIf(!hasW21)("-ment / -ness: ただしい ことばを えらぶ（kindness を ブレンド、brightness を igh で 問わない）", () => {
    const a = q(616, "movement");
    expect(a.promptJa).toBe("ただしい ことばは どれ？");
    expect(a.display).toBe("move（うごく）→ ？（うごき）");
    expect(ids(a).sort()).toEqual(["movement", "moveness", "movment"]);
    expect(q(618, "brightness").answer).toBe("brightness");
    expect(q(619, "loneliness").explanationJa).toContain("y を i に");
  });

  it.skipIf(!hasW21)("音の つながり: つなげた きこえかたを えらぶ（さいしょの おとの 問題に ならない）", () => {
    const a = q(621, "hold on");
    expect(a.promptJa).toBe("つなげて いうと どう きこえる？");
    expect(a.display).toBe("hold on");
    expect(a.audioText).toBe("hold on");
    expect(a.answer).toBe("ホウルドン");
    expect(ids(a)).toContain("ホウルド・オン");
    expect(ids(a)).toHaveLength(3);
    expect(q(622, "check it out").answer).toBe("チェキタウト");
    expect(q(624, "turn off").explanationJa).toContain("つながって");
  });

  it.skipIf(!hasW21)("ワールド21 の フォニックスの ことばは ぜんぶ もじの 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 601; n <= 630; n++) {
      for (const it of phonicsItems(n)) {
        for (const seed of [1, 3, 7]) {
          const a = makeQuestion(it, "phonics_sound", [], seededRng(seed), 0);
          expect(a.choices?.length ?? 0, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(ids(a), `L${n} ${it.text}`).toContain(a.answer);
          expect(new Set(ids(a)).size, `L${n} ${it.text}`).toBe(ids(a).length);
          expect(a.explanationJa, `L${n} ${it.text}`).toBeTruthy();
          expect(a.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
        }
      }
    }
  });

  it.skipIf(!hasW21)("un の ことば（L604）の ほかは ぜんぶ ワールド21 の 問題に なる", () => {
    for (let n = 601; n <= 630; n++) {
      for (const it of phonicsItems(n)) {
        if (it.text.startsWith("un")) continue;
        expect(w21Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
      }
    }
  });

  it("ワールド20 までの 回では ワールド21 の 問題に ならない", () => {
    for (const n of [60, 241, 517, 541, 600]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w21Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
