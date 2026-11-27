// Check every lesson 661-720 in the CURRENT world files: the AI partner picked by the app matches
// "Next, talk with X!" in the wrap-up, and the starter does not introduce someone else.
import fs from "node:fs";
import path from "node:path";
import { pickConversationPartner, CHARACTER_NAME } from "../src/lib/conversation/engine";
const ROOT = path.resolve(__dirname, "..");
let bad = 0;
for (const w of [23, 24]) {
  const wf = JSON.parse(fs.readFileSync(path.join(ROOT, `content/curriculum/worlds/world-${w}.json`), "utf8"));
  for (const l of wf.lessons) {
    const p = CHARACTER_NAME[pickConversationPartner(l.lessonNo, l.conversation)];
    const wrap = l.teacher.segments.map((x: any) => x.say).join(" ").match(/talk with (\w+)\b/)?.[1];
    const self = /\bI'?m ([A-Z][a-z]+)\b/.exec(l.conversation.aiTask.starterEn)?.[1];
    const ok = p === wrap && (!self || self === p);
    if (!ok) bad++;
    if (!ok || process.argv.includes("--all")) console.log(`L${l.lessonNo} partner=${p} wrap=${wrap} self=${self} ${ok ? "OK" : "NG"}  ${l.conversation.aiTask.starterEn.slice(0, 90)}`);
  }
}
console.log(bad ? `PROBLEMS: ${bad}` : "ALL OK (partner = wrap-up = starter)");
