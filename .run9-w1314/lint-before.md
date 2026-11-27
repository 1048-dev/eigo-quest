# English lint: L361-420

- 日付: 2026-11-27
- はんい: レッスン 361〜420（`npm run english:lint -- --from 361 --to 420 --out .run9-w1314/lint-before.md --quiet`）
- しらべた 文字列: 8083（60 ユニット）
- 結果: **error 0 / warn 29 / info 19**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 23 | 0 |
| contraction | 0 | 0 | 4 |
| grammar-habit | 0 | 3 | 0 |
| inconsistent-form | 0 | 1 | 0 |
| please-command | 0 | 0 | 2 |
| sentence-length | 0 | 2 | 0 |
| stiff-phrase | 0 | 0 | 2 |
| uk-word | 0 | 0 | 11 |

## ユニットごと

### L0361 — A New Map
- **info** contraction `conversation.lines[3].en` — "are not" → "aren't"?

### L0365 — Hello, Sunrise Harbor!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Land ho! We can see the town! This is Sunrise Harbor. あさひの港町に ついたよ！ The people here are very kind. Let's say hello and introduce our team. …

### L0368 — He Doesn't Like Spiders
- **warn** canonical `teacherScript` — "okay" → OK  
  > Good evening, everyone! We're staying at a small inn in the harbor town tonight. But oh no, what's that on the wall? A spider! Birimo is hi…

### L0370 — My Family Poster
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! It's poster day! We're in the lobby of our inn, and everyone made a family poster. Today you can be a presenter. Today's s…

### L0375 — A Day in My Life Video
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today is video day! We're going to make a video diary called, A Day in My Life. わたしの 1にち、を ビデオで しょうかいするよ。 Today's sentence…

### L0377 — She Works at the Bakery
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Do you remember the baker? She gets up at four. Today we're helping at her bakery! Put on your apron. Today's sentence is:…
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Ketchup? Okay. Here you are!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Kiko smiles. Hello! Can I help you? Birimo says, I'm the customer! Two rolls and some ketchup, please! Kiko blinks. Ketchup? Okay. Here you…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Kiko smiles. Hello! Can I help you? Birimo says, I'm the customer! Two rolls and some ketchup, please! Kiko blinks. Ketchup? Okay. Here you…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Ketchup? Okay. Here you are!
- **info** please-command `conversation.lines[0].en` — "Please put on your aprons." → Can you ~? / Let's ~. / plain imperative  
  > I'm the baker today. Good morning, helpers! Please put on your aprons.

### L0378 — He Fixes Boats
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hi, everyone! Bang, bang, bang! What's that sound? We're at the shipyard. A shipyard is a place for making and fixing boats. Today we meet …

### L0379 — Who Catches the Fish?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Welcome to the fish market! It's noisy and busy. People are carrying boxes of fish and ice. So many jobs! Let's find out w…

### L0384 — Sorry? One More Time, Please.
- **warn** sentence-length `conversation.lines[4].en` — 15 words > 12 (stage 2): "The hedgehog eats porridge from the fridge, and the badger eats fudge on the br…"  
  > The hedgehog eats porridge from the fridge, and the badger eats fudge on the bridge!
- **warn** sentence-length `conversation.aiTask.starterEn` — 14 words > 12 (stage 2): "The wind is so strong today, and I talk super fast when I'm excited!"  
  > Hi! I'm Birimo! The wind is so strong today, and I talk super fast when I'm excited! Can you understand me?

### L0385 — Chat Time at the Harbor
- **warn** canonical `teacherScript` — "okay" → OK  
  > Good evening, everyone! Tomorrow is the harbor festival. Tonight, everyone is hanging up lanterns. It's beautiful! Some local kids are here…

### L0391 — Welcome to the Market!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We left Sunrise Harbor, and now we're in a new town. Listen. Can you hear it? It's so noisy! Welcome to the Bustling Marke…
- **warn** canonical `conversation.lines[4].en` — "Okay" → OK  
  > Okay, everyone. Take a basket and stay together. It's very crowded.

### L0392 — Do You Have Any Peaches?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we're at a fruit shop. Look at all the fruit! Kiko wants peaches. How can she ask? Today's sentence is: Do you have …

