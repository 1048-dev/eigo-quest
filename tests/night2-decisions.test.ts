/**
 * Night 2 のオーナー決定（docs/night2/BRIEF.md）の確認。
 *  - お宝アラート 12×2=24（復習クエスト一発 30 より少ない）・かいわ +5（レッスンごとに1回）
 *  - かいわ相手は レッスンごとに Haru → Riko → Kiko → Birimo（その回の 台本で 話す キャラから）
 *  - フォニックスの ボタン: 子どもに わかる 書きかた ＋ おてほんの ことばを 読む
 *  - おためしモードで クリアした レッスンが マップに のる（きょうのまとめ リンク用）
 *  - ワールド名は 1つの もと
 */
import { describe, expect, it } from "vitest";
import { COIN_RULES } from "@/lib/domain/config";
import { mergeRewards, rewardForConversation, rewardForLesson, rewardForTest } from "@/lib/domain/coins";
import { CHARACTER_NAME, CONVERSATION_CHARACTERS, pickConversationPartner } from "@/lib/conversation/engine";
import { LESSONS, getLesson, TOTAL_LESSONS } from "@/lib/curriculum";
import { buildLessonFlow } from "@/lib/curriculum/questions";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { offlineLessonComplete, offlineMap } from "@/lib/offline";
import { parseLocalProgress, toProgressMaps } from "@/lib/offline/localProgress";
import { WORLD_NAMES, worldName, worldNameEn } from "@/lib/game/worlds";
import { readFileSync } from "node:fs";

describe("ごほうび", () => {
  it("お宝アラートは 12×2 = 24 で、復習クエスト一発（30）より少ない", () => {
    const r = rewardForTest({ kind: "TREASURE", passed: true, score: 1, isFirstAttempt: true, alreadyPassed: false, viaTreasureAlert: true });
    expect(r.total).toBe(24);
    expect(r.total).toBeLessThan(COIN_RULES.dailyCheckFirstTry);
  });

  it("かいわを さいごまで → +5。とばした・もらいずみ → 0", () => {
    expect(rewardForConversation({ finished: true, alreadyRewarded: false }).total).toBe(5);
    expect(rewardForConversation({ finished: false, alreadyRewarded: false }).total).toBe(0);
    expect(rewardForConversation({ finished: true, alreadyRewarded: true }).total).toBe(0);
  });

  it("レッスン完了の ごほうびに かいわの分を たせる（おためしモードの 表示も）", () => {
    const m = mergeRewards(rewardForLesson({ alreadyCompleted: false }), rewardForConversation({ finished: true, alreadyRewarded: false }));
    expect(m.total).toBe(15);
    expect(offlineLessonComplete(1, { conversationFinished: true }).reward.total).toBe(15);
    expect(offlineLessonComplete(1).reward.total).toBe(10);
  });

  it("きょうのまとめは 5コインのまま", () => {
    expect(COIN_RULES.recapWatched).toBe(5);
  });
});

describe("かいわ相手の ローテーション", () => {
  const partnerOf = (n: number) => {
    const step = buildLessonFlow(getLesson(n)!).find((s) => s.kind === "conversation");
    return step && step.kind === "conversation" ? step.character : undefined;
  };

  it("4人 全員が かいわ相手に なる（かたよりすぎない）", () => {
    const count = new Map<string, number>();
    for (const l of LESSONS) {
      const p = partnerOf(l.lessonNo)!;
      count.set(p, (count.get(p) ?? 0) + 1);
    }
    for (const c of CONVERSATION_CHARACTERS) expect(count.get(c) ?? 0, c).toBeGreaterThan(TOTAL_LESSONS / 12);
  });

  it("相手は その回の 台本で 話している キャラ（台本に いれば）", () => {
    for (const l of LESSONS) {
      const conv = l.conversation!;
      const speakers = conv.lines.map((x) => x.speaker);
      const kids = CONVERSATION_CHARACTERS.filter((c) => speakers.includes(CHARACTER_NAME[c]));
      if (kids.length === 0) continue;
      expect(kids, `L${l.lessonNo}`).toContain(partnerOf(l.lessonNo));
    }
  });

  it("さいしょの ひとことが「I'm ○○」なら その キャラ", () => {
    for (const l of LESSONS) {
      const m = /\bI'?m (Haru|Riko|Kiko|Birimo)\b/.exec(l.conversation?.aiTask.starterEn ?? "");
      if (m) expect(CHARACTER_NAME[partnerOf(l.lessonNo)!], `L${l.lessonNo}`).toBe(m[1]);
    }
  });

  it("3人称で 出てくる キャラ（Birimo's birthday）は 相手に しない", () => {
    const conv = { scene: "", sceneJa: "", lines: [{ speaker: "Birimo", en: "", ja: "" }, { speaker: "Riko", en: "", ja: "" }], aiTask: { goalJa: "", starterEn: "Today is Birimo's birthday!", targetExpressions: [] } };
    expect(pickConversationPartner(4, conv)).toBe("riko");
  });

  it("台本が ない・先生だけ → じゅんばんの キャラ", () => {
    expect(pickConversationPartner(1, null)).toBe("haru");
    expect(pickConversationPartner(2, null)).toBe("riko");
    const emmaOnly = { scene: "", sceneJa: "", lines: [{ speaker: "Ms. Emma", en: "", ja: "" }], aiTask: { goalJa: "", starterEn: "Hello!", targetExpressions: [] } };
    expect(pickConversationPartner(4, emmaOnly)).toBe("birimo");
  });
});

