// Builds .run9-w2930/patches/14-L881-890.json from the current world-30 file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const w30 = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-30.json"), "utf8"));
const lesson = (n) => w30.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);
const out = [];
function P(n, p, pairs, reviewers, reason) {
  const before = get(lesson(n), p);
  if (typeof before !== "string") throw new Error(`no path L${n} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`L${n} ${p}: not found ${a}`);
    after = after.split(a).join(b);
  }
  out.push({ lesson: n, path: p, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
// comma-split syllables -> hyphen beat form (say, subtitleEn with ", " and subtitleJa with "、")
function beats(n, i, words) {
  const en = words.map((w) => [w.split("-").join(", ") + ".", w + "."]);
  const ja = words.map((w) => [w.split("-").join("、") + "。", w + "。"]);
  const r = "B+C";
  const why = "comma-split syllables read as separate words and bare parts like 'ic,' 'sci,' are TTS risks; use the hyphen beat form, as in the app's quiz choices";
  P(n, seg(i, "say"), en, r, why);
  P(n, seg(i, "subtitleEn"), en, r, "match say");
  P(n, seg(i, "subtitleJa"), ja, r, "match the hyphen beat form");
}
beats(881, 9, ["e-LEC-tric", "ro-BOT-ic"]);
beats(881, 10, ["sci-en-TIF-ic", "fan-TAS-tic"]);
beats(882, 10, ["mag-NET-ic", "e-lec-TRON-ic"]);
beats(882, 11, ["en-er-GET-ic", "fu-tur-IS-tic"]);
beats(883, 9, ["ar-TIS-tic", "ath-LET-ic"]);
beats(883, 10, ["dra-MAT-ic", "ter-RIF-ic"]);
beats(884, 10, ["re-al-IS-tic", "his-TOR-ic"]);
beats(884, 11, ["or-GAN-ic", "vol-CAN-ic"]);
beats(890, 9, ["ro-BOT-ic"]);

// L882
P(882, "teacherScript", [["Futuristic. IS is strong.", "Futuristic. fu-tur-IS-tic."]], "B+C",
  "'IS is strong' is read 'is is strong', confusing to say and to hear; use the hyphen beat form");
for (const f of ["say", "subtitleEn"]) {
  P(882, seg(1, f), [["Explain your idea with that.", "Explain your idea with the word that."]], "B+C",
    f === "say" ? "'with that' sounds like 'using that thing'; name the word" : "match say");
  P(882, seg(21, f), [["share an idea with that,", "share an idea with the word that,"]], "B+C",
    f === "say" ? "'with that' sounds like 'using that thing'; name the word" : "match say");
}

// L884: Tess said 'we changed the design' before the change happened
P(884, "teacherScript", [[
  "She says, Mistakes help me learn. It didn't work well, so we changed the design. Say it with me. It didn't work well, so we changed the design. Excellent! We turn off the camera and put on bigger wheels. Then we say, Let's try again. This time, it worked!",
  "She says, Mistakes help me learn. We turn off the camera and put on bigger wheels. Tess says, It didn't work well, so we changed the design. Say it with me. It didn't work well, so we changed the design. Excellent! Then we say, Let's try again. Mr. Shell walks up the hill, and the bag follows him all the way. This time, it worked!",
]], "A+B", "story order: 'we changed the design' was said before the change, and 'This time, it worked!' came with no second test; reorder and add the test");

// L885
P(885, "teacherScript", [["The judges are Nova, Tess, and Mr. Shell.", "The judges are Nova and Ms. Lin."]], "A+B",
  "Mr. Shell walks in our demo and Tess helped build the bag, so they cannot judge it; Ms. Lin is in the W30 cast");
P(885, seg(3, "subtitleJa"), [["よく きいて、かつ ひとを えらぶ ひと。", "よく きいて、だれが かちかを きめる ひと。"]], "objective (JA)",
  "'かつ ひと' reads as 'and also person'; say who wins clearly");
P(885, seg(14, "say"), [["Pass up!", "Hold it up!"]], "A+B", "'Pass up' means to say no to something; use a clear command");
P(885, seg(14, "subtitleEn"), [["Pass up!", "Hold it up!"]], "A+B", "match say");

// L887
for (const f of ["say", "subtitleEn"]) {
  P(887, seg(1, f), [["Say the good side and the careful side.", "Say a good point and something to be careful about."]], "A+B",
    f === "say" ? "'the careful side' is not natural English" : "match say");
  P(887, seg(9, f), [["That's the careful side.", "That's something to be careful about."]], "A+B",
    f === "say" ? "'the careful side' is not natural English" : "match say");
}

// L888
for (const f of ["say", "subtitleEn"])
  P(888, seg(9, f), [["Once you post, many people can see it,", "Once you post something, many people can see it,"]], "A+B",
    f === "say" ? "'it' had no noun to point to; matches the Kids Board rule" : "match say");

// L890
P(890, "teacherScript", [
  ["Riko is the chair.", "Riko leads the talk."],
  ["I think playing outside is more fun than robots.", "I think playing outside is more fun than playing with robots."],
], "A+B", "'the chair' reads as a seat for kids; compare playing with playing");
for (const f of ["say", "subtitleEn"])
  P(890, seg(6, f), [["Riko is the chair.", "Riko leads the talk."]], "A+B", f === "say" ? "'the chair' reads as a seat for kids (JA しかい)" : "match say");
const birA = "I think playing outside is more fun than robots!";
const birB = "I think playing outside is more fun than playing with robots!";
P(890, "conversation.lines[3].en", [[birA, birB]], "A+B", "compare an activity with an activity");
P(890, "conversation.lines[3].ja", [["ぼくは ロボットより そとで", "ぼくは ロボットで あそぶより そとで"]], "A+B", "match the English");
for (const f of ["say", "subtitleEn"]) P(890, seg(7, f), [[birA, birB]], "A+B", "match conversation line 3");
P(890, seg(7, "subtitleJa"), [["ぼくは ロボットより そとで", "ぼくは ロボットで あそぶより そとで"]], "A+B", "match the English");
P(890, "teacher.segments[7].slide.items[1]", [[birA, birB]], "A+B", "slide shows conversation line 3");
P(890, seg(13, "say"), [["Pass up!", "Hold it up!"]], "A+B", "'Pass up' means to say no to something; use a clear command");
P(890, seg(13, "subtitleEn"), [["Pass up!", "Hold it up!"]], "A+B", "match say");

// merge same-field patches (none expected, but be safe)
const seen = new Set();
for (const p of out) { const k = p.lesson + " " + p.path; if (seen.has(k)) throw new Error("dup " + k); seen.add(k); }
fs.writeFileSync(path.join(ROOT, ".run9-w2930/patches/14-L881-890.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
