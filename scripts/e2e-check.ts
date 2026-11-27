/**
 * run10 Phase 4: クリックで すすめる ロボット（Playwright + 本物の DB + next start）。
 *
 *   npm run check:e2e                                  # DB（Docker 5544 / embedded-postgres）も 自分で 用意する
 *   npm run check:e2e -- --db <URL>                    # check:all は 用意した DB を わたす（ポート 5432 は こばむ）
 *   npm run check:e2e -- --only worlds,progress --worlds 1-5 --no-build --workers 4 --timeout 3000
 *
 * じゅんび: E2E=1 で next build（.next-e2e。テストの しかけ = 正解を data-e2e-* に 出す。src/lib/e2e.ts）
 *   → ふつうの ビルド（.next）に しかけが ない ことを たしかめる → next start（E2E=1・テスト用の 時計・メールは outbox・LINE は dry-run）
 * しらべる こと（--only の 名前）:
 *   worlds   40 ワールドの それぞれ 1 レッスンを 先生の 授業 → … → かいわ → クリア まで クリック。DB に 完了が のこる
 *   progress タイムトラベル（つぎの 日）→ 復習クエストが ひらいて 合格できる・Lesson 5 の あとの まとめテスト・30 の あとの ボス・アリーナが ひらく
 *   extras   まとめ動画を さいごまで（1日 1回だけ コイン）・としょかんの おはなし ＋ クイズ・力だめし 1 回
 *   parent   登録・お子さま 2 人（キャラクター）・おためしの ひきつぎ・暗証番号・パスワードを 忘れた（outbox）・暗証番号を 忘れた・
 *            LINE の 毎月の dry-run と ダウンロードページ・退会
 *   offline  DB を 止めた サーバー ＋ 電波なし（ブラウザを offline）で エラー画面が 出ない（スマホ 390x844・タブレット 1024x768）
 * 失敗した ときだけ スクリーンショットを docs/run10/report/e2e-failures/ に 保存。レポートは docs/run10/report/e2e.md。
 * さいごに「CHECK-SUMMARY: …」（check:all の 表に のる）。失敗が あれば 終了コード 1。
 */
import type { ChildProcess } from "node:child_process";
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PDFDocument } from "pdf-lib";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { clearRateLimits, isWin, run, startServer, stopServer, timeoutArg, waitForServer } from "./lib/checkKit";
import { assertSafeDbUrl, prepareCheckDb, startCheckDb, type CheckDb } from "./lib/checkDb";
import { argOf, checkServerEnv, freePort } from "./lib/checkServer";
import { FAKE_MEDIA, answerQuestion, callLog, playLesson, playTest, setSay, type LessonPlay } from "./lib/e2eRobot";
import { scanForHook, lessonForWorld, parseRange, ERROR_TEXT, LOADING_TEXT, renderE2eReport, type E2eSection, type WorldRow } from "./lib/e2eReport";
import { ASSESSMENTS, getLesson } from "../src/lib/curriculum";
import { buildLessonFlow } from "../src/lib/curriculum/questions";
import { loadStory } from "../src/lib/library/catalog";
import { testStageFor } from "../src/lib/yearly/availability";
import { localDate } from "../src/lib/domain/dates";
import type { YearlyTest } from "../src/lib/yearly/types";

const ROOT = path.resolve(__dirname, "..");
const WORK = path.join(ROOT, ".tmp", "e2e");
const SHOTS = path.join(ROOT, "docs", "run10", "report", "e2e-failures");
const REPORT = path.join(ROOT, "docs", "run10", "report", "e2e.md");
const CLOCK_FILE = path.join(WORK, "clock.json");
const PRELOAD = path.join(ROOT, "scripts", "e2e", "clock-preload.cjs").replace(/\\/g, "/");
const TIMEOUT_SEC = timeoutArg(3000);
const ONLY = (argOf("only") ?? "worlds,progress,extras,parent,offline").split(",").map((s) => s.trim()).filter(Boolean);
const WORLDS = parseRange(argOf("worlds") ?? "1-40", 40);
const WORKERS = Math.max(1, Math.min(8, Number(argOf("workers", "3"))));
const PHONE = { width: 390, height: 844 };
const TABLET = { width: 1024, height: 768 };
const CRON_SECRET = randomBytes(24).toString("base64url");
const DAY = 86_400_000;

// ---------------------------------------------------------------------------
// けっかの きろく
// ---------------------------------------------------------------------------
const sections = new Map<string, E2eSection>();
const worldRows: WorldRow[] = [];
const sec = (name: string) => {
  let s = sections.get(name);
  if (!s) sections.set(name, (s = { name, ok: 0, ng: 0, ms: 0, failures: [], notes: [] }));
  return s;
};
const checkLog: { section: string; label: string; ok: boolean }[] = [];
let shotNo = 0;
async function shot(page: Page | null | undefined, name: string): Promise<string | null> {
  if (!page || page.isClosed()) return null;
  mkdirSync(SHOTS, { recursive: true });
  const file = `${String(++shotNo).padStart(2, "0")}-${name.replace(/[^\w.-]+/g, "_").slice(0, 60)}.png`;
  try {
    await page.screenshot({ path: path.join(SHOTS, file), fullPage: true, timeout: 15_000 });
    return file;
  } catch {
    return null;
  }
}
async function check(section: string, label: string, cond: boolean, detail?: unknown, page?: Page) {
  const s = sec(section);
  checkLog.push({ section, label, ok: cond });
  console.log(`${cond ? "✔" : "✖"} [${section}] ${label}`);
  if (cond) { s.ok++; return true; }
  s.ng++;
  const d = detail === undefined ? "" : typeof detail === "string" ? detail : JSON.stringify(detail);
  if (d) console.log(`    ${d.slice(0, 600)}`);
  const file = await shot(page, `${section}-${label}`);
  s.failures.push({ label, detail: d.slice(0, 600), shot: file });
  return false;
}
/** フローを 1 つ 実行。とちゅうの 例外も 失敗として のこす（スクリーンショットつき） */
async function flow(section: string, label: string, page: Page | null, fn: () => Promise<void>) {
  const t0 = Date.now();
  try {
    await fn();
  } catch (e) {
    await check(section, `${label}（とちゅうで 止まった）`, false, callLog(e), page ?? undefined);
  } finally {
    sec(section).ms += Date.now() - t0;
  }
}

// ---------------------------------------------------------------------------
// ブラウザ
// ---------------------------------------------------------------------------
interface Tab { ctx: BrowserContext; page: Page; errors: string[]; crashed: () => boolean }
const ACCOUNT_API = /\/api\/(auth|children|parent)\//;

async function newTab(browser: Browser, opts: { viewport?: { width: number; height: number }; allowAccount503?: boolean; offlineOk?: () => boolean } = {}): Promise<Tab> {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? PHONE, locale: "ja-JP", timezoneId: "Asia/Tokyo", acceptDownloads: true });
  ctx.setDefaultTimeout(30_000);
  ctx.setDefaultNavigationTimeout(60_000);
  await ctx.addInitScript({ content: FAKE_MEDIA });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/^Failed to load resource/.test(t)) return;
    // Next.js の リンクの 先読み（RSC）が ページ移動などで とちゅうで きれた → Next.js が ふつうの 移動に きりかえる（画面は かわらない）
    if (/^Failed to fetch RSC payload for .* Falling back to browser navigation/.test(t)) return;
    if (opts.offlineOk?.() && /fetch|network|ERR_INTERNET_DISCONNECTED|net::/i.test(t)) return;
    errors.push(`console.error: ${t.slice(0, 200)}`);
  });
  page.on("response", (r) => {
    const s = r.status();
    if (s === 503 && opts.allowAccount503 && ACCOUNT_API.test(r.url())) return;
    if (s >= 500) errors.push(`${s} ${r.request().method()} ${r.url()}`);
  });
  let crashed = false;
  page.on("crash", () => { crashed = true; errors.push("ブラウザの タブが クラッシュ"); });
  return { ctx, page, errors, crashed: () => crashed };
}

