/**
 * ワールド8の 母音チーム（oo ou ow oi oy igh ie）の フォニックス問題と、おとの表（src/lib/curriculum/vowelTeams.ts）。
 * - oo は moon「ウー」と book「ウ」、ow は snow「オウ」と cow「アウ」。どちらも ことばで 見分ける。
 * - 音声だけの問題なので、おなじ おとに なりうる つづり（ou ↔ ow、oi ↔ oy、igh ↔ ie、oa ↔ ow）は いっしょに 出さない。
 * - まだ ならっていない つづりは 選択肢に 出さない（ワールド7の 回に igh などが 出ない）。
 */
import { describe, expect, it } from "vitest";
import { ALL_ITEMS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, vowelTeamQuestion } from "@/lib/curriculum/questions";
import { VOWEL_TEAM_GROUPS, VOWEL_TEAM_INTRO, focusSay, possibleSounds, teamSound } from "@/lib/curriculum/vowelTeams";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW8 = !!getLesson(240);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);

describe("母音チームの おとの表", () => {
  it("oo と ow は ことばで おとが かわる", () => {
    expect(teamSound("oo", "moon")).toBe("ウー");
    expect(teamSound("oo", "book")).toBe("ウ");
    expect(teamSound("oo", "football")).toBe("ウ");
    expect(teamSound("ow", "snow")).toBe("オウ");
    expect(teamSound("ow", "window")).toBe("オウ");
    expect(teamSound("ow", "cow")).toBe("アウ");
    expect(teamSound("ow", "flowers")).toBe("アウ");
    expect(teamSound("igh", "night")).toBe(teamSound("ie", "pie"));
    expect(possibleSounds("ow")).toEqual(["オウ", "アウ"]);
  });

  it("フォーカスの 読み上げ: ow は その回の ことばで「oh」か「ow」、book だけの回の oo は ことばを よむ", () => {
    expect(focusSay("ow", ["snow", "grow"])).toBe("oh");
    expect(focusSay("ow", ["cow", "now"])).toBe("ow");
    expect(focusSay("oo", ["moon", "zoo"])).toBe("oo");
    expect(focusSay("oo", ["book", "look"])).toBe("book");
    expect(focusSay("oo", ["moon", "book"])).toBe("oo");
    expect(focusSay("igh", ["night"])).toBe("eye");
    expect(focusSay("ai")).toBe("ay");
    expect(focusSay("-st")).toBe("st");
    expect(focusSay("a_e")).toBe("a e");
  });
});

describe("ワールド8の フォニックス問題", () => {
  it.skipIf(!hasW8)("moon / book は どちらも oo。解説で「ウー」と「ウ」を 分ける", () => {
    const moon = vowelTeamQuestion(item(211, "moon"), seededRng(1))!;
    const book = vowelTeamQuestion(item(213, "book"), seededRng(1))!;
    expect(moon.answer).toBe("oo");
    expect(book.answer).toBe("oo");
    expect(moon.explanationJa).toContain("「ウー」");
    expect(book.explanationJa).toContain("「ウ」");
  });

  it.skipIf(!hasW8)("cow → ow（アウ）。選択肢に ou も oa も 出ない", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = vowelTeamQuestion(item(221, "cow"), seededRng(seed))!;
      expect(q.answer).toBe("ow");
      expect(ids(q)).not.toContain("ou");
      expect(ids(q)).not.toContain("oa");
      expect(ids(q)).toContain("o");
    }
  });

  it.skipIf(!hasW8)("night → igh（3もじ）、選択肢に ie は 出ない。みじかい i が 入る", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = vowelTeamQuestion(item(231, "night"), seededRng(seed))!;
      expect(q.answer).toBe("igh");
      expect(ids(q)).toContain("i");
      expect(ids(q)).not.toContain("ie");
      expect(q.explanationJa).toContain("3つの もじ");
    }
  });

  it.skipIf(!hasW8)("2つの チームが ある ことば: cowboy（oy の回は oy、ow は 出ない）、playground（ay は 出ない）", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const cb = vowelTeamQuestion(item(229, "cowboy"), seededRng(seed))!;
      expect(cb.answer).toBe("oy");
      expect(ids(cb)).not.toContain("ow");
      expect(ids(cb)).not.toContain("ou");
      const pg = vowelTeamQuestion(item(239, "playground"), seededRng(seed))!;
      expect(pg.answer).toBe("ou");
      expect(ids(pg)).not.toContain("ay");
      expect(ids(pg)).not.toContain("ai");
    }
  });

  it.skipIf(!hasW8)("school / shout / cloud / bright も ダイグラフ・ブレンドではなく 母音チームで問う", () => {
    expect(makeQuestion(item(238, "school"), "phonics_sound", ALL_ITEMS, seededRng(1), 0).answer).toBe("oo");
    expect(makeQuestion(item(218, "shout"), "phonics_sound", ALL_ITEMS, seededRng(2), 0).answer).toBe("ou");
    expect(makeQuestion(item(216, "cloud"), "phonics_sound", ALL_ITEMS, seededRng(3), 0).answer).toBe("ou");
    expect(makeQuestion(item(232, "bright"), "phonics_sound", ALL_ITEMS, seededRng(4), 0).answer).toBe("igh");
  });

  it.skipIf(!hasW8)("ワールド8の すべての フォニックス語で: 選択肢4つ・重複なし・みじかい母音入り・おなじ おとの つづりは 1つだけ・ならった つづりだけ", () => {
    for (let n = 211; n <= 240; n++) {
      for (const i of phonicsItems(n)) {
        for (const seed of [n, n + 1000]) {
          const q = makeQuestion(i, "phonics_sound", ALL_ITEMS, seededRng(seed), 0);
          const c = ids(q);
          const label = `L${n} ${i.text}`;
          expect(c, label).toHaveLength(4);
          expect(new Set(c).size, label).toBe(4);
          expect(Object.keys(VOWEL_TEAM_INTRO), label).toContain(q.answer);
          expect(i.text.toLowerCase(), label).toContain(q.answer);
          expect(c, label).toContain(q.answer[0]);
          for (const g of VOWEL_TEAM_GROUPS) expect(c.filter((x) => (g as readonly string[]).includes(x)).length, label).toBeLessThanOrEqual(1);
          for (const x of c.filter((x) => x.length > 1)) expect(VOWEL_TEAM_INTRO[x], `${label} ${x}`).toBeLessThanOrEqual(n);
        }
      }
    }
  });

  it("ワールド7の 回には ワールド8の つづり（oo ou oi oy igh ie）が 選択肢に 出ない", () => {
    for (let n = 181; n <= 210; n++) {
      for (const i of phonicsItems(n)) {
        const q = makeQuestion(i, "phonics_sound", ALL_ITEMS, seededRng(n), 0);
        for (const x of ["oo", "ou", "oi", "oy", "igh", "ie"]) expect(ids(q), `L${n} ${i.text}`).not.toContain(x);
      }
    }
  });
});
