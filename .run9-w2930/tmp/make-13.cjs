// Build patches for group L871-880 (NN = 13) from the dump with substring replacements.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const dump = fs.readFileSync(path.join(root, "dump", "L871-880.txt"), "utf8").split(/\r?\n/);
const cur = {};
let lesson = null;
for (const line of dump) {
  const h = line.match(/^## L(\d+)/);
  if (h) { lesson = Number(h[1]); cur[lesson] = {}; continue; }
  const m = line.match(/^(\S+) = (".*")$/);
  if (m && lesson) cur[lesson][m[1]] = JSON.parse(m[2]);
}
const out = [];
function p(lesson, p_, pairs, reviewers, reason) {
  const before = cur[lesson][p_];
  if (before === undefined) throw new Error(`NOPATH L${lesson} ${p_}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`NOTFOUND L${lesson} ${p_}: ${a}`);
    after = after.split(a).join(b);
  }
  out.push({ lesson, path: p_, before, after, reviewers, reason });
}
const both = (l, seg, pairs, r, why) => {
  p(l, `teacher.segments[${seg}].say`, pairs, r, why);
  p(l, `teacher.segments[${seg}].subtitleEn`, pairs, r, why);
};

// L871: relative "that" before its start lesson (L872)
both(871, 3, [["Robot. A machine that moves and works.", "Robot. A machine. It moves and works."]], "objective", "relative clause 'a machine that' appears one lesson before 'that' is taught (L872); use two plain sentences");
both(871, 9, [["Automobile. A car that moves by itself.", "Automobile. A car. It moves by itself."]], "objective", "relative clause 'a car that' before L872; matches the teacherScript wording 'A car. It moves by itself.'");

// L872: ambiguous fact/opinion question
p(872, "teacherScript", [["Yes, because it moves slowly. Is this a fact or an opinion? It's a fact.", "Yes, because it moves slowly. The sign says, I move slowly. Is that a fact or an opinion? It's a fact."]], "A+B", "'Is this a fact' had no clear 'this'; name the sentence being checked");

// L873: "who" before L876
both(873, 3, [["Driver. The person who drives.", "Driver. A driver drives the bus or the car."]], "objective", "relative 'the person who' appears before 'who' is taught (L876)");

// L875: "who" before L876; kind vs polite
both(875, 3, [["Guide. A person who shows you the way.", "Guide. A guide shows you the way."]], "objective", "relative 'a person who' appears before 'who' is taught (L876)");
both(875, 8, [["A guide uses kind words.", "A guide uses polite words."]], "A+B", "JA is ていねいな ことば (polite); 'Please follow me' is polite rather than kind");

// L876: robot with who contradicts the lesson rule
p(876, "teacherScript", [["My new game is about a robot who builds bridges.", "My new game is about a robot that builds bridges."]], "objective", "the lesson teaches 'people get who, things get that'; a robot takes that");

// L877: robot repairer -> robot mechanic; ambiguous 'they'
p(877, "teacherScript", [
  ["She is a robot repairer.", "She is a robot mechanic."],
  ["Recycling workers collect cans and bottles, so they can be used again.", "Recycling workers collect cans and bottles, so we can use them again."],
  ["Robot repairers fix our street robots and buses.", "Robot mechanics fix our street robots and buses."],
  ["Who fixes the street robots? Robot repairers.", "Who fixes the street robots? Robot mechanics."],
], "A+C", "'repairer' is rare in US English and awkward to say; 'they can be used' read as if the workers are used");
p(877, "conversation.lines[4].en", [["Robot repairers do.", "Robot mechanics do."]], "A+C", "'robot mechanics' is the natural US word (same JA ロボットを なおす ひと)");
both(877, 7, [["Robot repairers do.", "Robot mechanics do."]], "A+C", "same change as conversation line 4");
p(877, "teacher.segments[7].slide.items[1]", [["Robot repairers do.", "Robot mechanics do."]], "A+C", "slide shows conversation line 4");

// L879: robot who; article; Er and or; across the air
p(879, "teacherScript", [
  ["I'm a robot who helps visitors.", "I'm a robot that helps visitors."],
  ["I think astronaut is the most exciting job", "I think an astronaut has the most exciting job"],
  ["Sending a message or a signal across the air.", "Sending a message or a signal through the air."],
], "objective", "robot takes 'that' (L876 rule: things get that or which); missing article 'an astronaut'; 'through the air' (JA くうきの なかを とおして)");
both(879, 9, [["Er and or mean a person or a thing.", "The ending E R or O R means a person or a thing."]], "B+C", "TTS reads 'Er and or' as a hesitation and the word 'or'; spell the endings");
p(879, "teacher.segments[9].subtitleJa", [["er や or は「〜する ひと・もの」の いみだよ。", "おわりの er や or は「〜する ひと・もの」の いみだよ。"]], "B+C", "match the EN 'The ending'");
both(879, 10, [["Sending a signal across the air.", "Sending a signal through the air."]], "A+B", "'through the air' is the natural phrase and matches JA くうきの なかを とおして");

// L880: "Ten years later" for the future
both(880, 2, [["Ten years later, you'll be big!", "In ten years, you'll be all grown up!"]], "A+B", "'later' looks back from a past time; for the future from now we say 'In ten years'; 'big' -> 'all grown up'");

fs.writeFileSync(path.join(root, "patches", "13-L871-880.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(out.length, "patches");
