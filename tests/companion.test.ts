import { describe, expect, it } from "vitest";
import { companionLine } from "@/lib/game/companion";
import { partyLevel } from "@/lib/game/characters";

const base = { playerName: "ハル", streakDays: 0, coins: 0, lessonsCleared: 3 };

describe("相棒ビリモのセリフ", () => {
  it("お宝アラートがあれば最優先で知らせる", () => {
    const l = companionLine({ ...base, hasTreasureAlert: true, current: { type: "BOSS", status: "AVAILABLE", lessonNo: 30 } });
    expect(l.mood).toBe("excited");
    expect(l.text).toContain("2倍");
  });
  it("復習クエスト待ちのときはねむそうに、明日のボーナスを予告", () => {
    const l = companionLine({ ...base, current: { type: "CHECK", status: "WAIT_TOMORROW", lessonNo: 3 } });
    expect(l.mood).toBe("sleepy");
    expect(l.text).toContain("30コイン");
    expect(l.text).toContain("復習クエスト");
  });
  it("ボス・まとめ・復習クエストで声かけが変わる", () => {
    expect(companionLine({ ...base, current: { type: "CHECK", status: "AVAILABLE", lessonNo: 7 } }).text).toContain("復習クエスト");
    expect(companionLine({ ...base, current: { type: "BOSS", status: "AVAILABLE", lessonNo: 30 } }).text).toContain("ボス");
    expect(companionLine({ ...base, current: { type: "MINI", status: "AVAILABLE", lessonNo: 5 } }).text).toContain("まとめテスト");
    expect(companionLine({ ...base, current: { type: "CHECK", status: "AVAILABLE", lessonNo: 7 } }).text).toContain("Lesson 7");
  });
  it("ダッシュボードでは苦手な力のアドバイス", () => {
    expect(companionLine({ ...base, weakestSkill: "PHONICS" }).text).toContain("フォニックス");
  });
  it("はじめての日は Session 1 の4つの命令を案内", () => {
    expect(companionLine({ ...base, lessonsCleared: 0 }).text).toContain("Look! Stop! Come here! Go!");
  });
  it("口ぐせは「ビリ」", () => {
    expect(companionLine({ ...base, current: { type: "LESSON", status: "AVAILABLE", lessonNo: 4 }, hour: 8 }).text).toMatch(/ビリ/);
  });
});

describe("パーティのレベル", () => {
  it("5レッスンごとにレベルアップ", () => {
    expect(partyLevel(0)).toMatchObject({ level: 1, exp: 0 });
    expect(partyLevel(4)).toMatchObject({ level: 1, exp: 4 });
    expect(partyLevel(5)).toMatchObject({ level: 2, exp: 0 });
    expect(partyLevel(12)).toMatchObject({ level: 3, exp: 2 });
  });
});
