import fs from "node:fs";
const root = "C:/Users/EMICLE/eigo-quest-night/.run9-w2930";
const dump = fs.readFileSync(`${root}/dump/L851-860.txt`, "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const line of dump) {
  const m = /^## L(\d+)/.exec(line);
  if (m) { L = +m[1]; cur[L] = {}; continue; }
  const i = line.indexOf(" = ");
  if (L && i > 0) cur[L][line.slice(0, i)] = JSON.parse(line.slice(i + 3));
}
const out = [];
const seg = (n, k) => `teacher.segments[${n}].${k}`;
function set(lesson, path, after, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`NOPATH L${lesson} ${path}`);
  if (before === after) throw new Error(`NOOP L${lesson} ${path}`);
  out.push({ lesson, path, before, after, reviewers, reason });
}
function rep(lesson, path, from, to, reviewers, reason) {
  const before = cur[lesson][path];
  if (!before.includes(from)) throw new Error(`MISSING L${lesson} ${path}: ${from}`);
  set(lesson, path, before.split(from).join(to), reviewers, reason);
}
// say + subtitleEn together
function both(lesson, n, from, to, reviewers, reason) {
  rep(lesson, seg(n, "say"), from, to, reviewers, reason);
  rep(lesson, seg(n, "subtitleEn"), from, to, reviewers, reason);
}
const REL = "W29 has no relative clauses (brief); plain sentence instead of 'a person who ~'";

// L852
both(852, 2, "The chair is the person who leads the meeting.", "Here, a chair is a person. The chair leads the meeting.", "objective", REL);
both(852, 17, "Use two friends. You can make up names.", "Use two friends' names. You can make them up, too.", "A+B", "'Use two friends' is not natural; it means use their names (matches JA)");

// L853
both(853, 0, "How can she get in?", "How can she join in?", "A+B", "'get in' sounds like entering a place; 'join in' matches seg1 and JA はなしに 入ろう");
both(853, 2, "Decoration. Pretty things that make a place look happy. Decoration!", "Decoration. Something pretty for a party or a festival. Decoration!", "objective", "W29 has no relative clauses (brief); 'things that make' -> plain phrase");
rep(853, seg(2, "subtitleJa"), "decoration。ばしょを たのしく 見せる きれいな もの。decoration！", "decoration。パーティーや おまつりを かざる きれいな もの。decoration！", "objective (JA)", "JA follows the new English");

// L854
both(854, 1, "Say, Let's vote. Ask, Raise your hand if you like the beach. Most people chose the park. It's decided!", "Say, Let's vote. Then say, Raise your hand if you like the beach. Give the result. Most people chose the park. It's decided!", "A+B", "'Ask, Raise your hand' is not a question; the result line had no lead-in");
rep(854, seg(1, "subtitleJa"), "「うみべが いい ひとは 手を あげて。」と きこう。けっかは「", "つぎに「うみべが いい ひとは 手を あげて。」と いおう。けっかを つたえよう。「", "A+B", "JA follows the new English");

// L855
rep(855, "teacherScript", "Today, I have a plan. Back home, we will have a real class meeting soon. Let's practice here!", "Today, I have a plan. At school, you may have class meetings, too. Let's practice here!", "A+B", "Ms. Emma should not assume the child's schedule ('soon'); 'Back home, we' is unclear");
both(855, 0, "Back home, you will have real class meetings.", "At school, you may have class meetings, too.", "A+B", "do not assume the child's school schedule; matches teacherScript");
rep(855, seg(0, "subtitleJa"), "おうちに かえったら、ほんとうの クラス かいぎが あるよね。", "学校でも クラス かいぎが ある かもしれないね。", "objective (JA)", "JA おうちに かえったら said the meeting is at home; class meetings are at school");
both(855, 2, "The whole class goes out to learn somewhere fun.", "The whole class goes somewhere fun to learn.", "A+C", "word order: 'learn somewhere fun' is awkward to read");
both(855, 18, "Who is a spectator? A, A person who watches a game. B, A person who cooks dinner.", "What does a spectator do? A, Watches a game. B, Cooks dinner.", "objective", REL);
rep(855, seg(18, "subtitleJa"), "spectator は だれ？ A、しあいを 見る ひと。B、ばんごはんを つくる ひと。", "spectator は なにを する？ A、しあいを 見る。B、ばんごはんを つくる。", "objective (JA)", "JA follows the new English");

