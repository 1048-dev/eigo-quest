// Build patches/10-L781-790.json from dump/L781-790.txt
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const dump = fs.readFileSync(path.join(dir, "dump/L781-790.txt"), "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const line of dump) {
  const h = /^## L(\d+)/.exec(line);
  if (h) { L = +h[1]; cur[L] = {}; continue; }
  const m = /^(\S+) = (".*")$/.exec(line);
  if (m && L) cur[L][m[1]] = JSON.parse(m[2]);
}
const out = [];
function rep(lesson, p, pairs, reviewers, reason) {
  const before = cur[lesson][p];
  if (before === undefined) throw new Error(`NOPATH L${lesson} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`NOTFOUND L${lesson} ${p}: ${a}`);
    after = after.split(a).join(b);
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
const both = (lesson, i, pairs, reviewers, reason) => {
  rep(lesson, seg(i, "say"), pairs, reviewers, reason);
  rep(lesson, seg(i, "subtitleEn"), pairs, reviewers, "match say");
};
const K = "TTS reads the bare letter k as 'kay'; 'a k sound' is how US teachers name the sound";

// L781
rep(781, "teacherScript", [["Today, c h says k.", "Today, c h makes a k sound."]], "B+C", K);
both(781, 9, [["C H usually says ch, like cheese. But sometimes it says k! Echo. School. Hear the k?", "C H usually sounds like the start of cheese. But sometimes it makes a k sound! Echo. School. Hear the k sound?"]], "B+C", "bare letter group 'ch' and bare 'k' are TTS risks; name the sound with a real word");
rep(781, seg(9, "subtitleJa"), [["cheese みたいに。でも ときどき「ク」に なるよ！", "cheese の はじめの おと。でも ときどき「ク」の おとに なるよ！"]], "B+C", "match EN");

// L782
both(782, 8, [["Answer with I have a, and then say, That's too bad.", "Answer, I have a headache. Then your friend says, That's too bad."]], "B+C", "EN made the same child say both lines (JA says the asker says That's too bad); bare 'I have a' is a TTS stumble");
rep(782, seg(8, "subtitleJa"), [["I have a ～ で こたえて、きいた ひとは That's too bad. と いおう。", "I have a headache. と こたえたら、きいた ともだちは That's too bad. と いうよ。"]], "B+C", "match EN");
both(782, 9, [["The C H says k, and", "The C H makes a k sound, and"]], "B+C", K);

// L783
rep(783, "teacherScript", [
  ["Ms. Emma tells Birimo to sit and rest.", "I tell Birimo to sit and rest."],
  ["Stomach. The c h says k.", "Stomach. The c h makes a k sound."],
  ["Here, c h says k, too.", "Here, c h makes a k sound, too."],
], "A+B", "Ms. Emma's own narration in the third person (block rule: I ...); bare 'k' TTS risk");
rep(783, "conversation.aiTask.goalJa", [["AI の エマ先生と", "AI の キコと"]], "objective (JA)", "the app never shows Ms. Emma as the AI partner; the partner is Kiko (wrap-up: talk with Kiko)");
both(783, 9, [["Stomach. The C H says k.", "Stomach. The C H makes a k sound."]], "B+C", K);
both(783, 10, [["Orchestra. Lots of music together. C H says k here, too.", "Orchestra. Many musicians play together. C H makes a k sound here, too."]], "A+B", "an orchestra is a group of musicians, not 'lots of music' (JA: たくさんの がっきで えんそう); bare 'k' TTS risk");

// L784
rep(784, "teacherScript", [
  ["Ms. Emma takes him to the little clinic.", "I take him to the little clinic."],
  ["Mechanic. The c h says k.", "Mechanic. The c h makes a k sound."],
  ["Again, c h says k.", "Again, c h makes a k sound."],
], "A+B", "Ms. Emma's own narration in the third person (block rule: I ...); bare 'k' TTS risk");
both(784, 0, [["Let's go with Ms. Emma to the little clinic.", "Let's take him to the little clinic."]], "A+B", "Ms. Emma is the narrator; 'go with Ms. Emma' talks about herself in the third person");
rep(784, seg(0, "subtitleJa"), [["エマ先生と いっしょに ちいさな しんりょうじょへ いこう。", "ハルくんを ちいさな しんりょうじょへ つれて いこう。"]], "A+B", "match EN");
both(784, 9, [["The C H says k!", "The C H makes a k sound!"]], "B+C", K);
both(784, 10, [["C H says k, and the T is quiet.", "C H makes a k sound, and the T is quiet."]], "B+C", K);
rep(784, "conversation.lines[5].en", [["Thank you, doctor.", "Thank you, Dr. Fern."]], "objective", "lowercase 'doctor' in direct address; use the name");

// L785
rep(785, "teacherScript", [
  ["I hope you feel better soon. Lovely! We can", "I hope you feel better soon. Great! We can"],
  ["School. C h says k. Stomach. C h says k again.", "School. C h makes a k sound. Stomach. C h makes a k sound again."],
], "A+B", "British praise 'Lovely!' (block rule: US praise); bare 'k' TTS risk");
rep(785, "conversation.aiTask.goalJa", [["AI の エマ先生と いっしょに", "AI の キコと いっしょに"]], "objective (JA)", "the app never shows Ms. Emma as the AI partner; the partner is Kiko (wrap-up: talk with Kiko)");
both(785, 3, [["A folded paper with", "A folded piece of paper with"]], "A+B", "paper is uncountable here; 'a folded piece of paper'");
both(785, 9, [["C H can say k.", "C H can make a k sound."]], "B+C", K);
both(785, 10, [["Head, ache. Stom, ach, ache.", "Head-ache. Stom-ach-ache."]], "B+C", "comma-split syllables ('Stom, ach') read as separate words (ach like German); use the hyphen beat form");
rep(785, seg(10, "subtitleJa"), [["head、ache。stom、ach、ache。", "head-ache。stom-ach-ache。"]], "B+C", "match EN");

// L787
both(787, 20, [["Next, go and talk with Kiko! Good night, and see you!", "Next, go and talk with Kiko! See you!"]], "A+B", "'Good night' as Ms. Emma's own goodbye assumes the child's time of day");
rep(787, seg(20, "subtitleJa"), [["おやすみ、またね！", "またね！"]], "A+B", "match EN");

// L788
both(788, 1, [["Tell good habits with ing words.", "Talk about good habits with ing words."]], "A+B", "'tell good habits' is not natural English (tell needs a listener or 'about')");

// L789
both(789, 7, [["Ms. Emma smiles. That's a good balance.", "I say, That's a good balance."]], "A+B", "Ms. Emma's own narration in the third person (block rule: I say)");
rep(789, seg(7, "subtitleJa"), [["エマ先生が にっこり。「いい バランスね。」", "わたし「いい バランスね。」"]], "A+B", "match EN");

// L790
rep(790, "conversation.aiTask.goalJa", [["AI の エマ先生に", "AI の リコに"]], "objective (JA)", "the app never shows Ms. Emma as the AI partner; the partner is Riko (wrap-up: talk with Riko)");

fs.writeFileSync(path.join(dir, "patches/10-L781-790.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
