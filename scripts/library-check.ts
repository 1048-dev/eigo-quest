/**
 * えいごの としょかん の 画面の 通し確認（Playwright / chromium・run7 P-library）。DB を 止めた まま（おためしモード）で 動かす。
 *
 *   npx next build && npx next start -p 3100
 *   npx tsx scripts/library-check.ts http://localhost:3100 [スクリーンショットの 保存先]
 *
 * 確かめること:
 *   1. /library が ひらき、はじめての子でも おはなし（s1-01）と チャンツ（c-01）が ひらいている。フリートークは 🔒
 *   2. おはなし: ▶ よみきかせ で ことばの ハイライトが うごく（音が ない 環境でも 見つもりで うごく）→ 3問クイズに 正解 → スタンプ
 *   3. としょかんに もどると「✅ もらったよ」、おはなしに ⭐
 *   4. チャンツ: 🎵 きく を さいごまで → 「さいごまで できたね」（2回目なので スタンプは もう もらった）
 *   5. ひらいていない おはなし（s2-01）は 🔒 の 案内
 *   6. Lesson 90 まで クリアした きろく（localStorage）が あれば フリートークが ひらき、台本の 返事で 3回 話せる
 *   ページの エラー・console.error・5xx が あれば 失敗。
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { installDeadline } from "./lib/checkKit";

const BASE = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] ?? path.resolve(__dirname, "../docs/run7/screens/library"));
const problems: string[] = [];
const ok = (m: string) => console.log(`  ✓ ${m}`);
const ng = (m: string) => { problems.push(m); console.log(`  ✗ ${m}`); };
const timer = installDeadline(240);

function watch(page: Page) {
  page.on("pageerror", (e) => ng(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/^Failed to load resource/.test(m.text())) ng(`console.error: ${m.text()}`); });
  page.on("response", (r) => { if (r.status() >= 500) ng(`http ${r.status()} ${r.url()}`); });
}

async function shot(page: Page, name: string) {
  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function main() {
  console.log(`としょかんの 通し確認: ${BASE}`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "ja-JP" });
  const page = await ctx.newPage();
  watch(page);

  // 1. 一覧
  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  await page.getByText("きょうの ごほうび").waitFor({ timeout: 20_000 });
  (await page.locator('a[href="/library/story/s1-01"]').count()) > 0 ? ok("はじめての子でも s1-01 が ひらいている") : ng("s1-01 が ひらいていない");
  (await page.locator('a[href="/library/story/s2-01"]').count()) === 0 ? ok("s2-01 は 🔒") : ng("s2-01 が ひらいている");
  await shot(page, "01-library");
  await page.getByRole("tab", { name: /フリートーク/ }).click();
  (await page.getByText("フリートークは Lesson 90 を クリアすると ひらくよ").count()) > 0 ? ok("フリートークは 🔒（Lesson 90 から）") : ng("フリートークの 🔒 の 案内が ない");

  // 2. おはなし
  await page.goto(`${BASE}/library/story/s1-01`, { waitUntil: "networkidle" });
  await page.getByText("Hello, Birimo!").first().waitFor({ timeout: 20_000 });
  await page.getByRole("button", { name: /よみきかせ/ }).click();
  const lit = await page.waitForSelector("span.bg-\\[\\#ffd54a\\]", { timeout: 8_000 }).then(() => true).catch(() => false);
  lit ? ok("よみきかせで ことばが ハイライトされる") : ng("ハイライトが うごかない");
  await shot(page, "02-story-reading");
  await page.getByRole("button", { name: /とめる/ }).click().catch(() => undefined);
  await page.getByRole("button", { name: /クイズに こたえる/ }).click();
  for (const answer of ["Birimo", "hungry", "a banana"]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page.getByRole("button", { name: /つぎへ|けっかを みる/ }).click();
  }
  await page.getByText("3 / 3 もん せいかい").waitFor({ timeout: 10_000 });
  const msg = await page.getByText(/スタンプ/).first().textContent().catch(() => "");
  /きょうの スタンプ ゲット/.test(msg ?? "") ? ok(`クイズ 3/3 → ${msg?.trim()}`) : ng(`スタンプの 文が ない: ${msg}`);
  await shot(page, "03-story-result");

  // 3. 一覧に もどる
  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  await page.getByText("✅ もらったよ！").waitFor({ timeout: 10_000 }).then(() => ok("一覧に「✅ もらったよ」")).catch(() => ng("一覧に もらった 表示が ない"));
  (await page.locator('a[href="/library/story/s1-01"]').getByText("⭐⭐⭐").count()) > 0 ? ok("s1-01 に ⭐⭐⭐") : ng("s1-01 に ⭐ が ない");

  // 4. チャンツ
  await page.goto(`${BASE}/library/chant/c-01`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /きく/ }).first().click();
  await page.getByText("さいごまで できたね！").waitFor({ timeout: 60_000 }).then(() => ok("チャンツを さいごまで")).catch(() => ng("チャンツが おわらない"));
  (await page.getByText("きょうの スタンプは もう もらったよ").count()) > 0 ? ok("同じ日の 2回目は スタンプなし") : ng("2回目の 文が ちがう");
  await shot(page, "04-chant");

  // 5. 🔒 の おはなし
  await page.goto(`${BASE}/library/story/s2-01`, { waitUntil: "networkidle" });
  (await page.getByText("Lesson 360 を クリアすると ひらくよ").count()) > 0 ? ok("s2-01 を 直接 ひらいても 🔒 の 案内") : ng("s2-01 の 🔒 の 案内が ない");

  // 6. フリートーク（Lesson 90 まで クリアした きろくを 入れる）
  await page.evaluate(() => {
    const lessons: Record<string, string> = {};
    for (let i = 1; i <= 90; i++) lessons[String(i)] = "2026-11-01";
    localStorage.setItem("eigo-quest:offline-progress:v1", JSON.stringify({ lessons, tests: {} }));
  });
  await page.goto(`${BASE}/library/talk/t-food`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /はじめる/ }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByLabel("えいごで かく").fill(i === 0 ? "I like curry." : i === 1 ? "Yes, I do. I like chocolate." : "I like toast and milk.");
    await page.getByRole("button", { name: "おくる" }).click();
    await page.waitForFunction((n) => document.querySelectorAll("li.self-start").length >= n + 2, i, { timeout: 15_000 });
  }
  await shot(page, "05-talk");
  await page.getByRole("button", { name: "ここで おわりにする" }).click();
  await page.getByText("3かい おはなし したよ！").waitFor({ timeout: 10_000 }).then(() => ok("フリートークで 3回 話せた")).catch(() => ng("フリートークの けっかが ない"));

  await browser.close();
  clearTimeout(timer);
  if (problems.length > 0) { console.log(`\n✗ ${problems.length} この 問題`); process.exit(1); }
  console.log(`\n✓ としょかんの 通し確認 OK（スクリーンショット: ${OUT}）`);
}

main().catch((e) => { console.error(e); process.exit(1); });
