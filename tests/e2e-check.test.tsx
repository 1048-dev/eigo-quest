/**
 * run10 Phase 4: クリックの ロボット（npm run check:e2e）の しかけと 部品の テスト。
 *  - テストの しかけ（正解を data-e2e-* に 出す）は E2E=1 の ときだけ。ふつうは 画面にも API にも 出ない
 *  - E2E の ビルドは .next-e2e に 出す・本番（Vercel）では E2E=1 を こばむ
 *  - テスト用の 時計（scripts/e2e/clock-preload.cjs）で サーバーの Date が すすむ
 *  - 電波が ない ときの 書きとりは この 端末で 採点する（まえは いつも「うまく採点できなかったよ」）
 *  - レッスンの えらびかた・範囲・ビルドの しらべかた・レポート
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QuestionView, SpeakButton } from "@/components/test/QuestionView";
import { SchoolExpressions, localGrade } from "@/components/lesson/LessonSteps";
import { e2eAnswersOf, offlineTestStart, prefetchOfflineTest } from "@/lib/offline/tests";
import { TestRunner } from "@/components/test/TestRunner";
import { buildTestQuestions, toPublic } from "@/lib/curriculum/questions";
import { getAssessment, getLesson, itemsInRange } from "@/lib/curriculum";
import { e2eHooks } from "@/lib/e2e";
import { TestStartResponseSchema } from "@/lib/api/contracts";
import { ERROR_TEXT, HOOK_MARKER, lessonForWorld, parseRange, renderE2eReport, scanForHook } from "../scripts/lib/e2eReport";

const ROOT = path.resolve(__dirname, "..");
const prevE2E = process.env.E2E;
afterEach(() => {
  if (prevE2E === undefined) delete process.env.E2E;
  else process.env.E2E = prevE2E;
});

const mini = getAssessment("mini-1-5")!;
const questions = buildTestQuestions(mini, { seed: 7 });
const choice = questions.find((q) => q.choices && q.choices.length > 1)!;

describe("テストの しかけは E2E=1 の ときだけ", () => {
  it("ふつう（E2E なし）: QuestionView に data-e2e が 出ない（e2eAnswer を わたしても）", () => {
    delete process.env.E2E;
    expect(e2eHooks()).toBe(false);
    const html = renderToStaticMarkup(<QuestionView q={toPublic(choice)} onAnswer={() => {}} e2eAnswer={choice.answer} />);
    expect(html).not.toContain(HOOK_MARKER);
    expect(renderToStaticMarkup(<SpeakButton target="Hello." itemId="a1" onDone={() => {}} />)).not.toContain(HOOK_MARKER);
  });

  it("E2E=1: 正解の 選択肢に data-e2e-correct、問題に data-e2e-answer / data-e2e-type", () => {
    process.env.E2E = "1";
    const html = renderToStaticMarkup(<QuestionView q={toPublic(choice)} onAnswer={() => {}} e2eAnswer={choice.answer} />);
    expect(html).toContain(`data-e2e-answer="${choice.answer}"`);
    expect(html).toContain(`data-e2e-type="${choice.type}"`);
    expect(html.match(/data-e2e-correct="1"/g)?.length).toBe(1);
    const right = choice.choices!.find((c) => c.id === choice.answer)!.label;
    expect(html).toMatch(new RegExp(`data-e2e-correct="1"[^>]*>${right.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<`));
    expect(renderToStaticMarkup(<SpeakButton target="Hello." itemId="a1" onDone={() => {}} />)).toContain('data-e2e-say="Hello."');
  });

  it("学校の 書きとり: E2E=1 の ときだけ こたえを data-e2e-answer に。入力欄には 名前（aria-label）", () => {
    const lesson = getLesson(1)!;
    const items = itemsInRange(1, 1);
    const core = items.find((i) => i.schoolCore)!;
    delete process.env.E2E;
    const plain = renderToStaticMarkup(<SchoolExpressions items={items} testPoints={lesson.school.testPoints ?? []} onDone={() => {}} />);
    expect(plain).not.toContain(HOOK_MARKER);
    expect(plain).toContain(`aria-label="「${core.ja}」を えいごで かく"`);
    process.env.E2E = "1";
    const hooked = renderToStaticMarkup(<SchoolExpressions items={items} testPoints={lesson.school.testPoints ?? []} onDone={() => {}} />);
    expect(hooked).toContain(`data-e2e-answer="${core.text.replace(/'/g, "&#x27;")}"`);
  });

  it("テストの 出題: ふつうは e2eAnswers を 返さない・E2E=1 なら 問題 id → 正解", () => {
    delete process.env.E2E;
    expect(e2eAnswersOf(questions)).toEqual({});
    expect(offlineTestStart("mini-1-5", {}).e2eAnswers).toBeUndefined();
    process.env.E2E = "1";
    const a = e2eAnswersOf(questions).e2eAnswers!;
    expect(Object.keys(a)).toHaveLength(questions.length);
    for (const q of questions) expect(a[q.id]).toBe(q.answer);
    const off = offlineTestStart("mini-1-5", {});
    expect(Object.keys(off.e2eAnswers ?? {})).toHaveLength(off.questions.length);
    // ブラウザの 形（zod）でも のこる
    expect(TestStartResponseSchema.parse({ success: true, assessment: mini, seed: 1, questions: [], e2eAnswers: a }).e2eAnswers).toEqual(a);
  });

  it("画面と API の コードは その場で process.env.E2E を みる（べつの 関数だと 本番の ビルドで 消えない）", () => {
    for (const f of ["src/components/test/QuestionView.tsx", "src/components/lesson/LessonSteps.tsx", "src/lib/offline/tests.ts"]) {
      const src = readFileSync(path.join(ROOT, f), "utf8");
      expect(src, f).not.toContain("e2eHooks(");
      for (const m of src.matchAll(/"data-e2e-[a-z]+"/g)) {
        const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index));
        expect(line, `${f}: ${line.trim()}`).toMatch(/process\.env\.E2E === "1"/);
      }
    }
  });
});

describe("next.config: E2E の ビルド", () => {
  const load = async (env: Record<string, string | undefined>) => {
    const keep = { E2E: process.env.E2E, VERCEL: process.env.VERCEL, VERCEL_ENV: process.env.VERCEL_ENV };
    for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
    vi.resetModules();
    try {
      return (await import("../next.config")).default;
    } finally {
      for (const [k, v] of Object.entries(keep)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  };
  it("ふつうは .next・env.E2E は \"0\"", async () => {
    const c = await load({ E2E: undefined, VERCEL: undefined, VERCEL_ENV: undefined });
    expect(c.distDir).toBe(".next");
    expect(c.env).toEqual({ E2E: "0" });
  });
  it("E2E=1 は .next-e2e・env.E2E は \"1\"", async () => {
    const c = await load({ E2E: "1", VERCEL: undefined, VERCEL_ENV: undefined });
    expect(c.distDir).toBe(".next-e2e");
    expect(c.env).toEqual({ E2E: "1" });
  });
  it("Vercel で E2E=1 なら ビルドを とめる", async () => {
    await expect(load({ E2E: "1", VERCEL: "1", VERCEL_ENV: "production" })).rejects.toThrow(/テスト用の ビルド/);
  });
  it(".next-e2e は git に 入れない・tsconfig の include に ある", () => {
    expect(readFileSync(path.join(ROOT, ".gitignore"), "utf8")).toMatch(/^\.next-e2e$/m);
    expect(readFileSync(path.join(ROOT, "tsconfig.json"), "utf8")).toContain(".next-e2e/types/**/*.ts");
  });
});

