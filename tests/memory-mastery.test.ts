import { describe, expect, it } from "vitest";
import { initialMemory, retrievability, updateMemory } from "@/lib/domain/memory";
import { computeMastery, speedFactor } from "@/lib/domain/mastery";
import { decideTreasureAlert, findForgettingLessons } from "@/lib/domain/treasureAlert";
import { pickArenaItems } from "@/lib/domain/arena";
import { itemsInRange } from "@/lib/curriculum";
import type { MemoryState } from "@/lib/domain/types";

const DAY = 86_400_000;
const t0 = new Date("2026-11-01T09:00:00Z");
const at = (days: number) => new Date(t0.getTime() + days * DAY);

describe("記憶モデル", () => {
  it("時間がたつと想起率が下がる（t=S で約90%）", () => {
    const m = initialMemory("x", true, t0);
    expect(retrievability(m, t0)).toBeCloseTo(1);
    expect(retrievability(m, at(m.stability))).toBeCloseTo(0.9, 2);
    expect(retrievability(m, at(10))).toBeLessThan(0.5);
  });

  it("忘れかけで正解すると安定度が大きく伸びる。同日の連続正解はほぼ伸びない", () => {
    const m = initialMemory("x", true, t0);
    const sameDay = updateMemory(m, "x", true, at(0.01));
    const later = updateMemory(m, "x", true, at(3));
    expect(later.stability).toBeGreaterThan(sameDay.stability);
    expect(sameDay.stability / m.stability).toBeLessThan(1.1);
  });

  it("不正解で安定度が縮み、lapses が増える", () => {
    const m = updateMemory(initialMemory("x", true, t0), "x", false, at(2));
    expect(m.stability).toBeLessThan(1);
    expect(m.lapses).toBe(1);
  });
});

describe("習得率", () => {
  const items = itemsInRange(1, 2);
  const memories = new Map<string, MemoryState>(items.map((i) => [i.id, { ...initialMemory(i.id, true, t0) }]));

  it("学習直後は高く、日がたつと下がる（忘却を反映）", () => {
    const now = computeMastery({ introducedItems: items, totalItemCount: 300, memories, recentResponses: [], now: t0 });
    const later = computeMastery({ introducedItems: items, totalItemCount: 300, memories, recentResponses: [], now: at(14) });
    expect(now.overall).toBeGreaterThan(90);
    expect(later.overall).toBeLessThan(now.overall);
    expect(now.coverage).toBeCloseTo((items.length / 300) * 100, 0);
  });

  it("未解答の導入済み項目は 0 として扱う", () => {
    const half = new Map([...memories].slice(0, Math.floor(items.length / 2)));
    const r = computeMastery({ introducedItems: items, totalItemCount: 300, memories: half, recentResponses: [], now: t0 });
    expect(r.overall).toBeLessThan(80);
  });

  it("反応が速いほど反射スコアが高い", () => {
    expect(speedFactor(1000)).toBe(1);
    expect(speedFactor(5000)).toBeLessThan(speedFactor(2000));
  });
});

describe("お宝復習アラート / アリーナ", () => {
  const items = itemsInRange(1, 10);
  const memories = new Map<string, MemoryState>(items.map((i) => [i.id, initialMemory(i.id, true, i.lessonNo <= 3 ? t0 : at(9))]));

  it("前に学習して想起率が下がったレッスンを検出（直近2レッスンは除外）", () => {
    const c = findForgettingLessons(items, memories, 11, at(10));
    expect(c.map((x) => x.lessonNo)).toEqual(expect.arrayContaining([1, 2, 3]));
    expect(c.every((x) => x.lessonNo <= 9)).toBe(true);
  });

  it("1日1回まで。表示時はメッセージにレッスン番号が入る", () => {
    const c = findForgettingLessons(items, memories, 11, at(10));
    expect(decideTreasureAlert({ candidates: c, alreadyOfferedToday: true }).show).toBe(false);
    const d = decideTreasureAlert({ candidates: c, alreadyOfferedToday: false, rng: () => 0.01 });
    expect(d.show).toBe(true);
    expect(d.messageJa).toContain(`Lesson ${d.candidate!.lessonNo}`);
  });

  it("アリーナは忘れかけの項目を優先して出題する", () => {
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const counts = { old: 0, recent: 0 };
    for (let k = 0; k < 50; k++) {
      for (const it of pickArenaItems(items, memories, 10, at(10), rng)) it.lessonNo <= 3 ? counts.old++ : counts.recent++;
    }
    const oldShare = counts.old / (counts.old + counts.recent);
    const poolShare = items.filter((i) => i.lessonNo <= 3).length / items.length;
    expect(oldShare).toBeGreaterThan(poolShare);
  });
});
