/**
 * ワールド26の フォニックス（ことばの リズム: きもちの こえ・-ed / -ing・セリフの くとうてん・いみを かえる 強勢・はやくちことば）の 問題と 表（src/lib/curriculum/w26Phonics.ts）。
 * - きもちの こえは「この きもちで いうと、どんな こえ？」（Really?! → ↗ たかく げんきに、Oh, really… → ↘ ひくく しずかに）
 * - -ed / -ing は「＿＿ に あてはまる ことばは どれ？」（The play is ＿＿. → exciting / excited / exciteing）
 * - セリフは「セリフの かきかたが ただしいのは どれ？」（"Help!" shouted the princess. / "Help"! … / "Help! …）
 * - 強勢は「この いみに なるのは、どこを つよく いう とき？」（I didn't eat YOUR cake / EAT / CAKE）
 * - はやくちことばは「おなじ おとで はじまる ことばは どれ？」
 * - ワールド25 までの 回では ワールド26 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w26Question } from "@/lib/curriculum/phonicsQ/w26";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { VOICE_CHOICES, edIngOf, punctOf, stressOf, twisterDisplay, twisterOf, voiceOf, w26Example, w26FocusOf, w26Say } from "@/lib/curriculum/w26Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW26 = !!getLesson(780);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

const ED_ING_WORDS = ["tired", "tiring", "relaxed", "relaxing", "excited", "exciting", "interested", "interesting", "bored", "boring", "amazed", "amazing", "surprised", "surprising", "worried", "worrying", "confused", "confusing"];

describe("ワールド26の つづりの表", () => {
  it("きもちの こえ: ! / ?! は ↗、… は ↘。→ ずっと おなじ は こたえに ならない", () => {
    expect(voiceOf("Really?!")).toMatchObject({ focus: "Really", up: true, answer: "↗ たかく げんきに" });
    expect(voiceOf("Oh, really…")).toMatchObject({ focus: "Really", up: false, answer: "↘ ひくく しずかに" });
    expect(voiceOf("Really")).toBeNull();
    expect(VOICE_CHOICES).toHaveLength(3);
    for (const l of LESSONS.filter((x) => x.world === 26)) {
      for (const w of l.phonics.words) {
        const v = voiceOf(w);
        if (!v) continue;
        expect(v.answer, w).not.toBe(VOICE_CHOICES[2]);
        expect(v.up, w).toBe(!w.endsWith("…") && !w.endsWith("."));
      }
    }
  });

  it("-ed / -ing: もう 1つの 形と まちがいの つづりが 選択肢。worried / worrying は y の きまり", () => {
    expect(edIngOf("exciting")).toMatchObject({ focus: "-ing", answer: "exciting", wrong: ["excited", "exciteing"], trap: "drop-e" });
    expect(edIngOf("excited")).toMatchObject({ focus: "-ed", wrong: ["exciting", "excitted"] });
    expect(edIngOf("worried")!.wrong).toEqual(["worrying", "worryed"]);
    expect(edIngOf("worrying")!.wrong).toEqual(["worried", "worriing"]);
    for (const w of ED_ING_WORDS) {
      const e = edIngOf(w)!;
      expect(e.sentence, w).toContain("＿＿");
      expect(new Set([e.answer, ...e.wrong]).size, w).toBe(3);
      // -ed と -ing は かならず ペアで 表に ある
      expect(edIngOf(e.wrong[0])!.wrong[0], w).toBe(w);
    }
    expect(new Set(ED_ING_WORDS.map((w) => edIngOf(w)!.trap))).toEqual(new Set(["drop-e", "plain", "y"]));
    expect(["walked", "playing", "interest"].map(edIngOf)).toEqual([null, null, null]);
  });

  it("セリフの くとうてん: まちがいの かきかたは こたえと ちがい、ことばは おなじ", () => {
    const p = punctOf('"Help!" shouted the princess.')!;
    expect(p).toMatchObject({ point: "!", answer: '"Help!" shouted the princess.' });
    const letters = (s: string) => s.replace(/[^A-Za-z]/g, "");
    for (const l of LESSONS.filter((x) => x.world === 26)) {
      for (const w of l.phonics.words) {
        const x = punctOf(w);
        if (!x) continue;
        expect(new Set([x.answer, ...x.wrong]).size, w).toBe(3);
        for (const v of x.wrong) expect(letters(v), w).toBe(letters(w));
      }
    }
    expect(punctOf("Help!")).toBeNull();
  });

  it("強勢: 3つの 文は おおもじの ところだけ ちがう", () => {
    const s = stressOf("I didn't eat YOUR cake")!;
    expect(s.stressed).toBe("YOUR");
    expect(s.wrong).toEqual(["I didn't EAT your cake", "I didn't eat your CAKE"]);
    for (const l of LESSONS.filter((x) => x.world === 26)) {
      for (const w of l.phonics.words) {
        const x = stressOf(w);
        if (!x) continue;
        expect(x.stressed, w).not.toBe("");
        for (const v of x.wrong) expect(v.toLowerCase(), w).toBe(w.toLowerCase());
        expect(new Set([x.answer, ...x.wrong]).size, w).toBe(3);
      }
    }
  });

  it("はやくちことば: かくす ことばは その おとで はじまり、まちがいは ちがう おとで はじまる", () => {
    const t = twisterOf("Crazy crows carry crunchy crackers")!;
    expect(twisterDisplay(t)).toBe("Crazy crows carry ＿＿ crackers");
    for (const l of LESSONS.filter((x) => x.world === 26)) {
      for (const w of l.phonics.words) {
        const x = twisterOf(w);
        if (!x) continue;
        expect(x.answer.startsWith(x.sound), w).toBe(true);
        for (const v of x.wrong) expect(v.startsWith(x.sound), `${w} ${v}`).toBe(false);
        expect(twisterDisplay(x), w).toContain("＿＿");
      }
    }
  });

  it("フォーカスの ボタン: その focus で 問う セリフ・文・ことばを よむ", () => {
    const words = ['"Help!" shouted the princess.', '"Let\'s write a play," said Riko.', '"The door is… locked!" said the bird.', "amazing"];
    expect(focusSay("!", words)).toBe('"Help!" shouted the princess.');
    expect(focusSay("…", words)).toBe('"The door is… locked!" said the bird.');
    expect(focusSay("-ing", words)).toBe("amazing");
    expect(focusSay("-ed", ["tired", "tiring", "relaxed", "relaxing"])).toBe("tired");
    expect(focusSay("Really", ["Really?!", "Oh, really…", "OK!", "Well, OK…"])).toBe("Really?!");
    expect(focusSay("cr", ["Crazy crows carry crunchy crackers", "Pip packs puppets in purple paper"])).toBe("Crazy crows carry crunchy crackers");
    expect(focusLabel("YOUR").main).toBe("YOUR");
    expect(w26FocusOf("I didn't eat YOUR cake")).toBe("YOUR");
    expect(w26FocusOf("I can't wait!")).toBe("can't");
    // ボタンで よむ おてほんは 記号を ふくまない（くとうてんは しるしの なまえ、強勢は つよく いう ことば）
    expect(focusExampleWord("Really", ["Really?!", "Oh, really…"])).toBe("Really");
    expect(focusExampleWord(",", words)).toBe("comma");
    expect(focusExampleWord("…", words)).toBe("three dots");
    expect(focusExampleWord("-ing", words)).toBe("amazing");
    expect(focusExampleWord("YOUR", ["I didn't eat YOUR cake", "The show starts at SIX"])).toBe("YOUR");
    expect(focusExampleWord("th", ["Think first, then thank the theater", "A chubby chick chews chocolate chips"])).toBe("Think first then thank the theater");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w26Say・w26Example は L750 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 751)) {
      for (const f of l.phonics.focus) {
        expect(w26Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w26Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド26の フォニックス問題", () => {
  it.skipIf(!hasW26)("きもちの こえ: 選択肢は きまった 順", () => {
    const a = q(751, "Really?!");
    expect(a.promptJa).toBe("この きもちで いうと、どんな こえ？");
    expect(a.display).toBe("Really?!（びっくり！ ほんとうに？）");
    expect(ids(a)).toEqual([...VOICE_CHOICES]);
    expect(a.answer).toBe("↗ たかく げんきに");
    expect(q(751, "Oh, really…").answer).toBe("↘ ひくく しずかに");
  });

  it.skipIf(!hasW26)("-ed / -ing: excited を ワールド11 の -ed の おとで 問わない", () => {
    const a = q(757, "exciting");
    expect(a.promptJa).toBe("＿＿ に あてはまる ことばは どれ？");
    expect(a.display).toBe("The play is ＿＿.（わくわくさせる）");
    expect(ids(a).sort()).toEqual(["excited", "exciteing", "exciting"]);
    expect(q(757, "excited").explanationJa).toContain("-ed");
    expect(q(759, "worried").explanationJa).toContain("y を i に");
  });

  it.skipIf(!hasW26)("セリフ・強勢・はやくちことば", () => {
    const a = q(762, '"Help!" shouted the princess.');
    expect(a.promptJa).toBe("セリフの かきかたが ただしいのは どれ？");
    expect(ids(a)).toContain('"Help"! shouted the princess.');
    const b = q(768, "I didn't eat YOUR cake");
    expect(b.promptJa).toBe("この いみに なるのは、どこを つよく いう とき？");
    expect(ids(b).sort()).toEqual(["I didn't EAT your cake", "I didn't eat YOUR cake", "I didn't eat your CAKE"].sort());
    expect(b.explanationJa).toContain("YOUR");
    const c = q(771, "Crazy crows carry crunchy crackers");
    expect(c.answer).toBe("crunchy");
    expect(c.display).toBe("Crazy crows carry ＿＿ crackers");
  });

  it.skipIf(!hasW26)("ワールド26 の フォニックスの ことばは ぜんぶ ワールド26 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 751; n <= 780; n++) {
      for (const it of phonicsItems(n)) {
        expect(w26Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド25 までの 回では ワールド26 の 問題に ならない", () => {
    for (const n of [151, 316, 431, 434, 656, 691, 721, 750]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w26Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