describe("テスト用の 時計（scripts/e2e/clock-preload.cjs）", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "eq-clock-"));
  const file = path.join(dir, "clock.json");
  const probe = "const a=Date.now();const d=new Date();console.log(JSON.stringify({now:a,date:d.getTime(),zero:new Date(0).getTime(),inst:d instanceof Date,str:typeof Date(),utc:Date.UTC(2020,0,1)}))";
  const run = (env: Record<string, string>) => {
    const r = spawnSync(process.execPath, ["-r", path.join(ROOT, "scripts", "e2e", "clock-preload.cjs"), "-e", probe], { env: { ...process.env, ...env }, encoding: "utf8", timeout: 20_000 });
    return { ...JSON.parse(r.stdout.trim()), real: Date.now() } as { now: number; date: number; zero: number; inst: boolean; str: string; utc: number; real: number };
  };
  it("offsetMs だけ Date.now() と new Date() が すすむ（ほかの 使いかたは そのまま）", () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, JSON.stringify({ offsetMs: 86_400_000 }));
    const r = run({ E2E_CLOCK_FILE: file });
    expect(r.now - r.real).toBeGreaterThan(86_400_000 - 60_000);
    expect(r.now - r.real).toBeLessThan(86_400_000 + 60_000);
    expect(Math.abs(r.date - r.now)).toBeLessThan(1000);
    expect(r.zero).toBe(0);
    expect(r.inst).toBe(true);
    expect(r.str).toBe("string");
    expect(r.utc).toBe(Date.UTC(2020, 0, 1));
  });
  it("E2E_CLOCK_FILE が なければ なにもしない", () => {
    const r = run({ E2E_CLOCK_FILE: "" });
    expect(Math.abs(r.now - r.real)).toBeLessThan(60_000);
  });
});

