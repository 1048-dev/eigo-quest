// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 01-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ANY = /.*/;
const COUNT = {
  reviewers: "objective (rule; group report L1111-1120)",
  reason: 'count on is a verb + preposition: the verb is stressed ("You can COUNT on me"), not on (L1119 itself teaches TURN to). count‿ON -> COUNT‿on; also src w38Phonics.ts sound note',
};
const GREET = { reviewers: "A+C (block rule; group report L1121-1130)", reason: "JA opening greeting unified with the block-wide fix: みんな、やあ！ -> やあ、みんな！ (more natural word order)" };
const R = (lessons, from, to, leaf, meta) => ({ lessons: Array.isArray(lessons) ? lessons : [lessons], from, to, leaf, ...meta });
const rules = [
  R([1118, 1120], "count‿ON", "COUNT‿on", ANY, COUNT),
  R([1118, 1120], "count ON", "COUNT on", ANY, COUNT),
  R([1118, 1120], "Count ON", "COUNT on", ANY, COUNT),
  R(1118, "Link open up and count on, and say the little words strongly.", "Link open up and count on. Say UP strongly in open up, but COUNT strongly in count on.", /^teacherScript$/, COUNT),
  R(1118, "count‿on は「カウントン」）", "count‿on は「カウントン」。COUNT を つよく）", /^phonics\.tipJa$/, COUNT),
  R(1120, "count‿on と つなげる）", "count‿on と つなげて COUNT を つよく）", /^phonics\.tipJa$/, COUNT),
  R([1113, 1117, 1122, 1128, 1130], /^(みんな|みなさん)、やあ！/, "やあ、$1！", /segments\[0\]\.subtitleJa$/, GREET),
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
  if (!hit) console.log(`rule not hit: ${r.from}`);
}
const merged = new Map();
for (const p of patches) {
  const k = `${p.lesson}|${p.path}`;
  const o = merged.get(k);
  if (o) { o.after = p.after; if (!o.reason.includes(p.reason)) o.reason += "; " + p.reason; }
  else merged.set(k, { ...p });
}
const out = [...merged.values()];
fs.writeFileSync(path.join(REPO, ".run9-w3738/patches/20-after.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
for (const x of out) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 140)}`);
