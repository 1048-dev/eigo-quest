/**
 * ワールド20の フォニックス（-ure・ear / eer・あいまい母音・ステージ2 の つづりの まとめ）の 問題と 表（src/lib/curriculum/w20Phonics.ts）。
 * - -ure は「この ことばの ure は どの おと？」（picture → チャー、treasure → ジャー、pure → ユア）
 * - ear / eer の「イア」は「＿ に はいる つづりは？」（ch＿ → eer / ear / ere / ier）、bear・learn の ear は「どの おと？」（イア / エア / アー）
 * - あいまい母音は「よわい『ア』の ところに はいる もじは？」（＿bout → a / u / e / o）
 * - ステージ2 の つづりの まとめ（tch・dge・-tion・kn・wr・mb・-ed・-ing）は まえの ワールドの 問題で 問う
 * - ワールド19 までの 回では ワールド20 の 問題に ならない
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w20Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { earOf, schwaBlank, ureSound } from "@/lib/curriculum/w20Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW20 = !!getLesson(600);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド20の つづりの表", () => {
  it("-ure: ure の まえの もじで おとが きまる（t → チャー、s → ジャー、それ いがい → ユア）", () => {
    expect(ureSound("picture")).toEqual({ answer: "チャー", before: "t", meaning: "え・しゃしん" });
    expect(ureSound("treasure")?.answer).toBe("ジャー");
    expect(ureSound("pure")).toMatchObject({ answer: "ユア", before: "p" });
    expect(ureSound("secure")?.answer).toBe("ユア");
    expect(["sure", "figure", "cure-all"].map(ureSound)).toEqual([null, null, null]);
  });

  it("ear / eer: 「イア」は つづりを ＿ に、エア・アー は おとを 問う", () => {
    expect(earOf("cheer")).toEqual({ kind: "blank", spelling: "eer", display: "ch＿（おうえんする）", answer: "eer", meaning: "おうえんする" });
    expect(earOf("near")).toMatchObject({ kind: "blank", answer: "ear", display: "n＿（ちかくに）" });
    expect(earOf("volunteer")).toMatchObject({ display: "volunt＿（ボランティア）" });
    expect(earOf("beard")).toMatchObject({ kind: "blank", display: "b＿d（あごひげ）" });
    expect(earOf("bear")).toEqual({ kind: "sound", spelling: "ear", answer: "エア", meaning: "くま" });
    expect(earOf("learn")?.answer).toBe("アー");
    expect(["heart", "here", "pier"].map(earOf)).toEqual([null, null, null]);
  });

  it("あいまい母音: よわい「ア」の もじを ＿ に して、u を かならず まちがいに 入れる", () => {
    expect(schwaBlank("about")).toEqual({ display: "＿bout（〜に ついて）", answer: "a", choices: ["a", "u", "e", "o"], syllables: "a-bout", meaning: "〜に ついて" });
    expect(schwaBlank("banana")?.display).toBe("banan＿（バナナ）");
    expect(schwaBlank("lemon")).toMatchObject({ answer: "o", display: "lem＿n（レモン）", choices: ["o", "u", "a", "e"] });
    expect(schwaBlank("seven")).toMatchObject({ answer: "e", display: "sev＿n（7）" });
    expect(schwaBlank("festival")?.display).toBe("festiv＿l（おまつり）");
    expect(schwaBlank("today")).toMatchObject({ answer: "o", display: "t＿day（きょう）" });
    expect(schwaBlank("apple")).toBeNull();
  });

  it("フォーカスの ボタン: -ure は「…ure」、a-bout は「a・bout」。読み上げは その回の ことば（ear は ワールド9 の まま）", () => {
    expect(focusLabel("-ure").main).toBe("…ure");
    expect(focusLabel("a-bout").main).toBe("a・bout");
    expect(focusExampleWord("ba-na-na", ["banana"])).toBe("banana");
    expect(focusSay("-ure", ["treasure", "measure"])).toBe("treasure");
    expect(focusSay("eer", ["cheer", "deer"])).toBe("cheer");
    expect(focusSay("a-bout", ["about"])).toBe("about");
    expect(focusSay("ear", ["near"])).toBe(focusSay("ear", []));
  });
});

describe("ワールド20の フォニックス問題", () => {
  it.skipIf(!hasW20)("-ure: おとを えらぶ（ワールド17 の -ture の つづりの 問題に ならない）", () => {
    const a = q(571, "picture");
    expect(a.promptJa).toBe("この ことばの ure は どの おと？");
    expect(a.display).toBe("picture（え・しゃしん）");
    expect(a.answer).toBe("チャー");
    expect(ids(a)).toEqual(["チャー", "ジャー", "ユア"]);
    expect(q(572, "treasure").answer).toBe("ジャー");
    expect(q(573, "cure").answer).toBe("ユア");
    expect(q(574, "creature").explanationJa).toContain("t の あと");
  });

  it.skipIf(!hasW20)("ear / eer: イア は つづり、bear・learn は おと（ワールド9 の ear の 問題に ならない）", () => {
    const a = q(577, "deer");
    expect(a.promptJa).toBe("＿ に はいる つづりは どれ？");
    expect(a.display).toBe("d＿（しか）");
    expect(a.answer).toBe("eer");
    expect(ids(a).sort()).toEqual(["ear", "eer", "ere", "ier"]);
    expect(q(578, "dear").answer).toBe("ear");
    expect(q(578, "dear").explanationJa).toContain("deer");
    const b = q(579, "bear");
    expect(b.promptJa).toBe("この ことばの ear は どの おと？");
    expect(b.answer).toBe("エア");
    expect(ids(b)).toEqual(["イア", "エア", "アー"]);
    expect(q(579, "earth").answer).toBe("アー");
  });

  it.skipIf(!hasW20)("あいまい母音: ワールド18 の 強勢の 問題に ならない", () => {
    const a = q(581, "about");
    expect(a.promptJa).toBe("よわい「ア」の ところに はいる もじは どれ？");
    expect(a.answer).toBe("a");
    expect(ids(a).sort()).toEqual(["a", "e", "o", "u"]);
    expect(q(582, "banana").display).toBe("banan＿（バナナ）");
    expect(q(583, "garden").answer).toBe("e");
    expect(q(585, "festival").explanationJa).toContain("fes・ti・val");
  });

  it.skipIf(!hasW20)("ステージ2 の つづりの まとめは まえの ワールドの 問題（tch・dge・-tion・だまっている もじ・-ed・-ing）", () => {
    expect(q(586, "kitchen")).toMatchObject({ display: "ki＿en", answer: "tch" });
    expect(q(587, "bridge").answer).toBe("dge");
    expect(q(588, "celebration")).toMatchObject({ promptJa: "ただしい つづりは どれ？", answer: "celebration" });
    expect(q(589, "hedge").answer).toBe("dge");
    expect(q(589, "station").answer).toBe("station");
    expect(q(591, "knee").answer).toBe("kn");
    expect(q(591, "lamb").display).toBe("la＿");
    expect(q(592, "carried")).toMatchObject({ display: "carry → ？", answer: "carried" });
    expect(q(593, "swimming")).toMatchObject({ display: "swim → ？", answer: "swimming" });
    expect(q(594, "waving").answer).toBe("waving");
    expect(q(596, "catch").answer).toBe("tch");
    expect(q(600, "dancing").display).toBe("dance → ？");
  });

  it.skipIf(!hasW20)("ワールド20 の フォニックスの ことばは ぜんぶ もじの 問題（＿ や → や 選択肢）に なる", () => {
    for (let n = 571; n <= 600; n++) {
      for (const it of phonicsItems(n)) {
        const a = makeQuestion(it, "phonics_sound", [], seededRng(3), 0);
        expect(a.choices?.length ?? 0, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
        expect(ids(a), `L${n} ${it.text}`).toContain(a.answer);
        expect(a.explanationJa, `L${n} ${it.text}`).toBeTruthy();
      }
    }
  });

  it.skipIf(!hasW20)("-ure・ear / eer・あいまい母音の ことばは ワールド20 の 問題に なる", () => {
    for (let n = 571; n <= 585; n++) {
      for (const it of phonicsItems(n)) expect(w20Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
    }
  });

  it("ワールド19 までの 回では ワールド20 の 問題に ならない", () => {
    for (const n of [29, 211, 258, 517, 570]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w20Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