describe("電波が ない ときの 書きとり（run10 P4 で 見つけた）", () => {
  it("この 端末の ルール採点で、お手本どおりなら 合格", () => {
    expect(localGrade("Hello.", "Hello.").verdict).toBe("PASS");
    expect(localGrade("Hello.", "hello").verdict).not.toBe("WRONG");
    expect(localGrade("Hello.", "Goodbye.").verdict).toBe("WRONG");
  });
  it("SchoolExpressions は つながらない とき localGrade を つかう", () => {
    const src = readFileSync(path.join(ROOT, "src/components/lesson/LessonSteps.tsx"), "utf8");
    expect(src).toMatch(/isUnreachable\(res\) \? localGrade\(target\.text, text\) : res\.data/);
  });
});

describe("とちゅうで 電波が なくなった テスト（run10 P4 で 見つけた）", () => {
  it("さいてんに 失敗したら こたえを のこして「もう一回 さいてん」（まえは さいごの 問題に もどるだけ）", () => {
    const session = offlineTestStart("mini-1-5", {});
    const html = renderToStaticMarkup(<TestRunner assessmentId="mini-1-5" initial={{ session: { ...session, assessment: session.assessment! }, idx: session.questions.length - 1, submitFailed: true }} />);
    expect(html).toContain("でんぱが とどかないみたい");
    expect(html).toContain("もう一回 さいてん");
    expect(html).toContain("こたえは ぜんぶ のこっているよ");
    for (const re of ERROR_TEXT) expect(html).not.toMatch(re);
  });
  it("出題の あと 範囲の データを 先に 読む（2 ワールドまで。1〜n の ボスは 読まない）", async () => {
    expect(await prefetchOfflineTest("mini-1-5")).toBe(true);
    expect(await prefetchOfflineTest("check-31")).toBe(true);
    expect(await prefetchOfflineTest("boss-1-30")).toBe(true);
    expect(await prefetchOfflineTest("boss-1-90")).toBe(false);
    expect(await prefetchOfflineTest("nope")).toBe(false);
    const src = readFileSync(path.join(ROOT, "src/components/test/TestRunner.tsx"), "utf8");
    expect(src).toMatch(/void prefetchOfflineTest\(assessmentId\)/);
    expect(src).toMatch(/\.catch\(\(\) => setSubmitFailed\(true\)\)/);
  });
});

describe("check:e2e の 部品", () => {
  it("ワールドごとの レッスン: ワールドの 中の 位置を ずらす（1〜30 ぜんぶ）", () => {
    const ls = Array.from({ length: 40 }, (_, i) => lessonForWorld(i + 1));
    expect(ls.slice(0, 3)).toEqual([1, 32, 63]);
    expect(ls[29]).toBe(900);
    expect(ls[39]).toBe(1180);
    ls.forEach((n, i) => expect(Math.ceil(n / 30)).toBe(i + 1));
    expect(new Set(ls.map((n) => ((n - 1) % 30) + 1)).size).toBe(30);
  });
  it("範囲の かきかた", () => {
    expect(parseRange("1-3,5,3,41", 40)).toEqual([1, 2, 3, 5]);
    expect(parseRange("40-38", 40)).toEqual([38, 39, 40]);
    expect(() => parseRange("x", 40)).toThrow();
  });
  it("ビルドの JS から しかけを さがす", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "eq-scan-"));
    mkdirSync(path.join(dir, "chunks"));
    writeFileSync(path.join(dir, "chunks", "a.js"), "x");
    writeFileSync(path.join(dir, "chunks", "b.js"), '{"data-e2e-answer":1}');
    writeFileSync(path.join(dir, "c.css"), "data-e2e");
    expect(scanForHook(dir)).toEqual({ files: 2, hits: [path.join("chunks", "b.js")] });
    expect(scanForHook(path.join(dir, "nope"))).toEqual({ files: 0, hits: [] });
  });
  it("レポート: 表・ワールド・失敗の スクリーンショット", () => {
    const md = renderE2eReport({
      started: new Date("2026-11-27T00:00:00Z"), totalMs: 61_000, only: ["worlds"], command: "npm run check:e2e",
      sections: [{ name: "worlds", ok: 5, ng: 1, ms: 30_000, failures: [{ label: "W2 L32: クリア", detail: "a|b", shot: "01-x.png" }], notes: [] }],
      worlds: [{ world: 2, lessonNo: 32, viewport: "390x844", ok: false, steps: "quiz:8 問", coins: "🪙 +30", ms: 40_000, note: "" }],
    });
    expect(md).toContain("**FAIL**（確認 5 OK / 1 NG）");
    expect(md).toContain("| 2 | L32 | 390x844 | ❌ | quiz:8 問 | 🪙 +30 | 40s |");
    expect(md).toContain("a／b");
    expect(md).toContain("(e2e-failures/01-x.png)");
  });
});
