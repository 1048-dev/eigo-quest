/**
 * 画面スモークテスト（Playwright / chromium）。動いている サーバーに アクセスして ぜんぶの 画面を ひらき、
 *   - ページの エラー（pageerror）・console.error・5xx の 応答・エラーの 文言 があれば 失敗
 *   - 「よみこみちゅう…」の まま 止まっていたら 失敗
 *   - スクリーンショットを docs/night2/screens/ に 保存
 * DB を 止めた まま（おためしモード）で 動かす ことを 想定している。
 *
 *   npx next build && npx next start -p 3100
 *   npx tsx scripts/smoke.ts http://localhost:3100
 *   npx tsx scripts/smoke.ts http://localhost:3100 docs/night2/screens/final
 *
 * さいごに おためしモードの 流れも 確かめる:
 *   API（DB なし）: レッスン完了・かいわ・まとめ視聴 が success / ok で 返る
 *   画面: この ブラウザで Lesson 1 を クリアした きろくが あれば、マップに「きょうのまとめ」リンクが 出る
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright";

const BASE = (process.argv[2] ?? process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");
/** 保存先（2つめの 引数 か SMOKE_OUT で かえられる。さいごの 確認は docs/night2/screens/final） */
const OUT = path.resolve(process.argv[3] ?? process.env.SMOKE_OUT ?? path.resolve(__dirname, "../docs/night2/screens"));

/** 各ワールドの さいしょの レッスン（1, 31, 61, … 331） */
const WORLD_LESSONS = Array.from({ length: 12 }, (_, i) => i * 30 + 1);

const PAGES: { name: string; url: string }[] = [
  { name: "home", url: "/" },
  { name: "map", url: "/map" },
  { name: "dashboard", url: "/dashboard" },
  { name: "gacha", url: "/gacha" },
  { name: "arena", url: "/arena" },
  { name: "ranking", url: "/ranking" },
  { name: "test-check-1", url: "/test/check-1" },
  { name: "test-mini-1-5", url: "/test/mini-1-5" },
  { name: "recap-1", url: "/recap/1" },
  ...WORLD_LESSONS.map((n) => ({ name: `lesson-${n}`, url: `/lesson/${n}` })),
];

/** 画面に 出ていたら おかしい 文言（エラー画面・通信エラー・Next.js の エラー表示） */
const ERROR_TEXT = [
  /Application error/i, /Unhandled Runtime Error/i, /Internal Server Error/i, /This page could not be found/i, /\b404\b/, /\b500\b/,
  /client-side exception/i, /Something went wrong/i, /JSON\.parse/i, /Unexpected token/i, /undefined is not/i, /Cannot read properties/i,
  /通信がうまくいかなかった/, /サーバーで問題が起きた/, /エラー/, /見つからないよ/, /まだ ひらいていない/,
];
/** 「よみこみ中」の 文言（これが 残っていたら 止まっている） */
const LOADING_TEXT = /よみこみちゅう|じゅんびちゅう|きろくしています/;

interface Problem { page: string; kind: string; detail: string }
const problems: Problem[] = [];
const fail = (page: string, kind: string, detail: string) => problems.push({ page, kind, detail: detail.slice(0, 300) });

function watch(page: Page, name: string) {
  page.on("pageerror", (e) => fail(name, "pageerror", e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    // 読みこめなかった ファイルは 下の response で URL つきで 記録する
    if (/^Failed to load resource/.test(t)) return;
    fail(name, "console.error", t);
  });
  page.on("response", (r) => {
    const s = r.status();
    const url = r.url();
    if (s >= 500) fail(name, "http", `${s} ${r.request().method()} ${url}`);
    // API の 4xx は ゲーム上の おしらせ（ロック中など）。ファイルの 404 は こわれた リンク
    else if (s === 404 && !url.includes("/api/") && !/favicon\.ico/.test(url)) fail(name, "http", `404 ${url}`);
  });
  page.on("requestfailed", (r) => {
    const err = r.failure()?.errorText ?? "";
    // ページ移動・音声の 中断などで 取り消された リクエストは 問題ない
    if (/ERR_ABORTED|NS_BINDING_ABORTED/.test(err)) return;
    fail(name, "requestfailed", `${r.method()} ${r.url()} ${err}`);
  });
}

async function settle(page: Page, name: string) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
  const stuck = await page
    .waitForFunction((src) => !new RegExp(src).test(document.body?.innerText ?? ""), LOADING_TEXT.source, { timeout: 20_000 })
    .then(() => false)
    .catch(() => true);
  if (stuck) fail(name, "stuck", "よみこみちゅう の まま 20秒 たった");
  await page.waitForTimeout(600); // アニメーションの さいしょの コマを すぎてから
}

