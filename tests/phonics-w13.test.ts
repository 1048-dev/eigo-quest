/**
 * ワールド13の フォニックス（3 単現の -s / -es / -ies・とくべつな 形・-tch / -dge）の 問題と、おとの表（src/lib/curriculum/w13Phonics.ts）。
 * - -s / -es は「おわりの s は どの おと？」（ス / ズ / イズ。イズは L366 から）
 * - -ies・goes does has は「he / she の ときの ただしい つづりは？」（plays と plaies の くらべも）
 * - tch / dge は「＿ に はいる つづりは？」（ca＿ → tch、tea＿ → ch、pa＿ → ge）
 * - ワールド12 までの 回では ワールド13 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w13Question } from "@/lib/curriculum/phonicsQ/w13";
import { chBlank, heSpelling, sSound } from "@/lib/curriculum/w13Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW13 = !!getLesson(390);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド13の おとの表", () => {
  it("3 単現の s の おと: いきだけの おとの あとは ス、こえの でる おとの あとは ズ、s x ch sh（ce ge）の あとは イズ", () => {
    expect(["likes", "eats", "jumps", "makes", "wants", "helps"].map(sSound)).toEqual(["s", "s", "s", "s", "s", "s"]);
    expect(["plays", "runs", "rides", "comes", "goes", "does", "has", "studies", "sees"].map(sSound)).toEqual(["z", "z", "z", "z", "z", "z", "z", "z", "z"]);
    expect(["watches", "washes", "fixes", "kisses", "buzzes", "dances", "changes", "uses"].map(sSound)).toEqual(["iz", "iz", "iz", "iz", "iz", "iz", "iz", "iz"]);
    expect(["bus", "this", "kiss", "catch", "s"].map(sSound)).toEqual([null, null, null, null, null]);
  });

  it("he / she の つづり: 子音＋y は ies、母音＋y は s、goes does has は とくべつ", () => {
    expect(heSpelling("studies")).toEqual({ answer: "studies", wrong: ["studys", "studyes"], base: "study", kind: "ies" });
    expect(heSpelling("cries")?.base).toBe("cry");
    expect(heSpelling("plays")).toEqual({ answer: "plays", wrong: ["plaies", "playes"], base: "play", kind: "ys" });
    expect(heSpelling("goes")?.kind).toBe("irregular");
    expect(heSpelling("has")?.base).toBe("have");
    expect(heSpelling("likes")).toBeNull();
    expect(heSpelling("pies")).toBeNull(); // 1もじ＋ies は 3 単現の ies では ない
  });

  it("「チ」「ヂ」の ＿: tch → ch、dge → ge の じゅん。ことばの はじめの ch・かたい g は 出さない", () => {
    expect(chBlank("catch", ["tch"])).toEqual({ display: "ca＿", answer: "tch", before: "a" });
    expect(chBlank("kitchen", ["tch"])?.display).toBe("ki＿en");
    expect(chBlank("teach", ["tch", "ch"])).toEqual({ display: "tea＿", answer: "ch", before: "a" });
    expect(chBlank("catch", ["ch"])).toBeNull(); // tch の なかの ch は ch と しない
    expect(chBlank("hedgehog", ["dge", "ge"])?.display).toBe("he＿hog");
    expect(chBlank("page", ["dge", "ge"])).toEqual({ display: "pa＿", answer: "ge", before: "a" });
    expect(chBlank("chip", ["ch"])).toBeNull();
    expect(chBlank("get", ["ge"])).toBeNull();
  });
});

describe("ワールド13の フォニックス問題", () => {
  it.skipIf(!hasW13)("-s: L361〜365 は ス / ズ の 2たく、L366 から イズ も 入る。ことばを 画面に 出す", () => {
    const a = q(361, "likes");
    expect(a.answer).toBe("s");
    expect(ids(a).sort()).toEqual(["s", "z"]);
    expect(a.display).toBe("likes");
    expect(q(362, "plays").answer).toBe("z");
    const b = q(366, "washes");
    expect(b.answer).toBe("iz");
    expect(ids(b).sort()).toEqual(["iz", "s", "z"]);
    expect(q(370, "cooks").answer).toBe("s");
    expect(ids(q(370, "cooks"))).toHaveLength(3);
  });

  it.skipIf(!hasW13)("-ies・とくべつな 形: ただしい つづりを えらぶ（plays は plaies と くらべる）", () => {
    const a = q(371, "studies");
    expect(a.promptJa).toContain("he / she");
    expect(a.answer).toBe("studies");
    expect(ids(a).sort()).toEqual(["studies", "studyes", "studys"]);
    expect(q(373, "does").answer).toBe("does");
    expect(ids(q(374, "plays"))).toContain("plaies");
    expect(q(387, "reads").answer).toBe("z"); // -ies の 形で ない ことばは つぎの フォーカス（-s）の おとで 問う
  });

  it.skipIf(!hasW13)("tch / dge: ＿ に はいる つづり。ふりかえりでは ch / ge と くらべる", () => {
    const a = q(376, "kitchen");
    expect(a.display).toBe("ki＿en");
    expect(a.answer).toBe("tch");
    expect(q(380, "teach").answer).toBe("ch");
    expect(q(380, "lunch").display).toBe("lun＿");
    expect(q(381, "bridge").answer).toBe("dge");
    expect(q(385, "large").answer).toBe("ge");
    expect(q(390, "bridge").answer).toBe("dge");
    expect(q(390, "watches").answer).toBe("iz");
  });

  it.skipIf(!hasW13)("ワールド13の ぜんぶの ことば: ワールド13 の 問題に なり、答えは 選択肢に 1つ、選択肢は ちがう もの", () => {
    for (let n = 361; n <= 390; n++) {
      for (const it of phonicsItems(n)) {
        expect(w13Question(it, seededRng(1)), `L${n} ${it.text}`).not.toBeNull();
        for (let seed = 1; seed <= 5; seed++) {
          const x = q(n, it.text, seed);
          const c = ids(x);
          expect(x.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
          expect(c.length, `L${n} ${it.text}`).toBeGreaterThanOrEqual(2);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((y) => y === x.answer), `L${n} ${it.text}`).toHaveLength(1);
          // 答えの つづりが 画面に そのまま 出ない（＿ の 問題）
          if (x.display?.includes("＿")) expect(x.display.includes(x.answer), `L${n} ${it.text}`).toBe(false);
        }
      }
    }
  });

  it("ワールド12 までの 回では ワールド13 の 問題に ならない", () => {
    const l = getLesson(150);
    if (!l) return;
    for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w13Question(it, seededRng(1))).toBeNull();
  });
});
