// Build patches for L1161-1170 (run9 W39-40 group 12).
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
const rWho = "the answer has no speaker, so the voice reads it as my own words";
const rFrame = "'Then, X, and the ...' reads as a broken sentence aloud; say what to do with the phrase";
const rAtion = "bare 'ation' is not a word and TTS misreads it; spell the letters (L902 / L1141-1150 precedent 'a, t, i, o, n')";
const rAl = "bare 'al' is read as the name Al; spell the letters (L950 / L1141-1150 precedent 'a, l')";
const rEd = "bare 'ed' is read as the name Ed, not the -ed ending; spell the letters (L1141-1150 precedent 'e, d')";

// L1161
TS(1161, "Haru looks worried. Two minutes?", "Haru looks worried and says, Two minutes?", "A+C", rSays);
both(1161, 6, "Haru gasps. Only two minutes?", "Haru gasps and says, Only two minutes?", "A+C", rSays);
both(1161, 10, "These words are kinder than always or definitely.", "These words are softer than always or definitely.", "A+B", "hedges are not 'kinder'; they say less than always / definitely (softer, more careful); JA やさしい いいかた already fits softer");
P(1161, "conversation.lines[8].en", "Ding! Time's up! One minute and fifty seconds. Perfect!", "Ding! Done! One minute and fifty seconds. Perfect!", "objective", "story logic: 'Time's up' means the time ran out, but they finished early (1:50 of 2 minutes), which is why it is perfect");
P(1161, "conversation.lines[8].ja", "チーン！ じかんです！ 1 分 50 びょう。かんぺき！", "チーン！ おわり！ 1 分 50 びょう。かんぺき！", "objective", "JA follows the new EN");

// L1162
both(1162, 6, "Riko smiles. Just look at a friendly face", "Riko smiles and says, Just look at a friendly face", "A+C", rSays);
both(1162, 7, "Kiko begins. Welcome, everyone.", "Kiko stands up and says, Welcome, everyone.", "A+C", rSays + " (here the voice would welcome everyone itself)");
ja(1162, 7, "キコちゃんが はじめるよ。「", "キコちゃんが 立って はじめるよ。「", "A+C", "JA follows the new EN");
both(1162, 8, "Then the topic. Today, we'll talk about, and the topic.", "Then the topic. Today, we'll talk about food waste.", "A+C", "'Today, we'll talk about, and the topic' is a broken sentence aloud; give the whole model sentence");
ja(1162, 8, "「きょうは ～に ついて 話します」", "「きょうは 食べものの むだに ついて 話します」", "A+C", "JA follows the new EN");

// L1163
both(1163, 6, "Riko speaks first. We propose that", "Riko speaks first. She says, We propose that", "A+C", rSays + " (same wording as the teacherScript)");
both(1163, 8, "Then, This will help, and the good result.", "Then say the good result with This will help.", "A+C", rFrame);
P(1163, "conversation.lines[6].en", "Almost every school can likely have one.", "Almost every school will likely be able to have one.", "A+B", "'can likely' is awkward; likely goes with will (as in the lesson's own model 'It will likely save food')");

// L1164
both(1164, 6, "Birimo is playing Amina. I love your idea.", "Birimo is playing Amina. He says, I love your idea.", "A+C", rSays);
both(1164, 7, "Kiko worries. What if the helpers forget?", "Kiko worries and asks, What if the helpers forget?", "A+C", rSays);
both(1164, 7, "And on Friday? The helpers give the food to the school kitchen.", "Birimo asks, What happens on Friday? Riko says, The helpers give the food to the school kitchen.", "A+C", rWho + " (Birimo, playing Mateo, asks; Riko answers, as in conversation lines 5-6)");
ja(1164, 7, "金曜日は？「当番が 食べものを 給食室に わたすよ。」", "ビリモ「金曜日は どう なるの？」 リコちゃん「当番が 食べものを 給食室に わたすよ。」", "A+C", "JA follows the new EN");
both(1164, 8, "Then, However, and your worry, kindly.", "Then say However, and share your worry kindly.", "A+C", rFrame);

// L1165
both(1165, 6, "Haru sighs. That's hard.", "Haru sighs and says, That's hard.", "A+C", rSays);
both(1165, 7, "Kiko laughs. Nice try, Birimo,", "Kiko laughs and says, Nice try, Birimo,", "A+C", rSays);
both(1165, 7, "Will you sign the promise? Of course! Here's my signature.", "Will you sign the promise? Birimo says, Of course! Here's my signature.", "A+C", rWho + " (Birimo signs in conversation line 7)");
ja(1165, 7, "「やくそくに サイン して くれる？」「もちろん！", "「やくそくに サイン して くれる？」 ビリモ「もちろん！", "A+C", "JA follows the new EN");

