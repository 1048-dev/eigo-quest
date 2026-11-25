/**
 * ワールド34の フォニックス（空港の 数字の 読みかた・語根 vis・2つ ならぶ 文字・-ize の 動詞・イギリス英語と アメリカ英語）の 問題と 表（src/lib/curriculum/w34Phonics.ts）。
 * - 数字は「空港の 数字。英語で なんと よむ？」（Flight 205 → two oh five / twenty-five / two fifty）。音は 読みかたの 文
 * - vis は「vis（見る）の ことば。英語の せつめいに あう ことばは どれ？」（英語の せつめい → visa / vision / visit）
 * - 2つ ならぶ 文字は「ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）」（recommend / reccomend / recomend）
 * - -ize は「-ize を つけて 動詞に すると？ ただしい つづりは どれ？」（apology → apologize / apologyize / appologize）
 * - イギリスと アメリカは「イギリス英語では なんと いう？」（アメリカ: elevator → lift / flat / queue）・「イギリスの つづりは どれ？」
 * - ワールド33 までの 回では ワールド34 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w34Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { doubleOf, izeOf, travelNumberOf, ukUsOf, visOf, w34Example, w34FocusOf, w34Say } from "@/lib/curriculum/w34Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW34 = !!getLesson(1020);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w34Words = () => LESSONS.filter((x) => x.world === 34).flatMap((l) => l.phonics.words);

describe("ワールド34の つづりの表", () => {
  it("数字: 読みかたは 英字・スペース・ハイフン だけ。まちがいは ちがう 読みかたで 3つ ちがう。音は まえの ことば ＋ 読みかた", () => {
    expect(travelNumberOf("Flight 205")).toMatchObject({ kind: "flight", answer: "two oh five", wrong: ["twenty-five", "two fifty"], say: "Flight two oh five." });
    expect(travelNumberOf("6:05")).toMatchObject({ kind: "time", answer: "six oh five", say: "Six oh five." });
    expect(travelNumberOf("gate 23b")).toMatchObject({ word: "Gate 23B", answer: "twenty-three B" });
    expect(travelNumberOf("205")).toBeNull();
    expect(travelNumberOf("toString")).toBeNull();
    for (const w of w34Words()) {
      const n = travelNumberOf(w);
      if (!n) continue;
      expect(new Set([n.answer, ...n.wrong]).size, w).toBe(3);
      for (const x of [n.answer, ...n.wrong]) expect(x, w).toMatch(/^[A-Za-z]+([ -][A-Za-z]+)*$/);
      expect(n.say.toLowerCase(), w).toContain(n.answer.toLowerCase());
    }
  });

  it("vis: ことばに vis が ある。せつめいは 英語だけ。まちがいも 表に ある vis の ことばで 3つ ちがう", () => {
    expect(visOf("visa")).toMatchObject({ answer: "visa", def: "a paper or stamp that lets you enter a country", wrong: ["vision", "visit"] });
    expect(visOf("vis")).toBeNull();
    expect(visOf("constructor")).toBeNull();
    for (const w of w34Words()) {
      const v = visOf(w);
      if (!v) continue;
      expect(w, w).toContain("vis");
      expect(v.def, w).toMatch(/^[a-z ,;']+$/);
      expect(v.def, w).not.toContain(w); // せつめいに 答えの ことばを 入れない
      expect(new Set([v.answer, ...v.wrong]).size, w).toBe(3);
      for (const x of v.wrong) expect(visOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("2つ ならぶ 文字: 答えに その 文字が 2つ ならぶ。まちがいは ない ことばで、どの 表にも ない。文の ＿＿ は 1つ", () => {
    expect(doubleOf("recommend")).toMatchObject({ focus: "mm", wrong: ["reccomend", "recomend"] });
    expect(doubleOf("accommodation")).toMatchObject({ focus: "cc" });
    expect(doubleOf("mm")).toBeNull();
    for (const w of w34Words()) {
      const d = doubleOf(w);
      if (!d) continue;
      expect(w, w).toContain(d.focus);
      expect(d.sentence.split("＿＿").length, w).toBe(2);
      expect(new Set([d.answer, ...d.wrong]).size, w).toBe(3);
      for (const x of d.wrong) expect(w34FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("-ize: 答えは ize で おわる。y で おわる ことばは y を とる。まちがいは ない ことば", () => {
    expect(izeOf("apologize")).toMatchObject({ base: "apology", wrong: ["apologyize", "appologize"] });
    expect(izeOf("apology")).toBeNull();
    for (const w of w34Words()) {
      const z = izeOf(w);
      if (!z) continue;
      expect(w.endsWith("ize"), w).toBe(true);
      expect(w, w).toBe(z.base.endsWith("y") ? `${z.base.slice(0, -1)}ize` : `${z.base}ize`);
      expect(new Set([z.answer, ...z.wrong]).size, w).toBe(3);
      for (const x of z.wrong) expect(w34FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("イギリスと アメリカ: ことばの まちがいは おなじ がわの ことば、つづりの まちがいは ない ことば。ペアは もう かたほうと ぎゃくに なる", () => {
    expect(ukUsOf("lift")).toMatchObject({ side: "UK", other: "elevator", kind: "word" });
    expect(ukUsOf("elevator")).toMatchObject({ side: "US", other: "lift" });
    expect(ukUsOf("colour")).toMatchObject({ side: "UK", other: "color", kind: "spelling", wrong: ["colur", "coulor"] });
    expect(ukUsOf("color")).toBeNull();
    for (const w of w34Words()) {
      const u = ukUsOf(w);
      if (!u) continue;
      expect(new Set([u.answer, u.other, ...u.wrong]).size, w).toBe(4);
      const o = ukUsOf(u.other);
      if (o) expect(o, w).toMatchObject({ other: w, side: u.side === "UK" ? "US" : "UK" });
      for (const x of u.wrong) {
        if (u.kind === "spelling") expect(w34FocusOf(x), `${w} ${x}`).toBeNull();
        else {
          // 表に ある ことばなら おなじ がわ（表に ない ことばは ペアの もう かたほう）
          const xo = ukUsOf(x);
          if (xo) expect(xo.side, `${w} ${x}`).toBe(u.side);
        }
      }
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことばを よむ（数字は 英語の 読みかた。英字と スペース だけ）", () => {
    expect(focusSay("Flight 205", ["Flight 205", "Flight 318", "Flight 760", "Flight 1120"])).toBe("Flight two oh five");
    expect(focusSay("10:45", ["10:45", "6:05", "12:30", "7:15"])).toBe("Ten forty five");
    expect(focusExampleWord("mm", ["recommend", "excellent", "suggest"])).toBe("recommend");
    expect(focusExampleWord("-ize", ["apologize", "realize", "luggage", "vision", "12:30"])).toBe("apologize");
    expect(focusExampleWord("vis", ["apologize", "realize", "luggage", "vision", "12:30"])).toBe("vision");
    expect(focusExampleWord("lift", ["lift", "elevator", "holiday", "vacation"])).toBe("lift");
    expect(w34FocusOf("visualize")).toBe("vis"); // -ize が あっても vis の 表
    expect(w34FocusOf("luggage")).toBe("gg");
    for (const l of LESSONS.filter((x) => x.world === 34)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z]+( [A-Za-z]+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w34Say・w34Example は L990 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 991)) {
      for (const f of l.phonics.focus) {
        expect(w34Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w34Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド34の フォニックス問題", () => {
  it.skipIf(!hasW34)("数字: 読みかたを えらぶ。音は 読みかたの 文", () => {
    const a = q(991, "Flight 205");
    expect(a.promptJa).toBe("空港の 数字。英語で なんと よむ？");
    expect(a.display).toBe("Flight 205（205びん）");
    expect(ids(a).sort()).toEqual(["twenty-five", "two fifty", "two oh five"]);
    expect(a.answer).toBe("two oh five");
    expect(a.audioText).toBe("Flight two oh five.");
    expect(q(992, "6:05").answer).toBe("six oh five");
    expect(q(993, "Seat 14A").answer).toBe("fourteen A");
    expect(q(994, "Gate 102").answer).toBe("one oh two");
  });

  it.skipIf(!hasW34)("vis: 英語の せつめいから ことばを えらぶ（vision を ワールド17 の -sion で 問わない）", () => {
    const a = q(997, "visa");
    expect(a.promptJa).toBe("vis（見る）の ことば。英語の せつめいに あう ことばは どれ？");
    expect(a.display).toBe("a paper or stamp that lets you enter a country");
    expect(ids(a).sort()).toEqual(["visa", "vision", "visit"]);
    expect(q(996, "vision").answer).toBe("vision");
    expect(q(998, "television").answer).toBe("television");
  });

  it.skipIf(!hasW34)("2つ ならぶ 文字と -ize", () => {
    const a = q(1004, "recommend");
    expect(a.promptJa).toBe("ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）");
    expect(a.display).toBe("Could you ＿＿ a good restaurant?（すすめる）");
    expect(ids(a).sort()).toEqual(["reccomend", "recomend", "recommend"]);
    const b = q(1006, "apologize");
    expect(b.promptJa).toBe("-ize を つけて 動詞に すると？ ただしい つづりは どれ？");
    expect(b.display).toBe("apology（あやまる こと）→ ＿＿（あやまる）");
    expect(ids(b).sort()).toEqual(["apologize", "apologyize", "appologize"]);
    expect(q(1010, "luggage").answer).toBe("luggage");
  });

  it.skipIf(!hasW34)("イギリスと アメリカ: もう かたほうの ことばから えらぶ（vacation を -tion で 問わない）", () => {
    const a = q(1013, "lift");
    expect(a.promptJa).toBe("イギリス英語では なんと いう？");
    expect(a.display).toBe("アメリカ: elevator（エレベーター）→ イギリス: ＿＿");
    expect(ids(a).sort()).toEqual(["flat", "lift", "queue"]);
    const b = q(1013, "vacation");
    expect(b.promptJa).toBe("アメリカ英語では なんと いう？");
    expect(b.answer).toBe("vacation");
    const c = q(1014, "colour");
    expect(c.promptJa).toBe("イギリスの つづりは どれ？");
    expect(c.display).toBe("アメリカ: color（いろ）→ イギリス: ＿＿");
    expect(ids(c).sort()).toEqual(["colour", "colur", "coulor"]);
  });

  it.skipIf(!hasW34)("ワールド34 の フォニックスの ことばは ぜんぶ ワールド34 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 991; n <= 1020; n++) {
      for (const it of phonicsItems(n)) {
        expect(w34Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド33 までの 回では ワールド34 の 問題に ならない", () => {
    for (const n of [56, 57, 58, 517, 621, 681, 811, 876, 901, 946, 951, 961, 976, 990]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w34Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
