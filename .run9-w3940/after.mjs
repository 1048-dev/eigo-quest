// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 01-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const LIT = {
  reviewers: "A+C (block rule; group report L1151-1160 / L1181-1190)",
  reason: "present-tense narration (begins to shine / starts to glow) followed by a past 'lit up!'; L1155 and L1160 already use 'lights up!', so the narrator lines in teacherScript are unified. Lines a character shouts (L1175 / L1180 / L1185 seg9, the L1175 expression) and Ms. Emma's 'Look! ... lit up!' segments keep 'lit up!'",
};
const LET = { reviewers: "C (objective: TTS)", reason: "letter group read as letters with a comma (e, a), like the other spell-outs in this block" };
const R = (lessons, from, to, leaf, meta) => ({ lessons: Array.isArray(lessons) ? lessons : [lessons], from, to, leaf, ...meta });
const TS = /^teacherScript$/;
const rules = [
  R(1145, "then bright and golden. The Lantern of Knowing lit up!", "then bright and golden. The Lantern of Knowing lights up!", TS, LIT),
  R(1150, "soft rainbow light. The Lantern of Many Views lit up!", "soft rainbow light. The Lantern of Many Views lights up!", TS, LIT),
  R(1165, "warm and golden. The Lantern of Agreement lit up!", "warm and golden. The Lantern of Agreement lights up!", TS, LIT),
  R(1170, "begins to glow. The Lantern of Hope lit up!", "begins to glow. The Lantern of Hope lights up!", TS, LIT),
  R(1185, "like warm gold. The Ray of Courage lit up!", "like warm gold. The Ray of Courage lights up!", TS, LIT),
  R(1190, "pink like a sunrise. The Ray of Dreams lit up!", "pink like a sunrise. The Ray of Dreams lights up!", TS, LIT),
  R(1195, "warm and golden. The Ray of Thanks lit up!", "warm and golden. The Ray of Thanks lights up!", TS, LIT),
  R(1200, "begins to shine. The Ray of Beginnings lit up!", "begins to shine. The Ray of Beginnings lights up!", TS, LIT),
  R(1180, "And dream has e a in the middle.", "And dream has e, a in the middle.", /segments\[10\]\.(say|subtitleEn)$/, LET),
];
const patches = [];
for (const r of rules) {
  let hit = 0;
  for (const n of r.lessons) {
    const l = lessonOf(m, n);
    for (const [p, c] of strings(l)) {
      if (r.leaf && !r.leaf.test(p)) continue;
      const t = typeof r.from === "string" ? c.split(r.from).join(r.to) : c.replace(r.from, r.to);
      if (t !== c) { hit++; setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
  }
  if (!hit) console.log(`rule not hit: ${r.from}`);
}
fs.writeFileSync(path.join(REPO, ".run9-w3940/patches/20-after.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
