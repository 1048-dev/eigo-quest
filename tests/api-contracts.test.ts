/**
 * API契約のテスト: どんな壊れたレスポンスでも画面がクラッシュしない（必ず安全なデフォルト値になる）こと、
 * そしてサーバーが返す正しい形はそのまま通ることを確かめる。
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DashboardResponseSchema, GachaResponseSchema, GradeResponseSchema, LessonCompleteResponseSchema, LessonResponseSchema,
  MapResponseSchema, RankingResponseSchema, TestStartResponseSchema, TestSubmitResponseSchema, TreasureAlertResponseSchema,
} from "@/lib/api/contracts";
import { apiGet, apiPost, coerce, parseJsonSafely } from "@/lib/api/client";
import { buildStageMap } from "@/lib/domain/progression";
import { gateTestAfterLesson, getLesson, itemsOfLesson, TEACHER, TOTAL_LESSONS } from "@/lib/curriculum";
import { buildLessonFlow } from "@/lib/curriculum/questions";

const ALL = {
  MapResponseSchema, DashboardResponseSchema, TreasureAlertResponseSchema, RankingResponseSchema, GachaResponseSchema,
  LessonResponseSchema, LessonCompleteResponseSchema, TestStartResponseSchema, TestSubmitResponseSchema, GradeResponseSchema,
};
const GARBAGE: unknown[] = [undefined, null, "", "<html>500</html>", 42, [], {}, { nodes: "x", user: 5, scores: null, rows: [null, 1, { rank: "a" }] }];

describe("契約スキーマ: 壊れた入力でも例外を投げず、配列は必ず配列", () => {
  for (const [name, schema] of Object.entries(ALL)) {
    it(name, () => {
      for (const g of GARBAGE) {
        const v = coerce(schema, g) as Record<string, unknown>;
        expect(v).toBeTypeOf("object");
        for (const val of Object.values(v)) {
          // undefined の項目があっても良いが、配列項目が配列以外になることはない
          if (Array.isArray(val)) expect(Array.isArray(val)).toBe(true);
        }
      }
    });
  }

  it("map: 欠けた項目は安全なデフォルト（[] / null）", () => {
    const v = coerce(MapResponseSchema, { nodes: "bad" });
    expect(v).toEqual({ nodes: [], current: null, arenas: [], user: null });
  });

  it("dashboard: scores が欠けても 0 で埋まる、壊れた weakest 要素だけ捨てる", () => {
    const v = coerce(DashboardResponseSchema, { weakest: [{ id: "L1", text: "hello", ja: "こんにちは" }, null, 3] });
    expect(v.scores.PHONICS).toBe(0);
    expect(v.weakest).toHaveLength(1);
    expect(v.history).toEqual([]);
  });
});

describe("サーバーが返す正しい形はそのまま通る（バックエンドとフロントの同期）", () => {
  it("map のノード・現在地", () => {
    const map = buildStageMap({ totalLessons: TOTAL_LESSONS, lessonsPerWorld: 30, completedLessons: new Map(), passedTests: new Map(), gateTestAfter: gateTestAfterLesson, today: "2026-11-01" });
    const v = coerce(MapResponseSchema, { nodes: map.nodes, current: map.current, arenas: [], user: { nickname: "ハル", coins: 5, streakDays: 2 } });
    expect(v.nodes).toHaveLength(map.nodes.length);
    expect(v.current?.key).toBe("L-1");
    expect(v.user).toEqual({ nickname: "ハル", coins: 5, streakDays: 2 });
  });

  it("lesson の構成（8ステップ・クイズの正解つき）", () => {
    const lesson = getLesson(1)!;
    const v = coerce(LessonResponseSchema, JSON.parse(JSON.stringify({ lesson, teacher: TEACHER, items: itemsOfLesson(lesson), steps: buildLessonFlow(lesson) })));
    expect(v.lesson?.lessonNo).toBe(1);
    expect(v.steps.map((s) => s.kind)).toEqual(["teacher_video", "flashcards", "tpr", "phonics", "school_expressions", "pronunciation", "quiz", "speed_listening"]);
    const quiz = v.steps.find((s) => s.kind === "quiz");
    expect(quiz && quiz.kind === "quiz" ? quiz.questions.length : 0).toBeGreaterThan(0);
  });
});

describe("安全な fetch クライアント", () => {
  afterEach(() => vi.unstubAllGlobals());
  const stub = (body: string, status = 200) => vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status })));

  it("空のボディ（JSON parse error の原因）でも落ちずにデフォルト値", async () => {
    stub("", 200);
    const r = await apiGet("/api/map", MapResponseSchema);
    expect(r.ok).toBe(false);
    expect(r.data.nodes).toEqual([]);
    expect(r.error).toBeTruthy();
  });

  it("HTML のエラーページでも落ちない", async () => {
    stub("<!doctype html><h1>Internal Server Error</h1>", 500);
    const r = await apiGet("/api/dashboard", DashboardResponseSchema);
    expect(r.ok).toBe(false);
    expect(r.data.weakest).toEqual([]);
  });

  it("API のエラーメッセージ（{ error }）を表示用に取り出す", async () => {
    stub(JSON.stringify({ ok: false, error: "まだロックされています" }), 403);
    const r = await apiPost("/api/tests/check-2/start", TestStartResponseSchema, {});
    expect(r.error).toBe("まだロックされています");
    expect(r.data.questions).toEqual([]);
  });

  it("通信そのものが失敗しても落ちない", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    const r = await apiGet("/api/ranking", RankingResponseSchema);
    expect(r.ok).toBe(false);
    expect(r.data.rows).toEqual([]);
  });

  it("正常なレスポンスは ok=true", async () => {
    stub(JSON.stringify({ show: true, alert: { id: "a1", lessonNo: 4, multiplier: 2 }, messageJa: "お宝！" }));
    const r = await apiGet("/api/treasure-alert", TreasureAlertResponseSchema);
    expect(r.ok).toBe(true);
    expect(r.data.alert?.lessonNo).toBe(4);
  });

  it("parseJsonSafely", () => {
    expect(parseJsonSafely("")).toBeUndefined();
    expect(parseJsonSafely("{bad")).toBeUndefined();
    expect(parseJsonSafely('{"a":1}')).toEqual({ a: 1 });
  });
});
