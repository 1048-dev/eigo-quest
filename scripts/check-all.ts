/**
 * run10 Phase 1: ぜんぶの 確認を 1つの コマンドで。
 *
 *   npm run check:all
 *   npm run check:all -- --only tsc,vitest        # えらんだ ステップだけ
 *   npm run check:all -- --skip e2e,a11y          # ステップを とばす
 *   npm run check:all -- --list                   # ステップの 一覧
 *   npm run check:all -- --strict                 # SKIP（まだ ない ステップ）も 失敗に する
 *
 * じゅんばん: english:lint（ぜんぶ）→ tsc → vitest → next build → データの 確認（Phase 2）→ 画面の 描画（Phase 3）
 *   → DB 停止の スモーク → 本物の DB（ポート 5544）で E2E（Phase 4）→ アクセシビリティ（axe）→ 内部リンク → JS の 大きさの 予算
 * 各ステップに 時間制限が あり、30秒ごとに 進みぐあいを 出す。さいごに 表（name・result・count・time）を 出し、
 * docs/run10/report/latest.md に 書く。ステップごとの ログは .data/check-all/<name>.log。
 * Phase 2〜4 の ステップは package.json の check:data・check:render・check:e2e が まだ なければ SKIP。
 * 終了コード: FAIL・TIMEOUT が 1つでも あれば 1。
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  buildCount, checkBudget, checkMarkCount, englishLintCount, englishLintErrors, fmtMs, overall, parseBuildRoutes,
  renderConsoleTable, renderReport, summaryLine, tscCount, vitestCount, type StepResult,
} from "./lib/checkAll";
import { isWin, startServer, stopServer, waitForServer } from "./lib/checkKit";
import { prepareCheckDb, startCheckDb, type CheckDb } from "./lib/checkDb";
import { checkServerEnv, freePort } from "./lib/checkServer";
import { BUDGETS_KB } from "./bundle-budget";

const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, ".data", "check-all");
const REPORT = path.join(ROOT, "docs", "run10", "report", "latest.md");
const REPORT_DIR = path.dirname(REPORT);
const PKG = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };

interface Ctx { buildOk: boolean; db: CheckDb | null; dbError?: string; base: string | null; server: ChildProcess | null }

interface Step {
  name: string;
  title: string;
  timeoutSec: number;
  /** null を かえすと コマンドを 実行しない（SKIP の わけ） */
  skip?: (c: Ctx) => string | null;
  cmd: (c: Ctx) => string[];
  count: (log: string) => string;
  /** 終了コードの ほかに 失敗に する 条件（わけを かえす） */
  extraFail?: (log: string) => string | null;
  after?: (c: Ctx, ok: boolean, log: string) => void;
  /** 実行の まえの じゅんび（DB・サーバー） */
  before?: (c: Ctx) => Promise<void>;
}

const tsx = (file: string, ...args: string[]) => ["npx", "tsx", file, ...args];
const needBuild = (c: Ctx) => (c.buildOk ? null : "next build が 失敗 / 未実行");
const needScript = (name: string, phase: string) => () => (PKG.scripts[name] ? null : `npm run ${name} が まだ ない（${phase} で つくる）`);
const countOf = (log: string) => summaryLine(log) || checkMarkCount(log);

async function ensureDb(c: Ctx) {
  if (c.db || c.dbError) return;
  try {
    c.db = await startCheckDb();
    prepareCheckDb(c.db.url);
  } catch (e) {
    c.dbError = e instanceof Error ? e.message : String(e);
    await c.db?.stop();
    c.db = null;
    console.log(`  ✖ 本物の DB を 用意できなかった: ${c.dbError}`);
  }
}

async function ensureServerWithDb(c: Ctx) {
  await ensureDb(c);
  if (c.base || !c.db) return;
  const port = await freePort(3700);
  const env = checkServerEnv(c.db.url, port, path.join(ROOT, ".tmp", "check-all"));
  c.server = startServer(port, env);
  try {
    await waitForServer(c.server, `http://localhost:${port}`, 90);
    c.base = `http://localhost:${port}`;
  } catch (e) {
    stopServer(c.server);
    c.server = null;
    c.dbError = `next start: ${e instanceof Error ? e.message : e}`;
  }
}

