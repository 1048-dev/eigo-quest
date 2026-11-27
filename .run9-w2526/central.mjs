// Block-wide decisions for L721-780 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 721 + i);
const US = "British-leaning praise -> American (same rule as W01-24)";
const SAYLIKE = /(\.(say|subtitleEn)|^teacherScript)$/;
const WHO = {
  leaf: /\.(say|subtitleEn)$/,
  reviewers: "B+C (block rule)",
  reason: 'relative clause with "who" is kept for Stage 4 (world 25/26 test rules forbid "a person who" in scripts; same fix as W23-24 L661/L670/L701). Use a plain sentence; JA unchanged',
};
const rules = [
  {
    lessons: ALL, from: /\b[Oo]kay\b/g, to: "OK", reviewers: "objective+lint",
    reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical). L751/L778 phonics words "Okay!" / "Well, okay…" -> "OK!" / "Well, OK…" with src/lib/curriculum/w26Phonics.ts and tests/phonics-w26.test.ts (same as W21-22 L654)',
  },
  { lessons: [721, 744, 765], from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  { lessons: [727], from: /Brilliant thinking!/g, to: "Great thinking!", reviewers: "A+C", reason: US },
  { lessons: [732], from: /Brilliant, detectives!/g, to: "Great job, detectives!", reviewers: "A+C", reason: US },
  { lessons: [763], from: /^Lovely work!/g, to: "Great work!", reviewers: "A+C", reason: US },
  { lessons: [763], from: /^Lovely! First, a problem\./g, to: "Great! First, a problem.", reviewers: "A+C", reason: US },
  { lessons: [737], from: /Or, Give me a hint, please\./g, to: "Or give me a hint, please.", leaf: /^teacherScript$/, reviewers: "objective", reason: 'spoken "A. Or, B." running example -> "Or b." (W03-24 rule; teacherScript)' },
  { lessons: [734], from: "Witness. A person who saw something happen.", to: "Witness. A witness sees something happen.", ...WHO },
  { lessons: [742], from: "Thief. Someone who takes a thing, but it's not theirs.", to: "Thief. A thief takes a thing, but it's not theirs.", ...WHO },
  { lessons: [748], from: "Guard. A person who watches and keeps things safe.", to: "Guard. A guard watches and keeps things safe.", ...WHO },
  { lessons: [750], from: "Audience. The people who watch a show.", to: "Audience. The people watching a show.", ...WHO },
  { lessons: [752], from: "Actor. A person who acts in a play.", to: "Actor. An actor acts in a play.", ...WHO },
  { lessons: [754], from: "Judge. The person who watches and chooses.", to: "Judge. The judge watches and chooses.", ...WHO },
  { lessons: [761], from: "Narrator. The person who tells the story.", to: "Narrator. The narrator tells the story.", ...WHO },
  { lessons: [767], from: "Audience. The people who watch the show.", to: "Audience. The people watching the show.", ...WHO },
];
const patches = [];
const cur = (l, p) => strings(l).find(([q]) => q === p)[1];
for (const r of rules) {
  let hit = 0;
  for (const n of r.lessons) {
    const l = lessonOf(m, n);
    for (const [p] of strings(l)) {
      if (r.leaf && !r.leaf.test(p)) continue;
      const c = cur(l, p);
      const t = typeof r.from === "string" ? c.split(r.from).join(r.to) : c.replace(r.from, r.to);
      if (t !== c) { hit++; setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
  }
  if (!hit) throw new Error(`rule not hit: ${r.from}`);
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
fs.writeFileSync(path.join(REPO, ".run9-w2526/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
for (const x of out) if (!/^canonical/.test(x.reason)) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 140)}`);
void SAYLIKE;
