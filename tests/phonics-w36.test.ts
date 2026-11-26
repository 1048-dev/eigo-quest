/**
 * ワールド36の フォニックス（語根 bio・学習語彙の 強勢・発表の 区切り・-ology と -ologist・数と たんいの 読みかた）の 問題と 表（src/lib/curriculum/w36Phonics.ts）。
 * - bio は「bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？」（＿＿: the study of living things → biology / biography / biosphere）
 * - 強勢は「つよく いう ところ（●）が あう ことばは どれ？」（○●（2つの 音の 2ばんめを つよく）→ research / summary / topic）
 * - 区切りは「発表の 文。ひと いき いれる（｜）のは どの ことばの あと？」（In short, the deep sea is dark and cold. → short / the / deep）
 * - -ology は「-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？」（英語の 文 → biologist / biology / biologyist）
 * - 数と たんいは「数と たんいの 読みかた。英語で どう よむ？」（−2°C → minus two degrees）
 * - ワールド35 までの 回では ワールド36 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w36Question } from "@/lib/curriculum/phonicsQ/w36";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { academicOf, academicPattern, academicPatternOf, bioOf, ologyOf, pauseMarked, pauseOf, unitOf, w36Example, w36FocusOf, w36Say } from "@/lib/curriculum/w36Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW36 = !!getLesson(1080);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w36Words = () => LESSONS.filter((x) => x.world === 36).flatMap((l) => l.phonics.words);
const tokens = (s: string) => s.split(" ").map((w) => w.replace(/[^A-Za-z']/g, ""));

describe("ワールド36の つづりの表", () => {
  it("bio: ことばに bio が ある。英語の せつめいに その ことばは 出てこない。まちがいは 表の ほかの bio の ことば", () => {
    expect(bioOf("biology")).toMatchObject({ definition: "the study of living things", wrong: ["biography", "biosphere"] });
    expect(bioOf("Bioluminescent")).toMatchObject({ word: "bioluminescent", answer: "bioluminescent" });
    expect(bioOf("bio")).toBeNull();
    expect(bioOf("toString")).toBeNull();
    for (const w of w36Words()) {
      const b = bioOf(w);
      if (!b) continue;
      expect(w, w).toContain("bio");
      expect(b.definition.toLowerCase(), w).not.toContain("bio");
      expect(new Set([b.answer, ...b.wrong]).size, w).toBe(3);
      for (const x of b.wrong) expect(bioOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("学習語彙の 強勢: つよく いう ところは 1つ。音節を つなぐと ことば。まちがいは 強勢の かたちが ちがう 表の ことば", () => {
    expect(academicOf("research")).toMatchObject({ syllables: "re-SEARCH", pattern: "○●", wrong: ["summary", "topic"] });
    expect(academicOf("information")!.pattern).toBe("○○●○");
    expect(academicPattern("SUM-ma-ry")).toBe("●○○");
    expect(academicOf("researcher")).toBeNull();
    for (const w of w36Words()) {
      const s = academicOf(w);
      if (!s) continue;
      expect(s.syllables.replace(/-/g, "").toLowerCase(), w).toBe(w);
      expect(s.pattern.split("●").length, w).toBe(2);
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
      for (const x of s.wrong) {
        expect(academicPatternOf(x), `${w} ${x}`).not.toBeNull();
        expect(academicPatternOf(x), `${w} ${x}`).not.toBe(s.pattern);
      }
    }
  });

  it("発表の 区切り: 区切る ことばと まちがいは 文の なかの ことば。区切りは 文の さいごでは ない", () => {
    expect(pauseOf("In short, the deep sea is dark and cold")).toMatchObject({ pause: "short", wrong: ["the", "deep"] });
    expect(pauseOf("first, it tells us where lanternfish live")).toMatchObject({ sentence: "First, it tells us where lanternfish live", pause: "First" });
    expect(pauseMarked(pauseOf("In short, the deep sea is dark and cold")!)).toBe("In short, ｜ the deep sea is dark and cold.");
    expect(pauseOf("In short")).toBeNull();
    for (const w of w36Words()) {
      const p = pauseOf(w);
      if (!p) continue;
      const ws = tokens(w);
      expect(ws, w).toContain(p.pause);
      expect(ws[ws.length - 1], w).not.toBe(p.pause);
      for (const x of p.wrong) expect(ws, `${w} ${x}`).toContain(x);
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
      expect(pauseMarked(p).split("｜").length, w).toBe(2);
    }
  });

  it("-ology と -ologist: 文の ＿＿ は 1つ。強勢は OL の ところ。まちがいは ほかの つづりで 3つ ちがう", () => {
    expect(ologyOf("biologist")).toMatchObject({ kind: "-ologist", stress: "bi-OL-o-gist", wrong: ["biology", "biologyist"] });
    expect(ologyOf("zoology")).toMatchObject({ kind: "-ology" });
    expect(ologyOf("biology")).toBeNull(); // bio の 表
    for (const w of w36Words()) {
      const o = ologyOf(w);
      if (!o) continue;
      expect(w.endsWith(o.kind.slice(1)), w).toBe(true);
      expect(o.sentence.split("＿＿").length, w).toBe(2);
      expect(o.sentence, w).toMatch(/^[A-Z][A-Za-z ,.'＿]+[.?]$/);
      expect(o.stress.replace(/-/g, "").toLowerCase(), w).toBe(w);
      expect(o.stress.split("-").find((x) => x === x.toUpperCase())!.toLowerCase(), w).toMatch(/ol$/);
      expect(new Set([o.answer, ...o.wrong]).size, w).toBe(3);
    }
  });

  it("数と たんい: 答えと まちがいは どれも 英字の 読みかたで、3つ ちがう", () => {
    expect(unitOf("−2°C")).toMatchObject({ answer: "minus two degrees", wrong: ["two minus degrees", "minus twenty degrees"] });
    expect(unitOf("3,800 METERS")).toMatchObject({ word: "3,800 meters", answer: "three thousand eight hundred meters" });
    expect(unitOf("3,800")).toBeNull();
    for (const w of w36Words()) {
      const u = unitOf(w);
      if (!u) continue;
      expect(w, w).toMatch(/\d/);
      for (const x of [u.answer, ...u.wrong]) expect(x, `${w} ${x}`).toMatch(/^[a-z]+([ -][a-z]+)*$/);
      expect(new Set([u.answer, ...u.wrong]).size, w).toBe(3);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文・数の 読みかたを よむ（英字・スペース・アポストロフィ だけ）", () => {
    expect(focusSay("bio", ["biology", "biography", "biome"])).toBe("biology");
    expect(focusExampleWord("result", ["research", "compare", "result", "summary"])).toBe("result");
    expect(focusSay("first", ["In this article, the writer explains marine snow", "First, it tells us where lanternfish live"])).toBe("First it tells us where lanternfish live");
    expect(focusSay("-ologist", ["biologist", "zoology", "zoologist"])).toBe("biologist");
    expect(focusExampleWord("−2°C", ["−2°C", "4°C", "350°C"])).toBe("minus two degrees");
    expect(focusSay("27 cm", ["13 meters", "27 cm", "11 km"])).toBe("twenty seven centimeters");
    expect(w36FocusOf("biologist")).toBe("-ologist");
    for (const l of LESSONS.filter((x) => x.world === 36)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z']+( [A-Za-z']+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w36Say・w36Example は L1050 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 1051)) {
      for (const f of l.phonics.focus) {
        expect(w36Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w36Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド36の フォニックス問題", () => {
  it.skipIf(!hasW36)("bio: 英語の せつめいに あう ことばを えらぶ", () => {
    const a = q(1051, "biology");
    expect(a.promptJa).toBe("bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？");
    expect(a.display).toBe("＿＿: the study of living things");
    expect(ids(a).sort()).toEqual(["biography", "biology", "biosphere"]);
    expect(a.answer).toBe("biology");
    expect(q(1052, "bioluminescent").answer).toBe("bioluminescent");
  });

  it.skipIf(!hasW36)("学習語彙の 強勢: ●○ の かたちに あう ことばを えらぶ（biology を ワールド23 の 強勢で 問わない）", () => {
    const a = q(1056, "research");
    expect(a.promptJa).toBe("つよく いう ところ（●）が あう ことばは どれ？");
    expect(a.display).toBe("○●（2つの 音の 2ばんめを つよく）");
    expect(ids(a).sort()).toEqual(["research", "summary", "topic"]);
    expect(q(1057, "information").display).toBe("○○●○（4つの 音の 3ばんめを つよく）");
  });

  it.skipIf(!hasW36)("発表の 区切り: 区切る ことばを えらぶ。音は 文", () => {
    const a = q(1061, "In short, the deep sea is dark and cold");
    expect(a.promptJa).toBe("発表の 文。ひと いき いれる（｜）のは どの ことばの あと？");
    expect(a.display).toBe("In short, the deep sea is dark and cold.（つまり、深海は くらくて つめたい）");
    expect(ids(a).sort()).toEqual(["deep", "short", "the"]);
    expect(a.answer).toBe("short");
    expect(a.audioText).toBe("In short, the deep sea is dark and cold");
    expect(q(1063, "First, it tells us where lanternfish live").answer).toBe("First");
  });

  it.skipIf(!hasW36)("-ology と 数と たんい", () => {
    const a = q(1066, "biologist");
    expect(a.promptJa).toBe("-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？");
    expect(a.display).toBe("A marine ＿＿ studies animals and plants that live in the sea.");
    expect(ids(a).sort()).toEqual(["biologist", "biology", "biologyist"]);
    const b = q(1072, "−2°C");
    expect(b.promptJa).toBe("数と たんいの 読みかた。英語で どう よむ？");
    expect(b.display).toBe("−2°C（マイナス 2 ど）");
    expect(ids(b).sort()).toEqual(["minus twenty degrees", "minus two degrees", "two minus degrees"]);
    expect(b.answer).toBe("minus two degrees");
    expect(b.audioText).toBe("minus two degrees");
    expect(q(1074, "100 km/h").answer).toBe("one hundred kilometers per hour");
  });

  it.skipIf(!hasW36)("ワールド36 の フォニックスの ことばは ぜんぶ ワールド36 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 1051; n <= 1080; n++) {
      for (const it of phonicsItems(n)) {
        expect(w36Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド35 までの 回では ワールド36 の 問題に ならない", () => {
    for (const n of [56, 57, 58, 517, 621, 661, 681, 811, 841, 851, 905, 921, 931, 961, 986, 991, 1006, 1021, 1041, 1050]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w36Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
