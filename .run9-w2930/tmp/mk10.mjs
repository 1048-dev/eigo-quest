// Builds .run9-w2930/patches/10-L841-850.json from substring replacements on the CURRENT world-29 values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-29.json"), "utf8"));
const lessonOf = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const MAYBE = { reviewers: "A+B+C", reason: "'Maybe, I think ...' sounds like hedging the model sentence; a US teacher says 'You could say, ...'" };
const RC = { reviewers: "objective", reason: "W29 keeps relative clauses out (they start in W30); plain sentence" };

const spec = [
  // L841
  [841, ["teacher.segments[10].say", "teacher.segments[10].subtitleEn"], "Spectator. A person who watches a game. Suspect. Look secretly.", "Spectator. A person watching a game. Suspect. You think someone did something wrong.", "A+B", "suspect does not mean 'look secretly' (the teacherScript already gives the right meaning); also drops a W29 relative clause"],
  [841, ["teacher.segments[10].subtitleJa"], "suspect。こっそり 見る。", "suspect。だれかが わるい ことを したと おもう こと。", "A+B", "JA follows the corrected meaning of suspect"],
  // L842
  [842, ["teacher.segments[3].say", "teacher.segments[3].subtitleEn"], "Pet. An animal that lives with you at home,", "Pet. A pet lives with you at home,", RC.reviewers, RC.reason],
  [842, ["teacher.segments[9].say", "teacher.segments[9].subtitleEn"], "Inspector. A person who looks inside and checks things.", "Inspector. An inspector looks inside and checks things.", RC.reviewers, RC.reason],
  [842, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I think", "You could say, I think", MAYBE.reviewers, MAYBE.reason],
  // L843
  [843, ["teacher.segments[2].say", "teacher.segments[2].subtitleEn"], "Example. A real thing that shows what you mean.", "Example. It shows what you mean.", RC.reviewers, RC.reason],
  [843, ["teacher.segments[2].subtitleJa"], "example。いいたい ことを しめす ほんとうの もの。", "example。いいたい ことを わかりやすく しめして くれるよ。", "objective (JA)", "JA follows the plain English sentence"],
  [843, ["teacher.segments[9].say", "teacher.segments[9].subtitleEn"], "The doctor does an inspection.", "The lighthouse gets an inspection every year.", "A+B", "doctors do checkups, not inspections; the teacherScript already uses the lighthouse inspection"],
  [843, ["teacher.segments[9].subtitleJa"], "おいしゃさんが けんさを するよ。", "とうだいは まいとし けんさを うけるよ。", "A+B", "JA follows the new example"],
  [843, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I think birds", "You could say, I think birds", MAYBE.reviewers, MAYBE.reason],
  [843, ["teacher.segments[17].subtitleJa"], "たとえば「とりは", "こんなふうに いえるよ。「とりは", "objective (JA)", "JA had たとえば twice in a row (たとえば「… たとえば、…」)"],
  // L844
  [844, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, One reason", "You could say, One reason", MAYBE.reviewers, MAYBE.reason],
  // L845
  [845, ["teacher.segments[10].say", "teacher.segments[10].subtitleEn"], "Spectator. A person who watches.", "Spectator. A person watching.", RC.reviewers, RC.reason + " (same wording as the teacherScript)"],
  [845, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I think singing is fun. One reason is that it makes me happy.", "You could say, I think singing is fun. One reason is that it makes me happy. For example, I sing with my family.", "A+B+C", "the task asks for opinion, reason and example but the model had no example; 'Maybe,' -> 'You could say,'"],
  [845, ["teacher.segments[17].subtitleJa"], "たとえば「うたうのは たのしいと おもう。りゆうの 1つは、しあわせな きもちに なれる こと。」", "こんなふうに いえるよ。「うたうのは たのしいと おもう。りゆうの 1つは、しあわせな きもちに なれる こと。たとえば、かぞくと いっしょに うたうよ。」", "A+B+C", "JA follows the added example"],
  // L846
  [846, ["teacherScript"], "Riko asks, Do you agree with me? Books are better at night.", "Riko says, I think books are better at night. Do you agree with me?", "A+B", "Riko asked for agreement before giving her opinion; now matches the conversation line"],
  [846, ["teacher.segments[10].say", "teacher.segments[10].subtitleEn"], "Dictionary. A book that says what words mean.", "Dictionary. It tells you what words mean.", RC.reviewers, RC.reason],
  [846, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I agree", "You could say, I agree", MAYBE.reviewers, MAYBE.reason],
  // L847
  [847, ["teacherScript"], "Gus tries first. I think the mountains", "Gus tries first. He says, I think the mountains", "A+C", "Gus's line had no speaker tag, so it read as narration"],
  [847, ["conversation.lines[1].en", "teacher.segments[6].slide.items[1]"], "Gus, please say a reason.", "Gus, can you give us a reason?", "A+B", "'please say a reason' is textbook English; 'give a reason' is the natural verb"],
  [847, ["teacher.segments[6].say", "teacher.segments[6].subtitleEn"], "Haru says, Gus, please say a reason.", "Haru says, Gus, can you give us a reason?", "A+B", "follows the conversation line"],
  [847, ["conversation.lines[1].ja"], "ガス、りゆうを いって みて。", "ガス、りゆうを おしえて くれる？", "A+B", "JA follows the question form"],
  [847, ["teacher.segments[6].subtitleJa"], "ハルくん「ガス、りゆうを いって みて。」", "ハルくん「ガス、りゆうを おしえて くれる？」", "A+B", "JA follows the question form"],
  [847, ["teacher.segments[10].say", "teacher.segments[10].subtitleEn"], "Verdict. The final answer, like a judge says.", "Verdict. A judge's final answer.", "A+B", "'like a judge says' is ungrammatical"],
  [847, ["teacher.segments[10].subtitleJa"], "さいばんかんが いう ような、さいごの こたえ。", "さいばんかんの さいごの こたえ。", "A+B", "JA follows the English"],
  [847, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I see", "You could say, I see", MAYBE.reviewers, MAYBE.reason],
  [847, ["teacher.segments[20].say", "teacher.segments[20].subtitleEn"], "with I see your point, but, and say, Let's listen to each other.", "with I see your point, but I think. You can also say, Let's listen to each other.", "A+C", "'but, and say,' is a stumble aloud and hard to follow"],
  // L848
  [848, ["teacher.segments[1].say", "teacher.segments[1].subtitleEn"], "Speak up when you can't decide.", "Learn what to say when you can't decide.", "A+B", "'speak up' means talk louder / voice an opinion; the goal is what to say when undecided (JA きめられない ときの いいかた)"],
  [848, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, Which is better, summer or winter? Hmm, it's hard to decide.", "You could ask, Which is better, summer or winter? Then say, Hmm, it's hard to decide.", MAYBE.reviewers, MAYBE.reason + "; the question and the answer are now marked"],
  [848, ["teacher.segments[17].subtitleJa"], "たとえば「なつと ふゆ、どっちが いい？」「うーん、きめるのは むずかしいな。」", "たとえば「なつと ふゆ、どっちが いい？」と きいて、「うーん、きめるのは むずかしいな。」と こたえよう。", "A+B+C", "JA follows the ask / answer split"],
  // L849
  [849, ["teacher.segments[9].say", "teacher.segments[9].subtitleEn"], "Contradiction. Two things that say opposite things.", "Contradiction. Two ideas say opposite things.", "objective", "W29 relative clause and 'things ... things'; same wording as the teacherScript"],
  [849, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I partly", "You could say, I partly", MAYBE.reviewers, MAYBE.reason],
  // L850
  [850, ["teacherScript"], "Stand on the left for agree. Stand on the right for disagree.", "Stand on the left if you agree. Stand on the right if you disagree.", "A+B", "'for agree' is ungrammatical; now matches the TPR commands"],
  [850, ["teacher.segments[17].say", "teacher.segments[17].subtitleEn"], "Maybe, I disagree", "You could say, I disagree", MAYBE.reviewers, MAYBE.reason],
];

// merge by lesson+path so one patch per field
const out = new Map();
let err = 0;
for (const [lesson, paths, from, to, reviewers, reason] of spec) {
  for (const p of paths) {
    const key = `${lesson}|${p}`;
    const prev = out.get(key);
    const cur = prev ? prev.after : get(lessonOf(lesson), p);
    if (typeof cur !== "string") { console.log("NOPATH", key); err++; continue; }
    const n = cur.split(from).length - 1;
    if (n !== 1) { console.log(`COUNT ${n} ${key}: ${from}`); err++; continue; }
    const after = cur.replace(from, () => to);
    if (prev) { prev.after = after; prev.reason += "; " + reason; }
    else out.set(key, { lesson, path: p, before: cur, after, reviewers, reason });
  }
}
const arr = [...out.values()];
fs.writeFileSync(path.join(ROOT, ".run9-w2930/patches/10-L841-850.json"), JSON.stringify(arr, null, 2) + "\n");
console.log(`${arr.length} patches, errors ${err}`);
