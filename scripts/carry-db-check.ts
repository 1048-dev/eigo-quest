/**
 * run4 Phase 1 を「本物の PostgreSQL + next start」で確かめるスクリプト（おためしの ひきつぎ・アバター）。
 *
 *   npx next build
 *   npx tsx scripts/carry-db-check.ts --db postgresql://postgres:pw@localhost:5544/eq_check [--port 3458]
 *
 * 1. prisma migrate deploy → seed
 * 2. next start
 * 3. ログインなしで レッスン1 → trial:true（run5: この端末の おためし学習者に記録。デモユーザーは かわらない）
 *    → 登録・子ども追加（アバター）→ 選ぶ → この端末の おためしの きろくを ひきつぐ → 子どもの マップ・コインに反映
 *    → 2回目は alreadyCarried → デモユーザーの きろくは のこっている → ほかの家の子どもには ひきつげない
 *    → 子どもが じぶんで アバターを かえる → ようすにも出る → 退会
 * ※ テスト用の DB を渡すこと。
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3458"));
if (!DB) {
  console.error("使い方: npx tsx scripts/carry-db-check.ts --db <テスト用 DATABASE_URL> [--port 3458]");
  process.exit(2);
}
const env = { ...process.env, DATABASE_URL: DB, SKIP_DAILY_LOCK: "1", PORT: String(PORT) };
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
  async req(method: string, path: string, body?: unknown) {
    const res = await fetch(BASE + path, {
      method,
      headers: { "content-type": "application/json", origin: BASE, ...(this.cookie ? { cookie: this.cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [name, value] = pair.split("=");
      if (name === "eq_session") this.cookie = value ? `eq_session=${value}` : "";
    }
    const text = await res.text();
    let json: Record<string, unknown> = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text.slice(0, 200) }; }
    return { status: res.status, body: json as Record<string, any> };
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

async function flow() {
  const stamp = Date.now();
  const anon = new Client();
  const a = new Client();
  const b = new Client();

  // おためしモードで レッスン1（run5: 端末ごとの おためし学習者。デモユーザーには 書かない）
  const demoBefore = await db.lessonProgress.count({ where: { userId: "demo-user" } });
  const demoCoinsBefore = (await db.user.findUnique({ where: { id: "demo-user" } }))?.coins;
  const trialsBefore = await db.user.count({ where: { isTrial: true } });
  const t1 = await anon.req("POST", "/api/lessons/1/complete", { quizScore: 1, logs: [] });
  check("ログインなしの レッスン1 → trial:true（この端末の おためし学習者）", t1.status === 200 && t1.body.ok === true && t1.body.trial === true, t1.body);
  check("おためし学習者が 1人 ふえる", (await db.user.count({ where: { isTrial: true } })) === trialsBefore + 1);
  const trialCoins = Number(t1.body.reward?.total ?? 0);

  // 登録・子ども（アバターつき）
  check("登録", (await a.req("POST", "/api/auth/register", { email: `run4-a-${stamp}@example.com`, password: "passw0rd-a", pin: "1111" })).status === 201);
  const c1 = await a.req("POST", "/api/children", { nickname: "タロウ", schoolGrade: 3, avatarCharacter: "kiko" });
  check("子ども追加（アバター kiko）", c1.status === 201 && c1.body.child?.avatarCharacter === "kiko", c1.body);
  const c2 = await a.req("POST", "/api/children", { nickname: "ハナコ", schoolGrade: 1 });
  check("2人目は えらばなければ かぶらない顔（haru）", c2.body.child?.avatarCharacter === "haru", c2.body);
  const kid = c1.body.child.id as string;
  check("子どもを選ぶ", (await a.req("POST", `/api/children/${kid}/select`)).status === 200);
  const done = await a.req("POST", "/api/lessons/1/complete", { quizScore: 1, logs: [] });
  check("ログイン中は trial:false", done.body.trial === false, done.body);

  // ひきつぎ
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  const trial = { trialId: `run4check${stamp}`, lessons: { 1: today, 2: today }, tests: {}, coins: trialCoins + 15, studyDates: [today], items: {} };
  const coinsBefore = (await db.user.findUnique({ where: { id: kid } }))!.coins;
  const r = await a.req("POST", `/api/children/${kid}/carry-over`, trial);
  check("ひきつぎ → ok・レッスン2だけ たす（1はもうクリア）", r.status === 200 && r.body.alreadyCarried === false && r.body.carried?.lessons === 1, r.body);
  const coinsAfter = (await db.user.findUnique({ where: { id: kid } }))!.coins;
  check("コインは たし算", coinsAfter === coinsBefore + trial.coins, { coinsBefore, coinsAfter, add: trial.coins });
  const map = await a.req("GET", "/api/map");
  const n2 = (map.body.nodes ?? []).find((x: any) => x.type === "LESSON" && x.lessonNo === 2);
  check("子どもの マップで レッスン2 が クリア", n2?.status === "CLEARED", n2);
  const again = await a.req("POST", `/api/children/${kid}/carry-over`, trial);
  check("2回目は alreadyCarried（コインは ふえない）", again.body.alreadyCarried === true && (await db.user.findUnique({ where: { id: kid } }))!.coins === coinsAfter, again.body);
  check("デモユーザーの きろくは そのまま（コピー）", (await db.lessonProgress.count({ where: { userId: "demo-user" } })) === demoBefore && (await db.user.findUnique({ where: { id: "demo-user" } }))?.coins === demoCoinsBefore);

  // ほかの家
  check("2家族目 登録", (await b.req("POST", "/api/auth/register", { email: `run4-b-${stamp}@example.com`, password: "passw0rd-b", pin: "2222" })).status === 201);
  const evil = await b.req("POST", `/api/children/${kid}/carry-over`, { ...trial, trialId: `run4other${stamp}` });
  check("ほかの家の子どもには ひきつげない（404）", evil.status === 404, evil.body);
  const evilAv = await b.req("PATCH", `/api/children/${kid}/avatar`, { avatarCharacter: "birimo" });
  check("ほかの家の子どもの顔は かえられない（404）", evilAv.status === 404, evilAv.body);

  // アバターの かえ
  const av = await a.req("PATCH", `/api/children/${kid}/avatar`, { avatarCharacter: "birimo" });
  check("子どもが じぶんで 顔を かえる", av.status === 200 && av.body.child?.avatarCharacter === "birimo", av.body);
  const me = await a.req("GET", "/api/auth/me");
  check("me に えらんだ顔", me.body.children?.[0]?.avatarCharacter === "birimo", me.body.children);
  const ov = await a.req("GET", "/api/parent/overview");
  check("ようすにも えらんだ顔", ov.body.children?.[0]?.avatarCharacter === "birimo", ov.body.children?.[0]);

  await a.req("DELETE", "/api/parent/account", { password: "passw0rd-a" });
  await b.req("DELETE", "/api/parent/account", { password: "passw0rd-b" });
  check("退会で ひきつぎの台帳も消える", (await db.coinLedger.count({ where: { userId: kid } })) === 0);
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
    await db.$disconnect();
  }
  console.log(failures === 0 ? "🎉 すべて OK" : `✖ ${failures} 件 失敗`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
