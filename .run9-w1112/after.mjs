// Block-wide consistency after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
// Goal lines / wrap-ups that still end on a bare formula word ("with Thank you for.", "with I would like to.", "answer with floor and next to.")
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, getAt } from "./lib.mjs";
const m = loadWorlds();
const R = { reviewers: "A+C (coordinator, from the group notes: formula read aloud)", reason: "goal / wrap-up line ends on a bare formula word, which reads as an unfinished sentence; use the lesson's model sentences (same fix the groups used in point segments)" };
const edits = [
  [321, "teacher.segments[1].say", "Today's goal. Say thank you with Thank you for. And say what you can do now with I could.", "Today's goal. Say thank you. Thank you for your help! And say what you can do now. I could swim 25 meters!"],
  [321, "teacher.segments[1].subtitleEn", "Today's goal. Say thank you with Thank you for. And say what you can do now with I could.", "Today's goal. Say thank you. Thank you for your help! And say what you can do now. I could swim 25 meters!"],
  [322, "teacher.segments[1].say", "Today's goal. Say thank you in a polite way with I would like to.", "Today's goal. Say thank you in a polite way. I would like to say thank you."],
  [322, "teacher.segments[1].subtitleEn", "Today's goal. Say thank you in a polite way with I would like to.", "Today's goal. Say thank you in a polite way. I would like to say thank you."],
  [342, "teacher.segments[20].say", "You can answer with floor and next to.", "You can answer, It's on the third floor. It's next to the music room."],
  [342, "teacher.segments[20].subtitleEn", "You can answer with floor and next to.", "You can answer, It's on the third floor. It's next to the music room."],
];
const patches = [];
for (const [n, p, from, to] of edits) {
  const l = lessonOf(m, n);
  const cur = getAt(l, p);
  if (!cur.includes(from)) throw new Error(`L${n} ${p}: not found`);
  patches.push({ lesson: n, path: p, before: cur, after: cur.replace(from, to), ...R });
}
fs.writeFileSync(path.join(REPO, ".run9-w1112/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after}`);