let BASE = "";
let db: PrismaClient;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const api = <T = Record<string, unknown>>(page: Page, url: string, method = "GET", body?: unknown) =>
  page.evaluate(async ({ url, method, body }) => {
    const r = await fetch(url, { method, headers: body === undefined ? {} : { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    let json: unknown = null;
    try { json = await r.json(); } catch { /* json では ない */ }
    return { status: r.status, json };
  }, { url, method, body }) as Promise<{ status: number; json: T }>;

/** スタート画面 →「おためしで あそぶ」→ マップ。この 端末の おためし学習者（DB）を かえす */
async function startTrial(t: Tab) {
  await t.page.goto(BASE + "/welcome", { waitUntil: "domcontentloaded" });
  await t.page.getByRole("button", { name: "おためしで あそぶ" }).click();
  await t.page.waitForURL(/\/map$/);
  await t.page.getByRole("list", { name: "ぼうけんマップ" }).waitFor({ timeout: 45_000 });
  for (let i = 0; i < 20; i++) {
    const u = await trialUserOf(t.ctx);
    if (u) return u;
    await t.page.waitForTimeout(250);
  }
  throw new Error("おためし学習者が DB に できない");
}
async function trialUserOf(ctx: BrowserContext) {
  const c = (await ctx.cookies()).find((x) => x.name === "eq_trial_learner");
  if (!c) return null;
  return db.user.findFirst({ where: { trialTokenHash: sha(c.value) }, select: { id: true, coins: true } });
}

/** レッスン 1〜n-1 と、その あいだの まとめ / ボスを 合格ずみに する（DB に 直接） */
async function seedProgress(userId: string, from: number, to: number, completedOn = "2026-01-01", skipGates: string[] = []) {
  if (to < from) return;
  const lessons = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  await db.lessonProgress.createMany({
    data: lessons.map((lessonNo) => ({ userId, lessonNo, status: "COMPLETED" as const, completedAt: new Date(), completedOn, quizScore: 1, speedListeningBest: 1 })),
    skipDuplicates: true,
  });
  const gates = ASSESSMENTS.filter((a) => (a.kind === "MINI" || a.kind === "BOSS") && a.rangeEnd >= from && a.rangeEnd <= to && !skipGates.includes(a.id));
  if (gates.length) {
    await db.testAttempt.createMany({ data: gates.map((a) => ({ userId, assessmentId: a.id, source: "NORMAL" as const, score: 1, passed: true, isFirstAttempt: true, coinsAwarded: 0, takenOn: completedOn })) });
  }
}

/** 子プロセスを 非同期で（イベントループを 止めない） */
function spawnAsync(cmd: string, args: string[], env: NodeJS.ProcessEnv, timeoutMs: number): Promise<{ status: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd: ROOT, env, shell: isWin });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (b: Buffer) => { stdout += b.toString("utf8"); });
    p.stderr.on("data", (b: Buffer) => { stderr += b.toString("utf8"); });
    const t = setTimeout(() => stopServer(p), timeoutMs);
    p.on("close", (status) => { clearTimeout(t); resolve({ status, stdout, stderr }); });
  });
}

const kindsOf = (n: number) => buildLessonFlow(getLesson(n)!).map((s) => s.kind);

/** テスト用の 時計（サーバー）を すすめる。/api/health の time で たしかめる */
async function setClock(offsetMs: number): Promise<number> {
  writeFileSync(CLOCK_FILE, JSON.stringify({ offsetMs }));
  await new Promise((r) => setTimeout(r, 400));
  const h = (await (await fetch(`${BASE}/api/health`)).json()) as { time?: string };
  return Date.parse(h.time ?? "") - Date.now();
}

async function noErrors(section: string, label: string, t: Tab) {
  await check(section, `${label}: 画面の エラー・5xx なし`, t.errors.length === 0, t.errors.slice(0, 5), t.page);
  t.errors.length = 0;
}

// ---------------------------------------------------------------------------
// 1. 40 ワールド
// ---------------------------------------------------------------------------
async function playWorld(browser: Browser, w: number, attempt = 1): Promise<void> {
  const n = lessonForWorld(w);
  const viewport = w % 2 === 0 ? PHONE : TABLET;
  const t = await newTab(browser, { viewport });
  if (attempt === 1) {
    // ブラウザの タブ（レンダラー）が クラッシュしたら 1 回だけ やりなおす（メモリ不足など。レポートの メモに のこす）
    let crashedTab = false;
    t.page.on("crash", () => { crashedTab = true; });
    await playWorldOnce(t, w, n, viewport);
    if (!crashedTab) return;
    // この ワールドの きろくだけ けして（ほかの ワーカーの きろくは そのまま）やりなおす
    const mine = (label: string) => label.startsWith(`W${w} L${n}:`) || label.startsWith(`ワールド${w}（`);
    const s = sec("worlds");
    for (let i = checkLog.length - 1; i >= 0; i--) if (checkLog[i].section === "worlds" && mine(checkLog[i].label)) { if (checkLog[i].ok) s.ok--; else s.ng--; checkLog.splice(i, 1); }
    s.failures = s.failures.filter((f) => !mine(f.label));
    for (let i = worldRows.length - 1; i >= 0; i--) if (worldRows[i].world === w) worldRows.splice(i, 1);
    s.notes.push(`W${w} L${n}: ブラウザの タブが クラッシュしたので やりなおした`);
    return playWorld(browser, w, 2);
  }
  await playWorldOnce(t, w, n, viewport);
}

