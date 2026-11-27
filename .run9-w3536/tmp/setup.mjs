import fs from "node:fs";
const s = "C:/Users/EMICLE/eigo-quest-night/.run9-w3334/";
const d = "C:/Users/EMICLE/eigo-quest-night/.run9-w3536/";
for (const x of ["patches", "notes", "tmp", "dump"]) fs.mkdirSync(d + x, { recursive: true });
const R = [
  ["run9-w3334", "run9-w3536"], ["[33, 34]", "[35, 36]"],
  ["world-33.json content/curriculum/worlds/world-34.json", "world-35.json content/curriculum/worlds/world-36.json"],
  ["< 961 || l.lessonNo > 1020", "< 1021 || l.lessonNo > 1080"], ["n <= 990 ? 33 : 34", "n <= 1050 ? 35 : 36"],
  ["n = 961; n <= 1020", "n = 1021; n <= 1080"], ["W33-34", "W35-36"],
];
for (const f of ["lib.mjs", "dump.mjs", "apply.mjs", "reapply.sh", "check.ts", "checkall.ts", "partner.ts", "changes.mjs", "build-doc.mjs", "scan.mjs", "ctx.mjs", "items.mjs"]) {
  let t = fs.readFileSync(s + f, "utf8");
  for (const [a, b] of R) t = t.split(a).join(b);
  fs.writeFileSync(d + f, t);
  t.split("\n").forEach((line, i) => { if (/\b(33|34|961|990|1020)\b/.test(line)) console.log(f, i + 1, line); });
}
