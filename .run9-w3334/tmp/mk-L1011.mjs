// Build patches for L1011-1020 (run9 W33-34 group 15).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds([34]);
const out = [];
const idx = new Map(); // merge multiple fixes on the same field
function P(lesson, p, from, to, reviewers, reason) {
  const key = `${lesson}|${p}`;
  const prev = idx.get(key);
  const base = prev ? prev.after : getAt(lessonOf(W, lesson), p);
  if (typeof base !== "string") throw new Error(`no path L${lesson} ${p}`);
  if (!base.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
  const after = base.split(from).join(to);
  if (prev) {
    prev.after = after;
    if (prev.reviewers !== reviewers) {
      if (reviewers.startsWith("objective")) prev.reviewers = reviewers;
      else if (!prev.reviewers.startsWith("objective")) {
        const letters = [...new Set((prev.reviewers + reviewers).match(/[ABC]/g))].sort();
        prev.reviewers = letters.join("+");
      }
    }
    prev.reason = `${prev.reason}; ${reason}`;
  } else {
    const rec = { lesson, path: p, before: base, after, reviewers, reason };
    idx.set(key, rec);
    out.push(rec);
  }
}
const both = (lesson, seg, from, to, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, from, to, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, from, to, reviewers, reason);
};
const US = "objective (US policy)";

// ---------- L1011 ----------
const r1011 = "the square sign is in Brightwater (a dollar city, not the UK); signs use US words, the UK words stay in the phonics part";
P(1011, "teacherScript", "Please stay on the pavement and do not climb into the fountain. The underground station is across the bridge. Please join the queue at the ticket machines and check the timetable on the wall.", "Please stay on the sidewalk and do not climb into the fountain. The subway station is across the bridge. Please wait in line at the ticket machines and check the schedule on the wall.", US, r1011);
P(1011, "teacherScript", "Where is the underground station? Across the bridge.", "Where is the subway station? Across the bridge.", US, r1011);

// ---------- L1012 ----------
const r1012 = "US policy: Ms. Emma in a Brightwater restaurant asks for the check (bill = UK side, kept in the phonics part)";
const bill = "Could we have the bill, please?";
const check = "Could we have the check, please?";
for (const p of [
  "school.grammar", "school.expressions[2].en", "conversation.lines[6].en", "conversation.aiTask.targetExpressions[2]",
  "conversation.aiTask.goalJa", "recap.highlightsJa[1]", "teacher.segments[1].slide.items[1]", "teacher.segments[7].slide.items[1]",
  "teacher.segments[16].slide.items[0]", "teacher.segments[18].slide.items[0]", "teacher.segments[19].slide.items[0]", "teacher.segments[20].slide.items[2]",
]) P(1012, p, bill, check, US, r1012);
both(1012, 7, bill, check, US, r1012);
both(1012, 16, bill, check, US, r1012);
both(1012, 18, bill, check, US, r1012);
P(1012, "teacherScript", "After lunch, Ms. Emma asks, Could we have the bill, please?", "After lunch, Ms. Emma asks, Could we have the check, please?", US, r1012);
both(1012, 19, "It's A! The bill comes at the end. In the US, it's the check.", "It's A! The check comes at the end. In the UK, it's the bill.", US, r1012);
P(1012, "teacher.segments[19].subtitleJa", "おかんじょうは さいごに たのむよ。アメリカでは check だね。", "おかんじょうは さいごに たのむよ。イギリスでは bill だね。", US, "JA follows the EN (the answer is now check; bill is the UK word)");
both(1012, 20, "and ask for the bill.", "and ask for the check.", US, r1012);
const r1012b = "US policy: the menu and Kiko's question in a dollar city use cookie (biscuit = UK side, kept in the phonics part; JA already says クッキー)";
P(1012, "teacherScript", "Every children's plate comes with a free biscuit.", "Every children's plate comes with a free cookie.", US, r1012b);
P(1012, "teacherScript", "What comes with every children's plate? A free biscuit.", "What comes with every children's plate? A free cookie.", US, r1012b);
P(1012, "conversation.lines[4].en", "Does it come with a biscuit?", "Does it come with a cookie?", US, r1012b);

