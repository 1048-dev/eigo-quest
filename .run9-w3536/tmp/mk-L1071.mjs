// Build patches for L1071-1080 (run9 W35-36 group 15).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
function P(lesson, p, from, to, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  if (!before.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const prev = out.find((x) => x.lesson === lesson && x.path === p);
  if (prev) {
    if (!prev.after.includes(from)) throw new Error(`merge miss L${lesson} ${p}: ${from}`);
    prev.after = prev.after.split(from).join(to);
    prev.reason += "; " + reason;
    if (prev.reviewers !== reviewers) prev.reviewers = prev.reviewers + ", " + reviewers;
    return;
  }
  const after = before.split(from).join(to);
  if (after === before) throw new Error(`noop L${lesson} ${p}`);
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const ja = (lesson, seg, from, to, reviewers, reason) => P(lesson, `teacher.segments[${seg}].subtitleJa`, from, to, reviewers, reason);

// L1071
P(1071, "teacherScript", "Birimo raises his hand right away. Kiko, why is it so dark down here?", "Birimo raises his hand right away and asks, Kiko, why is it so dark down here?", "A+C", "the question had no speaker, so it sounded like Ms. Emma asking Kiko");
P(1071, "teacherScript", "How deep does sunlight reach well?", "How deep does sunlight reach?", "A+C", "'reach well' at the end of a question is unnatural and hard to say");

// L1072
P(1072, "conversation.lines[4].en", "Because sunlight can't reach this deep, so nothing warms the water.", "Because sunlight can't reach this deep, nothing warms the water.", "objective", "'Because ~, so ~' is a grammar error (double connector)");
P(1072, "conversation.lines[4].ja", "ミズ・エマ、たしかめて くれますか？", "エマ先生、たしかめて くれますか？", "objective (JA)", "block policy: the JA name is エマ先生");
both(1072, 8, "Four degrees? Brrr! That's way colder than my bath! Can you check that for us? Sure. Let's ask Dr. Vale.", "Birimo says, Four degrees? Brrr! That's way colder than my bath! Riko asks me, Can you check that for us? I say, Sure. Let's ask Dr. Vale.", "A+C", "three speakers with no names; the voice cannot show who says what (JA names Birimo)");
ja(1072, 8, "「それを たしかめて くれる？」「いいよ。ヴェイル博士に きこう。」", "リコちゃんが わたしに きくよ。「それを たしかめて くれる？」 わたし「いいよ。ヴェイル博士に きこう。」", "A+C", "JA follows the speakers added in EN");
both(1072, 18, "You don't know the answer. A, make up a number.", "You don't know the answer. What do you do? A, make up a number.", "A+B", "the quiz had no question; JA already asks one");
ja(1072, 18, "こたえが わからない。いちばん いいのは どれ？ A、大きな かずを つくって いう。", "こたえが わからない。どう する？ A、かずを つくって いう。", "A+B", "JA matches the EN question and drops 大きな (not in EN)");
both(1072, 10, "Two or more? Degrees, with an s.", "Just one? Degree. Any other number? Degrees, with an s!", "objective", "the rule 'two or more' clashes with 'minus two degrees' said right after; only one degree has no s");
ja(1072, 10, "1 ど は degree、2 ど いじょうは s を つけて degrees。", "1 ど だけは degree。ほかの かずは s を つけて degrees！", "objective", "JA follows the corrected rule");
P(1072, "phonics.tipJa", "1 より 大きい ときは degrees と s が つくよ。", "1 ど の ときだけ degree、ほかは degrees と s が つくよ（minus two degrees も）。", "objective", "'bigger than 1 takes s' clashes with the tip's own −2°C = minus two degrees");

// L1073
both(1073, 7, "That's a great question. They're as big as dinner plates", "Haru says, That's a great question. They're as big as dinner plates", "A+C", "the answer had no speaker right after Kiko's question, so it sounded like Kiko answering herself");
ja(1073, 7, "「いい しつもんだね。", "ハルくん「いい しつもんだね。", "A+C", "JA follows the speaker added in EN");
both(1073, 8, "Females are bigger!", "Haru says, Females are bigger!", "A+C", "the answer had no speaker after 'Riko asks'");
ja(1073, 8, "「メスの ほうが 大きいよ！」", "ハルくん「メスの ほうが 大きいよ！」", "A+C", "JA follows the speaker added in EN");

// L1074
P(1074, "school.topic", "ミズ・エマと サンゴ図書館で", "エマ先生と サンゴ図書館で", "objective (JA)", "block policy: the JA name is エマ先生");
both(1074, 8, "I looked it up! Really? What did you find out? Many lanternfish", "I looked it up! Haru asks, Really? What did you find out? Birimo says, Many lanternfish", "A+C", "two speakers with no names; the voice cannot show the change");
ja(1074, 8, "「しらべたよ！」「ほんとう？ なにが わかったの？」 おおくの ハダカイワシは よる、食べものを 食べに 海の 上の ほうへ およいで いくんだって！", "「しらべたよ！」 ハルくん「ほんとう？ なにが わかったの？」 ビリモ「おおくの ハダカイワシは よる、食べものを 食べに 海の 上の ほうへ およいで いくんだって！」", "A+C", "JA follows the speakers added in EN");

// L1075
both(1075, 6, "Haru finishes his giant squid talk. Thank you, Haru!", "Haru finishes his giant squid talk. Riko says, Thank you, Haru!", "A+C", "the host line had no speaker (JA already names Riko)");
both(1075, 7, "Yes, Kiko. Go ahead. Thank you. I have a question about the eyes. Why are they so big? Big eyes can catch", "Riko says, Yes, Kiko. Go ahead. Kiko says, Thank you. I have a question about the eyes. Why are they so big? Haru says, Big eyes can catch", "A+C", "three speakers in a row with no names; the voice cannot show who is the host, who asks and who answers");
ja(1075, 7, "「はい、キコさん。どうぞ。」「ありがとう。目に ついて しつもんが あります。どうして そんなに 大きいの？」 大きな 目は 暗い なかで 小さな 光を つかまえられるんだ。", "リコちゃん「はい、キコさん。どうぞ。」 キコちゃん「ありがとう。目に ついて しつもんが あります。どうして そんなに 大きいの？」 ハルくん「大きな 目は 暗い なかで 小さな 光を つかまえられるんだ。」", "A+C", "JA follows the speakers added in EN");
ja(1075, 8, "ビリモ「はい、おねがい！", "ビリモ「はい、ぼく！", "objective (JA)", "'Me, please!' = はい、ぼく！ (as in the conversation JA); はい、おねがい drops 'me'");
both(1075, 10, "The strong beat is on OL.", "The strong beat is on COL.", "B+C", "'OL' is not a syllable of e-COL-o-gy and TTS spells or misreads it; L1070 says 'a strong COL'");
ja(1075, 10, "OL の ところを つよく。", "COL の ところを つよく。", "B+C", "JA follows the new EN");

// L1076
both(1076, 7, "What does source C say? It says scientists are still finding out.", "What does source C say? Haru says, It says scientists are still finding out.", "A+C", "the answer had no speaker after 'Kiko asks'");
ja(1076, 7, "「かがくしゃたちは まだ しらべて いる ところ だって。」", "ハルくん「かがくしゃたちは まだ しらべて いる ところ だって。」", "A+C", "JA follows the speaker added in EN");
both(1076, 17, "Two friends tell you different things.", "Two books tell you different things.", "A+B", "the frame is Source A says ~, but source B says ~; friends are not sources");
ja(1076, 17, "友だち ふたりが ちがう ことを いったよ。", "2 さつの 本が ちがう ことを いって いるよ。", "A+B", "JA follows the new EN");

// L1078
both(1078, 8, "Where did you find that? I found it in a book at the Coral Library.", "Riko asks, Where did you find that? Haru says, I found it in a book at the Coral Library.", "A+C", "question and answer by two speakers with no names; it sounded like Haru asking himself");
ja(1078, 8, "「それ、どこで 見つけたの？」「サンゴ図書館の 本で 見つけたよ。」", "リコちゃん「それ、どこで 見つけたの？」 ハルくん「サンゴ図書館の 本で 見つけたよ。」", "A+C", "JA follows the speakers added in EN");
both(1078, 10, "Clap the beat just before tion.", "Clap the beat just before the ending.", "B+C", "bare 'tion' is misread by TTS (tee-on / spelled out)");
P(1078, "teacherScript", "Presentation is strong just before -tion, pres-en-TA-tion.", "Presentation has a strong beat just before the ending, pres-en-TA-tion.", "B+C", "'Presentation is strong' is not natural, and bare '-tion' is misread when read aloud; same frame as 'Evidence has a strong first part'");
ja(1078, 19, "A、「ハダカイワシは とっても とっても かわいい！」", "A、「ハダカイワシは とっても とっても とっても かわいい！」", "objective (JA)", "EN has very, very, very (three), as in the conversation JA");

// L1079
both(1079, 10, "The beat is on OL.", "The strong beat is on NOL.", "B+C", "'OL' is not a syllable of tech-NOL-o-gy and TTS spells or misreads it");
ja(1079, 10, "OL の ところを つよく。", "NOL の ところを つよく。", "B+C", "JA follows the new EN");
both(1079, 20, "You can sum up in short,", "You can sum up with In short,", "A+B", "'sum up in short' reads as an idiom, not as the phrase In short (JA already says In short で)");

// L1080
P(1080, "teacherScript", "Riko talks about how deep-sea fish find food. Haru talks about giant squid.", "Haru talks about giant squid. Riko talks about how deep-sea fish find food.", "objective", "story: the conversation and seg6 say Haru is first");
P(1080, "teacherScript", "Riko asks, How do deep-sea fish find food? Haru asks, How big can giant squid grow?", "Haru asks, How big can giant squid grow? Riko asks, How do deep-sea fish find food?", "objective", "program order matches Haru going first");
P(1080, "teacherScript", "checked websites, asked experts and checked their sources", "looked at websites, asked experts and checked their sources", "A+C", "'checked' twice in one list is clumsy to read aloud");
both(1080, 7, "As big as dinner plates!", "Haru answers, As big as dinner plates!", "A+C", "the answer had no speaker after 'Riko asks'");
ja(1080, 7, "夕ごはんの おさらくらい！", "ハルくん「夕ごはんの おさらくらい！」", "A+C", "JA follows the speaker added in EN");

const dest = path.join(REPO, ".run9-w3536/patches/15-L1071-1080.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
