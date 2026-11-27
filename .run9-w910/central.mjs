// Block-wide decisions for L241-300 -> patches/01-central.json (run after 00 is applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, lessonOf, strings, setAt } from "./lib.mjs";
const m = loadWorlds();
const ALL = Array.from({ length: 60 }, (_, i) => 241 + i);
const BR = 'British praise "Brilliant!" -> American (same rule as W01-08)';
const AU292 = 'UK word "autumn" -> the US says "fall" (lint uk-word). In the au phonics lesson, swap it for "faucet" (au = オー, fits the Save Water theme; also has no silent n). Learning item ID of the L292 phonics word changes';
const AU298 = 'UK word "autumn" (lint uk-word). In the aw/au/ew review, swap it for "launch" (au = オー, from L292). Learning item ID of the L298 phonics word changes';
const NAMES = /^(I|I'm|Haru|Kiko|Riko|Birimo|Pipo|Ms|Mr|Emma|Japan|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/;
const rules = [
  // L292 autumn -> faucet
  { lessons: [292], from: /\bautumn\b/g, to: "faucet", reviewers: "A+B+lint", reason: AU292 },
  { lessons: [292], from: /\bAutumn\b/g, to: "Faucet", reviewers: "A+B+lint", reason: AU292 },
  { lessons: [292], leaf: /segments\[10\]\.say$/, from: /ぜんぶ オーの おと。$/, to: "faucet は じゃぐち。ぜんぶ オーの おと。", reviewers: "B", reason: "gloss the new word faucet (じゃぐち), like lawn は しばふ in L298" },
  { lessons: [292], leaf: /segments\[10\]\.subtitleJa$/, from: /ぜんぶ オーの おと。$/, to: "faucet は じゃぐち。ぜんぶ オーの おと。", reviewers: "B", reason: "same as say" },
  // L298 autumn -> launch
  { lessons: [298], leaf: /segments\[10\]\.(say|subtitleEn)$/, from: /^Draw on the lawn in autumn\. A bird flew by! Your turn\. Draw, autumn, flew, lawn!/, to: "Draw a rocket launch on the lawn. A bird flew by! Your turn. Draw, launch, flew, lawn!", reviewers: "A+B+lint", reason: AU298 },
  { lessons: [298], leaf: /segments\[10\]\.subtitleJa$/, from: /^あきに しばふで えを かこう。とりが とんでいった！ あなたの ばん。draw、autumn、flew、lawn！/, to: "しばふで ロケットの はっしゃの えを かこう。とりが とんでいった！ あなたの ばん。draw、launch、flew、lawn！", reviewers: "A+B+lint", reason: AU298 },
  { lessons: [298], from: /\bautumn\b/g, to: "launch", reviewers: "A+B+lint", reason: AU298 },
  { lessons: [298], from: /\bAutumn\b/g, to: "Launch", reviewers: "A+B+lint", reason: AU298 },
  // thumbs-up (noun)
  { lessons: ALL, from: /\b([Gg])ive me a thumbs up\b/g, to: "$1ive me a thumbs-up", reviewers: "A+B+lint", reason: 'noun "thumbs-up" takes a hyphen (same as L88, L133, L200, L209). Learning item ID of the L274 TPR changes. The interjection "Thumbs up!" stays' },
  // praise
  { lessons: [255], from: /Brilliant!/g, to: "Awesome!", reviewers: "A+C", reason: BR },
  { lessons: [263], from: /Brilliant!/g, to: "Fantastic!", reviewers: "A+C", reason: BR },
  { lessons: [273], from: /Brilliant!/g, to: "Perfect!", reviewers: "A+C", reason: BR },
  { lessons: [287], from: /Brilliant!/g, to: "Way to go!", reviewers: "A+C", reason: BR },
  { lessons: [265], from: /What lovely diaries!/g, to: "What great diaries!", reviewers: "A+C", reason: 'British-sounding "What lovely ~!" -> American (same rule as "Lovely ~!" in W03-08)' },
  // spelling
  { lessons: ALL, from: /show time/g, to: "showtime", reviewers: "objective", reason: 'US spelling is "showtime" (one word; same as L180, L210)' },
  { lessons: ALL, from: /Ding, dong!/g, to: "Ding-dong!", reviewers: "objective", reason: 'the bell sound is written "Ding-dong!" (same rule as W05-06)' },
  // "Now, Point" -> "Now, point"
  { lessons: ALL, leaf: /\.(say|subtitleEn)$/, from: /\bNow, ([A-Z][a-z']+)/g, to: (a, w) => (NAMES.test(w) ? a : `Now, ${w[0].toLowerCase()}${w.slice(1)}`), reviewers: "objective", reason: 'capital letter after "Now," in the middle of a sentence ("Now, Point to ~.") -> lowercase (same rule as W07-08). The TPR item and its slide keep their capital' },
  // Japanese
  { lessons: ALL, leaf: /subtitleJa$/, from: /^((?:[^！。、]{1,12}の )?)みんな、やあ！/, to: "やあ、$1みんな！", reviewers: "B+objective", reason: "natural Japanese greeting order (やあ、みんな！), same rule as W05-08" },
  { lessons: [247], from: /きのうは おきる じかんの はなしを したね。/g, to: "まえの レッスンでは おきる じかんの はなしを したね。", reviewers: "B+objective", reason: "do not assume the last lesson was yesterday (same rule as W03-08)" },
  { lessons: [270, 300], leaf: /^teacherScript$/, from: /あしたは ボスせんだよ。$/, to: "つぎは ボスせんだよ。", reviewers: "B+objective", reason: "do not assume the next lesson is tomorrow (same rule as W03-08)" },
];
const patches = [];
for (const n of ALL) {
  const l = lessonOf(m, n);
  for (const [p] of strings(l)) {
    for (const r of rules) {
      if (!r.lessons.includes(n)) continue;
      if (r.leaf && !r.leaf.test(p)) continue;
      const cur = strings(l).find(([q]) => q === p)[1];
      const t = cur.replace(r.from, r.to);
      if (t !== cur) { setAt(l, p, t); patches.push({ lesson: n, path: p, before: cur, after: t, reviewers: r.reviewers, reason: r.reason }); }
    }
  }
}
// merge consecutive patches on the same field into one before -> after
const merged = [];
for (const p of patches) {
  const last = merged.findLast((x) => x.lesson === p.lesson && x.path === p.path);
  if (last && last.after === p.before) { last.after = p.after; if (!last.reason.includes(p.reason)) last.reason += "; " + p.reason; if (!last.reviewers.includes(p.reviewers)) last.reviewers += ", " + p.reviewers; }
  else merged.push({ ...p });
}
fs.writeFileSync(path.join(REPO, ".run9-w910/patches/01-central.json"), JSON.stringify(merged, null, 1));
console.log(merged.length, "patches");
for (const x of merged) if (!/Now, /.test(x.reason)) console.log(`L${x.lesson} ${x.path}: ${x.before.slice(0, 100)}\n    -> ${x.after.slice(0, 100)}`);
