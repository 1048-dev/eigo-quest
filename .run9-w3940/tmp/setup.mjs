import fs from "node:fs";
import path from "node:path";
const root = "C:/Users/EMICLE/eigo-quest-night";
const src = path.join(root, ".run9-w3738"), dst = path.join(root, ".run9-w3940");
for (const d of ["patches", "notes", "tmp", "dump"]) fs.mkdirSync(path.join(dst, d), { recursive: true });
const files = ["lib.mjs", "dump.mjs", "apply.mjs", "reapply.sh", "check.ts", "checkall.ts", "partner.ts", "ctx.mjs", "items.mjs", "scan.mjs", "changes.mjs", "build-doc.mjs", "order.mjs"];
for (const f of files) {
  let t = fs.readFileSync(path.join(src, f), "utf8");
  t = t.replace(/w3738/g, "w3940").replace(/\[37, 38\]/g, "[39, 40]").replace(/world-37\.json/g, "world-39.json").replace(/world-38\.json/g, "world-40.json")
    .replace(/n <= 1110 \? 37 : 38/, "n <= 1170 ? 39 : 40").replace(/1081/g, "1141").replace(/1140/g, "1200").replace(/W37-38/g, "W39-40").replace(/worlds 37-38/g, "worlds 39-40");
  fs.writeFileSync(path.join(dst, f), t);
}
for (const f of files) {
  const t = fs.readFileSync(path.join(dst, f), "utf8");
  t.split("\n").forEach((line, i) => { if (/\b(37|38|1110|1111|1081|1140)\b/.test(line)) console.log(f, i + 1, line.slice(0, 150)); });
}
console.log("ok");
