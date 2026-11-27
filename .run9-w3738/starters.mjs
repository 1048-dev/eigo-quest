// AI starters: the app shows the partner CHILD (Haru / Riko / Kiko / Birimo, with its own face and name) saying the
// starter, but many L1081-1140 starters speak as Nib, Saffron, the Well of Wishes, Pell, Granny Willa, the wolf, Puff,
// Grandma Rowan, Mr. Bram... Keep the role the goal casts, and make the pretend play explicit with "Let's pretend I'm X."
// (W25-36 rule). Five lessons cast a CHILD of the cast (Kiko / Birimo) but the app picked another child: mention the
// other children in the starter (the app then skips them) so the goal's child is the partner, and fix the wrap-up name.
// -> patches/02-starters.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, getAt } from "./lib.mjs";
const m = loadWorlds();
const P = (who) => `Let's pretend I'm ${who}.`;
const NIB = P("Nib"), SAFF = P("Saffron, the old golden dragon"), WILLA = P("Granny Willa"), PUFF = P("Puff"), ROWAN = P("Grandma Rowan"), BRAM = P("Mr. Bram");
const cur = (n) => lessonOf(m, n).conversation.aiTask.starterEn;
const S = {
  1081: `${NIB} Welcome to the Labyrinth of Tales! I'm your guide. Every path here leads to a room with a story. Look at the signposts: The Clever Rabbit, The Moon Room, The Hall of Many Lands. Which path would you like to try first, and why?`,
  1082: `${NIB} ${cur(1082)}`,
  1083: `${NIB} ${cur(1083)}`,
  1084: `${NIB} ${cur(1084)}`,
  1085: `${NIB} ${cur(1085)}`,
  1086: `${NIB} ${cur(1086)}`,
  1087: `${NIB} ${cur(1087)}`,
  1088: `${NIB} ${cur(1088)}`,
  1089: `${NIB} ${cur(1089)}`,
  1090: `${NIB} ${cur(1090)}`,
  1091: `${SAFF} ${cur(1091)}`,
  1092: `${P("the Well of Wishes")} ${cur(1092)}`,
  1093: `${NIB} ${cur(1093)}`,
  1094: `${P("Pell")} I live in a village high in the mountains. Before my trip, I had never seen the sea. How do you think I felt on top of that sandy hill? Why?`,
  1095: `${SAFF} ${cur(1095)}`,
  1096: `${NIB} Welcome back to my Story Workshop! Here's a blank story map with three boxes: hero, place and problem. First, the hero. Who is your hero, and what can they do?`,
  1097: `${NIB} ${cur(1097)}`,
  1098: `${NIB} ${cur(1098)}`,
  1099: `${NIB} ${cur(1099)}`,
  1100: `${NIB} Happy 1,100th lesson! Have some cake and lemonade. Now, it's time to share our story ideas! What's your story called, and who is the hero?`,
  1101: `${WILLA} ${cur(1101)}`,
  1102: `${WILLA} ${cur(1102)}`,
  1103: `${NIB} Here's my story! A tiny mouse found a giant cheese in the moonlight. It was too heavy to carry, so he asked a friendly owl for help. The end! What did you like? And do you have one idea for me?`,
  1104: `${WILLA} ${cur(1104)}`,
  1105: `${NIB} ${cur(1105)}`,
  1106: `${NIB} ${cur(1106)}`,
  1107: `${P("the wolf from The Lost Lamb")} Hello there. Everyone thinks I'm the bad guy, but I was only trying to help that little lamb. Do you believe me? Why or why not?`,
  1108: `${NIB} ${cur(1108)}`,
  1109: `${NIB} ${cur(1109)}`,
  1110: `${NIB} ${cur(1110)}`,
  1111: `${P("Puff, a little cloud")} Welcome to the Highlands of the Heart! Look, the hills are green and the sheep are saying hello. How are you really feeling right now?`,
  1112: `${ROWAN} ${cur(1112)}`,
  1113: `${PUFF} ${cur(1113)}`,
  1114: `${PUFF} Now imagine you slipped into that muddy puddle on the village green, just like Riko. Splat! How did you feel at first, and how did you feel later?`,
  1115: `${PUFF} Good evening, and welcome to the Feelings Weather Report! I'm your host. Our next reporter is you! What's the weather like in your heart today?`,
  1116: "Squee! Oh no, there it goes again. Even Birimo covered his ears! Sorry, I just need to sit down for a minute. My flute keeps making squeaky sounds today.",
  1117: "The welcome party is on Saturday, and I'm so nervous. Haru and Riko say I'll be fine, but what if I play the wrong notes in front of everyone? Have you ever felt like this?",
  1118: "Oh, this yarn! My scarf for Puff fell apart again. Riko and Kiko make it look so easy! I've been knitting all morning, and look, it's just one big tangle. I'm so frustrated!",
  1121: `${PUFF} ${cur(1121)}`,
  1123: `${PUFF} Here's a Think-Back Card. Imagine you had a small argument with a friend about a game. First question: what happened? Then tell me what you should have done.`,
  1125: `${P("a child at the village school")} ${cur(1125)}`,
  1128: `${BRAM} ${cur(1128)}`,
  1130: `${BRAM} ${cur(1130)}`,
  1131: `${ROWAN} ${cur(1131)}`,
  1132: "Hi! I'm ready to be your interview guest. You can ask me about the welcome party, when I played my flute again. Haru and Birimo were in the front row! What's your first question?",
  1133: `${ROWAN} ${cur(1133)}`,
  1134: `${P("Mr. Bram, the editor of the village newspaper")} ${cur(1134)}`,
  1135: `${ROWAN} ${cur(1135)}`,
  1136: `${ROWAN} ${cur(1136)}`,
  1137: `${PUFF} How are you really feeling? We can write a letter together! Think of someone special, like a friend or someone in your family. What would you like to tell them?`,
  1138: `${P("a farmer from the village")} ${cur(1138)}`,
  1139: "Look, there's the village hall and the buddy bench. Haru, Riko and Kiko are walking way ahead of us! I can't believe this is our last walk! What was your favorite moment in the highlands, and why?",
  1140: `${PUFF} ${cur(1140)}`,
};
const ROLE = "the app shows the partner child (its own face and name) saying the starter, so a starter speaking as Nib / Saffron / the Well / Pell / Granny Willa / the wolf / Puff / Grandma Rowan / Mr. Bram reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-36 rule). I'm Nib / I'm Pell / I'm Puff / your host, Puff folded into the frame; a second Let's -> it's time to / We can / Imagine; L1103 25-word sentence split";
const KID = "the goal casts the AI as this child (AI の キコ / ビリモ), but the app picked another child as the partner, so a different face would talk about Kiko's flute / Birimo's knitting. Naming the other children in the starter makes the app skip them and pick the goal's child (checked with pickConversationPartner)";
const out = [];
for (const [n, after] of Object.entries(S)) {
  const before = cur(Number(n));
  if (before === after) continue;
  out.push({ lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)", reason: [1116, 1117, 1118, 1132, 1139].includes(Number(n)) ? KID : ROLE });
}
// wrap-up names follow the new partner
const WRAP = { 1116: [21, "Birimo", "Kiko", "ビリモと", "キコちゃんと"], 1117: [21, "Haru", "Kiko", "ハルくんと", "キコちゃんと"], 1118: [21, "Riko", "Birimo", "リコちゃんと", "ビリモと"], 1132: [20, "Birimo", "Kiko", "ビリモと", "キコちゃんと"], 1139: [19, "Kiko", "Birimo", "キコちゃんと", "ビリモと"] };
for (const [n, [seg, a, b, ja, jb]] of Object.entries(WRAP)) {
  const l = lessonOf(m, Number(n));
  for (const [k, from, to] of [["say", `talk with ${a}!`, `talk with ${b}!`], ["subtitleEn", `talk with ${a}!`, `talk with ${b}!`], ["subtitleJa", `このあと ${ja} おはなし`, `このあと ${jb} おはなし`]]) {
    const p = `teacher.segments[${seg}].${k}`;
    const before = getAt(l, p);
    if (!before.includes(from)) throw new Error(`wrap miss L${n} ${p}`);
    out.push({ lesson: Number(n), path: p, before, after: before.split(from).join(to), reviewers: "objective (block rule)", reason: "the wrap-up must name the AI partner the app shows (the partner changed with the starter, see starterEn)" });
  }
}
fs.writeFileSync(path.join(REPO, ".run9-w3738/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
