/**
 * 保護者アカウントを「本物の PostgreSQL + next start」で通しで確かめるスクリプト。
 *
 *   npx next build
 *   npx tsx scripts/auth-db-check.ts --db postgresql://eigo:eigo@localhost:5544/eigo_quest?schema=public [--port 3457]
 *
 * 1. prisma migrate deploy → seed（SEED_DEMO_PARENT=1）
 * 2. next start を指定ポートで起動
 * 3. 登録 → 子ども追加 → 選ぶ → レッスン完了 → ようす → 回数制限 → 持ち主チェック → パスワード変更 → 退会 を HTTP で確認
 * ※ テスト用の DB を渡すこと（保護者・子どもを作って消す）。
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3457"));
if (!DB) {
  console.error("使い方: npx tsx scripts/auth-db-check.ts --db <テスト用 DATABASE_URL> [--port 3457]");
  process.exit(2);
}
const env = { ...process.env, DATABASE_URL: DB, SEED_DEMO_PARENT: "1", SKIP_DAILY_LOCK: "1", PORT: String(PORT) };
const BASE = `http://localhost:${PORT}`;
const isWin = process.platform === "win32";

function run(cmd: string, args: string[]) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { env, stdio: "inherit", shell: isWin });
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
  cookie = "";
  async req(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(BASE + path, {
      method,
      headers: { "content-type": "application/json", origin: BASE, ...(this.cookie ? { cookie: this.cookie } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = res.headers.getSetCookie?.() ?? [];
    for (const c of set) {
      const [pair] = c.split(";");
      const [name, value] = pair.split("=");
      if (name === "eq_session") this.cookie = value ? `eq_session=${value}` : "";
    }
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text.slice(0, 200) }; }
    return { status: res.status, body: json as Record<string, any>, setCookie: set.join("\n") };
  }
}

async function waitForServer(server: ChildProcess) {
  for (let i = 0; i < 60; i++) {
    if (server.exitCode != null) throw new Error("next start exited");
    try {
      const r = await fetch(`${BASE}/api/auth/me`);
      if (r.ok) return;
    } catch { /* まだ */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("server did not start");
}