// ---------- L1013 ----------
const r1013t = "story timeline: L1014 (museum, 'today') and L1015 (Clock Tower, boat, lunch and museum all on one day, told to Skye tonight) put the hotel meeting before the museum; 'this evening' contradicts that; afternoon tea fits";
P(1013, "teacherScript", "This evening, we come back to the Seagull Hotel.", "After lunch, we stop by the Seagull Hotel.", "objective", r1013t);
both(1013, 0, "Tonight, two friendly travelers", "This afternoon, two friendly travelers", "objective", r1013t);
P(1013, "teacher.segments[0].subtitleJa", "こんやは ホテルの ロビーで", "きょうの ごごは ホテルの ロビーで", "objective", "JA follows the EN");
const r1013l = "US policy: Ms. Emma's TPR command is not a UK comparison and not Mrs. Brown's line; elevator (JA already エレベーター)";
P(1013, "tpr[0].en", "Press the button for the lift!", "Press the button for the elevator!", US, r1013l);
for (const p of ["teacher.segments[12].slide.items[0]", "teacher.segments[13].slide.items[2]"]) P(1013, p, "Press the button for the lift!", "Press the button for the elevator!", US, r1013l);
both(1013, 12, "Press the button for the lift.", "Press the button for the elevator.", US, r1013l);
const r1013s = "TTS spells out the capital 'EL' and pauses at each comma; use the hyphen beat form (testPoints already say EL-e-va-tor, va-CA-tion) and clap on 'the first part'";
both(1013, 9, "EL, e, va, tor. The first part is strong. Clap on EL!", "EL-e-va-tor. The first part is strong. Clap on the first part!", "B+C", r1013s);
P(1013, "teacher.segments[9].subtitleJa", "EL で てを たたいて！", "さいしょで てを たたいて！", "B+C", "JA follows the EN");
both(1013, 10, "Holiday is from the UK. Vacation is from the US. Va, CA, tion.", "Holiday is the UK word. Vacation is the US word. Va-CA-tion.", "A+B+C", "'Holiday is from the UK' sounds like the word comes from the UK (US also says holiday for special days); 'the UK word' matches the JA; hyphen beat form for TTS");
both(1013, 20, "Great job! You can explain", "Well done! You can explain", "A+C", "seg19 ends 'Great job!' (block-wide praise) and seg20 started 'Great job!' again; JA よく できました already fits");

// ---------- L1014 ----------
const r1014 = "US policy: a museum room in Brightwater (dollar city) is the Science Center (centre = UK spelling, kept in the phonics part)";
const sc = "Science Centre";
for (const p of [
  "school.expressions[2].en", "conversation.lines[4].en", "conversation.aiTask.targetExpressions[2]", "recap.highlightsJa[1]",
  "teacher.segments[1].slide.items[1]", "teacher.segments[7].slide.items[1]", "teacher.segments[15].slide.items[0]", "teacher.segments[19].slide.items[1]",
]) P(1014, p, sc, "Science Center", US, r1014);
both(1014, 7, sc, "Science Center", US, r1014);
both(1014, 15, sc, "Science Center", US, r1014);
P(1014, "teacherScript", "Don't miss the Colour Room and the Science Centre on the second floor! The Little Theatre shows", "Don't miss the Color Room and the Science Center on the second floor! The Little Theater shows", US, "US policy: the price list is a Brightwater sign; US spellings (UK forms stay in the phonics part)");
P(1014, "teacherScript", "Theatre. It's the same! In the UK,", "Theatre. It's the same pattern! In the UK,", "A+B", "'It's the same!' can be heard as 'the spelling is the same'; it means theatre follows the same r, e pattern as centre");

// ---------- L1015 ----------
P(1015, "teacher.segments[0].subtitleJa", "こんばんは、おはなし じょうずの みんな！", "こんにちは、おはなし じょうずの みんな！", "objective (JA)", "EN opening is 'Hello, storytellers!' (block-wide Hello opening); JA still said こんばんは");
both(1015, 8, "You told it in order! Here is your fifth stamp! Stamp!", "You told it in order! Skye gives us the fifth stamp. Stamp!", "A+B", "Ms. Emma read Skye's stamp line as her own (in the story and the conversation Skye / Birimo-as-Skye gives the stamp)");
P(1015, "teacher.segments[8].subtitleJa", "5つめの スタンプだよ！ ポン！", "スカイが 5つめの スタンプを くれたよ！ ポン！", "A+B", "JA follows the EN");
const r1015n = "760 is read seven / sixty (one digit, then two); 'two numbers at a time' is wrong for it and confuses numbers with digits";
both(1015, 10, "Flight seven sixty. Read two numbers at a time.", "Flight seven sixty. Read it in two parts.", "A+B", r1015n);
P(1015, "teacher.segments[10].subtitleJa", "Flight 760。2けたずつ よもう。", "Flight 760。2つに わけて よもう。", "A+B", "JA follows the EN");
P(1015, "teacherScript", "Flight 760. Read it two numbers at a time. Flight seven sixty.", "Flight 760. Read it in two parts. Flight seven sixty.", "A+B", r1015n);

