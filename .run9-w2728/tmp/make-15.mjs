// Build patches/15-L831-840.json from the dump (exact before values).
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const dump = fs.readFileSync(path.join(root, "dump/L831-840.txt"), "utf8").split(/\r?\n/);
const cur = new Map();
let lesson = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { lesson = Number(m[1]); continue; }
  const k = line.match(/^(\S+) = (".*")$/);
  if (k && lesson) cur.set(`${lesson}|${k[1]}`, JSON.parse(k[2]));
}
const out = [];
/** p(lesson, path, fn or [from,to] replacements, reviewers, reason) */
function p(n, pth, edits, reviewers, reason) {
  const before = cur.get(`${n}|${pth}`);
  if (before === undefined) throw new Error(`no ${n} ${pth}`);
  let after = before;
  if (typeof edits === "string") after = edits;
  else for (const [a, b] of edits) { if (!after.includes(a)) throw new Error(`L${n} ${pth}: '${a}' not found`); after = after.split(a).join(b); }
  out.push({ lesson: n, path: pth, before, after, reviewers, reason });
}
const S = (i, f) => `teacher.segments[${i}].${f}`;
const both = (n, i, edits, r, why) => { p(n, S(i, "say"), edits, r, why); p(n, S(i, "subtitleEn"), edits, r, "match say"); };

// L831
both(831, 18, [["Which word means not usual, new and surprising?", "Which word means not usual, or surprising?"]], "A+B", "'not usual, new and surprising' reads as if 'not' covers all three; unusual does not mean new");
both(831, 19, [["Birimo's food was unusual and delicious.", "Birimo said the food was unusual and delicious."]], "A+B", "'Birimo's food' sounds like Birimo cooked it; he said the village food was unusual");
p(831, S(19, "subtitleJa"), [["ビリモの たべものは めずらしくて おいしかったね。", "ビリモは たべものが めずらしくて おいしかったって いってたね。"]], "A+B", "match EN");
p(831, "phonics.tipJa", [["かさなって", "ならんで"]], "objective (JA)", "かさなる (overlap) suggests one n; the two n's stand side by side");

// L832
both(832, 18, [["Birimo was very A, peaceful, or B, helpful?", "Was Birimo A, peaceful, or B, helpful?"]], "A+C", "'Birimo was very A, ...' is an awkward statement-question; plain question reads better");
p(832, S(18, "subtitleJa"), [["ビリモは とても A、", "ビリモは A、"]], "A+C", "match EN");
both(832, 20, [["Now you can say what you can do now.", "Now you can tell me what you can do."]], "A+C", "'now ... now' in one sentence is clumsy to hear and say");

// L834
p(834, "teacherScript", [["Ms. Emma gives her some tips.", "I give her some tips."]], "A+B", "Ms. Emma narrates as I in the same script ('Then I say'); third person here is inconsistent");
both(834, 13, [["Smile! Bow! Stand up straight! Breathe! Smile! Bow!", "Smile! Take a bow! Stand up straight! Breathe! Smile! Take a bow!"]], "B+C", "bare 'Bow!' is a heteronym (bow/bough vs bow ribbon); 'Take a bow' is read correctly and is a natural cue");

// L835
both(835, 8, [["I loved is a big, happy like.", "I loved means I liked it a lot."]], "A+B+C", "'a big, happy like' is not natural English and hard to say");
both(835, 9, [["Meet you sounds like meechu. Nice to meechu!", "Meet you sounds like mee-chu. Nice to mee-chu!"]], "B+C", "invented respelling 'meechu' -> hyphen beat form");
p(835, S(18, "slide.items[0]"), "Welcome to the friendship festival!", "A+B", "slide showed vocab (festival/program), not the two quiz choices");
p(835, S(18, "slide.items[1]"), "I loved Aino's dance. Look! The bridge is shining blue now.", "A+B", "slide showed vocab (festival/program), not the two quiz choices");

// L836
p(836, "teacherScript", [
  ["I was surprised to hear you start school at seven!", "I was surprised to hear you start school at age seven!"],
  ["When does Aino start school? At seven.", "When do children in Finland start school? At age seven."],
], "A+B", "'start school at seven' reads as 7 o'clock (the next lesson asks What time does school start); Finnish children start school at age seven");
both(836, 4, [["The paper bag for your letter.", "A paper pocket for your letter."]], "A+B", "a 'paper bag' is a different object (lunch bag)");
both(836, 9, [["Could you sounds like coodju.", "Could you sounds like could-ju."]], "B+C", "invented respelling 'coodju' -> hyphen beat form used in the teacherScript (Could-ju)");

// L838
both(838, 0, [["Good day, everyone!", "Hello, everyone!"]], "A+B", "'Good day' is British/Australian and formal; JA already こんにちは");
p(838, "teacherScript", [["an introduction of Japan", "an introduction to Japan"]], "A+B", "'introduction to' is the natural preposition");
p(838, "conversation.scene", [["an introduction of Japan", "an introduction to Japan"]], "A+B", "same as teacherScript");
both(838, 13, [["Writing up!", "Hold it up!"]], "A+C", "'Writing up!' is not a natural cue");
p(838, S(13, "subtitleJa"), [["かいた もの！", "もちあげて！"]], "A+C", "match EN");

// L839
p(839, "conversation.lines[1].ja", [["おいわいする ときに つかうんだ。", "おいわいする ために たべるんだ。"]], "objective (JA)", "EN says eat it to celebrate; JA said use it when (matches seg6 JA now)");
both(839, 9, [["All over sounds like aw-lover.", "All over sounds like aw-lo-ver."]], "B+C", "'aw-lover' puts the word 'lover' in a kids' line; hyphen beat form instead");

// L840
both(840, 9, [["Karaoke, ka-ra-O-ke.", "Karaoke, kar-ee-OH-kee."]], "objective", "ka-ra-O-ke is the Japanese way; English says kar-ee-OH-kee (w28Phonics en キャリオウキ)");
p(840, S(9, "subtitleJa"), [["karaoke は ka-ra-O-ke。", "karaoke は kar-ee-OH-kee。"]], "objective", "match EN");

fs.writeFileSync(path.join(root, "patches/15-L831-840.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
