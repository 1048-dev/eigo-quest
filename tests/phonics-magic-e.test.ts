/**
 * マジック e の回（ワールド6）のフォニックス問題: cake の答えを 最初の「c」にしない。
 * 母音の おと（a_e / a など）で問い、まちがいの選択肢に かならず 同じ母音の ペア（a ↔ a_e）を入れる。
 */
import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { MAGIC_E, magicEQuestion, makeQuestion, seededRng } from "@/lib/curriculum/questions";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW6 = !!getLesson(180);
const SHORT = ["a", "i", "o", "u", "e"];

describe("マジック e の フォニックス問題", () => {
  it.skipIf(!hasW6)("cake → a_e。選択肢に みじかい a が かならず 入る", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = magicEQuestion(item(151, "cake"), seededRng(seed))!;
      expect(q.answer).toBe("a_e");
      expect(q.choices).toHaveLength(4);
      expect(q.choices!.map((c) => c.id)).toContain("a");
    }
  });

  it.skipIf(!hasW6)("くらべの回: cap → a、cape → a_e、kit → i、kite → i_e", () => {
    expect(magicEQuestion(item(171, "cap"), seededRng(1))!.answer).toBe("a");
    expect(magicEQuestion(item(171, "cape"), seededRng(1))!.answer).toBe("a_e");
    expect(magicEQuestion(item(172, "kit"), seededRng(2))!.answer).toBe("i");
    expect(magicEQuestion(item(172, "kite"), seededRng(2))!.answer).toBe("i_e");
    expect(magicEQuestion(item(171, "cap"), seededRng(3))!.choices!.map((c) => c.id)).toContain("a_e");
  });

  it.skipIf(!hasW6)("shape / white（ダイグラフで はじまる）、cakes（-s）、cupcake（2音節）、these も マジック e で問う", () => {
    expect(makeQuestion(item(154, "shape"), "phonics_sound", ALL_ITEMS, seededRng(4), 0).answer).toBe("a_e");
    expect(makeQuestion(item(158, "white"), "phonics_sound", ALL_ITEMS, seededRng(4), 0).answer).toBe("i_e");
    expect(makeQuestion(item(178, "cakes"), "phonics_sound", ALL_ITEMS, seededRng(5), 0).answer).toBe("a_e");
    expect(makeQuestion(item(179, "cupcake"), "phonics_sound", ALL_ITEMS, seededRng(5), 0).answer).toBe("a_e");
    expect(makeQuestion(item(168, "these"), "phonics_sound", ALL_ITEMS, seededRng(6), 0).answer).toBe("e_e");
  });

  it.skipIf(!hasW6)("ワールド6の すべての フォニックス語で: 選択肢4つ・重複なし・正解は1つで ペアが入る", () => {
    for (let n = 151; n <= 180; n++) {
      for (const i of phonicsItems(n)) {
        const q = makeQuestion(i, "phonics_sound", ALL_ITEMS, seededRng(n), 0);
        const ids = q.choices!.map((c) => c.id);
        expect(ids, `L${n} ${i.text}`).toHaveLength(4);
        expect(new Set(ids).size, `L${n} ${i.text}`).toBe(4);
        expect([...MAGIC_E, ...SHORT] as string[], `L${n} ${i.text}`).toContain(q.answer);
        const v = q.answer[0];
        expect(ids, `L${n} ${i.text}`).toContain(q.answer.length === 1 ? `${v}_e` : v);
      }
    }
  });

  it("マジック e が フォーカスでない回（ワールド1〜5）は null", () => {
    for (const n of [1, 13, 36, 61, 91, 116, 121, 141, 150]) for (const i of phonicsItems(n)) expect(magicEQuestion(i, seededRng(n)), `L${n} ${i.text}`).toBeNull();
  });
});
