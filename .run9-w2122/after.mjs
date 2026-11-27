// Coordinator follow-up after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings } from "./lib.mjs";
const m = loadWorlds();
const PARTNER = {
  reviewers: "objective (coordinator; partner check)",
  reason:
    'pickConversationPartner skips any child character NAMED in the starter unless it is "I\'m X". The group fix "This is X / It\'s X" (X = the wrap-up partner) made the app pick someone else. Drop the name; the app now picks the wrap-up partner (checked with partner.ts)',
};
// [lessons, from, to, leaf regex | null, reviewers, reason]
const fixes = [
  { lessons: [605], from: "Hello, this is Kiko. Oh, hi! What's up?", to: "Hello? Oh, hi! What's up?", leaf: /aiTask\.starterEn$/, ...PARTNER },
  { lessons: [606], from: "Hi! It's Riko. I'm calling from the tower. Can you hear me?", to: "Hi! I'm calling from the tower. Can you hear me?", leaf: /aiTask\.starterEn$/, ...PARTNER },
  { lessons: [611], from: "Hello! This is Kiko. May I speak to Ms. Emma, please?", to: "Hello! May I speak to Ms. Emma, please?", leaf: /aiTask\.starterEn$/, ...PARTNER },
  { lessons: [612], from: "Hello, this is Birimo at the Message Center.", to: "Hello, this is the Message Center.", leaf: /aiTask\.starterEn$/, ...PARTNER },
  {
    lessons: [629, 648], from: "Ding, dong", to: "Ding-dong", leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
    reviewers: "objective (coordinator; L641-650 group report)", reason: '"Ding-dong" (one sound word) like W13-20. L612 "Ding, dong, ding!" is three xylophone notes and stays',
  },
  {
    lessons: [647], from: "Run away on the spot", to: "Pretend to run away", leaf: null,
    reviewers: "A+B (coordinator; L641-650 group report)", reason: '"on the spot" is British ("in place" in the US), and "run away in place" contradicts itself. "Pretend to run away." keeps the action (TPR item; ID changes, no test refers to it)',
  },
  {
    lessons: [647], from: "run away on the spot", to: "pretend to run away", leaf: null,
    reviewers: "A+B (coordinator; L641-650 group report)", reason: '"on the spot" is British ("in place" in the US), and "run away in place" contradicts itself. "Pretend to run away." keeps the action (TPR item; ID changes, no test refers to it)',
  },
  {
    lessons: [647], from: "その ばで にげて", to: "にげる ふりを して", leaf: /(^tpr\[1\]\.ja|subtitleJa)$/,
    reviewers: "A+B (coordinator)", reason: "JA follows the EN fix",
  },
  {
    lessons: [643], from: "PROB-lem. CHIL-dren. CIR-cus. HAP-pen.", to: "Problem. Children. Circus. Happen.", leaf: /\.(say|subtitleEn)$/,
    reviewers: "B+C (coordinator; L641-650 group report)", reason: 'capital stress beats in say ("PROB", "CHIL", "CIR") may be read by TTS as letters or other words; say the real words like L642/L644 (the slide keeps the beat forms)',
  },
  {
    lessons: [643], from: "PROB-lem。CHIL-dren。CIR-cus。HAP-pen。", to: "problem。children。circus。happen。", leaf: /subtitleJa$/,
    reviewers: "B+C (coordinator)", reason: "JA follows the EN fix (same form as L642/L644)",
  },
  {
    lessons: [603], from: "say, wait.", to: "say, Wait.", leaf: null,
    reviewers: "objective (coordinator; L601-610 group report)", reason: 'quoted word after "say," starts with a capital (house style for quotes without quotation marks). TPR item; ID changes, no test refers to it',
  },
];
const patches = [];
for (const f of fixes)
  for (const n of f.lessons) {
    const l = lessonOf(m, n);
    let hit = 0;
    for (const [p, s] of strings(l)) {
      if (f.leaf && !f.leaf.test(p)) continue;
      if (!s.includes(f.from)) continue;
      hit++;
      patches.push({ lesson: n, path: p, before: s, after: s.split(f.from).join(f.to), reviewers: f.reviewers, reason: f.reason });
    }
    if (!hit) throw new Error(`L${n}: "${f.from}" not found`);
  }
fs.writeFileSync(path.join(REPO, ".run9-w2122/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 130)}`);
