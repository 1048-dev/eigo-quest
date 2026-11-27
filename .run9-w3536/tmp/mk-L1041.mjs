// Build patches for L1041-1050 (run9 W35-36 group 12).
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
const TS = "teacherScript";

// L1041
P(1041, TS, "Now, phonics.Spect means look.", "Now, phonics. Spect means look.", "objective", "missing space after the period (TTS runs 'phonics.Spect' together)");
const r1041 = "'I think yes' is not natural English for answering a should-question; 'I think they should' models should + base verb";
P(1041, "conversation.lines[1].en", "I think yes, because", "I think they should, because", "A+B", r1041);
both(1041, 6, "I think yes, because", "I think they should, because", "A+B", r1041);
P(1041, "teacher.segments[6].slide.items[0]", "I think yes, because", "I think they should, because", "A+B", "slide shows the conversation line");
both(1041, 8, "Is that a fact or an opinion? It's a fact. You can check it in a book!", "Is that a fact or an opinion? I answer, It's a fact. You can check it in a book!", "A+C", "the answer had no speaker after 'Kiko asks', so it sounded like Kiko answering herself (Ms. Emma answers in the conversation)");
ja(1041, 8, "「じじつよ。本で たしかめられるわ！」", "わたし「じじつよ。本で たしかめられるわ！」", "A+C", "JA follows the speaker added in EN");

// L1042
const r1042 = "story numbers: 31 bottles in ONE day does not fit L1044 (120 bottles in a whole month); 31 in one week does (about 4 weeks = about 120)";
P(1042, TS, "Yesterday, I counted the plastic bottles in this bin. There were thirty-one! Haru says, Wow, in only one day!", "This week, I counted the plastic bottles in this bin. There were thirty-one! Haru says, Wow, in only one week!", "objective", r1042);
P(1042, "conversation.lines[0].en", "in the bin yesterday!", "in the bin this week!", "objective", r1042);
P(1042, "conversation.lines[0].ja", "きのう プリヤが", "こんしゅう プリヤが", "objective", "JA follows the EN");
both(1042, 6, "in the bin yesterday!", "in the bin this week!", "objective", r1042);
ja(1042, 6, "「きのう プリヤが", "「こんしゅう プリヤが", "objective", "JA follows the EN");
P(1042, "teacher.segments[6].slide.items[0]", "in the bin yesterday!", "in the bin this week!", "objective", "slide shows the conversation line");
P(1042, "teacher.segments[18].slide.items[1]", "in the bin yesterday!", "in the bin this week!", "objective", "slide shows the conversation line");
P(1042, "conversation.aiTask.starterEn", "in the recycling bin yesterday!", "in the recycling bin this week!", "objective", r1042);
const rHead = "'Shake your hand' is not idiomatic English (it suggests a handshake); a US child refuses by shaking the head";
P(1042, "tpr[3].en", "Shake your hand and say", "Shake your head and say", "A+B", rHead);
P(1042, "tpr[3].ja", "手を ふって", "くびを よこに ふって", "A+B", "JA follows the EN");
P(1042, "tpr[3].action", "手の ひらを よこに ふって", "くびを よこに ふって", "A+B", "action follows the EN");
both(1042, 12, "Now shake your hand and say", "Now shake your head and say", "A+B", rHead);
ja(1042, 12, "手を ふって", "くびを よこに ふって", "A+B", "JA follows the EN");
P(1042, "teacher.segments[12].slide.items[1]", "Shake your hand and say", "Shake your head and say", "A+B", "slide shows the TPR line");
P(1042, "teacher.segments[13].slide.items[3]", "Shake your hand and say", "Shake your head and say", "A+B", "slide shows the TPR line");

// L1043
both(1043, 0, "we suggested our own bottles.", "we suggested bringing our own bottles.", "A+B", "'suggested our own bottles' leaves out the action; suggest + -ing");

