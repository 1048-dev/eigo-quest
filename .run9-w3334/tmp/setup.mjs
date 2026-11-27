// copy the W31-32 toolkit and adapt it to worlds 33-34 (L961-1020)
import fs from "node:fs";
import path from "node:path";
const repo = process.cwd();
const src = path.join(repo, ".run9-w3132");
const dst = path.join(repo, ".run9-w3334");
for (const d of ["patches", "notes", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
const files = ["lib.mjs", "dump.mjs", "apply.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "ctx.mjs", "items.mjs", "changes.mjs", "build-doc.mjs", "reapply.sh"];
const subs = [
  [/w3132/g, "w3334"], [/\[31, 32\]/g, "[33, 34]"], [/n <= 930 \? 31 : 32/g, "n <= 990 ? 33 : 34"],
  [/<= 960/g, "<= 1020"], [/> 960/g, "> 1020"], [/901/g, "961"], [/W31-32/g, "W33-34"],
  [/world-31\.json/g, "world-33.json"], [/world-32\.json/g, "world-34.json"], [/worlds 31-32/g, "worlds 33-34"],
];
for (const f of files) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  for (const [a, b] of subs) s = s.replace(a, b);
  fs.writeFileSync(path.join(dst, f), s);
  s.split("\n").forEach((line, i) => { if (/\b(31|32|9[0-6]\d)\b/.test(line)) console.log(`${f}:${i + 1}: ${line}`); });
}
