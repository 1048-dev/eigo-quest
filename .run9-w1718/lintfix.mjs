// Coordinator follow-up -> patches/21-lint.json (run on the state with 00-20 applied).
// The L481-490 group respelled syllable claps as sounds ("Ob, ser, vay, shun", "Ih, ma, jih, nay, shun") so TTS would not read
// "tion" letter by letter, but "vay" / "Ih" / "jih" are not words (lint spelling error) and kids would see them in the subtitle.
// Use the hyphen form this block already uses for beats (DI-no-saur, Vol-CA-no): TTS reads it as the word, subtitles stay real spelling.
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings } from "./lib.mjs";
const m = loadWorlds();
const R = { reviewers: "objective+lint (coordinator)", reason: 'syllable respelling "vay" / "Ih" / "jih" is not a word (lint spelling) and shows in the subtitle; use the hyphen beat form used in this block (DI-no-saur, Vol-CA-no)' };
const fixes = [
  [481, "Ob, ser, vay, shun. Observation!", "Ob-ser-va-tion. Observation!"],
  [484, "Ih, ma, jih, nay, shun. Imagination!", "Im-ag-i-na-tion. Imagination!"],
];
const patches = [];
for (const [n, a, b] of fixes)
  for (const [p, s] of strings(lessonOf(m, n))) if (s.includes(a)) patches.push({ lesson: n, path: p, before: s, after: s.replace(a, b), ...R });
fs.writeFileSync(path.join(REPO, ".run9-w1718/patches/21-lint.json"), JSON.stringify(patches, null, 1));
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after}`);
