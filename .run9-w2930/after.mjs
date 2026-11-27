// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 00-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const W30 = Array.from({ length: 30 }, (_, i) => 871 + i);
const rules = [
  {
    lessons: W30, from: /\bMaybe, (?=[A-Z0-9])/g, to: "You could say, ", leaf: /segments\[\d+\]\.(say|subtitleEn)$/,
    reviewers: "A+C (group report L841-850)",
    reason: '"Your turn! Maybe, I think ..." sounds as if the child is unsure of the model sentence, and TTS reads it that way; one form for the model line in the whole block (W29 already says "You could say,")',
  },
  {
    lessons: [882], from: /en-er-GET-ic/g, to: "en-er-JET-ic", leaf: /segments\[\d+\]\.(say|subtitleEn|subtitleJa)$/,
    reviewers: "B+C (group report L891-900)",
    reason: 'the g in energetic is soft (J sound); TTS reads "GET" with a hard g. Same fix as L898 (spoken lines only; the written syllable table in tipJa / w30Phonics.ts stays en-er-get-ic)',
  },
  {
    lessons: [882], from: "Energetic. GET is strong.", to: "Energetic. JET is strong.", leaf: /^teacherScript$/,
    reviewers: "B+C (group report L891-900)", reason: "same soft-g fix in the teacherScript reading",
  },
  {
    lessons: [871], from: "Next year, and many years later.", to: "Next year, and many years from now.", leaf: /\.(say|subtitleEn)$/,
    reviewers: "A+B (group report L871-880)", reason: '"years later" looks back from a past point; for time ahead of now say "years from now"',
  },
  {
    lessons: [875], from: "Please enjoy both kinds of trees!", to: "Enjoy both kinds of trees!", leaf: /^teacherScript$/,
    reviewers: "objective+lint", reason: 'stiff "Please enjoy" (lint stiff-phrase); a park sign in American English just says "Enjoy ..."',
  },
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
  if (!hit) throw new Error(`rule not hit: ${r.from}`);
}
fs.writeFileSync(path.join(REPO, ".run9-w2930/patches/20-after.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
