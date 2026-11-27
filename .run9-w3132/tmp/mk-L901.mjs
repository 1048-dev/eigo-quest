// Build patches for L901-910 (run9 W31-32 group 10).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const w31 = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-31.json"), "utf8"));
const lessonOf = (n) => w31.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = get(lessonOf(lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  if (!before.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = before.split(from).join(to);
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};

// L901: invent/protect/collect/connect already end in t; the ending added is -ion (src w31Phonics: "invent ＋ ion")
const r901 = "the four verbs already end in t, so we add i, o, n (invent + tion would be inventtion); matches w31Phonics 'invent + ion'";
P(901, "teacherScript", "Today, we change a verb into a noun. Add t, i, o, n, and say shun.", "Today, we change a verb into a noun. These verbs end in t. Add i, o, n, and t, i, o, n says shun.", "objective", r901);
both(901, 10, "Sound time! Add t, i, o, n to an action word, and it becomes a thing. Say it softly, shun.", "Sound time! These action words end in t. Add i, o, n, and they become things. Say t, i, o, n softly, shun.", "objective", r901);
P(901, "teacher.segments[10].subtitleJa", "おとの じかん！ うごきの ことばに t、i、o、n を つけると、ものの なまえに なるよ。やさしく「シュン」と いおう。", "おとの じかん！ この うごきの ことばは t で おわるね。i、o、n を つけると、ものの なまえに なるよ。t、i、o、n は やさしく「シュン」と いおう。", "objective", "JA follows the corrected spelling rule");
P(901, "phonics.tipJa", "どうしに -tion を つけると「～する こと・もの」と いう なまえの ことばに なるよ。", "t で おわる どうしに -ion を つけると、-tion で おわる「～する こと・もの」と いう なまえの ことばに なるよ。", "objective", r901);

// L902
both(902, 7, "Riko smiles. But they saw mountains and rivers every day.", "Riko smiles. But they used to see mountains and rivers every day.", "A+B", "Riko's line in the conversation uses today's target (used to see); the retelling dropped it");
both(902, 9, "Make A strong.", "Make the A strong.", "B+C", "TTS reads 'Make A strong' as the article ('make a strong'); L905 already says 'Make the A strong'");

// L904
both(904, 10, "Say al softly.", "Say a, l softly.", "B+C", "bare 'al' is read as the name Al /ael/; spell it like 'Add a, l' just before");
both(904, 20, "So clever. Super!", "So clever. Nice!", "A+C", "'Super!' and then 'Super job!' in the next segment; rotate praise");
P(904, "teacher.segments[20].subtitleJa", "かしこいね。すごい！", "かしこいね。いいね！", "A+C", "JA follows the new praise");

// L906
both(906, 9, "Read years two numbers at a time.", "Read years in two parts.", "A+B", "'two numbers at a time' is unclear (they are digits, and each part is one number); the teacherScript says 'in two pairs'");

// L908
P(908, "teacher.segments[8].subtitleJa", "エマ先生は にっこり。「ええ。みんな ちいさな しままで およいだのよ。」", "わたし「ええ。みんな ちいさな しままで およいだのよ。」", "objective (JA)", "EN is 'I say, Yes.' (Ms. Emma narrates herself, no smile); JA still had エマ先生は にっこり");
both(908, 10, "Sound time! Add the and an s, and it means ten years.", "Sound time! Put the in front and an s at the end. Now it means ten years.", "A+C", "'Add the and an s' runs two small words together and is hard to follow aloud; say where each goes");
P(908, "teacher.segments[10].subtitleJa", "おとの じかん！ the と s を つけると「10ねんかん」の いみに なるよ。", "おとの じかん！ まえに the、うしろに s を つけると「10ねんかん」の いみに なるよ。", "A+C", "JA follows the new EN");

// L909
both(909, 9, "Now is the twenty-first century.", "We live in the twenty-first century now.", "A+C", "'Now is the twenty-first century' is not natural English and trips the reader");
both(909, 10, "The number is one ahead!", "The number is one bigger!", "A+B", "'one ahead' is unclear for a child; the century number is one bigger than the hundreds (20th = 1900s)");
P(909, "teacher.segments[10].subtitleJa", "かずが 1つ ずれるよ！", "かずが 1つ 大きく なるよ！", "A+B", "JA follows the new EN");
both(909, 19, "The number is one ahead.", "The number is one bigger.", "A+B", "same wording fix as seg10");
P(909, "teacher.segments[19].subtitleJa", "かずが 1つ ずれるんだね。", "かずが 1つ 大きく なるんだね。", "A+B", "JA follows the new EN");

// L910
P(910, "teacherScript", "Haru guides the castle model. Kiko guides the old light bulbs. Birimo guides a piece of the Silver Wave.", "Haru talks about the castle model. Kiko talks about the old light bulbs. Birimo talks about a piece of the Silver Wave.", "A+B", "you guide people, not things ('guides the castle model' is not English)");
both(910, 20, "Great guiding!", "Way to go!", "A+C", "'Great guiding!' is followed by 'Great guides!' in the wrap-up (kept from the block-wide fix); rotate praise");
P(910, "teacher.segments[20].subtitleJa", "すてきな ガイド！", "やったね！", "A+C", "JA follows the new praise");

const dest = path.join(ROOT, ".run9-w3132/patches/10-L901-910.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
