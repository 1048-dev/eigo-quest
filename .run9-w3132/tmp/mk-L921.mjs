// Build patches/12-L921-930.json from find/replace specs against dump/L921-930.txt (current state).
import fs from "node:fs";
import path from "node:path";
const BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const dump = fs.readFileSync(path.join(BASE, "dump/L921-930.txt"), "utf8").split(/\r?\n/);
const data = {};
let cur = null;
for (const line of dump) {
  const h = line.match(/^## L(\d+)/);
  if (h) { cur = Number(h[1]); data[cur] = {}; continue; }
  const m = line.match(/^(\S+) = (".*")$/);
  if (m && cur) data[cur][m[1]] = JSON.parse(m[2]);
}
const out = [];
function P(n, p, pairs, reviewers, reason) {
  const before = data[n]?.[p];
  if (typeof before !== "string") throw new Error(`no path L${n} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`L${n} ${p}: not found: ${a}`);
    after = after.replace(a, b);
  }
  if (after === before) throw new Error(`noop L${n} ${p}`);
  out.push({ lesson: n, path: p, before, after, reviewers, reason });
}
const S = (i) => [`teacher.segments[${i}].say`, `teacher.segments[${i}].subtitleEn`];
const both = (n, i, pairs, r, why) => S(i).forEach((p) => P(n, p, pairs, r, why));
const ja = (n, i, pairs, r, why) => P(n, `teacher.segments[${i}].subtitleJa`, pairs, r, why);

const SHUN = "\"plus ion\" / bare \"tion\" makes TTS say eye-on and hides the target /shun/ ending; same wording as L901 (\"Say it softly, shun\")";

// L921
both(921, 7, [["with an airplane. What did they do?", "with an airplane. He asks, What did they do?"]], "A+C", "Haru's question had no speaker tag, so it read as the narrator's");
ja(921, 7, [["見つけたよ。「なにを したの？」", "見つけて きくよ。「なにを したの？」"]], "A+C", "JA follows the speaker tag");

// L923
both(923, 18, [["Where is a harbor for airplanes?", "Which one is a harbor for airplanes?"]], "A+B", "\"Where is\" asks for a location, but the choices are names of places (seaport / airport)");
ja(923, 18, [["ひこうきの みなとは どこ？", "ひこうきの みなとは どっち？"]], "A+B", "JA follows Which one");

// L924
both(924, 1, [["Ask, When did you? and Why did you? Then say,", "Ask questions with When did you and Why did you. Then say,"]], "A+C", "\"When did you?\" is not a question a child can say; frames are named instead");

// L925
both(925, 6, [["Who wants to go first? Riko takes a deep breath. Me!", "I ask, Who wants to go first? Riko takes a deep breath. She says, Me!"]], "A+C", "No speaker tags: Ms. Emma's question and Riko's answer ran together with the narration");
ja(925, 6, [["「だれが さいしょに やる？」", "わたし「だれが さいしょに やる？」"]], "A+C", "JA follows the I ask tag (わたし「 house style)");
both(925, 7, [["Haru talks about his grandpa. There are two reasons. First, he is kind. Second, he always shows us the way. Then Birimo talks about Old Tock!", "Haru talks about his grandpa. Then Birimo talks about Old Tock! There are two reasons. First, he is kind. Second, he always shows us the way."]], "objective", "The two reasons (kind, shows us the way) are Birimo's about Old Tock in the teacherScript and conversation, not Haru's about his grandpa");
ja(925, 7, [["ハルくんは おじいちゃんの はっぴょう。「りゆうは 2つ。1つめは やさしい こと。2つめは いつも みちを おしえて くれる こと。」 それから ビリモは オールド・トックの はっぴょう！", "ハルくんは おじいちゃんの はっぴょう。それから ビリモは オールド・トックの はっぴょう！「りゆうは 2つ。1つめは やさしい こと。2つめは いつも みちを おしえて くれる こと。」"]], "objective", "Same story fix in JA");
both(925, 8, [["Everyone claps. That was", "Everyone claps and says, That was"]], "A+C", "Quoted line had no speaker; matches the teacherScript (Everyone claps and says)");

// L926
both(926, 6, [["Kiko reads. Her family", "Kiko says, Her family"]], "A+B", "Kiko's line is her own summary (\"so she studied\"), not text she reads aloud; JA んだね is commentary too");
ja(926, 6, [["キコちゃんが よむよ。「", "キコちゃん「"]], "A+B", "JA follows Kiko says");
both(926, 7, [["Haru thinks hard. Many", "Haru thinks hard. He says, Many"]], "A+C", "Haru's answer had no speaker tag");
both(926, 9, [["The number is one ahead!", "Nineteen is one more than eighteen!"]], "A+B", "\"The number is one ahead\" is vague; says which numbers (19th century = the 1800s)");
ja(926, 9, [["かずが 1つ さきに なるよ！", "19は 18より 1つ 大きいね！"]], "A+B", "JA follows the clearer rule");
both(926, 17, [["I never give up on my dream!", "I will never give up on my dream!"]], "A+B", "Present simple \"I never give up\" sounds like a habit; a promise needs will (JA あきらめない already means that)");

// L927
P(927, "teacherScript", [
  ["When were the Tokyo Olympics held?", "When were the first Tokyo Olympics held?"],
  ["Kiko answers the moon question, and Birimo answers the bonus question.", "Kiko answers the telephone question, Riko answers the moon question, and Birimo answers the bonus question."],
  ["Invention. Change invent into a noun with tion.", "Invention. Invent becomes a noun. Say the end softly, shun."],
], "objective (fact)", "Tokyo also held the Olympics in 2021, so \"the Tokyo Olympics = 1964\" needs \"first\"; Riko (not Kiko) answers the moon question in the conversation and seg8, and Kiko answers the telephone one (this also makes the 2-2 tie add up); bare \"tion\" for TTS (B+C)");
both(927, 6, [["Haru presses the button. Buzz! It was", "Haru presses the button and says, Buzz! It was"]], "A+C", "Haru's answer had no speaker tag");
both(927, 7, [["That's right! Next question.", "Birimo says, That's right! Next question."]], "A+C", "The host line had no speaker tag");
ja(927, 7, [["「せいかい！", "ビリモ「せいかい！"]], "A+C", "JA follows the speaker tag");
both(927, 9, [["Invent plus ion, invention.", "Invent, invention. Say the end softly, shun."]], "B+C", SHUN);
ja(927, 9, [["invent に ion で invention。", "invent が invention に なるよ。おわりは そっと「ション」。"]], "B+C", "JA follows the new wording");
both(927, 17, [["When was your birthday party?", "When was the first moon walk?"]], "A+B", "A quiz host asks a history question, not about the child's own birthday party; uses today's When was ~? frame");
ja(927, 17, [["「あなたの たんじょうびパーティーは いつ だった？」", "「はじめて ひとが つきを あるいたのは いつ？」"]], "A+B", "JA follows the new model");
both(927, 20, [["You can ask, When was? and Who invented? And", "You can ask questions with When was and Who invented. And"]], "A+C", "\"When was?\" is not a question a child can say; frames are named instead");

// L929
P(929, "teacherScript", [["Exploration. Change explore into a noun with ation.", "Exploration. Change explore into a noun with a, t, i, o, n."]], "B+C", "Bare \"ation\" for TTS; spelled out as in L902 (\"Add a, t, i, o, n\")");
both(929, 7, [["Kiko points. This pot", "Kiko points and says, This pot"]], "A+C", "Kiko's line had no speaker tag");
both(929, 8, [["Was built, things.", "Was built, something people made."]], "A+B", "\"Was built, things\" says nothing a child can use; the passive here talks about things people made");
ja(929, 8, [["was built は もの。", "was built は ひとが つくった もの。"]], "A+B", "JA follows");
both(929, 9, [["Explore plus ation, exploration. The strong beat is ra. Ex, plo, RA, tion!", "Explore, exploration. The strong beat is ra. Ex-plo-RA-tion!"]], "B+C", "\"plus ation\" and comma-split syllables read badly in TTS; hyphen beat form as in the style guide");
ja(929, 9, [["explore に ation で exploration。つよい ところは ra。ex、plo、RA、tion！", "explore が exploration に なるよ。つよい ところは ra。ex-plo-RA-tion！"]], "B+C", "JA follows");

// L930
P(930, "teacherScript", [
  ["timelines.Haru", "timelines. Haru"],
  ["Celebration. Change celebrate into a noun with tion.", "Celebration. Celebrate becomes a noun. Say the end softly, shun."],
], "objective", "Missing space after a period; bare \"tion\" for TTS (B+C), same wording as L927");
both(930, 5, [["A big, dry, sandy place with very little rain.", "A big, dry place with very little rain."]], "objective (fact)", "Most deserts are not sandy (most of the Sahara is rock and gravel; Antarctica is a desert); W32 starts next");
ja(930, 5, [["ひろくて かわいた すなの ばしょ。", "ひろくて かわいた ばしょ。"]], "objective (fact)", "JA follows");
both(930, 7, [["like a pendulum. I'm playing", "like a pendulum and says, I'm playing"]], "A+C", "Birimo's line had no speaker tag");
both(930, 9, [["Celebrate plus ion, celebration.", "Celebrate, celebration. Say the end softly, shun."], ["The number is one ahead!", "Twenty-one is one more than twenty!"]], "B+C", SHUN + "; \"The number is one ahead\" is vague (A+B)");
ja(930, 9, [["celebrate に ion で celebration。", "celebrate が celebration に なるよ。おわりは そっと「ション」。"], ["かずが 1つ さきに なるよ！", "21は 20より 1つ 大きいね！"]], "B+C", "JA follows");
both(930, 19, [["The number is one ahead.", "Twenty-one is one more than twenty."]], "A+B", "\"The number is one ahead\" is vague; says which numbers");
ja(930, 19, [["かずが 1つ さきだね。", "21は 20より 1つ 大きいね。"]], "A+B", "JA follows");
both(930, 20, [["Next is World thirty-two, the Desert of the Sun!", "Then, on to World thirty-two, the Desert of the Sun!"]], "A+C", "Two \"Next\" sentences in a row (Next, go and talk with Riko! Next is ...)");
ja(930, 20, [["つぎは ワールド32、たいようの砂漠！", "それから ワールド32、たいようの砂漠へ！"]], "A+C", "JA follows");

fs.writeFileSync(path.join(BASE, "patches/12-L921-930.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
