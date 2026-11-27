// Build patches for L961-970 (run9 W33-34 group 10).
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
  if (after === before) throw new Error(`noop L${lesson} ${p}`);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  if (prev) {
    if (!prev.after.includes(from)) throw new Error(`merge miss L${lesson} ${p}: ${from}`);
    prev.after = prev.after.split(from).join(to);
    prev.reason += "; " + reason;
    if (prev.reviewers !== reviewers) prev.reviewers = prev.reviewers + ", " + reviewers;
    return;
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const ja = (lesson, seg, from, to, reviewers, reason) => P(lesson, `teacher.segments[${seg}].subtitleJa`, from, to, reviewers, reason);

// L961
both(961, 8, "Its last eruption was about three hundred years ago.", "Ember says, Its last eruption was about three hundred years ago.", "A+C", "the answer had no speaker after 'Riko asks', so it sounded like Riko answering herself (seg7 names Ember)");
ja(961, 8, "「さいごに ふんかしたのは だいたい 300ねん まえだよ。", "エンバー「さいごに ふんかしたのは だいたい 300ねん まえだよ。", "A+C", "JA follows the speaker added in EN");
both(961, 11, "Add ion for the thing.", "Add i, o, n for the thing.", "B+C", "bare 'ion' is read as the word ion (eye-on), not the -ion ending; spell the letters like 'Add e d'");

// L962
ja(962, 4, "あつくて あつい そう", "ぶあつくて、とても あつい そう", "objective (JA)", "'あつくて あつい' reads as 'hot and hot' in hiragana; EN is 'thick, hot' (厚い + 熱い)");

// L963
both(963, 8, "Here's the point. When, then a comma, then what happens.", "Here's the point. When plus one thing, then a comma, then what happens next.", "B+C", "'When, then a comma' says the comma comes right after when; the clause comes first");
ja(963, 8, "ポイント。when の あとに「〜すると」、それから なにが おきるか。", "ポイント。when ＋ ひとつめの こと、コンマ、それから つぎに なにが おきるか。", "B+C", "JA follows the new EN");
both(963, 10, "Add ion. Disruption.", "Add i, o, n. Disruption.", "B+C", "bare 'ion' is read as the word ion (eye-on); spell the letters");

// L964
both(964, 10, "Add ly. Abruptly.", "Add l, y. Abruptly.", "B+C", "bare 'ly' is misread by TTS (lee / lie); spell the letters");
both(964, 10, "Rupt plus ure is rupture", "Rupt plus u, r, e is rupture", "B+C", "bare 'ure' is not a word and TTS misreads it; spell the letters");

// L965
const r965 = "'ほんの すこしの センチメートル' is unnatural Japanese; 'a few centimeters' = すうセンチ";
ja(965, 7, "1ねんに ほんの すこしの センチメートル だけ！", "1ねんに ほんの すうセンチ だけ！", "objective (JA)", r965);
ja(965, 19, "1ねんに ほんの すこしの センチメートル だけ。", "1ねんに ほんの すうセンチ だけ。", "objective (JA)", r965);

// L966
P(966, "teacherScript", "At home, fix tall furniture to the wall.", "At home, attach tall furniture to the wall.", "A+B", "in US English 'fix' means repair; a child hears 'repair furniture'");
P(966, "teacherScript", "What should you fix to the wall?", "What should you attach to the wall?", "A+B", "same as the panel line");
both(966, 9, "Add ance, and a word becomes a thing.", "Add a, n, c, e, and a word becomes a thing.", "B+C", "bare 'ance' is misread by TTS (ants / ahns); spell the letters as in the teacherScript");
both(966, 10, "Keep ance short and soft.", "Keep the ending short and soft.", "B+C", "bare 'ance' again; 'the ending' reads cleanly");
ja(966, 10, "ance は みじかく やさしく。", "おわりは みじかく やさしく。", "B+C", "JA follows the new EN");

// L967
P(967, "teacherScript", "The center of a typhoon is called the eye. It is calm there.", "The center of a typhoon is called the eye. It is calm there, but the storm comes back soon.", "objective (fact)", "safety: the calm eye passes and the strong wind comes back; a child must not go outside in the eye");
both(967, 9, "Words with ent can end with ence. Silent, silence. Different, difference. It sounds like ance, so remember the first word!", "Words that end in e, n, t can end in e, n, c, e. Silent, silence. Different, difference. It sounds just like the end of distance, so remember the first word!", "B+C", "bare 'ent' / 'ence' / 'ance' are misread by TTS; spell the letters and point to a real word");
ja(967, 9, "ent で おわる ことばは ence で ものの なまえに なるよ。silent から silence。different から difference。おとは ance と おなじ だから、もとの ことばを 思い出してね！", "e、n、t で おわる ことばは e、n、c、e で ものの なまえに なるよ。silent から silence。different から difference。おとは distance の おわりと おなじ だから、もとの ことばを 思い出してね！", "B+C", "JA follows the new EN");

// L968
both(968, 9, "Sound time! Ency sounds like en see. Emergency.", "Sound time! Listen to the ending. Emergency.", "B+C", "bare 'Ency' and the invented respelling 'en see' are misread by TTS; let the real word carry the sound");
both(968, 9, "The spelling is e, n, c, y.", "The ending is spelled e, n, c, y.", "B+C", "make clear the letters are the ending only");
ja(968, 9, "おとの じかん！ ency は「ンシー」。", "おとの じかん！ おわりの「ンシー」を よく きいてね。", "B+C", "JA follows the new EN");
ja(968, 9, "つづりは e、n、c、y だよ。", "おわりの つづりは e、n、c、y だよ。", "B+C", "JA follows the new EN");

// L969
both(969, 2, "Ding, dong!", "Ding-dong!", "objective", "brief: announcement chime in the hyphen form (TTS reads it as one chime)");
both(969, 6, "I practice. Listen! Ding, dong.", "I give a practice announcement. Listen! Ding-dong.", "A+C", "'I practice.' (left by the block-wide I-say swap) sounds like a habit, not what Ms. Emma does now; chime in hyphen form");
ja(969, 6, "わたしが れんしゅう するよ。", "わたしが れんしゅうの ほうそうを するよ。", "A+C", "JA follows the new EN");
both(969, 18, "Listen. Ding, dong.", "Listen. Ding-dong.", "objective", "chime in hyphen form");
P(969, "conversation.lines[0].en", "Ding, dong.", "Ding-dong.", "objective", "chime in hyphen form, same as the aiTask starter 'Ding-dong!'");
P(969, "teacher.segments[6].slide.items[0]", "Ding, dong.", "Ding-dong.", "objective", "slide shows the conversation line");
P(969, "teacherScript", "Ding, dong, ding, dong.", "Ding-dong, ding-dong.", "objective", "chime in hyphen form");
P(969, "teacherScript", "\"Ding, dong. This is a drill.", "\"Ding-dong. This is a drill.", "objective", "chime in hyphen form");
both(969, 9, "Add ty, and a word becomes a thing.", "Add t, y, and a word becomes a thing.", "B+C", "bare 'ty' is read as 'tie'; the teacherScript already says 'add t, y'");
ja(969, 9, "ty を つけると", "t、y を つけると", "B+C", "JA follows the new EN");

// L970
both(970, 6, "I read. Question one.", "I read the first question. Question one.", "A+C", "'I read.' (left by the block-wide I-say swap) is a bare fragment and sounds like a habit");
ja(970, 6, "わたしが よむよ。", "わたしが 1もんめを よむよ。", "A+C", "JA follows the new EN");
P(970, "teacherScript", "Everyone came today, so there was no absence.", "Everyone came today, so there were no absences.", "A+B", "'there was no absence' is not natural; countable 'no absences'");

const dest = path.join(REPO, ".run9-w3334/patches/10-L961-970.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
