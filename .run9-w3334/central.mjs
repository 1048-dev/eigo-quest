// Block-wide decisions for L961-1020 -> patches/01-central.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt, getAt } from "./lib.mjs";
const m = loadWorlds();
const US = "British-leaning praise -> American (same rule as W01-32)";
const SAYEN = /\.(say|subtitleEn)$/;
const JA = /\.(subtitleJa|ja|topic|sceneJa|goalJa|testPoints\[\d+\]|highlightsJa\[\d+\]|explanationJa)$/;
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting assumed the time of day; the child can watch at any time (same as W25-32). Story time stays in the next sentences",
};
const EMMA = {
  reviewers: "A+C (block rule)",
  reason: 'Ms. Emma reads her own script, so her own narration "Ms. Emma says / asks / practices / reads ..." -> "I say / I ask / I practice / I read ..." (same as W17-32); JA エマ先生 -> わたし',
};
const NAME = { reviewers: "objective (JA, block rule)", reason: "JA name of the teacher: ミス・エマ appeared only in W34; the rest of the course says エマ先生" };
const MAYBE = { reviewers: "objective (block rule)", reason: '"Maybe," before a model line -> "You could say," (W29-32 rule)' };
const rules = [
  // British praise
  { lessons: [962, 971, 986, 1005, 1013], from: /Brilliant!$/g, to: "Great job!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [994], from: /^Brilliant!/g, to: "Fantastic!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [1016], from: /^Brilliant, email writers!/g, to: "Great job, email writers!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [982], from: /^Lovely work!/g, to: "Wonderful work!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [996], from: /^Lovely!/g, to: "Nice job!", leaf: SAYEN, reviewers: "A+C", reason: US },
  { lessons: [1018], from: /^Lovely journals!/g, to: "Wonderful journals!", leaf: SAYEN, reviewers: "A+C", reason: US },
  // Ms. Emma's own narration
  { lessons: [966, 967, 968, 1006, 1007, 1008, 1010], from: /\bMs\. Emma says,/g, to: "I say,", leaf: SAYEN, ...EMMA },
  { lessons: [1002], from: /\bMs\. Emma asks,/g, to: "I ask,", leaf: SAYEN, ...EMMA },
  { lessons: [1009], from: /\bMs\. Emma says calmly,/g, to: "I say calmly,", leaf: SAYEN, ...EMMA },
  { lessons: [1009], from: "エマ先生が おちついて いうよ。", to: "わたしは おちついて いうよ。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [966, 967, 968, 1002, 1006, 1007, 1008, 1010], from: /エマ先生「/g, to: "わたし「", leaf: /\.subtitleJa$/, ...EMMA, onlyIfSayHas: /\bI (say|ask),/ },
  { lessons: [969], from: /^Ms\. Emma practices\./g, to: "I practice.", leaf: SAYEN, ...EMMA },
  { lessons: [969], from: /^エマ先生が れんしゅう するよ。/g, to: "わたしが れんしゅう するよ。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [970], from: /^Ms\. Emma reads\./g, to: "I read.", leaf: SAYEN, ...EMMA },
  { lessons: [970], from: /^エマ先生が よむよ。/g, to: "わたしが よむよ。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1005], from: "Kiko goes to the desk with Ms. Emma.", to: "Kiko goes to the desk with me.", leaf: SAYEN, ...EMMA },
  { lessons: [1005], from: "キコちゃんが エマ先生と フロントへ。", to: "キコちゃんが わたしと フロントへ。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1006], from: "Today, Ms. Emma has a secret.", to: "Today, I have a secret.", leaf: SAYEN, ...EMMA },
  { lessons: [1006], from: "きょうは エマ先生から ひみつの はなし。", to: "きょうは わたしから ひみつの はなし。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1006], from: "We go to the airport with Ms. Emma.", to: "We all go to the airport together.", leaf: SAYEN, ...EMMA },
  { lessons: [1006], from: "みんなで エマ先生と 空港へ。", to: "みんなで いっしょに 空港へ。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1007], from: "Last time, Ms. Emma got her blue suitcase back.", to: "Last time, I got my blue suitcase back.", leaf: SAYEN, ...EMMA },
  { lessons: [1007], from: "エマ先生の あおい スーツケース", to: "わたしの あおい スーツケース", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1009], from: "this morning, Ms. Emma is checking her backpack, her jacket, her suitcase.", to: "this morning, I'm checking my backpack, my jacket, and my suitcase.", leaf: SAYEN, ...EMMA },
  { lessons: [1009], from: "エマ先生が リュック、ジャケット、スーツケースを しらべて いるよ。", to: "わたしは リュック、ジャケット、スーツケースを しらべて いるの。", leaf: /\.subtitleJa$/, ...EMMA },
  { lessons: [1010], from: "Last time, Ms. Emma's passport was found.", to: "Last time, my passport was found.", leaf: SAYEN, ...EMMA },
  { lessons: [1010], from: "エマ先生の パスポートが", to: "わたしの パスポートが", leaf: /\.subtitleJa$/, ...EMMA },
  // JA name ミス・エマ -> エマ先生
  { lessons: [998, 1006, 1009, 1011, 1016, 1020], from: /ミス・エマ/g, to: "エマ先生", leaf: JA, ...NAME },
  // time-of-day greetings of Ms. Emma (segments[0] only)
  { lessons: [973, 982, 992, 1003, 1009], from: /^Good morning, everyone!/g, to: "Hi, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [980], from: /^Good morning, hosts!/g, to: "Hi, hosts!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1011], from: /^Good morning, travelers!/g, to: "Hi, travelers!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1019], from: /^Good morning, everyone!/g, to: "Hello, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [973, 980, 982, 992, 1003, 1009, 1011, 1019], from: /^おはよう、/g, to: "やあ、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [1001, 1013], from: /^Good evening, everyone!/g, to: "Hello, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1018], from: /^Good evening, writers!/g, to: "Hello, writers!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1001, 1013, 1018], from: /^こんばんは、/g, to: "こんにちは、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  // "Maybe," before a model
  { lessons: [988], from: "Make your own promise. Maybe, I promise", to: "Make your own promise. You could say, I promise", leaf: SAYEN, ...MAYBE },
  // autumn -> fall
  { lessons: [967], from: "mostly in summer and autumn.", to: "mostly in summer and fall.", leaf: /^teacherScript$/, reviewers: "objective (block rule)", reason: "US English: autumn -> fall (W27-32 rule)" },
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
fs.writeFileSync(path.join(REPO, ".run9-w3334/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
if (process.argv.includes("--show")) for (const x of out) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
