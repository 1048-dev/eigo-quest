// Grammar-order forms anywhere in English fields (also teacher.segments, which the test skips)
import { loadWorlds, strings } from "./lib.mjs";
const from = [
  [/\bmake sure\b/i, 972], [/\bhold on\b/i, 976], [/\bstay calm\b/i, 977], [/\bas soon as\b/i, 978], [/\bunless\b/i, 979],
  [/\bhow can we help\b/i, 981], [/\brebuilt\b/i, 984],
  [/\bdo you know where\b/i, 995], [/\bwould you mind\b/i, 1002], [/\bcould you tell me (where|what|how|when|if)\b/i, 1003],
  [/\brecommend/i, 1004], [/\bI'm afraid\b/i, 1007], [/\binstead\b/i, 1008], [/\bthat's very kind of you\b/i, 1010], [/\bI'm writing to\b/i, 1016],
];
const JA = /(Ja|\.ja|topic|testPoints\[\d+\]|highlightsJa\[\d+\])$/;
for (const wf of loadWorlds().values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      if (JA.test(p)) continue;
      for (const [re, n] of from) if (l.lessonNo < n && (l.lessonNo >= 991) === (n >= 991) && re.test(s)) console.log(`L${l.lessonNo} ${p} ${re} (from L${n}): ${s.slice(0, 120)}`);
    }
console.log("done");
