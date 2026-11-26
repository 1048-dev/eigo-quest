/**
 * ワールド24の フォニックス（地名の 強勢・過去分詞・I've / haven't / she's・over- / under-・im- / in-）の 問題と 表（src/lib/curriculum/w24Phonics.ts）。
 * - 地名は「つよく よむ ところは どれ？」（CAN-a-da / can-A-da / can-a-DA。選択肢は はくの 順の まま）
 * - 過去分詞は「have の あとに くる かたちは どれ？」（seen / saw / see。written は writen も）
 * - 短縮形は「みじかい かたちは どれ？」（I have → I've / Ive / I'have、she has → she's）
 * - over- / under- は「この ことばの over は どんな いみ？」（うえ・こえて・〜すぎる / した / まえ / もう いちど）
 * - im- / in- は「ただしい ことばは どれ？」（possible の はんたい → impossible / inpossible / unpossible）
 * - ワールド23 までの 回では ワールド24 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng } from "@/lib/curriculum/questions";
import { w24Question } from "@/lib/curriculum/phonicsQ/w24";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { contrOf, imInOf, overUnderOf, placeOf, placeSyllables, ppOf, w24Say } from "@/lib/curriculum/w24Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW24 = !!getLesson(720);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド24の つづりの表", () => {
  it("地名: つよい はくを 大文字に。選択肢は はくの 数だけ（はくの 順）。日本の 地名は せつめいが ちがう", () => {
    expect(placeOf("Canada", ["can-a-da"])).toMatchObject({ answer: "CAN-a-da", choices: ["CAN-a-da", "can-A-da", "can-a-DA"], japan: false });
    expect(placeOf("okinawa", ["o-ki-na-wa"])).toMatchObject({ answer: "o-ki-NA-wa", japan: true });
    expect(placeOf("Australia", ["aus-tra-li-a"])!.choices).toHaveLength(4);
    expect(placeOf("Hokkaido", ["hok-kai-do"])!.answer).toBe("hok-KAI-do");
    expect(placeOf("Canada", ["it-a-ly"])).toBeNull(); // focus に はくの 形が なければ 問わない
    expect(placeSyllables("Argentina")).toBe("ar-gen-ti-na");
    expect(placeSyllables("Japan")).toBeNull(); // 2はくの ことばは 入れない
  });

  it("過去分詞: すぎた かたち・もとの かたちが まちがいの 選択肢。t・d を かさねる ことばは かさねない つづりも", () => {
    expect(ppOf("seen")).toMatchObject({ base: "see", past: "saw", wrong: ["saw", "see"], trap: "irregular" });
    expect(ppOf("eaten")).toMatchObject({ wrong: ["ate", "eat"], trap: "en" });
    expect(ppOf("written")).toMatchObject({ wrong: ["wrote", "write", "writen"], trap: "double" });
    expect(ppOf("flown")!.trap).toBe("wn");
    expect(ppOf("swum")!.trap).toBe("irregular");
    expect(["come", "run", "played"].map(ppOf)).toEqual([null, null, null]); // もとの かたちと おなじ・きそくてきな ことばは 入れない
  });

  it("短縮形: ' の ない つづり・きえた もじを のこした つづり。its（その）は まちがいに 出さない", () => {
    expect(contrOf("I've")).toMatchObject({ full: "I have", answer: "I've", wrong: ["Ive", "I'have"], hasS: false });
    expect(contrOf("haven't")!.wrong).toEqual(["havent", "have'nt"]);
    expect(contrOf("she's")).toMatchObject({ full: "she has", hasS: true });
    expect(contrOf("it's")!.wrong).not.toContain("its");
    expect(["I'm", "isn't", "let's"].map(contrOf)).toEqual([null, null, null]); // ワールド15 の 短縮形は ここでは あつかわない
  });

  it("over- / under-: focus に あう パーツだけ。選択肢は 4つで こたえを ふくむ", () => {
    const o = overUnderOf("overnight", ["over-"])!;
    expect(o).toMatchObject({ part: "over", answer: "うえ・こえて・〜すぎる", rest: "night" });
    expect(o.choices).toHaveLength(4);
    expect(overUnderOf("underground", ["under-"])!.answer).toBe("した");
    expect(overUnderOf("underground", ["over-"])).toBeNull();
    expect(overUnderOf("understand", ["under-"])).toBeNull(); // パーツの いみで わからない ことばは 入れない
  });

  it("im- / in-: p の まえは im、それ いがいは in。inpatient の ように ある ことばは まちがいに 出さない", () => {
    expect(imInOf("impossible")).toMatchObject({ base: "possible", prefix: "im", wrong: ["inpossible", "unpossible"] });
    expect(imInOf("invisible")).toMatchObject({ prefix: "in", wrong: ["imvisible", "unvisible"] });
    expect(imInOf("impatient")!.wrong).not.toContain("inpatient");
    expect(["unhappy", "inside", "important"].map(imInOf)).toEqual([null, null, null]);
  });

  it("どの 表の まちがいの 選択肢も こたえと ちがい、かさならない", () => {
    const pps = ["seen", "been", "done", "gone", "eaten", "taken", "given", "spoken", "written", "ridden", "forgotten", "hidden", "flown", "drawn", "grown", "swum"].map((w) => ppOf(w)!);
    const cs = ["I've", "you've", "we've", "they've", "haven't", "hasn't", "she's", "he's", "it's", "who's"].map((w) => contrOf(w)!);
    const ims = ["impossible", "impolite", "imperfect", "impatient", "invisible", "incorrect", "incomplete", "inexpensive", "informal"].map((w) => imInOf(w)!);
    for (const x of [...pps, ...cs, ...ims]) expect(new Set([x.answer, ...x.wrong]).size, x.answer).toBe(1 + x.wrong.length);
  });

  it("フォーカスの ボタン: おわり・はじめ・短縮形は その回の ことば、地名の はくの 形は ことば まるごと。まえの ワールドの 回は かえない", () => {
    expect(focusSay("-een", ["seen", "been", "done", "gone"])).toBe("seen");
    expect(focusSay("-one", ["seen", "been", "done", "gone"])).toBe("done");
    expect(focusSay("-en", ["written", "ridden"])).toBe("written");
    expect(focusSay("'ve", ["I've", "you've"])).toBe("I've");
    expect(focusSay("n't", ["haven't", "hasn't", "I've"])).toBe("haven't");
    expect(focusSay("over-", ["overlook", "underpass"])).toBe("overlook");
    expect(focusSay("under-", ["overlook", "underpass"])).toBe("underpass");
    expect(focusSay("in-", ["impossible", "invisible"])).toBe("invisible");
    expect(focusSay("can-a-da", ["Canada"])).toBe("canada");
    // ワールド15 の 短縮形の 回（L436・L447）は これまでどおり
    expect(focusSay("'s", ["I'm", "he's", "she's", "it's"])).toBe("'s");
    expect(focusSay("n't", ["she's", "isn't", "wearing", "smiling"])).toBe("n't");
    expect(focusLabel("over-").main).toBe("over…");
    expect(focusLabel("-een").main).toBe("…een");
    expect(focusLabel("'ve").main).toBe("…'ve");
    expect(focusLabel("ar-gen-ti-na").main).toBe("ar・gen・ti・na");
    expect(focusExampleWord("under-", ["underwater"])).toBe("underwater");
  });

  it("まえの ワールドの 回では 読み上げを かえない（w24Say は L690 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 691)) {
      for (const f of l.phonics.focus) expect(w24Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
    }
  });
});

describe("ワールド24の フォニックス問題", () => {
  it.skipIf(!hasW24)("地名: Canada を ワールド12 の はくで 問わない", () => {
    const a = q(691, "Canada");
    expect(a.promptJa).toBe("つよく よむ ところは どれ？");
    expect(a.display).toBe("Canada（カナダ）");
    expect(a.answer).toBe("CAN-a-da");
    expect(ids(a)).toEqual(["CAN-a-da", "can-A-da", "can-a-DA"]);
    expect(q(692, "Okinawa").explanationJa).toContain("日本の 地名");
  });

  it.skipIf(!hasW24)("過去分詞: eaten を ブレンドで、written を ワールド14 の だまっている もじで 問わない", () => {
    const a = q(696, "seen");
    expect(a.promptJa).toBe("have の あとに くる かたちは どれ？");
    expect(ids(a).sort()).toEqual(["saw", "see", "seen"]);
    expect(a.display).toBe("I have ＿＿.（see＝みる）");
    expect(q(697, "eaten").explanationJa).toContain("eat → ate → eaten");
    expect(ids(q(698, "written")).sort()).toEqual(["write", "writen", "written", "wrote"]);
    expect(q(699, "swum").answer).toBe("swum");
  });

  it.skipIf(!hasW24)("短縮形: she's を ワールド15 の she is で 問わない", () => {
    const a = q(701, "I've");
    expect(a.promptJa).toBe("みじかい かたちは どれ？");
    expect(a.display).toBe("I have → ？");
    expect(ids(a).sort()).toEqual(["I'have", "I've", "Ive"]);
    expect(q(703, "she's").display).toBe("she has → ？");
    expect(q(703, "she's").explanationJa).toContain("has の みじかい かたち");
    expect(q(702, "haven't").answer).toBe("haven't");
  });

  it.skipIf(!hasW24)("over- / under-: この ことばの over は どんな いみ？", () => {
    const a = q(706, "overlook");
    expect(a.promptJa).toBe("この ことばの over は どんな いみ？");
    expect(a.answer).toBe("うえ・こえて・〜すぎる");
    expect(q(707, "underwater").answer).toBe("した");
    expect(q(709, "overeat").explanationJa).toContain("〜すぎる");
  });

  it.skipIf(!hasW24)("im- / in-: impossible を ワールド18 の un- で 問わない", () => {
    const a = q(714, "impossible");
    expect(a.promptJa).toBe("ただしい ことばは どれ？");
    expect(a.display).toBe("possible（できる）の はんたい → ？（できない・ありえない）");
    expect(ids(a).sort()).toEqual(["impossible", "inpossible", "unpossible"]);
    expect(q(712, "invisible").explanationJa).toContain("in");
  });

  it.skipIf(!hasW24)("ワールド24 の フォニックスの ことばは ぜんぶ ワールド24 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 691; n <= 720; n++) {
      for (const it of phonicsItems(n)) {
        expect(w24Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド23 までの 回では ワールド24 の 問題に ならない", () => {
    for (const n of [436, 447, 540, 601, 661, 690]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w24Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
