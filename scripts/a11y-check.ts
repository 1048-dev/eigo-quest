/**
 * run10 Phase 1: アクセシビリティの 確認（axe-core + Playwright / chromium）。
 *   おもな 画面を スマホ（390x844）で ひらいて axe（WCAG 2.1 A / AA）を かける。
 *   impact が critical・serious の 違反が 1つでも あれば 失敗。moderate・minor は 数だけ レポートに のせる。
 *   DB が あれば 保護者を 登録して ログインした あとの 画面（だれが あそぶ？・おうちの方ページ）も 見る。
 *
 *   npm run check:a11y                       # 使いすての DB（5544）+ next start（next build は すんでいること）
 *   npm run check:a11y -- --offline          # DB なし（おためしモード）
 *   npm run check:a11y -- --base http://localhost:3100 [--db <URL>]   # 動いている サーバー
 *   オプション: --out <file.md>（既定 docs/run10/report/a11y.md）/ --timeout <秒>（既定 600）
 * さいごに「CHECK-SUMMARY: …」の 1行を 出す（check:all が 表に つかう）。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { installDeadline, timeoutArg } from "./lib/checkKit";
import { argOf, ensureServer } from "./lib/checkServer";

const OUT = path.resolve(argOf("out", "docs/run10/report/a11y.md")!);
const TIMEOUT_SEC = timeoutArg(600);
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING = new Set(["critical", "serious"]);

/** おもな 画面（おためしモードで ひらける もの） */
export const A11Y_PAGES: { name: string; url: string }[] = [
  { name: "スタート", url: "/welcome" },
  { name: "ログイン", url: "/login" },
  { name: "新規登録", url: "/register" },
  { name: "パスワードを忘れた", url: "/forgot-password" },
  { name: "暗証番号を忘れた", url: "/forgot-pin" },
  { name: "マップ", url: "/map" },
  { name: "レッスン1（せんせい）", url: "/lesson/1" },
  { name: "レッスン31", url: "/lesson/31" },
  { name: "まとめ動画1", url: "/recap/1" },
  { name: "ふくしゅうクエスト", url: "/test/check-1" },
  { name: "ミニテスト", url: "/test/mini-1-5" },
  { name: "ダッシュボード", url: "/dashboard" },
  { name: "ガチャ", url: "/gacha" },
  { name: "アリーナ", url: "/arena" },
  { name: "ランキング", url: "/ranking" },
  { name: "としょかん", url: "/library" },
  { name: "おはなし", url: "/library/story/s1-01" },
  { name: "チャンツ", url: "/library/chant/c-01" },
  { name: "フリートーク", url: "/library/talk/t-food" },
  { name: "力だめし", url: "/yearly" },
  { name: "利用規約", url: "/terms" },
  { name: "プライバシーポリシー", url: "/privacy" },
  { name: "特定商取引法", url: "/tokushoho" },
];

const LOADING_TEXT = /よみこみちゅう|じゅんびちゅう|きろくしています|読み込み中/;

interface Violation { id: string; impact: string; help: string; nodes: number; targets: string[] }
interface PageResult { name: string; url: string; violations: Violation[]; error?: string }

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
  await page.waitForFunction((src) => !new RegExp(src).test(document.body?.innerText ?? ""), LOADING_TEXT.source, { timeout: 20_000 }).catch(() => undefined);
  // 出てくる アニメーション（opacity 0 → 1）の とちゅうで コントラストを はからない
  await page.waitForTimeout(1200);
}

async function audit(page: Page, name: string, url: string): Promise<PageResult> {
  try {
    if (url) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await settle(page);
    }
    const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const violations = r.violations.map((v) => ({
      id: v.id, impact: v.impact ?? "minor", help: v.help, nodes: v.nodes.length,
      targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
    }));
    return { name, url: url || page.url(), violations };
  } catch (e) {
    return { name, url, violations: [], error: e instanceof Error ? e.message.split("\n")[0] : String(e) };
  }
}

async function newCtx(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ja-JP", reducedMotion: "reduce" });
  ctx.setDefaultTimeout(30_000);
  return ctx;
}

/** DB が あるとき: 保護者を 登録 → お子さまを 追加 → だれが あそぶ？ → おうちの方ページ */
async function parentPages(browser: Browser, base: string, log: (s: string) => void): Promise<PageResult[]> {
  const ctx = await newCtx(browser);
  const page = await ctx.newPage();
  const out: PageResult[] = [];
  const email = `a11y-${Date.now()}@example.com`;
  const pw = "a11y-pass-9876";
  const pin = "2580";
  try {
    await page.goto(base + "/register", { waitUntil: "networkidle" });
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード", { exact: true }).fill(pw);
    await page.getByLabel("パスワード（確認）", { exact: true }).fill(pw);
    await page.getByLabel("暗証番号", { exact: true }).fill(pin);
    await page.getByLabel("暗証番号（確認）", { exact: true }).fill(pin);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/parent/);
    const form = page.getByRole("form", { name: "お子さまを追加" });
    const addButton = page.getByRole("button", { name: "＋ お子さまを追加" });
    await form.or(addButton).first().waitFor();
    if ((await form.count()) === 0) await addButton.click();
    await settle(page);
    out.push(await audit(page, "おうちの方（お子さまを追加）", ""));
    log(`  ・おうちの方（お子さまを追加）`);
    await form.getByLabel("ニックネーム").fill("そら");
    await form.getByRole("button", { name: "追加する" }).click();
    await page.getByRole("heading", { name: /そら/ }).first().waitFor();
    await settle(page);
    out.push(await audit(page, "おうちの方（ようす）", ""));
    log(`  ・おうちの方（ようす）`);
    out.push(await audit(page, "だれが あそぶ？", base + "/who"));
    log(`  ・だれが あそぶ？`);
    await page.goto(base + "/parent", { waitUntil: "domcontentloaded" });
    const pad = page.getByRole("button", { name: "数字 1" });
    const overview = page.getByRole("heading", { name: "お子さまのようす" });
    await overview.or(pad).first().waitFor();
    if (await pad.isVisible().catch(() => false)) {
      await settle(page);
      out.push(await audit(page, "暗証番号パッド", ""));
      log(`  ・暗証番号パッド`);
    }
  } catch (e) {
    out.push({ name: "保護者の 画面（ログイン後）", url: base + "/register", violations: [], error: e instanceof Error ? e.message.split("\n")[0] : String(e) });
  } finally {
    await ctx.close();
  }
  return out;
}

