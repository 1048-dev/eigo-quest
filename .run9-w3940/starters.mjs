// AI starters: the app shows the partner CHILD (Haru / Riko / Kiko / Birimo, with its own face and name) saying the
// starter, but every L1141-1200 starter speaks as Orbit, Sam, Amina, Priya, Mateo('s uncle), Sam's aunt, Liam, Nadia,
// Celeste, Ms. Emma (the examiner), a new learner, a fair visitor or a debate opponent. Keep the role the goal casts and
// make the pretend play explicit with "Let's pretend I'm X." (W25-38 rule; W27-28 already used "Let's pretend I'm Ms. Emma.")
// -> patches/02-starters.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const P = (who) => `Let's pretend I'm ${who}.`;
const cur = (n) => lessonOf(m, n).conversation.aiTask.starterEn;
const ROLE = {
  1142: "Sam", 1143: "Amina", 1144: "Priya", 1145: "Orbit", 1146: "Mateo's uncle, a farmer", 1147: "Sam's aunt", 1148: "Liam",
  1149: "Orbit", 1150: "Orbit", 1151: "Orbit", 1152: "Orbit", 1153: "on the other team", 1154: "Orbit, on the yes team", 1155: "Orbit",
  1156: "Sam", 1157: "Nadia", 1158: "Liam", 1159: "Sam", 1160: "Amina", 1161: "Orbit", 1162: "Orbit", 1164: "Amina", 1165: "Orbit",
  1166: "Nadia", 1167: "Liam", 1168: "Priya", 1169: "Mateo", 1170: "Orbit",
  1172: "Celeste", 1173: "Celeste", 1174: "Celeste", 1175: "Celeste", 1176: "Celeste", 1177: "Celeste", 1178: "Celeste",
  1179: "a new learner", 1180: "Celeste", 1181: "Ms. Emma, the examiner", 1182: "Ms. Emma, the examiner", 1183: "Ms. Emma, the examiner",
  1184: "Ms. Emma, the examiner", 1185: "Ms. Emma, the examiner", 1186: "Celeste", 1187: "Celeste", 1188: "Celeste", 1189: "Celeste",
  1190: "a visitor at the fair", 1191: "Celeste", 1192: "Ms. Emma", 1193: "Ms. Emma", 1194: "Ms. Emma", 1195: "Celeste",
  1196: "Ms. Emma", 1197: "Celeste", 1198: "Ms. Emma", 1199: "Ms. Emma", 1200: "Celeste",
};
// body edits inside the starter (fold "I'm X" into the frame, avoid a second Let's, split the 23-word sentence)
const BODY = {
  1141: [["Welcome to the Hall of the Round Table! I'm Orbit, the chair. Every voice counts!", "Welcome to the Hall of the Round Table! Every voice counts!"]],
  1163: [["Hi! I'm Sam from North America. Your team is next.", "Your team is next."]],
  1171: [["Welcome to the Star of Beginnings, my friend. I'm Celeste, the keeper of this star. Shine on!", "Welcome to the Star of Beginnings, my friend. Shine on!"]],
  1168: [["Let's write a message to the whole world together!", "We can write a message to the whole world together!"]],
  1175: [["Let's start at the very beginning.", "We can start at the very beginning."]],
  1181: [["Let's begin our practice interview.", "Now, our practice interview begins."]],
  1182: [["There's a boy with a dog, a girl under a tree, two children with a kite, and a man with a little cart.", "There's a boy with a dog, a girl under a tree and two children with a kite. There's also a man with a little cart."]],
  1184: [["Let's practice some tricky questions.", "Here are some tricky questions."], ["Here's the first one.", "First one."]],
  1193: [["Let's write a graduation speech together!", "We can write a graduation speech together!"]],
};
const FRAME = { 1141: "Orbit, the chair", 1163: "Sam from North America", 1171: "Celeste, the keeper of this star" };
const out = [];
for (let n = 1141; n <= 1200; n++) {
  const before = cur(n);
  let body = before;
  for (const [a, b] of BODY[n] ?? []) { if (!body.includes(a)) throw new Error(`miss L${n} ${a}`); body = body.split(a).join(b); }
  const who = FRAME[n] ?? ROLE[n];
  if (!who) throw new Error(`no role L${n}`);
  const after = `${P(who)} ${body}`;
  out.push({
    lesson: n, path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so a starter speaking as " + who.replace(/^on the other team$/, "a member of the other team") +
      " reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-38 rule)" +
      (BODY[n] ? (n === 1182 ? "; 23-word sentence split (lint)" : FRAME[n] ? "; I'm ~ folded into the frame" : "; a second Let's reworded") : ""),
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w3940/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
for (const x of out) console.log(`L${x.lesson}: ${x.after.slice(0, 130)}`);
