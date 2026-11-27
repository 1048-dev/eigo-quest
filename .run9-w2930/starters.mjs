// AI starters where the app's partner (Haru / Riko / Kiko / Birimo, shown with its own face and name) speaks as a
// different character that the goal casts (Captain Pell, Gus, Gale, Pip, Nova, Ms. Lin, Tess, a robot teacher).
// Keep the role, but make the role-play explicit with "Let's pretend I'm X." (W25-28 rule) -> patches/02-starters.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const S = {
  841: "Welcome, young friends! Let's pretend I'm Captain Pell. My light is very weak today. How do you think we can make it brighter?",
  842: "Let's pretend I'm Captain Pell. Anchor is my best friend. Which animal do you think makes a good pet?",
  843: "Let's pretend I'm Captain Pell. An example makes an opinion strong! Which animal do you like, and can you tell me why?",
  844: "Hello again! Let's pretend I'm Captain Pell. Cats or dogs? Which do you think are better pets? Please give me two reasons.",
  845: "Let's pretend I'm Captain Pell. Each idea makes my lamp brighter! What do you think is fun? Tell me your reason, too.",
  846: "Let's pretend I'm Captain Pell. Welcome to my library! I think books about the sea are the best. What kind of books do you like?",
  847: "Hey! Let's pretend I'm Gus. I think the mountains are more fun than the beach. What do you think?",
  848: "Hi! Let's pretend I'm Gale. Which is better, a rainy day or a sunny day? What do you think?",
  849: "Hi! Let's pretend I'm Gus again. I think summer is the best season. Do you agree?",
  850: "Let's pretend I'm Captain Pell. Time for the Agree or Disagree Game! Here's my sentence: Winter is the best season. Do you agree?",
  851: "Ahoy! Let's pretend I'm Captain Pell. The island festival is coming soon. What do you think we should make for it?",
  852: "Ahoy! Let's pretend I'm Captain Pell. You are the chair today. What food do you think we should have at the festival?",
  853: "Ahoy! Let's pretend I'm Captain Pell. We are talking about festival decorations. I think flags are nice. What do you think?",
  854: "Ahoy! Let's pretend I'm Captain Pell. Where should we have the picnic: the park, the beach, or the garden? Which do you like?",
  855: "Ahoy! Let's pretend I'm Captain Pell. It's time for a class meeting. Today's topic is our school trip. Where would you like to go?",
  856: "Ahoy! Let's pretend I'm Captain Pell. My lighthouse is shipshape today! What do you think of my lighthouse?",
  857: "Ahoy! Let's pretend I'm Captain Pell. Thick fog comes after lunch tomorrow. What time do you think we should start?",
  858: "Ahoy! Let's pretend I'm Captain Pell. Today is festival day! I think everyone can be a good helper. How can you help?",
  859: "Ahoy! Let's pretend I'm Captain Pell. Here's a card from my Question Box. Which is more fun, a festival or a picnic?",
  860: "Ahoy! Let's pretend I'm Captain Pell. You can interview me about lighthouse life. But first, what job do you think is the most interesting?",
  861: "Hi! Let's pretend I'm Pip from The Lighthouse News. What's your favorite animal? Can you tell me one fact and one opinion about it?",
  862: "Hello again! Let's pretend I'm Pip. The Lighthouse News is asking readers about colors. In your opinion, what's the best color?",
  863: "Psst! Let's pretend I'm Pip. I heard a funny rumor. Anchor can fly at night! What do you think about this news?",
  864: "Let's pretend I'm Pip. Look at this ad in our newspaper! It says this toy is the best toy ever. Do you believe it? Why or why not?",
  865: "Let's pretend I'm Pip. Welcome, Fact Check Team! What did you check today? Is it a fact or an opinion, and how do you know?",
  866: "Ahoy, my friend! Let's pretend I'm Captain Pell. Here is today's topic. Should we have homework on weekends? What do you think?",
  867: "Let's pretend I'm Captain Pell. Anchor is my best buddy, but caring for him is a big job. Should a school have a class pet? What do you think?",
  868: "Hi, writer! Let's pretend I'm Pip. I need one more opinion paragraph for the last page. What do you think we should do every day?",
  869: "Let's pretend I'm Captain Pell. Welcome to your goodbye tour, my friends! Which room do you want to see first, and why?",
  870: "Let's pretend I'm Captain Pell. My friends, the light is shining brightly again! Before you go, what was your favorite part of the lighthouse, and why?",
  871: "Beep! Let's pretend I'm Nova, your guide. Welcome to the City of Tomorrow! Cars fly and robots work here. What do you want to see first?",
  872: "Beep! Let's pretend I'm Nova again. Look at this little green robot. What do you think it does?",
  873: "Beep! Let's pretend I'm Nova. Welcome aboard! This bus drives itself. Do you think a bus with no driver is a good idea?",
  874: "Beep! Let's pretend I'm Nova. Welcome to the Sun Tower! This building makes its own energy. Why do you think that's a good idea?",
  875: "Beep! Let's pretend I'm Nova. Today you're the tour guide, and I'm a visitor. Can you show me Solar Tree Park? What can I see here?",
  876: "Hello! Let's pretend I'm Ms. Lin. I design games. I want to make a new game for kids. What kind of game do you think is fun?",
  877: "Beep! Let's pretend I'm Nova. Welcome to the City Helper Center! There are many jobs here. Which job do you think is very important, and why?",
  878: "Hi! Let's pretend I'm Tess, and this is my robot dog, Sprocket. I made a lot of mistakes when I built him. What do you do when something is difficult?",
  879: "Beep! Let's pretend I'm Nova. Time for Who Am I? Here's my riddle: I'm a person who grows vegetables. Can you guess my job? Then you make a quiz for me!",
  880: "Beep! Let's pretend I'm Nova. Welcome to the Future Job Fair! In the future, there will be many new jobs. What job do you want, and why?",
  881: "Hi! Let's pretend I'm Tess. Inventors always start with a problem. Can you think of a problem in a town? What's the problem, and why is it hard?",
  882: "Hi! Let's pretend I'm Tess. Mr. Shell can't carry heavy bags up the hill. Do you have any ideas? Tell me your idea and why it's good.",
  883: "Beep! Let's pretend I'm Nova. I use sensors to see the street. Can you think of a machine at home? How does it work?",
  884: "Hi! Let's pretend I'm Tess. My first robot didn't work at all. Have you ever tried something again after a mistake? What went wrong, and what did you change?",
  885: "Hello! Let's pretend I'm Nova, a judge at the Invention Pitch. Please tell me about your invention. What does it do, and who does it help?",
  886: "Beep! Let's pretend I'm Nova, a guide robot. Robots can do many jobs. What do you think about robots? Tell me one good point and one problem.",
  887: "Hi! Let's pretend I'm Nova. In this city, there are screens everywhere. Screens are useful, but what's one problem? And how can we take good breaks?",
  888: "Hi! Let's pretend I'm Nova. Today, our topic is being safe online. What's one good rule for posting? Why is it important?",
  889: "Hello! Let's pretend I'm Nova. Some people ask AI helpers for answers. How can AI help you? And why should we check the answers?",
  890: "Hi! Let's pretend I'm Nova. It's time for a Technology Talk. Do you think technology is helpful? Tell me why. Then tell me one worry.",
  891: "Beep! Let's pretend I'm Nova. Welcome to Tomorrow Hall! What do you think life will be like in 2050? Please tell me your reason, too.",
  892: "Hello! Let's pretend I'm a robot teacher from the future. What do you think schools will be like in the future? Why?",
  893: "Beep! Let's pretend I'm Nova. We can design a home for the future together. What will your future home have? Why do you want it?",
  894: "Beep! Let's pretend I'm Nova. I run on sunlight. What kind of clean energy do you like best? Why?",
  895: "Beep! Let's pretend I'm Nova. I love city plans. What will there be in your future city? Please give me one reason.",
  896: "Hey! Let's pretend I'm Tess. I'm gonna build a new robot today. Do you wanna help me? What should it do?",
  897: "Beep! Let's pretend I'm Nova. Here's today's Tomorrow Times. What's this article about? What do you think the main idea is?",
  898: "Hi! Let's pretend I'm Tess. The Expo is coming soon. What's your invention? How does it work, and who will it help?",
  899: "Beep! Let's pretend I'm Nova. This is our goodbye tour. What was your favorite thing in the City of Tomorrow? What's one good point about it?",
  900: "Beep! Let's pretend I'm Nova. Welcome to the Invention Expo! Which invention do you like best? Why do you like it?",
};
const out = [];
for (const [n, after] of Object.entries(S)) {
  const l = lessonOf(m, Number(n));
  const before = l.conversation.aiTask.starterEn;
  if (before === after) continue;
  out.push({
    lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so \"I'm Captain Pell / I'm Nova / Ahoy! (as Captain Pell)\" reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-28 rule). A second Let's -> Time for / It's time for / We can; small contractions (what's, that's, I'm) and Can you ~? for the lint infos",
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w2930/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
