/**
 * run4 Phase 2（LINE ログイン）を「本物の PostgreSQL + next start」で確かめるスクリプト。
 * LINE のサーバーには接続しない（本物のキーが無いため）。ダミーの環境変数で次を確かめる:
 *  - me の lineLoginAvailable（環境変数あり → true）
 *  - start → LINE の認可画面への 302 と、httpOnly の state cookie（Path=/api/auth/line）が本当に付くこと
 *  - callback: state の不一致・キャンセル → 画面へ 303、state cookie が消えること
 *  - link の start（暗証番号入力ずみのメールの保護者）
 *  - LINE だけの保護者（DB に直接作る）: needsPin → 暗証番号を決める → 連携の解除はできない → lineUserId のユニーク制約
 *
 *   npx next build
 *   npx tsx scripts/line-db-check.ts --db postgresql://eigo:eigo@localhost:5544/eigo_quest [--port 3461]
 * ※ テスト用の DB を渡すこと。
 */
import { createHash, randomBytes } from "node:crypto";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { clearRateLimits, installDeadline, timeoutArg, track } from "./lib/checkKit";

// run5 Phase 4: ぜんたいの時間制限（--timeout 秒。既定 600）
installDeadline(timeoutArg(600));

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3461"));
if (!DB) {
  console.error("使い方: npx tsx scripts/line-db-check.ts --db <テスト用 DATABASE_URL> [--port 3461]");
  process.exit(2);
}
const BASE = `http://localhost:${PORT}`;
// ダミーの値（本物のキーではない）。LINE のサーバーには送らない
const env = {
  ...process.env,
  DATABASE_URL: DB,
  DIRECT_URL: DB, // run5 Phase 3 から prisma migrate は DIRECT_URL を使う
  PORT: String(PORT),
  LINE_LOGIN_CHANNEL_ID: "0000000000",
  LINE_LOGIN_CHANNEL_SECRET: "dry-run-not-a-secret",
  LINE_LOGIN_CALLBACK_URL: `${BASE}/api/auth/line/callback`,
};
const isWin = process.platform === "win32";

function run(cmd: string, args: string[]) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { env, stdio: "inherit", shell: isWin, timeout: 300_000 });
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