export const STEPS: Step[] = [
  {
    name: "english-lint", title: "english:lint（ぜんぶ）", timeoutSec: 900,
    cmd: () => tsx("scripts/english-lint.ts", "--all", "--strict", "--out", path.join(REPORT_DIR, "english-lint.md")),
    count: englishLintCount,
    extraFail: (log) => { const e = englishLintErrors(log); return e === null ? "数が とれない" : e > 0 ? `error ${e}` : null; },
  },
  { name: "tsc", title: "tsc", timeoutSec: 600, cmd: () => ["npx", "tsc", "--noEmit"], count: tscCount },
  { name: "vitest", title: "vitest", timeoutSec: 1800, cmd: () => ["npx", "vitest", "run"], count: vitestCount },
  {
    name: "build", title: "next build", timeoutSec: 1200, cmd: () => ["npx", "next", "build"], count: buildCount,
    extraFail: (log) => (parseBuildRoutes(log).length ? null : "ページの 表が ない"),
    after: (c, ok) => { c.buildOk = ok; },
  },
  { name: "data", title: "データの 確認（Phase 2）", timeoutSec: 1800, skip: needScript("check:data", "Phase 2"), cmd: () => ["npm", "run", "-s", "check:data"], count: countOf },
  { name: "render", title: "画面の 描画（Phase 3）", timeoutSec: 1800, skip: needScript("check:render", "Phase 3"), cmd: () => ["npm", "run", "-s", "check:render"], count: countOf },
  {
    name: "smoke-offline", title: "DB 停止の スモーク", timeoutSec: 1900, skip: needBuild,
    cmd: () => tsx("scripts/smoke-offline.ts", path.join(ROOT, ".tmp", "check-all", "smoke"), "--port", "3100"),
    count: countOf,
  },
  {
    name: "e2e", title: "E2E（本物の DB・Phase 4）", timeoutSec: 3600,
    skip: (c) => needScript("check:e2e", "Phase 4")() ?? needBuild(c) ?? (c.db ? null : `DB なし: ${c.dbError ?? "?"}`),
    before: async (c) => { if (PKG.scripts["check:e2e"] && c.buildOk) await ensureDb(c); },
    cmd: (c) => ["npm", "run", "-s", "check:e2e", "--", "--db", c.db!.url],
    count: countOf,
  },
  {
    name: "a11y", title: "アクセシビリティ（axe）", timeoutSec: 900,
    skip: (c) => needBuild(c) ?? (c.base ? null : `サーバーなし: ${c.dbError ?? "?"}`),
    before: async (c) => { if (c.buildOk) await ensureServerWithDb(c); },
    cmd: (c) => tsx("scripts/a11y-check.ts", "--base", c.base!, "--db", c.db!.url, "--out", path.join(REPORT_DIR, "a11y.md")),
    count: countOf,
  },
  {
    name: "links", title: "内部リンク", timeoutSec: 1200,
    skip: (c) => needBuild(c) ?? (c.base ? null : `サーバーなし: ${c.dbError ?? "?"}`),
    before: async (c) => { if (c.buildOk) await ensureServerWithDb(c); },
    cmd: (c) => tsx("scripts/link-check.ts", "--base", c.base!, "--out", path.join(REPORT_DIR, "links.md")),
    count: countOf,
  },
  {
    name: "bundle", title: "JS の 大きさ（/map・/lesson ≤ 230 kB）", timeoutSec: 120, skip: needBuild,
    cmd: () => tsx("scripts/bundle-budget.ts", "--log", path.join(LOG_DIR, "build.log")),
    count: countOf,
  },
];

function killTree(p: ChildProcess) {
  if (p.exitCode != null) return;
  if (isWin && p.pid) spawnSync("taskkill", ["/pid", String(p.pid), "/T", "/F"], { stdio: "ignore", timeout: 30_000 });
  else p.kill("SIGKILL");
}

let current: ChildProcess | null = null;

function runStep(step: Step, argv: string[]): Promise<{ code: number | null; timedOut: boolean; log: string }> {
  return new Promise((resolve) => {
    const logFile = path.join(LOG_DIR, `${step.name}.log`);
    const out = createWriteStream(logFile);
    const chunks: string[] = [];
    const t0 = Date.now();
    console.log(`$ ${argv.join(" ")}`);
    const child = spawn(argv[0], argv.slice(1), {
      cwd: ROOT, shell: isWin, stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1", CI: "1", NEXT_TELEMETRY_DISABLED: "1" },
    });
    current = child;
    const onData = (b: Buffer) => { const s = b.toString("utf8"); chunks.push(s); out.write(s); process.stdout.write(s); };
    child.stdout!.on("data", onData);
    child.stderr!.on("data", onData);
    let timedOut = false;
    const beat = setInterval(() => console.log(`  …${step.title} 実行中（${fmtMs(Date.now() - t0)} / 最長 ${fmtMs(step.timeoutSec * 1000)}）`), 30_000);
    const timer = setTimeout(() => { timedOut = true; console.log(`  ⏱ ${step.timeoutSec}秒を こえたので とめる`); killTree(child); }, step.timeoutSec * 1000);
    child.on("close", (code) => {
      clearInterval(beat);
      clearTimeout(timer);
      current = null;
      out.end();
      resolve({ code, timedOut, log: chunks.join("") });
    });
    child.on("error", (e) => chunks.push(String(e)));
  });
}

function listArg(name: string): string[] | null {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean) : null;
}