async function playWorldOnce(t: Tab, w: number, n: number, viewport: { width: number; height: number }) {
  const row: WorldRow = { world: w, lessonNo: n, viewport: `${viewport.width}x${viewport.height}`, ok: false, steps: "", coins: "", ms: 0, note: "" };
  const t0 = Date.now();
  await flow("worlds", `ワールド${w}（L${n}）`, t.page, async () => {
    const u = await startTrial(t);
    await seedProgress(u.id, 1, n - 1);
    const kinds = kindsOf(n);
    await t.page.goto(`${BASE}/lesson/${n}`, { waitUntil: "domcontentloaded" });
    const steps = t.page.getByRole("list", { name: "レッスンの進み具合" }).getByRole("listitem");
    await steps.first().waitFor({ timeout: 45_000 });
    const labels = await steps.allTextContents();
    const before = await db.user.findUniqueOrThrow({ where: { id: u.id }, select: { coins: true } });
    const r: LessonPlay = await playLesson(t.page, n, kinds);
    row.steps = r.steps.map((s) => `${s.kind}:${s.detail}`).join(" / ");
    row.coins = r.coinsText;
    for (const note of [...r.notes, ...(r.quizFlashes.late ? r.quizFlashes.wrong.filter((x) => x.startsWith("ロボット")) : [])]) sec("worlds").notes.push(`W${w} L${n}: ${note}`);
    const lp = await db.lessonProgress.findUnique({ where: { userId_lessonNo: { userId: u.id, lessonNo: n } } });
    const after = await db.user.findUniqueOrThrow({ where: { id: u.id }, select: { coins: true } });
    const conv = await db.coinLedger.count({ where: { userId: u.id, refType: "conversation", refId: String(n) } });
    const okAll = [
      await check("worlds", `W${w} L${n}: ステップ ${kinds.length}（先生 → … → かいわ）`, kinds[0] === "teacher_video" && kinds[kinds.length - 1] === "conversation" && labels.length === kinds.length, { kinds, labels }, t.page),
      await check("worlds", `W${w} L${n}: 先生の 授業を さいごの パートまで`, r.teacherSegments > 3, r.steps[0], t.page),
      await check("worlds", `W${w} L${n}: クイズ・スピードは ぜんぶ ⭕（${r.quizFlashes.ok} 問${r.quizFlashes.late ? `・ロボットが おそくて 時間切れ ${r.quizFlashes.late}` : ""}）`, r.quizFlashes.ng === 0 && r.quizFlashes.ok >= 8 && r.quizFlashes.late <= 2, r.quizFlashes, t.page),
      await check("worlds", `W${w} L${n}: かいわ さいごまで（${r.conversationTurns} ターン）`, r.conversationTurns >= 1 && conv === 1, { turns: r.conversationTurns, conv }, t.page),
      await check("worlds", `W${w} L${n}: クリア画面「${r.resultTitle}」${r.coinsText}`, r.resultTitle === `Lesson ${n} クリア！` && /🪙 \+\d+/.test(r.coinsText), r.resultTitle, t.page),
      await check("worlds", `W${w} L${n}: DB に 完了（quizScore ${lp?.quizScore}）・コイン ${before.coins}→${after.coins}`, lp?.status === "COMPLETED" && lp.quizScore === 1 && after.coins > before.coins, lp, t.page),
    ];
    row.ok = okAll.every(Boolean) && t.errors.length === 0;
    await noErrors("worlds", `W${w} L${n}`, t);
  });
  row.ms = Date.now() - t0;
  worldRows.push(row);
  await t.ctx.close();
}

async function worldsLane(browser: Browser) {
  const queue = [...WORLDS];
  console.log(`\n▶ 40 ワールド: ${queue.length} レッスン（同時に ${WORKERS}）`);
  await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => {
    for (let w = queue.shift(); w !== undefined; w = queue.shift()) {
      console.log(`  … ワールド${w}（L${lessonForWorld(w)}）を はじめる（のこり ${queue.length}）`);
      await playWorld(browser, w);
    }
  }));
}

// ---------------------------------------------------------------------------
// 2. タイムトラベル・まとめテスト・ボス・アリーナ（＋ 3. まとめ動画・としょかん・力だめし）
// ---------------------------------------------------------------------------
const mapStatus = async (page: Page, key: string) => {
  const r = await api<{ nodes?: { key: string; status: string }[] }>(page, "/api/map");
  return r.json.nodes?.find((x) => x.key === key)?.status ?? "?";
};
/** マップの ノード（aria-label「check-1 AVAILABLE」）を クリックして テストへ */
async function clickMapNode(page: Page, label: string, urlRe: RegExp) {
  await page.goto(BASE + "/map", { waitUntil: "domcontentloaded" });
  const node = page.getByRole("listitem", { name: label, exact: true });
  await node.waitFor({ timeout: 45_000 });
  await node.click();
  await page.waitForURL(urlRe, { timeout: 30_000 });
}

async function progressLane(browser: Browser) {
  const S = "progress";
  const t = await newTab(browser, { viewport: PHONE });
  let userId = "";
  await flow(S, "レッスン1 → 復習クエスト（あした）", t.page, async () => {
    userId = (await startTrial(t)).id;
    await t.page.goto(`${BASE}/lesson/1`, { waitUntil: "domcontentloaded" });
    const r = await playLesson(t.page, 1, kindsOf(1));
    await check(S, `L1 を クリックで クリア（${r.resultTitle}）`, r.resultTitle === "Lesson 1 クリア！", r.resultTitle, t.page);
    await check(S, "クリアした 日は 復習クエスト check-1 が WAIT_TOMORROW", (await mapStatus(t.page, "T-check-1")) === "WAIT_TOMORROW", await mapStatus(t.page, "T-check-1"), t.page);
    await t.page.goto(BASE + "/map", { waitUntil: "domcontentloaded" });
    await check(S, "マップに 🌙（check-1 WAIT_TOMORROW）", await t.page.getByRole("listitem", { name: "check-1 WAIT_TOMORROW", exact: true }).waitFor({ timeout: 45_000 }).then(() => true).catch(() => false), undefined, t.page);
    const early = await api<{ error?: string }>(t.page, "/api/tests/check-1/start", "POST", {});
    await check(S, "きょうは 復習クエストを はじめられない（403・あした ひらくよ）", early.status === 403 && /あした/.test(JSON.stringify(early.json)), early, t.page);
  });

  await flow(S, "Lesson 5 の あとの まとめテスト", t.page, async () => {
    for (const n of [2, 3, 4, 5]) {
      const flowSteps = buildLessonFlow(getLesson(n)!);
      const quiz = flowSteps.find((s) => s.kind === "quiz");
      const logs = quiz && quiz.kind === "quiz" ? quiz.questions.map((q) => ({ itemId: q.itemId, skill: q.skill, questionType: q.type, correct: true, responseMs: 1500 })) : [];
      const r = await api<{ ok?: boolean; nextTest?: string }>(t.page, `/api/lessons/${n}/complete`, "POST", { quizScore: 1, speedListeningBest: 1, logs, conversationFinished: true });
      if (n === 5) await check(S, "L5 クリアの つぎは まとめテスト mini-1-5", r.json.ok === true && r.json.nextTest === "mini-1-5", r.json, t.page);
    }
    await check(S, "L6 は まとめテストの まえは LOCKED", (await mapStatus(t.page, "L-6")) === "LOCKED", await mapStatus(t.page, "L-6"), t.page);
    await clickMapNode(t.page, "mini-1-5 AVAILABLE", /\/test\/mini-1-5$/);
    const r = await playTest(t.page);
    await check(S, `まとめテスト mini-1-5: ${r.answered} 問 → ${r.title}（${r.rate}）${r.unlock}`, r.title === "ごうかく！" && /100%/.test(r.rate) && r.unlock.includes("Lesson 6"), r, t.page);
    await check(S, "DB: mini-1-5 合格・L6 が AVAILABLE", (await db.testAttempt.count({ where: { userId, assessmentId: "mini-1-5", passed: true } })) === 1 && (await mapStatus(t.page, "L-6")) === "AVAILABLE", undefined, t.page);
  });

  await flow(S, "タイムトラベル → 復習クエスト", t.page, async () => {
    const today = localDate(new Date(Date.now()));
    const got = await setClock(DAY + 60_000);
    await check(S, `テスト用の 時計を つぎの 日に（サーバーの 時刻 +${Math.round(got / 3_600_000)} 時間）`, Math.abs(got - DAY) < 10 * 60_000, got);
    const st = await mapStatus(t.page, "T-check-1");
    await check(S, `つぎの 日は check-1 が AVAILABLE（${today} → ${localDate(new Date(Date.now() + DAY))}）`, st === "AVAILABLE", st, t.page);
    const coins0 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    await clickMapNode(t.page, "check-1 AVAILABLE", /\/test\/check-1$/);
    const r = await playTest(t.page);
    const coins1 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    await check(S, `復習クエスト check-1: ${r.answered} 問 → ${r.title}（${r.rate}）・コイン +${coins1 - coins0}`, r.title === "ごうかく！" && coins1 > coins0, r, t.page);
    const attempt = await db.testAttempt.findFirst({ where: { userId, assessmentId: "check-1", passed: true } });
    await check(S, "DB: check-1 合格（takenOn は つぎの 日）・マップは CLEARED", !!attempt && attempt.takenOn === localDate(new Date(Date.now() + DAY + 60_000)) && (await mapStatus(t.page, "T-check-1")) === "CLEARED", attempt, t.page);
  });

  await flow(S, "Lesson 30 の あとの ボス → アリーナ", t.page, async () => {
    await t.page.goto(BASE + "/arena", { waitUntil: "domcontentloaded" });
    await t.page.getByText(/🔒 /).first().waitFor({ timeout: 30_000 });
    await check(S, "ボスの まえは アリーナが ぜんぶ 🔒（モードの ボタンなし）", (await t.page.getByRole("link", { name: /ミックス/ }).count()) === 0 && (await t.page.getByText(/^🏟️/).count()) === 0, undefined, t.page);
    await seedProgress(userId, 6, 30, localDate(new Date(Date.now() + DAY + 60_000)), ["boss-1-30"]);
    await clickMapNode(t.page, "boss-1-30 AVAILABLE", /\/test\/boss-1-30$/);
    const r = await playTest(t.page);
    await check(S, `ボス boss-1-30: ${r.answered} 問（${Object.entries(r.types).map(([k, v]) => `${k} ${v}`).join("・")}）→ ${r.title} ${r.unlock}`, r.title === "ごうかく！" && r.unlock.includes("Lesson 31"), r, t.page);
    await t.page.goto(BASE + "/arena", { waitUntil: "domcontentloaded" });
    const mix = t.page.getByRole("link", { name: /ミックス/ }).first();
    await check(S, "ボスを たおすと アリーナが ひらく（🏟️ ＋ モード 4 つ）", await mix.waitFor({ timeout: 30_000 }).then(() => true).catch(() => false), undefined, t.page);
    await mix.click();
    await t.page.waitForURL(/\/test\/arena-1-30\?mode=MIXED$/);
    const a = await playTest(t.page);
    const arenaRow = await db.testAttempt.findFirst({ where: { userId, assessmentId: "arena-1-30", source: "ARENA" } });
    await check(S, `アリーナ arena-1-30（ミックス）: ${a.answered} 問 → ${a.title}（${a.rate}）・DB に ARENA`, a.title === "ごうかく！" && !!arenaRow, a, t.page);
  });
  await noErrors(S, "タイムトラベル・テスト", t);

  // 3. まとめ動画・としょかん・力だめし（おなじ 学習者。レッスン 30 まで すすんでいる）
  if (ONLY.includes("extras")) await extras(t, userId);
  await t.ctx.close();
}

