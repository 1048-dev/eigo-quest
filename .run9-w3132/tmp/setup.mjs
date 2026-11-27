// copy the W29-30 toolkit and adapt it to worlds 31-32 (L901-960)
import fs from "node:fs";
import path from "node:path";
const repo = process.cwd();
const src = path.join(repo, ".run9-w2930");
const dst = path.join(repo, ".run9-w3132");
for (const d of ["patches", "notes", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
const files = process.argv.length > 2 ? process.argv.slice(2) : ["lib.mjs", "dump.mjs", "apply.mjs", "check.ts", "checkall.ts", "partner.ts", "scan.mjs", "ctx.mjs", "items.mjs", "changes.mjs", "build-doc.mjs", "reapply.sh"];
const subs = [
  [/w2930/g, "w3132"], [/\[29, 30\]/g, "[31, 32]"], [/n <= 870 \? 29 : 30/g, "n <= 930 ? 31 : 32"],
  [/841/g, "901"], [/<= 900/g, "<= 960"], [/> 900/g, "> 960"], [/W29-30/g, "W31-32"],
  [/world-29\.json/g, "world-31.json"], [/world-30\.json/g, "world-32.json"], [/worlds 29-30/g, "worlds 31-32"],
];
for (const f of files) {
  let s = fs.readFileSync(path.join(src, f), "utf8");
  for (const [a, b] of subs) s = s.replace(a, b);
  fs.writeFileSync(path.join(dst, f), s);
  s.split("\n").forEach((line, i) => { if (/\b(29|30|84\d|87\d|900)\b/.test(line)) console.log(`${f}:${i + 1}: ${line}`); });
}
