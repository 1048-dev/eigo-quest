// Grammar-order forms anywhere in English fields (also teacher.segments, which the test skips), and banned words.
// node .run9-w3738/order.mjs [patch files...]   (patches are applied in memory first)
import fs from "node:fs";
import { loadWorlds, lessonOf, strings, getAt, setAt } from "./lib.mjs";
const m = loadWorlds();
for (const f of process.argv.slice(2)) for (const p of JSON.parse(fs.readFileSync(f, "utf8"))) { const l = lessonOf(m, p.lesson); if (getAt(l, p.path) === p.before) setAt(l, p.path, p.after); }
const from = [
  [/\bas (?!well\b|soon\b|long\b|much\b|many\b|far\b|good\b|usual\b)[a-z]+ as (a|an|the)\b/i, 1088], [/\bso (?!that\b)[a-z]+ that\b/i, 1090],
  [/\bif (i|you|he|she|it|we|they) were\b/i, 1091], [/\bi wish i could\b/i, 1092], [/\bwhat would you do if\b/i, 1093], [/\bhad never\b/i, 1094],
  [/\bif i had\b/i, 1095], [/\bjust then\b/i, 1098], [/\bin the end\b/i, 1099], [/\bwhat if\b/i, 1107],
  [/\b(that|it) must be\b/i, 1116], [/\bi know how you feel\b/i, 1117], [/\bdidn't mean to\b/i, 1122], [/\bshould have\b/i, 1123], [/\bcould have\b/i, 1123],
  [/\bwouldn't it be better if\b/i, 1126], [/\bi'd rather not\b/i, 1129],
];
const BAN37 = /\b(kill|killed|blood|dead|die|died|gun|knife)\b/i;
const BAN38 = /\b(kill|killed|blood|dead|die|died|death|gun|knife|hate|hated|stupid|idiot|dumb|ugly|loser|shut up)\b/i;
const JA = /(Ja|\.ja|topic|testPoints\[\d+\]|highlightsJa\[\d+\])$/;
for (const wf of m.values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      if (JA.test(p)) continue;
      for (const [re, n] of from) if (l.lessonNo < n && (l.lessonNo >= 1111) === (n >= 1111) && re.test(s)) console.log(`ORDER L${l.lessonNo} ${p} ${re} (from L${n}): ${s.slice(0, 120)}`);
      if ((l.lessonNo <= 1110 ? BAN37 : BAN38).test(s)) console.log(`BANNED L${l.lessonNo} ${p}: ${s.slice(0, 120)}`);
    }
console.log("done");
