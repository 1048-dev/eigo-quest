/**
 * ワールド22の フォニックス（人の -er / -or / -ist・語の家族・あいまい母音と 強勢・-ous / -al・おわりの しるし）の 問題と 表（src/lib/curriculum/w22Phonics.ts）。
 * - 人の ことばは「「〜する 人」を あらわす ことばは どれ？」（write → writer / writor / writist）
 * - 語の家族は「act の かぞくで「はいゆう」の いみの ことばは どれ？」（actor / action / active）
 * - あいまい母音は つよい はくを 大文字に して「よわい「ア」の ところに はいる もじは どれ？」（penc＿l（PEN・cil））
 * - -ous / -al は「ただしい ことばは どれ？」（もう 1つの おわり・つづりの まちがい）
 * - おわりの しるしは「おわりに つける しるしは どれ？」（Who are you ＿ → ? / ! / .。いみに ！ ？ を つけない）
 * - ワールド21 までの 回では ワールド22 の 問題に ならない
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w22Question } from "@/lib/curriculum/phonicsQ/w22";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { adjOf, familyEnding, familyOf, markOf, markWhy, personOf, schwaStressBlank } from "@/lib/curriculum/w22Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW22 = !!getLesson(660);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド22の つづりの表", () => {
  it("人の -er / -or / -ist: まちがいの 選択肢は ほかの 2つの おわり（e で おわる ことばは e を とる）", () => {
    expect(personOf("writer")).toMatchObject({ kind: "er", base: "write", wrong: ["writor", "writist"] });
    expect(personOf("actor")).toMatchObject({ kind: "or", base: "act", wrong: ["acter", "actist"] });
    expect(personOf("narrator")?.wrong).toEqual(["narrater", "narratist"]);
    expect(personOf("artist")).toMatchObject({ kind: "ist", wrong: ["arter", "artor"] });
    // sailor（sailer も ある）・inventor（inventer も ある）は 入れない
    expect(["sailor", "inventor", "visitor", "water"].map(personOf)).toEqual([null, null, null, null]);
  });

  it("語の家族: もとの ことばの かぞくから 3つ（答えを ふくむ）。focus に ない かぞくは 問わない", () => {
    const a = familyOf("actor", ["act"])!;
    expect(a).toMatchObject({ root: "act", answer: "actor", meaning: "はいゆう" });
    expect(a.choices).toHaveLength(3);
    expect(a.choices).toContain("actor");
    expect(familyOf("director", ["direct"])!.choices.sort()).toEqual(["direction", "directly", "director"]);
    expect(familyOf("actor", ["invent"])).toBeNull();
    expect(familyOf("act", ["act"])).toBeNull();
    expect(familyEnding("act", "activity")).toBe("ity");
    expect(familyEnding("invent", "inventive")).toBe("ive");
    expect(familyEnding("direct", "directly")).toBe("ly");
  });

  it("あいまい母音と 強勢: つよい はくを 大文字に、よわい「ア」の もじを ＿ に（lesson は lessen と おなじ おとなので 入れない）", () => {
    expect(schwaStressBlank("pencil")).toMatchObject({ display: "penc＿l（PEN・cil・えんぴつ）", answer: "i", stressed: "PEN・cil" });
    expect(schwaStressBlank("asleep")).toMatchObject({ display: "＿sleep（a・SLEEP・ねむって）", answer: "a" });
    expect(schwaStressBlank("circus")?.answer).toBe("u");
    expect(schwaStressBlank("second")?.choices).toEqual(["o", "u", "a", "e"]);
    expect(["lesson", "banana", "dog"].map(schwaStressBlank)).toEqual([null, null, null]);
  });

  it("-ous / -al: もう 1つの おわりと つづりの まちがい（e を とる・y を i に・ous・al）", () => {
    expect(adjOf("famous")).toMatchObject({ kind: "ous", base: "fame", wrong: ["famal", "fameous"], trap: "drop-e" });
    expect(adjOf("dangerous")).toMatchObject({ wrong: ["dangeral", "dangerus"], trap: "ous-not-us" });
    expect(adjOf("mysterious")).toMatchObject({ wrong: ["mysterial", "mysteryous"], trap: "y-to-i" });
    expect(adjOf("joyous")).toMatchObject({ wrong: ["joyal", "joyus"], trap: "ous-not-us" }); // o ＋ y は そのまま
    expect(adjOf("magical")).toMatchObject({ kind: "al", wrong: ["magicous", "magicle"], trap: "al-not-le" });
    expect(adjOf("natural")).toMatchObject({ wrong: ["naturous", "natureal"], trap: "drop-e" });
    // nervous（nerval）・humorous（humoral）は もう 1つの おわりで ある ことばに なるので 入れない
    expect(["nervous", "humorous", "animal", "bus"].map(adjOf)).toEqual([null, null, null, null]);
  });

  it("おわりの しるし: ? か !、いみには ！ ？ を つけない（こたえが わかって しまう）", () => {
    expect(markOf("Who are you")).toEqual({ phrase: "who are you", answer: "?", meaning: "あなたは だれ" });
    expect(markOf("Help")?.answer).toBe("!");
    expect(markOf("Thank you")).toBeNull(); // 「.」も いえる
    expect(markWhy("Help", markOf("Help")!)).toContain("Help!");
    for (const p of ["Help", "Watch out", "Who's there", "Where are you", "Wow", "Can you help me", "Oh no", "What happened", "Hooray", "Who are you", "Look out", "Are you okay"]) {
      expect(markOf(p)!.meaning, p).not.toMatch(/[！？!?]/);
    }
  });

  it("フォーカスの ボタン: -ist・-ous・-al は その回の ことば、はくの 形・しるしの フレーズは ことばで よむ", () => {
    expect(focusSay("-ist", ["artist", "cartoonist"])).toBe("artist");
    expect(focusSay("-ous", ["famous", "dangerous"])).toBe("famous");
    expect(focusSay("-al", ["famous", "magical"])).toBe("magical");
    expect(focusSay("pen-cil", ["pencil"])).toBe("pencil");
    expect(focusSay("Who are you", ["Who are you"])).toBe("Who are you");
    expect(focusLabel("-ist").main).toBe("…ist");
    expect(focusLabel("Watch out").main).toBe("Watch out");
    expect(focusExampleWord("Who's there", ["Help", "Who's there"])).toBe("Who's there");
  });
});

describe("ワールド22の フォニックス問題", () => {
  it.skipIf(!hasW22)("人の ことば: writer を ワールド11 の -er で 問わない", () => {
    const a = q(631, "writer");
    expect(a.promptJa).toBe("「〜する 人」を あらわす ことばは どれ？");
    expect(a.display).toBe("write（かく）→ ？（さっか・かく 人）");
    expect(ids(a).sort()).toEqual(["writer", "writist", "writor"]);
    expect(q(632, "illustrator").answer).toBe("illustrator");
    expect(q(633, "cartoonist").explanationJa).toContain("-ist");
  });

  it.skipIf(!hasW22)("語の家族: もとの ことばの かぞくから えらぶ", () => {
    const a = q(636, "actor");
    expect(a.promptJa).toBe("act の かぞくで「はいゆう」の いみの ことばは どれ？");
    expect(a.display).toBe("act（する・えんじる）の かぞく");
    expect(a.answer).toBe("actor");
    expect(q(639, "active").promptJa).toContain("act の かぞく");
    expect(q(638, "protection").explanationJa).toContain("こと・もの");
  });

  it.skipIf(!hasW22)("あいまい母音と 強勢: pencil を ワールド20 の 問題に しない（つよい はくを 見せる）", () => {
    const a = q(642, "pencil");
    expect(a.promptJa).toBe("よわい「ア」の ところに はいる もじは どれ？");
    expect(a.display).toBe("penc＿l（PEN・cil・えんぴつ）");
    expect(a.answer).toBe("i");
    expect(q(641, "asleep").explanationJa).toContain("a・SLEEP");
  });

  it.skipIf(!hasW22)("-ous / -al: ただしい ことばを えらぶ", () => {
    const a = q(646, "dangerous");
    expect(a.promptJa).toBe("ただしい ことばは どれ？");
    expect(a.display).toBe("danger（きけん）→ ？（きけんな）");
    expect(ids(a).sort()).toEqual(["dangeral", "dangerous", "dangerus"]);
    expect(q(647, "mysterious").explanationJa).toContain("y を i に");
    expect(q(648, "natural").explanationJa).toContain("e は とって");
  });

  it.skipIf(!hasW22)("おわりの しるし: ? / ! / . から えらぶ（さいしょの おとの 問題に ならない）", () => {
    const a = q(654, "Who are you");
    expect(a.promptJa).toBe("おわりに つける しるしは どれ？");
    expect(a.display).toBe("Who are you ＿（あなたは だれ）");
    expect(a.audioText).toBe("Who are you");
    expect(a.answer).toBe("?");
    expect(ids(a).sort()).toEqual(["!", ".", "?"]);
    expect(q(651, "Help").answer).toBe("!");
  });

  it.skipIf(!hasW22)("ワールド22 の フォニックスの ことばは ぜんぶ ワールド22 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 631; n <= 660; n++) {
      for (const it of phonicsItems(n)) {
        expect(w22Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
        for (const seed of [1, 3, 7]) {
          const a = makeQuestion(it, "phonics_sound", [], seededRng(seed), 0);
          expect(a.choices?.length ?? 0, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(ids(a), `L${n} ${it.text}`).toContain(a.answer);
          expect(new Set(ids(a)).size, `L${n} ${it.text}`).toBe(ids(a).length);
          expect(a.explanationJa, `L${n} ${it.text}`).toBeTruthy();
        }
      }
    }
  });

  it("ワールド21 までの 回では ワールド22 の 問題に ならない", () => {
    for (const n of [60, 241, 511, 581, 601, 630]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w22Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
