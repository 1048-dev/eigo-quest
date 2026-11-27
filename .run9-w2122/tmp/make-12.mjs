// Build patches/12-L621-630.json from string replacements on the CURRENT world-21 values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-21.json"), "utf8"));
const lesson = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
function P(n, paths, reps, reviewers, reason) {
  for (const p of [].concat(paths)) {
    const before = get(lesson(n), p);
    if (typeof before !== "string") throw new Error(`no path L${n} ${p}`);
    let after = before;
    for (const [a, b] of reps) {
      if (!after.includes(a)) throw new Error(`L${n} ${p}: "${a}" not found in ${JSON.stringify(after)}`);
      after = after.split(a).join(b);
    }
    out.push({ lesson: n, path: p, before, after, reviewers, reason });
  }
}
const S = (i) => [`teacher.segments[${i}].say`, `teacher.segments[${i}].subtitleEn`];
const J = (i) => `teacher.segments[${i}].subtitleJa`;

// L621
P(621, S(9), [["Holdon!", "Hold-on!"], ["Canai!", "Can-I!"], ["Comin!", "Come-in!"]], "B+C", "Invented respellings (Holdon, Canai, Comin) will be misread by TTS (Comin = coming); use joined real words");
P(621, "conversation.lines[2].ja", [["おしらせします。", "おしらせしたいです。"]], "objective (JA)", "EN is 'I want to tell you'; match expressions[1].ja");

// L622
P(622, S(9), [["Checki-tout!", "Check-it-out!"], ["Picki-tup!", "Pick-it-up!"], ["Thinka-bou-tit!", "Think-about-it!"]], "A+B+C", "Invented respellings; 'Thinka-bou-tit' ends in a rude word when read aloud; use joined real words");

// L623
P(623, S(9), [["Leeva!", "Lee-va!"], ["Tayka!", "Tay-ka!"], ["Sendit!", "Send-it!"], ["Aneemail!", "An-email!"]], "B+C", "Invented respellings (Aneemail, Sendit) misread by TTS; hyphen beat form / joined real words");
P(623, "teacherScript", [["For a friend, you can write, See you soon. Best wishes, Riko.", "For a teacher, you can write, See you soon. Best wishes, Riko."]], "A+B", "Riko's email is to Ms. Emma, and seg1/seg8 teach Best wishes for a teacher; the script said 'for a friend'");

// L624
P(624, S(9), [["Login!", "Log-in!"], ["Signin!", "Sign-in!"], ["Turnon!", "Tur-non!"], ["Turnoff!", "Tur-noff!"]], "B+C", "Invented respellings (Signin, Turnon) misread by TTS; hyphen form (Tur-non avoids the noun 'turn-on')");
P(624, "teacherScript", [["Only your family can know it.", "Only your family should know it."], ["You are not in trouble when you tell an adult.", "You won't get in trouble for telling an adult."]], "A+B", "'can know' is the wrong modal for a rule; 'You won't get in trouble' is the natural safety reassurance");
P(624, S(6), [["asked where I live.", "asked for my address."], ["Don't share your home address online.", "Don't share your address online."]], "objective", "Misquote: Birimo's and Riko's lines (and the slide) say 'asked for my address' / the safety line 'Don't share your address online.'");
P(624, J(6), [["ぼくが どこに すんでいるか きいてきたよ", "じゅうしょを きいてきたよ"], ["おうちの ばしょは ネットに のせないで。", "ネットに じゅうしょを のせないで。"]], "objective", "Follow the quoted lines' JA");
P(624, S(14), [["Don't share your home address online.", "Don't share your address online."]], "objective", "Repeat-after-me must match the learning item / slide 'Don't share your address online.'");
P(624, J(14), [["「おうちの ばしょは ネットに のせないでね。」", "「ネットに じゅうしょを のせないでね。」"]], "objective", "Match expressions[0].ja");
P(624, S(17), [["Who is your adult?", "Who can you tell?"]], "A+C", "'Who is your adult?' is not natural English; JA already says はなせる おとなは だれ");

// L625
P(625, S(19), [["First, then, also.", "First, Then, Also."]], "objective", "The order words themselves are quoted (JA First、Then、Also); mixed case from the block-wide lowercase rule");
P(625, "conversation.aiTask.starterEn", [["Hello from far away! I'm your new pen pal. You can call me Leo.", "Hi! Let's pretend we're pen pals. You can call me Leo."]], "A+B", "The app partner is Haru (wrap-up: talk with Haru), so Haru should set up the pen-pal role-play instead of claiming to be Leo");

// L626
P(626, S(9), [["Ment makes a thing.", "Ment makes a noun."]], "A+B", "Enjoyment is not a thing; -ment makes a noun (tipJa 〜する こと)");
P(626, J(9), [["ment は「〜する こと」。", "ment は「〜する こと」と いう いみの ことばを つくる。"]], "A+B", "Follow the EN");
P(626, "conversation.aiTask.starterEn", [["My friend sent me a message with a face with stars for eyes. What does that emoji mean?", "My friend sent me an emoji. It's a face with stars for eyes. What does it mean?"]], "A+C", "'a message with a face with stars' stacks two 'with' phrases; split into two short sentences");

