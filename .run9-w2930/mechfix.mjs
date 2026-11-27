// Post-fix 00-mechanical.json: every spoken "A. Or, B." in L841-900 is one running example of two possible answers
// ("Answer, Yes, it does. Or, No, it doesn't."), not two quiz choices. The English subtitle follows the say line
// ("Or no, it doesn't."), not "/ No, it doesn't." (same as W15-22 mechfix; W15-16 already has "Or no, she doesn't.").
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const f = path.join(REPO, ".run9-w2930/patches/00-mechanical.json");
const ps = JSON.parse(fs.readFileSync(f, "utf8"));
for (const p of ps) {
  if (p.path.endsWith("subtitleEn")) {
    const say = ps.find((q) => q.lesson === p.lesson && q.path === p.path.replace("subtitleEn", "say"));
    if (!say || say.before !== p.before) throw new Error(`L${p.lesson} ${p.path}: say differs`);
    p.after = say.after;
    p.reason = 'spoken "A. Or, B." is one running example (two possible answers, not quiz choices): drop the comma after Or and follow the say line';
  }
}
fs.writeFileSync(f, JSON.stringify(ps, null, 1));
for (const p of ps) if (p.path.endsWith("subtitleEn")) console.log(p.lesson, p.after);
