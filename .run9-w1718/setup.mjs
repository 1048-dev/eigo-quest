// Copy .run9-w1516 tooling to .run9-w1718 and adapt it to worlds 17-18 (L481-540)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w1516");
const dst = path.join(repo, ".run9-w1718");
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[15, 16\]/g, "[17, 18]")
    .replace(/\.run9-w1516/g, ".run9-w1718")
    .replace(/421-480/g, "481-540")
    .replace(/< 421/g, "< 481")
    .replace(/> 480/g, "> 540")
    .replace(/n = 421; n <= 480/g, "n = 481; n <= 540")
    .replace(/n <= 450 \? 15 : 16/g, "n <= 510 ? 17 : 18")
    .replace(/world-15\.json content\/curriculum\/worlds\/world-16\.json/g, "world-17.json content/curriculum/worlds/world-18.json")
    .replace(/W15-16/g, "W17-18")
    .replace(/worlds 15-16/g, "worlds 17-18");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w1516|4[2-8][0-9]|\[15|world-1[56]/.test(line)) console.log(f, i + 1, line);
}
