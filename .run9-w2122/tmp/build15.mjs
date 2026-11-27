import fs from "node:fs";
const root = "C:/Users/EMICLE/eigo-quest-night/.run9-w2122/";
const dump = fs.readFileSync(root + "dump/L651-660.txt", "utf8").split(/\r?\n/);
const cur = {};
let lesson = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { lesson = +m[1]; cur[lesson] = {}; continue; }
  const k = line.match(/^(\S+) = (".*")$/);
  if (k && lesson) cur[lesson][k[1]] = JSON.parse(k[2]);
}
const out = [];
function p(lesson, path, reps, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`NOPATH L${lesson} ${path}`);
  let after = before;
  for (const [a, b] of reps) {
    if (!after.includes(a)) throw new Error(`NOTFOUND L${lesson} ${path}: ${a}`);
    after = after.replace(a, b);
  }
  if (after === before) throw new Error(`NOOP L${lesson} ${path}`);
  out.push({ lesson, path, before, after, reviewers, reason });
}
const S = (n, f) => `teacher.segments[${n}].${f}`;
function seg(lesson, n, en, ja, reviewers, reason, slide) {
  p(lesson, S(n, "say"), en, reviewers, reason);
  p(lesson, S(n, "subtitleEn"), en, reviewers, "Follow say");
  if (ja) p(lesson, S(n, "subtitleJa"), ja, reviewers, "Follow say");
  if (slide) for (const [i, r] of slide) p(lesson, S(n, `slide.items[${i}]`), r, reviewers, "Follow say");
}

// L651
seg(651, 6,
  [["At the beach, the boy says softly, Thank you, whispered the boy.", "At the beach, the boy is very quiet. Thank you, whispered the boy."]],
  [["はまべで おとこの子は そっと いう。", "はまべで おとこの子は とても しずか。"]],
  "A+B+C", "'the boy says softly, Thank you, whispered the boy' tells who spoke twice; the narration now sets up the quiet voice only");
seg(651, 7, [["Read it soft.", "Read it softly."]], null, "A+B", "Adverb after read: softly");
p(651, "phonics.sounds[2]", [["↗", "↘"]], "objective", "Who's there? is a wh-question; L652, L654 and L655 teach that who/where questions go down, and a knock-knock 'Who's there?' falls");
seg(651, 8, [["Who's there? Your voice goes up.", "Who's there? Your voice goes down."]],
  [["Who's there? こえが あがるよ。", "Who's there? こえが さがるよ。"]],
  "objective", "Follow phonics.sounds[2] (wh-question falls)", [[4, [["↗", "↘"]]]]);

// L652
p(652, "teacherScript", [["Kai said, Where are you, Rusty?", "Kai asked, Where are you, Rusty?"]], "objective",
  "The script just taught 'For questions, use asked'; Kai's line is a question");
p(652, "phonics.sounds[0]", [["↗", "↘"]], "objective",
  "Where are you? is a where-question; tipJa and seg9 both say the voice goes down");

// L653
p(653, "teacherScript", [["Oh no. That's sad. Oh no! That's surprised.", "Oh no. That sounds sad. Oh no! That sounds surprised."]], "objective",
  "'That's surprised' is ungrammatical (a sound is not surprised); 'That sounds sad / surprised'");
seg(653, 4, [["Something happens, and you didn't know!", "Something happens that you didn't expect!"]],
  [["しらなかった ことが おきる！", "おもって いなかった ことが おきる！"]],
  "A+B", "Tense clash and unclear meaning; 'something you didn't expect' is the natural definition");
seg(653, 6, [["Let's watch. His robot fell off the table.", "Let's watch. Haru's robot fell off the table."]],
  [["みてみよう。ロボットが", "みてみよう。ハルくんの ロボットが"]],
  "A+B", "'His' has no antecedent; Haru is named only later");
p(653, "conversation.aiTask.starterEn", [["Say \"I found it!\" in a happy way. Then I'll guess your feeling.", "Pick a feeling and say \"I found it!\" Then I'll guess your feeling."]], "A+B",
  "Haru tells the child which feeling to use and then says he will guess it; seg17 lets the child pick");

// L654
seg(654, 10, [["Be the moon. Who are you? Be the fox. Look out! Be kind. Are you OK?", "Be the moon. Who are you? Look out! Now be the fox. Are you OK?"]],
  [["つきに なって。Who are you? きつねに なって。Look out! やさしく。Are you OK?", "つきに なって。Who are you? Look out! こんどは きつねに なって。Are you OK?"]],
  "objective", "In The Fox and the Moon the moon says 'Look out!' and the fox asks 'Are you OK?'");
p(654, "conversation.aiTask.starterEn", [["Hi! I'm a little bunny,", "Let's pretend! I'm a little bunny,"]], "A+B",
  "The partner is Riko; 'Hi! I'm a little bunny' needs a role-play cue to make sense from her");

