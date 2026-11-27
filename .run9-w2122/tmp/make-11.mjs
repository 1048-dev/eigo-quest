// Build patches/11-L611-620.json from substring replacements on the CURRENT world-21 values.
import fs from "node:fs";
const ROOT = new URL("../../", import.meta.url);
const wf = JSON.parse(fs.readFileSync(new URL("content/curriculum/worlds/world-21.json", ROOT), "utf8"));
const lesson = (n) => wf.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);
const out = [];
// reps: array of [from, to]
function P(n, path, reps, reviewers, reason) {
  const before = get(lesson(n), path);
  if (typeof before !== "string") throw new Error(`no path L${n} ${path}`);
  let after = before;
  for (const [a, b] of reps) {
    if (!after.includes(a)) throw new Error(`L${n} ${path}: not found: ${a}`);
    after = after.replace(a, b);
  }
  out.push({ lesson: n, path, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
const EN = (n, i, reps, rv, why) => { P(n, seg(i, "say"), reps, rv, why); P(n, seg(i, "subtitleEn"), reps, rv, "Same as say"); };

// L611
P(611, "teacherScript", [["You can see far stars with it.", "You can see faraway stars with it."]], "A+B", "'far stars' is not natural; 'faraway stars'");
EN(611, 8, [["For, from, time, message. Who, who, when, what. Haru", "For, from, time, message. Haru"]], "A+C", "'Who, who, when, what' is a stumble (owl sound) and is not in the JA; the four parts are already listed");
P(611, "conversation.aiTask.starterEn", [["This is Birimo.", "This is Kiko."]], "objective", "The app's partner is Kiko (wrap-up: talk with Kiko); the starter introduced Birimo");

// L612
P(612, "teacherScript", [["Yesterday, we took messages.", "Last time, we took messages."]], "A+B", "Pacing word in narration: lessons are not always on consecutive days");
P(612, "conversation.aiTask.starterEn", [["this is Haru at the Message Center", "this is Birimo at the Message Center"]], "objective", "The app's partner is Birimo (wrap-up: talk with Birimo); the starter introduced Haru");
EN(612, 5, [["Favor. Something nice you ask for.", "Favor. Something you ask someone to do for you."]], "A+B", "A favor is something you ask someone to do for you, not 'something nice you ask for'; matches the JA だれかに たのむ こと");

// L613
P(613, "teacherScript", [["Yesterday, Riko asked Birimo", "Last time, Riko asked Birimo"]], "A+B", "Pacing word in narration");
EN(613, 7, [["Then Haru runs in. She said", "Then Haru runs in and says, I got her autograph! She said"]], "A+B+C", "Haru's quote had no speaker tag, and 'She' could be Kiko; add 'and says, I got her autograph!' from his line so 'she' is the singer");
P(613, seg(7, "subtitleJa"), [["そこへ ハルくんが はしってきた。「こんや", "そこへ ハルくんが はしってきた。「サインを もらったよ！ こんや"]], "A+B+C", "Follow the EN");

// L615
P(615, "teacherScript", [["we were tired, but happy.", "we were tired but happy."], ["Remember the words from this week.", "Remember these words from the Message Center."]], "A+B", "'this week' assumes a weekly schedule (narration); no comma before 'but happy' (A+C)");
EN(615, 8, [["Here's the point. This week, you learned it all.", "Here's the point. You learned it all."]], "A+B", "'This week' pacing word in narration");
P(615, seg(8, "subtitleJa"), [["ポイント。こんしゅう ぜんぶ ならったね。", "ポイント。ぜんぶ ならったね。"]], "A+B", "Follow the EN");
EN(615, 4, [["Stamp. A tiny picture on the envelope. Or press it, bang!", "Stamp. A tiny picture you stick on the envelope. Or a tool you press, bang!"]], "A+B", "'Or press it' was unclear; make the two meanings (postage stamp / rubber stamp) clear, matching vocab きって・スタンプ");
P(615, seg(4, "subtitleJa"), [["ふうとうに はる ちいさな え。または おして、ポン！", "ふうとうに はる ちいさな え。または ポンと おす どうぐ！"]], "A+B", "Follow the EN");

// L616
EN(616, 2, [["A round, sweet bake with fruit inside.", "A round, sweet treat with fruit inside."]], "A+B", "'a bake' as a noun is British; US 'treat'");
EN(616, 9, [["and it becomes a thing.", "and it becomes a naming word."]], "A+B", "agreement/payment/movement are not 'things'; teacherScript and tip say naming word / なまえの ことば");
P(616, seg(9, "subtitleJa"), [["ものの なまえに なる。", "なまえの ことばに なる。"]], "A+B", "Follow the EN and tipJa");

// L618
EN(618, 8, [["Then, the short thing that happened. It snowed.", "Then, what happened during that time. It snowed."]], "objective", "Wrong rule: the snow fell all night (It was still snowing when I woke up), so it is not a 'short thing'; while = during that time");
P(618, seg(8, "subtitleJa"), [["そのあと おきた みじかい こと。", "その あいだに おきた こと。"]], "objective", "Follow the EN");

// L619
P(619, "teacherScript", [["When the smoke went out, everyone laughed.", "When the smoke was gone, everyone laughed."]], "A+C", "'smoke went out' sounds like a fire going out; 'was gone'");
P(619, "conversation.lines[4].en", [["The smoke is going out.", "The smoke is going out the window."]], "A+C", "'The smoke is going out' can mean the fire is dying; say where it goes");
EN(619, 7, [["The smoke is going out.", "The smoke is going out the window."]], "A+C", "Follow conversation.lines[4]");
P(619, seg(7, "slide.items[1]"), [["The smoke is going out.", "The smoke is going out the window."]], "A+C", "Follow conversation.lines[4]");

// L620
EN(620, 17, [["Say what a friend was doing. My cat", "Say what someone was doing. My cat"]], "A+B", "The example is a cat, not a friend; the JA already says だれかが");

fs.writeFileSync(new URL(".run9-w2122/patches/11-L611-620.json", ROOT), "[\n" + out.map((p) => "  " + JSON.stringify(p)).join(",\n") + "\n]\n");
console.log(out.length, "patches");
