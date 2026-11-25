/**
 * ワールド25の フォニックス（-ness・-ive・複合語・にた いみの ことば・しつもんの イントネーション）の 問題と 表（src/lib/curriculum/w25Phonics.ts）。
 * - -ness は「『〜さ』を あらわす ことばは どれ？」（dark → darkness / darkly / darker。happy は happyness も）
 * - -ive は「ive の ことばで ただしい つづりは どれ？」（create → creative / creativ / createive）
 * - 複合語は「あと 1つの ことばは どれ？」（＿＿print（あしあと）→ foot / ear / sky）
 * - にた いみの ことばは「にた いみの ことばは どれ？」（huge → big / small / quiet）
 * - イントネーションは「この しつもんの おわりは あがる？ さがる？」（Wh は ↘、Yes / No は ↗）
 * - ワールド24 までの 回では ワールド25 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w25Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { INTONATION_CHOICES, compoundFocus, compoundOf, intonationOf, iveOf, nessOf, synOf, w25Say } from "@/lib/curriculum/w25Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW25 = !!getLesson(750);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

const NESS_WORDS = ["darkness", "brightness", "softness", "coldness", "sadness", "happiness", "kindness", "weakness", "loudness", "sweetness", "freshness", "thickness", "fairness", "cleverness", "laziness", "tidiness"];
const IVE_WORDS = ["active", "detective", "inventive", "impressive", "attractive", "protective", "massive", "supportive", "creative", "expensive", "decorative", "explosive", "descriptive", "defensive", "talkative", "imaginative"];
const COMPOUND_WORDS = ["footprint", "fingerprint", "flashlight", "somebody", "nobody", "somewhere", "everywhere", "something", "keyhole", "footstep", "moonlight", "waterfall", "doorway", "staircase", "bookshelf", "notebook"];
const SYN_WORDS = ["huge", "giant", "enormous", "large", "tiny", "little", "silent", "scared", "strange", "clever", "begin", "finish", "quick", "simple", "glad", "correct"];

describe("ワールド25の つづりの表", () => {
  it("-ness: -ly・-er の ことばが まちがいの 選択肢。y で おわる ことばは y の まま つけた つづりも", () => {
    expect(nessOf("darkness")).toMatchObject({ base: "dark", answer: "darkness", wrong: ["darkly", "darker"], yToI: false });
    expect(nessOf("happiness")).toMatchObject({ base: "happy", wrong: ["happily", "happier", "happyness"], yToI: true });
    expect(nessOf("sadness")!.wrong).toContain("sadder");
    expect(["agreement", "business", "illness"].map(nessOf)).toEqual([null, null, null]);
  });

  it("-ive: v で おわる つづりが かならず まちがいに 入る。4つの わなが そろう", () => {
    expect(iveOf("creative")).toMatchObject({ base: "create", wrong: ["creativ", "createive"], trap: "drop-e" });
    expect(iveOf("explosive")).toMatchObject({ base: "explode", trap: "change" });
    expect(iveOf("talkative")!.trap).toBe("ative");
    for (const w of IVE_WORDS) expect(iveOf(w)!.wrong[0], w).toBe(w.slice(0, -1));
    expect(new Set(IVE_WORDS.map((w) => iveOf(w)!.trap))).toEqual(new Set(["plain", "drop-e", "change", "ative"]));
    expect(["give", "five", "olive"].map(iveOf)).toEqual([null, null, null]);
  });

  it("複合語: focus に 2つに わけた 形が ある ときだけ。かくした パーツが こたえ", () => {
    expect(compoundOf("footprint", ["foot-print"])).toMatchObject({ answer: "foot", blank: 0, wrong: ["ear", "sky"] });
    expect(compoundOf("flashlight", ["flash-light"])).toMatchObject({ answer: "light", blank: 1 });
    expect(compoundOf("footprint", ["foot-step"])).toBeNull();
    expect(compoundFocus("somebody")).toBe("some-body");
    expect(compoundFocus("football")).toBeNull();
  });

  it("にた いみの ことば: focus に その ことばが ある ときだけ", () => {
    expect(synOf("huge", ["huge"])).toMatchObject({ answer: "big", wrong: ["small", "quiet"] });
    expect(synOf("tiny", ["tiny"])!.answer).toBe("small");
    expect(synOf("huge", ["tiny"])).toBeNull();
    expect(synOf("big", ["big"])).toBeNull();
  });

  it("イントネーション: Wh で はじまる しつもんは ↘、Yes / No は ↗（Do you know who ～? は ↗）", () => {
    expect(intonationOf("What is it")!.answer).toBe("↘ さがる");
    expect(intonationOf("Is it bigger than a box?")!.answer).toBe("↗ あがる");
    expect(intonationOf("Do you know who took it")).toMatchObject({ kind: "yesno", answer: "↗ あがる" });
    expect(intonationOf("Who are you")).toBeNull(); // ワールド22 の おわりの しるしの フレーズは ここでは あつかわない
    expect(INTONATION_CHOICES).toHaveLength(3);
  });

  it("どの 表の まちがいの 選択肢も こたえと ちがい、かさならない", () => {
    const xs = [
      ...NESS_WORDS.map((w) => nessOf(w)!),
      ...IVE_WORDS.map((w) => iveOf(w)!),
      ...COMPOUND_WORDS.map((w) => compoundOf(w, [compoundFocus(w)!])!),
      ...SYN_WORDS.map((w) => synOf(w, [w])!),
    ];
    for (const x of xs) expect(new Set([x.answer, ...x.wrong]).size, x.answer).toBe(1 + x.wrong.length);
    // にた いみの まちがいに ほかの にた ことばを 入れない（huge の まちがいに large など）
    for (const w of SYN_WORDS) {
      const s = synOf(w, [w])!;
      for (const x of s.wrong) expect(SYN_WORDS.filter((v) => synOf(v, [v])!.answer === s.answer), `${w} ${x}`).not.toContain(x);
    }
  });

  it("フォーカスの ボタン: -ness・-ive は その回の ことば、複合語は ことば まるごと、ことば・しつもんは そのまま", () => {
    expect(focusSay("-ness", ["darkness", "brightness", "softness", "coldness"])).toBe("darkness");
    expect(focusSay("-ive", ["sadness", "brightness", "detective", "expensive"])).toBe("detective");
    expect(focusSay("foot-print", ["footprint"])).toBe("footprint");
    expect(focusSay("huge", ["huge", "tiny"])).toBe("huge");
    expect(focusLabel("-ive").main).toBe("…ive");
    expect(focusLabel("flash-light").main).toBe("flash・light");
    expect(focusExampleWord("-ness", ["sadness", "detective"])).toBe("sadness");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w25Say は L720 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 721)) {
      for (const f of l.phonics.focus) expect(w25Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
    }
  });
});

describe("ワールド25の フォニックス問題", () => {
  it.skipIf(!hasW25)("-ness: kindness を ワールド21 の -ment / -ness で 問わない", () => {
    const a = q(721, "darkness");
    expect(a.promptJa).toBe("「〜さ」を あらわす ことばは どれ？");
    expect(a.display).toBe("dark（くらい）→ ？（くらやみ・くらさ）");
    expect(ids(a).sort()).toEqual(["darker", "darkly", "darkness"]);
    expect(ids(q(722, "happiness")).sort()).toEqual(["happier", "happily", "happiness", "happyness"]);
    expect(q(722, "kindness").explanationJa).toContain("ness");
  });

  it.skipIf(!hasW25)("-ive: active を ワールド22 の 語の家族で 問わない", () => {
    const a = q(726, "creative");
    expect(a.promptJa).toBe("ive の ことばで ただしい つづりは どれ？");
    expect(ids(a).sort()).toEqual(["createive", "creativ", "creative"]);
    expect(q(726, "active").answer).toBe("active");
    expect(q(727, "explosive").explanationJa).toContain("explode → explosive");
  });

  it.skipIf(!hasW25)("複合語: something を ワールド15 の「2つに わけると」で 問わない", () => {
    const a = q(731, "footprint");
    expect(a.promptJa).toBe("あと 1つの ことばは どれ？");
    expect(a.display).toBe("＿＿print（あしあと）");
    expect(ids(a).sort()).toEqual(["ear", "foot", "sky"]);
    expect(q(732, "something").display).toBe("some＿＿（なにか）");
  });

  it.skipIf(!hasW25)("にた いみの ことば・イントネーション", () => {
    const a = q(738, "huge");
    expect(a.promptJa).toBe("にた いみの ことばは どれ？");
    expect(a.answer).toBe("big");
    const b = q(741, "Is it bigger than a box");
    expect(b.promptJa).toBe("この しつもんの おわりは あがる？ さがる？");
    expect(b.display).toBe("Is it bigger than a box?");
    expect(ids(b)).toEqual([...INTONATION_CHOICES]);
    expect(b.answer).toBe("↗ あがる");
    expect(q(741, "What is it").answer).toBe("↘ さがる");
    expect(q(744, "Do you know who took it").explanationJa).toContain("Yes / No");
  });

  it.skipIf(!hasW25)("ワールド25 の フォニックスの ことばは ぜんぶ ワールド25 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 721; n <= 750; n++) {
      for (const it of phonicsItems(n)) {
        expect(w25Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド24 までの 回では ワールド25 の 問題に ならない", () => {
    for (const n of [431, 434, 610, 656, 660, 691, 720]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w25Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
