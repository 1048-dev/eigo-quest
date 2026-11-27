// Build patches for L1121-1130 (run9 W37-38 group 14).
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

const rSpk = "the quote has no speaker, so the voice reads it as my own narration; add the speaker (house style 'X says, ...')";

// L1121
TS(1121, "Haru grabs the map. We go left. It's shorter! Riko frowns. But Grandma Rowan said", "Haru grabs the map and says, Let's go left. It's shorter! Riko frowns and says, But Grandma Rowan said", "A+C", rSpk + "; 'We go left' is not what a child insisting would say");
TS(1121, "The fog here is not dangerous, but it makes everything hard to see, just like anger does.", "The fog here makes everything hard to see, just like anger does.", "A+B", "safety: telling children fog is 'not dangerous' can carry over to real hill fog; the page already teaches stop, stand still and wait");
both(1121, 6, "At the fork, Haru grabs the map. This way!", "At the fork, Haru grabs the map and says, This way!", "A+C", rSpk);
both(1121, 7, "Haru insists. Why won't you trust me?", "Haru insists, Why won't you trust me?", "A+C", "make 'insists' the speech verb (as in the teacherScript 'Haru insists, Left!') so the quote has a speaker");

// L1122
both(1122, 2, "The words you say when you made a mistake.", "The words you say when you make a mistake.", "objective", "tense: 'you say when you made' mixes present and past");
both(1122, 16, "Maybe you bumped a friend.", "Maybe you bumped into a friend.", "A+B", "an accidental bump is 'bump into' someone; 'bumped a friend' sounds deliberate");

// L1123
TS(1123, "the Think-Back Card that Haru and Riko filled in together", "the Think-Back Card that Haru and Riko filled out together", "objective (US policy)", "US English fills out a card or form ('fill in' is British)");
both(1123, 3, "Oh, I wish I didn't do that.", "Oh, I shouldn't have done that.", "objective", "'I wish I didn't do that' is ungrammatical for a past regret (needs 'hadn't done'); 'I shouldn't have done that' is the lesson's own form and matches the JA しなければ よかった");
both(1123, 9, "Make so a little long, then let your voice fall.", "Stretch the word so a little, then let your voice fall.", "A+C", "'Make so a little long' is hard to parse when read aloud; name 'the word so'");

// L1124
TS(1124, "Did it hurt? Not really, he says, but now his bottom is wet.", "I ask, Did it hurt? Just a little, he says, but now his bottom is wet.", "objective", "story: the conversation and seg7 have me ask and Birimo answer 'Just a little' (the target answer), not 'Not really'; the question also had no speaker");

// L1125
TS(1125, "a small boy puts up his hand", "a small boy raises his hand", "objective (US policy)", "US classrooms 'raise your hand'; 'put up his hand' is British");
TS(1125, "But we made up this morning, he adds. That's great!", "But we made up this morning, he adds. We all cheer, That's great!", "A+C", rSpk);
TS(1125, "Lonely is lone plus l-y, so keep the e.", "Lonely is lone plus l, y, so keep the e.", "B+C", "'l-y' may be read as 'ly'; spell the letters 'l, y' as L1114 does");
both(1125, 10, "Lone, plus l y.", "Lone, plus l, y.", "B+C", "spell the letters with a comma ('l, y') as L1114 does, so TTS reads two letters");

// L1126
TS(1126, "But Haru yawns. I want to sleep late tomorrow.", "But Haru yawns and says, I want to sleep late tomorrow.", "A+C", rSpk);
TS(1126, "I set my alarm clock for half past four.", "I set my alarm clock for four o'clock.", "objective", "story time: we leave at half past four (conversation line 2, L1127 'it's half past four ... we walk out of the farmhouse'), so the alarm cannot ring at half past four");
TS(1126, "But getting up at half past four is not a piece of cake!", "But getting up at four o'clock is not a piece of cake!", "objective", "story time: the alarm now rings at four o'clock");

// L1127
TS(1127, "Birimo stops. Let's take the long path! Haru frowns. But it's longer, and we might miss the sunrise.", "Birimo stops and says, Let's take the long path! Haru frowns and says, But it's longer, and we might miss the sunrise.", "A+C", rSpk);

// L1128
TS(1128, "Riko has an idea. At my school, we have a buddy bench.", "Riko has an idea. She says, At my school, we have a buddy bench.", "A+C", "without a speaker 'At my school' reads as my own school; add 'She says,'");
TS(1128, "Mr. Bram reads it and smiles. It's a fine idea,", "Mr. Bram reads it, smiles and says, It's a fine idea,", "A+C", rSpk);
both(1128, 6, "Birimo strokes a pretend beard. What's a buddy bench?", "Birimo strokes a pretend beard and asks, What's a buddy bench?", "A+C", rSpk);
both(1128, 6, "play with. Who will paint it?", "play with. Birimo asks, Who will paint it?", "A+C", "'Who will paint it?' right after Riko's line sounds like Riko asking; name Birimo");
ja(1128, 6, "「だれが ペンキを ぬるんだい？」", "ビリモ「だれが ペンキを ぬるんだい？」", "A+C", "JA follows the new EN speaker");
both(1128, 15, "Haru has a big speech tomorrow,", "Haru has a big speech soon,", "objective", "story time: in this lesson Mr. Bram says the speeches are in two days, not tomorrow");
ja(1128, 15, "ハルくんは あした 大きな スピーチが あるのに、", "ハルくんは もうすぐ 大きな スピーチが あるのに、", "objective", "JA follows the new EN (soon)");

// L1129
both(1129, 7, "Whoa, so sour! Another glass? Thanks for asking, but I'd rather not. No problem!", "Whoa, so sour! Birimo asks, Another glass? Kiko says, Thanks for asking, but I'd rather not. Birimo says, No problem!", "A+C", "three quotes in a row had no speakers; the voice cannot show who offers and who says no");
ja(1129, 7, "「もう いっぱい？」「さそって くれて ありがとう。でも えんりょ しておくね。」「気に しないで！」", "ビリモ「もう いっぱい？」 キコちゃん「さそって くれて ありがとう。でも えんりょ しておくね。」 ビリモ「気に しないで！」", "A+C", "JA follows the new EN speakers");

// L1130
TS(1130, "There is wood in the barn, and we will help paint it.", "There is wood in the barn, and we will help paint the bench.", "A+B", "'it' could mean the wood or the barn; name the bench");
TS(1130, "Mr. Bram smiles under his big gray beard. The answer is yes!", "Mr. Bram smiles under his big gray beard and says, The answer is yes!", "A+C", rSpk);
both(1130, 8, "Hands go up! The answer is yes!", "Hands go up! Mr. Bram says, The answer is yes!", "A+C", rSpk);
ja(1130, 8, "手が 上がる！「こたえは イエスだ！」", "手が 上がる！ ブラムさん「こたえは イエスだ！」", "A+C", "JA follows the new EN speaker");
P(1130, "school.testPoints[1]", "frustrated ＝ fru-s-tra-ted", "frustrated ＝ frus-trat-ed", "objective", "'fru-s-tra-ted' is not a real syllable split; w38Phonics.ts tip says frus ＋ trat ＋ ed");
P(1130, "phonics.tipJa", "frustrated（fru-s-tra-ted。", "frustrated（frus-trat-ed。", "objective", "'fru-s-tra-ted' is not a real syllable split; w38Phonics.ts tip says frus ＋ trat ＋ ed");

const dest = path.join(REPO, ".run9-w3738/patches/14-L1121-1130.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
