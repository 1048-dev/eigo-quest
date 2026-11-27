import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w2728");
const dst = path.join(repo, ".run9-w2930");
for (const d of ["", "tmp", "notes", "patches", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs", "mechfix.mjs", "items.mjs", "ctx.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[27, 28\]/g, "[29, 30]")
    .replace(/\.run9-w2728/g, ".run9-w2930")
    .replace(/L781-840/g, "L841-900")
    .replace(/781-840/g, "841-900")
    .replace(/< 781/g, "< 841")
    .replace(/> 840/g, "> 900")
    .replace(/n = 781; n <= 840/g, "n = 841; n <= 900")
    .replace(/n <= 810 \? 27 : 28/g, "n <= 870 ? 29 : 30")
    .replace(/world-27\.json/g, "world-29.json")
    .replace(/world-28\.json/g, "world-30.json")
    .replace(/W27-28/g, "W29-30")
    .replace(/worlds 27-28/g, "worlds 29-30");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w2728|\b7[89]\d\b|\b8[0-4]\d\b|\[27|\[28|world-(27|28)/.test(line)) console.log(f, i + 1, line);
}
