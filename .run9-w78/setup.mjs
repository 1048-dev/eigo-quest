// Copy .run9-w56 tooling to .run9-w78 and adapt it to worlds 7-8 (L181-240)
import fs from "node:fs";
import path from "node:path";
const repo = process.cwd();
const src = path.join(repo, ".run9-w56");
const dst = path.join(repo, ".run9-w78");
fs.mkdirSync(path.join(dst, "patches"), { recursive: true });
fs.mkdirSync(path.join(dst, "notes"), { recursive: true });
for (const f of ["lib.mjs", "dump.mjs", "mech.mjs", "apply.mjs", "changes.mjs", "check.ts", "reapply.sh"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[5, 6\]/g, "[7, 8]")
    .replace(/\.run9-w56/g, ".run9-w78")
    .replace(/121-180/g, "181-240")
    .replace(/< 121/g, "< 181")
    .replace(/> 180/g, "> 240")
    .replace(/n = 121; n <= 180/g, "n = 181; n <= 240")
    .replace(/n <= 150 \? 5 : 6/g, "n <= 210 ? 7 : 8")
    .replace(/world-05\.json content\/curriculum\/worlds\/world-06\.json/g, "world-07.json content/curriculum/worlds/world-08.json")
    .replace(/worlds 5-6/g, "worlds 7-8");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w56|121|180|150|\[5|world-0[56]/.test(line)) console.log(f, i + 1, line);
}