// L856
rep(856, "teacherScript", "Bow means the front of a ship, and stern means the back. ", "Stern means the back of a ship. ", "B+C", "heteronym bow (bau / boh, also ribbon and greeting); TTS and kids may misread it");
both(856, 5, "Sailor. A person who works on a ship.", "Sailor. Sailors work on ships.", "objective", REL);

// L857
both(857, 6, "I say, Captain Pell says, Thick fog comes after lunch tomorrow. Haru thinks. So you mean we should start early? Yes, exactly.", "I share Captain Pell's news. Thick fog comes after lunch tomorrow. Haru thinks. So you mean we should start early? I say, Yes, exactly.", "A+C", "'I say, Captain Pell says,' stacks two speech frames; 'Yes, exactly' had no speaker");
rep(857, seg(6, "subtitleJa"), "わたしが「ペルせんちょうが、あしたは おひるの あと こい きりが くるって。」 ハルくんは かんがえて「それって つまり、はやく はじめた ほうが いいって こと？」「うん、その とおり。」", "わたしが ペルせんちょうの おしらせを つたえるよ。「あしたは おひるの あと、こい きりが くるって。」 ハルくんは かんがえて「それって つまり、はやく はじめた ほうが いいって こと？」 わたし「うん、その とおり。」", "A+C", "JA follows the new English");

// L858
both(858, 2, "Example. One thing that shows the idea.", "Example. It shows your idea.", "objective", "W29 has no relative clauses (brief); 'thing that shows' -> plain sentence");
both(858, 3, "Helper. Someone who helps.", "Helper. A helper helps.", "objective", "W29 has no relative clauses (brief); 'someone who helps' (the test regex pattern) -> plain sentence");
both(858, 13, "Hand out!", "Hold out your hand!", "A+B", "'Hand out' is a phrasal verb (give out); cue the TPR 'Hold out your hand'");

// L859
both(859, 0, "Look, lanterns are floating on the sea.", "Look, lanterns are glowing on the boats.", "objective", "story: the lanterns hang on the boats (L853, L857 plan, L859 teacherScript), they do not float");
rep(859, seg(0, "subtitleJa"), "見て、うみに ちょうちんが うかんで いるよ。", "見て、ふねの ちょうちんが ひかって いるよ。", "objective", "JA follows the story fix");
both(859, 20, "And and is tiny now.", "And the word and is tiny now.", "A+C", "'And and' is confusing to read and hear");

// L860
both(860, 4, "Keeper. A person who takes care of a place.", "Keeper. A keeper takes care of a place.", "objective", REL);
both(860, 7, "Because families wait for them. A lighthouse is a friend for boats. Then Anchor loves bones and cake.", "Birimo says, Because families wait for them. A lighthouse is a friend for boats. Then he says, Anchor loves bones and cake.", "A+B", "no speaker for the lines; 'Then Anchor loves bones and cake' read as narration");
rep(860, seg(7, "subtitleJa"), "「かぞくが まって いるからね。灯台は ふねの ともだちなんだ。」 それから「", "ビリモ「かぞくが まって いるからね。灯台は ふねの ともだちなんだ。」 それから「", "A+B", "JA follows the new English (speaker)");
both(860, 20, "And you know predict means say before.", "And you know predict. Pre means before, and dict means say!", "A+B", "'predict means say before' is ungrammatical and unclear");
rep(860, seg(20, "subtitleJa"), "そして predict は「まえに いう」だと わかったね。", "そして predict が わかったね。pre は「まえに」、dict は「いう」！", "A+B", "JA follows the new English");

fs.writeFileSync(`${root}/patches/11-L851-860.json`, JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
