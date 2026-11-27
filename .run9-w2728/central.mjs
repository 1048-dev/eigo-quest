// Block-wide decisions for L781-840 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt, getAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 781 + i);
const US = "British-leaning praise -> American (same rule as W01-26)";
const SAYEN = /\.(say|subtitleEn)$/;
const WHO = {
  leaf: SAYEN,
  reviewers: "B+C (block rule)",
  reason: 'relative clause with "who / that" is kept for Stage 4 (world 27/28 test rules forbid "person/someone who" in scripts; same fix as W23-26 word definitions). Use a plain sentence; JA unchanged',
};
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting assumed the time of day; the child can watch at any time (same as W25-26 L725/L732/L742/L753). Story time stays in the next sentence",
};
const rules = [
  { lessons: ALL, from: /\b[Oo]kay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical)' },
  {
    lessons: ALL, from: /\bautumn\b/g, to: "fall", reviewers: "objective+lint",
    reason: 'US English: "autumn" -> "fall" (lint uk-word; same as W19-24). L818 expression "I think fall is the best." changes its learning-item ID (aiTask targets, recap and slides follow)',
  },
  { lessons: ALL, from: /\bAutumn\b/g, to: "Fall", reviewers: "objective+lint", reason: 'US English: "Autumn" -> "Fall" (lint uk-word)' },
  { lessons: [837], from: /\bfootball\b/g, to: "soccer", reviewers: "objective+lint", reason: 'US English: "football" means American football in the US; the JA already says サッカー (lint uk-word)' },
  {
    lessons: [808], from: /\bpen friend\b/g, to: "pen pal", reviewers: "objective (US)",
    reason: 'US English says "pen pal" ("pen friend" is British); L826 and W21 already say "pen pal". The L808 vocab item changes its learning-item ID',
  },
  { lessons: [808], from: /ペンフレンド/g, to: "ペンパル", reviewers: "objective (JA)", reason: "JA follows the EN pen pal (L826 already says ペンパル)" },
  { lessons: [788], from: /^Brilliant!/g, to: "Fantastic!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [797, 802, 814], from: /Brilliant!$/g, to: "Great job!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [818, 836], from: /^Lovely work!/g, to: "Great work!", leaf: SAYEN, reviewers: "A+C", reason: US },
  // Ms. Emma's own narration
  {
    lessons: ALL, from: /\bMs\. Emma (says|asks)\b/g, to: (a, v) => `I ${v.slice(0, -1)}`, leaf: /(\.(say|subtitleEn)|^teacherScript)$/, reviewers: "A+C (block rule)",
    reason: 'Ms. Emma reads her own script, so "Ms. Emma says / asks" -> "I say / I ask" (same as W17-26); JA エマ先生「 -> わたし「',
  },
  { lessons: ALL, from: /エマ先生「/g, to: "わたし「", leaf: /\.subtitleJa$/, reviewers: "A+C (block rule)", reason: "JA follows I say / I ask (Ms. Emma speaks about herself)", onlyIfSayHas: /\bI (say|ask)\b/ },
  { lessons: [786], from: /Three times a week\. Or, Every day\./g, to: "Three times a week. Or every day.", leaf: /^teacherScript$/, reviewers: "objective", reason: 'spoken "A. Or, B." running example -> "Or b." (W03-26 rule; teacherScript)' },
  // time-of-day greetings in Ms. Emma's opening segment
  { lessons: [782], from: /^Good morning, friends!/g, to: "Hi, friends!", leaf: SAYEN, ...GREET },
  { lessons: [786, 794, 797, 813, 818, 824], from: /^Good morning, everyone!/g, to: "Hi, everyone!", leaf: SAYEN, ...GREET },
  { lessons: [806], from: /^Good morning, travelers!/g, to: "Hi, travelers!", leaf: SAYEN, ...GREET },
  { lessons: [787, 791], from: /^Good evening, everyone!/g, to: "Hello, everyone!", leaf: SAYEN, ...GREET },
  { lessons: [782, 786, 794, 797, 806, 813, 818, 824], from: /^おはよう、/g, to: "やあ、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [786], from: /^みんな、おはよう！/g, to: "やあ、みんな！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [787], from: /^みんな、こんばんは！/g, to: "こんにちは、みんな！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [791], from: /^こんばんは、/g, to: "こんにちは、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  // who / that definitions
  { lessons: [820], from: "Guide. A person who shows you a new place.", to: "Guide. A guide shows you a new place.", ...WHO },
  { lessons: [828], from: "Clue. A small thing that helps you solve a mystery.", to: "Clue. It helps you solve a mystery.", ...WHO },
  { lessons: [834], from: "Audience. All the people who watch the show.", to: "Audience. All the people watching the show.", ...WHO },
  { lessons: [810], from: "Think of someone who helps you. Say thank you to them.", to: "Think of a helper in your life. Say thank you to them.", ...WHO },
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
// merge patches that hit the same field (keep first before, last after)
const merged = new Map();
for (const p of patches) {
  const k = `${p.lesson}|${p.path}`;
  const o = merged.get(k);
  if (o) { o.after = p.after; if (!o.reason.includes(p.reason)) o.reason += "; " + p.reason; if (!o.reviewers.includes(p.reviewers)) o.reviewers += ", " + p.reviewers; }
  else merged.set(k, { ...p });
}
const out = [...merged.values()];
fs.writeFileSync(path.join(REPO, ".run9-w2728/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
for (const x of out) if (process.argv.includes("--show")) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 150)}`);
