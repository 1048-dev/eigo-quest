// Build patches for L1171-1180 (run9 W39-40 group 13).
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

const rSays = "the quote has no speaker, so the voice reads the character's words as my own";
const rLetters = "bare letter groups are read by TTS as words or sounds (ow = ouch, er = hesitation, ion = eye-on); spell the letters as the say lines do";
const rList = "bare suffixes in a list (ful, ly, ion) are misread by TTS; name the real words instead";
const rJaArrow = "'like ＝ きらう' / 'happy ＝ かなしい' reads as if the base word itself means the opposite; the arrow shows the result of adding the part";
const rJa = "JA follows the new EN";

// L1171
TS(1171, "Her voice sounds like a soft bell. Welcome, friends.", "Her voice sounds like a soft bell. She says, Welcome, friends.", "A+C", rSays + " (Celeste's welcome)");
TS(1171, "Birimo blinks. Have we met before?", "Birimo blinks and asks, Have we met before?", "A+C", rSays);
ja(1171, 0, "一だん ごとに ベルみたいに なるの。", "一だん ごとに ベルみたいな 音が するの。", "objective (JA)", "ベルみたいに なる reads as 'becomes like a bell'; EN says each step rings like a bell");
both(1171, 6, "Haru asks, Who are you? I'm Celeste,", "Haru asks, Who are you? She says, I'm Celeste,", "A+C", rSays + " (I'm Celeste)");
ja(1171, 6, "ハルくん「あなたは だれ？」「わたしは セレスト。", "ハルくん「あなたは だれ？」 セレスト「わたしは セレスト。", "A+C", rJa);

// L1172
both(1172, 8, "We said tells the old words.", "We said tells what we said back then.", "A+B", "'tells the old words' is unclear; say what We said does");
TS(1172, "but oa goes in the middle and ow goes at the end.", "but o, a goes in the middle and o, w goes at the end.", "B+C", rLetters);

// L1173
TS(1173, "and ir sounds just like ur and er.", "and i, r sounds just like u, r and e, r.", "B+C", rLetters);
TS(1173, "but ph sounds like f.", "but p, h sounds like f.", "B+C", rLetters);

// L1174
ja(1174, 15, "しんかいの都が いちばん すき。」", "しんかいの都が いちばん すきだったよ。」", "objective (JA)", "EN 'I liked ... best' is past; JA said present すき");

// L1175
TS(1175, "brighter and brighter. The Ray of Memories lit up! Celeste claps her tiny hands. You remembered", "brighter and brighter. Riko shouts, The Ray of Memories lit up! Celeste claps her tiny hands and says, You remembered", "A+C", rSays + " (Riko says the line in the conversation; 'lit up' after present-tense narration needs a speaker)");
TS(1175, "Birimo counts on his paws. One down", "Birimo counts on his paws and says, One down", "A+C", rSays);
TS(1175, "Rain has ai in the middle. Snow has ow at the end. Phone has ph, which", "Rain has a, i in the middle. Snow has o, w at the end. Phone has p, h, which", "B+C", rLetters);
P(1175, "conversation.lines[6].en", "Wait, really? Look!", "Wait, what's that? Look!", "A+B", "'Wait, really?' doubts Kiko's true line about the conference; Haru is reacting to the ray");
P(1175, "conversation.lines[6].ja", "え、ほんとに？ 見て！", "え、あれ なに？ 見て！", "A+B", rJa);
P(1175, "teacher.segments[8].slide.items[0]", "Wait, really? Look!", "Wait, what's that? Look!", "A+B", "slide shows conversation line 6");

// L1176
TS(1176, "We all preview our folders", "We all flip through our folders", "A+B", "preview = look at something before it happens; looking through old work is 'flip through' (also the TPR)");
both(1176, 6, "with a golden cover. This is the story", "with a golden cover and says, This is the story", "A+C", rSays);
both(1176, 7, "Why did you choose it? Because I rewrote", "Why did you choose it? Riko says, Because I rewrote", "A+C", rSays);
ja(1176, 7, "「どうして それを えらんだの？」「さいごを", "「どうして それを えらんだの？」 リコちゃん「さいごを", "A+C", rJa);
P(1176, "phonics.tipJa", "＋ happy ＝ かなしい", "＋ happy → しあわせ じゃない", "objective (JA)", rJaArrow);
P(1176, "phonics.tipJa", "＋ write ＝ 書きなおす", "＋ write → 書きなおす", "objective (JA)", "write itself is not 書きなおす; arrow shows the result");
P(1176, "phonics.tipJa", "＝ 見る ＝ 下見する", "＝ 見る → 下見する", "objective (JA)", "arrow shows the result");

