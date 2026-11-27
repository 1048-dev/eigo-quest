// Block-wide decisions for L481-540 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 481 + i);
const NAMES = /^(I|I'm|I'd|I'll|I've|Haru|Haru's|Kiko|Kiko's|Riko|Riko's|Birimo|Birimo's|Pipo|Luka|Luka's|Ms|Mr|Emma|Sana|Leo|Pochi|English|Japan|World|Earth|Echo|Mars|Jupiter|Saturn|Venus|Mercury|Neptune|Uranus|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)$/;
const US = "British-leaning praise -> American (same rule as W01-16)";
const EMMA = {
  reviewers: "A+C (+ W15-16 report)",
  reason: 'Ms. Emma is the narrator and voice of the script; "Ms. Emma says," in her own narration sounds like a third person reading. Use "I say," / "I ask," / "I smile." like L490 seg7 ("And I say, Bravo!"); JA エマ先生 -> わたし (as L490 seg7 JA)',
};
const rules = [
  { lessons: ALL, from: /\bOkay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "Okay" (style guide; lint canonical)' },
  { lessons: ALL, from: /\bokay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical)' },
  { lessons: [516], from: /^Lovely work, everyone!/g, to: "Great work, everyone!", reviewers: "A+C", reason: US },
  { lessons: [523], from: /^Lovely work, quiet explorers!/g, to: "Nice work, quiet explorers!", reviewers: "A+C", reason: US },
  { lessons: [516, 538], from: /\. Lovely! /g, to: ". Great! ", reviewers: "A+C", reason: US },
  { lessons: [502], from: /What a lovely name\./g, to: "What a beautiful name.", reviewers: "A+C", reason: US + " (conversation line, slide, say)" },
  { lessons: [485], from: /^Brilliant planning!/g, to: "Great planning!", reviewers: "A+C", reason: US },
  { lessons: [493, 504], from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  { lessons: [510], from: /speed TPR/g, to: "speed challenge", reviewers: "B+C", reason: 'kids do not know the term "TPR"; the say lines already use "speed challenge" (same as W13-16)' },
  { lessons: [510], from: /wonderful show\. Please enjoy!/g, to: "wonderful show. Have fun!", reviewers: "A+B+lint", reason: '"Please enjoy!" is a translation of たのしんで ください and is not said this way in English (lint stiff-phrase). "Have fun!" Learning item ID of the L510 school expression changes. JA unchanged' },
  { lessons: [490], from: /That's all for today\. See you!/g, to: "That's it for today. See you!", reviewers: "A+C+lint", reason: 'Ms. Emma\'s own goodbye "That\'s all for today." is stiff (lint stiff-phrase). The reporter line "That\'s all for today\'s weather." is a real news phrase and the learning item, so it stays' },
  // Ms. Emma narrating herself
  { lessons: [503, 505, 508, 509, 510], from: /Ms\. Emma says, /g, to: "I say, ", ...EMMA },
  { lessons: [508], from: /Ms\. Emma asks, /g, to: "I ask, ", ...EMMA },
  { lessons: [509], from: /Ms\. Emma smiles\. /g, to: "I smile. ", ...EMMA },
  { lessons: [503, 505, 508, 509, 510], from: /エマ先生「/g, to: "わたし「", ...EMMA },
  { lessons: [509], from: /エマ先生が にっこり。/g, to: "わたしは にっこり。", ...EMMA },
  // L485 list of order words
  { lessons: [485], from: /^Here's the point\. First, Then, After that, Finally\./g, to: "Here's the point. First, then, after that, finally.", reviewers: "objective", reason: 'order words listed mid-sentence take lowercase (same as W15-16 L467/L477/L480)' },
];
const capRule = {
  from: /\b(Now|Then|Next|First|After that|Finally), ([A-Z][a-z']+)/g,
  to: (a, w1, w) => (NAMES.test(w) ? a : `${w1}, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
  reviewers: "objective",
  reason: 'capital letter after "Now," / "Then," / "First," / "After that," / "Finally," in the middle of a sentence ("Now, Ring the bell.") -> lowercase (same rule as W07-16). The TPR item and its slide keep their capital',
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
fs.writeFileSync(path.join(REPO, ".run9-w1718/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) if (!x.reason.startsWith("capital") && !x.reason.startsWith("canonical")) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
// show what the cap rule kept (names) for a sanity check
const kept = new Set();
for (const wf of m.values()) for (const l of wf.lessons) for (const [p, s] of strings(l)) if (capRule.leaf.test(p)) for (const mm of s.matchAll(capRule.from)) kept.add(mm[0]);
console.log("kept capitals:", [...kept].join(" | "));
