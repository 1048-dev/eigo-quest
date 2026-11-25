/**
 * ワールド30の フォニックス（auto-・trans-・-ic の 強勢・略語の 読みかた・くだけた 話しことば）の 問題と 表（src/lib/curriculum/w30Phonics.ts）。
 * - auto- は「auto（じぶんで）の ことば。いみに あう ことばは どれ？」（いみ → ことば）
 * - trans- は「trans の あとに つづく パーツは どれ？」（trans ＋ ＿＿（はこぶ）→ port / form / mit）
 * - -ic は「-ic の ことば。どこを いちばん つよく いう？」（e-LEC-tric / E-lec-tric / e-lec-TRIC）
 * - 略語は「なんと よむ？」（エーアイ / アイ / エイ）
 * - 話しことばは「gonna を ふつうの いいかたに すると？」（going to / gone to / go and）
 * - ワールド29 までの 回では ワールド30 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w30Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { abbrOf, autoOf, casualFull, casualOf, icOf, transOf, w30Example, w30FocusOf, w30Say } from "@/lib/curriculum/w30Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW30 = !!getLesson(900);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w30Words = () => LESSONS.filter((x) => x.world === 30).flatMap((l) => l.phonics.words);
const SAYABLE = /^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/;

describe("ワールド30の つづりの表", () => {
  it("auto-: 答えは ことば、まちがいも auto の ことばで いみが ちがう", () => {
    expect(autoOf("autograph")).toMatchObject({ answer: "autograph", wrong: ["automobile", "autopilot"] });
    expect(autoOf("autumn")).toBeNull(); // auto の パーツでは ない
    for (const w of w30Words()) {
      const a = autoOf(w);
      if (!a) continue;
      expect(w, w).toMatch(/^auto/);
      expect(new Set([a.answer, ...a.wrong]).size, w).toBe(3);
      for (const x of a.wrong) expect(autoOf(x), `${w} ${x}`).not.toBeNull();
      expect(new Set([a.meaning, ...a.wrong.map((x) => autoOf(x)!.meaning)]).size, w).toBe(3);
    }
  });

  it("trans-: trans ＋ 答えの パーツ ＝ ことば。まちがいの パーツも 表の ことばの パーツ", () => {
    expect(transOf("transport")).toMatchObject({ answer: "port", wrong: ["form", "mit"] });
    expect(transOf("train")).toBeNull();
    const rests = new Set(["port", "form", "late", "fer", "mit", "plant", "portation", "lation", "formation", "it", "lator", "former", "mission"]);
    for (const w of w30Words()) {
      const t = transOf(w);
      if (!t) continue;
      expect(`trans${t.answer}`, w).toBe(w);
      expect(new Set([t.answer, ...t.wrong]).size, w).toBe(3);
      for (const x of t.wrong) expect(rests.has(x), `${w} ${x}`).toBe(true);
    }
  });

  it("-ic: -ic の すぐ まえの はくを 大文字に。はくを つなぐと もとの ことば", () => {
    expect(icOf("electric")).toMatchObject({ answer: "e-LEC-tric", wrong: ["E-lec-tric", "e-lec-TRIC"] });
    expect(icOf("scientific")!.answer).toBe("sci-en-TIF-ic");
    expect(icOf("magic")).toBeNull();
    for (const w of w30Words()) {
      const c = icOf(w);
      if (!c) continue;
      expect(w, w).toMatch(/ic$/);
      expect(c.syllables.join(""), w).toBe(w);
      expect(c.syllables.length, w).toBeGreaterThanOrEqual(3);
      expect(c.stress, w).toBe(c.syllables.length - 2);
      expect(new Set([c.answer, ...c.wrong]).size, w).toBe(3);
      for (const x of [c.answer, ...c.wrong]) expect(x.replace(/-/g, "").toLowerCase(), `${w} ${x}`).toBe(w);
    }
  });

  it("略語: 読み上げは 英字と スペース、選択肢は 3つ ちがう よみ", () => {
    expect(abbrOf("AI")).toMatchObject({ kind: "letters", say: "A I", answer: "エーアイ" });
    expect(abbrOf("km")).toMatchObject({ kind: "unit", say: "kilometers" });
    expect(abbrOf("3D")!.say).toBe("three D");
    expect(abbrOf("ai")).toBeNull(); // 大文字・小文字は 表の とおり
    expect(abbrOf("toString")).toBeNull();
    for (const w of w30Words()) {
      const b = abbrOf(w);
      if (!b) continue;
      expect(b.say, w).toMatch(SAYABLE);
      expect(new Set([b.answer, ...b.wrong]).size, w).toBe(3);
    }
  });

  it("話しことば: くだけた かたちは 文の なかに ある。ふつうの いいかたに なおせる", () => {
    expect(casualOf("I'm gonna try it")).toMatchObject({ form: "gonna", answer: "going to", wrong: ["gone to", "go and"] });
    expect(casualFull(casualOf("I'm gonna try it")!)).toBe("I'm going to try it");
    expect(casualFull(casualOf("lemme try")!)).toBe("Let me try");
    expect(casualOf("I'm going to try it")).toBeNull();
    for (const w of w30Words()) {
      const k = casualOf(w);
      if (!k) continue;
      expect(w.toLowerCase().split(" "), w).toContain(k.form);
      expect(new Set([k.answer, ...k.wrong]).size, w).toBe(3);
      expect(w, w).toMatch(SAYABLE);
      expect(casualFull(k), w).not.toContain(k.form);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文を よむ（略語は 読みかた）", () => {
    expect(focusSay("auto-", ["automatic", "autograph", "automobile", "autopilot"])).toBe("automatic");
    expect(focusSay("km", ["km", "cm", "kg", "mm"])).toBe("kilometers");
    expect(focusSay("wanna", ["I'm gonna try it", "We're gonna be late", "I wanna see the robot", "Do you wanna play"])).toBe("I wanna see the robot");
    expect(focusExampleWord("trans-", ["transport", "transform", "autocorrect", "autonomous"])).toBe("transport");
    expect(focusExampleWord("3D", ["3D", "VR", "LED", "GPS"])).toBe("three D");
    expect(focusExampleWord("-ic", ["electric", "fantastic", "transmit", "autosave"])).toBe("electric");
    expect(focusLabel("auto-").main).toBe("auto…");
    expect(focusLabel("-ic").main).toBe("…ic");
    expect(w30FocusOf("automatic")).toBe("auto-"); // -ic で おわっても auto- の 表
    expect(w30FocusOf("Gimme five")).toBe("gimme");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w30Say・w30Example は L870 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 871)) {
      for (const f of l.phonics.focus) {
        expect(w30Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w30Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド30の フォニックス問題", () => {
  it.skipIf(!hasW30)("auto-: いみに あう ことばを えらぶ", () => {
    const a = q(871, "autograph");
    expect(a.promptJa).toBe("auto（じぶんで）の ことば。いみに あう ことばは どれ？");
    expect(a.display).toBe("「（有名な 人が じぶんで かく）サイン」");
    expect(ids(a).sort()).toEqual(["autograph", "automobile", "autopilot"]);
    expect(a.answer).toBe("autograph");
    expect(a.explanationJa).toContain("じぶんで");
  });

  it.skipIf(!hasW30)("trans- と -ic（translation を ワールド23 の -tion で、electric を まえの ワールドで 問わない）", () => {
    const a = q(876, "transport");
    expect(a.promptJa).toBe("trans の あとに つづく パーツは どれ？");
    expect(a.display).toBe("trans ＋ ＿＿（はこぶ・ゆそうする）");
    expect(ids(a).sort()).toEqual(["form", "mit", "port"]);
    expect(q(878, "translation").promptJa).toBe("trans の あとに つづく パーツは どれ？");
    const b = q(881, "electric");
    expect(b.promptJa).toBe("-ic の ことば。どこを いちばん つよく いう？");
    expect(b.answer).toBe("e-LEC-tric");
    expect(ids(b).sort()).toEqual(["E-lec-tric", "e-LEC-tric", "e-lec-TRIC"].sort());
  });

  it.skipIf(!hasW30)("略語と 話しことば", () => {
    const a = q(887, "km");
    expect(a.promptJa).toBe("なんと よむ？");
    expect(a.answer).toBe("キロメーターズ");
    expect(ids(a).sort()).toEqual(["キロメーターズ", "クム", "ケーエム"].sort());
    const b = q(891, "I'm gonna try it");
    expect(b.promptJa).toBe("gonna を ふつうの いいかたに すると？");
    expect(b.answer).toBe("going to");
    expect(ids(b).sort()).toEqual(["go and", "going to", "gone to"]);
    expect(q(885, "electric").answer).toBe("e-LEC-tric"); // ふりかえりでも おなじ 問い
  });

  it.skipIf(!hasW30)("ワールド30 の フォニックスの ことばは ぜんぶ ワールド30 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 871; n <= 900; n++) {
      for (const it of phonicsItems(n)) {
        expect(w30Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド29 までの 回では ワールド30 の 問題に ならない", () => {
    for (const n of [161, 517, 621, 681, 711, 781, 811, 841, 861, 870]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w30Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
