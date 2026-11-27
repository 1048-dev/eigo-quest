// Build patches/12-L681-690.json from substring edits on the current world files.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");
const w23 = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-23.json"), "utf8"));
const lessonOf = (n) => w23.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
// e(lesson, path(s), [[from,to],...], reviewers, reason)
function e(lesson, paths, reps, reviewers, reason) {
  for (const p of [].concat(paths)) {
    const before = get(lessonOf(lesson), p);
    if (typeof before !== "string") throw new Error(`NOPATH L${lesson} ${p}`);
    let after = before;
    for (const [f, t] of reps) {
      if (!after.includes(f)) throw new Error(`NOTFOUND L${lesson} ${p}: ${f}`);
      after = after.replace(f, t);
    }
    out.push({ lesson, path: p, before, after, reviewers, reason });
  }
}
const seg = (i, ...k) => k.map((x) => `teacher.segments[${i}].${x}`);

// L682
e(682, seg(17, "say", "subtitleEn"), [["Tell me your morning, in order.", "Tell me about your morning, in order."]], "A+B", "\"Tell me your morning\" is not natural; US teachers say \"Tell me about your morning\"");

// L683
e(683, "conversation.lines[4].en", [["Then it stays very still for ten days. Then a butterfly comes out!", "It stays very still for about ten days. Then a butterfly comes out!"]], "A+B+C", "two \"Then\" in a row; JA has くらい (about); seg7 keeps \"Then a butterfly comes out!\"");
e(683, "conversation.lines[4].ja", [["それから 10 にちくらい じっと して いて、チョウが でて くるんだ！", "10 にちくらい じっと して いて、それから チョウが でて くるんだ！"]], "A+B+C", "match the new EN order");
e(683, seg(9, "say", "subtitleEn"), [["A word ends in A T E?", "Does a word end in A T E?"]], "A+B", "\"A word ends in ATE?\" is an odd statement-question with \"a\"; make it a real question");

// L684
e(684, "teacherScript", [
  ["One plant was in a dark closet.", "One plant was in a dark corner, in the shade."],
  ["Let's look at them now. The plant by the window is green and strong.", "Here are the results. The plant by the window was green and strong."],
  ["Closet plant:", "Shade plant:"],
  ["It leaned toward the door, because a little light came in there.", "It leaned toward the window, because a little light came from there."],
], "A+B", "closet vs shade vs dark corner (seg0, starter) made one story; \"is green\" next to tested \"was pale and thin\" mixed tenses");
e(684, "conversation.lines[0].en", [["Let's look at our two bean plants.", "Let's look at our notes on the two bean plants."]], "A+B", "the friends report results in the past (tested \"was pale and thin\"), so they read their notes");
e(684, "conversation.lines[0].ja", [["2つの まめの しょくぶつを みて みよう。", "2つの まめの しょくぶつの きろくを みて みよう。"]], "A+B", "match EN");
e(684, "conversation.lines[1].en", [["is green and strong.", "was green and strong."]], "A+B", "same tense as Kiko's tested line \"was pale and thin\"");
e(684, "conversation.lines[1].ja", [["じょうぶだね。", "じょうぶだったね。"]], "A+B", "match EN past");
e(684, seg(6, "say", "subtitleEn"), [["Let's look at our two bean plants.", "Let's look at our notes on the two bean plants."], ["is green and strong.", "was green and strong."]], "A+B", "match conversation lines[0]-[1]");
e(684, seg(6, "subtitleJa"), [["2つの まめの しょくぶつを みて みよう。", "2つの まめの しょくぶつの きろくを みて みよう。"], ["じょうぶだね。", "じょうぶだったね。"]], "A+B", "match conversation lines[0]-[1]");
e(684, seg(6, "slide.items[0]"), [["Let's look at our two bean plants.", "Let's look at our notes on the two bean plants."]], "A+B", "match conversation lines[0]");
e(684, seg(6, "slide.items[1]"), [["is green and strong.", "was green and strong."]], "A+B", "match conversation lines[1]");
e(684, "phonics.tipJa", [["-tion の まとめ（ブロックの 4 回目）: ", "-tion の まとめ: "]], "objective (JA)", "\"ブロックの 4 回目\" is internal production jargon shown to children");

// L685
e(685, seg(3, "say", "subtitleEn"), [["Short, taller, tall!", "Short, tall, taller!"]], "objective", "wrong order; JA is ひくい、たかい、もっと たかい");

