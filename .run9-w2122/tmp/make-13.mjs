// Builds .run9-w2122/patches/13-L631-640.json from the dump with substring replacements.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dump = fs.readFileSync(path.join(DIR, "dump/L631-640.txt"), "utf8").split(/\r?\n/);
const cur = new Map();
let lesson = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { lesson = Number(m[1]); continue; }
  const i = line.indexOf(" = ");
  if (!lesson || i < 0) continue;
  cur.set(`${lesson}|${line.slice(0, i)}`, JSON.parse(line.slice(i + 3)));
}
const out = [];
function P(n, p, pairs, reviewers, reason) {
  const before = cur.get(`${n}|${p}`);
  if (typeof before !== "string") throw new Error(`no path L${n} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`not found L${n} ${p}: ${a}`);
    after = after.replace(a, b);
  }
  out.push({ lesson: n, path: p, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
function SE(n, i, pairs, reviewers, reason, jaPairs) {
  P(n, seg(i, "say"), pairs, reviewers, reason);
  P(n, seg(i, "subtitleEn"), pairs, reviewers, `Follow seg${i} say`);
  if (jaPairs) P(n, seg(i, "subtitleJa"), jaPairs, reviewers, `Follow seg${i} say (JA)`);
}

// L631
P(631, "teacherScript", [["A million is a very big number. One thousand, one thousand, one thousand, a thousand times!", "A million is a very big number. It's a thousand times a thousand!"]],
  "A+B+C", "'One thousand, one thousand, one thousand, a thousand times!' does not say what a million is and is hard to read aloud; a million = a thousand times a thousand");
P(631, "phonics.tipJa", [["write は e を とって r だけ つけるよ。", "write は e で おわって いるから、r だけ つけるよ。"]],
  "objective (JA)", "Wrong spelling rule: dropping the e AND adding only r gives 'writr'; match seg10 (write already ends with e, so just add r)");
P(631, "conversation.lines[2].ja", [["こはくの図書館よ", "こはくの としょかんよ"]],
  "objective (JA)", "Kanji 図書館 in a kids' line; every other place (seg7 subtitleJa, title) uses としょかん");
P(631, "conversation.aiTask.starterEn", [["Welcome to the Amber Library! This library has a million books.", "Wow, look! This library has a million books."]],
  "A+B", "Kiko (the partner) has just found the library, so 'Welcome to the Amber Library!' sounds like the librarian; keep the target sentence");
SE(631, 19, [["Great asking!", "Great question!"]], "A+C", "'Great asking!' is not natural praise; 'Great question!' (JA じょうずに きけたね still fits)");

// L632
P(632, "phonics.tipJa", [["t の おとで おわる ことばは or に なる ことが おおい。おとは er と おなじ「アー」。", "or も「〜する 人」の おわり。おとは er と おなじ「アー」なので、つづりで おぼえよう。"]],
  "A+B", "Misleading rule: writer and painter (L631, the lesson before) end in a t sound and take -er; say 'same sound, remember the spelling' as the teacherScript does");
SE(632, 9, [["A T sound at the end often takes O R.", "O R and E R sound the same, so remember the spelling."]], "A+B",
  "Same misleading t-sound rule (writer, painter take -er); match the teacherScript 'remember the spelling'",
  [["t の おとで おわる ことばは o r に なる ことが おおいよ。", "o r と e r は おなじ おと。つづりで おぼえようね。"]]);
SE(632, 8, [["What's it about, asks what happens. What kind of book, asks the type.", "What's it about? That asks what happens. What kind of book? That asks the type."]],
  "B+C", "Comma between subject and verb ('What's it about, asks...') is ungrammatical and reads like a list aloud");

// L633
SE(633, 4, [["A big paper on the wall.", "A big sheet of paper on the wall."]], "A+B", "'a paper' means a newspaper or an essay; a poster is a big sheet of paper");

// L634
P(634, "teacherScript", [["They all end with a sound like er, or ist.", "Three end with an er sound. Violinist ends with ist."]],
  "B+C", "'They all end with a sound like er, or ist.' is unclear (they don't all sound the same) and the comma breaks the reading");
SE(634, 8, [["One more good thing? Add, too!", "One more good thing? Add too at the end!"]], "B+C",
  "'Add, too!' reads as 'add, also!'; the point is to add the word too (JA さいごに too を つけよう)");

// L635
P(635, "phonics.tipJa", [["t の おとの あとは or が おおい。", "or は er と おなじ おとなので、つづりで おぼえよう。"]],
  "objective (JA)", "Wrong rule: writer in this same list has a t sound and takes -er; follow the L632 fix");
SE(635, 8, [["Why do you like it? Because! Then ask for questions.", "Why do you like it? Use because! Then ask for questions."]], "A+B",
  "'Because!' alone is the child's non-answer ('just because'); say to use because (JA because で りゆう)");

// L636
SE(636, 8, [["But shows a surprise!", "The word but shows a surprise!"]], "B+C", "'But shows a surprise!' sounds like a broken sentence starting with the conjunction; name it as a word");

// L637
SE(637, 8, [["for a not so nice word", "for a not-so-nice word"]], "objective", "Compound adjective before a noun takes hyphens");

// L638
P(638, "teacherScript", [["Use tried to for what a character did.", "Use tried to for what a character wanted to do, but could not."]],
  "objective", "Wrong meaning: tried to is not just 'what a character did'; Lord Grim tried but failed (matches seg8 and JA ぬすもうと した)");
SE(638, 8, [["He tried to steal it, but he didn't!", "He tried to steal it, but he couldn't!"]], "A+B",
  "JA できなかった = couldn't; 'but he couldn't' is what a teacher says about a failed try");
SE(638, 12, [["Oops, he's caught! Run away on tiptoe!", "Oops, Kai sees you! Run away on tiptoe!"]], "A+B",
  "If he is caught he cannot run away, and JA みつかった means 'seen'; the child is playing Lord Grim",
  [["おっと、みつかった！", "おっと、カイに みつかった！"]]);

// L639
P(639, "teacherScript", [["When your friend answers, react! Me too! Really? I like the fox, too!", "When your friend answers, react! Same answer? Me too! Different answer? Really? I like Kai!"]],
  "A+B", "'Really? I like the fox, too!' mixes the two reactions (Really? is for a different answer); use the seg8 pattern");

// L640
P(640, "phonics.tipJa", [["語の家族の まとめ:", "ことばの かぞくの まとめ:"]], "objective (JA)",
  "Kanji 語の家族 in a kids' tip; seg9 subtitleJa and the L636-639 tips say ことばの かぞく / ～の かぞく");

fs.writeFileSync(path.join(DIR, "patches/13-L631-640.json"), "[\n" + out.map((o) => "  " + JSON.stringify(o)).join(",\n") + "\n]\n");
console.log(out.length, "patches");
