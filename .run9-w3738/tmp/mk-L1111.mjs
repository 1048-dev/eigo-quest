// Build patches for L1111-1120 (run9 W37-38 group 13).
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

const rResp = "invented sound respelling; the brief asks for the hyphen beat form or a real word, and TTS reads these bits unevenly";
const rFul = "bare 'ful' / 'ly' / 'ous' / 'ious' are misread by TTS; spell the letters as the teacherScript already does";
const rSquee = "'Squee!' is fan slang, not a squeak, and TTS may misread it; use the real sound word 'Squeak!'";
const rLink = "the comma (or the doubled k) puts a break inside the link the lesson teaches; write one linked chunk as the other phrasal-verb lessons do";

// L1111 frustrated
const rFrus = "'fru, s, tra, ted' is not how the word splits and 'Fru' alone reads oddly; use the hyphen beat form frus-trat-ed (still shows the s and no extra e)";
both(1111, 10, "Frustrated. Fru, s, tra, ted. No extra e in the middle! Frustrated.", "Frustrated. Frus-trat-ed. No extra e in the middle! Frustrated.", "A+B+C", rFrus);
ja(1111, 10, "frustrated。fru、s、tra、ted。", "frustrated。frus・trat・ed。", "A+B+C", rFrus);
TS(1111, "Frustrated is fru, s, tra, ted, with no extra e.", "Frustrated is frus-trat-ed, with no extra e.", "A+B+C", rFrus);
P(1111, "phonics.tipJa", "frustrated（fru・s・tra・ted。", "frustrated（frus・trat・ed。", "A+B+C", rFrus);
P(1111, "school.testPoints[1]", "frustrated ＝ fru・s・tra・ted", "frustrated ＝ frus・trat・ed", "A+B+C", rFrus);

// L1112
both(1112, 9, "And it ends with o, y, e, d. Oyd. Annoyed.", "And it ends with o, y, e, d. Annoyed.", "B+C", rResp);
ja(1112, 9, "おわりは o、y、e、d。「オイド」。annoyed。", "おわりは o、y、e、d。annoyed。", "B+C", "JA follows the EN");
both(1112, 10, "A worried feeling. Ank, shus. After the x", "A worried feeling. After the x", "B+C", rResp);
ja(1112, 10, "しんぱいな 気持ち。「アンク、シャス」。x の あとに", "しんぱいな 気持ち。x の あとに", "B+C", "JA follows the EN");
both(1112, 8, "Grateful means thank you, from deep in your heart.", "Grateful means thankful, from deep in your heart.", "A+B", "grateful is an adjective; 'means thank you' mixes the word class, 'thankful' is the true meaning");

// L1113
both(1113, 4, "Grumpy. In a bad mood, a little cross.", "Grumpy. In a bad mood, with a frown.", "A+B", "'cross' (= annoyed) is British and a second new word; US kids say grumpy / grouchy");
ja(1113, 4, "きげんが わるくて、ちょっと むっと して いる こと。", "きげんが わるくて、むっと した 顔の こと。", "A+B", "JA follows the EN");
both(1113, 9, "Jel, lus. It ends in ous. Jealous.", "It starts like jelly. It ends in o, u, s. Jealous.", "B+C", rResp + "; also bare 'ous'");
ja(1113, 9, "「ジェ、ラス」。おわりは ous。", "jelly と おなじ 音で はじまるよ。おわりは o、u、s。", "B+C", "JA follows the EN");
both(1113, 11, "but it's grate, plus ful.", "but it's grate, plus f, u, l.", "B+C", rFul);
both(1113, 18, "Your turn! When I feel angry, I, and say your own way.", "Your turn! Say, When I feel angry, I, and then say what you do.", "A+B", "'When I feel angry, I, and say your own way' is hard to follow; use the 'Say, ~, and then ~' frame of the other lessons");

// L1114
both(1114, 3, "A little pool of rain water on the ground.", "A little pool of rainwater on the ground.", "objective", "spelling: rainwater is one word");
both(1114, 9, "Fyoo, ree, us. It ends", "It starts like fury. It ends", "B+C", rResp);
ja(1114, 9, "「フュ、リ、アス」。おわりは", "fury（はげしい いかり）と おなじ 音で はじまるよ。おわりは", "B+C", "JA follows the EN");
TS(1114, "Lonely is lone plus ly, so keep", "Lonely is lone plus l, y, so keep", "B+C", rFul);

// L1115
both(1115, 9, "Anxious. Ank, shus. After the x comes ious.", "Anxious. After the x comes i, o, u, s.", "B+C", rResp + "; also bare 'ious'");
ja(1115, 9, "anxious。「アンク、シャス」。x の あとに ious。", "anxious。x の あとに i、o、u、s。", "B+C", "JA follows the EN");
both(1115, 10, "Grateful. Grate, plus ful. Not great!", "Grateful. Grate, plus f, u, l. Not great!", "B+C", rFul);
TS(1115, "Grateful is grate plus ful.", "Grateful is grate plus f, u, l.", "B+C", rFul);

