/**
 * ワールド9の r の つく母音（ar or er ir ur air ear）の フォニックス問題と、おとの表（src/lib/curriculum/rControlled.ts）。
 * - er / ir / ur は おなじ おと（ア～）なので、いっしょに 選択肢に 出さない。
 * - ear の 中の ar、air の 中の ai に まどわされない（ながい つづりを 先に とる）。
 * - shark / chair / third は sh・ch・th ではなく r の つく母音で 問う。
 * - まだ ならっていない つづりは 選択肢に 出さない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, rControlledQuestion, seededRng } from "@/lib/curriculum/questions";
import { R_VOWELS, R_VOWEL_INTRO, findRSpellings, rSound } from "@/lib/curriculum/rControlled";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW9 = !!getLesson(270);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);

describe("r の つく母音の おとの表", () => {
  it("ながい つづりを 先に とる（ear の 中の ar、air の 中の ai に まどわされない）", () => {
    expect(findRSpellings("ear")).toEqual(["ear"]);
    expect(findRSpellings("year")).toEqual(["ear"]);
    expect(findRSpellings("chair")).toEqual(["air"]);
    expect(findRSpellings("airport")).toEqual(["air", "or"]);
    expect(findRSpellings("farmer")).toEqual(["ar", "er"]);
    expect(findRSpellings("car")).toEqual(["ar"]);
  });

  it("r の あとに 母音が くる ときは r の つく母音に しない", () => {
    expect(findRSpellings("hero")).toEqual([]);
    expect(findRSpellings("here")).toEqual([]);
    expect(findRSpellings("orange")).toEqual([]);
  });

  it("er / ir / ur は おなじ おと、ar とは ちがう おと", () => {
    expect(rSound("er")).toBe(rSound("ir"));
    expect(rSound("ir")).toBe(rSound("ur"));
    expect(rSound("ar")).not.toBe(rSound("er"));
    expect(new Set(R_VOWELS.map(rSound)).size).toBe(5);
  });

  it("フォーカスの 読み上げは おとが おなじ ことばで（ar → are、er / ir / ur → er）", () => {
    expect(focusSay("ar")).toBe("are");
    expect(focusSay("or")).toBe("or");
    expect(focusSay("ir")).toBe("er");
    expect(focusSay("ur")).toBe("er");
    expect(focusSay("air")).toBe("air");
    expect(focusSay("ear")).toBe("ear");
    expect(focusSay("ai")).toBe("ay"); // 母音チームは いままでどおり
  });
});

describe("ワールド9の フォニックス問題", () => {
  it.skipIf(!hasW9)("car → ar。選択肢に みじかい a が 入る。ar しか ならっていない 回は のこりを みじかい母音で うめる", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = rControlledQuestion(item(241, "car"), seededRng(seed))!;
      expect(q.answer).toBe("ar");
      expect(ids(q)).toContain("a");
      expect(ids(q)).toHaveLength(4);
      expect(new Set(ids(q)).size).toBe(4);
      expect(ids(q).filter((x) => x.length > 1)).toEqual(["ar"]);
    }
  });

  it.skipIf(!hasW9)("shark / chair / third は sh・ch・th ではなく r の つく母音で 問う（makeQuestion）", () => {
    const shark = makeQuestion(item(243, "shark"), "phonics_sound", [], seededRng(1), 0);
    const chair = makeQuestion(item(256, "chair"), "phonics_sound", [], seededRng(1), 0);
    const third = makeQuestion(item(262, "third"), "phonics_sound", [], seededRng(1), 0);
    expect([shark.answer, chair.answer, third.answer]).toEqual(["ar", "air", "ir"]);
    expect(shark.promptJa).toBe("きこえた ぼいんの おとは どれ？");
    expect(chair.explanationJa).toContain("「エア」");
  });

  it.skipIf(!hasW9)("bird → ir。er も ur も 選択肢に 出ない（おなじ おと）", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = rControlledQuestion(item(252, "bird"), seededRng(seed))!;
      expect(q.answer).toBe("ir");
      expect(ids(q)).not.toContain("er");
      expect(ids(q)).not.toContain("ur");
      expect(ids(q)).toContain("i");
    }
  });

  it.skipIf(!hasW9)("far / fur の くらべ回: far → ar の とき、ur（くらべる つづり）が 選択肢に 出る", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const q = rControlledQuestion(item(264, "far"), seededRng(seed))!;
      expect(q.answer).toBe("ar");
      expect(ids(q)).toContain("ur");
      const fur = rControlledQuestion(item(264, "fur"), seededRng(seed))!;
      expect(fur.answer).toBe("ur");
      expect(ids(fur)).toContain("ar");
    }
  });

  it.skipIf(!hasW9)("airport → air。ことばの 中に きこえる or は 選択肢に 出さない", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const q = rControlledQuestion(item(257, "airport"), seededRng(seed))!;
      expect(q.answer).toBe("air");
      expect(ids(q)).not.toContain("or");
    }
  });

  it.skipIf(!hasW9)("ワールド9の ぜんぶの ことば: 答えは その回の フォーカス、選択肢は 4つで おなじ おとが 2つ ない、まだ ならっていない つづりは 出ない", () => {
    for (let n = 241; n <= 270; n++) {
      const focus = getLesson(n)!.phonics.focus;
      for (const it of phonicsItems(n)) {
        for (let seed = 1; seed <= 5; seed++) {
          const q = rControlledQuestion(it, seededRng(seed));
          expect(q, `L${n} ${it.text}`).not.toBeNull();
          expect(focus, `L${n} ${it.text}`).toContain(q!.answer);
          const c = ids(q!);
          expect(c, `L${n} ${it.text}`).toHaveLength(4);
          expect(new Set(c).size).toBe(4);
          const rs = c.filter((x) => R_VOWELS.includes(x));
          expect(new Set(rs.map(rSound)).size, `L${n} ${it.text}: ${c}`).toBe(rs.length);
          for (const x of rs) expect(R_VOWEL_INTRO[x] <= n || focus.includes(x), `L${n} ${it.text}: ${x}`).toBe(true);
        }
      }
    }
  });

  it("ワールド8 までの 回では r の つく母音の 問題に ならない", () => {
    expect(rControlledQuestion(item(240, "moon"), seededRng(1))).toBeNull();
  });
});
