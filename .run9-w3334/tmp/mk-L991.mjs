// Build patches for L991-1000 (run9 W33-34 group 13).
import fs from "node:fs";
import path from "node:path";
import { loadWorlds, lessonOf, getAt, REPO } from "../lib.mjs";

const W = loadWorlds();
const out = [];
// pairs: [[from, to], ...] applied in order to the same field (one patch per field)
function P(lesson, p, pairs, reviewers, reason) {
  const before = getAt(lessonOf(W, lesson), p);
  if (typeof before !== "string") throw new Error(`no path L${lesson} ${p}`);
  let after = before;
  for (const [from, to] of pairs) {
    if (!after.includes(from)) throw new Error(`not found L${lesson} ${p}: ${from}`);
    after = after.split(from).join(to);
  }
  if (after === before) throw new Error(`noop L${lesson} ${p}`);
  out.push({ lesson, path: p, before, after, reviewers, reason });
}
const both = (lesson, seg, pairs, reviewers, reason) => {
  P(lesson, `teacher.segments[${seg}].say`, pairs, reviewers, reason);
  P(lesson, `teacher.segments[${seg}].subtitleEn`, pairs, reviewers, reason);
};
const rFirst = "Ms. Emma narrates the teacherScript herself ('we', 'us'); third-person 'Ms. Emma ...' -> I / my (block rule, as in the say lines)";

// L991
P(991, "teacherScript", [["Ms. Emma smiles and holds up her travel pouch. Your passports are safe in here, she says.", "I smile and hold up my travel pouch. Your passports are safe in here, I say."]], "A+C", rFirst);
both(991, 9, [["We read flight numbers two numbers at a time.", "We read flight numbers in two parts."]], "A+B", "'two numbers at a time' is unclear (they are digits; 205 is two / oh five); the teacherScript says 'in small parts' (same fix as L906)");
both(991, 12, [["Now open your Wing Stamp Book, with two hands.", "Now open your Wing Stamp Book with both hands."]], "A+C", "'with both hands' is the natural phrase (L992 says 'Both hands'); the comma breaks the command");

// L992
P(992, "teacherScript", [
  ["Ms. Emma steps up to the counter with all of us and says, Good morning.", "I step up to the counter with all of you and say, Good morning."],
  ["Ms. Emma takes our passports out of her travel pouch.", "I take our passports out of my travel pouch."],
], "A+C", rFirst);
both(992, 9, [["Time time!", "Clock time!"]], "A+C", "'Time time!' sounds like a stutter when read aloud; JA is じこくの じかん");

// L993
P(993, "teacherScript", [
  ["Ms. Emma asks, Can we sit together?", "I ask, Can we sit together?"],
  ["Ms. Emma will sit right behind the children, in 15B.", "I'll sit right behind Haru, Riko, and Kiko, in 15B."],
], "A+C", rFirst);
both(993, 1, [["Pick one and say, please.", "Pick one and add please."]], "A+B", "'say, please' reads as Ms. Emma saying please; the point is to add please (JA please を つけてね)");
both(993, 8, [["Your voice goes up on A, and down on B.", "Your voice goes up on the first choice and down on the last one."]], "B+C", "TTS reads 'up on A' as the article a (like L902 'Make A strong'); naming the choices is clearer for a child");
P(993, "teacher.segments[8].subtitleJa", [["A で こえを 上げて、B で 下げるよ。", "はじめの ほうで こえを 上げて、さいごの ほうで 下げるよ。"]], "B+C", "JA follows the new EN");

// L994
P(994, "teacherScript", [
  ["Then we walk through a gate, one by one, while Ms. Emma watches us.", "Then we walk through a gate, one by one, and I watch everyone go through."],
  ["Oh, it's just Birimo's metal water bottle.", "Oh, it's just Birimo's empty metal water bottle."],
  ["Ding, dong!", "Ding-dong!"],
  ["Ms. Emma says, Let's get our things.", "I say, Let's get our things."],
], "objective", rFirst + "; the bottle must be empty (liquids are not allowed through security); 'Ding-dong' is the standard spelling (block keeper)");
both(994, 3, [["Ding, dong!", "Ding-dong!"]], "A+C", "standard spelling 'Ding-dong'; the comma makes TTS read two separate words with a pause (block keeper prefers the hyphen)");
both(994, 7, [["Then, ding, dong!", "Then, ding-dong!"]], "A+C", "same Ding-dong spelling");
both(994, 11, [["Ding, dong!", "Ding-dong!"]], "A+C", "same Ding-dong spelling");
both(994, 8, [["Three numbers? Split them.", "Three digits? Split them."]], "A+B", "102 is one number with three digits; 'Three numbers?' is the same unclear wording fixed in L906 (JA 3けた already says digits)");

