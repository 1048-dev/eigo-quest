import fs from "node:fs";
const root = new URL("../../", import.meta.url);
const w22 = JSON.parse(fs.readFileSync(new URL("content/curriculum/worlds/world-22.json", root), "utf8"));
const L = (n) => w22.lessons.find((l) => l.lessonNo === n);
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => a[t], o);
// [lesson, path, [[from,to],...], reviewers, reason]
const S = "teacher.segments";
const E = [
 [641, `${S}[9].say`, [["A-sleep. A-wake. A-round. A-cross.", "Asleep. Awake. Around. Across."]], "B+C", "TTS reads the capital 'A-' beat as the letter name /eɪ/, the very sound seg10 tells kids not to make; the slide keeps a-sleep etc."],
 [641, `${S}[9].subtitleEn`, [["A-sleep. A-wake. A-round. A-cross.", "Asleep. Awake. Around. Across."]], "B+C", "Follow seg9 say"],
 [641, `${S}[9].subtitleJa`, [["a-sleep。a-wake。a-round。a-cross。", "asleep。awake。around。across。"]], "B+C", "Follow seg9 say"],
 [641, `${S}[10].say`, [["Don't say ay.", "Don't say the letter A."]], "B+C", "'ay' is an invented respelling and TTS reads it as 'aye' /aɪ/; JA already says 「エー」"],
 [641, `${S}[10].subtitleEn`, [["Don't say ay.", "Don't say the letter A."]], "B+C", "Follow seg10 say"],
 [642, "teacherScript", [["Yesterday, we read", "Last time, we read"]], "A+B", "Pacing word assumes daily lessons; 'Last time' as in earlier worlds"],
 [642, "conversation.aiTask.starterEn", [["Something exciting happened! Can you guess? What happens", "Something exciting happened! What happens"]], "A+B", "Two questions in a row ('Can you guess?' then another); the child cannot tell which to answer"],
 [642, `${S}[4].say`, [["A small voice. hello. Voice!", "A small voice... hello. Voice!"]], "A+C", "Lowercase sentence start; the pause makes the small voice clear"],
 [642, `${S}[4].subtitleEn`, [["A small voice. hello. Voice!", "A small voice... hello. Voice!"]], "A+C", "Follow seg4 say"],
 [642, `${S}[7].say`, [["Let's read more tomorrow!", "Let's read more next time!"]], "A+B", "Teacher narration assumes a daily schedule (the in-story line in conversation stays)"],
 [642, `${S}[7].subtitleEn`, [["Let's read more tomorrow!", "Let's read more next time!"]], "A+B", "Follow seg7 say"],
 [642, `${S}[7].subtitleJa`, [["つづきは あした よもう！", "つづきは つぎの じかんに よもう！"]], "A+B", "Follow seg7 say"],
 [642, `${S}[9].say`, [["PEN-cil. SEC-ond. DRAG-on. BUT-ton.", "Pencil. Second. Dragon. Button."]], "B+C", "TTS reads the capital beat 'SEC' as the letters S-E-C; the slide keeps pen-cil etc."],
 [642, `${S}[9].subtitleEn`, [["PEN-cil. SEC-ond. DRAG-on. BUT-ton.", "Pencil. Second. Dragon. Button."]], "B+C", "Follow seg9 say"],
 [642, `${S}[9].subtitleJa`, [["PEN-cil。SEC-ond。DRAG-on。BUT-ton。", "pencil。second。dragon。button。"]], "B+C", "Follow seg9 say"],
 [643, "school.expressions[2].ja", [["おわりかたは しあわせだったよ。", "しあわせな おわりかただったよ。"]], "objective (JA)", "おわりかたは しあわせだった is unnatural; the conversation line already says しあわせな おわりかただった"],
 [643, `${S}[16].subtitleJa`, [["「おわりかたは しあわせだった。」", "「しあわせな おわりかただった。」"]], "objective (JA)", "Follow expressions[2].ja"],
 [644, `${S}[7].say`, [["Can you tell me more? The door", "Can you tell me more? Professor Quill says, The door"]], "A+B", "The answer had no speaker, so it sounded like Ms. Emma or Riko answering"],
 [644, `${S}[7].subtitleEn`, [["Can you tell me more? The door", "Can you tell me more? Professor Quill says, The door"]], "A+B", "Follow seg7 say"],
 [644, `${S}[7].subtitleJa`, [["「もっと くわしく おしえて？」「ドアは", "「もっと くわしく おしえて？」 はかせ「ドアは"]], "A+B", "Follow seg7 say"],
 [644, `${S}[9].say`, [["GI-ant. LI-on. PI-lot. WIZ-ard.", "Giant. Lion. Pilot. Wizard."]], "B+C", "TTS reads the capital beats 'GI', 'LI', 'PI' as letters (G-I, P-I); the slide keeps gi-ant etc."],
 [644, `${S}[9].subtitleEn`, [["GI-ant. LI-on. PI-lot. WIZ-ard.", "Giant. Lion. Pilot. Wizard."]], "B+C", "Follow seg9 say"],
 [644, `${S}[9].subtitleJa`, [["GI-ant。LI-on。PI-lot。WIZ-ard。", "giant。lion。pilot。wizard。"]], "B+C", "Follow seg9 say"],
 [644, `${S}[10].say`, [["Stomp, stomp! GI-ant.", "Stomp, stomp! Giant!"], ["Wave your wand! WIZ-ard.", "Wave your wand! Wizard!"]], "B+C", "Same TTS letter-reading of 'GI'; both words kept in one form"],
 [644, `${S}[10].subtitleEn`, [["Stomp, stomp! GI-ant.", "Stomp, stomp! Giant!"], ["Wave your wand! WIZ-ard.", "Wave your wand! Wizard!"]], "B+C", "Follow seg10 say"],
 [644, `${S}[10].subtitleJa`, [["ドシン、ドシン！ GI-ant。", "ドシン、ドシン！ giant！"], ["つえを ふって！ WIZ-ard。", "つえを ふって！ wizard！"]], "B+C", "Follow seg10 say"],
 [645, `${S}[2].say`, [["I read it. Now I retell it.", "First, I read it. Then, I retell it."]], "B+C", "Heteronym: TTS reads 'I read it' as present /riːd/ against the intended past; the routine form is clear for both"],
 [645, `${S}[2].subtitleEn`, [["I read it. Now I retell it.", "First, I read it. Then, I retell it."]], "B+C", "Follow seg2 say"],
 [645, `${S}[2].subtitleJa`, [["よんだら、こんどは はなしなおす。", "まず よむ。それから、はなしなおす。"]], "B+C", "Follow seg2 say"],
 [645, `${S}[9].say`, [["a-SLEEP. PEN-cil. CHIL-dren. GI-ant.", "Asleep. Pencil. Children. Giant."]], "B+C", "TTS reads the capital beat 'GI' as the letters G-I (same as L644); the slide keeps the beat forms"],
 [645, `${S}[9].subtitleEn`, [["a-SLEEP. PEN-cil. CHIL-dren. GI-ant.", "Asleep. Pencil. Children. Giant."]], "B+C", "Follow seg9 say"],
 [645, `${S}[9].subtitleJa`, [["a-SLEEP。PEN-cil。CHIL-dren。GI-ant。", "asleep。pencil。children。giant。"]], "B+C", "Follow seg9 say"],
 [647, "teacherScript", [["Since that day, Ember was afraid of people.", "After that day, Ember was afraid of people."]], "objective", "'Since that day' needs a perfect tense; 'After that day' keeps the simple past"],
 [647, `${S}[8].say`, [["Scared, so ran away. Ran away because scared.", "He was scared, so he ran away. He ran away because he was scared."]], "A+B", "Telegraphic fragments model ungrammatical sentences in the point segment"],
 [647, `${S}[8].subtitleEn`, [["Scared, so ran away. Ran away because scared.", "He was scared, so he ran away. He ran away because he was scared."]], "A+B", "Follow seg8 say"],
 [648, "teacherScript", [["When joins two things that happened at the same time.", "When joins two events."]], "A+B", "Wrong rule: the bell rang and then the door opened (seg8 says so); match seg1 'Join two events with when'"],
 [648, "conversation.aiTask.starterEn", [["What happened when you opened your door?", "What happened when it landed? You decide!"]], "A+B", "The question assumed a real event with the child's door; the task is to continue the magical story with When"],
 [648, `${S}[10].say`, [["It sounds like ul, but", "The ending is soft and quick, but"]], "B+C", "'ul' is an invented respelling that TTS may read as letters"],
 [648, `${S}[10].subtitleEn`, [["It sounds like ul, but", "The ending is soft and quick, but"]], "B+C", "Follow seg10 say"],
 [648, `${S}[10].subtitleJa`, [["おとは「アル」でも、", "おとは よわい「アル」でも、"]], "B+C", "Follow seg10 say"],
 [649, "conversation.aiTask.starterEn", [["What can we do? If we..., what will happen?", "What can we do? Start with If we..."]], "A+B+C", "'If we..., what will happen?' is a broken, hard-to-read prompt"],
 [649, `${S}[3].say`, [["No key, no open!", "No key? It won't open!"]], "A+B", "'No key, no open!' is broken English"],
 [649, `${S}[3].subtitleEn`, [["No key, no open!", "No key? It won't open!"]], "A+B", "Follow seg3 say"],
 [649, `${S}[10].say`, [["Ul and us. Soft and quick at the end.", "Both endings are soft and quick."]], "B+C", "'Ul' is an invented respelling that TTS may misread"],
 [649, `${S}[10].subtitleEn`, [["Ul and us. Soft and quick at the end.", "Both endings are soft and quick."]], "B+C", "Follow seg10 say"],
 [649, `${S}[10].subtitleJa`, [["「アル」と「アス」。おわりは よわく みじかく。", "どちらも おわりは よわく みじかく。「アル」と「アス」。"]], "B+C", "Follow seg10 say"],
 [650, "teacherScript", [["she felt lonely, because", "she felt lonely because"], ["she felt scared, because", "she felt scared because"], ["she felt safe, because", "she felt safe because"], ["she felt happy, because", "she felt happy because"]], "A+B", "No comma before a final because clause; matches the taught pattern 'She was sad because ~'"],
 [650, "conversation.lines[6].en", [["Mysterious! Let's", "How mysterious! Let's"]], "A+B+C", "A bare 'Mysterious!' is not natural; 'How mysterious!' keeps the phonics word"],
 [650, `${S}[7].say`, [["I say, Mysterious!", "I say, How mysterious!"]], "A+B+C", "Follow conversation.lines[6]"],
 [650, `${S}[7].subtitleEn`, [["I say, Mysterious!", "I say, How mysterious!"]], "A+B+C", "Follow conversation.lines[6]"],
 [650, `${S}[7].slide.items[2]`, [["Mysterious! Let's", "How mysterious! Let's"]], "A+B+C", "Follow conversation.lines[6]"],
];
const out = [];
for (const [lesson, path, reps, reviewers, reason] of E) {
  const before = get(L(lesson), path);
  let after = before;
  for (const [f, t] of reps) { if (!after.includes(f)) throw new Error(`L${lesson} ${path}: missing ${f}`); after = after.replace(f, t); }
  out.push({ lesson, path, before, after, reviewers, reason });
}
fs.writeFileSync(new URL(".run9-w2122/patches/14-L641-650.json", root), "[\n" + out.map((p) => "  " + JSON.stringify(p)).join(",\n") + "\n]\n");
console.log(out.length);
