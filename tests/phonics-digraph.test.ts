/**
 * ダイグラフの回（ワールド3）のフォニックス問題: ship の最初の音を「s」にしない。
 */
import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { digraphQuestion, makeQuestion, seededRng } from "@/lib/curriculum/questions";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW3 = !!getLesson(90);

describe("ダイグラフのフォニックス問題", () => {
  it.skipIf(!hasW3)("sh で はじまる ことば → さいしょの おとは sh（選択肢は sh ch th wh）", () => {
    const q = digraphQuestion(item(61, "ship"), seededRng(1))!;
    expect(q.promptJa).toBe("さいしょの おとは どれ？");
    expect(q.answer).toBe("sh");
    expect(q.choices!.map((c) => c.id).sort()).toEqual(["ch", "sh", "th", "wh"]);
  });

  it.skipIf(!hasW3)("途中・おわりに ある（fish, duck, ring, pink, lunch）→ どの つづりが はいってる？", () => {
    const cases: [number, string, string][] = [[62, "fish", "sh"], [81, "duck", "ck"], [83, "ring", "ng"], [84, "pink", "nk"], [69, "lunch", "ch"]];
    for (const [n, w, d] of cases) {
      const q = digraphQuestion(item(n, w), seededRng(n))!;
      expect(q.promptJa, w).toBe("どの つづりが はいってる？");
      expect(q.answer, w).toBe(d);
      expect(q.choices, w).toHaveLength(4);
      // 正解いがいの選択肢は、その ことばに ふくまれない（答えが1つに きまる）
      for (const c of q.choices!) if (c.id !== d) expect(w.includes(c.id), `${w}: ${c.id}`).toBe(false);
    }
  });

  it("フォーカスが1文字の回（ワールド1の duck・fish）は今までどおり最初の文字で問う", () => {
    for (const n of [8, 19]) for (const i of phonicsItems(n)) expect(digraphQuestion(i, seededRng(n)), i.text).toBeNull();
  });

  it.skipIf(!hasW3)("ワールド3 の全フォニックス項目で、正解が選択肢に1つだけ入っている", () => {
    for (let n = 61; n <= 90; n++) {
      for (const i of phonicsItems(n)) {
        const q = digraphQuestion(i, seededRng(n));
        expect(q, `L${n} ${i.text}`).not.toBeNull();
        const ids = q!.choices!.map((c) => c.id);
        expect(ids.filter((id) => id === q!.answer), `L${n} ${i.text}`).toHaveLength(1);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it.skipIf(!hasW3)("makeQuestion（phonics_sound）でも ダイグラフで問い、同じ seed なら同じ問題", () => {
    const ship = item(61, "ship");
    const a = makeQuestion(ship, "phonics_sound", ALL_ITEMS, seededRng(7), 0);
    const b = makeQuestion(ship, "phonics_sound", ALL_ITEMS, seededRng(7), 0);
    expect(a.answer).toBe("sh");
    expect(a.skill).toBe("PHONICS");
    expect(a.audioText).toBe("ship");
    expect(a).toEqual(b);
  });
});
