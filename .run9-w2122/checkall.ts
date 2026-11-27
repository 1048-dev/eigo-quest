// Check every lesson 601-660 in the CURRENT world files: slide items, script length, English share
import fs from "node:fs";
import path from "node:path";
import { englishShare, immersionFor, scriptMs, unknownSlideItems, TEACHER_MAX_MS, TEACHER_MIN_MS } from "../src/lib/teacher/timing";
const ROOT = path.resolve(__dirname, "..");
let bad = 0;
for (const w of [21, 22]) {
  const wf = JSON.parse(fs.readFileSync(path.join(ROOT, `content/curriculum/worlds/world-${w}.json`), "utf8"));
  for (const l of wf.lessons) {
    const u = unknownSlideItems(l);
    const ms = scriptMs(l.teacher);
    const sh = englishShare(l.teacher);
    const band = immersionFor(l.world);
    const notes: string[] = [];
    if (u.length) notes.push(`slide items not in lesson: ${u.join(" | ")}`);
    if (ms < TEACHER_MIN_MS || ms > TEACHER_MAX_MS) notes.push(`length ${(ms / 1000).toFixed(0)}s`);
    if (sh < band.minEnglishShare || sh > band.maxEnglishShare) notes.push(`english share ${(sh * 100).toFixed(0)}%`);
    if (notes.length) { bad++; console.log(`L${l.lessonNo} NG ${notes.join("; ")}`); }
  }
}
console.log(bad ? `PROBLEMS: ${bad}` : "ALL OK (60 lessons)");