async function extras(t: Tab, userId: string) {
  const S = "extras";
  await flow(S, "まとめ動画", t.page, async () => {
    const key = `${userId}:recap:${localDate(new Date(Date.now() + DAY + 60_000))}`;
    const coins0 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    // まとめ動画は 2〜3 分。ブラウザの 時計（Playwright の clock）を すすめて さいごまで 再生する
    await t.page.clock.install();
    await t.page.goto(`${BASE}/recap/1`, { waitUntil: "domcontentloaded" });
    const done = t.page.getByRole("heading", { name: "さいごまで みたね！" });
    const play = async () => {
      for (let i = 0; i < 60 && !(await done.isVisible().catch(() => false)); i++) await t.page.clock.runFor(5_000);
      await done.waitFor({ timeout: 10_000 });
    };
    await play();
    const coin = t.page.getByText(/^🪙 \+\d+$/).first();
    await coin.waitFor({ timeout: 15_000 });
    const coinText = ((await coin.textContent()) ?? "").trim();
    const coins1 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    await check(S, `まとめ動画を さいごまで → ${coinText}（DB ${coins0}→${coins1}）`, coinText === "🪙 +5" && coins1 === coins0 + 5 && (await db.coinLedger.count({ where: { idempotencyKey: key } })) === 1, { coinText, coins0, coins1 }, t.page);
    await t.page.getByRole("button", { name: "もういちど みる" }).click();
    await t.page.clock.runFor(2_000);
    await play();
    await t.page.waitForTimeout(800);
    const again = ((await t.page.locator("section ~ div.card").last().innerText().catch(() => "")) ?? "").replace(/\s+/g, " ");
    const coins2 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    // 2 回目は「もういちど」で 見なおし（reportedRef で 送らない）→ ページを ひらきなおして もう 1 回
    await t.page.goto(`${BASE}/recap/1`, { waitUntil: "domcontentloaded" });
    await play();
    await t.page.waitForTimeout(1500);
    const third = ((await t.page.locator("section ~ div.card").last().innerText().catch(() => "")) ?? "").replace(/\s+/g, " ");
    const coins3 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    await check(S, `おなじ 日に もう一度 さいごまで 見ても コインは ふえない（${coins1}→${coins2}→${coins3}）`, coins2 === coins1 && coins3 === coins1 && !/🪙 \+/.test(third) && (await db.coinLedger.count({ where: { idempotencyKey: key } })) === 1, { again: again.slice(0, 120), third: third.slice(0, 160) }, t.page);
  });
  // clock.install の あとは ブラウザの 時計が にせもの なので、のこりは あたらしい ページで
  const t2 = await newTab(t.page.context().browser()!, { viewport: TABLET });
  await t2.ctx.addCookies(await t.ctx.cookies());
  await flow(S, "としょかん", t2.page, async () => {
    const story = (await loadStory("s1-01"))!;
    const coins0 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    await t2.page.goto(`${BASE}/library/story/${story.id}`, { waitUntil: "domcontentloaded" });
    await t2.page.getByRole("button", { name: "▶ よみきかせ" }).click();
    await t2.page.getByRole("button", { name: "▶ よみきかせ" }).waitFor({ timeout: 60_000 });
    await t2.page.getByRole("button", { name: /クイズに こたえる/ }).click();
    for (const [i, q] of story.questions.entries()) {
      await t2.page.getByText(`クイズ ${i + 1} / ${story.questions.length}`).waitFor();
      await t2.page.getByRole("button", { name: q.choices[q.answer], exact: true }).click();
      await t2.page.getByText("せいかい！ 🎉").waitFor();
      await t2.page.getByRole("button", { name: /つぎへ ▶|けっかを みる ▶/ }).click();
    }
    await t2.page.getByText(`${story.questions.length} / ${story.questions.length} もん せいかい！`).waitFor();
    await t2.page.getByText("きろくしているよ…").waitFor({ state: "hidden", timeout: 20_000 });
    const msg = ((await t2.page.locator("p.mt-2.font-bold").last().textContent()) ?? "").trim();
    const coins1 = (await db.user.findUniqueOrThrow({ where: { id: userId } })).coins;
    await check(S, `おはなし ${story.id} を よんで クイズ ${story.questions.length}/${story.questions.length}（${msg}・コイン ${coins0}→${coins1}）`, coins1 > coins0, msg, t2.page);
  });
  await flow(S, "力だめし", t2.page, async () => {
    const stage = testStageFor(30);
    const test = JSON.parse(readFileSync(path.join(ROOT, "content", "yearly", `stage-${stage}.json`), "utf8")) as YearlyTest;
    await t2.page.goto(`${BASE}/yearly`, { waitUntil: "domcontentloaded" });
    await t2.page.getByRole("button", { name: "はじめる ▶" }).click();
    const choose = async (index: number) => {
      await t2.page.getByRole("radio").nth(index).click();
      await t2.page.getByRole("button", { name: /つぎへ|つぎは/ }).click();
    };
    for (const it of test.listening) await choose(it.answer);
    for (const it of test.reading) await choose(it.answer);
    for (const p of test.speaking.prompts) {
      await t2.page.locator("textarea").fill(p.sample);
      await t2.page.getByRole("button", { name: /つぎへ|つぎは/ }).click();
    }
    if (test.writing.items?.length) for (const [i, it] of test.writing.items.entries()) await t2.page.getByLabel(`${i + 1}つめの ことば`).fill(it.answer);
    else await t2.page.getByLabel("英語で 書こう").fill(test.writing.sample ?? "");
    await t2.page.getByRole("button", { name: /おわり/ }).click();
    await t2.page.getByText("よく がんばったね！").waitFor({ timeout: 45_000 });
    const rows = await db.yearlyTestResult.findMany({ where: { userId } });
    const summary = ((await t2.page.getByText(/聞く：\d+ \/ \d+ もん/).first().textContent().catch(() => "")) ?? "").trim();
    await check(S, `力だめし ステージ${stage}: ${summary}・DB に 1 回`, rows.length === 1 && rows[0].stage === stage && new RegExp(`聞く：${test.listening.length} / ${test.listening.length} もん`).test(summary), { rows: rows.length, summary }, t2.page);
    await t2.page.goto(`${BASE}/yearly`, { waitUntil: "domcontentloaded" });
    await check(S, "2 回目は 受けられない（1 年に 1 回）", await t2.page.getByRole("button", { name: "はじめる ▶" }).waitFor({ timeout: 8_000 }).then(() => false).catch(() => true), undefined, t2.page);
  });
  await noErrors(S, "まとめ動画・としょかん・力だめし", t);
  await noErrors(S, "としょかん・力だめし", t2);
  await t2.ctx.close();
}

