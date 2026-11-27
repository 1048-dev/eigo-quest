// Build patches for L971-980 (run9 W33-34 group 11).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  if (!before.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = before.split(from).join(to);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  if (prev) throw new Error(`duplicate field L${lesson} ${p}`);
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};

// "Shield with your arm." (L971-975 -proof gesture cue)
const rShield = "'Shield with your arm' has no object and is not something a teacher says; 'Hold up your arm like a shield' matches the JA うでで たてを つくって";
for (const [n, seg] of [[971, 10], [972, 10], [973, 9], [974, 10], [975, 9]]) both(n, seg, "Shield with your arm.", "Hold up your arm like a shield.", "A+B", rShield);

// L971
P(971, "teacherScript", "Proof means protects against, or strong against.", "Proof means it keeps something out, or it's strong against something.", "objective", "'Proof means protects against, or strong against' has no subject or object (not a sentence); wording follows seg10 'it keeps something out'");
both(971, 11, "Leak means drips come out.", "Leak means water drips out.", "A+C", "'drips come out' is awkward; 'water drips out' is what a teacher says and reads smoothly");
both(971, 21, "Great packing!", "Nice packing!", "A+C", "seg20 now ends 'Great job!' (block-wide fix); 'Great ~!' twice in a row, rotate praise (JA じょうずに つめられたね fits)");

// L972
both(972, 9, "Fix it, so that it won't fall over.", "Fix it so that it won't fall over.", "B+C", "the target 'so that' (purpose) has no comma; the comma makes it read as a result clause and puts the pause in the wrong place");

// L973
both(973, 17, "Our family meeting place is the beach.", "Our family meeting place is the school.", "objective (fact)", "on a tsunami island the beach is the place NOT to go after an earthquake (L979: 'We will not go to the beach'); the model plan must be safe");
P(973, "teacher.segments[17].subtitleJa", "うみべだよ", "がっこうだよ", "objective (fact)", "JA follows the safe meeting place");

// L974
P(974, "teacher.segments[6].subtitleJa", "もり はかせ", "モリ博士", "objective (JA)", "the only もり はかせ in world 33; everywhere else (incl. this lesson's conversation) it is モリ博士");

// L975
both(975, 10, "Appear plus ance.", "Appear plus a, n, c, e.", "B+C", "bare 'ance' is misread by TTS (ants / ahns); spell it as letters like the teacherScript ('Appear plus a, n, c, e') and seg9 ('E, N, C, Y')");

// L976
const rDesk = "Birimo is the small one of the cast, so 'too big for the desk' contradicts him; 'All the desks are taken' also leads straight into 'What should we do if there's no desk?'";
P(976, "conversation.lines[2].en", "I'm too big for the desk!", "All the desks are taken!", "A+B", rDesk);
P(976, "conversation.lines[2].ja", "ぼく、つくえに はいらない！", "つくえが ぜんぶ ふさがってる！", "A+B", rDesk);
both(976, 7, "I'm too big for the desk!", "All the desks are taken!", "A+B", rDesk);
P(976, "teacher.segments[7].subtitleJa", "ぼく、つくえに はいらない！", "つくえが ぜんぶ ふさがってる！", "A+B", rDesk);
P(976, "teacher.segments[7].slide.items[0]", "I'm too big for the desk!", "All the desks are taken!", "A+B", rDesk);
P(976, "teacherScript", "Birimo is too big for the desk, so he covers his head with his arms.", "All the desks are taken, so Birimo covers his head with his arms.", "A+B", rDesk);
const rOver = "Haru says 'Pretend it's still shaking' and then asks to leave, which makes no sense; he should ask if it is over so Ms. Emma can answer 'Not yet... until the shaking stops'";
P(976, "conversation.lines[4].en", "Pretend it's still shaking. Can we go now?", "Is it over? Can we go now?", "A+B", rOver);
P(976, "conversation.lines[4].ja", "まだ ゆれて いる つもりだよ。もう いって いい？", "おわった？ もう いって いい？", "A+B", rOver);
both(976, 8, "Pretend it's still shaking. Can we go now?", "Is it over? Can we go now?", "A+B", rOver);
P(976, "teacher.segments[8].subtitleJa", "まだ ゆれて いる つもりだよ。もう いって いい？", "おわった？ もう いって いい？", "A+B", rOver);
P(976, "teacher.segments[8].slide.items[0]", "Pretend it's still shaking. Can we go now?", "Is it over? Can we go now?", "A+B", rOver);
both(976, 20, "and stay calm.", "and stay where you are.", "A+B", "'stay calm' is the L977 target (order rule); 'stay where you are' is today's expression and the right contrast to option B 'run around'");
P(976, "teacher.segments[20].subtitleJa", "おちついてね。", "その ばに いてね。", "A+B", "JA follows the new EN");
P(976, "teacher.segments[0].subtitleJa", "アイランド・スクール", "島の学校", "objective (JA)", "the only アイランド・スクール in world 33; the topic, scene and other lessons say 島の学校");

// L977
both(977, 7, "Kiko asks, Why shouldn't we talk? Because we need to hear the teacher.", "Kiko asks, Why shouldn't we talk? I say, Because you need to hear the teacher.", "A+C", "the answer had no speaker, so it sounds like Kiko answers herself; in the conversation Ms. Emma answers 'Because you need to hear the teacher'");
P(977, "teacher.segments[7].subtitleJa", "」 先生の こえを きく ひつようが あるからだよ。", "」 わたし「先生の こえを きく ひつようが あるからよ。」", "A+C", "JA follows: Ms. Emma answers");

// L978
P(978, "teacherScript", "Haru checks the order. So, first we hide", "Riko checks the order. So, first we hide", "objective", "in the conversation and seg8 Riko says 'So, first we hide, and then we wait, right?'; the teacherScript gave it to Haru");
P(978, "teacher.segments[0].subtitleJa", "みんな、やあ！", "やあ、みんな！", "objective (JA)", "'みんな、やあ！' is unnatural order; the block uses やあ、みんな！");
both(978, 19, "Great order!", "You got the order right!", "A+C", "'Great order!' sounds like praise for a food order; JA じゅんばん ばっちり！ fits the new line");

// L980
both(980, 7, "Then I ask, Is everyone here? Yes, everyone is here!", "Then I ask, Is everyone here? Haru says, Yes, everyone is here!", "A+C", "the answer had no speaker, so Ms. Emma seems to answer herself; in the conversation Haru answers");
P(980, "teacher.segments[7].subtitleJa", "「みんな いますか？」「はい、みんな います！」", "「みんな いますか？」 ハルくん「はい、みんな います！」", "A+C", "JA follows: Haru answers");
both(980, 5, "Kids who are smaller than you.", "Little kids, like first graders.", "A+B", "'younger' is about age, not size; 'smaller than you' teaches the wrong meaning. 'Little kids' is the natural US way");
P(980, "teacher.segments[5].subtitleJa", "あなたより 小さい 子たち。", "1年生のような 小さい 子たち。", "A+B", "JA follows the new EN");

const dest = path.join(REPO, ".run9-w3334/patches/11-L971-980.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
