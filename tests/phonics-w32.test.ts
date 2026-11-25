/**
 * ワールド32の フォニックス（語根 geo・-al・方角の ことば・数と 分数と 割合の 読みかた・データの ことばの つづり）の 問題と 表（src/lib/curriculum/w32Phonics.ts）。
 * - geo は「geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？」（パーツと いみ → ことば）
 * - -al は「-al を つけて ようすの ことばに。ただしい つづりは どれ？」（natural / natureal / naturel）
 * - 方角は「ほうがくの ことば。あう ことばは どれ？」（northern / northen / northal、northeast / eastnorth）
 * - 数は「英語で なんと よむ？」（1/2 → one half、30% → thirty percent、2.5 → two point five）。音は 答えの よみ
 * - データの ことばは「ただしい つづりは どれ？」（average / averege / avrage）
 * - ワールド31 までの 回では ワールド32 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w32Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { alOf, dataOf, directionOf, geoOf, numberOf, w32Example, w32FocusOf, w32Say } from "@/lib/curriculum/w32Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW32 = !!getLesson(960);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w32Words = () => LESSONS.filter((x) => x.world === 32).flatMap((l) => l.phonics.words);

describe("ワールド32の つづりの表", () => {
  it("geo: 答えも まちがいも geo の ことばで 3つ ちがう（まちがいも 表に ある ことば）", () => {
    expect(geoOf("geology")).toMatchObject({ answer: "geology", wrong: ["geography", "geologist"] });
    expect(geoOf("geo")).toBeNull();
    expect(geoOf("toString")).toBeNull();
    for (const w of w32Words()) {
      const g = geoOf(w);
      if (!g) continue;
      expect(w.startsWith("geo"), w).toBe(true);
      expect(new Set([g.answer, ...g.wrong]).size, w).toBe(3);
      for (const x of g.wrong) expect(geoOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("-al: 答えは al で おわる。まちがいは ない ことばで、どの 表にも ない", () => {
    expect(alOf("natural")).toMatchObject({ base: "nature", wrong: ["natureal", "naturel"] });
    expect(alOf("nature")).toBeNull();
    for (const w of w32Words()) {
      const a = alOf(w);
      if (!a) continue;
      expect(w.endsWith("al"), w).toBe(true);
      expect(new Set([a.answer, ...a.wrong]).size, w).toBe(3);
      for (const x of a.wrong) expect(w32FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("方角: -ern・-east・-west・-ward の ことばは その つづりで おわる。まちがいは ない ことば", () => {
    expect(directionOf("northern")).toMatchObject({ focus: "-ern", base: "north", wrong: ["northen", "northal"] });
    expect(directionOf("northeast")).toMatchObject({ focus: "-east", base: null });
    expect(directionOf("upward")!.focus).toBe("-ward");
    expect(directionOf("north")).toBeNull();
    for (const w of w32Words()) {
      const d = directionOf(w);
      if (!d) continue;
      expect(w.endsWith(d.focus.slice(1)), w).toBe(true);
      expect(new Set([d.answer, ...d.wrong]).size, w).toBe(3);
      for (const x of d.wrong) expect(w32FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("数: 答えは 英語の よみ、まちがいも 英字の よみで 3つ ちがう。6 しゅるい", () => {
    expect(numberOf("350")).toMatchObject({ kind: "hundred", answer: "three hundred fifty" });
    expect(numberOf("1,000,000")!.answer).toBe("one million");
    expect(numberOf("1/2")).toMatchObject({ kind: "fraction", answer: "one half" });
    expect(numberOf("3/4")!.answer).toBe("three quarters");
    expect(numberOf("30%")).toMatchObject({ kind: "percent", answer: "thirty percent" });
    expect(numberOf("2.5")).toMatchObject({ kind: "decimal", answer: "two point five" });
    expect(numberOf("1868")).toBeNull(); // 年号は ワールド31
    for (const w of w32Words()) {
      const n = numberOf(w);
      if (!n) continue;
      for (const x of [n.answer, ...n.wrong]) expect(x, w).toMatch(/^[a-z]+([ -][a-z]+)*$/);
      expect(new Set([n.answer, ...n.wrong]).size, w).toBe(3);
    }
  });

  it("データの つづり: 文の ＿＿ に 答えを 入れると 文に なる。まちがいは ない ことば", () => {
    expect(dataOf("average")).toMatchObject({ focus: "-age", wrong: ["averege", "avrage"] });
    expect(dataOf("increase")!.focus).toBe("-ease");
    expect(dataOf("avrage")).toBeNull();
    for (const w of w32Words()) {
      const s = dataOf(w);
      if (!s) continue;
      expect(w.endsWith(s.focus.slice(1)) || w.includes(s.focus.slice(1)), w).toBe(true);
      expect(s.sentence.split("＿＿").length, w).toBe(2);
      expect(s.sentence, w).toMatch(/[.?!]$/);
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
      for (const x of s.wrong) expect(w32FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことばを よむ（数は 英語の よみかた、英字と スペース だけ）", () => {
    expect(focusSay("geo", ["geography", "geology", "geometry"])).toBe("geography");
    expect(focusSay("-west", ["northeast", "southeast", "northwest", "southwest"])).toBe("northwest");
    expect(focusSay("1/2", ["1/2", "1/4", "3/4", "1/3"])).toBe("one half");
    expect(focusExampleWord("75%", ["30%", "75%", "2.5", "0.5"])).toBe("seventy five percent");
    expect(focusExampleWord("1,000,000", ["30%", "1/2", "1,000,000", "western", "national"])).toBe("one million");
    expect(focusExampleWord("-al", ["30%", "1/2", "1,000,000", "western", "national"])).toBe("national");
    expect(focusExampleWord("-ount", ["amount", "count", "account"])).toBe("amount");
    expect(focusLabel("-ward").main).toBe("…ward");
    expect(focusLabel("geo").main).toBe("geo");
    expect(w32FocusOf("geologist")).toBe("geo"); // -ist が あっても geo の 表
    expect(w32FocusOf("percentage")).toBe("-age");
    for (const l of LESSONS.filter((x) => x.world === 32)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[a-z]+( [a-z]+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w32Say・w32Example は L930 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 931)) {
      for (const f of l.phonics.focus) {
        expect(w32Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w32Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド32の フォニックス問題", () => {
  it.skipIf(!hasW32)("geo: パーツと いみから ことばを えらぶ（geologist を ワールド31 の -ist で 問わない）", () => {
    const a = q(931, "geology");
    expect(a.promptJa).toBe("geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？");
    expect(a.display).toBe("geo（ちきゅう）＋ logy（〜の 学問） → ＿＿「ちしつがく（いしや ちそうの 学問）」");
    expect(ids(a).sort()).toEqual(["geography", "geologist", "geology"]);
    expect(a.answer).toBe("geology");
    expect(q(932, "geologist").answer).toBe("geologist");
  });

  it.skipIf(!hasW32)("-al と 方角", () => {
    const a = q(936, "natural");
    expect(a.promptJa).toBe("-al を つけて ようすの ことばに。ただしい つづりは どれ？");
    expect(a.display).toBe("nature（しぜん）＋ al → ＿＿（しぜんの）");
    expect(ids(a).sort()).toEqual(["natural", "natureal", "naturel"]);
    const b = q(942, "northeast");
    expect(b.promptJa).toBe("ほうがくの ことば。あう ことばは どれ？");
    expect(b.display).toBe("＿＿「北東（きたと ひがしの あいだ）」");
    expect(ids(b).sort()).toEqual(["eastnorth", "northeast", "northest"]);
    expect(q(944, "forward").answer).toBe("forward");
  });

  it.skipIf(!hasW32)("数: よみかたを えらぶ。音は 答えの よみ（1/2 を 日づけと よまない）", () => {
    const a = q(948, "1/2");
    expect(a.promptJa).toBe("英語で なんと よむ？");
    expect(a.answer).toBe("one half");
    expect(a.audioText).toBe("one half");
    expect(ids(a).sort()).toEqual(["one half", "one two", "two ones"]);
    expect(q(949, "30%").answer).toBe("thirty percent");
    expect(q(960, "3,000,000").answer).toBe("three million"); // ふりかえりでも おなじ 問い
  });

  it.skipIf(!hasW32)("データの つづり（percentage を ワールド31 で 問わない）", () => {
    const a = q(951, "average");
    expect(a.promptJa).toBe("ただしい つづりは どれ？");
    expect(a.display).toBe("へいきん：The ＿＿ temperature in July is 35 degrees.");
    expect(ids(a).sort()).toEqual(["average", "averege", "avrage"]);
    expect(q(953, "increase").answer).toBe("increase");
  });

  it.skipIf(!hasW32)("ワールド32 の フォニックスの ことばは ぜんぶ ワールド32 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 931; n <= 960; n++) {
      for (const it of phonicsItems(n)) {
        expect(w32Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド31 までの 回では ワールド32 の 問題に ならない", () => {
    for (const n of [161, 517, 621, 681, 711, 781, 811, 841, 871, 901, 906, 921, 930]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w32Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
