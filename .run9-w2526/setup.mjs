// Copy .run9-w2324 tooling to .run9-w2526 and adapt it to worlds 25-26 (L721-780)
import fs from "node:fs";
import path from "node:path";
const repo = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(repo, ".run9-w2324");
const dst = path.join(repo, ".run9-w2526");
for (const d of ["", "tmp", "notes", "patches", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "changes.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "reapply.sh", "build-doc.mjs", "mech.mjs", "mechfix.mjs", "items.mjs"]) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  s = s
    .replace(/\[23, 24\]/g, "[25, 26]")
    .replace(/\.run9-w2324/g, ".run9-w2526")
    .replace(/L661-720/g, "L721-780")
    .replace(/661-720/g, "721-780")
    .replace(/< 661/g, "< 721")
    .replace(/> 720/g, "> 780")
    .replace(/n = 661; n <= 720/g, "n = 721; n <= 780")
    .replace(/n <= 690 \? 23 : 24/g, "n <= 750 ? 25 : 26")
    .replace(/world-23\.json/g, "world-25.json")
    .replace(/world-24\.json/g, "world-26.json")
    .replace(/W23-24/g, "W25-26")
    .replace(/worlds 23-24/g, "worlds 25-26");
  fs.writeFileSync(path.join(dst, f), s);
  for (const [i, line] of s.split("\n").entries()) if (/w2324|\b6[6-9]\d\b|\b7[01]\d\b|720|\[23|\[24|world-(23|24)/.test(line)) console.log(f, i + 1, line);
}
