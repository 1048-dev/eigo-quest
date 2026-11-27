import fs from "node:fs";
import path from "node:path";
import { pickConversationPartner, CHARACTER_NAME } from "../../src/lib/conversation/engine";
const ROOT = path.resolve(__dirname, "../..");
for (const w of [39, 40]) {
  const wf = JSON.parse(fs.readFileSync(path.join(ROOT, `content/curriculum/worlds/world-${w}.json`), "utf8"));
  for (const l of wf.lessons) {
    const p = CHARACTER_NAME[pickConversationPartner(l.lessonNo, l.conversation)];
    console.log(`L${l.lessonNo} [${p}] GOAL: ${l.conversation.aiTask.goalJa.slice(0, 70)}\n   ST: ${l.conversation.aiTask.starterEn}`);
  }
}
