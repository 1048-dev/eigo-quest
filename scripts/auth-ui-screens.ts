/**
 * 保護者アカウントの画面を「本物の PostgreSQL + next start + Playwright」で通しで操作し、スクリーンショットを撮る。
 *
 *   npx next build
 *   npx tsx scripts/auth-ui-screens.ts --db postgresql://eigo:eigo@localhost:5544/eigo_quest?schema=public [--port 3458] [--width 360]
 *
 * 1. prisma migrate deploy → seed
 * 2. next start（本物の DB）と、つながらない DB の next start（おためしモードの確認用）を起動
 * 3. スタート → 登録 → お子さまの追加 → だれが あそぶ？ → マップ（ヘッダー）→ 暗証番号 → おうちの方 → ログアウト → ログイン を画面で操作
 * 4. docs/run3/screens/ に PNG を保存。横にはみ出していないか・コンソールエラーが無いかも確認する
 * ※ テスト用の DB を渡すこと（保護者・子どもを作る）。
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3458"));
const OFFLINE_PORT = PORT + 1;
const WIDTH = Number(arg("width", "360"));
if (!DB) {
  console.error("使い方: npx tsx scripts/auth-ui-screens.ts --db <テスト用 DATABASE_URL> [--port 3458] [--width 360]");
  process.exit(2);
}
const OUT = path.join(process.cwd(), "docs", "run3", "screens");
mkdirSync(OUT, { recursive: true });
const isWin = process.platform === "win32";
const env = { ...process.env, DATABASE_URL: DB, SEED_DEMO_PARENT: "1", SKIP_DAILY_LOCK: "1" };
const BASE = `http://localhost:${PORT}`;
const OFFLINE_BASE = `http://localhost:${OFFLINE_PORT}`;

let failures = 0;
function check(label: string, cond: boolean, detail?: unknown) {
  console.log(`${cond ? "✔" : "✖"} ${label}`);
  if (!cond) {
    failures++;
    if (detail !== undefined) console.log("   ", JSON.stringify(detail).slice(0, 400));
  }
}

function run(cmd: string, args: string[]) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { env, stdio: "inherit", shell: isWin });
  if (r.status !== 0) throw new Error(`${cmd} ${args[0]} failed (${r.status})`);
}

function startServer(port: number, databaseUrl: string): ChildProcess {
  return spawn("npx", ["next", "start", "-p", String(port)], { env: { ...env, DATABASE_URL: databaseUrl, NODE_ENV: "production" }, stdio: ["ignore", "ignore", "inherit"], shell: isWin });
}
function stopServer(s: ChildProcess) {
  if (isWin && s.pid) spawnSync("taskkill", ["/pid", String(s.pid), "/T", "/F"], { stdio: "ignore" });
  else s.kill();
}
async function waitFor(base: string, s: ChildProcess) {
  for (let i = 0; i < 90; i++) {
    if (s.exitCode != null) throw new Error("next start exited");
    try { if ((await fetch(`${base}/api/auth/me`)).status < 600) return; } catch { /* まだ */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`server ${base} did not start`);
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
}

