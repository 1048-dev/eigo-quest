// Build patches for L1151-1160 (run9 W39-40 group 11).
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

const rSays = "the quote has no 'says', so the voice reads the character's words (with I / we) as my own";
const rHow = "'however' is stressed on the second syllable (how-EV-er), not HOW; HOWever teaches the wrong stress";
const rFirst = "the stressed part is not always the first part (how-EV-er, for ex-AM-ple, more-O-ver, as a re-SULT)";
const rMaybe = "'Maybe,' as an example marker sounds like hedging (taught in L1161); 'For example,' matches the JA たとえば";
const rLit = "'lit up' (past) breaks the present-tense story narration around it";

// L1151
P(1151, "conversation.lines[3].en", "Rule one: take turns.", "Rule two: take turns.", "objective", "story: in Orbit's rules (teacherScript reading) rule one is two teams; take turns is rule two");
P(1151, "conversation.lines[3].ja", "ルール 1、", "ルール 2、", "objective", "JA follows the new EN");
P(1151, "conversation.lines[4].ja", "しつれいに したくないな。", "しつれいな ことは したくないな。", "objective (JA)", "'しつれいに したくない' is unnatural Japanese");
both(1151, 7, "Kiko worries. What if I don't agree?", "Kiko worries and asks, What if I don't agree?", "A+C", rSays);
both(1151, 7, "Kiko smiles. Got it.", "Kiko smiles and says, Got it.", "A+C", rSays);

// L1152
both(1152, 6, "Birimo reads the topic. Which side are you on, Haru?", "Birimo reads the topic and asks, Which side are you on, Haru?", "A+C", rSays);
both(1152, 6, "Then Riko stands up tall. We believe", "Then Riko stands up tall and says, We believe", "A+C", rSays);
both(1152, 7, "Birimo grins. I'm playing", "Birimo grins and says, I'm playing", "A+C", rSays);
both(1152, 8, "Strong in the middle, and down at the end.", "Strong on the key word, and down at the end.", "B+C", "in 'We STRONGly believe' the stress is at the start, not the middle; the rule is the key word");
ja(1152, 8, "まんなかを つよく、さいごは さげて。", "だいじな ことばを つよく、さいごは さげて。", "B+C", "JA follows the new EN");
both(1152, 16, "Maybe, schools should have more books.", "For example, schools should have more books.", "A+B", rMaybe);

// L1153
P(1153, "conversation.lines[7].en", "Good point. But don't worry, we'll think of an answer!", "Good point. But just wait, we'll think of an answer!", "A+B", "Kiko (no team) telling the yes team 'don't worry' is odd; she means 'just wait' (JA でも 見てて)");
both(1153, 16, "Maybe, gardens make us happy.", "For example, gardens make us happy.", "A+B", rMaybe);

// L1154
ja(1154, 4, "summer holidays。", "summer vacation。", "objective (US policy)", "the block-wide holidays -> vacation swap missed this JA subtitle; it must show the vocab word summer vacation");
both(1154, 7, "Haru thinks. Maybe families could help.", "Haru thinks and says, Maybe families could help.", "A+C", rSays);
both(1154, 16, "Imagine the topic is, Homework every day.", "Imagine the topic is, Students should have homework every day.", "A+B", "a debate topic is a statement to agree or disagree with, like 'Schools should have gardens'");
ja(1154, 16, "テーマが「しゅくだいは まいにち」だと", "テーマが「生徒は まいにち しゅくだいを するべき」だと", "A+B", "JA follows the new EN");

// L1155
both(1155, 1, "Start the yes team, pass to the other team,", "Start with the yes team, pass to the other team,", "A+B", "'Start the yes team' is unnatural; 'Start with the yes team'");
both(1155, 7, "Kiko smiles. Good point!", "Kiko smiles and says, Good point!", "A+C", rSays);
both(1155, 8, "Drop the e, and add ion.", "Drop the e, and add i, o, n.", "B+C", "a bare 'ion' is read by TTS as the word ion (eye-on), not the -tion ending; spell the letters");
TS(1155, "drop the e and add ion.", "drop the e and add i, o, n.", "B+C", "same as seg8 (bare 'ion')");
TS(1155, "The Lantern of Debate lit up!", "The Lantern of Debate lights up!", "A+C", rLit);

