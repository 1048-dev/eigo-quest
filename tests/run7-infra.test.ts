/**
 * run7 Phase 2: 1,200 レッスンに むけた しくみ。
 *  - ワールドごとの JSON と 小さな 索引（サーバーは 全部、ブラウザは あとから ワールドごと）
 *  - ステージ・レベル・学校の英語「○○ まで修了」・覚えた ことば
 *  - 1か月ワークブックは 20 レッスンごと
 *  - テスト定義・マップは ワールドの数に よらず 動く（40 ワールド = 1,200 レッスンでも）
 *  - マップは いまの ワールドの まわりだけ 描く
 */
import { describe, expect, it, vi } from "vitest";
import {
  ALL_ITEMS, ASSESSMENTS, CURRICULUM_WORLDS, LESSONS, TOTAL_LESSONS, buildAssessments, countWordsLearned, ensureLessonsLoaded,
  gateTestAfterLesson, getAssessment, getItem, getLesson, isWorldLoaded, itemsInRange, reviewQuestFor, worldsInRange,
} from "@/lib/curriculum";
import {
  LESSONS_PER_MONTH_PACK, SCHOOL_MILESTONES, STAGES, levelOfLesson, levelOfWorld, monthPack, monthPackCount, monthPackOfLesson,
  schoolGradeCompleted, stageOfLesson, stageOfWorld,
} from "@/lib/curriculum/stages";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import { buildStageMap } from "@/lib/domain/progression";
import { WORLD_COUNT, worldName } from "@/lib/game/worlds";
import { buildMonthlyReport } from "@/lib/report/monthlyReport";
import { worksheetKey } from "@/lib/report/storage";
import { THEMED_WORLDS, themeOfWorld, visibleWorldRange } from "@/components/map/WorldMap";
import type { AssessmentDef } from "@/lib/domain/types";

