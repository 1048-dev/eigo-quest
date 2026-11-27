/**
 * run10: 確認用の 使いすての PostgreSQL（ポート 5544）。
 *  1. Docker が 使えれば postgres:16 の コンテナ（名前 eq-check-db・--rm）
 *  2. Docker が 使えなければ npm の embedded-postgres（devDependency。.tmp/check-pg に データ）
 * ポート 5432 は ほかの プロジェクトの DB なので ぜったいに さわらない（CHECK_DB_PORT は 5432 を こばむ）。
 *
 *   const db = await startCheckDb();   // { url, kind, stop() }
 *   ...
 *   await db.stop();
 */
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { isWin } from "./checkKit";

export const CHECK_DB_PORT = 5544;
export const CHECK_DB_CONTAINER = "eq-check-db";
const USER = "eigo";
const PASSWORD = "eigo";
const DBNAME = "eigo_check";

export interface CheckDb { url: string; kind: "docker" | "embedded" | "external"; stop: () => Promise<void> }

export function checkDbUrl(port = CHECK_DB_PORT): string {
  if (port === 5432) throw new Error("ポート 5432 は ほかの プロジェクトの DB です（つかわない）");
  return `postgresql://${USER}:${PASSWORD}@127.0.0.1:${port}/${DBNAME}?schema=public`;
}

/** URL が 5432 を さしていたら こばむ（ほかの プロジェクトの DB を こわさない） */
export function assertSafeDbUrl(url: string) {
  let port = "";
  try { port = new URL(url).port || "5432"; } catch { throw new Error("DATABASE_URL の かたちが ちがう"); }
  if (port === "5432") throw new Error("ポート 5432 の DB は ほかの プロジェクトのもの。確認には 5544 を つかう");
}

function portOpen(port: number, ms = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const s = createConnection({ host: "127.0.0.1", port });
    const done = (v: boolean) => { s.destroy(); resolve(v); };
    s.setTimeout(ms, () => done(false));
    s.once("connect", () => done(true));
    s.once("error", () => done(false));
  });
}

const sh = (cmd: string, args: string[], timeout = 60_000) => spawnSync(cmd, args, { encoding: "utf8", timeout, shell: false });

function dockerWorks(): boolean {
  const r = sh("docker", ["info", "--format", "{{.ServerVersion}}"], 20_000);
  return r.status === 0 && !!r.stdout.trim();
}

/** コンテナの 中の postgres が 接続を うけつけるまで まつ */
async function waitDockerReady(maxSec: number) {
  for (let i = 0; i < maxSec; i++) {
    const r = sh("docker", ["exec", CHECK_DB_CONTAINER, "pg_isready", "-U", USER, "-d", DBNAME, "-h", "127.0.0.1"], 10_000);
    if (r.status === 0 && (await portOpen(CHECK_DB_PORT))) return;
    if (i > 0 && i % 10 === 0) console.log(`  …PostgreSQL の 起動を まっています（${i}秒）`);
    await new Promise((res) => setTimeout(res, 1000));
  }
  throw new Error(`PostgreSQL が ${maxSec}秒で 起動しなかった`);
}

async function startDocker(): Promise<CheckDb> {
  const running = sh("docker", ["ps", "-q", "--filter", `name=^${CHECK_DB_CONTAINER}$`]).stdout.trim();
  if (running) {
    console.log(`  前の ${CHECK_DB_CONTAINER} が のこっていたので 止めて つくりなおす`);
    sh("docker", ["rm", "-f", CHECK_DB_CONTAINER]);
  }
  if (await portOpen(CHECK_DB_PORT)) throw new Error(`ポート ${CHECK_DB_PORT} を ほかの なにかが つかっている`);
  console.log(`$ docker run --rm -d --name ${CHECK_DB_CONTAINER} -p ${CHECK_DB_PORT}:5432 postgres:16`);
  const r = sh("docker", ["run", "--rm", "-d", "--name", CHECK_DB_CONTAINER, "-p", `${CHECK_DB_PORT}:5432`,
    "-e", `POSTGRES_USER=${USER}`, "-e", `POSTGRES_PASSWORD=${PASSWORD}`, "-e", `POSTGRES_DB=${DBNAME}`, "postgres:16"], 300_000);
  if (r.status !== 0) throw new Error(`docker run に 失敗: ${(r.stderr || r.stdout).trim().slice(0, 300)}`);
  await waitDockerReady(90);
  // pg_isready の あと、初期化の とちゅうで 1回 再起動するので すこし まって もう一度
  await new Promise((res) => setTimeout(res, 1500));
  await waitDockerReady(60);
  return {
    url: checkDbUrl(),
    kind: "docker",
    stop: async () => { sh("docker", ["rm", "-f", CHECK_DB_CONTAINER], 60_000); },
  };
}

async function startEmbedded(): Promise<CheckDb> {
  let mod: { default: new (o: Record<string, unknown>) => { initialise(): Promise<void>; start(): Promise<void>; stop(): Promise<void>; createDatabase(n: string): Promise<void> } };
  try {
    mod = await import("embedded-postgres" as string);
  } catch {
    throw new Error("Docker が つかえず、embedded-postgres も 入っていない（npm i -D embedded-postgres@16）");
  }
  if (await portOpen(CHECK_DB_PORT)) throw new Error(`ポート ${CHECK_DB_PORT} を ほかの なにかが つかっている`);
  const dir = path.resolve(process.cwd(), ".tmp", "check-pg");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(path.dirname(dir), { recursive: true });
  console.log(`$ embedded-postgres（ポート ${CHECK_DB_PORT}・${path.relative(process.cwd(), dir)}）`);
  const pg = new mod.default({ databaseDir: dir, user: USER, password: PASSWORD, port: CHECK_DB_PORT, persistent: false, onLog: () => {} });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase(DBNAME);
  return {
    url: checkDbUrl(),
    kind: "embedded",
    stop: async () => { await pg.stop().catch(() => {}); rmSync(dir, { recursive: true, force: true }); },
  };
}

/**
 * 確認用の DB を 起動する。CHECK_DB_URL が あれば それを つかう（起動・停止は しない）。
 * CHECK_DB=embedded で Docker を つかわない。
 */
export async function startCheckDb(): Promise<CheckDb> {
  if (process.env.CHECK_DB_URL) {
    assertSafeDbUrl(process.env.CHECK_DB_URL);
    return { url: process.env.CHECK_DB_URL, kind: "external", stop: async () => {} };
  }
  if (process.env.CHECK_DB !== "embedded" && dockerWorks()) return startDocker();
  console.log("  Docker が つかえないので embedded-postgres を つかう");
  return startEmbedded();
}

/** prisma migrate deploy（＋ seed）。テスト用の DB にだけ つかう */
export function prepareCheckDb(url: string, opts: { seed?: boolean } = {}) {
  assertSafeDbUrl(url);
  const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
  const step = (args: string[], timeout: number) => {
    console.log(`$ npx ${args.join(" ")}`);
    const r = spawnSync("npx", args, { env, stdio: "inherit", shell: isWin, timeout });
    if (r.status !== 0) throw new Error(`npx ${args.join(" ")} に 失敗（${r.status ?? r.signal ?? r.error?.message}）`);
  };
  step(["prisma", "migrate", "deploy"], 180_000);
  if (opts.seed !== false) step(["tsx", "prisma/seed.ts"], 300_000);
}
