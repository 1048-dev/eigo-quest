/**
 * ブレンドの回（ワールド4）のフォニックス問題: stop の答えを「s」だけにしない。
 * 2つに わけて よむ回（sun-set）でも、chipmunk の最初の音を「c」にしない。
 */
import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { BLENDS, THREE_BLENDS, blendQuestion, digraphQuestion, makeQuestion, seededRng } from "@/lib/curriculum/questions";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW4 = !!getLesson(120);

describe("ブレンドのフォニックス問題", () => {
  it.skipIf(!hasW4)("st で はじまる ことば → さいしょの 2つの おとは st", () => {
    const q = blendQuestion(item(91, "stop"), seededRng(1))!;
    expect(q.promptJa).toBe("さいしょの 2つの おとは どれ？");
    expect(q.answer).toBe("st");
    expect(q.choices).toHaveLength(4);
  });

  it.skipIf(!hasW4)("3つの ブレンド（strap）→ さいしょの 3つの おとは str（st ではない）", () => {
    const q = blendQuestion(item(109, "strap"), seededRng(2))!;
    expect(q.promptJa).toBe("さいしょの 3つの おとは どれ？");
    expect(q.answer).toBe("str");
    expect(q.choices!.map((c) => c.id).sort()).toEqual([...THREE_BLENDS].sort());
  });

  it.skipIf(!hasW4)("l と r の くらべ（clap）では、同じ1文字目の cr が まちがいの選択肢に入る", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = blendQuestion(item(107, "clap"), seededRng(seed))!;
      expect(q.choices!.map((c) => c.id)).toContain("cr");
    }
  });

  it.skipIf(!hasW4)("ワールド4 の ブレンドの回（L91〜115）で、正解が選択肢に1つだけ・ほかは その語の はじめと ちがう", () => {
    for (let n = 91; n <= 115; n++) {
      for (const i of phonicsItems(n)) {
        const q = blendQuestion(i, seededRng(n));
        expect(q, `L${n} ${i.text}`).not.toBeNull();
        const ids = q!.choices!.map((c) => c.id);
        expect(ids, `L${n} ${i.text}`).toHaveLength(4);
        expect(new Set(ids).size).toBe(4);
        expect(ids.filter((id) => id === q!.answer)).toHaveLength(1);
        for (const id of ids) if (id !== q!.answer) expect(i.text.startsWith(id), `L${n} ${i.text}: ${id}`).toBe(false);
        expect([...BLENDS, ...THREE_BLENDS] as string[]).toContain(q!.answer);
      }
    }
  });

  it("ブレンドが フォーカスでない回（ワールド1〜3）は null", () => {
    for (const n of [1, 8, 33, 61, 84]) for (const i of phonicsItems(n)) expect(blendQuestion(i, seededRng(n)), `L${n} ${i.text}`).toBeNull();
  });

  it.skipIf(!hasW4)("2つに わけて よむ回: chipmunk / chopstick / shellfish は ダイグラフで問う", () => {
    for (const [n, w, d] of [[117, "chipmunk", "ch"], [119, "chopstick", "ch"], [119, "shellfish", "sh"]] as const) {
      const q = digraphQuestion(item(n, w), seededRng(n))!;
      expect(q.answer, w).toBe(d);
      expect(q.promptJa).toBe("さいしょの おとは どれ？");
    }
  });

  it.skipIf(!hasW4)("makeQuestion（phonics_sound）でも ブレンドで問い、同じ seed なら同じ問題", () => {
    const frog = item(103, "frog");
    const a = makeQuestion(frog, "phonics_sound", ALL_ITEMS, seededRng(7), 0);
    const b = makeQuestion(frog, "phonics_sound", ALL_ITEMS, seededRng(7), 0);
    expect(a.answer).toBe("fr");
    expect(a.skill).toBe("PHONICS");
    expect(a).toEqual(b);
    // まとめ回の 2つに わける ことば（sunset）は 最初の文字で問う
    expect(makeQuestion(item(120, "sunset"), "phonics_sound", ALL_ITEMS, seededRng(3), 0).answer).toBe("s");
  });
});
