/**
 * 力だめしの 画面の 通し確認（Playwright / chromium・run7 P-yearly）。DB を 止めた まま（おためしモード）で 動かす。
 *
 *   npx next build && npx next start -p 3100
 *   npx tsx scripts/yearly-flow-check.ts http://localhost:3100 [スクリーンショットの 保存先]
 *
 * 確かめること:
 *   1. Lesson 10 まで クリアした きろく（localStorage）で /yearly → ステージ1 の 説明と「はじめる」
 *   2. 聞く 10 問（絵を えらぶ）→ 読む 10 問 → 話す 3 問（入力）→ 書く（ことば 3 つ）を ぜんぶ 正しく こたえる
 *   3. 結果: 推定レベル・保護者向けの 技能ごとの 点数・ふりかえり。聞く・読むは 満点
 *   4. もう一度 ひらくと「おためしでは 1 かいだけ」＋ さいしんの 結果
 *   5. Lesson 700 の きろくなら ステージ3（メール・物語の 文章が 出る）
 *   ページの エラー・console.error・5xx が あれば 失敗。
 */
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { installDeadline } from "./lib/checkKit";
import type { YearlyTest } from "../src/lib/yearly/types";

const BASE = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] ?? path.resolve(__dirname, "../docs/run7/screens/yearly"));
const problems: string[] = [];
const ok = (m: string) => console.log(`  ✓ ${m}`);
const ng = (m: string) => { problems.push(m); console.log(`  ✗ ${m}`); };
const timer = installDeadline(300);

const load = (stage: number) => JSON.parse(readFileSync(path.resolve(__dirname, `../content/yearly/stage-${stage}.json`), "utf8")) as YearlyTest;

function watch(page: Page) {
  page.on("pageerror", (e) => ng(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/^Failed to load resource/.test(m.text())) ng(`console.error: ${m.text()}`); });
  page.on("response", (r) => { if (r.status() >= 500) ng(`http ${r.status()} ${r.url()}`); });
}

async function shot(page: Page, name: string) {
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function setProgress(page: Page, upTo: number) {
  await page.evaluate((n) => {
    const lessons: Record<string, string> = {};
    for (let i = 1; i <= n; i++) lessons[String(i)] = "2026-11-01";
    localStorage.setItem("eigo-quest:offline-progress:v1", JSON.stringify({ lessons, tests: {} }));
    localStorage.removeItem("eigo-quest:yearly:v1");
  }, upTo);
}

/** 選ぶ 問題を 1 問 こたえて つぎへ */
async function answerChoice(page: Page, index: number) {
  await page.getByRole("radio").nth(index).click();
  await page.getByRole("button", { name: /つぎへ|つぎは/ }).click();
}

async function main() {
  console.log(`力だめしの 通し確認: ${BASE}`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "ja-JP" });
  // 読み上げは 音の ない 環境で おわらない ことが あるので すぐ おわる にせものに する
  // （tsx が 関数に __name を 入れるので 文字列で わたす）
  await ctx.addInitScript({ content: "Object.defineProperty(window, \"speechSynthesis\", { configurable: true, value: { speak: function (u) { setTimeout(function () { if (u.onend) u.onend(); }, 10); }, cancel: function () {}, getVoices: function () { return []; } } });" });
  const page = await ctx.newPage();
  watch(page);

  // 1. ステージ1 の はじめに
  await page.goto(`${BASE}/map`, { waitUntil: "domcontentloaded" });
  await setProgress(page, 10);
  await page.goto(`${BASE}/yearly`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "はじめる ▶" }).waitFor({ timeout: 20_000 });
  (await page.getByText("ステージ1 の 力だめし").count()) > 0 ? ok("Lesson 10 → ステージ1 の 力だめし") : ng("ステージ1 の 説明が ない");
  await shot(page, "01-intro");
  await page.getByRole("button", { name: "はじめる ▶" }).click();

  // 2. 聞く・読む・話す・書く
  const t1 = load(1);
  for (const [i, item] of t1.listening.entries()) {
    if (i === 0) {
      await page.getByRole("button", { name: /きく/ }).click();
      await page.getByRole("button", { name: /のこり 1 かい/ }).waitFor({ timeout: 10_000 }).then(() => ok("▶ きく で のこり 1 かい")).catch(() => ng("きく 回数が へらない"));
      await shot(page, "02-listening-picture");
    }
    await answerChoice(page, item.answer);
  }
  for (const [i, item] of t1.reading.entries()) {
    if (i === 0) await shot(page, "03-reading");
    await answerChoice(page, item.answer);
  }
  for (const [i, p] of t1.speaking.prompts.entries()) {
    await page.locator("textarea").fill(p.sample);
    if (i === 0) await shot(page, "04-speaking");
    await page.getByRole("button", { name: /つぎへ|つぎは/ }).click();
  }
  for (const [i, it] of (t1.writing.items ?? []).entries()) await page.getByLabel(`${i + 1}つめの ことば`).fill(it.answer);
  await shot(page, "05-writing");
  await page.getByRole("button", { name: /おわり/ }).click();

  // 3. 結果
  await page.getByText("よく がんばったね！").waitFor({ timeout: 20_000 });
  const listen = await page.getByText(/聞く：\d+ \/ \d+ もん/).textContent().catch(() => "");
  /聞く：10 \/ 10 もん/.test(listen ?? "") && /読む：10 \/ 10 もん/.test(listen ?? "") ? ok(`ふりかえり: ${listen?.trim()}`) : ng(`聞く・読むが 満点で ない: ${listen}`);
  (await page.getByText("おうちの方へ").count()) > 0 && (await page.getByText("推定レベル").count()) > 0 ? ok("保護者向けの 結果（推定レベル・技能ごとの 点数）") : ng("保護者向けの 結果が ない");
  const band = await page.locator("span.font-title.text-2xl").first().textContent();
  ok(`推定レベル ${band}`);
  await shot(page, "06-result");

  // 4. もう一度
  await page.goto(`${BASE}/yearly`, { waitUntil: "networkidle" });
  await page.getByText(/おためしでは 力だめしは 1 かいだけ/).waitFor({ timeout: 15_000 }).then(() => ok("2 回目は「おためしでは 1 かいだけ」")).catch(() => ng("2 回目の 案内が ない"));
  (await page.getByText("さいしんの 結果").count()) > 0 ? ok("さいしんの 結果を 表示") : ng("さいしんの 結果が ない");
  await shot(page, "07-trial-used");

  // 5. ステージ3
  await setProgress(page, 700);
  await page.goto(`${BASE}/yearly`, { waitUntil: "networkidle" });
  await page.getByText("ステージ3 の 力だめし").waitFor({ timeout: 15_000 }).then(() => ok("Lesson 700 → ステージ3")).catch(() => ng("ステージ3 に ならない"));
  await page.getByRole("button", { name: "はじめる ▶" }).click();
  const t3 = load(3);
  for (const item of t3.listening) await answerChoice(page, item.answer);
  for (const item of t3.reading) {
    if (item.format === "text") {
      (await page.locator("article").count()) > 0 ? ok(`文章（${item.passageId}）が 出る`) : ng("文章が 出ない");
      await shot(page, "08-stage3-reading-passage");
      break;
    }
    await answerChoice(page, item.answer);
  }

  await browser.close();
  clearTimeout(timer);
  if (problems.length > 0) { console.log(`\n✗ ${problems.length} この 問題`); process.exit(1); }
  console.log(`\n✓ 力だめしの 通し確認 OK（スクリーンショット: ${OUT}）`);
}

main().catch((e) => { console.error(e); process.exit(1); });
