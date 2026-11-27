// Grammar-order forms anywhere in English fields (also teacher.segments, which the test skips)
import { loadWorlds, strings } from "./lib.mjs";
const from = [
  [/\bon the one hand\b/i, 1025], [/\bon the other hand\b/i, 1025], [/\bhave a chance to\b/i, 1027], [/\b(have|has) the right to\b/i, 1031],
  [/\bresponsible for\b/i, 1032], [/\bsuggest that\b/i, 1036], [/\bcompromise\b/i, 1038],
  [/\bthe reason why\b/i, 1053], [/\baccording to\b/i, 1058], [/\bin short\b/i, 1061], [/\bthe main point is\b/i, 1062],
  [/\bin conclusion\b/i, 1069], [/\blet me explain\b/i, 1071], [/\bgreat question\b/i, 1071], [/\blook (it|them|that) up\b/i, 1074],
];
const JA = /(Ja|\.ja|topic|testPoints\[\d+\]|highlightsJa\[\d+\])$/;
for (const wf of loadWorlds().values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      if (JA.test(p)) continue;
      for (const [re, n] of from) if (l.lessonNo < n && (l.lessonNo >= 1051) === (n >= 1051) && re.test(s)) console.log(`L${l.lessonNo} ${p} ${re} (from L${n}): ${s.slice(0, 120)}`);
    }
console.log("done");
