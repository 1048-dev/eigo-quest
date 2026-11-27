/**
 * run10 Phase 2: すべての データの 確認（npm run check:data）。
 *
 *   npx tsx scripts/data-check.ts                      … ぜんぶ（seed 5 つ）→ docs/run10/report/data.md
 *   npx tsx scripts/data-check.ts --only tests,grading  … 一部だけ
 *   npx tsx scripts/data-check.ts --seeds 1,2           … seed を かえる
 *   npx tsx scripts/data-check.ts --out <file>          … レポートの 場所
 *   npx tsx scripts/data-check.ts --timeout 1500        … 時間制限（秒。既定 1500）
 *
 * 問題が 1つでも あれば 終了コード 1。さいごに「CHECK-SUMMARY: …」を 出す（npm run check:all の 表に のる）。
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_SEEDS, reportMarkdown, runDataChecks, summarize, type Section } from "./lib/dataCheck";
import { TOTAL_LESSONS } from "../src/lib/curriculum";
import { monthPackCount } from "../src/lib/curriculum/stages";
import { installDeadline, timeoutArg } from "./lib/checkKit";

const ROOT = path.resolve(__dirname, "..");
const argOf = (name: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const limit = timeoutArg(1500);
  installDeadline(limit);
  const only = argOf("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
  const seeds = argOf("--seeds")?.split(",").map(Number).filter(Number.isFinite) ?? [...DEFAULT_SEEDS];
  const out = argOf("--out") ?? path.join(ROOT, "docs", "run10", "report", "data.md");
  const py = path.join(ROOT, "worksheets", "generate_worksheets.py");
  const t0 = Date.now();
  const sections = await runDataChecks({ seeds, only, progress: (m) => console.log(m), worksheetPy: existsSync(py) ? readFileSync(py, "utf8") : undefined, deadlineAt: t0 + limit * 1000 });
  if (!only?.length || only.includes("worksheet-pdf")) sections.push(worksheetPdfSection(py, Math.max(60, limit - (Date.now() - t0) / 1000)));
  const ms = Date.now() - t0;

  console.log("");
  for (const s of sections) {
    if (!s.problems.length) continue;
    console.log(`✗ ${s.title}: ${s.problems.length}`);
    for (const p of s.problems.slice(0, 15)) console.log(`    - ${p}`);
    if (s.problems.length > 15) console.log(`    - …ほか ${s.problems.length - 15}`);
  }
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, reportMarkdown(sections, seeds, ms) + "\n");
  console.log(`\nレポート: ${path.relative(ROOT, out)}（${(ms / 1000).toFixed(1)} 秒）`);
  console.log(`CHECK-SUMMARY: ${summarize(sections)}`);
  process.exit(sections.some((s) => s.problems.length) ? 1 : 0);
}

/**
 * 1か月ワークブック ぜんぶ（60 冊）を python で ほんとうに 作って みる（.tmp/data-check/worksheets。git には 入れない）。
 * python か reportlab が ない ときは「とばした」と 書くだけ（失敗に しない）。
 */
function worksheetPdfSection(py: string, timeoutSec: number): Section {
  const s: Section = { name: "worksheet-pdf", title: "1か月ワークブックの PDF（python で 60 冊 作る）", counts: {}, problems: [], ms: 0 };
  const t0 = Date.now();
  console.log(`▶ ${s.title}`);
  const python = ["python3", "python"].find((p) => spawnSync(p, ["-c", "import reportlab"], { stdio: "ignore", timeout: 30_000 }).status === 0);
  if (!python) {
    console.log("  - python と reportlab が ないので とばした");
    s.counts = { とばした: 1 };
    return s;
  }
  const outDir = path.join(ROOT, ".tmp", "data-check", "worksheets");
  rmSync(outDir, { recursive: true, force: true });
  const r = spawnSync(python, [py, "--month", "--all", "--out", outDir], { encoding: "utf8", timeout: Math.min(900, timeoutSec) * 1000, env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
  const lines = `${r.stdout ?? ""}`.split(/\r?\n/).filter((l) => /^\[\d+\/\d+\]/.test(l));
  for (const l of lines.filter((_, i) => (i + 1) % 10 === 0)) console.log(`    … ${l.trim()}`);
  if (r.status !== 0) s.problems.push(`generate_worksheets.py が 失敗（${r.error?.message ?? `exit ${r.status}`}）: ${(r.stderr ?? "").trim().split(/\r?\n/).slice(-3).join(" / ")}`);
  const packs = monthPackCount(TOTAL_LESSONS);
  let pages = 0;
  for (let p = 1; p <= packs; p++) {
    const file = path.join(outDir, "monthly", `month-${String(p).padStart(2, "0")}.pdf`);
    if (!existsSync(file) || statSync(file).size < 10_000) { s.problems.push(`month-${String(p).padStart(2, "0")}.pdf が できない`); continue; }
    const m = lines.find((l) => l.includes(`month-${String(p).padStart(2, "0")}.pdf`))?.match(/\((\d+) ページ\)/);
    pages += m ? Number(m[1]) : 0;
  }
  s.counts = { 冊: packs - s.problems.filter((x) => x.includes(".pdf が")).length, ページ: pages };
  s.ms = Date.now() - t0;
  console.log(`  ${s.problems.length ? "✗" : "✓"} ${s.title}: ${s.counts["冊"]} 冊・${pages} ページ・問題 ${s.problems.length}（${(s.ms / 1000).toFixed(1)}s）`);
  return s;
}

main().catch((e) => {
  console.error("✗ データの 確認が とちゅうで 止まった:", e);
  process.exit(1);
});
