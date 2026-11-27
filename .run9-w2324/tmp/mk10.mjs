import fs from "node:fs";
const dump = fs.readFileSync(".run9-w2324/dump/L661-670.txt", "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { L = +m[1]; cur[L] = {}; continue; }
  const k = line.match(/^(\S+) = (".*")$/);
  if (k && L) cur[L][k[1]] = JSON.parse(k[2]);
}
const out = [];
function p(lesson, path, reps, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`no path ${lesson} ${path}`);
  let after = before;
  for (const [a, b] of reps) {
    if (!after.includes(a)) throw new Error(`not found ${lesson} ${path}: ${a}`);
    after = after.replace(a, b);
  }
  out.push({ lesson, path, before, after, reviewers, reason });
}
const seg = (n, f) => `teacher.segments[${n}].${f}`;
const both = (lesson, n, reps, rv, rs) => { p(lesson, seg(n, "say"), reps, rv, rs); p(lesson, seg(n, "subtitleEn"), reps, rv, rs); };

// L661
both(661, 9, [["Then kro.", "Then crow, like the bird."]], "B+C", "invented respelling 'kro' -> real word 'crow' (same sound)");
p(661, seg(9, "subtitleJa"), [["つぎに kro。", "つぎに crow（カラス）の crow。"]], "B+C", "match EN (crow)");

// L662
both(662, 8, [["For a no rule, say don't.", "To say no, use don't."]], "A+B", "'a no rule' is unnatural; clearer wording");

// L663
p(663, "teacherScript", [["use small sentences", "use short sentences"]], "A+B", "'short sentences' is the natural teacher phrase");
p(663, "conversation.lines[4].en", [["a big black circle", "a big black line"]], "A+B", "an eyelash looks like a line, not a circle (joke logic)");
p(663, "conversation.lines[4].ja", [["くろい まるが", "くろい せんが"]], "A+B", "match EN (line)");
both(663, 7, [["a big black circle", "a big black line"]], "A+B", "an eyelash looks like a line, not a circle (joke logic)");
p(663, seg(7, "subtitleJa"), [["くろい まるが", "くろい せんが"]], "A+B", "match EN (line)");
p(663, seg(7, "slide.items[1]"), [["a big black circle", "a big black line"]], "A+B", "slide matches conversation line");

// L664
both(664, 10, [["A thermostat keeps a room warm.", "A thermostat keeps a room warm or cool."]], "A+B", "science: a thermostat keeps the temperature, warm or cool");
p(664, seg(10, "subtitleJa"), [["thermostat は へやを あたたかく たもつ。", "thermostat は へやを あたたかく、すずしく たもつ。"]], "A+B", "match EN (warm or cool)");

// L665
p(665, "teacherScript", [["Use past tense in your notebook", "Use the past tense in your notebook"]], "A+B", "missing article");
both(665, 5, [["Record. Write it down, so you don't forget. Record!", "To record. Write it down, so you don't forget. Let's record it!"]], "B+C", "heteronym: bare 'Record' reads as the noun REcord; verb frame for TTS (vocab is the verb)");
p(665, seg(5, "subtitleJa"), [["record。わすれない ように かいて おく こと。record！", "to record。わすれない ように かいて おく こと。きろくしよう！"]], "B+C", "match EN");

// L666
both(666, 10, [["Clap the strong part. Ex, PER, i, ment. Experiment!", "Clap on the strong part. Ex, per, i, ment. Per is strong! Experiment!"]], "A+C", "capital PER may be spelled out by TTS; 'Clap on the strong part'");
p(666, seg(10, "subtitleJa"), [["ex、PER、i、ment。experiment！", "ex、per、i、ment。per が つよいよ！ experiment！"]], "A+C", "match EN");

// L667
p(667, "conversation.lines[6].en", [["Don't worry. That's Birimo's own soda from lunch.", "That's Birimo's own soda from lunch. But no drinks in the lab, Birimo!"]], "A+B", "safety: the teacher should not okay drinking in the lab");
p(667, "conversation.lines[6].ja", [["だいじょうぶ。それは ビリモが おひるに もってきた じぶんの ジュースよ。", "それは ビリモが おひるに もってきた じぶんの ソーダね。でも けんきゅうじょでは のみものは だめよ、ビリモ！"]], "A+B", "match EN; soda, not juice (EN/JA mismatch)");
both(667, 7, [["Don't worry. It's his own drink from lunch.", "It's his own drink from lunch. But no drinks in the lab!"]], "A+B", "safety: the teacher should not okay drinking in the lab");
p(667, seg(7, "subtitleJa"), [["だいじょうぶ。おひるの じぶんの のみものよ。", "おひるの じぶんの のみものね。でも けんきゅうじょでは のみものは だめよ！"]], "A+B", "match EN");

// L668
p(668, "teacherScript", [["Three, four, five, six... Look!", "Three, four, five, six... Nothing yet. More salt! Look!"]], "A+B", "story logic: the reading says nothing happened after six spoons (L670: twelve)");

// L669
p(669, "conversation.lines[5].en", [["That's why people float in the Dead Sea.", "The Dead Sea is very salty, so people float there."]], "A+B", "'That's why' had no clear reason before it");
p(669, "conversation.lines[5].ja", [["だから しかいでは ひとが うくのよ。", "しかいは とても しおからいから、ひとが うくのよ。"]], "A+B", "match EN");
both(669, 17, [["Ice floats in juice. Why did it happen?", "The ice floated in my juice. Why did it happen?"]], "A+B", "tense: 'Why did it happen?' needs a past event");
p(669, seg(17, "subtitleJa"), [["こおりが ジュースに うく。", "こおりが ジュースに ういた。"]], "A+B", "match EN (past)");

// L670
both(670, 3, [["A big paper on the wall", "A big sheet of paper on the wall"]], "A+B", "'a big paper' is a calque; 'a big sheet of paper'");

fs.writeFileSync(".run9-w2324/patches/10-L661-670.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
