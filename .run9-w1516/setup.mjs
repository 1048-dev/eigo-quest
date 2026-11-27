// Copy .run9-w1314 tooling to .run9-w1516 and adapt it to worlds 15-16 (L421-480)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w1314");
const dst = path.join(repo, ".run9-w1516");
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[13, 14\]/g, "[15, 16]")
    .replace(/\.run9-w1314/g, ".run9-w1516")
    .replace(/361-420/g, "421-480")
    .replace(/< 361/g, "< 421")
    .replace(/> 420/g, "> 480")
    .replace(/n = 361; n <= 420/g, "n = 421; n <= 480")
    .replace(/n <= 390 \? 13 : 14/g, "n <= 450 ? 15 : 16")
    .replace(/world-13\.json content\/curriculum\/worlds\/world-14\.json/g, "world-15.json content/curriculum/worlds/world-16.json")
    .replace(/W13-14/g, "W15-16")
    .replace(/worlds 13-14/g, "worlds 15-16");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w1314|36[0-9]|3[89][0-9]|4[01][0-9]|420|\[13|world-1[34]/.test(line)) console.log(f, i + 1, line);
}