// L1166
both(1166, 6, "Riko reads both articles. Article A", "Riko reads both articles and says, Article A", "A+C", rSays);
both(1166, 7, "Haru nods. Fair enough!", "Haru nods and says, Fair enough!", "A+C", rSays);
both(1166, 8, "agree with? I agree with parts of both.", "agree with? Kiko says, I agree with parts of both.", "A+C", rWho);
ja(1166, 8, "キコちゃんは どっちに 賛成？「どっちにも", "キコちゃんは どっちに 賛成？ キコちゃん「どっちにも", "A+C", "JA follows the new EN");
ja(1166, 11, "小さな かわりかたに 見えるかも しれない。", "小さな へんかに 見えるかも しれない。", "objective (JA)", "'かわりかた' (way of changing) is unnatural for 'a small change'; へんか");

// L1167
both(1167, 6, "first? Because it's fair.", "first? Riko says, Because it's fair.", "A+C", rWho);
ja(1167, 6, "書くの？ ― その ほうが", "書くの？」 リコちゃん「その ほうが", "A+C", "JA follows the new EN");
both(1167, 8, "Kiko's opinion is different. What's your opinion? I think safety comes first.", "Kiko's opinion is different. I ask, What's your opinion? Kiko says, I think safety comes first.", "A+C", rWho + " (the voice said 'I think safety comes first' as me)");
ja(1167, 8, "キコちゃんの 意見は ちがうよ。「あなたの 意見は？ ― あんぜんが いちばん だいじだと 思う。」", "キコちゃんの 意見は ちがうよ。わたし「あなたの 意見は？」 キコちゃん「あんぜんが いちばん だいじだと 思う。」", "A+C", "JA follows the new EN");
both(1167, 9, "Conserve, drop the e, add ation.", "Conserve, drop the e, add a, t, i, o, n.", "B+C", rAtion);
TS(1167, "Conservation is conserve, drop the e, plus ation.", "Conservation is conserve, drop the e, plus a, t, i, o, n.", "B+C", rAtion + " (same as seg9)");

// L1168
both(1168, 7, "Riko laughs. Maybe not! What should we add?", "Riko laughs and says, Maybe not! Haru asks, What should we add?", "A+C", rSays + "; Haru asks the question in conversation line 5");
ja(1168, 7, "「それは やめとこう！」「なにを つけたそう？", "「それは やめとこう！」 ハルくん「なにを つけたそう？", "A+C", "JA follows the new EN");
both(1168, 8, "Kiko adds a promise. We will turn off", "Kiko adds a promise. She says, We will turn off", "A+C", rSays);
both(1168, 9, "Globe, drop the e, add al.", "Globe, drop the e, add a, l.", "B+C", rAl);
TS(1168, "Global is globe, drop the e, plus al.", "Global is globe, drop the e, plus a, l.", "B+C", rAl + " (same as seg9)");

// L1169
both(1169, 7, "Kiko smiles. Your reasons were strong, too.", "Kiko smiles and says, Your reasons were strong, too.", "A+C", rSays);
both(1169, 8, "What did you learn here? I learned that", "What did you learn here? Haru says, I learned that", "A+C", rWho + " (Haru says it in conversation line 5)");
both(1169, 8, "Thank you for sharing your story. It was a pleasure.", "Thank you for sharing your story. They say, It was a pleasure.", "A+C", rWho + " (the six children answer)");
ja(1169, 8, "「ここで なにを まなんだ？ ― ちがう アイデアが 計画を よく するって まなんだよ。」", "「ここで なにを まなんだ？」 ハルくん「ちがう アイデアが 計画を よく するって まなんだよ。」", "A+C", "JA follows the new EN");
ja(1169, 8, "「お話を きかせて くれて ありがとう。― どう いたしまして、うれしかったよ。」", "「お話を きかせて くれて ありがとう。」 6 人「どう いたしまして、うれしかったよ。」", "A+C", "JA follows the new EN");
both(1169, 9, "En, plus danger, plus ed.", "En, plus danger, plus e, d.", "B+C", rEd);
TS(1169, "Endangered is en plus danger plus ed:", "Endangered is en plus danger plus e, d:", "B+C", rEd + " (same as seg9)");

// L1170
TS(1170, "Some problems will possibly take many years to solve,", "Some problems could possibly take many years to solve,", "A+B", "'will possibly' mixes a sure word with a hedge; 'could possibly' is the natural hedged form");
both(1170, 7, "Then everyone holds hands. Together,", "Then everyone holds hands and says, Together,", "A+C", rSays);
ja(1170, 7, "それから みんなで 手を つなぐよ。「", "それから みんなで 手を つないで いうよ。「", "A+C", "JA follows the new EN");
both(1170, 19, "Next, go and talk with Riko! Next is World forty,", "Next, go and talk with Riko! Then comes World forty,", "A+C", "two 'Next' sentences in a row sound like a slip aloud; the partner line stays as it is");

const dest = path.join(REPO, ".run9-w3940/patches/12-L1161-1170.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