async function flow() {
  const stamp = Date.now();
  const A = { email: `run3-a-${stamp}@example.com`, password: "passw0rd-a", pin: "1111" };
  const B = { email: `run3-b-${stamp}@example.com`, password: "passw0rd-b", pin: "2222" };
  const a = new Client();
  const b = new Client();
  const anon = new Client();

  const me0 = await anon.req("GET", "/api/auth/me");
  check("未ログインの me → loggedIn:false", me0.status === 200 && me0.body.loggedIn === false, me0.body);
  const map0 = await anon.req("GET", "/api/map");
  check("未ログインでもマップが見られる（おためしモード）", map0.status === 200 && map0.body.success === true, map0.body);

  const evil = await anon.req("POST", "/api/auth/register", A, { origin: "https://evil.example" });
  check("ほかのサイトからの登録は 403", evil.status === 403, evil.body);

  const reg = await a.req("POST", "/api/auth/register", A);
  check("登録 → 201", reg.status === 201, reg.body);
  check("cookie は HttpOnly・SameSite=Lax・Secure（本番モード）", /HttpOnly/i.test(reg.setCookie) && /SameSite=Lax/i.test(reg.setCookie) && /Secure/i.test(reg.setCookie), reg.setCookie.replace(/eq_session=[^;]+/, "eq_session=***"));
  const dup = await anon.req("POST", "/api/auth/register", { ...A, email: A.email.toUpperCase() });
  check("同じメールは 409", dup.status === 409, dup.body);

  const c1 = await a.req("POST", "/api/children", { nickname: "タロウ", schoolGrade: 3 });
  check("子ども追加 → 201", c1.status === 201, c1.body);
  const childId = c1.body.child?.id as string;
  const sel = await a.req("POST", `/api/children/${childId}/select`);
  check("子どもを選ぶ", sel.status === 200, sel.body);

  const lesson = await a.req("GET", "/api/lessons/1");
  check("レッスン1を開ける", lesson.status === 200 && !lesson.body.offline, { status: lesson.status, offline: lesson.body.offline });
  const done = await a.req("POST", "/api/lessons/1/complete", { quizScore: 1, logs: [] });
  check("レッスン1完了（DB に記録・コイン）", done.status === 200 && done.body.ok === true && !done.body.offline && (done.body.reward?.total ?? 0) > 0, done.body);

  const ov = await a.req("GET", "/api/parent/overview");
  const row = ov.body.children?.[0];
  check("ようす: レッスン1・連続1日・コイン>0", ov.status === 200 && row?.lessonsDone === 1 && row?.streakDays === 1 && row?.coins > 0, ov.body);
  check("ようす: にがて3つ", Array.isArray(row?.weakestSkills) && row.weakestSkills.length === 3, row);

  const lim = await a.req("PATCH", "/api/parent/settings", { dailyLessonLimit: { childId, limit: 1 } });
  check("回数制限を 1 に", lim.status === 200 && lim.body.settings?.dailyLessonLimits?.[childId] === 1, lim.body);
  const blocked = await a.req("GET", "/api/lessons/2");
  check("きょうはもう新しいレッスンを開けない（DAILY_LIMIT）", blocked.status === 403 && blocked.body.code === "DAILY_LIMIT", blocked.body);
  const replay = await a.req("GET", "/api/lessons/1");
  check("おさらいは開ける", replay.status === 200, replay.status);

  await b.req("POST", "/api/auth/register", B);
  const steal = [
    await b.req("POST", `/api/children/${childId}/select`),
    await b.req("PATCH", `/api/children/${childId}`, { nickname: "のっとり" }),
    await b.req("DELETE", `/api/children/${childId}`),
    await b.req("PATCH", "/api/parent/settings", { dailyLessonLimit: { childId, limit: null } }),
  ];
  check("B は A の子どもを選べない・変えられない・消せない・設定できない（すべて 404）", steal.every((r) => r.status === 404), steal.map((r) => r.status));
  const bOv = await b.req("GET", "/api/parent/overview");
  check("B のようすに A の子どもは出ない", bOv.status === 200 && (bOv.body.children ?? []).length === 0, bOv.body);

  const out = await a.req("POST", "/api/auth/logout");
  check("ログアウト", out.status === 200 && a.cookie === "", out.body);
  const bad = await a.req("POST", "/api/auth/login", { email: A.email, password: "wrong-pass1" });
  const none = await a.req("POST", "/api/auth/login", { email: `nobody-${stamp}@example.com`, password: "wrong-pass1" });
  check("ログイン失敗は同じ文言", bad.status === 401 && none.status === 401 && bad.body.messageJa === none.body.messageJa, [bad.body, none.body]);
  const inn = await a.req("POST", "/api/auth/login", { email: A.email, password: A.password });
  check("ログイン", inn.status === 200, inn.body);
  const locked = await a.req("GET", "/api/parent/overview");
  check("ログイン直後は PIN が必要", locked.status === 403 && locked.body.code === "PIN_REQUIRED", locked.body);
  const pin = await a.req("POST", "/api/parent/verify-pin", { pin: A.pin });
  check("PIN で開く", pin.status === 200, pin.body);

  const chpw = await a.req("PATCH", "/api/parent/settings", { changePassword: { currentPassword: A.password, newPassword: "newpass99" } });
  check("パスワード変更", chpw.status === 200, chpw.body);
  const me1 = await a.req("GET", "/api/auth/me");
  check("変更後もこの端末はログインしたまま", me1.body.loggedIn === true, me1.body);

  const del = await a.req("DELETE", "/api/parent/account", { password: "newpass99" });
  check("退会", del.status === 200, del.body);
  const me2 = await a.req("GET", "/api/auth/me");
  check("退会後は未ログイン", me2.body.loggedIn === false, me2.body);
  const relog = await anon.req("POST", "/api/auth/login", { email: A.email, password: "newpass99" });
  check("退会したアカウントではログインできない", relog.status === 401, relog.body);

  await b.req("DELETE", "/api/parent/account", { password: B.password });
}

async function main() {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
  console.log(`$ next start -p ${PORT}`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env: { ...env, NODE_ENV: "production" }, stdio: ["ignore", "pipe", "inherit"], shell: isWin });
  try {
    await waitForServer(server);
    await flow();
  } finally {
    if (isWin && server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    else server.kill();
  }
  console.log(failures === 0 ? "🎉 すべて OK" : `✖ ${failures} 件 失敗`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
