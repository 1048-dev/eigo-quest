// build patches/15-L951-960.json from the current world-32.json
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const w = JSON.parse(fs.readFileSync(path.join(root, "content/curriculum/worlds/world-32.json"), "utf8"));
const L = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);
const out = [];
function rep(lesson, p, pairs, reviewers, reason) {
  const before = get(L(lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  let after = before;
  for (const [a, b] of pairs) {
    if (!after.includes(a)) throw new Error(`not found L${lesson} ${p}: ${a}`);
    after = after.split(a).join(b);
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const seg = (i, f) => `teacher.segments[${i}].${f}`;
function en(lesson, i, pairs, reviewers, reason) {
  rep(lesson, seg(i, "say"), pairs, reviewers, reason);
  rep(lesson, seg(i, "subtitleEn"), pairs, reviewers, reason);
}
const SND = "invented respelling (TTS misreads it); use a real word with the same ending, as the brief asks";

// L951
rep(951, "teacherScript", [["It sounds like idge, but", "It sounds like the end of bridge, but"]], "B+C", SND);
en(951, 8, [["Let's not means, let's all stop, don't do it.", "Let's not means, let's all choose not to do it."]], "A+B", "'let's all stop, don't do it' is a muddled definition of let's not");
en(951, 9, [["It says idge, short and soft.", "It sounds like the end of bridge, short and soft."]], "B+C", SND);

// L952
rep(952, "teacherScript", [["The ending sounds like cher, zher, or sher, but we spell it u, r, e.", "The ending sounds like the end of picture or treasure, but we always spell it u, r, e."]], "B+C", SND + " ('cher' is read like the singer's name)");
en(952, 7, [["Why else did the lake get smaller? Because", "Why else did the lake get smaller? Birimo says, Because"]], "A+C", "the answer had no speaker, so Riko seemed to answer herself");
rep(952, seg(7, "subtitleJa"), [["」「ことしは", "」 ビリモ「ことしは"]], "A+C", "JA follows the added speaker");
en(952, 9, [["Temperature, cher. Measure, zher. Pressure, sher.", "Temperature ends like picture. Measure ends like treasure. Pressure ends like washer."]], "B+C", SND);
rep(952, seg(9, "subtitleJa"), [["temperature は「チャー」。measure は「ジャー」。pressure は「シャー」。", "temperature は picture と おなじ「チャー」。measure は treasure と おなじ「ジャー」。pressure は washer と おなじ「シャー」。"]], "B+C", "JA follows the real-word models");
en(952, 10, [["Moisture, cher.", "Moisture ends like picture, too."]], "B+C", SND);
rep(952, seg(10, "subtitleJa"), [["moisture は「チャー」。", "moisture も picture と おなじ「チャー」。"]], "B+C", "JA follows the real-word model");

// L953
rep(953, "teacherScript", [["It sounds like eess.", "It sounds like the end of geese."]], "B+C", SND);
en(953, 9, [["E, a, s, e says eess.", "E, a, s, e sounds like the end of geese."]], "B+C", SND);
rep(953, "phonics.tipJa", [["とき はなつ", "ときはなつ"]], "objective (JA)", "とき はなつ with a space reads as 'time / release'; one word ときはなつ");

// L954
en(954, 7, [["Say about when the number is close, but not exact.", "Use the word about when the number is close, but not exact."]], "A+B+C", "'Say about when...' reads as 'talk about when'; make clear 'about' is the word");

// L955
rep(955, "teacherScript", [
  ["How much water can you save with a shower one minute shorter?", "How much water can you save if your shower is one minute shorter?"],
  ["Average. The ending a, g, e sounds like idge. Temperature. The ending u, r, e sounds like cher. Increase. E, a, s, e sounds like eess. Amount. O, u, n, t.", "Average ends like bridge. Temperature ends like picture. Increase ends like geese. Amount ends like count."],
], "A+B+C", "awkward 'with a shower one minute shorter' (A+C); invented respellings idge / cher / eess replaced by real words (B+C)");
en(955, 0, [["We present our Save Water Campaign", "We're presenting our Save Water Campaign"]], "A+C", "natural tense for today's event; avoids the noun/verb 'present' stress risk");
en(955, 9, [["Average, idge. Temperature, cher. Increase, eess. Amount, ount.", "Average ends like bridge. Temperature ends like picture. Increase ends like geese. Amount ends like count."]], "B+C", SND);
rep(955, seg(9, "subtitleJa"), [["average は「イッジ」。temperature は「チャー」。increase は「イース」。amount は「アウント」。", "average は bridge と おなじ「イッジ」。temperature は picture と おなじ「チャー」。increase は geese と おなじ「イース」。amount は count と おなじ「アウント」。"]], "B+C", "JA follows the real-word models");

// L956
rep(956, "teacherScript", [["Ms. Emma opens the book and says, Read", "Fen opens the book, and I say, Read"]], "objective", "Ms. Emma narrates herself (I say); seg0 has Fen opening the book, so the story now agrees");
en(956, 9, [["Original, al. Eastern, ern. Lina's village was eastern.", "Original ends like animal. Eastern ends like pattern. Lina's village was in the eastern part of the valley."]], "A+B+C", "bare 'al' / 'ern' (TTS) and 'Lina's village was eastern' is unnatural; the story says 'in the eastern part of the valley'");
rep(956, seg(9, "subtitleJa"), [["original は「アル」。eastern は「アン」。リナの むらは ひがしの ほう だったね。", "original は animal と おなじ「アル」。eastern は pattern と おなじ「アン」。リナの むらは たにの ひがしの ほうに あったね。"]], "A+B+C", "JA follows the new EN");
en(956, 10, [["Moisture, cher.", "Moisture ends like picture."]], "B+C", SND);
rep(956, seg(10, "subtitleJa"), [["moisture は「チャー」。", "moisture は picture と おなじ「チャー」。"]], "B+C", "JA follows the real-word model");

// L957
en(957, 9, [["Tropical, al.", "Tropical ends like animal."]], "B+C", SND + " (bare 'al' is read like the name Al)");
rep(957, seg(9, "subtitleJa"), [["tropical は「アル」。", "tropical は animal と おなじ「アル」。"]], "B+C", "JA follows the real-word model");
en(957, 10, [["Shortage, idge.", "Shortage ends like bridge."]], "B+C", SND);
rep(957, seg(10, "subtitleJa"), [["shortage は「イッジ」。", "shortage は bridge と おなじ「イッジ」。"]], "B+C", "JA follows the real-word model");

// L958
en(958, 10, [["Environment plus a l.", "Environment plus a, l."], ["Spell it w a r d.", "Spell it w, a, r, d."]], "B+C", "letters need commas (as in the teacherScript); TTS reads 'plus a l' as 'plus an L' and may read 'w a r d' as a word");
en(958, 11, [["Decrease. E a s e, ease.", "Decrease. E, a, s, e, like the end of geese."]], "objective", "the word 'ease' is pronounced with a z sound, but -ease in decrease is an s sound; letters need commas");
en(958, 14, [["Line up!", "Up, up, up!"]], "A+B+C", "'Line up!' means 'stand in a line'; the move is drawing a line going up");

// L959
rep(959, "teacherScript", [["Humphrey turns his long neck and winks. Do camels", "Humphrey turns his long neck and winks. He asks, Do camels"]], "A+C", "Humphrey's question had no speaker tag");
en(959, 7, [["Look, there's Dr. Mira's", "Kiko says, Look, there's Dr. Mira's"]], "A+C", "first quote had no speaker (Kiko in the conversation)");
rep(959, seg(7, "subtitleJa"), [["「見て、ミラ", "キコちゃん「見て、ミラ"]], "A+C", "JA follows the added speaker");
en(959, 9, [["How hot asks how much heat.", "How hot tells us the temperature."]], "A+B", "'how hot' here is not a question ('The graph shows how hot it is'); clearer meaning");
en(959, 10, [["Coast plus a l.", "Coast plus a, l."]], "B+C", "letters need commas (as in the teacherScript); TTS reads 'plus a l' as 'plus an L'");
en(959, 11, [["Count. O u n t.", "Count. O, u, n, t."]], "B+C", "letters need commas (as in the teacherScript) so TTS spells them");

// L960
rep(960, "teacherScript", [["A, g, e sounds like idge.", "A, g, e sounds like the end of bridge."]], "B+C", SND);
en(960, 10, [["Drop the e from globe and add a l.", "Drop the e from globe and add a, l."], ["North plus e r n.", "North plus e, r, n."]], "B+C", "letters need commas; TTS reads 'add a l' as 'add an L'");
en(960, 11, [["Average. A g e sounds like idge.", "Average. A, g, e sounds like the end of bridge."]], "B+C", SND + "; letters need commas");

fs.writeFileSync(path.join(root, ".run9-w3132/patches/15-L951-960.json"), JSON.stringify(out, null, 2) + "\n");
console.log(out.length, "patches");