async function checkText(page: Page, name: string) {
  const text = await page.evaluate(() => document.body?.innerText ?? "");
  if (text.trim().length < 20) fail(name, "blank", "画面が ほとんど からっぽ");
  for (const re of ERROR_TEXT) {
    const m = re.exec(text);
    if (m) fail(name, "error-text", `「${m[0]}」 … ${text.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\s+/g, " ")}`);
  }
}

async function shot(page: Page, name: string) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  // マップは とても 長いので 画面の 高さだけ。ほかは ページ ぜんぶ
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: height < 5000 });
}

async function visit(browser: Browser, p: { name: string; url: string }, prepare?: (page: Page) => Promise<void>) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 1, locale: "ja-JP" });
  const page = await ctx.newPage();
  watch(page, p.name);
  try {
    if (prepare) await prepare(page);
    const res = await page.goto(BASE + p.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!res || res.status() >= 400) fail(p.name, "http", `document ${res?.status() ?? "no response"}`);
    await settle(page, p.name);
    await checkText(page, p.name);
    await shot(page, p.name);
    console.log(`  ✓ ${p.name.padEnd(16)} ${p.url}`);
  } catch (e) {
    fail(p.name, "exception", (e as Error).message);
    console.log(`  ✗ ${p.name.padEnd(16)} ${p.url}`);
  } finally {
    await ctx.close();
  }
  return page;
}

async function api(method: "GET" | "POST", url: string, body?: unknown) {
  const r = await fetch(BASE + url, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  let json: Record<string, unknown> = {};
  try { json = JSON.parse(text) as Record<string, unknown>; } catch { fail(`api ${url}`, "json", text.slice(0, 120)); }
  return { status: r.status, json };
}

async function offlineFlow(browser: Browser) {
  console.log("おためしモードの 流れ（API）");
  const done = await api("POST", "/api/lessons/1/complete", { quizScore: 1, speedListeningBest: 1, logs: [], conversationFinished: true });
  if (done.status !== 200 || done.json.ok !== true) fail("api lesson-complete", "api", JSON.stringify(done.json));
  else console.log(`  ✓ レッスン完了 offline=${done.json.offline} coins=${(done.json.reward as { total?: number })?.total}`);

  const talk = await api("POST", "/api/conversation", { lessonNo: 1, character: "haru", history: [{ role: "ai", text: "Hello! I'm Haru. What's your name?" }], childText: "Hello! I'm Ken." });
  if (talk.status !== 200 || talk.json.success !== true || !talk.json.replyEn) fail("api conversation", "api", JSON.stringify(talk.json));
  else console.log(`  ✓ かいわ「${talk.json.replyEn}」`);

  const recap = await api("POST", "/api/recap/1/watched", {});
  if (recap.status !== 200 || recap.json.ok !== true) fail("api recap-watched", "api", JSON.stringify(recap.json));
  else console.log(`  ✓ まとめ視聴 saved=${recap.json.saved}`);

  const map = await api("GET", "/api/map");
  if (map.status !== 200 || !Array.isArray(map.json.nodes) || (map.json.nodes as unknown[]).length === 0) fail("api map", "api", JSON.stringify(map.json).slice(0, 200));

  console.log("おためしモードの 流れ（画面）");
  // この ブラウザで Lesson 1 を クリアした（レッスン画面が おためしモードで 書く のと おなじ きろく）
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
  const seed = async (page: Page) => {
    await page.addInitScript((v) => window.localStorage.setItem("eigo-quest:offline-progress:v1", v), JSON.stringify({ lessons: { 1: today }, tests: {} }));
  };
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "ja-JP" });
  const page = await ctx.newPage();
  watch(page, "map-after-lesson1");
  await seed(page);
  await page.goto(BASE + "/map", { waitUntil: "domcontentloaded" });
  await settle(page, "map-after-lesson1");
  const link = page.locator('a[href="/recap/1"]');
  if ((await link.count()) === 0) fail("map-after-lesson1", "recap-link", "おためしモードで Lesson 1 を クリアしても「きょうのまとめ」リンクが 出ない");
  else console.log("  ✓ マップに「きょうのまとめ（Lesson 1）」リンク");
  await checkText(page, "map-after-lesson1");
  await shot(page, "map-after-lesson1");
  await ctx.close();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`スモークテスト: ${BASE}`);
  const browser = await chromium.launch();
  try {
    for (const p of PAGES) await visit(browser, p);
    await offlineFlow(browser);
  } finally {
    await browser.close();
  }
  if (problems.length > 0) {
    console.error(`\n✗ ${problems.length} この 問題:`);
    for (const p of problems) console.error(`  [${p.page}] ${p.kind}: ${p.detail}`);
    process.exit(1);
  }
  console.log(`\n✓ ぜんぶ OK（スクリーンショット: ${path.relative(process.cwd(), OUT)}）`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
