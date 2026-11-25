/**
 * ワールド14の フォニックス（複数形の -es / -ies / -ves・だまっている もじ kn wr mb・ph・大きな 数の つづり）の 問題と 表（src/lib/curriculum/w14Phonics.ts）。
 * - 複数形は「ふたつ いじょうの ときの ただしい つづりは？」（box → boxes / boxs / boxis）
 * - kn wr mb ph は「＿ に はいる つづりは？」（＿ife → kn、la＿ → mb、＿one → ph）
 * - 数は「きこえた 数の ただしい つづりは？」（forty / fourty。-teen と -ty の 回は thirteen / thirty の ききわけ）
 * - ワールド13 までの 回では ワールド14 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, w14Question } from "@/lib/curriculum/questions";
import { numberSpelling, pluralSpelling, silentBlank } from "@/lib/curriculum/w14Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW14 = !!getLesson(420);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド14の つづりの表", () => {
  it("複数形: s x ch sh → es、子音＋o → es、子音＋y → ies、母音＋y → s、f / fe → ves", () => {
    expect(pluralSpelling("boxes")).toEqual({ answer: "boxes", wrong: ["boxs", "boxis"], base: "box", kind: "es" });
    expect(["peaches", "dishes", "glasses", "buses", "sandwiches"].map((w) => pluralSpelling(w)?.base)).toEqual(["peach", "dish", "glass", "bus", "sandwich"]);
    expect(pluralSpelling("tomatoes")).toEqual({ answer: "tomatoes", wrong: ["tomatos", "tomatose"], base: "tomato", kind: "oes" });
    expect(pluralSpelling("berries")).toEqual({ answer: "berries", wrong: ["berrys", "berryes"], base: "berry", kind: "ies" });
    expect(pluralSpelling("keys")).toEqual({ answer: "keys", wrong: ["keies", "keyes"], base: "key", kind: "ys" });
    expect(pluralSpelling("knives")).toEqual({ answer: "knives", wrong: ["knifes", "knifs"], base: "knife", kind: "ves" });
    expect(pluralSpelling("loaves")).toEqual({ answer: "loaves", wrong: ["loafs", "loafes"], base: "loaf", kind: "ves" });
    // ふつうの s・もとの 形が わからない ことばは null（horses を hors に しない）
    expect(["apples", "horses", "oranges", "box", "pies"].map(pluralSpelling)).toEqual([null, null, null, null, null]);
  });

  it("だまっている もじの ＿: kn wr mb ph の ところを ＿ に する", () => {
    expect(silentBlank("knife", "kn")).toEqual({ display: "＿ife", answer: "kn" });
    expect(silentBlank("write", "wr")?.display).toBe("＿ite");
    expect(silentBlank("lamb", "mb")?.display).toBe("la＿");
    expect(silentBlank("plumber", "mb")?.display).toBe("plu＿er");
    expect(silentBlank("elephant", "ph")?.display).toBe("ele＿ant");
    expect(silentBlank("knife", "wr")).toBeNull();
    expect(silentBlank("knife", "es")).toBeNull();
  });

  it("数の つづり: まちがえやすい つづりと、-teen / -ty の ペア", () => {
    expect(numberSpelling("forty")?.wrong).toContain("fourty");
    expect(numberSpelling("forty", ["-teen", "-ty"])?.wrong[0]).toBe("fourteen");
    expect(numberSpelling("thirteen", ["-teen", "-ty"])?.wrong[0]).toBe("thirty");
    expect(numberSpelling("hundred", ["-teen", "-ty", "hundred"])?.wrong).toEqual(["hundered", "handred"]);
    expect(numberSpelling("seven")).toBeNull();
  });
});

describe("ワールド14の フォニックス問題", () => {
  it.skipIf(!hasW14)("複数形: もとの 形を 出して、ただしい つづりを えらぶ", () => {
    const a = q(391, "boxes");
    expect(a.display).toBe("box → ？");
    expect(a.answer).toBe("boxes");
    expect(ids(a).sort()).toEqual(["boxes", "boxis", "boxs"]);
    expect(q(394, "tomatoes").explanationJa).toContain("tomato");
    expect(ids(q(396, "berries"))).toContain("berrys");
    expect(q(398, "knives").answer).toBe("knives"); // knives は kn では なく 複数形の 回の 問題
    expect(ids(q(399, "toys"))).toContain("toies");
  });

  it.skipIf(!hasW14)("kn wr mb ph: ＿ に はいる つづりを えらぶ", () => {
    const a = q(401, "knife");
    expect(a.display).toBe("＿ife");
    expect(a.answer).toBe("kn");
    expect(ids(a).sort()).toEqual(["gn", "kn", "n", "nn"]);
    expect(q(403, "wrist").answer).toBe("wr");
    expect(q(406, "thumb").display).toBe("thu＿");
    expect(q(409, "dolphin").answer).toBe("ph");
    expect(q(410, "photo").answer).toBe("ph");
  });

  it.skipIf(!hasW14)("数: きこえた 数の つづり。L413 は -teen と -ty の ききわけ", () => {
    const a = q(411, "forty");
    expect(a.promptJa).toContain("数");
    expect(ids(a)).toContain("fourty");
    expect(ids(q(413, "thirteen"))).toContain("thirty");
    expect(ids(q(413, "forty"))).toContain("fourteen");
    expect(q(414, "thousand").answer).toBe("thousand");
  });

  it.skipIf(!hasW14)("ワールド14の ぜんぶの ことば: ワールド14 の 問題に なり、答えは 選択肢に 1つ、選択肢は ちがう もの", () => {
    for (let n = 391; n <= 420; n++) {
      for (const it of phonicsItems(n)) {
        expect(w14Question(it, seededRng(1)), `L${n} ${it.text}`).not.toBeNull();
        for (let seed = 1; seed <= 5; seed++) {
          const x = q(n, it.text, seed);
          const c = ids(x);
          expect(x.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
          expect(c.length, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((y) => y === x.answer), `L${n} ${it.text}`).toHaveLength(1);
          if (x.display) expect(x.display.includes(x.answer), `L${n} ${it.text}`).toBe(false);
        }
      }
    }
  });

  it("ワールド13 までの 回では ワールド14 の 問題に ならない", () => {
    for (const n of [150, 366, 390]) {
      const l = getLesson(n);
      if (!l) continue;
      for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w14Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
