// Block-wide follow-ups from the six group reports -> patches/20-after.json (run after 01-15 are applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const TS = /^teacherScript$/;
const SAYEN = /\.(say|subtitleEn)$/;
const JA = /\.subtitleJa$/;
const CEL = { reviewers: "objective (fact; group reports L1051-1060, L1061-1070)", reason: 'a US child reads "4 degrees" as Fahrenheit (below freezing). Say "degrees Celsius" at the first mention in each lesson (L1067 group did the same); later mentions stay "degrees"' };
const EMMA = { reviewers: "A+C (block rule; group report L1031-1040)", reason: "say is Ms. Emma's own line (I ask / I say), so JA 先生が きくよ / いうよ -> わたしが きくよ / いうよ, same as the rest of the block" };
const BIOME = { reviewers: "objective (fact; group report L1061-1070)", reason: "there are no plants in the deep sea (no sunlight; L1063 says so), but the biome definition said 'climate, plants and animals ... The deep sea is a biome'. -> special conditions / climate and living things (as L1070 teacherScript, group). Also src w36Phonics.ts biome definition" };
const R = (lessons, from, to, leaf, meta) => ({ lessons: Array.isArray(lessons) ? lessons : [lessons], from, to, leaf, ...meta });
const rules = [
  R(1053, "The water down here is very cold, about 2 to 4 degrees.", "The water down here is very cold, about 2 to 4 degrees Celsius.", TS, CEL),
  R(1055, "hotter than 350 degrees, and", "hotter than 350 degrees Celsius, and", TS, CEL),
  R(1072, "Deep water is very cold, about 2 to 4 degrees, even", "Deep water is very cold, about 2 to 4 degrees Celsius, even", TS, CEL),
  R(1072, "−2°C is minus two degrees. 4°C", "−2°C is minus two degrees Celsius. 4°C", TS, CEL),
  R(1072, "See this little circle and a big C? Say degrees. Minus two degrees.", "See this little circle and a big C? It means degrees Celsius. Minus two degrees.", SAYEN, CEL),
  R(1072, "degrees と いうよ。", "degrees Celsius（せっし 〜ど）の しるしだよ。", JA, CEL),
  R(1076, "−2°C is minus two degrees.", "−2°C is minus two degrees Celsius.", TS, CEL),
  R([1031, 1033, 1034], "先生が きくよ。「", "わたしが きくよ。「", JA, EMMA),
  R([1038, 1039], "先生が いうよ。「", "わたしが いうよ。「", JA, EMMA),
  R(1055, "What's a great question? A,", "What's a good question to ask? A,", SAYEN, { reviewers: "objective (grammar order)", reason: '"great question" is taught from L1071 ("That\'s a great question."); the quiz in L1055 used it early (teacher.segments, which the test does not read). -> good question to ask' }),
  R(1051, "A biome is a large area with its own climate, plants and animals.", "A biome is a large area with its own climate and living things.", TS, BIOME),
  R(1051, "A biome is a big area with its own weather, plants and animals.", "A biome is a big area with its own special conditions and living things.", SAYEN, BIOME),
  R(1051, "biome は、てんきと しょくぶつと どうぶつが そろった 大きな ちいき。", "biome は、とくべつな かんきょうと 生きものが そろった 大きな ちいき。", JA, BIOME),
  R(1051, "biome（気候と 草木と 生きものが そろった 大きな 地いき。", "biome（気候と 生きものが そろった 大きな 地いき。", /^phonics\.tipJa$/, BIOME),
  R(1070, "Biome. A big area with similar weather and living things.", "Biome. A big area with its own special conditions and living things.", SAYEN, BIOME),
  R(1070, "biome。天気や 生きものが にて いる 大きな ちいき。", "biome。とくべつな かんきょうと 生きものが そろった 大きな ちいき。", JA, BIOME),
];
const patches = [];
for (const r of rules) {
  let hit = 0;
  for (const n of r.lessons) {
    const l = lessonOf(m, n);
    for (const [p, c] of strings(l)) {
      if (r.leaf && !r.leaf.test(p)) continue;
      const t = c.split(r.from).join(r.to);
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
fs.writeFileSync(path.join(REPO, ".run9-w3536/patches/20-after.json"), JSON.stringify(out, null, 1));
console.log(out.length, "patches");
