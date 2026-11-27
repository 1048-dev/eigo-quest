// Block-wide decisions for L601-660 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 601 + i);
const NAMES = /^(I|I'm|I'd|I'll|I've|Haru|Kiko|Riko|Birimo|Pipo|Captain|Ember|Lulu|Leo|Sparky|Ms|Mr|Emma|English|Japan)$/;
const US = "British-leaning praise -> American (same rule as W01-20)";
const rules = [
  { lessons: ALL, from: /\bOkay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "Okay" (style guide; lint canonical)' },
  { lessons: ALL, from: /\bokay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical). L654 phonics item "Are you OK": w22Phonics.ts table key and test updated' },
  { lessons: [634], from: /Lovely manners!/g, to: "Great manners!", reviewers: "A+C", reason: US },
  { lessons: [621, 628, 654], from: /\bLovely!/g, to: "Great!", reviewers: "A+C", reason: US },
  { lessons: [614], from: /^Brilliant relay team!/g, to: "Great relay team!", reviewers: "A+C", reason: US },
  { lessons: [647], from: /^Brilliant work!/g, to: "Fantastic work!", reviewers: "A+C", reason: US },
  { lessons: [620, 635, 644], from: /Brilliant!$/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  // ASCII ellipsis in English titles / slides (lint punctuation; W01-02 rule)
  { lessons: [612], from: /…/g, to: "...", leaf: /^(title|teacher\.segments\[\d+\]\.slide\.(title|items\[\d+\]))$/, reviewers: "objective+lint (punctuation)", reason: 'ASCII "..." in English, not "…" (lint punctuation; same rule as W01-02). titles.json updated' },
  // US word
  { lessons: [652], from: /where is the toilet\?/g, to: "where is the bathroom?", reviewers: "objective+lint (uk-word)", reason: 'US English: "bathroom", not "toilet" (style guide; lint uk-word)' },
  // Japanese name of the past form
  { lessons: [638], from: /むかしの かたち/g, to: "すぎた かたち", reviewers: "B (+ W15-20 block rule)", reason: "JA name of the past form: 「すぎた かたち」 like W15-20 (むかし means long ago)" },
  { lessons: [633], from: /むかしの ことを いう かたち/g, to: "すぎた ことを いう かたち", reviewers: "B (+ W15-20 block rule)", reason: "JA name of the past form: 「すぎた ～」 like W15-20 (むかし means long ago)" },
];
// "Now, Write a note quickly!" (TPR command after "Now," mid-sentence) -> lowercase. Quoted answers after "Then," / "First,"
// (L611 "Then, Sure. I'll tell her.", L634 "First, You should read it.") and word lists (First, Then, Also) keep their capital.
const capRule = {
  from: /\bNow, ([A-Z][a-z']+)/g,
  to: (a, w) => (NAMES.test(w) ? a : `Now, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
  reviewers: "objective",
  reason: 'capital letter after "Now," in the middle of a sentence ("Now, Write a note quickly!") -> lowercase (same rule as W07-20). The TPR item and its slide keep their capital',
};
const extra = [{ lesson: 614, from: "Then, Pass it on!", to: "Then, pass it on!" }];
const patches = [];
const cur = (l, p) => strings(l).find(([q]) => q === p)[1];
for (const n of ALL) {
  const l = lessonOf(m, n);
  for (const [p] of strings(l)) {
    for (const r of rules) {
      if (!r.lessons.includes(n)) continue;
      if (r.leaf && !r.leaf.test(p)) continue;
      const c = cur(l, p);
      const t = c.replace(r.from, r.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
    if (capRule.leaf.test(p)) {
      const c = cur(l, p);
      let t = c.replace(capRule.from, capRule.to);
      for (const e of extra) if (e.lesson === n) t = t.replace(e.from, e.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: capRule.reviewers, reason: capRule.reason }); }
    }
  }
}
fs.writeFileSync(path.join(REPO, ".run9-w2122/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) if (!/^(canonical)/.test(x.reason)) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 140)}`);
