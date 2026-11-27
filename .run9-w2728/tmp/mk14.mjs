// Builds .run9-w2728/patches/14-L821-830.json from substring edits on the current world-28 values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-28.json"), "utf8"));
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);
const L = (n) => w.lessons.find((l) => l.lessonNo === n);
const out = [];
// edit(lesson, path, [[old,new],...], reviewers, reason)
function edit(n, p, pairs, reviewers, reason) {
  const before = get(L(n), p);
  if (typeof before !== "string") throw new Error(`NOPATH L${n} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`NOTFOUND L${n} ${p}: ${a}`);
    after = after.replace(a, b);
  }
  out.push({ lesson: n, path: p, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
const both = (n, i, pairs, r, reason) => { edit(n, seg(i, "say"), pairs, r, reason); edit(n, seg(i, "subtitleEn"), pairs, r, "match say"); };

// L821 seg8: list "and, to, for, and can" repeats the word "and" as list word and connector
both(821, 8, [["Small words like and, to, for, and can are short and soft.", "Small words are short and soft. And, to, for, can."]], "B+C",
  "the list 'and, to, for, and can' uses 'and' both as a list word and as the connector; unclear when heard");
edit(821, seg(8, "subtitleJa"), [["and・to・for・can のような ちいさい ことばは みじかく やさしく。", "ちいさい ことばは みじかく やさしく。and・to・for・can。"]], "B+C", "match EN order");

// L822 seg8: invented respelling "uv" (TTS may read U.V.) + same list pattern
both(822, 8, [["Small words like of, at, or, and to are quick and soft. We have a BOWL of RICE. Of is so small, it sounds like uv.", "Small words are quick and soft. Of, at, or, to. We have a BOWL of RICE. Of is tiny. A BOWL of RICE."]], "B+C",
  "invented respelling 'uv' (TTS may read 'U.V.'); model the phrase again instead; list without the extra 'and'");
edit(822, seg(8, "subtitleJa"), [["of・at・or・to のような ちいさい ことばは はやく やさしく。We have a BOWL of RICE。of は とても ちいさくて「アヴ」みたいに きこえるよ。", "ちいさい ことばは はやく やさしく。of・at・or・to。We have a BOWL of RICE。of は とても ちいさいね。a BOWL of RICE。"]], "B+C", "match EN");

// L823 seg17: "Say, Yes, I agree, or, I see your point, but, and your idea." choppy
both(823, 17, [["Say, Yes, I agree, or, I see your point, but, and your idea.", "Say, Yes, I agree. Or say, I see your point, but, and your idea."]], "A+C",
  "comma chain ', or, ... but, and' is hard to read aloud; split into two sentences");

// L824 seg9: invented respelling "fer"
both(824, 9, [["For sounds like fer.", "For is tiny and quick."]], "B+C", "invented respelling 'fer'; describe the weak sound instead");
edit(824, seg(9, "subtitleJa"), [["for は「ファ」みたいに きこえるよ。", "for は ちいさく はやく いうよ。"]], "B+C", "match EN");

// L825 seg19: "Maybe, Second, we can share them" awkward
both(825, 19, [["Maybe, Second, we can share them with friends!", "How about this? Second, we can share them with friends!"]], "A+C",
  "'Maybe, Second, ...' is an awkward stumble; introduce the better second reason with a question");
edit(825, seg(19, "subtitleJa"), [["たとえば「2つめ、ともだちと わけられる！」", "これは どう？「2つめ、ともだちと わけられる！」"]], "A+C", "match EN");

// L826 seg8: "Finally means a long wait" (wrong meaning)
both(826, 8, [["Finally means a long wait.", "Finally means after a long wait."]], "A+B", "finally does not mean 'a long wait'; it means 'after a long wait' (as in seg5)");
edit(826, seg(8, "subtitleJa"), [["finally は ながく まった とき。", "finally は ながく まった あとで。"]], "A+B", "match EN and seg5");

// L826 seg9/10: invented solid respellings -> hyphen beat form used in the teacherScript
both(826, 9, [["Meechu. Nice to meechu!", "Meet-chu. Nice to meet-chu!"]], "B+C", "invented respelling 'Meechu'; use the hyphen form from the teacherScript (Meet-chu)");
both(826, 10, [["it sounds like ju. Could you, coodju. Would you, woodju. Did you, didju.", "it sounds like joo. Could you, could-joo. Would you, would-joo. Did you, did-joo."]], "B+C",
  "invented respellings 'coodju / woodju / didju' (TTS risk); use the hyphen forms from the teacherScript");

// L827 seg13: bare "Bow!" heteronym
both(827, 13, [["Give! Bow! Flap!", "Give! Thank you! Flap!"]], "B+C", "bare 'Bow!' is a heteronym; TTS may read it as bow (ribbon); cue the TPR with its 'thank you' part");
edit(827, seg(13, "subtitleJa"), [["わたして！ おじぎ！", "わたして！ ありがとう！"]], "B+C", "match EN");

// L827 seg20: "What a kind lesson!"
both(827, 20, [["What a kind lesson!", "What a sweet story!"]], "A+B", "a lesson is not 'kind'; odd collocation in EN and JA");
edit(827, seg(20, "subtitleJa"), [["やさしい じゅぎょうだったね！", "すてきな おはなしだったね！"]], "A+B", "match EN");

// L828 seg9/10: invented respellings Bustop / Taycare / Gooday / Hotea
both(828, 9, [["Bustop! Take care. Taycare.", "Say one s. Take care. Say one k."]], "B+C",
  "invented respellings 'Bustop / Taycare' (TTS risk); say the rule as in the teacherScript (one s, one k)");
edit(828, seg(9, "subtitleJa"), [["バス、ストップ じゃ なくて、バスタップ！ take care は テイケア。", "バス、ストップ じゃ なくて、s は 1かいだけ。バスタップ！ take care は k を 1かいだけ、テイケア。"]], "B+C", "match EN");
both(828, 10, [["Good day. Gooday. Hot tea. Hotea.", "Good day. Say one d. Hot tea. Say one t."]], "B+C",
  "invented respellings 'Gooday / Hotea' (TTS may read ho-TEE-uh); say the rule as in the teacherScript");
edit(828, seg(10, "subtitleJa"), [["good day は グッデイ。hot tea は ハッティー。", "good day は d を 1かいだけ、グッデイ。hot tea は t を 1かいだけ、ハッティー。"]], "B+C", "match EN");

// L829: Donchu / Aw-lover / Thissummer
both(829, 9, [["Donchu. You like soccer, donchu?", "Don-chu. You like soccer, don-chu?"]], "B+C", "invented solid respelling 'Donchu'; use the hyphen form from the teacherScript");
both(829, 10, [["Aw-lover. This summer. The two s sounds become one. Thissummer.", "Aw-low-ver. This summer. The two s sounds become one. This summer!"]], "B+C",
  "'Aw-lover' reads as 'lover' (wrong vowel; over = OH-ver); 'Thissummer' is an invented respelling");
edit(829, "teacherScript", [["All over. Aw-lover.", "All over. Aw-low-ver."]], "B+C", "'Aw-lover' reads as 'lover' (wrong vowel); match seg10");

// L830 seg10: "The first part is strong" right after Or-i-GA-mi
both(830, 10, [["VID-e-o. The first part is strong.", "VID-e-o. In video, the first part is strong."]], "objective",
  "after 'Or-i-GA-mi', 'The first part is strong' contradicts origami's stress (GA); say it is video");
edit(830, seg(10, "subtitleJa"), [["VID-e-o。さいしょが つよいよ。", "VID-e-o。video は さいしょが つよいよ。"]], "objective", "match EN");

fs.writeFileSync(path.join(ROOT, ".run9-w2728/patches/14-L821-830.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