// ---------- L1016 ----------
P(1016, "teacherScript", "Thank you for a lovely holiday at the Seagull Hotel.", "Thank you for a wonderful stay at the Seagull Hotel.", US, "US policy: Ms. Emma's own email is American English (holiday = UK, taught in the phonics part); 'stay' is what you thank a hotel for");
const rLee = "JA name unified to リーさん (block rule; the rest of the block says リーさん)";
P(1016, "conversation.lines[6].ja", "ミスター・リーの やく", "リーさんの やく", "objective (JA)", rLee);
P(1016, "conversation.aiTask.goalJa", "AI の ミスター・リー（フロント）に", "AI の リーさん（フロント）に", "objective (JA)", rLee);
P(1016, "teacher.segments[7].subtitleJa", "ビリモが ミスター・リーの やく", "ビリモが リーさんの やく", "objective (JA)", rLee);
both(1016, 10, "Final plus ize.", "Final plus i, z, e.", "B+C", "TTS misreads the bare letter group 'ize'; spell it like 'add i, z, e' in the other reviews");

// ---------- L1017 ----------
P(1017, "teacherScript", "All tours start at one o'clock in front of the Old Theatre. Children must join with an adult.", "All tours start at one o'clock in front of the Old Theater. Children must come with an adult.", US, "Brightwater brochure uses US spelling (theatre stays in the phonics part); 'join with an adult' is not natural English");
P(1017, "teacherScript", "Where do all the tours start? In front of the Old Theatre.", "Where do all the tours start? In front of the Old Theater.", US, "same place name, US spelling");
P(1017, "teacherScript", "The Old Theatre was modernized last year,", "The Old Theater was modernized last year,", US, "same place name, US spelling (brief example)");
P(1017, "teacher.segments[0].subtitleJa", "ミスター・リーが", "リーさんが", "objective (JA)", rLee);
both(1017, 10, "Modern plus ize.", "Modern plus i, z, e.", "B+C", "TTS misreads the bare letter group 'ize'");
both(1017, 19, "Wear good shoes! Excellent!", "Wear good shoes! You got it!", "A+C", "'Excellent!' then 'Excellent choosing!' back to back in seg20; rotate praise");
P(1017, "teacher.segments[19].subtitleJa", "エクセレント！", "せいかい！", "A+C", "JA follows the new praise");

// ---------- L1018 ----------
P(1018, "teacherScript", "and then write your favourite part.", "and then write your favorite part.", US, "US policy: Ms. Emma's own words use the US spelling (favourite stays in the phonics part)");
const r1018s = "comma between syllables makes TTS stop inside the word and the capital chunk may be spelled out; use the hyphen beat form";
both(1018, 9, "Fif, TEEN! Fifty is strong at the front. FIF, ty.", "Fif-TEEN! Fifty is strong at the front. FIF-ty.", "B+C", r1018s);
both(1018, 19, "It's B, the end! Fif, TEEN. Wonderful ears!", "It's B, the end! Fif-TEEN. Great listening!", "A+B+C", `${r1018s}; 'Wonderful ears!' then 'Wonderful journals!' back to back in seg20`);
P(1018, "teacher.segments[19].subtitleJa", "すばらしい みみだね！", "よく きけたね！", "A+C", "JA follows the new praise");
both(1018, 10, "Real plus ize.", "Real plus i, z, e.", "B+C", "TTS misreads the bare letter group 'ize'");

// ---------- L1019 ----------
P(1019, "teacher.segments[0].subtitleJa", "ミスター・リーに", "リーさんに", "objective (JA)", rLee);
both(1019, 5, "Keychain. A little toy that holds your keys.", "Keychain. A little ring that holds your keys.", "A+B", "a keychain is not a toy; 'toy' gives the wrong meaning");
P(1019, "teacher.segments[5].subtitleJa", "かぎを つける ちいさな おもちゃ。", "かぎを つける ちいさな わっか。", "A+B", "JA follows the EN");
both(1019, 8, "Would you mind means, is it OK for you?", "Would you mind means, is it OK with you?", "A+B", "'OK with you' is the natural English for asking permission/consent");
both(1019, 9, "Eigh, TEEN! Strong at the end.", "Eigh-TEEN! Strong at the end.", "B+C", r1018s);

// ---------- L1020 ----------
both(1020, 10, "Vacation. Va, CA, tion.", "Vacation. Va-CA-tion.", "B+C", r1018s);

const dest = path.join(REPO, ".run9-w3334/patches/15-L1011-1020.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
