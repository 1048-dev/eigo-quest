// Copy .run9-w1112 tooling to .run9-w1314 and adapt it to worlds 13-14 (L361-420)
import fs from "node:fs";
import path from "node:path";
const repo = process.cwd();
const src = path.join(repo, ".run9-w1112");
const dst = path.join(repo, ".run9-w1314");
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[11, 12\]/g, "[13, 14]")
    .replace(/\.run9-w1112/g, ".run9-w1314")
    .replace(/301-360/g, "361-420")
    .replace(/< 301/g, "< 361")
    .replace(/> 360/g, "> 420")
    .replace(/n = 301; n <= 360/g, "n = 361; n <= 420")
    .replace(/n <= 330 \? 11 : 12/g, "n <= 390 ? 13 : 14")
    .replace(/world-11\.json content\/curriculum\/worlds\/world-12\.json/g, "world-13.json content/curriculum/worlds/world-14.json")
    .replace(/W11-12/g, "W13-14")
    .replace(/worlds 11-12/g, "worlds 13-14");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w1112|30[0-9]|360|330|\[11|world-1[12]/.test(line)) console.log(f, i + 1, line);
}
