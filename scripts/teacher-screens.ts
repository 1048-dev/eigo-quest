/**
 * run8 P8: バーチャル先生（せんせいステップ）の スクリーンショット。DB なし（つながらない DATABASE_URL）で next start → Playwright。
 *
 *   npx next build
 *   npx tsx scripts/teacher-screens.ts [--port 3471] [--lessons 1,300,700,1100]
 *
 * レッスンごとに スマホ（375px）と タブレット（820px）で
 * （教室まで スクロールした ビューポート。下の ナビは 画面に 固定）
 *   1. はじめる まえ  2. 話している ところ  3. 「いってみよう！」の カウントダウン
 * を docs/run8/screens/ に 保存する。横に はみ出していないか・コンソールの エラーが ないかも しらべる。
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";

const arg = (name: string, d: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const PORT = Number(arg("port", "3471"));
const LESSONS = arg("lessons", "1,300,700,1100").split(",").map(Number);
const WIDTHS: [string, number, number][] = [["phone", 375, 812], ["tablet", 820, 1180]];
const OUT = path.join(process.cwd(), "docs", "run8", "screens");
mkdirSync(OUT, { recursive: true });
const isWin = process.platform === "win32";
const BASE = `http://localhost:${PORT}`;
const env = { ...process.env, DATABASE_URL: "postgresql://eigo:eigo@127.0.0.1:5999/eigo_quest?schema=public&connect_timeout=2", NODE_ENV: "production" as const };

let failures = 0;
const check = (label: string, ok: boolean) => { console.log(`${ok ? "✔" : "✖"} ${label}`); if (!ok) failures++; };

function stop(s: ChildProcess) {
  if (isWin && s.pid) spawnSync("taskkill", ["/pid", String(s.pid), "/T", "/F"], { stdio: "ignore" });
  else s.kill();
}

async function waitUp(s: ChildProcess) {
  for (let i = 0; i < 90; i++) {
    if (s.exitCode != null) throw new Error("next start exited");
    try { if ((await fetch(`${BASE}/api/health`)).status < 600) return; } catch { /* まだ */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server did not start");
}

async function shot(page: Page, name: string) {
  await page.waitForTimeout(400);
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  check(`${name}: 横に はみ出さない（${sw} <= ${iw}）`, sw <= iw);
  // 教室の 上はしまで スクロールして、子どもが 見る 画面（ビューポート）を 撮る
  await page.evaluate(() => document.querySelector("[data-testid=virtual-classroom]")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
}

async function main() {
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: ["ignore", "ignore", "inherit"], shell: isWin });
  const timer = setTimeout(() => { console.error("timeout"); stop(server); process.exit(1); }, 8 * 60_000);
  try {
    await waitUp(server);
    const browser = await chromium.launch();
    for (const [label, width, height] of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_CONNECTION|500 \(Internal/.test(m.text())) errors.push(m.text()); });
      for (const n of LESSONS) {
        console.log(`--- L${n} ${label}`);
        await page.goto(`${BASE}/lesson/${n}`, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("[data-testid=virtual-classroom]", { timeout: 45_000 });
        const source = await page.locator("[data-testid=virtual-classroom]").getAttribute("data-source");
        console.log(`    台本: ${source}`);
        await shot(page, `L${n}-${label}-1-ready`);
        await page.click("[data-testid=teacher-start]");
        // ことばの パートへ（黒板と ジェスチャーが よく わかる ところ）
        const words = page.locator('button[aria-label$=": ことば"]').first();
        if (await words.count()) await words.click();
        await page.waitForTimeout(1800);
        await shot(page, `L${n}-${label}-2-speaking`);
        const rep = page.locator('button[aria-label$=": いってみよう"]').first();
        if (await rep.count()) await rep.click();
        const ring = await page.waitForSelector("[data-testid=virtual-classroom] [role=status]", { timeout: 25_000 }).then(() => true).catch(() => false);
        check(`L${n} ${label}: いってみよう！の カウントダウンが 出る`, ring);
        await page.waitForTimeout(500);
        await shot(page, `L${n}-${label}-3-repeat`);
        // ジェスチャーの 見本（L1 の タブレットだけ。エマ先生の 部分を 撮る）
        if (n === LESSONS[0] && label === "tablet") {
          for (const [kind, g] of [["あいさつ", "wave"], ["からだで", "mime"], ["クイズ", "think"], ["まとめ", "clap"]] as const) {
            await page.locator(`button[aria-label$=": ${kind}"]`).first().click();
            await page.waitForTimeout(900);
            const got = await page.locator("svg[data-gesture]").getAttribute("data-gesture");
            check(`ジェスチャー ${g}（いま ${got}）`, got === g);
            await page.locator("svg[data-gesture]").screenshot({ path: path.join(OUT, `gesture-${g}.png`) });
          }
        }
      }
      check(`${label}: コンソールの エラーが ない`, errors.length === 0);
      if (errors.length) console.log(errors.slice(0, 5).join("\n"));
      await ctx.close();
    }
    await browser.close();
  } finally {
    clearTimeout(timer);
    stop(server);
  }
  console.log(failures ? `✖ ${failures} 件 NG` : "✔ ぜんぶ OK");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
