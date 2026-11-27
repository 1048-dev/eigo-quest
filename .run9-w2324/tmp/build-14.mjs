import fs from "node:fs";
const dump = fs.readFileSync(".run9-w2324/dump/L701-710.txt", "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const line of dump) {
  const h = line.match(/^## L(\d+)/);
  if (h) { L = +h[1]; cur[L] = {}; continue; }
  const m = line.match(/^(\S+) = (".*")$/);
  if (m && L) cur[L][m[1]] = JSON.parse(m[2]);
}
const out = [];
// sub: list of [from, to] replacements applied to current value
function p(lesson, path, subs, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`no path L${lesson} ${path}`);
  let after = before;
  for (const [a, b] of subs) {
    if (!after.includes(a)) throw new Error(`L${lesson} ${path}: missing "${a}"`);
    after = after.replace(a, b);
  }
  out.push({ lesson, path, before, after, reviewers, reason });
}
const seg = (n, f) => `teacher.segments[${n}].${f}`;

// L701
p(701, seg(4, "say"), [["People who work at the station.", "They work at the station."]], "objective", "Relative clause with who is a Stage 4 item in this world; simple sentence instead");
p(701, seg(4, "subtitleEn"), [["People who work at the station.", "They work at the station."]], "objective", "Same as say");

// L702
p(702, "teacherScript", [["We haven't missed our trip.", "We haven't lost much time."]], "A+B", "\"We haven't missed our trip\" is illogical right after missing the train; keeps the haven't model");
for (const f of ["say", "subtitleEn"]) p(702, seg(12, f), [["So long! Yawn!", "This is taking forever! Yawn!"]], "A+C", "\"So long!\" is heard as the US goodbye; JA ながーい！ still matches");

// L704
for (const f of ["say", "subtitleEn"]) p(704, seg(10, f), [["Its with no mark means belongs to it.", "Its with no mark means something belongs to it."]], "objective", "Grammar: \"means belongs to it\" is missing a subject");

// L705
p(705, "teacherScript", [["Find the station staff or your adult.", "Find the station staff or your grown-up."], ["Use the words from this block.", "Use the words from our trip."]], "A+B", "\"your adult\" is school jargon (grown-up is the child-directed US word); \"this block\" is curriculum jargon for kids");
for (const f of ["say", "subtitleEn"]) p(705, seg(10, f), [["Listen to taken. Tay, ken. The end is soft and short.", "Listen to taken. Take, then a short, soft n."]], "B+C", "Invented respelling Tay, ken (ken = /ken/, wrong vowel); describe it with a real word instead");
p(705, seg(10, "subtitleJa"), [["taken を きいてね。テイ、クン。おわりは やさしく みじかく。", "taken を きいてね。take の あとに、みじかく やさしい ン。"]], "B+C", "Match the new say");

// L706
p(706, "conversation.lines[4].en", [["The station on the top overlooks", "The station at the top overlooks"]], "A+C", "\"at the top\" is the natural form (matches \"at the top of the Cloud Bridge\")");
for (const f of ["say", "subtitleEn"]) p(706, seg(19, f), [["A lake has water.", "A lake has land all around it."]], "A+B", "A valley can have water too; the quiz clue that decides it is land all around");
p(706, seg(19, "subtitleJa"), [["みずうみには みずが あるね。", "みずうみは まわりを りくに かこまれて いるね。"]], "A+B", "Match the new say");

// L707
p(707, "teacherScript", [["Underline the place words in the postcard.", "Underline the place words on the postcard."]], "A+B", "US: words on a postcard");
for (const f of ["say", "subtitleEn"]) p(707, seg(0, f), [["bouncing in the seat.", "bouncing in his seat."]], "A+C", "Natural: bouncing in his seat");
p(707, "conversation.lines[5].en", [["Wonderful describing!", "Great job describing!"]], "A+C", "\"Wonderful describing!\" is not natural teacher praise");
for (const f of ["say", "subtitleEn"]) p(707, seg(20, f), [["Wonderful describing!", "Great job describing!"]], "A+C", "Same as conversation.lines[5]");

// L709
p(709, "teacherScript", [["If you want more, ask politely.", "If you need something else, ask politely."]], "A+B", "Water is not \"more\" of the lunch; something else fits the example");
for (const f of ["say", "subtitleEn"]) p(709, seg(10, f), [["O, ver, eat.", "O-ver-eat."]], "B+C", "Use the hyphen beat form for syllables");
for (const f of ["say", "subtitleEn"]) p(709, seg(20, f), [["You can order with I'll have, please.", "You can order with I'll have the curry, please."]], "A+C", "\"I'll have, please\" reads as a broken sentence aloud; give a full model");

// L710
p(710, "conversation.lines[0].en", [["Hello! Nice day, isn't it? I'm a passenger with a fishing rod.", "Hello! Nice day, isn't it?"]], "A+B", "A passenger would not describe himself this way; the JA already treats it as a stage note");
p(710, "conversation.lines[0].ja", [["こんにちは！いい てんきですね。（つりざおを もった じょうきゃくの やく）", "こんにちは！いい てんきですね。"]], "A+B", "Match the EN (scene and seg0 already say he has a fishing rod)");
p(710, seg(6, "slide.items[0]"), [["Hello! Nice day, isn't it? I'm a passenger with a fishing rod.", "Hello! Nice day, isn't it?"]], "A+B", "Slide shows conversation.lines[0]");
p(710, "conversation.aiTask.starterEn", [["Hello! Is this your first time on the Cloudtop Railway? I'm going to the sea.", "Hello! Nice day, isn't it? Is this your first time on the Cloudtop Railway?"]], "A+B", "The starter gave away the destination, so the target question Where are you going? had no point");
p(710, "teacherScript", [["The secret of good small talk is the one more question.", "The secret of good small talk is asking one more question."]], "A+C", "\"is the one more question\" is awkward to say and read");

fs.writeFileSync(".run9-w2324/patches/14-L701-710.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
