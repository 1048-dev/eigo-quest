/**
 * 「DB が止まっている」状態でのスモークテストを 1コマンドで行う。
 *   next start を つながらない DATABASE_URL で起動 → scripts/smoke.ts を実行 → サーバーを止める
 *
 *   npx next build
 *   npx tsx scripts/smoke-offline.ts [保存先ディレクトリ] [--port 3100]
 *   （= npm run smoke:offline -- docs/run3/screens/p4-smoke）
 */
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";

const args = process.argv.slice(2);
const pi = args.indexOf("--port");
const WANT_PORT = pi >= 0 ? Number(args[pi + 1]) : 3100;
const out = args.find((a, i) => !a.startsWith("--") && (pi < 0 || i !== pi + 1));
let PORT = WANT_PORT;
let BASE = `http://localhost:${PORT}`;

/** そのポートで もう だれかが 待ち受けているか（前の スモークの 消しわすれの next start など） */
function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once("error", () => resolve(true));
    srv.once("listening", () => srv.close(() => resolve(false)));
    srv.listen(port);
  });
}
const isWin = process.platform === "win32";
// だれも待ち受けていないポート（= DB 停止）。connect_timeout で すぐ あきらめる
// cron の合い言葉は このスモーク用の使いすての値（サーバーと smoke.ts の両方に渡して 401 / 正しい値 の両方を確かめる）
const CRON = `smoke-${Math.random().toString(36).slice(2)}-${Date.now()}`;
const env = {
  ...process.env,
  DATABASE_URL: "postgresql://eigo:eigo@127.0.0.1:5999/eigo_quest?schema=public&connect_timeout=2",
  DIRECT_URL: "postgresql://eigo:eigo@127.0.0.1:5999/eigo_quest?schema=public&connect_timeout=2",
  NODE_ENV: "production" as const,
  CRON_SECRET: CRON,
  // LINE・メールの本物の値は 渡さない（未設定のときの動きを確かめる）
  LINE_LOGIN_CHANNEL_ID: "", LINE_LOGIN_CHANNEL_SECRET: "", LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "", LINE_MESSAGING_CHANNEL_SECRET: "",
};
/** ぜんたいの時間制限（smoke.ts 自身も 25分で終わる。これは サーバーの起動待ちも ふくめた 最後の安全網） */
const TOTAL_TIMEOUT_MS = 30 * 60_000;

async function main() {
  // 古い サーバー（べつの ビルド）が のこっていると、それに つないで しまい「CSS・JS が text/html」などの
  // にせの 失敗に なる。あいている ポートを さがして 自分で 起動した サーバーだけを ためす
  while (await portInUse(PORT)) {
    if (PORT - WANT_PORT >= 20) throw new Error(`ポート ${WANT_PORT}〜${PORT} が ぜんぶ 使用中`);
    console.log(`  ポート ${PORT} は 使用中（古い サーバー？）→ ${PORT + 1} を ためす`);
    PORT += 1;
  }
  BASE = `http://localhost:${PORT}`;
  console.log(`$ next start -p ${PORT}（DB 停止）`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: ["ignore", "inherit", "inherit"], shell: isWin });
  let code = 1;
  try {
    for (let i = 0; ; i++) {
      if (server.exitCode != null) throw new Error("next start exited");
      if (i > 60) throw new Error("server did not start（60秒）");
      if (i > 0 && i % 10 === 0) console.log(`  …サーバーの起動を待っています（${i}秒）`);
      try {
        if ((await fetch(`${BASE}/api/auth/me`)).ok) break;
      } catch { /* まだ */ }
      await new Promise((r) => setTimeout(r, 1000));
    }
    // 応答したのが 自分の サーバーか（すぐ 落ちていたら べつの プロセスが こたえている）
    await new Promise((r) => setTimeout(r, 1500));
    if (server.exitCode != null) throw new Error("next start exited（ポートを べつの プロセスが 使っている？）");
    console.log(`サーバー起動 OK → スモーク（最長 ${TOTAL_TIMEOUT_MS / 60_000} 分）`);
    const r = spawnSync("npx", ["tsx", "scripts/smoke.ts", BASE, ...(out ? [out] : [])], {
      stdio: "inherit", shell: isWin, timeout: TOTAL_TIMEOUT_MS,
      env: { ...process.env, SMOKE_CRON_SECRET: CRON },
    });
    if (r.error) console.error(`✖ スモークが とちゅうで終わりました（${r.error.message}）`);
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
