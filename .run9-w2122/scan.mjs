// Count block-wide patterns in L601-660 (say/subtitle/etc.)
import { loadWorlds, strings } from "./lib.mjs";
const m = loadWorlds();
const show = process.argv.includes("--show");
const pats = process.argv.slice(2).filter((a) => a !== "--show").map((p) => new RegExp(p, "g"));
for (const re of pats) {
  let n = 0;
  const where = new Set();
  for (const wf of m.values())
    for (const l of wf.lessons)
      for (const [p, s] of strings(l)) {
        const k = (s.match(re) || []).length;
        if (k) { n += k; where.add(l.lessonNo); if (show) console.log(`  L${l.lessonNo} ${p}: ${s.slice(0, 160)}`); }
      }
  console.log(`${re.source.padEnd(20)} ${n}  [${[...where].join(",")}]`);
}
