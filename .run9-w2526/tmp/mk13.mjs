import fs from "fs";
const dump = fs.readFileSync(".run9-w2526/dump/L751-760.txt", "utf8").split(/\r?\n/);
let lesson = 0; const cur = {};
for (const ln of dump) {
  const m = ln.match(/^## L(\d+)/); if (m) { lesson = +m[1]; cur[lesson] = {}; continue; }
  const k = ln.match(/^(\S+) = (".*")$/); if (k && lesson) cur[lesson][k[1]] = JSON.parse(k[2]);
}
const out = [];
const P = (lesson, path, from, to, reviewers, reason) => {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error(`nopath ${lesson} ${path}`);
  if (!before.includes(from)) throw new Error(`nofrom ${lesson} ${path}: ${from}`);
  out.push({ lesson, path, before, after: before.split(from).join(to), reviewers, reason });
};
const seg = (n, f) => `teacher.segments[${n}].${f}`;
P(751, "teacherScript", "There's an old theater in the hills.", "There's an old theater on the hill.", "A+B", "match the scene and conversation ('on the hill')");
for (const f of ["say", "subtitleEn"]) P(751, seg(8, f), "Soon means, in a little time.", "Soon means, in a little while.", "A+C", "'in a little time' is not idiomatic; 'in a little while'");
P(753, "conversation.lines[5].en", "Birimo, me too?", "You too, Birimo?", "objective", "Haru reacts to Birimo wanting the same role: 'You too?' (JA ビリモも なの？ already says this)");
P(753, seg(7, "slide.items[1]"), "Birimo, me too?", "You too, Birimo?", "objective", "slide shows the fixed conversation line");
for (const f of ["say", "subtitleEn"]) P(753, seg(7, f), "A try-out!", "A tryout!", "objective", "US spelling of the noun is 'tryout'");
for (const n of [11, 13]) for (const f of ["say", "subtitleEn"]) P(754, seg(n, f), "Walk to the middle of the stage", "Walk to the center of the stage", "A+B", "say the TPR command as taught and shown on the slide ('center')");
for (const f of ["say", "subtitleEn"]) P(755, seg(2, f), "A paper with all the actors", "A sheet of paper with all the actors", "A+B", "'a paper' is a count-noun slip; 'a sheet of paper' (as in L670)");
P(756, "conversation.aiTask.starterEn", "Oh, hi. The practice", "Oh, hi. Let's pretend I'm Lulu. The practice", "A+B", "goalJa says the AI is Lulu; add the block's role-play frame so the child partner's line makes sense");
P(757, "teacherScript", "They look the same, but they are different.", "They look almost the same, but they are different.", "objective", "excited/exciting do not look the same; 'almost the same'");
for (const f of ["say", "subtitleEn"]) P(757, seg(0, f), "Tonight we read", "Today we read", "A+B", "Ms. Emma's narration should not assume the time of day; matches teacherScript 'Today'");
P(757, seg(0, "subtitleJa"), "こんやは", "きょうは", "A+B", "match EN (today)");
for (const f of ["say", "subtitleEn"]) P(760, seg(19, f), "Great guessing, you're a charades champion!", "Great guessing! You're a charades champion!", "objective", "comma splice -> two sentences");
fs.writeFileSync(".run9-w2526/patches/13-L751-760.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length);
