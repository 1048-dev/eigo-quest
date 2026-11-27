// Build patches for L1061-1070 (run9 W35-36 group 14).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  const cur = prev ? prev.after : before;
  if (!cur.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = cur.split(from).join(to);
  if (after === cur) throw new Error(`noop L${lesson} ${p}`);
  if (prev) {
    prev.after = after;
    prev.reason += "; " + reason;
    if (prev.reviewers !== reviewers) prev.reviewers = prev.reviewers + ", " + reviewers;
    return;
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const ja = (lesson, seg, from, to, reviewers, reason) => P(lesson, `teacher.segments[${seg}].subtitleJa`, from, to, reviewers, reason);
const beat = (lesson, seg, enFrom, enTo, jaFrom, jaTo) => {
  const r = "bare syllables said one by one ('i' = eye, 'bi' = bye, 'o' = oh, 'gy'/'chae' misread); use the hyphen beat form as in L1058 'Ex-PER-i-ment'";
  both(lesson, seg, enFrom, enTo, "B+C", r);
  ja(lesson, seg, jaFrom, jaTo, "B+C", "JA follows the new EN form");
};

// L1061
both(1061, 10, "But never stop inside the deep sea!", "But never pause in the middle of a group like the deep sea!", "A+C",
  "'never stop inside the deep sea' sounds like a literal place; use the teacherScript wording about word groups");
ja(1061, 10, "でも the deep sea の まんなかでは ぜったい とまらないよ！", "でも the deep sea のような まとまりの まんなかでは ぜったい とまらないよ！", "A+C", "JA follows the new EN");

// L1062
P(1062, "teacherScript", "Dr. Vale shakes her head. It's a fun detail, but it's a detail.", "Dr. Vale shakes her head. It's a fun fact, but it's a detail.", "A+C",
  "'a fun detail, but it's a detail' repeats itself and makes no contrast");
both(1062, 8, "Details help it, like the fun octopus.", "Details support it, like the fun octopus.", "A+B",
  "'Details help it' is vague; the teacherScript teaches 'Details support the main point'");
both(1062, 19, "It's A! The ears are a fun detail.", "It's A! The ear fins are a fun detail.", "A+B",
  "the octopus has fins that look like ears, not ears");
ja(1062, 19, "こたえは A！ 耳は おもしろい こまかい ことだね。", "こたえは A！ 耳みたいな ひれは おもしろい こまかい ことだね。", "A+B", "JA follows the new EN");

// L1063
both(1063, 10, "But don't stop inside swim up to find.", "But don't stop in the middle of swim up to find.", "A+C",
  "'stop inside swim up to find' is hard to follow when read aloud");

// L1064
both(1064, 7, "Birimo flashes. Some animals flash to scare enemies away!", "Birimo flashes and says, Some animals flash to scare enemies away!", "A+C",
  "no speaker before the quote, so the line sounds like narration");

// L1065
P(1065, "teacherScript", "He even remembers his source: the biggest ones measured are about 12 to 13 meters long.",
  "He even gives his source. According to Mr. Oswin's book, the biggest ones measured are about 12 to 13 meters long.", "A+B",
  "after 'his source:' comes a fact, not a source; the conversation names Mr. Oswin's book");
beat(1065, 9, "Experiment. ex, PER, i, ment.", "Experiment. Ex-PER-i-ment.", "experiment。ex、PER、i、ment。", "experiment。ex-PER-i-ment。");

// L1066
P(1066, "teacherScript", "will stand right here At the festival,", "will stand right here. At the festival,", "objective", "missing period between two sentences");
beat(1066, 9, "bi, OL, o, gist!", "Bi-OL-o-gist!", "bi、OL、o、gist！", "bi-OL-o-gist！");
beat(1066, 10, "zo, OL, o, gy.", "Zo-OL-o-gy.", "zo、OL、o、gy。", "zo-OL-o-gy。");

// L1067
const sun = "'Sunlight reaches well only the top part' is awkward word order and hard to read aloud";
P(1067, "teacherScript", "Sunlight reaches well only the top part of the ocean, about 200 meters.", "Sunlight only lights up the top part of the ocean, about the first 200 meters.", "A+C", sun);
P(1067, "teacherScript", "Deep water is only about 2 to 4 degrees. Brr!", "Deep water is only about 2 to 4 degrees Celsius. Brr!", "objective (fact)",
  "a US child reads bare 'degrees' as Fahrenheit (2-4 F would be below freezing); add Celsius");
P(1067, "teacherScript", "How cold is deep water? About 2 to 4 degrees.", "How cold is deep water? About 2 to 4 degrees Celsius.", "objective (fact)", "same unit fix in the answer");
both(1067, 8, "Riko asks, How strong is the pressure? According to Dr. Vale,", "Riko asks, How strong is the pressure? Haru says, According to Dr. Vale,", "A+C",
  "the answer had no speaker after 'Riko asks', so it sounded like Riko answering herself (the conversation gives it to Haru)");
ja(1067, 8, "ヴェイル はかせに よると、4000 メートルでは、水が 海の 上より やく 400 ばいも つよく おすんだって。わあ！",
  "ハルくん「ヴェイル はかせに よると、4000 メートルでは、水が 海の 上より やく 400 ばいも つよく おすんだって。」 わあ！", "A+C", "JA follows the speaker added in EN");
beat(1067, 9, "e, COL, o, gy!", "E-COL-o-gy!", "e、COL、o、gy！", "e-COL-o-gy！");
beat(1067, 10, "tech, NOL, o, gy.", "Tech-NOL-o-gy.", "tech、NOL、o、gy。", "tech-NOL-o-gy。");

// L1068
P(1068, "teacherScript", "But sunlight reaches well only the top part of the ocean, about 200 meters.", "But sunlight only lights up the top part of the ocean, about the first 200 meters.", "A+C", sun);
P(1068, "teacherScript", "How deep does sunlight reach well? About 200 meters.", "How deep does bright sunlight go? About 200 meters.", "A+C", "'reach well' in the question is unnatural; matches the new reading line");
beat(1068, 9, "ar, chae, OL, o, gy!", "Ar-chae-OL-o-gy!", "ar、chae、OL、o、gy！", "ar-chae-OL-o-gy！");
beat(1068, 10, "my, THOL, o, gy.", "My-THOL-o-gy.", "my、THOL、o、gy。", "my-THOL-o-gy。");

// L1069
beat(1069, 9, "me, te, or, OL, o, gy!", "Me-te-or-OL-o-gy!", "me、te、or、OL、o、gy！", "me-te-or-OL-o-gy！");
beat(1069, 10, "vol, can, OL, o, gist.", "Vol-can-OL-o-gist.", "vol、can、OL、o、gist。", "vol-can-OL-o-gist。");

// L1070
P(1070, "teacherScript", "And the deep sea is a biome, a big area with its own climate, plants and animals.",
  "And the deep sea is a biome, a big area with its own special conditions and living things.", "objective (fact)",
  "there are no plants in the dark deep sea (L1063 says so); 'living things' as in seg9");
beat(1070, 9, "Biologist. bi, OL, o, gist.", "Biologist. Bi-OL-o-gist.", "biologist。bi、OL、o、gist。", "biologist。bi-OL-o-gist。");
beat(1070, 10, "Discover. dis, COV, er.", "Discover. Dis-COV-er.", "discover。dis、COV、er。", "discover。dis-COV-er。");

const dest = path.join(REPO, ".run9-w3536/patches/14-L1061-1070.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
