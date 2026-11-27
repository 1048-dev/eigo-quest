// Check every lesson 781-840 in the CURRENT world files: the AI partner picked by the app matches
// "Next, (go and) talk with X!" in the wrap-up (the last one; L780 also says "talk with feeling"), and the starter does not
// introduce someone else. A named non-cast role (Mr. Hoot, Lulu, Echo, Mr. Mole) must be framed as "Let's pretend I'm X".
import fs from "node:fs";
import path from "node:path";
import { pickConversationPartner, CHARACTER_NAME } from "../src/lib/conversation/engine";
const ROOT = path.resolve(__dirname, "..");
const CAST = new Set(Object.values(CHARACTER_NAME));
let bad = 0;
for (const w of [27, 28]) {
  const wf = JSON.parse(fs.readFileSync(path.join(ROOT, `content/curriculum/worlds/world-${w}.json`), "utf8"));
  for (const l of wf.lessons) {
    const p = CHARACTER_NAME[pickConversationPartner(l.lessonNo, l.conversation)];
    const wrap = [...l.teacher.segments.map((x: any) => x.say).join(" ").matchAll(/talk with (\w+)\b/g)].at(-1)?.[1];
    const st: string = l.conversation.aiTask.starterEn;
    const self = /\bI'?m ([A-Z][a-z]+)\b/.exec(st)?.[1];
    const selfOk = !self || self === p || (!CAST.has(self) && /Let's pretend I'm /.test(st));
    const ok = p === wrap && selfOk;
    if (!ok) bad++;
    if (!ok || process.argv.includes("--all")) console.log(`L${l.lessonNo} partner=${p} wrap=${wrap} self=${self} ${ok ? "OK" : "NG"}  ${st.slice(0, 90)}`);
  }
}
console.log(bad ? `PROBLEMS: ${bad}` : "ALL OK (partner = wrap-up = starter)");
