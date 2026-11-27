// Build patches for L1141-1150 (run9 W39-40 group 10).
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
const rIon = "bare 'ion' is read by TTS as the word ion (eye-on), not the -ion ending; spell the letters as in L901 (W31 precedent 'add i, o, n')";
const rAtion = "bare 'ation' is not a word and TTS misreads it; spell the letters as in L902 ('add a, t, i, o, n')";
const rAl = "bare 'al' is read as the name Al; spell the letters as in L950 ('plus a, l')";
const rAr = "bare 'ar' is read as 'are' or the letter R; spell the letters (W31 precedent)";
const rEd = "bare 'ed' is read as the name Ed, but in endangered it is only a d sound; spell the letters";

// L1142
both(1142, 6, "Birimo brings a mountain of food. Oh no,", "Birimo brings a mountain of food and says, Oh no,", "A+C", rSays);
both(1142, 9, "Drop the e, add ion. Pollution.", "Drop the e, add i, o, n. Pollution.", "B+C", rIon);
both(1142, 10, "Drop the e, add ation. Conservation.", "Drop the e, add a, t, i, o, n. Conservation.", "B+C", rAtion);
TS(1142, "Drop the e and add ion.", "Drop the e and add i, o, n.", "B+C", rIon);
TS(1142, "Drop the e and add ation.", "Drop the e and add a, t, i, o, n.", "B+C", rAtion);

// L1143
both(1143, 9, "De, forest, ation. Deforestation.", "De, forest, a, t, i, o, n. Deforestation.", "B+C", rAtion);
both(1143, 10, "Globe, drop the e, add al. Global.", "Globe, drop the e, add a, l. Global.", "B+C", rAl);
TS(1143, "plus forest plus ation.", "plus forest plus a, t, i, o, n.", "B+C", rAtion);
TS(1143, "Drop the e and add al.", "Drop the e and add a, l.", "B+C", rAl);

// L1144
both(1144, 9, "En, danger, ed. Endangered.", "En, danger, e, d. Endangered.", "B+C", rEd);
both(1144, 9, "Sol, plus ar. Solar!", "Sol, plus a, r. Solar!", "B+C", rAr);
TS(1144, "en plus danger plus ed, which means in danger.", "en plus danger plus e, d, which means in danger.", "B+C", rEd);
TS(1144, "which means sun, plus ar.", "which means sun, plus a, r.", "B+C", rAr);

// L1145
both(1145, 7, "Haru stares at the green pins. They're everywhere.", "Haru stares at the green pins and says, They're everywhere.", "A+C", rSays);
both(1145, 10, "Sol, plus ar. Solar.", "Sol, plus a, r. Solar.", "B+C", rAr);

// L1146
both(1146, 6, "Riko laughs. Ha ha!", "Riko laughs and says, Ha ha!", "A+C", rSays);

// L1147
both(1147, 7, "Riko nods. Shops throw away food", "Riko nods and says, Shops throw away food", "A+C", rSays);
TS(1147, "And please remember, a best-before date tells you", "And please remember, a best-by date tells you", "objective (US policy)", "'best-before date' is British; US labels say 'best by' (Best if used by)");
TS(1147, "What does a best-before date tell you?", "What does a best-by date tell you?", "objective (US policy)", "same as the notice text");
ja(1147, 9, "やく eight billion、80 おくにんの 人が すんで いるよ。", "やく eight billion、80 おく人が すんで いるよ。", "objective (JA)", "'80 おくにんの 人' doubles 人 (eight billion people people); 80 おく人 is natural");

// L1148
both(1148, 6, "Riko laughs. Plastic is handy.", "Riko laughs and says, Plastic is handy.", "A+C", rSays);

// L1149
both(1149, 7, "So Haru tries again. It seems that", "So Haru tries again and says, It seems that", "A+C", rSays);
TS(1149, "Riko tries it. It seems that more people are recycling.", "Haru tries again. It seems that more people are recycling.", "objective", "story: in the conversation (lines 2-5) and seg7, Haru says 'Everyone recycles!' and then corrects himself with the target; the teacherScript gave the target to Riko");

// L1150
both(1150, 6, "Haru holds the farmer poster. From", "Haru holds the farmer poster and says, From", "A+C", rSays);
both(1150, 6, "Riko holds the shop poster. It's hard", "Riko holds the shop poster and says, It's hard", "A+C", rSays);
both(1150, 7, "Kiko giggles. And from", "Kiko giggles and says, And from", "A+C", rSays);
both(1150, 8, "Kiko finishes. Sharing extra food", "Kiko finishes and says, Sharing extra food", "A+C", rSays);

const dest = path.join(REPO, ".run9-w3940/patches/10-L1141-1150.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
