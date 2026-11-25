/**
 * ワールド27の フォニックス（k の おとの ch と -ache・だまって いる もじ・for と since・-able・同音異義語 2）の 問題と 表（src/lib/curriculum/w27Phonics.ts）。
 * - ch / -ache は「ただしい つづりは どれ？」（headache / headake / hedache）
 * - だまって いる もじは「こえに ださない もじは どれ？」（knee → k / n / e）
 * - for / since は「＿＿ に 入る ことばは どれ？」（for / since / from。選択肢は きまった 順）
 * - -able は「able の ことばで ただしい つづりは どれ？」
 * - 同音異義語は「ぶんに あう ことばは どれ？」（weak / week / wake）
 * - ワールド26 までの 回では ワールド27 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w27Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { FOR_SINCE_CHOICES, ableOf, chKOf, forSinceOf, homoOf, silentOf, w27Example, w27FocusOf, w27Say } from "@/lib/curriculum/w27Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW27 = !!getLesson(810);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w27Words = () => LESSONS.filter((x) => x.world === 27).flatMap((l) => l.phonics.words);

describe("ワールド27の つづりの表", () => {
  it("ch / -ache: k の おとの ch と、からだの ばしょ ＋ ache", () => {
    expect(chKOf("headache")).toMatchObject({ focus: "-ache", answer: "headache", wrong: ["headake", "hedache"], parts: ["head", "ache"] });
    expect(chKOf("stomach")).toMatchObject({ focus: "ch", answer: "stomach" });
    expect(chKOf("Christmas")!.answer).toBe("Christmas");
    expect(chKOf("chair")).toBeNull();
    for (const w of w27Words()) {
      const c = chKOf(w);
      if (!c) continue;
      expect(new Set([c.answer, ...c.wrong]).size, w).toBe(3);
      expect(c.answer.toLowerCase(), w).toContain("ch");
      for (const v of c.wrong) expect(v, w).not.toBe(c.answer);
      if (c.parts) expect(c.parts.join(""), w).toBe(c.word);
    }
  });

  it("だまって いる もじ: こたえの もじも まちがいの もじも ことばの なかに ある", () => {
    expect(silentOf("knee")).toMatchObject({ letter: "k", answer: "k", wrong: ["n", "e"] });
    expect(silentOf("hour")!.letter).toBe("h");
    expect(silentOf("should")!.letter).toBe("l");
    expect(silentOf("knife")).toBeNull();
    for (const w of w27Words()) {
      const s = silentOf(w);
      if (!s) continue;
      for (const x of [s.answer, ...s.wrong]) expect(s.word, `${w} ${x}`).toContain(x);
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
    }
  });

  it("for / since: for は ながさ、since は はじまり。文の ＿＿ に 入る", () => {
    expect(forSinceOf("for ten years")).toMatchObject({ focus: "for", answer: "for", rest: "ten years" });
    expect(forSinceOf("since I was five")).toMatchObject({ focus: "since", answer: "since", rest: "I was five" });
    expect(forSinceOf("from Monday")).toBeNull();
    expect(FOR_SINCE_CHOICES).toEqual(["for", "since", "from"]);
    for (const w of w27Words()) {
      const f = forSinceOf(w);
      if (!f) continue;
      expect(f.sentence, w).toContain("＿＿");
      expect(f.sentence, w).toMatch(/\b(I've|We've|has|have|haven't)\b/);
    }
  });

  it("-able: わなは ible と、e / y / ダブルの きまり", () => {
    expect(ableOf("comfortable")).toMatchObject({ trap: "plain", wrong: ["comfortible", "comfortabel"] });
    expect(ableOf("valuable")!.wrong).toContain("valueable");
    expect(ableOf("reliable")!.wrong).toContain("relyable");
    expect(ableOf("changeable")!.wrong).toContain("changable");
    expect(ableOf("unforgettable")!.wrong).toContain("unforgetable");
    expect(ableOf("table")).toBeNull();
    for (const w of w27Words()) {
      const a = ableOf(w);
      if (!a) continue;
      expect(a.answer.endsWith("able"), w).toBe(true);
      expect(new Set([a.answer, ...a.wrong]).size, w).toBe(3);
    }
  });

  it("同音異義語: おなじ おとの ことばは ペアで 表に あり、ワールド17 の ことばとは べつ", () => {
    expect(homoOf("weak")).toMatchObject({ focus: "weak", pair: "week / weak", wrong: ["week", "wake"] });
    expect(homoOf("week")!.wrong[0]).toBe("weak");
    for (const w of ["see", "sea", "two", "blue", "there"]) expect(homoOf(w), w).toBeNull();
    for (const w of w27Words()) {
      const h = homoOf(w);
      if (!h) continue;
      expect(homoOf(h.same)!.same, w).toBe(h.answer);
      expect(homoOf(h.same)!.pair, w).toBe(h.pair);
      expect(h.sentence, w).toContain("＿＿");
      expect(new Set([h.answer, ...h.wrong]).size, w).toBe(3);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・フレーズを よむ", () => {
    expect(focusSay("ch", ["echo", "school", "chorus", "character"])).toBe("echo");
    expect(focusSay("-ache", ["headache", "toothache", "earache", "ache"])).toBe("headache");
    expect(focusSay("l", ["salmon", "walk", "should", "answer"])).toBe("salmon");
    expect(focusSay("since", ["for three days", "since last week"])).toBe("since last week");
    expect(focusSay("-able", ["comfortable", "drinkable"])).toBe("comfortable");
    expect(focusSay("weak", ["week", "weak", "here", "hear"])).toBe("weak");
    expect(focusExampleWord("ch", ["echo", "school", "chorus", "character"])).toBe("echo");
    expect(focusExampleWord("l", ["salmon", "walk", "should", "answer"])).toBe("salmon");
    expect(focusExampleWord("hear", ["week", "weak", "here", "hear"])).toBe("hear");
    expect(focusLabel("weak").main).toBe("weak");
    expect(focusLabel("-ache")).toEqual({ main: "…ache", hintJa: "おわりの おと" });
    expect(w27FocusOf("since I was five")).toBe("since");
    expect(w27FocusOf("bellyache")).toBe("-ache");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w27Say・w27Example は L780 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 781)) {
      for (const f of l.phonics.focus) {
        expect(w27Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w27Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド27の フォニックス問題", () => {
  it.skipIf(!hasW27)("ch / -ache と だまって いる もじ", () => {
    const a = q(782, "headache");
    expect(a.promptJa).toBe("ただしい つづりは どれ？");
    expect(ids(a).sort()).toEqual(["headache", "headake", "hedache"]);
    expect(a.explanationJa).toContain("ache");
    const b = q(786, "knee");
    expect(b.promptJa).toBe("こえに ださない もじは どれ？");
    expect(b.display).toBe("knee（ひざ）");
    expect(b.answer).toBe("k");
    expect(ids(b).sort()).toEqual(["e", "k", "n"]);
  });

  it.skipIf(!hasW27)("for / since: 選択肢は きまった 順", () => {
    const a = q(791, "for ten years");
    expect(a.promptJa).toBe("＿＿ に 入る ことばは どれ？");
    expect(a.display).toBe("I've lived here ＿＿ ten years.（10ねん まえから ずっと）");
    expect(ids(a)).toEqual([...FOR_SINCE_CHOICES]);
    expect(a.answer).toBe("for");
    expect(q(792, "since I was five").answer).toBe("since");
  });

  it.skipIf(!hasW27)("-able と 同音異義語（here を ワールド17 の 表で 問わない）", () => {
    const a = q(796, "valuable");
    expect(a.promptJa).toBe("able の ことばで ただしい つづりは どれ？");
    expect(ids(a).sort()).toEqual(["valuable", "valueable", "valuible"]);
    const b = q(801, "here");
    expect(b.promptJa).toBe("ぶんに あう ことばは どれ？");
    expect(b.display).toBe("Don't worry. I'm ＿＿ for you.");
    expect(ids(b).sort()).toEqual(["hair", "hear", "here"]);
  });

  it.skipIf(!hasW27)("ワールド27 の フォニックスの ことばは ぜんぶ ワールド27 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 781; n <= 810; n++) {
      for (const it of phonicsItems(n)) {
        expect(w27Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド26 までの 回では ワールド27 の 問題に ならない", () => {
    for (const n of [161, 187, 258, 401, 406, 499, 552, 591, 751, 780]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w27Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
