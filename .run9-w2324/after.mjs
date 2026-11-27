// Coordinator follow-up after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings } from "./lib.mjs";
const m = loadWorlds();
const OR = {
  leaf: /^teacherScript$/,
  reviewers: "objective (coordinator; L691-700 group report)",
  reason: 'teacherScript: spoken "A. Or, B." running answer -> "Or b." like the say lines (00-mechanical skipped teacherScript; W03-22 rule)',
};
const WHO = {
  leaf: /\.(say|subtitleEn)$/,
  reviewers: "B+C (coordinator; L701-710 group report)",
  reason: 'relative clause with "who" is kept for Stage 4 (world 24 test rule; L701 "People who work at the station" was fixed the same way). Use a plain sentence',
};
const fixes = [
  { lessons: [696], from: "Or, No, I haven't.", to: "Or no, I haven't.", ...OR },
  { lessons: [698], from: "Or, No, I've never tried them.", to: "Or no, I've never tried them.", ...OR },
  { lessons: [699], from: "Or, I've never been there.", to: "Or I've never been there.", ...OR },
  { lessons: [718], from: "Or, No, I haven't been abroad yet.", to: "Or no, I haven't been abroad yet.", ...OR },
  { lessons: [661], from: "Scientist. A person who asks questions about nature and finds answers.", to: "Scientist. Scientists ask questions about nature and find answers.", ...WHO },
  { lessons: [670], from: "Audience. The people who watch and listen.", to: "Audience. The people watching and listening.", ...WHO },
  {
    lessons: [690], from: "Present. Stand up and tell everyone about your work. Present!", to: "To present. Stand up and tell everyone about your work. Let's present!",
    leaf: /\.(say|subtitleEn)$/, reviewers: "B+C (coordinator; L681-690 group report, same fix as L665 record)",
    reason: 'heteronym: a bare "Present." may be read as the noun PREsent (a gift). "To present ... Let\'s present!" makes TTS read the verb (vocab item unchanged)',
  },
  {
    lessons: [690], from: "present。たって、みんなに じぶんの けんきゅうを つたえる。present！", to: "present。たって、みんなに じぶんの けんきゅうを つたえる こと。はっぴょうしよう！",
    leaf: /subtitleJa$/, reviewers: "B+C (coordinator)", reason: "JA follows the EN fix",
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
fs.writeFileSync(path.join(REPO, ".run9-w2324/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 130)}`);