// L1116
both(1116, 0, "But listen. Squee!", "But listen. Squeak!", "A+C", rSquee);
both(1116, 3, "Squeak. A high, sharp little sound. Squee! Oops! Squeak!", "Squeak. A high, sharp little sound, like a mouse. Oops! Squeak!", "A+C", rSquee);
ja(1116, 3, "squeak。たかくて するどい 小さな 音。ピーッ！ おっと！", "squeak。ねずみの なきごえ みたいな、たかくて するどい 小さな 音。おっと！", "A+C", "JA follows the EN");
TS(1116, "keep squeaking. Squee! Squee!", "keep squeaking. Squeak! Squeak!", "A+C", rSquee);
P(1116, "conversation.aiTask.starterEn", "Squee! Oh no, there it goes again.", "Squeak! Oh no, there it goes again.", "A+C", rSquee);
TS(1116, "holds an umbrella over her. What's wrong?", "holds an umbrella over her. She asks, What's wrong?", "A+C", "no speaker before 'What's wrong?', so the voice reads it as narration; house style 'She asks,'");
const rSorry = "JA adds きかせて くれて ありがとう (thanks for telling me), which 'I'm sorry to hear that' does not say; use the seg7 / seg15 wording";
P(1116, "school.expressions[0].ja", "それは たいへんだね。きかせて くれて ありがとう、つらかったね。", "それは たいへんだね。つらかったね。", "objective (JA)", rSorry);
P(1116, "conversation.lines[2].ja", "それは たいへんだね。きかせて くれて ありがとう、つらかったね。", "それは たいへんだね。つらかったね。", "objective (JA)", rSorry);
both(1116, 9, "Link the words. Cheer, rup. UP is strong!", "Link the words. Chee-rup. UP is strong!", "B+C", rLink);
ja(1116, 9, "「チア、ラップ」", "「チアラップ」", "B+C", "JA follows the EN (tipJa already writes チアラップ)");
both(1116, 11, "Make, kup. UP is strong!", "May-kup. UP is strong!", "B+C", rLink);
ja(1116, 11, "「メイ、カップ」", "「メイカップ」", "B+C", "JA follows the EN");

// L1117
both(1117, 9, "Link it, look-kup.", "Link it, loo-kup.", "B+C", rLink);

// L1118
P(1118, "conversation.aiTask.starterEn", "My scarf for Puff fell apart again. Riko and Kiko make it look so easy!", "My scarf for Puff fell apart again. Grandma Rowan makes it look so easy, and Riko and Kiko keep cheering me on!", "A+B", "story: only Grandma Rowan knits (teacherScript, conversation line 4); the child names stay so the app still picks Birimo");

// L1119
const dSq = "Then I'll squeak too, and it'll be a duet! Squee!";
const dSqA = "Then I'll squeak too, and it'll be a duet! Squeak!";
P(1119, "conversation.lines[5].en", dSq, dSqA, "A+C", rSquee);
P(1119, "teacher.segments[19].slide.items[0]", dSq, dSqA, "A+C", "slide follows conversation line 5");
P(1119, "teacher.segments[20].slide.items[0]", dSq, dSqA, "A+C", "slide follows conversation line 5");

// L1120
ja(1120, 0, "けさは 先生に いい 考えが あるの。", "けさは わたしに いい 考えが あるの。", "objective", "Ms. Emma's own narration calls herself 先生; first person わたし as block-wide");
const rE = "'わたしの 絵に ちょっと あって' is not natural Japanese; say what happened to the painting";
P(1120, "conversation.lines[1].ja", "わたしの 絵に ちょっと あって。", "わたしの 絵が たいへんな ことに なっちゃって。", "objective (JA)", rE);
ja(1120, 6, "「わたしの 絵に ちょっと あって。」", "「わたしの 絵が たいへんな ことに なっちゃって。」", "objective (JA)", rE);
const rOh = "'Oh no.' is sympathy, but そうなの means 'is that so'; use あらら as L1113 does for 'Oh no'";
P(1120, "conversation.lines[2].ja", "そうなの。なにが あったか 話して。", "あらら。なにが あったか 話して。", "objective (JA)", rOh);
ja(1120, 6, "「そうなの。なにが あったか 話して。」", "「あらら。なにが あったか 話して。」", "objective (JA)", rOh);
ja(1120, 17, "「そうなの」から はじめてね。", "「あらら（Oh no）」から はじめてね。", "objective (JA)", rOh);
const rKiki = "きき手 also reads as 利き手 (your dominant hand); write 聞き手 as the title 聞き上手 does";
P(1120, "vocab[0].ja", "きき手", "聞き手", "objective (JA)", rKiki);
ja(1120, 2, "きき手！", "聞き手！", "objective (JA)", rKiki);
ja(1120, 6, "キコちゃんは きき手。", "キコちゃんは 聞き手。", "objective (JA)", rKiki);
P(1120, "conversation.lines[0].ja", "キコは きき手。", "キコは 聞き手。", "objective (JA)", rKiki);

const dest = path.join(REPO, ".run9-w3738/patches/13-L1111-1120.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
