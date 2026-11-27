// Block-wide decisions for L541-600 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 541 + i);
const NAMES = /^(I|I'm|I'd|I'll|I've|Haru|Haru's|Kiko|Kiko's|Riko|Riko's|Birimo|Birimo's|Pipo|Luka|Luka's|Ms|Mr|Emma|Sana|Leo|Pochi|English|Japan|World|Earth|Echo|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)$/;
const US = "British-leaning praise -> American (same rule as W01-18)";
const EMMA = {
  reviewers: "A+C (+ W15-16 / W17-18 report)",
  reason: 'Ms. Emma is the narrator and voice of the script; "Ms. Emma says / asks," in her own narration sounds like a third person reading. Use "I say," / "I ask," like W17-18 (L490 "And I say, Bravo!"); JA エマ先生「 -> わたし「',
};
const FALL = { reviewers: "objective+lint (uk-word)", reason: 'US English: "fall", not "autumn" (style guide; same as W11-12 L349)' };
const rules = [
  { lessons: ALL, from: /\bOkay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "Okay" (style guide; lint canonical)' },
  { lessons: ALL, from: /\bokay\b/g, to: "OK", reviewers: "objective+lint", reason: 'canonical spelling "OK", not "okay" (style guide; lint canonical)' },
  { lessons: [576], from: /^Lovely work!/g, to: "Great work!", reviewers: "A+C", reason: US },
  { lessons: [583], from: /^Lovely manners, everyone!/g, to: "Great manners, everyone!", reviewers: "A+C", reason: US },
  { lessons: [587, 593], from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: US },
  // Ms. Emma narrating herself (teacher segments and teacherScript only; the children may still call her エマ先生)
  { lessons: [592, 593], from: /Ms\. Emma asks, /g, to: "I ask, ", leaf: /(\.(say|subtitleEn)|^teacherScript)$/, ...EMMA },
  { lessons: [595, 598, 599, 600], from: /Ms\. Emma says, /g, to: "I say, ", leaf: /(\.(say|subtitleEn)|^teacherScript)$/, ...EMMA },
  { lessons: [592, 593, 595, 598, 599, 600], from: /エマ先生「/g, to: "わたし「", leaf: /^teacher\.segments\[\d+\]\.subtitleJa$/, ...EMMA },
  // autumn -> fall
  { lessons: [578, 580], from: /\bIn autumn, /g, to: "In the fall, ", ...FALL },
  { lessons: [578, 580], from: /It's autumn on the island/g, to: "It's fall on the island", ...FALL },
  { lessons: [578, 580], from: /\bautumn (festivals?|harvest)/g, to: "fall $1", ...FALL },
  // ASCII ellipsis in English titles / slides (lint punctuation; W01-02 rule)
  { lessons: [573, 589], from: /…/g, to: "...", leaf: /^(title|teacher\.segments\[\d+\]\.slide\.(title|items\[\d+\]))$/, reviewers: "objective+lint (punctuation)", reason: 'ASCII "..." in English, not "…" (lint punctuation; same rule as W01-02). Test for the L573 title updated' },
  // "Yesterday" in the lesson opening means the last lesson, not the day before
  { lessons: [562, 572], from: /\bYesterday we /g, to: "Last time, we ", reviewers: "A+B (+ W15-16 rule)", reason: '"Yesterday" for the previous lesson is not true for kids who study on other days; "Last time, we ..." (same as W13-16)' },
  // Japanese name of the past form
  { lessons: [592], from: /むかしの かたち/g, to: "すぎた かたち", reviewers: "B (+ W15-16 block rule)", reason: 'JA name of the past form: 「すぎた かたち」 like W15-31 (むかし means long ago)' },
];
const capRule = {
  from: /\b(Now|Then|Next|First|After that|Finally), ([A-Z][a-z']+)/g,
  to: (a, w1, w) => (NAMES.test(w) ? a : `${w1}, ${w[0].toLowerCase()}${w.slice(1)}`),
  leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
  reviewers: "objective",
  reason: 'capital letter after "Now," / "Then," / "First," / "After that," / "Finally," in the middle of a sentence ("Now, Touch the box.") -> lowercase (same rule as W07-18). The TPR item and its slide keep their capital',
};
const patches = [];
const cur = (l, p) => strings(l).find(([q]) => q === p)[1];
for (const n of ALL) {
  const l = lessonOf(m, n);
  for (const [p] of strings(l)) {
    for (const r of rules) {
      if (!r.lessons.includes(n)) continue;
      if (r.leaf && !r.leaf.test(p)) continue;
      const c = cur(l, p);
      const t = c.replace(r.from, r.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
    if (capRule.leaf.test(p)) {
      const c = cur(l, p);
      const t = c.replace(capRule.from, capRule.to);
      if (t !== c) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: c, after: t, reviewers: capRule.reviewers, reason: capRule.reason }); }
    }
  }
  // AI conversation starter "Hi! I'm Ms. Emma." -> the real partner (W17-18 rule; pickConversationPartner never picks Ms. Emma)
  const s = l.conversation?.aiTask?.starterEn;
  if (s && /I'm Ms\. Emma/.test(s)) {
    const wrap = l.teacher.segments.map((x) => x.say).join(" ").match(/Next, talk with (Haru|Riko|Kiko|Birimo)!/);
    if (!wrap) throw new Error(`L${n}: no wrap-up partner`);
    const t = s.replace(/I'm Ms\. Emma/, `I'm ${wrap[1]}`);
    l.conversation.aiTask.starterEn = t;
    patches.push({ lesson: n, path: "conversation.aiTask.starterEn", before: s, after: t, reviewers: "objective (W17-18 rule)", reason: 'the AI conversation partner is always a child character (pickConversationPartner never picks Ms. Emma), and the wrap-up says "Next, talk with X!". The starter "I\'m Ms. Emma." made X introduce itself as Ms. Emma. Use the partner name from the wrap-up (checked with partner.ts)' });
  }
}
fs.writeFileSync(path.join(REPO, ".run9-w1920/patches/01-central.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) if (!/^(capital|canonical|the AI)/.test(x.reason)) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 120)}`);
const kept = new Set();
for (const wf of m.values()) for (const l of wf.lessons) for (const [p, s] of strings(l)) if (capRule.leaf.test(p)) for (const mm of s.matchAll(capRule.from)) kept.add(mm[0]);
console.log("kept capitals:", [...kept].join(" | "));