// ---------------------------------------------------------------------------
// 4. 保護者の 流れ
// ---------------------------------------------------------------------------
const MAIL_DIR = path.join(WORK, "mail-outbox");
type Mail = { to: string; subject: string; text: string };
const mails = (): Mail[] => existsSync(MAIL_DIR) ? readdirSync(MAIL_DIR).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(readFileSync(path.join(MAIL_DIR, f), "utf8"))) : [];
async function waitForMail(pred: (m: Mail) => boolean, sec = 20) {
  for (let i = 0; i < sec * 2; i++) {
    const m = mails().find(pred);
    if (m) return m;
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}
const me = (page: Page) => api<{ loggedIn?: boolean; pinUnlocked?: boolean }>(page, "/api/auth/me").then((r) => r.json);

async function enterPinIfAsked(page: Page, pin: string) {
  const overview = page.getByRole("heading", { name: "お子さまのようす" });
  const pad = page.getByRole("button", { name: "数字 1" });
  await overview.or(pad).first().waitFor({ timeout: 45_000 });
  if (await pad.isVisible().catch(() => false)) {
    for (const d of pin) await page.getByRole("button", { name: `数字 ${d}` }).click();
    await overview.waitFor({ timeout: 30_000 });
  }
}
async function login(page: Page, email: string, password: string) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード", { exact: true }).fill(password);
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
}

