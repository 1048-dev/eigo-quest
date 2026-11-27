// Follow-up to 01: L349 "We had a big stage show in the fall." is 9 words (stage 1 max 8) -> drop "big" (seg20 already says "We had a stage show") -> patches/02-central.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings } from "./lib.mjs";
const m = loadWorlds();
const l = lessonOf(m, 349);
const patches = [];
const why = { reviewers: "B+lint", reason: '"in the fall" made the sentence 9 words (stage 1 max 8). Drop "big" (seg20 already says "We had a stage show"); JA おおきな goes too. The L349 expression ID changes' };
for (const [p, s] of strings(l)) {
  let t = s.replace(/We had a big stage show in the fall\./g, "We had a stage show in the fall.");
  t = t.replace(/あきに おおきな ステージショーが/g, "あきに ステージショーが");
  if (t !== s) patches.push({ lesson: 349, path: p, before: s, after: t, ...why });
}
fs.writeFileSync(path.join(REPO, ".run9-w1112/patches/02-central.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(x.path, "|", x.after.slice(0, 120));
