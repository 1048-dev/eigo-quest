/**
 * 語末の回（ワールド5）のフォニックス問題: nest の答えを 最初の「n」にしない。
 * -st / -nd などの語末ブレンドは「おわりの 2つの おと」、-s / -ing は「おわりに ついている のは どれ？」。
 */
import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { FINAL_BLENDS, SUFFIXES, endingQuestion, makeQuestion, seededRng } from "@/lib/curriculum/questions";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW5 = !!getLesson(150);

describe("語末の フォニックス問題", () => {
  it.skipIf(!hasW5)("nest → おわりの 2つの おとは st", () => {
    const q = endingQuestion(item(121, "nest"), seededRng(1))!;
    expect(q.promptJa).toBe("おわりの 2つの おとは どれ？");
    expect(q.answer).toBe("st");
    expect(q.choices).toHaveLength(4);
  });

  it.skipIf(!hasW5)("hand（nd）の まちがいの選択肢には 1文字目が同じ nt が入る（聞きくらべ）", () => {
    for (let seed = 1; seed <= 20; seed++) expect(endingQuestion(item(122, "hand"), seededRng(seed))!.choices!.map((c) => c.id)).toContain("nt");
  });

  it.skipIf(!hasW5)("cats → s、running → ing（おわりに ついている のは どれ？）", () => {
    const s = endingQuestion(item(133, "cats"), seededRng(2))!;
    expect(s.promptJa).toBe("おわりに ついている のは どれ？");
    expect(s.answer).toBe("s");
    expect(s.choices!.map((c) => c.id)).toContain("ing");
    const ing = endingQuestion(item(137, "running"), seededRng(3))!;
    expect(ing.answer).toBe("ing");
    expect(ing.choices!.map((c) => c.id)).toContain("s");
  });

  it.skipIf(!hasW5)("語末の回（L121〜140）は すべて 語末で問い、正解は1つだけ・ほかは その語の おわりと ちがう", () => {
    for (let n = 121; n <= 140; n++) {
      for (const i of phonicsItems(n)) {
        const q = makeQuestion(i, "phonics_sound", ALL_ITEMS, seededRng(n), 0);
        const ids = q.choices!.map((c) => c.id);
        expect(ids, `L${n} ${i.text}`).toHaveLength(4);
        expect(new Set(ids).size).toBe(4);
        expect([...FINAL_BLENDS, ...SUFFIXES] as string[], `L${n} ${i.text}`).toContain(q.answer);
        expect(i.text.endsWith(q.answer), `L${n} ${i.text}`).toBe(true);
        for (const id of ids) if (id !== q.answer) expect(i.text.endsWith(id), `L${n} ${i.text}: ${id}`).toBe(false);
      }
    }
  });

  it.skipIf(!hasW5)("shopping（ing の回）は sh ではなく ing で問う。stamp（語末の まとめ回）は おわりの mp", () => {
    expect(makeQuestion(item(139, "shopping"), "phonics_sound", ALL_ITEMS, seededRng(4), 0).answer).toBe("ing");
    expect(makeQuestion(item(146, "stamp"), "phonics_sound", ALL_ITEMS, seededRng(5), 0).answer).toBe("mp");
  });

  it.skipIf(!hasW5)("L150: stop は 語頭の st、hand は 語末の nd、picnic は 最初の文字", () => {
    expect(makeQuestion(item(150, "stop"), "phonics_sound", ALL_ITEMS, seededRng(6), 0).answer).toBe("st");
    expect(makeQuestion(item(150, "hand"), "phonics_sound", ALL_ITEMS, seededRng(6), 0).answer).toBe("nd");
    expect(makeQuestion(item(150, "picnic"), "phonics_sound", ALL_ITEMS, seededRng(6), 0).answer).toBe("p");
  });

  it("語末が フォーカスでない回（ワールド1〜4）は null", () => {
    for (const n of [1, 8, 33, 61, 84, 91, 116]) for (const i of phonicsItems(n)) expect(endingQuestion(i, seededRng(n)), `L${n} ${i.text}`).toBeNull();
  });
});
