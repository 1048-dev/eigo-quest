import { describe, expect, it } from "vitest";
import { buildStageMap, canStartLesson, canTakeGateTest } from "@/lib/domain/progression";
import { ASSESSMENTS, gateTestAfterLesson, reviewQuestFor, TOTAL_LESSONS } from "@/lib/curriculum";

const mk = (completed: [number, string][], passed: [string, string][], today: string, skipDailyLock = false) =>
  buildStageMap({
    totalLessons: TOTAL_LESSONS, lessonsPerWorld: 30,
    completedLessons: new Map(completed), passedTests: new Map(passed),
    gateTestAfter: gateTestAfterLesson, reviewQuestFor, today, skipDailyLock,
  });

const status = (nodes: { key: string; status: string }[], key: string) => nodes.find((n) => n.key === key)?.status;
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

describe("テスト定義", () => {
  it("すべてのレッスンに復習クエスト（ブロックしない）", () => {
    for (const n of [1, 4, 5, 10, 29, 30]) {
      const r = reviewQuestFor(n);
      expect(r?.id).toBe(`check-${n}`);
      expect(r?.kind).toBe("DAILY_CHECK");
      expect(r?.unlocksLesson).toBeNull();
    }
    expect(ASSESSMENTS.filter((a) => a.kind === "DAILY_CHECK")).toHaveLength(TOTAL_LESSONS);
  });

  it("ゲートは5の倍数のまとめ（30の倍数はボス）だけ。次のレッスンを開く", () => {
    expect(gateTestAfterLesson(1)).toBeUndefined();
    expect(gateTestAfterLesson(4)).toBeUndefined();
    expect(gateTestAfterLesson(5)).toMatchObject({ id: "mini-1-5", unlocksLesson: 6 });
    expect(gateTestAfterLesson(10)).toMatchObject({ id: "mini-6-10", unlocksLesson: 11 });
    expect(gateTestAfterLesson(30)).toMatchObject({ id: "boss-1-30", kind: "BOSS", unlocksLesson: 31 });
    expect(ASSESSMENTS.some((a) => a.id === "mini-26-30")).toBe(false);
    expect(ASSESSMENTS.some((a) => a.id === "arena-1-30")).toBe(true);
  });
});