async function parentLane(browser: Browser) {
  const S = "parent";
  const stamp = Date.now();
  const email = `e2e-${stamp}@example.com`;
  const PW1 = "passw0rd-e2e";
  const PW2 = "newpassw0rd-e2e";
  const PIN1 = "2468";
  const PIN2 = "1357";
  const A = await newTab(browser, { viewport: PHONE });
  let parentId = "";
  let trialCoins = 0;
  const kids: { id: string; nickname: string; avatarCharacter: string }[] = [];

  await flow(S, "登録・お子さま 2 人・ひきつぎ", A.page, async () => {
    const trial = await startTrial(A);
    const q = buildLessonFlow(getLesson(1)!).find((s) => s.kind === "quiz");
    const logs = q && q.kind === "quiz" ? q.questions.map((x) => ({ itemId: x.itemId, skill: x.skill, questionType: x.type, correct: true })) : [];
    const c = await api<{ ok?: boolean; trial?: boolean }>(A.page, "/api/lessons/1/complete", "POST", { quizScore: 1, speedListeningBest: 1, logs, conversationFinished: true });
    trialCoins = (await db.user.findUniqueOrThrow({ where: { id: trial.id } })).coins;
    await check(S, `おためしで L1 クリア（コイン ${trialCoins}）`, c.json.ok === true && c.json.trial === true && trialCoins > 0, c.json, A.page);

    await A.page.goto(BASE + "/register", { waitUntil: "networkidle" });
    await A.page.getByLabel("メールアドレス").fill(email);
    await A.page.getByLabel("パスワード", { exact: true }).fill(PW1);
    await A.page.getByLabel("パスワード（確認）", { exact: true }).fill(PW1);
    await A.page.getByLabel("暗証番号", { exact: true }).fill(PIN1);
    await A.page.getByLabel("暗証番号（確認）", { exact: true }).fill(PIN1);
    await A.page.locator('form button[type="submit"]').click();
    await A.page.waitForURL(/\/parent/);
    const p = await db.parent.findUnique({ where: { email } });
    parentId = p?.id ?? "";
    await check(S, "新規登録 → おうちの方ページ（DB に 保護者）", !!p && A.page.url().includes("/parent"), A.page.url(), A.page);

    for (const [nickname, avatar, label] of [["うみ", "riko", "リコ"], ["そら", "kiko", "キコ"]] as const) {
      const form = A.page.getByRole("form", { name: "お子さまを追加" });
      const add = A.page.getByRole("button", { name: "＋ お子さまを追加" });
      await form.or(add).first().waitFor();
      if ((await form.count()) === 0) await add.click();
      await form.getByLabel("ニックネーム").fill(nickname);
      await form.getByRole("radio", { name: label }).check({ force: true });
      await form.getByRole("button", { name: "追加する" }).click();
      await A.page.getByRole("heading", { name: new RegExp(nickname) }).first().waitFor();
      const row = await db.user.findFirst({ where: { parentId, nickname }, select: { id: true, nickname: true, avatarCharacter: true } });
      await check(S, `お子さま「${nickname}」を キャラクター ${label} で 追加`, row?.avatarCharacter === avatar, row, A.page);
      if (row) kids.push(row);
    }
    await A.page.goto(BASE + "/who", { waitUntil: "networkidle" });
    const umi = A.page.getByRole("button", { name: /^うみ\s*さん/ });
    const sora = A.page.getByRole("button", { name: /^そら\s*さん/ });
    await umi.or(sora).first().waitFor({ timeout: 30_000 });
    await sora.waitFor({ timeout: 10_000 }).catch(() => undefined);
    await check(S, "だれが あそぶ？ に 2 人", (await umi.count()) === 1 && (await sora.count()) === 1, undefined, A.page);
    await umi.click();
    const dialog = A.page.getByRole("dialog");
    await dialog.getByText("おためしで あそんだ きろくを ひきつぐ？").waitFor();
    await dialog.getByRole("button", { name: "はい、ひきつぐ" }).click();
    await dialog.getByRole("heading", { name: "ひきついだよ！" }).waitFor({ timeout: 30_000 });
    await dialog.getByRole("button", { name: "マップへ いく" }).click();
    await A.page.waitForURL(/\/map$/);
    const umiRow = await db.user.findUnique({ where: { id: kids[0]?.id ?? "" }, select: { coins: true, lessonProgress: { select: { lessonNo: true } } } });
    await check(S, `おためしの きろくを うみさんに ひきつぎ（L1・コイン ${umiRow?.coins}）`, umiRow?.lessonProgress.map((l) => l.lessonNo).join(",") === "1" && umiRow.coins === trialCoins, umiRow, A.page);
    await check(S, "ひきついだら おためしの cookie は 消える・そらさんは 0", !(await A.ctx.cookies()).some((x) => x.name === "eq_trial_learner") && (await db.lessonProgress.count({ where: { userId: kids[1]?.id ?? "" } })) === 0, undefined, A.page);
  });

  const C = await newTab(browser, { viewport: TABLET });
  await flow(S, "暗証番号", C.page, async () => {
    await login(C.page, email, PW1);
    await C.page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
    await C.page.getByRole("button", { name: "数字 1" }).waitFor({ timeout: 45_000 });
    for (const d of "1111") await C.page.getByRole("button", { name: `数字 ${d}` }).click();
    await C.page.waitForTimeout(800);
    await check(S, "べつの 端末で ログイン → おうちの方ページは 暗証番号が いる・まちがいでは ひらかない", (await C.page.getByRole("heading", { name: "お子さまのようす" }).count()) === 0 && (await me(C.page)).pinUnlocked !== true, undefined, C.page);
    await enterPinIfAsked(C.page, PIN1);
    await check(S, "正しい 暗証番号で おうちの方ページ（2 人の ようす）", (await C.page.getByRole("heading", { name: /うみ/ }).count()) > 0 && (await C.page.getByRole("heading", { name: /そら/ }).count()) > 0, undefined, C.page);
  });

  await flow(S, "パスワードを 忘れた", A.page, async () => {
    const R = await newTab(browser, { viewport: PHONE });
    await R.page.goto(BASE + "/login", { waitUntil: "networkidle" });
    await R.page.getByRole("link", { name: "パスワードを忘れた方" }).click();
    await R.page.waitForURL(/\/forgot-password$/);
    await R.page.getByLabel("メールアドレス").fill(email);
    await R.page.getByRole("button", { name: "再設定のメールを送る" }).click();
    await R.page.getByText("メールのリンクの有効期限は30分です").waitFor();
    const mail = await waitForMail((m) => m.to === email && /token=/.test(m.text));
    const link = /https?:\/\/\S+\/reset-password\?token=[A-Za-z0-9_-]{43}/.exec(mail?.text ?? "")?.[0] ?? "";
    await check(S, "outbox に 再設定の メール（リンクつき）", !!mail && link.startsWith(`${BASE}/reset-password?token=`), mail?.subject, R.page);
    await R.page.goto(link || `${BASE}/reset-password`, { waitUntil: "domcontentloaded" });
    await R.page.getByRole("form", { name: "新しいパスワードを決める" }).waitFor();
    await R.page.getByLabel("新しいパスワード", { exact: true }).fill(PW2);
    await R.page.getByLabel("新しいパスワード（確認）", { exact: true }).fill(PW2);
    await R.page.getByRole("button", { name: "パスワードを再設定する" }).click();
    await R.page.waitForURL(/\/login\?reset=1$/);
    await check(S, "再設定 → ほかの 端末（A・C）も ログアウト", (await me(A.page)).loggedIn === false && (await me(C.page)).loggedIn === false, undefined, R.page);
    const old = await api(R.page, "/api/auth/login", "POST", { email, password: PW1 });
    await check(S, "古い パスワードでは ログインできない（401）", old.status === 401, old.status, R.page);
    await login(A.page, email, PW2);
    await check(S, "新しい パスワードで ログイン", (await me(A.page)).loggedIn === true, undefined, A.page);
    await noErrors(S, "パスワードの 再設定", R);
    await R.ctx.close();
  });

  await flow(S, "暗証番号を 忘れた", A.page, async () => {
    await A.page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
    await A.page.getByRole("button", { name: "数字 1" }).waitFor({ timeout: 45_000 });
    await A.page.getByRole("link", { name: "暗証番号を忘れた" }).click();
    await A.page.waitForURL(/\/forgot-pin$/);
    const f = A.page.getByRole("form", { name: "新しい暗証番号を決める" });
    await f.getByLabel("アカウントのパスワード").fill(PW2);
    await f.getByLabel("新しい暗証番号", { exact: true }).fill(PIN2);
    await f.getByLabel("新しい暗証番号（確認）", { exact: true }).fill(PIN2);
    await f.getByRole("button", { name: "新しい暗証番号にする" }).click();
    await A.page.waitForURL(/\/parent$/);
    await A.page.getByRole("heading", { name: "お子さまのようす" }).waitFor();
    const vOld = await api(A.page, "/api/parent/verify-pin", "POST", { pin: PIN1 });
    const vNew = await api(A.page, "/api/parent/verify-pin", "POST", { pin: PIN2 });
    await check(S, "暗証番号を 決めなおす（古い だめ・新しい OK）", vOld.status !== 200 && vNew.status === 200, { vOld: vOld.status, vNew: vNew.status }, A.page);
  });

  await flow(S, "LINE の 毎月（dry-run）→ ダウンロードページ", A.page, async () => {
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
    // spawnSync だと ロボットの イベントループが 止まり、同時に うごいている ワールドの 操作が 時間切れに なる → 非同期で
    const out = await spawnAsync("npx", ["tsx", "scripts/line-monthly.ts", "--dry-run", "--parent", parentId, "--month", month, "--timeout", "240"], { ...serverEnv, NODE_OPTIONS: process.env.NODE_OPTIONS ?? "" }, 330_000);
    const stdout = out.stdout;
    await check(S, "npm run line:monthly -- --dry-run（終了コード 0）", out.status === 0 && stdout.includes("dry-run"), (out.stderr ?? "").slice(-300));
    const urls = [...new Set(stdout.match(/https?:\/\/\S+\/d\/[A-Za-z0-9_-]{43}/g) ?? [])];
    const names: string[] = [];
    for (const u of urls) {
      await A.page.goto(u, { waitUntil: "networkidle" });
      const body = await A.page.locator("body").innerText();
      for (const n of ["うみ", "そら"]) if (body.includes(`${n} さん`)) names.push(n);
    }
    await check(S, `ダウンロードページ（お子さまごと ${urls.length} つ）: ${names.join("・")}`, urls.length === 2 && names.sort().join(",") === "うみ,そら", { urls: urls.length, names }, A.page);
    // うみさん（ひきついだ きろく あり）の ページで ファイルを ダウンロード
    for (const u of urls) {
      await A.page.goto(u, { waitUntil: "networkidle" });
      if ((await A.page.locator("body").innerText()).includes("うみ さん")) break;
    }
    const hrefs = await A.page.locator('a[href*="/d/"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    const report = hrefs.find((h) => h.endsWith("/report"));
    if (report) {
      const r = await A.page.request.get(report);
      let pages = 0;
      try { pages = (await PDFDocument.load(await r.body(), { updateMetadata: false })).getPageCount(); } catch { /* 下で 失敗 */ }
      await check(S, `レポートの PDF が ダウンロードできる（${pages} ページ）`, r.status() === 200 && r.headers()["content-type"] === "application/pdf" && pages >= 1, r.status(), A.page);
    } else await check(S, "レポートの ボタン", false, hrefs, A.page);
    const ws = hrefs.find((h) => h.endsWith("/worksheets"));
    if (ws) {
      const r = await A.page.request.get(ws);
      const b = await r.body();
      await check(S, `ワークブックの PDF（${b.length} bytes）`, r.status() === 200 && b.subarray(0, 5).toString() === "%PDF-", r.status(), A.page);
    } else await check(S, "ワークブックの ボタン", false, hrefs, A.page);
  });

  await flow(S, "退会", A.page, async () => {
    await A.page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
    await enterPinIfAsked(A.page, PIN2);
    const del = A.page.locator("section", { has: A.page.getByRole("heading", { name: "退会" }) });
    await del.getByRole("button", { name: "退会する" }).click();
    await del.getByLabel("すべての記録が削除されることを理解しました").check();
    await del.getByRole("button", { name: "次へ" }).click();
    await del.getByLabel("パスワード", { exact: true }).fill(PW2);
    await del.getByRole("button", { name: "完全に削除する" }).click();
    await A.page.getByRole("heading", { name: "退会が完了しました" }).waitFor({ timeout: 30_000 });
    const left = { parent: await db.parent.count({ where: { id: parentId } }), kids: await db.user.count({ where: { id: { in: kids.map((k) => k.id) } } }), sessions: await db.session.count({ where: { parentId } }) };
    await check(S, "退会 → 保護者・お子さま 2 人・セッションが DB から 消える", left.parent === 0 && left.kids === 0 && left.sessions === 0, left, A.page);
    const relogin = await api(A.page, "/api/auth/login", "POST", { email, password: PW2 });
    await check(S, "退会した アカウントでは ログインできない", relogin.status === 401, relogin.status, A.page);
  });
  await noErrors(S, "保護者（A）", A);
  await noErrors(S, "保護者（C）", C);
  await A.ctx.close();
  await C.ctx.close();
}

// ---------------------------------------------------------------------------
// 5. オフライン（DB 停止 ＋ 電波なし）
// ---------------------------------------------------------------------------
const OFFLINE_PAGES = [
  "/", "/welcome", "/login", "/register", "/forgot-password", "/forgot-pin", "/map", "/lesson/1", "/lesson/31", "/lesson/1171", "/recap/1",
  "/test/check-1", "/test/mini-1-5", "/test/boss-1-30", "/dashboard", "/gacha", "/arena", "/ranking", "/library", "/library/story/s1-01",
  "/library/chant/c-01", "/library/talk/t-food", "/yearly", "/parent", "/who", "/setup-pin", "/terms",
];

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
  const stuck = await page.waitForFunction((src) => !new RegExp(src).test(document.body?.innerText ?? ""), LOADING_TEXT.source, { timeout: 20_000 }).then(() => false).catch(() => true);
  await page.waitForTimeout(300);
  return stuck;
}
async function errorTextOf(page: Page): Promise<string | null> {
  const text = await page.evaluate(() => document.body?.innerText ?? "");
  if (text.trim().length < 20) return "画面が ほとんど からっぽ";
  for (const re of ERROR_TEXT) {
    const m = re.exec(text);
    if (m) return `「${m[0]}」… ${text.slice(Math.max(0, m.index - 30), m.index + 50).replace(/\s+/g, " ")}`;
  }
  return null;
}