// L1156
P(1156, "phonics.sounds[0]", "HOWever, ‖", "howEVer, ‖", "objective", rHow);
P(1156, "phonics.tipJa", "HOWever, ‖（でも・しかし）", "howEVer, ‖（でも・しかし）", "objective", rHow);
P(1156, "phonics.tipJa", "さいしょの 大文字の ところを つよく", "大文字の ところを つよく", "objective", rFirst);
P(1156, "school.testPoints[1]", "HOWever, ‖", "howEVer, ‖", "objective", rHow);
P(1156, "school.testPoints[1]", "さいしょを つよく、", "大文字の ところを つよく、", "objective", rFirst);
TS(1156, "Say the first part strongly and take a short pause after the comma. HOWever, pause,", "Stress the strong part and take a short pause after the comma. HowEVer, pause,", "objective", rHow + "; " + rFirst);
both(1156, 8, "Say the first part strong, then pause after the comma. HOWever, pause.", "Say the capital part strongly, then pause after the comma. HowEVer, pause.", "objective", rHow + "; " + rFirst);
ja(1156, 8, "さいしょを つよく いって、", "大文字の ところを つよく いって、", "objective", rFirst);
ja(1156, 8, "HOWever、", "howEVer、", "objective", rHow);
both(1156, 9, "HOWever", "HowEVer", "objective", rHow);
ja(1156, 9, "HOWever", "howEVer", "objective", rHow);
both(1156, 7, "Birimo plays a hungry squirrel. I'll take all the nuts! No way!", "Birimo plays a hungry squirrel and says, I'll take all the nuts! Riko says, No way!", "objective", "no speakers: the voice reads 'I'll take all the nuts! No way!' as my own lines; the JA has リコちゃん for No way");

// L1157
both(1157, 8, "Sound time! Strong start, then pause.", "Sound time! Strong part, then pause.", "B+C", rFirst);
ja(1157, 8, "さいしょを つよく、それから 間。", "大文字の ところを つよく、それから 間。", "B+C", rFirst);
ja(1157, 6, "「くらい 夜空の 1 時間」", "「くらい 空の 1 時間」", "A+B", "Dark Sky Hour is くらい 空の 1 時間 everywhere else (sceneJa, line 0, topic)");

// L1158
both(1158, 7, "Kiko thinks. I could turn off the tap", "Kiko thinks and says, I could turn off the tap", "A+C", rSays);

// L1160
P(1160, "phonics.sounds[0]", "HOWever, ‖", "howEVer, ‖", "objective", rHow);
P(1160, "phonics.tipJa", "HOWever, ‖ と THEREfore, ‖（さいしょを つよく、", "howEVer, ‖ と THEREfore, ‖（大文字の ところを つよく、", "objective", rHow + "; " + rFirst);
P(1160, "school.testPoints[1]", "HOWever, ‖", "howEVer, ‖", "objective", rHow);
TS(1160, "HOWever, pause, shows a different idea.", "HowEVer, pause, shows a different idea.", "objective", rHow);
TS(1160, "The Lantern of Action lit up!", "The Lantern of Action lights up!", "A+C", rLit);
TS(1160, "Therefore, everyone can help, step by step.", "With this plan, everyone can help, step by step.", "A+B", "'Therefore' must show a result, but 'everyone can help' does not follow from the bread goal");
both(1160, 8, "Review time! HOWever, pause. THEREfore, pause. Strong start, then a pause.", "Review time! HowEVer, pause. THEREfore, pause. Stress the capital part, then pause.", "objective", rHow + "; " + rFirst);
ja(1160, 8, "HOWever、ひと休み。", "howEVer、ひと休み。", "objective", rHow);
ja(1160, 8, "さいしょを つよく、それから 間。", "大文字の ところを つよく、それから 間。", "objective", rFirst);
P(1160, "teacher.segments[8].slide.items[0]", "HOWever, ‖", "howEVer, ‖", "objective", rHow);
both(1160, 9, "HOWever.", "HowEVer.", "objective", rHow);
ja(1160, 9, "HOWever。", "howEVer。", "objective", rHow);
both(1160, 5, "A list you tick when each job is done. Tick, tick, done!", "A list you check off when each job is done. Check, check, done!", "objective (US policy)", "'tick' (a list) is British; US English says check off (JA already チェック)");

const dest = path.join(REPO, ".run9-w3940/patches/11-L1151-1160.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
