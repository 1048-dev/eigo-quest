import fs from "node:fs";
const root = "C:/Users/EMICLE/eigo-quest-night/.run9-w3132/";
const lines = fs.readFileSync(root + "dump/L931-940.txt", "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const ln of lines) {
  const h = ln.match(/^## L(\d+)/);
  if (h) { L = +h[1]; cur[L] = {}; continue; }
  const m = ln.match(/^(\S+) = (".*")$/);
  if (m && L) cur[L][m[1]] = JSON.parse(m[2]);
}
const out = [];
function p(lesson, path, pairs, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error("no path " + lesson + " " + path);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`not found in ${lesson} ${path}: ${a}`);
    after = after.replace(a, b);
  }
  out.push({ lesson, path, before, after, reviewers, reason });
}

// L932 geographer: y drops
p(932, "teacherScript", [["Geographer. Add e, r to geography, and it means a person who studies geography.", "Geographer. Take the y off geography and add e, r. It means a person who studies geography."]], "objective", "geography + er is not geographer; the y drops before e, r");
p(932, "phonics.tipJa", [["geography＋er で geographer", "geography の y を とって er で geographer"]], "objective", "the y of geography drops before er (matches the geologist explanation)");
for (const f of ["say", "subtitleEn"]) p(932, `teacher.segments[12].${f}`, [["Night time.", "Nighttime."]], "objective", "US spelling: nighttime is one word");

// L933 invented respelling
for (const f of ["say", "subtitleEn"]) p(933, `teacher.segments[9].${f}`, [["Geo means the earth. Jee oh. Geothermal.", "Geo means the earth. Geothermal."]], "A+C", "'Jee oh' is an invented respelling TTS may misread; the words themselves model the sound");
p(933, "teacher.segments[9].subtitleJa", [["geo は「ちきゅう」。ジオ。geothermal。", "geo は「ちきゅう」。geothermal。"]], "A+C", "match the English (respelling removed)");

// L934 geographic: y drops
p(934, "teacherScript", [["Add i, c, and geography becomes a describing word.", "Take the y off geography and add i, c. Now it's a describing word."]], "objective", "geography + ic is not geographic; the y drops");

// L935 Africa definition
for (const f of ["say", "subtitleEn"]) p(935, `teacher.segments[3].${f}`, [["The Sahara is in the north of it.", "The Sahara is in North Africa."]], "A+C", "'in the north of it' is awkward and ends on a weak 'it'");

// L936 nay -> na respelling, missing speaker, caravan JA
p(936, "teacherScript", [["Drop the e, and the sound changes from nay to na. Nation, national. Nay becomes na again.", "Drop the e, and nay becomes a short a, like in cat. Nation, national. The short a again."]], "B+C", "'na' is an invented respelling TTS reads as 'nah' (wrong vowel); the vowel in natural / national is the short a of cat");
for (const f of ["say", "subtitleEn"]) p(936, `teacher.segments[9].${f}`, [["Listen. Nay becomes na. Nation, national. Nay becomes na again!", "Listen. Nay becomes a short a, like in cat. Nation, national. The short a again!"]], "B+C", "'na' is an invented respelling TTS reads as 'nah'; the vowel is the short a of cat");
p(936, "teacher.segments[9].subtitleJa", [["きいて。「ネイ」が「ナ」に なる。nation から national。また「ネイ」が「ナ」に！", "きいて。「ネイ」が cat の a のような みじかい「ア」に なる。nation から national。また みじかい「ア」！"]], "B+C", "match the English (short a as in cat)");
for (const f of ["say", "subtitleEn"]) p(936, `teacher.segments[7].${f}`, [["in your hump? No, no.", "in your hump? Birimo laughs. No, no."]], "A+C", "'No, no.' had no speaker tag, so it ran into Riko's question");
p(936, "teacher.segments[7].subtitleJa", [["あるから？」「いやいや。", "あるから？」 ビリモが わらう。「いやいや。"]], "A+C", "match the English (speaker tag)");
p(936, "vocab[2].ja", [["キャラバン（ラクダの たいしょう）", "キャラバン（ラクダと いっしょに たびを する 人たちの れつ）"]], "objective (JA)", "たいしょう (隊商) in hiragana reads as 大将 / 対象 for a child; explain it plainly");

// L937 so that = purpose, not 'for this reason'
p(937, "teacherScript", [["So that（～できるように） means for this reason, or to make something possible.", "So that（～できるように） tells us what something is for."]], "A+B", "'for this reason' means 'therefore'; so that tells the purpose (what the ears are for)");
for (const f of ["say", "subtitleEn"]) p(937, `teacher.segments[8].${f}`, [["So that tells the reason.", "So that tells us why."]], "A+B", "so that gives the purpose, not a cause (same wording as L940 seg1); matches the L939-940 なんの ため wording");
p(937, "teacher.segments[8].subtitleJa", [["so that は「～できるように」と りゆうを おしえるよ。", "so that は「～できるように」と、なんの ためかを おしえるよ。"]], "A+B", "match the English (purpose)");

// L939 Say men strongly
for (const f of ["say", "subtitleEn"]) p(939, `teacher.segments[9].${f}`, [["Say men strongly!", "Say it strong in the middle: en-vi-ron-MEN-tal!"]], "B+C", "'Say men strongly' reads as the word men; use the hyphen beat form for the stress");

// L940 speaker tag
p(940, "teacherScript", [["It's Humphrey! Yes, it's me!", "It's Humphrey! He says, Yes, it's me!"]], "A+C", "Humphrey's line had no speaker tag after the narrator's 'It's Humphrey!'");

fs.writeFileSync(root + "patches/13-L931-940.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
