// Dump lessons 481-540 as "L<n> <path> = <json string>" lines, one file per 10 lessons.
import fs from "node:fs";
import path from "node:path";
const repo = process.argv[2];
const out = process.argv[3];
const SKIP = new Set(["emoji", "gesture", "kind", "lang", "rule", "world", "lessonNo", "reviewed"]);
function walk(v, p, acc) {
  if (typeof v === "string") acc.push([p, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`, acc));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (SKIP.has(k)) continue;
      walk(x, p ? `${p}.${k}` : k, acc);
    }
}
fs.mkdirSync(out, { recursive: true });
for (const w of [17, 18]) {
  const wf = JSON.parse(fs.readFileSync(path.join(repo, `content/curriculum/worlds/world-${w}.json`), "utf8"));
  for (let g = 0; g < 3; g++) {
    const ls = wf.lessons.slice(g * 10, g * 10 + 10);
    const lines = [`# world ${w}, stage ${wf.stage}, level ${wf.level}`];
    for (const l of ls) {
      lines.push("", `## L${l.lessonNo} ${l.title}`);
      const acc = [];
      walk(l, "", acc);
      for (const [p, s] of acc) lines.push(`${p} = ${JSON.stringify(s)}`);
    }
    fs.writeFileSync(path.join(out, `L${ls[0].lessonNo}-${ls.at(-1).lessonNo}.txt`), lines.join("\n") + "\n");
  }
}
