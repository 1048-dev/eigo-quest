import { loadWorlds, lessonOf } from "../lib.mjs";
const m = loadWorlds();
for (const n of [733, 752, 761, 762, 765, 766, 767, 768, 769, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780]) {
  const l = lessonOf(m, n);
  console.log(`L${n} [${l.conversation.lines.map((x) => x.speaker).join(",")}] ${JSON.stringify(l.conversation.aiTask.starterEn)}\n   goal: ${l.conversation.aiTask.goalJa}`);
}
const l = lessonOf(m, 780);
console.log(l.teacher.segments.map((s) => s.say).filter((s) => /talk with/.test(s)));
