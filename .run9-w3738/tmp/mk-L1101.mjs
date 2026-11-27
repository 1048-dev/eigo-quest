// Build patches for L1101-1110 (run9 W37-38 group 12).
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

const rSpk = "the answer has no speaker, so the voice seems to answer its own question; name the speaker (house style, as in W35-36)";
const rStretch = "stretched respelling of the phonics word; TTS misreads it and it shows a wrong spelling of the word the child is learning";

// L1101
both(1101, 17, "The old box was very quiet, and then, pause, it moved! BOO!", "The old box was very quiet, and then… it moved! BOO!", "B+C", "TTS reads the word 'pause' aloud inside the model story; the '…' marks the pause, as in the aiTask starter ('and then... it moved!')");
ja(1101, 17, "そして、ここで まを とって、うごいた！", "そして…（ここで まを とって）うごいた！", "B+C", "JA follows the new EN");
both(1101, 20, "And you know as brave as a lion!", "And you know the simile as brave as a lion!", "A+B", "'you know as brave as a lion' does not parse; name it as a simile");

// L1102
both(1102, 12, "Now blow a warm breath on the lantern. Haaa!", "Now blow a warm breath on the lantern. Ahh!", "A+C", "'Haaa!' is an invented respelling TTS misreads; 'Ahh' is the breath sound used in L1106 ('Breathe out. Ahh.'), JA stays はぁー");

// L1103
both(1103, 7, "What was your favorite part, Kiko? The part where the cat turned pink!", "What was your favorite part, Kiko? Kiko says, The part where the cat turned pink!", "objective", rSpk);
ja(1103, 7, "「キコは どこが いちばん すきだった？」 「ネコが", "「キコは どこが いちばん すきだった？」 キコちゃん「ネコが", "objective", rSpk);
both(1103, 8, "Maybe you could sounds friendly.", "Start with Maybe you could. It sounds friendly.", "B+C", "'Maybe you could sounds friendly' reads as a broken sentence aloud ('could sounds')");
TS(1103, "Kiko says, I loved the part where the cat turned pink. Maybe you could add a sound word for the glitter. Birimo nods.", "Kiko says, I loved the part where the cat turned pink. Riko adds, Maybe you could add a sound word for the glitter. Birimo nods.", "objective", "story: in the conversation and seg7 Riko gives the sound-word idea, not Kiko");

// L1104
TS(1104, "Thanks for your ideas yesterday. They really helped.", "Thanks for your ideas. They really helped.", "A+B", "'yesterday' assumes the lessons are on back-to-back days; the rest of the script says 'Last time'");
P(1104, "conversation.aiTask.starterEn", "Here is a plain sentence, my dear: The boy said, There's a dragon. He went home.", "Here are two plain sentences, my dear: The boy said, There's a dragon. He went home.", "objective", "two sentences follow, not one");
both(1104, 17, "Tell me, I changed said to your word!", "Then say, I changed said to, and your new word!", "A+C", "'I changed said to your word' sounds like the child should say 'your word'; use the frame form of L1103 seg17 ('Say, I loved the part where, and then ...')");

// L1105
both(1105, 8, "Say once, a place, and who lived there.", "Start with Once, then a place, and who lived there.", "B+C", "read aloud, 'Say once' means 'say it one time'; make clear that Once is the first word");
both(1105, 20, "Next, go and talk with Haru! Good night!", "Next, go and talk with Haru! See you!", "A+B", "Ms. Emma's own sign-off should not assume the child's time of day (block decision, as W31-32 Good night -> See you); the story's Storytelling Night stays");
ja(1105, 20, "このあと ハルくんと おはなし してね！ おやすみ！", "このあと ハルくんと おはなし してね！ またね！", "A+B", "JA follows the new EN");

// L1106
both(1106, 7, "gently hummed to a frightened baby goat. Why did he change his mind?", "gently hummed to a frightened baby goat. Up in his tower, the king heard the song. Why did he change his mind?", "A+B+C", "the king is not in this segment, so 'he' has no person and the song never reaches him; add the line from the tale");
ja(1106, 7, "ハミング しました。王さまは どうして", "ハミング しました。とうの うえで、王さまが その 歌を きいたの。王さまは どうして", "A+B+C", "JA follows the new EN");
both(1106, 9, "Sssizzle!", "Sizzle, sizzle!", "B+C", rStretch);

// L1108
both(1108, 8, "Riko asks, What's your story about? It's about friendship and listening.", "Riko asks, What's your story about? Kiko says, It's about friendship and listening.", "objective", rSpk);
ja(1108, 8, "リコちゃん「どんな お話なの？」「友だちに", "リコちゃん「どんな お話なの？」 キコちゃん「友だちに", "objective", rSpk);

// L1109
both(1109, 6, "What was your favorite room? The Dragon Room, because Saffron told us riddles.", "What was your favorite room? Haru says, The Dragon Room, because Saffron told us riddles.", "objective", rSpk);
ja(1109, 6, "「どの 部屋が いちばん すきだった？」「竜の 部屋。", "「どの 部屋が いちばん すきだった？」 ハルくん「竜の 部屋。", "objective", rSpk);
both(1109, 8, "Haru asks, What's that place? That's the Highlands of the Heart. Wow!", "Haru asks, What's that place? Nib smiles. That's the Highlands of the Heart. Wow!", "objective", rSpk + " (Nib answers in the teacherScript)");
ja(1109, 8, "ハルくん「あそこは どこ？」「あれは こころの高原だよ。」", "ハルくん「あそこは どこ？」 ニブは にっこり。「あれは こころの高原だよ。」", "objective", rSpk);
TS(1109, "Kiko asks, What's that place? Nib smiles.", "Haru asks, What's that place? Nib smiles.", "objective", "story: Haru asks this in the conversation (line 6) and in seg8");

// L1110
TS(1110, "Then the sixth golden page appears: The sixth secret of stories:", "Then the sixth golden page appears. The sixth secret of stories:", "B+C", "two colons in one sentence; read aloud it runs together (L1105 uses a full stop here)");
both(1110, 9, "An old door. Creeeak!", "An old door. Creak, creak!", "B+C", rStretch);

const dest = path.join(REPO, ".run9-w3738/patches/12-L1101-1110.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
