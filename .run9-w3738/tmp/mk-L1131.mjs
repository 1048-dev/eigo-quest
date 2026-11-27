// Build patches for L1131-1140 (run9 W37-38 group 15).
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

const rSuf = "bare 'ful' / 'ive' / 'ous' are misread by TTS ('ive' as I've); spell the letters as L1138 / L1140 and the W38 group 13 do ('f, u, l')";
const rSpk = "the answer had no speaker, so the voice reads it as the asker; name the speaker (house style)";

// L1131
both(1131, 8, "I look up to someone, because, and a reason.", "Say I look up to and a person, then because and a reason.", "A+C", "'I look up to someone, because, and a reason.' is a broken sentence and hard to read aloud; name the two parts");
both(1131, 9, "Ful means full of. Help plus ful makes helpful.", "F, u, l means full of. Help plus f, u, l makes helpful.", "B+C", rSuf);
both(1131, 10, "Ive means good at doing something.", "I, v, e means good at doing something.", "B+C", rSuf);
both(1131, 10, "Ous means full of something.", "O, u, s means full of something.", "B+C", rSuf);

// L1132
both(1132, 7, "Why did you decide to try again? Because my friends believed in me.", "Why did you decide to try again? Kiko says, Because my friends believed in me.", "A+C", rSpk);
ja(1132, 7, "思ったの？」「友だちが しんじて くれたから。」", "思ったの？」 キコちゃん「友だちが しんじて くれたから。」", "A+C", "JA follows the new EN");
both(1132, 9, "Thought plus ful.", "Thought plus f, u, l.", "B+C", rSuf);
both(1132, 10, "Sensitive ends in ive.", "Sensitive ends in i, v, e.", "B+C", rSuf);
both(1132, 10, "Courageous is courage plus ous.", "Courageous is courage plus o, u, s.", "B+C", rSuf);
ja(1132, 17, "先生に インタビュー してね。先生は さいしょの じゅぎょうの まえ、きんちょう したの。", "わたしに インタビュー してね。わたしは さいしょの じゅぎょうの まえ、きんちょう したの。", "objective (JA)", "Ms. Emma's own line calls herself 先生 in the third person; the EN says 'Interview me. I was nervous' (block rule: わたし)");

// L1133
both(1133, 6, "What was your childhood like? I grew up on a farm,", "What was your childhood like? Birimo says, I grew up on a farm,", "A+C", rSpk);
ja(1133, 6, "「こどもの ころは どんな かんじ でしたか？」「農場で", "「こどもの ころは どんな かんじ でしたか？」 ビリモ「農場で", "A+C", "JA follows the new EN");
both(1133, 7, "Did you have a dream back then? I wanted to be an animal doctor.", "Did you have a dream back then? Birimo says, I wanted to be an animal doctor.", "A+C", rSpk);
ja(1133, 7, "「その ころ、ゆめは ありましたか？」「どうぶつの", "「その ころ、ゆめは ありましたか？」 ビリモ「どうぶつの", "A+C", "JA follows the new EN");
both(1133, 9, "Cheer plus ful is cheerful", "Cheer plus f, u, l is cheerful", "B+C", rSuf);
both(1133, 9, "Support plus ive is supportive", "Support plus i, v, e is supportive", "B+C", rSuf);
both(1133, 10, "then we add ous.", "then we add o, u, s.", "B+C", rSuf);
P(1133, "teacher.segments[19].slide.items[0]", "adventurous", "What was school like? ― It was far away, over three hills.", "A+B", "the answer slide showed 'adventurous', which has nothing to do with the quiz (where the school was); show the answer expression");

// L1134
both(1134, 9, "Play plus ful is playful", "Play plus f, u, l is playful", "B+C", rSuf);
both(1134, 9, "plus ive.", "plus i, v, e.", "B+C", rSuf);
both(1134, 10, "Humor plus ous is humorous.", "Humor plus o, u, s is humorous.", "B+C", rSuf);

