// Apply patches/*.json (or given files) in order. A patch applies only when `before` equals the current value.
// Usage: node apply.mjs [--dry] [files...]
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, saveWorlds, lessonOf, getAt, setAt } from "./lib.mjs";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
let files = args.filter((a) => !a.startsWith("--"));
const dir = path.join(REPO, ".run9-w2526/patches");
if (!files.length) files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(dir, f));
const m = loadWorlds();
let ok = 0, miss = 0;
const applied = [];
for (const f of files) {
  const ps = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const p of ps) {
    const l = lessonOf(m, p.lesson);
    const cur = getAt(l, p.path);
    if (cur !== p.before) {
      miss++;
      console.log(`MISS ${path.basename(f)} L${p.lesson} ${p.path}\n  cur: ${JSON.stringify(cur)}\n  bef: ${JSON.stringify(p.before)}`);
      continue;
    }
    setAt(l, p.path, p.after);
    ok++;
    applied.push({ ...p, file: path.basename(f) });
  }
}
console.log(`applied ${ok}, missed ${miss}`);
if (args.includes("--mark")) {
  for (const wf of m.values())
    wf.lessons = wf.lessons.map((l) => {
      if (l.lessonNo < 721 || l.lessonNo > 780) return l;
      const { lessonNo, world, reviewed, ...rest } = l;
      return { lessonNo, world, reviewed: "run9", ...rest };
    });
}
if (!dry) {
  saveWorlds(m);
  fs.writeFileSync(path.join(REPO, ".run9-w2526/applied.json"), JSON.stringify(applied, null, 1));
}
