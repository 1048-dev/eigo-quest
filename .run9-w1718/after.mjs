// Block-wide consistency after the group reviews -> patches/20-after.json (run on the state with 00-15 applied)
import fs from "node:fs";
import path from "node:path";
import { REPO, loadWorlds, strings } from "./lib.mjs";
const m = loadWorlds();
const KEY = {
  reviewers: "objective+lint (inconsistent-form)",
  reason: 'one spelling for the same word: L483 "key chain" vs L528 "keychain" (lint inconsistent-form). World 16 (L459, already reviewed) and L528 use "keychain", the common US form. Learning item IDs of the L483 vocab and expression change',
};
const rules = [
  { lessons: [483], leaf: /./, from: /\bkey chain/g, to: "keychain", ...KEY },
  { lessons: [483], leaf: /./, from: /\bKey chain/g, to: "Keychain", ...KEY },
];
const CHUR = {
  reviewers: "B+C (coordinator; L481-490 group report)",
  reason: 'TURE sound written "cher" in some segments (TTS reads it like the name Cher) and "chur" in others (L488, L489). Unify to "chur"',
};
rules.push(
  { lessons: [506, 508], leaf: /(\.say|subtitleEn)$/, from: /T U R E says cher\./g, to: "T U R E says chur.", ...CHUR },
  { lessons: [510], leaf: /(\.say|subtitleEn)$/, from: /Shun, shun, cher\./g, to: "Shun, shun, chur.", ...CHUR },
);
const patches = [];
// aiTask starter "Hi! I'm Ms. Emma." -> the real partner. The app never makes Ms. Emma the partner
// (src/lib/conversation/engine.ts pickConversationPartner), so the partner would introduce itself as Ms. Emma.
const STARTER = {
  reviewers: "objective (coordinator; L501-510 group report)",
  reason: 'the AI conversation partner is always a child character (pickConversationPartner never picks Ms. Emma), and the wrap-up says "Next, talk with X!". The starter "I\'m Ms. Emma." made X introduce itself as Ms. Emma. Use the partner name from the wrap-up (checked with pickConversationPartner)',
};
for (const wf of m.values())
  for (const l of wf.lessons) {
    const s = l.conversation?.aiTask?.starterEn;
    if (!s || !/I'm Ms\. Emma/.test(s)) continue;
    const wrap = l.teacher.segments.map((x) => x.say).join(" ").match(/Next, talk with (Haru|Riko|Kiko|Birimo)!/);
    if (!wrap) throw new Error(`L${l.lessonNo}: no wrap-up partner`);
    const t = s.replace(/I'm Ms\. Emma/, `I'm ${wrap[1]}`);
    patches.push({ lesson: l.lessonNo, path: "conversation.aiTask.starterEn", before: s, after: t, reviewers: STARTER.reviewers, reason: STARTER.reason, partner: wrap[1] });
  }
{
  const l = [...m.values()].flatMap((wf) => wf.lessons).find((x) => x.lessonNo === 504);
  const R504 = { reviewers: "objective (coordinator)", reason: 'Luka is a guest, not one of the four conversation characters, so the app picks Birimo (as the wrap-up says) and Birimo would say "I\'m Luka." Birimo now plays the promise game in Luka\'s place; same targets. JA goal ルカと -> ビリモと' };
  patches.push({ lesson: 504, path: "conversation.aiTask.starterEn", before: l.conversation.aiTask.starterEn, after: "Hi! I'm Birimo. Let's make a promise, like Luka! I'll call you tomorrow. What time is good for you?", ...R504 });
  patches.push({ lesson: 504, path: "conversation.aiTask.goalJa", before: l.conversation.aiTask.goalJa, after: l.conversation.aiTask.goalJa.replace(/^ルカと /, "ビリモと "), ...R504 });
}
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
      if (t !== s) patches.push({ lesson: l.lessonNo, path: p, before: s, after: t, reviewers: [...new Set(rs.map((r) => r.reviewers))].join("; "), reason: [...new Set(rs.map((r) => r.reason))].join("; ") });
    }
fs.writeFileSync(path.join(REPO, ".run9-w1718/patches/20-after.json"), JSON.stringify(patches, null, 1));
console.log(patches.length, "patches");
for (const x of patches) console.log(`L${x.lesson} ${x.path}: ${x.after.slice(0, 150)}`);
