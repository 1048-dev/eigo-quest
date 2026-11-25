/**
 * ワールド17の フォニックス（-tion / -sion / -ture・'ll / won't・同音異義語・or ore oar our）の 問題と 表（src/lib/curriculum/w17Phonics.ts）。
 * - おわりの つづりは「ただしい つづりは？」（sta＿＿＿＿（えき）→ station / stasion / stashun）
 * - 短縮形は「みじかい かたちは？」（I will → I'll / I'will / Il'l、will not → won't / willn't / wo'nt）
 * - 同音異義語は「ぶんに あう ことばは？」（I can ＿＿ the stars. → see / sea / meet）
 * - or ore oar our は「「オー」の ただしい つづりは？」（4（よん）→ four / for / fore / foar）
 * - ワールド16 までの 回では ワールド17 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, w17Question } from "@/lib/curriculum/questions";
import { endingSpelling, homophoneOf, orSpelling, willContraction } from "@/lib/curriculum/w17Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW17 = !!getLesson(510);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド17の つづりの表", () => {
  it("-tion / -sion / -ture: ほかの おわりと 音の とおりの つづりを まちがいに する", () => {
    expect(endingSpelling("station")).toEqual({ answer: "station", wrong: ["stasion", "stashun"], stem: "sta", kind: "tion", meaning: "えき" });
    expect(endingSpelling("television")?.wrong).toEqual(["televition", "televishun"]);
    expect(endingSpelling("future")).toEqual({ answer: "future", wrong: ["fucher", "fuchur"], stem: "fu", kind: "ture", meaning: "みらい" });
    // 表に ない ことばは 出さない
    expect(["question", "mansion", "walked"].map(endingSpelling)).toEqual([null, null, null]);
  });

  it("will の 短縮形: 'll は I'will / Il'l、won't は willn't / wo'nt（hell・well の ような ことばは まちがいに しない）", () => {
    expect(willContraction("I'll")).toEqual({ full: "I will", answer: "I'll", wrong: ["I'will", "Il'l"] });
    expect(willContraction("he'll")?.wrong).toEqual(["he'will", "hel'l"]);
    expect(willContraction("won't")).toEqual({ full: "will not", answer: "won't", wrong: ["willn't", "wo'nt"] });
    expect(willContraction("didn't")?.wrong).toEqual(["didnt", "did'nt"]);
    expect(willContraction("I'm")).toBeNull();
  });

  it("同音異義語: ぶんと いみと おなじ おとの ことば", () => {
    expect(homophoneOf("sea")).toMatchObject({ meaning: "うみ", sameSound: ["see"] });
    expect(homophoneOf("two")?.choices.sort()).toEqual(["to", "too"]);
    expect(homophoneOf("their")?.sentence).toContain("＿＿");
    expect(homophoneOf("star")).toBeNull();
  });

  it("or ore oar our: ほかの 3つの つづりに かえた ものを まちがいに する", () => {
    expect(orSpelling("four")).toEqual({ answer: "four", wrong: ["for", "fore", "foar"], kind: "our", meaning: "4（よん）" });
    expect(orSpelling("more")?.kind).toBe("ore");
    expect(orSpelling("north")?.wrong).toEqual(["noreth", "noarth", "nourth"]);
    expect(orSpelling("board")?.kind).toBe("oar");
    expect(orSpelling("hour")).toBeNull();
  });
});

describe("ワールド17の フォニックス問題", () => {
  it.skipIf(!hasW17)("-tion / -sion / -ture: ことばの はじめと いみを 出して、ただしい つづりを えらぶ", () => {
    const a = q(481, "station");
    expect(a.display).toBe("sta＿＿＿＿（えき）");
    expect(a.answer).toBe("station");
    expect(ids(a).sort()).toEqual(["stashun", "stasion", "station"]);
    expect(q(486, "vision").explanationJa).toContain("sion");
    expect(q(489, "future").answer).toBe("future");
  });

  it.skipIf(!hasW17)("'ll / won't: もとの 2語から みじかい かたちを えらぶ", () => {
    expect(q(491, "I'll").display).toBe("I will → ？");
    expect(ids(q(493, "won't")).sort()).toEqual(["willn't", "wo'nt", "won't"]);
    expect(q(493, "won't").explanationJa).toContain("willn't では なく");
  });

  it.skipIf(!hasW17)("同音異義語: ぶんに あう ことばを えらぶ（ふりかえりの 回も）", () => {
    const s = q(496, "sea");
    expect(s.promptJa).toBe("ぶんに あう ことばは どれ？");
    expect(s.display).toBe("Fish swim in the ＿＿.");
    expect(ids(s)).toContain("see");
    expect(ids(q(498, "too")).sort()).toEqual(["to", "too", "two"]);
    expect(q(500, "their").answer).toBe("their");
    expect(q(507, "son").display).toBe("The king had one ＿＿.");
  });

  it.skipIf(!hasW17)("or ore oar our: 4つの つづりから えらぶ", () => {
    const f = q(504, "four");
    expect(f.display).toBe("「4（よん）」");
    expect(ids(f).sort()).toEqual(["foar", "for", "fore", "four"]);
    expect(q(505, "score").explanationJa).toContain("ore");
    expect(q(509, "four").answer).toBe("four");
  });

  it.skipIf(!hasW17)("ワールド17の ぜんぶの ことば: ワールド17 の 問題に なり、答えは 選択肢に 1つ、選択肢は ちがう もの", () => {
    for (let n = 481; n <= 510; n++) {
      for (const it of phonicsItems(n)) {
        expect(w17Question(it, seededRng(1)), `L${n} ${it.text}`).not.toBeNull();
        for (let seed = 1; seed <= 5; seed++) {
          const x = q(n, it.text, seed);
          const c = ids(x);
          expect(x.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
          expect(c.length, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((y) => y === x.answer), `L${n} ${it.text}`).toHaveLength(1);
          expect(x.display?.includes(x.answer) ?? false, `L${n} ${it.text}: ${x.display}`).toBe(false);
        }
      }
    }
  });

  it("ワールド16 までの 回では ワールド17 の 問題に ならない", () => {
    for (const n of [151, 301, 421, 451, 480]) {
      const l = getLesson(n);
      if (!l) continue;
      for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w17Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
