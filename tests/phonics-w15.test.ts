/**
 * ワールド15の フォニックス（-ing の つづり・複合語・短縮形・y の 3つの おと）の 問題と 表（src/lib/curriculum/w15Phonics.ts）。
 * - -ing は「ing を つけた ただしい つづりは？」（make → making / makeing / makking、run → running / runing / runeing）
 * - 複合語は「2つの ことばに わけると？」（sun + flower / su + nflower / sunf + lower）
 * - 短縮形は「みじかい かたちは？」（she is → she's / shes / she'is）
 * - y は「この ことばの y は どの おと？」（イェ / イー / アイ）
 * - ワールド14 までの 回では ワールド15 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, w15Question } from "@/lib/curriculum/questions";
import { compoundChoices, compoundSplit, contractionOf, ingSpelling, missingLetters, y3Sound } from "@/lib/curriculum/w15Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW15 = !!getLesson(450);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド15の つづりの表", () => {
  it("-ing: e を とる・子音を 重ねる・そのまま", () => {
    expect(ingSpelling("making")).toEqual({ answer: "making", wrong: ["makeing", "makking"], base: "make", kind: "drop-e" });
    expect(ingSpelling("dancing")?.base).toBe("dance");
    expect(ingSpelling("running")).toEqual({ answer: "running", wrong: ["runing", "runeing"], base: "run", kind: "double" });
    expect(ingSpelling("swimming")?.base).toBe("swim");
    expect(ingSpelling("playing")).toEqual({ answer: "playing", wrong: ["playying", "playeing"], base: "play", kind: "plain" });
    // falling は fal + l では ない（そのまま ing）
    expect(ingSpelling("falling")?.kind).toBe("plain");
    expect(ingSpelling("falling")?.base).toBe("fall");
    expect(["seeing", "ring", "make"].map(ingSpelling)).toEqual([null, null, null]);
  });

  it("複合語: focus の ハイフンで わけて、1もじ ずれた わけかたを まちがいに する", () => {
    expect(compoundSplit("sunflower", ["sun-flower"])).toEqual(["sun", "flower"]);
    expect(compoundSplit("Sunflower", ["rain-bow", "sun-flower"])).toEqual(["sun", "flower"]);
    expect(compoundSplit("sunflower", ["rain-bow"])).toBeNull();
    expect(compoundSplit("sunflower", ["-ing"])).toBeNull();
    expect(compoundChoices("sun", "flower")).toEqual({ answer: "sun + flower", wrong: ["su + nflower", "sunf + lower"] });
  });

  it("短縮形: もとの 形と、' が ない・' の いちが ちがう つづり", () => {
    expect(contractionOf("I'm")).toEqual({ full: "I am", answer: "I'm", wrong: ["Im", "I'am"] });
    expect(contractionOf("she's")).toEqual({ full: "she is", answer: "she's", wrong: ["shes", "she'is"] });
    expect(contractionOf("they're")?.wrong).toEqual(["theyre", "they'are"]);
    expect(contractionOf("isn't")?.wrong).toEqual(["isnt", "is'nt"]);
    expect(contractionOf("doesn't")?.wrong).toEqual(["doesnt", "does'nt"]);
    expect(contractionOf("hello")).toBeNull();
    expect(missingLetters("I am", "I'm")).toBe("a");
    expect(missingLetters("is not", "isn't")).toBe("o");
    expect(missingLetters("they are", "they're")).toBe("a");
    expect(missingLetters("let us", "let's")).toBe("u");
    expect(missingLetters("cannot", "can't")).toBe("no");
  });

  it("y の 3つの おと: はじめは イェ、ながい ことばの おわりは イー、みじかい ことばの おわりは アイ", () => {
    expect(["yes", "yellow", "young"].map(y3Sound)).toEqual(["イェ", "イェ", "イェ"]);
    expect(["happy", "windy", "rainy"].map(y3Sound)).toEqual(["イー", "イー", "イー"]);
    expect(["fly", "sky", "why"].map(y3Sound)).toEqual(["アイ", "アイ", "アイ"]);
    expect(["yummy", "play", "boy", "gym"].map(y3Sound)).toEqual([null, null, null, null]);
  });
});

describe("ワールド15の フォニックス問題", () => {
  it.skipIf(!hasW15)("-ing: もとの 形を 出して、ただしい つづりを えらぶ", () => {
    const a = q(421, "making");
    expect(a.display).toBe("make → ？");
    expect(a.answer).toBe("making");
    expect(ids(a).sort()).toEqual(["makeing", "making", "makking"]);
    expect(q(426, "sitting").explanationJa).toContain("2つ");
    expect(ids(q(425, "playing"))).toContain("playying");
  });

  it.skipIf(!hasW15)("複合語・短縮形・y", () => {
    const c = q(431, "football");
    expect(c.answer).toBe("foot + ball");
    expect(c.display).toBe("football");
    const d = q(436, "she's");
    expect(d.display).toBe("she is → ？");
    expect(ids(d).sort()).toEqual(["she'is", "she's", "shes"]);
    expect(q(439, "isn't").explanationJa).toContain("o");
    expect(q(441, "rainy").answer).toBe("イー");
    expect(q(442, "sky").answer).toBe("アイ");
    expect(q(443, "yellow").answer).toBe("イェ");
    // ふりかえりの 回は ことばに あう focus で 問う
    expect(q(447, "isn't").answer).toBe("isn't");
    expect(q(449, "running").answer).toBe("running");
    expect(q(450, "they're").display).toBe("they are → ？");
  });

  it.skipIf(!hasW15)("ワールド15の ぜんぶの ことば: ワールド15 の 問題に なり、答えは 選択肢に 1つ、選択肢は ちがう もの", () => {
    for (let n = 421; n <= 450; n++) {
      for (const it of phonicsItems(n)) {
        expect(w15Question(it, seededRng(1)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド14 までの 回では ワールド15 の 問題に ならない", () => {
    for (const n of [130, 391, 420]) {
      const l = getLesson(n);
      if (!l) continue;
      for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w15Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
