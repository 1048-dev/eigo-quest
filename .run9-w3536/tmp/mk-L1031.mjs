// Build patches for L1031-1040 (run9 W35-36 group 11).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  if (prev) {
    if (!prev.after.includes(from)) throw new Error(`merge miss L${lesson} ${p}: ${from}`);
    prev.after = prev.after.split(from).join(to);
    prev.reason += "; " + reason;
    if (prev.reviewers !== reviewers) prev.reviewers = prev.reviewers + ", " + reviewers;
    return;
  }
  if (!before.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = before.split(from).join(to);
  if (after === before) throw new Error(`noop L${lesson} ${p}`);
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const ja = (lesson, seg, from, to, reviewers, reason) => P(lesson, `teacher.segments[${seg}].subtitleJa`, from, to, reviewers, reason);

// L1031
both(1031, 5, "Voice. Your sound, and your idea.", "Voice. The sound you make, and your idea.", "A+B", "'Your sound' is not how a teacher defines voice; 'the sound you make' is clear and still matches こえ・いけん");

// L1032
both(1032, 8, "Yes, with one more idea? I think so, but...", "Agree, but want to add something? Say, I think so, but...", "A+C", "'Yes, with one more idea?' is cryptic and choppy to read; say when to use the frame");

// L1033
ja(1033, 9, "「ううん、ふくの！」", "「ううん、おさらを ふくの！」", "objective (JA)", "'ふくの' alone reads as 服 (clothes) in hiragana; EN is 'I DRY the dishes'");

// L1034
both(1034, 3, "A person who lives next to you.", "A person who lives near you.", "objective", "EN/JA mismatch (JA ちかくに); a neighbor lives near you, not only next door");
both(1034, 8, "Why don't we... is a friendly idea.", "Why don't we... is a friendly way to share an idea.", "A+C", "the phrase is not 'an idea' itself; JA says やさしい さそいかた");
both(1034, 9, "In the morning? No, it's on Saturday AFTERNOON!", "Saturday morning? No, it's on Saturday AFTERNOON!", "B+C", "contrast stress works only when one word changes; 'In the morning?' makes Saturday new too (tip and teacherScript ask 'Saturday morning?')");
ja(1034, 9, "「あさ？」「ううん、土曜日の ごご だよ！」", "「土曜日の あさ？」「ううん、土曜日の ごご だよ！」", "B+C", "JA follows the new EN");

// L1035
P(1035, "teacherScript", "we cleaned Willowford Park with me and the other adults", "we cleaned Willowford Park together with the other adults", "A+C", "'we ... with me' (left by the block-wide I swap) is self-contradictory and awkward to read");
P(1035, "teacherScript", "Secure, drop the e, and add ity. Say it strongly, se-CU-ri-ty.", "Secure, drop the e, and add i, t, y. Say the part before i, t, y strongly. se-CU-ri-ty.", "B+C", "'Say it strongly' stresses the whole word, not the beat before -ity (the rule taught in L1021-1024); bare 'ity' is misread by TTS");
both(1035, 10, "Make CU strong. se-CU-ri-ty.", "Make the second beat strong. se-CU-ri-ty.", "B+C", "TTS may spell 'CU' as 'C U' (see you); say which beat is strong instead");
ja(1035, 10, "CU を つよく。", "2つめの キュを つよく。", "B+C", "JA follows the new EN");
ja(1035, 3, "ちょうしゅう！", "きいて いる 人たち！", "objective (JA)", "'ちょうしゅう' (聴衆) in hiragana is opaque to kids; use the vocab gloss きいて いる 人たち");
both(1035, 6, "Riko stands up. I'd like to talk", "Riko stands up. She says, I'd like to talk", "A+C", "no speaker tag, so the line sounds like Ms. Emma's own words");

// L1036
ja(1036, 0, "あかい スカーフ！", "あかい マフラー！", "objective (JA)", "L1040 (vocab red scarf, seg0, seg5 'So warm!') and L1050 call it マフラー; keep one word");
both(1036, 5, "you touch your card here", "you tap your card here", "A+B", "US English 'tap your card' (touch = タッチ calque)");
both(1036, 10, "Spell them in chunks. Re, c, ei, ve. Receive. Re, qu, est. Request.", "Spell them. R, e, c, e, i, v, e. Receive. R, e, q, u, e, s, t. Request.", "B+C", "bare chunks 're', 'ei', 've', 'qu', 'est' are misread by TTS; spell letters as the teacherScript does");
ja(1036, 10, "かたまりで つづろう。re、c、ei、ve。receive。re、qu、est。request。", "つづって みよう。r、e、c、e、i、v、e。receive。r、e、q、u、e、s、t。request。", "B+C", "JA follows the new EN");

// L1037
both(1037, 4, "A small paper that sticks.", "A small piece of paper that sticks.", "objective", "paper (the material) is uncountable: 'a small piece of paper'");
both(1037, 9, "Two s's. A, s-s, ist.", "It has a double s. A, s, s, i, s, t.", "B+C", "'s-s' and bare 'ist' are misread by TTS; spell the letters as the teacherScript does");
ja(1037, 9, "s が 2つ。a、s-s、ist。", "s が 2つ。a、s、s、i、s、t。", "B+C", "JA follows the new EN");
both(1037, 10, "Pro, vide. Provide.", "It rhymes with ride. Provide.", "B+C", "bare 'vide' is misread by TTS (veed); a rhyme word carries the sound");
ja(1037, 10, "pro、vide。provide。", "ride と おなじ ひびき。provide。", "B+C", "JA follows the new EN");
both(1037, 17, "Make a new idea for your town.", "Think of a new idea for your town.", "A+B", "'make an idea' is a calque of アイデアを つくる; 'think of an idea' is natural");

// L1038
both(1038, 9, "Re, qu, ire.", "R, e, q, u, i, r, e.", "B+C", "bare 're', 'qu', 'ire' are misread by TTS; spell the letters as the teacherScript does");
ja(1038, 9, "re、qu、ire。", "r、e、q、u、i、r、e。", "B+C", "JA follows the new EN");
both(1038, 10, "Re, pair. With friends", "re-PAIR. With friends", "B+C", "bare 'Re' is misread (ree / ray); hyphen beat form shows the stress, like per-HAPS");
ja(1038, 10, "re、pair。", "re-PAIR。", "B+C", "JA follows the new EN");
both(1038, 17, "Your friend wants soccer, and you want art.", "Your friend wants to play soccer, and you want to draw.", "A+C", "'wants soccer / want art' is clipped and unnatural; JA already says おえかきが したい");

// L1039
P(1039, "teacherScript", "Then Riko and Leo count the votes", "Then Riko and Priya count the votes", "objective", "story contradiction: the AI Leo says 'I was outside, so I missed the vote'");
both(1039, 2, "Vote. You choose one idea. Me! This one! Vote!", "Vote. You choose one idea. I pick this one! Vote!", "A+C", "'Me!' does not fit choosing an idea and reads choppy");
ja(1039, 2, "わたし！ これ！", "これに する！", "A+C", "JA follows the new EN");
both(1039, 10, "Bi, c, y, c, le.", "B, i, c, y, c, l, e.", "B+C", "bare 'le' is misread by TTS; spell all letters");
ja(1039, 10, "bi、c、y、c、le。", "b、i、c、y、c、l、e。", "B+C", "JA follows the new EN");

// L1040
const rPhone = "電話 to a Japanese child means a telephone, which makes no sense instead of a map; US 'phone' here = smartphone (スマホ)";
P(1040, "school.expressions[2].ja", "電話", "スマホ", "objective (JA)", rPhone);
P(1040, "conversation.lines[3].ja", "電話", "スマホ", "objective (JA)", rPhone);
P(1040, "conversation.lines[4].ja", "電話", "スマホ", "objective (JA)", rPhone);
ja(1040, 7, "電話", "スマホ", "objective (JA)", rPhone);
ja(1040, 16, "電話", "スマホ", "objective (JA)", rPhone);
ja(1040, 18, "電話", "スマホ", "objective (JA)", rPhone);
both(1040, 3, "Podium. A stand where a speaker stands.", "Podium. The place where a speaker stands.", "A+C", "'a stand where ... stands' repeats stand and is clumsy to say");
both(1040, 9, "Re, c, ei, ve.", "R, e, c, e, i, v, e.", "B+C", "bare 're', 'ei', 've' are misread by TTS; spell the letters (as L1036 now does)");
ja(1040, 9, "re、c、ei、ve。", "r、e、c、e、i、v、e。", "B+C", "JA follows the new EN");
P(1040, "teacherScript", "Reality. Real plus ity.", "Reality. Real plus i, t, y.", "B+C", "bare 'ity' is misread by TTS; spell the letters");

const dest = path.join(REPO, ".run9-w3536/patches/11-L1031-1040.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
