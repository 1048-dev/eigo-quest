// Build patches/14-L761-770.json from the dump with substring replacements.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..", "..");
const dump = fs.readFileSync(path.join(ROOT, ".run9-w2526/dump/L761-770.txt"), "utf8").split(/\r?\n/);
const data = {};
let cur = null;
for (const line of dump) {
  const h = line.match(/^## L(\d+)/);
  if (h) { cur = +h[1]; data[cur] = {}; continue; }
  const m = line.match(/^(\S+) = (".*")$/);
  if (m && cur) data[cur][m[1]] = JSON.parse(m[2]);
}
const out = [];
function p(lesson, paths, from, to, reviewers, reason) {
  for (const [i, pth] of paths.entries()) {
    const before = data[lesson][pth];
    if (before === undefined) throw new Error(`no path L${lesson} ${pth}`);
    const f = Array.isArray(from) ? from[i] : from;
    const t = Array.isArray(to) ? to[i] : to;
    if (!before.includes(f)) throw new Error(`not found L${lesson} ${pth}: ${f}`);
    const prev = out.find((x) => x.lesson === lesson && x.path === pth);
    if (prev) { if (!prev.after.includes(f)) throw new Error(`merge fail ${pth}`); prev.after = prev.after.replace(f, t); prev.reason += "; " + reason; continue; }
    out.push({ lesson, path: pth, before, after: before.replace(f, t), reviewers, reason: i === 0 ? reason : (pth.endsWith("subtitleJa") || pth.endsWith(".ja") ? "Match the English" : "Same as say") });
  }
}
const SEG = (n, ...k) => k.map((x) => `teacher.segments[${n}].${x}`);

// L761
p(761, SEG(10, "say", "subtitleEn"), "Said comes first? The comma comes first.", "Said comes first? The comma goes before the quotation marks.", "A+B", "\"The comma comes first\" after \"Said comes first\" sounds like the comma goes before said");
p(761, SEG(10, "subtitleJa"), "said が さき？ コンマが さき。", "said が さき？ コンマは マークの まえ。", "A+B", "Match the English");

// L763
p(763, SEG(1, "say", "subtitleEn"), "Today's goal. Tell the help in a story with Luckily.", "Today's goal. Use Luckily to tell who helps in a story.", "A+B", "\"Tell the help\" is not natural English");
p(763, SEG(20, "say", "subtitleEn"), "You can tell the help in a story with Luckily.", "You can use Luckily to tell who helps in a story.", "A+B", "\"Tell the help\" is not natural English");
p(763, SEG(5, "say", "subtitleEn"), "Yesterday, I brought my lunch.", "This morning, I brought my lunch.", "A+B", "\"Yesterday\" in Ms. Emma's own narration, and \"I carried it here\" fits this morning");
p(763, SEG(5, "subtitleJa"), "きのう、", "けさ、", "A+B", "Match the English");
p(763, SEG(8, "say", "subtitleEn"), "Then, Luckily, and the help.", "Then, luckily, some help.", "A+C", "Choppy fragment; now matches Ms. Emma's conversation line");

// L764
p(764, ["teacherScript"], "Tried to means they did their best, but it didn't work.", "Tried to means they did their best. But tells us it didn't work.", "objective", "Wrong rule: tried to itself does not mean it failed; but does (as in seg8)");
p(764, SEG(10, "say", "subtitleEn"), "Said comes first? The comma comes first.", "Said comes first? The comma goes before the quotation marks.", "A+B", "Same fix as L761; matches the teacherScript wording");
p(764, SEG(10, "subtitleJa"), "said が さき？ コンマが さき。", "said が さき？ コンマは マークの まえ。", "A+B", "Match the English");

// L765
p(765, SEG(7, "say", "subtitleEn"), "Mr. Hoot smiles. This story is amazing!", "Mr. Hoot smiles and says, This story is amazing!", "A+C", "No speaker for the last line; matches the conversation line");
p(765, SEG(7, "subtitleJa"), "フートさんが にっこり。「この おはなしは すばらしい！」", "フートさんが にっこり して「この おはなしは すばらしい！」って。", "A+C", "Match the English");

// L766
p(766, SEG(6, "say", "subtitleEn"), "Ms. Emma says, Say it with feeling.", "I say, Say it with feeling.", "A+B", "Ms. Emma narrates her own line in the third person (house fix: I say)");
p(766, SEG(6, "subtitleJa"), "エマ先生「", "わたし「", "A+B", "Match the English");
p(766, SEG(9, "say", "subtitleEn"), "Say the big word strongly, and clap on it.", "Find the word in big letters. Say it strongly, and clap on it.", "A+B", "\"Big word\" means a long or hard word to kids; the point is the capital letters");
p(766, SEG(9, "subtitleJa"), "おおもじの ことばを つよく いって、てを たたこう。", "おおもじの ことばを みつけて、つよく いって、てを たたこう。", "A+B", "Match the English");

// L767
p(767, SEG(7, "say", "subtitleEn"), "Ms. Emma says, Speak more slowly", "I say, Speak more slowly", "A+B", "Ms. Emma narrates her own line in the third person (house fix: I say)");
p(767, SEG(7, "subtitleJa"), "エマ先生「", "わたし「", "A+B", "Match the English");

// L768
p(768, ["teacherScript"], "Ms. Emma's cake was on the table. Now it's gone, and", "Two cakes were on the table. Now one is gone, and", "A+B", "Ms. Emma spoke of herself in the third person, and her cake being gone contradicts the story (he ate his own cake; hers is still there)");
p(768, SEG(8, "say", "subtitleEn"), "YOUR, strongly, means not your cake, a different cake.", "When YOUR is strong, it means not your cake. A different cake!", "A+C", "Awkward to say; clearer rule");

// L769
p(769, ["teacherScript"], "They are in brackets.", "They are in parentheses, the round marks.", "A+B", "US brackets are [ ]; the reading uses ( )");
p(769, ["conversation.lines[4].en", ...SEG(7, "say", "subtitleEn", "slide.items[1]")], "Kiko, you exit to the right.", "Haru, you exit to the right.", "A+B", "Story logic: the script says the knight (Haru) exits to the right; Kiko plays the bird");
p(769, ["conversation.lines[4].ja", ...SEG(7, "subtitleJa")], "キコ、みぎへ", "ハル、みぎへ", "A+B", "Match the English");

// L770
p(770, SEG(7, "say", "subtitleEn"), "Ms. Emma says, Good,", "I say, Good,", "A+B", "Ms. Emma narrates her own line in the third person (house fix: I say)");
p(770, SEG(7, "subtitleJa"), "エマ先生「", "わたし「", "A+B", "Match the English");
p(770, ["conversation.aiTask.starterEn"], "Knock, knock. I'm the dragon, alone in my tower. Hmm… who's there?", "I'm the dragon, alone in my tower. Oh! Someone is knocking. Who's there?", "A+C", "The one who says Knock, knock is the knocker, so the dragon seemed to knock and then ask who's there");

fs.writeFileSync(path.join(ROOT, ".run9-w2526/patches/14-L761-770.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
