import { loadWorlds, lessonOf } from "../lib.mjs";
const m = loadWorlds();
const around = (s, k, r = 90) => { const i = s.indexOf(k); return i < 0 ? "-" : s.slice(Math.max(0, i - r), i + r); };
console.log("750:", around(lessonOf(m, 750).teacherScript, "onight"));
console.log("740:", around(lessonOf(m, 740).teacherScript, "onight"));
console.log("730:", around(lessonOf(m, 730).teacherScript, " ive"), "|", around(lessonOf(m, 730).teacherScript, "Ive"));
for (const n of [732, 742, 753]) console.log(n, lessonOf(m, n).teacher.segments[0].subtitleJa);
for (const n of [731, 739]) console.log(n, lessonOf(m, n).teacher.segments[3].subtitleJa);
console.log(757, lessonOf(m, 757).conversation.aiTask.goalJa);
for (let n = 721; n <= 780; n++) {
  const l = lessonOf(m, n);
  const g = l.conversation.aiTask.goalJa, s = l.conversation.aiTask.starterEn;
  if (/ルル|フート|エコー|モール|もぐら/.test(g) && !/Let's pretend|Hoo/.test(s)) console.log("GOAL", n, g, "|", s);
}
