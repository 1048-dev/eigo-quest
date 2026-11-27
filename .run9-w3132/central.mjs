// Block-wide decisions for L901-960 -> patches/01-central.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt, getAt } from "./lib.mjs";
const m = loadWorlds();
const US = "British-leaning praise -> American (same rule as W01-30)";
const SAYEN = /\.(say|subtitleEn)$/;
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting / goodbye assumed the time of day; the child can watch at any time (same as W25-30). Story time stays in the next sentences",
};
const EMMA = {
  reviewers: "A+C (block rule)",
  reason: 'Ms. Emma reads her own script, so "Ms. Emma says / asks" -> "I say / I ask" (same as W17-30); JA エマ先生「 -> わたし「',
};
const OR = {
  reviewers: "objective (block rule)",
  reason: 'spoken model "A. Or, B." -> "Or B." (no comma after Or; same as W03-30); "Maybe," before a model line -> "You could say," (W29-30 rule)',
};
const rules = [
  // British praise
  { lessons: [905, 907, 915, 924, 932, 948, 953], from: /Brilliant!$/g, to: "Great job!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [907], from: "by many inventors. Brilliant! Riko finds", to: "by many inventors. Great job! Riko finds", leaf: /^teacherScript$/, reviewers: "A+C", reason: US },
  { lessons: [910], from: /^Brilliant guides!/g, to: "Great guides!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [946], from: /^Brilliant!/g, to: "Fantastic!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [928], from: "she is always kind. Lovely! Haru says", to: "she is always kind. Nice! Haru says", leaf: /^teacherScript$/, reviewers: "A+C", reason: US },
  // Ms. Emma's own narration
  { lessons: [906, 908, 943, 944, 946, 954, 955, 957], from: /\bMs\. Emma says,/g, to: "I say,", leaf: SAYEN, ...EMMA },
  { lessons: [926], from: /\bMs\. Emma asks,/g, to: "I ask,", leaf: SAYEN, ...EMMA },
  { lessons: [906, 926, 943, 944, 946, 954, 955, 957], from: /エマ先生「/g, to: "わたし「", leaf: /\.subtitleJa$/, ...EMMA, onlyIfSayHas: /\bI (say|ask),/ },
  // time-of-day greetings / goodbyes of Ms. Emma
  { lessons: [933, 941], from: /^Good morning, explorers!/g, to: "Hi, explorers!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [933, 941], from: /^おはよう、/g, to: "やあ、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [956], from: /^Good evening, everyone!/g, to: "Hello, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [956], from: /^こんばんは、みんな！/g, to: "こんにちは、みんな！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [932, 956], from: /Good night, and see you!$/g, to: "See you!", leaf: SAYEN, ...GREET },
  { lessons: [932, 956], from: /おやすみ、またね！$/g, to: "またね！", leaf: /\.subtitleJa$/, ...GREET },
  // "Or," / "Maybe," in spoken models
  { lessons: [904], from: "I like kites! Or, I like both!", to: "I like kites! Or I like both!", leaf: SAYEN, ...OR },
  { lessons: [913], from: "became a doctor. Or, she studied", to: "became a doctor. Or she studied", leaf: SAYEN, ...OR },
  { lessons: [911], from: "Maybe, She was born in a big city. Or, He was born near the sea.", to: "You could say, She was born in a big city. Or he was born near the sea.", leaf: SAYEN, ...OR },
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
fs.writeFileSync(path.join(REPO, ".run9-w3132/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
if (process.argv.includes("--show")) for (const x of out) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
