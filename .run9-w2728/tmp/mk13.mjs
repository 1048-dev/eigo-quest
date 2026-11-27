// Builds patches/13-L811-820.json from substring replacements on the current dump.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const dump = fs.readFileSync(path.join(ROOT, "dump/L811-820.txt"), "utf8").split(/\r?\n/);
const cur = new Map();
let lesson = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { lesson = Number(m[1]); continue; }
  const k = line.match(/^(\S+) = (".*")$/);
  if (k && lesson) cur.set(`${lesson}|${k[1]}`, JSON.parse(k[2]));
}
const out = [];
const P = (lessonNo, p, from, to, reviewers, reason) => {
  const before = cur.get(`${lessonNo}|${p}`);
  if (before === undefined) throw new Error(`no path L${lessonNo} ${p}`);
  const prev = out.find((x) => x.lesson === lessonNo && x.path === p);
  const base = prev ? prev.after : before;
  if (!base.includes(from)) throw new Error(`not found L${lessonNo} ${p}: ${from}`);
  const after = base.split(from).join(to);
  if (prev) { prev.after = after; prev.reason += "; " + reason; return; }
  out.push({ lesson: lessonNo, path: p, before, after, reviewers, reason });
};
const S = (n) => `teacher.segments[${n}]`;

// L811
P(811, `${S(7)}.subtitleJa`, "エマせんせい「", "わたし「", "objective (JA)", "EN says 'I say' (Ms. Emma narrates herself); JA still named エマせんせい");

// L812
P(812, `${S(7)}.say`, "Ms. Emma smiles. Every family", "I smile and say, Every family", "A+B", "Ms. Emma narrates herself in the third person; block-wide style is 'I ...'");
P(812, `${S(7)}.subtitleEn`, "Ms. Emma smiles. Every family", "I smile and say, Every family", "A+B", "match say");
P(812, `${S(7)}.subtitleJa`, "エマせんせいは にっこり。", "わたしは にっこり。", "A+B", "match EN (I smile)");
for (const f of ["say", "subtitleEn"]) P(812, `${S(8)}.${f}`, "In Japan, we, is for many people in Japan. In my family, we, is for your home.", "In Japan, we means many people in Japan. In my family, we means the people in your home.", "A+C", f === "say" ? "'In Japan, we, is for ...' sounds like a grammar slip when read aloud; plain 'means'" : "match say");
P(812, `${S(8)}.subtitleJa`, "じぶんの いえの こと。", "じぶんの いえの ひとの こと。", "A+C", "match EN (the people in your home)");
for (const f of ["say", "subtitleEn"]) P(812, `${S(13)}.${f}`, "Line up!", "Line them up!", "A+B", f === "say" ? "'Line up!' tells the kids to stand in a line; the command is to line up the shoes" : "match say");

// L813
for (const f of ["say", "subtitleEn"]) P(813, `${S(4)}.${f}`, "Uniform. Clothes that everyone at a school wears.", "Uniform. Everyone at a school wears the same clothes.", "A+B", f === "say" ? "relative-clause definition (Stage 4 grammar) -> plain sentence, as done block-wide" : "match say");
P(813, `${S(4)}.subtitleJa`, "がっこうの みんなが きる ふく。", "がっこうの みんなが おなじ ふくを きるよ。", "A+B", "match EN");
P(813, "teacherScript", "Idea. i-DE-a. Not ai-de-a.", "Idea. i-DE-a. Not a-i-de-a.", "objective", "English idea does start with the 'ai' sound; the contrast is the four flat katakana beats a-i-de-a (like e-ne-ru-gi, ka-me-ra)");

// L814
P(814, `${S(7)}.subtitleJa`, "エマせんせい「", "わたし「", "objective (JA)", "EN says 'I say'; JA still named エマせんせい");
for (const f of ["say", "subtitleEn"]) P(814, `${S(18)}.${f}`, "Your friend eats with hands.", "Your friend eats with their hands.", "A+B", f === "say" ? "missing possessive; 'eats with their hands' (matches the core 'with my hands')" : "match say");

