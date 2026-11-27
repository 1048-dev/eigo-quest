/**
 * run10 Phase 2: すべての データの 確認（scripts/lib/dataCheck.ts）と、その 確認で 見つけて なおした ものの 再発ふせぎ。
 * ぜんぶの 確認（seed 5 つ・python の PDF つき）は npm run check:data。ここでは seed 1 つで「問題 0」を たしかめる。
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getItem, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { buildLessonFlow, buildTestQuestions, makeQuestion, seededRng, type Question } from "@/lib/curriculum/questions";
import { spokenPhonicsWord } from "@/lib/curriculum/phonicsButtons";
import { getAssessment } from "@/lib/curriculum";
import { buildRecapScript } from "@/lib/recap/script";
import { concreteTarget, fillTemplate, redactPersonalInfo, scriptedReply, targetVariants, usedTargets } from "@/lib/conversation/engine";
import { themeConversation } from "@/lib/library/talk";
import type { TalkTheme } from "@/lib/library/types";
import talkRaw from "@content/library/talk.json";
import {
  conversationProblems, firstSoundWords, phonicsAnswerProblems, pyConstants, questionProblems, reportMarkdown, runDataChecks, spellingProblems,
  storyWordInText, summarize,
} from "../scripts/lib/dataCheck";

const TALK_ANYTHING = (talkRaw as { themes: TalkTheme[] }).themes.find((t) => t.id === "t-anything")!;
const PY = readFileSync(path.join(__dirname, "..", "worksheets", "generate_worksheets.py"), "utf8");

describe("データの 確認: ぜんぶ（seed 1 つ）", () => {
  it("1,200 レッスン・すべての テスト・先生・まとめ・かいわ・ワークブック・としょかん・力だめしに 問題が ない", async () => {
    const sections = await runDataChecks({ seeds: [1], worksheetPy: PY });
    const bad = sections.flatMap((s) => s.problems.slice(0, 20).map((p) => `[${s.name}] ${p}`));
    expect(bad).toEqual([]);
    const by = Object.fromEntries(sections.map((s) => [s.name, s.counts]));
    expect(by.lessons["レッスン"]).toBe(1200);
    expect(by.tests["TREASURE"]).toBe(1200);
    expect(by.tests["DAILY_CHECK"]).toBe(1200);
    expect(by.worksheets["パック"]).toBe(60);
    expect(by.library["おはなし"]).toBeGreaterThanOrEqual(100);
    expect(by.yearly["ステージ"]).toBe(5);
    expect(summarize(sections)).toMatch(/問題の ある データ 0$/);
    expect(reportMarkdown(sections, [1], 1000)).toContain("| しらべた もの |");
  }, 300_000);
});

describe("データの 確認: 見つける 力（わざと こわした データ）", () => {
  const base: Question = { id: "q0", itemId: "L001-W-hello", type: "meaning_choose", skill: "VOCABULARY", promptJa: "いみを えらんでね", audioText: "hello", display: "hello",
    choices: [{ id: "a", label: "こんにちは" }, { id: "b", label: "さようなら" }, { id: "c", label: "ありがとう" }], answer: "a", explanationJa: "hello ＝ こんにちは" };
  const item = getItem("L001-W-hello");

  it("ふつうの 問題は OK（L001-W-hello が ある）", () => {
    expect(item).toBeTruthy();
    expect(questionProblems({ ...base, choices: base.choices!.map((c, i) => (i === 0 ? { ...c, label: item!.ja } : c)) }, "t")).toEqual([]);
  });
  it("正解が 選択肢に ない・選択肢が かさなる・2択・解説なし・音声なし・undefined を 見つける", () => {
    const ok = { ...base, choices: base.choices!.map((c, i) => (i === 0 ? { ...c, label: item!.ja } : c)) };
    expect(questionProblems({ ...ok, answer: "d" }, "t").join()).toMatch(/選択肢.*に ない/);
    expect(questionProblems({ ...ok, choices: [...ok.choices!.slice(0, 2), { id: "c", label: ok.choices![1].label }] }, "t").join()).toMatch(/かさなる/);
    expect(questionProblems({ ...ok, choices: ok.choices!.slice(0, 2) }, "t").join()).toMatch(/2つ/);
    expect(questionProblems({ ...ok, explanationJa: " " }, "t").join()).toMatch(/解説/);
    expect(questionProblems({ ...ok, audioText: undefined }, "t").join()).toMatch(/audioText/);
    expect(questionProblems({ ...ok, audioText: "1600" }, "t").join()).toMatch(/audioText/);
    expect(questionProblems({ ...ok, promptJa: "「undefined」を英語にすると？" }, "t").join()).toMatch(/undefined/);
    expect(questionProblems({ ...ok, choices: ok.choices!.map((c, i) => (i === 0 ? { ...c, label: "ちがう" } : c)) }, "t").join()).toMatch(/意味/);
  });
  it("スペル: 打てない 文字・お手本どおりで 合格・全角でも 合格", () => {
    expect(spellingProblems("I'm Ken.", { text: "I'm Ken." })).toEqual([]);
    expect(spellingProblems("café", { text: "café" }).join()).toMatch(/打てない/);
    expect(spellingProblems("Hi ― Ken", { text: "Hi ― Ken" }).join()).toMatch(/打てない/);
  });
  it("フォニックス: 正解の つづりが ことばに ない・大文字の 正解を 見つける", () => {
    const ph = getItem(itemsOfLesson(getLesson(1)!).find((i) => i.kind === "PHONICS")!.id)!;
    const q = { ...base, type: "phonics_sound" as const, itemId: ph.id, promptJa: "さいしょの おとは どれ？" };
    expect(phonicsAnswerProblems(q, ph, ph.text[0])).toEqual([]);
    expect(phonicsAnswerProblems(q, ph, "z").join()).toMatch(/はじまらない/);
    expect(phonicsAnswerProblems(q, { ...ph, text: "June" }, "J").join()).toMatch(/大文字/);
  });
  it("かいわ: 目標の お手本に ～ が のこる 台本を 見つける", () => {
    const conv = { scene: "x", sceneJa: "x", lines: [{ speaker: "Haru", en: "Hello!", ja: "こんにちは" }, { speaker: "Riko", en: "Hi!", ja: "やあ" }],
      aiTask: { goalJa: "あいさつ", starterEn: "Hello!", targetExpressions: ["I like ～."] } };
    expect(conversationProblems(conv, "t", 1).problems.join()).toMatch(/～ が のこる/);
  });
  it("としょかん: あたらしい ことばの 書きかた（/ や ( ) ）", () => {
    expect(storyWordInText("forget (forgot)", "I forgot my bag.")).toBe(true);
    expect(storyWordInText("some / any", "Do you have any milk?")).toBe(true);
    expect(storyWordInText("If I find ..., I'll ...", "If I find it, I'll tell you.")).toBe(true);
    expect(storyWordInText("be made from", "It is made from milk.")).toBe(true);
    expect(storyWordInText("diary", "I like cats.")).toBe(false);
  });
});

describe("run10 Phase 2 で なおした もの（再発ふせぎ）", () => {
  it("その回の 表現が 2つ だけでも 英文を えらぶ 問題は 4択（まえの レッスンの 表現で うめる）", () => {
    const l5 = getLesson(5)!;
    const items = itemsOfLesson(l5);
    const e = items.find((i) => i.kind === "EXPRESSION")!;
    expect(items.filter((i) => i.kind === "EXPRESSION").length).toBe(2);
    for (const seed of [1, 2, 3]) {
      const q = makeQuestion(e, "expression_choose", items, seededRng(seed), 0);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices!.map((c) => c.label)).size).toBe(4);
      expect(q.choices!.find((c) => c.id === q.answer)!.label).toBe(e.text);
      // うめた 選択肢は もう ならった レッスン（L1〜5）の 表現だけ
      for (const c of q.choices!) expect(itemsOfLesson(getLesson(1)!).concat(...[2, 3, 4, 5].map((n) => itemsOfLesson(getLesson(n)!))).some((i) => i.kind === "EXPRESSION" && i.text === c.label)).toBe(true);
    }
    // 復習クエスト（範囲が 1レッスン）でも
    const qs = buildTestQuestions(getAssessment("check-5")!, { seed: 1 });
    for (const q of qs.filter((x) => x.type === "expression_choose")) expect(q.choices).toHaveLength(4);
  });

  it("年号・数の フォニックスは 英語の 読みかたで 読み上げる（1600 → sixteen hundred）", () => {
    const l906 = getLesson(906)!;
    expect(spokenPhonicsWord("1600", l906.phonics.focus, l906.phonics.words)).toBe("sixteen hundred");
    expect(spokenPhonicsWord("castle", l906.phonics.focus, l906.phonics.words)).toBe("castle");
    expect(spokenPhonicsWord("3/4", ["3/4"], ["3/4"])).toBe("three quarters");
    // 問題（ワールド31 の 年号）
    const it1600 = itemsOfLesson(l906).find((i) => i.text === "1600")!;
    const q = makeQuestion(it1600, "phonics_sound", itemsOfLesson(l906), seededRng(1), 0);
    expect(q.audioText).toBe("sixteen hundred");
    // レッスンの フォニックスの ボタン
    const step = buildLessonFlow(l906).find((s) => s.kind === "phonics");
    expect(step && step.kind === "phonics" && step.spoken?.[step.words.indexOf("1600")]).toBe("sixteen hundred");
    // まとめ動画
    const seg = buildRecapScript(l906).segments.find((s) => s.section === "phonics" && s.letters?.join() === "1600");
    expect(seg?.en).toBe("sixteen hundred");
  });

  it("年号の 入った 目標の 表現を 言えば「つかった」に なる（個人情報の 伏せ字の あとでも）", () => {
    const conv = getLesson(906)!.conversation!;
    const t = conv.aiTask.targetExpressions.find((x) => /\d{3,}/.test(x))!;
    expect(t).toBeTruthy();
    const said = concreteTarget(t, conv);
    expect(usedTargets(said, [t])).toEqual([t]);
    expect(usedTargets(redactPersonalInfo(said), [t])).toEqual([t]);
    expect(scriptedReply({ conversation: conv, history: [], childText: said }).usedTarget).toBe(true);
    // 電話番号などは あいかわらず 伏せる
    expect(redactPersonalInfo("my number is 090-1234-5678")).toBe("my number is ***");
    // ちがう 年号では「つかった」に しない わけでは ない（年号は 伏せて くらべる）が、ちがう 文では つかった ことに ならない
    expect(usedTargets("I like pizza.", [t])).toEqual([]);
  });

  it("かいわの お手本: 台本に ない 形は 学校の 表現・aiTask.examples・形の あてはめで つくる（「It's in ....」と 出さない）", () => {
    // 台本は "Is it in the box?" だけ → 学校の 表現 "It's in the box." を つかう
    const l47 = getLesson(47)!.conversation!;
    expect(l47.aiTask.examples).toContain("It's in the box.");
    expect(concreteTarget("It's in ～.", l47)).toBe("It's in the box.");
    // "He / She is a ～." は どちらか 一方で
    expect(targetVariants("He / She is a ～.")).toEqual(["He is a ～.", "She is a ～."]);
    expect(targetVariants("～ is ～ing behind / next to / between ～.")).toEqual(["～ is ～ing behind ～.", "～ is ～ing next to ～.", "～ is ～ing between ～."]);
    expect(targetVariants("～ is / are ～ing.")).toEqual(["～ is ～ing.", "～ are ～ing."]);
    const l204 = getLesson(204)!.conversation!;
    expect(concreteTarget("He / She is a ～.", l204)).toBe("She is a zookeeper!");
    expect(usedTargets("She is a zookeeper!", ["He / She is a ～."])).toHaveLength(1);
    // 形の あてはめ（名前 → 代名詞・a / an・～ing）
    expect(fillTemplate("He has ～.", "Birimo has a new map.", new Set(["Birimo"]))).toBe("He has a new map.");
    expect(fillTemplate("They ～ed.", "Long ago, people painted pictures.", new Set(["Riko"]))).toBeNull();
    expect(fillTemplate("They ～ed.", "The people clapped.", new Set(["Riko"]))).toBeNull();
    expect(fillTemplate("～ is ～ing.", "Haru is running.")).toBe("Haru is running.");
    expect(fillTemplate("It's a ～.", "I know! It's an apple!")).toBe("I know! It's an apple!");
    expect(fillTemplate("Does she ～?", "She works at the bakery.")).toBeNull();
    // 「～ is ～ing.」は ～ の まえが ないので 形で 判定（今までは "is ing" の ならびを さがして いたので ぜったい 判定されなかった）
    expect(usedTargets("Haru is running.", ["～ is ～ing."])).toHaveLength(1);
    expect(usedTargets("Haru is a boy.", ["～ is ～ing."])).toHaveLength(0);
    expect(usedTargets("It's an apple.", ["It's a ～."])).toHaveLength(1);
    // run10 で JSON に 足した お手本（台本にも 学校の 表現にも ない 形）
    expect(concreteTarget("She can ～.", getLesson(230)!.conversation!)).toBe("She can help sick people.");
    expect(concreteTarget("I think ～.", themeConversation(TALK_ANYTHING))).toBe("I think it's fun.");
  });

  it("ワークブックの「さいしょの 音」: 英字だけの ことば・こたえは 小文字（python と おなじ きまり）", () => {
    expect(firstSoundWords(["June", "I'm", "1600", "\"Run!\" cried the knight.", "the 1990s", "ship", "cheer up"])).toEqual(["June", "I'm", "ship", "cheer up"]);
    expect(PY).toContain(`FIRST_SOUND_WORD = re.compile(r"^[A-Za-z][A-Za-z' -]*$")`);
    expect(PY).toContain("first = w[0].lower()");
    expect(PY).toContain("{p.text[0].lower()}");
    expect(PY).not.toMatch(/→ \{w\[0\]\}/);
    expect(pyConstants(PY)).toMatchObject({ MINI_EVERY: 5, BOSS_EVERY: 30, MINI_QUESTIONS: 15, BOSS_QUESTIONS: 30, LESSONS_PER_PACK: 20 });
  });

  it("npm run check:data が ある（npm run check:all の Phase 2）", () => {
    const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8")) as { scripts: Record<string, string> };
    expect(pkg.scripts["check:data"]).toBe("tsx scripts/data-check.ts");
  });
});
