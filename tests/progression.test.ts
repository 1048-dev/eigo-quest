import { describe, expect, it } from "vitest";
import { buildStageMap, canTakeGateTest } from "@/lib/domain/progression";
import { ASSESSMENTS, gateTestAfterLesson, TOTAL_LESSONS } from "@/lib/curriculum";

const mk = (completed: [number, string][], passed: [string, string][], today: string) =>
  buildStageMap({
    totalLessons: TOTAL_LESSONS, lessonsPerWorld: 30,
    completedLessons: new Map(completed), passedTests: new Map(passed),
    gateTestAfter: gateTestAfterLesson, today,
  });

describe("テスト定義", () => {
  it("5の倍数はまとめ、30はボス、それ以外は翌日テスト。ボス後にアリーナ", () => {
    expect(gateTestAfterLesson(1)?.id).toBe("check-1");
    expect(gateTestAfterLesson(5)?.id).toBe("mini-1-5");
    expect(gateTestAfterLesson(10)?.id).toBe("mini-6-10");
    expect(gateTestAfterLesson(30)?.id).toBe("boss-1-30");
    expect(ASSESSMENTS.some((a) => a.id === "arena-1-30")).toBe(true);
  });
});

describe("ロック解除", () => {
  it("初日は Lesson 1 だけ遊べる", () => {
    const { current, nodes } = mk([], [], "2026-11-01");
    expect(current?.key).toBe("L-1");
    expect(nodes[1].status).toBe("LOCKED");
  });

  it("Lesson 1 を終えた当日は、翌日テストが『あしたまで待ってね』", () => {
    const { current, nodes } = mk([[1, "2026-11-01"]], [], "2026-11-01");
    expect(current?.key).toBe("T-check-1");
    expect(current?.status).toBe("WAIT_TOMORROW");
    expect(canTakeGateTest(nodes, "check-1").ok).toBe(false);
  });

  it("翌日になると翌日テストが受けられ、合格で Lesson 2 が開く", () => {
    expect(mk([[1, "2026-11-01"]], [], "2026-11-02").current?.status).toBe("AVAILABLE");
    expect(mk([[1, "2026-11-01"]], [["check-1", "2026-11-02"]], "2026-11-02").current?.key).toBe("L-2");
  });

  it("Lesson 5 の後はまとめテスト 1-5 に合格しないと Lesson 6 は開かない", () => {
    const done: [number, string][] = [1, 2, 3, 4, 5].map((n) => [n, `2026-11-0${n}`]);
    const passed: [string, string][] = [1, 2, 3, 4].map((n) => [`check-${n}`, `2026-11-0${n + 1}`]);
    const { current, nodes } = mk(done, passed, "2026-11-06");
    expect(current?.assessmentId).toBe("mini-1-5");
    expect(nodes.find((n) => n.key === "L-6")?.status).toBe("LOCKED");
  });
});
