// Build patches for L1181-1190 (run9 W39-40 group 14).
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

const rSays = "the quote has no 'says' / 'asks', so the voice reads the character's words as my own";
const rCeleste = "Celeste is セレスト everywhere else in W40 (78 times, and the test name); セレステ is a variant";
const rJa = "JA follows the new EN";

// L1181
both(1181, 3, "You tell people about you.", "You tell people about yourself.", "A+B", "'tell people about you' is unnatural for the speaker's own self; 'about yourself' matches the core 'Please tell me about yourself.'");
both(1181, 8, "Birimo jumps in. What kind of songs", "Birimo jumps in and asks, What kind of songs", "A+C", rSays);
ja(1181, 0, "セレステが", "セレストが", "objective (JA)", rCeleste);

// L1182
TS(1182, "Then Birimo grabs the picture card. I'm playing the examiner!", "Then Birimo grabs the picture card and says, I'm playing the examiner!", "A+C", rSays);
both(1182, 6, "Birimo plays the examiner. What is the boy doing?", "Birimo plays the examiner and asks, What is the boy doing?", "A+C", rSays);
both(1182, 7, "And the girl? She's reading a book.", "Birimo asks, And the girl? Haru says, She's reading a book.", "A+C", rSays + " (Birimo's question and Haru's answer had no speaker)");
ja(1182, 7, "女の子は？「本を", "ビリモ「女の子は？」 ハルくん「本を", "A+C", rJa);
both(1182, 8, "Then Birimo stares at the ice cream cart. Can the examiner", "Then Birimo stares at the ice cream cart and asks, Can the examiner", "A+C", rSays);
ja(1182, 8, "じーっ。「めんせつかんも", "じーっと 見て「めんせつかんも", "A+C", rJa);
P(1182, "conversation.lines[7].en", "Excellent. There are and the ing form make your answers clear.", "Excellent. Using There are and the ing form makes your answers clear.", "A+B", "'There are and the ing form make' uses a quoted phrase as a bare subject, hard to parse; 'Using ... makes' is clear");

// L1183
TS(1183, "Kiko looks worried. What if I give the wrong answer?", "Kiko looks worried and asks, What if I give the wrong answer?", "A+C", rSays);
TS(1183, "Riko nods. That's a good point. I didn't think about rainy days.", "Kiko nods and says, That's a good point. I didn't think about rainy days.", "objective", "story: Kiko says 'That's a good point. I didn't think about rainy days.' in the conversation (line 5) and seg7, not Riko; the quote also had no 'says'");
TS(1183, "it's hard to carry heavy shopping on a bike", "it's hard to carry heavy groceries on a bike", "objective (US policy)", "'shopping' for the things you bought is British; US 'groceries'");

// L1184
both(1184, 6, "Birimo has pancake in the mouth. Mmf, what's your mmf season?", "Birimo's mouth is full of pancake. He mumbles, Mmf, what's your mmf season?", "A+B+C", "'has pancake in the mouth' is unnatural (his mouth); the mumbled question had no speaker");
ja(1184, 6, "ビリモの 口の なかに パンケーキ。「もご、", "ビリモの 口は パンケーキで いっぱい。もごもごと「もご、", "A+B+C", rJa);
both(1184, 7, "Oops! What's your favorite season, and why? Kiko says,", "Birimo says, Oops! What's your favorite season, and why? Kiko says,", "A+C", rSays);
ja(1184, 7, "「おっと！ すきな きせつは", "ビリモ「おっと！ すきな きせつは", "A+C", rJa);
both(1184, 8, "Then a tricky one for Haru. If you could have", "Then a tricky one for Haru. Birimo asks, If you could have", "A+C", rSays);
ja(1184, 8, "むずかしい しつもん。「どんな", "むずかしい しつもん。ビリモ「どんな", "A+C", rJa);

