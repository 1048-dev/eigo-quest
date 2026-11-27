// Coordinator follow-up after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, getAt } from "./lib.mjs";
const m = loadWorlds();
const fixes = [
  {
    lesson: 556, paths: ["teacher.segments[1].say", "teacher.segments[1].subtitleEn"], from: "You should rest. And, You shouldn't work too late.", to: "You should rest. And you shouldn't work too late.",
    reviewers: "objective (coordinator; L551-560 / L571-580 group reports)", reason: 'capital after a lead-in mid-sentence ("And, You ...") that the central rule (Now / Then / First ...) did not cover; drop the comma too',
  },
  {
    lesson: 590, paths: ["teacher.segments[8].say", "teacher.segments[8].subtitleEn"], from: "You learned all of these this week!", to: "You learned all of these!",
    reviewers: "A+B (coordinator; L581-590 group report)", reason: '"this week" assumes a weekly schedule; kids study at their own pace',
  },
  {
    lesson: 590, paths: ["teacher.segments[8].subtitleJa"], from: "どれも こんしゅう ならったね！", to: "どれも もう ならったね！",
    reviewers: "A+B (coordinator; L581-590 group report)", reason: "JA follows the EN fix (こんしゅう -> もう)",
  },
];
const patches = [];
for (const f of fixes)
  for (const p of f.paths) {
    const s = getAt(lessonOf(m, f.lesson), p);
    if (!s.includes(f.from)) throw new Error(`L${f.lesson} ${p}: not found`);
    patches.push({ lesson: f.lesson, path: p, before: s, after: s.replace(f.from, f.to), reviewers: f.reviewers, reason: f.reason });
  }
fs.writeFileSync(path.join(REPO, ".run9-w1920/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after}`);