describe("ステージ・レベル（docs/curriculum-6year.md §2・§10）", () => {
  it("ステージの区切り: 1 = W1〜12、2 = W13〜20、3 = W21〜28、4 = W29〜35、5 = W36〜40", () => {
    expect(STAGES.map((s) => s.worlds)).toEqual([[1, 12], [13, 20], [21, 28], [29, 35], [36, 40]]);
    expect([1, 12, 13, 20, 21, 28, 29, 35, 36, 40].map(stageOfWorld)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
    expect([1, 360, 361, 600, 601, 840, 841, 1050, 1051, 1200].map(stageOfLesson)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });

  it("レベルは ワールドが すすむと 下がらない（Pre-A1 → B1+）", () => {
    const order = ["Pre-A1", "A1", "A1+", "A2", "A2+", "B1", "B1+"];
    const ranks = Array.from({ length: WORLD_COUNT }, (_, i) => order.indexOf(levelOfWorld(i + 1)));
    expect(ranks.every((r) => r >= 0)).toBe(true);
    for (let i = 1; i < ranks.length; i++) expect(ranks[i], `W${i + 1}`).toBeGreaterThanOrEqual(ranks[i - 1]);
    expect(levelOfLesson(1)).toBe("Pre-A1");
    expect(levelOfLesson(1200)).toBe("B1+");
  });
});

describe("学校の英語「○○ まで修了」（§6）", () => {
  it("そのレッスンを 修了した時点で 表示が すすむ", () => {
    expect(schoolGradeCompleted(0).completedJa).toBeNull();
    expect(schoolGradeCompleted(29).completedJa).toBeNull();
    expect(schoolGradeCompleted(30).completedJa).toBe("小1");
    expect(schoolGradeCompleted(329).completedJa).toBe("小5");
    expect(schoolGradeCompleted(330).lineJa).toBe("学校の英語: 小6 の内容まで修了");
    expect(schoolGradeCompleted(360).next).toEqual({ lessonNo: 480, labelJa: "中1" });
    expect(schoolGradeCompleted(630).completedJa).toBe("中2");
    expect(schoolGradeCompleted(1200).lineJa).toBe("学校の英語: 高校卒業程度の会話レベルに とうたつ");
    expect(schoolGradeCompleted(1200).next).toBeNull();
  });

  it("めやすの 表は レッスン番号の 小さい順", () => {
    const ns = SCHOOL_MILESTONES.map((m) => m.lessonNo);
    expect(ns).toEqual([...ns].sort((a, b) => a - b));
    expect(ns[ns.length - 1]).toBe(1200);
  });
});

describe("1か月ワークブック（20 レッスンごと）", () => {
  it("No.1 = L1〜20、No.2 = L21〜40 …、1,200 レッスンで 60 冊", () => {
    expect(LESSONS_PER_MONTH_PACK).toBe(20);
    expect(monthPack(1)).toEqual({ pack: 1, start: 1, end: 20 });
    expect(monthPackOfLesson(20).pack).toBe(1);
    expect(monthPackOfLesson(21)).toEqual({ pack: 2, start: 21, end: 40 });
    expect(monthPackCount(360)).toBe(18);
    expect(monthPackCount(1200)).toBe(60);
    expect(worksheetKey(2)).toBe("worksheets/monthly/month-02.pdf");
  });

  it("レポートは つぎに 進む レッスンの 冊を 同封する。ステージ・学校の英語・覚えた ことばが 入る", () => {
    const completed = new Map(Array.from({ length: 30 }, (_, i) => [i + 1, "2026-11-10"] as const));
    const r = buildMonthlyReport({
      child: { id: "c", nickname: "テスト", streakDays: 1, longestStreak: 3, lastStudyDate: "2026-11-10" },
      month: "2026-11", completedLessons: completed, attempts: [],
      mastery: { scores: { SCHOOL_TEST: 50, PHONICS: 50, LISTENING: 50, SPEAKING: 50, VOCABULARY: 50, WRITING: 50 }, overall: 50, coverage: 1, weakestItemIds: [] },
      now: new Date("2026-12-01T00:00:00Z"),
    });
    expect(r.pack).toBe(2); // つぎは L31 → No.2（L21〜40）
    expect([r.packStart, r.packEnd]).toEqual([21, 40]);
    expect(r.stage).toBe(1);
    expect(r.level).toBe("Pre-A1");
    expect(r.schoolLineJa).toBe("学校の英語: 小1 の内容まで修了");
    expect(r.wordsLearned).toBe(countWordsLearned(completed.keys()));
    expect(r.wordsLearned).toBeGreaterThan(50);
  });
});

describe("おうちの方ページの「いま どこ？」", () => {
  it("ステージ・レベル・学校の英語・覚えた ことば", async () => {
    const { curriculumStatus } = await import("@/lib/services/parentService");
    expect(curriculumStatus(new Map())).toMatchObject({ stage: 1, stageNameJa: "はじまりの旅", level: "Pre-A1", schoolCompletedJa: null, wordsLearned: 0 });
    const done = new Map(Array.from({ length: 330 }, (_, i) => [i + 1, "2026-11-01"] as const));
    const s = curriculumStatus(done);
    expect(s).toMatchObject({ stage: 1, level: "A1", schoolCompletedJa: "小6", schoolLineJa: "学校の英語: 小6 の内容まで修了" });
    expect(s.wordsLearned).toBe(countWordsLearned(done.keys()));
    // とちゅうが 抜けていたら、抜けた ところまでで 数える（進み方は 1 から順番）
    const gap = new Map([[1, "x"], [2, "x"], [40, "x"]] as const);
    expect(curriculumStatus(gap).schoolCompletedJa).toBeNull();
  });
});

describe("カリキュラムの 読みこみ（サーバー: 全ワールド）", () => {
  it("索引の ワールドは すべて 読みこまれている", () => {
    expect(TOTAL_LESSONS).toBe(LESSONS.length);
    for (const w of CURRICULUM_WORLDS) expect(isWorldLoaded(w.world), `W${w.world}`).toBe(true);
    expect(worldsInRange(25, 35).map((w) => w.world)).toEqual([1, 2]);
  });

  it("itemsInRange / getItem は 全項目の しらべ方と 同じ答え", () => {
    for (const [a, b] of [[1, 1], [1, 30], [28, 33], [355, 360], [359, 400]] as const) {
      expect(itemsInRange(a, b)).toEqual(ALL_ITEMS.filter((i) => i.lessonNo >= a && i.lessonNo <= b));
    }
    for (const it of ALL_ITEMS.filter((_, i) => i % 97 === 0)) expect(getItem(it.id)).toBe(it);
    expect(getItem("nope")).toBeUndefined();
    expect(getItem("L999-W-x")).toBeUndefined();
  });

  it("ゲート・復習クエストの 表引きは 全テストを さがすのと 同じ", () => {
    for (let n = 1; n <= TOTAL_LESSONS; n++) {
      expect(gateTestAfterLesson(n)).toBe(ASSESSMENTS.find((a) => (a.kind === "MINI" || a.kind === "BOSS") && a.rangeEnd === n));
      expect(reviewQuestFor(n)).toBe(ASSESSMENTS.find((a) => a.kind === "DAILY_CHECK" && a.rangeEnd === n));
    }
    for (const a of ASSESSMENTS) expect(getAssessment(a.id)).toBe(a);
  });

  it("ensureLessonsLoaded は サーバーでは すぐ おわる（読みこみ ずみ）", async () => {
    await ensureLessonsLoaded(1, TOTAL_LESSONS);
    expect(getLesson(TOTAL_LESSONS)?.lessonNo).toBe(TOTAL_LESSONS);
  });
});

describe("ブラウザと同じ しくみ（bundledWorlds が 空）: ワールドごとに あとから 読む", () => {
  it("さいしょは レッスンが 無く、ensureLessonsLoaded で その ワールドだけ 読みこむ。おためしの レッスン・テストも 作れる", async () => {
    vi.resetModules();
    vi.doMock("@/lib/curriculum/bundledWorlds", () => ({ BUNDLED_WORLDS: [] }));
    try {
      const c = await import("@/lib/curriculum");
      expect(c.TOTAL_LESSONS).toBe(TOTAL_LESSONS); // 数・テスト定義は 索引だけで 決まる
      expect(c.ASSESSMENTS.length).toBe(ASSESSMENTS.length);
      expect(c.LESSONS).toHaveLength(0);
      expect(c.getLesson(65)).toBeUndefined();

      await c.ensureLessonsLoaded(61, 65);
      expect(c.isWorldLoaded(3)).toBe(true);
      expect(c.isWorldLoaded(1)).toBe(false);
      expect(c.getLesson(65)?.title).toBe(getLesson(65)?.title);
      expect(c.getLesson(65)?.stage).toBe(1);

      const off = await import("@/lib/offline");
      const lesson = await off.loadOfflineLesson(121); // L117〜121 → ワールド4・5
      expect(lesson.lesson?.lessonNo).toBe(121);
      expect(lesson.steps.length).toBe(9);
      expect(c.isWorldLoaded(4) && c.isWorldLoaded(5)).toBe(true);

      const tests = await import("@/lib/offline/tests");
      const start = await tests.loadOfflineTestStart("boss-1-60", {});
      expect(start.questions.length).toBe(CURRICULUM_RULES.bossQuestions);
      expect(c.isWorldLoaded(1) && c.isWorldLoaded(2)).toBe(true);
      const submit = await tests.loadOfflineTestSubmit("boss-1-60", { seed: start.seed, answers: [] });
      expect(submit.score).toBe(0);

      const missing = await off.loadOfflineLesson(99999);
      expect(missing.lesson).toBeNull();
    } finally {
      vi.doUnmock("@/lib/curriculum/bundledWorlds");
      vi.resetModules();
    }
  });
});

describe("ワールドの数に よらない（1,200 レッスン = 40 ワールドでも）", () => {
  const all = buildAssessments(1200);
  const byId = new Map(all.map((a) => [a.id, a]));
  const gate = (n: number): AssessmentDef | undefined => all.find((a) => (a.kind === "MINI" || a.kind === "BOSS") && a.rangeEnd === n);

  it("テスト定義: 復習 1,200・ボス 40・まとめ 200・アリーナ 79。さいごの ボスは 次を ひらかない", () => {
    const count = (k: string) => all.filter((a) => a.kind === k).length;
    expect(count("DAILY_CHECK")).toBe(1200);
    expect(count("BOSS")).toBe(40);
    expect(count("MINI")).toBe(1200 / 5 - 40);
    expect(count("ARENA")).toBe(40 + 39);
    expect(byId.get("boss-1-1200")?.unlocksLesson).toBeNull();
    expect(byId.get("boss-1-1170")?.unlocksLesson).toBe(1171);
    expect(new Set(all.map((a) => a.id)).size).toBe(all.length);
  });

  it("マップ: 1,200 レッスンでも ノードの 並びと ワールド番号が 正しい（速さも 見る）", () => {
    const started = performance.now();
    const map = buildStageMap({
      totalLessons: 1200, lessonsPerWorld: 30,
      completedLessons: new Map(Array.from({ length: 700 }, (_, i) => [i + 1, "2026-01-01"] as const)),
      passedTests: new Map(all.filter((a) => a.rangeEnd <= 700 && a.kind !== "ARENA").map((a) => [a.id, "2026-01-01"] as const)),
      gateTestAfter: gate,
      reviewQuestFor: (n) => byId.get(`check-${n}`),
      today: "2026-11-25",
    });
    expect(performance.now() - started).toBeLessThan(2000);
    expect(map.nodes.filter((n) => n.type === "LESSON")).toHaveLength(1200);
    expect(map.nodes[map.nodes.length - 1]).toMatchObject({ type: "BOSS", world: 40, assessmentId: "boss-1-1200" });
    expect(map.current).toMatchObject({ type: "LESSON", lessonNo: 701, world: 24 });

    // マップに 描くのは いまの ワールド ± 1（23〜25）だけ。ボタンで ふやせる
    expect(visibleWorldRange(map.nodes)).toEqual({ from: 23, to: 25, first: 1, last: 40 });
    expect(visibleWorldRange(map.nodes, { before: 2, after: 4 })).toEqual({ from: 21, to: 29, first: 1, last: 40 });
    expect(visibleWorldRange(map.nodes, { before: 99, after: 99 })).toEqual({ from: 1, to: 40, first: 1, last: 40 });
    const shown = map.nodes.filter((n) => n.world >= 23 && n.world <= 25).length;
    expect(shown).toBeLessThan(map.nodes.length / 10);
  });

  it("マップ: はじめは ワールド1〜2、ぜんぶ クリアしたら さいごの ワールドの まわり", () => {
    const fresh = buildStageMap({ totalLessons: 1200, lessonsPerWorld: 30, completedLessons: new Map(), passedTests: new Map(), gateTestAfter: gate, today: "2026-11-25" });
    expect(visibleWorldRange(fresh.nodes)).toMatchObject({ from: 1, to: 2 });
    const done = fresh.nodes.map((n) => ({ ...n, status: "CLEARED" as const }));
    expect(visibleWorldRange(done)).toMatchObject({ from: 39, to: 40 });
    expect(visibleWorldRange([])).toEqual({ from: 1, to: 1, first: 1, last: 1 });
  });

  it("40 ワールド すべてに 名前と 地図の 色がある（13〜40 は 色の 組み合わせが ちがう）", () => {
    expect(THEMED_WORLDS).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    const palettes = new Set(THEMED_WORLDS.map((w) => `${themeOfWorld(w).top}/${themeOfWorld(w).bottom}/${themeOfWorld(w).fog}`));
    expect(palettes.size).toBe(40);
    for (const w of THEMED_WORLDS) {
      expect(worldName(w)).not.toMatch(/^ワールド\d/);
      expect(themeOfWorld(w).monsters.length).toBeGreaterThan(0);
      expect(themeOfWorld(w).glyphs.length).toBeGreaterThan(0);
    }
    expect(themeOfWorld(41)).toBe(themeOfWorld(5)); // 計画の 外は くりかえし
  });
});
