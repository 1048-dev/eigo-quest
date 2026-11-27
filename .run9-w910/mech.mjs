// Central mechanical fixes for L241-300 -> patches/00-mechanical.json
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, strings } from "./lib.mjs";
const m = loadWorlds();
const patches = [];
const R = {
  quizEn: 'quiz subtitle joins two choices with "or" after an end mark ("X. or Y"); show them as "X / Y" like the other quiz subtitles (W01-04 rule)',
  quizSay: 'spoken 2-choice: lowercase "or" right after an end mark ("X. or Y"); start the second choice with "Or" (TTS reads it as a new sentence anyway)',
  orComma: 'spoken 2-choice "A? Or, B?" -> "A? Or B?" (no comma after Or; W03-04 rule 3)',
  quizJa: 'quiz choices: English end mark + full-width ？ (double end marks); show them as "A / B" like the English subtitle',
  ellOr: 'spoken 2-choice after an ellipsis "He can... or She can...": the sentence goes on, so lowercase "she"',
  dbl: "spacing / double end mark after English inside Japanese",
};
const KEEP = /^(I|I'm|I'd|I'll|P\.E\.|Birimo|Haru|Kiko|Riko|Pipo|Ms\.|Mr\.|London|Japan|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?$/;
const low = (w) => (KEEP.test(w) ? w : w[0].toLowerCase() + w.slice(1));
function mech(p, s) {
  let t = s;
  const why = new Set();
  const leaf = p.split(".").at(-1);
  // subtitleJa 2-choice: "A.？ B.？" at the end
  if (leaf === "subtitleJa") {
    const q = /(\S[^？]*?[.!?])？ ([^？]+?[.!?])？$/;
    if (q.test(t)) { t = t.replace(q, "$1 / $2"); why.add(R.quizJa); }
    const q2 = /([A-Za-z.]+)？ ([A-Za-z.]+[.!?])？$/; // "math？ P.E.？"
    if (q2.test(t)) { t = t.replace(q2, "$1 / $2"); why.add(R.quizJa); }
  }
  if (leaf === "subtitleEn") {
    const before = t;
    t = t.replace(/([.!?]) or (?=[A-Z])/g, "$1 / ");
    if (t !== before) why.add(R.quizEn);
  }
  if (leaf === "say") {
    // "He can... or She can..." -> "He can... or she can..." (ellipsis keeps the sentence going)
    const before = t;
    t = t.replace(/\.\.\. or ([A-Z][\w'.]*)/g, (a, w) => `... or ${low(w)}`);
    if (t !== before) why.add(R.ellOr);
  }
  if (leaf === "say" || leaf === "subtitleEn") {
    const before = t;
    t = t.replace(/([.!?]) or ([A-Z][\w'.]*)/g, (a, m1, w) => `${m1} Or ${low(w)}`);
    if (t !== before) why.add(R.quizSay);
    const b2 = t;
    t = t.replace(/\? Or, ([A-Za-z][\w'.]*)/g, (a, w) => `? Or ${low(w)}`);
    t = t.replace(/([.!]) Or, ([A-Za-z][\w'.]*)/g, (a, m1, w) => (leaf === "subtitleEn" ? `${m1} / ${w}` : `${m1} Or ${low(w)}`));
    if (t !== b2) why.add(R.orComma);
  }
  // English end mark + Japanese end mark
  const b3 = t;
  t = t.replace(/([A-Za-z0-9)～~'’"][.!?]|\.\.\.)[、。！？]( ?)(.?)/g, (all, a, sp, nx) => {
    if (nx === "") return a; // end of string
    if (sp) return a + " " + nx;
    return a + (/[」）)]/.test(nx) ? "" : " ") + nx;
  });
  if (t !== b3) why.add(R.dbl);
  return { t, why: [...why].join("; ") };
}
for (const wf of m.values())
  for (const l of wf.lessons)
    for (const [p, s] of strings(l)) {
      const { t, why } = mech(p, s);
      if (t !== s) patches.push({ lesson: l.lessonNo, path: p, before: s, after: t, reviewers: "objective", reason: why });
    }
fs.mkdirSync(path.join(REPO, ".run9-w910/patches"), { recursive: true });
fs.writeFileSync(path.join(REPO, ".run9-w910/patches/00-mechanical.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) console.log(`L${x.lesson} ${x.path}\n  - ${x.before}\n  + ${x.after}`);