// L627
P(627, S(9), [["Ness makes a feeling word.", "Ness makes a noun."]], "A+B", "Kindness is not a feeling word; -ness makes a noun (tipJa ness ＝ 〜さ)");
P(627, J(9), [["ness は きもちを あらわす ことばに する。", "ness は「〜さ」と いう いみの ことばを つくる。"]], "A+B", "Follow the EN and tipJa");
P(627, S(17), [["Letters? because...", "Letters? Because..."]], "objective", "Capital letter after a question mark");

// L628
P(628, "conversation.lines[0].en", [["I'm writing this letter from the top of the tower. Dear Mom and Dad...", "Dear Mom and Dad, I'm writing this letter from the top of the tower."]], "A+B", "A letter starts with 'Dear ...,' (teacherScript letter does this); the line had the greeting after the first sentence");
P(628, "conversation.lines[0].ja", [["とうの てっぺんから この てがみを かいています。おかあさん、おとうさんへ…", "おかあさん、おとうさんへ。とうの てっぺんから この てがみを かいています。"]], "A+B", "Follow the EN");
P(628, S(6), [["Riko writes, I'm writing this letter from the top of the tower. Dear Mom and Dad.", "Riko writes, Dear Mom and Dad, I'm writing this letter from the top of the tower."]], "A+B", "Follow conversation.lines[0]");
P(628, J(6), [["「とうの てっぺんから この てがみを かいています。おかあさん、おとうさんへ。」", "「おかあさん、おとうさんへ。とうの てっぺんから この てがみを かいています。」"]], "A+B", "Follow the EN");
P(628, "teacher.segments[6].slide.items[0]", [["I'm writing this letter from the top of the tower. Dear Mom and Dad...", "Dear Mom and Dad, I'm writing this letter from the top of the tower."]], "A+B", "Follow conversation.lines[0]");
P(628, "teacherScript", [["Isn't it warm?", "What a warm letter!"]], "A+B", "'Isn't it warm?' sounds like a question about temperature");
P(628, S(9), [["Ment makes a thing.", "Ment makes a noun."]], "A+B", "Excitement is not a thing; -ment makes a noun (same fix as L626)");
P(628, J(9), [["ment は「〜する こと」。", "ment は「〜する こと」と いう いみの ことばを つくる。"]], "A+B", "Follow the EN");

// L629
P(629, "teacherScript", [["Tomorrow is our last day in the Tower of Messages.", "Our time in the Tower of Messages is almost over."], ["Tomorrow, we will go there!", "Next time, we will go there!"]], "A+B", "Pacing words in teacher narration ('Tomorrow') assume a daily schedule");
P(629, S(0), [["This is our last week in the Tower of Messages.", "Our time in the Tower of Messages is almost over."]], "A+B", "'last week' pacing word in narration (and the script says only one day is left)");
P(629, J(0), [["ことづての とうで すごす さいごの しゅう だよ。", "ことづての とうで すごす じかんも もうすぐ おわり だよ。"]], "A+B", "Follow the EN");
P(629, S(7), [["Riko says, This floor is where we took messages.", "Riko says, This floor is the Message Center. We worked here."]], "objective", "Misquote: Riko's line is the learning item 'This floor is the Message Center. We worked here.'");
P(629, J(7), [["リコちゃん「この かいで でんごんを うけたね。」", "リコちゃん「この かいが でんごんセンター。ここで はたらいたね。」"]], "objective", "Follow the EN / expressions[2].ja");
P(629, S(17), [["Laughing? when...", "Laughing? When..."]], "objective", "Capital letter after a question mark");
P(629, S(20), [["What a great month!", "What a great time in the tower!"], ["Tomorrow, Tower Radio!", "Tower Radio is coming up!"]], "A+B", "Pacing words in narration ('month', 'Tomorrow')");
P(629, J(20), [["すてきな 1か月 だったね！", "とうで すてきな じかんを すごしたね！"], ["あしたは タワーラジオ！", "タワーラジオも おたのしみに！"]], "A+B", "Follow the EN");

// L630
P(630, S(20), [["Next is World 22!", "Get ready for World 22!"]], "A+C", "'Next, go and talk... Next is World 22!' repeats Next back to back");
P(630, J(20), [["つぎは ワールド22！", "ワールド22 も おたのしみに！"]], "A+C", "Follow the EN");

fs.writeFileSync(path.join(ROOT, ".run9-w2122/patches/12-L621-630.json"), "[\n" + out.map((o) => "  " + JSON.stringify(o)).join(",\n") + "\n]\n");
console.log(`wrote ${out.length} patches`);