async function main() {
  if (process.argv.includes("--list")) {
    for (const s of STEPS) console.log(`${s.name.padEnd(14)} ${s.title}（最長 ${fmtMs(s.timeoutSec * 1000)}）`);
    return;
  }
  const only = listArg("only");
  const skip = listArg("skip") ?? [];
  const strict = process.argv.includes("--strict");
  for (const n of [...(only ?? []), ...skip]) if (!STEPS.some((s) => s.name === n)) throw new Error(`知らない ステップ: ${n}（--list で 一覧）`);
  mkdirSync(LOG_DIR, { recursive: true });
  mkdirSync(REPORT_DIR, { recursive: true });
  const startedAt = new Date();
  const t0 = Date.now();
  // --only で build を えらんで いないときは、すでに ある .next を つかう
  const ctx: Ctx = { buildOk: false, db: null, base: null, server: null };
  if (only && !only.includes("build")) ctx.buildOk = parseBuildRoutes(safeRead(path.join(LOG_DIR, "build.log"))).length > 0;
  const cleanup = async () => {
    if (current) killTree(current);
    stopServer(ctx.server);
    ctx.server = null;
    await ctx.db?.stop();
    ctx.db = null;
  };
  const onSignal = () => { void cleanup().finally(() => process.exit(130)); };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  const results: StepResult[] = [];
  const chosen = STEPS.filter((s) => (only ? only.includes(s.name) : true) && !skip.includes(s.name));
  try {
    for (const [i, step] of chosen.entries()) {
      console.log(`\n━━━ [${i + 1}/${chosen.length}] ${step.title} ━━━`);
      const s0 = Date.now();
      if (step.before) await step.before(ctx);
      const why = step.skip?.(ctx) ?? null;
      if (why) {
        console.log(`  ⏭ SKIP: ${why}`);
        results.push({ name: step.title, status: strict ? "FAIL" : "SKIP", count: "", ms: Date.now() - s0, note: why });
        continue;
      }
      const r = await runStep(step, step.cmd(ctx));
      const extra = r.code === 0 ? step.extraFail?.(r.log) ?? null : null;
      const ok = r.code === 0 && !r.timedOut && !extra;
      step.after?.(ctx, ok, r.log);
      const tail = r.log.trim().split(/\r?\n/).filter((l) => /✖|✗|error|fail|Error/i.test(l)).slice(-1)[0]?.trim().slice(0, 160);
      const res: StepResult = {
        name: step.title,
        status: r.timedOut ? "TIMEOUT" : ok ? "PASS" : "FAIL",
        count: step.count(r.log),
        ms: Date.now() - s0,
        note: r.timedOut ? `${step.timeoutSec}秒で とめた` : ok ? undefined : extra ?? `終了コード ${r.code}${tail ? `: ${tail}` : ""}`,
      };
      results.push(res);
      console.log(`  → ${res.status}  ${res.count}  ${fmtMs(res.ms)}`);
    }
  } finally {
    await cleanup();
  }

  const totalMs = Date.now() - t0;
  const commit = spawnSync("git", ["log", "-1", "--format=%h %s"], { cwd: ROOT, encoding: "utf8" }).stdout.trim().slice(0, 80);
  const dirty = spawnSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" }).stdout.trim() ? "（コミット前の 変更あり）" : "";
  const buildLog = safeRead(path.join(LOG_DIR, "build.log"));
  const budget = checkBudget(parseBuildRoutes(buildLog), BUDGETS_KB);
  const details = [
    "## JS の 大きさ（First Load JS）",
    "",
    "| ページ | First Load JS | 予算 |",
    "|---|---|---|",
    ...budget.map((b) => `| ${b.route} | ${b.firstLoadKb ?? "?"} kB | ${b.budgetKb} kB ${b.ok ? "✅" : "❌"} |`),
    "",
    "## くわしい レポート",
    "",
    "- 英語チェック: [english-lint.md](english-lint.md)",
    "- アクセシビリティ: [a11y.md](a11y.md)",
    "- 内部リンク: [links.md](links.md)",
  ].join("\n");
  const command = `npm run check:all${process.argv.slice(2).length ? ` -- ${process.argv.slice(2).join(" ")}` : ""}`;
  writeFileSync(REPORT, renderReport(results, { startedAt, commit: commit + dirty, command, totalMs, details }));
  console.log(`\n${renderConsoleTable(results)}\n`);
  console.log(`けっか: ${overall(results)}（${fmtMs(totalMs)}）→ ${path.relative(ROOT, REPORT)}`);
  process.exit(overall(results) === "PASS" ? 0 : 1);
}

function safeRead(f: string): string {
  try { return readFileSync(f, "utf8"); } catch { return ""; }
}

if (process.argv[1] && /check-all\.ts$/.test(process.argv[1])) {
  main().catch((e) => {
    console.error("✖", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