// L1044
both(1044, 10, "Project, throw a picture forward onto a screen.", "To project is to throw a picture forward onto a screen.", "B+C", "heteronym: a bare 'Project' is read as the noun PROJ-ect; the lesson means the verb pro-JECT");

// L1045
P(1045, TS, "Then Riko asks me, Could you put a name card on each chair?", "Then Kiko asks me, Could you put a name card on each chair?", "objective", "story: Kiko asks this in the conversation and in seg7");
both(1045, 4, "Done? Tick!", "Done? Check!", "objective (US policy)", "'tick' is British; US English says check");
both(1045, 6, "Leo? Not at all!", "Leo? Birimo says, Not at all!", "A+C", "the answer had no speaker, so it sounded like Haru answering himself");
ja(1045, 6, "「いいよ！」", "ビリモ「いいよ！」", "A+C", "JA follows the speaker added in EN");
both(1045, 7, "each chair? Sure, no problem.", "each chair? I say, Sure, no problem.", "A+C", "the answer had no speaker after 'Kiko asks me'");
ja(1045, 7, "「いいわよ、まかせて。」", "わたし「いいわよ、まかせて。」", "A+C", "JA follows the speaker added in EN");

// L1046
both(1046, 2, "A short writing about what you think.", "A short piece of writing about what you think.", "A+B", "'a writing' is not natural; 'a piece of writing'");
both(1046, 9, "Popu-LAR-ity!", "Pop-u-LAR-i-ty!", "B+C", "brief: hyphen beat form for every syllable (like e-QUAL-i-ty in L1050)");
P(1046, TS, "Popularity is popular plus ity.", "Popularity is popular plus i, t, y.", "B+C", "bare 'ity' is misread by TTS; spell the letters");

// L1047
ja(1047, 8, "じぶんの アドレスも かくの？", "じぶんの じゅうしょも かくの？", "objective (JA)", "アドレス means an email address to a Japanese child; the expression is じゅうしょ (address = home address)");
both(1047, 9, "add ity.", "add i, t, y.", "B+C", "bare 'ity' is misread by TTS; spell the letters (like 'drop the e')");
ja(1047, 9, "ity を つける", "i、t、y を つける", "B+C", "JA follows the new EN");
P(1047, TS, "drop the e, plus ity.", "drop the e, plus i, t, y.", "B+C", "bare 'ity' is misread by TTS; spell the letters");
both(1047, 4, "Signature. Special writing at the end of a letter.", "Signature. Your name, signed at the end of a letter.", "A+B", "'special writing' does not say what a signature is");
ja(1047, 4, "てがみの さいごに かく とくべつな もじ。", "てがみの さいごに じぶんで かく なまえ。", "A+B", "JA follows the new EN");

// L1048
P(1048, TS, "Ability comes from able. Ble changes to bil.", "Ability comes from able. B, l, e changes to b, i, l.", "B+C", "bare 'Ble' / 'bil' are misread by TTS; spell the letters as seg9 does");

// L1049
both(1049, 9, "Curious, then ous changes to os, plus ity.", "Curious, then o, u, s changes to o, s, plus i, t, y.", "B+C", "bare 'ous' / 'os' / 'ity' are misread by TTS; spell the letters");
P(1049, TS, "Ous changes to os, then add ity.", "O, u, s changes to o, s, then add i, t, y.", "B+C", "bare 'Ous' / 'os' / 'ity' are misread by TTS; spell the letters");

// L1050
both(1050, 20, "Next is World thirty-six, the Deep Sea City!", "After that, it's World thirty-six, Deep Sea City!", "A+C", "two 'Next' sentences in a row; the place name is Deep Sea City (no article) everywhere else");
ja(1050, 20, "つぎは ワールド36、", "その あとは ワールド36、", "A+C", "JA follows the new EN");

const dest = path.join(REPO, ".run9-w3536/patches/12-L1041-1050.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
