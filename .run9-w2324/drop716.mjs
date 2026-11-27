// Drop the two L716 group patches that changed 「がっこうめい」 -> 「がっこうの なまえ」 in teacher subtitles.
// tests/teacher.test.ts forbids 「がっこうの なまえ」 in teacher segments (it must never sound like asking for the school name),
// so the original 「がっこうめい」 is on purpose.
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const f = path.join(REPO, ".run9-w2324/patches/15-L711-720.json");
const ps = JSON.parse(fs.readFileSync(f, "utf8"));
const out = ps.filter((p) => !(p.lesson === 716 && /がっこうの なまえ/.test(p.after) && /subtitleJa$/.test(p.path)));
console.log(`dropped ${ps.length - out.length}`);
fs.writeFileSync(f, JSON.stringify(out, null, 1));
