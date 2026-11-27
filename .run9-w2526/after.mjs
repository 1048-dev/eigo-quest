// Coordinator follow-up after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings } from "./lib.mjs";
const m = loadWorlds();
const SAY = /\.(say|subtitleEn)$/;
const IVE = {
  leaf: /(\.(say|subtitleEn)|^teacherScript)$/,
  reviewers: "B+C (coordinator; L721-730, L731-740 and L741-750 group reports)",
  reason: 'TTS: the bare ending "ive" is read as "I\'ve". Spell the letters "I, V, E" (W26 already says "I N G"); L741-750 used word pairs, these lines already have them',
};
const GREET = {
  reviewers: "A+B (coordinator; L721-730 group report)",
  reason: "time-of-day greeting in Ms. Emma's own narration assumes when the child studies (W15-24 pacing rule); use a neutral greeting",
};
const THAT = {
  leaf: SAY,
  reviewers: "B+C (coordinator; L741-750 group report, same fix as L744 clue / L749 card)",
  reason: 'relative clause with "that" is kept for Stage 4; use plain sentences (JA unchanged)',
};
const fixes = [
  { lessons: [726], from: "The ending ive.", to: "The ending I, V, E.", ...IVE },
  { lessons: [726], from: "Drop the E, add ive.", to: "Drop the E, add I, V, E.", ...IVE },
  { lessons: [727, 728], from: "More ive words.", to: "More I, V, E words.", ...IVE },
  { lessons: [727, 728, 729], from: "Just add ive.", to: "Just add I, V, E.", ...IVE },
  { lessons: [729], from: "Ive again.", to: "I, V, E again.", ...IVE },
  { lessons: [730], from: "And ive!", to: "And I, V, E!", ...IVE },
  { lessons: [730], from: "and ive makes a describing word", to: "and I, V, E makes a describing word", ...IVE },
  { lessons: [732, 742], from: /^Good (morning|evening), detectives!/, to: "Hi, detectives!", leaf: SAY, ...GREET },
  { lessons: [732], from: "おはよう、たんていさん！", to: "こんにちは、たんていさん！", leaf: /subtitleJa$/, ...GREET },
  { lessons: [742], from: "こんばんは、たんていの みんな！", to: "こんにちは、たんていの みんな！", leaf: /subtitleJa$/, ...GREET },
  { lessons: [753], from: "Good morning, actors!", to: "Hello, actors!", leaf: SAY, ...GREET },
  { lessons: [753], from: "おはよう、やくしゃの みんな！", to: "こんにちは、やくしゃの みんな！", leaf: /subtitleJa$/, ...GREET },
  {
    lessons: [757], from: "Hello! Tonight we're reading the dragon scene.", to: "Hello! Today we're reading the dragon scene.", leaf: /starterEn$/,
    reviewers: "A+B (coordinator; L751-760 group report, same as L757 seg0)", reason: '"Tonight" assumes the child studies in the evening; L757 seg0 already changed Tonight -> Today',
  },
  { lessons: [731], from: "Clue. A small thing that helps you find the answer.", to: "Clue. It helps you find the answer.", ...THAT },
  { lessons: [739], from: "Monkey. A funny animal that climbs trees.", to: "Monkey. A funny animal. It climbs trees.", ...THAT },
];
const patches = [];
for (const f of fixes)
  for (const n of f.lessons) {
    const l = lessonOf(m, n);
    let hit = 0;
    for (const [p, s] of strings(l)) {
      if (f.leaf && !f.leaf.test(p)) continue;
      const t = typeof f.from === "string" ? s.split(f.from).join(f.to) : s.replace(f.from, f.to);
      if (t === s) continue;
      hit++;
      const o = patches.find((x) => x.lesson === n && x.path === p);
      if (o) { o.after = typeof f.from === "string" ? o.after.split(f.from).join(f.to) : o.after.replace(f.from, f.to); if (!o.reason.includes(f.reason)) o.reason += "; " + f.reason; }
      else patches.push({ lesson: n, path: p, before: s, after: t, reviewers: f.reviewers, reason: f.reason });
    }
    if (!hit) throw new Error(`L${n}: "${f.from}" not found`);
  }
fs.writeFileSync(path.join(REPO, ".run9-w2526/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 130)}`);
