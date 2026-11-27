// Builds .run9-w3132/patches/11-L911-920.json from substring replacements on the CURRENT world-31 values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-31.json"), "utf8"));
const lessonOf = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const SE = (i) => [`teacher.segments[${i}].say`, `teacher.segments[${i}].subtitleEn`];
const JA = (i) => [`teacher.segments[${i}].subtitleJa`];
const WHO = { reviewers: "A+B+C", reason: "'means a person who.' stops in the middle of the definition; finish it as the teacherScript does ('a person who does something')" };
const SELF = { reviewers: "A+B", reason: "'Talk about you' is not natural; a US teacher says 'Talk about yourself'" };

const spec = [
  // L911
  [911, SE(8), "Here's the point. Was born is always in the past.", "Here's the point. We say was born, not just born.", "A+B", "'Was born is always in the past' does not teach the form; Japanese learners often say 'I born in ~', so point at the was"],
  [911, JA(8), "ポイント。「was born」は いつも かこの いいかた だよ。ステラは つくりの ひと だけど、", "ポイント。born だけ では なく「was born」と いうよ。ステラは つくりばなしの ひと だけど、", "A+B", "JA follows the new point; also つくりの ひと is not natural Japanese (objective JA)"],
  // L912
  [912, SE(8), "Here's the point. When she was ten, then what she did. Both in the past.", "Here's the point. First say when, like When she was ten. Then say what she did. Both are in the past.", "A+B+C", "the point was a sentence fragment ('When she was ten, then what she did.') and hard to read aloud"],
  [912, SE(16), "Your turn! Talk about you.", "Your turn! Talk about yourself.", SELF.reviewers, SELF.reason],
  [912, JA(12), "かため を とじて。", "かためを とじて。", "objective (JA)", "stray space inside the word かためを"],
  // L913
  [913, SE(8), "Here's the point. So shows what happened next. Poor, so she borrowed books.", "Here's the point. So shows the result. Her family was poor, so she borrowed books.", "A+B", "so shows a result, not just 'what happened next'; 'Poor, so she borrowed books.' is a fragment (the JA already says だから どう なったか)"],
  [913, SE(20), "and use so for what happened next.", "and use so to show the result.", "A+B", "same rule as the point segment: so shows the result"],
  [913, JA(20), "so で つぎに どう なったか いえるね。", "so で「だから どう なったか」を いえるね。", "A+B", "JA follows the corrected rule (same wording as the point segment)"],
  // L914
  [914, ["conversation.lines[0].ja"], "そんなの ずるい！", "そんなの おかしいよ！", "objective (JA)", "ずるい means sly/cheating; for unfair treatment of girls 'That's not fair!' is おかしいよ"],
  [914, JA(6), "そんなの ずるい！", "そんなの おかしいよ！", "objective (JA)", "same as the conversation line"],
  [914, SE(17), "Your turn! Say it about you.", "Your turn! Say it about yourself.", SELF.reviewers, SELF.reason],
  // L915
  [915, SE(5), "Sentence. Words together with a full idea.", "Sentence. A group of words with one full idea.", "A+B", "'Words together with a full idea' is not a natural definition; now matches the JA ことばの あつまり"],
  // L916
  [916, SE(9), "The ending ian means a person who. History,", "The ending ian means a person who does something. History,", WHO.reviewers, WHO.reason],
  [916, ["phonics.tipJa"], "-ian は「イアン」と かるく いうよ。", "-ian は「イアン」と かるく いうよ。musician・magician の -cian は「シャン」と きこえるよ。", "objective", "musician and magician end in -cian (sounds like shun), not イアン; L918 tipJa already says this"],
  [916, SE(17), "Your turn! Tell your morning in order.", "Your turn! Tell me about your morning in order.", "A+C", "'Tell your morning' is not natural English"],
  // L917
  [917, SE(7), "Kiko says, Sorry we're late. I'm playing the usher.", "Kiko says, Sorry we're late. And I say, I'm playing the usher.", "A+B+C", "without 'I say' the listener hears Kiko saying 'I'm playing the usher'; in the conversation Ms. Emma plays the usher"],
  [917, SE(9), "The ending ist means a person who. Science,", "The ending ist means a person who does something. Science,", WHO.reviewers, WHO.reason],
  // L918
  [918, ["teacherScript"], "It ran between Shimbashi and Yokohama.", "It ran between Shimbashi in Tokyo and Yokohama.", "objective (fact)", "Shimbashi is a part of Tokyo, but the card then says 'the two cities'"],
  [918, SE(17), "Your turn! Think about you.", "Your turn! Talk about yourself.", SELF.reviewers, SELF.reason],
  [918, JA(17), "じぶんの ことを かんがえて。", "じぶんの ことを いって みて。", SELF.reviewers, "JA follows 'Talk about yourself'"],
  // L919
  [919, JA(2), "electricity。でんき、れいぞうこ、テレビを うごかす ちから。", "electricity。あかり、れいぞうこ、テレビを うごかす ちから。", "objective (JA)", "lights was translated でんき, the same word as electricity (でんきを うごかす でんき)"],
  [919, SE(8), "Here's the point. It's not real. We're just imagining!", "Here's the point. It's not real. We're just imagining! So we say were and would.", "A+B", "the point did not name the form; second conditional = were + would for something not real"],
  [919, JA(8), "ポイント。ほんとうじゃ ない。そうぞう して いるだけ だよ！", "ポイント。ほんとうじゃ ない。そうぞう して いるだけ だよ！ だから were と would を つかうよ。", "A+B", "JA follows the added sentence"],
  [919, SE(9), "The ending ist means a person who. Tour,", "The ending ist means a person who does something. Tour,", WHO.reviewers, WHO.reason],
  // L920
  [920, SE(18), "Quiz time! The new station opened in which year? Two, zero, zero, one.", "Quiz time! When did the new station open? Two, zero, zero, one.", "A+B", "'opened in which year?' is an echo-question order; a normal question is 'When did ~ open?'"],
  [920, JA(18), "あたらしい えきが できたのは なんねん？", "あたらしい えきが できたのは いつ？", "objective (JA)", "JA follows 'When did ~?'"],
];

const out = [];
for (const [lesson, paths, from, to, reviewers, reason] of spec) {
  if (!reviewers) continue;
  const l = lessonOf(lesson);
  for (const p of paths) {
    const before = get(l, p);
    if (typeof before !== "string") throw new Error(`NOPATH L${lesson} ${p}`);
    if (!before.includes(from)) throw new Error(`NOFROM L${lesson} ${p}: ${from}`);
    const after = before.replace(from, to);
    const prev = out.find((x) => x.lesson === lesson && x.path === p);
    if (prev) { prev.after = prev.after.replace(from, to); prev.reason += "; " + reason; continue; }
    out.push({ lesson, path: p, before, after, reviewers, reason });
  }
}
fs.writeFileSync(path.join(ROOT, ".run9-w3132/patches/11-L911-920.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
