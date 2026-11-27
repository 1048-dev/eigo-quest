/**
 * run10 Phase 1: npm run check:all の 部品（next build の 表の 読みとり・予算・数の とりだし・レポート）。
 */
import { describe, expect, it } from "vitest";
import {
  buildCount, checkBudget, checkMarkCount, englishLintCount, englishLintErrors, fmtMs, overall, parseBuildRoutes,
  renderConsoleTable, renderReport, summaryLine, toKb, tscCount, vitestCount, type StepResult,
} from "../scripts/lib/checkAll";
import { assertSafeDbUrl, checkDbUrl } from "../scripts/lib/checkDb";
import { BUDGETS_KB } from "../scripts/bundle-budget";
import { skipUrl, urlPattern } from "../scripts/link-check";

const BUILD = `
Route (app)                                 Size  First Load JS
┌ ƒ /                                      174 B         106 kB
├ ƒ /api/map                               274 B         103 kB
├ ○ /map                                 9.23 kB         193 kB
├ ƒ /lesson/[lessonNo]                   11.1 kB         197 kB
└ ○ /yearly                              14.5 kB         1.2 MB
+ First Load JS shared by all             102 kB
  ├ chunks/1684-e6877fa3e7e67068.js      45.9 kB
ƒ Middleware                               34 kB
`;

describe("next build の 表", () => {
  it("ページごとの First Load JS を kB で とりだす（B・kB・MB）", () => {
    const r = parseBuildRoutes(BUILD);
    expect(r.map((x) => x.route)).toEqual(["/", "/api/map", "/map", "/lesson/[lessonNo]", "/yearly"]);
    expect(r.find((x) => x.route === "/map")).toEqual({ route: "/map", sizeKb: 9.23, firstLoadKb: 193 });
    expect(r[0].sizeKb).toBeCloseTo(0.174);
    expect(r.at(-1)!.firstLoadKb).toBe(1200);
    expect(buildCount(BUILD)).toBe("5 routes");
  });
  it("色の エスケープが あっても 読める", () => {
    expect(parseBuildRoutes("├ \u001b[36mƒ\u001b[39m /map    9.23 kB   \u001b[1m193 kB\u001b[22m")).toHaveLength(1);
  });
  it("chunks や Middleware の 行は ページに しない", () => {
    expect(parseBuildRoutes("  ├ chunks/a.js  45.9 kB\nƒ Middleware   34 kB")).toEqual([]);
  });
  it("toKb は 知らない 単位で 失敗", () => {
    expect(() => toKb("1", "GB")).toThrow();
  });
});

describe("JS の 予算", () => {
  it("/map と /lesson は 230 kB", () => {
    expect(BUDGETS_KB).toEqual({ "/map": 230, "/lesson/[lessonNo]": 230 });
  });
  it("こえたら ok:false・見つからない ページも ok:false", () => {
    const routes = parseBuildRoutes(BUILD);
    expect(checkBudget(routes, { "/map": 230, "/lesson/[lessonNo]": 196, "/nope": 100 })).toEqual([
      { route: "/map", firstLoadKb: 193, budgetKb: 230, ok: true },
      { route: "/lesson/[lessonNo]", firstLoadKb: 197, budgetKb: 196, ok: false },
      { route: "/nope", firstLoadKb: null, budgetKb: 100, ok: false },
    ]);
  });
});

describe("数の とりだし", () => {
  it("vitest", () => {
    expect(vitestCount(" Test Files  90 passed (90)\n      Tests  812 passed (812)\n")).toBe("812 passed / 812 tests（90 files）");
    expect(vitestCount(" Test Files  1 failed | 89 passed (90)\n      Tests  2 failed | 810 passed (812)\n")).toBe("2 failed | 810 passed / 812 tests（90 files）");
    expect(vitestCount("nothing")).toBe("");
  });
  it("tsc", () => {
    expect(tscCount("")).toBe("0 errors");
    expect(tscCount("a.ts(1,2): error TS2322: x\nb.ts(3,4): error TS2345: y")).toBe("2 errors");
  });
  it("english:lint", () => {
    const log = "english:lint all: 98,765 strings in 1,339 units\n  error 0 / warn 2 / info 5\n";
    expect(englishLintCount(log)).toBe("98,765 strings / 1,339 units・error 0 warn 2 info 5");
    expect(englishLintErrors(log)).toBe(0);
    expect(englishLintErrors("error 3 / warn 0 / info 0")).toBe(3);
    expect(englishLintErrors("?")).toBeNull();
  });
  it("✓ ✗ の 行と CHECK-SUMMARY", () => {
    expect(checkMarkCount("  ✓ a\n  ✔ b\n  ✗ c\nx ✓ d")).toBe("2 OK / 1 NG");
    expect(summaryLine("…\nCHECK-SUMMARY: 26 pages・critical/serious 0\n")).toBe("26 pages・critical/serious 0");
    expect(summaryLine("no summary")).toBe("");
  });
});

