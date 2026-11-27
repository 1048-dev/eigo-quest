// Build patches for L1091-1100 (run9 W37-38 group 11).
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
    if (!prev.reason.includes(reason)) prev.reason += "; " + reason;
    if (!prev.reviewers.split(", ").includes(reviewers)) prev.reviewers = prev.reviewers + ", " + reviewers;
    return;
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const ja = (lesson, seg, from, to, reviewers, reason) => P(lesson, `teacher.segments[${seg}].subtitleJa`, from, to, reviewers, reason);
const TS = (lesson, from, to, reviewers, reason) => P(lesson, "teacherScript", from, to, reviewers, reason);

const rBig = "TTS may spell out the all-caps 'BIG' (B-I-G); L1100 already writes 'then big!', so use lowercase";
const rLy = "bare '-ly' is misread by TTS (minus / 'lie'); spell the letters 'l y' as the say lines already do";

// L1091
both(1091, 9, "Small and slow, then BIG!", "Small and slow, then big!", "B+C", rBig);
both(1091, 17, "Change it to you.", "Make it about you.", "A+B", "'Change it to you' is not natural English; 'Make it about you' matches the JA じぶんの ことに かえて");
both(1091, 19, "If I were means just imagine.", "If I were means we're just imagining.", "A+B", "'means just imagine' is ungrammatical; use a full clause");

// L1092
both(1092, 9, "Small and slow, then BIG!", "Small and slow, then big!", "B+C", rBig);

// L1093
both(1093, 9, "Small and slow, then BIG!", "Small and slow, then big!", "B+C", rBig);
both(1093, 7,
  "Haru, what would you do if you had an invisible cape? I would taste the cake before the party! Haru! OK, OK. I would help people quietly.",
  "Birimo asks, Haru, what would you do if you had an invisible cape? Haru says, I would taste the cake before the party! I say, Haru! He says, OK, OK. I would help people quietly.",
  "A+C", "four quotes in a row with no speaker; the voice cannot tell that Birimo asks, Haru answers and I (Ms. Emma) say 'Haru!' (conversation lines 4-7)");
ja(1093, 7,
  "「ハルくん、もし 見えない マントが あったら どうする？」 「パーティーの まえに ケーキを あじみ！」 「ハルくん！」 「わかった、わかった。こっそり みんなを たすけるよ。」",
  "ビリモ「ハルくん、もし 見えない マントが あったら どうする？」 ハルくん「パーティーの まえに ケーキを あじみ！」 わたし「ハルくん！」 ハルくん「わかった、わかった。こっそり みんなを たすけるよ。」",
  "A+C", "JA follows the new EN (speakers named)");

// L1094
both(1094, 9, "Small and slow, then BIG!", "Small and slow, then big!", "B+C", rBig);
both(1094, 1, "Tell the time before in a story.", "Talk about the time before the big day in a story.", "A+B", "'Tell the time before' reads like telling the clock time; name the earlier time as seg8 does ('then the big day')");
ja(1094, 1, "お話の「それより まえ」を いおう。", "お話の「大切な 日より まえ」を いおう。", "A+B", "JA follows the new EN");
both(1094, 18, "Did Pell see it before?", "Had Pell seen it before?", "A+B", "the quiz question should echo the target past perfect (She had never seen the sea before)");
ja(1094, 18, "まえに 見た ことは ある？", "それまでに 見た ことは あった？", "A+B", "JA follows the new EN (past)");

// L1095
both(1095, 9, "Small and slow, then BIG!", "Small and slow, then big!", "B+C", rBig);
TS(1095, "Riko goes first. If I had three wishes,", "Riko goes first and says, If I had three wishes,", "A+C", "Riko's quote has no 'says', so the voice reads it as Ms. Emma's own wish (house style: X says, ...)");
TS(1095, "after a long think,", "after thinking hard,", "objective (US policy)", "'have a (long) think' is British; US: 'after thinking hard'");

// L1096
TS(1096, "Words that end in -ly tell us", "Words that end in l y tell us", "B+C", rLy);
TS(1096, "we usually just add -ly.", "we usually just add l y.", "B+C", rLy);

// L1097
TS(1097, "Kiko frowns. It's true, but it's a bit boring.", "Kiko frowns and says, It's true, but it's a bit boring.", "A+C", "after 'Kiko frowns.' the quote has no speaker, so the voice reads it as Ms. Emma's opinion of Kiko's line");

// L1098
both(1098, 0, "Good day, everyone!", "Hi, everyone!", "objective (US policy)", "'Good day' as a greeting is British / Australian and stiff; block-wide openings use 'Hi, ~!' (JA こんにちは already matches)");
TS(1098, "we keep the e and add -ly.", "we keep the e and add l y.", "B+C", rLy);

// L1100
TS(1100, "brave plus -ly.", "brave plus l y.", "B+C", rLy);
both(1100, 8, "Kiko's hero? A tiny breeze becomes her friend.", "Who helps Kiko's hero? A tiny breeze becomes her friend.", "A+B", "'Kiko's hero?' asks who the hero is, but the answer says who helps her (Aria is the hero); use the target question");
ja(1100, 8, "キコちゃんの 主人公は？", "キコちゃんの 主人公を たすけるのは？", "A+B", "JA follows the new EN");

const dest = path.join(REPO, ".run9-w3738/patches/11-L1091-1100.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
