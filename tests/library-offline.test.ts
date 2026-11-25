/**
 * run7 P-library: おためしモード（サーバーに つながらない）でも としょかんが 動く。
 *  - この ブラウザで クリアした レッスンで ひらく
 *  - 1日1回の スタンプは localStorage に のこる（コインは サーバーが あるときだけ）
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import stories1 from "@content/library/stories-1.json";
import type { Story } from "@/lib/library/types";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
}

const storage = new MemoryStorage();
(globalThis as { window?: unknown }).window = { localStorage: storage };

const local = await import("@/lib/library/localLibrary");
const client = await import("@/lib/library/client");
const { LOCAL_PROGRESS_KEY } = await import("@/lib/offline/localProgress");

const s1 = (stories1.stories as Story[])[0];
const right = s1.questions.map((q) => q.answer);
const day1 = new Date("2026-11-20T03:00:00Z");
const day2 = new Date("2026-11-21T03:00:00Z");

describe("この ブラウザの としょかんの きろく", () => {
  beforeEach(() => storage.clear());

  it("こわれた値・ない値は「なにも ない」（例外に しない）", () => {
    expect(local.parseLocalLibrary(null)).toEqual(local.emptyLibrary());
    expect(local.parseLocalLibrary("{not json")).toEqual(local.emptyLibrary());
    expect(local.parseLocalLibrary(JSON.stringify({ stories: { a: { best: "x" } }, stamps: ["2026-01-01", "bad", 3, "2026-01-01"], chants: { c: "nope" } })))
      .toEqual({ stories: {}, chants: {}, talks: {}, stamps: ["2026-01-01"] });
  });

  it("おはなしに 合格 → スタンプ。同じ日の 2回目は スタンプなし。つぎの日は また おせる", () => {
    const a = local.recordLocalActivity({ kind: "story", id: s1.id, answers: right }, s1, day1);
    expect(a).toMatchObject({ completed: true, stampedNow: true });
    const b = local.recordLocalActivity({ kind: "chant", id: "c-01", finished: true }, null, day1);
    expect(b).toMatchObject({ completed: true, stampedNow: false });
    const lib = local.readLocalLibrary();
    expect(lib.stamps).toEqual(["2026-11-20"]);
    expect(lib.stories[s1.id]).toEqual({ best: 3, date: "2026-11-20" });
    expect(lib.chants["c-01"]).toBe("2026-11-20");
    expect(local.hasStampToday(lib, day1)).toBe(true);
    expect(local.hasStampToday(lib, day2)).toBe(false);
    expect(local.recordLocalActivity({ kind: "talk", id: "t-food", turns: 4 }, null, day2).stampedNow).toBe(true);
    expect(local.stampStreak(local.readLocalLibrary(), day2)).toBe(2);
    expect(local.stampsThisMonth(local.readLocalLibrary(), day2)).toBe(2);
  });

  it("不合格は スタンプなし。でも よんだ きろく（いちばん よかった 正解数）は のこる", () => {
    const wrong = s1.questions.map((q) => (q.answer + 1) % 3);
    expect(local.recordLocalActivity({ kind: "story", id: s1.id, answers: wrong }, s1, day1)).toMatchObject({ completed: false, stampedNow: false });
    expect(local.readLocalLibrary().stories[s1.id].best).toBe(0);
    local.recordLocalActivity({ kind: "story", id: s1.id, answers: right }, s1, day1);
    local.recordLocalActivity({ kind: "story", id: s1.id, answers: wrong }, s1, day1);
    expect(local.readLocalLibrary().stories[s1.id].best).toBe(3);
    expect(local.readStoryIds(local.readLocalLibrary()).has(s1.id)).toBe(true);
  });

  it("れんぞく日数: きのう まで つづいていれば 数える。1日 あいたら 0 から", () => {
    const lib = { ...local.emptyLibrary(), stamps: ["2026-11-18", "2026-11-19", "2026-11-20"] };
    expect(local.stampStreak(lib, day1)).toBe(3);
    expect(local.stampStreak(lib, day2)).toBe(3);
    expect(local.stampStreak(lib, new Date("2026-11-23T03:00:00Z"))).toBe(0);
  });
});

describe("おためしモードの 画面の データ（サーバーに つながらない）", () => {
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("この ブラウザで クリアした レッスンで ひらく（offline:true・コイン 0）", async () => {
    storage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify({ lessons: { "1": "2026-11-01", "95": "2026-11-10", "40": "2026-11-05" }, tests: {} }));
    const st = await client.loadLibraryState();
    expect(st).toMatchObject({ offline: true, reachedLesson: 95, coins: 0, rewardedToday: false, dailyCoins: 5 });
  });

  it("おえたら スタンプ（サーバーには 送らない）。2回目は「もう もらったよ」", async () => {
    const fetchMock = vi.fn(async () => { throw new TypeError("Failed to fetch"); });
    vi.stubGlobal("fetch", fetchMock);
    const r1 = await client.finishActivity({ kind: "story", id: s1.id, answers: right }, s1, true);
    expect(r1).toMatchObject({ completed: true, stampedNow: true, coinsAwarded: 0 });
    expect(r1.messageJa).toContain("スタンプ");
    const r2 = await client.finishActivity({ kind: "chant", id: "c-01", finished: true }, null, true);
    expect(r2).toMatchObject({ completed: true, stampedNow: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await client.loadLibraryState()).rewardedToday).toBe(true);
  });

  it("つながっている ときは サーバーの コインも 表示（サーバーが 5コイン と こたえた）", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ success: true, ok: true, coinsAwarded: 5, completed: true, saved: true }), { status: 200 })));
    const r = await client.finishActivity({ kind: "story", id: s1.id, answers: right }, s1, false);
    expect(r).toMatchObject({ completed: true, stampedNow: true, coinsAwarded: 5 });
    expect(r.messageJa).toContain("🪙+5");
  });
});
