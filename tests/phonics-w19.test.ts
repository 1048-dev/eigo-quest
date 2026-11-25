/**
 * ワールド19の フォニックス（re-・道具の -er / -or・だまっている もじ・qu / squ・ou / ough）の 問題と 表（src/lib/curriculum/w19Phonics.ts）。
 * - re- は「『もう いちど』の いみの ことばは？」（make → remake / unmake / rimake）
 * - 道具の ことばは「おわりの つづりは？」（elevat＿＿ → or / er / ar）
 * - だまっている もじは「＿ に はいる つづりは？」（＿ench → wr / r / rr / wh、whi＿ → stle / sle / ssle / sel）
 * - qu・squ は「＿ に はいる つづりは？」（＿iz → qu / kw / cu / q、＿are → squ / skw / scu / sq）
 * - ou・ough は「どの おと？」（touch → ア、through → ウー、enough → アフ、though → オウ、thought → オー）
 * - ワールド18 までの 回では ワールド19 の 問題に ならない（ワールド14 の knife や ワールド1 の queen は これまでどおり）。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w19Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { ouSound, quBlank, reOf, silentBlank19, toolEnding } from "@/lib/curriculum/w19Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW19 = !!getLesson(570);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド19の つづりの表", () => {
  it("re-: はんたいの un- と、おとの まま かいた ri- を まちがいに する", () => {
    expect(reOf("remake")).toEqual({ base: "make", answer: "remake", wrong: ["unmake", "rimake"], meaning: "つくりなおす" });
    expect(reOf("rewind")?.wrong).toEqual(["unwind", "riwind"]);
    expect(["read", "return", "red"].map(reOf)).toEqual([null, null, null]);
  });

  it("道具の -er / -or: おわりを ＿＿ に して、つけかたの 種類も わかる", () => {
    expect(toolEnding("opener")).toEqual({ word: "opener", display: "open＿＿（あける どうぐ）", answer: "er", base: "open", kind: "add", meaning: "あける どうぐ" });
    expect(toolEnding("eraser")).toMatchObject({ kind: "e", answer: "er" });
    expect(toolEnding("cutter")).toMatchObject({ kind: "double", display: "cutt＿＿（カッター）" });
    expect(toolEnding("elevator")).toMatchObject({ kind: "or", answer: "or", display: "elevat＿＿（エレベーター）" });
    expect(["teacher", "doctor", "taller"].map(toolEnding)).toEqual([null, null, null]);
  });

  it("だまっている もじ: グループごとに ＿ の いちが ちがう", () => {
    expect(silentBlank19("wrench")).toEqual({ display: "＿ench（レンチ）", answer: "wr", family: "wr", meaning: "レンチ" });
    expect(silentBlank19("thumb")?.display).toBe("thu＿（おやゆび）");
    expect(silentBlank19("plumber")?.display).toBe("plu＿er（すいどう やさん）");
    expect(silentBlank19("guitar")).toMatchObject({ answer: "gu", family: "gu", display: "＿itar（ギター）" });
    expect(silentBlank19("whistle")).toMatchObject({ answer: "stle", family: "-stle", display: "whi＿（ふえ）" });
    expect(silentBlank19("gum")).toBeNull();
  });

  it("qu・squ: ことばの まんなかの qu も ＿ に する", () => {
    expect(quBlank("quiz")).toEqual({ display: "＿iz（クイズ）", answer: "qu", meaning: "クイズ" });
    expect(quBlank("liquid")?.display).toBe("li＿id（えきたい）");
    expect(quBlank("square")).toMatchObject({ answer: "squ", display: "＿are（しかく・ひろば）" });
    expect(quBlank("queue")).toBeNull();
  });

  it("ou・ough: ough を ふくむ ことばは ough の 4つの おとで 問う", () => {
    expect(ouSound("house")).toMatchObject({ team: "ou", answer: "アウ" });
    expect(ouSound("touch")).toMatchObject({ team: "ou", answer: "ア", choices: ["アウ", "ア", "ウー"] });
    expect(ouSound("soup")?.answer).toBe("ウー");
    expect(ouSound("through")).toMatchObject({ team: "ough", answer: "ウー", choices: ["ウー", "アフ", "オウ", "オー"] });
    expect(["enough", "though", "thought"].map((w) => ouSound(w)?.answer)).toEqual(["アフ", "オウ", "オー"]);
    expect(ouSound("cough")).toBeNull();
  });

  it("フォーカスの ボタン: re- は「re…」、-stle は「…stle」。読み上げは その回の ことば（ワールド14・ワールド1 の よみかたは かえない）", () => {
    expect(focusLabel("re-")).toEqual({ main: "re…", hintJa: "はじめに つける" });
    expect(focusLabel("-stle").main).toBe("…stle");
    expect(focusExampleWord("re-", ["remake", "reuse"])).toBe("remake");
    expect(focusSay("re-", ["refill", "reopen"])).toBe("refill");
    expect(focusSay("-or", ["elevator", "motor"])).toBe("elevator");
    expect(focusSay("ough", ["enough", "rough"])).toBe("enough");
    expect(focusSay("gu", ["guitar"])).toBe("guitar");
    expect(focusSay("ou", ["house", "touch"])).toBe("touch");
    expect(focusSay("ou", ["house", "cloud"])).toBe("ow");
    expect(focusSay("kn", ["knife"])).toBe(focusSay("kn", []));
  });
});

describe("ワールド19の フォニックス問題", () => {
  it.skipIf(!hasW19)("re-: もとの ことばと いみを 出して、re の ついた ことばを えらぶ", () => {
    const a = q(541, "remake");
    expect(a.display).toBe("make → ？（つくりなおす）");
    expect(a.answer).toBe("remake");
    expect(ids(a).sort()).toEqual(["remake", "rimake", "unmake"]);
    expect(q(545, "rewind").explanationJa).toContain("もう いちど");
  });

  it.skipIf(!hasW19)("道具の ことば: er / or / ar から おわりを えらぶ（くらべる かたちの 問題に ならない）", () => {
    const a = q(546, "opener");
    expect(a.promptJa).toBe("おわりの つづりは どれ？");
    expect(a.answer).toBe("er");
    expect(ids(a).sort()).toEqual(["ar", "er", "or"]);
    expect(q(548, "calculator").answer).toBe("or");
    expect(q(548, "calculator").explanationJa).toContain("ator");
    expect(q(547, "cutter").explanationJa).toContain("重ねて");
  });

  it.skipIf(!hasW19)("だまっている もじ: ワールド14 の 問題では なく ワールド19 の 選択肢で 問う", () => {
    const a = q(551, "knob");
    expect(a.display).toBe("＿ob（とっての つまみ）");
    expect(ids(a).sort()).toEqual(["gn", "kn", "n", "nn"]);
    expect(q(553, "guess").answer).toBe("gu");
    expect(ids(q(554, "castle")).sort()).toEqual(["sel", "sle", "ssle", "stle"]);
    expect(q(555, "whistle").answer).toBe("stle");
  });

  it.skipIf(!hasW19)("qu・squ: ふりかえりの 回でも ことばで qu / squ が きまる", () => {
    expect(q(556, "quiet").answer).toBe("qu");
    expect(q(559, "equal").display).toBe("e＿al（おなじ・ひとしい）");
    expect(q(560, "square").answer).toBe("squ");
    expect(ids(q(560, "square")).sort()).toEqual(["scu", "skw", "sq", "squ"]);
  });

  it.skipIf(!hasW19)("ou・ough: おとを えらぶ（ワールド8 の ou の 問題に ならない）", () => {
    const a = q(561, "touch");
    expect(a.promptJa).toBe("この ことばの ou は どの おと？");
    expect(a.answer).toBe("ア");
    expect(q(563, "through").answer).toBe("ウー");
    expect(q(564, "brought").answer).toBe("オー");
    expect(q(565, "though").promptJa).toBe("この ことばの ough は どの おと？");
  });

  it.skipIf(!hasW19)("ワールド19 の フォニックスの ことばは ぜんぶ ワールド19 の 問題に なる", () => {
    for (let n = 541; n <= 570; n++) {
      for (const it of phonicsItems(n)) expect(w19Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
    }
  });

  it("ワールド18 までの 回では ワールド19 の 問題に ならない", () => {
    for (const n of [29, 401, 406, 540]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w19Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
