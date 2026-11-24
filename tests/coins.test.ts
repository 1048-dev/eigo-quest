import { describe, expect, it } from "vitest";
import { lessonCoinsForDailyIndex, nextStreak, rewardForLesson, rewardForStreak, rewardForTest } from "@/lib/domain/coins";
import { COIN_RULES } from "@/lib/domain/config";
import { daysBetween } from "@/lib/domain/dates";

const base = { passed: true, score: 1, isFirstAttempt: true, alreadyPassed: false };

describe("コイン報酬", () => {
  it("通常レッスンは基本コイン、復習受講は0", () => {
    expect(rewardForLesson({ alreadyCompleted: false }).total).toBe(COIN_RULES.lessonComplete);
    expect(rewardForLesson({ alreadyCompleted: true }).total).toBe(0);
    expect(rewardForLesson({ alreadyCompleted: true, completedTodayBefore: 0 }).total).toBe(0);
  });

  it("新しいレッスンのコインは1日の回数で減る: 1〜3回目10 / 4回目6 / 5回目4 / 6回目以降2", () => {
    const coins = [0, 1, 2, 3, 4, 5, 6, 20].map((k) => rewardForLesson({ alreadyCompleted: false, completedTodayBefore: k }).total);
    expect(coins).toEqual([10, 10, 10, 6, 4, 2, 2, 2]);
    expect(lessonCoinsForDailyIndex(-1)).toBe(10);
  });

  it("復習クエストのラベルは「復習クエスト」", () => {
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK" }).coins[0].labelJa).toContain("復習クエスト");
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", isFirstAttempt: false }).coins[0].labelJa).toContain("復習クエスト");
  });

  it("復習クエスト一発合格 > 再挑戦合格、不合格・合格済みは0", () => {
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK" }).total).toBe(COIN_RULES.dailyCheckFirstTry);
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", isFirstAttempt: false }).total).toBe(COIN_RULES.dailyCheckRetryPass);
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", passed: false }).total).toBe(0);
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", alreadyPassed: true }).total).toBe(0);
  });

  it("復習クエスト一発合格が 1分あたり最もお得（目安所要時間で比較）", () => {
    const maxLesson = Math.max(...COIN_RULES.lessonCoinsByDailyIndex, COIN_RULES.lessonCoinsAfterTable);
    const perMin = {
      lesson: maxLesson / 25, check: COIN_RULES.dailyCheckFirstTry / 3, mini: COIN_RULES.miniTestFirstTry / 8,
      arena: (COIN_RULES.arenaPlay + COIN_RULES.arenaPerfectBonus) / 4,
    };
    // お宝アラート（ランダムで1日1回までの2倍イベント）は「いつでも受けられる活動」ではないので比較対象外
    expect(COIN_RULES.dailyCheckFirstTry).toBe(30);
    for (const [k, v] of Object.entries(perMin)) if (k !== "check") expect(perMin.check).toBeGreaterThan(v);
  });

  it("ボス合格は大ボーナス＋レアガチャ券", () => {
    const r = rewardForTest({ ...base, kind: "BOSS" });
    expect(r.total).toBe(COIN_RULES.bossFirstTry);
    expect(r.rareGachaTickets).toBe(1);
  });

  it("お宝アラートはコイン2倍", () => {
    const r = rewardForTest({ ...base, kind: "TREASURE" });
    expect(r.total).toBe(COIN_RULES.treasureBase * 2);
    expect(r.coins[0].multiplier).toBe(2);
  });

  it("アリーナは毎回もらえるが、1日の満額回数を超えると減額。正答率60%未満は0", () => {
    expect(rewardForTest({ ...base, kind: "ARENA", score: 0.8, arenaPlaysToday: 0 }).total).toBe(COIN_RULES.arenaPlay);
    expect(rewardForTest({ ...base, kind: "ARENA", score: 0.8, arenaPlaysToday: 5 }).total).toBe(COIN_RULES.arenaPlayAfterCap);
    expect(rewardForTest({ ...base, kind: "ARENA", score: 1, arenaPlaysToday: 0 }).total).toBe(COIN_RULES.arenaPlay + COIN_RULES.arenaPerfectBonus);
    expect(rewardForTest({ ...base, kind: "ARENA", score: 0.5 }).total).toBe(0);
  });

  it("連続日数: 翌日+1 / 同日据え置き / 空いたらリセット", () => {
    expect(nextStreak({ streakDays: 3, lastStudyDate: "2026-11-01" }, "2026-11-02", daysBetween)).toBe(4);
    expect(nextStreak({ streakDays: 3, lastStudyDate: "2026-11-02" }, "2026-11-02", daysBetween)).toBe(3);
    expect(nextStreak({ streakDays: 3, lastStudyDate: "2026-11-01" }, "2026-11-04", daysBetween)).toBe(1);
    expect(nextStreak({ streakDays: 0, lastStudyDate: null }, "2026-11-04", daysBetween)).toBe(1);
  });

  it("連続ボーナス: 毎日 +min(日数,10)", () => {
    expect(rewardForStreak(0).total).toBe(0);
    expect(rewardForStreak(1).total).toBe(1);
    expect(rewardForStreak(6).total).toBe(6);
    expect(rewardForStreak(10).total).toBe(10);
    expect(rewardForStreak(13).total).toBe(10);
    expect(rewardForStreak(13).rareGachaTickets).toBe(0);
  });

  it("連続ボーナス: 7日ごと +50", () => {
    expect(rewardForStreak(7).total).toBe(7 + COIN_RULES.streakBonus);
    expect(rewardForStreak(14).total).toBe(10 + 50);
    expect(rewardForStreak(7).coins.every((c) => c.reason === "STREAK_BONUS")).toBe(true);
  });

  it("連続ボーナス: 30日ごと +300 とレアガチャ券1枚（7の倍数と重なれば両方）", () => {
    const r30 = rewardForStreak(30);
    expect(r30.total).toBe(10 + 300);
    expect(r30.rareGachaTickets).toBe(1);
    expect(rewardForStreak(60).rareGachaTickets).toBe(1);
    const r210 = rewardForStreak(210);
    expect(r210.total).toBe(10 + 50 + 300);
    expect(r210.rareGachaTickets).toBe(1);
    expect(rewardForStreak(29).rareGachaTickets).toBe(0);
  });

  it("連続学習がいちばん大きな報酬（30日つづけた連続ボーナスの合計 > ボス一発合格）", () => {
    let streakTotal = 0;
    for (let d = 1; d <= 30; d++) streakTotal += rewardForStreak(d).total;
    expect(streakTotal).toBeGreaterThan(COIN_RULES.bossFirstTry);
  });
});
