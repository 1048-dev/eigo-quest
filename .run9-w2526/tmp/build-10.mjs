import fs from "node:fs";
const dump = fs.readFileSync(".run9-w2526/dump/L721-730.txt", "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { L = +m[1]; cur[L] = {}; continue; }
  const k = line.match(/^(\S+) = (".*")$/);
  if (k && L) cur[L][k[1]] = JSON.parse(k[2]);
}
const out = [];
function p(lesson, path, from, to, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`no path L${lesson} ${path}`);
  if (!before.includes(from)) throw new Error(`no match L${lesson} ${path}: ${from}`);
  out.push({ lesson, path, before, after: before.replace(from, to), reviewers, reason });
}
// L722
p(722, "teacher.segments[3].say", "Not left, not right. Right here!", "Not left, not right. Here!", "B+C", "'not right. Right here' puts direction 'right' and 'right here' side by side; confusing for learners and TTS");
p(722, "teacher.segments[3].subtitleEn", "Not left, not right. Right here!", "Not left, not right. Here!", "B+C", "match say");
p(722, "teacher.segments[3].subtitleJa", "ちょうど ここ！", "ここ！", "B+C", "match EN");
// L723
p(723, "teacher.segments[2].say", "A box has four corners.", "A square has four corners.", "objective", "a box (3-D) has eight corners; JA already says しかく (square)");
p(723, "teacher.segments[2].subtitleEn", "A box has four corners.", "A square has four corners.", "objective", "match say");
// L724
const l724old = "There's a box in the middle. There's a lamp next to the box.";
const l724new = "There's a table in the middle. There's a box on it. There's a lamp next to the box.";
p(724, "conversation.lines[2].en", l724old, l724new, "A+B", "Riko later says 'draw a key under the table' but no table was in the picture; add the table");
p(724, "conversation.lines[2].ja", "まんなかに はこが あるの。", "まんなかに テーブルが あるの。その うえに はこ。", "A+B", "match EN");
p(724, "teacher.segments[7].say", l724old, l724new, "A+B", "same story fix as conversation.lines[2]");
p(724, "teacher.segments[7].subtitleEn", l724old, l724new, "A+B", "match say");
p(724, "teacher.segments[7].subtitleJa", "まんなかに はこが あるの。", "まんなかに テーブルが あるの。その うえに はこ。", "A+B", "match EN");
p(724, "teacher.segments[7].slide.items[0]", l724old, l724new, "A+B", "slide shows the changed line");
// L725
p(725, "teacher.segments[0].say", "Good morning, explorers!", "Hi, explorers!", "A+B", "'Good morning' assumes the time of day; the app can be used any time");
p(725, "teacher.segments[0].subtitleEn", "Good morning, explorers!", "Hi, explorers!", "A+B", "match say");
p(725, "teacher.segments[0].subtitleJa", "おはよう、たんけんたい！", "やあ、たんけんたい！", "A+B", "match EN");
p(725, "teacher.segments[2].say", "A long road under the ground.", "A long path under the ground.", "A+B", "a cave tunnel is not a road (cars); path matches みち");
p(725, "teacher.segments[2].subtitleEn", "A long road under the ground.", "A long path under the ground.", "A+B", "match say");
p(725, "teacher.segments[6].say", "Kiko asks, Let's make", "Kiko says, Let's make", "A+C", "the quote starts with a suggestion, not a question");
p(725, "teacher.segments[6].subtitleEn", "Kiko asks, Let's make", "Kiko says, Let's make", "A+C", "match say");
// L726
p(726, "teacherScript", "She flies around at night, so don't worry.", "She flies around at night. Don't worry.", "A+B", "'flies at night, so don't worry' is not a reason; split into two sentences");
p(726, "teacher.segments[9].say", "Say iv, short.", "It sounds like give.", "B+C", "invented respelling 'iv' (TTS may read IV / I.V.) -> real word with the same sound");
p(726, "teacher.segments[9].subtitleEn", "Say iv, short.", "It sounds like give.", "B+C", "match say");
p(726, "teacher.segments[9].subtitleJa", "みじかく「イヴ」。", "give と おなじ おと。", "B+C", "match EN");
// L727
p(727, "teacher.segments[9].say", "Just add ive. Iv, iv.", "Just add ive. It sounds like give.", "B+C", "invented respelling 'Iv, iv' -> real word with the same sound");
p(727, "teacher.segments[9].subtitleEn", "Just add ive. Iv, iv.", "Just add ive. It sounds like give.", "B+C", "match say");
p(727, "teacher.segments[9].subtitleJa", "ive を つけるだけ。イヴ、イヴ。", "ive を つけるだけ。give と おなじ おと。", "B+C", "match EN");
// L728
p(728, "teacher.segments[2].subtitleJa", "おはなしの なかの つくりものの もの。", "おはなしに でてくる つくりもの。", "objective (JA)", "'つくりものの もの' is clumsy Japanese");
p(728, "teacher.segments[8].subtitleJa", "ポイント。たしかさ メーター。might は", "ポイント。might は", "objective (JA)", "JA adds 'certainty meter', which the EN does not say");
// L729
p(729, "teacher.segments[17].say", "Tomorrow's weather. How sure are you? Say, It's probably sunny. Or maybe it's rainy.", "Guess the weather outside. Don't look! Say, It's probably sunny. Or maybe it's rainy.", "A+B", "'It's probably sunny' does not fit tomorrow (needs will); guess today's weather instead");
p(729, "teacher.segments[17].subtitleEn", "Tomorrow's weather. How sure are you? Say, It's probably sunny. Or maybe it's rainy.", "Guess the weather outside. Don't look! Say, It's probably sunny. Or maybe it's rainy.", "A+B", "match say");
p(729, "teacher.segments[17].subtitleJa", "あしたの てんき。どの くらい たしか？", "そとの てんきを よそうして。みちゃ だめ！", "A+B", "match EN");
// L730
p(730, "teacher.segments[2].say", "Object. A thing you can touch. A cup, a pen, a ball. Object!", "An object. A thing you can touch. A cup, a pen, a ball. They're all objects!", "B+C", "bare 'Object.' is a heteronym (TTS may say obJECT); the article makes it the noun");
p(730, "teacher.segments[2].subtitleEn", "Object. A thing you can touch. A cup, a pen, a ball. Object!", "An object. A thing you can touch. A cup, a pen, a ball. They're all objects!", "B+C", "match say");
p(730, "teacher.segments[2].subtitleJa", "コップ、ペン、ボール。object！", "コップ、ペン、ボール。ぜんぶ object だよ！", "B+C", "match EN");
fs.writeFileSync(".run9-w2526/patches/10-L721-730.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
