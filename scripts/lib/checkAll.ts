/**
 * run10 Phase 1: npm run check:all の 部品（ファイルや プロセスに さわらない 純粋な 関数。tests/check-all.test.ts で 確かめる）。
 */

export type StepStatus = "PASS" | "FAIL" | "SKIP" | "TIMEOUT";

export interface StepResult {
  name: string;
  status: StepStatus;
  /** 「1,200 レッスン」「812 tests」など 数の まとめ */
  count: string;
  ms: number;
  /** 失敗の わけ・SKIP の わけ（1行） */
  note?: string;
}

// ---------------------------------------------------------------------------
// next build の 出力（Route (app) の 表）
// ---------------------------------------------------------------------------

export interface RouteSize { route: string; sizeKb: number; firstLoadKb: number }

/** "9.23 kB" "274 B" "1.2 MB" → kB（Next の 表示と おなじ 1 kB = 1000 B） */
export function toKb(value: string, unit: string): number {
  const v = Number(value);
  if (unit === "B") return v / 1000;
  if (unit === "kB") return v;
  if (unit === "MB") return v * 1000;
  throw new Error(`知らない 単位: ${unit}`);
}

/** next build の 出力から ページごとの 大きさを とりだす（色の エスケープは 取りのぞく） */
export function parseBuildRoutes(log: string): RouteSize[] {
  // eslint-disable-next-line no-control-regex
  const clean = log.replace(/\u001b\[[0-9;]*m/g, "");
  const out: RouteSize[] = [];
  const re = /^[┌├└│ ]\s*[○ƒ●◐λ]?\s*(\/\S*)\s+([\d.]+)\s*(B|kB|MB)\s+([\d.]+)\s*(B|kB|MB)\s*$/u;
  for (const line of clean.split(/\r?\n/)) {
    const m = re.exec(line);
    if (!m) continue;
    out.push({ route: m[1], sizeKb: toKb(m[2], m[3]), firstLoadKb: toKb(m[4], m[5]) });
  }
  return out;
}

export interface BudgetRow { route: string; firstLoadKb: number | null; budgetKb: number; ok: boolean }

/** 予算（kB）を こえた ページ、または 表に 見つからない ページは ok:false */
export function checkBudget(routes: RouteSize[], budgets: Record<string, number>): BudgetRow[] {
  return Object.entries(budgets).map(([route, budgetKb]) => {
    const r = routes.find((x) => x.route === route);
    return { route, firstLoadKb: r?.firstLoadKb ?? null, budgetKb, ok: !!r && r.firstLoadKb <= budgetKb };
  });
}

// ---------------------------------------------------------------------------
// 各ステップの 出力から 数を とりだす
// ---------------------------------------------------------------------------

const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, ""); // eslint-disable-line no-control-regex

/** vitest: "Tests  812 passed (812)" / "Tests  2 failed | 810 passed (812)" / "Test Files  90 passed (90)" */
export function vitestCount(log: string): string {
  const t = stripAnsi(log);
  const files = /Test Files\s+(.+?)\s*\((\d+)\)/.exec(t);
  const tests = /\n\s*Tests\s+(.+?)\s*\((\d+)\)/.exec(t);
  if (!tests) return "";
  return `${tests[1].trim()} / ${tests[2]} tests（${files ? `${files[2]} files` : "?"}）`;
}

/** tsc: "error TS" の 行数 */
export function tscCount(log: string): string {
  const n = (stripAnsi(log).match(/error TS\d+/g) ?? []).length;
  return `${n} errors`;
}

/** english:lint: "english:lint all: 123 strings in 1300 units" と "error 0 / warn 2 / info 5" */
export function englishLintCount(log: string): string {
  const t = stripAnsi(log);
  const a = /(\d[\d,]*) strings in (\d[\d,]*) units/.exec(t);
  const b = /error (\d+) \/ warn (\d+) \/ info (\d+)/.exec(t);
  if (!a || !b) return "";
  return `${a[1]} strings / ${a[2]} units・error ${b[1]} warn ${b[2]} info ${b[3]}`;
}

