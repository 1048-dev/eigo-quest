/**
 * run10 Phase 1: JS の 大きさの 予算。next build の 表の「First Load JS」が
 *   /map・/lesson/[lessonNo] で 230 kB を こえたら 失敗。
 *
 *   npm run check:bundle                       # next build を 実行して しらべる
 *   npm run check:bundle -- --log <build.log>  # check:all が 保存した next build の 出力を つかう
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { checkBudget, parseBuildRoutes } from "./lib/checkAll";
import { isWin } from "./lib/checkKit";

export const BUDGETS_KB: Record<string, number> = { "/map": 230, "/lesson/[lessonNo]": 230 };

function main() {
  const i = process.argv.indexOf("--log");
  let log: string;
  if (i >= 0) log = readFileSync(process.argv[i + 1], "utf8");
  else {
    console.log("$ next build");
    const r = spawnSync("npx", ["next", "build"], { encoding: "utf8", shell: isWin, timeout: 900_000, maxBuffer: 64 * 1024 * 1024 });
    log = (r.stdout ?? "") + (r.stderr ?? "");
    if (r.status !== 0) { console.error(log.slice(-3000)); console.error("✖ next build に 失敗"); process.exit(1); }
  }
  const routes = parseBuildRoutes(log);
  if (!routes.length) { console.error("✖ next build の 出力に ページの 表が ない"); process.exit(1); }
  const rows = checkBudget(routes, BUDGETS_KB);
  for (const r of rows) console.log(`  ${r.ok ? "✓" : "✖"} ${r.route}: ${r.firstLoadKb ?? "（見つからない）"} kB / 予算 ${r.budgetKb} kB`);
  const biggest = [...routes].sort((a, b) => b.firstLoadKb - a.firstLoadKb).slice(0, 5);
  console.log(`  大きい ページ: ${biggest.map((r) => `${r.route} ${r.firstLoadKb} kB`).join("・")}`);
  console.log(`CHECK-SUMMARY: ${rows.map((r) => `${r.route} ${r.firstLoadKb ?? "?"}/${r.budgetKb} kB`).join("・")}`);
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
}

if (process.argv[1] && /bundle-budget\.ts$/.test(process.argv[1])) main();
