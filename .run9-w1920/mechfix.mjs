// Post-fix 00-mechanical.json: L575 "Use two hands. Or, Put it in the mailbox." is one running instruction (not two quiz choices);
// the English subtitle should follow the say line ("Or put it in the mailbox."), not "/ Put it ...". (same as W17-18 mechfix)
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const f = path.join(REPO, ".run9-w1920/patches/00-mechanical.json");
const ps = JSON.parse(fs.readFileSync(f, "utf8"));
for (const p of ps) {
  if ([575].includes(p.lesson) && p.path.endsWith("subtitleEn")) {
    const say = ps.find((q) => q.lesson === p.lesson && q.path === p.path.replace("subtitleEn", "say"));
    p.after = say.after;
    p.reason = 'spoken "A. Or, B ..." is one running instruction (not two quiz choices): drop the comma after Or and follow the say line';
  }
}
fs.writeFileSync(f, JSON.stringify(ps, null, 1));
for (const p of ps) if (p.path.endsWith("subtitleEn")) console.log(p.lesson, p.after);
