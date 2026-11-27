/**
 * run10 Phase 1: 内部リンクの 確認。
 *  1. ブラウザ（Playwright）で おもな 画面を ひらき、表示された <a href>・<img src>・<link href>・<script src>・<source src> の
 *     同じ サイトの URL を あつめる（見つけた 画面も たどる。同じ かたちの URL は 3つまで ブラウザで ひらく）
 *  2. ルートの ぜんぶ（レッスン 1〜1200・まとめ 1〜1200・テスト ぜんぶ・としょかん ぜんぶ）を くわえる
 *  3. ぜんぶの URL を GET（8本 同時）。4xx・5xx・つながらない が 1つでも あれば 失敗
 *
 *   npm run check:links                  # DB なし（おためしモード）で next start（next build は すんでいること）
 *   npm run check:links -- --base http://localhost:3100
 *   オプション: --out <file.md>（既定 docs/run10/report/links.md）/ --timeout <秒>（既定 900）
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser } from "playwright";
import { ASSESSMENTS, LESSONS } from "../src/lib/curriculum";
import { LIBRARY_INDEX } from "../src/lib/library/catalog";
import { installDeadline, timeoutArg } from "./lib/checkKit";
import { argOf, ensureServer } from "./lib/checkServer";
import { A11Y_PAGES } from "./a11y-check";

const OUT = path.resolve(argOf("out", "docs/run10/report/links.md")!);
const TIMEOUT_SEC = timeoutArg(900);
const PER_PATTERN = 3;
const MAX_RENDER = 150;

/** /lesson/12 → /lesson/:n（ブラウザで ひらく 数を おさえる） */
export function urlPattern(u: string): string {
  const { pathname } = new URL(u, "http://x");
  return pathname.replace(/\/\d+(?=\/|$)/g, "/:n").replace(/\/(s\d-\d+|c-\d+|t-[a-z-]+|check-\d+|mini-\d+-\d+|boss-\d+-\d+|arena-\d+|treasure-\d+)(?=\/|$)/g, "/:id");
}

/** チェックしない URL（API・ダウンロードの でたらめな トークン・外の サイト） */
export function skipUrl(u: URL, origin: string): boolean {
  if (u.origin !== origin) return true;
  if (u.pathname.startsWith("/api/")) return true;
  if (u.protocol !== "http:" && u.protocol !== "https:") return true;
  return false;
}

/** ルートの ぜんぶ（ブラウザで ひらかずに GET だけ） */
export function allKnownRoutes(): string[] {
  const out = ["/", "/welcome", "/login", "/register", "/forgot-password", "/forgot-pin", "/who", "/parent", "/setup-pin", "/map", "/dashboard",
    "/gacha", "/arena", "/ranking", "/library", "/yearly", "/terms", "/privacy", "/tokushoho", "/verify-email", "/reset-password"];
  for (const l of LESSONS) out.push(`/lesson/${l.lessonNo}`, `/recap/${l.lessonNo}`);
  for (const a of ASSESSMENTS) out.push(`/test/${a.id}`);
  for (const s of LIBRARY_INDEX.stories) out.push(`/library/story/${s.id}`);
  for (const c of LIBRARY_INDEX.chants) out.push(`/library/chant/${c.id}`);
  for (const t of LIBRARY_INDEX.talks) out.push(`/library/talk/${t.id}`);
  return out;
}

interface Found { url: string; from: Set<string> }

