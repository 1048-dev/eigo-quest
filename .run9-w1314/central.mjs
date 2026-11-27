// Block-wide decisions for L361-420 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 361 + i);
const NAMES = /^(I|I'm|I'd|I'll|Haru|Haru's|Kiko|Kiko's|Riko|Riko's|Birimo|Birimo's|Pipo|Ms|Mr|Emma|English|Japan|World|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)$/;
const US = 'British-leaning praise -> American (same rule as W01-12)';
const rules = [
  // OK (style guide §: "OK" not "Okay"; lint canonical)
  { lessons: ALL, from: /\bOkay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "Okay" (style guide; lint canonical)' },
  { lessons: ALL, from: /\bokay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical)' },
  // thumbs-up as a noun (W07-12 rule). "Two thumbs up!" / "Thumbs up, ...!" stay (interjection / adverb use)
  { lessons: ALL, from: /\b([Gg])ive a thumbs up\b/g, to: "$1ive a thumbs-up", reviewers: "A+B+lint", reason: 'noun "thumbs-up" takes a hyphen (same rule as W01-12). Learning item ID of the L406 TPR changes' },
  { lessons: ALL, from: /\ba big thumbs up\b/g, to: "a big thumbs-up", reviewers: "A+B", reason: 'noun "thumbs-up" takes a hyphen (same rule as W01-12)' },
  // US praise
  { lessons: [396], from: /^Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  { lessons: [367], from: /Lovely job!/g, to: "Great job!", reviewers: "A+C", reason: US },
  { lessons: [367], from: /Isn't that lovely\?/g, to: "Isn't that nice?", reviewers: "A+C", reason: US },
  { lessons: [389], from: /What a lovely walk!/g, to: "What a nice walk!", reviewers: "A+C", reason: US },
  { lessons: [393], from: /Lovely work!/g, to: "Nice work!", reviewers: "A+C", reason: US },
  { lessons: [407], from: /What a lovely evening!/g, to: "What a nice evening!", reviewers: "A+C", reason: US },
  { lessons: [417], from: /Lovely stories!/g, to: "Wonderful stories!", reviewers: "A+C", reason: US },
  // Ding-dong (W05-12 rule)
  { lessons: ALL, from: /Ding,? dong!/g, to: "Ding-dong!", reviewers: "objective", reason: 'bell sound is spelled "Ding-dong!" (same rule as W05-12)' },
  // do not assume the previous lesson was yesterday (W07-08 rule)
  { lessons: [382], from: /Yesterday we /g, to: "Last time, we ", reviewers: "B+objective", reason: 'do not assume the last lesson was yesterday (same rule as W07-08: Yesterday -> Last time)' },
];
const capRule = {
  from: /\b(Now|Then|Next|First), ([A-Z][a-z']+)/g,
  to: (a, w1, w) => (NAMES.test(w) ? a : `${w1}, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
  reviewers: "objective",
  reason: 'capital letter after "Now," / "Then," / "First," in the middle of a sentence ("Now, Point to the map.") -> lowercase (same rule as W07-12). The TPR item and its slide keep their capital',
};
const ja = [
  { from: /きのうは あいづちを/, to: "まえの レッスンでは あいづちを", leaf: /subtitleJa$/, reviewers: "B+objective", reason: "do not assume the last lesson was yesterday (same rule as W07-08: きのうは -> まえの レッスンでは)" },
];
const patches = [];
const cur = (l, p) => strings(l).find(([q]) => q === p)[1];
for (const n of ALL) {
  const l = lessonOf(m, n);
  for (const [p] of strings(l)) {
    for (const r of rules) {
      if (!r.lessons.includes(n)) continue;
      const c = cur(l, p);
      const t = c.replace(r.from, r.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
    if (capRule.leaf.test(p)) {
      const c = cur(l, p);
      const t = c.replace(capRule.from, capRule.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: capRule.reviewers, reason: capRule.reason }); }
    }
    for (const r of ja) {
      if (!r.leaf.test(p)) continue;
      const c = cur(l, p);
      const t = c.replace(r.from, r.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
  }
}
fs.writeFileSync(path.join(REPO, ".run9-w1314/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) if (!x.reason.startsWith("capital")) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
