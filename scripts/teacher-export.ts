/**
 * run8 P9: 先生の 台本を AI アバター動画サービス用に 書きだす。
 *
 *   npx tsx scripts/teacher-export.ts                     … 全レッスン（1〜1,200）
 *   npx tsx scripts/teacher-export.ts --from 1 --to 30    … はんいだけ
 *   npx tsx scripts/teacher-export.ts --only-script       … 台本（lesson.teacher）が ある レッスンだけ
 *   npx tsx scripts/teacher-export.ts --out <dir>         … 書きだし先（ふつうは exports/teacher）
 *   npx tsx scripts/teacher-export.ts --summary-only      … summary.csv だけ
 *   （npm run teacher:export -- --from 1 --to 30）
 *
 * 書くもの（exports/teacher/<0001>/）: script.txt / script.json / subtitles.vtt（日本語＋英語）/ slides.json
 *   と exports/teacher/summary.csv（レッスンごとの 分数と 合計。業者の 見つもり用）
 * 台本が まだ ない レッスンは、バーチャル先生と 同じ 自動の 授業を 書きだす（source=auto。summary.csv に 出る）。
 * 何度 やっても 同じ 結果（やりなおしても 安全）。時間制限 5 分。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LESSONS, TEACHER } from "../src/lib/curriculum";
import { pickConversationPartner } from "../src/lib/conversation/engine";
import { buildTeacherExport, lessonDirName, renderSummaryCsv, renderTeacherExportFiles, renderVtt, summaryTotals, type TeacherExport } from "../src/lib/teacherVideo/export";
import { installDeadline } from "./lib/checkKit";

installDeadline(300);
const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const from = Number(opt("--from") ?? 1);
const to = Number(opt("--to") ?? Number.MAX_SAFE_INTEGER);
const onlyScript = args.includes("--only-script");
const summaryOnly = args.includes("--summary-only");
const outDir = path.resolve(opt("--out") ?? path.join(process.cwd(), "exports", "teacher"));
if (!Number.isInteger(from) || !Number.isFinite(to) || from < 1 || to < from) {
  console.error("usage: tsx scripts/teacher-export.ts [--from N] [--to N] [--only-script] [--summary-only] [--out dir]");
  process.exit(1);
}

const started = Date.now();
const lessons = LESSONS.filter((l) => l.lessonNo >= from && l.lessonNo <= to && (!onlyScript || (l.teacher?.segments?.length ?? 0) >= 3));
console.log(`[teacher-export] ${lessons.length} lessons → ${outDir}`);
mkdirSync(outDir, { recursive: true });

const all: TeacherExport[] = [];
lessons.forEach((lesson, i) => {
  const partner = lesson.conversation ? pickConversationPartner(lesson.lessonNo, lesson.conversation) : undefined;
  const x = buildTeacherExport(lesson, { partner, teacherName: TEACHER?.name ??"Ms. Emma" });
  all.push(x);
  if (!summaryOnly) {
    const f = renderTeacherExportFiles(x);
    const dir = path.join(outDir, lessonDirName(lesson.lessonNo));
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "script.txt"), f.scriptTxt, "utf8");
    writeFileSync(path.join(dir, "script.json"), f.scriptJson, "utf8");
    writeFileSync(path.join(dir, "subtitles.vtt"), f.subtitlesVtt, "utf8");
    writeFileSync(path.join(dir, "subtitles.ja.vtt"), renderVtt(x, { ja: true, en: false }), "utf8");
    writeFileSync(path.join(dir, "subtitles.en.vtt"), renderVtt(x, { ja: false, en: true }), "utf8");
    writeFileSync(path.join(dir, "slides.json"), f.slidesJson, "utf8");
  }
  if ((i + 1) % 100 === 0 || i === lessons.length - 1) console.log(`  ${i + 1}/${lessons.length} (L${lesson.lessonNo}) ${((Date.now() - started) / 1000).toFixed(1)}s`);
});

writeFileSync(path.join(outDir, "summary.csv"), renderSummaryCsv(all), "utf8");
const t = summaryTotals(all);
const hours = t.totalMs / 3_600_000;
console.log(
  `[teacher-export] done: ${t.lessons} lessons (script ${t.scriptLessons} / auto ${t.autoLessons}), ` +
    `total ${(t.totalMs / 60_000).toFixed(1)} min (${hours.toFixed(1)} h), rounded up per lesson ${t.minutesRoundedUp} min, ` +
    `avg ${(t.lessons ? t.totalMs / t.lessons / 1000 : 0).toFixed(0)}s/lesson → ${path.join(outDir, "summary.csv")} (${((Date.now() - started) / 1000).toFixed(1)}s)`,
);
process.exit(0);
