/**
 * ワールド18の フォニックス（-er / -est・強勢・-ly・-ful / -less・un-）の 問題と 表（src/lib/curriculum/w18Phonics.ts）。
 * - くらべる かたちは「ただしい つづりは？」（big → ？（もっと おおきい）→ bigger / biger / biggar）
 * - 強勢は「つよく よむ ところは どこ？」（elephant → EL-e-phant / el-E-phant / el-e-PHANT）
 * - -ly は「ly を つけた ただしい つづりは？」（happy + ly → happily / happyly / happly）
 * - -ful / -less は「いみに あう ことばは？」（「ふちゅういな」→ careless / careful / careles）
 * - un- は「はんたいの いみの ことばは？」（happy → unhappy / inhappy / dishappy）
 * - ワールド17 までの 回では ワールド18 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w18Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { compareSpelling, fulLessOf, lySpelling, stressChoices, unOf } from "@/lib/curriculum/w18Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW18 = !!getLesson(540);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド18の つづりの表", () => {
  it("-er / -est: 4つの つけかたと、こどもが しがちな まちがい", () => {
    expect(compareSpelling("taller")).toEqual({ base: "tall", answer: "taller", wrong: ["talller", "tallar"], suffix: "er", kind: "add", meaning: "たかい" });
    expect(compareSpelling("nicest")?.wrong).toEqual(["niceest", "nicist"]);
    expect(compareSpelling("bigger")).toMatchObject({ kind: "double", wrong: ["biger", "biggar"] });
    expect(compareSpelling("happier")).toMatchObject({ kind: "y", wrong: ["happyer", "happer"] });
    expect(compareSpelling("heaviest")?.wrong).toEqual(["heavyest", "heavest"]);
    expect(["better", "water", "forest"].map(compareSpelling)).toEqual([null, null, null]);
  });

  it("強勢: つよい まとまりを 大文字に した 選択肢（まとまりは focus から）", () => {
    expect(stressChoices("elephant", ["el-e-phant"])).toEqual({ answer: "EL-e-phant", wrong: ["el-E-phant", "el-e-PHANT"], parts: ["el", "e", "phant"], meaning: "ぞう" });
    expect(stressChoices("banana", ["ba-na-na"])?.answer).toBe("ba-NA-na");
    expect(stressChoices("avocado", ["av-o-ca-do"])?.wrong).toHaveLength(3);
    // focus に わけかたが ない・表に ない ことばは 出さない
    expect(stressChoices("banana", ["-er"])).toBeNull();
    expect(stressChoices("sunset", ["sun-set"])).toBeNull();
  });

  it("-ly: そのまま・y → i・ful ＋ ly", () => {
    expect(lySpelling("quickly")).toEqual({ base: "quick", answer: "quickly", wrong: ["quickley", "quicklly"], kind: "add", meaning: "すばやく" });
    expect(lySpelling("happily")?.wrong).toEqual(["happyly", "happly"]);
    expect(lySpelling("carefully")?.wrong).toEqual(["carefuly", "carefulley"]);
    expect(lySpelling("family")).toBeNull();
  });

  it("-ful / -less: もう一方の おわりと l / s の かず まちがい", () => {
    expect(fulLessOf("colorful")).toEqual({ answer: "colorful", wrong: ["colorless", "colorfull"], suffix: "ful", stem: "color", meaning: "いろいろな いろの" });
    expect(fulLessOf("careless")?.wrong).toEqual(["careful", "careles"]);
    expect(fulLessOf("full")).toBeNull();
  });

  it("un-: in- / dis- に かえた ものを まちがいに する", () => {
    expect(unOf("unhappy")).toEqual({ base: "happy", answer: "unhappy", wrong: ["inhappy", "dishappy"], meaning: "かなしい" });
    expect(unOf("under")).toBeNull();
  });

  it("フォーカスの ボタン: un- は「un…」、-ly は その回の ことばで よむ", () => {
    expect(focusLabel("un-")).toEqual({ main: "un…", hintJa: "はじめに つける" });
    expect(focusLabel("-ful").main).toBe("…ful");
    expect(focusExampleWord("un-", ["unlock", "untie"])).toBe("unlock");
    expect(focusSay("-ly", ["quickly", "slowly"])).toBe("quickly");
    expect(focusSay("un-", ["unhappy"])).toBe("unhappy");
  });
});

describe("ワールド18の フォニックス問題", () => {
  it.skipIf(!hasW18)("-er / -est: もとの ことばと いみを 出して、ただしい つづりを えらぶ", () => {
    const a = q(513, "bigger");
    expect(a.display).toBe("big → ？（もっと おおきい）");
    expect(a.answer).toBe("bigger");
    expect(ids(a).sort()).toEqual(["biger", "biggar", "bigger"]);
    expect(q(514, "heaviest").display).toBe("heavy → ？（いちばん おもい）");
    expect(q(514, "heaviest").explanationJa).toContain("i に かえて");
  });

  it.skipIf(!hasW18)("強勢: ことばと いみを 出して、つよい ところを えらぶ（ふりかえりの 回も）", () => {
    const e = q(516, "elephant");
    expect(e.promptJa).toBe("つよく よむ ところは どこ？");
    expect(e.display).toBe("elephant（ぞう）");
    expect(e.answer).toBe("EL-e-phant");
    expect(ids(q(519, "helicopter"))).toHaveLength(4);
    expect(q(538, "volcano").answer).toBe("vol-CA-no");
    expect(q(540, "animal").answer).toBe("AN-i-mal");
  });

  it.skipIf(!hasW18)("-ly・-ful / -less・un-", () => {
    expect(q(523, "happily").display).toBe("happy + ly → ？");
    expect(ids(q(524, "carefully")).sort()).toEqual(["carefulley", "carefully", "carefuly"]);
    const c = q(527, "careless");
    expect(c.display).toBe("「ふちゅういな」");
    expect(ids(c)).toContain("careful");
    expect(q(531, "unkind").display).toBe("kind → ？（はんたいの いみ）");
    expect(q(537, "kindly").answer).toBe("kindly");
  });

  it.skipIf(!hasW18)("ワールド18の ぜんぶの ことば: ワールド18 の 問題に なり、答えは 選択肢に 1つ、選択肢は ちがう もの", () => {
    for (let n = 511; n <= 540; n++) {
      for (const it of phonicsItems(n)) {
        expect(w18Question(it, seededRng(1)), `L${n} ${it.text}`).not.toBeNull();
        for (let seed = 1; seed <= 5; seed++) {
          const x = q(n, it.text, seed);
          const c = ids(x);
          expect(x.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
          expect(c.length, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((y) => y === x.answer), `L${n} ${it.text}`).toHaveLength(1);
          expect(x.display?.includes(x.answer) ?? false, `L${n} ${it.text}: ${x.display}`).toBe(false);
        }
      }
    }
  });

  it("ワールド17 までの 回では ワールド18 の 問題に ならない", () => {
    for (const n of [151, 311, 337, 481, 510]) {
      const l = getLesson(n);
      if (!l) continue;
      for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w18Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
