import fs from "fs";
const root = "C:/Users/EMICLE/eigo-quest-night/.run9-w2526/";
const dump = fs.readFileSync(root + "dump/L741-750.txt", "utf8").split(/\r?\n/);
const cur = {}; let L = 0;
for (const line of dump) {
  const m = line.match(/^## L(\d+)/); if (m) { L = +m[1]; cur[L] = {}; continue; }
  const k = line.indexOf(" = "); if (!L || k < 0) continue;
  cur[L][line.slice(0, k)] = JSON.parse(line.slice(k + 3));
}
const out = [];
function p(lesson, path, fn, reviewers, reason) {
  const before = cur[lesson][path];
  if (before === undefined) throw new Error("nopath " + lesson + " " + path);
  const after = typeof fn === "function" ? fn(before) : fn;
  if (after === before) throw new Error("noop " + lesson + " " + path);
  out.push({ lesson, path, before, after, reviewers, reason });
}
const rep = (a, b) => (s) => { if (!s.includes(a)) throw new Error("missing: " + a + " in " + s); return s.replace(a, b); };
const S = (i, f) => `teacher.segments[${i}].${f}`;

// L741 seg7: shortened scene counted only three questions; Birimo's answer had no speaker
{ const r = "A+B", why = "scene showed three questions but said four; 'Yes!' had no speaker";
  const f = rep("Kiko asks, Is it a bat? Yes! Only four questions!", "Kiko asks, Does it sleep in this cave? Is it a bat? Birimo says, Yes! Only four questions!");
  p(741, S(7, "say"), f, r, why); p(741, S(7, "subtitleEn"), f, r, why);
  p(741, S(7, "subtitleJa"), rep("キコちゃん「コウモリ？」 そう！ たった 4つの しつもんで あたり！", "キコちゃん「この どうくつで ねむる？ コウモリ？」 ビリモ「そう！ たった 4つの しつもんで あたり！」"), r, "match EN");
}
// L742 seg2 thief definition
{ const f = rep("A thief takes a thing, but it's not theirs.", "A thief takes other people's things.");
  const why = "'takes a thing, but it's not theirs' is clunky; plain natural definition (no relative clause)";
  p(742, S(2, "say"), f, "A+B", why); p(742, S(2, "subtitleEn"), f, "A+B", why); }
// L744 seg4 clue: relative clause with that
{ const f = rep("Clue. A little thing that helps you find the answer.", "Clue. It helps you find the answer.");
  const why = "relative clause with 'that' (relative clauses are not taught until L872)";
  p(744, S(4, "say"), f, "objective", why); p(744, S(4, "subtitleEn"), f, "objective", why);
  p(744, S(4, "subtitleJa"), rep("こたえを みつける たすけに なる ちいさな もの。", "こたえを みつける たすけに なる もの。"), "objective", "match EN"); }
// L745 seg10: invented respelling 'iv, iv' and bare 'ive'
{ const f = rep("One more. Detect, plus the ending ive. Detective! Short and soft, iv, iv. Your turn. Detective!", "One more. Detect, detective. The ending is short and soft. Your turn. Detective!");
  const why = "'iv, iv' is an invented respelling (TTS may read 'four' or 'I-V'); bare 'ive' may be read as I've; use the word pair like L748 'Imagine, imaginative'";
  p(745, S(10, "say"), f, "B+C", why); p(745, S(10, "subtitleEn"), f, "B+C", why);
  p(745, S(10, "subtitleJa"), "もう ひとつ。detect から detective。おわりは みじかく やさしく。あなたの ばん。detective！", "B+C", "match EN"); }
// L746/L749/L750 seg9: 'X plus ive'
for (const [n, a, b, ja1, ja2] of [
  [746, "Inventive. Invent plus ive.", "Inventive. Invent, inventive.", "inventive。invent に ive。", "inventive。invent から inventive。"],
  [749, "Detective. Detect plus ive.", "Detective. Detect, detective.", "detective。detect に ive。", "detective。detect から detective。"],
  [750, "Creative. Create plus ive.", "Creative. Create, creative.", "creative。create に ive。", "creative。create から creative。"],
]) { const why = "bare 'ive' may be read by TTS as I've (wrong sound); word pair as in L748 'Imagine, imaginative'";
  p(n, S(9, "say"), rep(a, b), "B+C", why); p(n, S(9, "subtitleEn"), rep(a, b), "B+C", why);
  p(n, S(9, "subtitleJa"), rep(ja1, ja2), "B+C", "match EN"); }
// L748 seg0: 'You read mysteries.'
{ const f = rep("You read mysteries. You solved mysteries.", "You solved lots of mysteries.");
  const why = "'You read mysteries.' sounds habitual and TTS may say 'reed'; simpler past line";
  p(748, S(0, "say"), f, "A+C", why); p(748, S(0, "subtitleEn"), f, "A+C", why);
  p(748, S(0, "subtitleJa"), rep("ミステリーを よんだね。なぞも といたね。", "なぞを たくさん といたね。"), "A+C", "match EN"); }
// L748 story logic
{ const a = "The guard was cleaning it.", b = "A museum worker was cleaning it.";
  const jaA = "けいびいんさんが きれいに して いたんだ。", jaB = "はくぶつかんの ひとが きれいに して いたんだ。";
  const why = "story logic: the guard who found the clue cannot also be the answer, and guards don't clean paintings";
  p(748, "conversation.lines[4].en", rep(a, b), "A+B", why);
  p(748, "conversation.lines[4].ja", rep(jaA, jaB), "A+B", "match EN");
  p(748, S(7, "say"), rep(a, b), "A+B", why); p(748, S(7, "subtitleEn"), rep(a, b), "A+B", why);
  p(748, S(7, "subtitleJa"), rep(jaA, jaB), "A+B", "match EN");
  p(748, S(7, "slide.items[1]"), rep(a, b), "A+B", "slide shows the changed line"); }
// L749 seg4: relative clause with that
{ const f = rep("A card that says, Please come to my party!", "A card. It says, Please come to my party!");
  const why = "relative clause with 'that' (relative clauses are not taught until L872)";
  p(749, S(4, "say"), f, "objective", why); p(749, S(4, "subtitleEn"), f, "objective", why); }
// L750 seg20: 'Next' twice
{ const f = rep("Next is World 26, the Theater of Echoes!", "Then, on to World 26, the Theater of Echoes!");
  const why = "'Next' twice in a row (Next, go and talk... Next is World 26)";
  p(750, S(20, "say"), f, "A+C", why); p(750, S(20, "subtitleEn"), f, "A+C", why);
  p(750, S(20, "subtitleJa"), rep("つぎは ワールド26、ひびきの げきじょう！", "そのあとは ワールド26、ひびきの げきじょうへ！"), "A+C", "match EN"); }
fs.writeFileSync(root + "patches/12-L741-750.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.length);
