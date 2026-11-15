import { describe, expect, it } from "vitest";
import { nextStreak, rewardForLesson, rewardForStreak, rewardForTest } from "@/lib/domain/coins";
import { COIN_RULES } from "@/lib/domain/config";
import { daysBetween } from "@/lib/domain/dates";

const base = { passed: true, score: 1, isFirstAttempt: true, alreadyPassed: false };

describe("コイン報酬", () => {
  it("通常レッスンは基本コイン、復習受講は0", () => {
    expect(rewardForLesson({ alreadyCompleted: false }).total).toBe(COIN_RULES.lessonComplete);
    expect(rewardForLesson({ alreadyCompleted: true }).total).toBe(0);
  });

  it("翌日テスト一発合格 > 再挑戦合格、不合格・合格済みは0", () => {
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK" }).total).toBe(COIN_RULES.dailyCheckFirstTry);
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", isFirstAttempt: false }).total).toBe(COIN_RULES.dailyCheckRetryPass);
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", passed: false }).total).toBe(0);
    expect(rewardForTest({ ...base, kind: "DAILY_CHECK", alreadyPassed: true }).total).toBe(0);
  });

  it("翌日テスト一発合格が 1分あたり最もお得（目安所要時間で比較）", () => {
    const perMin = { lesson: COIN_RULES.lessonComplete / 25, check: COIN_RULES.dailyCheckFirstTry / 3, mini: COIN_RULES.miniTestFirstTry / 8 };
    expect(perMin.check).toBeGreaterThan(perMin.mini);
    expect(perMin.check).toBeGreaterThan(perMin.lesson);
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

  it("連続日数: 翌日+1 / 同日据え置き / 空いたらリセット、7日ごとボーナス", () => {
    expect(nextStreak({ streakDays: 3, lastStudyDate: "2026-11-01" }, "2026-11-02", daysBetween)).toBe(4);
    expect(nextStreak({ streakDays: 3, lastStudyDate: "2026-11-02" }, "2026-11-02", daysBetween)).toBe(3);
    expect(nextStreak({ streakDays: 3, lastStudyDate: "2026-11-01" }, "2026-11-04", daysBetween)).toBe(1);
    expect(rewardForStreak(7).total).toBe(COIN_RULES.streakBonus);
    expect(rewardForStreak(6).total).toBe(0);
  });
});
