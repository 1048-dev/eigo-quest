// Copy .run9-w78 tooling to .run9-w1112 and adapt it to worlds 11-12 (L301-360)
import fs from "node:fs";
import path from "node:path";
const repo = process.cwd();
const src = path.join(repo, ".run9-w78");
const dst = path.join(repo, ".run9-w1112");
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[7, 8\]/g, "[11, 12]")
    .replace(/\.run9-w78/g, ".run9-w1112")
    .replace(/181-240/g, "301-360")
    .replace(/< 181/g, "< 301")
    .replace(/> 240/g, "> 360")
    .replace(/n = 181; n <= 240/g, "n = 301; n <= 360")
    .replace(/n <= 210 \? 7 : 8/g, "n <= 330 ? 11 : 12")
    .replace(/world-0\$\{w\}/g, "world-${w}")
    .replace(/worlds 7-8/g, "worlds 11-12");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w78|181|240|210|\[7|world-0[78]/.test(line)) console.log(f, i + 1, line);
}
