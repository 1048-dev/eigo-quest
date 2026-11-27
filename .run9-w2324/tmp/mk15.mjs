// Build patches/15-L711-720.json from the current world-24 file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-24.json"), "utf8"));
const lessonOf = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
function rep(lesson, p, from, to, reviewers, reason) {
  let e = out.find((x) => x.lesson === lesson && x.path === p);
  if (!e) {
    const cur = get(lessonOf(lesson), p);
    if (typeof cur !== "string") throw new Error(`NOPATH L${lesson} ${p}`);
    e = { lesson, path: p, before: cur, after: cur, reviewers, reason };
    out.push(e);
  } else {
    if (!e.reason.includes(reason)) e.reason += "; " + reason;
    if (e.reviewers !== reviewers) e.reviewers = e.reviewers.startsWith("objective") ? e.reviewers : reviewers;
  }
  if (!e.after.includes(from)) throw new Error(`NOTFOUND L${lesson} ${p}: ${from}`);
  e.after = e.after.split(from).join(to);
}
const S = (n) => `teacher.segments[${n}]`;
const both = (l, n, from, to, r, why) => { rep(l, `${S(n)}.say`, from, to, r, why); rep(l, `${S(n)}.subtitleEn`, from, to, r, why); };

// ---- L711
const sub = "\"by underground\" is UK; US says \"by subway\"";
for (const p of ["school.expressions[2].en", "conversation.aiTask.targetExpressions[2]", "recap.highlightsJa[1]", `${S(1)}.slide.items[2]`, `${S(8)}.slide.items[1]`, `${S(16)}.slide.items[0]`])
  rep(711, p, "by underground", "by subway", "A+B", sub);
both(711, 8, "by underground", "by subway", "A+B", sub);
both(711, 16, "by underground", "by subway", "A+B", sub);
rep(711, "teacherScript", "30 minutes by underground", "30 minutes by subway", "A+B", sub);
rep(711, "teacherScript", "thirty minutes by underground", "thirty minutes by subway", "A+B", sub);
rep(711, "teacherScript", "Take here means use time.", "Here, take means it needs time.", "A+B", "\"Take here means use time.\" reads as the command \"Take here\" and is ungrammatical");
both(711, 4, "takes three minutes", "takes two minutes", "objective", "dentists recommend brushing for two minutes");
rep(711, `${S(4)}.subtitleJa`, "3ぷん", "2ふん", "objective", "dentists recommend brushing for two minutes");
both(711, 9, "Polite means kind.", "Polite means you have good manners.", "objective", "polite is not \"kind\"; JA says ていねい");

// ---- L712
rep(712, "phonics.tipJa",
  "p・b・m いがいで はじまる ことばの はんたいは in-。",
  "p・b・m いがいで はじまる ことばには、im- では なく in- が つくよ。",
  "objective", "the tip said every word not starting with p/b/m takes in- for its opposite (unhappy, unkind take un-)");
rep(712, "phonics.tipJa", "un- では ない ことばだよ。", "un- を つける ことばも あるから、ひとつずつ おぼえよう。", "objective", "the tip said every word not starting with p/b/m takes in- for its opposite (unhappy, unkind take un-)");
both(712, 19, "Sweet dreams, and perfect answer!", "Perfect answer! Sweet dreams!", "A+C", "\"Sweet dreams, and perfect answer!\" joins two unrelated things; split");
rep(712, `${S(19)}.subtitleJa`, "いい ゆめを。かんぺきな こたえ！", "かんぺきな こたえ！ いい ゆめを。", "A+C", "follow the new English order");

// ---- L713
rep(713, "conversation.scene", "take the underground to the museum", "take the subway to the museum", "A+B", "\"the underground\" as a noun is UK; US says \"the subway\"");
rep(713, "conversation.aiTask.starterEn", "by underground?", "by subway?", "A+B", "\"by underground\" is UK; US says \"by subway\"");
rep(713, "teacherScript", "Let's take the underground!", "Let's take the subway!", "A+B", "\"the underground\" as a noun is UK; the script itself says it is called the subway");
rep(713, "vocab[0].ja", "ちかの・ちかてつ", "ちかの・ちかで", "A+B", "in US English underground is an adjective/adverb, not the name for ちかてつ (subway)");
both(713, 0, "we're going under the ground.", "we're going underground.", "A+C", "\"going underground\" is the natural phrase and models the new word");
both(713, 1, "Tell the way by underground.", "Give subway directions.", "A+B", "\"Tell the way\" is a calque of みちを おしえる and \"by underground\" is UK");
both(713, 8, "Give the way in steps.", "Give directions in steps.", "A+B", "\"Give the way\" is a calque; US says \"give directions\"");
both(713, 20, "You can tell the way with", "You can give directions with", "A+B", "\"tell the way\" is a calque; US says \"give directions\"");