// L1177
TS(1177, "in front of children from every continent", "in front of children from all over the world", "objective (fact)", "nobody came from Antarctica (the empty chair); six children from six continents");
TS(1177, "Careful is care plus ful, so", "Careful is care plus f, u, l, so", "B+C", rLetters + " (precedent L1131-1140)");
both(1177, 11, "Now chin up. Now stand tall and proud!", "Chin up! Now stand tall and proud!", "A+C", "'Now ... Now' back to back is clumsy to read");
P(1177, "tpr[0].ja", "1 年生の ころの 自分", "1 年目の ころの 自分", "objective (JA)", "first-year self = the first year of English, not first grade (1 年生)");
ja(1177, 11, "1 年生の ころの じぶん", "1 年目の ころの じぶん", "objective (JA)", "first-year self = the first year of English, not first grade (1 年生)");
both(1177, 20, "use used to, and build words with dis, ful and less.", "talk about what you used to do, and build words like dislike, careful and careless.", "A+C", rList + "; 'use used to' is clumsy aloud");
ja(1177, 20, "used to も つかえるし、dis・ful・less で ことばも つくれるね。", "used to で まえの ことも 話せるし、dislike・careful・careless みたいな ことばも つくれるね。", "A+C", rJa);
P(1177, "phonics.tipJa", "＋ like ＝ きらう", "＋ like → きらう", "objective (JA)", rJaArrow);

// L1178
TS(1178, "Haru gave me thumbs-ups,", "Haru gave me a thumbs-up,", "A+B", "'thumbs-ups' is not a natural plural; 'gave me a thumbs-up'");
TS(1178, "Celeste shines warmly. Hard parts", "Celeste shines warmly and says, Hard parts", "A+C", rSays);
TS(1178, "Quickly is quick plus ly, and ly tells us how.", "Quickly is quick plus l, y, and l, y tells us how.", "B+C", rLetters + " (ly = lie)");
both(1178, 7, "What helped you? My friends did.", "What helped you? Kiko says, My friends did.", "A+C", rSays);
ja(1178, 7, "ハルくん「なにが たすけに なった？」「友だちだよ。", "ハルくん「なにが たすけに なった？」 キコちゃん「友だちだよ。", "A+C", rJa);
both(1178, 9, "Quick plus ly makes quickly. Ly tells us how.", "Quick plus l, y makes quickly. L, y tells us how.", "B+C", rLetters + " (ly = lie)");
both(1178, 20, "make words with ness, ly and ment.", "make words like kindness, quickly and movement.", "B+C", rList);
ja(1178, 20, "ness・ly・ment で ことばも つくれるね。", "kindness・quickly・movement みたいな ことばも つくれるね。", "B+C", rJa);

// L1179
TS(1179, "Invention is invent plus ion, and ion makes a noun.", "Invention is invent plus i, o, n, and i, o, n makes a noun.", "B+C", rLetters + "; the -ion ending is not said 'eye-on'");
both(1179, 9, "Invent plus ion makes invention. Ion makes a noun.", "Invent plus i, o, n makes invention. I, o, n makes a noun.", "B+C", rLetters + "; the -ion ending is not said 'eye-on'");
both(1179, 7, "Why every day? Because", "Why every day? Riko says, Because", "A+C", rSays);
ja(1179, 7, "キコちゃん「どうして まいにち？」「まいにち", "キコちゃん「どうして まいにち？」 リコちゃん「まいにち", "A+C", rJa);
both(1179, 20, "and use ion, able and im.", "and build words like invention, comfortable and impossible.", "B+C", rList);
ja(1179, 20, "ion・able・im も つかえるね。", "invention・comfortable・impossible みたいな ことばも つくれるね。", "B+C", rJa);

// L1180
TS(1180, "smiles and opens his folder. Let me show you", "smiles, opens his folder and says, Let me show you", "A+C", rSays + " (the core line)");
TS(1180, "the second ray begins to glow. The Ray of Growth lit up! Celeste rings like a bell. You have grown", "the second ray begins to glow. Kiko shouts, The Ray of Growth lit up! Celeste rings like a bell and says, You have grown", "A+C", rSays + " (Kiko says the line in the conversation)");
TS(1180, "Careful is care plus ful. Movement is move plus ment. Dream has ea in the middle.", "Careful is care plus f, u, l. Movement is move plus ment. Dream has e, a in the middle.", "B+C", rLetters);
both(1180, 9, "Careful is care plus ful.", "Careful is care plus f, u, l.", "B+C", rLetters + " (precedent L1131-1140)");
both(1180, 4, "Bow. Bend forward politely, like this. Bow!", "Bow, like wow! Bend forward politely, like this. Take a bow!", "B+C", "bow is a heteronym; a lone 'Bow.' may be read as the ribbon bow (boh). 'like wow' and 'Take a bow' fix the sound for TTS and the child");
ja(1180, 4, "bow。こう やって、", "bow。wow と おなじ ひびき だよ！ こう やって、", "B+C", rJa);
ja(1180, 4, "たおす こと。おじぎ！", "たおす こと。おじぎ して！", "B+C", rJa);
both(1180, 6, "He stands up straight and opens his folder. Let me show", "He stands up straight, opens his folder and says, Let me show", "A+C", rSays);
both(1180, 7, "Then his deep-sea presentation. This shows", "Then he shows his deep-sea presentation and says, This shows", "A+C", rSays + " ('I can explain science' sounded like me)");
both(1180, 7, "Kiko raises her hand. I have a question.", "Kiko raises her hand and says, I have a question.", "A+C", rSays);
ja(1180, 7, "つぎは 深海の 発表。", "つぎは 深海の 発表を 見せるよ。", "A+C", rJa);

const dest = path.join(REPO, ".run9-w3940/patches/13-L1171-1180.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
