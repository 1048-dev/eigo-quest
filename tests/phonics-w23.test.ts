/**
 * ワールド23の フォニックス（理科の パーツ・-ment・強勢の 移動・-y の ようすの ことば・-tion）の 問題と 表（src/lib/curriculum/w23Phonics.ts）。
 * - 理科の パーツは「この ことばの micro は どんな いみ？」（ちいさい / はかる どうぐ / ねつ・あたたかさ / とおく。もう 1つの パーツの いみは 出さない）
 * - -ment は「ただしい つづりは どれ？」（measurement / measurment / measuremant）
 * - 強勢の 移動は「つよく よむ ところは どれ？」（pho-TOG-ra-phy。かぞくの PHO-to-graph を 見せる）
 * - -y・-tion は「ただしい ことばは どれ？」（shine → shiny / shiney / shinie、observe → observation / observetion / observasion）
 * - ワールド22 までの 回では ワールド23 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w23Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { mentDisplay, mentOf, sciPartOf, shiftOf, shiftSyllables, tionOf, yAdjOf } from "@/lib/curriculum/w23Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW23 = !!getLesson(690);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド23の つづりの表", () => {
  it("理科の パーツ: focus の パーツの いみを 問う。もう 1つの パーツの いみは 選択肢に 入れない", () => {
    const m = sciPartOf("microscope", ["micro-"])!;
    expect(m).toMatchObject({ part: "micro", answer: "ちいさい", meaning: "けんびきょう" });
    expect(m.choices).toHaveLength(4);
    expect(m.choices).not.toContain("みる どうぐ");
    expect(sciPartOf("thermometer", ["-meter"])!.choices).not.toContain("ねつ・あたたかさ");
    expect(sciPartOf("thermometer", ["thermo-"])!.answer).toBe("ねつ・あたたかさ");
    expect(sciPartOf("telescope", ["micro-"])).toBeNull();
    expect(sciPartOf("telephone", ["micro-"])).toBeNull(); // ワールド21 の ことば
  });

  it("-ment: 手で 書いた まちがい（ほんとうには ない つづり）。もとの ことばが ない ことばは「？（いみ）」で 見せる", () => {
    expect(mentOf("measurement")).toMatchObject({ base: "measure", wrong: ["measurment", "measuremant"], trap: "keep-e" });
    expect(mentOf("equipment")).toMatchObject({ wrong: ["equippment", "equipmant"], trap: "no-double" });
    expect(mentOf("environment")?.wrong).toContain("enviroment");
    expect(mentDisplay(mentOf("experiment")!)).toBe("？（じっけん）");
    expect(mentDisplay(mentOf("measurement")!)).toBe("measure（はかる）→ ？（はかった あたい・そくてい）");
    // ワールド21 の -ment の ことばは ここでは あつかわない
    expect(["movement", "agreement", "kindness"].map(mentOf)).toEqual([null, null, null]);
  });

  it("強勢の 移動: つよい はくを 大文字に。選択肢は 3〜4つ（5はくの ことばは こたえの まわり）、かぞくの ことばの つよい はくも かえす", () => {
    expect(shiftOf("photography", ["pho-tog-ra-phy"])).toMatchObject({ answer: "pho-TOG-ra-phy", pairStressed: "PHO-to-graph" });
    expect(shiftOf("photograph", ["pho-to-graph"])!.choices).toEqual(["PHO-to-graph", "pho-TO-graph", "pho-to-GRAPH"]);
    const e = shiftOf("electricity", ["e-lec-tric-i-ty"])!;
    expect(e.answer).toBe("e-lec-TRIC-i-ty");
    expect(e.choices).toHaveLength(4);
    expect(e.choices).toContain(e.answer);
    expect(shiftOf("scientific", ["sci-en-tif-ic"])?.answer).toBe("sci-en-TIF-ic");
    expect(shiftOf("photography", ["photo-"])).toBeNull(); // focus に はくの 形が なければ 問わない
    expect(shiftSyllables("magnetism")).toBe("mag-ne-tism");
    expect(shiftSyllables("banana")).toBeNull();
  });

  it("-y: そのまま y・e を とる・しいんを かさねる（stony・smoky の ように -ey も ある ことばは 入れない）", () => {
    expect(yAdjOf("cloudy")).toMatchObject({ base: "cloud", trap: "add-y", wrong: ["cloudey", "clouddy"] });
    expect(yAdjOf("shiny")).toMatchObject({ base: "shine", trap: "drop-e", wrong: ["shiney", "shinie"] });
    expect(yAdjOf("sunny")).toMatchObject({ base: "sun", trap: "double", wrong: ["suny", "sunney"] });
    expect(["stony", "smoky", "happy", "sky"].map(yAdjOf)).toEqual([null, null, null, null]);
  });

  it("-tion: ion だけ・e を とって ation・te を とって tion（predication の ように ある ことばは まちがいに 出さない）", () => {
    expect(tionOf("prediction")).toMatchObject({ base: "predict", trap: "add-ion", wrong: ["predicsion", "predictian"] });
    expect(tionOf("observation")).toMatchObject({ trap: "drop-e", wrong: ["observetion", "observasion"] });
    expect(tionOf("migration")).toMatchObject({ trap: "ate-tion", wrong: ["migrateion", "migrasion"] });
    expect(["station", "action", "vacation"].map(tionOf)).toEqual([null, null, null]);
  });

  it("どの 表の まちがいの 選択肢も こたえと ちがい、2つが かさならない", () => {
    const words = [
      ...["experiment", "instrument", "document", "ornament", "measurement", "arrangement", "amazement", "basement", "equipment", "development", "environment"].map((w) => mentOf(w)!),
      ...["cloudy", "sticky", "bumpy", "salty", "rusty", "windy", "dusty", "shiny", "icy", "noisy", "juicy", "sunny", "muddy", "spotty", "starry"].map((w) => yAdjOf(w)!),
      ...["prediction", "reaction", "collection", "observation", "preparation", "rotation", "migration", "evaporation", "celebration"].map((w) => tionOf(w)!),
    ];
    for (const x of words) expect(new Set([x.answer, ...x.wrong]).size, x.answer).toBe(3);
  });

  it("フォーカスの ボタン: パーツ・おわりは その回の ことば、強勢の はくの 形は ことば まるごと。まえの ワールドの 回は かえない", () => {
    expect(focusSay("micro-", ["microscope", "microphone"])).toBe("microscope");
    expect(focusSay("-meter", ["thermometer", "pedometer"])).toBe("thermometer");
    expect(focusSay("-ment", ["experiment", "instrument"])).toBe("experiment");
    expect(focusSay("-tion", ["prediction", "reaction"])).toBe("prediction");
    expect(focusSay("-y", ["sticky", "bumpy"])).toBe("sticky");
    expect(focusSay("pho-tog-ra-phy", ["photography"])).toBe("photography");
    // まえの ワールド（L350 の -y・L495 の -tion）は これまでどおり
    expect(focusSay("-y", ["jumped", "rice", "sunny", "draw"])).toBe("ee");
    expect(focusSay("-tion", ["I'll", "won't", "she'll", "rotation", "vision"])).not.toBe("rotation");
    expect(focusLabel("micro-").main).toBe("micro…");
    expect(focusLabel("-scope").main).toBe("…scope");
    expect(focusLabel("pho-tog-ra-phy").main).toBe("pho・tog・ra・phy");
    expect(focusExampleWord("-meter", ["thermometer"])).toBe("thermometer");
  });
});

describe("ワールド23の フォニックス問題", () => {
  it.skipIf(!hasW23)("理科の パーツ: microscope を ワールド21 の パーツで 問わない", () => {
    const a = q(661, "microscope");
    expect(a.promptJa).toBe("この ことばの micro は どんな いみ？");
    expect(a.display).toBe("microscope（けんびきょう）");
    expect(a.answer).toBe("ちいさい");
    expect(q(663, "thermometer").answer).toBe("はかる どうぐ");
    expect(q(664, "thermostat").answer).toBe("ねつ・あたたかさ");
    expect(q(662, "telescope").explanationJa).toContain("tele（とおく）");
  });

  it.skipIf(!hasW23)("-ment: measurement を ワールド21 の -ment で 問わない", () => {
    const a = q(667, "measurement");
    expect(a.promptJa).toBe("ただしい つづりは どれ？");
    expect(ids(a).sort()).toEqual(["measuremant", "measurement", "measurment"]);
    expect(a.explanationJa).toContain("e は とらずに");
    expect(q(666, "experiment").display).toBe("？（じっけん）");
  });

  it.skipIf(!hasW23)("強勢の 移動: photography を ワールド22 の あいまい母音で 問わない", () => {
    const a = q(671, "photography");
    expect(a.promptJa).toBe("つよく よむ ところは どれ？");
    expect(a.display).toBe("photography（しゃしんを とる こと）　かぞく: PHO-to-graph");
    expect(a.answer).toBe("pho-TOG-ra-phy");
    expect(q(673, "electricity").answer).toBe("e-lec-TRIC-i-ty");
    expect(q(674, "experiment").answer).toBe("ex-PER-i-ment"); // この回は -ment では なく 強勢
  });

  it.skipIf(!hasW23)("-y: cloudy を ワールド10 の y の おとで 問わない", () => {
    const a = q(679, "cloudy");
    expect(a.promptJa).toBe("ただしい ことばは どれ？");
    expect(a.display).toBe("cloud（くも）→ ？（くもりの）");
    expect(q(678, "sunny").explanationJa).toContain("かさねて");
    expect(q(677, "shiny").explanationJa).toContain("e を とって");
  });

  it.skipIf(!hasW23)("-tion: prediction を ワールド17 の -tion で 問わない", () => {
    const a = q(681, "prediction");
    expect(a.promptJa).toBe("ただしい ことばは どれ？");
    expect(a.display).toBe("predict（よそうする）→ ？（よそう）");
    expect(ids(a).sort()).toEqual(["predicsion", "predictian", "prediction"]);
    expect(q(683, "migration").explanationJa).toContain("te を とって");
  });

  it.skipIf(!hasW23)("ワールド23 の フォニックスの ことばは ぜんぶ ワールド23 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 661; n <= 690; n++) {
      for (const it of phonicsItems(n)) {
        expect(w23Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド22 までの 回では ワールド23 の 問題に ならない", () => {
    for (const n of [282, 350, 481, 485, 601, 642, 660]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w23Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
