// Block-wide decisions for L1081-1140 -> patches/01-central.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt, getAt } from "./lib.mjs";
const m = loadWorlds();
const US = { reviewers: "A+C (block rule)", reason: "British-leaning praise -> American (same rule as W01-36)" };
const SAYEN = /\.(say|subtitleEn)$/;
const TS = /^teacherScript$/;
const JASEG = /segments\[\d+\]\.subtitleJa$/;
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting assumed the time of day; the child can watch at any time (same as W25-36). Story time (Tonight is ~, This morning ~) stays in the next sentences",
};
const EMMA = {
  reviewers: "A+C (block rule)",
  reason: 'Ms. Emma reads her own script, so her own narration "Ms. Emma says / asks / smiles / sits ... with Ms. Emma" -> "I say / I ask / I smile / I sit ... (with me / together)" (same as W17-36, say + subtitles + teacherScript); JA エマ先生 -> わたし',
};
const E = (lesson, from, to, leaf = TS) => ({ lessons: [lesson], from, to, leaf, ...EMMA });
const rules = [
  // British praise
  { lessons: [1086, 1125, 1130, 1132], from: /Brilliant!$/g, to: "Great job!", leaf: SAYEN, ...US },
  { lessons: [1094], from: "Brilliant listening!", to: "Great listening!", leaf: SAYEN, ...US },
  { lessons: [1097, 1127], from: /^Brilliant! You can/g, to: "Great job! You can", leaf: SAYEN, ...US },
  { lessons: [1130], from: "great idea. Brilliant! Let's read", to: "great idea. Great job! Let's read", leaf: TS, ...US },
  { lessons: [1092], from: /Lovely!$/g, to: "Nice job!", leaf: SAYEN, ...US },
  { lessons: [1109, 1114], from: "Lovely! ", to: "Wonderful! ", leaf: TS, ...US },
  { lessons: [1124], from: /^Lovely news\?/g, to: "Good news?", leaf: SAYEN, ...US },
  // Ms. Emma's own narration: say / subtitles
  { lessons: [1089, 1090, 1099, 1100], from: /\bMs\. Emma says,/g, to: "I say,", leaf: SAYEN, ...EMMA },
  { lessons: [1096, 1123, 1124, 1137, 1139, 1140], from: /\bMs\. Emma asks,/g, to: "I ask,", leaf: SAYEN, ...EMMA },
  { lessons: [1087], from: "Ms. Emma reads,", to: "I read,", leaf: SAYEN, ...EMMA },
  { lessons: [1087], from: "エマ先生が 読むよ。", to: "わたしが 読むよ。", leaf: JASEG, ...EMMA },
  { lessons: [1136], from: "Ms. Emma laughs.", to: "I laugh.", leaf: SAYEN, ...EMMA },
  { lessons: [1136], from: "エマ先生は わらって", to: "わたしは わらって", leaf: JASEG, ...EMMA },
  { lessons: [1089, 1090, 1096, 1099, 1100, 1123, 1124, 1137, 1139, 1140], from: /エマ先生「/g, to: "わたし「", leaf: JASEG, ...EMMA, onlyIfSayHas: /\bI (say|ask),/ },
  // Ms. Emma's own narration: teacherScript
  { lessons: [1123, 1132], from: /\bMs\. Emma says,/g, to: "I say,", leaf: TS, ...EMMA },
  { lessons: [1098], from: /\bMs\. Emma asks,/g, to: "I ask,", leaf: TS, ...EMMA },
  E(1081, "and Ms. Emma leads the four of us along", "and I lead everyone along"),
  E(1082, "Today, Ms. Emma and Nib lead us down a path", "Today, Nib and I lead everyone down a path"),
  E(1083, "Ms. Emma smiles and explains.", "I smile and explain."),
  E(1089, "Kiko holds Ms. Emma's hand.", "Kiko holds my hand."),
  E(1091, "Ms. Emma walks at the front with a lantern", "I walk at the front with a lantern"),
  E(1092, "Ms. Emma goes first, and we follow her down", "I go first, and everyone follows me down"),
  E(1094, "We sit around Ms. Emma on a soft rug.", "We all sit together on a soft rug."),
  E(1097, "Ms. Emma reads Kiko's first try out loud.", "I read Kiko's first try out loud."),
  E(1099, "Ms. Emma adds,", "I add,"),
  E(1100, "Ms. Emma lights the candles.", "I light the candles."),
  E(1105, "Ms. Emma sits with us in the firelight.", "I sit with everyone in the firelight."),
  E(1106, "Ms. Emma asks one big question.", "I ask one big question."),
  E(1108, "Ms. Emma walks around the room and helps everyone.", "I walk around the room and help everyone."),
  E(1110, "Ms. Emma sits with us, and Nib stands", "I sit with everyone, and Nib stands"),
  E(1114, "Today, Ms. Emma takes us down the hill", "Today, I take everyone down the hill"),
  E(1120, "Ms. Emma has a plan. You've learned so much about listening, she says.", "I have a plan. I say, You've learned so much about listening."),
  E(1120, "Ms. Emma reminds us that", "I remind everyone that"),
  E(1121, "Ms. Emma calmly says,", "I calmly say,"),
  E(1126, "Ms. Emma sets her alarm clock", "I set my alarm clock"),
  E(1127, "out of the farmhouse with Ms. Emma and our flashlights.", "out of the farmhouse with our flashlights."),
  E(1127, "Ms. Emma checks her watch.", "I check my watch."),
  E(1132, "She writes three questions on the board.", "I write three questions on the board."),
  E(1133, "and Ms. Emma sits with us, ready to help.", "and I sit with them, ready to help."),
  E(1134, "Ms. Emma explains how an article works.", "I explain how an article works."),
  E(1134, "Ms. Emma writes it on the board with quotation marks.", "I write it on the board with quotation marks."),
  E(1134, "and Ms. Emma says we can keep it.", "and I say we can keep it."),
  E(1136, "Then Birimo winks at Ms. Emma and asks,", "Then Birimo winks at me and asks,"),
  E(1136, "now? Ms. Emma laughs. Not yet!", "now? I laugh. Not yet!"),
  E(1137, "we'll post our letters with Ms. Emma.", "we'll post our letters together."),
  E(1138, "Ms. Emma has an idea.", "I have an idea."),
  E(1138, "Ms. Emma says, One kind word", "I say, One kind word"),
  E(1139, "with Ms. Emma, Puff, Grandma Rowan and Biscuit.", "with Puff, Grandma Rowan and Biscuit."),
  E(1140, "Then Ms. Emma asks us to share", "Then I ask everyone to share"),
  // time-of-day greetings of Ms. Emma (segments[0] only)
  { lessons: [1105, 1115, 1126, 1135], from: /^Good evening, everyone!/g, to: "Hi, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1112, 1120, 1131, 1138], from: /^Good morning, everyone!/g, to: "Hi, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1108], from: /^Good morning, authors!/g, to: "Hi, authors!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1123], from: /^Good morning, friends!/g, to: "Hi, friends!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1105, 1112, 1115, 1120, 1126, 1131, 1135, 1138], from: /^(みんな|みなさん)、(おはよう|こんばんは)！/g, to: "やあ、$1！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [1108, 1123], from: /^おはよう、/g, to: "やあ、", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
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
fs.writeFileSync(path.join(REPO, ".run9-w3738/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
if (process.argv.includes("--show")) for (const x of out) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
