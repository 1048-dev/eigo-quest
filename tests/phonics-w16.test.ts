/**
 * ワールド16の フォニックス（-ed の つづり・ふきそくな 過去形・-ed の 3つの おと）の 問題と 表（src/lib/curriculum/w16Phonics.ts）。
 * - -ed は「ed を つけた ただしい つづりは？」（stop → stopped / stoped / stopeed、cry → cried / cryed / cryied）
 * - ふきそくな 過去形は「すぎた ことの かたちは？」（sing → sang / singed / sanged、buy → bought / buyed / baught）
 * - rule が "ed-sounds" の 回は「おわりの -ed は どの おと？」（ト / ド / イド）
 * - ワールド15 までの 回では ワールド16 の 問題に ならない。
 */
import { describe, expect, it } from "vitest";
import { getLesson, itemsOfLesson } from "@/lib/curriculum";
import { makeQuestion, seededRng, w16Question } from "@/lib/curriculum/questions";
import { edSpelling, irregularPast, regularEd } from "@/lib/curriculum/w16Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW16 = !!getLesson(480);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);

describe("ワールド16の つづりの表", () => {
  it("-ed: d だけ・子音を 重ねる・y を i に・そのまま", () => {
    expect(edSpelling("liked")).toEqual({ answer: "liked", wrong: ["likeed", "likked"], base: "like", kind: "drop-e" });
    expect(edSpelling("stopped")).toEqual({ answer: "stopped", wrong: ["stoped", "stopeed"], base: "stop", kind: "double" });
    expect(edSpelling("cried")).toEqual({ answer: "cried", wrong: ["cryed", "cryied"], base: "cry", kind: "y-i" });
    expect(edSpelling("studied")?.base).toBe("study");
    expect(edSpelling("walked")).toEqual({ answer: "walked", wrong: ["walkked", "walkt"], base: "walk", kind: "plain" });
    expect(edSpelling("played")?.wrong).toEqual(["playyed", "playd"]);
    expect(edSpelling("wanted")?.wrong).toEqual(["wantted", "wantid"]);
    // agreed のような e の つづく ことば、-ed で おわらない ことば、みじかい ことばは 出さない
    expect(["agreed", "red", "used", "walk"].map(edSpelling)).toEqual([null, null, null, null]);
  });

  it("ふきそくな 過去形: きそくどおりの -ed と、もう一度 ed（ought / aught は いれかえ）を まちがいに する", () => {
    expect(irregularPast("sang")).toEqual({ base: "sing", answer: "sang", wrong: ["singed", "sanged"], kind: "i-a" });
    expect(irregularPast("swam")?.wrong).toEqual(["swimmed", "swamed"]);
    expect(irregularPast("wrote")).toEqual({ base: "write", answer: "wrote", wrong: ["writed", "wroted"], kind: "o-e" });
    expect(irregularPast("flew")).toEqual({ base: "fly", answer: "flew", wrong: ["flied", "flewed"], kind: "ew" });
    expect(irregularPast("bought")).toEqual({ base: "buy", answer: "bought", wrong: ["buyed", "baught"], kind: "ought" });
    expect(irregularPast("caught")).toEqual({ base: "catch", answer: "caught", wrong: ["catched", "cought"], kind: "aught" });
    expect(irregularPast("walked")).toBeNull();
    expect(regularEd("begin")).toBe("beginned");
    expect(regularEd("give")).toBe("gived");
  });
});

describe("ワールド16の フォニックス問題", () => {
  it.skipIf(!hasW16)("-ed の つづり: もとの 形を 出して、ただしい つづりを えらぶ", () => {
    const a = q(453, "stopped");
    expect(a.display).toBe("stop → ？");
    expect(a.answer).toBe("stopped");
    expect(ids(a).sort()).toEqual(["stoped", "stopeed", "stopped"]);
    expect(q(452, "cried").explanationJa).toContain("y を i");
    expect(q(451, "lived").explanationJa).toContain("d だけ");
  });

  it.skipIf(!hasW16)("ふきそくな 過去形: i → a・o…e・ew・ought / aught", () => {
    expect(q(456, "sang").display).toBe("sing → ？");
    expect(ids(q(456, "sang")).sort()).toEqual(["sang", "sanged", "singed"]);
    expect(q(461, "wrote").answer).toBe("wrote");
    expect(q(461, "wrote").promptJa).toBe("すぎた ことの かたちは どれ？");
    expect(q(463, "knew").display).toBe("know → ？");
    expect(ids(q(466, "bought"))).toContain("baught");
    expect(ids(q(467, "caught"))).toContain("cought");
    // ふりかえりの 回は ことばに あう focus で 問う
    expect(q(460, "stopped").answer).toBe("stopped");
    expect(q(460, "swam").answer).toBe("swam");
    expect(q(480, "thought").display).toBe("think → ？");
  });

  it.skipIf(!hasW16)("ed-sounds の 回は -ed の おと（ト / ド / イド）で 問う", () => {
    expect(q(471, "jumped").answer).toBe("t");
    expect(q(471, "played").answer).toBe("d");
    expect(q(471, "wanted").answer).toBe("id");
    expect(q(472, "laughed").answer).toBe("t");
    expect(q(473, "cried").answer).toBe("d");
    expect(q(474, "needed").answer).toBe("id");
    expect(ids(q(474, "opened")).sort()).toEqual(["d", "id", "t"]);
    // ふりかえりの 回（rule: review）の -ed は つづりの 問題
    expect(q(475, "nodded").display).toBe("nod → ？");
  });

  it.skipIf(!hasW16)("ワールド16の ぜんぶの ことば: ワールド16 の 問題に なり、答えは 選択肢に 1つ、選択肢は ちがう もの", () => {
    for (let n = 451; n <= 480; n++) {
      for (const it of phonicsItems(n)) {
        expect(w16Question(it, seededRng(1)), `L${n} ${it.text}`).not.toBeNull();
        for (let seed = 1; seed <= 5; seed++) {
          const x = q(n, it.text, seed);
          const c = ids(x);
          expect(x.promptJa, `L${n} ${it.text}`).not.toBe("さいしょの おとは どれ？");
          expect(c.length, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(new Set(c).size, `L${n} ${it.text}: ${c}`).toBe(c.length);
          expect(c.filter((y) => y === x.answer), `L${n} ${it.text}`).toHaveLength(1);
          if (x.display?.includes("→")) expect(x.display.includes(x.answer), `L${n} ${it.text}`).toBe(false);
        }
      }
    }
  });

  it("ワールド15 までの 回では ワールド16 の 問題に ならない", () => {
    for (const n of [151, 301, 421, 450]) {
      const l = getLesson(n);
      if (!l) continue;
      for (const it of itemsOfLesson(l).filter((i) => i.kind === "PHONICS")) expect(w16Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
