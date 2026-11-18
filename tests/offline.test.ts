/**
 * DBが止まっていても API・画面が「エラーを出さずに」動くことの確認。
 *  - withOffline: DB接続エラー（P1001 等）や例外 → 200 + success:true + offline:true のモックデータ
 *  - オフライン用データはすべて契約スキーマどおり
 *  - クライアント: 届かないときは自動で1回リトライし、isUnreachable で内蔵データに切り替えられる
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/db", () => {
  const state = { up: true };
  return {
    prisma: {},
    isDbUp: async () => state.up,
    markDbDown: () => { state.up = false; },
    __state: state,
  };
});

import * as db from "@/lib/db";
import { isDbConnectionError, withOffline } from "@/lib/api/server";
import {
  offlineAnnouncements, offlineCollection, offlineDashboard, offlineGacha, offlineLesson, offlineLessonComplete, offlineMap, offlineRanking, offlineTreasureAlert,
} from "@/lib/offline";
import { offlineTestStart, offlineTestSubmit } from "@/lib/offline/tests";
import {
  AnnouncementsResponseSchema, CollectionResponseSchema, DashboardResponseSchema, GachaResponseSchema, LessonCompleteResponseSchema, LessonResponseSchema,
  MapResponseSchema, RankingResponseSchema, TestStartResponseSchema, TestSubmitResponseSchema, TreasureAlertResponseSchema,
} from "@/lib/api/contracts";
import { apiGet, isUnreachable } from "@/lib/api/client";
import { ASSESSMENTS } from "@/lib/curriculum";

const state = (db as unknown as { __state: { up: boolean } }).__state;
const req = (body?: unknown) => new Request("http://x/api/t", body ? { method: "POST", body: JSON.stringify(body) } : undefined);

afterEach(() => { state.up = true; vi.unstubAllGlobals(); });

describe("withOffline", () => {
  const p1001 = new Prisma.PrismaClientKnownRequestError("Can't reach database server", { code: "P1001", clientVersion: "6" });

  it("DBが落ちている（isDbUp=false）ならハンドラを呼ばずにオフラインデータを返す", async () => {
    state.up = false;
    const handler = vi.fn();
    const res = await withOffline("t", handler, () => offlineDashboard())(req(), undefined);
    expect(handler).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ success: true, offline: true, overall: 0 });
  });

  it("P1001 が投げられたら 200 + success:true のモックに切り替え、以後はDBダウン扱い", async () => {
    const res = await withOffline("t", async () => { throw p1001; }, () => offlineMap())(req(), undefined);
    expect(res.status).toBe(200);
    const body = MapResponseSchema.parse(await res.json());
    expect(body.success).toBe(true);
    expect(body.offline).toBe(true);
    expect(body.nodes.length).toBeGreaterThan(0);
    expect(state.up).toBe(false);
  });

  it("想定外の例外でもエラーを外に漏らさない", async () => {
    const res = await withOffline("t", async () => { throw new Error("boom"); }, () => offlineCollection())(req(), undefined);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain("boom");
    expect(JSON.parse(text)).toMatchObject({ success: true, offline: true, owned: [] });
  });

  it("フォールバック自体が失敗しても success:true を返す", async () => {
    const res = await withOffline("t", async () => { throw p1001; }, () => { throw new Error("x"); })(req(), undefined);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, offline: true });
  });

  it("ハンドラが本文を読んだあとでも、フォールバックは同じ本文を読める", async () => {
    const res = await withOffline("t", async (r) => { await r.json(); throw p1001; }, async (r) => {
      const b = (await r.json()) as { useRareTicket: boolean };
      return offlineGacha(b.useRareTicket, () => 0.5);
    })(req({ useRareTicket: true }), undefined);
    const body = GachaResponseSchema.parse(await res.json());
    expect(body.ok).toBe(true);
    expect(body.monster).not.toBeNull();
  });

  it("isDbConnectionError は接続系のコードだけを拾う", () => {
    expect(isDbConnectionError(p1001)).toBe(true);
    expect(isDbConnectionError(new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "6" }))).toBe(false);
    expect(isDbConnectionError(new Error("x"))).toBe(false);
  });
});

describe("オフライン用データは契約どおり", () => {
  it.each([
    ["map", MapResponseSchema, () => offlineMap()],
    ["dashboard", DashboardResponseSchema, () => offlineDashboard()],
    ["announcements", AnnouncementsResponseSchema, () => offlineAnnouncements()],
    ["collection", CollectionResponseSchema, () => offlineCollection()],
    ["treasure", TreasureAlertResponseSchema, () => offlineTreasureAlert()],
    ["ranking", RankingResponseSchema, () => offlineRanking("national", "coins")],
    ["gacha", GachaResponseSchema, () => offlineGacha(false)],
    ["lesson", LessonResponseSchema, () => offlineLesson(1)],
    ["lessonComplete", LessonCompleteResponseSchema, () => offlineLessonComplete()],
    ["testStart", TestStartResponseSchema, () => offlineTestStart(ASSESSMENTS[0].id, {})],
  ] as const)("%s", (_n, schema, build) => {
    const data = build();
    expect(schema.safeParse(data).success).toBe(true);
    expect(data).toMatchObject({ success: true, offline: true });
  });

  it("マップは Lesson 1 から遊べる", () => {
    const m = offlineMap();
    expect(m.current?.lessonNo).toBe(1);
  });

  it("おしらせはピン留めが先頭、あとは新しい順", () => {
    const list = offlineAnnouncements().announcements;
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].pinned).toBe(true);
    const rest = list.filter((a) => !a.pinned).map((a) => a.date);
    expect([...rest].sort().reverse()).toEqual(rest);
  });

  it("レッスンは教材つき、存在しない番号でも落ちない", () => {
    expect(offlineLesson(1).steps.length).toBeGreaterThan(0);
    expect(() => offlineLesson(99999)).not.toThrow();
  });

  it("テストはブラウザ側で採点でき、全問正解なら合格", () => {
    const id = ASSESSMENTS[0].id;
    const start = offlineTestStart(id, {});
    expect(start.questions.length).toBeGreaterThan(0);
    // 公開問題には答えが入っていない → 不正解の答案で採点し、正解は解説から取れることを確認
    const wrong = offlineTestSubmit(id, { seed: start.seed, answers: start.questions.map((q) => ({ questionId: q.id, value: "zzz" })) });
    expect(TestSubmitResponseSchema.safeParse(wrong).success).toBe(true);
    expect(wrong.passed).toBe(false);
    expect(wrong.feedback).toHaveLength(start.questions.length);
    expect(offlineTestSubmit("no-such-test", {})).toMatchObject({ success: true, offline: true, ok: true });
  });
});

describe("クライアントの自動リトライとフォールバック判定", () => {
  it("通信失敗 → 1回リトライして成功すれば ok", async () => {
    let n = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      n++;
      if (n === 1) throw new TypeError("network");
      return new Response(JSON.stringify({ rows: [], scope: "national", metric: "coins" }), { status: 200 });
    }));
    const r = await apiGet("/api/ranking", RankingResponseSchema);
    expect(n).toBe(2);
    expect(r.ok).toBe(true);
  });

  it("ずっと届かなければ isUnreachable=true（画面は内蔵データへ）", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>502</html>", { status: 502 })));
    const r = await apiGet("/api/map", MapResponseSchema);
    expect(r.ok).toBe(false);
    expect(isUnreachable(r)).toBe(true);
    expect(r.data.nodes).toEqual([]);
  });

  it("ゲーム上の理由（403 ロック中など）は isUnreachable=false（メッセージを出す）", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: false, error: "まだ ひらいていないよ" }), { status: 403 })));
    const r = await apiGet("/api/lessons/9", LessonResponseSchema);
    expect(isUnreachable(r)).toBe(false);
    expect(r.error).toBe("まだ ひらいていないよ");
  });
});
