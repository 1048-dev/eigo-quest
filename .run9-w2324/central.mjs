// Block-wide decisions for L661-720 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 661 + i);
const NAMES = /^(I|I'm|I'd|I'll|I've|Haru|Kiko|Riko|Birimo|Pipo|Captain|Ms|Mr|Dr|Emma|English|Japan)$/;
const US = "British-leaning praise -> American (same rule as W01-22)";
const SAYLIKE = /(\.(say|subtitleEn)|^teacherScript)$/;
const rules = [
  { lessons: ALL, from: /\bokay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical)' },
  { lessons: [667, 677, 683, 693, 706, 711], from: /Brilliant!$/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  { lessons: [671], from: /Brilliant thinking!$/g, to: "Great thinking!", reviewers: "A+C", reason: US },
  { lessons: [699], from: /^Brilliant! /g, to: "Fantastic! ", reviewers: "A+C", reason: US },
  { lessons: [716], from: /^Lovely blogging!/g, to: "Great blogging!", reviewers: "A+C", reason: US },
  // US words
  { lessons: [678, 683], from: /\bin autumn\b/g, to: "in the fall", leaf: /^teacherScript$/, reviewers: "objective+lint (uk-word)", reason: 'US English: "fall", not "autumn" (style guide; lint uk-word)' },
  { lessons: [675], from: /Leaves fall in autumn\./g, to: "Leaves fall from the trees.", leaf: /\.(say|subtitleEn)$/, reviewers: "objective+lint (uk-word) + B", reason: 'US English has no "autumn"; "Leaves fall in the fall." would mix the verb and the season in one line for learners. Show the falling action instead' },
  { lessons: [675], from: /あきには はっぱが おちるね。/g, to: "きから はっぱが おちるね。", leaf: /subtitleJa$/, reviewers: "objective (JA)", reason: "JA follows the EN fix" },
  {
    lessons: [702], from: /\btimetable\b/g, to: "schedule", reviewers: "objective+lint (uk-word)",
    reason: 'US English: "schedule", not "timetable" (style guide; lint uk-word; world 34 later teaches timetable as the UK word for schedule). Vocab item; ID changes, no test refers to it',
  },
  {
    lessons: [702], from: /\bTimetable\b/g, to: "Schedule", reviewers: "objective+lint (uk-word)",
    reason: 'US English: "schedule", not "timetable" (style guide; lint uk-word)',
  },
  { lessons: [694, 695], from: /Ding, dong!/g, to: "Ding-dong!", leaf: SAYLIKE, reviewers: "objective (block rule)", reason: '"Ding-dong" (one sound word) like W13-22' },
];
// "Now, Water it with a spray." (TPR command after "Now," mid-sentence) -> lowercase. Quoted answers after "Then,"
// (L705 "Then, Don't worry. I'll help you.") and word lists keep their capital.
const capRule = {
  from: /\bNow, ([A-Z][a-z']+)/g,
  to: (a, w) => (NAMES.test(w) ? a : `Now, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: SAYLIKE,
  reviewers: "objective",
  reason: 'capital letter after "Now," in the middle of a sentence ("Now, Water it with a spray.") -> lowercase (same rule as W07-22). The TPR item and its slide keep their capital',
};
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
      const t = c.replace(capRule.from, capRule.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: capRule.reviewers, reason: capRule.reason }); }
    }
  }
}
// merge patches that hit the same field (keep first before, last after)
const merged = new Map();
for (const p of patches) {
  const k = `${p.lesson}|${p.path}`;
  const o = merged.get(k);
  if (o) { o.after = p.after; if (!o.reason.includes(p.reason)) o.reason += "; " + p.reason; }
  else merged.set(k, { ...p });
}
const out = [...merged.values()];
fs.writeFileSync(path.join(REPO, ".run9-w2324/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
for (const x of out) if (!/^(canonical|capital)/.test(x.reason)) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 140)}`);
