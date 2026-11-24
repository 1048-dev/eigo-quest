/**
 * ワールド11の フォニックス（-ed の 3つの おと・-er・-est・サイトワード）の 問題と、おとの表（src/lib/curriculum/w11Phonics.ts）。
 * - -ed は まえの おとで「ト」「ド」「イド」。ことばを 画面に 出す。
 * - -er / -est は「おわりに きこえる おとは どれ？」。
 * - サイトワードは「きこえた ことばは どれ？」（にている つづりから えらぶ）。
 * - ワールド10 までの 回では ワールド11 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { endingQuestion, makeQuestion, seededRng, w11Question } from "@/lib/curriculum/questions";
import { W11_INTRO, edSound } from "@/lib/curriculum/w11Phonics";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW11 = !!getLesson(330);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);

describe("ワールド11の おとの表", () => {
  it("-ed: t・d の あとは イド、いきだけの おとの あとは ト、それ以外は ド", () => {
    expect(edSound("wanted")).toBe("id");
    expect(edSound("needed")).toBe("id");
    expect(edSound("jumped")).toBe("t");
    expect(edSound("washed")).toBe("t");
    expect(edSound("danced")).toBe("t");
    expect(edSound("played")).toBe("d");
    expect(edSound("smiled")).toBe("d");
    expect(edSound("cleaned")).toBe("d");
    expect(edSound("bed")).toBeNull();
    expect(edSound("cat")).toBeNull();
  });

  it("フォーカスの 読み上げ: -ed / -er / -est は その回の ことば、サイトワードは ことばの まま", () => {
    expect(focusSay("-ed", ["jumped", "walked"])).toBe("jumped");
    expect(focusSay("-er", ["teacher"])).toBe("teacher");
    expect(focusSay("-est", ["tallest"])).toBe("tallest");
    expect(focusSay("was", ["was", "saw"])).toBe("was");
    expect(focusSay("-st", ["nest"])).toBe("st"); // 語末ブレンドは いままでどおり
  });
});

describe("ワールド11の フォニックス問題", () => {
  it.skipIf(!hasW11)("-ed: jumped → t、played → d、wanted → id。ことばを 画面に 出し、選択肢は 3つの おと", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const q = w11Question(item(305, "jumped"), seededRng(seed))!;
      expect(q.answer).toBe("t");
      expect(q.display).toBe("jumped");
      expect([...ids(q)].sort()).toEqual(["d", "id", "t"]);
      expect(w11Question(item(305, "played"), seededRng(seed))!.answer).toBe("d");
      expect(w11Question(item(305, "wanted"), seededRng(seed))!.answer).toBe("id");
    }
  });

  it.skipIf(!hasW11)("-er / -est: 「おわりに きこえる おとは どれ？」。語末ブレンドの -st には しない", () => {
    const teacher = makeQuestion(item(311, "teacher"), "phonics_sound", [], seededRng(1), 0);
    expect(teacher.answer).toBe("-er");
    expect(teacher.promptJa).toBe("おわりに きこえる おとは どれ？");
    const tallest = makeQuestion(item(316, "tallest"), "phonics_sound", [], seededRng(1), 0);
    expect(tallest.answer).toBe("-est");
    expect(endingQuestion(item(316, "tallest"), seededRng(1))).toBeNull();
    // くらべの 回: taller は -er、tallest は -est
    expect(w11Question(item(320, "taller"), seededRng(1))!.answer).toBe("-er");
    expect(w11Question(item(320, "tallest"), seededRng(1))!.answer).toBe("-est");
    expect(w11Question(item(314, "taller"), seededRng(1))!.explanationJa).toContain("もっと");
    expect(w11Question(item(311, "teacher"), seededRng(1))!.explanationJa).toContain("ひと");
  });

  it.skipIf(!hasW11)("サイトワード: was の 回は saw などの にている ことばから えらぶ。画面には ことばを 出さない（makeQuestion は 🔊）", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const q = w11Question(item(306, "was"), seededRng(seed))!;
      expect(q.answer).toBe("was");
      expect(q.promptJa).toBe("きこえた ことばは どれ？");
      expect([...ids(q)].sort()).toEqual(["saw", "want", "was", "what"]);
      expect(q.display).toBeUndefined();
    }
    expect(w11Question(item(306, "saw"), seededRng(1))!.answer).toBe("saw");
    const m = makeQuestion(item(308, "said"), "phonics_sound", [], seededRng(1), 0);
    expect(m.answer).toBe("said");
    expect(m.display).toBe("🔊");
    // there は th（ダイグラフ）ではなく サイトワードで 問う
    expect(makeQuestion(item(309, "there"), "phonics_sound", [], seededRng(1), 0).answer).toBe("there");
  });

  it.skipIf(!hasW11)("まとめの 回の サイトワードは、ならった サイトワードを 選択肢に つかい、-ed の ことばは 選択肢に 入れない", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const q = w11Question(item(330, "because"), seededRng(seed))!;
      expect(q.answer).toBe("because");
      for (const c of ids(q)) expect(c, c).not.toMatch(/(ed|er|est)$/);
    }
  });

  it.skipIf(!hasW11)("ワールド11の ぜんぶの ことば: w11Question で 問えて、答えは 選択肢に 1つ、選択肢は ちがう もの（-ed は 3つ、ほかは 4つ）", () => {
    for (let n = 301; n <= 330; n++) {
      for (const it of phonicsItems(n)) {
        for (let seed = 1; seed <= 5; seed++) {
          const q = w11Question(it, seededRng(seed));
          expect(q, `L${n} ${it.text}`).not.toBeNull();
          const c = ids(q!);
          expect(c.length, `L${n} ${it.text}`).toBe(q!.promptJa.includes("-ed") ? 3 : 4);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((x) => x === q!.answer), `L${n} ${it.text}`).toHaveLength(1);
          expect(makeQuestion(it, "phonics_sound", [], seededRng(seed), 0).answer, `L${n} ${it.text}`).toBe(q!.answer);
        }
      }
    }
  });

  it("ワールド10 までの 回では ワールド11の 問題に ならない", () => {
    expect(W11_INTRO["-ed"]).toBe(301);
    for (const n of [1, 150, 270, 300]) {
      for (const it of phonicsItems(n)) expect(w11Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
