// Build patches for L1001-1010 (run9 W33-34 group 14).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds([33, 34]);
const out = [];
const pending = new Map(); // key lesson|path -> patch (merge several replaces into one field)
function P(lesson, p, from, to, reviewers, reason) {
  const key = `${lesson}|${p}`;
  let rec = pending.get(key);
  if (!rec) {
    const before = getAt(lessonOf(W, lesson), p);
    if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
    rec = { lesson, path: p, before, after: before, reviewers, reason };
    pending.set(key, rec);
    out.push(rec);
  } else {
    rec.reason += "; " + reason;
    if (rec.reviewers !== reviewers) rec.reviewers = rec.reviewers.startsWith("objective") ? rec.reviewers : reviewers;
  }
  if (!rec.after.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  rec.after = rec.after.split(from).join(to);
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};

// L1001: this lesson is 1001; "Last time, we landed... Lesson one thousand!" reads as if today is lesson 1000
const r1001 = "lesson 1000 was last time; 'Lesson one thousand!' right after 'Last time' sounds like today is lesson 1000 (this is L1001)";
both(1001, 0, "Last time, we landed in Brightwater. Lesson one thousand!", "Last time, we landed in Brightwater. That was lesson one thousand!", "A+B", r1001);
P(1001, "teacher.segments[0].subtitleJa", "まえの かいは、ブライトウォーターに ついたね。1000かいめの レッスン！", "まえの かいは、ブライトウォーターに ついたね。あれが 1000かいめの レッスン だったね！", "A+B", "JA follows the new EN");

// L1002: "Yes, I mind." is not natural English; the real (wrong) answer is "Yes, I do."
const r1002 = "'Yes, I mind.' is not something English speakers say; the natural trap answer to 'Would you mind ~?' is 'Yes, I do.' (= I don't want to)";
both(1002, 17, "A, Yes, I mind. B, Not at all.", "A, Yes, I do. B, Not at all.", "A+B", r1002);
P(1002, "teacher.segments[17].subtitleJa", "A、Yes, I mind. B、Not at all.", "A、Yes, I do. B、Not at all.", "A+B", r1002);

// L1004: the restaurant is the "River Fish Restaurant" and they eat LUNCH there in L1011-1012 ("Mr. Lee recommended it")
const r1004 = "story contradiction: L1012 visits the same place Mr. Lee recommended as the 'River Fish Restaurant' and eats lunch there; L1004 called it 'the Little Anchor', open only 5-9 pm";
P(1004, "teacherScript", "Then how about the Little Anchor? It's a fish restaurant by the river.", "Then how about the River Fish Restaurant? It's right by the river.", "objective", r1004);
P(1004, "teacherScript", "\"The Little Anchor. This small family restaurant", "\"River Fish Restaurant. This small family restaurant", "objective", r1004);
P(1004, "teacherScript", "It is open from five to nine in the evening.", "It is open from eleven in the morning to nine at night.", "objective", r1004);
P(1004, "teacherScript", "What time does it open? At five in the evening.", "What time does it open? At eleven in the morning.", "objective", r1004);
both(1004, 10, "It means give an idea.", "It means to give an idea.", "A+B", "'It means give an idea' drops 'to' (the teacherScript says 'To suggest means to give an idea')");
P(1004, "phonics.sounds[2]", "/ɡ/", "/ɡdʒ/", "objective (fact)", "in suggest the gg is not one /g/ sound: US /səɡˈdʒɛst/ (or /səˈdʒɛst/); the lesson only teaches the spelling, so the sound field should not claim /g/");

// L1005
const r1005 = "'Here you are, a yellow one. Of course, please bring it back' puts 'Of course' after the umbrella is handed over (the request was two lines before); move 'Of course.' to the front";
P(1005, "conversation.lines[4].en", "Here you are, a yellow one. Of course, please bring it back before you check out.", "Of course. Here you are, a yellow one. Please bring it back before you check out.", "A+B", r1005);
P(1005, "conversation.lines[4].ja", "はい どうぞ、きいろの かさです。", "もちろんです。はい どうぞ、きいろの かさです。", "A+B", "JA follows the new EN");
P(1005, "teacher.segments[7].slide.items[2]", "Here you are, a yellow one. Of course, please bring it back before you check out.", "Of course. Here you are, a yellow one. Please bring it back before you check out.", "A+B", "slide shows the conversation line");
const rBeat = "capital syllable plus a bare letter group ('FOR, ty') can be spelled out by TTS; use the hyphen beat form";
both(1005, 10, "FOR, ty, one.", "FOR-ty-one.", "B+C", rBeat);
P(1005, "teacher.segments[10].subtitleJa", "FOR、ty、one。", "FOR-ty-one。", "B+C", rBeat);

// L1007-1008: "repair man" -> "repair person" (US spelling is one word 'repairman'; L1007 teaches the vocab word 'repair person')
const rRep = "'repair man' is not a US spelling (repairman is one word); use L1007's vocab word 'repair person'";
P(1007, "teacherScript", "Soon, Sam the repair man arrives with his toolbox.", "Soon, Sam the repair person arrives with his toolbox.", "objective", rRep);
P(1008, "conversation.lines[0].en", "I'm playing Sam, the repair man!", "I'm playing Sam, the repair person!", "objective", rRep);
both(1008, 0, "Sam, the repair man, looked and looked.", "Sam, the repair person, looked and looked.", "objective", rRep);

// L1010
both(1010, 10, "THIR, ty.", "THIR-ty.", "B+C", rBeat);
P(1010, "teacher.segments[10].subtitleJa", "THIR、ty。", "THIR-ty。", "B+C", rBeat);

const dest = path.join(REPO, ".run9-w3334/patches/14-L1001-1010.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
