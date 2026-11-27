/**
 * 「この英語、へん？」の 報告を 見る（運営用・run9 Phase 1）。保護者ページには 出さない。
 *
 *   npm run english:reports                         # まだ 見ていない（open）報告を レッスン順に
 *   npm run english:reports -- --from 1 --to 30     # レッスン 1〜30 だけ
 *   npm run english:reports -- --since 2026-12-01   # その日 いこう
 *   npm run english:reports -- --status fixed       # なおした もの（open / fixed / wontfix / all）
 *   npm run english:reports -- --json               # JSON で 出す
 *   npm run english:reports -- --mark <id> fixed    # 1件の 状態を かえる（fixed / wontfix / open）
 *
 * DATABASE_URL が 必要（.env を 読む）。先生の 台本の 報告（teacher:<番号>:<種類>）は いまの 字幕も ならべて 出す。
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const has = (name: string) => argv.includes(`--${name}`);
const arg = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const envFile = path.join(process.cwd(), ".env");
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    /* 古い Node では 読まない */
  }
}

interface Row { id: string; page: string; lessonNo: number | null; segmentId: string; text: string | null; comment: string | null; status: string; createdAt: Date; reportedAt: Date }

/** いまの 字幕（teacher:<番号>） */
export function currentTeacherSubtitle(lessonNo: number | null, segmentId: string): string | undefined {
  const m = /^teacher:(\d+):/.exec(segmentId);
  if (!m || !lessonNo) return undefined;
  const world = Math.ceil(lessonNo / 30);
  const file = path.join(process.cwd(), "content/curriculum/worlds", `world-${String(world).padStart(2, "0")}.json`);
  if (!existsSync(file)) return undefined;
  const w = JSON.parse(readFileSync(file, "utf8")) as { lessons: { lessonNo: number; teacher?: { segments?: { subtitleEn?: string }[] } }[] };
  return w.lessons.find((l) => l.lessonNo === lessonNo)?.teacher?.segments?.[Number(m[1])]?.subtitleEn;
}

export function formatRow(r: Row): string {
  const where = r.lessonNo ? `L${r.lessonNo}` : "-";
  const now = r.page === "teacher" ? currentTeacherSubtitle(r.lessonNo, r.segmentId) : undefined;
  const lines = [
    `[${r.status}] ${r.createdAt.toISOString().slice(0, 16).replace("T", " ")}  ${where}  ${r.page}  ${r.segmentId}  (id: ${r.id})`,
    r.text ? `    英語: ${r.text}` : "",
    now !== undefined && now !== r.text ? `    いまの 字幕: ${now}` : "",
    r.comment ? `    ひとこと: ${r.comment}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

async function main(): Promise<number> {
  if (has("help") || has("h")) {
    console.log("使い方: npm run english:reports [-- --from N --to M] [-- --since YYYY-MM-DD] [-- --status open|fixed|wontfix|all] [-- --json] [-- --mark <id> <status>]");
    return 0;
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL が ありません（.env を 用意してね）。");
    return 1;
  }
  const { listEnglishReports, setEnglishReportStatus, ENGLISH_REPORT_STATUSES } = await import("../src/lib/services/englishReportService");
  const { prisma } = await import("../src/lib/db");
  try {
    const markId = arg("mark");
    if (markId) {
      const st = argv[argv.indexOf("--mark") + 2] as (typeof ENGLISH_REPORT_STATUSES)[number];
      if (!ENGLISH_REPORT_STATUSES.includes(st)) {
        console.error(`状態は ${ENGLISH_REPORT_STATUSES.join(" / ")} の どれか`);
        return 1;
      }
      const ok = await setEnglishReportStatus(markId, st);
      console.log(ok ? `${markId} → ${st}` : `${markId} は みつからないよ`);
      return ok ? 0 : 1;
    }
    const statusArg = arg("status") ?? "open";
    const status = statusArg === "all" ? undefined : (statusArg as (typeof ENGLISH_REPORT_STATUSES)[number]);
    if (status && !ENGLISH_REPORT_STATUSES.includes(status)) {
      console.error(`--status は ${ENGLISH_REPORT_STATUSES.join(" / ")} / all`);
      return 1;
    }
    const since = arg("since") ? new Date(`${arg("since")}T00:00:00`) : undefined;
    const rows = (await listEnglishReports({
      lessonFrom: arg("from") ? Number(arg("from")) : undefined,
      lessonTo: arg("to") ? Number(arg("to")) : undefined,
      status,
      since: since && !Number.isNaN(since.getTime()) ? since : undefined,
      limit: arg("limit") ? Number(arg("limit")) : 500,
    })) as Row[];
    if (has("json")) {
      console.log(JSON.stringify(rows, null, 2));
      return 0;
    }
    console.log(`「この英語、へん？」の 報告: ${rows.length} 件（${statusArg}）`);
    for (const r of rows) console.log(formatRow(r));
    return 0;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

if (process.argv[1] && /english-reports\.ts$/.test(process.argv[1])) {
  main().then((code) => { process.exitCode = code; }, (e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
