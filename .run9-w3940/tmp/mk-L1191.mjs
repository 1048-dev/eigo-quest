// Build patches for L1191-1200 (run9 W39-40 group 15).
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

const rSays = "the quote has no 'says', so the voice reads the character's words as my own";
const rJa = "JA follows the new EN";
const rEr = "bare 'er' / 'ar' is read by TTS as a hesitation sound or letters; use a real word with the same sound (her, car)";
const rLetters = "bare letter group may be misread by TTS as a word ('ay' = aye, 'Im' = I'm, 'ir' / 'er'); spell the letters";

// L1191
both(1191, 4, "A glass pot with a lid on top.", "A glass container with a lid on top.", "A+B", "a 'pot' is for cooking in US English; a jar is a glass container");
both(1191, 7, "That means, if you were not here, I couldn't do it!", "That means, I did it because you were there to help!", "A+B", "'if you were not here, I couldn't do it' is present/imagined time, not the past meaning of couldn't have done it; restate the meaning simply without a new conditional form");
ja(1191, 7, "つまり「あなたが いなかったら できなかった！」と いう いみ。", "つまり「あなたが いて くれたから できた！」と いう いみ。", "A+B", rJa);
both(1191, 9, "Read has R. Lead has L.", "Read has R. Lead, as in lead the way, has L.", "B+C", "'lead' is a heteronym (led / leed); the minimal pair with read needs /liːd/, so give the verb context");
TS(1191, "Read starts with R, too, but lead starts with L.", "Read starts with R, too, but lead, as in lead the way, starts with L.", "B+C", "'lead' is a heteronym (led / leed); give the verb context (same as seg9)");

// L1192
both(1192, 0, "Today's story is a little funny for me, because it's about me!", "Today's story makes me a little shy, because it's about me!", "A+B", "'a little funny for me' does not mean embarrassed and does not match JA てれくさい");
both(1192, 5, "Tear. A drop of water from your eye.", "Tear, as in teardrop. A drop of water from your eye.", "B+C", "'tear' is a heteronym (tare / tier); the word alone may be read as 'tare'; 'teardrop' fixes the sound for TTS and learners");
both(1192, 6, "can you keep her busy? Leave it to me!", "can you keep her busy? Birimo says, Leave it to me!", "A+C", rSays + " (Birimo's answer)");
ja(1192, 6, "くれる？」「まかせて！」", "くれる？」 ビリモ「まかせて！」", "A+C", rJa);
both(1192, 7, "Birimo holds a spoon like a microphone. Breaking news!", "Birimo holds a spoon like a microphone and says, Breaking news!", "A+C", rSays);
both(1192, 9, "Then, Surprise, Ms. Emma!", "Then everyone shouts, Surprise, Ms. Emma!", "A+C", "no speaker: the voice (me) says 'Surprise, Ms. Emma!' to myself");
ja(1192, 9, "そして「サプライズ、エマ先生！」", "そして みんなが「サプライズ、エマ先生！」", "A+C", rJa);
TS(1192, "When Birimo runs out of questions, we all shout, Surprise!", "When Birimo runs out of questions, everyone jumps out and shouts, Surprise!", "objective", "story: in my first-person narration 'we all shout, Surprise!' has me surprising myself; the children jump out (TPR Jump out and say, Surprise!)");

// L1193
both(1193, 6, "Kiko's eyes go wide. Me? Wait, really?", "Kiko's eyes go wide, and she says, Me? Wait, really?", "A+C", rSays);

// L1194
both(1194, 6, "Kiko begins, but she reads very fast. Oh no,", "Kiko begins, but she reads very fast. Then she sighs, Oh no,", "A+C", rSays);
ja(1194, 6, "読んで しまうの。「あっ、", "読んで しまうの。そして ためいき。「あっ、", "A+C", rJa);
both(1194, 8, "Kiko tries again. How was that?", "Kiko tries again and asks, How was that?", "A+C", rSays);
both(1194, 9, "World. Say er, then add L.", "World. Say the sound in her, then add L.", "B+C", rEr);
both(1194, 9, "Work has er.", "Work has the sound in her.", "B+C", rEr);
both(1194, 10, "Heard has er, too. Heard. Hard has ar, so", "Heard starts like her. Heard. Hard has the sound in car, so", "B+C", rEr);

// L1195
ja(1195, 0, "セレストが やさしく なって、", "セレストが やさしく チリンと ひびいて、", "objective (JA)", "'やさしく なって' reads as 'became kind', not 'rings softly'");
both(1195, 6, "Haru gasps. Wait, really?", "Haru gasps and says, Wait, really?", "A+C", rSays);
both(1195, 9, "Birimo thinks. I love this star,", "Birimo thinks, then says, I love this star,", "A+C", rSays);
both(1195, 10, "World. Say er, then L.", "World. Say the sound in her, then L.", "B+C", rEr);

