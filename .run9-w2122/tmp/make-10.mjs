// Build .run9-w2122/patches/10-L601-610.json from substring specs against the CURRENT world-21 file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const w = JSON.parse(fs.readFileSync(path.join(ROOT, "content/curriculum/worlds/world-21.json"), "utf8"));
const tok = (p) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o, p) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);
const out = [];
let bad = 0;
// spec: [lesson, path, find, replace, reviewers, reason]
const S = (lesson, p, find, replace, reviewers, reason) => {
  const l = w.lessons.find((x) => x.lessonNo === lesson);
  const cur = get(l, p);
  if (typeof cur !== "string" || !cur.includes(find)) { console.log("NOTFOUND", lesson, p, find); bad++; return; }
  const ex = out.find((x) => x.lesson === lesson && x.path === p);
  if (ex) { ex.after = ex.after.replace(find, replace); ex.reason += "; " + reason; return; }
  out.push({ lesson, path: p, before: cur, after: cur.replace(find, replace), reviewers, reason });
};
const seg = (n) => `teacher.segments[${n}]`;
const both = (lesson, n, find, replace, rv, reason) => { S(lesson, `${seg(n)}.say`, find, replace, rv, reason); S(lesson, `${seg(n)}.subtitleEn`, find, replace, rv, reason); };

// L601
S(601, "teacherScript", "Like, dislike. Agree, disagree. Appear, disappear.", "Agree, disagree. Appear, disappear. Like, dislike.", "A+C", "\"Like, dislike\" as the first pair reads as the filler \"like\" (for example); put it after the pattern is set");
both(601, 10, "it means the opposite. Like, dislike. Agree, disagree. Appear, disappear.", "it means the opposite. Agree, disagree. Appear, disappear. Like, dislike.", "A+C", "\"...the opposite. Like, dislike.\" reads as filler \"like\"; reorder so like/dislike comes after the pattern");
S(601, `${seg(10)}.subtitleJa`, "like → dislike。agree → disagree。appear → disappear。", "agree → disagree。appear → disappear。like → dislike。", "A+C", "Follow the new order of the English");
both(601, 18, "call? Draw a card?", "call? Write a letter?", "A+B", "\"Draw a card\" means picking a card; the world is about letters");
S(601, `${seg(18)}.subtitleJa`, "でんわ？ カードを かく？", "でんわ？ てがみを かく？", "A+B", "Follow the English (write a letter)");
S(601, "conversation.aiTask.goalJa", "エマ先生にも しつもんしよう", "あいてにも しつもんしよう", "objective (JA)", "The AI partner is Haru (wrap-up: talk with Haru), not Ms. Emma");

// L604
S(604, "conversation.lines[6].en", "never tell your address to a stranger", "never give your address to a stranger", "A+B", "\"tell your address\" is a calque of 住所を言う; US: give (out) your address");

// L605
both(605, 0, "The weekend is coming. Let's call a friend and make a plan!", "Let's call a friend and make a plan for the weekend!", "A+B", "Teacher narration should not assume the lesson day is near a weekend");
S(605, `${seg(0)}.subtitleJa`, "もうすぐ しゅうまつ。ともだちに でんわして、よていを たてよう！", "ともだちに でんわして、しゅうまつの よていを たてよう！", "A+B", "Follow the English");
both(605, 19, "Hi, it's Kiko, is friendly. This is, is polite.", "Hi, it's Kiko sounds friendly. This is Kiko sounds polite.", "A+C", "\"This is, is polite\" stumbles when read aloud; use \"sounds\" and the full phrase");
S(605, `${seg(19)}.subtitleJa`, "This is は ていねい。", "This is Kiko は ていねい。", "A+C", "Follow the English");
both(605, 20, "You can call a friend, ask, Are you free on Saturday?, and make a plan.", "You can call a friend and ask, Are you free on Saturday? Then you can make a plan.", "B+C", "\"?,\" mid-sentence is hard to read and to say; split into two sentences");
both(605, 20, "See you on the weekend!", "See you next time!", "A+B", "Pacing: the next lesson is not on the weekend");
S(605, `${seg(20)}.subtitleJa`, "しゅうまつに またね！", "またね！", "A+B", "Follow the English (See you next time)");
S(605, "conversation.aiTask.starterEn", "Hello? Oh, hi! It's me, Riko. What's up?", "Hello, this is Kiko. Oh, hi! What's up?", "objective", "The AI partner is Kiko (wrap-up: talk with Kiko), but the starter said Riko");

// L606
S(606, "conversation.aiTask.starterEn", "Hello! This is Ms. Emma on Festival Island. Can you hear me?", "Hi! It's Riko. I'm calling from the tower. Can you hear me?", "objective", "The AI partner is Riko (wrap-up: talk with Riko), but the starter introduced Ms. Emma");

// L607
S(607, "conversation.lines[5].en", "We can only see your ears!", "We can't see your face!", "A+B", "If we can see his ears, the camera is already on; with the camera off you see no face (matches L606 black screen)");
S(607, "conversation.lines[5].ja", "みみしか みえないよ！", "かおが みえないよ！", "A+B", "Follow the English");
both(607, 7, "We can only see your ears!", "We can't see your face!", "A+B", "Follow conversation.lines[5]");
S(607, `${seg(7)}.subtitleJa`, "みみしか みえないよ！", "かおが みえないよ！", "A+B", "Follow the English");
S(607, `${seg(7)}.slide.items[2]`, "We can only see your ears!", "We can't see your face!", "A+B", "Follow conversation.lines[5]");
both(607, 18, "but you only see ears.", "but the screen is black.", "A+B", "Seeing ears means the camera is on, so \"turn on your camera\" was not the logical answer");
S(607, `${seg(18)}.subtitleJa`, "みみしか みえない。", "がめんが まっくろ。", "A+B", "Follow the English");
both(607, 19, "Now we see a face, not just ears!", "Now we can see your face!", "A+B", "Follow the new quiz situation");
S(607, `${seg(19)}.subtitleJa`, "これで みみだけじゃ なくて かおが みえる！", "これで かおが みえる！", "A+B", "Follow the English");

// L608
S(608, "teacherScript", "the internet in the tower is slow because of the strong wind", "the internet on the island is slow because of the strong wind", "A+B", "Ms. Emma is on the windy island (seg0, scene); the tower is not where the wind is");
S(608, `${seg(8)}.subtitleJa`, "freeze の かこの かたち", "freeze の すぎた かたち", "objective (JA)", "House term for the past form is すぎた かたち");
both(608, 10, "Before big school,", "Before elementary school,", "A+B", "\"big school\" is vague (UK: secondary school); the JA already says しょうがっこう");

// L609
S(609, "teacherScript", "On the left, there's a bed. Next to the bed,", "On the left, there's a big bookshelf. On the right, there's my bed. Next to the bed,", "A+B", "The reading put Haru's bed on the left, but the conversation and the quiz put it on the right");

// L610
S(610, "teacherScript", "Great job this week!", "Great job today!", "A+B", "Pacing: lessons do not follow a weekly schedule");

fs.mkdirSync(path.join(ROOT, ".run9-w2122/patches"), { recursive: true });
fs.writeFileSync(path.join(ROOT, ".run9-w2122/patches/10-L601-610.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`${out.length} patches${bad ? `, ${bad} NOTFOUND` : ""}`);
