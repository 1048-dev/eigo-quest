// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 01-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const JA = /(\.ja|subtitleJa|sceneJa|goalJa|highlightsJa\[\d+\]|tipJa|action)$/;
const rules = [
  {
    lessons: [959, 960], from: /so that they can live without food/g, to: "so that they can go a long time without food",
    reviewers: "objective (fact; group report L951-960)",
    reason: 'camels cannot "live without food"; the hump fat lets them go a long time without eating (L936 already says so). Core still matches the test regex /so that .*The graph shows /; all copies (expression, targets, recap, script, lines, slides, L960 recap line) changed together',
  },
  {
    lessons: [959], from: /たべものが なくても いきられるように/g, to: "たべものが なくても ながく すごせるように", leaf: JA,
    reviewers: "objective (fact; group report L951-960)", reason: "JA follows the corrected core (go a long time without food)",
  },
  {
    lessons: [916, 917, 918, 919, 920], from: /ニブ はかせ/g, to: "ニブ先生", leaf: JA,
    reviewers: "objective (JA; group report L911-920)", reason: "Professor Nib is ニブ先生 in goalJa, conversation and TPR (29 times) but ニブ はかせ in five subtitles; one name for kids",
  },
  {
    lessons: [915, 920], from: /はぐるま/g, to: "ギア", leaf: JA,
    reviewers: "objective (JA; group report L911-920)", reason: "the golden gears are ギア in every other W31 line (36 times); one name for kids",
  },
  {
    lessons: [901], from: "はぐるまの かたちだね", to: "ギア（はぐるま）の かたちだね", leaf: JA,
    reviewers: "objective (JA; group report L911-920)", reason: "first mention: introduce the name ギア used from L905 on, with はぐるま as the gloss",
  },
  {
    lessons: [915], from: "きんの ギアを ときの ちずに はめて。", to: "きんの ギアを タイムマップに はめて。", leaf: JA,
    reviewers: "objective (JA; group report L911-920)", reason: "the Time Map is タイムマップ in the same lesson (seg12) and in L925-930",
  },
  {
    lessons: [915], from: "And ation. Observe means watch carefully. Observe plus ation, observation. Obser-VA-tion!",
    to: "And a, t, i, o, n. Observe means watch carefully. Observe, observation. Ob-ser-VA-tion!", leaf: /segments\[10\]\.(say|subtitleEn)$/,
    reviewers: "B+C (group reports L901-910, L921-930)", reason: 'TTS reads a bare "ation" / "plus ation" as words; spell the letters (L902 form) and use the full hyphen beat form',
  },
  {
    lessons: [915], from: "obser-VA-tion！", to: "ob-ser-VA-tion！", leaf: /segments\[10\]\.subtitleJa$/,
    reviewers: "B+C (group reports)", reason: "JA follows the English beat form",
  },
  {
    lessons: [937], from: "Your turn! Talk about you.", to: "Your turn! Talk about yourself.", leaf: /\.(say|subtitleEn)$/,
    reviewers: "objective (grammar; group report L911-920)", reason: '"talk about you" -> "talk about yourself" (same fix as L912, L914, L918)',
  },
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
fs.writeFileSync(path.join(REPO, ".run9-w3132/patches/20-after.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
