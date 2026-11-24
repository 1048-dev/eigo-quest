/**
 * 母音チームの回（ワールド7）のフォニックス問題: rain の答えを 最初の「r」にしない。
 * 音声だけで 聞きわけられるように、おなじ おとの つづり（ai ↔ ay、ee ↔ ea、oa ↔ ow）は いっしょに 選択肢に 出さない。
 */
import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { VOWEL_TEAM_GROUPS, makeQuestion, seededRng, vowelTeamQuestion } from "@/lib/curriculum/questions";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW7 = !!getLesson(210);
const SHORT_OF: Record<string, string> = { ai: "a", ay: "a", ee: "e", ea: "e", oa: "o", ow: "o" };

describe("母音チームの フォニックス問題", () => {
  it.skipIf(!hasW7)("rain → ai。選択肢に みじかい a が かならず 入り、ay は 入らない", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = vowelTeamQuestion(item(181, "rain"), seededRng(seed))!;
      expect(q.answer).toBe("ai");
      const ids = q.choices!.map((c) => c.id);
      expect(ids).toHaveLength(4);
      expect(ids).toContain("a");
      expect(ids).not.toContain("ay");
    }
  });

  it.skipIf(!hasW7)("sheep / cheese / show（ダイグラフで はじまる）も 母音チームで問う", () => {
    expect(makeQuestion(item(187, "sheep"), "phonics_sound", ALL_ITEMS, seededRng(1), 0).answer).toBe("ee");
    expect(makeQuestion(item(189, "cheese"), "phonics_sound", ALL_ITEMS, seededRng(2), 0).answer).toBe("ee");
    expect(makeQuestion(item(201, "show"), "phonics_sound", ALL_ITEMS, seededRng(3), 0).answer).toBe("ow");
    expect(makeQuestion(item(192, "beach"), "phonics_sound", ALL_ITEMS, seededRng(4), 0).answer).toBe("ea");
  });

  it.skipIf(!hasW7)("ふりかえり回: see → ee、sea → ea（どちらの 選択肢にも もう 一方は 出ない）", () => {
    const see = vowelTeamQuestion(item(195, "see"), seededRng(5))!;
    const sea = vowelTeamQuestion(item(195, "sea"), seededRng(5))!;
    expect(see.answer).toBe("ee");
    expect(sea.answer).toBe("ea");
    expect(see.choices!.map((c) => c.id)).not.toContain("ea");
    expect(sea.choices!.map((c) => c.id)).not.toContain("ee");
  });

  it.skipIf(!hasW7)("ワールド7の すべての フォニックス語で: 選択肢4つ・重複なし・みじかい母音入り・おなじ おとの つづりは 1つだけ", () => {
    for (let n = 181; n <= 210; n++) {
      for (const i of phonicsItems(n)) {
        const q = makeQuestion(i, "phonics_sound", ALL_ITEMS, seededRng(n), 0);
        const ids = q.choices!.map((c) => c.id);
        expect(ids, `L${n} ${i.text}`).toHaveLength(4);
        expect(new Set(ids).size, `L${n} ${i.text}`).toBe(4);
        expect(Object.keys(SHORT_OF), `L${n} ${i.text}`).toContain(q.answer);
        expect(i.text.toLowerCase(), `L${n}`).toContain(q.answer);
        expect(ids, `L${n} ${i.text}`).toContain(SHORT_OF[q.answer]);
        for (const g of VOWEL_TEAM_GROUPS) expect(ids.filter((x) => (g as readonly string[]).includes(x)).length, `L${n} ${i.text}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("母音チームが フォーカスでない回（ワールド1〜6）は null", () => {
    for (const n of [1, 13, 36, 61, 91, 121, 151, 175, 180]) for (const i of phonicsItems(n)) expect(vowelTeamQuestion(i, seededRng(n)), `L${n} ${i.text}`).toBeNull();
  });
});
