// Copy the W35-36 tooling and adapt it to W37-38 (L1081-1140)
import fs from "node:fs";
import path from "node:path";
const root = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(root, ".run9-w3536"), dst = path.join(root, ".run9-w3738");
for (const d of ["patches", "notes", "tmp", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
const files = ["lib.mjs", "dump.mjs", "apply.mjs", "reapply.sh", "check.ts", "checkall.ts", "partner.ts", "ctx.mjs", "items.mjs", "scan.mjs", "changes.mjs", "build-doc.mjs"];
for (const f of files) {
  let t = fs.readFileSync(path.join(src, f), "utf8");
  t = t.replace(/w3536/g, "w3738").replace(/\[35, 36\]/g, "[37, 38]").replace(/world-35\.json/g, "world-37.json").replace(/world-36\.json/g, "world-38.json")
    .replace(/n <= 1050 \? 35 : 36/, "n <= 1110 ? 37 : 38").replace(/1021/g, "1081").replace(/1080/g, "1140").replace(/W35-36/g, "W37-38").replace(/worlds 33-34/g, "worlds 37-38");
  fs.writeFileSync(path.join(dst, f), t);
}
for (const f of files) {
  const t = fs.readFileSync(path.join(dst, f), "utf8");
  t.split("\n").forEach((line, i) => { if (/\b(35|36|1050|1051|1021|1080)\b/.test(line)) console.log(f, i + 1, line); });
}
console.log("ok");
