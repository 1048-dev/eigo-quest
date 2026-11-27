/**
 * run10 Phase 3: 画面の 描画の 確認（npm run check:render）。
 *
 *   npm run check:render                          … ぜんぶ（1,200 レッスン・テスト 3,035・としょかん・力だめし）→ docs/run10/report/render.md
 *   npm run check:render -- --workers 4           … ワーカーの 数（既定: CPU − 1、さいだい 8）
 *   npm run check:render -- --lessons 1-30        … レッスンを しぼる（テスト・としょかん・力だめしは そのまま）
 *   npm run check:render -- --only lesson,tests   … 単位を しぼる（lesson / test / stories / chants / talks / yearly）
 *   npm run check:render -- --timeout 1500        … 時間制限（秒）
 *
 * しごとの 単位（レッスン 1 つ・テスト 1 つ・おはなしの ステージ 1 つ …）を ワーカー（子プロセス）に じゅんばんに くばる。
 * 問題が 1つでも あれば 終了コード 1。さいごに「CHECK-SUMMARY: …」を 出す（npm run check:all の 表に のる）。
 */
import { fork, type ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { installJsxKeyCheck } from "./lib/renderHooks";
import { installDeadline, timeoutArg } from "./lib/checkKit";

const ROOT = path.resolve(__dirname, "..");
const argOf = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

type Lib = typeof import("./lib/renderCheck");
type Msg = { type: "ready" } | { type: "done"; unit: number; ms: number; tally: import("./lib/renderCheck").Tally } | { type: "fatal"; error: string };

/** 子プロセス: 親から 単位の 番号を もらって 描き、tally を かえす */
async function worker() {
  // 親が とちゅうで 止まったら（時間切れ・Ctrl+C）ワーカーも すぐ おわる（のこって CPU を つかわない）
  process.on("disconnect", () => process.exit(1));
  installJsxKeyCheck();
  const lib: Lib = await import("./lib/renderCheck");
  const units = lib.renderUnits();
  process.on("message", async (m: { unit: number } | { exit: true }) => {
    if ("exit" in m) process.exit(0);
    const t0 = Date.now();
    const tally = lib.emptyTally();
    try {
      await lib.runUnit(units[m.unit], tally);
    } catch (e) {
      process.send!({ type: "fatal", error: `${JSON.stringify(units[m.unit])}: ${e instanceof Error ? e.stack : e}` } satisfies Msg);
      return;
    }
    process.send!({ type: "done", unit: m.unit, ms: Date.now() - t0, tally } satisfies Msg);
  });
  process.send!({ type: "ready" } satisfies Msg);
}

function pickUnits(lib: Lib): number[] {
  const units = lib.renderUnits();
  const only = argOf("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
  const range = argOf("--lessons")?.match(/^(\d+)(?:-(\d+))?$/);
  const [lo, hi] = range ? [Number(range[1]), Number(range[2] ?? range[1])] : [1, Infinity];
  return units.flatMap((u, i) => {
    if (only?.length && !only.includes(u.kind)) return [];
    if (u.kind === "lesson" && (u.n < lo || u.n > hi)) return [];
    return [i];
  });
}

async function main() {
  const limit = timeoutArg(1500);
  const children: ChildProcess[] = [];
  installDeadline(limit, () => { for (const c of children) c.kill(); });
  const lib: Lib = await import("./lib/renderCheck");
  const queue = pickUnits(lib);
  const total = queue.length;
  const workers = Math.max(1, Math.min(Number(argOf("--workers")) || Math.min(8, os.cpus().length - 1), total));
  const out = argOf("--out") ?? path.join(ROOT, "docs", "run10", "report", "render.md");
  const tally = lib.emptyTally();
  const t0 = Date.now();
  let done = 0;
  let lastLog = 0;
  const fatal: string[] = [];
  console.log(`▶ 画面の 描画: 単位 ${total.toLocaleString("en-US")}・ワーカー ${workers}`);

  await new Promise<void>((resolve) => {
    let alive = workers;
    const next = (c: ChildProcess) => {
      const u = queue.shift();
      if (u === undefined) { c.send({ exit: true }); return; }
      c.send({ unit: u });
    };
    for (let w = 0; w < workers; w++) {
      const c = fork(__filename, ["--worker"], { stdio: ["ignore", "inherit", "inherit", "ipc"] });
      children.push(c);
      c.on("message", (m: Msg) => {
        if (m.type === "ready") return next(c);
        if (m.type === "fatal") { fatal.push(m.error); done++; return next(c); }
        lib.mergeTally(tally, m.tally);
        done++;
        if (Date.now() - lastLog > 5000 || done === total) {
          lastLog = Date.now();
          const sec = (Date.now() - t0) / 1000;
          console.log(`  … ${done.toLocaleString("en-US")} / ${total.toLocaleString("en-US")}（描画 ${lib.renderCount(tally).toLocaleString("en-US")}・問題 ${lib.problemCount(tally)}・${sec.toFixed(0)} 秒）`);
        }
        next(c);
      });
      c.on("exit", (code) => {
        if (code !== 0) fatal.push(`ワーカー ${w} が 終了コード ${code} で 止まった`);
        if (--alive === 0) resolve();
      });
    }
  });

  const ms = Date.now() - t0;
  if (fatal.length) tally.lesson.problems.push(...fatal.map((f) => `ワーカーの エラー: ${f}`));
  console.log("");
  for (const [k, g] of Object.entries(tally)) {
    const n = g.problems.length + (g.counts["のせきれない 問題"] ?? 0);
    console.log(`${n ? "✗" : "✓"} ${lib.GROUP_TITLES[k] ?? k}: ${Object.entries(g.counts).filter(([c]) => c !== "のせきれない 問題").map(([c, v]) => `${c} ${v.toLocaleString("en-US")}`).join("・")}・描画 ${g.renders.toLocaleString("en-US")}・問題 ${n}`);
    for (const p of g.problems.slice(0, 15)) console.log(`    - ${p}`);
    if (g.problems.length > 15) console.log(`    - …ほか ${n - 15}`);
  }
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, lib.renderReportMarkdown(tally, { ms, workers }) + "\n");
  console.log(`\nレポート: ${path.relative(ROOT, out)}（${(ms / 1000).toFixed(1)} 秒）`);
  console.log(`CHECK-SUMMARY: ${lib.summarizeRender(tally)}`);
  process.exit(lib.problemCount(tally) || fatal.length ? 1 : 0);
}

if (process.argv.includes("--worker")) {
  worker().catch((e) => { console.error(e); process.exit(1); });
} else {
  main().catch((e) => {
    console.error("✗ 描画の 確認が とちゅうで 止まった:", e);
    process.exit(1);
  });
}
