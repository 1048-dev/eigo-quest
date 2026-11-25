/**
 * 本物の DB で確かめるスクリプト（*-check.ts）の共通の部品（run5 Phase 4）。
 *  - run(): コマンドを 時間制限つきで実行（既定 180秒）。とちゅうで止まったら 失敗にする
 *  - startServer() / stopServer(): next start（標準出力は 読まないので すてる = パイプが いっぱいで止まらない）
 *  - waitForServer(): 起動を 最長60秒まつ（10秒ごとに 進みぐあいを表示）
 *  - installDeadline(): スクリプト ぜんたいの時間制限（こえたら あとかたづけして 終了コード 1）
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";

export const isWin = process.platform === "win32";

export function run(cmd: string, args: string[], env: NodeJS.ProcessEnv, timeoutMs = 180_000) {
  console.log(`$ ${cmd} ${args.join(" ")}`);
  const started = Date.now();
  const r = spawnSync(cmd, args, { env, stdio: "inherit", shell: isWin, timeout: timeoutMs });
  if (r.error && /ETIMEDOUT/.test(String((r.error as NodeJS.ErrnoException).code ?? r.error.message))) {
    throw new Error(`${cmd} ${args[0]} が ${Math.round(timeoutMs / 1000)}秒で 終わりませんでした`);
  }
  if (r.status !== 0) throw new Error(`${cmd} ${args[0]} failed (${r.status ?? r.signal})`);
  console.log(`  （${((Date.now() - started) / 1000).toFixed(1)}秒）`);
}

export function startServer(port: number, env: NodeJS.ProcessEnv): ChildProcess {
  console.log(`$ next start -p ${port}`);
  return spawn("npx", ["next", "start", "-p", String(port)], { env: { ...env, NODE_ENV: "production" }, stdio: ["ignore", "ignore", "inherit"], shell: isWin });
}

export function stopServer(server: ChildProcess | null) {
  if (!server || server.exitCode != null) return;
  if (isWin && server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore", timeout: 30_000 });
  else server.kill();
}

export async function waitForServer(server: ChildProcess, base: string, maxSec = 60) {
  for (let i = 0; i < maxSec; i++) {
    if (server.exitCode != null) throw new Error("next start exited");
    try {
      if ((await fetch(`${base}/api/auth/me`, { signal: AbortSignal.timeout(5_000) })).ok) {
        console.log(`  サーバー起動 OK（${i}秒）`);
        return;
      }
    } catch { /* まだ */ }
    if (i > 0 && i % 10 === 0) console.log(`  サーバーの起動を まっています…（${i}秒）`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`server did not start（${maxSec}秒）`);
}

const tracked = new Set<ChildProcess>();
/** 時間切れのときに止める サーバーとして おぼえておく（自前で spawn している古いスクリプト用） */
export function track<T extends ChildProcess>(server: T): T {
  tracked.add(server);
  return server;
}

/** ぜんたいの時間制限。こえたら cleanup() と おぼえておいた サーバーの停止のあと 終了コード 1 */
export function installDeadline(sec: number, cleanup: () => void = () => {}) {
  const t = setTimeout(() => {
    console.error(`✖ ${sec}秒を こえたので やめます`);
    try { cleanup(); } catch { /* つづけて終わる */ }
    for (const s of tracked) stopServer(s);
    process.exit(1);
  }, sec * 1000);
  t.unref();
  return t;
}

/**
 * テスト用の DB の レート制限の数を 0 にする（run5 Phase 3 から 回数は DB の RateLimitBucket に のこるので、
 * 同じ DB で 確認を くりかえすと 登録・ログインが 429 になる）。テスト用の DB にだけ使うこと。
 */
export async function clearRateLimits(db: { rateLimitBucket: { deleteMany: () => Promise<{ count: number }> } }) {
  const r = await db.rateLimitBucket.deleteMany();
  console.log(`  レート制限の数を リセット（${r.count} 行）`);
}

/** --timeout <秒>（30〜3600。既定 def） */
export function timeoutArg(def: number): number {
  const i = process.argv.indexOf("--timeout");
  const v = i >= 0 ? Number(process.argv[i + 1]) : def;
  return Math.min(3600, Math.max(30, Number.isFinite(v) ? v : def));
}
