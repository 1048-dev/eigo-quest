// AI starters where the app's partner (Haru / Riko / Kiko / Birimo, shown with its own face and name) speaks as a
// different character that the goal casts (Granny Capy, Dr. Fern, Toto, Sleepy Squirrel, Iris, Aino, Amara, Mateo, Leo,
// Ms. Emma, a pen pal). Keep the role, but make the role-play explicit with "Let's pretend I'm X." (W25-26 rule)
// -> patches/02-starters.json (run after 00-01).
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const S = {
  781: "Welcome to the Village of Springs! Let's pretend I'm Granny Capy. Would you like to touch the warm water?",
  782: "Hello, dear. Let's pretend I'm Granny Capy. You look a little tired. What's wrong?",
  784: "Hello. Let's pretend I'm Dr. Fern. Come in and sit down. How long have you had a fever?",
  786: "Hi! Let's pretend I'm Toto. I exercise every morning. How often do you exercise?",
  787: "Let's pretend I'm Granny Capy. It's getting late, dear. Here's some warm milk. What time do you usually go to bed?",
  788: "Hello! Let's pretend I'm Dr. Fern. Let's talk about healthy habits. Why is eating breakfast important?",
  789: "Hi! Let's pretend I'm Toto. I like games, but I take breaks, too. How much screen time do you have?",
  791: "Let's pretend I'm Granny Capy. Welcome to the Spring Inn, dear. Have some herbal tea. I've lived here for ten years. Before that, I lived by the sea. Do you like the sea?",
  792: "Let's pretend I'm Granny Capy. Oh, what a lovely song! I've grown herbs since I came to this village. What have you done for a long time?",
  793: "Hi! Let's pretend I'm Toto. You two look like good friends. How long have you known your best friend?",
  794: "Let's pretend I'm Granny Capy. Hello, dear! You've been very busy this week. How long have you stayed at the Spring Inn?",
  795: "Hi! Let's pretend I'm Toto. I've practiced morning exercises for two years. What's your hobby? How long have you practiced?",
  796: "Let's pretend I'm Ms. Emma. Phew! This mountain path is long, and the sun is very hot. I feel tired and thirsty. What should I do?",
  797: "Hi! Let's pretend I'm Toto. I'm hungry and sleepy today. I didn't eat breakfast, and I went to bed very late. What should I do?",
  798: "Let's pretend I'm Granny Capy. Oh dear, I've cleaned rooms all morning. My back is a little tired, but there's so much work.",
  799: "Hello, Ask Birimo team! Let's pretend I'm Sleepy Squirrel. Dear Birimo, I can't sleep well. What should I do?",
  800: "Happy 800 lessons! Let's pretend I'm Toto. I always feel sleepy in class. What should I do?",
  801: "Hello, dear. Let's pretend I'm Granny Capy. You look a little worried. What do you do when you're worried?",
  802: "Hi! Let's pretend I'm Ms. Emma. We can relax by the spring. Can you tell me how to take a deep breath?",
  803: "Let's pretend I'm Toto. My best friend Mimi moved away. I feel so sad today.",
  804: "Let's pretend I'm Toto. I fell down in the race today. I came last. I feel bad.",
  805: "Hi! Let's pretend I'm Toto. I'm making a calm-down plan, too. What do you do when you're angry?",
  806: "Hello, dear. Let's pretend I'm Granny Capy. You're going home soon. What are you going to do on Monday?",
  807: "Hello! Let's pretend I'm Dr. Fern. Let's play a health quiz. How many hours should children sleep?",
  808: "Hi! Let's pretend I'm your pen pal. I feel tired and sleepy in the morning. What should I do?",
  809: "Hello, dear. Let's pretend I'm Granny Capy. You're leaving soon. How do you feel after your stay?",
  810: "Hello, dear. Let's pretend I'm Granny Capy. What a wonderful festival! Did you have fun today?",
  811: "Welcome to the Rainbow Bridge! Let's pretend I'm Iris, the keeper. What can you see from up here?",
  812: "Moi! Let's pretend I'm Aino from Finland. In my family, we take off our shoes at home. How about in Japan?",
  813: "Jambo! Let's pretend I'm Amara from Kenya. At my school, we wear green uniforms. How about in Japan?",
  814: "Hola! Let's pretend I'm Mateo. In Mexico, I eat tortillas with my hands. How do you eat rice in Japan?",
  815: "Moi! Let's pretend I'm Aino. We can make a chart together. In Finland, people watch fireworks on New Year's Eve. What do people do in Japan?",
  816: "Hola! Let's pretend I'm Mateo. I see a white triangle in your lunch box. What is it?",
  817: "Jambo! Let's pretend I'm Amara. What is this pretty square cloth? What is it used for?",
  818: "Hola! Let's pretend I'm Mateo. I want to visit Japan someday. When is the best time to visit?",
  819: "Jambo! Let's pretend I'm Amara. I'd love to hear about towns in Japan. What's special about a town you like?",
  821: "Moi! Let's pretend I'm Aino. I think winter is the best season because I love snow. Which season do you like?",
  822: "Hola! Let's pretend I'm Mateo. I heard you have school lunch in your classroom in Japan. What's your opinion about it?",
  823: "Moi! Let's pretend I'm Aino. I think winter vacation is better than summer vacation. Do you agree?",
  824: "Jambo! Let's pretend I'm Amara. I walk to school every day. What do you think about walking to school? Can you give two reasons?",
  825: "Welcome to Opinion Corner! Let's pretend I'm Iris. What do you think is the best? Please give two reasons.",
  826: "Hi! Let's pretend I'm Leo. Can you hear me? It's nice to finally see you on video!",
  827: "Jambo! Let's pretend I'm Amara. Oh, what's that in your hand? Is it for me?",
  828: "Moi! Let's pretend I'm Aino. Oh no, my scarf is gone! Can you help me find it? What did you find first?",
  829: "Hola! Let's pretend I'm Mateo. I've played soccer since I was six. Have you ever made sushi?",
  830: "Moi! Let's pretend I'm Aino. What's that? Is it a toy? What is it made of?",
  831: "Hello, traveler! Let's pretend I'm Iris. Look at this map of your journey. Which place was your favorite?",
  832: "Hi! Let's pretend I'm Ms. Emma. You've learned so much on this journey. What can you do in English now?",
  833: "Jambo! Let's pretend I'm Amara. I hear you're writing a speech about friendship. What will you say?",
  834: "Hi! Let's pretend I'm Ms. Emma. Let's practice your speech. Can you say your first line for me?",
  835: "Hola! Let's pretend I'm Mateo. Welcome to the friendship festival! What would you like to share with everyone?",
  836: "Hi! Let's pretend I'm Leo. I just got your letter. Thank you! What did you enjoy learning about on the bridge?",
  837: "Jambo! Let's pretend I'm Amara from Kenya. Do you have any questions about my country? Ask me anything!",
  838: "Moi! Let's pretend I'm Aino from Finland. I want to learn about Japan. Can you tell me about the seasons there?",
  839: "Let's pretend I'm Iris. Hello, my friend. This is our last walk on the bridge. Can you tell me about a Japanese food you love?",
  840: "Let's pretend I'm Iris. My friends, the bridge is shining again! Before you go, what did you learn on the Rainbow Bridge?",
};
const out = [];
for (const [n, after] of Object.entries(S)) {
  const l = lessonOf(m, Number(n));
  const before = l.conversation.aiTask.starterEn;
  if (before === after) continue;
  out.push({
    lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so \"I'm Granny Capy / It's Toto / Moi! (as Aino)\" reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-26 rule). Morning greetings -> Hi / Hello (the child can talk at any time); a second Let's -> We can",
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w2728/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
