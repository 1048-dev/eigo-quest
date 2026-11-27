// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 01-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const TS = /^teacherScript$/;
const EMMA = {
  reviewers: "A+C (block rule; group reports L981-990, L991-1000, L1001-1010)",
  reason: 'Ms. Emma reads her own teacherScript; her own narration said "Ms. Emma says / takes us / her pouch". -> I / my / me, same as say/subtitles and as L991-1000 (group). Other characters\' cards, Skye\'s line and the email signature keep the name',
};
const E = (lesson, from, to) => ({ lessons: [lesson], from, to, leaf: TS, ...EMMA });
const rules = [
  E(1001, "Ms. Emma takes us to our hotel near the sea.", "Then we walk to our hotel near the sea."),
  E(1001, "Before the trip, Ms. Emma made our reservation, and she put it under Haru's name.", "Before the trip, I made our reservation, and I put it under Haru's name."),
  E(1001, "steps up to the desk with Ms. Emma and says,", "steps up to the desk with me and says,"),
  E(1001, "but Ms. Emma keeps it safe in her pouch.", "but I keep it safe in my pouch."),
  E(1002, "Ms. Emma is unpacking her backpack. She turns to Haru and says,", "I'm unpacking my backpack. I turn to Haru and say,"),
  E(1003, "Ms. Emma says the train is the easiest way.", "I say the train is the easiest way."),
  { lessons: [1003, 1004, 1005, 1006, 1007, 1008, 1015, 1016, 1017, 1020], from: /\bMs\. Emma says,/g, to: "I say,", leaf: TS, ...EMMA },
  E(1004, "We spent the day at the harbor with Ms. Emma, and now", "We spent the day at the harbor, and now"),
  E(1005, "We want to walk to the River Market with Ms. Emma, but", "We want to walk to the River Market, but"),
  E(1005, "Kiko goes to the front desk with Ms. Emma and says,", "Kiko goes to the front desk with me and says,"),
  E(1005, "Next time, Ms. Emma will tell us a surprising secret about her suitcase!", "Next time, I will tell you a surprising secret about my suitcase!"),
  E(1006, "This morning, Ms. Emma sits down with us in the lobby. She says,", "This morning, I sit down with you in the lobby. I say,"),
  E(1006, "Ms. Emma laughs. She says, Today,", "I laugh and say, Today,"),
  E(1007, "Good news! Ms. Emma has her blue suitcase back.", "Good news! I have my blue suitcase back."),
  E(1008, "Mr. Lee gives Ms. Emma a new key", "Mr. Lee gives me a new key"),
  E(1008, "Next time, Ms. Emma can't find something very important!", "Next time, I can't find something very important!"),
  E(1009, "this morning, Ms. Emma is looking through her backpack. Then her jacket. Then her suitcase.", "this morning, I'm looking through my backpack. Then my jacket. Then my suitcase."),
  E(1009, "Then my suitcase. She says calmly,", "Then my suitcase. I say calmly,"),
  E(1014, "and Birimo. She says to the staff member,", "and Birimo. I say to the staff member,"),
  E(1009, "Ms. Emma remembers. At the Baggage", "I remember. At the Baggage"),
  E(1009, "We all go to the airport with Ms. Emma and pick it up.", "We all go to the airport together and pick it up."),
  E(1010, "Ms. Emma's passport is back", "My passport is back"),
  E(1011, "Ms. Emma walks with us along the river, and", "We walk along the river, and"),
  E(1011, "Ms. Emma smiles at a kind woman with a map and says,", "I smile at a kind woman with a map and say,"),
  E(1011, "we always ask with Ms. Emma right next to us.", "always ask with a grown-up right next to you."),
  E(1012, "Ms. Emma takes us to the fish restaurant by the river.", "We go to the fish restaurant by the river."),
  E(1012, "and Ms. Emma laughs. One is enough", "and I laugh. One is enough"),
  E(1012, "After lunch, Ms. Emma asks,", "After lunch, I ask,"),
  E(1013, "Ms. Emma explains,", "I explain,"),
  E(1014, "Ms. Emma looks at the price list and counts.", "I look at the price list and count."),
  E(1017, "and Ms. Emma promises Birimo a snack", "and I promise Birimo a snack"),
  E(1018, "Ms. Emma gives each of us a small notebook. She says,", "I give each of you a small notebook. I say,"),
  E(1019, "Ms. Emma keeps us close and stops a friendly staff member. She says,", "I keep everyone close and stop a friendly staff member. I say,"),
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
  if (o) { o.after = p.after; if (!o.reason.includes(p.reason)) o.reason += "; " + p.reason; }
  else merged.set(k, { ...p });
}
const out = [...merged.values()];
fs.writeFileSync(path.join(REPO, ".run9-w3334/patches/20-after.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