// L655
seg(655, 0, [["Welcome, welcome, to Story Theater!", "Welcome, welcome to Story Theater!"]], null, "A+C", "Stray comma before 'to' breaks the phrase");
p(655, "teacherScript", [["First, choose your roles. I'll be the narrator.", "First, choose your roles. You can say, I'll be the narrator."]], "A+B",
  "After 'four of you will act', Ms. Emma saying 'I'll be the narrator. I'm Ember.' sounds like she is taking the roles; mark them as model lines");

// L656
seg(656, 2, [["What has pages, but it's not a tree?", "What has pages but isn't a tree?"]], null, "objective", "Ungrammatical riddle question ('What has..., but it's not')");
seg(656, 17, [["What has pages, but it's not a tree?", "What has pages but isn't a tree?"]], null, "objective", "Ungrammatical riddle question ('What has..., but it's not')");
seg(656, 9, [["Pencil, strong pen, soft cil.", "Pencil. Pen-cil. Strong, then soft."]], null, "B+C",
  "'cil' alone is a spelling fragment TTS may misread; hyphen beat form as the brief asks");

// L657
seg(657, 9, [["Awake, soft a, strong wake.", "Awake. A-wake. Soft, then strong."]], null, "B+C",
  "'soft a' can be read as the letter name A; hyphen beat form");

// L658
seg(658, 8, [["A good card has three parts. The title. What it's about. And a reason to read it.", "A good card has four parts. The title. What it's about. The main character. And a reason to read it."]],
  [["いい カードには 3つの ぶぶんが ある。タイトル。なんの おはなしか。そして", "いい カードには 4つの ぶぶんが ある。タイトル。なんの おはなしか。しゅじんこう。そして"]],
  "A+B", "The teacherScript says a good card has four parts (title, about, main character, reason); seg8 said three");
p(658, "conversation.lines[4].en", [["It's so adventurous!", "Kai is so adventurous!"]], "A+B",
  "adventurous describes a person who loves adventure, not a scene; Kai is the brave girl (phonics word kept)");
p(658, "conversation.lines[4].ja", [["すごく ぼうけんって かんじ！", "カイが すごく ぼうけんずき なんだ！"]], "A+B", "Follow EN");
seg(658, 7, [
  ["What's your favorite part? My favorite part is the storm. It's so adventurous! Riko asks, How many stars? Five stars", "What's your favorite part? Birimo says, My favorite part is the storm. Kai is so adventurous! Riko asks, How many stars? Birimo says, Five stars"],
], [
  ["「すきな ところは どこ？」「あらしの ところ。すごく ぼうけんって かんじ！」 リコちゃん「ほしは いくつ？」「もちろん 5つ！」", "「すきな ところは どこ？」 ビリモ「あらしの ところ。カイが すごく ぼうけんずき なんだ！」 リコちゃん「ほしは いくつ？」 ビリモ「もちろん 5つ！」"],
], "A+C", "Birimo's answers had no speaker tag (one TTS voice reads all); adventurous follows conversation.lines[4]",
  [[1, [["It's so adventurous!", "Kai is so adventurous!"]]]]);
seg(658, 9, [["Second, strong sec, soft ond.", "Second. Sec-ond. Strong, then soft."]], null, "B+C",
  "'sec' / 'ond' fragments; TTS may read 'ond' with a full vowel; hyphen beat form");

// L659
p(659, S(5, "subtitleJa"), [["でかける ときに いう ことば。", "わかれる ときに いう ことば。"]], "objective (JA)",
  "でかける (go out) is いってきます, not goodbye; 'when we leave' here means parting");
seg(659, 9, [["Children, strong chil, soft dren.", "Children. Chil-dren. Strong, then soft."]], null, "B+C",
  "Same syllable form as the other review lessons (hyphen beat form)");

// L660
p(660, "teacherScript", [["The main character is a shy dragon. She's brave and kind.", "The main character is a shy dragon. He's big, but he's very gentle."]], "A+B",
  "The shy dragon is Ember (he); pairing it with 'She's brave and kind' (Kai's line) makes the dragon 'she'. Uses the L636 line instead");
seg(660, 9, [["Giant, strong gi, soft ant.", "Giant. Gi-ant. Strong, then soft."]], null, "B+C",
  "'gi' may be read 'ghee' and 'ant' as the insect /ænt/, but the sound is weak; hyphen beat form");
seg(660, 20, [["Next is World 23, the Green Laboratory!", "Then it's on to World 23, the Green Laboratory!"]],
  [["つぎは ワールド23、みどりの研究所！", "そのあとは ワールド23、みどりの研究所！"]],
  "A+C", "Two 'Next' lines in a row ('Next, go and talk... Next is World 23')");

fs.mkdirSync(root + "patches", { recursive: true });
fs.writeFileSync(root + "patches/15-L651-660.json", JSON.stringify(out, null, 1) + "\n");
console.log(out.length, "patches");