describe("レポート", () => {
  const results: StepResult[] = [
    { name: "tsc", status: "PASS", count: "0 errors", ms: 41_000 },
    { name: "データの 確認（Phase 2）", status: "SKIP", count: "", ms: 2, note: "まだ ない" },
    { name: "vitest", status: "FAIL", count: "1 failed | 9 passed / 10 tests（2 files）", ms: 125_000, note: "a|b" },
  ];
  it("FAIL か TIMEOUT が あれば ぜんたいも FAIL（SKIP は FAIL に しない）", () => {
    expect(overall(results)).toBe("FAIL");
    expect(overall(results.slice(0, 2))).toBe("PASS");
    expect(overall([{ name: "x", status: "TIMEOUT", count: "", ms: 1 }])).toBe("FAIL");
  });
  it("時間の 書きかた", () => {
    expect([fmtMs(950), fmtMs(41_000), fmtMs(125_000)]).toEqual(["950ms", "41s", "2m05s"]);
  });
  it("Markdown の 表（| は エスケープ）", () => {
    const md = renderReport(results, { startedAt: new Date("2026-11-27T00:00:00Z"), commit: "abc test", command: "npm run check:all", totalMs: 166_002 });
    expect(md).toContain("| 1 | tsc | ✅ PASS | 0 errors | 41s |  |");
    expect(md).toContain("| 2 | データの 確認（Phase 2） | ⏭ SKIP | - | 2ms | まだ ない |");
    expect(md).toContain("a\\|b");
    expect(md).toContain("**FAIL**（1 PASS / 1 FAIL / 1 SKIP）");
  });
  it("端末の 表は 列が そろう（全角は 2 文字ぶん）", () => {
    const lines = renderConsoleTable(results).split("\n");
    expect(lines[0].startsWith("name")).toBe(true);
    expect(lines).toHaveLength(5);
    const col = (l: string) => { let w = 0; for (const ch of l.slice(0, l.indexOf(" PASS") >= 0 ? l.indexOf(" PASS") : l.search(/ (SKIP|FAIL)/))) w += /[^\x00-\x7f]/.test(ch) ? 2 : 1; return w; }; // eslint-disable-line no-control-regex
    expect(col(lines[2])).toBe(col(lines[3]));
  });
});

describe("確認用の DB", () => {
  it("ポート 5544 を つかい、5432（ほかの プロジェクト）は こばむ", () => {
    expect(checkDbUrl()).toContain(":5544/");
    expect(() => checkDbUrl(5432)).toThrow();
    expect(() => assertSafeDbUrl("postgresql://a:b@localhost:5432/x")).toThrow();
    expect(() => assertSafeDbUrl("postgresql://a:b@localhost/x")).toThrow();
    expect(() => assertSafeDbUrl("postgresql://a:b@127.0.0.1:5544/x")).not.toThrow();
  });
});

describe("内部リンク", () => {
  it("同じ かたちの URL を まとめる", () => {
    expect(urlPattern("http://x/lesson/12")).toBe("/lesson/:n");
    expect(urlPattern("http://x/recap/1200")).toBe("/recap/:n");
    expect(urlPattern("http://x/library/story/s3-07")).toBe("/library/story/:id");
    expect(urlPattern("http://x/test/mini-1-5")).toBe("/test/:id");
    expect(urlPattern("http://x/map")).toBe("/map");
  });
  it("API・外の サイトは しらべない", () => {
    const o = "http://localhost:3700";
    expect(skipUrl(new URL("/api/map", o), o)).toBe(true);
    expect(skipUrl(new URL("https://example.com/"), o)).toBe(true);
    expect(skipUrl(new URL("/terms", o), o)).toBe(false);
  });
});
