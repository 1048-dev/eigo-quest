/**
 * run7 P-yearly: おためしモード（サーバーに つながらない）でも 力だめしが 受けられる。
 *  - この ブラウザで クリアした レッスンで ステージを きめる
 *  - この ブラウザで ルール採点して localStorage に のこす。おためしは 1 回だけ
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import stage1 from "@content/yearly/stage-1.json";
import type { YearlyAnswers, YearlyTest } from "@/lib/yearly/types";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, String(v)); }
  removeItem(k: string) { this.data.delete(k); }
  clear() { this.data.clear(); }
}

const storage = new MemoryStorage();
(globalThis as { window?: unknown }).window = { localStorage: storage };

const local = await import("@/lib/yearly/localYearly");
const client = await import("@/lib/yearly/client");
const { buildResult } = await import("@/lib/yearly/scoring");
const { LOCAL_PROGRESS_KEY } = await import("@/lib/offline/localProgress");

const t1 = stage1 as unknown as YearlyTest;
const right: YearlyAnswers = { choices: Object.fromEntries([...t1.listening, ...t1.reading].map((i) => [i.id, i.answer])), speaking: {} };

describe("この ブラウザの 力だめしの きろく", () => {
  beforeEach(() => storage.clear());

  it("こわれた値は「なにも ない」", () => {
    expect(local.parseLocalYearly(null)).toEqual([]);
    expect(local.parseLocalYearly("{oops")).toEqual([]);
    expect(local.parseLocalYearly(JSON.stringify({ results: [{ stage: 1 }, "x"] }))).toEqual([]);
  });

  it("保存して 読める（新しい 順・同じ日は 上書き）", () => {
    const a = buildResult(t1, right, "2026-01-10");
    const b = buildResult(t1, { choices: {}, speaking: {} }, "2026-11-20");
    local.saveLocalYearly(a);
    local.saveLocalYearly(b);
    local.saveLocalYearly({ ...b, total: 5 });
    const list = local.readLocalYearly();
    expect(list.map((r) => r.takenOn)).toEqual(["2026-11-20", "2026-01-10"]);
    expect(list[0].total).toBe(5);
  });
});

describe("おためしモード（サーバーに つながらない）", () => {
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("この ブラウザで クリアした レッスンで ステージを きめ、まだ なら 受けられる", async () => {
    storage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify({ lessons: { "1": "2026-11-01", "430": "2026-11-10" }, tests: {} }));
    const st = await client.loadYearlyState();
    expect(st).toMatchObject({ offline: true, stage: 2, reachedLesson: 430, isTrial: true, availability: { available: true }, history: [] });
  });

  it("この ブラウザで 採点して のこす（サーバーに 送らない）→ 2 回目は 受けられない", async () => {
    const fetchMock = vi.fn(async () => { throw new TypeError("Failed to fetch"); });
    vi.stubGlobal("fetch", fetchMock);
    const r = await client.submitYearlyTest(t1, right, true);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.saved).toBe(false);
    expect(r.result.scores.listening).toBe(100);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(local.readLocalYearly()).toHaveLength(1);
    const st = await client.loadYearlyState();
    expect(st.availability).toEqual({ available: false, reason: "TRIAL_USED" });
    expect(st.history[0]).toMatchObject({ stage: 1, takenOn: r.result.takenOn });
  });

  it("つながっている つもりでも サーバーに とどかなければ この ブラウザで 採点", async () => {
    const r = await client.submitYearlyTest(t1, right, false);
    expect(r).toMatchObject({ ok: true, saved: false });
    expect(local.readLocalYearly()).toHaveLength(1);
  });

  it("サーバーが「もう 受けた」（409）と 言ったら 採点しない", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ success: false, ok: false, error: "つぎの 力だめしは 2027年11月25日 から 受けられるよ。" }), { status: 409 })));
    const r = await client.submitYearlyTest(t1, right, false);
    expect(r).toEqual({ ok: false, messageJa: "つぎの 力だめしは 2027年11月25日 から 受けられるよ。" });
    expect(local.readLocalYearly()).toHaveLength(0);
  });

  it("サーバーで 保存できたら その 結果と のびを つかう（この ブラウザには のこさない）", async () => {
    const result = buildResult(t1, right, "2026-11-25");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ success: true, ok: true, saved: true, result, growth: null, messageJa: "けっかを きろくしたよ！" }), { status: 200 })));
    const r = await client.submitYearlyTest(t1, right, false);
    expect(r).toMatchObject({ ok: true, saved: true, growth: null, result: { band: result.band, total: result.total } });
    expect(local.readLocalYearly()).toHaveLength(0);
  });
});
