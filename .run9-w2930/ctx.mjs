// Print short contexts of a regex in L841-900: node ctx.mjs <regex> [pathFilter]
import { loadWorlds, strings } from "./lib.mjs";
const re = new RegExp(process.argv[2], "g");
const pf = process.argv[3] ? new RegExp(process.argv[3]) : null;
for (const wf of loadWorlds().values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      if (pf && !pf.test(p)) continue;
      for (const m of s.matchAll(re)) console.log(`L${l.lessonNo} ${p}: …${s.slice(Math.max(0, m.index - 70), m.index + m[0].length + 70)}…`);
    }
