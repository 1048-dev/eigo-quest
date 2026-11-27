// Block-wide decisions -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const rules = [
  { lessons: [133], from: /Give a thumbs up\./g, to: "Give a thumbs-up.", reviewers: "A+B+lint", reason: 'noun "thumbs-up" takes a hyphen; same as L88 and L179 (inconsistent-form warn). Learning item ID of the L133 TPR changes' },
  { lessons: [129], from: /Brilliant!/g, to: "Awesome!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-04)' },
  { lessons: [158], from: /Brilliant!/g, to: "Perfect!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-04)' },
  { lessons: [162], from: /Brilliant!/g, to: "Way to go!", reviewers: "A+C", reason: 'British praise "Brilliant!" -> American (same rule as W01-04)' },
  { lessons: [158], from: /How many cherries! /g, to: "How many cherries? ", reviewers: "objective", reason: 'quiz answer repeats a question: "?" not "!" (W03-04 rule 8)' },
  { lessons: [180], from: /I'm nervous\.\.\.\?$/g, to: "I'm nervous...", reviewers: "objective", reason: 'second quiz choice "I\'m nervous...?" has a stray "?" after the ellipsis' },
];
const patches = [];
for (const r of rules)
  for (const n of r.lessons)
    for (const [p, s] of strings(lessonOf(m, n))) {
      const t = s.replace(r.from, r.to);
      if (t !== s) setAt(lessonOf(m, n), p, t), patches.push({ lesson: n, path: p, before: s, after: t, reviewers: r.reviewers, reason: r.reason });
    }
fs.writeFileSync(path.join(REPO, ".run9-w56/patches/01-central.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.before} -> ${x.after}`);
