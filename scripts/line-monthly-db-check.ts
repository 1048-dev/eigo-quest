/**
 * run4 Phase 3（月ごとの学習レポートを LINE で）を「本物の PostgreSQL + next start」で確かめるスクリプト。
 * LINE のサーバーには接続しない（アクセストークンなし = dry-run）。ダミーのチャネルシークレットで webhook の署名を試す。
 *  - webhook: 正しい署名の follow → Parent.lineFriend = true、違う署名 → 401
 *  - npm run line:monthly -- --dry-run --month <今月>: outbox に message.json と PDF、ダウンロード用 URL を表示
 *  - /d/<token>: ページ（お子さまの名前）・PDF（レポート・ワークブック）・知らないトークン・期限切れ
 *  - おうちの方 API: 状態・配信のオン/オフ・「今すぐ送る」（dry-run のリンク）→ すぐもう一度は 429
 *
 *   npx next build
 *   npx tsx scripts/line-monthly-db-check.ts --db postgresql://eigo:eigo@localhost:5544/eigo_quest [--port 3463]
 * ※ テスト用の DB を渡すこと（migrate deploy と seed を実行します）。
 */
import { createHmac } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const arg = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const DB = arg("db");
const PORT = Number(arg("port", "3463"));
if (!DB) {
  console.error("使い方: npx tsx scripts/line-monthly-db-check.ts --db <テスト用 DATABASE_URL> [--port 3463]");
  process.exit(2);
}
const BASE = `http://localhost:${PORT}`;
const WORK = path.join(process.cwd(), ".tmp", "p3-db-check");
const SECRET = "dry-run-channel-secret-not-real";
const env: NodeJS.ProcessEnv = {
  ...process.env,
  DATABASE_URL: DB,
  PORT: String(PORT),
  REPORT_STORAGE_DIR: path.join(WORK, "reports"),
  LINE_OUTBOX_DIR: path.join(WORK, "outbox"),
  LINE_MESSAGING_CHANNEL_SECRET: SECRET,
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "",
  APP_BASE_URL: BASE,
};
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
  cookies = new Map<string, string>();
  async req(method: string, p: string, body?: unknown) {
    const res = await fetch(BASE + p, {
      method,
      redirect: "manual",
      headers: { "content-type": "application/json", origin: BASE, ...(this.cookies.size ? { cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ") } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const i = pair!.indexOf("=");
      const value = pair!.slice(i + 1);
      if (!value || /max-age=0/i.test(c)) this.cookies.delete(pair!.slice(0, i));
      else this.cookies.set(pair!.slice(0, i), value);
    }
    const text = await res.text();
    let json: Record<string, any> = {};
    try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
    return { status: res.status, body: json };
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
const localMonth = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" }).format(new Date());

async function webhook(body: unknown, secret = SECRET) {
  const raw = JSON.stringify(body);
  const sig = createHmac("sha256", secret).update(raw).digest("base64");
  const res = await fetch(`${BASE}/api/line/webhook`, { method: "POST", headers: { "content-type": "application/json", "x-line-signature": sig }, body: raw });
  return res.status;
}

async function flow() {
  const month = localMonth();
  // 1. 保護者（メール）+ お子さま2人。LINE の連携は DB に直接（LINE のサーバーを使わないため）
  const c = new Client();
  const email = `monthly-${Date.now()}@example.com`;
  const reg = await c.req("POST", "/api/auth/register", { email, password: "passw0rd-x", pin: "2468" });
  check("メールで登録", reg.status === 201, reg.body);
  const k1 = await c.req("POST", "/api/children", { nickname: "はる", schoolGrade: 2 });
  const k2 = await c.req("POST", "/api/children", { nickname: "りこ", schoolGrade: 4 });
  check("お子さまを2人追加", k1.status === 201 && k2.status === 201, [k1.body, k2.body]);
  const parent = (await db.parent.findUnique({ where: { email } }))!;
  const lineUserId = "U" + Date.now().toString(16).padStart(32, "0").slice(-32);
  await db.parent.update({ where: { id: parent.id }, data: { lineUserId, lineLinkedAt: new Date() } });
  const day = `${month}-01`;
  for (const n of [1, 2, 3]) {
    await db.lessonProgress.create({ data: { userId: k1.body.child.id, lessonNo: n, status: "COMPLETED", completedOn: day, completedAt: new Date() } });
  }

  // 2. webhook
  const ev = (type: string) => ({ destination: "x", events: [{ type, mode: "active", timestamp: Date.now(), source: { type: "user", userId: lineUserId }, webhookEventId: "e", deliveryContext: { isRedelivery: false } }] });
  check("webhook: 違う署名 → 401", (await webhook(ev("follow"), "wrong-secret")) === 401);
  check("webhook: 違う署名では lineFriend は変わらない", (await db.parent.findUnique({ where: { id: parent.id } }))?.lineFriend === null);
  check("webhook: 検証（events が空）→ 200", (await webhook({ destination: "x", events: [] })) === 200);
  check("webhook: 正しい署名の follow → 200", (await webhook(ev("follow"))) === 200);
  check("webhook: lineFriend = true", (await db.parent.findUnique({ where: { id: parent.id } }))?.lineFriend === true);

  // 3. npm run line:monthly -- --dry-run（1人だけ）
  rmSync(path.join(WORK, "outbox"), { recursive: true, force: true });
  const out = spawnSync("npx", ["tsx", "scripts/line-monthly.ts", "--dry-run", "--parent", parent.id, "--month", month], { env, shell: isWin, encoding: "utf8", timeout: 300_000 });
  const stdout = out.stdout ?? "";
  console.log(stdout.split("\n").map((l) => `    | ${l}`).join("\n"));
  check("line:monthly --dry-run: 終了コード 0", out.status === 0, out.stderr?.slice(-400));
  check("line:monthly --dry-run: dry-run と表示", stdout.includes("dry-run"));
  const urls = [...stdout.matchAll(/(http:\/\/localhost:\d+\/d\/[A-Za-z0-9_-]{43})/g)].map((m) => m[1]!);
  check("line:monthly --dry-run: お子さま2人分のリンク", urls.length === 2, urls);
  const outDirs = existsSync(path.join(WORK, "outbox")) ? readdirSync(path.join(WORK, "outbox")) : [];
  const files = outDirs[0] ? readdirSync(path.join(WORK, "outbox", outDirs[0])) : [];
  check("outbox: message.json と PDF 4つ", files.includes("message.json") && files.filter((f) => f.endsWith(".pdf")).length === 4, files);
  if (outDirs[0]) {
    const msg = JSON.parse(readFileSync(path.join(WORK, "outbox", outDirs[0], "message.json"), "utf8"));
    check("outbox: 宛先は保護者の LINE・Flex のカルーセル", msg.request.body.to === lineUserId && msg.request.body.messages[0].contents.type === "carousel");
  }
  const rows = await db.reportDelivery.findMany({ where: { parentId: parent.id } });
  check("DB: 配信2行（DRY_RUN・30日後に期限切れ）", rows.length === 2 && rows.every((r) => r.status === "DRY_RUN" && r.expiresAt.getTime() > Date.now() + 29 * 86_400_000), rows.map((r) => r.status));

  // 4. /d/<token>
  const token = urls[0]?.split("/d/")[1] ?? "x";
  const page = await fetch(`${BASE}/d/${token}`);
  const html = await page.text();
  check("/d/<token>: 200・お子さまの名前とボタン", page.status === 200 && html.includes("はる") && html.includes(`/d/${token}/report`), page.status);
  check("/d/<token>: noindex", /noindex/.test(html));
  const pdf = await fetch(`${BASE}/d/${token}/report`);
  const pdfBytes = Buffer.from(await pdf.arrayBuffer());
  check("/d/<token>/report: application/pdf・%PDF-", pdf.status === 200 && pdf.headers.get("content-type") === "application/pdf" && pdfBytes.subarray(0, 5).toString() === "%PDF-", pdf.status);
  check("/d/<token>/report: キャッシュしない", (pdf.headers.get("cache-control") ?? "").includes("no-store"));
  const ws = await fetch(`${BASE}/d/${token}/worksheets`);
  const wsBytes = Buffer.from(await ws.arrayBuffer());
  check("/d/<token>/worksheets: ワークブックの PDF", ws.status === 200 && wsBytes.subarray(0, 5).toString() === "%PDF-" && wsBytes.length > 50_000, { status: ws.status, bytes: wsBytes.length });
  const bad = await fetch(`${BASE}/d/${"A".repeat(43)}`);
  check("/d/<知らないトークン>: 「リンクが使えません」", (await bad.text()).includes("リンクが使えません"));
  check("/d/<知らないトークン>/report: 404", (await fetch(`${BASE}/d/${"A".repeat(43)}/report`)).status === 404);
  check("/d/<token>/<ほかのファイル>: 404", (await fetch(`${BASE}/d/${token}/summary`)).status === 404);

  // 5. おうちの方 API
  const st = await c.req("GET", "/api/parent/line-monthly");
  check("GET line-monthly: 連携ずみ・友だち・送信は未設定", st.status === 200 && st.body.status.linked === true && st.body.status.friend === true && st.body.status.messagingConfigured === false, st.body);
  const off = await c.req("PATCH", "/api/parent/line-monthly", { enabled: false });
  check("PATCH line-monthly: 配信オフ", off.status === 200 && off.body.status.enabled === false, off.body);
  const on = await c.req("PATCH", "/api/parent/line-monthly", { enabled: true });
  check("PATCH line-monthly: 配信オン", on.body.status?.enabled === true);
  const send = await c.req("POST", "/api/parent/line-monthly");
  check("POST line-monthly（今すぐ送る）: dry-run とリンク", send.status === 200 && send.body.dryRun === true && send.body.links.length === 2, send.body);
  const link = send.body.links?.[0]?.url as string | undefined;
  check("今すぐ送る のリンクが開ける", !!link && (await fetch(`${BASE}${link}/report`)).status === 200);
  const again = await c.req("POST", "/api/parent/line-monthly");
  check("POST line-monthly をすぐもう一度 → 429", again.status === 429 && again.body.code === "RATE_LIMITED", again.body);
  const cross = await fetch(`${BASE}/api/parent/line-monthly`, { method: "POST", headers: { origin: "https://evil.example", cookie: [...c.cookies].map(([k, v]) => `${k}=${v}`).join("; ") } });
  check("ほかのサイトからの POST → 403", cross.status === 403);

  // 6. 期限切れ
  const tokenRow = rows[0]!;
  await db.reportDelivery.updateMany({ where: { parentId: parent.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  check("期限切れ: /d/<token>/report → 404", (await fetch(`${BASE}/d/${token}/report`)).status === 404, tokenRow.id);

  // 7. 退会で配信も消える（onDelete: Cascade）
  const del = await c.req("DELETE", "/api/parent/account", { password: "passw0rd-x" });
  check("退会", del.status === 200, del.body);
  check("退会: 配信の行も消える", (await db.reportDelivery.count({ where: { parentId: parent.id } })) === 0);
}

async function main() {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
  rmSync(WORK, { recursive: true, force: true });
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: "ignore", shell: isWin });
  try {
    await waitForServer(server);
    await flow();
  } finally {
    if (isWin && server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    else server.kill();
    await db.$disconnect();
  }
  console.log(failures === 0 ? "\nすべて OK" : `\n✖ ${failures} 件の失敗`);
  process.exit(failures === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
