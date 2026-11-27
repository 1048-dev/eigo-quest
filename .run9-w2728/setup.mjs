// Copy .run9-w2526 tooling to .run9-w2728 and adapt it to worlds 27-28 (L781-840)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w2526");
const dst = path.join(repo, ".run9-w2728");
for (const d of ["", "tmp", "notes", "patches", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs", "mechfix.mjs", "items.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[25, 26\]/g, "[27, 28]")
    .replace(/\.run9-w2526/g, ".run9-w2728")
    .replace(/L721-780/g, "L781-840")
    .replace(/721-780/g, "781-840")
    .replace(/< 721/g, "< 781")
    .replace(/> 780/g, "> 840")
    .replace(/n = 721; n <= 780/g, "n = 781; n <= 840")
    .replace(/n <= 750 \? 25 : 26/g, "n <= 810 ? 27 : 28")
    .replace(/world-25\.json/g, "world-27.json")
    .replace(/world-26\.json/g, "world-28.json")
    .replace(/W25-26/g, "W27-28")
    .replace(/worlds 25-26/g, "worlds 27-28");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w2526|\b7[2-8]\d\b|\[25|\[26|world-(25|26)/.test(line)) console.log(f, i + 1, line);
}
