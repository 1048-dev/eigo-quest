/**
 * ワールド38の フォニックス（気持ちの ことばの つづり・句動詞・共感の イントネーション・慣用句・性格の ことば）の 問題と 表（src/lib/curriculum/w38Phonics.ts）。
 * - つづりは「気持ちの ことばの つづり。ただしい つづりは どれ？」（I fell in front of everyone. I was so ＿＿. → embarrassed）
 * - 句動詞は「気持ちの 句動詞。＿＿ に 入る ことばは どれ？」（Cheer ＿＿! You'll do better next time. → up）
 * - イントネーションは「共感の イントネーション。この 返事は どんな 声で いう？」（Oh no… → ↘ ひくく・ゆっくり・やさしく）
 * - 慣用句は「気持ちの 慣用句。＿＿ に 入る ことばは どれ？」（I'm over the ＿＿! → moon）
 * - 性格の ことばは「性格の ことば。＿＿ に 入る おわりは どれ？」（help＿＿ → -ful）
 * - ワールド37 までの 回では ワールド38 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w38Question } from "@/lib/curriculum/phonicsQ/w38";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { TONE_LABEL, characterOf, feelingSpellOf, idiomOf, phrasalOf, toneOf, w38Example, w38FocusOf, w38Say } from "@/lib/curriculum/w38Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW38 = !!getLesson(1140);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w38Words = () => LESSONS.filter((x) => x.world === 38).flatMap((l) => l.phonics.words);

describe("ワールド38の つづりの表", () => {
  it("気持ちの ことばの つづり: 文に ＿＿ が 1つ。文に 答えは 出てこない。まちがいの つづりは 答えと ちがい、3つ ちがう", () => {
    expect(feelingSpellOf("embarrassed")).toMatchObject({ ja: "はずかしい", wrong: ["embarassed", "embarrased"] });
    expect(feelingSpellOf("Relieved")).toMatchObject({ word: "relieved", answer: "relieved" });
    expect(feelingSpellOf("embarrass")).toBeNull();
    expect(feelingSpellOf("toString")).toBeNull();
    for (const w of w38Words()) {
      const f = feelingSpellOf(w);
      if (!f) continue;
      expect(f.sentence.split("＿＿").length, w).toBe(2);
      expect(f.sentence.toLowerCase(), w).not.toContain(w);
      expect(new Set([f.answer, ...f.wrong]).size, w).toBe(3);
      for (const x of f.wrong) expect(feelingSpellOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("句動詞: ＿＿ を 答えで うめると 句動詞（または その 過去形）に なる。3つ ちがう", () => {
    expect(phrasalOf("cheer up")).toMatchObject({ answer: "up", wrong: ["down", "off"] });
    expect(phrasalOf("Look  up to")).toMatchObject({ phrase: "look up to", answer: "up to" });
    expect(phrasalOf("cheer")).toBeNull();
    for (const w of w38Words()) {
      const p = phrasalOf(w);
      if (!p) continue;
      expect(p.sentence.split("＿＿").length, w).toBe(2);
      const filled = p.sentence.replace("＿＿", p.answer).toLowerCase();
      const [verb] = w.split(" ");
      // 動詞（made・opened など 形が かわる ことも）の あとに 小さな ことば（let my team down の ように あいだに ことばが 入る ことも）
      expect(filled, w).toMatch(new RegExp(`\\b${verb.slice(0, 2)}[a-z]*( [a-z]+){0,2} ${p.answer}\\b`));
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
      expect(p.sound, w).toMatch(/‿|[A-Z]{2,}/);
    }
  });

  it("共感の イントネーション: 選択肢は 3つの 声の 出しかた。かなしい ↘・うれしい ↗↘・しつもん ↗", () => {
    expect(toneOf("oh no")).toMatchObject({ phrase: "Oh no", kind: "sad", answer: TONE_LABEL.sad });
    expect(toneOf("That's great")).toMatchObject({ kind: "happy", reply: "That's great!" });
    expect(toneOf("Are you OK")).toMatchObject({ kind: "ask", reply: "Are you OK?" });
    expect(toneOf("Oh")).toBeNull();
    for (const w of w38Words()) {
      const t = toneOf(w);
      if (!t) continue;
      expect(new Set([t.answer, ...t.wrong]), w).toEqual(new Set(Object.values(TONE_LABEL)));
      expect(t.reply.startsWith(t.phrase), w).toBe(true);
      if (t.kind === "ask") expect(t.reply.endsWith("?"), w).toBe(true);
    }
  });

  it("慣用句: ＿＿ を 答えで うめると もとの 慣用句が 入った 文に なる。3つ ちがう", () => {
    expect(idiomOf("over the moon")).toMatchObject({ key: "moon", blank: "I'm over the ＿＿!", answer: "moon" });
    expect(idiomOf("moon")).toBeNull();
    for (const w of w38Words()) {
      const i = idiomOf(w);
      if (!i) continue;
      expect(i.blank.split("＿＿").length, w).toBe(2);
      expect(i.blank.replace("＿＿", i.answer).toLowerCase(), w).toContain(w);
      expect(w.split(" "), w).toContain(i.key);
      expect(new Set([i.answer, ...i.wrong]).size, w).toBe(3);
    }
  });

  it("性格の ことば: はじめの 部分 ＋ おわり（- を とる）＝ ことば。選択肢は -ful・-ive・-ous", () => {
    expect(characterOf("courageous")).toMatchObject({ stem: "courage", suffix: "-ous" });
    expect(characterOf("help")).toBeNull();
    for (const w of w38Words()) {
      const c = characterOf(w);
      if (!c) continue;
      expect(c.stem + c.suffix.slice(1), w).toBe(w);
      expect(new Set([c.answer, ...c.wrong]), w).toEqual(new Set(["-ful", "-ive", "-ous"]));
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・句動詞・返事・慣用句を よむ（英字・スペース・アポストロフィ だけ）", () => {
    expect(focusSay("embarrassed", ["embarrassed", "frustrated", "relieved"])).toBe("embarrassed");
    expect(focusExampleWord("calm down", ["cheer up", "calm down", "make up"])).toBe("calm down");
    expect(focusSay("that's great", ["Oh no", "That's great", "Really"])).toBe("That's great");
    expect(focusSay("cake", ["over the moon", "feel blue", "a piece of cake"])).toBe("a piece of cake");
    expect(focusExampleWord("-ive", ["helpful", "creative", "generous"])).toBe("creative");
    expect(w38FocusOf("Are you OK")).toBe("are you ok");
    expect(w38FocusOf("generous")).toBe("-ous");
    // 性格の ことば だけで おわりが 1 しゅるいの 回（まえの ワールドの -ful の 回）では はたらかない
    expect(w38Say("-ful", ["helpful", "cheerful", "playful"])).toBeNull();
    for (const l of LESSONS.filter((x) => x.world === 38)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w38Say・w38Example は L1110 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 1111)) {
      for (const f of l.phonics.focus) {
        expect(w38Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w38Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド38の フォニックス問題", () => {
  it.skipIf(!hasW38)("気持ちの ことばの つづり: ただしい つづりを えらぶ", () => {
    const a = q(1111, "embarrassed");
    expect(a.promptJa).toBe("気持ちの ことばの つづり。ただしい つづりは どれ？");
    expect(a.display).toBe("I fell in front of everyone. I was so ＿＿.（はずかしい）");
    expect(ids(a).sort()).toEqual(["embarassed", "embarrased", "embarrassed"]);
    expect(a.answer).toBe("embarrassed");
  });

  it.skipIf(!hasW38)("句動詞: 小さな ことばを えらぶ（cheer up を 音の つながりの 問いで 問わない）", () => {
    const a = q(1116, "cheer up");
    expect(a.promptJa).toBe("気持ちの 句動詞。＿＿ に 入る ことばは どれ？");
    expect(a.display).toBe("Cheer ＿＿! You'll do better next time.（げんきを 出す）");
    expect(ids(a).sort()).toEqual(["down", "off", "up"]);
    expect(q(1117, "look up to").answer).toBe("up to");
  });

  it.skipIf(!hasW38)("共感の イントネーション: 返事の 声を えらぶ。音は 返事", () => {
    const a = q(1121, "Oh no");
    expect(a.promptJa).toBe("共感の イントネーション。この 返事は どんな 声で いう？");
    expect(a.display).toBe("Kiko: I dropped my ice cream on the ground. → Oh no…");
    expect(a.answer).toBe(TONE_LABEL.sad);
    expect(a.audioText).toBe("Oh no");
    expect(q(1122, "Congratulations").answer).toBe(TONE_LABEL.happy);
    expect(q(1124, "Did it hurt").answer).toBe(TONE_LABEL.ask);
  });

  it.skipIf(!hasW38)("慣用句と 性格の ことば（helpful を まえの ワールドの -ful で 問わない）", () => {
    const a = q(1126, "over the moon");
    expect(a.promptJa).toBe("気持ちの 慣用句。＿＿ に 入る ことばは どれ？");
    expect(a.display).toBe("I'm over the ＿＿!（とても うれしい）");
    expect(ids(a).sort()).toEqual(["moon", "rain", "sun"]);
    const b = q(1131, "helpful");
    expect(b.promptJa).toBe("性格の ことば。＿＿ に 入る おわりは どれ？");
    expect(b.display).toBe("help＿＿（よく 手つだう・やくに 立つ）");
    expect(ids(b).sort()).toEqual(["-ful", "-ive", "-ous"]);
    expect(b.answer).toBe("-ful");
    expect(q(1132, "courageous").answer).toBe("-ous");
  });

  it.skipIf(!hasW38)("ワールド38 の フォニックスの ことばは ぜんぶ ワールド38 の 問題（3つの 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 1111; n <= 1140; n++) {
      for (const it of phonicsItems(n)) {
        expect(w38Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド37 までの 回では ワールド38 の 問題に ならない", () => {
    for (const n of [43, 59, 71, 113, 289, 521, 522, 523, 524, 554, 644, 841, 961, 1021, 1051, 1080, 1081, 1091, 1096, 1101, 1110]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w38Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
