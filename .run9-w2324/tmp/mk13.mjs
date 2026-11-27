import fs from "node:fs";
const dump = fs.readFileSync(".run9-w2324/dump/L691-700.txt", "utf8").split("\n");
const cur = {}; let L = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/); if (m) { L = +m[1]; continue; }
  const k = line.match(/^(\S+) = (".*")$/); if (k) cur[`${L}|${k[1]}`] = JSON.parse(k[2]);
}
const out = [];
// edit by replace within current value
const P = (lesson, path, from, to, reviewers, reason) => {
  const before = cur[`${lesson}|${path}`];
  if (before === undefined) throw new Error(`no ${lesson} ${path}`);
  if (!before.includes(from)) throw new Error(`no match ${lesson} ${path}: ${from}`);
  out.push({ lesson, path, before, after: before.replace(from, to), reviewers, reason });
};
const S = "teacher.segments";
// L692
P(692, `${S}[5].say`, "Cut it into two same parts.", "Cut it into two equal parts.", "objective", "\"two same parts\" is not grammatical English; \"two equal parts\" (JA おなじ おおきさ already matches)");
P(692, `${S}[5].subtitleEn`, "Cut it into two same parts.", "Cut it into two equal parts.", "objective", "same as say");
P(692, `${S}[0].subtitleJa`, "ぎんいろの きっぷは さいしょの のりもの だけ。", "ぎんいろの きっぷは さいしょの れっしゃ だけ。", "objective (JA)", "さいしょの のりもの (\"the first vehicle\") is unnatural for \"only for the first ride\"");
// L693
P(693, "conversation.aiTask.starterEn", "Hello! A ticket to Rainbow Falls? Sure. One way or round trip?", "Hello! Next, please! Where are you going today? One way or round trip?", "A+B", "the starter answered a request the child never made (\"A ticket to Rainbow Falls? Sure.\"); let the child choose the place");
// L695
P(695, "teacherScript", "Read it again with a clear, slow voice, like real staff.", "Read it again in a clear, slow voice, like real staff.", "A+B", "the collocation is \"in a ... voice\"");
// L696
P(696, "phonics.tipJa", "seen と been は「イーン」、done は「ダン」", "seen は「イーン」と ながく、been は アメリカでは「ビン」と みじかく、done は「ダン」", "objective", "in American English \"been\" is /bɪn/ (like bin), not /biːn/; seen and been do not rhyme");
P(696, "phonics.sounds[0]", "/iːn/", "/iːn/ /ɪn/", "objective", "been is /bɪn/ in US English (same two-sound format as sounds[1])");
P(696, `${S}[10].say`, "Seen and been rhyme. Een! Done is short, like dun.", "Seen has a long een. Been is short, like bin. Done is short, like dun.", "objective", "US \"been\" is /bɪn/; \"Seen and been rhyme\" teaches a non-US sound");
P(696, `${S}[10].subtitleEn`, "Seen and been rhyme. Een! Done is short, like dun.", "Seen has a long een. Been is short, like bin. Done is short, like dun.", "objective", "same as say");
P(696, `${S}[10].subtitleJa`, "seen と been は おなじ ひびき。イーン！ done は", "seen は ながく「イーン」。been は みじかく「ビン」。done は", "objective", "match the corrected English (been = bin)");
P(696, `${S}[8].say`, "Have you ever means, at any time in your life? Answer,", "Have you ever means, at any time in your life. Answer,", "B+C", "the explanation is a statement; \"?\" makes TTS read it as a question (teacherScript already uses a period)");
P(696, `${S}[8].subtitleEn`, "Have you ever means, at any time in your life? Answer,", "Have you ever means, at any time in your life. Answer,", "B+C", "same as say");
// L698
P(698, "teacherScript", "Try means eat something new.", "Here, try means eat something new.", "A+B", "seg3 defines try as \"do something new\"; mark this as the food meaning only");
P(698, `${S}[4].say`, "Snack. A small food between meals.", "Snack. A little food between meals.", "A+B", "\"a small food\" is odd (food is uncountable here); \"a little food\"");
P(698, `${S}[4].subtitleEn`, "Snack. A small food between meals.", "Snack. A little food between meals.", "A+B", "same as say");
// L699
P(699, "conversation.aiTask.starterEn", "I've ridden this train twenty times! How many times have you ridden a train?", "I've been to the sea many times! How many times have you been to the sea?", "A+B", "the partner is Kiko, who is riding this train for the first time with the group; \"twenty times\" breaks the story (now uses the lesson's target question)");
// L700
P(700, `${S}[8].say`, "is a happy answer, too!", "is a great answer, too!", "A+B", "\"a happy answer\" is not idiomatic; same wording as L696 (\"No is a great answer, too\")");
P(700, `${S}[8].subtitleEn`, "is a happy answer, too!", "is a great answer, too!", "A+B", "same as say");
P(700, `${S}[9].say`, "One, like gone.", "O, n, like gone.", "B+C", "TTS reads \"One\" as the number (wun), the wrong sound for gone; spell the letters like \"W, n\"");
P(700, `${S}[9].subtitleEn`, "One, like gone.", "O, n, like gone.", "B+C", "same as say");
P(700, `${S}[9].subtitleJa`, "one は gone。", "o、n は gone。", "B+C", "match the English");
const sc = "Speed challenge! Swim in the sea! Shout, Bingo! Gallop like a horse! Draw a big circle!";
P(700, `${S}[13].say`, "Draw a big circle on your card. Round and round! Five in a row? Shout, Bingo!", sc, "A+B+C", "seg13 repeated seg12 word for word; make it the speed challenge its slide shows (all four TPR items), like every other lesson");
P(700, `${S}[13].subtitleEn`, "Draw a big circle on your card. Round and round! Five in a row? Shout, Bingo!", sc, "A+B+C", "same as say");
P(700, `${S}[13].subtitleJa`, "カードに おおきな まるを かいて。ぐる、ぐる！ 5つ ならんだ？「ビンゴ！」と さけんで！", "スピード チャレンジ！ うみで およいで！「ビンゴ！」と さけんで！ うまの ように はねて！ おおきな まるを かいて！", "A+B+C", "match the new speed challenge");
fs.writeFileSync(".run9-w2324/patches/13-L691-700.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length);
