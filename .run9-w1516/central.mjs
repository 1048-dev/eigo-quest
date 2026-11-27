// Block-wide decisions for L421-480 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 421 + i);
const NAMES = /^(I|I'm|I'd|I'll|Haru|Haru's|Kiko|Kiko's|Riko|Riko's|Birimo|Birimo's|Pipo|Ms|Mr|Emma|Sana|Leo|Pochi|English|Japan|World|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)$/;
const US = "British-leaning praise -> American (same rule as W01-14)";
const FB = { reviewers: "objective+lint (A+B)", reason: 'UK "football" in a soccer lesson reads as British (lint uk-word; in the US football is a different sport). Compound word -> "classroom" (class + room), same type as homework / playground; same fix type as W07-08 L239 football. Test tests/phonics-w15.test.ts updated' };
const rules = [
  { lessons: ALL, from: /\bOkay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "Okay" (style guide; lint canonical)' },
  { lessons: ALL, from: /\bokay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical)' },
  { lessons: ALL, from: /\b([Gg])ive a thumbs up\b/g, to: "$1ive a thumbs-up", reviewers: "A+B+lint", reason: 'noun "thumbs-up" takes a hyphen (same rule as W01-14). Learning item ID of the L473 TPR changes' },
  { lessons: [444], from: /Lovely work tonight\./g, to: "Great work tonight.", reviewers: "A+C", reason: US },
  { lessons: [455], from: /^Lovely work!/g, to: "Great work!", reviewers: "A+C", reason: US },
  { lessons: [478], from: /^Lovely work!/g, to: "Nice work!", reviewers: "A+C", reason: US },
  { lessons: [445], from: /That's lovely/g, to: "That's so nice", reviewers: "A+C", reason: US + ' ("That\'s lovely!" -> "That\'s so nice!", also the aiTask target)' },
  { lessons: [444], from: /Brilliant, little stars!/g, to: "Great job, little stars!", reviewers: "A+C", reason: US },
  { lessons: [452, 474], from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  { lessons: ALL, from: /Ding,? dong/g, to: "Ding-dong", reviewers: "objective", reason: 'bell sound is spelled "Ding-dong" (same rule as W05-14)' },
  { lessons: [442, 472], from: /Yesterday we /g, to: "Last time, we ", reviewers: "B+objective", reason: "do not assume the last lesson was yesterday (same rule as W07-14: Yesterday -> Last time)" },
  { lessons: [450, 480], from: /speed TPR/g, to: "speed challenge", reviewers: "B+C", reason: 'kids do not know the term "TPR"; the say lines already use "speed challenge" (same as W13-14 L390/L420)' },
  // L431 football -> classroom (compound word)
  { lessons: [431], from: /Foot plus ball, football/g, to: "Class plus room, classroom", ...FB },
  { lessons: [431], from: /Foot and ball/g, to: "Class and room", ...FB },
  { lessons: [431], from: /foot（あし）\+ ball/g, to: "class（クラス）+ room（へや）", ...FB },
  { lessons: [431], from: /foot \+ ball/g, to: "class + room", ...FB },
  { lessons: [431], from: /foot と ball/g, to: "class と room", ...FB },
  { lessons: [431], from: /^foot-ball$/g, to: "class-room", ...FB },
  { lessons: [431], from: /^\/ˈfʊt\.bɔːl\/$/g, to: "/ˈklæs.ruːm/", ...FB },
  { lessons: [431], from: /Football/g, to: "Classroom", ...FB },
  { lessons: [431], from: /football/g, to: "classroom", ...FB },
];
const capRule = {
  from: /\b(Now|Then|Next|First), ([A-Z][a-z']+)/g,
  to: (a, w1, w) => (NAMES.test(w) ? a : `${w1}, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
  reviewers: "objective",
  reason: 'capital letter after "Now," / "Then," / "First," in the middle of a sentence ("Now, Ring the bell.") -> lowercase (same rule as W07-14). The TPR item and its slide keep their capital',
};
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
  }
}
fs.writeFileSync(path.join(REPO, ".run9-w1516/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) if (!x.reason.startsWith("capital") && !x.reason.startsWith("canonical")) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
