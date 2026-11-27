// Block-wide decisions for L841-900 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt, getAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 841 + i);
const US = "British-leaning praise -> American (same rule as W01-28)";
const SAYEN = /\.(say|subtitleEn)$/;
const SAYENTS = /(\.(say|subtitleEn)|^teacherScript)$/;
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting assumed the time of day; the child can watch at any time (same as W25-28). Story time stays in the next sentence",
};
const EMMA = {
  reviewers: "A+C (block rule)",
  reason: 'Ms. Emma reads her own script, so "Ms. Emma says / asks / explains / has" -> "I say / I ask / I explain / I have" (same as W17-28); JA エマ先生「 -> わたし「',
};
const rules = [
  // British praise
  { lessons: [844, 858, 864, 874, 894], from: /Brilliant!$/g, to: "Great job!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [845], from: /^Brilliant!/g, to: "Fantastic!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [846, 859], from: /^Lovely work!/g, to: "Great work!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [846], from: /^Lovely! When you agree/g, to: "Great! When you agree", reviewers: "A+C", reason: US + " (conversation line and its slide)" },
  { lessons: [862], from: "but I think green is the best color. Lovely! Pip says", to: "but I think green is the best color. Nice! Pip says", leaf: /^teacherScript$/, reviewers: "A+C", reason: US },
  { lessons: [869], from: /^What a lovely tour!/g, to: "What a great tour!", leaf: SAYEN, reviewers: "A+C", reason: US },
  // Ms. Emma's own narration
  { lessons: [847, 887], from: /\bMs\. Emma says,/g, to: "I say,", leaf: SAYENTS, ...EMMA },
  { lessons: [862, 882, 886], from: /\bMs\. Emma asks,/g, to: "I ask,", leaf: SAYENTS, ...EMMA },
  { lessons: [862], from: /エマ先生「/g, to: "わたし「", leaf: /\.subtitleJa$/, ...EMMA, onlyIfSayHas: /\bI ask\b/ },
  { lessons: [855], from: "Today, Ms. Emma has a plan. She says, Back home,", to: "Today, I have a plan. Back home,", leaf: /^teacherScript$/, ...EMMA },
  { lessons: [868], from: "Ms. Emma explains the steps.", to: "I explain the steps.", leaf: /^teacherScript$/, ...EMMA },
  // time-of-day greetings in Ms. Emma's opening segment
  { lessons: [843, 873], from: /^Good morning, everyone!/g, to: "Hi, everyone!", leaf: SAYEN, ...GREET },
  { lessons: [857, 860], from: /^Good morning, friends!/g, to: "Hi, friends!", leaf: SAYEN, ...GREET },
  { lessons: [895], from: /^Good morning, city planners!/g, to: "Hi, city planners!", leaf: SAYEN, ...GREET },
  { lessons: [859], from: /^Good evening, everyone!/g, to: "Hello, everyone!", leaf: SAYEN, ...GREET },
  { lessons: [843, 857, 860, 873], from: /^おはよう、みんな！/g, to: "やあ、みんな！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [895], from: /^おはよう、/g, to: "やあ、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [859], from: /^こんばんは、みんな！/g, to: "こんにちは、みんな！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  // one katakana name for Nova
  { lessons: ALL, from: /ノヴァ/g, to: "ノバ", reviewers: "objective (JA)", reason: "Nova was written ノバ in L871-890 and ノヴァ in L891-900; use one name (ノバ, easier for kids)" },
];
const patches = [];
for (const r of rules) {
  let hit = 0;
  for (const n of r.lessons) {
    const l = lessonOf(m, n);
    for (const [p, c] of strings(l)) {
      if (r.leaf && !r.leaf.test(p)) continue;
      if (r.onlyIfSayHas && !r.onlyIfSayHas.test(getAt(l, p.replace(/subtitleJa$/, "say")) ?? "")) continue;
      const t = typeof r.from === "string" ? c.split(r.from).join(r.to) : c.replace(r.from, r.to);
      if (t !== c) { hit++; setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
  }
  if (!hit) throw new Error(`rule not hit: ${r.from}`);
}
const merged = new Map();
for (const p of patches) {
  const k = `${p.lesson}|${p.path}`;
  const o = merged.get(k);
  if (o) { o.after = p.after; if (!o.reason.includes(p.reason)) o.reason += "; " + p.reason; if (!o.reviewers.includes(p.reviewers)) o.reviewers += ", " + p.reviewers; }
  else merged.set(k, { ...p });
}
const out = [...merged.values()];
fs.writeFileSync(path.join(REPO, ".run9-w2930/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
for (const x of out) if (process.argv.includes("--show")) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 150)}`);