// L1135
both(1135, 7, "What was it like on rainy days? Wet! Very wet!", "What was it like on rainy days? Grandma Rowan says, Wet! Very wet!", "A+C", rSpk);
both(1135, 7, "Kiko asks about the exam. I was over the moon!", "Kiko asks about the exam. Grandma Rowan says, I was over the moon!", "A+C", rSpk);
ja(1135, 7, "「雨の 日は どう でしたか？」「びしょぬれ！", "「雨の 日は どう でしたか？」 おばあさん「びしょぬれ！", "A+C", "JA follows the new EN");
ja(1135, 7, "きくよ。「天にも", "きくよ。おばあさん「天にも", "A+C", "JA follows the new EN");
both(1135, 9, "Generous ends in ous, like us. Thoughtful ends in ful.", "Generous ends in o, u, s. It sounds like us. Thoughtful ends in f, u, l.", "B+C", rSuf);

// L1136
both(1136, 8, "An idiom is a picture.", "An idiom is like a picture.", "A+B", "'An idiom is a picture' is not true as said; the JA already says 絵のような もの (like a picture)");
both(1136, 10, "Creative ends with the sound iv.", "The end of creative sounds like give.", "B+C", "bare 'iv' is read by TTS as the Roman numeral four or as letters; compare it with the real word give");

// L1137
ja(1137, 0, "みんな、やあ！", "やあ、みんな！", "objective (JA)", "'みんな、やあ！' is unnatural word order; use the block opening やあ、みんな！");
P(1137, "vocab[3].en", "post", "mail", "objective (US policy)", "'post a letter' is British; US English says mail (US style: mail a letter, mailbox)");
both(1137, 5, "Post. Send your letter. Drop it in the box! Post.", "Mail. Send your letter. Drop it in the mailbox! Mail.", "objective (US policy)", "vocab post -> mail (US)");
ja(1137, 5, "post。手紙を おくる こと。", "mail。手紙を おくる こと。", "objective (US policy)", "vocab post -> mail (US)");
P(1137, "teacher.segments[5].slide.items[0]", "post", "mail", "objective (US policy)", "vocab post -> mail (US)");
P(1137, "conversation.lines[7].en", "Let's post them tomorrow.", "Let's mail them tomorrow.", "objective (US policy)", "vocab post -> mail (US)");
TS(1137, "Tomorrow, we'll post our letters together.", "Tomorrow, we'll mail our letters together.", "objective (US policy)", "vocab post -> mail (US)");
both(1137, 10, "Supportive ends with iv.", "Supportive ends in i, v, e.", "B+C", "bare 'iv' is read by TTS as the Roman numeral four or as letters; spell the letters as L1138 / L1140 do");
ja(1137, 10, "supportive は さいごが「イヴ」。", "supportive は さいごが i、v、e。", "B+C", "JA follows the new EN (as L1138 / L1140 write f、u、l)");

// L1138
TS(1138, "The farmer thanks the postman for bringing letters in the rain. The postman helps", "The farmer thanks the mail carrier for bringing letters in the rain. The mail carrier helps", "objective (US policy)", "'postman' is British; US English says mail carrier");
both(1138, 6, "The farmer helps the postman. Thank you for your help!", "The farmer thanks the mail carrier. Thank you for your help!", "objective", "story contradiction: in the teacherScript the farmer thanks the mail carrier for bringing letters, and the mail carrier then helps Ellie; also 'postman' is British");
ja(1138, 6, "のうかの 人は ゆうびんやさんを たすける。", "のうかの 人は ゆうびんやさんに おれいを いう。", "objective", "JA follows the new EN");

// L1139
ja(1139, 2, "でかける まえの さいごの さんぽ。", "ここを はなれる まえの さいごの さんぽ。", "objective (JA)", "でかける means 'go out', but 'before you leave' here means leaving the highlands");
both(1139, 7, "Haru asks, Is everything OK? Not really.", "Haru asks, Is everything OK? Birimo says, Not really.", "A+C", rSpk);
ja(1139, 7, "ハルくん「だいじょうぶ？」「あんまり。", "ハルくん「だいじょうぶ？」 ビリモ「あんまり。", "A+C", "JA follows the new EN");

// L1140
TS(1140, "Everyone claps. And then the purple stripe returned to the Great Rainbow!", "Everyone claps. And then the purple stripe comes back to the Great Rainbow!", "A+C", "the story is told in the present ('Everyone claps', 'Puff glows'); the single past 'returned' breaks the tense");
both(1140, 4, "A big circle table.", "A big table shaped like a circle.", "A+B", "'circle table' is not natural English; say what round means");

const dest = path.join(REPO, ".run9-w3738/patches/15-L1131-1140.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
