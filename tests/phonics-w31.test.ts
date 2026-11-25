/**
 * ワールド31の フォニックス（動詞と 名詞の 家族・年号の 読みかた・語根 struct・-ian / -ist・語根 port）の 問題と 表（src/lib/curriculum/w31Phonics.ts）。
 * - 家族は「動詞を 名詞（もの・こと）に すると？」（invent → invention / inventment / invental）
 * - 年号は「英語で なんと よむ？」（1868 → eighteen sixty-eight / one eight six eight / eighty-six eighteen）
 * - struct は「struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？」
 * - -ian / -ist は「〜を する 人は？ あう ことばは どれ？」（musician / musicist / musicer）
 * - port は「port の ことば。いみは どれ？」（ことば → いみ）
 * - ワールド30 までの 回では ワールド31 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w31Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { familyOf, personOf, portOf, structOf, w31Example, w31FocusOf, w31Say, yearOf } from "@/lib/curriculum/w31Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW31 = !!getLesson(930);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w31Words = () => LESSONS.filter((x) => x.world === 31).flatMap((l) => l.phonics.words);

describe("ワールド31の つづりの表", () => {
  it("家族: 答えは 名詞、まちがいは ない ことば。名詞は もとの 動詞の 家族で、おわりは focus どおり", () => {
    expect(familyOf("invention")).toMatchObject({ verb: "invent", ending: "-tion", answer: "invention", wrong: ["inventment", "invental"] });
    expect(familyOf("discovery")!.ending).toBe("-y");
    expect(familyOf("invent")).toBeNull(); // 動詞は 問わない
    expect(familyOf("toString")).toBeNull();
    for (const w of w31Words()) {
      const f = familyOf(w);
      if (!f) continue;
      expect(w.endsWith(f.ending.slice(1)), w).toBe(true);
      // 動詞の 頭（e を とった かたち）から はじまる
      expect(w.startsWith(f.verb.replace(/e$/, "")), w).toBe(true);
      expect(new Set([f.answer, ...f.wrong]).size, w).toBe(3);
      for (const x of f.wrong) expect(familyOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("年号: 答えは 英語の よみ、まちがいも 英字の よみで 3つ ちがう", () => {
    expect(yearOf("1868")).toMatchObject({ kind: "year", answer: "eighteen sixty-eight" });
    expect(yearOf("1903")!.answer).toBe("nineteen oh three");
    expect(yearOf("2001")!.answer).toBe("two thousand one");
    expect(yearOf("the 1990s")!.answer).toBe("the nineteen nineties");
    expect(yearOf("The 20th Century")!.word).toBe("the 20th century");
    expect(yearOf("1999")).toBeNull();
    for (const w of w31Words()) {
      const y = yearOf(w);
      if (!y) continue;
      for (const x of [y.answer, ...y.wrong]) expect(x, w).toMatch(/^[a-z]+([ -][a-z]+)*$/);
      expect(new Set([y.answer, ...y.wrong]).size, w).toBe(3);
    }
  });

  it("struct: 文の ＿＿ に 答えを 入れると 文に なる。選択肢は ぜんぶ struct の ことば", () => {
    expect(structOf("construction")).toMatchObject({ answer: "construction", wrong: ["construct", "constructive"] });
    expect(structOf("strict")).toBeNull();
    for (const w of w31Words()) {
      const s = structOf(w);
      if (!s) continue;
      expect(s.sentence.split("＿＿").length, w).toBe(2);
      expect(s.sentence, w).toMatch(/[.?!]$/);
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
      for (const x of [s.answer, ...s.wrong]) expect(x, `${w} ${x}`).toContain("struct");
    }
  });

  it("-ian / -ist: 答えは -ian か -ist で おわる 人の ことば。まちがいは ない ことば", () => {
    expect(personOf("musician")).toMatchObject({ base: "music", ending: "-ian", wrong: ["musicist", "musicer"] });
    expect(personOf("scientist")!.ending).toBe("-ist");
    expect(personOf("music")).toBeNull();
    for (const w of w31Words()) {
      const p = personOf(w);
      if (!p) continue;
      expect(w.endsWith(p.ending.slice(1)), w).toBe(true);
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
      for (const x of p.wrong) expect(personOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("port: いみの 選択肢は 3つ ちがう。ことばに port が ある", () => {
    expect(portOf("export")).toMatchObject({ answer: "外国へ 売る（ゆしゅつ）" });
    expect(portOf("export")!.wrong).toContain("外国から 買い入れる（ゆにゅう）");
    expect(portOf("portal")).toBeNull();
    for (const w of w31Words()) {
      const o = portOf(w);
      if (!o) continue;
      expect(w, w).toContain("port");
      expect(new Set([o.answer, ...o.wrong]).size, w).toBe(3);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことばを よむ（年号は 英語の よみかた）", () => {
    expect(focusSay("-ment", ["development", "movement", "achievement", "improvement"])).toBe("development");
    expect(focusSay("-y", ["arrival", "survival", "discovery", "delivery"])).toBe("discovery");
    expect(focusSay("1868", ["1600", "1868", "1964", "1850"])).toBe("eighteen sixty eight");
    expect(focusExampleWord("the 1990s", ["the 1990s", "the 1800s", "the 1960s", "the 2000s"])).toBe("the nineteen nineties");
    expect(focusExampleWord("struct", ["construct", "construction", "structure"])).toBe("construct");
    expect(focusExampleWord("-ist", ["historian", "scientist", "instructor", "2001", "proposal"])).toBe("scientist");
    expect(focusExampleWord("port", ["import", "export", "portable"])).toBe("import");
    expect(focusLabel("-tion").main).toBe("…tion");
    expect(focusLabel("struct").main).toBe("struct");
    expect(w31FocusOf("magician")).toBe("-ian"); // magic（-ic）が 入っても -ian の 表
    expect(w31FocusOf("airport")).toBe("port");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w31Say・w31Example は L900 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 901)) {
      for (const f of l.phonics.focus) {
        expect(w31Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w31Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド31の フォニックス問題", () => {
  it.skipIf(!hasW31)("家族: 動詞を 名詞に する（invention を ワールド23 の -tion で 問わない）", () => {
    const a = q(901, "invention");
    expect(a.promptJa).toBe("動詞を 名詞（もの・こと）に すると？");
    expect(a.display).toBe("invent（はつめいする）→ ＿＿（はつめい・はつめいした もの）");
    expect(ids(a).sort()).toEqual(["invental", "invention", "inventment"]);
    expect(a.answer).toBe("invention");
    expect(q(904, "discovery").answer).toBe("discovery");
  });

  it.skipIf(!hasW31)("年号と struct", () => {
    const a = q(906, "1868");
    expect(a.promptJa).toBe("英語で なんと よむ？");
    expect(a.answer).toBe("eighteen sixty-eight");
    expect(ids(a).sort()).toEqual(["eighteen sixty-eight", "eighty-six eighteen", "one eight six eight"]);
    const b = q(911, "construction");
    expect(b.promptJa).toBe("struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？");
    expect(b.display).toBe("The ＿＿ of the castle took twenty years.");
    expect(ids(b).sort()).toEqual(["construct", "construction", "constructive"]);
  });

  it.skipIf(!hasW31)("-ian / -ist と port（magician を ワールド30 の -ic で 問わない）", () => {
    const a = q(916, "magician");
    expect(a.promptJa).toBe("〜を する 人は？ あう ことばは どれ？");
    expect(a.answer).toBe("magician");
    expect(ids(a).sort()).toEqual(["magicer", "magician", "magicist"]);
    const b = q(921, "export");
    expect(b.promptJa).toBe("port の ことば。いみは どれ？");
    expect(b.answer).toBe("外国へ 売る（ゆしゅつ）");
    expect(q(930, "spaceport").answer).toBe("うちゅうせんの はっしゃじょう"); // ふりかえりでも おなじ 問い
  });

  it.skipIf(!hasW31)("ワールド31 の フォニックスの ことばは ぜんぶ ワールド31 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 901; n <= 930; n++) {
      for (const it of phonicsItems(n)) {
        expect(w31Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
        for (const seed of [1, 3, 7]) {
          const a = makeQuestion(it, "phonics_sound", [], seededRng(seed), 0);
          expect(a.choices?.length ?? 0, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(ids(a), `L${n} ${it.text}`).toContain(a.answer);
          expect(new Set(ids(a)).size, `L${n} ${it.text}`).toBe(ids(a).length);
          expect(a.explanationJa, `L${n} ${it.text}`).toBeTruthy();
        }
      }
    }
  });

  it("ワールド30 までの 回では ワールド31 の 問題に ならない", () => {
    for (const n of [161, 517, 621, 681, 711, 781, 811, 841, 871, 885, 900]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w31Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
