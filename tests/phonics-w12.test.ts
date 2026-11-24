/**
 * ワールド12の フォニックス（サイトワード 総復習・5W1H・多音節語・音読）の 問題と、おとの表（src/lib/curriculum/w12Phonics.ts）。
 * - サイトワードは「きこえた ことばは どれ？」（にている つづりから えらぶ）。what / where の wh を ダイグラフで 問わない。
 * - 多音節語は「いくつに わけて よむ？」（ことばを 画面に 出す）。
 * - 音読の 回は まえの ワールドの 問題（マジック e・母音チーム・r の つく母音・-ed・soft c / g・-y・-le・aw au ew）で 問う。
 * - ワールド11 までの 回では ワールド12 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, w12Question } from "@/lib/curriculum/questions";
import { W12_INTRO, syllablesOf, w12Say } from "@/lib/curriculum/w12Phonics";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW12 = !!getLesson(360);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド12の おとの表", () => {
  it("多音節語の まとまり: focus の ハイフンで わける。あわなければ null", () => {
    expect(syllablesOf("basketball", ["bas-ket-ball"])).toEqual(["bas", "ket", "ball"]);
    expect(syllablesOf("Watermelon", ["sun-set", "wa-ter-mel-on"])).toEqual(["wa", "ter", "mel", "on"]);
    expect(syllablesOf("banana", ["bas-ket-ball"])).toBeNull();
    expect(syllablesOf("played", ["-ed"])).toBeNull();
  });

  it("フォーカスの 読み上げ: 多音節語は ことば まるごと。-ed・サイトワードは いままでどおり", () => {
    expect(w12Say("bas-ket-ball")).toBe("basketball");
    expect(focusSay("wa-ter-mel-on")).toBe("watermelon");
    expect(focusSay("sun-set")).toBe("sunset");
    expect(focusSay("-ed", ["played"])).toBe("played");
    expect(focusSay("who")).toBe("who");
    expect(w12Say("-st")).toBeNull();
  });
});

describe("ワールド12の フォニックス問題", () => {
  it.skipIf(!hasW12)("サイトワード: who の 回は にている ことばから えらぶ。what は wh（ダイグラフ）ではなく サイトワードで 問う", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const x = w12Question(item(351, "who"), seededRng(seed))!;
      expect(x.answer).toBe("who");
      expect(x.promptJa).toBe("きこえた ことばは どれ？");
      expect([...ids(x)].sort()).toEqual(["how", "want", "what", "who"]);
      expect(x.explanationJa).toContain("フー");
    }
    const what = q(351, "what");
    expect(what.answer).toBe("what");
    expect(what.display).toBe("🔊");
    expect(q(352, "where").answer).toBe("where");
    expect(q(352, "then").answer).toBe("then"); // th ではなく サイトワードの 回の ことば
  });

  it.skipIf(!hasW12)("サイトワード 総復習: ワールド11 の サイトワード（was, could）も ワールド12 の 回で 問える", () => {
    expect(q(331, "was").answer).toBe("was");
    expect(q(333, "could").answer).toBe("could");
    expect(q(333, "good").answer).toBe("good");
    expect(q(334, "friend").explanationJa).toContain("フレンド");
  });

  it.skipIf(!hasW12)("多音節語: まとまりの かずを 問う（ことばを 画面に 出す・選択肢は ちかい かず 4つ）", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const b = q(336, "basketball", seed);
      expect(b.answer).toBe("3");
      expect(b.display).toBe("basketball");
      expect([...ids(b)].sort()).toEqual(["1", "2", "3", "4"]);
      expect(q(338, "watermelon", seed).answer).toBe("4");
      expect(q(339, "pencil", seed).answer).toBe("2");
    }
    expect([...ids(q(339, "pencil"))].sort()).toEqual(["1", "2", "3", "4"]);
    expect([...ids(q(338, "caterpillar"))].sort()).toEqual(["2", "3", "4", "5"]);
    expect(q(337, "banana").explanationJa).toContain("ba・na・na");
  });

  it.skipIf(!hasW12)("音読の 回は まえの ワールドの 問題で 問う", () => {
    expect(q(341, "wake").answer).toBe("a_e");
    expect(q(342, "train").answer).toBe("ai");
    expect(q(342, "teach").answer).toBe("ea");
    expect(q(343, "school").answer).toBe("oo");
    expect(q(343, "house").answer).toBe("ou");
    expect(q(344, "first").answer).toBe("ir");
    expect(q(346, "watched").answer).toBe("t");
    expect(q(346, "visited").answer).toBe("id");
    expect(q(347, "city").answer).toBe("s");
    expect(q(347, "giant").answer).toBe("j");
    expect(q(348, "fly").answer).toBe("igh");
    expect(q(348, "table").answer).toBe("-le");
    expect(q(349, "drew").answer).toBe("ew");
    // まとめの 回: サイトワード・母音チーム・ar・-ed・多音節語が まざる
    expect(q(360, "because").answer).toBe("because");
    expect(q(360, "rain").answer).toBe("ai");
    expect(q(360, "park").answer).toBe("ar");
    expect(q(360, "played").answer).toBe("d");
    expect(q(360, "basketball").answer).toBe("3");
    expect(q(359, "singer").answer).toBe("-er");
    expect(q(359, "city").answer).toBe("s");
  });

  it.skipIf(!hasW12)("ワールド12の ぜんぶの ことば: 答えは 選択肢に 1つ、選択肢は ちがう もの、さいしょの もじの 問題に ならない", () => {
    for (let n = 331; n <= 360; n++) {
      for (const it of phonicsItems(n)) {
        for (let seed = 1; seed <= 5; seed++) {
          const x = q(n, it.text, seed);
          const c = ids(x);
          expect(x.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
          expect(c.length, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((y) => y === x.answer), `L${n} ${it.text}`).toHaveLength(1);
        }
      }
    }
  });

  it("ワールド11 までの 回では ワールド12の 問題に ならない（L116 の 2つに わける ことばも いままでどおり）", () => {
    expect(W12_INTRO.who).toBe(351);
    for (const n of [1, 116, 300, 306, 330]) {
      for (const it of phonicsItems(n)) expect(w12Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
