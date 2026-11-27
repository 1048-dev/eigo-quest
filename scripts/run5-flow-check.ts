/**
 * run5 Phase 4: 本物の PostgreSQL + next start + ブラウザ（Playwright）での通し確認。
 *
 *   npx next build
 *   npx tsx scripts/run5-flow-check.ts --db postgresql://eigo:eigo@localhost:5544/eigo_check?schema=public [--port 3485] [--timeout 900]
 *
 *  0. prisma migrate deploy → seed → 1か月ワークブック No.1（run7 まで ワールド1）を STORAGE_DRIVER=local の置き場所へ アップロード（npm run worksheets:upload と同じスクリプト）
 *     → next start（MAIL_PROVIDER=outbox・LINE のキーなし = dry-run・CRON_SECRET あり）
 *  1. 2つの ブラウザ（cookie も localStorage も べつ）で おためしで あそぶ → きろく・コインが べつべつ
 *  2. ブラウザA: 新規登録 → お子さまを追加 →「だれが あそぶ？」の「ひきつぐ？」に「いいえ」
 *     → おうちの方ページの「おためしの きろくを ひきつぐ」ボタンで ひきつぐ（ブラウザB の おためしは そのまま）
 *  3. ブラウザC（べつの端末）で ログインしておく → ブラウザA で「パスワードを忘れた」→ outbox のメールの リンク → 再設定
 *     → A・C どちらも ログアウトされている → 新しいパスワードで ログイン
 *  4. 暗証番号パッドの「暗証番号を忘れた」→ パスワード + 新しい暗証番号 → おうちの方ページ → 新しい暗証番号が使える
 *  5. 毎月のレポート dry-run（npm run line:monthly -- --dry-run）→ リンク → レポートの PDF（Node の pdf-lib で作られた 1ページ）と
 *     ワークブックの PDF（アップロードしたものと同じ大きさ）が ダウンロードできる。cron の API（合い言葉）も確かめる
 * 進みぐあいを 1行ずつ表示。--timeout 秒（既定 900）で とちゅうでも やめる。各操作にも 30秒の時間制限。
 * スクリーンショット: docs/run5/screens/p4-flow/
 * ※ テスト用の DB を渡すこと（保護者・お子さまを作る）。
 */
import type { ChildProcess } from "node:child_process";
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PDFDocument } from "pdf-lib";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { clearRateLimits, installDeadline, isWin, run, startServer, stopServer, timeoutArg, waitForServer } from "./lib/checkKit";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3485"));
const TIMEOUT_SEC = timeoutArg(900);
if (!DB) {
  console.error("使い方: npx tsx scripts/run5-flow-check.ts --db <テスト用 DATABASE_URL> [--port 3485] [--timeout 900]");
  process.exit(2);
}
const BASE = `http://localhost:${PORT}`;
const WORK = path.join(process.cwd(), ".tmp", "p5-flow");
const SHOTS = path.join(process.cwd(), "docs", "run5", "screens", "p4-flow");
const CRON_SECRET = randomBytes(24).toString("base64url");
const env: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL: DB,
  DIRECT_URL: DB,
  PORT: String(PORT),
  SKIP_DAILY_LOCK: "1",
  STORAGE_DRIVER: "local",
  REPORT_STORAGE_DIR: path.join(WORK, "storage"),
  S3_BUCKET: "",
  LINE_OUTBOX_DIR: path.join(WORK, "line-outbox"),
  MAIL_PROVIDER: "outbox",
  MAIL_OUTBOX_DIR: path.join(WORK, "mail-outbox"),
  RESEND_API_KEY: "",
  SMTP_URL: "",
  APP_BASE_URL: BASE,
  CRON_SECRET,
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "",
  LINE_MESSAGING_CHANNEL_SECRET: "",
  LINE_LOGIN_CHANNEL_ID: "",
  LINE_LOGIN_CHANNEL_SECRET: "",
  LINE_LOGIN_CALLBACK_URL: "",
};

let failures = 0;
function check(label: string, cond: boolean, detail?: unknown) {
  console.log(`${cond ? "✔" : "✖"} ${label}`);
  if (!cond) {
    failures++;
    if (detail !== undefined) console.log("   ", JSON.stringify(detail).slice(0, 500));
  }
}
const step = (s: string) => console.log(`\n▶ ${s}`);
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

