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
 * 保護者アカウントの 画面（/welcome・/register・/login・/who・/parent）も ひらき、DB 停止中の アカウントの 流れも 確かめる:
 *   API: me は loggedIn:false、登録・ログイン・子ども・ようすは 503 + offline:true、ログアウトは 200
 *   画面: スタート →「おためしで あそぶ」→ マップ、次からは / → マップ、ログイン・登録の ていねいな 案内 → おためしへ、
 *         /who・/parent の DB 停止の 案内、古い ログイン cookie が 残っていても おためしで 遊べる
 *
 * さいごに おためしモードの 流れも 確かめる:
 *   API（DB なし）: レッスン完了・かいわ・まとめ視聴 が success / ok で 返る
 *   画面: この ブラウザで Lesson 1 を クリアした きろくが あれば、マップに「きょうのまとめ」リンクが 出る
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

const BASE = (process.argv[2] ?? process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");
/** 保存先（2つめの 引数 か SMOKE_OUT で かえられる。さいごの 確認は docs/night2/screens/final） */
const OUT = path.resolve(process.argv[3] ?? process.env.SMOKE_OUT ?? path.resolve(__dirname, "../docs/night2/screens"));

/** 各ワールドの さいしょの レッスン（1, 31, 61, … 331） */
const WORLD_LESSONS = Array.from({ length: 12 }, (_, i) => i * 30 + 1);

const PAGES: { name: string; url: string }[] = [
  { name: "home", url: "/" },
  { name: "welcome", url: "/welcome" },
  { name: "register", url: "/register" },
  { name: "login", url: "/login" },
  { name: "who", url: "/who" },
  { name: "parent", url: "/parent" },
  { name: "map", url: "/map" },
  { name: "dashboard", url: "/dashboard" },
  { name: "gacha", url: "/gacha" },
  { name: "arena", url: "/arena" },
  { name: "ranking", url: "/ranking" },
  { name: "test-check-1", url: "/test/check-1" },
  { name: "test-mini-1-5", url: "/test/mini-1-5" },
  { name: "recap-1", url: "/recap/1" },
  // run4: LINE で登録した保護者の暗証番号の画面・LINE から戻ったときの案内・PDF のダウンロードページ（DB 停止中）
  { name: "setup-pin", url: "/setup-pin" },
  { name: "login-line-notice", url: "/login?line=not_configured" },
  { name: "download-page", url: `/d/${"x".repeat(43)}` },
  // run5: パスワードを忘れた・再設定（でたらめなリンク）・メールアドレスの確認・暗証番号を忘れた（DB 停止中）
  { name: "forgot-password", url: "/forgot-password" },
  { name: "reset-password", url: `/reset-password?token=${"x".repeat(43)}` },
  { name: "verify-email", url: `/verify-email?token=${"x".repeat(43)}` },
  { name: "forgot-pin", url: "/forgot-pin" },
  // run7 P-library: えいごの としょかん（おためしモードでも 一覧・おはなし・チャンツ・フリートークの 案内）
  { name: "library", url: "/library" },
  { name: "library-story-s1-01", url: "/library/story/s1-01" },
  { name: "library-chant-c-01", url: "/library/chant/c-01" },
  { name: "library-talk-t-food", url: "/library/talk/t-food" },
  // run7 P-yearly: 年に1回の 力だめし
  { name: "yearly", url: "/yearly" },
  ...WORLD_LESSONS.map((n) => ({ name: `lesson-${n}`, url: `/lesson/${n}` })),
];

/** 画面に 出ていたら おかしい 文言（エラー画面・通信エラー・Next.js の エラー表示） */
const ERROR_TEXT = [
  /Application error/i, /Unhandled Runtime Error/i, /Internal Server Error/i, /This page could not be found/i, /\b404\b/, /\b500\b/,
  /client-side exception/i, /Something went wrong/i, /JSON\.parse/i, /Unexpected token/i, /undefined is not/i, /Cannot read properties/i,
  /通信がうまくいかなかった/, /サーバーで問題が起きた/, /エラー/, /見つからないよ/, /まだ ひらいていない/,
];
/** 「よみこみ中」の 文言（これが 残っていたら 止まっている） */
const LOADING_TEXT = /よみこみちゅう|じゅんびちゅう|きろくしています|読み込み中/;

interface Problem { page: string; kind: string; detail: string }
const problems: Problem[] = [];
const fail = (page: string, kind: string, detail: string) => problems.push({ page, kind, detail: detail.slice(0, 300) });

/** DB 停止中の アカウント API は 503 + offline:true を 返す（ていねいな 案内を 出すための 正しい 応答） */
const ACCOUNT_API = /\/api\/(auth|children|parent)\//;

function watch(page: Page, name: string, opts: { allowAccount503?: boolean } = {}) {
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
    if (s === 503 && opts.allowAccount503 && ACCOUNT_API.test(url)) return;
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

async function api(method: "GET" | "POST" | "PATCH" | "DELETE", url: string, body?: unknown) {
  const r = await fetch(BASE + url, { method, headers: { "content-type": "application/json", origin: BASE }, body: body === undefined ? undefined : JSON.stringify(body) });
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

/** DB 停止中の 保護者アカウント（おためしモードで 動きつづける こと） */
async function accountOfflineFlow(browser: Browser) {
  console.log("DB 停止中の アカウント（API）");
  const me = await api("GET", "/api/auth/me");
  if (me.status !== 200 || me.json.loggedIn !== false) fail("api auth/me", "api", JSON.stringify(me.json));
  else console.log(`  ✓ me → loggedIn:false offline=${me.json.offline}`);
  const offlineCalls: [string, "GET" | "POST" | "PATCH" | "DELETE", string, unknown?][] = [
    ["登録", "POST", "/api/auth/register", { email: "smoke@example.com", password: "passw0rd1", pin: "1234" }],
    ["ログイン", "POST", "/api/auth/login", { email: "smoke@example.com", password: "passw0rd1" }],
    ["子ども一覧", "GET", "/api/children"],
    ["子ども追加", "POST", "/api/children", { nickname: "テスト", schoolGrade: 2 }],
    ["暗証番号", "POST", "/api/parent/verify-pin", { pin: "1234" }],
    ["ようす", "GET", "/api/parent/overview"],
    ["設定", "GET", "/api/parent/settings"],
  ];
  for (const [label, method, url, body] of offlineCalls) {
    const r = await api(method, url, body);
    if (r.status !== 503 || r.json.offline !== true || r.json.success !== false || typeof r.json.messageJa !== "string") fail(`api ${url}`, "api", `${r.status} ${JSON.stringify(r.json)}`);
    else console.log(`  ✓ ${label} → 503 offline（ていねいな 案内）`);
  }
  // run4: アバター・おためしの引き継ぎ・LINE の連携/毎月のレポート（DB 停止中は 503 + offline のていねいな案内）
  const run4Offline: [string, "GET" | "POST" | "PATCH" | "DELETE", string, unknown?][] = [
    ["アバター変更", "PATCH", "/api/children/child_x/avatar", { avatarCharacter: "riko" }],
    ["おためしの引き継ぎ", "POST", "/api/children/child_x/carry-over", { trialId: "t".repeat(32), lessons: {}, tests: {}, coins: 0, days: [], items: {} }],
    ["LINE の連携解除", "DELETE", "/api/parent/line"],
    ["LINE レポートの設定", "GET", "/api/parent/line-monthly"],
    ["LINE レポートを今すぐ送る", "POST", "/api/parent/line-monthly"],
    ["暗証番号を決める（LINE）", "POST", "/api/auth/line/pin", { pin: "1234" }],
  ];
  for (const [label, method, url, body] of run4Offline) {
    const r = await api(method, url, body);
    if (r.status !== 503 || r.json.offline !== true || r.json.success !== false || typeof r.json.messageJa !== "string") fail(`api ${url}`, "api", `${r.status} ${JSON.stringify(r.json)}`);
    else console.log(`  ✓ ${label} → 503 offline（ていねいな 案内）`);
  }
  // LINE ログインは キーが無い（このスモークは .env に LINE の値を入れない前提）→「準備中」で ログイン画面へ戻す
  for (const mode of ["login", "link"]) {
    const r = await fetch(`${BASE}/api/auth/line/start?mode=${mode}`, { redirect: "manual" });
    const loc = r.headers.get("location") ?? "";
    const want = mode === "link" ? "/parent?line=not_configured" : "/login?line=not_configured";
    if (r.status !== 303 || !loc.endsWith(want) || r.headers.get("set-cookie")?.includes("eq_line_oauth=")) fail(`api line/start ${mode}`, "api", `${r.status} ${loc}`);
    else console.log(`  ✓ LINE ログイン（${mode}）未設定 → 303 ${want}`);
  }
  const cb = await fetch(`${BASE}/api/auth/line/callback?code=x&state=y`, { redirect: "manual" });
  if (cb.status !== 303 || !(cb.headers.get("location") ?? "").endsWith("/login?line=not_configured")) fail("api line/callback", "api", `${cb.status} ${cb.headers.get("location")}`);
  else console.log("  ✓ LINE コールバック 未設定 → 303 /login?line=not_configured");
  // webhook はシークレットが無ければ 受け付けない（署名を確かめられないため）
  const wh = await fetch(`${BASE}/api/line/webhook`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": "AAAA" }, body: JSON.stringify({ events: [] }) });
  if (wh.status !== 503) fail("api line/webhook", "api", `${wh.status}`);
  else console.log("  ✓ LINE webhook シークレットなし → 503");
  // PDF のダウンロード（DB 停止）は 503 の文章。知らない形のトークンでも 500 に しない
  for (const p of [`/d/${"x".repeat(43)}/report`, "/d/short/worksheets"]) {
    const r = await fetch(BASE + p);
    const ok = (r.status === 503 || r.status === 404) && /no-store/.test(r.headers.get("cache-control") ?? "") && /noindex/.test(r.headers.get("x-robots-tag") ?? "");
    if (!ok) fail(`download ${p}`, "http", `${r.status} ${r.headers.get("cache-control")}`);
    else console.log(`  ✓ ダウンロード ${p} → ${r.status}（no-store・noindex）`);
  }

  // run5: パスワードの再設定・メールアドレスの確認・暗証番号を忘れた（DB 停止中は 503 + offline のていねいな案内）
  // 画面を ひらいたときに呼ぶ API（check・reset-pin の状態）は 200 + offline:true（画面が「利用できません」を出す）。それ以外は 503
  const run5Offline: [string, "GET" | "POST" | "PATCH" | "DELETE", string, unknown, 200 | 503][] = [
    ["パスワードを忘れた", "POST", "/api/auth/password-reset/request", { email: "smoke@example.com" }, 503],
    ["再設定リンクの確認", "POST", "/api/auth/password-reset/check", { token: "x".repeat(43) }, 200],
    ["パスワードの再設定", "POST", "/api/auth/password-reset/complete", { token: "x".repeat(43), newPassword: "passw0rd2" }, 503],
    ["メール確認リンクの確認", "POST", "/api/auth/email/check", { token: "x".repeat(43) }, 200],
    ["メールアドレスの確定", "POST", "/api/auth/email/confirm", { token: "x".repeat(43) }, 503],
    ["メールアドレスの追加", "POST", "/api/parent/email", { email: "smoke@example.com", password: "passw0rd1" }, 503],
    ["暗証番号を忘れた（状態）", "GET", "/api/parent/reset-pin", undefined, 200],
    ["暗証番号を忘れた（決める）", "POST", "/api/parent/reset-pin", { password: "passw0rd1", newPin: "1234" }, 503],
  ];
  for (const [label, method, url, body, want] of run5Offline) {
    const r = await api(method, url, body);
    if (r.status !== want || r.json.offline !== true || r.json.success !== false || typeof r.json.messageJa !== "string") fail(`api ${url}`, "api", `${r.status} ${JSON.stringify(r.json)}`);
    else console.log(`  ✓ ${label} → ${want} offline（ていねいな 案内）`);
  }
  // おためしの きろく（DB 停止中は「なし」を 200 で）
  const trial = await api("GET", "/api/trial");
  if (trial.status !== 200 || trial.json.offline !== true || trial.json.hasProgress !== false) fail("api trial", "api", `${trial.status} ${JSON.stringify(trial.json)}`);
  else console.log("  ✓ おためしの きろく → 200 offline・なし");

  // /api/health: DB 停止 → 503・ok:false。接続文字列・ホスト・パスは 出さない
  {
    const r = await fetch(`${BASE}/api/health`);
    const text = await r.text();
    let j: { ok?: boolean; db?: { reachable?: boolean } } = {};
    try { j = JSON.parse(text); } catch { /* 下で失敗 */ }
    const leaks = [/5999/, /eigo:eigo/, /127\.0\.0\.1/, /postgres(ql)?:\/\//i, /\.data/, /[A-Z]:\\\\/].filter((re) => re.test(text));
    if (r.status !== 503 || j.ok !== false || j.db?.reachable !== false || !/no-store/.test(r.headers.get("cache-control") ?? "")) fail("api health", "api", `${r.status} ${text.slice(0, 200)}`);
    else if (leaks.length) fail("api health", "leak", `health に 出してはいけない文字列: ${leaks.map(String).join(" ")}`);
    else console.log("  ✓ health → 503（DB 停止）・秘密やパスは 出ない");
  }
  // cron: 合い言葉なし → 401（CRON_SECRET 設定ずみ）/ 503（未設定）。まちがった合い言葉 → 401。正しい合い言葉 → DB 停止で 503 / LINE 未設定で 何もしない
  const cronSecret = process.env.SMOKE_CRON_SECRET ?? "";
  for (const p of ["/api/cron/trial-cleanup", "/api/cron/line-monthly"]) {
    const none = await fetch(BASE + p);
    const wantNone = cronSecret ? 401 : 503;
    if (none.status !== wantNone) fail(`cron ${p}`, "api", `合い言葉なし → ${none.status}（期待 ${wantNone}）`);
    else console.log(`  ✓ cron ${p} 合い言葉なし → ${none.status}`);
    if (!cronSecret) continue;
    const wrong = await fetch(BASE + p, { headers: { authorization: `Bearer ${cronSecret}x` } });
    if (wrong.status !== 401) fail(`cron ${p}`, "api", `まちがった合い言葉 → ${wrong.status}`);
    else console.log(`  ✓ cron ${p} まちがった合い言葉 → 401`);
    const right = await fetch(BASE + p, { headers: { authorization: `Bearer ${cronSecret}` } });
    const rj = (await right.json().catch(() => ({}))) as { code?: string; skipped?: string };
    const okRight = p.endsWith("trial-cleanup") ? right.status === 503 && rj.code === "DB_UNAVAILABLE" : right.status === 200 && rj.skipped === "LINE_NOT_CONFIGURED";
    if (!okRight) fail(`cron ${p}`, "api", `正しい合い言葉 → ${right.status} ${JSON.stringify(rj)}`);
    else console.log(`  ✓ cron ${p} 正しい合い言葉 → ${right.status} ${rj.code ?? rj.skipped}`);
  }

  const out = await api("POST", "/api/auth/logout");
  if (out.status !== 200 || out.json.ok !== true) fail("api auth/logout", "api", JSON.stringify(out.json));
  else console.log("  ✓ ログアウト → 200");

  console.log("DB 停止中の アカウント（画面）");
  const step = async (name: string, fn: (page: Page) => Promise<void>, prepare?: (ctx: BrowserContext) => Promise<void>) => {
    const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "ja-JP" });
    const page = await ctx.newPage();
    watch(page, name, { allowAccount503: true });
    try {
      if (prepare) await prepare(ctx);
      await fn(page);
      await checkText(page, name);
      await shot(page, name);
      console.log(`  ✓ ${name}`);
    } catch (e) {
      fail(name, "exception", (e as Error).message);
      console.log(`  ✗ ${name}`);
    } finally {
      await ctx.close();
    }
  };

  // はじめて → スタート画面 →「おためしで あそぶ」→ マップ。次からは / で マップへ
  await step("trial-from-welcome", async (page) => {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/welcome$/, { timeout: 20_000 });
    await settle(page, "trial-from-welcome");
    await page.getByRole("button", { name: "おためしで あそぶ" }).click();
    await page.waitForURL(/\/map$/, { timeout: 20_000 });
    await settle(page, "trial-from-welcome");
    if ((await page.getByText("おためしモード").count()) === 0) fail("trial-from-welcome", "trial", "マップの ヘッダーに「おためしモード」が 出ない");
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/map$/, { timeout: 20_000 }).catch(() => fail("trial-from-welcome", "redirect", `2回目の / が マップに 行かない（${page.url()}）`));
    await settle(page, "trial-from-welcome");
  });

  // ログインしようとしても DB が 止まっている → ていねいな 案内 →「おためしで あそぶ」
  await step("login-offline", async (page) => {
    await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
    await settle(page, "login-offline");
    await page.getByLabel("メールアドレス").fill("smoke@example.com");
    await page.getByLabel("パスワード", { exact: true }).fill("passw0rd1");
    await page.getByRole("button", { name: "ログイン", exact: true }).click();
    await page.getByText("ただいまアカウント機能を利用できません").first().waitFor({ timeout: 20_000 });
    await shot(page, "login-offline-message");
    await page.getByRole("button", { name: "おためしで あそぶ" }).click();
    await page.waitForURL(/\/map$/, { timeout: 20_000 });
    await settle(page, "login-offline");
  });

  // 登録しようとしても DB が 止まっている → ていねいな 案内（エラー画面に しない）
  await step("register-offline", async (page) => {
    await page.goto(BASE + "/register", { waitUntil: "domcontentloaded" });
    await settle(page, "register-offline");
    await page.getByLabel("メールアドレス").fill("smoke@example.com");
    await page.getByLabel("パスワード", { exact: true }).fill("passw0rd1");
    await page.getByLabel("パスワード（確認）", { exact: true }).fill("passw0rd1");
    await page.getByLabel("暗証番号", { exact: true }).fill("1234");
    await page.getByLabel("暗証番号（確認）", { exact: true }).fill("1234");
    await page.locator('form button[type="submit"]').click();
    await page.getByText("ただいまアカウント機能を利用できません").first().waitFor({ timeout: 20_000 });
  });

  // 古い ログイン cookie が 残っていても（DB 停止）、/ → /who の 案内 → おためしで マップ
  const stale = async (ctx: BrowserContext) => {
    await ctx.addCookies([{ name: "eq_session", value: "s".repeat(43), url: BASE, httpOnly: true, sameSite: "Lax" }]);
  };
  await step("stale-cookie-offline", async (page) => {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/who$/, { timeout: 20_000 });
    await settle(page, "stale-cookie-offline");
    await page.getByText("いまは アカウントに つながらないよ").first().waitFor({ timeout: 20_000 });
    await shot(page, "who-offline");
    await page.getByRole("button", { name: "おためしで あそぶ" }).click();
    await page.waitForURL(/\/map$/, { timeout: 20_000 });
    await settle(page, "stale-cookie-offline");
    if (!page.url().endsWith("/map")) fail("stale-cookie-offline", "redirect", `マップに いられない（${page.url()}）`);
  }, stale);

  // おうちの方ページ（DB 停止）は ていねいな 案内
  await step("parent-offline", async (page) => {
    await page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
    await settle(page, "parent-offline");
    await page.getByText("ただいまアカウント機能を利用できません").first().waitFor({ timeout: 20_000 });
  }, stale);
}

/** スモーク ぜんたいの 時間制限（SMOKE_TIMEOUT_SEC。既定 15分）。こえたら 失敗で 終わる */
const TOTAL_TIMEOUT_MS = Math.max(60, Number(process.env.SMOKE_TIMEOUT_SEC) || 900) * 1000;
setTimeout(() => {
  console.error(`\n✗ 時間切れ（${TOTAL_TIMEOUT_MS / 1000}秒）。とちゅうまでの 問題: ${problems.length} こ`);
  for (const p of problems) console.error(`  [${p.page}] ${p.kind}: ${p.detail}`);
  process.exit(1);
}, TOTAL_TIMEOUT_MS).unref();

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`スモークテスト: ${BASE}`);
  const browser = await chromium.launch();
  try {
    for (const p of PAGES) await visit(browser, p);
    await offlineFlow(browser);
    await accountOfflineFlow(browser);
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
