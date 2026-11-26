/**
 * ワールド29の フォニックス（語根 spect・語根 dict・意見を 強める 強勢・弱形・-ible / -able）の 問題と 表（src/lib/curriculum/w29Phonics.ts）。
 * - spect は「spect（みる）の ことば。いみは どれ？」（答えも 選択肢も いみ）
 * - dict は「ぶんに あう dict の ことばは どれ？」（Can you ＿＿ the weather for tomorrow?）
 * - 強勢は「いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？」（really / think / so）
 * - 弱形は「ふつうの はやさで いうと、can は どう きこえる？」（クン / キャン / カーン。選択肢は きまった 順）
 * - -ible / -able は「ただしい つづりは どれ？」（possible / possable / posible）
 * - ワールド28 までの 回では ワールド29 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w29Question } from "@/lib/curriculum/phonicsQ/w29";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { dictOf, emphasisMarked, emphasisOf, ibleOf, spectOf, w29Example, w29FocusOf, w29Say, weakOf } from "@/lib/curriculum/w29Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW29 = !!getLesson(870);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w29Words = () => LESSONS.filter((x) => x.world === 29).flatMap((l) => l.phonics.words);

describe("ワールド29の つづりの表", () => {
  it("spect: 答えは その ことばの いみ、まちがいは ほかの spect の ことばの いみ", () => {
    expect(spectOf("inspect")).toMatchObject({ parts: "in ＋ spect", answer: "よく 見て しらべる" });
    expect(spectOf("inspect")!.wrong).toEqual([spectOf("respect")!.answer, spectOf("suspect")!.answer]);
    expect(spectOf("expect")).toBeNull(); // spect の つづりが ない
    for (const w of w29Words()) {
      const s = spectOf(w);
      if (!s) continue;
      expect(w, w).toContain("spect");
      expect(s.parts.replace(/ ＋ /g, ""), w).toContain("spect");
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
    }
  });

  it("dict: 文の ＿＿ に 答えを 入れる。まちがいも dict の ことば", () => {
    expect(dictOf("predict")).toMatchObject({ answer: "predict", wrong: ["contradict", "dictate"] });
    expect(dictOf("dictionary")!.sentence).toContain("＿＿");
    expect(dictOf("dice")).toBeNull();
    for (const w of w29Words()) {
      const d = dictOf(w);
      if (!d) continue;
      expect(d.sentence.match(/＿＿/g), w).toHaveLength(1);
      for (const x of [d.answer, ...d.wrong]) expect(x, `${w} ${x}`).toContain("dict");
      expect(new Set([d.answer, ...d.wrong]).size, w).toBe(3);
    }
  });

  it("強勢: つよく いう ことばと まちがい 2つは 文の なかに ある", () => {
    expect(emphasisOf("I really think so")).toMatchObject({ strong: "really", answer: "really", wrong: ["think", "so"] });
    expect(emphasisMarked(emphasisOf("i do agree with you")!)).toBe("I DO agree with you");
    expect(emphasisOf("I think so")).toBeNull();
    for (const w of w29Words()) {
      const e = emphasisOf(w);
      if (!e) continue;
      const words = w.split(" ");
      for (const x of [e.answer, ...e.wrong]) expect(words, `${w} ${x}`).toContain(x);
      expect(new Set([e.answer, ...e.wrong]).size, w).toBe(3);
      expect(w, w).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
    }
  });

  it("弱形: よわい おと・つよい おと・まちがいの おと（きまった 順）。よわく いう ことばは 文の なかに ある", () => {
    expect(weakOf("I can help you")).toMatchObject({ weak: "can", answer: "クン", choices: ["クン", "キャン", "カーン"] });
    expect(weakOf("come and see")!.answer).toBe("ン");
    expect(weakOf("I can swim")).toBeNull();
    for (const w of w29Words()) {
      const x = weakOf(w);
      if (!x) continue;
      expect(w.toLowerCase().split(" "), w).toContain(x.weak);
      expect(x.choices[0], w).toBe(x.answer);
      expect(new Set(x.choices).size, w).toBe(3);
      expect(w, w).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
    }
  });

  it("-ible / -able: まちがいの 1つは おわりを とりかえた つづり。ワールド27 の -able の ことばとは べつ", () => {
    expect(ibleOf("possible")).toMatchObject({ kind: "ible", focus: "-ible", wrong: ["possable", "posible"] });
    expect(ibleOf("debatable")).toMatchObject({ kind: "able", trap: "drop-e" });
    expect(ibleOf("comfortable")).toBeNull();
    for (const w of w29Words()) {
      const b = ibleOf(w);
      if (!b) continue;
      const swapped = b.kind === "ible" ? w.replace(/ible$/, "able") : w.replace(/able$/, "ible");
      expect([...b.wrong], w).toContain(b.trap === "drop-e" ? b.wrong[0] : swapped);
      expect(new Set([b.answer, ...b.wrong]).size, w).toBe(3);
      if (b.kind === "able" && b.trap === "plain") expect(w, w).toBe(`${b.base}able`);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文を よむ", () => {
    expect(focusSay("spect", ["respect", "inspect", "spectator", "suspect"])).toBe("respect");
    expect(focusSay("can", ["I can help you", "We can do it together"])).toBe("I can help you");
    expect(focusSay("-able", ["possible", "visible", "reasonable", "acceptable"])).toBe("reasonable");
    expect(focusExampleWord("-ible", ["possible", "visible", "reasonable", "acceptable"])).toBe("possible");
    expect(focusExampleWord("do", ["I completely understand", "Reading is very important", "I do agree with you", "That's exactly my point"])).toBe("I do agree with you");
    expect(focusExampleWord("dict", ["predict", "dictionary", "contradict"])).toBe("predict");
    expect(focusLabel("-ible").main).toBe("…ible");
    expect(w29FocusOf("respectable")).toBe("spect");
    expect(w29FocusOf("That's absolutely true")).toBe("absolutely");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w29Say・w29Example は L840 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 841)) {
      for (const f of l.phonics.focus) {
        expect(w29Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w29Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド29の フォニックス問題", () => {
  it.skipIf(!hasW29)("spect: いみを えらぶ", () => {
    const a = q(841, "inspect");
    expect(a.promptJa).toBe("spect（みる）の ことば。いみは どれ？");
    expect(a.display).toBe("inspect（in ＋ spect）");
    expect(a.answer).toBe("よく 見て しらべる");
    expect(ids(a)).toHaveLength(3);
    expect(a.explanationJa).toContain("みる");
  });

  it.skipIf(!hasW29)("dict と 強勢（prediction を ワールド23 の -tion で 問わない）", () => {
    const a = q(846, "predict");
    expect(a.promptJa).toBe("ぶんに あう dict の ことばは どれ？");
    expect(a.display).toBe("Can you ＿＿ the weather for tomorrow?");
    expect(ids(a).sort()).toEqual(["contradict", "dictate", "predict"]);
    const p = q(847, "prediction");
    expect(p.promptJa).toBe("ぶんに あう dict の ことばは どれ？");
    const b = q(851, "I really think so");
    expect(b.promptJa).toBe("いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？");
    expect(b.answer).toBe("really");
    expect(ids(b).sort()).toEqual(["really", "so", "think"]);
  });

  it.skipIf(!hasW29)("弱形（選択肢は きまった 順）と -ible / -able（respectable は spect で 問う）", () => {
    const a = q(856, "I can help you");
    expect(a.promptJa).toBe("ふつうの はやさで いうと、can は どう きこえる？");
    expect(ids(a)).toEqual(["クン", "キャン", "カーン"]);
    expect(a.answer).toBe("クン");
    const b = q(861, "possible");
    expect(b.promptJa).toBe("ただしい つづりは どれ？");
    expect(ids(b).sort()).toEqual(["posible", "possable", "possible"]);
    expect(q(844, "respectable").promptJa).toBe("spect（みる）の ことば。いみは どれ？");
  });

  it.skipIf(!hasW29)("ワールド29 の フォニックスの ことばは ぜんぶ ワールド29 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 841; n <= 870; n++) {
      for (const it of phonicsItems(n)) {
        expect(w29Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド28 までの 回では ワールド29 の 問題に ならない", () => {
    for (const n of [161, 517, 621, 681, 711, 781, 811, 835, 840]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w29Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