### L0393 — Some Bread, Please
- **warn** grammar-habit `teacherScript` — "breads" → uncountable: no -s (teacher script: intentional?)  
  > Good morning, everyone! Mmm, can you smell that? It's the market bakery! Birimo is very hungry and wants some bread. Today's sentence is: C…
- **warn** grammar-habit `teacher.segments[18].say` — "a bread" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Quiz time! Which one is right? A, Can I have a bread? Or B, Can I have some bread? Think!
- **warn** grammar-habit `teacher.segments[18].subtitleEn` — "a bread" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Quiz time! Which one is right? A, Can I have a bread? Or B, Can I have some bread? Think!

### L0399 — Here's Your Change
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today is a special day at the market. It's Market Day! On Market Day, kids take care of the shops. Today, you are the shop…

### L0402 — Cut the Carrots
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we're in a cooking class. Put on your apron and wash your hands. Today we're making vegetable soup. Today's sentence…
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Okay! Scrub, scrub, scrub!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Haru holds the knife with me. Like this? Slowly, slowly. Perfect, Haru! Next, wash the potatoes, Kiko. And Kiko says, Okay! Scrub, scrub, s…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Haru holds the knife with me. Like this? Slowly, slowly. Perfect, Haru! Next, wash the potatoes, Kiko. And Kiko says, Okay! Scrub, scrub, s…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay! Scrub, scrub, scrub!

### L0404 — It Smells Good!
- **info** stiff-phrase `teacher.segments[5].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good to eat! delicious は とても おいしい. Delicious!
- **info** stiff-phrase `teacher.segments[5].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good to eat! Delicious!

### L0406 — Try This!
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0407 — No, Thank You. I'm Full.
- **warn** canonical `teacherScript` — "okay" → OK  
  > Good evening, everyone! The food stalls are open tonight. There are lanterns everywhere. It's beautiful! Ms. Emma is the noodle cook. The n…

### L0410 — Food Stand Talk
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today our team has a food stand. We're cooking fish and rice. The guests are coming! Let's take care of them. Today's sent…

### L0414 — Healthy Lunch Box
- **info** uk-word `school.expressions[2].en` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Don't eat too many sweets.
- **info** uk-word `teacherScript` — "Sweets" → candy (sweets is OK for 'sweet things')  
  > Hello, everyone! Tomorrow there's a lunch box contest at the market. Let's make a healthy lunch box! Healthy food helps your body grow. Tod…
- **info** uk-word `conversation.lines[4].en` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Good ideas. You can have a little cake. Don't eat too many sweets.
- **info** uk-word `teacher.segments[1].say` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Today's goal. Say why food is good for you. Vegetables are good for you. Rice gives you energy. And a kind tip, Don't eat too many sweets.
- **info** uk-word `teacher.segments[1].subtitleEn` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Today's goal. Say why food is good for you. Vegetables are good for you. Rice gives you energy. And a kind tip, Don't eat too many sweets.
- **info** uk-word `teacher.segments[7].say` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Kiko says, Rice gives you energy. And fish makes you strong! I say, You can have a little cake. Don't eat too many sweets. Birimo begs, One…
- **info** uk-word `teacher.segments[7].subtitleEn` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Kiko says, Rice gives you energy. And fish makes you strong! I say, You can have a little cake. Don't eat too many sweets. Birimo begs, One…
- **info** uk-word `teacher.segments[7].slide.items[1]` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Good ideas. You can have a little cake. Don't eat too many sweets.
- **info** uk-word `teacher.segments[16].say` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Don't eat too many sweets.
- **info** uk-word `teacher.segments[16].subtitleEn` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Don't eat too many sweets.
- **info** uk-word `teacher.segments[16].slide.items[0]` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Don't eat too many sweets.

### L0415 — Lunch Box Contest
- **info** please-command `conversation.lines[4].en` — "Please try it!" → Can you ~? / Let's ~. / plain imperative  
  > Mine has one sandwich and fifteen cookies. Please try it!

### L0416 — Market Riddles
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

## 書きかたの ゆれ（はんい ぜんたい）
- "give a thumbs-up" ×1 (L0384) vs "give a thumbs up" ×1 (L0406)
