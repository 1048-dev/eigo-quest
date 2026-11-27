// Build patches for L1081-1090 (run9 W37-38 group 10).
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

const rHaaa = "'Haaa!' is read by TTS as a laugh (ha-a-a), the opposite of a gasp; 'Oh!' is a natural surprised sound (JA ハッ stays)";
const rBle = "the l-e alone does not sound like 'bull'; the b, l, e ending does (and 'It ends in l-e, like bull' reads as if bull ends in l-e)";
const rSays = "the quote has no 'says', so the voice reads the character's words as my own";

// L1081
both(1081, 9, "It ends in l-e, like bull.", "The b, l, e at the end sounds like bull.", "B+C", rBle);
ja(1081, 9, "さいごの l-e は「ブル」の ような おと。", "さいごの b-l-e は「ブル」の ような おと。", "B+C", "JA follows the new EN");
TS(1081, "Tremble ends in l-e, and it sounds like bull.", "Tremble ends in b, l, e, and that part sounds like bull.", "B+C", rBle);
P(1081, "phonics.tipJa", "-le は「ブル」の ような 音", "-ble は「ブル」の ような 音", "B+C", "the 'ブル' sound is the b-l-e ending, not -le alone");
P(1081, "school.testPoints[1]", "-le は「ブル」の ような 音", "-ble は「ブル」の ような 音", "B+C", "the 'ブル' sound is the b-l-e ending, not -le alone");
both(1081, 6, "The mouse bows. I'm Nib,", "The mouse bows and says, I'm Nib,", "A+C", rSays);

// L1082
both(1082, 8, "Breathe in fast because you're surprised. Haaa! Gasp.", "Breathe in fast because you're surprised. Oh! Gasp.", "B+C", rHaaa);
both(1082, 17, "You're as clever as that rabbit!", "You're clever, just like that rabbit!", "objective", "'as ~ as' starts in L1088 (grammar order); keep the same praise without the form");
P(1082, "phonics.tipJa", "tremble と おなじ -le で「ブル」", "tremble と おなじ -ble で「ブル」", "B+C", "the 'ブル' sound is the b-l-e ending, not -le alone (same fix as L1081)");

// L1083
P(1083, "conversation.lines[2].en", "But why does the moon change shape really?", "But why does the moon change shape, really?", "A+B", "'change shape really' is unnatural word order; a comma makes the natural spoken tag 'really?'");
both(1083, 7, "But why does the moon change shape really?", "But why does the moon change shape, really?", "A+B", "same line as conversation line 2");
both(1083, 8, "After the v, we say er.", "After the v comes e, r.", "B+C", "bare 'er' is read by TTS as a hesitation sound (uh); spell the letters");
P(1083, "phonics.tipJa", "-le は「クル」の ような 音", "-kle は「クル」の ような 音", "B+C", "the 'クル' sound is the k-l-e ending, not -le alone (same fix as L1081)");

// L1084
both(1084, 6, "Riko looks at the shelves. Many countries", "Riko looks at the shelves and says, Many countries", "A+C", rSays);

// L1085
both(1085, 9, "Gasp. Haaa! A quick breath", "Gasp. Oh! A quick breath", "B+C", rHaaa);

// L1087
both(1087, 2, "I'm holding up my book. I show you.", "I'm holding up my book. I'm showing you.", "A+B", "'I show you' for an action happening now is unnatural; use the present continuous");
ja(1087, 2, "あなたに 見せる。", "あなたに 見せて いるよ。", "A+B", "JA follows the new EN");
both(1087, 6, "I read, Oren was scared.", "I say, Oren was scared.", "A+C", "'I read' is a heteronym (reed / red) the TTS may read as past; house style 'I say,'");
both(1087, 6, "Kiko tries. Her hands were shaking.", "Kiko tries and says, Her hands were shaking.", "A+C", rSays + " ('That's how I would show' sounded like me)");
ja(1087, 6, "わたしが 読むよ。「オレンは こわかった。」", "わたし「オレンは こわかった。」", "A+C", "JA follows the new EN");
both(1087, 17, "Show a feeling without saying it. I'm excited. My feet", "Show a feeling without saying it. Excited? My feet", "A+B", "the model said 'I'm excited', which tells the feeling the lesson says not to tell; name the feeling as a prompt instead");
ja(1087, 17, "わくわく してる。「足が", "わくわく？「足が", "A+B", "JA follows the new EN");

// L1088
TS(1088, "When we compare one thing to another, it's called a simile.", "When we compare one thing to another using as or like, it's called a simile.", "A+B", "a simile is a comparison with as or like (seg2 says so); without it the rule also fits a metaphor");
both(1088, 8, "Use as and as, or like.", "Use as, a describing word, and as again. Or use like.", "A+B+C", "'as and as' is unclear and hard to read aloud; show the as ~ as frame");
ja(1088, 8, "as と as、または like を つかうよ。", "as ～ as、または like を つかうよ。", "A+B+C", "JA follows the new EN");

// L1089
ja(1089, 6, "だいじょうぶ、先生が ここに いるからね。", "だいじょうぶ、わたしが ここに いるからね。", "objective (JA)", "my own narration calls me 先生 in the third person; わたし as in the block-wide swap");
both(1089, 7, "Birimo pushes it. Creak!", "Nib pushes it. Birimo says, Creak!", "objective", "story contradiction: in the teacherScript Nib pushes the door; Birimo only says the line (conversation line 3)");
ja(1089, 7, "ビリモが おすよ。「ギィー！", "ニブが おすよ。ビリモ「ギィー！", "objective", "JA follows the new EN");
TS(1089, "Then Oren knocked on the palace gate. Creak! The old door slowly opened,", "Then Oren knocked on the palace door. Creak! The old door slowly opened,", "A+B", "'gate' then 'the old door' is two different things; the question after the story asks 'Who opened the palace door?'");
P(1089, "conversation.lines[8].en", "No way, that's perfect!", "Wow, that's perfect!", "A+B", "'No way,' reads as a refusal of Riko's idea; Haru agrees (JA えっ、それ かんぺき！)");

// L1090
both(1090, 7, "Crash! It's just a tiny owl.", "Crash! It's only falling snow and a tiny owl.", "objective", "story: the crash was a pile of snow falling (teacherScript question 'What made the crash?'); the owl sat on top");
ja(1090, 7, "ガシャーン！ 小さな フクロウ だけ だったよ。", "ガシャーン！ おちた 雪と 小さな フクロウ だけ だったよ。", "objective", "JA follows the new EN");

const dest = path.join(REPO, ".run9-w3738/patches/10-L1081-1090.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
