// Build patches/11-L791-800.json from the dump using substring replacements.
import fs from "node:fs";
const root = "C:/Users/EMICLE/eigo-quest-night/.run9-w2728/";
const dump = fs.readFileSync(root + "dump/L791-800.txt", "utf8").split(/\r?\n/);
const cur = {};
let lesson = 0;
for (const line of dump) {
  const h = line.match(/^## L(\d+)/);
  if (h) { lesson = +h[1]; cur[lesson] = {}; continue; }
  const m = line.match(/^(\S+) = (".*")$/);
  if (m && lesson) cur[lesson][m[1]] = JSON.parse(m[2]);
}
const out = [];
function p(lesson, path, pairs, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`no path L${lesson} ${path}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`L${lesson} ${path}: missing "${a}"`);
    after = after.replace(a, b);
  }
  out.push({ lesson, path, before, after, reviewers, reason });
}
const S = (n) => `teacher.segments[${n}]`;

// L791
for (const f of ["say", "subtitleEn"])
  p(791, `${S(2)}.${f}`, [["Live. Your home is in a place. I live in a little house. Live!", "I live, you live. Your home is in a place. I live in a little house. I live here!"]], "B+C", f === "say" ? "bare heteronym 'Live.' / 'Live!' may be read as /laɪv/; put the word in a sentence" : "match say");
p(791, `${S(2)}.subtitleJa`, [["live。ある ばしょに いえが ある こと。わたしは ちいさな いえに すんで いるよ。live！", "わたしも あなたも live（すむ）。ある ばしょに いえが ある こと。わたしは ちいさな いえに すんで いるよ。ここに すんで いるの！"]], "B+C", "match EN");
for (const f of ["say", "subtitleEn"])
  p(791, `${S(9)}.${f}`, [["short and soft. Fer. For TEN YEARS.", "short and soft, like fur. For TEN YEARS."]], "B+C", f === "say" ? "invented respelling 'Fer.' (TTS risk); use the real word fur" : "match say");

// L792
for (const f of ["say", "subtitleEn"])
  p(792, `${S(4)}.${f}`, [["Punch, kick, and bow.", "Punch, kick, and bow to your teacher."]], "B+C", f === "say" ? "bare heteronym 'bow' at sentence end (bow/bow); 'bow to your teacher' fixes the verb reading" : "match say");
p(792, `${S(4)}.subtitleJa`, [["そして おじぎ。", "そして せんせいに おじぎ。"]], "B+C", "match EN");
for (const f of ["say", "subtitleEn"])
  p(792, `${S(9)}.${f}`, [["Since is short. Sins.", "Since is short. It rhymes with prince."]], "B+C", f === "say" ? "'Sins' is a z-sound word with an odd meaning for kids; since rhymes with prince" : "match say");
p(792, "teacherScript", [["Kin, der, gar, ten.", "Kin-der-gar-ten."]], "B+C", "syllable spell-out in the hyphen beat form");

// L794
p(794, "teacherScript", [["Ms. Emma points to Monday and says, We've been here since Monday.", "I point to Monday and say, We've been here since Monday."]], "A+B", "Ms. Emma's own narration in the first person (block-wide I say rule)");
for (const f of ["say", "subtitleEn"])
  p(794, `${S(6)}.${f}`, [["Ms. Emma points. Look at the calendar.", "I point and say, Look at the calendar."]], "A+B", f === "say" ? "Ms. Emma's own narration in the first person (block-wide I say rule)" : "match say");
p(794, `${S(6)}.subtitleJa`, [["エマ先生が ゆびさす。「カレンダーを みて。", "わたしが ゆびさして「カレンダーを みて。"]], "A+B", "match EN (わたし)");
for (const f of ["say", "subtitleEn"])
  p(794, `${S(18)}.${f}`, [["A, Since Monday. B, Since Wednesday.", "A, On Monday. B, On Wednesday."]], "A+B", f === "say" ? "'When did Haru start ...?' is answered with 'On ~', not 'Since ~'" : "match say");
p(794, `${S(18)}.subtitleJa`, [["A、げつようびから。B、すいようびから。", "A、げつようび。B、すいようび。"]], "A+B", "match EN");

// L796
p(796, "teacherScript", [
  ["Ms. Emma gives her a water bottle and says, You should drink more water.", "I give her a water bottle and say, You should drink more water."],
  ["Say it short, comf, ta, ble.", "Say it short, Comf-ta-ble."],
  ["Valuable. Value, then able.", "Valuable. Value, drop the e, able."],
], "A+B", "first-person narration (I say rule); hyphen beat form as in seg10; value drops the e (seg10 and tipJa say so)");

// L797
p(797, "conversation.lines[5].en", [["I read my comic book until midnight. Oops.", "I was reading my comic book until midnight. Oops."]], "B+C", "'I read' is a heteronym TTS may read as present; past continuous matches the JA よんで いたんだ");
for (const f of ["say", "subtitleEn"])
  p(797, `${S(7)}.${f}`, [["I read my comic book until midnight.", "I was reading my comic book until midnight."]], "B+C", "match conversation line");
p(797, `${S(7)}.slide.items[1]`, [["I read my comic book until midnight. Oops.", "I was reading my comic book until midnight. Oops."]], "B+C", "match conversation line");

// L798
p(798, "teacherScript", [
  ["Kiko looks at the clock. Riko, you've studied for three hours!", "Kiko looks at the clock and says, Riko, you've studied for three hours!"],
  ["Five, get a good sleep every night.", "Five, sleep well every night."],
], "A+C", "the quote right after narration had no speaker verb (reads as narration); 'get a good sleep' is not idiomatic");

// L799
p(799, "teacherScript", [
  ["has a new advice corner.", "has a new advice column."],
  ["Well done! What should I do? asks for advice.", "Well done! To ask for advice, say, What should I do?"],
  ["Sleep well tonight, everyone!", "Sleep well, everyone!"],
], "A+B", "'corner' for a newspaper section is Japanese English (US: column; lesson title is Advice Column); 'What should I do? asks for advice' is hard to read aloud; drop 'tonight' (assumes the child's time)");
p(799, "conversation.scene", [["Ask Birimo! corner", "Ask Birimo! column"]], "A+B", "US: advice column");
p(799, "conversation.lines[0].en", [["has a new corner.", "has a new column."]], "A+B", "US: advice column (JA コーナー is fine)");
for (const f of ["say", "subtitleEn"])
  p(799, `${S(0)}.${f}`, [["has a new corner.", "has a new column."]], "A+B", "US: advice column");

// L800
for (const f of ["say", "subtitleEn"])
  p(800, `${S(9)}.${f}`, [["Comfortable. Able means can be.", "Comfortable. Say it short, COMF-ta-ble."]], "A+B", f === "say" ? "comfortable does not mean 'can be comforted'; review the stress instead (as in L796)" : "match say");
p(800, `${S(9)}.subtitleJa`, [["comfortable。able は「～できる」。", "comfortable。みじかく COMF-ta-ble と いうよ。"]], "A+B", "match EN");
p(800, "phonics.tipJa", [["comfortable の -able は「～できる」。", "comfortable は COMF-ta-ble と みじかく いう。"]], "A+B", "comfortable is not 'can be ~'; give the stress tip as in L796");

fs.writeFileSync(root + "patches/11-L791-800.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