// ---- L715
rep(715, "teacherScript", "take the underground back", "take the subway back", "A+B", "\"the underground\" as a noun is UK; US says \"the subway\"");
rep(715, "conversation.lines[5].en", "by underground.", "by subway.", "A+B", "\"by underground\" is UK; US says \"by subway\"");
both(715, 7, "by underground.", "by subway.", "A+B", "\"by underground\" is UK; US says \"by subway\"");
rep(715, `${S(7)}.slide.items[1]`, "by underground.", "by subway.", "A+B", "\"by underground\" is UK; US says \"by subway\"");

// ---- L716
for (const n of [7, 16]) rep(716, `${S(n)}.subtitleJa`, "がっこうめい", "がっこうの なまえ", "objective (JA)", "match the expression's JA (がっこうの なまえ); がっこうめい is a harder word for kids");
both(716, 20, "You can write, I've arrived, and, Today, I visited.", "You can write a travel blog with I've arrived and I visited.", "A+C", "\"You can write, I've arrived, and, Today, I visited.\" is choppy with four commas");
rep(716, `${S(20)}.subtitleJa`, "I've arrived や Today, I visited で かけるね。", "I've arrived や I visited で たびの ブログが かけるね。", "A+C", "follow the new English");

// ---- L717
both(717, 8, "And please makes your question kind.", "And please makes it polite.", "A+B", "Could you wrap it, please? is a request, and please makes it polite, not kind");
rep(717, `${S(8)}.subtitleJa`, "やさしい おねがいに なるよ。", "ていねいな おねがいに なるよ。", "A+B", "polite = ていねい");
rep(717, `${S(11)}.subtitleJa`, "ゆきが ふる よ。", "ゆきが ふるのを みて。", "objective (JA)", "JA dropped \"Look at\" and had a stray space (ふる よ)");
both(717, 20, "And you can ask politely to wrap it.", "And you can ask, Could you wrap it, please?", "A+C", "\"ask politely to wrap it\" is awkward (who wraps?); quote the request");

// ---- L718
both(718, 0, "Ciao means hello in Italy.", "Ciao means hello in Italian.", "objective", "a word means something in a language (Italian), not a country");
rep(718, `${S(0)}.subtitleJa`, "チャオは イタリアの「こんにちは」だよ。", "チャオは イタリアごの「こんにちは」だよ。", "objective", "match \"in Italian\"");
both(718, 19, "Have you asks, I have answers.", "Answer Have you with I have.", "B+C", "\"Have you asks, I have answers.\" is hard to follow aloud");
both(718, 20, "You can answer with yes or no, happily.", "You can answer yes or no with a smile.", "A+C", "\"..., happily.\" tacked on at the end sounds odd");
rep(718, `${S(20)}.subtitleJa`, "げんきに こたえられるね", "えがおで こたえられるね", "A+C", "follow \"with a smile\"");

// ---- L720
const first = "\"I've slept on a train! I've never done that before!\" contradicts itself (he has now done it); JA already says はじめてだった";
rep(720, "conversation.lines[3].en", "I've never done that before!", "It was my first time!", "A+B", first);
both(720, 7, "I've never done that before!", "It was my first time!", "A+B", first);
for (const n of [7, 17, 18]) rep(720, `${S(n)}.slide.items[0]`, "I've never done that before!", "It was my first time!", "A+B", first);
both(720, 19, "Next is World 25, the Cave of Riddles!", "Then, on to World 25, the Cave of Riddles!", "A+C", "two \"Next\" sentences in a row");
rep(720, `${S(19)}.subtitleJa`, "つぎは ワールド25、なぞときの どうくつ！", "それから ワールド25、なぞときの どうくつへ！", "A+C", "follow the new English");

fs.writeFileSync(path.join(ROOT, ".run9-w2324/patches/15-L711-720.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches", [...new Set(out.map((x) => x.lesson))].join(","));
