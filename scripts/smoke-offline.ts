/**
 * 「DB が止まっている」状態でのスモークテストを 1コマンドで行う。
 *   next start を つながらない DATABASE_URL で起動 → scripts/smoke.ts を実行 → サーバーを止める
 *
 *   npx next build
 *   npx tsx scripts/smoke-offline.ts [保存先ディレクトリ] [--port 3100]
 *   （= npm run smoke:offline -- docs/run3/screens/p4-smoke）
 */
import { spawn, spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const pi = args.indexOf("--port");
const PORT = pi >= 0 ? Number(args[pi + 1]) : 3100;
const out = args.find((a, i) => !a.startsWith("--") && (pi < 0 || i !== pi + 1));
const BASE = `http://localhost:${PORT}`;
const isWin = process.platform === "win32";
// だれも待ち受けていないポート（= DB 停止）。connect_timeout で すぐ あきらめる
const env = { ...process.env, DATABASE_URL: "postgresql://eigo:eigo@127.0.0.1:5999/eigo_quest?schema=public&connect_timeout=2", NODE_ENV: "production" as const };

async function main() {
  console.log(`$ next start -p ${PORT}（DB 停止）`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: ["ignore", "inherit", "inherit"], shell: isWin });
  let code = 1;
  try {
    for (let i = 0; ; i++) {
      if (server.exitCode != null) throw new Error("next start exited");
      if (i > 60) throw new Error("server did not start");
      try {
        if ((await fetch(`${BASE}/api/auth/me`)).ok) break;
      } catch { /* まだ */ }
      await new Promise((r) => setTimeout(r, 1000));
    }
    const r = spawnSync("npx", ["tsx", "scripts/smoke.ts", BASE, ...(out ? [out] : [])], { stdio: "inherit", shell: isWin, env: process.env });
    code = r.status ?? 1;
  } finally {
    if (isWin && server.pid) spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    else server.kill();
  }
  process.exitCode = code;
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
