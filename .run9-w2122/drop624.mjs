// Drop the L624 seg6 / seg14 patches from 12-L621-630.json: tests/teacher.test.ts forbids "your address" / じゅうしょ in teacher
// segments (so the script never sounds like it asks for an address). The original "home address" / "where I live" / おうちの ばしょ
// wording was written that way on purpose. Kept as is (coordinator decision).
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const f = path.join(REPO, ".run9-w2122/patches/12-L621-630.json");
const ps = JSON.parse(fs.readFileSync(f, "utf8"));
const keep = ps.filter((p) => !(p.lesson === 624 && /^teacher\.segments\[(6|14)\]\./.test(p.path)));
console.log("dropped", ps.length - keep.length);
fs.writeFileSync(f, JSON.stringify(keep, null, 1));
