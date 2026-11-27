// Post-fix 00-mechanical.json:
// - L617 / L651 "A. Or, B." is one running example ("you can say A, or B"), not two quiz choices:
//   the English subtitle follows the say line ("Or I was walking ..."), not "/ I was ..." (same as W17-20 mechfix).
// - L639 "answer, Me too! or Really?" names two quoted answers inside one sentence; "Or really?" would hide that Really? is a
//   quoted answer. Keep the original line (drop both patches).
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const f = path.join(REPO, ".run9-w2122/patches/00-mechanical.json");
let ps = JSON.parse(fs.readFileSync(f, "utf8"));
ps = ps.filter((p) => p.lesson !== 639);
for (const p of ps) {
  if ([617, 651].includes(p.lesson) && p.path.endsWith("subtitleEn")) {
    const say = ps.find((q) => q.lesson === p.lesson && q.path === p.path.replace("subtitleEn", "say"));
    p.after = say.after;
    p.reason = 'spoken "A. Or, B." is one running example (not two quiz choices): drop the comma after Or and follow the say line';
  }
}
fs.writeFileSync(f, JSON.stringify(ps, null, 1));
for (const p of ps) console.log(p.lesson, p.path, p.after);