const db = new PrismaClient({ datasourceUrl: DB });
const shot = (page: Page, name: string) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });

const MAIL_DIR = env.MAIL_OUTBOX_DIR!;
function mails(): { to: string; subject: string; text: string }[] {
  if (!existsSync(MAIL_DIR)) return [];
  return readdirSync(MAIL_DIR).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(readFileSync(path.join(MAIL_DIR, f), "utf8")));
}
async function waitForMail(pred: (m: { to: string; subject: string; text: string }) => boolean, sec = 20) {
  for (let i = 0; i < sec * 2; i++) {
    const m = mails().find(pred);
    if (m) return m;
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

const errorsOf = new WeakMap<Page, string[]>();
async function newPage(browser: Browser): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, locale: "ja-JP" });
  ctx.setDefaultTimeout(30_000);
  ctx.setDefaultNavigationTimeout(45_000);
  const page = await ctx.newPage();
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("response", (r) => { if (r.status() >= 500) errs.push(`${r.status()} ${r.url()}`); });
  errorsOf.set(page, errs);
  return { ctx, page };
}

async function completeLesson(page: Page, n: number) {
  const { getLesson } = await import("../src/lib/curriculum");
  const { buildLessonFlow } = await import("../src/lib/curriculum/questions");
  const quiz = buildLessonFlow(getLesson(n)!).find((s) => s.kind === "quiz");
  const logs = quiz && quiz.kind === "quiz" ? quiz.questions.map((q) => ({ itemId: q.itemId, skill: q.skill, questionType: q.type, correct: true, responseMs: 1500 })) : [];
  return page.evaluate(async ({ n, logs }) => {
    const res = await fetch(`/api/lessons/${n}/complete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quizScore: 1, speedListeningBest: 1, logs, conversationFinished: true }) });
    return { status: res.status, body: await res.json() };
  }, { n, logs });
}

const dashboard = (page: Page) => page.evaluate(async () => (await fetch("/api/dashboard")).json()) as Promise<{ user?: { coins: number } | null; lessonsCompleted?: number }>;
const me = (page: Page) => page.evaluate(async () => (await fetch("/api/auth/me")).json()) as Promise<{ loggedIn?: boolean; pinUnlocked?: boolean }>;

async function trialUserOf(ctx: BrowserContext) {
  const c = (await ctx.cookies()).find((x) => x.name === "eq_trial_learner");
  if (!c) return null;
  return db.user.findFirst({ where: { trialTokenHash: sha(c.value) }, select: { id: true, isTrial: true, coins: true, lessonProgress: { select: { lessonNo: true } } } });
}

/** おうちの方ページを ひらく（暗証番号パッドが出たら 入れる） */
async function openParent(page: Page, pin: string) {
  await page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
  const overview = page.getByRole("heading", { name: "お子さまのようす" });
  const pad = page.getByRole("button", { name: "数字 1" });
  await overview.or(pad).first().waitFor();
  if (await pad.isVisible().catch(() => false)) {
    for (const d of pin) await page.getByRole("button", { name: `数字 ${d}` }).click();
    await overview.waitFor();
  }
}

async function login(page: Page, email: string, password: string) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード", { exact: true }).fill(password);
  await page.getByRole("button", { name: "ログイン", exact: true }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
}

async function flow() {
  const browser = await chromium.launch();
  const stamp = Date.now();
  const email = `p5-flow-${stamp}@example.com`;
  const PW1 = "passw0rd-p5";
  const PW2 = "newpassw0rd-p5";
  const PIN1 = "2468";
  const PIN2 = "1357";
  try {
    // ------------------------------------------------------------------
    step("1. 2つの ブラウザで おためし（きろく・コインが べつべつ）");
    const A = await newPage(browser);
    const B = await newPage(browser);
    for (const [label, x] of [["A", A], ["B", B]] as const) {
      await x.page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      await x.page.waitForURL(/\/welcome$/);
      await x.page.getByRole("button", { name: "おためしで あそぶ" }).click();
      await x.page.waitForURL(/\/map$/);
      check(`ブラウザ${label}: スタート画面 →「おためしで あそぶ」→ マップ`, x.page.url().endsWith("/map"));
    }
    let coinsA = 0;
    for (const n of [1, 2]) {
      const r = await completeLesson(A.page, n);
      check(`A: レッスン${n} クリア（trial）`, r.status === 200 && r.body.ok === true && r.body.trial === true, r.body);
      coinsA += Number(r.body.reward?.total ?? 0);
    }
    const rB = await completeLesson(B.page, 1);
    check("B: レッスン1 クリア（trial）", rB.status === 200 && rB.body.ok === true && rB.body.trial === true, rB.body);
    const coinsB = Number(rB.body.reward?.total ?? 0);
    const [uA, uB] = [await trialUserOf(A.ctx), await trialUserOf(B.ctx)];
    check("A と B は べつの おためし学習者（DB）", !!uA && !!uB && uA.id !== uB.id && uA.isTrial && uB.isTrial, { a: uA?.id, b: uB?.id });
    check("DB: A は レッスン1・2、B は レッスン1", uA?.lessonProgress.map((l) => l.lessonNo).sort().join(",") === "1,2" && uB?.lessonProgress.map((l) => l.lessonNo).join(",") === "1", { a: uA?.lessonProgress, b: uB?.lessonProgress });
    const [dA, dB] = [await dashboard(A.page), await dashboard(B.page)];
    // ほうしゅうの合計（reward.total）のほかに ログインボーナスなどが のることがあるので、DB の値と くらべる
    check(`コインも べつべつ（A ${dA.user?.coins} / B ${dB.user?.coins}）`, dA.user?.coins === uA?.coins && dB.user?.coins === uB?.coins && (uA?.coins ?? 0) >= coinsA && (uB?.coins ?? 0) >= coinsB && uA?.coins !== uB?.coins, { dA: dA.user, dB: dB.user, coinsA, coinsB, dbA: uA?.coins, dbB: uB?.coins });
    coinsA = uA?.coins ?? coinsA;
    check("ダッシュボードの レッスン数（A 2 / B 1）", dA.lessonsCompleted === 2 && dB.lessonsCompleted === 1, { a: dA.lessonsCompleted, b: dB.lessonsCompleted });
    await A.page.goto(BASE + "/map", { waitUntil: "networkidle" });
    await shot(A.page, "01-trial-map-a");
    await B.page.goto(BASE + "/map", { waitUntil: "networkidle" });
    await shot(B.page, "02-trial-map-b");

    // ------------------------------------------------------------------
    step("2. A: 新規登録 → お子さまを追加 →「ひきつぐ？」に いいえ → おうちの方ページの ボタンで ひきつぐ");
    await A.page.goto(BASE + "/register", { waitUntil: "networkidle" });
    await A.page.getByLabel("メールアドレス").fill(email);
    await A.page.getByLabel("パスワード", { exact: true }).fill(PW1);
    await A.page.getByLabel("パスワード（確認）", { exact: true }).fill(PW1);
    await A.page.getByLabel("暗証番号", { exact: true }).fill(PIN1);
    await A.page.getByLabel("暗証番号（確認）", { exact: true }).fill(PIN1);
    await A.page.locator('form button[type="submit"]').click();
    await A.page.waitForURL(/\/parent/);
    check("登録 → おうちの方ページ", A.page.url().includes("/parent"));
    const form = A.page.getByRole("form", { name: "お子さまを追加" });
    const addButton = A.page.getByRole("button", { name: "＋ お子さまを追加" });
    await form.or(addButton).first().waitFor();
    if ((await form.count()) === 0) await addButton.click();
    await form.getByLabel("ニックネーム").fill("うみ");
    await form.getByRole("button", { name: "追加する" }).click();
    await A.page.getByRole("heading", { name: /うみ/ }).first().waitFor();
    const parent = await db.parent.findUnique({ where: { email }, select: { id: true, children: { select: { id: true, nickname: true } } } });
    const kid = parent?.children[0];
    check("お子さまを追加", kid?.nickname === "うみ", parent);

    await A.page.goto(BASE + "/who", { waitUntil: "networkidle" });
    await A.page.getByRole("button", { name: /^うみ\s*さん/ }).click();
    const dialog = A.page.getByRole("dialog");
    await dialog.getByText("おためしで あそんだ きろくを ひきつぐ？").waitFor();
    await shot(A.page, "03-carry-ask");
    await dialog.getByRole("button", { name: "いいえ、ひきつがない" }).click();
    await A.page.waitForURL(/\/map$/);
    const kidAfterNo = await db.user.findUnique({ where: { id: kid!.id }, select: { coins: true, lessonProgress: { select: { lessonNo: true } } } });
    check("「いいえ」では ひきつがない（うみさんは 0）", kidAfterNo?.lessonProgress.length === 0 && kidAfterNo.coins === 0, kidAfterNo);

    await openParent(A.page, PIN1);
    const panel = A.page.locator("section", { has: A.page.getByRole("heading", { name: "おためしの記録" }) });
    await panel.waitFor();
    const panelText = await panel.innerText();
    check("おうちの方ページに「おためしの記録」（レッスン2・コイン）", panelText.includes("レッスン2") && panelText.includes(`コイン${coinsA}`), panelText);
    let t0 = Date.now();
    await panel.getByText("うみ", { exact: true }).click();
    await panel.getByRole("button", { name: "おためしの きろくを ひきつぐ" }).click();
    await panel.getByText("元に戻せません").waitFor();
    console.log(`    （お子さまを えらんで 確認まで ${Date.now() - t0}ms）`);
    await shot(A.page, "04-parent-carry-confirm");
    t0 = Date.now();
    const carryRes = A.page.waitForResponse((r) => /\/carry-over$/.test(r.url()));
    await panel.getByRole("button", { name: "引き継ぐ", exact: true }).click();
    console.log(`    （ひきつぎの API ${(await carryRes).status()}・${Date.now() - t0}ms）`);
    await A.page.getByText(/おためしの記録をうみさんに引き継ぎました/).first().waitFor();
    console.log(`    （おしらせが 出るまで ${Date.now() - t0}ms）`);
    await shot(A.page, "05-parent-carry-done");
    check("「引き継ぎました」の おしらせ・パネルが消える", (await A.page.getByRole("heading", { name: "おためしの記録" }).count()) === 0);
    const kidRow = await db.user.findUnique({ where: { id: kid!.id }, select: { coins: true, lessonProgress: { select: { lessonNo: true } } } });
    check("DB: うみさんに レッスン1・2 と コイン", kidRow?.lessonProgress.map((l) => l.lessonNo).sort().join(",") === "1,2" && kidRow.coins === coinsA, { kidRow, coinsA });
    check("A の おためし cookie は 消えた", !(await A.ctx.cookies()).some((c) => c.name === "eq_trial_learner"));
    const uB2 = await trialUserOf(B.ctx);
    check("B の おためしは そのまま（べつの端末）", uB2?.id === uB?.id && uB2?.coins === uB?.coins && uB2?.lessonProgress.length === 1, uB2);
    const again = await A.page.evaluate(async (id) => {
      const r = await fetch(`/api/children/${id}/carry-over`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trialId: "t".repeat(32), lessons: {}, tests: {}, coins: 0, days: [], items: {} }) });
      return { status: r.status, body: await r.json() };
    }, kid!.id);
    const kidRow2 = await db.user.findUnique({ where: { id: kid!.id }, select: { coins: true } });
    check("2回目の ひきつぎ（cookie なし）で コインは ふえない", again.status === 200 && kidRow2?.coins === coinsA, { again, kidRow2 });

    // ------------------------------------------------------------------
    step("3. パスワードを忘れた → outbox の メール → 再設定 → ほかの端末も ログアウト");
    const C = await newPage(browser);
    await login(C.page, email, PW1);
    check("ブラウザC（べつの端末）で ログイン", (await me(C.page)).loggedIn === true);
    const oldSessionCookie = (await A.ctx.cookies()).find((c) => c.name === "eq_session");
    check("A は ログイン中（eq_session は httpOnly）", (await me(A.page)).loggedIn === true && !!oldSessionCookie?.httpOnly);

    const R = await newPage(browser); // 再設定を するのは ログインしていない ブラウザ（メールのリンクを ひらく端末）
    await R.page.goto(BASE + "/login", { waitUntil: "networkidle" });
    await R.page.getByRole("link", { name: "パスワードを忘れた方" }).click();
    await R.page.waitForURL(/\/forgot-password$/);
    await R.page.getByLabel("メールアドレス").fill(email);
    await R.page.getByRole("button", { name: "再設定のメールを送る" }).click();
    await R.page.getByText("メールのリンクの有効期限は30分です").waitFor();
    await shot(R.page, "06-forgot-password-sent");
    // 登録の無い アドレスでも 同じ答え・メールは 送らない
    const nobody = await R.page.evaluate(async (e) => (await (await fetch("/api/auth/password-reset/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: e }) })).json()), `nobody-${stamp}@example.com`);
    const mail = await waitForMail((m) => m.to === email && /token=/.test(m.text));
    check("outbox に 再設定の メール（30分）", !!mail && /30分/.test(mail.text), mail?.subject);
    await new Promise((r) => setTimeout(r, 1500));
    check("登録の無い アドレスには 送らない（同じ答え）", !mails().some((m) => m.to.startsWith("nobody-")) && nobody.ok === true, nobody);
    const link = /https?:\/\/\S+\/reset-password\?token=[A-Za-z0-9_-]{43}/.exec(mail?.text ?? "")?.[0] ?? "";
    check("メールの リンクは APP_BASE_URL から", link.startsWith(`${BASE}/reset-password?token=`), link.slice(0, 60));
    const token = link.split("token=")[1] ?? "";
    const tokenRow = await db.authToken.findFirst({ where: { parentId: parent!.id, purpose: "PASSWORD_RESET" } });
    check("DB には トークンの SHA-256 だけ", !!tokenRow && tokenRow.tokenHash === sha(token) && !JSON.stringify(tokenRow).includes(token));

    await R.page.goto(link, { waitUntil: "domcontentloaded" });
    await R.page.getByRole("form", { name: "新しいパスワードを決める" }).waitFor();
    check("リンクを ひらくと URL から token が消える", !R.page.url().includes("token="), R.page.url());
    await R.page.getByLabel("新しいパスワード", { exact: true }).fill(PW2);
    await R.page.getByLabel("新しいパスワード（確認）", { exact: true }).fill(PW2);
    await shot(R.page, "07-reset-form");
    await R.page.getByRole("button", { name: "パスワードを再設定する" }).click();
    await R.page.waitForURL(/\/login\?reset=1$/);
    await R.page.waitForLoadState("networkidle");
    await shot(R.page, "08-login-after-reset");
    check("再設定 → ログイン画面（?reset=1）", R.page.url().endsWith("/login?reset=1"));

    check("A（古い セッション）は ログアウトされている", (await me(A.page)).loggedIn === false);
    check("C（べつの端末）も ログアウトされている", (await me(C.page)).loggedIn === false);
    check("DB の セッションが 0", (await db.session.count({ where: { parentId: parent!.id } })) === 0);
    await A.page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
    await A.page.waitForURL((u) => u.pathname !== "/parent").catch(() => undefined);
    check(`A で おうちの方ページを ひらくと ログイン・スタートへ（${new URL(A.page.url()).pathname}）`, new URL(A.page.url()).pathname !== "/parent");
    const reuse = await R.page.evaluate(async (t) => (await fetch("/api/auth/password-reset/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: t, newPassword: "otherpassw0rd-x" }) })).status, token);
    check("リンクの 2回目は つかえない", reuse === 400, reuse);
    const notice = await waitForMail((m) => m.to === email && m.subject.includes("パスワードを再設定しました"));
    check("「再設定しました」の おしらせメール（リンク・トークンなし）", !!notice && !/token=/.test(notice.text));
    const oldPw = await R.page.evaluate(async ([e, p]) => (await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: e, password: p }) })).status, [email, PW1]);
    check("古い パスワードでは ログインできない", oldPw === 401, oldPw);
    await R.ctx.clearCookies();
    await login(A.page, email, PW2);
    check("新しい パスワードで ログイン（A）", (await me(A.page)).loggedIn === true);

    // ------------------------------------------------------------------
    step("4. 暗証番号を忘れた（パスワードで 本人確認）");
    await A.page.goto(BASE + "/parent", { waitUntil: "domcontentloaded" });
    await A.page.getByRole("button", { name: "数字 1" }).waitFor();
    await A.page.getByRole("link", { name: "暗証番号を忘れた" }).click();
    await A.page.waitForURL(/\/forgot-pin$/);
    const pinForm = A.page.getByRole("form", { name: "新しい暗証番号を決める" });
    await pinForm.waitFor();
    await pinForm.getByLabel("アカウントのパスワード").fill("wrong-passw0rd");
    await pinForm.getByLabel("新しい暗証番号", { exact: true }).fill(PIN2);
    await pinForm.getByLabel("新しい暗証番号（確認）", { exact: true }).fill(PIN2);
    await pinForm.getByRole("button", { name: "新しい暗証番号にする" }).click();
    await A.page.getByText(/パスワードが違います|正しくありません|一致しません/).first().waitFor().catch(() => undefined);
    check("まちがった パスワードでは 決められない", A.page.url().endsWith("/forgot-pin"));
    await pinForm.getByLabel("アカウントのパスワード").fill(PW2);
    await pinForm.getByLabel("新しい暗証番号", { exact: true }).fill(PIN2);
    await pinForm.getByLabel("新しい暗証番号（確認）", { exact: true }).fill(PIN2);
    await shot(A.page, "09-forgot-pin");
    await pinForm.getByRole("button", { name: "新しい暗証番号にする" }).click();
    await A.page.waitForURL(/\/parent$/);
    await A.page.getByRole("heading", { name: "お子さまのようす" }).waitFor();
    check("決めると そのまま おうちの方ページ（暗証番号は 入力ずみ）", (await me(A.page)).pinUnlocked === true);
    await shot(A.page, "10-parent-after-pin");
    const vOld = await A.page.evaluate(async (p) => (await fetch("/api/parent/verify-pin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin: p }) })).status, PIN1);
    const vNew = await A.page.evaluate(async (p) => (await fetch("/api/parent/verify-pin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pin: p }) })).status, PIN2);
    check("古い 暗証番号は だめ・新しい 暗証番号は OK", vOld !== 200 && vNew === 200, { vOld, vNew });

    // ------------------------------------------------------------------
    step("5. 毎月のレポート dry-run（STORAGE_DRIVER=local）→ レポートの PDF（Node）＋ ワークブック");
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
    console.log(`$ npx tsx scripts/line-monthly.ts --dry-run --parent ${parent!.id} --month ${month} --timeout 240`);
    const out = spawnSync("npx", ["tsx", "scripts/line-monthly.ts", "--dry-run", "--parent", parent!.id, "--month", month, "--timeout", "240"], { env, shell: isWin, encoding: "utf8", timeout: 330_000 });
    const stdout = out.stdout ?? "";
    console.log(stdout.split("\n").map((l) => `    | ${l}`).join("\n"));
    check("line:monthly --dry-run: 終了コード 0・dry-run・置き場所は ローカル", out.status === 0 && stdout.includes("dry-run") && /ローカル|local/i.test(stdout), out.stderr?.slice(-400));
    const url = stdout.match(/https?:\/\/\S+\/d\/[A-Za-z0-9_-]{43}/)?.[0];
    check("うみさんの ダウンロードの リンク", !!url && stdout.includes("うみ"), stdout.slice(-400));
    await A.page.goto(url ?? `${BASE}/d/none`, { waitUntil: "networkidle" });
    const dl = await A.page.locator("body").innerText();
    check("ダウンロードページ: うみ さん", dl.includes("うみ さん"), dl.slice(0, 300));
    await shot(A.page, "11-download-page");
    const hrefs = await A.page.locator('a[href*="/d/"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    const reportHref = hrefs.find((h) => h.endsWith("/report"));
    const wsHref = hrefs.find((h) => h.endsWith("/worksheets"));
    check("レポートと ワークブックの ボタン", !!reportHref && !!wsHref, hrefs);
    if (reportHref) {
      const r = await A.page.request.get(reportHref);
      const body = await r.body();
      let pages = 0;
      let producer = "";
      try {
        const pdf = await PDFDocument.load(body, { updateMetadata: false });
        pages = pdf.getPageCount();
        producer = pdf.getProducer() ?? "";
      } catch { /* 下で失敗 */ }
      check(`レポートの PDF: 200・application/pdf・1ページ・Node（pdf-lib）製・${body.length} bytes`,
        r.status() === 200 && r.headers()["content-type"] === "application/pdf" && pages === 1 && producer === "Eigo Quest" && body.length < 400_000,
        { status: r.status(), pages, producer, bytes: body.length });
      check("レポートの PDF: no-store・noindex", /no-store/.test(r.headers()["cache-control"] ?? "") && /noindex/.test(r.headers()["x-robots-tag"] ?? ""), r.headers());
    }
    if (wsHref) {
      const r = await A.page.request.get(wsHref);
      const body = await r.body();
      const expected = statSync(path.join(process.cwd(), "worksheets", "out", "monthly", "month-01.pdf")).size;
      check(`ワークブックの PDF: 200・アップロードしたものと 同じ大きさ（${body.length} bytes）`, r.status() === 200 && body.subarray(0, 5).toString() === "%PDF-" && body.length === expected, { status: r.status(), bytes: body.length, expected });
    }
    const files = readdirSync(path.join(WORK, "storage", "reports", parent!.id, month));
    check("レポートは 置き場所の reports/<保護者ID>/<月>/ に", files.length === 1 && /^[0-9a-f]{24}\.pdf$/.test(files[0]!), files);
    const otherParent = await A.page.request.get(`${url}/../${"y".repeat(43)}/report`);
    check("でたらめな リンクは 404", otherParent.status() === 404, otherParent.status());

    // cron の API（このサーバーには CRON_SECRET を わたしてある）
    const cronNo = await fetch(`${BASE}/api/cron/trial-cleanup`);
    const cronBad = await fetch(`${BASE}/api/cron/trial-cleanup`, { headers: { authorization: `Bearer ${CRON_SECRET}x` } });
    const cronOk = await fetch(`${BASE}/api/cron/trial-cleanup`, { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    const cronOkBody = (await cronOk.json()) as { ok?: boolean; trialDeleted?: number };
    check("cron: 合い言葉なし 401・ちがう 401・正しい 200", cronNo.status === 401 && cronBad.status === 401 && cronOk.status === 200 && cronOkBody.ok === true, { no: cronNo.status, bad: cronBad.status, ok: cronOk.status, body: cronOkBody });
    check("cron の そうじで 遊んだばかりの おためし学習者は 消えない", (await trialUserOf(B.ctx))?.id === uB?.id);
    const lm = await fetch(`${BASE}/api/cron/line-monthly`, { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    const lmBody = (await lm.json()) as { skipped?: string };
    check("cron: 毎月の LINE は LINE 未設定なら 何もしない", lm.status === 200 && lmBody.skipped === "LINE_NOT_CONFIGURED", lmBody);
    const health = await fetch(`${BASE}/api/health`);
    const healthText = await health.text();
    check("health: 200（DB・置き場所 OK）・秘密や パスは 出ない", health.status === 200 && !healthText.includes(CRON_SECRET) && !healthText.includes(WORK.replace(/\\/g, "\\\\")) && !/5544|eigo:eigo/.test(healthText), healthText.slice(0, 300));

    for (const [label, x] of [["A", A], ["B", B], ["C", C], ["R", R]] as const) {
      const errs = errorsOf.get(x.page) ?? [];
      check(`ブラウザ${label}: 画面の エラー・5xx なし`, errs.length === 0, errs);
    }
  } finally {
    await browser.close();
  }
}

let server: ChildProcess | null = null;
function cleanup() {
  stopServer(server);
  server = null;
}

async function main() {
  installDeadline(TIMEOUT_SEC, cleanup);
  console.log(`run5 flow check（最長 ${TIMEOUT_SEC}秒）: ${BASE}`);
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(SHOTS, { recursive: true });
  run("npx", ["prisma", "migrate", "deploy"], env);
  await clearRateLimits(db);
  run("npx", ["tsx", "prisma/seed.ts"], env, 300_000);
  run("npx", ["tsx", "scripts/upload-worksheets.ts", "--pack", "1", "--timeout", "120"], env); // run7: 20レッスンごとの No.1（まだ はじめていない子に 同封される）
  server = startServer(PORT, env);
  try {
    await waitForServer(server, BASE);
    await flow();
  } finally {
    cleanup();
    await db.$disconnect();
  }
  console.log(failures === 0 ? "\n🎉 すべて OK" : `\n✖ ${failures} 件 失敗`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  cleanup();
  process.exit(1);
});
