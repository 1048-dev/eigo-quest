/**
 * ワールド39の フォニックス（環境の ことばの パーツ・大きな 数と 割合・ディベートの プロソディ・つなぎの ことば・ヘッジの ことば）の 問題と 表（src/lib/curriculum/w39Phonics.ts）。
 * - パーツは「環境の ことばの パーツ。＿＿ に 入る パーツは どれ？」（re ＋ ＿＿ ＋ able → new）
 * - 数は「大きな 数と 割合。英語で どう よむ？」（1,000,000 → one million）
 * - プロソディは「ディベートの プロソディ。いちばん つよく いう ことばは どれ？」（We believe that schools should have gardens. → believe）
 * - つなぎの ことばは「つなぎの ことば。＿＿ に 入る ことばは どれ？」（Plastic is useful. ＿＿, it can harm the sea. → However）
 * - ヘッジは「ヘッジの ことば。いいすぎない ことばは どれ？」（It will ＿＿ rain this afternoon.（たぶん）→ probably）
 * - ワールド38 までの 回では ワールド39 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w39Question } from "@/lib/curriculum/phonicsQ/w39";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { bigNumberOf, debateOf, ecoWordOf, hedgeOf, markerOf, w39Example, w39FocusOf, w39Say } from "@/lib/curriculum/w39Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW39 = !!getLesson(1170);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w39Words = () => LESSONS.filter((x) => x.world === 39).flatMap((l) => l.phonics.words);
const words = (s: string) => s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);

describe("ワールド39の つづりの表", () => {
  it("環境の ことばの パーツ: パーツを つなげると ことば。3つ ちがう", () => {
    expect(ecoWordOf("renewable")).toMatchObject({ parts: ["re", "new", "able"], answer: "new", wrong: ["cycle", "duce"] });
    expect(ecoWordOf("Solar")).toMatchObject({ word: "solar", answer: "sol" });
    expect(ecoWordOf("renew")).toBeNull();
    expect(ecoWordOf("toString")).toBeNull();
    for (const w of w39Words()) {
      const e = ecoWordOf(w);
      if (!e) continue;
      // pollute → pollut・conserve → conserv・globe → glob・use → us（e を とった パーツ）
      expect(e.parts.join(""), w).toBe(w);
      expect(new Set([e.answer, ...e.wrong]).size, w).toBe(3);
    }
  });

  it("大きな 数と 割合: 数字の 表示と よみかた。million・billion・percent に s を つけない。3つ ちがう", () => {
    expect(bigNumberOf("one million")).toMatchObject({ shown: "1,000,000", answer: "one million" });
    expect(bigNumberOf("Eight  billion")).toMatchObject({ word: "eight billion", shown: "8,000,000,000" });
    expect(bigNumberOf("million")).toBeNull();
    for (const w of w39Words()) {
      const n = bigNumberOf(w);
      if (!n) continue;
      expect(n.answer, w).not.toMatch(/(millions|billions|percents)$/);
      expect(new Set([n.answer, ...n.wrong]).size, w).toBe(3);
      for (const x of n.wrong) expect(bigNumberOf(x)?.shown, `${w} ${x}`).not.toBe(n.shown);
    }
  });

  it("ディベートの プロソディ: つよく いう ことばも まちがいも 例文と 文の はじめの なかの ことば。3つ ちがう", () => {
    expect(debateOf("we believe that")).toMatchObject({ phrase: "We believe that", answer: "believe", stressed: "beLIEVE" });
    expect(debateOf("We believe")).toBeNull();
    for (const w of w39Words()) {
      const d = debateOf(w);
      if (!d) continue;
      expect(d.sentence.startsWith(d.phrase) || d.sentence.includes(d.phrase.toLowerCase()), w).toBe(true);
      expect(words(d.phrase), w).toContain(d.answer);
      for (const x of d.wrong) expect(words(d.sentence), `${w} ${x}`).toContain(x);
      expect(new Set([d.answer, ...d.wrong]).size, w).toBe(3);
      expect(d.stressed.toLowerCase(), w).toBe(d.answer);
    }
  });

  it("つなぎの ことば: ＿＿ が 1つ。まちがいも この 表の つなぎの ことば。3つ ちがう", () => {
    expect(markerOf("however")).toMatchObject({ marker: "However", answer: "However" });
    expect(markerOf("on the other")).toBeNull();
    for (const w of w39Words()) {
      const m = markerOf(w);
      if (!m) continue;
      expect(m.blank.split("＿＿").length, w).toBe(2);
      expect(m.blank, w).toMatch(/＿＿,/);
      for (const x of m.wrong) expect(markerOf(x), `${w} ${x}`).not.toBeNull();
      expect(new Set([m.answer, ...m.wrong]).size, w).toBe(3);
      expect(m.say.toLowerCase().replace(/[^a-z ]/g, ""), w).toBe(m.marker.toLowerCase());
    }
  });

  it("ヘッジの ことば: ＿＿ が 1つ。まちがいは いいすぎの ことば（ヘッジの 表に ない）。3つ ちがう", () => {
    expect(hedgeOf("probably")).toMatchObject({ ja: "たぶん", wrong: ["definitely", "never"] });
    expect(hedgeOf("maybe")).toBeNull();
    for (const w of w39Words()) {
      const h = hedgeOf(w);
      if (!h) continue;
      expect(h.blank.split("＿＿").length, w).toBe(2);
      for (const x of h.wrong) expect(hedgeOf(x), `${w} ${x}`).toBeNull();
      expect(new Set([h.answer, ...h.wrong]).size, w).toBe(3);
    }
  });

  it("フォーカスの ボタン: その focus の ことば・数・文の はじめ・つなぎの ことばを よむ（英字・スペース・アポストロフィ だけ）", () => {
    expect(focusSay("renewable", ["environment", "sustainable", "renewable"])).toBe("renewable");
    expect(focusExampleWord("one third", ["half", "one third", "two thirds"])).toBe("one third");
    expect(focusSay("we believe that", ["We believe that", "We strongly believe", "That is not true"])).toBe("We believe that");
    expect(focusExampleWord("on the other hand", ["Moreover", "As a result", "On the other hand"])).toBe("On the other hand");
    expect(focusSay("might", ["seem", "might", "probably"])).toBe("might");
    expect(w39FocusOf("However")).toBe("however");
    expect(w39FocusOf("Our First Point Is")).toBe("our first point is");
    // 1こ だけの 回では はたらかない
    expect(w39Say("about", ["about"])).toBeNull();
    for (const l of LESSONS.filter((x) => x.world === 39)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w39Say・w39Example は L1140 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 1141)) {
      for (const f of l.phonics.focus) {
        expect(w39Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w39Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド39の フォニックス問題", () => {
  it.skipIf(!hasW39)("環境の ことばの パーツ: ＿＿ に 入る パーツを えらぶ", () => {
    const a = q(1141, "renewable");
    expect(a.promptJa).toBe("環境の ことばの パーツ。＿＿ に 入る パーツは どれ？");
    expect(a.display).toBe("re ＋ ＿＿ ＋ able（また 新しく つくれる（太陽や 風の エネルギー））");
    expect(ids(a).sort()).toEqual(["cycle", "duce", "new"]);
    expect(a.answer).toBe("new");
    expect(q(1142, "recycle").answer).toBe("re");
  });

  it.skipIf(!hasW39)("大きな 数と 割合: よみかたを えらぶ", () => {
    const a = q(1146, "one million");
    expect(a.promptJa).toBe("大きな 数と 割合。英語で どう よむ？");
    expect(a.display).toBe("1,000,000（0 が 6こ）");
    expect(ids(a).sort()).toEqual(["one billion", "one million", "ten thousand"]);
    expect(q(1148, "two thirds").answer).toBe("two thirds");
    expect(q(1149, "seventy percent").display).toBe("70%（地球の 表面の 水の わりあい）");
  });

  it.skipIf(!hasW39)("ディベートの プロソディ: いちばん つよく いう ことばを えらぶ。音は 例文", () => {
    const a = q(1152, "We believe that");
    expect(a.promptJa).toBe("ディベートの プロソディ。いちばん つよく いう ことばは どれ？");
    expect(a.display).toBe("We believe that schools should have gardens.");
    expect(ids(a).sort()).toEqual(["believe", "that", "we"]);
    expect(a.answer).toBe("believe");
    expect(a.audioText).toBe("We believe that schools should have gardens.");
    expect(q(1154, "We disagree because").answer).toBe("disagree");
  });

  it.skipIf(!hasW39)("つなぎの ことばと ヘッジの ことば", () => {
    const a = q(1156, "However");
    expect(a.promptJa).toBe("つなぎの ことば。＿＿ に 入る ことばは どれ？");
    expect(a.display).toBe("Plastic is useful. ＿＿, it can harm the sea.");
    expect(ids(a).sort()).toEqual(["For example", "However", "In addition"]);
    const b = q(1161, "probably");
    expect(b.promptJa).toBe("ヘッジの ことば。いいすぎない ことばは どれ？");
    expect(b.display).toBe("It will ＿＿ rain this afternoon.（たぶん）");
    expect(ids(b).sort()).toEqual(["definitely", "never", "probably"]);
    expect(q(1164, "about").answer).toBe("about");
  });

  it.skipIf(!hasW39)("ワールド39 の フォニックスの ことばは ぜんぶ ワールド39 の 問題（3つの 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 1141; n <= 1170; n++) {
      for (const it of phonicsItems(n)) {
        expect(w39Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド38 までの 回では ワールド39 の 問題に ならない", () => {
    for (const n of [43, 59, 71, 113, 289, 521, 554, 644, 841, 961, 1021, 1051, 1080, 1081, 1101, 1110, 1111, 1121, 1131, 1136, 1140]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w39Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
