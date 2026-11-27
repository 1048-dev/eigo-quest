/**
 * run4 Phase 4: 本物の PostgreSQL + next start + ブラウザ（Playwright）での通し確認。
 *
 *   npx next build
 *   npx tsx scripts/run4-flow-check.ts --db postgresql://postgres:pw@localhost:5544/eq_check [--port 3475] [--timeout 900]
 *
 * 進みぐあいを 1行ずつ表示。--timeout 秒（既定 900）で とちゅうでも やめる。コマンドは それぞれ 5分、ブラウザの操作は 30秒で 時間切れ。
 *
 * 1. prisma migrate deploy → seed → next start（LINE のキーなし = dry-run）
 * 2. おためしモードで あそぶ（スタート画面 →「おためしで あそぶ」→ レッスン1・2 をクリア）
 *    ※ レッスンの 9つの画面を クリックで すすめるのは こわれやすいので、レッスン画面が 最後に送るのと同じ
 *      「レッスン完了」の リクエストを この ブラウザから送る。
 *      run5: DB が動いているので きろくは この端末の おためし学習者（DB・cookie eq_trial_learner）に入る（localStorage には 書かない）
 * 3. 新規登録（画面）→ お子さまを追加（キャラクター キコ を えらぶ）
 * 4. 「だれが あそぶ？」で えらぶ →「おためしで あそんだ きろくを ひきつぐ？」→「はい」
 * 5. おうちの方ページ（ようす）に おためしの レッスンが 出ている・顔が キコ
 * 6. npm run line:monthly -- --dry-run --parent <id> --month <今月> → 表示された ダウンロードの リンクを ブラウザで ひらく → PDF
 * スクリーンショット: docs/run4/screens/p4-flow/
 * ※ テスト用の DB を渡すこと。
 */
import { spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { chromium, type Page } from "playwright";
import { clearRateLimits, installDeadline, isWin, run as runCmd, startServer, stopServer, timeoutArg, waitForServer as waitUp } from "./lib/checkKit";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3475"));
if (!DB) {
  console.error("使い方: npx tsx scripts/run4-flow-check.ts --db <テスト用 DATABASE_URL> [--port 3475]");
  process.exit(2);
}
const BASE = `http://localhost:${PORT}`;
const WORK = path.join(process.cwd(), ".tmp", "p4-flow");
const SHOTS = path.join(process.cwd(), "docs", "run4", "screens", "p4-flow");
const env: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL: DB,
  PORT: String(PORT),
  SKIP_DAILY_LOCK: "1",
  REPORT_STORAGE_DIR: path.join(WORK, "reports"),
  LINE_OUTBOX_DIR: path.join(WORK, "outbox"),
  APP_BASE_URL: BASE,
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "",
  LINE_MESSAGING_CHANNEL_SECRET: "",
  LINE_LOGIN_CHANNEL_ID: "",
  LINE_LOGIN_CHANNEL_SECRET: "",
  LINE_LOGIN_CALLBACK_URL: "",
};
/** ぜんたいの時間制限（--timeout 秒。既定 900） */
const TIMEOUT_SEC = timeoutArg(900);
env.DIRECT_URL = DB;

function run(cmd: string, args: string[]) {
  runCmd(cmd, args, env, 300_000);
}

let failures = 0;
function check(label: string, cond: boolean, detail?: unknown) {
  console.log(`${cond ? "✔" : "✖"} ${label}`);
  if (!cond) {
    failures++;
    if (detail !== undefined) console.log("   ", JSON.stringify(detail).slice(0, 400));
  }
}

const waitForServer = (server: ChildProcess) => waitUp(server, BASE);
const step = (s: string) => console.log(`\n▶ ${s}`);

const db = new PrismaClient({ datasourceUrl: DB });
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });

