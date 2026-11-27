// Post-fix 00-mechanical.json: "A. Or, b..." / "Walk... or Speak..." are not two quiz choices but one running "or" sentence;
// the English subtitle should follow the say line ("Or a cat ...", "Walk... or speak..."), not "/ a cat ...".
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const f = path.join(REPO, ".run9-w1718/patches/00-mechanical.json");
const ps = JSON.parse(fs.readFileSync(f, "utf8"));
for (const p of ps) {
  if ([514, 515, 523].includes(p.lesson) && p.path.endsWith("subtitleEn")) {
    const say = ps.find((q) => q.lesson === p.lesson && q.path === p.path.replace("subtitleEn", "say"));
    p.after = say.after;
    p.reason = 'spoken "A. Or, b ..." is one running sentence (not two quiz choices): drop the comma after Or and follow the say line';
  }
}
fs.writeFileSync(f, JSON.stringify(ps, null, 1));
for (const p of ps) if (p.path.endsWith("subtitleEn")) console.log(p.lesson, p.after);