describe("フォニックスの ボタン", () => {
  it("子どもに わかる 書きかた（a_e や -st を そのまま 出さない）", () => {
    expect(focusLabel("a_e")).toEqual({ main: "a…e", hintJa: "マジック e" });
    expect(focusLabel("-st")).toEqual({ main: "…st", hintJa: "おわりの おと" });
    expect(focusLabel("sun-set").main).toBe("sun・set");
    expect(focusLabel("sh")).toEqual({ main: "sh", hintJa: "" });
    expect(focusLabel("n't")).toEqual({ main: "…n't", hintJa: "みじかい かたち" });
    expect(focusLabel("'re").main).toBe("…'re");
  });

  it("おしたら おてほんの ことばを 読む（rain, bird, saw）", () => {
    expect(focusExampleWord("ai", ["rain", "mail"])).toBe("rain");
    expect(focusExampleWord("ir", [])).toBe("bird");
    expect(focusExampleWord("aw", [])).toBe("saw");
    expect(focusExampleWord("a_e", ["cake", "game"])).toBe("cake");
    expect(focusExampleWord("-st", ["nest", "best"])).toBe("nest");
    expect(focusExampleWord("s", ["sun", "sock", "ant"])).toBe("sun");
    expect(focusExampleWord("a", ["sun", "sock", "ant"])).toBe("ant");
    expect(focusExampleWord("sun-set", ["sunset"])).toBe("sunset");
    expect(focusExampleWord("was", ["are", "was"])).toBe("was");
  });

  it("全レッスンの ボタンが ことば（英字だけ）を 読み、記号を 見せない", () => {
    for (const l of LESSONS) {
      for (const f of l.phonics.focus) {
        // ワールド15 の 短縮形（I'm, isn't）は ことばの なかの ' だけ OK（読み上げは ふつうに よめる）
        // ワールド21 の 音の つながり（hold on, check it out）は フレーズ まるごと（スペースで くぎった 英字）
        expect(focusExampleWord(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z]+('[A-Za-z]+)?( [A-Za-z]+)*$/);
        expect(focusLabel(f).main, `L${l.lessonNo} ${f}`).not.toMatch(/[_]|^-/);
      }
    }
  });
});

describe("おためしモードの きろく（この ブラウザだけ）", () => {
  it("こわれた値は 「なにも ない」", () => {
    expect(parseLocalProgress(null)).toEqual({ lessons: {}, tests: {} });
    expect(parseLocalProgress("{oops")).toEqual({ lessons: {}, tests: {} });
    expect(parseLocalProgress(JSON.stringify({ lessons: { 1: 5 }, tests: [] }))).toEqual({ lessons: {}, tests: {} });
  });

  it("Lesson 1 を クリア → マップで CLEARED、Lesson 2 が いまの クエスト", () => {
    const p = parseLocalProgress(JSON.stringify({ lessons: { 1: "2026-11-25" }, tests: {} }));
    expect(toProgressMaps(p).completedLessons.get(1)).toBe("2026-11-25");
    const m = offlineMap(new Date("2026-11-25T10:00:00+09:00"), p);
    expect(m.nodes.find((n) => n.key === "L-1")?.status).toBe("CLEARED");
    expect(m.current?.key).toBe("L-2");
    expect(m.offline).toBe(true);
  });

  it("きろくが なければ いままでどおり Lesson 1 から", () => {
    expect(offlineMap().current?.key).toBe("L-1");
  });
});

describe("ワールド名", () => {
  it("40ワールドに 1つずつ 名前があり、計画書の 表と おなじ（1〜12: curriculum-plan.md、13〜40: curriculum-6year.md §4）", () => {
    expect(Object.keys(WORLD_NAMES)).toHaveLength(40);
    const plan = readFileSync("docs/curriculum-plan.md", "utf8");
    for (let w = 1; w <= 12; w++) expect(plan, worldName(w)).toContain(`| ${w} ${worldName(w)} |`);
    const plan6 = readFileSync("docs/curriculum-6year.md", "utf8");
    for (let w = 13; w <= 40; w++) expect(plan6, worldName(w)).toMatch(new RegExp(`\\| ${w} \\| [0-9〜]+ \\| [2-5] \\| ${worldName(w)} \\| ${worldNameEn(w)} \\|`));
    expect(new Set(Object.values(WORLD_NAMES)).size).toBe(40);
    expect(worldName(99)).toBe("ワールド99");
  });
});
