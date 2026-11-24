/**
 * ワールド10の フォニックス（soft c・soft g・おわりの -y・おわりの -le・aw au ew）の 問題と、おとの表（src/lib/curriculum/w10Phonics.ts）。
 * - c / g は あとの もじ（e・i・y）で おとが きまる。ことばの 中で おとが まざる ことばは 問わない。
 * - おわりの y は「イー」（happy）と「アイ」（fly）。
 * - "-y" "-le" を 語末ブレンド（-st など）の 問題に しない。
 * - shy / chew は sh・ch ではなく -y・ew で 問う。
 * - ワールド1 の c・g の 回は いままでどおり（さいしょの おと）。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, w10Question } from "@/lib/curriculum/questions";
import { W10_INTRO, cgSounds, w10TeamSound, ySound } from "@/lib/curriculum/w10Phonics";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW10 = !!getLesson(300);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);

describe("ワールド10の おとの表", () => {
  it("c は e・i・y の まえで soft（ス）、それ以外は hard（ク）。ch・ck の c は かぞえない", () => {
    expect(cgSounds("c", "city")).toEqual(["soft"]);
    expect(cgSounds("c", "ice")).toEqual(["soft"]);
    expect(cgSounds("c", "fancy")).toEqual(["soft"]);
    expect(cgSounds("c", "cat")).toEqual(["hard"]);
    expect(cgSounds("c", "bicycle")).toEqual(["soft", "hard"]);
    expect(cgSounds("c", "chick")).toEqual([]);
  });

  it("g は e・i・y の まえで soft（ジ）。get / girl などの れいがい・ng は かぞえかたを わける", () => {
    expect(cgSounds("g", "giant")).toEqual(["soft"]);
    expect(cgSounds("g", "orange")).toEqual(["soft"]);
    expect(cgSounds("g", "bridge")).toEqual(["soft"]);
    expect(cgSounds("g", "ginger")).toEqual(["soft", "soft"]);
    expect(cgSounds("g", "goat")).toEqual(["hard"]);
    expect(cgSounds("g", "girl")).toEqual(["hard"]);
    expect(cgSounds("g", "sing")).toEqual([]);
  });

  it("おわりの y: みじかい ことばは アイ、それ以外は イー、母音＋y は null", () => {
    expect(ySound("fly")).toBe("アイ");
    expect(ySound("shy")).toBe("アイ");
    expect(ySound("happy")).toBe("イー");
    expect(ySound("energy")).toBe("イー");
    expect(ySound("day")).toBeNull();
    expect(ySound("cat")).toBeNull();
  });

  it("aw / au は オー、ew は ウー", () => {
    expect(w10TeamSound("aw")).toBe(w10TeamSound("au"));
    expect(w10TeamSound("ew")).toBe("ウー");
  });

  it("フォーカスの 読み上げ（aw → awe、ew → oo、-y は おとで、soft c の 回は ことば）。ワールド1 の c は もじの まま", () => {
    expect(focusSay("aw")).toBe("awe");
    expect(focusSay("au")).toBe("awe");
    expect(focusSay("ew")).toBe("oo");
    expect(focusSay("-y", ["happy", "baby"])).toBe("ee");
    expect(focusSay("-y", ["fly", "sky"])).toBe("eye");
    expect(focusSay("-le", ["apple", "little"])).toBe("apple");
    expect(focusSay("c", ["ice", "city"])).toBe("ice");
    expect(focusSay("c", ["cat", "cup"])).toBe("c");
    expect(focusSay("-st", ["nest"])).toBe("st"); // 語末ブレンドは いままでどおり
  });
});

describe("ワールド10の フォニックス問題", () => {
  it.skipIf(!hasW10)("city → s、cat → k（くらべの 回）。ことばを 画面に 出す", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const q = w10Question(item(275, "city"), seededRng(seed))!;
      expect(q.answer).toBe("s");
      expect(q.display).toBe("city");
      expect([...ids(q)].sort()).toEqual(["ch", "k", "s", "sh"]);
      expect(w10Question(item(275, "cat"), seededRng(seed))!.answer).toBe("k");
    }
  });

  it.skipIf(!hasW10)("giant → j、goat → g", () => {
    expect(w10Question(item(280, "giant"), seededRng(1))!.answer).toBe("j");
    expect(w10Question(item(280, "goat"), seededRng(1))!.answer).toBe("g");
  });

  it.skipIf(!hasW10)("happy → ee、fly → igh。どちらも 2つの おとが 選択肢に 入る", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const h = w10Question(item(285, "happy"), seededRng(seed))!;
      const f = w10Question(item(285, "fly"), seededRng(seed))!;
      expect([h.answer, f.answer]).toEqual(["ee", "igh"]);
      for (const q of [h, f]) {
        expect(ids(q)).toContain("ee");
        expect(ids(q)).toContain("igh");
        expect(new Set(ids(q)).size).toBe(4);
      }
    }
  });

  it.skipIf(!hasW10)("-y・-le の 回は 語末ブレンドの 問題に ならない。shy / chew は sh・ch ではなく -y・ew で 問う（makeQuestion）", () => {
    const apple = makeQuestion(item(286, "apple"), "phonics_sound", [], seededRng(1), 0);
    expect(apple.answer).toBe("-le");
    expect(apple.promptJa).toBe("おわりに きこえる おとは どれ？");
    expect(makeQuestion(item(284, "shy"), "phonics_sound", [], seededRng(1), 0).answer).toBe("igh");
    expect(makeQuestion(item(293, "chew"), "phonics_sound", [], seededRng(1), 0).answer).toBe("ew");
  });

  it.skipIf(!hasW10)("aw の 回は まだ ならっていない ew を 出さない。ew の 回は aw か au を くらべに 入れる。aw と au は いっしょに 出さない", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const saw = w10Question(item(291, "saw"), seededRng(seed))!;
      expect(saw.answer).toBe("aw");
      expect(ids(saw)).not.toContain("ew");
      expect(ids(saw)).not.toContain("au");
      expect(ids(saw)).toContain("a");
      const flew = w10Question(item(293, "flew"), seededRng(seed))!;
      expect(flew.answer).toBe("ew");
      expect(ids(flew).filter((x) => x === "aw" || x === "au")).toHaveLength(1);
      expect(ids(flew)).not.toContain("oo");
    }
  });

  it.skipIf(!hasW10)("ワールド10の ぜんぶの ことば: w10Question で 問えて、答えは 選択肢に 1つ、選択肢は 4つで ちがう もの", () => {
    for (let n = 271; n <= 300; n++) {
      for (const it of phonicsItems(n)) {
        for (let seed = 1; seed <= 5; seed++) {
          const q = w10Question(it, seededRng(seed));
          expect(q, `L${n} ${it.text}`).not.toBeNull();
          const c = ids(q!);
          expect(c, `L${n} ${it.text}`).toHaveLength(4);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(4);
          expect(c, `L${n} ${it.text}`).toContain(q!.answer);
        }
      }
    }
  });

  it("ワールド9 までの 回では ワールド10の 問題に ならない（ワールド1 の c・g は さいしょの おと）", () => {
    expect(W10_INTRO.c).toBe(271);
    for (const l of [1, 270].map((n) => getLesson(n)!)) {
      for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w10Question(it, seededRng(1)), `L${l.lessonNo} ${it.text}`).toBeNull();
    }
    const cLesson = [...Array(30)].map((_, i) => getLesson(i + 1)!).find((l) => l.phonics.focus.includes("c"))!;
    const w = itemsOfLesson(cLesson).find((i) => i.kind === "PHONICS")!;
    expect(makeQuestion(w, "phonics_sound", [], seededRng(1), 0).promptJa).not.toContain("どの おと");
  });
});
