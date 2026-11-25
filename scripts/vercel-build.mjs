/**
 * Vercel などでの ビルド（npm run vercel-build。vercel.json の buildCommand）。
 *   1. prisma generate
 *   2. prisma migrate deploy（本番だけ。DIRECT_URL を使う）
 *   3. next build
 *
 * マイグレーションを流すのは 次のどちらかのときだけ（プレビューのビルドで 本番の DB を書きかえないように）:
 *   - VERCEL_ENV=production（Vercel の本番デプロイ）
 *   - MIGRATE_ON_BUILD=1（Vercel 以外・プレビュー用の DB を分けているとき）
 * MIGRATE_ON_BUILD=0 なら 本番でも流さない（手で npx prisma migrate deploy する）。
 * それぞれの手順は 進みぐあいを表示し、時間を すぎたら止める。
 */
import { spawn } from "node:child_process";

const STEP_TIMEOUT_MS = { generate: 180_000, migrate: 300_000, build: 1_200_000 };

function run(label, cmd, args, timeoutMs, env = process.env) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    console.log(`▶ ${label}: ${cmd} ${args.join(" ")}`);
    const child = spawn(cmd, args, { stdio: "inherit", env, shell: process.platform === "win32" });
    const tick = setInterval(() => console.log(`… ${label}: ${Math.round((Date.now() - started) / 1000)}秒`), 30_000);
    const timer = setTimeout(() => {
      console.error(`✖ ${label}: ${Math.round(timeoutMs / 1000)}秒を こえたので 止めました`);
      child.kill("SIGTERM");
    }, timeoutMs);
    child.on("error", (e) => { clearInterval(tick); clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearInterval(tick);
      clearTimeout(timer);
      if (code === 0) {
        console.log(`✔ ${label}（${Math.round((Date.now() - started) / 1000)}秒）`);
        resolve();
      } else reject(new Error(`${label} が失敗しました（終了コード ${code}）`));
    });
  });
}

function shouldMigrate(env) {
  const flag = (env.MIGRATE_ON_BUILD ?? "").trim();
  if (flag === "0") return false;
  if (flag === "1") return true;
  return env.VERCEL_ENV === "production";
}

async function main() {
  await run("prisma generate", "npx", ["prisma", "generate"], STEP_TIMEOUT_MS.generate);
  if (shouldMigrate(process.env)) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL が未設定です（マイグレーションできません）");
    const env = { ...process.env, DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL };
    if (!process.env.DIRECT_URL) console.log("⚠ DIRECT_URL が未設定のため DATABASE_URL でマイグレーションします（プール接続だと失敗することがあります）");
    await run("prisma migrate deploy", "npx", ["prisma", "migrate", "deploy"], STEP_TIMEOUT_MS.migrate, env);
  } else {
    console.log("… マイグレーションは しません（本番デプロイではない・または MIGRATE_ON_BUILD=0）");
  }
  await run("next build", "npx", ["next", "build"], STEP_TIMEOUT_MS.build);
}

main().catch((e) => {
  console.error(`✖ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