async function crawl(browser: Browser, base: string, found: Map<string, Found>) {
  const origin = new URL(base).origin;
  const queue = ["/", ...A11Y_PAGES.map((p) => p.url), "/who", "/parent", "/setup-pin"].map((p) => new URL(p, base).href);
  const perPattern = new Map<string, number>();
  const seen = new Set<string>();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ja-JP" });
  ctx.setDefaultTimeout(30_000);
  const page = await ctx.newPage();
  let rendered = 0;
  while (queue.length && rendered < MAX_RENDER) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    const pat = urlPattern(url);
    const n = perPattern.get(pat) ?? 0;
    if (n >= PER_PATTERN) continue;
    perPattern.set(pat, n + 1);
    rendered++;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(400);
      const links = await page.evaluate(() => {
        const pick = (sel: string, attr: string) => [...document.querySelectorAll(sel)].map((e) => (e as HTMLElement).getAttribute(attr) ?? "").filter(Boolean);
        return {
          a: pick("a[href]", "href"),
          res: [...pick("img[src]", "src"), ...pick("link[href]", "href"), ...pick("script[src]", "src"), ...pick("source[src]", "src"), ...pick("audio[src]", "src"), ...pick("video[src]", "src")],
        };
      });
      const from = new URL(url).pathname;
      for (const [kind, list] of [["a", links.a], ["res", links.res]] as const) {
        for (const raw of list) {
          if (/^(mailto:|tel:|javascript:|data:|blob:|#)/.test(raw)) continue;
          let u: URL;
          try { u = new URL(raw, url); } catch { continue; }
          if (skipUrl(u, origin)) continue;
          u.hash = "";
          const key = u.href;
          const f = found.get(key) ?? { url: key, from: new Set<string>() };
          f.from.add(from);
          found.set(key, f);
          if (kind === "a" && !seen.has(key)) queue.push(key);
        }
      }
      console.log(`  [ブラウザ ${rendered}] ${from} → リンク ${links.a.length}・ファイル ${links.res.length}`);
    } catch (e) {
      const f = found.get(url) ?? { url, from: new Set<string>() };
      f.from.add("(ブラウザで ひらけない)");
      found.set(url, f);
      console.log(`  [ブラウザ ${rendered}] ✖ ${url}: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
    }
  }
  await ctx.close();
  return rendered;
}

async function fetchAll(urls: string[], concurrency = 8): Promise<Map<string, number | string>> {
  const res = new Map<string, number | string>();
  let i = 0;
  let done = 0;
  const t0 = Date.now();
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      try {
        const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(30_000) });
        await r.arrayBuffer();
        res.set(u, r.status);
      } catch (e) {
        res.set(u, e instanceof Error ? e.message : String(e));
      }
      done++;
      if (done % 250 === 0) console.log(`  GET ${done}/${urls.length}（${Math.round((Date.now() - t0) / 1000)}秒）`);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return res;
}

async function main() {
  let stopRef: (() => Promise<void>) | null = null;
  installDeadline(TIMEOUT_SEC, () => { void stopRef?.(); });
  // DB なしで よい（リンクは おためしモードでも 同じ）。--base が あれば それを つかう
  if (!process.argv.includes("--base") && !process.argv.includes("--db")) process.argv.push("--offline");
  const srv = await ensureServer(3620, "links");
  stopRef = srv.stop;
  let code = 1;
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch();
    console.log(`links: ${srv.base}`);
    const found = new Map<string, Found>();
    const rendered = await crawl(browser, srv.base, found);
    for (const r of allKnownRoutes()) {
      const key = new URL(r, srv.base).href;
      if (!found.has(key)) found.set(key, { url: key, from: new Set(["(ルート ぜんぶ)"]) });
    }
    const urls = [...found.keys()].sort();
    console.log(`  ブラウザで ${rendered} 画面・URL ${urls.length} こ を GET`);
    const status = await fetchAll(urls);
    const bad = urls.filter((u) => { const s = status.get(u); return typeof s !== "number" || s >= 400; });
    const discovered = [...found.values()].filter((f) => ![...f.from].every((x) => x.startsWith("("))).length;
    mkdirSync(path.dirname(OUT), { recursive: true });
    const rel = (u: string) => u.replace(new URL(srv.base).origin, "");
    writeFileSync(OUT, [
      "# 内部リンクの 確認",
      "",
      `- 日時: ${new Date().toISOString()}・サーバー: ${srv.base}`,
      `- ブラウザで ひらいた 画面 ${rendered}（同じ かたちは ${PER_PATTERN} つまで）・画面から 見つけた URL ${discovered}・ルート ぜんぶを くわえて GET ${urls.length}`,
      `- こわれた URL（4xx・5xx・つながらない）: **${bad.length}**`,
      "",
      ...(bad.length ? ["| URL | 状態 | どこから |", "|---|---|---|", ...bad.map((u) => `| ${rel(u)} | ${status.get(u)} | ${[...found.get(u)!.from].slice(0, 5).join(", ")} |`), ""] : []),
    ].join("\n"));
    for (const u of bad.slice(0, 30)) console.log(`  ✖ ${rel(u)} → ${status.get(u)}（${[...found.get(u)!.from].slice(0, 3).join(", ")}）`);
    console.log(`→ ${path.relative(process.cwd(), OUT)}`);
    console.log(`CHECK-SUMMARY: ${urls.length} URLs（画面 ${rendered}）・broken ${bad.length}`);
    code = bad.length === 0 ? 0 : 1;
  } finally {
    await browser?.close();
    await srv.stop();
  }
  process.exit(code);
}

if (process.argv[1] && /link-check\.ts$/.test(process.argv[1])) {
  main().catch((e) => {
    console.error("✖", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
