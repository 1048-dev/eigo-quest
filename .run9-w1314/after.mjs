// Block-wide consistency after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, getAt } from "./lib.mjs";
const m = loadWorlds();
const SHOW = { reviewers: "objective (coordinator; groups fixed L365/L420)", reason: '"show time" -> "showtime" (one word; same rule as W01-12 and the L365/L420 group fixes)' };
const DOKO = { reviewers: "objective (coordinator; from the L391-400 group notes)", reason: "どこにも takes a negative verb (どこにも ない). With a positive verb it is ungrammatical; あちこちに matches 'everywhere'" };
const LIP = { reviewers: "A+B (coordinator; L408 group fix)", reason: 'same wording as L408/L409 for the f/v mouth shape: "top teeth on your bottom lip"' };
const SIL = { reviewers: "B+C (coordinator; from the L381-390 and L411-420 group notes)", reason: 'non-word sound spellings "rong" / "nife" can be misread by TTS (same issue as "Badg, er" in L384); say the silent-letter rule plainly' };
const TPR = { reviewers: "B+C (coordinator; L381-390 / L411-420 group notes)", reason: 'kids do not know the term "TPR"; the L390/L420 says already use "speed challenge"' };
const edits = [
  [405, "teacher.segments[0].say", "It's recipe show time!", "It's recipe showtime!", SHOW],
  [405, "teacher.segments[0].subtitleEn", "It's recipe show time!", "It's recipe showtime!", SHOW],
  [391, "school.expressions[2].ja", "どこにも りんごの はこが あります。", "あちこちに りんごの はこが あります。", DOKO],
  [391, "conversation.lines[2].ja", "どこにも りんごの はこ。", "あちこちに りんごの はこ。", DOKO],
  [391, "teacher.segments[7].subtitleJa", "「どこにも りんごの はこ。", "「あちこちに りんごの はこ。", DOKO],
  [391, "teacher.segments[16].subtitleJa", "「どこにも りんごの はこが あります。」", "「あちこちに りんごの はこが あります。」", DOKO],
  [397, "teacher.segments[10].say", "Top teeth on your lip for the V.", "Top teeth on your bottom lip for the V.", LIP],
  [397, "teacher.segments[10].subtitleEn", "Top teeth on your lip for the V.", "Top teeth on your bottom lip for the V.", LIP],
  [417, "teacher.segments[19].say", "Wrong sounds like rong.", "The W in wrong is silent.", SIL],
  [417, "teacher.segments[19].subtitleEn", "Wrong sounds like rong.", "The W in wrong is silent.", SIL],
  [420, "teacher.segments[18].say", "Knife sounds like nife.", "The K in knife is silent.", SIL],
  [420, "teacher.segments[18].subtitleEn", "Knife sounds like nife.", "The K in knife is silent.", SIL],
  [417, "teacher.segments[19].subtitleJa", "wrong は「ロング」と きこえるね。", "wrong の w は よまないよ。", SIL],
  [420, "teacher.segments[18].subtitleJa", "knife は「ナイフ」。", "knife の k は よまないよ。", SIL],
  [390, "recap.highlightsJa[0]", "スピード TPR", "スピード チャレンジ", TPR],
  [420, "recap.highlightsJa[0]", "スピード TPR", "スピード チャレンジ", TPR],
];
const patches = [];
for (const [n, p, from, to, R] of edits) {
  const l = lessonOf(m, n);
  const cur = getAt(l, p);
  if (typeof cur !== "string" || !cur.includes(from)) throw new Error(`L${n} ${p}: not found`);
  patches.push({ lesson: n, path: p, before: cur, after: cur.replace(from, to), ...R });
}
fs.writeFileSync(path.join(REPO, ".run9-w1314/patches/20-after.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 140)}`);