describe("ロック解除", () => {
  it("初日は Lesson 1 だけ遊べる。復習クエストはレッスン前は LOCKED", () => {
    const { current, nodes } = mk([], [], "2026-11-01");
    expect(current?.key).toBe("L-1");
    expect(status(nodes, "T-check-1")).toBe("LOCKED");
    expect(status(nodes, "L-2")).toBe("LOCKED");
    expect(canTakeGateTest(nodes, "check-1").ok).toBe(false);
  });

  it("マップの並び: L5 → 復習5 → まとめ1-5 → L6", () => {
    const keys = mk([], [], "2026-11-01").nodes.map((n) => n.key);
    const i = keys.indexOf("L-5");
    expect(keys.slice(i, i + 4)).toEqual(["L-5", "T-check-5", "T-mini-1-5", "L-6"]);
  });

  it("Lesson 1 を終えたら同じ日にすぐ Lesson 2 へ。復習クエストは WAIT_TOMORROW", () => {
    const { current, nodes } = mk([[1, "2026-11-01"]], [], "2026-11-01");
    expect(current?.key).toBe("L-2");
    expect(status(nodes, "T-check-1")).toBe("WAIT_TOMORROW");
    expect(canStartLesson(nodes, 2).ok).toBe(true);
    const r = canTakeGateTest(nodes, "check-1");
    expect(r.ok).toBe(false);
    expect(r.reasonJa).toContain("復習クエスト");
    expect(r.reasonJa).toContain("あした");
  });

  it("1日に何レッスンでも進める", () => {
    const { current, nodes } = mk(range(1, 4).map((n) => [n, "2026-11-01"]), [], "2026-11-01");
    expect(current?.key).toBe("L-5");
    for (const n of range(1, 4)) expect(status(nodes, `T-check-${n}`)).toBe("WAIT_TOMORROW");
  });

  it("翌日は受けられる復習クエストが『きょうのクエスト』になる（でもレッスンもひらいたまま）", () => {
    const { current, nodes } = mk([[1, "2026-11-01"]], [], "2026-11-02");
    expect(current?.key).toBe("T-check-1");
    expect(current?.status).toBe("AVAILABLE");
    expect(status(nodes, "L-2")).toBe("AVAILABLE");
    expect(canTakeGateTest(nodes, "check-1").ok).toBe(true);
  });

  it("復習クエストに合格すると CLEARED、current は次のレッスン", () => {
    const { current, nodes } = mk([[1, "2026-11-01"]], [["check-1", "2026-11-02"]], "2026-11-02");
    expect(status(nodes, "T-check-1")).toBe("CLEARED");
    expect(current?.key).toBe("L-2");
  });

  it("復習クエストは進行をブロックしない（受けていなくても先へ）", () => {
    const done: [number, string][] = range(1, 3).map((n) => [n, `2026-11-0${n}`]);
    const { nodes } = mk(done, [], "2026-11-05");
    expect(status(nodes, "L-4")).toBe("AVAILABLE");
    expect(status(nodes, "T-check-1")).toBe("AVAILABLE");
  });

  it("Lesson 5 の後はまとめ 1-5 がすぐ受けられ、合格しないと Lesson 6 は開かない", () => {
    const done: [number, string][] = range(1, 5).map((n) => [n, "2026-11-01"]);
    const { current, nodes } = mk(done, [], "2026-11-01");
    expect(current?.assessmentId).toBe("mini-1-5");
    expect(current?.status).toBe("AVAILABLE");
    expect(status(nodes, "L-6")).toBe("LOCKED");
    expect(canStartLesson(nodes, 6).ok).toBe(false);
    expect(canTakeGateTest(nodes, "mini-1-5").ok).toBe(true);

    const after = mk(done, [["mini-1-5", "2026-11-01"]], "2026-11-01");
    expect(status(after.nodes, "L-6")).toBe("AVAILABLE");
    expect(after.current?.key).toBe("L-6");
  });

  it("Lesson 30 の後はボス戦がゲート", () => {
    const done: [number, string][] = range(1, 30).map((n) => [n, "2026-11-01"]);
    const passed: [string, string][] = range(1, 5).map((k) => [`mini-${k * 5 - 4}-${k * 5}`, "2026-11-01"]);
    const { current, nodes } = mk(done, passed, "2026-11-01");
    expect(current?.assessmentId).toBe("boss-1-30");
    if (TOTAL_LESSONS > 30) expect(status(nodes, "L-31")).toBe("LOCKED");
  });

  it("current: 受けられる復習クエストが最優先（いちばん前のもの）", () => {
    const done: [number, string][] = [[1, "2026-11-01"], [2, "2026-11-02"], [3, "2026-11-03"]];
    const { current } = mk(done, [["check-1", "2026-11-02"]], "2026-11-03");
    expect(current?.key).toBe("T-check-2");
  });

  it("skipDailyLock は復習クエストだけに効く", () => {
    const { nodes, current } = mk([[1, "2026-11-01"]], [], "2026-11-01", true);
    expect(status(nodes, "T-check-1")).toBe("AVAILABLE");
    expect(current?.key).toBe("T-check-1");
    expect(status(nodes, "T-check-2")).toBe("LOCKED");
    const five = mk(range(1, 4).map((n) => [n, "2026-11-01"]), [], "2026-11-01", true);
    expect(status(five.nodes, "L-6")).toBe("LOCKED");
  });

  it("reviewQuestFor を渡さなければ復習クエストはマップに出ない（後方互換）", () => {
    const { nodes } = buildStageMap({ totalLessons: 10, lessonsPerWorld: 30, completedLessons: new Map(), passedTests: new Map(), gateTestAfter: gateTestAfterLesson, today: "2026-11-01" });
    expect(nodes.some((n) => n.type === "CHECK")).toBe(false);
  });
});
