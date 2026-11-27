// Block-wide consistency after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, strings } from "./lib.mjs";
const m = loadWorlds();
const PAST = { reviewers: "objective (coordinator; flagged independently by the L451-460 and L471-480 groups)", reason: "JA むかし means 'long ago', not 'past form'. world 16 already uses すぎた かたち (30x, and in W17-31); unify the name of the past form to すぎた かたち" };
const EDNASHI = { reviewers: "objective (coordinator; L451-460 / L471-480 group fixes)", reason: "'did の あとは ed なし' is wrong for irregular verbs (Did you see, not saw); say もとの かたち (same fix as the L454 seg1 / L472 group patches)" };
const YUH = { reviewers: "B+C (coordinator; from the L441-450 group notes)", reason: 'initial Y sound written "yeh" in some fields and "yuh" in others; TTS reads them differently. Unify to "yuh" (the segments of L443-445)' };
const LOW = { reviewers: "objective (coordinator; from the L461-470 / L471-480 group notes)", reason: 'story words listed mid-sentence take lowercase ("first, then, and finally"), same as L467 seg20' };
const rules = [
  { leaf: /subtitleJa$|\.say$|teacherScript$/, from: /([A-Za-z]+) の むかしは /g, to: "$1 の すぎた かたちは ", ...PAST },
  { leaf: /subtitleJa$|\.say$|teacherScript$/, from: /とくべつな むかしの ことば/g, to: "とくべつな すぎた かたち", ...PAST },
  { leaf: /subtitleJa$|\.say$|teacherScript$/, from: /むかしの かたち/g, to: "すぎた かたち", ...PAST },
  { leaf: /subtitleJa$/, from: /did の あとは ed なし/g, to: "did の あとは もとの かたち", ...EDNASHI },
  { leaf: /(\.say|subtitleEn|teacherScript)$/, from: /\byeh\b/g, to: "yuh", lessons: [443, 444, 449], ...YUH },
  { leaf: /(\.say|subtitleEn)$/, from: /with Once upon a time, First, then, and Finally\./g, to: "with Once upon a time, first, then, and finally.", lessons: [480], ...LOW },
  { leaf: /(\.say|subtitleEn)$/, from: /You can use Yesterday, Then, and Finally\./g, to: "You can use yesterday, then, and finally.", lessons: [477], ...LOW },
];
const patches = [];
for (const wf of m.values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      let t = s;
      const rs = [];
      for (const r of rules) {
        if (r.lessons && !r.lessons.includes(l.lessonNo)) continue;
        if (!r.leaf.test(p)) continue;
        const u = t.replace(r.from, r.to);
        if (u !== t) { t = u; rs.push(r); }
      }
      if (t !== s) patches.push({ lesson: l.lessonNo, path: p, before: s, after: t, reviewers: rs.map((r) => r.reviewers).join("; "), reason: rs.map((r) => r.reason).join("; ") });
    }
fs.writeFileSync(path.join(REPO, ".run9-w1516/patches/20-after.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 150)}`);
