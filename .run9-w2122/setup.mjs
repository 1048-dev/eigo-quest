// Copy .run9-w1920 tooling to .run9-w2122 and adapt it to worlds 21-22 (L601-660)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w1920");
const dst = path.join(repo, ".run9-w2122");
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[19, 20\]/g, "[21, 22]")
    .replace(/\.run9-w1920/g, ".run9-w2122")
    .replace(/541-600/g, "601-660")
    .replace(/< 541/g, "< 601")
    .replace(/> 600/g, "> 660")
    .replace(/n = 541; n <= 600/g, "n = 601; n <= 660")
    .replace(/n <= 570 \? 19 : 20/g, "n <= 630 ? 21 : 22")
    .replace(/world-19\.json content\/curriculum\/worlds\/world-20\.json/g, "world-21.json content/curriculum/worlds/world-22.json")
    .replace(/W19-20/g, "W21-22")
    .replace(/worlds 19-20/g, "worlds 21-22");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w1920|5[4-9][0-9]|60[0-9]|\[19|\[20|world-(19|20)/.test(line)) console.log(f, i + 1, line);
}
