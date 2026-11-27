// Copy .run9-w78 tooling to .run9-w910 and adapt it to worlds 9-10 (L241-300)
import fs from "node:fs";
import path from "node:path";
const repo = process.cwd();
const src = path.join(repo, ".run9-w78");
const dst = path.join(repo, ".run9-w910");
fs.mkdirSync(path.join(dst, "patches"), { recursive: true });
fs.mkdirSync(path.join(dst, "notes"), { recursive: true });
for (const f of ["lib.mjs", "dump.mjs", "mech.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "reapply.sh"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[7, 8\]/g, "[9, 10]")
    .replace(/\.run9-w78/g, ".run9-w910")
    .replace(/181-240/g, "241-300")
    .replace(/< 181/g, "< 241")
    .replace(/> 240/g, "> 300")
    .replace(/n = 181; n <= 240/g, "n = 241; n <= 300")
    .replace(/n <= 210 \? 7 : 8/g, "n <= 270 ? 9 : 10")
    .replace(/world-07\.json content\/curriculum\/worlds\/world-08\.json/g, "world-09.json content/curriculum/worlds/world-10.json")
    .replace(/worlds 7-8/g, "worlds 9-10")
    .replace(/world-0\$\{w\}/g, 'world-${String(w).padStart(2, "0")}')
    .replace(/^node \.run9-w910\/extra\.mjs\n/m, "");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w78|181|240|210|\[7|world-0|extra/.test(line)) console.log(f, i + 1, line);
}
