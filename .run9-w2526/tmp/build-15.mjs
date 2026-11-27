import fs from "node:fs";
const root = "C:/Users/EMICLE/eigo-quest-night/.run9-w2526/";
const dump = fs.readFileSync(root + "dump/L771-780.txt", "utf8").split(/\r?\n/);
const cur = {};
let L = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/);
  if (m) { L = +m[1]; cur[L] = {}; continue; }
  const k = line.match(/^(\S+) = (.*)$/);
  if (k && L) cur[L][k[1]] = JSON.parse(k[2]);
}
const out = [];
// rep(lesson, path, from, to, reviewers, reason)
function rep(n, path, from, to, reviewers, reason) {
  const before = cur[n][path];
  if (before === undefined) throw new Error(`no path L${n} ${path}`);
  if (!before.includes(from)) throw new Error(`L${n} ${path}: '${from}' not found`);
  out.push({ lesson: n, path, before, after: before.replace(from, to), reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
const both = (n, i, from, to, rv, why) => { rep(n, seg(i, "say"), from, to, rv, why); rep(n, seg(i, "subtitleEn"), from, to, rv, why); };

// L771
both(771, 3, "A crown, a sword.", "A sword, a music box.", "A+B", "a crown is worn (costume), not held; use props from the lesson list");
rep(771, seg(3, "subtitleJa"), "かんむり、けん。", "けん、オルゴール。", "A+B", "match EN");
both(771, 7, "What else? More, please!", "What else? Tell me more!", "A+B", "'More, please!' sounds like asking for food; JA already says もっと おしえて");
// L772
both(772, 1, "Say how things feel to do.", "Say what is fun or hard to do.", "A+B+C", "'how things feel to do' is not natural English");
rep(772, seg(1, "subtitleJa"), "する ことの きもちを いおう。", "たのしい ことや むずかしい ことを いおう。", "A+B+C", "match EN");
// L773
rep(773, "teacherScript", "And the answer is, Thanks! I'll do my best.", "To answer, say, Thanks! I'll do my best.", "A+B", "'the answer is' sounds like a quiz answer; it is the reply");
// L775
rep(775, "teacherScript", "I laughed when the dragon cried, 'Please stay.'", "I almost cried when the dragon said, 'Please stay.'", "A+B", "the lonely dragon's 'Please stay' is the sad moment (L774), not a funny one");
both(775, 9, "Clap on the big word.", "Clap on the strong word.", "A+B", "'big word' means a long word to kids; the point is the stressed word (as in L779/L780)");
rep(775, seg(9, "subtitleJa"), "おおきな ことばで てを たたこう。", "つよく いう ことばで てを たたこう。", "A+B", "match EN");
// L776
both(776, 0, "Good morning, stars! Yesterday was our big show.", "Hello, stars! Our big show is over.", "A+B", "schedule words in Ms. Emma's own narration (good morning, yesterday)");
rep(776, seg(0, "subtitleJa"), "おはよう、スターの みんな！ きのうは だいじな ほんばん だったね。", "こんにちは、スターの みんな！ だいじな ほんばんが おわったね。", "A+B", "match EN");
rep(776, seg(5, "subtitleJa"), "こんどの つぎの とき。", "この つぎの とき。", "objective (JA)", "こんどの つぎ can mean 'the time after next'");
// L777
both(777, 9, "the thing that makes you feel.", "the thing that makes you feel it.", "A+B", "sentence was cut off; matches L757 'the thing that makes me feel it'");
// L778
rep(778, "teacherScript", "The three dots mean a little pause.", "The three dots mean a long pause.", "objective", "W26 teaches … = a long pause (L761-764, L778 seg8)");
// L779
rep(779, "teacherScript", "Tomorrow, take the mountain road to the east.", "When you are ready, take the mountain road to the east.", "A+B", "story timing: L780 has another show before they leave 'tomorrow'");
rep(779, "conversation.lines[4].en", "Yes. Tomorrow, we'll go there.", "Yes. Soon, we'll go there.", "A+B", "story timing: L780 says they leave tomorrow after the grand show");
rep(779, "conversation.lines[4].ja", "あした そこへ いきましょう。", "もうすぐ そこへ いきましょう。", "A+B", "match EN");
both(779, 5, "Warm water coming up from the ground.", "Water coming up from the ground.", "A+B", "a spring is not always warm (fact); the letter says this one is warm");
rep(779, seg(5, "subtitleJa"), "じめんから わいて くる あたたかい みず。", "じめんから わいて くる みず。", "A+B", "match EN");
both(779, 8, "I N G is the thing that makes you feel. And the strong feeling mark goes inside.", "I N G is the thing that makes you feel it. And the exclamation mark goes inside.", "A+B", "cut-off sentence (as L777); use the taught term 'exclamation mark' (slide)");
rep(779, seg(8, "subtitleJa"), "つよい きもちの しるしは なかに いれるよ。", "びっくりマークは なかに いれるよ。", "A+B", "match EN");
// L780
both(780, 3, "Bow. Bend forward to say thank you. Like this. Bow!", "To bow. Bend forward to say thank you. Like this. Bow to the audience!", "B+C", "bare 'Bow.' is a heteronym (TTS may say the ribbon bow); verb frame");
rep(780, seg(3, "subtitleJa"), "こんなふうに。bow！", "こんなふうに。おきゃくさんに おじぎ！", "B+C", "match EN");
both(780, 19, "Next is World 27, the Village of Springs!", "After that, we go to World 27, the Village of Springs!", "A+C", "two 'Next' sentences in a row");
rep(780, seg(19, "subtitleJa"), "つぎは ワールド27、いずみの さと！", "そのあとは ワールド27、いずみの さとへ！", "A+C", "match EN");

fs.writeFileSync(root + "patches/15-L771-780.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
