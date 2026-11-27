// List learning-item / title changes vs HEAD for worlds 29-30
import { execSync } from "node:child_process";
import { loadWorlds } from "./lib.mjs";
const now = loadWorlds();
for (const w of [29, 30]) {
  const o = JSON.parse(execSync(`git show HEAD:content/curriculum/worlds/world-${w}.json`, { encoding: "utf8", maxBuffer: 1 << 28 }));
  const n = now.get(w);
  o.lessons.forEach((l, i) => {
    const m = n.lessons[i];
    for (const k of ["vocab", "tpr"]) l[k].forEach((x, j) => { if (x.en !== m[k][j].en) console.log(l.lessonNo, k, x.en, "->", m[k][j].en); });
    l.school.expressions.forEach((x, j) => { if (x.en !== m.school.expressions[j].en) console.log(l.lessonNo, "expr", x.en, "->", m.school.expressions[j].en); });
    (l.phonics.words || []).forEach((x, j) => { if (x !== m.phonics.words[j]) console.log(l.lessonNo, "phonics", x, "->", m.phonics.words[j]); });
    if (l.title !== m.title) console.log(l.lessonNo, "title", l.title, "->", m.title);
  });
}