function render(results: PageResult[], base: string, withDb: boolean): string {
  const blocking = results.flatMap((r) => r.violations.filter((v) => BLOCKING.has(v.impact)).map((v) => ({ page: r.name, ...v })));
  const other = results.flatMap((r) => r.violations.filter((v) => !BLOCKING.has(v.impact)).map((v) => ({ page: r.name, ...v })));
  const errors = results.filter((r) => r.error);
  const lines = [
    "# アクセシビリティ（axe-core）",
    "",
    `- 日時: ${new Date().toISOString()}・サーバー: ${base}（${withDb ? "本物の DB" : "DB なし"}）・画面 390x844`,
    `- ルール: ${TAGS.join(", ")}。critical・serious は 失敗、moderate・minor は 数だけ`,
    `- 画面 ${results.length}・critical/serious ${blocking.length} 種類・moderate/minor ${other.length} 種類・ひらけなかった 画面 ${errors.length}`,
    "",
    "| 画面 | URL | critical/serious | moderate/minor |",
    "|---|---|---|---|",
    ...results.map((r) => `| ${r.name} | ${r.url.replace(base, "")} | ${r.error ? "ひらけない" : r.violations.filter((v) => BLOCKING.has(v.impact)).length} | ${r.violations.filter((v) => !BLOCKING.has(v.impact)).length} |`),
    "",
  ];
  if (blocking.length || other.length) {
    lines.push("## 違反", "", "| 画面 | impact | rule | 数 | 説明 | 場所（さいしょの 5つ） |", "|---|---|---|---|---|---|");
    for (const v of [...blocking, ...other]) lines.push(`| ${v.page} | ${v.impact} | ${v.id} | ${v.nodes} | ${v.help.replace(/\|/g, "\\|")} | ${v.targets.map((t) => `\`${t.replace(/\|/g, "\\|")}\``).join("<br>")} |`);
    lines.push("");
  }
  if (errors.length) {
    lines.push("## ひらけなかった 画面", "");
    for (const e of errors) lines.push(`- ${e.name}（${e.url}）: ${e.error}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  let stopRef: (() => Promise<void>) | null = null;
  // 時間切れでも DB の コンテナと サーバーを 止める（docker rm・taskkill は 同期で 走る）
  installDeadline(TIMEOUT_SEC, () => { void stopRef?.(); });
  const srv = await ensureServer(3610, "a11y");
  stopRef = srv.stop;
  let code = 1;
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    const log = (s: string) => console.log(s);
    console.log(`a11y: ${srv.base}（${A11Y_PAGES.length} 画面${srv.db ? " ＋ ログイン後の 保護者の 画面" : ""}）`);
    const results: PageResult[] = [];
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    for (const [i, p] of A11Y_PAGES.entries()) {
      const r = await audit(page, p.name, srv.base + p.url);
      results.push(r);
      const b = r.violations.filter((v) => BLOCKING.has(v.impact));
      console.log(`  [${i + 1}/${A11Y_PAGES.length}] ${r.error ? "✖" : b.length ? "✖" : "✓"} ${p.name} ${p.url}${r.error ? `: ${r.error}` : b.length ? `: ${b.map((v) => `${v.id}(${v.nodes})`).join(", ")}` : ""}`);
    }
    await ctx.close();
    if (srv.db) results.push(...(await parentPages(browser, srv.base, log)));
    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, render(results, srv.base, !!srv.db));
    const blocking = results.reduce((n, r) => n + r.violations.filter((v) => BLOCKING.has(v.impact)).length, 0);
    const minor = results.reduce((n, r) => n + r.violations.filter((v) => !BLOCKING.has(v.impact)).length, 0);
    const errors = results.filter((r) => r.error);
    for (const e of errors) console.log(`  ✖ ${e.name}: ${e.error}`);
    console.log(`→ ${path.relative(process.cwd(), OUT)}`);
    console.log(`CHECK-SUMMARY: ${results.length} pages・critical/serious ${blocking}・moderate/minor ${minor}`);
    code = blocking === 0 && errors.length === 0 ? 0 : 1;
  } finally {
    await browser?.close();
    await srv.stop();
  }
  process.exit(code);
}

if (process.argv[1] && /a11y-check\.ts$/.test(process.argv[1])) {
  main().catch((e) => {
    console.error("✖", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
