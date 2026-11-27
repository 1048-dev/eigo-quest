// Build patches/12-L801-810.json from the dump with substring replacements.
import fs from "node:fs";
const root = new URL("../", import.meta.url);
const dump = fs.readFileSync(new URL("dump/L801-810.txt", root), "utf8").split(/\r?\n/);
const cur = {};
let lesson = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { lesson = Number(m[1]); cur[lesson] = {}; continue; }
  const i = line.indexOf(" = ");
  if (lesson && i > 0) cur[lesson][line.slice(0, i)] = JSON.parse(line.slice(i + 3));
}
const out = [];
function p(n, path, from, to, reviewers, reason) {
  const before = cur[n][path];
  if (before === undefined) throw new Error(`no path L${n} ${path}`);
  if (!before.includes(from)) throw new Error(`L${n} ${path}: '${from}' not found`);
  const after = before.split(from).join(to);
  const prev = out.find((x) => x.lesson === n && x.path === path);
  if (prev) { prev.after = prev.after.split(from).join(to); prev.reason += "; " + reason; return; }
  out.push({ lesson: n, path, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
function sayEn(n, i, from, to, rv, reason) {
  p(n, seg(i, "say"), from, to, rv, reason);
  p(n, seg(i, "subtitleEn"), from, to, rv, "match say");
}

// L802
p(802, "teacherScript", "So Ms. Emma teaches everyone a calm-down trick.", "So I teach everyone a calm-down trick.", "A+C", "Ms. Emma narrates about herself in the third person; block rule is 'I'");
sayEn(802, 5, "I. Walk. Slowly. Slowly!", "I... walk... slowly. Slowly!", "A+C", "'I.' alone may be read as a letter or Roman numeral; slow pauses with ...");
p(802, seg(5, "subtitleJa"), "わたしは。ゆっくり。あるく。", "わたしは… ゆっくり… あるく。", "A+C", "match EN");
sayEn(802, 18, "You touch it on your face.", "It's on your face. You can touch it.", "A+B", "'You touch it on your face' is unnatural; JA already says かおに あって さわれる");

// L804
p(804, "teacherScript", "I'm proud of you. Lovely! Kiko answers", "I'm proud of you. Wonderful! Kiko answers", "A+B", "British praise 'Lovely!' -> US (block rule)");

// L805
sayEn(805, 0, "Let's find out together!", "Let's make them together!", "A+B", "nothing to 'find out'; the lesson makes plans");
p(805, seg(0, "subtitleJa"), "いっしょに しらべよう！", "いっしょに つくろう！", "A+B", "match EN");
sayEn(805, 9, "Say for short and soft.", "The word for is short and soft.", "B+C", "'Say for short' reads as the idiom 'for short'; matches teacherScript wording");

// L806
p(806, "teacherScript", "Stomach. The ch sounds like k.", "Stomach. The C H sounds like k.", "B+C", "bare 'ch' may be misread by TTS; segments use 'C H'");
p(806, "conversation.lines[4].en", "cook a vegetable soup. A big one!", "cook vegetable soup. A big pot!", "A+B", "'a vegetable soup' is unnatural (uncountable here); 'A big pot!' matches JA おおきな おなべで");
sayEn(806, 7, "cook a vegetable soup. A big one!", "cook vegetable soup. A big pot!", "A+B", "same as conversation.lines[4]");
p(806, seg(7, "slide.items[1]"), "cook a vegetable soup. A big one!", "cook vegetable soup. A big pot!", "A+B", "slide shows the changed line");

// L807
p(807, "teacherScript", "Haru rings the bell and answers", "Haru raises his hand and answers", "A+B", "Riko (the host) holds the bell; Haru ringing it contradicts the scene");
sayEn(807, 10, "Say for short and soft.", "The word for is short and soft.", "B+C", "'Say for short' reads as the idiom 'for short'");
p(807, "conversation.aiTask.starterEn", "Let's play a health quiz.", "Let's do a health quiz.", "A+B", "'play a quiz' is Japanese-English (クイズを する); 'do a quiz' is natural");

// L808
sayEn(808, 5, "Pen friend. A friend far away. You write letters to each other. Hello from my town! Pen friend!", "Pen pal. A friend far away. You write letters to each other. Hello from my town! Pen pal!", "objective", "pen friend -> pen pal missed here (vocab, slide and JA already say pen pal)");
p(808, "teacherScript", "Character. The ch sounds like k.", "Character. The C H sounds like k.", "B+C", "bare 'ch' may be misread by TTS; segments use 'C H'");

// L809
p(809, "conversation.lines[5].en", "Maybe it's the Rainbow Bridge!", "Maybe it leads to the Rainbow Bridge!", "A+B", "the rainbow leads to the Rainbow Bridge (teacherScript, story plan); it is not the bridge itself");
p(809, "conversation.lines[5].ja", "もしかしたら にじの はしかも！", "もしかしたら にじの はしに つづいて いるのかも！", "A+B", "match EN");
sayEn(809, 8, "What's wrong is a kind question. You should gives good advice.", "What's wrong? That's a kind question. Use You should to give advice.", "A+C", "'What's wrong is a kind question' reads as a sentence; 'You should gives' trips the reader");
p(809, seg(8, "subtitleJa"), "What's wrong? は やさしい しつもん。You should は いい アドバイス。", "What's wrong? は やさしい しつもん。You should で アドバイスを しよう。", "A+C", "match EN");
sayEn(809, 9, "Say for short and soft.", "The word for is short and soft.", "B+C", "'Say for short' reads as the idiom 'for short'");

// L810
p(810, "teacherScript", "Echo. The ch sounds like k.", "Echo. The C H sounds like k.", "B+C", "bare 'ch' may be misread by TTS; segments use 'C H'");
sayEn(810, 20, "Next, go and talk with Riko! Bye-bye! Next is World 28, the Rainbow Bridge!", "World 28, the Rainbow Bridge, is coming up! Next, go and talk with Riko! Bye-bye!", "A+C", "speech went on after Bye-bye and stacked two 'Next'; goodbye moved to the end");
p(810, seg(20, "subtitleJa"), "このあと リコちゃんと おはなし してね！ バイバイ！ つぎは ワールド28、にじの はしだよ！", "もうすぐ ワールド28、にじの はしだよ！ このあと リコちゃんと おはなし してね！ バイバイ！", "A+C", "match EN");

fs.writeFileSync(new URL("patches/12-L801-810.json", root), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