async function offlineLane(browser: Browser) {
  const S = "offline";
  const port = await freePort(Number(argOf("port", "3600")) + 50);
  const base = `http://localhost:${port}`;
  const env = { ...checkServerEnv(null, port, path.join(WORK, "offline")), E2E: "1", CRON_SECRET };
  const server = startServer(port, env);
  try {
    await waitForServer(server, base, 90);
    for (const [vpName, viewport] of [["スマホ 390x844", PHONE], ["タブレット 1024x768", TABLET]] as const) {
      // (a) DB 停止: ページを ひらく
      let blocked = false;
      let unblockedAt = 0;
      // 電波なしの あいだに おきた 通信の 失敗（Next.js の リンクの 先読みの「Failed to fetch RSC payload … Falling back」など）は
      // コンソールに とどくのが すこし おくれるので、もどして 5 秒は 電波なしの ぶんと みなす
      const t = await newTab(browser, { viewport, allowAccount503: true, offlineOk: () => blocked || Date.now() - unblockedAt < 5_000 });
      let bad = 0;
      for (const p of OFFLINE_PAGES) {
        await t.page.goto(base + p, { waitUntil: "domcontentloaded" }).catch((e) => t.errors.push(`goto ${p}: ${String(e).slice(0, 120)}`));
        const stuck = await settle(t.page);
        const err = await errorTextOf(t.page);
        const ok = !stuck && !err && t.errors.length === 0;
        if (!ok) { bad++; await check(S, `${vpName} DB 停止 ${p}`, false, { stuck, err, errors: t.errors.slice(0, 3) }, t.page); }
        t.errors.length = 0;
      }
      await check(S, `${vpName} DB 停止: ${OFFLINE_PAGES.length} 画面 エラー画面なし`, bad === 0, `${bad} 画面`);

      // (b) 電波なし: ひらいた あとで ブラウザを offline に して さいごまで あそぶ
      const offline = async (label: string, url: string, ready: () => Promise<unknown>, playIt: () => Promise<boolean>) => {
        await flow(S, `${vpName} 電波なし ${label}`, t.page, async () => {
          await t.page.goto(base + url, { waitUntil: "domcontentloaded" });
          await ready();
          await t.page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
          blocked = true;
          await t.ctx.setOffline(true);
          try {
            const ok = await playIt();
            const err = await errorTextOf(t.page);
            await check(S, `${vpName} 電波なし ${label}`, ok && !err && t.errors.length === 0, { ok, err, errors: t.errors.slice(0, 3) }, t.page);
          } finally {
            await t.ctx.setOffline(false);
            blocked = false;
            unblockedAt = Date.now();
            t.errors.length = 0;
          }
        });
      };
      await offline("レッスン1 を さいごまで（書きとりも 合格）", "/lesson/1", () => t.page.getByRole("list", { name: "レッスンの進み具合" }).waitFor({ timeout: 45_000 }), async () => {
        const r = await playLesson(t.page, 1, kindsOf(1));
        return r.resultTitle === "Lesson 1 クリア！" && r.quizFlashes.ng === 0;
      });
      await offline("まとめテスト mini-1-5", "/test/mini-1-5", () => t.page.getByText(/^\d+ \/ \d+$/).first().waitFor({ timeout: 45_000 }), async () => {
        const r = await playTest(t.page);
        return r.title === "ごうかく！";
      });
      await offline("おはなし s1-01 ＋ クイズ", "/library/story/s1-01", () => t.page.getByRole("button", { name: "▶ よみきかせ" }).waitFor({ timeout: 45_000 }), async () => {
        const story = (await loadStory("s1-01"))!;
        await t.page.getByRole("button", { name: /クイズに こたえる/ }).click();
        for (const q of story.questions) {
          await t.page.getByRole("button", { name: q.choices[q.answer], exact: true }).click();
          await t.page.getByRole("button", { name: /つぎへ ▶|けっかを みる ▶/ }).click();
        }
        await t.page.getByText(/もん せいかい！/).waitFor();
        await t.page.getByText("きろくしているよ…").waitFor({ state: "hidden", timeout: 20_000 });
        return (await t.page.getByText(`${story.questions.length} / ${story.questions.length} もん せいかい！`).count()) > 0;
      });
      // フリートークは Lesson 90 から。おためし（この 端末）の きろくを 90 まで に する
      await t.page.evaluate(`(() => { const l = {}; for (let i = 1; i <= 90; i++) l[i] = "2026-11-01"; localStorage.setItem("eigo-quest:offline-progress:v1", JSON.stringify({ lessons: l, tests: {} })); })()`);
      await offline("フリートーク t-food", "/library/talk/t-food", () => t.page.getByRole("button", { name: "▶ はじめる", exact: true }).waitFor({ timeout: 45_000 }), async () => {
        await t.page.getByRole("button", { name: "▶ はじめる", exact: true }).click();
        for (let i = 0; i < 3; i++) {
          const s = t.page.locator("div:has(> p:text('こんなふうに いえるよ（タップ）')) button").first();
          await s.waitFor();
          const before = await t.page.locator("ul[aria-live] li").count();
          await s.click();
          await t.page.waitForFunction((b) => document.querySelectorAll("ul[aria-live] li").length >= b + 2, before, { timeout: 15_000 });
        }
        return true;
      });
      await t.ctx.close();
    }
  } finally {
    stopServer(server);
  }
}

