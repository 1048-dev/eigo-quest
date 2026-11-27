// Copy .run9-w2122 tooling to .run9-w2324 and adapt it to worlds 23-24 (L661-720)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w2122");
const dst = path.join(repo, ".run9-w2324");
for (const d of ["", "tmp", "notes", "patches"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs", "items.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[21, 22\]/g, "[23, 24]")
    .replace(/\.run9-w2122/g, ".run9-w2324")
    .replace(/601-660/g, "661-720")
    .replace(/< 601/g, "< 661")
    .replace(/> 660/g, "> 720")
    .replace(/n = 601; n <= 660/g, "n = 661; n <= 720")
    .replace(/n <= 630 \? 21 : 22/g, "n <= 690 ? 23 : 24")
    .replace(/world-21\.json content\/curriculum\/worlds\/world-22\.json/g, "world-23.json content/curriculum/worlds/world-24.json")
    .replace(/W21-22/g, "W23-24")
    .replace(/worlds 21-22/g, "worlds 23-24");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w2122|6[0-5][0-9]|660|\[21|\[22|world-(21|22)/.test(line)) console.log(f, i + 1, line);
}
