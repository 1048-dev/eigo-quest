// Build patches for L1051-1060 (run9 W35-36 group 13).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  const base = prev ? prev.after : before;
  if (!base.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = base.split(from).join(to);
  if (after === base) throw new Error(`noop L${lesson} ${p}`);
  if (prev) {
    prev.after = after;
    prev.reason += "; " + reason;
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

// L1051
both(1051, 4, "The person who drives it.", "The person who drives the submarine.", "A+B", "'it' had nothing to point to (the segment before was about a porthole on a ship)");
ja(1051, 4, "のりものを うごかす 人。", "せんすいていを うごかす 人。", "A+B", "JA follows the new EN");

// L1052
both(1052, 8, "Birimo blinks back at Lumi.", "Birimo blinks his fingers at Lumi.", "objective", "story order: in the conversation Birimo blinks first and Lumi blinks back, so Birimo cannot blink 'back'");
both(1052, 10, "Every place on Earth where life lives.", "Every place on Earth where there is life.", "A+C", "'where life lives' is an odd echo and not natural; the teacherScript says 'where life exists'");

// L1053: "It reaches well only the top 200 meters" puts the adverb between verb and object (like "speak well English")
const r53 = "'reaches well only the top 200 meters' puts 'well' between the verb and its object, which is not English word order; 'Bright sunlight reaches only the top 200 meters' keeps the verb of the question and the fact (some dim light goes to 1,000 m)";
const E53 = "It reaches well only the top 200 meters.";
const N53 = "Bright sunlight reaches only the top 200 meters.";
P(1053, "school.grammar", "It reaches well only ～.", "Bright sunlight reaches only ～.", "A+B", r53);
P(1053, "school.expressions[1].en", E53, N53, "A+B", r53);
P(1053, "school.expressions[1].ja", "よく とどくのは 上の 200 メートル だけだよ。", "明るい 日の光が とどくのは 上の 200 メートル だけだよ。", "A+B", "JA follows the new EN");
P(1053, "conversation.aiTask.targetExpressions[1]", E53, N53, "A+B", "must equal school.expressions");
P(1053, "recap.highlightsJa[1]", E53, N53, "A+B", "recap shows the expression");
for (const s of ["teacher.segments[6].slide.items[1]", "teacher.segments[15].slide.items[0]", "teacher.segments[20].slide.items[1]"]) P(1053, s, E53, N53, "A+B", "slide shows the expression");
P(1053, "conversation.lines[3].en", "it reaches well only the top 200 meters.", "bright sunlight reaches only the top 200 meters.", "A+B", r53);
P(1053, "conversation.lines[3].ja", "よく とどくのは 上の 200 メートル だけだって。", "明るい 日の光が とどくのは 上の 200 メートル だけだって。", "A+B", "JA follows the new EN");
both(1053, 6, "It reaches well only the top two hundred meters.", "Bright sunlight reaches only the top two hundred meters.", "A+B", r53);
ja(1053, 6, "「よく とどくのは 上の 200 メートル だけ。」", "「あかるい 日の ひかりが とどくのは 上の 200 メートル だけ。」", "A+B", "JA follows the new EN");
P(1053, "teacherScript", "Sunlight reaches well only this top part of the ocean.", "Bright sunlight reaches only this top part of the ocean.", "A+B", r53);
P(1053, "teacherScript", "How far does sunlight reach well? About 200 meters.", "How far does bright sunlight reach? About 200 meters.", "A+B", "same wording as the chart");
both(1053, 8, "The reason why, then what you see, then is that, then the reason.", "The reason why, then what happens, then is that, then the reason.", "A+B", "the slot after 'the reason why' is the fact being explained, not 'what you see' (the example is 'why I'm cold')");
ja(1053, 8, "The reason why、見て いる こと、is that、そして りゆう。", "The reason why、おきて いる こと、is that、そして りゆう。", "A+B", "JA follows the new EN");

// L1054
both(1054, 8, "Ha ha, no! Why don't they get crushed?", "Kiko laughs. Ha ha, no! Why don't they get crushed?", "A+C", "Kiko's answer to Birimo had no speaker, so it sounded like Ms. Emma laughing at Birimo");
ja(1054, 8, "あはは、ちがうよ！ どうして", "キコちゃんが わらうよ。「あはは、ちがうよ！」 どうして", "A+C", "JA follows the speaker added in EN");

// L1056
both(1056, 8, "Start with How, Why, What, or Do.", "Start with How, Why, What, or Do. If nobody knows yet, that's OK. That's why we do research!", "objective (JA)", "subtitleJa had 'まだ だれも しらなくても だいじょうぶ。だから けんきゅう するんだよ！' with no English; the slide shows Birimo's 'Nobody knows yet?' line; the sentences come from Dr. Vale's whiteboard");
ja(1056, 7, " ビリモ「まだ だれも しらないの？ じゃあ しらべて みよう！」", "", "objective (JA)", "JA had an extra Birimo line that the English segment does not say");
ja(1056, 20, "ともだちが なにを しらべたいか きける。つよい ところで 手も たたけるね。", "ともだちが なにを しらべたいか きけるね。", "objective (JA)", "JA had an extra sentence (clapping) that the English does not say");

// L1057
both(1057, 7, "Can I interview you for my research? Of course! What would you like to know?", "Can I interview you for my research? Dr. Vale says, Of course! What would you like to know?", "A+C", "the answer had no speaker, so it sounded like Haru answering himself");
ja(1057, 7, "「もちろん！ なにが しりたい？」", "ヴェイルはかせ「もちろん！ なにが しりたい？」", "A+C", "JA follows the speaker added in EN");
both(1057, 10, "Words that end in tion are strong just before tion.", "Words that end in t, i, o, n are strong just before the ending.", "B+C", "bare 'tion' is misread by TTS (tie-on); spell the letters");
ja(1057, 10, "tion で おわる ことばは、tion の すぐ まえが つよいよ。", "t、i、o、n で おわる ことばは、その すぐ まえが つよいよ。", "B+C", "JA follows the new EN");
P(1057, "teacherScript", "Words that end in -tion are strong just before -tion.", "Words that end in t, i, o, n are strong just before the ending.", "B+C", "bare '-tion' read aloud; same fix as the segment");
both(1057, 19, "and stress information on MA.", "and clap the strong beat in information.", "A+C", "'stress information on MA' is teacher jargon, and TTS may read the bare capitals MA as M, A");
ja(1057, 19, "information は MA を つよく いえるね。", "information の つよい ところで 手を たたけるね。", "A+C", "JA follows the new EN");

// L1058
const r58 = "'go back down in the day' is not natural US English; 'during the day' (the book page already says 'During the day')";
const E58 = "they go back down in the day.";
const N58 = "they go back down during the day.";
P(1058, "school.expressions[2].en", E58, N58, "A+B", r58);
P(1058, "conversation.aiTask.targetExpressions[2]", E58, N58, "A+B", "must equal school.expressions");
P(1058, "recap.highlightsJa[1]", E58, N58, "A+B", "recap shows the expression");
P(1058, "conversation.lines[4].en", E58, N58, "A+B", r58);
for (const s of ["teacher.segments[7].slide.items[0]", "teacher.segments[18].slide.items[2]"]) P(1058, s, E58, N58, "A+B", "slide shows the expression");
both(1058, 7, E58, N58, "A+B", r58);
both(1058, 17, "In the day, back down.", "During the day, back down.", "A+B", "same as the expression");
both(1058, 7, "Birimo pats a round tummy.", "Birimo pats his round tummy.", "A+C", "'pats a round tummy' sounds like someone else's tummy");
both(1058, 10, "Sion is like tion. The beat just before it is strong.", "Conclusion ends like information. The beat just before the ending is strong.", "B+C", "bare 'sion' / 'tion' are misread by TTS; carry the ending with real words (information was taught in L1057)");
ja(1058, 10, "sion も tion と おなじ。すぐ まえが つよいよ。", "conclusion の おわりは information と おなじ。その すぐ まえが つよいよ。", "B+C", "JA follows the new EN");
P(1058, "teacherScript", "Words that end in -tion or -sion are strong just before the ending.", "Words like information and conclusion are strong just before the ending.", "B+C", "bare '-tion' / '-sion' read aloud; same fix as the segment");

// L1059
both(1059, 7, "Haru asks, Does it show its sources? No, it doesn't.", "Haru asks, Does it show its sources? Birimo says, No, it doesn't.", "A+C", "the answer had no speaker, so it sounded like Haru answering himself (the conversation gives it to Birimo)");
ja(1059, 7, "「ううん、のって ない。」", "ビリモ「ううん、のって ない。」", "A+C", "JA follows the speaker added in EN");
both(1059, 10, "Presentation ends in tion, so", "Presentation ends in t, i, o, n, so", "B+C", "bare 'tion' is misread by TTS; spell the letters");
ja(1059, 10, "presentation は tion で おわるから", "presentation は t、i、o、n で おわるから", "B+C", "JA follows the new EN");
P(1059, "teacherScript", "It ends in -tion, so the strong part is just before it.", "It ends in t, i, o, n, so the strong part is just before the ending.", "B+C", "bare '-tion' read aloud; same fix as the segment");

const dest = path.join(REPO, ".run9-w3536/patches/13-L1051-1060.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
