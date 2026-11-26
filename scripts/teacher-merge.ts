/**
 * run8: 先生の 台本（下書き JSON）を ワールドファイルに 入れる。
 *   npx tsx scripts/teacher-merge.ts tmp-teacher/L001-030.json [...] [--force] [--dry]
 * 下書きの 形: [{ "lessonNo": 1, "teacher": { "minutes": 3.5, "segments": [...] } }, ...]
 * - すでに teacher が ある レッスンは とばす（--force で 上書き）。やりなおしても 安全。
 * - 長さ（3〜4 分）・英語の わりあい・スライドの ことばを チェックして 表示する（--strict で 1 つでも NG なら 書かない）。
 */
import fs from "node:fs";
import path from "node:path";
import type { LessonDef, TeacherScript } from "../src/lib/domain/types";
import type { WorldFile } from "../src/lib/curriculum/types";
import { TEACHER_MAX_MS, TEACHER_MIN_MS, englishShare, immersionFor, scriptMs, unknownSlideItems } from "../src/lib/teacher/timing";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dry = args.includes("--dry");
const strict = args.includes("--strict");
const files = args.filter((a) => !a.startsWith("--"));
if (files.length === 0) {
  console.error("usage: tsx scripts/teacher-merge.ts <draft.json...> [--force] [--dry] [--strict]");
  process.exit(1);
}

const worldsDir = path.join(process.cwd(), "content/curriculum/worlds");
const worldCache = new Map<number, WorldFile>();
const dirty = new Set<number>();
function worldOf(lessonNo: number): number {
  return Math.ceil(lessonNo / 30);
}
function loadWorld(w: number): WorldFile {
  let wf = worldCache.get(w);
  if (!wf) {
    wf = JSON.parse(fs.readFileSync(path.join(worldsDir, `world-${String(w).padStart(2, "0")}.json`), "utf8")) as WorldFile;
    worldCache.set(w, wf);
  }
  return wf;
}

let added = 0;
let skipped = 0;
let problems = 0;
for (const f of files) {
  const drafts = JSON.parse(fs.readFileSync(f, "utf8")) as { lessonNo: number; teacher: TeacherScript }[];
  console.log(`[teacher-merge] ${f}: ${drafts.length} lessons`);
  for (const d of drafts) {
    const wf = loadWorld(worldOf(d.lessonNo));
    const lesson = wf.lessons.find((l) => l.lessonNo === d.lessonNo) as LessonDef | undefined;
    if (!lesson) {
      console.log(`  L${d.lessonNo}: lesson not found`);
      problems++;
      continue;
    }
    if (lesson.teacher && !force) {
      console.log(`  L${d.lessonNo}: already has teacher -> skip`);
      skipped++;
      continue;
    }
    const ms = scriptMs(d.teacher);
    const share = englishShare(d.teacher);
    const band = immersionFor(lesson.world);
    const bad = unknownSlideItems({ ...lesson, teacher: d.teacher });
    const notes: string[] = [];
    if (d.teacher.segments.length < 8) notes.push(`segments ${d.teacher.segments.length} < 8`);
    if (ms < TEACHER_MIN_MS || ms > TEACHER_MAX_MS) notes.push(`length ${(ms / 1000).toFixed(0)}s`);
    if (share < band.minEnglishShare || share > band.maxEnglishShare) notes.push(`english ${(share * 100).toFixed(0)}% (band ${band.minEnglishShare}-${band.maxEnglishShare})`);
    if (bad.length) notes.push(`slide items not in lesson: ${bad.join(" | ")}`);
    console.log(`  L${d.lessonNo}: ${d.teacher.segments.length} seg, ${(ms / 1000).toFixed(0)}s, EN ${(share * 100).toFixed(0)}%${notes.length ? "  NG: " + notes.join("; ") : "  OK"}`);
    if (notes.length) {
      problems++;
      if (strict) continue;
    }
    lesson.teacher = d.teacher;
    dirty.add(lesson.world);
    added++;
  }
}

if (!dry && !(strict && problems > 0)) {
  for (const w of dirty) {
    const p = path.join(worldsDir, `world-${String(w).padStart(2, "0")}.json`);
    fs.writeFileSync(p, JSON.stringify(worldCache.get(w), null, 2) + "\n", "utf8");
    console.log(`[teacher-merge] wrote ${path.relative(process.cwd(), p)}`);
  }
}
console.log(`[teacher-merge] added ${added}, skipped ${skipped}, problems ${problems}${dry ? " (dry run)" : ""}`);
process.exit(strict && problems > 0 ? 2 : 0);
