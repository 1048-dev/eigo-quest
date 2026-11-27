// Block-wide consistency after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const rules = [
  { from: /Ding, dong([.!])/g, to: "Ding-dong$1", leaf: null, reviewers: "A+C (L141-150 group)", reason: 'chime sound written "Ding-dong!" as in W03-04/W07 (a comma makes TTS pause between the two halves)' },
  { from: /It's show time!/g, to: "It's showtime!", leaf: null, reviewers: "objective", reason: 'US spelling is "showtime" (one word)' },
  { from: /^みんな、やあ！/, to: "やあ、みんな！", leaf: "subtitleJa", reviewers: "B+objective (L121-130 group)", reason: "natural Japanese greeting order (やあ、みんな！), same as L124/L127/L129" },
];
const patches = [];
for (const wf of m.values())
  for (const l of wf.lessons)
    for (const r of rules)
      for (const [p, s] of strings(l)) {
        if (r.leaf && !p.endsWith(r.leaf)) continue;
        const t = s.replace(r.from, r.to);
        if (t !== s) { setAt(l, p, t); patches.push({ lesson: l.lessonNo, path: p, before: s, after: t, reviewers: r.reviewers, reason: r.reason }); }
      }
fs.writeFileSync(path.join(REPO, ".run9-w56/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.before.slice(0, 70)} -> ${x.after.slice(0, 70)}`);