// L1185
const rBrave = "story: the teacherScript says Celeste speaks this line ('Celeste says, Being brave doesn't mean ...'), but seg9 gave it to Birimo; Birimo now reports what Celeste says";
P(1185, "conversation.lines[9].en", "Celeste is ringing like a bell! Being brave doesn't mean", "Celeste is ringing like a bell! She says being brave doesn't mean", "objective", rBrave);
P(1185, "conversation.lines[9].ja", "セレストが 鈴みたいに なってる！ 勇気が あるって、ドキドキ しない ことじゃ ない。それでも つづける ことなんだ！", "セレストが 鈴みたいに 鳴ってる！ 勇気が あるって、ドキドキ しない ことじゃ ない。それでも つづける ことなんだって！", "objective", rBrave + "; JA なってる (ring) is read as 'becoming', so 鳴ってる");
both(1185, 9, "Birimo says, Being brave doesn't mean", "Celeste rings like a bell and says, Being brave doesn't mean", "objective", rBrave);
ja(1185, 9, "ビリモ「ゆうかんって、", "セレストが すずのように ひびく 声で「ゆうかんって、", "objective", rJa);
P(1185, "teacher.segments[9].slide.items[1]", "Celeste is ringing like a bell! Being brave doesn't mean", "Celeste is ringing like a bell! She says being brave doesn't mean", "objective", "slide shows conversation line 9");
P(1185, "teacher.segments[21].slide.items[0]", "Celeste is ringing like a bell! Being brave doesn't mean", "Celeste is ringing like a bell! She says being brave doesn't mean", "objective", "slide shows conversation line 9");
both(1185, 7, "Kiko breathes. Thank you. I feel better now.", "Kiko breathes and says, Thank you. I feel better now.", "A+C", rSays);
both(1185, 21, "It's B! Nervous is normal.", "It's B! Being nervous is normal.", "A+B", "'Nervous is normal' uses an adjective as a subject; the lesson's own line is 'Being nervous is normal.'");

// L1186
both(1186, 7, "Why do you want to go abroad, Riko? Because I want", "Why do you want to go abroad, Riko? Riko says, Because I want", "A+C", rSays + " (Riko's answer had no speaker)");
ja(1186, 7, "リコちゃん？」「ほかの", "リコちゃん？」 リコちゃん「ほかの", "A+C", rJa);
ja(1186, 0, "セレステが", "セレストが", "objective (JA)", rCeleste);

// L1187
const rUni = "'at university' (no article) is British; US 'at a university' (keeps the vocab word university)";
P(1187, "school.expressions[1].en", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
P(1187, "conversation.aiTask.targetExpressions[1]", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni + " (targetExpressions = expressions)");
P(1187, "recap.highlightsJa[1]", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
P(1187, "conversation.lines[6].en", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
TS(1187, "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
P(1187, "teacher.segments[1].slide.items[1]", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
both(1187, 8, "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
P(1187, "teacher.segments[8].slide.items[1]", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
both(1187, 16, "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
P(1187, "teacher.segments[16].slide.items[0]", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
P(1187, "teacher.segments[21].slide.items[1]", "study sea animals at university.", "study sea animals at a university.", "objective (US policy)", rUni);
TS(1187, "Then Riko closes her eyes and smiles. By the time", "Then Riko closes her eyes, smiles and says, By the time", "A+C", rSays);
TS(1187, "Birimo takes off his mustache. I like being me now, too.", "Birimo takes off his mustache and says, I like being me now, too.", "A+C", rSays);
both(1187, 6, "Birimo puts on a fake mustache. I'm playing", "Birimo puts on a fake mustache and says, I'm playing", "A+C", rSays);
both(1187, 6, "Kiko laughs. It's very fancy!", "Kiko laughs and says, It's very fancy!", "A+C", rSays);
ja(1187, 0, "セレステが", "セレストが", "objective (JA)", rCeleste);

// L1188
both(1188, 6, "Riko points. Look!", "Riko points and says, Look!", "A+C", rSays);
both(1188, 5, "You write letters to each other. Pen pal!", "You write letters to each other. Find one with a grown-up's help. Pen pal!", "A+B", "pen-pal safety: the lesson (and TPR 'Type a letter to a pen pal!') never says to find a pen pal through a grown-up");
ja(1188, 5, "おたがいに 手紙を かくよ。ペンパル！", "おたがいに 手紙を かくよ。おうちの 人と いっしょに さがしてね。ペンパル！", "A+B", rJa);
TS(1188, "We see a pilot talking to the airport,", "We see a pilot talking to the control tower,", "A+B", "pilots talk to the control tower (in English worldwide); 'talking to the airport' is vague and unnatural");
ja(1188, 0, "セレステが", "セレストが", "objective (JA)", rCeleste);

// L1189
both(1189, 18, "Are you still, and then your hobby?", "Are you still, and then your hobby.", "A+C", "an instruction, not a question; the '?' makes the voice rise as if asking the child");
ja(1189, 0, "セレステが", "セレストが", "objective (JA)", rCeleste);
ja(1189, 21, "セレステが", "セレストが", "objective (JA)", rCeleste);

// L1190
both(1190, 8, "Haru laughs. Do pancakes float in space?", "Haru laughs and asks, Do pancakes float in space?", "A+C", rSays);
ja(1190, 4, "魚が いっぱい。たいよう。", "魚が いっぱい。うみ。", "objective (JA)", "hiragana たいよう (大洋) is read by kids as 太陽 (the sun); same fix as W31-32");

const dest = path.join(REPO, ".run9-w3940/patches/14-L1181-1190.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
