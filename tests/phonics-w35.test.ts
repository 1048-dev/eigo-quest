/**
 * ワールド35の フォニックス（-ity の 名詞・inter- と co-・対比の 強勢・あらたまった ことば・ステージ4 の 語根の まとめ）の 問題と 表（src/lib/curriculum/w35Phonics.ts）。
 * - -ity は「-ity の ことば。もとの ことば（形容詞）は どれ？」（responsibility → responsible / responsable / responsibil）
 * - inter- と co- は「inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？」（英語の 文 → cooperate / interview / intersection）
 * - 対比の 強勢は「B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？」（A: Did you say Tuesday?　B: I said Thursday. → Thursday）
 * - あらたまった ことばは「あらたまった ことば（手紙・発表で つかう）は どれ？」（ふだん: get → receive / recieve / receeve）
 * - 語根は「ステージ4 の 語根。＿＿ に 入る パーツは どれ？」（in＿＿ → spect / port / rupt）
 * - ワールド34 までの 回では ワールド35 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w35Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { ROOT_JA, contrastMarked, contrastOf, formalOf, interCoOf, ityOf, rootOf, w35Example, w35FocusOf, w35Say } from "@/lib/curriculum/w35Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW35 = !!getLesson(1050);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w35Words = () => LESSONS.filter((x) => x.world === 35).flatMap((l) => l.phonics.words);

describe("ワールド35の つづりの表", () => {
  it("-ity: ことばは ity で おわる。答えは もとの 形容詞。まちがいは ない つづりで、どの 表にも ない", () => {
    expect(ityOf("responsibility")).toMatchObject({ answer: "responsible", wrong: ["responsable", "responsibil"], stress: "re-spon-si-BIL-i-ty" });
    expect(ityOf("Equality")).toMatchObject({ word: "equality", answer: "equal" });
    expect(ityOf("equal")).toBeNull();
    expect(ityOf("toString")).toBeNull();
    for (const w of w35Words()) {
      const t = ityOf(w);
      if (!t) continue;
      expect(w.endsWith("ity"), w).toBe(true);
      expect(new Set([t.answer, ...t.wrong]).size, w).toBe(3);
      for (const x of t.wrong) expect(w35FocusOf(x), `${w} ${x}`).toBeNull();
      // 強勢は -ity の すぐ まえ（大文字の 音節の あとに i-ty。di-VER-si-ty の ように 子音が つく ことも ある）
      expect(t.stress, w).toMatch(/[A-Z]+-[a-z]?i-ty$/);
      expect(t.stress.replace(/-/g, "").toLowerCase(), w).toBe(w);
    }
  });

  it("inter- と co-: ことばは その パーツで はじまる。文の ＿＿ は 1つ。まちがいも 表に ある inter / co の ことばで 3つ ちがう", () => {
    expect(interCoOf("cooperate")).toMatchObject({ prefix: "co", rest: "operate", wrong: ["interview", "intersection"] });
    expect(interCoOf("international")).toMatchObject({ prefix: "inter" });
    expect(interCoOf("interrupt")).toBeNull(); // 語根の 表（rupt）
    expect(interCoOf("inter")).toBeNull();
    for (const w of w35Words()) {
      const ic = interCoOf(w);
      if (!ic) continue;
      expect(w, w).toBe(ic.prefix + ic.rest);
      expect(ic.sentence.split("＿＿").length, w).toBe(2);
      expect(ic.sentence, w).toMatch(/^[A-Z][A-Za-z ,.'＿]+[.?]$/);
      expect(new Set([ic.answer, ...ic.wrong]).size, w).toBe(3);
      for (const x of ic.wrong) expect(interCoOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("対比の 強勢: つよく いう ことばと まちがいは どれも 文の なかの ことば。A の 文に つよく いう ことばは ない", () => {
    expect(contrastOf("I said Thursday")).toMatchObject({ strong: "Thursday", context: "Did you say Tuesday?", wrong: ["I", "said"] });
    expect(contrastOf("i like this one")).toMatchObject({ sentence: "I like this one", strong: "this" });
    expect(contrastMarked(contrastOf("I like this one")!)).toBe("I like THIS one");
    expect(contrastOf("I like this")).toBeNull();
    for (const w of w35Words()) {
      const c = contrastOf(w);
      if (!c) continue;
      const ws = w.split(" ");
      expect(ws, w).toContain(c.strong);
      for (const x of c.wrong) expect(ws, `${w} ${x}`).toContain(x);
      expect(new Set([c.answer, ...c.wrong]).size, w).toBe(3);
      expect(c.context.split(/[ ?]/), w).not.toContain(c.strong);
      // おなじ 文の ほかの ことばは A の 文にも ある か、I / It's など よわい ことば
      expect(c.context.endsWith("?"), w).toBe(true);
    }
  });

  it("あらたまった ことば: まちがいは ない つづりで、どの 表にも ない。ふだんの ことばと ちがう", () => {
    expect(formalOf("receive")).toMatchObject({ casual: "get", wrong: ["recieve", "receeve"] });
    expect(formalOf("children")).toMatchObject({ casual: "kids" });
    expect(formalOf("kids")).toBeNull();
    for (const w of w35Words()) {
      const f = formalOf(w);
      if (!f) continue;
      expect(f.casual, w).not.toBe(w);
      expect(new Set([f.answer, ...f.wrong]).size, w).toBe(3);
      for (const x of f.wrong) expect(w35FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("語根: まえ ＋ 語根 ＋ うしろ で ことばに なる。まちがいの 語根は ほかの ステージ4 の 語根", () => {
    expect(rootOf("inspect")).toMatchObject({ root: "spect", before: "in", after: "", wrong: ["port", "rupt"] });
    expect(rootOf("structure")).toMatchObject({ root: "struct", after: "ure" });
    expect(rootOf("spect")).toBeNull();
    for (const w of w35Words()) {
      const r = rootOf(w);
      if (!r) continue;
      expect(r.before + r.root + r.after, w).toBe(w);
      expect(new Set([r.answer, ...r.wrong]).size, w).toBe(3);
      for (const x of r.wrong) {
        expect(Object.keys(ROOT_JA), `${w} ${x}`).toContain(x);
        // まちがいの 語根を 入れた ことばは 表に ない（ほかの ことばに ならない）
        expect(w35FocusOf(r.before + x + r.after), `${w} ${x}`).toBeNull();
      }
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文を よむ（英字・スペース・アポストロフィ だけ）", () => {
    expect(focusSay("-ity", ["equality", "diversity", "curiosity"])).toBe("equality");
    expect(focusExampleWord("co", ["international", "interview", "cooperate"])).toBe("cooperate");
    expect(focusExampleWord("inter", ["international", "interview", "cooperate"])).toBe("international");
    expect(focusSay("thursday", ["I like this one", "I said Thursday", "Let's meet at four", "It's on the right"])).toBe("I said Thursday");
    expect(focusSay("receive", ["children", "receive", "request"])).toBe("receive");
    expect(focusExampleWord("rupt", ["export", "interrupt", "reject"])).toBe("interrupt");
    expect(w35FocusOf("interrupt")).toBe("rupt"); // inter で はじまっても 語根の 表
    for (const l of LESSONS.filter((x) => x.world === 35)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z']+( [A-Za-z']+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w35Say・w35Example は L1020 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 1021)) {
      for (const f of l.phonics.focus) {
        expect(w35Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w35Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド35の フォニックス問題", () => {
  it.skipIf(!hasW35)("-ity: もとの 形容詞を えらぶ", () => {
    const a = q(1024, "responsibility");
    expect(a.promptJa).toBe("-ity の ことば。もとの ことば（形容詞）は どれ？");
    expect(a.display).toBe("responsibility（せきにん・やくわり）→ もとの ことば: ＿＿（せきにんの ある）");
    expect(ids(a).sort()).toEqual(["responsable", "responsibil", "responsible"]);
    expect(a.answer).toBe("responsible");
    expect(q(1021, "curiosity").answer).toBe("curious");
    expect(q(1023, "ability").answer).toBe("able");
  });

  it.skipIf(!hasW35)("inter- と co-: 英語の 文に あう ことばを えらぶ（international を ワールド24 の 地名で、interview を ほかの ワールドで 問わない）", () => {
    const a = q(1026, "cooperate");
    expect(a.promptJa).toBe("inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？");
    expect(a.display).toBe("If we all ＿＿, we can finish the poster faster.");
    expect(ids(a).sort()).toEqual(["cooperate", "intersection", "interview"]);
    expect(q(1026, "international").answer).toBe("international");
    expect(q(1029, "intermission").answer).toBe("intermission");
  });

  it.skipIf(!hasW35)("対比の 強勢: A の 文と くらべて つよく いう ことばを えらぶ。音は B の 文", () => {
    const a = q(1031, "I said Thursday");
    expect(a.promptJa).toBe("B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？");
    expect(a.display).toBe("A: Did you say Tuesday?　B: I said Thursday.（木曜日って いったんだよ）");
    expect(ids(a).sort()).toEqual(["I", "Thursday", "said"]);
    expect(a.answer).toBe("Thursday");
    expect(a.audioText).toBe("I said Thursday");
    expect(q(1031, "I like this one").answer).toBe("this");
    expect(q(1032, "Kiko feeds the fish").answer).toBe("Kiko");
  });

  it.skipIf(!hasW35)("あらたまった ことばと 語根", () => {
    const a = q(1036, "receive");
    expect(a.promptJa).toBe("あらたまった ことば（手紙・発表で つかう）は どれ？");
    expect(a.display).toBe("ふだん: get（うけとる・もらう）→ あらたまった: ＿＿");
    expect(ids(a).sort()).toEqual(["receeve", "receive", "recieve"]);
    const b = q(1041, "inspect");
    expect(b.promptJa).toBe("ステージ4 の 語根。＿＿ に 入る パーツは どれ？");
    expect(b.display).toBe("in＿＿（中まで よく 見る → しらべる）");
    expect(ids(b).sort()).toEqual(["port", "rupt", "spect"]);
    expect(b.answer).toBe("spect");
    expect(q(1042, "interrupt").answer).toBe("rupt");
    expect(q(1044, "erupt").answer).toBe("rupt");
  });

  it.skipIf(!hasW35)("ワールド35 の フォニックスの ことばは ぜんぶ ワールド35 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 1021; n <= 1050; n++) {
      for (const it of phonicsItems(n)) {
        expect(w35Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド34 までの 回では ワールド35 の 問題に ならない", () => {
    for (const n of [56, 57, 58, 517, 621, 681, 811, 841, 851, 905, 921, 961, 986, 991, 1006, 1020]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w35Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
