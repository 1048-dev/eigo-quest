// Grammar-order forms anywhere in English fields (also teacher.segments, which the test skips), banned words and org names.
// node .run9-w3940/order.mjs [patch files...]   (patches are applied in memory first)
import fs from "node:fs";
import { loadWorlds, lessonOf, strings, getAt, setAt } from "./lib.mjs";
const m = loadWorlds();
for (const f of process.argv.slice(2)) for (const p of JSON.parse(fs.readFileSync(f, "utf8"))) { const l = lessonOf(m, p.lesson); if (getAt(l, p.path) === p.before) setAt(l, p.path, p.after); }
const from = [
  [/\bpoint of view\b/i, 1146], [/\bhowever\b/i, 1148], [/\bit seems\b/i, 1149], [/\bmoreover\b/i, 1150], [/\btherefore\b/i, 1150],
  [/\bwe believe that\b/i, 1152], [/\bwe disagree\b/i, 1154], [/\bif everyone\b[^.?!]*\bwould\b/i, 1157], [/\bwe propose that\b/i, 1163],
  [/\bsince I started\b/i, 1173], [/\bmy advice is\b/i, 1179], [/\bI hope to\b/i, 1186], [/\bby the time I'm\b/i, 1187],
  [/\bcouldn't have done it without\b/i, 1191], [/\bhad been watching\b/i, 1195], [/\bBirimo's secret\b/i, 1195],
];
const BAN39 = /\b(kill|killed|blood|dead|die|died|dying|death|gun|knife|hate|hated|stupid|idiot|dumb|ugly|loser|shut up|war|wars|bomb|starve|starving|poor people|disaster)\b/i;
const BAN40 = /\b(kill|killed|blood|dead|die|died|dying|death|gun|knife|hate|hated|stupid|idiot|dumb|ugly|loser|shut up|war|wars|bomb|starve|starving|disaster)\b/i;
const ORG39 = /\b(UN|UNICEF|SDGs?|United Nations)\b/;
const ORG40 = /\b(Eiken|TOEIC|TOEFL|IELTS|UN|UNICEF)\b/;
const JA = /(Ja|\.ja|topic|testPoints\[\d+\]|highlightsJa\[\d+\])$/;
for (const wf of m.values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      if (JA.test(p)) continue;
      if (/^title$/.test(p)) continue;
      for (const [re, n] of from) if (l.lessonNo < n && (l.lessonNo >= 1171) === (n >= 1171) && re.test(s)) console.log(`ORDER L${l.lessonNo} ${p} ${re} (from L${n}): ${s.slice(0, 120)}`);
      const w39 = l.lessonNo <= 1170;
      if ((w39 ? BAN39 : BAN40).test(s)) console.log(`BANNED L${l.lessonNo} ${p}: ${s.slice(0, 120)}`);
      if ((w39 ? ORG39 : ORG40).test(s)) console.log(`ORG L${l.lessonNo} ${p}: ${s.slice(0, 120)}`);
    }
console.log("done");
