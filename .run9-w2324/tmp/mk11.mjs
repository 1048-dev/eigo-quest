import fs from "node:fs";
const root = "C:/Users/EMICLE/eigo-quest-night/";
const w = { 23: JSON.parse(fs.readFileSync(root + "content/curriculum/worlds/world-23.json", "utf8")) };
const L = (n) => w[23].lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => a[t], o);
const out = [];
function rep(lesson, path, pairs, reviewers, reason) {
  const before = get(L(lesson), path);
  let after = before;
  for (const [a, b] of pairs) { if (!after.includes(a)) throw new Error(`L${lesson} ${path}: missing ${a}`); after = after.split(a).join(b); }
  out.push({ lesson, path, before, after, reviewers, reason });
}
function set(lesson, path, after, reviewers, reason) { out.push({ lesson, path, before: get(L(lesson), path), after, reviewers, reason }); }

// L671
rep(671, "teacherScript", [
  ["Water can change its shape.", "Water can change its form."],
  ["If you heat water to 100 degrees, it boils", "If you heat water to 100 degrees Celsius, it boils"],
  ["Water is a great shape changer!", "Water can change a lot!"],
  ["If you heat, it melts.", "If you heat ice, it melts."],
], "objective", "Science: ice/water/steam are changes of state (form), not shape; in US English 100 degrees means Fahrenheit unless Celsius is said; \"If you heat, it melts\" has no object for heat");
set(671, "conversation.aiTask.starterEn", "Let's talk about water! Dr. Moss has ice cubes and a hot plate. What happens if you heat ice?", "A+B", "Safety: the child partner (Kiko) should not have her own hot plate; the lesson says an adult runs it");

// L672
for (const p of ["say", "subtitleEn"]) rep(672, `teacher.segments[10].${p}`, [["A tip. Before ic, it's strong.", "A tip. The part before ic is strong."]], "B+C", "\"Before ic, it's strong\" is vague (what is strong?) and choppy to read; name the part");

// L675
rep(675, "teacherScript", [["Dr. Moss is the quiz master. He will read a question.", "I'm the quiz master. I will read the questions."]], "A+B", "Story logic: seg0 and the conversation make Ms. Emma the quiz host, not Dr. Moss");
rep(675, "phonics.tipJa", [["pho・TOG・ra・phy・sci・en・TIF・ic・e・lec・TRIC・i・ty・mag・NET・ic", "pho・TOG・ra・phy、sci・en・TIF・ic、e・lec・TRIC・i・ty、mag・NET・ic"]], "objective (JA)", "The same mark ・ split syllables and words, so the four words ran together; separate words with 、");

// L677
rep(677, "teacherScript", [["So, our notebook, our books", "So, our notebooks, our books"]], "objective", "Plural: \"our notebooks, our books and even our boxes\"");
set(677, "conversation.lines[5].en", "We can recycle old paper. Let's collect our old notebooks.", "A+B", "\"save\" reads as keep, which fights the recycling message (JA とって おこう = keep); collect them for recycling");
set(677, "conversation.lines[5].ja", "ふるい かみは リサイクルできるね。ふるい ノートを あつめよう。", "A+B", "Match the English (collect)");

// L678
rep(678, "teacherScript", [["In autumn, the rice turns gold", "In the fall, the rice turns gold"]], "objective", "US English: fall, not autumn (the block-wide fix only matched lowercase \"in autumn\")");
for (const p of ["say", "subtitleEn"]) rep(678, `teacher.segments[9].${p}`, [["Short words with one short vowel, like sun. Double the last letter, then add y.", "Short words like sun end in one vowel and one consonant. Double the last letter, then add y."]], "objective", "Wrong rule: star (starry) has no short vowel; the spelling rule is one vowel letter + one final consonant");
rep(678, "teacher.segments[9].subtitleJa", [["sun の ように みじかい ぼいんの ことばは、", "sun の ように ぼいん 1つと しいん 1つで おわる みじかい ことばは、"]], "objective", "Match the corrected rule (star has no short vowel)");
rep(678, "phonics.tipJa", [["みじかい ぼいん ＋ しいん 1つで おわる ことばは、しいんを かさねてから", "ぼいん 1つ ＋ しいん 1つで おわる みじかい ことばは、さいごの しいんを かさねてから"]], "objective", "Wrong rule: star (starry) has no short vowel; one vowel letter + one final consonant");

// L679
rep(679, "teacherScript", [["Ghana and Cote d'Ivoire in West Africa", "Ghana and the Ivory Coast in West Africa"]], "A+C", "US teachers say the Ivory Coast to kids; \"Cote d'Ivoire\" without the accent is a TTS trap");
rep(679, "phonics.tipJa", [["-y の まとめ（ブロックの 4 回目）: ", "-y の まとめ: "]], "objective (JA)", "\"ブロックの 4 回目\" is internal planning jargon, not for children");

// L680
for (const p of ["say", "subtitleEn"]) rep(680, `teacher.segments[7].${p}`, [["Riko asks, Is it made of plastic? No, it isn't.", "Riko asks, Is it made of plastic? I say, No, it isn't."]], "A+C", "The answer had no speaker, so it sounds like Riko answers her own question");
rep(680, "teacher.segments[7].subtitleJa", [["リコちゃん「プラスチックで できて いる？」「いいえ、", "リコちゃん「プラスチックで できて いる？」 わたし「いいえ、"]], "A+C", "Match the English (I say)");

fs.writeFileSync(root + ".run9-w2324/patches/11-L671-680.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length);
