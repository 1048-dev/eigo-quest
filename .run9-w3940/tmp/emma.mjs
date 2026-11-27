import { loadWorlds, strings } from "../lib.mjs";
const re = /Ms\. Emma/g;
for (const wf of loadWorlds().values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      if (!/^teacherScript$/.test(p)) continue;
      for (const m of s.matchAll(re)) console.log(`L${l.lessonNo}: …${s.slice(Math.max(0, m.index - 60), m.index + 160)}…`);
    }
