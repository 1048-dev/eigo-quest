// AI starters where the app's partner (Haru / Riko / Kiko / Birimo, shown with its own face) introduced itself as a
// different NAMED character (Mr. Hoot, Lulu, Echo, Mr. Mole). The goals say the AI plays that character, so keep the
// role, but make the role-play explicit: "Let's pretend I'm Mr. Hoot." -> patches/02-starters.json (run after 00-01).
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const S = {
  733: "Hello, detective! Let's pretend I'm Mr. Mole. I live in this cave. What do you want to ask me?",
  752: "Hi! Let's pretend I'm Lulu the rabbit. I enjoy dancing on the stage. What do you enjoy?",
  761: "Let's pretend I'm Mr. Hoot, the theater director. Hoo, hoo! The old script has no ending. What did you decide to do?",
  762: "Hello, writer! Let's pretend I'm Lulu the rabbit. Our princess is in a tall tower. What happens suddenly?",
  765: "Let's pretend I'm Mr. Hoot. Hoo! I heard you wrote a new play. Can you tell me the story from the beginning?",
  766: "Let's pretend I'm Mr. Hoot. Hoo! We're practicing the princess's line, I'm free! How should we say it?",
  767: "Let's pretend I'm Lulu the rabbit. I'm on the stage, and you're at the back. Hello… can you hear me?",
  768: "Let's pretend I'm Mr. Hoot. Hoo! Listen to this: I didn't eat YOUR cake. Which word is important?",
  769: "Let's pretend I'm Mr. Hoot, the director. Hoo! Time to practice stage directions. Are you ready? Enter from the left!",
  771: "Hello! Let's pretend I'm Lulu. I take care of the costume box. What do you need for your play?",
  772: "Hello! Let's pretend I'm Mr. Hoot. The dress rehearsal starts soon. How do you feel in your costume?",
  773: "Hi! Let's pretend I'm Lulu. I'm going on stage in five minutes, and I'm so nervous!",
  774: "Welcome to the show! Let's pretend I'm Mr. Hoot. I missed the middle of the play. What happened?",
  775: "Hello! Let's pretend I'm Lulu. I just watched your play. I have to say, I loved it!",
  776: "Hello! Let's pretend I'm Mr. Hoot. Your play was wonderful. What was the best part?",
  777: "Hi, writer! Let's pretend I'm Lulu. I want to act in your script. Who are the characters?",
  778: "Hello! Let's pretend I'm Echo. I love stories. We can make one together, one word at a time. Once…",
  779: "Hello! Let's pretend I'm Mr. Hoot. Thank you for bringing the echoes back. What did you enjoy at my theater?",
  780: "Bravo! Let's pretend I'm Lulu. That was a wonderful show! Did you have fun?",
};
const out = [];
for (const [n, after] of Object.entries(S)) {
  const l = lessonOf(m, Number(n));
  const before = l.conversation.aiTask.starterEn;
  out.push({
    lesson: Number(n), path: "conversation.aiTask.starterEn", before, after, reviewers: "A+B (block rule)",
    reason: "the app shows the partner child (its own face and name) saying the starter, so \"I'm Lulu / I'm Mr. Hoot\" reads as the wrong speaker. The goal casts the AI in that role, so keep it and make the pretend play explicit (W19-22 starter rule). Removed a second Let's / a stray greeting where it doubled",
  });
}
fs.writeFileSync(path.join(REPO, ".run9-w2526/patches/02-starters.json"), JSON.stringify(out, null, 1));
console.log(out.length);
