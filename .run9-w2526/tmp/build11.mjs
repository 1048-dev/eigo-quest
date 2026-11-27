// Builds .run9-w2526/patches/11-L731-740.json from substring edits on the current world-25.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-25.json"), "utf8"));
const lessonOf = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
const errs = [];
// e(lesson, path, [[old, new], ...], reviewers, reason)
function e(lesson, p, reps, reviewers, reason) {
  const before = get(lessonOf(lesson), p);
  if (typeof before !== "string") { errs.push(`NOPATH L${lesson} ${p}`); return; }
  let after = before;
  for (const [a, b] of reps) {
    if (!after.includes(a)) { errs.push(`NOTFOUND L${lesson} ${p}: ${a}`); return; }
    after = after.split(a).join(b);
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const S = (i, f) => `teacher.segments[${i}].${f}`;
const sayEn = (lesson, i, reps, rv, reason) => { e(lesson, S(i, "say"), reps, rv, reason); e(lesson, S(i, "subtitleEn"), reps, rv, reason); };

// L731: seg10 three-part caps "FIN, ger, print" (TTS may spell FIN; also not "two parts")
sayEn(731, 10, [["FIN, ger, print.", "FINGER, print."]], "B+C", "clap 'two parts': FIN, ger, print -> FINGER, print (TTS may spell out FIN)");
e(731, S(10, "subtitleJa"), [["FIN、ger、print。", "FINGER、print。"]], "B+C", "match EN");

// L732: seg0 "last night" contradicts the script (box empty at six in the evening, gone at about three)
sayEn(732, 0, [["in the cave last night.", "in the cave yesterday."]], "objective", "story logic: crown vanished yesterday afternoon (L732 script, L733 three o'clock), not last night");
e(732, S(0, "subtitleJa"), [["ゆうべ どうくつで", "きのう どうくつで"]], "objective", "match EN");
// L732: seg9 "and no love to join" reads as "no love"
sayEn(732, 9, [["Some, every, and no love to join other words.", "Some, every and no. They love to join other words."]], "B+C", "'and no love to join' is heard as 'no love'; split the sentence");
e(732, S(9, "subtitleJa"), [["some、every、no は ほかの ことばと くっつくのが だいすき。", "some、every、no。ほかの ことばと くっつくのが だいすき。"]], "B+C", "match EN");

// L733: seg5 "At three o'clock, what were you doing then?" doubles the time
sayEn(733, 5, [["At three o'clock, what were you doing then?", "It was three o'clock. What were you doing then?"]], "A+B", "'At three o'clock ... then' says the time twice; unnatural");
e(733, S(5, "subtitleJa"), [["3じ、その とき なにを して いたの？", "3じだったね。その とき なにを して いたの？"]], "A+B", "match EN");
// L733: seg8 "Busy at that time." unclear
sayEn(733, 8, [["Busy at that time.", "You were doing it at that time."]], "A+B", "'Busy at that time' is an unclear fragment; JA already says その とき ～して いた");
// L733: seg10 WA, ter, fall
sayEn(733, 10, [["WA, ter, fall.", "WATER, fall."]], "B+C", "first-part stress as two parts; TTS may spell out WA");
e(733, S(10, "subtitleJa"), [["WA、ter、fall。", "WATER、fall。"]], "B+C", "match EN");

// L734: a bird carries things in its beak
e(734, "teacherScript", [["It had something shiny in its mouth.", "It had something shiny in its beak."], ["What did it have in its mouth?", "What did it have in its beak?"]], "A+B", "a bird holds things in its beak, not its mouth");

// L735: "Ive" will be read as "I've" by TTS
e(735, "teacherScript", [["Creative. Create and ive.", "Creative. Create, drop the e, add i, v, e."]], "B+C", "TTS reads 'ive' as I've; also create loses its e (drop-e rule)");
sayEn(735, 9, [["add ive.", "add i, v, e."]], "B+C", "TTS reads 'ive' as I've; spell the letters");
sayEn(735, 10, [["Ive is short. Ive, ive. Creative!", "The end of creative is short, like give. Cre-a-tive!"]], "B+C", "TTS reads 'Ive' as I've; use the real word give and a beat form");
e(735, S(10, "subtitleJa"), [["ive は みじかい おと。ive、ive。creative！", "creative の おわりは みじかい おと、give みたいに。cre-a-tive！"]], "B+C", "match EN");

// L736: the Riddle Door opens after riddle one (L736 talk, L737 'first door', 'second door')
e(736, "teacherScript", [["Answer three of my riddles, and I will open.", "Answer my riddle, and I will open."]], "objective", "story logic: the door opens after one riddle; riddle two is on a second door (L737)");
// L736: seg9 "Silent, i like eye. Strange, a like day." (TTS reads 'a' as uh; 'i like' as I like)
sayEn(736, 9, [["Silent, i like eye. Strange, a like day. Scared, like hair. Clever, short e, like egg.", "Silent, like eye. Strange, like day. Scared, like hair. Clever, like egg."]], "B+C", "bare letters 'i like eye' / 'a like day' read badly by TTS; use the real-word anchors only");
e(736, S(9, "subtitleJa"), [["silent の i は「アイ」。strange の a は「エイ」。scared は hair と おなじ おと。clever は みじかい「エ」、egg みたいに。", "silent は eye の「アイ」。strange は day の「エイ」。scared は hair と おなじ おと。clever は egg の「エ」。"]], "B+C", "match EN");
// L736: seg17 "Say, It has, then but it can't."
sayEn(736, 17, [["Say, It has, then but it can't.", "Start with It has. Then say, but it can't."]], "A+B", "'Say, It has, then but it can't' is hard to follow");

// L737: second door
e(737, "teacherScript", [["Today, the Riddle Door has a more difficult riddle.", "Today, the second Riddle Door has a more difficult riddle."]], "objective", "story logic: seg0 says the first door opened and this is a second door");
// L737: seg10 caps fragments; GIN read as the drink (soft g)
sayEn(737, 10, [["be, GIN. FIN, ish. QUICK, one short beat. SIM, ple.", "Begin, strong at the end. Finish, strong at the start. Quick, one short beat. Simple, strong at the start."]], "objective", "TTS reads GIN with a soft g (wrong sound) and may spell FIN/SIM; say where the stress is with real words");
e(737, S(10, "subtitleJa"), [["be、GIN。FIN、ish。QUICK は みじかく 1つ。SIM、ple。", "begin は うしろが つよい。finish は まえが つよい。quick は みじかく 1つ。simple は まえが つよい。"]], "objective", "match EN");

// L738: "can you look through the hole? - No, too small for me" contradicts peeking through the tiny hole (TPR) and "I can't fit"
e(738, "conversation.lines[2].en", [["can you look through the hole?", "can you fit through the hole?"]], "A+B", "logic: you can look through a tiny hole; 'too small for me' answers 'fit through'");
e(738, "conversation.lines[2].ja", [["あなから のぞける？", "あなを とおれる？"]], "A+B", "match EN");
sayEn(738, 7, [["can you look through the hole?", "can you fit through the hole?"]], "A+B", "match conversation line");
e(738, S(7, "subtitleJa"), [["あなから のぞける？", "あなを とおれる？"]], "A+B", "match EN");
e(738, S(7, "slide.items[0]"), [["can you look through the hole?", "can you fit through the hole?"]], "A+B", "match conversation line");
// L738: seg9 "oo", "e, NOR, mous" (mous read as mouse)
sayEn(738, 9, [["Huge, oo, like you. Tiny, eye. Giant, eye too. Enormous, strong on NOR. e, NOR, mous!", "Huge, like you. Tiny, like eye. Giant, eye too. Enormous is strong in the middle. E-nor-mous!"]], "B+C", "TTS misreads 'oo', 'NOR' and 'mous' (mouse); use real words and the hyphen beat form");
e(738, S(9, "subtitleJa"), [["huge は「ユー」、you みたいに。tiny は「アイ」。giant も「アイ」。enormous は NOR が つよい。e、NOR、mous！", "huge は you と おなじ「ユー」。tiny は「アイ」。giant も「アイ」。enormous は まんなかが つよい。e-nor-mous！"]], "B+C", "match EN");

// L739: pacing word "Tonight" in Ms. Emma's own narration (L740: "Today is the contest")
e(739, "teacherScript", [["Tonight, there's a riddle contest in the cave, so today,", "There's a riddle contest in the cave soon, so today,"]], "A+B", "pacing word in Ms. Emma's narration; L740 opens with 'Today is the contest'");
// L739: seg10 "a long ar", "LIT, tle", "cor, RECT"
sayEn(739, 10, [["Large, a long ar, like car.", "Large, the same sound as car."], ["LIT, tle.", "Lit-tle."], ["cor, RECT.", "Cor-rect."]], "B+C", "TTS may spell out 'ar', 'LIT', 'RECT' and lowercase 'cor'; use a real word and the hyphen beat form");
e(739, S(10, "subtitleJa"), [["large は ながい「アー」、car みたいに。", "large は car と おなじ「アー」の おと。"], ["LIT、tle。", "lit-tle。"], ["cor、RECT。", "cor-rect。"]], "B+C", "match EN");

// L740: Please + verb from Ms. Emma
e(740, "teacherScript", [["Please listen kindly to every riddle,", "Listen kindly to every riddle,"]], "A+B", "'Please + verb' from teacher to kids sounds cold (style guide)");
// L740: seg7 answers have no speaker
sayEn(740, 7, [["Are you a giant cookie? No, I'm not!", "Are you a giant cookie? Kiko says, No, I'm not!"], ["Are you a clock? Yes, I am!", "Are you a clock? Kiko says, Yes, I am!"]], "A+B+C", "Kiko's answers had no speaker, so they sound like Birimo/Haru answering themselves");
e(740, S(7, "subtitleJa"), [["ハルくん「とけい？」「そう、せいかい！」", "ハルくん「とけい？」 キコちゃん「そう、せいかい！」"]], "A+B+C", "match EN");
// L740: seg10 "Say with me."
sayEn(740, 10, [["Say with me.", "Say them with me."]], "A+B", "'say' needs an object; 'Say them with me' as in the other lessons");

if (errs.length) { console.log(errs.join("\n")); process.exit(1); }
fs.writeFileSync(path.join(ROOT, ".run9-w2526/patches/11-L731-740.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${out.length} patches`);
