/**
 * 月ごとの学習レポート（PDF）を LINE で届ける。毎月1日に cron などで実行する想定（既定は「先月」の分）。
 *
 *   npm run line:monthly                          # LINE と連携ずみ・配信オンの保護者全員に、先月の分
 *   npm run line:monthly -- --dry-run             # 送らずに outbox（LINE_OUTBOX_DIR）へ書いて、送る内容を表示
 *   npm run line:monthly -- --parent <保護者ID>   # 1人だけ（dry-run なら LINE 未連携の保護者でも可）
 *   npm run line:monthly -- --month 2026-11       # 月を指定
 *   npm run line:monthly -- --force               # 送信ずみ・配信オフでも送る
 *
 * LINE_MESSAGING_CHANNEL_ACCESS_TOKEN と APP_BASE_URL がそろっていないときは、自動的に dry-run になる。
 * 同じ月を2回実行しても、送信ずみのお子さまには送らない（--force を除く）。
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
  console.log("使い方: npm run line:monthly [-- --dry-run] [-- --parent <id>] [-- --month YYYY-MM] [-- --force]");
  process.exit(0);
}

// .env を読む（すでに環境変数があれば そちらが優先）
const envFile = path.join(process.cwd(), ".env");
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    /* 古い Node では読まない（環境変数を直接わたす） */
  }
}

async function main() {
  const { isDbUp, prisma } = await import("@/lib/db");
  const { isValidMonth } = await import("@/lib/report/monthlyReport");
  const { canPush, lineMessagingConfig } = await import("@/lib/line/messaging");
  const { outboxDir, runMonthlyDelivery } = await import("@/lib/services/monthlyDeliveryService");
  const { reportStorageDir } = await import("@/lib/report/storage");

  const month = arg("month");
  if (month !== undefined && !isValidMonth(month)) {
    console.error(`--month は YYYY-MM の形で指定してください（例: 2026-11）: ${month}`);
    process.exit(2);
  }
  const parentId = arg("parent");
  if (has("parent") && !parentId) {
    console.error("--parent には保護者の ID を指定してください");
    process.exit(2);
  }
  if (!(await isDbUp())) {
    console.error("データベースに接続できません（DATABASE_URL を確認してください）。");
    process.exit(1);
  }

  const cfg = lineMessagingConfig();
  const dryRun = has("dry-run") || !canPush(cfg);
  console.log(`== LINE 月間レポート ${dryRun ? "【dry-run: LINE には送りません】" : "【本番送信】"}`);
  if (!has("dry-run") && dryRun) {
    const missing = [!cfg.accessToken && "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN", !cfg.baseUrl && "APP_BASE_URL"].filter(Boolean).join(", ");
    console.log(`   未設定: ${missing} → dry-run で実行します`);
  }
  console.log(`   PDF の置き場所: ${reportStorageDir()}`);
  if (dryRun) console.log(`   outbox: ${outboxDir()}`);

  const summary = await runMonthlyDelivery({ dryRun, parentId, month, force: has("force") });
  console.log(`   対象月: ${summary.month} ／ 期限切れの配信を ${summary.purged} 件削除`);
  if (summary.results.length === 0) console.log("   送る相手がいません（LINE と連携ずみで、配信オンの保護者がいない）");
  const count: Record<string, number> = {};
  for (const r of summary.results) {
    count[r.status] = (count[r.status] ?? 0) + 1;
    console.log(`\n- 保護者 ${r.parentId}: ${r.status}${r.reason ? `（${r.reason}）` : ""}`);
    for (const c of r.children) {
      console.log(`    ${c.childName}: ${c.url}`);
      for (const f of c.files) console.log(`      ・${f.labelJa}  ${f.path}  ${f.bytes} bytes`);
    }
    if (r.outboxPath) console.log(`    → ${path.join(r.outboxPath, "message.json")}`);
  }
  console.log(`\n== おわり: ${Object.entries(count).map(([k, v]) => `${k} ${v}`).join(" / ") || "0 件"}`);
  await prisma.$disconnect();
  if ((count.failed ?? 0) > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`エラー: ${(e as Error)?.name ?? "Error"}: ${(e as Error)?.message ?? ""}`);
  process.exit(1);
});
