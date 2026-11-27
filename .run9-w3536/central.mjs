// Block-wide decisions for L1021-1080 -> patches/01-central.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt, getAt } from "./lib.mjs";
const m = loadWorlds();
const US = { reviewers: "A+C (block rule)", reason: "British-leaning praise -> American (same rule as W01-34)" };
const SAYEN = /\.(say|subtitleEn)$/;
const TS = /^teacherScript$/;
const SAYTS = /(\.(say|subtitleEn)|^teacherScript)$/;
const JA = /(\.(subtitleJa|ja|topic|sceneJa|goalJa|explanationJa)|testPoints\[\d+\]|highlightsJa\[\d+\])$/;
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting assumed the time of day; the child can watch at any time (same as W25-34). Story time stays in the next sentences",
};
const EMMA = {
  reviewers: "A+C (block rule)",
  reason: 'Ms. Emma reads her own script, so her own narration "Ms. Emma says / asks / ... with Ms. Emma" -> "I say / I ask / ... with me" (same as W17-34, say + subtitles + teacherScript); JA エマ先生 -> わたし',
};
const NAME = { reviewers: "objective (JA, block rule)", reason: "JA name of the teacher: ミス・エマ -> エマ先生 (the rest of the course)" };
const OR = { reviewers: "A+C (block rule)", reason: '"Or, ~" before a second model -> "Or ~" (W25-34 rule; no pause after Or)' };
const OK = { reviewers: "objective (block rule)", reason: "house spelling: okay -> OK (style guide, W25-34)" };
const VAC = { reviewers: "objective (US policy)", reason: "US English: in the (summer) holidays -> during (summer) vacation" };
const SCHED = { reviewers: "objective (US policy)", reason: "US English: (school) timetable -> schedule (lint uk-word; US schools say class schedule)" };
const E = (lesson, from, to, leaf = TS) => ({ lessons: [lesson], from, to, leaf, ...EMMA });
const rules = [
  // British praise
  { lessons: [1022, 1033, 1042, 1051], from: /Brilliant!$/g, to: "Great job!", leaf: SAYEN, ...US },
  { lessons: [1029, 1036, 1068, 1076], from: /^Brilliant! You can/g, to: "Great job! You can", leaf: SAYEN, ...US },
  { lessons: [1029], from: /Lovely!$/g, to: "Nice job!", leaf: SAYEN, ...US },
  { lessons: [1029, 1036, 1047], from: /Lovely! /g, to: "Wonderful! ", leaf: TS, ...US },
  // Ms. Emma's own narration: say / subtitles
  { lessons: [1026, 1053, 1056, 1062, 1063, 1065, 1069], from: /\bMs\. Emma asks,/g, to: "I ask,", leaf: SAYEN, ...EMMA },
  { lessons: [1052, 1054, 1069, 1070], from: /\bMs\. Emma says,/g, to: "I say,", leaf: SAYEN, ...EMMA },
  { lessons: [1026], from: "エマ先生が きくよ。「", to: "わたしが きくよ。「", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1052, 1053, 1054, 1056, 1062, 1063, 1065, 1069, 1070], from: /エマ先生「/g, to: "わたし「", leaf: /segments\[\d+\]\.subtitleJa$/, ...EMMA, onlyIfSayHas: /\bI (say|ask),/ },
  E(1059, "Today, we look at web pages with Ms. Emma and Dr. Vale.", "Today, we look at web pages with Dr. Vale.", SAYEN),
  E(1059, "エマ先生と ヴェイルはかせと いっしょに", "ヴェイルはかせと いっしょに", /\.subtitleJa$/),
  // Ms. Emma's own narration: teacherScript
  { lessons: [1021, 1034, 1043, 1045, 1046, 1047, 1048, 1058, 1059, 1073, 1078], from: /\bMs\. Emma says,/g, to: "I say,", leaf: TS, ...EMMA },
  E(1021, "We walk with Ms. Emma into a town", "We walk into a town"),
  E(1022, "We sit with Ms. Emma, and Birimo", "We sit together, and Birimo"),
  E(1025, "Ms. Emma holds out her right hand and says,", "I hold out my right hand and say,"),
  E(1028, "First, Ms. Emma tells us three important things.", "First, I'll tell you three important things."),
  E(1029, "We go out to the Hall's garden with Ms. Emma and play", "We go out to the Hall's garden and play"),
  E(1034, "Then Ms. Emma finds a notice", "Then I find a notice"),
  E(1035, "with Ms. Emma and the other adults", "with me and the other adults"),
  E(1038, "Olive takes us outside, with Ms. Emma, to the empty lot", "Olive takes us outside to the empty lot"),
  E(1045, "Riko asks Ms. Emma, Could you", "Riko asks me, Could you"),
  E(1049, "with Ms. Emma. On the top bookshelf", "with me. On the top bookshelf"),
  E(1049, "Ms. Emma reaches up and takes it down for him.", "I reach up and take it down for him."),
  E(1051, "leads us, with Ms. Emma, to a small", "leads us to a small"),
  E(1052, "to the aquarium hall with Ms. Emma and Dr. Vale.", "to the aquarium hall with Dr. Vale."),
  E(1055, "Ms. Emma, Dr. Vale and Lumi sit in the front row.", "Dr. Vale, Lumi and I sit in the front row."),
  E(1057, "Lumi leads us, with Ms. Emma, through", "Lumi leads us through"),
  E(1059, "Today, Ms. Emma and Dr. Vale help us look", "Today, Dr. Vale and I help everyone look"),
  E(1059, "Ms. Emma adds,", "I add,"),
  E(1060, "in the Research Center with Ms. Emma and make", "in the Research Center and make"),
  E(1061, "Ms. Emma and Dr. Vale take us to the Coral Library.", "Dr. Vale takes us to the Coral Library."),
  E(1064, "Ms. Emma whispers,", "I whisper,"),
  E(1065, "Ms. Emma puts a big sand timer", "I put a big sand timer"),
  E(1069, "Ms. Emma explains that", "I explain that"),
  E(1070, "Ms. Emma gives Haru two tips.", "I give Haru two tips."),
  E(1074, "to the Coral Library with Ms. Emma. Mr. Oswin", "to the Coral Library with me. Mr. Oswin"),
  E(1076, "So we go to the Coral Library with Ms. Emma.", "So we go to the Coral Library together."),
  E(1079, ", together with Ms. Emma and Dr. Vale.", ", together with Dr. Vale."),
  E(1080, "Ms. Emma and Dr. Vale sit in the front row", "Dr. Vale and I sit in the front row"),
  // JA name
  { lessons: [1045], from: /ミス・エマ/g, to: "エマ先生", leaf: JA, ...NAME },
  // time-of-day greetings of Ms. Emma (segments[0] only)
  { lessons: [1022], from: /^Good morning, everyone!/g, to: "Hi, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1022, 1062], from: /^みんな、おはよう！/g, to: "みんな、やあ！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [1033], from: /^Good morning, team!/g, to: "Hi, team!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1033], from: /^おはよう、/g, to: "やあ、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [1043], from: /^Good morning, everyone!/g, to: "Hello, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1043], from: /^おはよう、みんな！/g, to: "こんにちは、みんな！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [1062], from: /^Good morning, friends!/g, to: "Hi, friends!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  // Or,
  { lessons: [1022, 1027], from: / Or, (\w)/g, to: " Or $1", leaf: SAYEN, ...OR },
  // okay -> OK
  { lessons: [1054, 1059], from: /\bokay\b/g, to: "OK", leaf: TS, ...OK },
  { lessons: [1057], from: /\bOkay, then/g, to: "OK, then", leaf: /lines\[\d+\]\.en$|\.(say|subtitleEn)$|items\[\d+\]$|^teacherScript$/, ...OK },
  // US: holidays -> vacation (L1048, also the expression; tests do not pin it)
  { lessons: [1048], from: /in the summer holidays/g, to: "during summer vacation", leaf: SAYTS, ...VAC },
  { lessons: [1048], from: /\bin the holidays\b/g, to: "during vacation", leaf: /(say|subtitleEn|teacherScript|\.en|targetExpressions\[\d+\]|items\[\d+\]|highlightsJa\[\d+\]|grammar|testPoints\[\d+\]|explanationJa|goalJa)$/, ...VAC },
  // US: timetable -> schedule (L1023 vocab)
  { lessons: [1023], from: /timetable/g, to: "schedule", leaf: /.*/, ...SCHED },
  { lessons: [1023], from: /Timetable/g, to: "Schedule", leaf: /.*/, ...SCHED },
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
fs.writeFileSync(path.join(REPO, ".run9-w3536/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
if (process.argv.includes("--show")) for (const x of out) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
