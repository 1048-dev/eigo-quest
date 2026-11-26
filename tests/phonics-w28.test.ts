/**
 * ワールド28の フォニックス（カタカナ語と 英語の おと・英語に なった 日本語・英語の リズム・音の つながりの まとめ・ことばの パーツの まとめ）の 問題と 表（src/lib/curriculum/w28Phonics.ts）。
 * - カタカナ語は「英語で いうと、つよく よむ ところは どれ？」（EN-er-gy / en-ER-gy / en-er-GY。選択肢は きまった 順）
 * - 英語に なった 日本語は「英語に なった 日本語。英語の つづりは どれ？」（tsunami / tunami / sunami）
 * - リズムは「ふつうに いう とき、よわく みじかく いう ことばは どれ？」（to / swim / sea）
 * - 音の つながりは「つなげて いうと どう きこえる？」（ミーチュー / ミート・ユー / …）
 * - ことばの パーツは「パーツを くっつけた ことばで ただしい つづりは どれ？」
 * - ワールド27 までの 回では ワールド28 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w28Question } from "@/lib/curriculum/phonicsQ/w28";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { katakanaOf, linkOf, loanOf, partsOf, rhythmOf, w28Example, w28FocusOf, w28Say } from "@/lib/curriculum/w28Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW28 = !!getLesson(840);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w28Words = () => LESSONS.filter((x) => x.world === 28).flatMap((l) => l.phonics.words);

describe("ワールド28の つづりの表", () => {
  it("カタカナ語: はくの 形と つよい はく。選択肢は つよい はくを 1つずつ かえた 形", () => {
    expect(katakanaOf("energy")).toMatchObject({ syllables: "en-er-gy", answer: "EN-er-gy", choices: ["EN-er-gy", "en-ER-gy", "en-er-GY"], strong: "EN", kana: "エネルギー" });
    expect(katakanaOf("volunteer")!.answer).toBe("vol-un-TEER");
    expect(katakanaOf("idea")!.answer).toBe("i-DE-a");
    expect(katakanaOf("banana")).toBeNull(); // ワールド18 の 強勢
    for (const w of w28Words()) {
      const k = katakanaOf(w);
      if (!k) continue;
      expect(k.syllables.replace(/-/g, ""), w).toBe(k.word);
      expect(k.choices.length, w).toBeGreaterThanOrEqual(3);
      expect(k.choices, w).toContain(k.answer);
      expect(new Set(k.choices).size, w).toBe(k.choices.length);
    }
  });

  it("英語に なった 日本語: ヘボン式の つづり。まちがいは ローマ字の まちがい", () => {
    expect(loanOf("tsunami")).toMatchObject({ answer: "tsunami", wrong: ["tunami", "sunami"], rule: "tsu" });
    expect(loanOf("tempura")!.wrong).toContain("tenpura");
    expect(loanOf("sushi")!.wrong).toContain("susi");
    expect(loanOf("pizza")).toBeNull();
    for (const w of w28Words()) {
      const j = loanOf(w);
      if (!j) continue;
      expect(new Set([j.answer, ...j.wrong]).size, w).toBe(3);
      expect(j.answer, w).toMatch(/^[a-z]+$/);
    }
  });

  it("リズム: よわい ことばは 文の なかに あり、つよい ことば 2つも 文の なかに ある", () => {
    expect(rhythmOf("I want to swim in the sea")).toMatchObject({ weak: "to", answer: "to", wrong: ["swim", "sea"] });
    expect(rhythmOf("i like summer and winter")!.sentence).toBe("I like summer and winter");
    expect(rhythmOf("I like summer")).toBeNull();
    for (const w of w28Words()) {
      const r = rhythmOf(w);
      if (!r) continue;
      const words = w.toLowerCase().split(" ");
      for (const x of [r.answer, ...r.wrong]) expect(words, `${w} ${x}`).toContain(x.toLowerCase());
      expect(new Set([r.answer, ...r.wrong]).size, w).toBe(3);
      // フォーカスの ボタンで よめる 形（英字と スペース。' は さいしょの ことばだけ）
      expect(w, w).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
    }
  });

  it("音の つながり: つなげた 形・1つずつの 形・おなじ しゅるいの ほかの フレーズ。ワールド21 の フレーズとは べつ", () => {
    expect(linkOf("meet you")).toMatchObject({ kind: "you", answer: "ミーチュー" });
    expect(linkOf("meet you")!.wrong[0]).toBe("ミート・ユー");
    expect(linkOf("bus stop")!.kind).toBe("same");
    expect(linkOf("a kind of")!.kind).toBe("link");
    for (const w of ["hold on", "check it out", "log in"]) expect(linkOf(w), w).toBeNull();
    for (const w of w28Words()) {
      const l = linkOf(w);
      if (!l) continue;
      expect(new Set([l.answer, ...l.wrong]).size, w).toBe(3);
    }
  });

  it("ことばの パーツ: パーツを つなげると ことばの つづりに なる（y → i・e を とる ときを のぞく）", () => {
    expect(partsOf("unhappiness")).toMatchObject({ parts: ["un", "happy", "ness"], focus: "-ness", trap: "y-to-i", wrong: ["unhappyness", "unhapiness"] });
    expect(partsOf("argument")!.wrong).toContain("arguement");
    expect(partsOf("disappear")!.wrong).toContain("dissappear");
    expect(partsOf("table")).toBeNull();
    for (const w of w28Words()) {
      const p = partsOf(w);
      if (!p) continue;
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
      expect(p.answer, w).toContain(p.focus.replace(/-/g, ""));
      if (p.trap !== "y-to-i" && p.trap !== "drop-e") expect(p.parts.join(""), w).toBe(p.word);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文・フレーズを よむ", () => {
    expect(focusSay("en-er-gy", ["energy", "allergy", "vitamin", "hamburger"])).toBe("energy");
    expect(focusSay("to", ["I like summer and winter", "I want to swim in the sea"])).toBe("I want to swim in the sea");
    expect(focusSay("-ness", ["kindness", "happiness"])).toBe("kindness");
    expect(focusSay("meet you", ["meet you", "could you"])).toBe("meet you");
    expect(focusExampleWord("sushi", ["sushi", "tofu", "tempura", "bento"])).toBe("sushi");
    expect(focusExampleWord("dis-", ["disappear", "unnatural", "dishonest", "unusual"])).toBe("disappear");
    expect(focusExampleWord("un-", ["disappear", "unnatural", "dishonest", "unusual"])).toBe("unnatural");
    expect(focusLabel("en-er-gy").main).toBe("en・er・gy");
    expect(w28FocusOf("thankfulness")).toBe("-ful");
    expect(w28FocusOf("Can I ask a question")).toBe("can");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w28Say・w28Example は L810 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 811)) {
      for (const f of l.phonics.focus) {
        expect(w28Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w28Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド28の フォニックス問題", () => {
  it.skipIf(!hasW28)("カタカナ語: 選択肢は きまった 順", () => {
    const a = q(811, "energy");
    expect(a.promptJa).toBe("英語で いうと、つよく よむ ところは どれ？");
    expect(a.display).toBe("energy（エネルギー）");
    expect(ids(a)).toEqual(["EN-er-gy", "en-ER-gy", "en-er-GY"]);
    expect(a.answer).toBe("EN-er-gy");
    expect(a.explanationJa).toContain("エネルギー");
  });

  it.skipIf(!hasW28)("英語に なった 日本語と リズム", () => {
    const a = q(818, "tsunami");
    expect(a.promptJa).toBe("英語に なった 日本語。英語の つづりは どれ？");
    expect(ids(a).sort()).toEqual(["sunami", "tsunami", "tunami"]);
    const b = q(821, "I want to swim in the sea");
    expect(b.promptJa).toBe("ふつうに いう とき、よわく みじかく いう ことばは どれ？");
    expect(b.answer).toBe("to");
    expect(ids(b).sort()).toEqual(["sea", "swim", "to"]);
  });

  it.skipIf(!hasW28)("音の つながりと ことばの パーツ（unhappiness を ワールド21 の -ness で 問わない）", () => {
    const a = q(826, "meet you");
    expect(a.promptJa).toBe("つなげて いうと どう きこえる？");
    expect(a.answer).toBe("ミーチュー");
    expect(ids(a)).toContain("ミート・ユー");
    const b = q(838, "unhappiness");
    expect(b.promptJa).toBe("パーツを くっつけた ことばで ただしい つづりは どれ？");
    expect(b.display).toBe("un ＋ happy ＋ ness → ？（ふしあわせ）");
    expect(ids(b).sort()).toEqual(["unhapiness", "unhappiness", "unhappyness"]);
  });

  it.skipIf(!hasW28)("ワールド28 の フォニックスの ことばは ぜんぶ ワールド28 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 811; n <= 840; n++) {
      for (const it of phonicsItems(n)) {
        expect(w28Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド27 までの 回では ワールド28 の 問題に ならない", () => {
    for (const n of [161, 258, 517, 552, 621, 691, 780, 781, 810]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w28Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