// L686
e(686, "conversation.lines[4].en", [["We will change the music.", "We will change only the music."]], "A+B", "\"change the music\" sounds like switching songs; JA says おんがくだけ and seg19 says \"change only the music\"");
e(686, seg(8, "say", "subtitleEn"), [["We will change the music.", "We will change only the music."]], "A+B", "match conversation lines[4]");
e(686, [...seg(8, "slide.items[0]"), ...seg(19, "slide.items[0]")], [["We will change the music.", "We will change only the music."]], "A+B", "match conversation lines[4]");
e(686, seg(9, "say", "subtitleEn"), [["SCI-en-tist!", "Sci-en-tist!"]], "B+C", "TTS may spell out the capital chunk SCI; \"strong at the start\" already gives the stress");

// L687
e(687, "teacherScript", [["we checked the room with a thermometer.", "we checked both rooms with a thermometer."]], "A+B", "the plants were in two rooms (the other plant stayed in a quiet room)");
e(687, seg(11, "say", "subtitleEn"), [["EN-er-gy!", "En-er-gy!"]], "B+C", "TTS may read the capital EN as letters; \"strong at the start\" already gives the stress");

// L688
e(688, "teacherScript", [["Good scientists don't jump to a big answer.", "Good scientists don't jump to conclusions."]], "A+B", "\"jump to a big answer\" is a calque; the real idiom recycles today's word conclusion");
e(688, seg(10, "say", "subtitleEn"), [["Add Y. Observation. Your turn.".replace("Add", "add"), "add Y. And don't forget observation! Your turn."]], "B+C", "bare \"Observation.\" is abrupt to read; JA says observation も わすれずに");

// L689
e(689, seg(0, "say", "subtitleEn"), [["This is our last week in the Green Laboratory.", "Our time in the Green Laboratory is almost over."]], "A+B", "pacing word (last week) in Ms. Emma's own narration");
e(689, seg(0, "subtitleJa"), [["みどりの けんきゅうじょで すごす さいごの しゅう だよ。", "みどりの けんきゅうじょの じかんも もうすぐ おしまい。"]], "A+B", "match EN");
e(689, "teacherScript", [
  ["I predict the apple will float. The egg floated!", "I predict the apple will float. And the egg floated in salt water!"],
  ["in the fridge for a winter.", "in the fridge for a pretend winter."],
], "A+B", "apple prediction then \"The egg floated!\" was a non sequitur; \"for a winter\" is unclear");
e(689, "conversation.lines[1].en", [["everything was dusty. It's made of wood!", "we found a dusty box. It's made of wood!"]], "A+B", "\"It's\" had no thing to point to after \"everything was dusty\"");
e(689, "conversation.lines[1].ja", [["それに ざいりょうこは ほこりだらけだった。きで できて いる！", "それに ざいりょうこで ほこりだらけの はこを みつけたね。きで できて いる！"]], "A+B", "match EN");
e(689, seg(6, "say", "subtitleEn"), [["everything was dusty. It's made of wood!", "we found a dusty box. It's made of wood!"]], "A+B", "match conversation lines[1]");
e(689, seg(6, "subtitleJa"), [["それに ざいりょうこは ほこりだらけだった。きで できて いる！", "それに ざいりょうこで ほこりだらけの はこを みつけたね。きで できて いる！"]], "A+B", "match conversation lines[1]");
e(689, [...seg(6, "slide.items[1]"), ...seg(8, "slide.items[1]")], [["everything was dusty. It's made of wood!", "we found a dusty box. It's made of wood!"]], "A+B", "match conversation lines[1]");
e(689, seg(10, "say", "subtitleEn"), [["then Y. Migration. Your turn.", "then Y. And migration, too! Your turn."]], "B+C", "bare \"Migration.\" is abrupt to read; JA says migration も いっしょに");

// L690
e(690, "conversation.lines[5].ja", [["「くもの上の鉄道」って", "「くもの うえの てつどう」って"]], "objective (JA)", "kanji in kids' Japanese; seg8 already uses くもの うえの てつどう");
e(690, seg(9, "say", "subtitleEn"), [["Before, say I predict. After, say The result was.", "Before an experiment, say I predict. After it, say The result was."]], "B+C", "\"Before, ... After, ...\" is choppy and unclear; JA says じっけんの まえは");
e(690, seg(21, "say", "subtitleEn"), [["Next is World 24!", "World 24 is coming up!"]], "A+C", "two \"Next\" in a row (Next, go and talk with Riko! Next is World 24!)");

fs.writeFileSync(path.join(ROOT, ".run9-w2324/patches/12-L681-690.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`${out.length} patches`);
