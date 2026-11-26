/**
 * run8: ワールド13〜40 の フォニックス問題を ワールドごとに あとから 読む しくみ。
 * ブラウザでは bundledPhonics が 空に 差しかわる（next.config.ts）ので、ここでも 空に して ためす。
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const EMPTY = { BUNDLED_PHONICS: [] };

afterEach(() => {
  vi.doUnmock("@/lib/curriculum/bundledPhonics");
  vi.resetModules();
});

async function serverModules() {
  vi.resetModules();
  vi.doUnmock("@/lib/curriculum/bundledPhonics");
  const q = await import("@/lib/curriculum/questions");
  const c = await import("@/lib/curriculum");
  return { q, c };
}

async function browserModules() {
  vi.resetModules();
  vi.doMock("@/lib/curriculum/bundledPhonics", () => EMPTY);
  const q = await import("@/lib/curriculum/questions");
  const c = await import("@/lib/curriculum");
  const w = await import("@/lib/curriculum/phonicsWorlds");
  return { q, c, w };
}

describe("フォニックス問題の あとから 読み", () => {
  it("ワールドの はじめ（WNN_START）は (N-1)*30+1、登録の 順も 13〜40", async () => {
    const { BUNDLED_PHONICS } = await import("@/lib/curriculum/bundledPhonics");
    expect(BUNDLED_PHONICS.map((p) => p.world)).toEqual(Array.from({ length: 28 }, (_, i) => i + 13));
    for (const p of BUNDLED_PHONICS) expect(p.start, `w${p.world}`).toBe((p.world - 1) * 30 + 1);
  });

  it("phonicsWorldsFor: ワールド12 までは なし、L361 は 13 だけ、L1200 は 13〜40", async () => {
    const { phonicsWorldsFor } = await import("@/lib/curriculum/phonicsWorlds");
    expect(phonicsWorldsFor(360)).toEqual([]);
    expect(phonicsWorldsFor(361)).toEqual([13]);
    expect(phonicsWorldsFor(420)).toEqual([13, 14]);
    expect(phonicsWorldsFor(1200)).toHaveLength(28);
  });

  it("読む まえは エラー（だまって ちがう 問題に しない）、ワールド12 までは そのまま 作れる", async () => {
    const { q, c } = await browserModules();
    expect(() => q.buildLessonFlow(c.getLesson(1000)!)).toThrow(/not loaded/);
    expect(() => q.buildLessonFlow(c.getLesson(300)!)).not.toThrow();
  });

  it("読んだ あとは サーバー（ぜんぶ 同期で 登録）と まったく おなじ レッスン・テストに なる", async () => {
    const lessons = [361, 450, 751, 905, 1111, 1200];
    const { q: sq, c: sc } = await serverModules();
    const server = lessons.map((n) => sq.buildLessonFlow(sc.getLesson(n)!));
    const boss = sc.ASSESSMENTS.filter((a) => a.rangeEnd > 360).slice(-3);
    const serverTests = boss.map((a) => sq.buildTestQuestions(a, { seed: 7 }));

    const { q, c, w } = await browserModules();
    for (const n of lessons) await w.ensurePhonicsLoaded(n);
    for (const a of boss) await w.ensurePhonicsLoaded(a.rangeEnd);
    expect(lessons.map((n) => q.buildLessonFlow(c.getLesson(n)!))).toEqual(server);
    expect(boss.map((a) => q.buildTestQuestions(a, { seed: 7 }))).toEqual(serverTests);
  });

  it("その回の ワールドまで だけ 読む（L450 で ワールド15 より あとは 読まない）", async () => {
    const { w } = await browserModules();
    await w.ensurePhonicsLoaded(450);
    expect(w.worldPhonics(13)).toBeDefined();
    expect(w.worldPhonics(15)).toBeDefined();
    expect(w.worldPhonics(16)).toBeUndefined();
  });

  it("フォニックスの ステップに ボタンの おてほん（examples）が focus と おなじ かずで 入る", async () => {
    const { q, c } = await serverModules();
    const { focusExampleWord } = await import("@/lib/curriculum/phonicsButtons");
    for (const n of [5, 400, 800, 1200]) {
      const l = c.getLesson(n)!;
      const step = q.buildLessonFlow(l).find((s) => s.kind === "phonics");
      if (step?.kind !== "phonics") throw new Error("no phonics step");
      expect(step.examples).toEqual(l.phonics.focus.map((f) => focusExampleWord(f, l.phonics.words)));
    }
  });
});
