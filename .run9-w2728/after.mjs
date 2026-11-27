// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 00-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const rules = [
  {
    lessons: [795, 800, 806, 808, 810], from: /The [Cc] [Hh] (says k|sounds like k)\./g, to: "The C H makes a k sound.", leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
    reviewers: "B+C (group reports L781-790, L801-810)",
    reason: 'TTS may read a bare "k" as the letter name "kay"; one wording for the ch = k rule in the whole block (L781-785 already say "makes a k sound")',
  },
  {
    lessons: [818, 840], from: /carry-O-key|kar-ee-OH-kee/g, to: "carry-OH-key", leaf: /(\.(say|subtitleEn|subtitleJa)|^teacherScript)$/,
    reviewers: "B+C (group reports L811-820, L831-840)",
    reason: "the two groups respelled karaoke two ways; use one form with real words (carry, key) and the stressed OH, matching the JA tip キャリオウキ",
  },
  {
    lessons: [835], from: /mee-chu/g, to: "meet-chu", leaf: /\.(say|subtitleEn)$/,
    reviewers: "B+C (group reports L821-830, L831-840)", reason: "review lesson follows the L826 source spelling (Meet-chu), as in the L835 teacherScript",
  },
  {
    lessons: [836], from: /([Cc])ould-ju\b/g, to: "$1ould-joo", leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
    reviewers: "B+C (group reports L821-830, L831-840)", reason: "review lesson follows the L826 source spelling (could-joo)",
  },
  {
    lessons: [839], from: /aw-lo-ver/g, to: "aw-low-ver", leaf: /\.(say|subtitleEn)$/,
    reviewers: "B+C (group reports L821-830, L831-840)", reason: 'review lesson follows the L829 source spelling (Aw-low-ver; "lover" would be read with the wrong vowel)',
  },
];
const patches = [];
for (const r of rules) {
  let hit = 0;
  for (const n of r.lessons) {
    const l = lessonOf(m, n);
    for (const [p, c] of strings(l)) {
      if (r.leaf && !r.leaf.test(p)) continue;
      const t = c.replace(r.from, r.to);
      if (t !== c) { hit++; setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
  }
  if (!hit) throw new Error(`rule not hit: ${r.from}`);
}
fs.writeFileSync(path.join(REPO, ".run9-w2728/patches/20-after.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) console.log(`L${x.lesson} ${x.path}`);
