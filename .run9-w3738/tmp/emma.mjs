import { loadWorlds } from "../lib.mjs";
for (const wf of loadWorlds().values())
  for (const l of wf.lessons) {
    const sents = l.teacherScript.split(/(?<=[.!?])\s+/);
    sents.forEach((x, i) => { if (/Ms\. Emma/.test(x)) console.log(`L${l.lessonNo}: ${x} || ${(sents[i + 1] || "").slice(0, 160)}`); });
    for (const [i, s] of l.teacher.segments.entries()) if (/Ms\. Emma/.test(s.say)) console.log(`L${l.lessonNo} seg${i} SAY: ${s.say}\n   JA: ${s.subtitleJa}`);
  }
