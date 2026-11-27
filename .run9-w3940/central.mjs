// Block-wide decisions for L1141-1200 -> patches/01-central.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const US = { reviewers: "A+C (block rule)", reason: "British-leaning praise -> American (same rule as W01-38)" };
const USW = { reviewers: "objective (US policy)", reason: "British usage -> American (summer holidays -> summer vacation, football -> soccer, Year 1 -> first year, Okay -> OK per style guide)" };
const SAYEN = /\.(say|subtitleEn)$/;
const TS = /^teacherScript$/;
const EN = /(\.say|\.subtitleEn|^teacherScript|\.en|starterEn|targetExpressions\[\d+\]|slide\.items\[\d+\]|^conversation\.scene|^school\.grammar|^vocab\[\d+\]\.(en|example\w*)|^recap\.\w+(\[\d+\])?)$/;
const JASEG = /segments\[\d+\]\.subtitleJa$/;
const GREET = {
  reviewers: "A+B (block rule)",
  reason: "Ms. Emma's own greeting assumed the time of day; the child can watch at any time (same as W25-38). Story time (Tonight ~) stays in the next sentences",
};
const EMMA = {
  reviewers: "A+C (block rule)",
  reason: 'Ms. Emma reads her own script, so her own narration "Ms. Emma says / asks / smiles / gives ..." -> "I say / I ask / I smile / I give ..." (same as W17-38, say + subtitles + teacherScript); JA エマ先生 -> わたし. Children talking TO Ms. Emma, and cards / letters / speeches the children wrote (and questions about them), stay',
};
const E = (lesson, from, to, leaf = TS) => ({ lessons: [lesson], from, to, leaf, ...EMMA });
const rules = [
  // British praise
  { lessons: [1145, 1184], from: /^Brilliant! You can/g, to: "Great job! You can", leaf: SAYEN, ...US },
  { lessons: [1152, 1161, 1170, 1177], from: / Brilliant!$/g, to: " Great job!", leaf: SAYEN, ...US },
  { lessons: [1150, 1178], from: " Brilliant! ", to: " Great job! ", leaf: TS, ...US },
  { lessons: [1168, 1172, 1189, 1193], from: " Lovely! ", to: " Wonderful! ", leaf: TS, ...US },
  { lessons: [1189, 1194], from: / Lovely!$/g, to: " Nice job!", leaf: SAYEN, ...US },
  { lessons: [1187], from: "Lovely plans.", to: "Great plans.", leaf: /./, ...US },
  // US words
  { lessons: [1154, 1155], from: "the summer holidays", to: "summer vacation", leaf: EN, ...USW },
  { lessons: [1154, 1155], from: "Summer holidays", to: "Summer vacation", leaf: EN, ...USW },
  { lessons: [1154, 1155], from: "summer holidays", to: "summer vacation", leaf: EN, ...USW },
  { lessons: [1143], from: "homework and football", to: "homework and soccer", leaf: TS, ...USW },
  { lessons: [1173], from: "In Year 1, I couldn't", to: "In our first year, I couldn't", leaf: /./, ...USW },
  { lessons: [1153, 1174], from: "Okay, ", to: "OK, ", leaf: EN, ...USW },
  { lessons: [1160], from: "says it's okay.", to: "says it's OK.", leaf: TS, ...USW },
  // Ms. Emma's own narration: say / subtitles
  { lessons: [1161], from: /\bMs\. Emma says,/g, to: "I say,", leaf: SAYEN, ...EMMA },
  { lessons: [1162, 1170], from: /^Ms\. Emma asks,/g, to: "I ask,", leaf: SAYEN, ...EMMA },
  { lessons: [1163], from: "Then Ms. Emma asks,", to: "Then I ask,", leaf: SAYEN, ...EMMA },
  { lessons: [1161, 1162, 1163], from: /エマ先生「/g, to: "わたし「", leaf: JASEG, ...EMMA },
  { lessons: [1170], from: "エマ先生が きくよ。", to: "わたしが きくよ。", leaf: JASEG, ...EMMA },
  // Ms. Emma's own narration: teacherScript
  E(1143, "Ms. Emma says, These are big problems", "I say, These are big problems"),
  E(1145, "Ms. Emma helps us check every card", "I help everyone check every card"),
  E(1146, "Ms. Emma says, Let's think from", "I say, Let's think from"),
  E(1148, "Ms. Emma teaches us a new linking word.", "I teach everyone a new linking word."),
  E(1149, "But Ms. Emma smiles. Careful!", "But I smile. Careful!"),
  E(1150, "Ms. Emma teaches us two more linking words.", "I teach everyone two more linking words."),
  E(1150, "Ms. Emma says, It's similar", "I say, It's similar"),
  E(1156, "Ms. Emma laughs. Then the shelf", "I laugh. Then the shelf"),
  E(1158, "Ms. Emma sits down next to her.", "I sit down next to her."),
  E(1161, "Ms. Emma gives everyone a pile", "I give everyone a pile"),
  E(1164, "Ms. Emma writes everything down.", "I write everything down."),
  E(1165, "Ms. Emma writes it on a big scroll", "I write it on a big scroll"),
  E(1166, "Ms. Emma smiles. That's exactly", "I smile. That's exactly"),
  E(1167, "Ms. Emma nods. Yes, of course!", "I nod. Yes, of course!"),
  E(1172, "Ms. Emma smiles warmly. You have all grown so much, she says.", "I smile warmly and say, You have all grown so much."),
  E(1173, "Ms. Emma laughs and gives each of us a piece", "I laugh and give everyone a piece"),
  E(1175, "Ms. Emma gives us six glowing ribbons", "I give everyone six glowing ribbons"),
  E(1176, "Then Ms. Emma asks us to choose one piece of work that makes us really proud.", "Then I ask everyone to choose one piece of work that makes them really proud."),
  E(1177, "Today, Ms. Emma draws a big chart", "Today, I draw a big chart"),
  E(1178, "Ms. Emma adds, Every one of you", "I add, Every one of you"),
  E(1179, "to Celeste and Ms. Emma.", "to Celeste and me."),
  E(1180, "Celeste and Ms. Emma sit on the silver grass", "Celeste and I sit on the silver grass"),
  E(1181, "Ms. Emma sits behind the table. She will be the examiner.", "I sit behind the table. I will be the examiner."),
  E(1181, "Ms. Emma nods. That was clear", "I nod. That was clear"),
  E(1182, "Today, Ms. Emma brings out a picture card.", "Today, I bring out a picture card."),
  E(1182, "Ms. Emma holds up the card. It shows a sunny park. She points to the boy and asks the question.", "I hold up the card. It shows a sunny park. I point to the boy and ask the question."),
  E(1182, "Ms. Emma explains a useful trick.", "I explain a useful trick."),
  E(1183, "Ms. Emma shows us an opinion card", "I show everyone an opinion card"),
  E(1183, "Ms. Emma smiles. In an opinion question", "I smile. In an opinion question"),
  E(1184, "Ms. Emma agrees, but there is one problem.", "I agree, but there is one problem."),
  E(1185, "Ms. Emma sits behind the desk with a calm smile. At the end, she will say", "I sit behind the desk with a calm smile. At the end, I will say"),
  E(1185, "Ms. Emma says softly,", "I say softly,"),
  E(1185, "Then Ms. Emma gives her the first card.", "Then I give her the first card."),
  E(1185, "Then Ms. Emma smiles and says the last words.", "Then I smile and say the last words."),
  E(1186, "Ms. Emma gives each of us a star-shaped card, and we write our wishes on it together.", "I give everyone a star-shaped card, and we write our wishes together."),
  E(1187, "Ms. Emma helps us make a future plan together.", "I help everyone make a future plan."),
  E(1187, "Ms. Emma nods. It's OK", "I nod. It's OK"),
  E(1188, "Ms. Emma laughs. That's a real skill", "I laugh. That's a real skill"),
  E(1190, "Then Kiko asks Ms. Emma, What if", "Then Kiko asks me, What if"),
  E(1190, "Ms. Emma smiles. Then you'll have", "I smile. Then you'll have"),
  E(1192, "Birimo's job is to keep Ms. Emma busy.", "Birimo's job is to keep me busy."),
  E(1192, "Ms. Emma laughs and starts to explain.", "I laugh and start to explain."),
  E(1192, "Ms. Emma reads the card twice. Her eyes get shiny, and a happy tear rolls down her cheek. She hugs all four of us. These are happy tears, she says.", "I read the card twice. My eyes get shiny, and a happy tear rolls down my cheek. I hug all four of them. I say, These are happy tears."),
  E(1194, "Ms. Emma smiles and points to three places", "I smile and point to three places"),
  E(1194, "Then Ms. Emma gives Kiko a little card.", "Then I give Kiko a little card."),
  E(1196, "Ms. Emma brings out a big colorful wheel. Today is free-talk day, she says.", "I bring out a big colorful wheel. I say, Today is free-talk day."),
  E(1196, "Ms. Emma points to the card under the wheel.", "I point to the card under the wheel."),
  E(1197, "Then Ms. Emma writes it all down.", "Then I write it all down."),
  E(1197, "A good story has a beginning, a middle and an ending, Ms. Emma says, but the best stories leave room for more.", "I say, A good story has a beginning, a middle and an ending, but the best stories leave room for more."),
  E(1198, "Ms. Emma says this is a perfect question", "I say this is a perfect question"),
  E(1198, "Ms. Emma nods. That's actually", "I nod. That's actually"),
  E(1199, "Ms. Emma sits up and smiles at us. It's OK to feel sad and excited at the same time, she says.", "I sit up and smile at everyone. I say, It's OK to feel sad and excited at the same time."),
  E(1199, "Then Ms. Emma gives each of us a small card.", "Then I give everyone a small card."),
  E(1200, "Ms. Emma gives each of us a graduation certificate", "I give everyone a graduation certificate"),
  E(1200, "Then Ms. Emma says, One last time", "Then I say, One last time"),
  E(1200, "Ms. Emma says, Keep reading stories", "I say, Keep reading stories"),
  // time-of-day greetings of Ms. Emma (segments[0] only)
  { lessons: [1144, 1149, 1153, 1162, 1193], from: /^Good morning, everyone!/g, to: "Hi, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1157, 1195], from: /^Good evening, everyone!/g, to: "Hi, everyone!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1199], from: /^Good evening, everyone\./g, to: "Hi, everyone.", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1173], from: /^Good morning, my stars!/g, to: "Hi, my stars!", leaf: /segments\[0\]\.(say|subtitleEn)$/, ...GREET },
  { lessons: [1144, 1149, 1153, 1157, 1162, 1193, 1195, 1199], from: /^みんな、(おはよう|こんばんは)([！。])/g, to: "やあ、みんな$2", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
  { lessons: [1173], from: /^おはよう、わたしの 星たち！/g, to: "やあ、わたしの 星たち！", leaf: /segments\[0\]\.subtitleJa$/, ...GREET },
];
const patches = [];
for (const r of rules) {
  let hit = 0;
  for (const n of r.lessons) {
    const l = lessonOf(m, n);
    for (const [p, c] of strings(l)) {
      if (r.leaf && !r.leaf.test(p)) continue;
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
fs.writeFileSync(path.join(REPO, ".run9-w3940/patches/01-central.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
if (process.argv.includes("--show")) for (const x of out) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