// L1196
both(1196, 8, "What happened at the end? She sailed", "What happened at the end? Riko says, She sailed", "A+C", rSays + " (Riko's answer)");
ja(1196, 8, "「おしゃべりする 鳥で いっぱいの しまへ こうかい したの！」", "リコちゃん「おしゃべりする 鳥で いっぱいの しまへ ふねで いったの！」", "A+C, objective (JA)", "JA follows the new EN; hiragana こうかい した reads as 'regretted' (後悔); ふねで いった as in expressions[2].ja");
both(1196, 10, "Play ends with ay.", "Play ends with a, y.", "B+C", rLetters);
TS(1196, "Play ends with ay.", "Play ends with a, y.", "B+C", rLetters);

// L1197
TS(1197, "begins with the oldest words in storytelling.", "begins with the most famous words in storytelling.", "A+B", "'Once upon a time' is not the oldest words in storytelling; 'most famous' is true");
both(1197, 6, "Riko jumps up. Me, please!", "Riko jumps up and says, Me, please!", "A+C", rSays);
both(1197, 6, "found the map? Good point!", "found the map? Riko says, Good point!", "A+C", rSays + " (Riko's reply)");
ja(1197, 6, "「たしかに！", "リコちゃん「たしかに！", "A+C", rJa);
both(1197, 7, "Haru adds the middle. The hard parts,", "Haru adds the middle and says, The hard parts,", "A+C", rSays + " ('when I kept saying goed' sounded like me)");
both(1197, 9, "Kindness is kind plus ness,", "Kindness is kind plus n, e, s, s,", "B+C", "bare 'ness' read as a word (Ness); spell the letters");
TS(1197, "Kindness is kind plus ness,", "Kindness is kind plus n, e, s, s,", "B+C", "bare 'ness' read as a word (Ness); spell the letters");
both(1197, 10, "And she, round your lips.", "And for she, round your lips.", "A+C", "'And she, round your lips' reads as if 'she' is the subject");

// L1198
TS(1198, "I met Priya, who lives on another continent.", "I met Priya, who lives far away.", "objective (fact)", "Priya speaks for Asia; Riko (a Japanese child) is from Asia too, so 'another continent' may be false; 'far away' is safe");
TS(1198, "Shirt has ir, which sounds the same as er and ur. Impossible is im plus possible, and im means not before a p.", "Shirt has i, r, which sounds the same as e, r and u, r. Impossible is i, m plus possible, and i, m means not before a p.", "B+C", rLetters);
both(1198, 6, "Riko stands tall. I believe", "Riko stands tall and says, I believe", "A+C", rSays);
both(1198, 7, "Sure. At the Round Table,", "Riko says, Sure. At the Round Table,", "A+C", rSays);
ja(1198, 7, "「もちろん。まるいテーブルで、", "リコちゃん「もちろん。円卓で、", "A+C, objective (JA)", "JA follows the new EN; the Round Table is the name 円卓 (as in conversation line 3)");
both(1198, 8, "Birimo stands up. I believe", "Birimo stands up and says, I believe", "A+C", rSays);
both(1198, 8, "Why do you think so? Because", "Why do you think so? Birimo says, Because", "A+C", rSays + " (Birimo's answer)");
ja(1198, 8, "「たべものを わけあうと", "ビリモ「たべものを わけあうと", "A+C", rJa);
both(1198, 9, "Shirt has ir. It sounds the same as er and ur. Impossible. Im means not, and we use im before a p.", "Shirt has i, r. It sounds the same as e, r and u, r. Impossible. I, m means not, and we use i, m before a p.", "B+C", rLetters);

// L1199
both(1199, 7, "Birimo yawns. I said, I'm sleepy.", "Birimo yawns and says, I remember! I said, I'm sleepy.", "A+C", rSays);
ja(1199, 7, "ビリモが あくび。「ぼく、", "ビリモが あくび。「おぼえてる！ ぼく、", "A+C", rJa);
both(1199, 10, "Make FU strong, then pause.", "Make the start of future strong, then pause.", "A+C", "'FU' alone may be read by TTS as letters F, U, a rude abbreviation in US English; the capital stress in 'In the FUture' stays");
TS(1199, "In the future: stress FU, then pause.", "In the future: stress the start of future, then pause.", "A+C", "'FU' alone may be read as letters F, U, a rude abbreviation in US English");

// L1200
both(1200, 6, "Riko points. Orbit,", "Riko points and says, Orbit,", "A+C", rSays);
both(1200, 8, "Haru smiles. The places", "Haru smiles and says, The places", "A+C", rSays);

const dest = path.join(REPO, ".run9-w3940/patches/15-L1191-1200.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
