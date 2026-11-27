// Copy .run9-w1718 tooling to .run9-w1920 and adapt it to worlds 19-20 (L541-600)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w1718");
const dst = path.join(repo, ".run9-w1920");
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[17, 18\]/g, "[19, 20]")
    .replace(/\.run9-w1718/g, ".run9-w1920")
    .replace(/481-540/g, "541-600")
    .replace(/< 481/g, "< 541")
    .replace(/> 540/g, "> 600")
    .replace(/n = 481; n <= 540/g, "n = 541; n <= 600")
    .replace(/n <= 510 \? 17 : 18/g, "n <= 570 ? 19 : 20")
    .replace(/world-17\.json content\/curriculum\/worlds\/world-18\.json/g, "world-19.json content/curriculum/worlds/world-20.json")
    .replace(/W17-18/g, "W19-20")
    .replace(/worlds 17-18/g, "worlds 19-20");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w1718|4[89][0-9]|5[0-4][0-9]|\[17|world-1[78]/.test(line)) console.log(f, i + 1, line);
}