class Client {
  cookies = new Map<string, string>();
  setCookies: string[] = [];
  header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  async req(method: string, path: string, body?: unknown) {
    const res = await fetch(BASE + path, {
      method,
      redirect: "manual",
      headers: { "content-type": "application/json", origin: BASE, ...(this.cookies.size ? { cookie: this.header() } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    this.setCookies = res.headers.getSetCookie?.() ?? [];
    for (const c of this.setCookies) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i);
      const value = pair.slice(i + 1);
      if (!value || /max-age=0/i.test(c) || /expires=thu, 01 jan 1970/i.test(c)) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
    return { status: res.status, location: res.headers.get("location") ?? "", setCookies: this.setCookies, body: json as Record<string, any> };
  }
}

async function waitForServer(server: ChildProcess) {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode != null) throw new Error("next start exited");
    try {
      if ((await fetch(`${BASE}/api/auth/me`)).ok) return;
    } catch { /* まだ */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server did not start");
}

const db = new PrismaClient({ datasourceUrl: DB });
const pathOf = (loc: string) => { try { const u = new URL(loc, BASE); return u.pathname + u.search; } catch { return loc; } };

async function flow() {
  // 1. 未ログイン: LINE ログインが使える
  const anon = new Client();
  const m0 = await anon.req("GET", "/api/auth/me");
  check("me: lineLoginAvailable = true（ダミーの環境変数あり）", m0.body.lineLoginAvailable === true, m0.body);

  // 2. start → 302 + state cookie
  const s = await anon.req("GET", "/api/auth/line/start?mode=login");
  const authUrl = new URL(s.location || "http://x");
  check("start: 302 で LINE の認可画面へ", s.status === 302 && authUrl.origin === "https://access.line.me", { status: s.status, location: s.location.slice(0, 80) });
  check("start: bot_prompt=aggressive・PKCE S256", authUrl.searchParams.get("bot_prompt") === "aggressive" && authUrl.searchParams.get("code_challenge_method") === "S256");
  const sc = s.setCookies.find((c) => c.startsWith("eq_line_oauth="));
  check("start: state cookie が付く（HttpOnly・Path=/api/auth/line・SameSite=lax）", !!sc && /httponly/i.test(sc) && /path=\/api\/auth\/line/i.test(sc) && /samesite=lax/i.test(sc), s.setCookies);
  check("start: cookie の state と URL の state が同じ", (anon.cookies.get("eq_line_oauth") ?? "").split(".")[1] === authUrl.searchParams.get("state"));

  // 3. callback: state の不一致 → /login?line=state、cookie は消える
  const bad = await anon.req("GET", "/api/auth/line/callback?code=dummy&state=wrong-state-value-000000000");
  check("callback: state 不一致 → 303 /login?line=state", bad.status === 303 && pathOf(bad.location) === "/login?line=state", bad);
  check("callback: state cookie が消える", !anon.cookies.has("eq_line_oauth"), bad.setCookies);
  const parents0 = await db.parent.count({ where: { lineUserId: { not: null } } });
  check("callback: 保護者は作られない", parents0 === 0, parents0);

  // 4. キャンセル
  await anon.req("GET", "/api/auth/line/start?mode=login");
  const st = (anon.cookies.get("eq_line_oauth") ?? "").split(".")[1];
  const cancel = await anon.req("GET", `/api/auth/line/callback?error=access_denied&state=${st}`);
  check("callback: キャンセル → /login?line=canceled", pathOf(cancel.location) === "/login?line=canceled", cancel);

  // 5. メールの保護者 → link の start
  const email = new Client();
  const reg = await email.req("POST", "/api/auth/register", { email: "line-check@example.com", password: "passw0rd-x", pin: "1357" });
  check("メールで登録", reg.status === 201, reg.body);
  const me1 = await email.req("GET", "/api/auth/me");
  check("me: メールの保護者は hasPassword・未連携", me1.body.parent?.hasPassword === true && me1.body.parent?.lineLinked === false && me1.body.parent?.needsPin === false, me1.body);
  const link = await email.req("GET", "/api/auth/line/start?mode=link");
  const linkState = (email.cookies.get("eq_line_oauth") ?? "").split(".");
  const parent = await db.parent.findUnique({ where: { email: "line-check@example.com" } });
  check("link の start: 302 + cookie に保護者 ID", link.status === 302 && linkState[0] === "link" && linkState[4] === parent?.id, { status: link.status, linkState });
  // run4 Phase 4: state cookie は署名つき。書きかえる（ほかの保護者の ID）と 受け付けない（LINE にも問い合わせない）
  const tampered = [...linkState];
  tampered[4] = "someone_else_parent_id";
  email.cookies.set("eq_line_oauth", tampered.join("."));
  const tcb = await email.req("GET", `/api/auth/line/callback?code=dummy&state=${linkState[1]}`);
  check("書きかえた state cookie → 303 /login?line=state", tcb.status === 303 && pathOf(tcb.location) === "/login?line=state", tcb);
  const unl = await email.req("DELETE", "/api/parent/line");
  check("未連携で解除 → 404 NOT_LINKED", unl.status === 404 && unl.body.code === "NOT_LINKED", unl.body);

  // 6. LINE だけの保護者（LINE から戻ったあとの状態を DB に直接作る）
  const lineUserId = "U" + randomBytes(16).toString("hex");
  const lp = await db.parent.create({ data: { lineUserId, lineDisplayName: "テスト", lineLinkedAt: new Date(), settings: {} } });
  const token = randomBytes(32).toString("base64url");
  await db.session.create({ data: { parentId: lp.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 86_400_000) } });
  const lc = new Client();
  lc.cookies.set("eq_session", token);
  const me2 = await lc.req("GET", "/api/auth/me");
  check("me: LINE だけの保護者は needsPin・hasPassword=false・email 空", me2.body.parent?.needsPin === true && me2.body.parent?.hasPassword === false && me2.body.parent?.email === "" && me2.body.parent?.lineLinked === true, me2.body);
  const ov = await lc.req("GET", "/api/parent/overview");
  check("暗証番号を決める前の おうちの方 → 403 PIN_SETUP_REQUIRED", ov.status === 403 && ov.body.code === "PIN_SETUP_REQUIRED", ov.body);
  const pin = await lc.req("POST", "/api/auth/line/pin", { pin: "2468" });
  check("暗証番号を決める → 200", pin.status === 200, pin.body);
  const ov2 = await lc.req("GET", "/api/parent/overview");
  check("決めたあと おうちの方 → 200", ov2.status === 200, ov2.body);
  const pin2 = await lc.req("POST", "/api/auth/line/pin", { pin: "1111" });
  check("2回目 → 409 PIN_ALREADY_SET", pin2.status === 409 && pin2.body.code === "PIN_ALREADY_SET", pin2.body);
  const unl2 = await lc.req("DELETE", "/api/parent/line");
  check("LINE だけの保護者は解除できない → 409 NEEDS_PASSWORD", unl2.status === 409 && unl2.body.code === "NEEDS_PASSWORD", unl2.body);
  const cpw = await lc.req("PATCH", "/api/parent/settings", { changePin: { password: "2468", newPin: "8642" } });
  check("暗証番号の変更（今の暗証番号で確認）→ 200", cpw.status === 200, cpw.body);

  // 7. lineUserId のユニーク制約（DB）
  let unique = false;
  try {
    await db.parent.update({ where: { id: parent!.id }, data: { lineUserId } });
  } catch (e) {
    unique = (e as { code?: string }).code === "P2002";
  }
  check("DB: 同じ lineUserId は2人に付けられない（P2002）", unique);
  const nulls = await db.parent.count({ where: { lineUserId: null } });
  check("DB: lineUserId が null の保護者は何人いてもよい", nulls >= 1, nulls);

  // 8. 退会（LINE だけ → 暗証番号で確認）
  const del = await lc.req("DELETE", "/api/parent/account", { password: "8642" });
  check("LINE だけの保護者の退会（暗証番号で確認）→ 200", del.status === 200, del.body);
}

async function main() {
  run("npx", ["prisma", "migrate", "deploy"]);
  await clearRateLimits(db);
  await db.session.deleteMany({});
  await db.parent.deleteMany({ where: { OR: [{ email: "line-check@example.com" }, { lineUserId: { not: null } }] } });
  const server = track(spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: "ignore", shell: isWin }));
  try {
    await waitForServer(server);
    await flow();
  } finally {
    if (isWin && server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    else server.kill();
    await db.$disconnect();
  }
  console.log(failures === 0 ? "\nすべて OK" : `\n${failures} 件 NG`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
