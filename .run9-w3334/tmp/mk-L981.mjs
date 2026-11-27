// Build patches for L981-990 (run9 W33-34 group 12).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const m = loadWorlds([33]);
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(m, lesson), p);
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

// L982
P(982, "teacherScript", "Kiko and Ms. Emma carry the oranges", "Kiko and I carry the oranges", "objective", "Ms. Emma narrates her own story (the next sentence says 'each of us'); first person like the block-wide fix");
P(982, "conversation.lines[6].en", "Lovely! Kind words", "Nice job! Kind words", "objective (US policy)", "British praise 'Lovely!' (block-wide swap missed this conversation line)");
P(982, "conversation.lines[6].ja", "すてき！ やさしい", "よく できたね！ やさしい", "objective (US policy)", "JA follows the new praise");
both(982, 3, "Knock, knock! Hello, next door!", "Knock, knock! Hi! I live next door!", "A+B", "'next door' is not a form of address in US English; show the word in a real sentence");
P(982, "teacher.segments[3].subtitleJa", "コン、コン！ こんにちは、おとなりさん！", "コン、コン！ こんにちは！ となりに すんで いる ものです！", "A+B", "JA follows the new EN");

// L983
both(983, 9, "Inject, put something into.", "Inject, put something inside.", "A+C", "'put something into' ends on a dangling preposition and sounds cut off aloud");

// L984
both(984, 9, "Rejection, a no answer.", "Rejection, when someone says no.", "A+C", "'a no answer' is not natural English; the teacherScript says 'A rejection is when someone says no'");

// L986
both(986, 2, "A big paper with words", "A big sheet of paper with words", "A+B", "'paper' is uncountable here ('a big paper' = a big essay/newspaper); 'a big sheet of paper'");
both(986, 9, "Rupt means burst, so a volcano bursts out.", "Rupt means burst. An eruption is when a volcano bursts out.", "A+B", "the say skipped what the word eruption means ('so a volcano bursts out' does not follow); matches the teacherScript");
P(986, "teacher.segments[9].subtitleJa", "rupt は「やぶれる」、かざんが ふきだす こと。", "rupt は「やぶれる」。eruption は かざんが ふきだす こと。", "A+B", "JA follows the new EN");

// L987
P(987, "teacherScript", "Ms. Emma nods and says, Read the instructions.", "I nod and say, Read the instructions.", "objective", "Ms. Emma narrates herself in the first person (seg6 already says 'I tap the card')");
both(987, 8, "Let me check, right? helps you make sure you understand.", "Start with Let me check, and end with right? That helps you make sure you understand.", "A+C", "'Let me check, right? helps you ...' glues two cue words into a subject; unclear and hard to read aloud");
P(987, "teacher.segments[8].subtitleJa", "Let me check ～, right? で、ちゃんと", "Let me check で はじめて、さいごに right? を つけると、ちゃんと", "A+C", "JA follows the new EN");

// L988
P(988, "teacherScript", "Birimo promises to learn every exit at the festival!", "Birimo promises to stay calm and help his friends!", "objective", "story contradiction: in the conversation and seg7 Birimo promises to stay calm and help his friends");

// L989
both(989, 9, "Dustproof keeps out dust and sand.", "Dustproof means it keeps out dust and sand.", "A+B", "dustproof is an adjective and cannot be the subject of 'keeps out'; the teacherScript says 'A dustproof radio keeps out dust'");
P(989, "teacher.segments[9].subtitleJa", "dustproof は ほこりや すなを 入れない。", "dustproof は ほこりや すなを 入れない と いう いみ。", "A+B", "JA follows the new EN");
both(989, 10, "Is it a drill, up, or a real alarm, down?", "Is it a drill or a real alarm? A drill, up. Or a real alarm, down.", "B+C", "the up/down cues were inside the question, so the voice cannot perform the intonation; say the question first, then the cues (as in the teacherScript and other reviews)");
P(989, "teacher.segments[10].subtitleJa", "くんれん（上げる）？ それとも ほんものの けいほう（下げる）？", "Is it a drill or a real alarm? a drill で 上げる。or a real alarm で 下げる。", "B+C", "JA follows the new EN (same style as L987 seg10)");

// L990
both(990, 20, "Next is World thirty-four, the Airport of Wings!", "After that, it's World thirty-four, the Airport of Wings!", "A+C", "'Next, go and talk with Riko! Next is World ...' repeats Next back to back");
P(990, "teacher.segments[20].subtitleJa", "つぎは ワールド34、つばさの空港！", "その つぎは ワールド34、つばさの空港！", "A+C", "JA follows the new EN");

const dest = path.join(REPO, ".run9-w3334/patches/12-L981-990.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