// L995
P(995, "teacherScript", [["Ms. Emma sees an airport staff member in a yellow vest.", "I see an airport staff member in a yellow vest."]], "A+C", rFirst);

// L996
P(996, "teacherScript", [
  ["Birimo and Ms. Emma are right behind them.", "Birimo and I are right behind them."],
  ["Ms. Emma says, Try yawning or chewing.", "I say, Try yawning or chewing."],
  ["Good afternoon, everyone.", "Hello, everyone."],
  ["please look out of your window", "please look out your window"],
  ["our flight attendants will serve drinks and a light lunch.", "our flight attendants will serve a light lunch."],
  ["What can we see out of the window?", "What can we see out the window?"],
  ["What will the flight attendants serve? Drinks and a light lunch.", "What will the flight attendants serve? A light lunch."],
], "objective", rFirst + "; the plane left at 10:45, so 'Good afternoon' right after takeoff is wrong; Kiko already got her water before the captain says drinks will come 'in a few minutes'; US 'look out the window' (block policy)");

// L997
P(997, "teacherScript", [
  ["Ms. Emma says, Stay together, everyone.", "I say, Stay together, everyone."],
  ["Ms. Emma answers, Sightseeing.", "I answer, Sightseeing."],
  ["Ms. Emma checked everything before our trip.", "I checked everything before our trip."],
], "A+C", rFirst);
both(997, 8, [["Or means a person.", "The ending o, r means a person."]], "B+C", "'Or means a person' sounds like the word or; TTS and children hear the conjunction. Name it as an ending, spelled out");
P(997, "teacher.segments[8].subtitleJa", [["or は「人」。", "おわりの or は「人」。"]], "B+C", "JA follows the new EN");
both(997, 9, [["Visa. A paper that says, Yes, we saw you. You may come in.", "Visa. A paper or stamp that says, We have seen your papers. You may come in."]], "A+B", "'Yes, we saw you' is not what a visa says and is odd English; keep the see-link but make it true (the teacherScript says 'a paper or stamp')");
P(997, "teacher.segments[9].subtitleJa", [["visa は「見て みとめました。入って いいですよ」と いう しるし。", "visa は「しょるいを 見ました。入って いいですよ」と いう かみや スタンプ。"]], "A+B", "JA follows the new EN");

// L998
P(998, "teacherScript", [
  ["Brightwater is a city by the sea, so we need to take one more plane.", "Brightwater is a city by the sea, far from here, so we need to take one more plane."],
  ["Ms. Emma walks to the transfer desk with all of us and asks, How do I transfer to my next flight?", "We all walk to the transfer desk, and I ask, How do I transfer to my next flight?"],
  ["but he stays right next to Ms. Emma.", "but he stays right next to me."],
  ["Ms. Emma supervises us. She watches over us and keeps us safe.", "I supervise you. I watch over you and keep you safe."],
], "A+C", rFirst + "; 'by the sea, so we need one more plane' is not a reason (seg0 says Brightwater is far away)");

// L999
P(999, "teacherScript", [
  ["Ms. Emma says, In this country, people use dollars, not yen.", "I say, In this country, people use dollars, not yen."],
  ["Ms. Emma answers, I'd like to change some yen, please.", "I answer, I'd like to change some yen, please."],
  ["have a lovely stay!", "have a great stay!"],
  ["The clerk gives Ms. Emma some bills. Ms. Emma asks, Could we have some coins, too?", "The clerk gives me some bills. I ask, Could we have some coins, too?"],
  ["Then Ms. Emma says, Let's count it together.", "Then I say, Let's count it together."],
  ["Ms. Emma puts the money in her pouch and zips it up.", "I put the money in my pouch and zip it up."],
], "A+C", rFirst + "; 'have a lovely stay' is British-flavored (block swaps Lovely to American praise) -> 'have a great stay'");

// L1000
P(1000, "teacherScript", [
  ["Haru looks out of the window.", "Haru looks out the window."],
  ["Ms. Emma says, One thousand lessons! I'm so proud of you all.", "I say, One thousand lessons! I'm so proud of you all."],
], "objective (US policy)", rFirst + "; US 'look out the window' (seg6 and tpr[0] already say it)");
both(1000, 8, [["Flight eleven twenty. Two numbers at a time.", "Flight eleven twenty. In two parts."]], "A+B", "same unclear 'two numbers at a time' as L991 seg9; L995 says 'Two parts'");
both(1000, 16, [["What was the best part of the airport?", "What was the best part of the trip?"]], "A+B", "the model answer is the window seat (on the plane), not the airport; 'trip' covers both");
P(1000, "teacher.segments[16].subtitleJa", [["くうこうで いちばん たのしかった ことは？", "たびで いちばん たのしかった ことは？"]], "A+B", "JA follows the new EN");

const dest = path.join(REPO, ".run9-w3334/patches/13-L991-1000.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} patches to ${dest}`);
