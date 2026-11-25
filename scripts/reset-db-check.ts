/**
 * パスワードの再設定・暗証番号を忘れた を「本物の PostgreSQL + next start」で通しで確かめる（run5 Phase 2）。
 *
 *   npx next build
 *   npx tsx scripts/reset-db-check.ts --db postgresql://eigo:eigo@localhost:5544/eigo_quest?schema=public [--port 3459] [--timeout 300]
 *
 * 1. prisma migrate deploy
 * 2. next start（MAIL_PROVIDER=outbox。メールは .data/mail-check-<時刻> に書かせる）
 * 3. 登録 → 「パスワードを忘れた」（登録あり / なしで 同じ答え）→ outbox のリンク → 再設定
 *    → 古いセッションが使えない・新しいパスワードでログイン・リンクの2回目は だめ → 暗証番号を忘れた（パスワードで）→ 退会
 * 4. DB にトークンの平文が無い・使ったトークンに usedAt・退会後に トークンが残らない ことを Prisma で確認
 * 進みぐあいを 1行ずつ表示。--timeout 秒（既定 300）で とちゅうでも やめる。
 * ※ テスト用の DB を渡すこと（保護者を作って消す）。
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3459"));
const TIMEOUT_SEC = Math.min(3600, Math.max(30, Number(arg("timeout", "300")) || 300));
if (!DB) {
  console.error("使い方: npx tsx scripts/reset-db-check.ts --db <テスト用 DATABASE_URL> [--port 3459] [--timeout 300]");
  process.exit(2);
}
const BASE = `http://localhost:${PORT}`;
const OUTBOX = path.join(process.cwd(), ".data", `mail-check-${Date.now()}`);
const env = { ...process.env, DATABASE_URL: DB, PORT: String(PORT), MAIL_PROVIDER: "outbox", MAIL_OUTBOX_DIR: OUTBOX, APP_BASE_URL: BASE };
const isWin = process.platform === "win32";

function run(cmd: string, args: string[]) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { env, stdio: "inherit", shell: isWin, timeout: 180_000 });
  if (r.status !== 0) throw new Error(`${cmd} ${args[0]} failed (${r.status})`);
}

let failures = 0;
function check(label: string, cond: boolean, detail?: unknown) {
  console.log(`${cond ? "✔" : "✖"} ${label}`);
  if (!cond) {
    failures++;
    if (detail !== undefined) console.log("   ", JSON.stringify(detail).slice(0, 400));
  }
}
const step = (s: string) => console.log(`\n▶ ${s}`);

class Client {
  cookie = "";
  async req(method: string, p: string, body?: unknown) {
    const res = await fetch(BASE + p, {
      method,
      headers: { "content-type": "application/json", origin: BASE, ...(this.cookie ? { cookie: this.cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [name, value] = pair.split("=");
      if (name === "eq_session") this.cookie = value ? `eq_session=${value}` : "";
    }
    const text = await res.text();
    let json: Record<string, any> = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text.slice(0, 200) }; }
    return { status: res.status, body: json };
  }
}

function mails(): { to: string; subject: string; text: string }[] {
  if (!existsSync(OUTBOX)) return [];
  return readdirSync(OUTBOX).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(readFileSync(path.join(OUTBOX, f), "utf8")));
}
async function waitForMail(count: number) {
  for (let i = 0; i < 30; i++) {
    if (mails().length >= count) return mails();
    await new Promise((r) => setTimeout(r, 500));
  }
  return mails();
}
const tokenOf = (text: string) => /token=([A-Za-z0-9_-]{43})/.exec(text)?.[1] ?? "";

async function waitForServer(server: ChildProcess) {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode != null) throw new Error("next start exited");
    try {
      if ((await fetch(`${BASE}/api/auth/me`)).ok) return;
    } catch { /* まだ */ }
    console.log(`  サーバーの起動を まっています… (${i + 1}s)`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server did not start");
}

const db = new PrismaClient({ datasourceUrl: DB });

