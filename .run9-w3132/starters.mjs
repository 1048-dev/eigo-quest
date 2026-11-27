// AI starters: the app shows the partner CHILD (Haru / Riko / Kiko / Birimo, with its own face and name) saying the
// starter, but the L901-960 starters speak as Old Tock, Professor Nib, Stella Moss, Fen, Humphrey, Dr. Mira, guides...
// Keep the role the goal casts, and make the pretend play explicit with "Let's pretend I'm X." (W25-30 rule)
// -> patches/02-starters.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const TOCK = "Tick, tock! Let's pretend I'm Old Tock.";
const NIB = "Squeak! Let's pretend I'm Professor Nib.";
const S = {
  901: "Tick, tock! Let's pretend I'm the keeper of this corridor. Welcome to the Corridor of Time! Each door here opens to a different time. Which time would you like to visit?",
  902: "Hello there, young travelers! Let's pretend I'm a traveler from long ago. I'm walking to the next town. It's two days away. Did you know that people used to walk everywhere? What do you think about that?",
  903: "Hello! Let's pretend I'm Hana, a girl from long ago. I'm writing a letter to my grandma. In your time, how do people talk to faraway friends?",
  904: `${TOCK} Welcome to the toy room! Children used to play with toys like these. Which do you like better, old toys or new toys? Why?`,
  905: `${TOCK} I'm ready for your presentation. How was life different in the past? Tell me about then and now.`,
  906: "Let's pretend I'm the castle guide. Welcome to the Castle on the Hill! This castle has a long history. What would you like to know about it?",
  907: "Let's pretend I'm a guide in the Invention Room. Welcome! Here you can see light bulbs, telephones, and airplanes. Which invention would you like to learn about first?",
  908: "Hi! Let's pretend I'm one of the divers who found the Silver Wave. It was a long and exciting search. What would you like to ask me about the ship?",
  909: "Let's pretend I'm a museum guide. Welcome to the clay pot room! These pots are really old. Which pot would you like to know about? Go ahead and ask me a question.",
  910: "Hello! Let's pretend I'm a visitor at the History Museum, and you're the guide. Can you tell me about this old clay pot? What was it used for?",
  911: `${TOCK} Welcome to the Biography Door. This is the story of Stella Moss. Look at the first page. Where was she born?`,
  912: `${TOCK} Look at Stella on the roof. What did she love when she was ten? And what did you love when you were little?`,
  913: `${TOCK} Stella grew up fast, didn't she? How did she become a scientist? Tell me about her books and her hard work.`,
  914: "Hello! Let's pretend I'm Stella Moss. My first telescope broke into pieces one windy night. I was so sad. Can you guess what I did next?",
  915: `${TOCK} You read the whole picture book. Now, tell me Stella's life in five sentences. Where do you want to start?`,
  916: `${NIB} Here is the timeline of Willow Hill. Can you explain it to me in order? Start with the word First.`,
  917: "Shh! Let's pretend I work at the Time Theater. Oh, you're late! What happened? Was the show still at the beginning when you arrived?",
  918: `${NIB} Welcome to the railway room. Long ago, there were no trains between these towns. How was the trip before and after the railway?`,
  919: `${NIB} I just lit a candle. Imagine a world with no electricity. What would be hard? What would be fun?`,
  920: `${NIB} I love timelines. Can you tell me about the history of our town? What happened first? You can say our town.`,
  921: `${TOCK} Welcome to the Hall of Great People. Which painting do you want to know about? What do you think this person did?`,
  922: `${TOCK} There are many great people in this hall. Who do you respect? Please tell me why.`,
  923: `${TOCK} Look at this empty frame. Think of an everyday hero, like a grandpa, a grandma, or a neighbor. Who is your hero? What does that person do?`,
  924: "Hello! Let's pretend I'm Stella Moss. I study the stars. You can ask me anything about my life. What's your first question?",
  925: `${NIB} I love hero presentations. Who would you like to talk about? Please start your presentation now.`,
  926: `${NIB} You read Stella Moss's biography. Great job! What was her biggest challenge? And what do you think the main idea is?`,
  927: `${TOCK} Welcome to the History Quiz Show! Here's your first question. When was the first airplane flight? After that, you can ask me a quiz question, too.`,
  928: `${NIB} We can write a hero report together. Who is your hero? You can say my grandma, my grandpa, or a famous person.`,
  929: `${TOCK} This is our goodbye walk. Which door do you remember best? What did people use to do there?`,
  930: `${TOCK} Welcome to the History Festival! What was your favorite door in the Corridor of Time? What did you learn there?`,
  931: "Hi there! Let's pretend I'm Fen, a fennec fox. Welcome to the Desert of the Sun! Look around. What do you see? What do you think the weather is like here?",
  932: "Brr! Let's pretend I'm Fen. The sun is gone, and the desert is getting cold. This afternoon was so hot! What was the day like for you? What's the night like?",
  933: "Let's pretend I'm the guide at the oasis. Welcome, tired travelers! Sit under the palm trees and rest. Do you know what an oasis is? Can you explain it to me?",
  934: "Let's pretend I'm Fen. Welcome to my tent! Look at my climate map. It has many colors. Which color do you want to know about? I can tell you what the weather is like there.",
  935: "Let's pretend I'm Fen. My ears are ready! Can you give me your climate report? Which desert do you want to talk about? Where is it, and what's the weather like?",
  936: "Hello, little travelers! Let's pretend I'm Humphrey, the leader of this caravan. Hop on my back! Do you have any questions about camels?",
  937: "Shh! Let's pretend I'm Fen. Look at that little lizard. Every desert animal has a secret for staying alive here. Do you want to know my secrets? Ask me about my ears or my feet!",
  938: "Let's pretend I'm a guide in the cactus garden. Welcome! Please don't touch the spines. Look at this giant saguaro. It's very old! What would you like to know about cactus plants?",
  939: "Let's pretend I'm Fen. Wow, look at the picture from the Sun Compass! It's so cold there. I live in the hot desert, so I want to learn. How do animals stay warm in icy places?",
  941: "Hi, explorer! Let's pretend I'm Fen. Here's my camp map. The needle on the Sun Compass points north. Can you tell me where the oasis is? And what's to the south of the camp?",
  942: "Hi, geographer! Let's pretend I'm Fen. This is a map of my desert country. I can see mountains, a river, and lots of sand. Can you tell me where these places are located?",
  943: "Let's pretend I'm Fen. Time to spin my giant globe! Whoosh! Can you name some continents? How many continents are there?",
  944: "Ding, ding! Let's pretend I'm Fen. Welcome to Where in the World? Here's your first hint: It's a country in South America, and it has the Amazon rainforest. Can you guess the country?",
  945: "Let's pretend I'm Fen. I have the treasure map, but I'm a little lost! I'm standing at the three palm trees. How do I get to the old well? Please guide me!",
  946: "Let's pretend I'm Dr. Mira. Welcome to my weather station! I love graphs. Here's my red line graph. What does the graph show? Can you find the hottest day?",
  947: "Let's pretend I'm Dr. Mira. Here's my bar graph of visitors to Sunrise Desert Park. Ten years ago, two hundred fifty thousand people came. Last year, one million came! What happened to the number of visitors?",
  948: "Hi! Let's pretend I'm Dr. Mira. I counted the animals at the oasis today: sixty goats, forty camels, and twenty horses. Can you compare the numbers for me?",
  949: "Let's pretend I'm Dr. Mira. Look at my pie chart! The whole circle is all the land on Earth. The big yellow slice shows the deserts. How much of the land is desert?",
  950: "Let's pretend I'm Dr. Mira. It's Graph Presentation Day! I'm so excited. Can you show me your graph? What does it show, and what can we see?",
  951: "Hi, friend! Let's pretend I'm Fen. This is the well in Palm Village. Look how carefully everyone carries the water. Why do you think they never waste a drop?",
  952: "Hello again, scientist! Let's pretend I'm Dr. Mira. Look at Mirror Lake. Ten years ago, the water came up to that big rock. Why do you think the lake became smaller?",
  953: "Let's pretend I'm Fen. Look down there! That's Green Valley. Forty years ago, it was brown and dusty. Can you guess what the people did? And what happened as a result?",
  954: "Hello! Let's pretend I'm Dr. Mira. Time to be water detectives! Think about your morning. When do you use water? We can count the liters together!",
  955: "Yip, yip! Let's pretend I'm Fen. The whole village is here to listen. How can we save water? Tell us your best ideas!",
  956: "Yip! Let's pretend I'm Fen. Did you like Lina's story? Why do you think she was so sure there was water under the ground?",
  957: "Yip, yip! Let's pretend I'm Fen. Welcome to station one! Here's my quiz: Which is the largest desert? Then it's your turn to give me a quiz!",
  958: "Hello, young scientist! Let's pretend I'm Dr. Mira. I'm ready for your graph report. What does your graph show? How did the numbers change?",
  959: "Hello, little traveler! Let's pretend I'm Humphrey. This is our last ride together. What do you remember best about the Desert of the Sun?",
  960: "Yip, yip! Let's pretend I'm Fen. Welcome to the Earth Festival! What was your favorite place in the Desert of the Sun? What did you learn there?",
};
const out = [];
for (const [n, after] of Object.entries(S)) {
  const l = lessonOf(m, Number(n));
  const before = l.conversation.aiTask.starterEn;
  if (before === after) continue;
  out.push({
    lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so \"I'm Professor Nib / I'm Fen / Tick, tock! (as Old Tock)\" reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-30 rule). A second Let's -> Time to / We can / plain imperative; what's / Can you ~? for the lint infos; Good morning -> Hello / Hi; very, very -> really (L909)",
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w3132/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