/** english:lint の error の 数（数が とれなければ null） */
export function englishLintErrors(log: string): number | null {
  const b = /error (\d+) \/ warn/.exec(stripAnsi(log));
  return b ? Number(b[1]) : null;
}

/** next build: ページの 数 */
export function buildCount(log: string): string {
  const routes = parseBuildRoutes(log);
  return routes.length ? `${routes.length} routes` : "";
}

/** ✓ / ✔ ではじまる 行と ✗ / ✖ ではじまる 行の 数（スモーク・確認スクリプト共通） */
export function checkMarkCount(log: string): string {
  const lines = stripAnsi(log).split(/\r?\n/).map((l) => l.trim());
  const ok = lines.filter((l) => /^[✓✔]/.test(l)).length;
  const ng = lines.filter((l) => /^[✗✖]/.test(l)).length;
  return `${ok} OK / ${ng} NG`;
}

/** 確認スクリプトが さいごに 出す 1行「CHECK-SUMMARY: <まとめ>」を とりだす（なければ ""） */
export function summaryLine(log: string): string {
  const m = /^CHECK-SUMMARY:\s*(.+)$/m.exec(stripAnsi(log));
  return m ? m[1].trim() : "";
}

// ---------------------------------------------------------------------------
// レポート
// ---------------------------------------------------------------------------

export function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}

const MARK: Record<StepStatus, string> = { PASS: "✅ PASS", FAIL: "❌ FAIL", SKIP: "⏭ SKIP", TIMEOUT: "⏱ TIMEOUT" };

/** 端末に 出す 表（等幅で そろえる） */
export function renderConsoleTable(results: StepResult[]): string {
  const rows = results.map((r) => [r.name, r.status, r.count || "-", fmtMs(r.ms)]);
  const head = ["name", "result", "count", "time"];
  const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => width(r[i]))));
  const line = (cells: string[]) => cells.map((c, i) => c + " ".repeat(w[i] - width(c))).join("  ");
  return [line(head), w.map((n) => "-".repeat(n)).join("  "), ...rows.map(line)].join("\n");
}

/** 全角を 2 と かぞえる（表が ずれない ように） */
function width(s: string): number {
  let n = 0;
  for (const ch of s) n += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch) ? 2 : 1;
  return n;
}

export function overall(results: StepResult[]): "PASS" | "FAIL" {
  return results.some((r) => r.status === "FAIL" || r.status === "TIMEOUT") ? "FAIL" : "PASS";
}

export function renderReport(results: StepResult[], meta: { startedAt: Date; commit: string; command: string; totalMs: number; details?: string }): string {
  const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const o = overall(results);
  const skipped = results.filter((r) => r.status === "SKIP").length;
  const lines = [
    "# check:all レポート（さいごの 実行）",
    "",
    `- 日時: ${meta.startedAt.toISOString()}`,
    `- コミット: ${meta.commit}`,
    `- コマンド: \`${meta.command}\``,
    `- けっか: **${o}**（${results.filter((r) => r.status === "PASS").length} PASS / ${results.filter((r) => r.status === "FAIL" || r.status === "TIMEOUT").length} FAIL / ${skipped} SKIP）・ぜんぶで ${fmtMs(meta.totalMs)}`,
    "",
    "| # | name | result | count | time | note |",
    "|---|---|---|---|---|---|",
    ...results.map((r, i) => `| ${i + 1} | ${esc(r.name)} | ${MARK[r.status]} | ${esc(r.count || "-")} | ${fmtMs(r.ms)} | ${esc(r.note ?? "")} |`),
    "",
  ];
  if (meta.details) lines.push(meta.details.trim(), "");
  lines.push("ログ（ステップごと）は `.data/check-all/<name>.log`（git には 入れない）。", "");
  return lines.join("\n");
}