async function flow() {
  const stamp = Date.now();
  const A = { email: `run5-reset-${stamp}@example.com`, password: "passw0rd-a", pin: "1111" };
  const a = new Client();
  const b = new Client();
  const anon = new Client();

  step("登録して、もう1台の端末でもログイン");
  check("登録 → 201", (await a.req("POST", "/api/auth/register", A)).status === 201);
  check("2台目でログイン", (await b.req("POST", "/api/auth/login", { email: A.email, password: A.password })).status === 200);

  step("パスワードを忘れた（登録あり / なし）");
  const yes = await anon.req("POST", "/api/auth/password-reset/request", { email: A.email });
  const no = await anon.req("POST", "/api/auth/password-reset/request", { email: `nobody-${stamp}@example.com` });
  check("登録あり / なしで 同じ答え", yes.status === 200 && JSON.stringify(yes.body) === JSON.stringify(no.body), { yes: yes.body, no: no.body });
  const box = await waitForMail(1);
  await new Promise((r) => setTimeout(r, 1000));
  check("メールは 登録ありの 1通だけ", mails().length === 1 && box[0]?.to === A.email, mails().map((m) => m.to));
  const t = tokenOf(box[0]?.text ?? "");
  check("リンクに トークン", t.length === 43);
  const parent = await db.parent.findUnique({ where: { email: A.email }, select: { id: true } });
  const row = await db.authToken.findFirst({ where: { parentId: parent?.id ?? "-" } });
  check("DB には トークンの SHA-256 だけ", !!row && row.tokenHash === createHash("sha256").update(t).digest("hex") && !JSON.stringify(row).includes(t));

  step("再設定");
  check("check → valid", (await anon.req("POST", "/api/auth/password-reset/check", { token: t })).body.valid === true);
  const done = await anon.req("POST", "/api/auth/password-reset/complete", { token: t, newPassword: "newpassw0rd" });
  check("再設定 → 200", done.status === 200, done.body);
  check("1台目・2台目とも ログアウトされている", (await a.req("GET", "/api/auth/me")).body.loggedIn === false && (await b.req("GET", "/api/auth/me")).body.loggedIn === false);
  check("DB のセッションが 0", (await db.session.count({ where: { parentId: parent?.id ?? "-" } })) === 0);
  check("リンクの2回目は だめ", (await anon.req("POST", "/api/auth/password-reset/complete", { token: t, newPassword: "otherpassw0rd" })).status === 400);
  check("使ったトークンに usedAt", !!(await db.authToken.findUnique({ where: { id: row?.id ?? "-" } }))?.usedAt);
  check("古いパスワードは だめ", (await a.req("POST", "/api/auth/login", { email: A.email, password: A.password })).status === 401);
  check("新しいパスワードで ログイン", (await a.req("POST", "/api/auth/login", { email: A.email, password: "newpassw0rd" })).status === 200);
  await waitForMail(2);
  check("「再設定しました」の お知らせメール", mails().some((m) => m.subject.includes("パスワードを再設定しました")));

  step("暗証番号を忘れた（パスワードで）");
  check("まちがった パスワード → 401", (await a.req("POST", "/api/parent/reset-pin", { password: "wrong-passw0rd", newPin: "9999" })).status === 401);
  check("正しい パスワード → 200", (await a.req("POST", "/api/parent/reset-pin", { password: "newpassw0rd", newPin: "9999" })).status === 200);
  check("そのまま おうちの方エリアに入れる", (await a.req("GET", "/api/auth/me")).body.pinUnlocked === true);

  step("退会");
  check("退会 → 200", (await a.req("DELETE", "/api/parent/account", { password: "newpassw0rd" })).status === 200);
  check("トークンも 残っていない", (await db.authToken.count({ where: { parentId: parent?.id ?? "-" } })) === 0);
}

async function main() {
  const timer = setTimeout(() => {
    console.error(`✖ ${TIMEOUT_SEC}秒を こえたので やめます`);
    cleanup();
    process.exit(1);
  }, TIMEOUT_SEC * 1000);
  timer.unref();
  run("npx", ["prisma", "migrate", "deploy"]);
  console.log(`$ next start -p ${PORT}`);
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { env: { ...env, NODE_ENV: "production" }, stdio: ["ignore", "pipe", "inherit"], shell: isWin });
  try {
    await waitForServer(server);
    await flow();
  } finally {
    cleanup();
    await db.$disconnect();
  }
  console.log(failures === 0 ? "🎉 すべて OK" : `✖ ${failures} 件 失敗`);
  process.exitCode = failures === 0 ? 0 : 1;
}

let server: ChildProcess | null = null;
function cleanup() {
  if (server) {
    if (isWin && server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    else server.kill();
    server = null;
  }
  rmSync(OUTBOX, { recursive: true, force: true });
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
