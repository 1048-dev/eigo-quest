/**
 * ワールド40の フォニックス（6 年間の 総まとめ: つづり・ことばの パーツ・語根・スピーチの 間・苦手な 音）の 問題と 表（src/lib/curriculum/w40Phonics.ts）。
 * - つづりは「つづりの まとめ。＿＿ に 入る つづりは どれ？」（r＿＿n（雨）→ ai）
 * - パーツは「ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？」（＿＿ ＋ happy → un）
 * - 語根は「語根の まとめ。おなじ 語根の なかまは どれ？」（inspect（しらべる）→ spectator）
 * - スピーチの 間は「スピーチの 間。どの ことばの あとで 間（‖）を とる？」（Six years ago I didn't know any English. → ago）
 * - 苦手な 音は「苦手な 音の 総点検。きこえた ことばは どれ？」（🔊 right → right / light / night）
 * - ワールド39 までの 回では ワールド40 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w40Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { partsReviewOf, pauseReviewOf, rootReviewOf, soundCheckOf, spellReviewOf, w40Example, w40FocusOf, w40Say } from "@/lib/curriculum/w40Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW40 = !!getLesson(1200);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w40Words = () => LESSONS.filter((x) => x.world === 40).flatMap((l) => l.phonics.words);
const words = (s: string) => s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);

describe("ワールド40の つづりの表", () => {
  it("つづりの まとめ: ＿＿ に 答えを 入れると ことば。3つ ちがう", () => {
    expect(spellReviewOf("rain")).toMatchObject({ pre: "r", post: "n", answer: "ai", wrong: ["ay", "ei"] });
    expect(spellReviewOf("Thumb")).toMatchObject({ word: "thumb", answer: "mb" });
    expect(spellReviewOf("train")).toBeNull();
    expect(spellReviewOf("toString")).toBeNull();
    for (const w of w40Words()) {
      const s = spellReviewOf(w);
      if (!s) continue;
      expect(s.pre + s.answer + s.post, w).toBe(s.word);
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
    }
  });

  it("ことばの パーツの まとめ: パーツを つなげると ことば。3つ ちがう", () => {
    expect(partsReviewOf("unhappy")).toMatchObject({ parts: ["un", "happy"], answer: "un", wrong: ["dis", "re"] });
    expect(partsReviewOf("impossible")).toMatchObject({ answer: "im" });
    expect(partsReviewOf("happy")).toBeNull();
    for (const w of w40Words()) {
      const p = partsReviewOf(w);
      if (!p) continue;
      expect(p.parts.join(""), w).toBe(p.word);
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
    }
  });

  it("語根の まとめ: 答えは おなじ 語根を もち、まちがいは もたない。3つ ちがう", () => {
    expect(rootReviewOf("inspect")).toMatchObject({ root: "spect", answer: "spectator" });
    expect(rootReviewOf("spect")).toBeNull();
    for (const w of w40Words()) {
      const r = rootReviewOf(w);
      if (!r) continue;
      expect(r.word, w).toContain(r.root);
      expect(r.answer, w).toContain(r.root);
      for (const x of r.wrong) expect(x, `${w} ${x}`).not.toContain(r.root);
      expect(new Set([r.answer, ...r.wrong]).size, w).toBe(3);
    }
  });

  it("スピーチの 間: 文は フレーズで はじまり、答えは フレーズの さいごの ことば。まちがいも 文の なかの ことば。3つ ちがう", () => {
    expect(pauseReviewOf("six years ago")).toMatchObject({ phrase: "Six years ago", answer: "ago", spoken: "Six years ago, I didn't know any English." });
    expect(pauseReviewOf("six years")).toBeNull();
    for (const w of w40Words()) {
      const a = pauseReviewOf(w);
      if (!a) continue;
      expect(a.sentence.startsWith(a.phrase), w).toBe(true);
      expect(a.sentence, w).not.toContain(",");
      expect(words(a.phrase).pop(), w).toBe(a.answer);
      for (const x of a.wrong) expect(words(a.sentence), `${w} ${x}`).toContain(x);
      expect(new Set([a.answer, ...a.wrong]).size, w).toBe(3);
      expect(a.spoken, w).toBe(`${a.phrase},${a.sentence.slice(a.phrase.length)}`);
      expect(a.say.toLowerCase().replace(/[^a-z ]/g, "").trim(), w).toBe(a.phrase.toLowerCase());
    }
  });

  it("苦手な 音: まちがいは にて いる ことば（この 表に ない）。3つ ちがう", () => {
    expect(soundCheckOf("right")).toMatchObject({ pair: "R と L", wrong: ["light", "night"] });
    expect(soundCheckOf("light")).toBeNull();
    for (const w of w40Words()) {
      const o = soundCheckOf(w);
      if (!o) continue;
      for (const x of o.wrong) expect(soundCheckOf(x), `${w} ${x}`).toBeNull();
      expect(new Set([o.answer, ...o.wrong]).size, w).toBe(3);
    }
  });

  it("フォーカスの ボタン: その focus の ことば・フレーズを よむ（英字・スペース・アポストロフィ だけ）", () => {
    expect(focusSay("rain", ["rain", "play", "dream"])).toBe("rain");
    expect(focusExampleWord("careful", ["dislike", "careful", "careless"])).toBe("careful");
    expect(focusSay("six years ago", ["Six years ago", "Good morning everyone", "When I was six"])).toBe("Six years ago");
    expect(focusExampleWord("together", ["Before I finish", "Looking back", "Together"])).toBe("Together");
    expect(focusSay("think", ["vest", "think", "three"])).toBe("think");
    expect(w40FocusOf("Most of all")).toBe("most of all");
    // 1こ だけの 回では はたらかない
    expect(w40Say("rain", ["rain"])).toBeNull();
    for (const l of LESSONS.filter((x) => x.world === 40)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w40Say・w40Example は L1170 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 1171)) {
      for (const f of l.phonics.focus) {
        expect(w40Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w40Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド40の フォニックス問題", () => {
  it.skipIf(!hasW40)("つづりの まとめ: ＿＿ に 入る つづりを えらぶ", () => {
    const a = q(1171, "rain");
    expect(a.promptJa).toBe("つづりの まとめ。＿＿ に 入る つづりは どれ？");
    expect(a.display).toBe("r＿＿n（雨）");
    expect(ids(a).sort()).toEqual(["ai", "ay", "ei"]);
    expect(a.answer).toBe("ai");
    expect(q(1174, "knee").answer).toBe("kn");
  });

  it.skipIf(!hasW40)("ことばの パーツの まとめ: ＿＿ に 入る パーツを えらぶ", () => {
    const a = q(1176, "unhappy");
    expect(a.promptJa).toBe("ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？");
    expect(a.display).toBe("＿＿ ＋ happy（しあわせ でない）");
    expect(ids(a).sort()).toEqual(["dis", "re", "un"]);
    expect(q(1177, "careless").answer).toBe("less");
  });

  it.skipIf(!hasW40)("語根の まとめ: おなじ 語根の なかまを えらぶ", () => {
    const a = q(1181, "inspect");
    expect(a.promptJa).toBe("語根の まとめ。おなじ 語根の なかまは どれ？");
    expect(a.display).toBe("inspect（しらべる）");
    expect(ids(a).sort()).toEqual(["export", "spectator", "structure"]);
    expect(q(1184, "geography").answer).toBe("geology");
  });

  it.skipIf(!hasW40)("スピーチの 間と 苦手な 音", () => {
    const a = q(1186, "Six years ago");
    expect(a.promptJa).toBe("スピーチの 間。どの ことばの あとで 間（‖）を とる？");
    expect(a.display).toBe("Six years ago I didn't know any English.");
    expect(ids(a).sort()).toEqual(["ago", "didn't", "years"]);
    expect(a.audioText).toBe("Six years ago, I didn't know any English.");
    const b = q(1191, "right");
    expect(b.promptJa).toBe("苦手な 音の 総点検。きこえた ことばは どれ？");
    expect(b.display).toBe("🔊（R と L）");
    expect(ids(b).sort()).toEqual(["light", "night", "right"]);
    expect(b.audioText).toBe("right");
  });

  it.skipIf(!hasW40)("ワールド40 の フォニックスの ことばは ぜんぶ ワールド40 の 問題（3つの 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 1171; n <= 1200; n++) {
      for (const it of phonicsItems(n)) {
        expect(w40Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド39 までの 回では ワールド40 の 問題に ならない", () => {
    for (const n of [1, 43, 59, 71, 113, 289, 521, 554, 644, 841, 961, 1021, 1044, 1051, 1080, 1111, 1140, 1141, 1146, 1156, 1161, 1170]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w40Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
