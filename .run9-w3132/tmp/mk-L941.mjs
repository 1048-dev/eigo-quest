import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const m = loadWorlds();
const out = [];
function p(lesson, pth, pairs, reviewers, reason) {
  const before = getAt(lessonOf(m, lesson), pth);
  if (typeof before !== "string") throw new Error(`NOPATH ${lesson} ${pth}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`MISS ${lesson} ${pth}: ${a}`);
    after = after.split(a).join(b);
  }
  if (after === before) throw new Error(`NOOP ${lesson} ${pth}`);
  out.push({ lesson, path: pth, before, after, reviewers, reason });
}
const S = (i, f) => `teacher.segments[${i}].${f}`;

// L941 southern beat form
for (const f of ["say", "subtitleEn"])
  p(941, S(10, f), [["Not south ern. Say suh thern!", "Not south-ern. Say SUH-thern!"]], "B+C",
    "TTS reads the split respelling 'suh thern' oddly; use the hyphen beat form the teacherScript already uses (SUH-thern, not south-ern)");

// L943 Japan is in Asia, not east of it
const jp = [["to the east of Asia", "in East Asia"]];
p(943, "teacherScript", jp, "objective (fact)", "Japan is part of Asia; 'to the east of Asia' places it outside the continent");
p(943, "conversation.lines[3].en", jp, "objective (fact)", "Japan is part of Asia; 'to the east of Asia' places it outside the continent");
p(943, "conversation.lines[3].ja", [["アジアの ひがしに あるね", "アジアの ひがしの ほうに あるね"]], "objective (JA)", "JA follows 'in East Asia'");
for (const f of ["say", "subtitleEn", "slide.items[0]"])
  p(943, S(7, f), jp, "objective (fact)", "Japan is part of Asia; 'to the east of Asia' places it outside the continent");
// L943 たいよう (sounds like sun) for ocean
p(943, S(3, "subtitleJa"), [["たいよう！", "大きな うみ！"]], "objective (JA)", "たいよう for ocean sounds like 太陽 (sun); use 大きな うみ like the expression JA");
p(943, S(7, "subtitleJa"), [["アジアの ひがしだよ", "アジアの ひがしの ほうだよ"], ["たいようは いくつ あるの？", "大きな うみは いくつ あるの？"]], "objective (JA)", "たいよう for ocean sounds like 太陽 (sun); JA also follows 'in East Asia'");
p(943, S(16, "subtitleJa"), [["たいようは いくつ ある？", "大きな うみは いくつ ある？"]], "objective (JA)", "たいよう for ocean sounds like 太陽 (sun); use 大きな うみ");
p(943, S(19, "subtitleJa"), [["たいようは 5つ", "大きな うみは 5つ"]], "objective (JA)", "たいよう for ocean sounds like 太陽 (sun); use 大きな うみ");
p(943, S(20, "subtitleJa"), [["たいりくと たいようを", "たいりくと 大きな うみを"]], "objective (JA)", "たいよう for ocean sounds like 太陽 (sun); use 大きな うみ");
// L943 ward
for (const f of ["say", "subtitleEn"])
  p(943, S(9, f), [["Ward means toward that way.", "Ward means toward."]], "A+B", "'toward that way' is redundant and not natural; the teacherScript says 'means toward'");

// L945
for (const f of ["say", "subtitleEn"])
  p(945, S(9, f), [["Remember, suh thern.", "Remember, SUH-thern."]], "B+C", "hyphen beat form, same as the teacherScript; TTS misreads 'suh thern'");
p(945, S(11, "subtitleJa"), [["ゆうしん", "こうしん"]], "objective (JA)", "行進 is こうしん, not ゆうしん");
p(945, S(13, "subtitleJa"), [["ゆうしん", "こうしん"]], "objective (JA)", "行進 is こうしん, not ゆうしん");

// L946
p(946, "teacherScript", [["three hundred fifty meters above the sea.", "three hundred fifty meters above sea level."]], "A+B",
  "heights are 'above sea level'; 'above the sea' sounds like the station floats over the sea");

// L948
for (const f of ["say", "subtitleEn"])
  p(948, S(5, f), [["into two same parts", "into two equal parts"]], "A+B", "'two same parts' is not natural English; a half is one of two equal parts");

// L949
for (const f of ["say", "subtitleEn"])
  p(949, S(11, f), [["The little dot is point.", "We say point for the little dot."]], "A+C", "'The little dot is point' is unclear; the teacherScript says 'We say point for the dot'");

// L950
for (const f of ["say", "subtitleEn"])
  p(950, S(11, f), [["West plus e r n.", "West plus e, r, n."], ["Nation plus a l.", "Nation plus a, l."], ["The first sound changes!", "The first a sounds different!"]], "objective",
    "the first sound of national is still n; only the a changes (nay -> na); letter commas as in the teacherScript so TTS reads letters");
p(950, S(11, "subtitleJa"), [["さいしょの おとが かわるよ！", "さいしょの a の おとが かわるよ！"]], "objective (JA)", "JA follows: the a sound changes, not the first sound");

const file = path.join(REPO, ".run9-w3132/patches/14-L941-950.json");
fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(out.length, "patches");
