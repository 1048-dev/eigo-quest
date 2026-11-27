// Block-wide decisions for L301-360 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 301 + i);
const AUT = 'UK word "autumn" -> US "fall" in the talk (style guide UK/US table; lint uk-word). The L349 expression ID changes';
const AUG = 'phonics word "autumn" (UK) -> "August" (same au = オー; phonicsButtons.ts uses August for au). The reading text changes with it ("red leaves" do not fit August). Learning item ID of the L349 phonics word changes';
const NAMES = /^(I|I'm|I'd|I'll|Haru|Kiko|Riko|Birimo|Pipo|Ms|Mr|Emma|English|Japan|World|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)$/;
const rules = [
  // US praise (same rule as W01-08)
  { lessons: [303], from: /Brilliant!/g, to: "Awesome!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-08)' },
  { lessons: [353], from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-08)' },
  { lessons: [326], from: /Brilliant writers today!/g, to: "Great writers today!", reviewers: "A+C", reason: 'British praise "Brilliant" -> American (same rule as W01-08)' },
  { lessons: [322], from: /Mmm, lovely!/g, to: "Mmm, so nice!", reviewers: "A+C", reason: 'British-leaning "lovely" -> American (same rule as W07-08 "a lovely speech")' },
  { lessons: [324], from: /What lovely messages!/g, to: "What wonderful messages!", reviewers: "A+C", reason: 'British-leaning "lovely" -> American (same rule as W07-08)' },
  { lessons: [358], from: /What a lovely memory talk!/g, to: "What a great memory talk!", reviewers: "A+C", reason: 'British-leaning "lovely" -> American (same rule as W07-08)' },
  // Ding-dong (W05-06 rule)
  { lessons: ALL, from: /Ding,? dong, ding,? dong!/g, to: "Ding-dong, ding-dong!", reviewers: "objective", reason: 'bell sound is spelled "Ding-dong!" (same rule as W05-06)' },
  { lessons: ALL, from: /Ding,? dong!/g, to: "Ding-dong!", reviewers: "objective", reason: 'bell sound is spelled "Ding-dong!" (same rule as W05-06)' },
  // thumbs-up (W07-08 rule)
  { lessons: ALL, from: /\b([Gg])ive a thumbs up\b/g, to: "$1ive a thumbs-up", reviewers: "A+B+lint", reason: 'noun "thumbs-up" takes a hyphen; same as L321 and W01-08 (lint inconsistent-form). Learning item ID of the L334 TPR changes' },
  // autumn (L349)
  { lessons: [349], from: /In autumn, I saw red leaves\. I drew a picture\. The leaves flew away\./g, to: "In August, I saw the sea. I drew a picture. The birds flew away.", reviewers: "A+B+lint", reason: AUG },
  { lessons: [349], from: /stage show in autumn/g, to: "stage show in the fall", reviewers: "A+B+lint", reason: AUT },
  { lessons: [349], from: /\bautumn\b/g, to: "August", reviewers: "A+B+lint", reason: AUG },
  // capital after "Now," / "Then," / "Next," / "First," inside a sentence (W07-08 after-rule)
];
const capRule = {
  from: /\b(Now|Then|Next|First), ([A-Z][a-z']+)/g,
  to: (a, w1, w) => (NAMES.test(w) ? a : `${w1}, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: /\.(say|subtitleEn)$/,
  reviewers: "objective",
  reason: 'capital letter after "Now," / "Then," / "Next," in the middle of a sentence ("Now, Walk slowly.") -> lowercase (same rule as W07-08). The TPR item and its slide keep their capital',
};
const ja = [
  { from: /^((?:[^！。、]{1,12}の )?)みんな、やあ！/, to: "やあ、$1みんな！", leaf: /subtitleJa$/, reviewers: "B+objective", reason: "natural Japanese greeting order (やあ、みんな！), same rule as W05-08" },
  { from: /あしたは ボスせんだよ。/, to: "つぎは ボスせんだよ。", leaf: /^teacherScript$/, reviewers: "B+objective", reason: "do not assume the next lesson is tomorrow (same rule as W07-08: きのう / あしたは -> まえの / つぎは)" },
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
fs.writeFileSync(path.join(REPO, ".run9-w1112/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) if (!x.reason.startsWith("capital")) console.log(`L${x.lesson} ${x.path}: ${x.before.slice(0, 110)}\n    -> ${x.after.slice(0, 110)}`);
