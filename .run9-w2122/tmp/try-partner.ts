// Try starter variants: which partner does the app pick?
import fs from "node:fs";
import path from "node:path";
import { pickConversationPartner, CHARACTER_NAME } from "../../src/lib/conversation/engine";
const ROOT = path.resolve(__dirname, "../..");
const w21 = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-21.json"), "utf8"));
const tries: [number, string][] = [
  [605, "Hello? Oh, hi! What's up?"],
  [606, "Hi! I'm calling from the tower. Can you hear me?"],
  [611, "Hello! May I speak to Ms. Emma, please?"],
  [612, "Hello, this is the Message Center. Sorry, Kiko is out right now. Can I take a message?"],
];
for (const [n, s] of tries) {
  const l = w21.lessons.find((x: any) => x.lessonNo === n);
  const conv = { ...l.conversation, aiTask: { ...l.conversation.aiTask, starterEn: s } };
  const wrap = l.teacher.segments.map((x: any) => x.say).join(" ").match(/talk with (\w+)\b/)?.[1];
  console.log(n, CHARACTER_NAME[pickConversationPartner(n, conv)], "wrap", wrap, "|", s);
}
