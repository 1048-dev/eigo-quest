// AI starters: the app shows the partner CHILD (Haru / Riko / Kiko / Birimo, with its own face and name) saying the
// starter, but the L1021-1080 starters speak as Olive, Priya, Amara, Leo, Ken, Mayor Hart, Lumi, Dr. Vale, Mr. Oswin...
// Keep the role the goal casts, and make the pretend play explicit with "Let's pretend I'm X." (W25-34 rule)
// -> patches/02-starters.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const P = (who) => `Let's pretend I'm ${who}.`;
const OLIVE = P("Olive"), PRIYA = P("Priya"), AMARA = P("Amara"), LEO = P("Leo"), HART = P("Mayor Hart");
const LUMI = P("Lumi"), VALE = P("Dr. Vale"), OSWIN = P("Mr. Oswin");
const S = {
  1021: "Let's pretend I'm Olive, the chairperson of the Children's Council. Ding! Welcome to the Hall of Wisdom! Children from many places meet here to talk. What do you think of our round meeting hall? Why?",
  1022: `${PRIYA} At my school, we choose our own clothes. Should students wear uniforms? What do you think? Why?`,
  1023: `${AMARA} At my school, break time is only ten minutes. Do you think we should have longer breaks? Why?`,
  1024: `${PRIYA} Here are my survey results. Fifteen out of twenty children want to choose their own seats. Do you think that's a good rule? Why?`,
  1025: `${OLIVE} Ding! Welcome to our school rules discussion! Pick one rule: uniforms, longer breaks, or choosing seats. Can you tell me both sides? Then tell me your own opinion and why.`,
  1026: `${AMARA} At my school, some older students take the only ball every day. Is that fair? Why or why not?`,
  1027: `${LEO} I love soccer, but some kids never get the ball. How can we make break time fair? Tell me your idea, and I'll ask you why!`,
  1028: `${OLIVE} Ding! We can think about this together. Imagine you see someone teasing your friend at break time. What can you say and do? Why?`,
  1029: "Let's pretend I'm Ken, the new boy. Oh, hi. I'm new here, so I don't know many people yet. What are you all doing?",
  1030: `${OLIVE} Ding! I'm so excited to hear about your Kindness Campaign. What are your ideas? Please tell me, and I'll ask you some questions afterward!`,
  1031: `${OLIVE} Ding! Welcome to the Children's Council. Which right do you think is the most important for children? Why?`,
  1032: `${AMARA} I have a dog named Biscuit and a cat named Pepper. What should pet owners do every day? Can you give me an example?`,
  1033: `${PRIYA} In my family, we have a chore chart. What chores do you do at home? Why are they important?`,
  1034: "Let's pretend I'm the librarian at Willowford Library. Hello, and welcome! What can children do to help our town? Can you give me an example?",
  1035: `${OLIVE} Ding! Welcome to the stage. You have the right to speak, and we are all listening. What would you like to tell us about rights and responsibilities?`,
  1036: `${HART} Hello! I'd love to hear your ideas. How can we make Willowford better? Why do you think so?`,
  1037: `${PRIYA} Time to brainstorm! What can we make for people who visit Willowford for the first time? Why is it a good idea?`,
  1038: `${LEO} I want a playground on the empty lot, but Amara wants a flower garden. We can't agree! What do you think we should do? Why?`,
  1039: `${LEO} I was outside, so I missed the vote. What were the results? Which idea did you vote for, and why?`,
  1040: `${HART} Hello again, Children's Council! I'm so excited to hear your proposal. What is your idea for Willowford, and why will it help?`,
  1041: `${AMARA} I love animals so much. Sometimes I dream about having a baby fox as a pet. Should people keep wild animals as pets? What do you think? Why?`,
  1042: `${PRIYA} I counted thirty-one plastic bottles in the recycling bin yesterday! What can the Children's Council do about it? Do you have a suggestion? Tell me why, too!`,
  1043: `${LEO} Time for Opinion Ping-Pong! Here's my opinion. I think a pet penguin would be fun, because it can swim in my bathtub! What do you think? Can you give me an example?`,
  1044: `${OLIVE} Hoo-hoo! What a great bar graph! Could you explain it to me? What does it show? Why do you think it changed?`,
  1045: `${OLIVE} Hoo-hoo! The big council meeting is coming soon, and there is so much to do! How can I help you get ready? Tell me why, too!`,
  1046: `${LEO} Did you read my opinion piece and Priya's? I think homework every day helps us remember. Which opinion do you agree with? Can you give me an example?`,
  1047: `${HART} Hello, Children's Council! I heard you wrote me a letter. I'd love to hear it! What do you suggest for Willowford, and why?`,
  1048: `${PRIYA} Time to practice our debate! The question is, Should every school have a school garden? You can choose your team. Please start with your first point, and I'll ask you why.`,
  1049: `${OLIVE} Hoo-hoo! Our time together is almost over. Which day at the Hall of Wisdom was your favorite? How do you feel now, and why?`,
  1050: `${HART} What a wonderful Children's Council! I'm so proud of you all. What is the most important thing you learned here? Can you give me an example?`,
  1051: `${LUMI} Welcome to Deep Sea City! What did you see through the porthole on your way down? Which place in our city do you want to visit first?`,
  1052: `${LUMI} Welcome to the aquarium hall! Look at all these tiny lights in the dark. Which glowing creature do you like best? Why do you think it glows?`,
  1053: `${VALE} Look at this tall depth chart. Near the surface, the water is bright blue, but outside our window it's black. Why do you think it's so dark down here?`,
  1054: `${VALE} Down here, the water pushes very hard on everything. But look, that little fish is swimming happily! How do you think deep-sea animals live under so much pressure?`,
  1055: `${LUMI} Welcome to the Wonder Talk! I love amazing facts about the deep sea. Can you tell me one? And where did you find it?`,
  1056: `${VALE} Welcome to the Research Center! Every good research project starts with a question. What do you want to find out about the deep sea? Why are you curious about it?`,
  1057: "Let's pretend I'm Mr. Oswin, the old sea turtle. Wel... come... to the Coral Library, young researcher. What would you like to find out? And where will you look for information?",
  1058: `${OSWIN} Ah... you found a book about the deep sea. Wonderful. Tell me one thing you learned from it. Where exactly did you find it?`,
  1059: `${LUMI} Look, look! I found a web page that says giant squid can fly over the waves like birds! That's amazing, right? Should we put it in our research?`,
  1060: `${VALE} Great work so far, researchers! Before we start, we need a plan. What will you do first, and what will you do next? Why?`,
  1061: `${LUMI} Here's a long fact. Anglerfish live in the dark, and they wait very still. Some have a glowing lure on their head, and small fish swim toward it. Phew! Can you say it in one sentence?`,
  1062: `${VALE} Thank you for reading my article! There are a lot of facts in it. What do you think the main point is? And which parts are just details?`,
  1063: `${OSWIN} Hello, young researcher. Did you finish the article about marine snow? Please tell me about it in three sentences. Not more, not less!`,
  1064: `${VALE} Ready? Get your notes! Many deep-sea animals make their own light. Some glow to find food, some glow to hide, and some flash to scare enemies away. What keywords did you write?`,
  1065: `${LUMI} It's the Summary Challenge! Pick a deep-sea animal you learned about. Can you summarize it in 30 seconds? Ready? Go!`,
  1066: `${VALE} Welcome to the Great Dome! Imagine all these seats are full. Time to practice the start of your talk. How will you say hello, and what's your topic?`,
  1067: `${VALE} Can I see your note cards? How many points do you have? Please tell me your points in order.`,
  1068: `${VALE} Imagine I'm sitting in the back row. Show me your picture or your graph. What can we see in it, and why is it important?`,
  1069: `${LUMI} How will your talk end? What's the most important thing you want your listeners to remember? Try your ending with In conclusion.`,
  1070: `${OSWIN} Hello, young researcher. I'm in no hurry, so take your time. Please give me the first part of your talk. Then tell me, what will you do to make it even better?`,
  1071: `${LUMI} I loved your talk about the deep sea. I have a question. Why is it so dark down here? And where did you find that?`,
  1072: `${VALE} Hello, young researcher! Here's a tricky one. How cold do you think the water is outside our dome? It's OK if you're not sure. Why do you think so?`,
  1073: `${LUMI} That's the end of my talk about giant squid. Do you have a question for me? What else do you want to know?`,
  1074: `${OSWIN} Hello there, young one. Here is a hard question for you. Do lanternfish ever sleep? If you don't know, that's fine. Where will you look?`,
  1075: `${LUMI} That's the end of my talk about glowing fish. You're the host today! What should we do now? And what did you think of my talk?`,
  1076: `${OSWIN} Hello, young researcher. One book says a giant squid was 12 meters long. Another says 13 meters. Can you compare them for me? Which one should we believe, and why?`,
  1077: `${VALE} Scientists have found plastic even in the deepest trench. That makes me sad. What do you think kids can do to help? Why is that important?`,
  1078: `${LUMI} Time to write a great script! Which deep-sea animal do you want to talk about? How will you start your talk, and where did you find your facts?`,
  1079: `${LUMI} I can't believe your time here is almost over! What did you learn in Deep Sea City? In short, please! And what was your favorite part, and why?`,
  1080: `${LUMI} Welcome to the Research Festival! It's your turn. Please tell us what you found out about the deep sea. When you finish, I'll ask a question. Where did you find your facts?`,
};
const out = [];
for (const [n, after] of Object.entries(S)) {
  const l = lessonOf(m, Number(n));
  const before = l.conversation.aiTask.starterEn;
  if (before === after) continue;
  out.push({
    lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so \"I'm Olive / I'm Priya / I'm Mayor Hart / I'm Lumi\" or a role speaking as Dr. Vale / Mr. Oswin / Lumi reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-34 rule). A second Let's -> We can / Time to (Lumi's Let's find out! dropped in the starter); lovely -> great (US); hear your campaign -> hear about; L1061 27-word fact split into short sentences",
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w3536/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
