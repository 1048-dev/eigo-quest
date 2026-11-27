// Build patches/12-L861-870.json from find/replace specs against the current world-29.json.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-29.json"), "utf8"));
const lesson = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
function P(n, p, pairs, reviewers, reason) {
  const before = get(lesson(n), p);
  if (typeof before !== "string") throw new Error(`no path L${n} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`L${n} ${p}: not found: ${a}`);
    after = after.replace(a, b);
  }
  out.push({ lesson: n, path: p, before, after, reviewers, reason });
}
const S = (i) => [`teacher.segments[${i}].say`, `teacher.segments[${i}].subtitleEn`];
const both = (n, i, pairs, r, why) => S(i).forEach((p) => P(n, p, pairs, r, why));

const IBLE = "The -ible rule is a tendency, not a law (flexible, sensible, capable); src/lib/curriculum/w29Phonics.ts already says ことが おおい";
const IBLE_JA = "Same -ible rule softened in Japanese (ことが おおい), matching w29Phonics.ts";

// L861
P(861, "teacherScript", [["so they take ible.", "so they usually take ible."]], "objective", IBLE);
P(861, "phonics.tipJa", [["ならないので -ible が つくよ。", "ならないので、-ible が つく ことが おおいよ。"]], "objective (JA)", IBLE_JA);
both(861, 10, [["so they take ible.", "so they usually take ible."]], "objective", IBLE);
P(861, "teacher.segments[10].subtitleJa", [["ible が つくよ。", "ible が つく ことが おおいよ。"]], "objective (JA)", IBLE_JA);
both(861, 8, [["Can we check it? It's a fact. Is it a thought or a feeling? It's an opinion.", "Can we check it? Then it's a fact. Is it a thought or a feeling? Then it's an opinion."]], "A+B", "The test reads as a question and its answer; \"Then\" makes the if-then rule clear and matches JA それなら");

// L862
P(862, "teacherScript", [["so they take ible.", "so they usually take ible."]], "objective", IBLE);
P(862, "phonics.tipJa", [["ならないので -ible だよ。", "ならないので、-ible に なる ことが おおいよ。"]], "objective (JA)", IBLE_JA);
P(862, "teacher.segments[4].subtitleJa", [["それとも しずかで", "または、しずかで"]], "objective (JA)", "それとも is for questions; または fits a plain list (Or a quiet, gentle voice)");

// L863
P(863, "teacherScript", [["Someone read lake as cake!", "Someone mixed up lake and cake!"], ["so they take ible.", "so they usually take ible."]], "B+C", "\"Someone read lake as cake\" is hard for kids and TTS may say read as reed; mixed up is simple. Plus the -ible rule softened (objective)");
P(863, "phonics.tipJa", [["ならないので -ible だよ。", "ならないので、-ible に なる ことが おおいよ。"]], "objective (JA)", IBLE_JA);
both(863, 4, [["A safe place by the sea where boats stop and rest.", "A safe place by the sea. Boats stop and rest there."]], "B+C", "Relative \"where\" clause in W29 (relative clauses start in W30); two short sentences");
both(863, 5, [["A small paper", "A small piece of paper"]], "A+B", "paper is uncountable here: a small piece of paper");
P(863, "conversation.aiTask.starterEn", [["I heard a funny rumor. Anchor can fly at night!", "I found a funny note. It says Anchor can fly at night!"]], "A+B", "The target asks \"Where did you read that?\", but Pip said she heard it; a note makes the question fit (frame kept)");

// L864
P(864, "teacherScript", [["so they take ible.", "so they usually take ible."]], "objective", IBLE);
P(864, "phonics.tipJa", [["ならないので -ible だよ。", "ならないので、-ible に なる ことが おおいよ。"]], "objective (JA)", IBLE_JA);
both(864, 2, [["Words and pictures that want you to buy something.", "Words and pictures. They want you to buy something."]], "B+C", "Relative \"that\" clause in W29; two short sentences");
both(864, 4, [["A toy that spins round and round.", "This toy spins round and round."]], "B+C", "Relative \"that\" clause in W29 (\"a toy that spins\"); plain sentence");
P(864, "teacher.segments[0].subtitleJa", [["かしこい おかいものの みんな！", "おかいもの じょうずな みんな！"]], "objective (JA)", "おかいものの みんな is not natural Japanese for smart shoppers");

// L865
both(865, 3, [["A group that works together.", "People work together as a group."]], "B+C", "Relative \"that\" clause in W29; plain sentence");
both(865, 5, [["Round, clear glass that makes light strong.", "Round, clear glass. It makes light strong."]], "B+C", "Relative \"that\" clause in W29; two short sentences");
both(865, 8, [["In a book, or ask a grown-up.", "Look in a book, or ask a grown-up."]], "A+B", "\"In a book, or ask\" mixes a phrase and a verb; matches JA 本で しらべたり、おとなに きいたり");
P(865, "conversation.lines[5].ja", [["ぜんぜん おなじ", "まったく おなじ"]], "objective (JA)", "ぜんぜん + positive is slangy; まったく おなじ 意見 is natural for I totally agree");
P(865, "teacher.segments[7].subtitleJa", [["ぜんぜん おなじ", "まったく おなじ"]], "objective (JA)", "Same as the conversation line");

// L866
P(866, "teacherScript", [["Say STRONGLY strongly!", "Make STRONGLY big!"]], "A+C", "\"STRONGLY strongly\" sounds like a stutter when read aloud; same wording as seg10 (Big and strong)");
both(866, 2, [["School work you do at home.", "Schoolwork you do at home."]], "objective", "US spelling: schoolwork is one word");

// L867
P(867, "conversation.lines[4].en", [["Who can feed it in the summer vacation?", "Who can feed it during summer vacation?"]], "A+B", "US usage: during summer vacation (no the)");
both(867, 2, [["An animal that lives with you,", "An animal friend at home,"]], "B+C", "Relative \"that\" clause in W29 (an animal that lives); plain phrase");
both(867, 9, [["It's the final answer.", "It's the final decision."]], "A+B", "A verdict is a decision (like a judge's), not an answer");
P(867, "teacher.segments[9].subtitleJa", [["さいごの こたえの ことだよ。", "さいごに きまった こたえの ことだよ。"]], "A+B", "Match final decision");
both(867, 10, [["Make love big.", "Make the word love big."]], "A+C", "\"Make love big\" is an unlucky collocation when heard; naming the word avoids it");

// L868
both(868, 10, [["And is tiny, stop n think.", "And is tiny and quick."]], "B+C", "Invented respelling \"stop n think\" (TTS reads n as the letter); same wording as L866/L867 (tiny and quick)");

// L870
P(870, "teacherScript", [["Birimo said, I see your point, but I have a different idea, and then he asked for cake.", "Birimo said, Can I say something? Then he asked for cake."]], "objective", "Story contradiction: in this lesson Kiko says I see your point, but I have a different idea; Birimo says Can I say something? and asks for cake");
both(870, 20, [["Next is World 30!", "World 30 is coming up!"]], "A+C", "Two \"Next\" lines in a row (Next, go and talk with Riko! Next is World 30!)");

fs.writeFileSync(path.join(ROOT, ".run9-w2930/patches/12-L861-870.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