async function shot(page: Page, name: string) {
  await settle(page);
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  check(`${name}: 横にはみ出していない（${sw} <= ${iw}）`, sw <= iw);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

/** マップは現在のステージまで自動でスクロールするので、上（ヘッダー）に戻してから画面の高さだけ撮る */
async function topShot(page: Page, name: string) {
  await settle(page);
  await page.waitForTimeout(2500); // WorldMap の smooth スクロールが終わるのを待つ
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
}

async function flow() {
  const browser = await chromium.launch();
  const errors: string[] = [];
  const newPage = async (base: string) => {
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 780 }, deviceScaleFactor: 1, locale: "ja-JP", baseURL: base });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`); });
    return page;
  };
  try {
    const page = await newPage(BASE);

    // --- はじめて: / → /welcome
    await page.goto("/");
    await page.waitForURL("**/welcome");
    check("はじめては / から /welcome へ", page.url().endsWith("/welcome"));
    await shot(page, "p3-01-welcome");

    // --- 登録（まず空で送ってエラー表示）
    await page.getByRole("link", { name: "おうちの方：とうろく" }).click();
    await page.waitForURL("**/register");
    await page.getByRole("button", { name: "登録する" }).click();
    await page.getByLabel("パスワード", { exact: true }).fill("abc");
    await shot(page, "p3-02-register-errors");
    const email = `screens-${Date.now()}@example.com`;
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード", { exact: true }).fill("passw0rd-ui");
    await page.getByLabel("パスワード（確認）").fill("passw0rd-ui");
    await page.getByLabel("暗証番号", { exact: true }).fill("4321");
    await page.getByLabel("暗証番号（確認）").fill("4321");
    await shot(page, "p3-03-register-filled");
    await page.getByRole("button", { name: "登録する" }).click();
    await page.waitForURL("**/parent?add=1*");
    await settle(page);
    check("登録後は おうちの方ページ（追加フォームが開いている）", await page.getByRole("form", { name: "お子さまを追加" }).isVisible());
    await shot(page, "p3-04-parent-after-register");

    // --- お子さまを2人追加
    await page.getByLabel("ニックネーム").fill("はるくん");
    await page.getByText("3年", { exact: false }).first().click();
    await page.getByRole("button", { name: "追加する" }).click();
    await page.getByRole("heading", { name: "はるくん さん" }).waitFor();
    await page.getByRole("button", { name: "＋ お子さまを追加" }).click();
    await page.getByLabel("ニックネーム").last().fill("りこちゃん");
    await page.getByLabel("生まれ年（西暦・任意）").last().fill("2019");
    await page.getByRole("button", { name: "追加する" }).click();
    await page.getByRole("heading", { name: "りこちゃん さん" }).waitFor();
    check("2人追加できた", (await page.getByRole("article").count()) === 2);

    // 1日の回数制限
    await page.getByLabel("1日のレッスン回数").first().selectOption("3");
    await page.getByText("1日 3回までにしました。").waitFor();
    check("回数制限を保存できた", true);

    // --- だれが あそぶ？
    await page.goto("/who");
    await page.getByRole("heading", { name: "だれが あそぶ？" }).waitFor();
    await shot(page, "p3-05-who");
    await page.getByRole("button", { name: /はるくんさん/ }).click();
    await page.waitForURL("**/map");
    await page.getByLabel("いま あそんでいる人").waitFor();
    check("マップのヘッダーに選んだ子の名前", (await page.getByLabel("いま あそんでいる人").innerText()).includes("はるくん"));
    await topShot(page, "p3-06-map-header");

    // レッスンを1つ完了（ようすに数字が出るように。API を直接）
    const done = await page.evaluate(async () => (await fetch("/api/lessons/1/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quizScore: 1, logs: [] }) })).status);
    check("レッスン1を完了（はるくん）", done === 200, done);

    // --- 暗証番号（いったんログアウト → ログインして PIN 未入力の状態にする）
    await page.goto("/parent");
    await page.getByRole("button", { name: "ログアウト" }).click();
    await page.waitForURL("**/welcome");
    await page.goto("/login");
    await page.getByRole("button", { name: "ログイン" }).click();
    await shot(page, "p3-07-login-empty-error");
    await page.getByLabel("メールアドレス").fill(email);
    await page.getByLabel("パスワード", { exact: true }).fill("wrong-pass-1");
    await page.getByRole("button", { name: "ログイン" }).click();
    await page.getByText("メールアドレスまたはパスワードが正しくありません。").waitFor();
    check("ログイン失敗は共通の文言", true);
    await page.getByLabel("パスワード", { exact: true }).fill("passw0rd-ui");
    await page.getByRole("button", { name: "ログイン" }).click();
    await page.waitForURL("**/who");
    await page.getByRole("button", { name: /はるくんさん/ }).click();
    await page.waitForURL("**/map");
    await page.getByRole("button", { name: /おうちの方のページ/ }).click();
    await page.getByRole("dialog").waitFor();
    for (const d of ["1", "1", "1", "1"]) await page.getByRole("button", { name: `数字 ${d}` }).click();
    await page.getByText("暗証番号が違います。").waitFor();
    check("ちがう暗証番号はエラー", true);
    await page.screenshot({ path: path.join(OUT, "p3-08-pin-dialog-wrong.png") });
    await page.keyboard.type("4321");
    await page.waitForURL("**/parent");
    await page.getByRole("heading", { name: "はるくん さん" }).waitFor();
    check("正しい暗証番号で おうちの方ページへ", true);
    await shot(page, "p3-09-parent");

    // 編集・削除の確認画面
    await page.getByRole("button", { name: "編集" }).nth(1).click();
    await page.getByRole("form", { name: /りこちゃんさんの情報を編集/ }).screenshot({ path: path.join(OUT, "p3-10-parent-edit-child.png") });
    await page.getByRole("button", { name: "やめる" }).first().click();
    await page.getByRole("button", { name: "退会する" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "次へ" }).click();
    await page.getByRole("group", { name: "退会の確認" }).screenshot({ path: path.join(OUT, "p3-11-parent-delete-confirm.png") });
    await page.getByRole("button", { name: "やめる" }).last().click();

    // レーダーへのリンク
    await page.getByRole("button", { name: /レーダーを見る/ }).first().click();
    await page.waitForURL("**/dashboard");
    check("レーダーのリンクで ステータス画面へ", true);

    // PIN 未入力で /parent を直接開くと PIN パッド（別のブラウザで新しくログイン）
    const page2 = await newPage(BASE);
    await page2.goto("/login");
    await page2.getByLabel("メールアドレス").fill(email);
    await page2.getByLabel("パスワード", { exact: true }).fill("passw0rd-ui");
    await page2.getByRole("button", { name: "ログイン" }).click();
    await page2.waitForURL("**/who");
    await page2.goto("/parent");
    await page2.getByRole("button", { name: "数字 5" }).waitFor();
    check("PIN 未入力で /parent を開くと暗証番号パッド", true);
    await shot(page2, "p3-12-parent-locked");

    // --- おためしモード（ログインしていない）
    const trial = await newPage(BASE);
    await trial.goto("/welcome");
    await trial.getByRole("button", { name: "おためしで あそぶ" }).click();
    await trial.waitForURL("**/map");
    await trial.getByText("おためしモード").first().waitFor();
    await topShot(trial, "p3-13-trial-map");
    await trial.goto("/");
    await trial.waitForURL("**/map");
    check("おためしを選んだあとは / から /map へ", trial.url().endsWith("/map"));

    // --- DB が止まっているとき
    const off = await newPage(OFFLINE_BASE);
    await off.goto("/login");
    await off.getByLabel("メールアドレス").fill(email);
    await off.getByLabel("パスワード", { exact: true }).fill("passw0rd-ui");
    await off.getByRole("button", { name: "ログイン" }).click();
    await off.getByText(/ただいまアカウント機能を利用できません/).waitFor();
    check("DB 停止中のログインは ていねいなメッセージ＋おためしボタン", await off.getByRole("button", { name: "おためしで あそぶ" }).isVisible());
    await shot(off, "p3-14-login-offline");
    await off.goto("/who");
    await off.getByText("いまは アカウントに つながらないよ").waitFor();
    await shot(off, "p3-15-who-offline");
    await off.goto("/map");
    await off.getByText("おためしモード").first().waitFor();
    check("DB 停止中でもマップは おためしモードで開く", true);

    check("コンソールエラー・ページエラーがない", errors.length === 0, errors);
  } finally {
    await browser.close();
  }
}

async function main() {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
  const server = startServer(PORT, DB!);
  const offline = startServer(OFFLINE_PORT, "postgresql://nobody:nobody@localhost:1/none?schema=public&connect_timeout=1");
  try {
    await waitFor(BASE, server);
    await waitFor(OFFLINE_BASE, offline);
    await flow();
  } finally {
    stopServer(server);
    stopServer(offline);
  }
  console.log(failures === 0 ? "\nすべて OK" : `\n${failures} 件の失敗`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
