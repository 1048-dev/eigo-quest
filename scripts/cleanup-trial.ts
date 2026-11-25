/**
 * つかわれなくなった おためし学習者（端末ごとの おためし User）を 消す。1日1回 cron などで 実行する想定。
 *
 *   npm run trial:cleanup                 # 60日 つかわれていない おためし学習者を 消す
 *   npm run trial:cleanup -- --dry-run    # 消さずに 数だけ 表示
 *   npm run trial:cleanup -- --days 90    # 日数を かえる（7 以上）
 *   npm run trial:cleanup -- --timeout 300  # 何秒で やめるか（既定 600秒。とちゅうで やめても 次の実行で つづきを消す）
 *
 * cron の例（毎日 4:30。サーバーのタイムゾーン）:
 *   30 4 * * *  cd /path/to/app && npm run trial:cleanup >> /var/log/eigo-quest-trial-cleanup.log 2>&1
 * Vercel などでは「Cron Jobs」や 外部の スケジューラから 同じコマンドを 実行する（README 参照）。
 */
import { existsSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const has = (name: string) => argv.includes(`--${name}`);
const arg = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

if (has("help") || has("h")) {
  console.log("使い方: npm run trial:cleanup [-- --dry-run] [-- --days 60] [-- --timeout 600]");
  process.exit(0);
}

const envFile = path.join(process.cwd(), ".env");
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    /* 古い Node では読まない（環境変数を直接わたす） */
  }
}

async function main(): Promise<number> {
  const daysArg = arg("days");
  const days = daysArg === undefined ? undefined : Number(daysArg);
  if (days !== undefined && (!Number.isInteger(days) || days < 7 || days > 3650)) {
    console.error(`--days は 7〜3650 の整数で指定してください: ${daysArg}`);
    return 2;
  }
  const timeoutArg = arg("timeout");
  const timeoutSec = timeoutArg === undefined ? 600 : Number(timeoutArg);
  if (!Number.isFinite(timeoutSec) || timeoutSec <= 0) {
    console.error(`--timeout は 秒数（正の数）で指定してください: ${timeoutArg}`);
    return 2;
  }
  const started = Date.now();
  const deadline = started + timeoutSec * 1000;
  // 全体の安全装置: 時間を すぎても 終わらなければ 強制終了
  const killer = setTimeout(() => {
    console.error(`⏱ ${timeoutSec + 30}秒を こえたので 中止しました。`);
    process.exit(3);
  }, (timeoutSec + 30) * 1000);
  killer.unref();

  const { isDbUp, prisma } = await import("@/lib/db");
  const { TRIAL_STALE_DAYS } = await import("@/lib/auth/trialLearner");
  const { cleanupStaleTrialLearners } = await import("@/lib/services/trialCleanupService");

  console.log(`▶ おためし学習者の そうじ（${days ?? TRIAL_STALE_DAYS}日 つかわれていない分${has("dry-run") ? "・dry-run" : ""}）`);
  console.log("… データベースに 接続しています");
  if (!(await isDbUp())) {
    console.error("データベースに接続できません（DATABASE_URL を確認してください）。");
    return 1;
  }
  const r = await cleanupStaleTrialLearners({
    days,
    dryRun: has("dry-run"),
    deadline,
    onProgress: ({ done, total }) => console.log(`… ${done} / ${total} 人`),
  });
  const sec = ((Date.now() - started) / 1000).toFixed(1);
  if (r.dryRun) console.log(`✔ dry-run: 消す対象は ${r.candidates} 人です（消していません・${sec}秒）`);
  else if (r.timedOut) console.log(`⚠ 時間ぎれ: ${r.candidates} 人のうち ${r.deleted} 人を 消しました（のこりは 次の実行で・${sec}秒）`);
  else console.log(`✔ ${r.deleted} 人を 消しました（対象 ${r.candidates} 人・${sec}秒）`);
  await prisma.$disconnect().catch(() => {});
  return r.timedOut ? 4 : 0;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error("おためし学習者の そうじに 失敗しました:", e instanceof Error ? e.message : e);
    process.exit(1);
  },
);
