// Block-wide consistency after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const NAMES = /^(I|I'm|Haru|Kiko|Riko|Birimo|Pipo|Ms|Mr|Emma|Japan|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
const rules = [
  {
    from: /\bNow, ([A-Z][a-z']+)/g,
    to: (a, w) => (NAMES.test(w) ? a : `Now, ${w[0].toLowerCase()}${w.slice(1)}`),
    leaf: /\.(say|subtitleEn)$/,
    reviewers: "objective (L191-200 / L211-220 / L221-230 groups)",
    reason: 'capital letter after "Now," in the middle of a sentence ("Now, Point to Monday.") -> lowercase. The TPR item and its slide keep their capital',
  },
  { from: /^1にち、2にち、3にち$/, to: "ついたち、ふつか、みっか", leaf: /^titleJa$/, reviewers: "objective+B (L181-190 group)", reason: "1にち reads いちにち (one day), not the 1st; the dates are ついたち・ふつか・みっか (same fix as seg1 subtitleJa). titles.json too" },
];
const patches = [];
for (const wf of m.values())
  for (const l of wf.lessons) {
    if (l.lessonNo < 181 || l.lessonNo > 240) continue;
    for (const r of rules)
      for (const [p, s] of strings(l)) {
        if (!r.leaf.test(p)) continue;
        const t = s.replace(r.from, r.to);
        if (t !== s) { setAt(l, p, t); patches.push({ lesson: l.lessonNo, path: p, before: s, after: t, reviewers: r.reviewers, reason: r.reason }); }
      }
  }
fs.writeFileSync(path.join(REPO, ".run9-w78/patches/20-after.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.before.slice(0, 70)} -> ${x.after.slice(0, 70)}`);