// L815
for (const f of ["say", "subtitleEn"]) P(815, `${S(12)}.${f}`, "Now count the colors with your fingers. One, two, three!", "Now count the colors with your fingers. Seven colors in all. One, two, three, four, five, six, seven!", "A+B", f === "say" ? "only one color is back, so counting to three fits nothing; count the seven rainbow colors (teacherScript: Six more to go)" : "match say");
P(815, `${S(12)}.subtitleJa`, "ゆびで いろを かぞえて。いち、に、さん！", "ゆびで いろを かぞえて。ぜんぶで 7いろ。いち、に、さん、し、ご、ろく、なな！", "A+B", "match EN");

// L816
for (const f of ["say", "subtitleEn"]) P(816, `${S(7)}.${f}`, "Ms. Emma laughs. Birimo,", "I laugh and say, Birimo,", "A+B", f === "say" ? "Ms. Emma narrates herself in the third person; block-wide style is 'I ...'" : "match say");
P(816, `${S(7)}.subtitleJa`, "エマせんせいは わらって「", "わたしは わらって「", "A+B", "match EN");
for (const f of ["say", "subtitleEn"]) P(816, `${S(17)}.${f}`, "For example, Bento is a kind of lunch box!", "For example, Miso soup is a kind of soup!", "A+B", f === "say" ? "a bento is a boxed meal, not a kind of lunch box (US lunch box = the container); use miso soup from the food card" : "match say");
P(816, `${S(17)}.subtitleJa`, "たとえば「おべんとうは おひるごはんの はこの いっしゅだよ！」", "たとえば「みそしるは スープの いっしゅだよ！」", "A+B", "match EN");
P(816, "teacherScript", "Bento. It's a lunch box.", "Bento. It's a boxed lunch.", "A+B", "in US English a lunch box is the container; a bento is the boxed meal");

// L817
for (const f of ["say", "subtitleEn"]) P(817, `${S(0)}.${f}`, "Look what Riko brought.", "Look what Kiko brought.", "objective", f === "say" ? "story contradiction: the furoshiki is Kiko's (teacherScript, conversation 'Kiko made a bag')" : "match say");
P(817, `${S(0)}.subtitleJa`, "リコちゃんが もって きた", "キコちゃんが もって きた", "objective", "match EN");
for (const f of ["say", "subtitleEn"]) P(817, `${S(7)}.${f}`, "Ms. Emma laughs. You're too big", "I laugh and say, You're too big", "A+B", f === "say" ? "Ms. Emma narrates herself in the third person; block-wide style is 'I ...'" : "match say");
P(817, `${S(7)}.subtitleJa`, "エマせんせいは わらって「", "わたしは わらって「", "A+B", "match EN");

// L818
for (const f of ["say", "subtitleEn", "subtitleJa"]) P(818, `${S(9)}.${f}`, "ka-ra-O-ke", "carry-O-key", "B+C", f === "say" ? "ka-ra-O-ke is the Japanese reading and TTS will say 'O-ke' as okay; US is carry-OH-key (tipJa キャリオウキ); real-word beat form" : "match say");
P(818, "teacherScript", "In English, people say ka-ri-O-ki.", "In English, people say carry-O-key.", "B+C", "same respelling fix as seg9; real-word beats instead of invented ka-ri-O-ki");

// L819
for (const f of ["say", "subtitleEn"]) P(819, `${S(3)}.${f}`, "River. Long water that flows to the sea.", "River. A long line of water. It flows to the sea.", "A+B", f === "say" ? "'Long water' is not natural English, and the relative clause is above level" : "match say");
P(819, `${S(3)}.subtitleJa`, "うみへ ながれて いく ながい みず。", "ながい みずの ながれ。うみへ ながれて いくよ。", "A+B", "match EN");

fs.writeFileSync(path.join(ROOT, "patches/13-L811-820.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
