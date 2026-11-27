// Block-wide decisions for L181-240 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 181 + i);
const TT = 'UK word "timetable" -> US "schedule" (style guide UK/US table; lint uk-word). Learning item ID of the L192 vocab changes; L195 title too';
const rules = [
  { lessons: ALL, from: /\btimetables\b/g, to: "schedules", reviewers: "A+B+lint", reason: TT },
  { lessons: ALL, from: /\bTimetables\b/g, to: "Schedules", reviewers: "A+B+lint", reason: TT },
  { lessons: ALL, from: /\btimetable\b/g, to: "schedule", reviewers: "A+B+lint", reason: TT },
  { lessons: ALL, from: /\bTimetable\b/g, to: "Schedule", reviewers: "A+B+lint", reason: TT },
  { lessons: [239], from: /\bfootball\b/g, to: "cookbook", reviewers: "A+C+lint", reason: 'in the US "football" is American football (lint uk-word). Swap the compound word for "cookbook" (also oo = ウ, two parts, in vowelTeams.ts). Learning item ID of the L239 phonics word changes' },
  { lessons: [239], from: /\bFootball\b/g, to: "Cookbook", reviewers: "A+C+lint", reason: 'same as "football" -> "cookbook"' },
  { lessons: [239], from: /Foot, ball\./g, to: "Cook, book.", reviewers: "A+C+lint", reason: 'same as "football" -> "cookbook"' },
  { lessons: [239], from: /foot、ball。/g, to: "cook、book。", reviewers: "A+C+lint", reason: 'same as "football" -> "cookbook"' },
  { lessons: ALL, from: /\b([Gg])ive a thumbs up\b/g, to: "$1ive a thumbs-up", reviewers: "A+B+lint", reason: 'noun "thumbs-up" takes a hyphen; same as L224, L88, L133 (inconsistent-form warn). Learning item IDs of the L200 / L209 TPR change' },
  { lessons: [184], from: /Brilliant!/g, to: "Awesome!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-06)' },
  { lessons: [192], from: /Brilliant thinking!/g, to: "Great thinking!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-06)' },
  { lessons: ALL.filter((n) => ![184, 192, 214, 232].includes(n)), from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-06)' },
  { lessons: [214], from: /Brilliant!/g, to: "Perfect!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-06)' },
  { lessons: [232], from: /Brilliant!/g, to: "Way to go!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-06)' },
  { lessons: ALL, from: /Lovely manners!/g, to: "Great manners!", reviewers: "A+C", reason: 'British praise "Lovely ~!" -> American (same rule as W03-04)' },
  { lessons: ALL, from: /show time/g, to: "showtime", reviewers: "objective", reason: 'US spelling is "showtime" (one word; same as L180)' },
];
const ja = { from: /^((?:[^！。、]{1,12}の )?)みんな、やあ！/, to: "やあ、$1みんな！", reviewers: "B+objective", reason: "natural Japanese greeting order (やあ、みんな！), same rule as W05-06" };
const patches = [];
for (const n of ALL) {
  const l = lessonOf(m, n);
  for (const [p] of strings(l)) {
    let s = null;
    for (const r of rules) {
      if (!r.lessons.includes(n)) continue;
      const cur = strings(l).find(([q]) => q === p)[1];
      const t = cur.replace(r.from, r.to);
      if (t !== cur) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: cur, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
    if (p.endsWith("subtitleJa")) {
      const cur = strings(l).find(([q]) => q === p)[1];
      const t = cur.replace(ja.from, ja.to);
      if (t !== cur) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: cur, after: t, reviewers: ja.reviewers, reason: ja.reason }); }
    }
  }
}
fs.writeFileSync(path.join(REPO, ".run9-w78/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.before.slice(0, 90)}\n    -> ${x.after.slice(0, 90)}`);
