// Build patches for L1021-1030 (run9 W35-36 group 10).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  const cur = prev ? prev.after : before;
  if (!cur.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = cur.split(from).join(to);
  if (after === cur) throw new Error(`noop L${lesson} ${p}`);
  if (prev) {
    prev.after = after;
    if (!prev.reason.includes(reason)) prev.reason += "; " + reason;
    if (!prev.reviewers.split(", ").includes(reviewers)) prev.reviewers = prev.reviewers + ", " + reviewers;
    return;
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const ja = (lesson, seg, from, to, reviewers, reason) => P(lesson, `teacher.segments[${seg}].subtitleJa`, from, to, reviewers, reason);
const TS = (lesson, from, to, reviewers, reason) => P(lesson, "teacherScript", from, to, reviewers, reason);

const rIty = "bare 'ity' is not a word and TTS misreads it (itty / I-T-Y); spell the letters as W33 did ('Add t, y')";
const rBle = "bare 'ble' / 'bil' are misread by TTS (bill); spell the letters";

// L1021
both(1021, 9, "Add ity to make a thing word.", "Add i, t, y to make a thing word.", "B+C", rIty);
both(1021, 10, "Make the part before ity strong.", "Make the part before i, t, y strong.", "B+C", rIty);
TS(1021, "Ity makes a noun.", "Adding i, t, y makes a noun.", "B+C", rIty);
TS(1021, "Curious changes ous to os: curiosity.", "Curious changes o, u, s to o, s: curiosity.", "B+C", "bare 'ous' / 'os' are misread by TTS; spell the letters");
TS(1021, "Say the part before ity strongly.", "Say the part before i, t, y strongly.", "B+C", rIty);

// L1022
both(1022, 9, "More ity words.", "More words with i, t, y.", "B+C", rIty);
both(1022, 10, "The beat is strong right before ity.", "The beat is strong right before i, t, y.", "B+C", rIty);
TS(1022, "Today's words end in ity, too.", "Today's words end in i, t, y, too.", "B+C", rIty);
TS(1022, "Say the part before ity strongly.", "Say the part before i, t, y strongly.", "B+C", rIty);

// L1023
ja(1023, 0, "休み時間は 十分だけ！", "休み時間は 10ぷんだけ！", "objective (JA)", "'十分' reads as じゅうぶん (enough), the opposite of the point; the conversation already writes 10ぷん");
ja(1023, 12, "あと 十分！", "あと 10ぷん！", "objective (JA)", "'十分' reads as じゅうぶん (enough); write 10ぷん as tpr[2].ja does");
both(1023, 9, "Able, the ble changes to bil, ability. Possible, ble to bil again, possibility.", "Able, the b, l, e changes to b, i, l, ability. Possible, b, l, e to b, i, l again, possibility.", "B+C", rBle);
both(1023, 10, "Strong right before ity.", "Strong right before i, t, y.", "B+C", rIty);
both(1023, 17, "Make your own idea.", "Share your own idea.", "A+B", "'make an idea' is not natural English; the JA already says いって みよう");
TS(1023, "Active, drop the e, add ity.", "Active, drop the e, add i, t, y.", "B+C", rIty);
TS(1023, "Able changes ble to bil.", "Able changes b, l, e to b, i, l.", "B+C", rBle);
TS(1023, "Possible changes ble to bil, too.", "Possible changes b, l, e to b, i, l, too.", "B+C", rBle);
TS(1023, "Say the part before ity strongly.", "Say the part before i, t, y strongly.", "B+C", rIty);

// L1024
both(1024, 9, "Find the word before ity.", "Find the word before i, t, y.", "B+C", rIty);
both(1024, 9, "Responsible, ble becomes bil, responsibility.", "Responsible, b, l, e becomes b, i, l, responsibility.", "B+C", rBle);
both(1024, 10, "Strong right before ity.", "Strong right before i, t, y.", "B+C", rIty);
TS(1024, "Look at the word before ity.", "Look at the word before i, t, y.", "B+C", rIty);
TS(1024, "Responsible changes ble to bil", "Responsible changes b, l, e to b, i, l", "B+C", rBle);
TS(1024, "Say the part before ity strongly.", "Say the part before i, t, y strongly.", "B+C", rIty);

// L1025
TS(1025, "Then she holds out her left hand and says, On the other hand", "Then I hold out my left hand and say, On the other hand", "objective", "left over from the block-wide I-say swap: 'I hold out my right hand' was followed by 'she holds out her left hand', so 'she' had no clear person");
both(1025, 4, "A not so good point.", "A not-so-good point.", "objective", "compound adjective before a noun takes hyphens");
both(1025, 9, "Let's review ity.", "Let's review i, t, y words.", "B+C", rIty);
both(1025, 9, "Responsible, ble to bil, responsibility.", "Responsible, b, l, e to b, i, l, responsibility.", "B+C", rBle);
both(1025, 10, "Strong right before ity.", "Strong right before i, t, y.", "B+C", rIty);
TS(1025, "Let's review ity words.", "Let's review i, t, y words.", "B+C", rIty);
TS(1025, "Responsible changes ble to bil", "Responsible changes b, l, e to b, i, l", "B+C", rBle);
TS(1025, "Say the part before ity strongly.", "Say the part before i, t, y strongly.", "B+C", rIty);

// L1028
TS(1028, "Let's think about it together. First, I'll tell you three important things.", "Let's think about it together. Then I say, Here are three important things.", "A+C", "after the block-wide swap 'First, I'll tell you' sits inside Olive's speech, so the voice reads it as Olive; 'Then I say,' marks Ms. Emma as the speaker (house style)");
both(1028, 6, "Kiko says calmly, Stop it. That's not kind. Riko stands next to Tom. Are you OK? I'll stay with you.", "Kiko practices and says calmly, Stop it. That's not kind. Riko says, Then I'll stand next to my friend. Are you OK? I'll stay with you.", "objective", "story contradiction: in the picture book Sam says Stop it and stands next to Tom; Kiko and Riko are practicing (conversation lines 1-2), not in the story");
ja(1028, 6, "キコちゃんが おちついて「やめて。それは やさしく ないよ。」 リコちゃんは トムの となりに 立つよ。「だいじょうぶ？ そばに いるからね。」", "キコちゃんが れんしゅう。おちついて「やめて。それは やさしく ないよ。」 リコちゃん「それから 友だちの となりに 立つよ。だいじょうぶ？ そばに いるからね。」", "objective", "JA follows the new EN");
TS(1028, "The internet is networks connected with each other.", "The internet connects computers with each other.", "A+B", "'The internet is networks connected' is ungrammatical; use the seg9 sentence");

// L1029
TS(1029, "A small question can make a big friend.", "A small question can start a big friendship.", "A+B", "'make a big friend' sounds like a large friend; the poster means a small question can start a friendship");
TS(1029, "A costar is a star of a movie together with another star.", "A costar acts in a movie together with another star.", "A+B", "'a star of a movie together with' is clumsy; match seg10 'acts in a movie with another star'");

// L1030
both(1030, 10, "Able, ble becomes bil, plus ity.", "Able, b, l, e becomes b, i, l, plus i, t, y.", "B+C", "bare 'ble' / 'bil' / 'ity' are misread by TTS; spell the letters");
TS(1030, "Able changes ble to bil and adds ity.", "Able changes b, l, e to b, i, l and adds i, t, y.", "B+C", "bare 'ble' / 'bil' / 'ity' are misread by TTS; spell the letters");

const dest = path.join(REPO, ".run9-w3536/patches/10-L1021-1030.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
