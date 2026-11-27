// Build patches/15-L891-900.json from substring edits on the current world-30 values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-30.json"), "utf8"));
const lessonOf = (n) => w.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);

const out = [];
let err = 0;
/** edit(lesson, path, [[old, new], ...], reviewers, reason) */
function edit(lesson, p, pairs, reviewers, reason) {
  const before = get(lessonOf(lesson), p);
  if (typeof before !== "string") { console.log("NOPATH", lesson, p); err++; return; }
  let after = before;
  for (const [a, b] of pairs) {
    const n = after.split(a).length - 1;
    if (n !== 1) { console.log(`COUNT ${n} L${lesson} ${p}: ${a}`); err++; return; }
    after = after.replace(a, b);
  }
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, pairs, reviewers, reason) => {
  edit(lesson, `teacher.segments[${seg}].say`, pairs, reviewers, reason);
  edit(lesson, `teacher.segments[${seg}].subtitleEn`, pairs, reviewers, "match say");
};

// L891
edit(891, "teacherScript", [["New medicine can stop many sicknesses early.", "New medicine can stop many illnesses early."]], "A+C", "'sicknesses' is a rare plural and a hiss to say; 'illnesses' is the usual word");

// L892
both(892, 8, [["Then but adds your feeling.", "Then add your feeling with but."]], "A+C", "'Then but adds' reads as a broken sentence aloud; name the word in a plain instruction");

// L893
both(893, 8, [["Put that in the middle. Windows that make energy. That tells us the job.", "Put the word that in the middle. Windows that make energy. The job comes after it."]], "B+C", "'Put that' / 'That tells us' is heard as the pronoun, not the word that; name the word");
both(893, 19, [["We need that before the job.", "We need the word that before the job."]], "B+C", "name the word that so it is not heard as a pronoun");

// L894
both(894, 8, [["The air will be cleaner.", "The air will be cleaner. After if, say use, not will use."]], "A+B", "add the key if-clause rule (present tense after if), which the point segment never states");
edit(894, "teacher.segments[8].subtitleJa", [["「くうきは もっと きれいに なる」。", "「くうきは もっと きれいに なる」。if の あとは will use では なくて use だよ。"]], "A+B", "match the added English rule");

// L895
edit(895, "teacherScript", [
  ["Birimo says, There will be a giant cake shop, of course! Nova asks, What will there be for older people? Kiko answers, There will be benches and gentle hills.", "Birimo says, There will be a giant cake shop, of course! Then he asks, Nova, what will there be in your future city? Nova answers, There will be benches and gentle hills for older people."],
  ["Futuristic. Say fu, tu, RIS, tic.", "Futuristic. Say fu-tu-RIS-tic."],
], "objective", "story: the script had Nova ask and Kiko answer, but the conversation and seg7 have Birimo ask Nova and Nova answer; syllables in the hyphen beat form for TTS");
edit(895, "conversation.lines[4].en", [["Nova says, There will be benches and gentle hills for older people.", "I'm playing Nova! Beep! There will be benches and gentle hills for older people."]], "A+B", "Kiko answered a question put to Nova by quoting Nova; use the block's 'I'm playing Nova!' role-play frame");
edit(895, "conversation.lines[4].ja", [["ノバは「おとしよりの ために ベンチと なだらかな さかが あるよ」だって。", "わたしが ノバの やく！ ピッ！ おとしよりの ために ベンチと なだらかな さかが あるよ。"]], "A+B", "match the English");
edit(895, "teacher.segments[7].slide.items[1]", [["Nova says, There will be benches and gentle hills for older people.", "I'm playing Nova! Beep! There will be benches and gentle hills for older people."]], "A+B", "slide shows the changed conversation line");
both(895, 10, [["Futuristic. Fu, tu, RIS, tic. Clap the beat before ic!", "Futuristic. Fu-tu-RIS-tic. Clap the beat just before the I C ending!"]], "B+C", "hyphen beat form; bare 'ic' is a TTS risk, name the letters");

// L896
edit(896, "teacherScript", [["Electric. Say e, LEC, tric.", "Electric. Say e-LEC-tric."]], "B+C", "syllables in the hyphen beat form (brief) so TTS reads one word");
both(896, 10, [["Electric. E, LEC, tric.", "Electric. E-LEC-tric."]], "B+C", "syllables in the hyphen beat form (brief) so TTS reads one word");

// L897
edit(897, "teacherScript", [["Scientific. Say sci, en, TIF, ic.", "Scientific. Say sci-en-TIF-ic."]], "B+C", "syllables in the hyphen beat form; bare 'ic' is a TTS risk");
both(897, 10, [["Scientific. Sci, en, TIF, ic.", "Scientific. Sci-en-TIF-ic."]], "B+C", "syllables in the hyphen beat form; bare 'ic' is a TTS risk");
both(897, 16, [["Make your own headline.", "Think of your own article."]], "A+B", "the model sentence is not a headline, and the JA says じぶんの きじを かんがえて");

// L898
edit(898, "teacherScript", [["Energetic. Say en, er, GET, ic.", "Energetic. Say en-er-JET-ic."]], "objective", "the g in energetic is soft (jet), so 'GET' teaches and TTS reads the wrong sound; hyphen beat form with the real word jet");
both(898, 10, [["Energetic. En, er, GET, ic. Clap on get!", "Energetic. En-er-JET-ic. Clap on jet!"]], "objective", "the g in energetic is soft (jet), not get; the JA already says ジェット");
edit(898, "teacher.segments[10].subtitleJa", [["get で てを たたいて！", "ジェット で てを たたいて！"]], "objective", "match the English (soft g)");
both(898, 2, [["A paper that says, here is my idea.", "A paper that says, Here is my idea."]], "objective", "house style: capital letter after the comma in quoted speech");

// L899
edit(899, "teacherScript", [["Magnetic. Say mag, NET, ic.", "Magnetic. Say mag-NET-ic."]], "B+C", "syllables in the hyphen beat form; bare 'ic' is a TTS risk");
both(899, 10, [["Magnetic. Mag, NET, ic.", "Magnetic. Mag-NET-ic."]], "B+C", "syllables in the hyphen beat form; bare 'ic' is a TTS risk");

// L900
edit(900, "teacherScript", [["Futuristic. Say fu, tu, RIS, tic.", "Futuristic. Say fu-tu-RIS-tic."]], "B+C", "syllables in the hyphen beat form (brief) so TTS reads one word");
both(900, 10, [["Futuristic. Fu, tu, RIS, tic.", "Futuristic. Fu-tu-RIS-tic."]], "B+C", "syllables in the hyphen beat form (brief) so TTS reads one word");
both(900, 20, [["And next is World thirty-one, the Corridor of Time!", "Then it's on to World thirty-one, the Corridor of Time!"]], "A+C", "'Next, go and talk... And next is...' repeats next twice in a row");
edit(900, "teacher.segments[20].subtitleJa", [["そして つぎは ワールド31、ときの回廊！", "それから ワールド31、ときの回廊へ！"]], "A+C", "match the English");

fs.writeFileSync(path.join(ROOT, ".run9-w2930/patches/15-L891-900.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`${out.length} patches, errors ${err}`);
