// AI starters: the app shows the partner CHILD (Haru / Riko / Kiko / Birimo, with its own face and name) saying the
// starter, but the L961-1020 starters speak as Ember, Dr. Mori, Grandma Tomo, Skye, Mr. Lee, Mrs. Brown, clerks...
// Keep the role the goal casts, and make the pretend play explicit with "Let's pretend I'm X." (W25-32 rule)
// -> patches/02-starters.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const EMBER = "Let's pretend I'm Ember.";
const MORI = "Let's pretend I'm Dr. Mori.";
const TOMO = "Let's pretend I'm Grandma Tomo.";
const SKYE = "Let's pretend I'm Skye.";
const LEE = "Let's pretend I'm Mr. Lee.";
const S = {
  961: "Let's pretend I'm Ember, the junior safety ranger. Welcome to the Island of Fire! Can you see the big mountain behind the town? Ask me anything about it!",
  962: `${MORI} Welcome to the Earth Science Museum! Look at this giant model of the earth. What do you see inside? Ask me about any layer!`,
  963: `${MORI} Welcome to the science room! Today we'll make a model volcano with baking soda and vinegar. But first, can you tell me what happens when a real volcano erupts?`,
  964: `Ahh! ${EMBER} The hot spring feels great today! Did you know that our volcano gives us lots of gifts? Can you tell me one of them?`,
  965: `${MORI} Welcome to the Earth Science Show! I'm so excited to hear your presentation. What will you tell us about the earth today?`,
  966: `${MORI} Welcome to the earthquake corner! Try pushing these two wooden blocks together. What happens? Can you explain why earthquakes happen?`,
  967: `${MORI} Look at this big screen. Do you see that white swirl of clouds far out at sea? Do you know what it is?`,
  968: `${EMBER} See this green sign with an arrow? It shows the way to high ground. We can walk up to Hilltop Park together! Do you know why this path is important?`,
  969: `${EMBER} Ding-dong! This is a drill. Listen carefully: a strong typhoon is coming tonight, so please stay inside and close your windows. Now, what did the announcement say?`,
  970: "Let's pretend I'm Dr. Mori, the quiz master. Welcome to the Disaster Science Quiz! Are you ready? Here's the first question: What should you do during a typhoon?",
  971: `Safety first, fun always! ${EMBER} Here's an empty backpack. We can make an emergency kit together. What should we put in it first?`,
  972: `${EMBER} Welcome to the Safety House, detectives! We can check this home together. What should we make sure of first? Look around and tell me!`,
  973: `${EMBER} Here we are at Hilltop Park! Time to make a plan for a pretend family. Where should our story family meet? Look around the park and choose a spot!`,
  974: `${MORI} Welcome to the museum shop! I have a waterproof bag, a fireproof box, and a big flashlight here. Which one would you put in your emergency kit? Why?`,
  975: `${EMBER} It's Safety Plan Day! I can't wait to hear your plan. Tell me about a pretend family. If there's an earthquake, where will they go?`,
  976: `${EMBER} This is a drill! Imagine the ground is shaking right now. What do you do first? Tell me step by step!`,
  977: `${EMBER} The shaking has stopped, and it's time to go outside. Oh, I want to run! What should I do? Can you help me remember the rules?`,
  978: `${EMBER} Oh no, my step cards are all mixed up! Can you help me put them in order? What do we do first when the ground shakes?`,
  979: `${EMBER} The drill is over, and we're all on the playground. Oh! I left my helmet in the classroom. Can I run back and get it?`,
  980: `${EMBER} You are today's hosts! Here's the microphone. The drill starts in one minute. What will you say first? Time to practice!`,
  981: `${TOMO} Hello, dear! Welcome to the volunteer center. We have so many jobs today. There's water to carry and blankets to fold. Would you like to help?`,
  982: "Let's pretend I'm an old man who lives next door. Oh, hello there! It was very windy last night. I'm fine, but my garden chairs fell over, and I have a heavy bag of oranges.",
  983: "Let's pretend I'm a traveler. Excuse me! I just got off the ferry. I heard an announcement, but I don't understand Japanese. What's happening? Where should I go?",
  984: `${TOMO} Come and sit down, dear. Would you like to hear an old story about our island? It's a made-up story, but it's full of kind people. Ask me anything!`,
  985: "Let's pretend I'm a traveler. Hello! I'm sorry, I'm a little lost. I heard the drill announcement, but I don't know where the shelter is. Can you help me?",
  986: `${EMBER} Hi, poster makers! Safety first, fun always! I'm making a poster for the festival, too. What should I write on it? What should I draw?`,
  987: "Let's pretend I work at this inn. Welcome! Before you go to your room, please look at the safety card on the door. If the alarm rings, what should you do first?",
  988: `${TOMO} Hello, dear! I'm writing my safety promise today. I promise to check my flashlight every month. What's your safety promise?`,
  989: `${MORI} Hello again! Mount Cinder is calm today. Before you leave the island, please tell me: What did you learn here? What will you do when the ground shakes?`,
  990: `${EMBER} Safety first, fun always! Welcome to the Safety Festival! What was your favorite part of the Island of Fire? What did you learn here?`,
  991: "Let's pretend I'm Skye, the junior guide of the Airport of Wings. Every trip is a story! Look out the big window. What can you see? Where would you like to fly someday?",
  992: "Let's pretend I'm your check-in clerk. Good morning, and welcome to the Airport of Wings! How can I help you?",
  993: "Let's pretend I'm your check-in clerk. Thank you for waiting! Now it's time to choose your seat. Would you like a window seat or an aisle seat?",
  994: "Let's pretend I'm the airport announcer. Good morning, passengers! Flight 205 is now boarding at gate 23B. Can you tell me which flight is boarding and where?",
  995: "Let's pretend I work at the airport. Hello there! You look a little lost. Can I help you find something?",
  996: "Let's pretend I'm a flight attendant. Hello! Welcome aboard Flight 205. Is there anything I can get for you?",
  997: "Let's pretend I'm an immigration officer. Hello, and welcome to Skyport International Airport! I just have a few simple questions. What's the purpose of your visit?",
  998: "Let's pretend I work at the transfer desk at Skyport. Hello! You look like you have a connecting flight. How can I help you?",
  999: "Let's pretend I work at the currency exchange counter. Hello! Today's rate is on the board above me. How can I help you?",
  1000: `${SKYE} Welcome to Brightwater! Congratulations on your 1,000th lesson! I flew all the way here to see you. How was your trip? What was the best part?`,
  1001: "Let's pretend I'm Mr. Lee at the front desk. Good evening, and welcome to the Seagull Hotel! Do you have a reservation with us tonight?",
  1002: `${LEE} Hello, this is the front desk. How is your room? Is there anything I can do for you?`,
  1003: `${LEE} Good morning! Did you enjoy your breakfast? Where would you like to go today? I'm happy to help you find the way.`,
  1004: `${LEE} Good evening! You look hungry after your day in the city. Are you looking for a place to eat? I know many good places in Brightwater.`,
  1005: `${LEE} Oh dear, look at that rain! Welcome back. Are you going out this afternoon? How can I help you?`,
  1006: "Let's pretend I work at the Baggage Service desk. Hello! I'm sorry you had to come here. Is something wrong with your bag?",
  1007: `${LEE} Hello, this is the front desk. Is everything all right with your room this afternoon?`,
  1008: `${LEE} I'm so sorry. Sam says the air conditioner in your room can't be fixed until tomorrow. What would you like us to do?`,
  1009: `${LEE} Good morning! You look a little worried. Is everything OK? Please tell me what happened, and we'll figure it out together.`,
  1010: `${LEE} Hello there! I heard you made something special in the lobby today. Is there anything you'd like to tell me?`,
  1011: "Let's pretend I'm a tourist by the Clock Tower. Hello there! What a beautiful day. Do you need some help?",
  1012: "Let's pretend I'm your waiter. Good afternoon, and welcome to the River Fish Restaurant! Here's some water for you. How can I help you today?",
  1013: "Let's pretend I'm Mrs. Brown from the UK. Hello, dears! I'm on holiday here. Shall we take the lift together? Oh, what do you call it in the US?",
  1014: "Let's pretend I work at the City Museum. Good morning, and welcome! How many tickets would you like today?",
  1015: `${SKYE} Every trip is a story! I flew over the city all day. What did you do in Brightwater today? Tell me in order!`,
  1016: "Let's pretend I'm Mr. Lee at the front desk of the Seagull Hotel. Hello! I just got your message. How can I help you?",
  1017: "Let's pretend I'm a tour guide. Hello, visitors! Here's our brochure with three afternoon tours. Which one sounds fun to you, and why?",
  1018: `${SKYE} Every trip is a story! I love reading travel journals. What did you write on your first page?`,
  1019: "Let's pretend I work at Brightwater Airport. Good morning, and welcome! It's a busy day today. Can I help you with something?",
  1020: `${SKYE} Every trip is a story! Welcome home to the Airport of Wings! What was your favorite part of the trip? What did you learn?`,
};
const out = [];
for (const [n, after] of Object.entries(S)) {
  const l = lessonOf(m, Number(n));
  const before = l.conversation.aiTask.starterEn;
  if (before === after) continue;
  out.push({
    lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so \"I'm Ember / I'm Dr. Mori / I'm Mr. Lee / I'm your check-in clerk\" reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W25-32 rule). In-story greetings of the role (Good morning at breakfast, Good evening at the hotel) stay; a second Let's -> We can / Time to; Ding, dong -> Ding-dong; Look out of -> Look out (US)",
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w3334/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