async function flow() {
  const { TRIAL_LOG_KEY } = await import("../src/lib/offline/trialLog");
  const { LOCAL_PROGRESS_KEY } = await import("../src/lib/offline/localProgress");
  const { getLesson } = await import("../src/lib/curriculum");
  const { buildLessonFlow } = await import("../src/lib/curriculum/questions");

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "ja-JP" });
  // 1つ1つの 操作にも 時間制限（止まったまま 待ちつづけない）
  ctx.setDefaultTimeout(30_000);
  ctx.setDefaultNavigationTimeout(45_000);
  const page = await ctx.newPage();
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("response", (r) => { if (r.status() >= 500) pageErrors.push(`${r.status()} ${r.url()}`); });
  try {
    step("1. おためしモード");
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/welcome$/, { timeout: 30_000 });
    await page.getByRole("button", { name: "おためしで あそぶ" }).click();
    await page.waitForURL(/\/map$/, { timeout: 30_000 });
    check("スタート画面 →「おためしで あそぶ」→ マップ", page.url().endsWith("/map"));

    let trialCoins = 0;
    for (const n of [1, 2]) {
      const quiz = buildLessonFlow(getLesson(n)!).find((s) => s.kind === "quiz");
      const logs = quiz && quiz.kind === "quiz" ? quiz.questions.map((q) => ({ itemId: q.itemId, skill: q.skill, questionType: q.type, correct: true, responseMs: 1500 })) : [];
      const r = await page.evaluate(async ({ n, logs }) => {
        const res = await fetch(`/api/lessons/${n}/complete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quizScore: 1, speedListeningBest: 1, logs, conversationFinished: true }) });
        return { status: res.status, body: await res.json() };
      }, { n, logs });
      check(`おためしで レッスン${n} クリア（trial:true）`, r.status === 200 && r.body.ok === true && r.body.trial === true, r.body);
      const coins = Number(r.body.reward?.total ?? 0);
      console.log(`    レッスン${n}: コイン +${coins}`);
      trialCoins += coins;
    }
    await page.goto(BASE + "/map", { waitUntil: "networkidle" });
    const trialToken = (await ctx.cookies()).find((c) => c.name === "eq_trial_learner");
    check("おためし学習者の cookie は httpOnly", !!trialToken?.httpOnly, trialToken?.name);
    const trialUser = trialToken ? await db.user.findFirst({ where: { trialTokenHash: createHash("sha256").update(trialToken.value).digest("hex") }, select: { id: true, isTrial: true, coins: true, lessonProgress: { select: { lessonNo: true } } } }) : null;
    check("DB: この端末の おためし学習者に レッスン1・2", !!trialUser?.isTrial && trialUser.lessonProgress.map((l) => l.lessonNo).sort().join(",") === "1,2", trialUser);
    // run5 Phase 4: ほうしゅうの合計のほかに ログインボーナスなどが のるので、ひきつぐ コインは DB の値を使う
    if (trialUser && trialUser.coins >= trialCoins) trialCoins = trialUser.coins;
    await shot(page, "01-trial-map");

    step("2. 新規登録（画面）");
    const email = `p4-flow-${Date.now()}@example.com`;
    await page.goto(BASE + "/register", { waitUntil: "networkidle" });
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード", { exact: true }).fill("passw0rd-p4");
    await page.getByLabel("パスワード（確認）", { exact: true }).fill("passw0rd-p4");
    await page.getByLabel("暗証番号", { exact: true }).fill("2468");
    await page.getByLabel("暗証番号（確認）", { exact: true }).fill("2468");
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/parent/, { timeout: 30_000 });
    check("登録 → おうちの方ページ", page.url().includes("/parent"));

    step("3. お子さまを追加（キャラクター キコ）");
    const form = page.getByRole("form", { name: "お子さまを追加" });
    const addButton = page.getByRole("button", { name: "＋ お子さまを追加" });
    // 登録直後は ?add=1 で フォームが ひらいている（ひらいていなければ ボタンを おす）
    await form.or(addButton).first().waitFor({ timeout: 30_000 });
    if ((await form.count()) === 0) await addButton.click();
    await form.getByLabel("ニックネーム").fill("そら");
    await form.getByText("キコ", { exact: true }).click();
    await shot(page, "02-add-child-avatar");
    await form.getByRole("button", { name: "追加する" }).click();
    await page.getByRole("heading", { name: /そら/ }).first().waitFor({ timeout: 30_000 });
    const parent = await db.parent.findUnique({ where: { email }, select: { id: true, children: { select: { id: true, avatarCharacter: true, nickname: true } } } });
    const kid = parent?.children[0];
    check("お子さまを追加（キャラクター kiko）", kid?.nickname === "そら" && kid.avatarCharacter === "kiko", parent);

    step("4. だれが あそぶ？ → ひきつぐ？ → はい");
    await page.goto(BASE + "/who", { waitUntil: "networkidle" });
    await shot(page, "03-who");
    await page.getByRole("button", { name: /^そら\s*さん/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText("おためしで あそんだ きろくを ひきつぐ？").waitFor({ timeout: 30_000 });
    const dialogText = await dialog.innerText();
    check("「ひきつぐ？」に レッスン 2こ・コイン", dialogText.includes("レッスン 2こ") && dialogText.includes(`コイン ${trialCoins}`), dialogText);
    await shot(page, "04-carry-ask");
    await dialog.getByRole("button", { name: "はい、ひきつぐ" }).click();
    await dialog.getByText("ひきついだよ！").waitFor({ timeout: 30_000 });
    check("ひきついだよ！（レッスン 2こ）", (await dialog.innerText()).includes("レッスン 2こ"));
    await shot(page, "05-carry-done");
    await dialog.getByRole("button", { name: "マップへ いく" }).click();
    await page.waitForURL(/\/map$/, { timeout: 30_000 });
    const left = await page.evaluate(([a, b]) => [window.localStorage.getItem(a), window.localStorage.getItem(b)], [TRIAL_LOG_KEY, LOCAL_PROGRESS_KEY]);
    check("ひきついだあと この ブラウザの おためしの きろくは 消える", left[0] === null && left[1] === null, left);
    await page.waitForLoadState("networkidle");
    await shot(page, "06-child-map");
    const kidRow = await db.user.findUnique({ where: { id: kid!.id }, select: { coins: true, lessonProgress: { select: { lessonNo: true } } } });
    check("DB: そらさんに レッスン1・2 と コイン", kidRow?.lessonProgress.map((l) => l.lessonNo).sort().join(",") === "1,2" && kidRow.coins === trialCoins, { kidRow, trialCoins });

    step("5. おうちの方ページ（ようす）");
    await page.goto(BASE + "/parent", { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "お子さまのようす" }).waitFor({ timeout: 30_000 });
    const card = page.locator("article", { has: page.getByRole("heading", { name: /そら/ }) });
    const cardText = await card.innerText();
    check("ようす: そらさんの レッスン 2 / 360", /2 \/ 360/.test(cardText), cardText.slice(0, 300));
    const ov = await page.evaluate(async () => (await fetch("/api/parent/overview")).json());
    const ch = ov.children?.[0];
    check("ようす API: lessonsDone 2・顔 kiko", ch?.lessonsDone === 2 && ch?.avatarCharacter === "kiko", ch);
    await shot(page, "07-parent-overview");

    step("6. line:monthly --dry-run → ダウンロードの リンク");
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
    console.log(`$ npx tsx scripts/line-monthly.ts --dry-run --parent ${parent!.id} --month ${month}`);
    const out = spawnSync("npx", ["tsx", "scripts/line-monthly.ts", "--dry-run", "--parent", parent!.id, "--month", month], { env, shell: isWin, encoding: "utf8", timeout: 300_000 });
    const stdout = out.stdout ?? "";
    console.log(stdout.split("\n").map((l) => `    | ${l}`).join("\n"));
    check("line:monthly --dry-run: 終了コード 0・dry-run", out.status === 0 && stdout.includes("dry-run"), out.stderr?.slice(-400));
    const url = stdout.match(/https?:\/\/\S+\/d\/[A-Za-z0-9_-]{43}/)?.[0];
    check("line:monthly --dry-run: そらさんの リンク", !!url && stdout.includes("そら"), stdout.slice(-400));
    await page.goto(url ?? `${BASE}/d/none`, { waitUntil: "networkidle" });
    const dl = await page.locator("body").innerText();
    check("ダウンロードページ: そら さん・今月の レッスン 2", dl.includes("そら さん") && /レッスン[^\n]*2/.test(dl), dl.slice(0, 300));
    check("ダウンロードページ: ゲームの メニューは出ない", (await page.getByText("ぼうけん").count()) === 0);
    await shot(page, "08-download-page");
    const hrefs = await page.locator('a[href*="/d/"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    check("ダウンロードページ: レポートと ワークブックの ボタン", hrefs.some((h) => h.endsWith("/report")) && hrefs.some((h) => h.endsWith("/worksheets")), hrefs);
    for (const h of hrefs) {
      const r = await page.request.get(h);
      const body = await r.body();
      check(`PDF ${h.split("/").pop()}: 200・application/pdf`, r.status() === 200 && r.headers()["content-type"] === "application/pdf" && body.subarray(0, 5).toString() === "%PDF-", { status: r.status(), bytes: body.length });
    }
    check("画面の エラー・5xx なし", pageErrors.length === 0, pageErrors);
  } finally {
    await browser.close();
  }
}

let server: ChildProcess | null = null;

async function main() {
  installDeadline(TIMEOUT_SEC, () => stopServer(server));
  console.log(`run4 flow check（最長 ${TIMEOUT_SEC}秒）: ${BASE}`);
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(SHOTS, { recursive: true });
  run("npx", ["prisma", "migrate", "deploy"]);
  await clearRateLimits(db);
  run("npx", ["tsx", "prisma/seed.ts"]);
  server = startServer(PORT, env);
  try {
    await waitForServer(server);
    await flow();
  } finally {
    stopServer(server);
    server = null;
    await db.$disconnect();
  }
  console.log(failures === 0 ? "🎉 すべて OK" : `✖ ${failures} 件 失敗`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  stopServer(server);
  process.exit(1);
});