// ---------------------------------------------------------------------------
// じゅんび と 本体
// ---------------------------------------------------------------------------
let serverEnv = {} as NodeJS.ProcessEnv;
let server: ChildProcess | null = null;
let ownDb: CheckDb | null = null;

async function main() {
  const started = new Date();
  const t0 = Date.now();
  const deadline = setTimeout(() => { console.error(`✖ ${TIMEOUT_SEC}秒を こえたので やめます`); stopServer(server); void ownDb?.stop(); process.exit(1); }, TIMEOUT_SEC * 1000);
  deadline.unref();
  console.log(`check:e2e（最長 ${TIMEOUT_SEC}秒・${ONLY.join(",")}・ワールド ${WORLDS.length}・同時 ${WORKERS}）`);
  rmSync(SHOTS, { recursive: true, force: true });
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  writeFileSync(CLOCK_FILE, JSON.stringify({ offsetMs: 0 }));

  // DB
  let url = argOf("db");
  if (url) {
    assertSafeDbUrl(url);
    const DB = url; // migrate は DIRECT_URL も テスト用の DB に（.env の ふだんの DB に しない）
    run("npx", ["prisma", "migrate", "deploy"], { ...process.env, DATABASE_URL: DB, DIRECT_URL: DB });
  } else {
    ownDb = await startCheckDb();
    url = ownDb.url;
    prepareCheckDb(url);
  }
  db = new PrismaClient({ datasourceUrl: url });
  if ((await db.assessment.count()) === 0) run("npx", ["tsx", "prisma/seed.ts"], { ...process.env, DATABASE_URL: url, DIRECT_URL: url }, 300_000);
  await clearRateLimits(db);

  // テストの しかけが 本番の ビルドに ない こと
  const prod = scanForHook(path.join(ROOT, ".next", "static"));
  if (prod.files === 0) sec("build").notes.push("ふつうの ビルド（.next）が ないので しかけの 確認は とばした");
  else await check("build", `ふつうの ビルド（.next/static の JS ${prod.files} こ）に テストの しかけ（data-e2e）が ない`, prod.hits.length === 0, prod.hits.slice(0, 5));

  // E2E=1 の ビルド
  const e2eBuilt = existsSync(path.join(ROOT, ".next-e2e", "BUILD_ID"));
  if (process.argv.includes("--no-build") && e2eBuilt) sec("build").notes.push(".next-e2e を つかいまわした（--no-build）");
  else {
    const b0 = Date.now();
    console.log("$ E2E=1 next build（.next-e2e）");
    const r = spawnSync("npx", ["next", "build"], { cwd: ROOT, env: { ...process.env, E2E: "1", NEXT_TELEMETRY_DISABLED: "1" }, stdio: "inherit", shell: isWin, timeout: 1_200_000 });
    await check("build", `E2E=1 の next build（${Math.round((Date.now() - b0) / 1000)}秒）`, r.status === 0, r.error?.message ?? r.status);
    if (r.status !== 0) throw new Error("E2E の ビルドに 失敗");
  }
  const hook = scanForHook(path.join(ROOT, ".next-e2e", "static"));
  await check("build", `E2E の ビルド（.next-e2e）には しかけが ある（${hook.hits.length} ファイル）`, hook.hits.length > 0, hook.files);

  // ワークブック No.1（ダウンロードページ用）
  const port = await freePort(Number(argOf("port", "3600")));
  BASE = `http://localhost:${port}`;
  serverEnv = {
    ...checkServerEnv(url, port, WORK),
    E2E: "1",
    E2E_CLOCK_FILE: CLOCK_FILE,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --require ${PRELOAD}`.trim(),
    CRON_SECRET,
  };
  if (ONLY.includes("parent")) {
    // ワークブック No.1 の PDF（git には 入れない）が なければ python で 作る
    const ws = path.join(ROOT, "worksheets", "out", "monthly", "month-01.pdf");
    if (!existsSync(ws)) {
      for (const py of isWin ? ["python", "py", "python3"] : ["python3", "python"]) {
        const r = spawnSync(py, ["worksheets/generate_worksheets.py", "--month", "--pack", "1"], { cwd: ROOT, stdio: "inherit", timeout: 300_000 });
        if (r.status === 0) break;
      }
    }
    if (existsSync(ws)) run("npx", ["tsx", "scripts/upload-worksheets.ts", "--pack", "1", "--timeout", "120"], { ...serverEnv, NODE_OPTIONS: process.env.NODE_OPTIONS ?? "" });
    else sec("parent").notes.push("ワークブック No.1 の PDF を 作れなかった（python / reportlab が ない）ので、ダウンロードページの ワークブックは しらべない");
  }
  server = startServer(port, serverEnv);
  const browser = await chromium.launch();
  try {
    await waitForServer(server, BASE, 120);
    const skew = await setClock(0);
    await check("build", `テスト用の 時計（ずれ ${Math.round(skew / 1000)} 秒）`, Math.abs(skew) < 120_000, skew);
    const lanes: Promise<void>[] = [];
    if (ONLY.includes("worlds")) lanes.push(worldsLane(browser));
    lanes.push((async () => {
      if (ONLY.includes("progress")) await progressLane(browser);
      if (ONLY.includes("parent")) await parentLane(browser);
    })());
    await Promise.all(lanes);
    if (ONLY.includes("offline")) await offlineLane(browser);
  } finally {
    await browser.close().catch(() => undefined);
    stopServer(server);
    server = null;
    await db.$disconnect();
    await ownDb?.stop();
  }

  const totalMs = Date.now() - t0;
  const all = [...sections.values()];
  const ok = all.reduce((a, s) => a + s.ok, 0);
  const ng = all.reduce((a, s) => a + s.ng, 0);
  const worldsOk = worldRows.filter((r) => r.ok).length;
  const shots = all.reduce((a, s) => a + s.failures.filter((f) => f.shot).length, 0);
  writeFileSync(REPORT, renderE2eReport({ started, totalMs, sections: all, worlds: worldRows.sort((a, b) => a.world - b.world), only: ONLY, command: `npm run check:e2e${process.argv.slice(2).length ? ` -- ${process.argv.slice(2).filter((a) => !/^postgres/.test(a)).join(" ")}` : ""}` }));
  console.log(`\nレポート: ${path.relative(ROOT, REPORT)}${shots ? `・失敗の スクリーンショット ${shots} まい（${path.relative(ROOT, SHOTS)}）` : ""}`);
  console.log(`CHECK-SUMMARY: ${ONLY.includes("worlds") ? `worlds ${worldsOk}/${worldRows.length}・` : ""}checks ${ok} OK / ${ng} NG・${Math.round(totalMs / 1000)}s`);
  process.exit(ng === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  stopServer(server);
  await ownDb?.stop();
  process.exit(1);
});
