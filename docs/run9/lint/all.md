# English lint: all

- 日付: 2026-11-27
- はんい: レッスン 1〜1200 ＋ としょかん ＋ 力だめし（`npm run english:lint --`）
- しらべた 文字列: 154506（1344 ユニット）
- 結果: **error 0 / warn 465 / info 275**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| capitalization | 0 | 3 | 0 |
| contraction | 0 | 0 | 85 |
| grammar-habit | 0 | 4 | 0 |
| inconsistent-form | 0 | 18 | 0 |
| lets-overuse | 0 | 0 | 38 |
| near-duplicate | 0 | 0 | 3 |
| please-command | 0 | 0 | 18 |
| punctuation | 0 | 293 | 0 |
| sentence-length | 0 | 35 | 0 |
| stiff-phrase | 0 | 13 | 109 |
| uk-word | 0 | 97 | 22 |
| wasei-eigo | 0 | 2 | 0 |

## ユニットごと

### L0070 — At the Nurse's Office (Review)
- **info** stiff-phrase `teacher.segments[12].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Slow-motion challenge! Lie down. Close your eyes. Sit up slowly. Drink some water. Very, very slowly!
- **info** stiff-phrase `teacher.segments[12].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Slow-motion challenge! Lie down. Close your eyes. Sit up slowly. Drink some water. Very, very slowly!

### L0112 — It's Big! It's Small!
- **info** stiff-phrase `conversation.lines[4].en` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > No! It's small. Very, very small!
- **info** stiff-phrase `teacher.segments[7].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Kiko says, Look at the sloth. It's small. It's slow. なまけものは ちいさくて ゆっくり。せんせいが ねずみは おおきい？ って きくと、ビリモが No! It's small. Very, very small!
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Look at the sloth. It's small. It's slow. / No! It's small. Very, very small!
- **info** stiff-phrase `teacher.segments[7].slide.items[1]` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > No! It's small. Very, very small!

### L0194 — My Favorite Subject
- **info** contraction `conversation.lines[4].en` — "is not" → "isn't"?

### L0217 — I'd Like Spaghetti
- **info** stiff-phrase `teacher.segments[0].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Welcome back to the Road Cafe! Today Kiko is the waiter, and Haru is very, very hungry. Slurp! きょうは ランチと のみものを ちゅうもん するよ。
- **info** stiff-phrase `teacher.segments[0].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Welcome back to the Road Cafe! Today Kiko is the waiter, and Haru is very, very hungry. Slurp!

### L0224 — It's Delicious
- **info** stiff-phrase `teacher.segments[2].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very yummy! Rub your tummy. delicious は おいしい。Delicious!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very yummy! Rub your tummy. Delicious!

### L0232 — We Don't Have a Zoo
- **warn** sentence-length `school.expressions[2].en` — 10 words > 8 (stage 1): "We have a station, but we don't have an airport."  
  > We have a station, but we don't have an airport.
- **warn** sentence-length `conversation.lines[2].en` — 10 words > 8 (stage 1): "We have a station, but we don't have an airport."  
  > We have a station, but we don't have an airport.
- **warn** sentence-length `conversation.aiTask.starterEn` — 10 words > 8 (stage 1): "We have a station, but we don't have an airport."  
  > We have a station, but we don't have an airport. Do you have an aquarium in your town?

### L0235 — Town Guidebook
- **warn** sentence-length `school.expressions[1].en` — 10 words > 8 (stage 1): "We don't have a zoo, but we have a farm."  
  > We don't have a zoo, but we have a farm.
- **warn** sentence-length `conversation.lines[1].en` — 10 words > 8 (stage 1): "We don't have a zoo, but we have a farm."  
  > We don't have a zoo, but we have a farm.

### L0239 — Hero Speech Rehearsal
- **info** please-command `conversation.lines[1].en` — "Please listen to my speech." → Can you ~? / Let's ~. / plain imperative  
  > Please listen to my speech. My hero is my coach. He is strong and kind. Thank you for listening.

### L0248 — A Day at Sky School
- **warn** sentence-length `conversation.lines[2].en` — 9 words > 8 (stage 1): "I sometimes read books in the library after lunch."  
  > I sometimes read books in the library after lunch.

### L0252 — I Want to See the Pyramids
- **warn** sentence-length `conversation.lines[0].en` — 9 words > 8 (stage 1): "Why do you want to go to Egypt, Haru?"  
  > Why do you want to go to Egypt, Haru?

### L0264 — What Did You Do on Sunday?
- **warn** sentence-length `conversation.aiTask.starterEn` — 10 words > 8 (stage 1): "I played with the cows on the farm on Sunday."  
  > I played with the cows on the farm on Sunday. What did you do on Sunday?

### L0266 — My Memory Speech
- **warn** sentence-length `conversation.lines[0].en` — 9 words > 8 (stage 1): "Start with: Let me tell you about my summer."  
  > Let's make memory speeches. Start with: Let me tell you about my summer.
- **info** stiff-phrase `teacher.segments[3].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Wonderful. Very, very good! Sparkle your fingers. Wonderful!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Wonderful. Very, very good! Sparkle your fingers. Wonderful!

### L0290 — Our Recommendation Book
- **info** please-command `conversation.lines[4].en` — "Please read our book, everyone." → Can you ~? / Let's ~. / plain imperative  
  > What a wonderful book! Please read our book, everyone.

### L0292 — Let's Save Water
- **warn** sentence-length `conversation.lines[1].en` — 11 words > 8 (stage 1): "We can turn off the water when we brush our teeth."  
  > Oops! We can turn off the water when we brush our teeth.

### L0297 — Earth Quiz Show
- **info** contraction `conversation.lines[4].en` — "What is" → "what's"?

### L0314 — When I'm Older
- **warn** sentence-length `school.expressions[1].en` — 9 words > 8 (stage 1): "When I'm older, I want to be a teacher."  
  > When I'm older, I want to be a teacher.
- **warn** sentence-length `conversation.lines[2].en` — 9 words > 8 (stage 1): "When I'm older, I want to be a teacher."  
  > When I'm older, I want to be a teacher.
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "When I'm older, I want to be a teacher."  
  > When I'm older, I want to be a teacher. What do you want to be when you're older?
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "What do you want to be when you're older?"  
  > When I'm older, I want to be a teacher. What do you want to be when you're older?

### L0317 — In Junior High School
- **warn** sentence-length `conversation.lines[0].en` — 10 words > 8 (stage 1): "I want to study English hard in junior high school."  
  > I want to study English hard in junior high school.
- **warn** sentence-length `conversation.aiTask.starterEn` — 10 words > 8 (stage 1): "In junior high school, I want to study English hard."  
  > In junior high school, I want to study English hard. What do you want to do?

### L0318 — The Biggest Club
- **warn** sentence-length `conversation.lines[1].en` — 9 words > 8 (stage 1): "They practice after school, even on the hottest days!"  
  > They practice after school, even on the hottest days!

### L0321 — Thank You for Your Help
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "What do you want to say thank you for?"  
  > Let's say thank you! Thank you for your help. What do you want to say thank you for?

### L0323 — Because You Were Kind
- **warn** sentence-length `conversation.lines[2].en` — 10 words > 8 (stage 1): "Because you were kind to me on my first day."  
  > Because you were kind to me on my first day.

### L0324 — A Message for Our Teacher
- **warn** sentence-length `conversation.lines[2].en` — 11 words > 8 (stage 1): "I would like to see you again in junior high school."  
  > I would like to see you again in junior high school.

### L0329 — City of Dreams Review
- **warn** sentence-length `conversation.lines[3].en` — 11 words > 8 (stage 1): "I want to join the art club in junior high school."  
  > I want to join the art club in junior high school.

### L0331 — I Am a New Student.
- **info** contraction `conversation.lines[1].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[3].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?
- **info** contraction `conversation.aiTask.starterEn` — "I am" → "I'm"?

### L0332 — He Is My Friend.
- **info** contraction `conversation.lines[5].en` — "I am" → "I'm"?

### L0334 — My Friend Poster
- **warn** sentence-length `conversation.lines[1].en` — 9 words > 8 (stage 1): "He can run fast because he practices every day."  
  > Thank you, Riko! This is Haru. He can run fast because he practices every day.

### L0335 — Hello, Junior High!
- **info** contraction `conversation.lines[1].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[2].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[3].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?

### L0343 — My Day at Junior High
- **warn** sentence-length `conversation.lines[4].en` — 10 words > 8 (stage 1): "After school, I want to go to the club room!"  
  > After school, I want to go to the club room!

### L0345 — My Day Speech
- **warn** sentence-length `conversation.lines[4].en` — 10 words > 8 (stage 1): "I eat snacks at noon, at three, and at night!"  
  > I eat snacks at noon, at three, and at night!

### L0347 — I Saw a Big Tree.
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "I saw a big tree on the field trip."  
  > I saw a big tree on the field trip. It was so tall! What did you see this year?

### L0351 — Who and What Questions
- **info** contraction `conversation.lines[3].en` — "What is" → "what's"?

### L0353 — Why Do You Like It?
- **warn** sentence-length `conversation.lines[1].en` — 9 words > 8 (stage 1): "Because I can ski and play in the snow!"  
  > Because I can ski and play in the snow!

### L0356 — Welcome to the Party!
- **warn** sentence-length `conversation.lines[3].en` — 9 words > 8 (stage 1): "Kiko said, "I want to sing at the party!""  
  > Kiko said, "I want to sing at the party!"
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?

### L0357 — I Can Speak English!
- **warn** sentence-length `conversation.lines[2].en` — 9 words > 8 (stage 1): "I want to talk with friends around the world!"  
  > I can speak English now. I want to talk with friends around the world!

### L0358 — Memories of the Year
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0360 — World 12 Grand Finale
- **info** contraction `conversation.lines[1].en` — "I am" → "I'm"?

### L0361 — A New Map
- **info** contraction `conversation.lines[3].en` — "are not" → "aren't"?

### L0377 — She Works at the Bakery
- **info** please-command `conversation.lines[0].en` — "Please put on your aprons." → Can you ~? / Let's ~. / plain imperative  
  > I'm the baker today. Good morning, helpers! Please put on your aprons.

### L0384 — Sorry? One More Time, Please.
- **warn** sentence-length `conversation.lines[4].en` — 15 words > 12 (stage 2): "The hedgehog eats porridge from the fridge, and the badger eats fudge on the br…"  
  > The hedgehog eats porridge from the fridge, and the badger eats fudge on the bridge!

### L0393 — Some Bread, Please
- **warn** grammar-habit `teacherScript` — "breads" → uncountable: no -s (teacher script: intentional?)  
  > Good morning, everyone! Mmm, can you smell that? It's the market bakery! Birimo is very hungry and wants some bread. Today's sentence is: C…
- **warn** grammar-habit `teacher.segments[18].say` — "a bread" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Quiz time! Which one is right? A, Can I have a bread? Or B, Can I have some bread? Think!
- **warn** grammar-habit `teacher.segments[18].subtitleEn` — "a bread" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Quiz time! Which one is right? A, Can I have a bread? Or B, Can I have some bread? Think!

### L0406 — Try This!
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

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

### L0423 — Look! She's Running!
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0429 — What Is the Dog Doing?
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0439 — Spot the Difference
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0466 — Once Upon a Time
- **warn** sentence-length `conversation.lines[3].en` — 13 words > 12 (stage 2): "He had a big castle and lots of gold, but he was lonely."  
  > He had a big castle and lots of gold, but he was lonely.

### L0467 — First, Then, After That
- **info** please-command `conversation.lines[0].en` — "Please read more!" → Can you ~? / Let's ~. / plain imperative  
  > What happened next? Please read more!

### L0485 — Our Plan for Tonight
- **warn** sentence-length `conversation.lines[2].en` — 13 words > 12 (stage 2): "Then, we're going to put on our jackets and go to the roof."  
  > Then, we're going to put on our jackets and go to the roof.

### L0503 — A Message to Space
- **info** please-command `conversation.lines[4].en` — "Please write back to us!" → Can you ~? / Let's ~. / plain imperative  
  > Please write back to us! From the children of Earth.

### L0513 — The Longest River
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Listen. Can you hear the water? We're walking along the river. This river is very, very long. It's the longest river in th…

### L0515 — Valley Record Book
- **info** stiff-phrase `teacher.segments[4].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Giraffe. A very, very long neck. It eats leaves from tall trees. Giraffe!
- **info** stiff-phrase `teacher.segments[4].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Giraffe. A very, very long neck. It eats leaves from tall trees. Giraffe!

### L0516 — More Beautiful
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hi, everyone! Wow, look at this flower field! There are so many flowers. This flower is pretty. And this flower is very, very pretty. This …
- **info** stiff-phrase `teacher.segments[3].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Beautiful. Very, very pretty. Wow, so beautiful! beautiful は うつくしい. Beautiful!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Beautiful. Very, very pretty. Wow, so beautiful! Beautiful!

### L0517 — The Most Popular Animal
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0522 — Not as Fast as a Horse
- **info** contraction `conversation.lines[4].en` — "is not" → "isn't"?

### L0535 — Echo Valley Quiz Show
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?
- **info** contraction `conversation.lines[2].en` — "What is" → "what's"?
- **info** contraction `conversation.lines[4].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0537 — Thank You, Echo
- **info** stiff-phrase `teacher.segments[12].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Whisper thank you. Very, very softly. Now, wave goodbye. Big waves!
- **info** stiff-phrase `teacher.segments[12].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Whisper thank you. Very, very softly. Now, wave goodbye. Big waves!

### L0539 — Echo Valley Review
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0541 — Tick, Tock, Click!
- **info** please-command `conversation.lines[5].en` — "Please use my tools and make something wonderful." → Can you ~? / Let's ~. / plain imperative  
  > Here's a note. "Welcome to my workshop! Please use my tools and make something wonderful. — The Inventor"

### L0545 — Tool Quiz
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0552 — You Must Not Touch It
- **info** stiff-phrase `teacher.segments[2].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hot. Very, very warm. Don't touch! hot は あつい. Hot!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hot. Very, very warm. Don't touch! Hot!

### L0577 — Color Festival
- **info** uk-word `teacherScript` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Hello, everyone! The island has a small festival museum. Let's learn about festivals around the world. Look at this picture. It's a color f…

### L0581 — Welcome to My House
- **info** please-command `conversation.lines[2].en` — "Please take off your shoes here." → Can you ~? / Let's ~. / plain imperative  
  > My aunt says, make yourself at home. Please take off your shoes here.

### L0582 — Would You Like Some Tea?
- **info** please-command `conversation.aiTask.starterEn` — "Please sit down." → Can you ~? / Let's ~. / plain imperative  
  > Hi! I'm Riko. Welcome! Please sit down. Would you like some tea? I also have cookies and fruit.
- **info** stiff-phrase `teacher.segments[4].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good to eat. Yum! Delicious.
- **info** stiff-phrase `teacher.segments[4].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good to eat. Yum! Delicious.

### L0583 — Thank You for Having Me
- **info** stiff-phrase `teacher.segments[3].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Great. Very, very good! Thumbs up! Great.
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Great. Very, very good! Thumbs up! Great.

### L0600 — World 20 Grand Festival
- **info** please-command `conversation.lines[2].en` — "Please clap with us!" → Can you ~? / Let's ~. / plain imperative  
  > Next, we're going to sing a song. Please clap with us!

### L0601 — The Tower of Messages
- **info** stiff-phrase `teacher.segments[6].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Far away. Not near. Over the sea. Very, very far. Far away!
- **info** stiff-phrase `teacher.segments[6].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Far away. Not near. Over the sea. Very, very far. Far away!

### L0623 — Best Wishes
- **warn** punctuation `school.expressions[0].en` — missing end mark (. ! ?)  
  > See you soon. Best wishes, Riko
- **warn** punctuation `school.expressions[2].en` — missing end mark (. ! ?)  
  > Love, Kiko

### L0636 — The Main Character
- **info** stiff-phrase `teacher.segments[5].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Mountain. Very, very high land. Up, up, to the top! Mountain!
- **info** stiff-phrase `teacher.segments[5].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Mountain. Very, very high land. Up, up, to the top! Mountain!

### L0644 — What Happened Next?
- **warn** stiff-phrase `conversation.lines[6].en` — "that's all for today" → That's it for today! / Great job today!  
  > He opened it very slowly. But that's all for today!
- **warn** stiff-phrase `teacher.segments[7].say` — "that's all for today" → That's it for today! / Great job today!  
  > Riko leans in. Can you tell me more? Professor Quill says, The door was very small, and the cat was waiting there. Haru asks, And then? He …
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — "that's all for today" → That's it for today! / Great job today!  
  > Riko leans in. Can you tell me more? Professor Quill says, The door was very small, and the cat was waiting there. Haru asks, And then? He …
- **warn** stiff-phrase `teacher.segments[7].slide.items[3]` — "that's all for today" → That's it for today! / Great job today!  
  > He opened it very slowly. But that's all for today!
- **warn** stiff-phrase `teacher.segments[18].say` — "That's all for today" → That's it for today! / Great job today!  
  > Quiz time! Your friend tells a story. You want more details. What do you say? A, Can you tell me more? B, That's all for today. Think!
- **warn** stiff-phrase `teacher.segments[18].subtitleEn` — "That's all for today" → That's it for today! / Great job today!  
  > Quiz time! Your friend tells a story. You want more details. What do you say? A, Can you tell me more? B, That's all for today. Think!

### L0651 — "Help!" Shouted the Boy
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Shout. Say it very, very loud. Hands around your mouth. Hey! Shout!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Shout. Say it very, very loud. Hands around your mouth. Hey! Shout!

### L0656 — The Book That Won't Open
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0661 — The Green Laboratory
- **info** contraction `conversation.lines[4].en` — "do not" → "don't"?

### L0663 — Look Through the Microscope
- **info** stiff-phrase `teacher.segments[2].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Tiny. Very, very small. Smaller than an ant! Tiny!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Tiny. Very, very small. Smaller than an ant! Tiny!

### L0665 — My Lab Notebook
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Observe. Look very, very carefully. Hmm! Observe!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Observe. Look very, very carefully. Hmm! Observe!

### L0669 — Why Did It Happen?
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, the egg floated in salt water. But why did it happen? Scientists always ask why. Dr. Moss has two cups of water…
- **info** stiff-phrase `teacher.segments[5].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > The Dead Sea. A real lake with very, very salty water. People float there easily! The Dead Sea!
- **info** stiff-phrase `teacher.segments[5].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > The Dead Sea. A real lake with very, very salty water. People float there easily! The Dead Sea!

### L0677 — Paper Is Made from Trees
- **info** contraction `conversation.lines[3].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0680 — What Is It Made Of?
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0706 — What a View!
- **info** stiff-phrase `teacher.segments[3].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Mountain. Very, very tall land. Up, up, up to the top! Mountain!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Mountain. Very, very tall land. Up, up, up to the top! Mountain!

### L0708 — Is This Seat Taken?
- **info** please-command `conversation.lines[2].en` — "Please sit down." → Can you ~? / Let's ~. / plain imperative  
  > No, it isn't! Sorry, that's my bag. Please sit down.

### L0714 — It's Impossible!
- **warn** sentence-length `conversation.lines[0].en` — 16 words > 15 (stage 3): "I want to go to the museum, the tower, the garden, the palace and the market!"  
  > I want to go to the museum, the tower, the garden, the palace and the market!

### L0717 — Souvenir Shopping
- **info** uk-word `teacherScript` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Hello, everyone! Before we leave Star Station, let's buy souvenirs. A souvenir is something you buy on a trip to remember it. Many people b…
- **info** uk-word `conversation.lines[3].en` — "sweets" → candy (sweets is OK for 'sweet things')  
  > I'll buy cloud cookies for my grandparents. They love sweets.
- **info** uk-word `teacher.segments[7].slide.items[0]` — "sweets" → candy (sweets is OK for 'sweet things')  
  > I'll buy cloud cookies for my grandparents. They love sweets.

### L0727 — It Must Be a Key
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0728 — It Can't Be a Ghost
- **info** stiff-phrase `teacher.segments[9].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! More I, V, E words. Protect, protective. Mass, massive. Just add I, V, E. Massive means very, very big!
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! More I, V, E words. Protect, protective. Mass, massive. Just add I, V, E. Massive means very, very big!

### L0736 — It Has Four Legs
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0738 — Huge, Tiny, Giant
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, The more you take, the more you leave behind. Footsteps! The Riddle Door opened, and now we're in a ne…
- **info** stiff-phrase `teacher.segments[18].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! An ant is very, very small. An ant is A, huge. Or B, tiny. Think!
- **info** stiff-phrase `teacher.segments[18].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! An ant is very, very small. An ant is A, huge. Or B, tiny. Think!

### L0740 — Riddle Contest
- **info** please-command `conversation.aiTask.starterEn` — "Please read your riddle first." → Can you ~? / Let's ~. / plain imperative  
  > Welcome to the riddle contest! Please read your riddle first. I'll try to guess!

### L0744 — The Answer Is…
- **warn** punctuation `title` — "…" → "..."  
  > The Answer Is…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > The Answer Is…

### L0751 — The Theater of Echoes
- **warn** punctuation `phonics.words[0]` — use one ! or ?  
  > Really?!
- **warn** punctuation `phonics.words[1]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > Well, OK…
- **warn** punctuation `conversation.lines[1].en` — "…" → "..."  
  > It's a theater! Hello! … Did you hear that? The echo said hello, too.
- **warn** punctuation `conversation.lines[3].en` — use one ! or ?  
  > Really?! A show? Where do we sit?
- **warn** punctuation `teacher.segments[6].slide.items[0]` — "…" → "..."  
  > It's a theater! Hello! … Did you hear that? The echo said hello, too.
- **warn** punctuation `teacher.segments[7].subtitleEn` — use one ! or ?  
  > Riko jumps. Really?! Where do we sit? Mr. Hoot says, Sit in the front row. That's the first line of seats!
- **warn** punctuation `teacher.segments[7].slide.items[0]` — use one ! or ?  
  > Really?! A show? Where do we sit?
- **warn** punctuation `teacher.segments[9].subtitleEn` — use one ! or ?  
  > Sound time! Today, it's your voice! Really?! Up, up, up. I'm surprised! Oh, really... Down, down. I'm a little sad.
- **warn** punctuation `teacher.segments[9].slide.items[2]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[9].slide.items[3]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `teacher.segments[10].subtitleEn` — use one ! or ?  
  > OK! Up and happy. Well, OK... Down and slow. Draw the arrow with your hand. Your turn! Really?! Oh, really... OK! Well, OK...
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > Well, OK…
- **warn** punctuation `teacher.segments[10].slide.items[3]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[10].slide.items[4]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `teacher.segments[18].subtitleEn` — use one ! or ?  
  > Quiz time! A friend says, We can watch a show! You're so happy. Which voice? A, Really?! going up. B, Oh, really... going down. Think!
- **warn** punctuation `teacher.segments[18].slide.items[0]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[18].slide.items[1]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `teacher.segments[19].subtitleEn` — use one ! or ?  
  > It's A! Really?! Up, up, up! You sound so happy. Great listening!
- **warn** punctuation `teacher.segments[19].slide.items[0]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[20].slide.items[2]` — use one ! or ?  
  > Really?!

### L0752 — I Enjoy Acting
- **warn** punctuation `phonics.words[1]` — "…" → "..."  
  > Yes… I think so.
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > Thank you… goodbye.
- **warn** punctuation `teacher.segments[9].slide.items[3]` — "…" → "..."  
  > Yes… I think so.
- **warn** punctuation `teacher.segments[10].slide.items[3]` — "…" → "..."  
  > Thank you… goodbye.

### L0753 — I Want to Be the Dragon
- **warn** punctuation `phonics.words[1]` — "…" → "..."  
  > Oh no… I forgot my lines.
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > I'm so sleepy…
- **warn** punctuation `teacher.segments[9].slide.items[3]` — "…" → "..."  
  > Oh no… I forgot my lines.
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > I'm so sleepy…
- **warn** punctuation `teacher.segments[18].slide.items[1]` — "…" → "..."  
  > Oh no… I forgot my lines.
- **warn** punctuation `teacher.segments[19].slide.items[0]` — "…" → "..."  
  > Oh no… I forgot my lines.

### L0754 — Audition Day
- **warn** punctuation `phonics.words[2]` — "…" → "..."  
  > I can't do it…
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > It's raining again…
- **warn** punctuation `teacher.segments[9].slide.items[5]` — "…" → "..."  
  > I can't do it…
- **warn** punctuation `teacher.segments[9].slide.items[6]` — "…" → "..."  
  > It's raining again…
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > I can't do it…
- **warn** punctuation `teacher.segments[10].slide.items[3]` — "…" → "..."  
  > It's raining again…

### L0755 — Who Plays Which Role?
- **warn** punctuation `phonics.words[0]` — use one ! or ?  
  > Really?!
- **warn** punctuation `phonics.words[1]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > Oh no… I forgot my lines.
- **warn** punctuation `conversation.lines[1].en` — use one ! or ?  
  > Really?! Riko plays the princess. That's me!
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > Oh, really… Who plays the knight? … Oh, I do!
- **warn** punctuation `teacher.segments[6].subtitleEn` — use one ! or ?  
  > Riko reads the list. Really?! Riko plays the princess. That's me! Birimo shouts, And Birimo plays the dragon! I can't wait!
- **warn** punctuation `teacher.segments[6].slide.items[0]` — use one ! or ?  
  > Really?! Riko plays the princess. That's me!
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > Oh, really… Who plays the knight? … Oh, I do!
- **warn** punctuation `teacher.segments[9].subtitleEn` — use one ! or ?  
  > Sound review! Our feeling voices. Really?! Up, surprised. Oh, really... Down, a little sad. I can't wait! Up, so happy!
- **warn** punctuation `teacher.segments[9].slide.items[3]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[9].slide.items[4]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `teacher.segments[10].subtitleEn` — use one ! or ?  
  > And, Oh no... I forgot my lines. Down and soft. Now you be the actor! Really?! Oh, really... I can't wait! Oh no... I forgot my lines.
- **warn** punctuation `teacher.segments[10].slide.items[1]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > Oh, really…
- **warn** punctuation `teacher.segments[10].slide.items[4]` — "…" → "..."  
  > Oh no… I forgot my lines.

### L0756 — I'm Nervous
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > OK. Who is that? Is it the dragon? … I did it!
- **info** stiff-phrase `teacherScript` — "do your best" → You can do it! (Do your best is OK)  
  > Hello, everyone! Last time, we said, Riko plays the princess. Birimo plays the dragon. Today is our first practice. Riko holds the script. …

### L0758 — Bored or Boring?
- **info** stiff-phrase `teacher.segments[18].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz! The king's speech is very, very long. A, The speech is boring. B, The speech is bored. Think!
- **info** stiff-phrase `teacher.segments[18].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz! The king's speech is very, very long. A, The speech is boring. B, The speech is bored. Think!

### L0759 — How Do You Feel Now?
- **warn** punctuation `conversation.lines[5].en` — use one ! or ?  
  > Really?! Maybe the echoes are coming back!

### L0760 — Feelings Charades
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > Now Birimo. Hmm… you look bored.
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > Now Birimo. Hmm… you look bored.

### L0761 — I Decided to Write a Play
- **warn** punctuation `teacher.segments[5].subtitleEn` — "…" → "..."  
  > Narrator. The narrator tells the story. Once upon a time… Narrator!

### L0762 — Suddenly…
- **warn** punctuation `title` — "…" → "..."  
  > Suddenly…
- **warn** punctuation `teacher.segments[0].subtitleEn` — "…" → "..."  
  > Hi, story makers! Last time, we decided to write our own play. Today, our story needs a big surprise. Shh… are you ready?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Suddenly…
- **warn** punctuation `teacher.segments[2].subtitleEn` — "…" → "..."  
  > Suddenly. Very fast, with no warning. I'm walking, walking… boom! Suddenly!

### L0763 — Luckily…
- **warn** punctuation `title` — "…" → "..."  
  > Luckily…
- **warn** punctuation `phonics.words[0]` — "…" → "..."  
  > "I'm… I'm scared," whispered the princess.
- **warn** punctuation `phonics.words[1]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **warn** punctuation `phonics.words[2]` — "…" → "..."  
  > "The door is… locked!" said the bird.
- **warn** punctuation `conversation.lines[0].en` — "…" → "..."  
  > The princess is in the dark. I'm… I'm scared!
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > Wait… what's that sound? Tweet, tweet! It's the bird!
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Luckily…
- **warn** punctuation `teacher.segments[6].subtitleEn` — "…" → "..."  
  > Riko says in a tiny voice, The princess is in the dark. I'm… I'm scared! Kiko says, Luckily, a little bird helped them. That's me!
- **warn** punctuation `teacher.segments[6].slide.items[0]` — "…" → "..."  
  > The princess is in the dark. I'm… I'm scared!
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Haru asks, How did the bird help them? Kiko says, The bird found the key and brought a light. Birimo says, Wait… what's that sound? Tweet, …
- **warn** punctuation `teacher.segments[7].slide.items[2]` — "…" → "..."  
  > Wait… what's that sound? Tweet, tweet! It's the bird!
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! See these three dots? They mean wait. A longer pause. Listen. I'm… I'm scared, whispered the princess. Wait… what's that sound?
- **warn** punctuation `teacher.segments[9].slide.items[4]` — "…" → "..."  
  > "I'm… I'm scared," whispered the princess.
- **warn** punctuation `teacher.segments[9].slide.items[5]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > A comma is a short pause. Three dots are a long pause. Your turn! The door is… locked! said the bird. Luckily, I have a key, said the bird.
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > "The door is… locked!" said the bird.
- **warn** punctuation `teacher.segments[19].subtitleEn` — "…" → "..."  
  > It's B! Three dots. Wait… what's that sound? You've got it!
- **warn** punctuation `teacher.segments[19].slide.items[1]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **warn** punctuation `teacher.segments[20].slide.items[2]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **info** stiff-phrase `teacher.segments[3].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Whisper. Speak very, very quietly. Like this. Hello, friends. Whisper!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Whisper. Speak very, very quietly. Like this. Hello, friends. Whisper!

### L0764 — They Tried to Escape
- **warn** punctuation `phonics.words[2]` — "…" → "..."  
  > "Oh… thank you," said the dragon.
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > Oh… you were lonely? Then come with us!
- **warn** punctuation `conversation.aiTask.starterEn` — "…" → "..."  
  > Roar… I'm the dragon in your play. I'm in my tall tower. Why are you here?
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Kiko says, Click! The gate is open. Then Birimo, the dragon, says softly, Please stay. I took the music box because I was lonely. Riko says…
- **warn** punctuation `teacher.segments[7].slide.items[1]` — "…" → "..."  
  > Oh… you were lonely? Then come with us!
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Three dots, a long pause. Oh… thank you, said the dragon. Said comes first? The comma goes before the quotation marks. The dragon said, Ple…
- **warn** punctuation `teacher.segments[10].slide.items[4]` — "…" → "..."  
  > "Oh… thank you," said the dragon.

### L0765 — Our Story Outline
- **warn** punctuation `phonics.words[2]` — "…" → "..."  
  > "The door is… locked!" said the bird.
- **warn** punctuation `teacher.segments[2].subtitleEn` — "…" → "..."  
  > Beginning. The start. The first part. Once upon a time… Beginning!
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! Let's review our marks. Help! shouted the princess. Strong feeling! Let's write a play, said Riko. Short pause. The door is… lo…
- **warn** punctuation `teacher.segments[9].slide.items[5]` — "…" → "..."  
  > "The door is… locked!" said the bird.

### L0766 — Say It with Feeling
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > Listen! The echo said, Free… free… It's a little louder now!
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Kiko says, She feels really happy. She was in the dark tower for a long time! Riko tries again. I'm free! I'm free! Listen. The echo says, …
- **warn** punctuation `teacher.segments[7].slide.items[2]` — "…" → "..."  
  > Listen! The echo said, Free… free… It's a little louder now!
- **warn** punctuation `teacher.segments[11].subtitleEn` — "…" → "..."  
  > Let's move! Say, I'm free! Jump up high. Now, say it again in a sad voice. I'm free… Oh.
- **warn** punctuation `teacher.segments[12].subtitleEn` — use one ! or ?  
  > Say it in a surprised voice. I'm free?! Now, put your hand on your heart.

### L0767 — Speak Louder, Please
- **warn** punctuation `tpr[3].en` — "…" → "..."  
  > Now say it slowly. Hel… lo…
- **warn** punctuation `conversation.aiTask.starterEn` — "…" → "..."  
  > Let's pretend I'm Lulu the rabbit. I'm on the stage, and you're at the back. Hello… can you hear me?
- **warn** punctuation `teacher.segments[4].subtitleEn` — "…" → "..."  
  > Slowly. Not fast. Like a turtle. Walk… slowly. Slowly!
- **warn** punctuation `teacher.segments[12].subtitleEn` — "…" → "..."  
  > Say hello in a big voice. Hello! Now say it slowly. Hel… lo…
- **warn** punctuation `teacher.segments[12].slide.items[1]` — "…" → "..."  
  > Now say it slowly. Hel… lo…
- **warn** punctuation `teacher.segments[13].slide.items[3]` — "…" → "..."  
  > Now say it slowly. Hel… lo…
- **info** stiff-phrase `teacher.segments[18].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! Your friend talks very, very fast. What do you say? A, Speak louder, please. B, Speak more slowly. Think!
- **info** stiff-phrase `teacher.segments[18].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! Your friend talks very, very fast. What do you say? A, Speak louder, please. B, Speak more slowly. Think!

### L0768 — Which Word Is Important?
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > I ate MY cake! The strawberry one. But… I ate the LAST cookie, too.
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Riko says, Which word is important? YOUR is important. Kiko asks, So whose cake did you eat? Birimo says, I ate MY cake! But… I ate the LAS…
- **warn** punctuation `teacher.segments[7].slide.items[2]` — "…" → "..."  
  > I ate MY cake! The strawberry one. But… I ate the LAST cookie, too.

### L0769 — Stage Directions
- **warn** punctuation `conversation.lines[2].en` — "…" → "..."  
  > OK. I'm walking to the center… and I'm looking up. The dragon must be up there!
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Haru says, OK. I'm walking to the center… and I'm looking up. The dragon must be up there! Birimo says, Haru, you exit to the right. Not th…
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > OK. I'm walking to the center… and I'm looking up. The dragon must be up there!
- **warn** punctuation `teacher.segments[12].subtitleEn` — "…" → "..."  
  > Kneel down slowly. Slowly… Now stand up, and exit to the right.

### L0770 — Scene Practice
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > "Oh… thank you," said the dragon.
- **warn** punctuation `conversation.lines[2].en` — "…" → "..."  
  > Oh… thank you.
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Listen! The echoes said, Friend… friend… They're getting louder!
- **warn** punctuation `teacher.segments[6].subtitleEn` — "…" → "..."  
  > Knock, knock. Birimo, the friendly dragon, says, Someone is knocking. Who's there? Riko says, It's me, your friend! We brought the music bo…
- **warn** punctuation `teacher.segments[6].slide.items[2]` — "…" → "..."  
  > Oh… thank you.
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Now, the marks. Who's there? asked the dragon. The question mark goes inside. Oh… thank you, said the dragon. A long pause. Your turn!
- **warn** punctuation `teacher.segments[10].slide.items[5]` — "…" → "..."  
  > "Oh… thank you," said the dragon.

### L0774 — Showtime!
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > I'm playing the dragon. Oh… please stay. I was so lonely.
- **warn** punctuation `teacher.segments[11].subtitleEn` — "…" → "..."  
  > Roar like a lonely dragon. Roar… so sad. Now bow to the audience. Thank you!

### L0775 — You Were Amazing!
- **warn** punctuation `conversation.lines[3].en` — use one ! or ?  
  > Really?! Thank you so much! I was a little scared.
- **warn** punctuation `teacher.segments[7].subtitleEn` — use one ! or ?  
  > Haru says, Birimo, your roar was so loud! My favorite part was the dark scene. Birimo jumps. Really?! Thank you so much! Tip: say one speci…
- **warn** punctuation `teacher.segments[7].slide.items[1]` — use one ! or ?  
  > Really?! Thank you so much! I was a little scared.
- **info** stiff-phrase `teacher.segments[2].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Amazing. Very, very good! Wow! It surprises you. Amazing!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Amazing. Very, very good! Wow! It surprises you. Amazing!

### L0776 — Review the Play
- **warn** punctuation `phonics.words[0]` — use one ! or ?  
  > Really?!
- **warn** punctuation `teacher.segments[8].subtitleEn` — use one ! or ?  
  > Sound review! Voice up for surprise. Really?! Can you OPEN the door? Make OPEN strong! And R. Riko rolls a round red rug.
- **warn** punctuation `teacher.segments[8].slide.items[1]` — use one ! or ?  
  > Really?!

### L0777 — My Short Script
- **warn** punctuation `teacher.segments[3].subtitleEn` — "…" → "..."  
  > Narrator. The storyteller. Once upon a time… Narrator!
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Let's move! Pick up your pencil. Now write the narrator's line. One day…
- **warn** punctuation `teacher.segments[18].subtitleEn` — "…" → "..."  
  > It's A! The narrator tells the story. Hats can't talk… unless they're magic! Great job!

### L0778 — Story Circle
- **warn** punctuation `school.expressions[1].en` — "…" → "..."  
  > Once… upon… a… time…
- **warn** punctuation `school.expressions[1].en` — missing end mark (. ! ?)  
  > Once… upon… a… time…
- **warn** punctuation `phonics.words[0]` — "…" → "..."  
  > Well, OK…
- **warn** punctuation `phonics.words[2]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **warn** punctuation `conversation.lines[0].en` — "…" → "..."  
  > Let's make a story one word at a time. I'll start. Once…
- **warn** punctuation `conversation.lines[0].en` — missing end mark (. ! ?)  
  > Let's make a story one word at a time. I'll start. Once…
- **warn** punctuation `conversation.lines[1].en` — "…" → "..."  
  > upon…
- **warn** punctuation `conversation.lines[1].en` — missing end mark (. ! ?)  
  > upon…
- **warn** capitalization `conversation.lines[1].en` — sentence starts lowercase  
  > upon…
- **warn** punctuation `conversation.lines[2].en` — "…" → "..."  
  > a…
- **warn** punctuation `conversation.lines[2].en` — missing end mark (. ! ?)  
  > a…
- **warn** capitalization `conversation.lines[2].en` — sentence starts lowercase  
  > a…
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > time… It's your turn, Birimo!
- **warn** capitalization `conversation.lines[3].en` — sentence starts lowercase  
  > time… It's your turn, Birimo!
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > OK. Dragon! A dragon ate a… banana!
- **warn** punctuation `conversation.aiTask.starterEn` — "…" → "..."  
  > Hello! Let's pretend I'm Echo. I love stories. We can make one together, one word at a time. Once…
- **warn** punctuation `conversation.aiTask.starterEn` — missing end mark (. ! ?)  
  > Hello! Let's pretend I'm Echo. I love stories. We can make one together, one word at a time. Once…
- **warn** punctuation `conversation.aiTask.targetExpressions[1]` — "…" → "..."  
  > Once… upon… a… time…
- **warn** punctuation `teacher.segments[6].subtitleEn` — "…" → "..."  
  > I start. Let's make a story one word at a time. Once… Haru says, upon… Riko says, a… Kiko says, time… It's your turn, Birimo!
- **warn** punctuation `teacher.segments[6].slide.items[0]` — "…" → "..."  
  > Let's make a story one word at a time. I'll start. Once…
- **warn** punctuation `teacher.segments[6].slide.items[1]` — "…" → "..."  
  > Once… upon… a… time…
- **warn** punctuation `teacher.segments[6].slide.items[2]` — "…" → "..."  
  > time… It's your turn, Birimo!
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Birimo says, OK. Dragon! A dragon ate a… banana! Haru laughs. That's silly! But it's fun. Let's keep going! Silly ideas are welcome here.
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > OK. Dragon! A dragon ate a… banana!
- **warn** punctuation `teacher.segments[8].subtitleEn` — "…" → "..."  
  > Sound review! Voice down means not so happy. Well, OK… Dots mean a long pause. Wait… what's that sound? asked the knight. Spooky!
- **warn** punctuation `teacher.segments[8].slide.items[1]` — "…" → "..."  
  > Well, OK…
- **warn** punctuation `teacher.segments[8].slide.items[4]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **warn** punctuation `teacher.segments[14].subtitleEn` — "…" → "..."  
  > Once… upon… a… time…
- **warn** punctuation `teacher.segments[14].slide.items[0]` — "…" → "..."  
  > Once… upon… a… time…
- **warn** punctuation `teacher.segments[16].subtitleEn` — "…" → "..."  
  > Your turn! Once upon a time, a dragon ate a… What? Say one silly word!
- **warn** punctuation `teacher.segments[19].slide.items[1]` — "…" → "..."  
  > Once… upon… a… time…
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0779 — Theater of Echoes Review
- **warn** punctuation `teacher.segments[3].subtitleEn` — "…" → "..."  
  > Decide. You think, then you choose. Hmm… this one! Decide!

### L0780 — World 26 Grand Review
- **warn** punctuation `conversation.lines[2].en` — "…" → "..."  
  > Listen! The theater is saying it, too. Play… play… play!
- **warn** punctuation `teacher.segments[4].subtitleEn` — "…" → "..."  
  > Echo. Your voice comes back. Hello… hello… hello! Echo!
- **warn** punctuation `teacher.segments[6].subtitleEn` — "…" → "..."  
  > The curtain closes. Haru steps out. Thank you for watching our play! Riko says, We hope you enjoyed it! Kiko says, Listen! The theater is s…
- **warn** punctuation `teacher.segments[6].slide.items[2]` — "…" → "..."  
  > Listen! The theater is saying it, too. Play… play… play!

### L0783 — My Stomach Hurts
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > Five rice balls and three cakes! And some soup…
- **warn** punctuation `conversation.lines[3].en` — missing end mark (. ! ?)  
  > Five rice balls and three cakes! And some soup…

### L0784 — At the Clinic
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > Ahhh…
- **warn** punctuation `conversation.lines[3].en` — missing end mark (. ! ?)  
  > Ahhh…

### L0792 — Since I Was Five
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > And I've cooked since… since I was hungry! So, forever!
- **warn** punctuation `teacher.segments[7].slide.items[2]` — "…" → "..."  
  > And I've cooked since… since I was hungry! So, forever!

### L0795 — My Long-Time Hobby
- **warn** stiff-phrase `conversation.aiTask.starterEn` — "What's your hobby" → What do you like to do for fun?  
  > Hi! Let's pretend I'm Toto. I've practiced morning exercises for two years. What's your hobby? How long have you practiced?

### L0796 — You Should Drink Water
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Good idea. Water, a hat, some shade… and one cookie!

### L0798 — Why Don't You Take a Break?
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > But I'm not finished yet…
- **warn** punctuation `conversation.lines[3].en` — missing end mark (. ! ?)  
  > But I'm not finished yet…
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > But I'm not finished yet…

### L0802 — Deep Breaths
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > Ahh… I feel calm now. Thank you.
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Me too! But my nose smells cake. Breathe in… cake!
- **warn** punctuation `teacher.segments[7].slide.items[2]` — "…" → "..."  
  > Ahh… I feel calm now. Thank you.

### L0805 — My Calm-Down Plan
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > When I'm hungry, I… eat! Is that a calm-down plan?
- **warn** punctuation `teacher.segments[7].slide.items[1]` — "…" → "..."  
  > When I'm hungry, I… eat! Is that a calm-down plan?

### L0808 — A Letter of Advice
- **warn** punctuation `school.expressions[2].en` — missing end mark (. ! ?)  
  > Your friend, Kiko

### L0816 — It's a Kind of Rice Ball
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Mmm! One more… and one more… and one more!
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0817 — It's Used for Wrapping
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0821 — I Think… Because…
- **warn** punctuation `title` — "…" → "..."  
  > I Think… Because…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Think… Because…

### L0822 — In My Opinion
- **info** stiff-phrase `teacher.segments[5].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very tasty! Mmm, yum! Delicious!
- **info** stiff-phrase `teacher.segments[5].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very tasty! Mmm, yum! Delicious!

### L0824 — Two Reasons
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > OK, I agree! Tomorrow, I'll walk… to the snack shop.
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Birimo asks, Do you have another reason? Riko says, Yes. We can talk with friends on the way. Birimo says, OK, I agree! Tomorrow, I'll walk…
- **warn** punctuation `teacher.segments[7].slide.items[2]` — "…" → "..."  
  > OK, I agree! Tomorrow, I'll walk… to the snack shop.

### L0825 — Opinion Corner
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > My turn! I think snacks are important. First, they're tasty. Second… they're tasty!
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Haru says, That's a good point! Kiko says, Thank you. Then Birimo says, I think snacks are important. First, they're tasty. Second… they're…
- **warn** punctuation `teacher.segments[7].slide.items[1]` — "…" → "..."  
  > My turn! I think snacks are important. First, they're tasty. Second… they're tasty!

### L0827 — A Gift from Japan
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0830 — Stage 3 Review: Explain and Advise
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > OK! I'll practice for ten minutes every day… after snacks.
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0832 — Things I Can Do Now
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > I can tell stories in English. Once upon a time…
- **warn** punctuation `conversation.lines[3].en` — missing end mark (. ! ?)  
  > I can tell stories in English. Once upon a time…

### L0833 — A Speech About Friendship
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > Jambo! Jambo! Wait… does it mean jam?

### L0834 — Rehearsal on the Bridge
- **warn** punctuation `conversation.lines[0].en` — "…" → "..."  
  > Hello, everyone. My speech is about… um… friendship.

### L0836 — Letters Across the Bridge
- **warn** punctuation `school.expressions[2].en` — missing end mark (. ! ?)  
  > Please write back soon. ― Your friend, Haru
- **info** please-command `conversation.lines[3].en` — "Please write back soon." → Can you ~? / Let's ~. / plain imperative  
  > Don't forget the ending. Please write back soon.

### L0842 — I Think So Because…
- **warn** punctuation `title` — "…" → "..."  
  > I Think So Because…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Think So Because…

### L0847 — I See Your Point, But…
- **warn** punctuation `title` — "…" → "..."  
  > I See Your Point, But…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I See Your Point, But…

### L0857 — So You Mean…
- **warn** punctuation `title` — "…" → "..."  
  > So You Mean…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > So You Mean…

### L0859 — Good Question!
- **warn** punctuation `conversation.lines[6].en` — "…" → "..."  
  > Hmm, give me a second… Because the sea is very dark at night!
- **warn** punctuation `teacher.segments[7].slide.items[1]` — "…" → "..."  
  > Hmm, give me a second… Because the sea is very dark at night!
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L0860 — Interview with Follow-Ups
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Anchor waits at the door for me every day. He loves bones… and cake!

### L0868 — My Opinion Paragraph
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > I think we should eat cake every day. First, it's sweet. Second, it's… sweet!
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > I think we should eat cake every day. First, it's sweet. Second, it's… sweet!

### L0874 — The Building Which Makes Energy
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L0891 — In 2050…
- **warn** punctuation `title` — "…" → "..."  
  > In 2050…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > In 2050…

### L0899 — City of Tomorrow Review
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > I'm playing Nova! Beep… I'm not sure. It has a big clock on it.

### L0907 — It Was Invented by…
- **warn** punctuation `title` — "…" → "..."  
  > It Was Invented by…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > It Was Invented by…

### L0908 — It Was Found Under the Sea
- **info** contraction `conversation.lines[0].en` — "it is" → "it's"?

### L0912 — When She Was Ten
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L0922 — I Respect Her Because…
- **warn** punctuation `title` — "…" → "..."  
  > I Respect Her Because…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Respect Her Because…

### L0926 — A Biography to Read
- **info** contraction `conversation.lines[4].en` — "What is" → "what's"?

### L0931 — The Desert of the Sun
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Desert. A very, very dry place. Lots of sun, very little rain. Desert!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Desert. A very, very dry place. Lots of sun, very little rain. Desert!

### L0938 — Cactus Secrets
- **warn** grammar-habit `teacherScript` — "a rain" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Hello, everyone! Last time, we said, Desert foxes have big ears so that they can stay cool. Today, Fen takes us to a cactus garden. Some ca…

### L0943 — Continents and Oceans
- **info** stiff-phrase `teacher.segments[3].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Ocean. A very, very big sea. Deep, blue, and wide. Ocean!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Ocean. A very, very big sea. Deep, blue, and wide. Ocean!

### L0946 — The Graph Shows…
- **warn** punctuation `title` — "…" → "..."  
  > The Graph Shows…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > The Graph Shows…

### L0949 — Half, a Quarter, Thirty Percent
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, There are twice as many camels as horses. Today, Dr. Mira draws a big circle on the whiteboard and cut…

### L0954 — How Much Water Do We Use?
- **info** uk-word `teacherScript` — "toilet" → bathroom / restroom  
  > Hello, everyone! Last time, we said, People planted trees. As a result, the village became green again. Today, we are back at our camp. Dr.…
- **info** uk-word `teacher.segments[5].say` — "toilet" → bathroom / restroom  
  > Flush. Push the button, and the toilet water goes whoosh! Flush!
- **info** uk-word `teacher.segments[5].subtitleEn` — "toilet" → bathroom / restroom  
  > Flush. Push the button, and the toilet water goes whoosh! Flush!

### L0956 — A Desert Story
- **info** contraction `conversation.lines[6].en` — "What is" → "what's"?

### L0962 — Inside the Earth
- **info** contraction `conversation.lines[2].en` — "What is" → "what's"?

### L0963 — When a Volcano Erupts
- **info** contraction `conversation.lines[2].en` — "What is" → "what's"?

### L0965 — Earth Science Show
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, Volcanoes make hot springs and new islands. Today is the Earth Science Show at the museum! Dr. Mori, E…
- **info** stiff-phrase `teacher.segments[19].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > It's B! Very, very slowly. Only a few centimeters a year. Bravo!
- **info** stiff-phrase `teacher.segments[19].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > It's B! Very, very slowly. Only a few centimeters a year. Bravo!

### L0968 — Tsunami Warnings
- **info** contraction `conversation.lines[0].en` — "what is" → "what's"?

### L0972 — Make Sure You…
- **warn** punctuation `title` — "…" → "..."  
  > Make Sure You…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Make Sure You…

### L0973 — A Family Meeting Place
- **info** contraction `conversation.lines[1].en` — "that is" → "that's"?

### L0980 — Evacuation Drill
- **info** please-command `conversation.lines[1].en` — "Please listen carefully." → Can you ~? / Let's ~. / plain imperative  
  > Good morning, everyone. This is a drill. Please listen carefully.

### L0983 — Helping People Who Don't Speak Japanese
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L1000 — Lesson 1000 Welcome!
- **info** stiff-phrase `teacher.segments[0].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, I'd like to change some yen, please. Today is a very, very special day. Lesson one thousand! Flight el…
- **info** stiff-phrase `teacher.segments[0].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, I'd like to change some yen, please. Today is a very, very special day. Lesson one thousand! Flight el…

### L1002 — Would You Mind…?
- **warn** punctuation `title` — "…" → "..."  
  > Would You Mind…?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Would You Mind…?

### L1003 — Do You Know Where…?
- **warn** punctuation `title` — "…" → "..."  
  > Do You Know Where…?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Do You Know Where…?

### L1004 — Could You Recommend…?
- **warn** punctuation `title` — "…" → "..."  
  > Could You Recommend…?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Could You Recommend…?

### L1011 — Exploring the City
- **warn** uk-word `phonics.words[2]` — "queue" → line  
  > queue
- **warn** uk-word `phonics.words[3]` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacherScript` — "Queue" → line  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacherScript` — "Timetable" → schedule  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacherScript` — "pavement" → sidewalk  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacher.segments[8].say` — "pavement" → sidewalk  
  > Sound time! Some words are different in the UK and the US. Underground. In the US, people say subway. Sidewalk. In the UK, people say pavem…
- **warn** uk-word `teacher.segments[8].subtitleEn` — "pavement" → sidewalk  
  > Sound time! Some words are different in the UK and the US. Underground. In the US, people say subway. Sidewalk. In the UK, people say pavem…
- **warn** uk-word `teacher.segments[9].say` — "Queue" → line  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].say` — "Timetable" → schedule  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Queue" → line  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Timetable" → schedule  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].slide.items[2]` — "queue" → line  
  > queue
- **warn** uk-word `teacher.segments[9].slide.items[3]` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacher.segments[17].say` — "queue" → line  
  > Quiz time! In the UK, people say queue. What do people in the US say? A, line. B, bridge. Think!
- **warn** uk-word `teacher.segments[17].subtitleEn` — "queue" → line  
  > Quiz time! In the UK, people say queue. What do people in the US say? A, line. B, bridge. Think!
- **warn** uk-word `teacher.segments[17].slide.items[0]` — "queue" → line  
  > queue
- **warn** uk-word `teacher.segments[18].say` — "queue" → line  
  > It's A, line! A queue is a line of people waiting. Fantastic!
- **warn** uk-word `teacher.segments[18].subtitleEn` — "queue" → line  
  > It's A, line! A queue is a line of people waiting. Fantastic!
- **warn** uk-word `teacher.segments[18].slide.items[0]` — "queue" → line  
  > queue
- **warn** uk-word `teacher.segments[19].slide.items[3]` — "queue" → line  
  > queue

### L1012 — At the Restaurant
- **warn** uk-word `phonics.words[1]` — "biscuit" → cookie(s)  
  > biscuit
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. We go to the fish rest…
- **warn** uk-word `teacherScript` — "rubbish" → trash  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. We go to the fish rest…
- **warn** uk-word `teacher.segments[9].say` — "Biscuit" → cookie(s)  
  > Sound time! More UK and US words. Bill. In the US, people say check. Biscuit. Bis, kit. Don't say the u! In the US, it's a cookie.
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Biscuit" → cookie(s)  
  > Sound time! More UK and US words. Bill. In the US, people say check. Biscuit. Bis, kit. Don't say the u! In the US, it's a cookie.
- **warn** uk-word `teacher.segments[9].slide.items[1]` — "biscuit" → cookie(s)  
  > biscuit
- **warn** uk-word `teacher.segments[10].say` — "Biscuit" → cookie(s)  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].say` — "rubbish" → trash  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].subtitleEn` — "Biscuit" → cookie(s)  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].subtitleEn` — "rubbish" → trash  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "biscuit" → cookie(s)  
  > biscuit
- **info** uk-word `teacherScript` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. We go to the fish rest…
- **info** uk-word `teacher.segments[10].say` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **info** uk-word `teacher.segments[10].subtitleEn` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.

### L1013 — Lift or Elevator?
- **warn** uk-word `teacherScript` — "biscuits" → cookie(s)  
  > Hello, everyone! Last time, we said, Could we have the menu, please? After lunch, we stop by the Seagull Hotel. Two friendly travelers are …
- **warn** uk-word `teacherScript` — "on holiday" → on vacation  
  > Hello, everyone! Last time, we said, Could we have the menu, please? After lunch, we stop by the Seagull Hotel. Two friendly travelers are …
- **warn** uk-word `conversation.lines[4].en` — "on holiday" → on vacation  
  > I'm playing Mrs. Brown! I'm on holiday. Let's take the lift!
- **warn** uk-word `conversation.aiTask.starterEn` — "on holiday" → on vacation  
  > Let's pretend I'm Mrs. Brown from the UK. Hello, dears! I'm on holiday here. Shall we take the lift together? Oh, what do you call it in th…
- **warn** uk-word `teacher.segments[7].say` — "on holiday" → on vacation  
  > Kiko asks, What do people say in the US? Riko says, They say elevator. Mr. Green told me! Then Birimo says, I'm on holiday. Haru says, I'm …
- **warn** uk-word `teacher.segments[7].subtitleEn` — "on holiday" → on vacation  
  > Kiko asks, What do people say in the US? Riko says, They say elevator. Mr. Green told me! Then Birimo says, I'm on holiday. Haru says, I'm …
- **warn** uk-word `teacher.segments[7].slide.items[2]` — "on holiday" → on vacation  
  > I'm playing Mrs. Brown! I'm on holiday. Let's take the lift!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1032 — We Are Responsible For…
- **warn** punctuation `title` — "…" → "..."  
  > We Are Responsible For…
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Children have the right to learn and play. Today, Amara brings her drawing book to the Children's Coun…
- **warn** uk-word `conversation.lines[0].en` — "Biscuit" → cookie(s)  
  > I'm playing Amara! This is Biscuit, and this is Pepper. Who is responsible for feeding the cat?
- **warn** uk-word `conversation.lines[5].en` — "Biscuit" → cookie(s)  
  > I see your point. Amara walks Biscuit with her dad, right?
- **warn** uk-word `conversation.aiTask.starterEn` — "Biscuit" → cookie(s)  
  > Let's pretend I'm Amara. I have a dog named Biscuit and a cat named Pepper. What should pet owners do every day? Can you give me an example?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > We Are Responsible For…
- **warn** uk-word `teacher.segments[6].say` — "Biscuit" → cookie(s)  
  > Birimo plays Amara. This is Biscuit the dog, and this is Pepper the cat. Who is responsible for feeding the cat? Kiko says, Amara is. She f…
- **warn** uk-word `teacher.segments[6].subtitleEn` — "Biscuit" → cookie(s)  
  > Birimo plays Amara. This is Biscuit the dog, and this is Pepper the cat. Who is responsible for feeding the cat? Kiko says, Amara is. She f…
- **warn** uk-word `teacher.segments[6].slide.items[0]` — "Biscuit" → cookie(s)  
  > I'm playing Amara! This is Biscuit, and this is Pepper. Who is responsible for feeding the cat?

### L1033 — Helping at Home
- **warn** uk-word `teacher.segments[0].say` — "Biscuit" → cookie(s)  
  > Hi, team! Last time, we took care of Biscuit and Pepper. Today, Olive asks a new question. What jobs do you do at home?
- **warn** uk-word `teacher.segments[0].subtitleEn` — "Biscuit" → cookie(s)  
  > Hi, team! Last time, we took care of Biscuit and Pepper. Today, Olive asks a new question. What jobs do you do at home?

### L1036 — I Suggest That We…
- **warn** punctuation `title` — "…" → "..."  
  > I Suggest That We…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Suggest That We…

### L1040 — Children's Proposal
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1050 — World 35 Grand Review
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1051 — Down to Deep Sea City
- **info** contraction `conversation.lines[1].en` — "it is" → "it's"?

### L1054 — Life Under Pressure
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, The reason why it's dark is that sunlight can't reach this deep. Today, Dr. Vale shows us something we…

### L1056 — My Research Question
- **warn** wasei-eigo `teacher.segments[5].say` — "white board" → whiteboard  
  > Whiteboard. A big white board you write on with a marker. Squeak, squeak! Whiteboard!
- **warn** wasei-eigo `teacher.segments[5].subtitleEn` — "white board" → whiteboard  
  > Whiteboard. A big white board you write on with a marker. Squeak, squeak! Whiteboard!

### L1062 — The Main Point Is…
- **warn** punctuation `title` — "…" → "..."  
  > The Main Point Is…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > The Main Point Is…

### L1063 — Summarize in Three Sentences
- **info** contraction `conversation.lines[4].en` — "what is" → "what's"?
- **info** stiff-phrase `teacher.segments[3].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Tiny bit. A very, very small piece. This small! Tiny bit!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Tiny bit. A very, very small piece. This small! Tiny bit!

### L1066 — Today, I'd Like to Talk About…
- **warn** punctuation `title` — "…" → "..."  
  > Today, I'd Like to Talk About…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Today, I'd Like to Talk About…

### L1067 — First, Second, Finally
- **info** contraction `conversation.lines[5].en` — "it is" → "it's"?

### L1070 — Practice Presentation
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, In conclusion, the deep sea is full of surprises. Today is rehearsal day in the Great Dome. Lumi, Dr. …
- **info** contraction `conversation.lines[3].en` — "it is" → "it's"?

### L1072 — I'm Not Sure, But…
- **warn** punctuation `title` — "…" → "..."  
  > I'm Not Sure, But…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I'm Not Sure, But…

### L1073 — Asking Good Questions
- **info** stiff-phrase `teacher.segments[4].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Giant. Very, very big! Stretch up tall. Giant!
- **info** stiff-phrase `teacher.segments[4].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Giant. Very, very big! Stretch up tall. Giant!

### L1074 — I'll Look It Up
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, I have a question about the giant squid. Today, it's Birimo's turn. His research question is, Do deep-…
- **info** stiff-phrase `teacher.segments[7].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin opens a big encyclopedia, very, very slowly. Birimo copies the old turtle. Check your sources, young one!
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin opens a big encyclopedia, very, very slowly. Birimo copies the old turtle. Check your sources, young one!

### L1076 — Reading Three Sources
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, Does anyone have any questions? Today, Haru has a problem. He wants to say how long giant squid can gr…
- **info** stiff-phrase `teacher.segments[6].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin puts three sources on the table, very, very slowly. Haru reads. Source A says the squid was twelve meters l…
- **info** stiff-phrase `teacher.segments[6].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin puts three sources on the table, very, very slowly. Haru reads. Source A says the squid was twelve meters l…

### L1078 — My Presentation Script
- **warn** stiff-phrase `conversation.lines[2].en` — "very, very, very" → really ~ / super ~ / so ~  
  > Next, lanternfish are very, very, very cute!
- **warn** stiff-phrase `teacher.segments[7].say` — "very, very, very" → really ~ / super ~ / so ~  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very, very" → really ~ / super ~ / so ~  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **warn** stiff-phrase `teacher.segments[7].slide.items[0]` — "very, very, very" → really ~ / super ~ / so ~  
  > Next, lanternfish are very, very, very cute!
- **warn** stiff-phrase `teacher.segments[19].say` — "very, very, very" → really ~ / super ~ / so ~  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **warn** stiff-phrase `teacher.segments[19].subtitleEn` — "very, very, very" → really ~ / super ~ / so ~  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, We need to protect the places where these animals live. Today, it's time to write our presentation scr…
- **info** stiff-phrase `conversation.lines[2].en` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Next, lanternfish are very, very, very cute!
- **info** stiff-phrase `teacher.segments[7].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **info** stiff-phrase `teacher.segments[7].slide.items[0]` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Next, lanternfish are very, very, very cute!
- **info** stiff-phrase `teacher.segments[19].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **info** stiff-phrase `teacher.segments[19].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1081 — The Labyrinth of Tales
- **info** stiff-phrase `teacher.segments[8].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Stories use strong verbs that show how. Whisper. Speak very, very quietly. It starts with w-h, but it sounds like w. Whisper.
- **info** stiff-phrase `teacher.segments[8].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Stories use strong verbs that show how. Whisper. Speak very, very quietly. It starts with w-h, but it sounds like w. Whisper.

### L1082 — The Clever Rabbit
- **info** stiff-phrase `teacher.segments[9].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Glance. Look very, very quickly. Much faster than look! Glance left. Glance right. Your turn! Gasp. Stumble. Glance.
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Glance. Look very, very quickly. Much faster than look! Glance left. Glance right. Your turn! Gasp. Stumble. Glance.

### L1085 — What's the Lesson?
- **info** stiff-phrase `teacher.segments[9].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Let's review. Whisper. Very, very quiet. W-h sounds like w. Gasp. Oh! A quick breath, because you're surprised.
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Let's review. Whisper. Very, very quiet. W-h sounds like w. Gasp. Oh! A quick breath, because you're surprised.

### L1091 — If I Were a Dragon
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! Pause right before the surprise. Small and slow, then big! Inside was … a tiny dragon!
- **warn** punctuation `teacher.segments[9].slide.items[0]` — "…" → "..."  
  > was …
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > And then … they stopped. In the tree sat … a giant owl. Your turn! Behind the curtain stood … a little gray mouse!
- **warn** punctuation `teacher.segments[10].slide.items[0]` — "…" → "..."  
  > then …
- **warn** punctuation `teacher.segments[10].slide.items[1]` — "…" → "..."  
  > sat …
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > stood …
- **info** contraction `conversation.lines[6].en` — "I am" → "I'm"?

### L1092 — I Wish I Could…
- **warn** punctuation `title` — "…" → "..."  
  > I Wish I Could…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Wish I Could…
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! Pause before the surprise. Small and slow, then big! At the bottom of the well, she found … a golden key!
- **warn** punctuation `teacher.segments[9].slide.items[0]` — "…" → "..."  
  > found …
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Under the bed was not a monster, … but a puppy! Aww. Your turn! When the clock struck twelve, the statue … opened its eyes!
- **warn** punctuation `teacher.segments[10].slide.items[0]` — "…" → "..."  
  > monster …
- **warn** punctuation `teacher.segments[10].slide.items[1]` — "…" → "..."  
  > statue …

### L1093 — What Would You Do?
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! Pause before the surprise. Small and slow, then big! She lifted the lid and saw … a pair of eyes!
- **warn** punctuation `teacher.segments[9].slide.items[0]` — "…" → "..."  
  > saw …
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Out of the egg came … a baby star! Keep a baby star together. Your turn! Under the cup sat … a frog!
- **warn** punctuation `teacher.segments[10].slide.items[0]` — "…" → "..."  
  > came …
- **warn** punctuation `teacher.segments[10].slide.items[1]` — "…" → "..."  
  > sat …

### L1094 — She Had Never Seen the Sea
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! Pause before the big moment. Small and slow, then big! And now … it was right in front of her!
- **warn** punctuation `teacher.segments[9].slide.items[0]` — "…" → "..."  
  > now …
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > The fog cleared, and they saw … the castle! Your turn! The voice in the dark whispered one word, … welcome.
- **warn** punctuation `teacher.segments[10].slide.items[0]` — "…" → "..."  
  > saw …
- **warn** punctuation `teacher.segments[10].slide.items[1]` — "…" → "..."  
  > word …

### L1095 — Three Wishes
- **warn** sentence-length `school.expressions[0].en` — 23 words > 22 (stage 5): "If I had three wishes, I would ask for a flying bike, a library in my room and …"  
  > If I had three wishes, I would ask for a flying bike, a library in my room and a sunny day for everyone.
- **warn** sentence-length `conversation.lines[1].en` — 23 words > 22 (stage 5): "If I had three wishes, I would ask for a flying bike, a library in my room and …"  
  > If I had three wishes, I would ask for a flying bike, a library in my room and a sunny day for everyone.
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound review! The story pause. Small and slow, then big! Inside was … a tiny dragon!
- **warn** punctuation `teacher.segments[9].slide.items[0]` — "…" → "..."  
  > was …
- **info** contraction `conversation.lines[9].en` — "it is" → "it's"?

### L1100 — Lesson 1100 Story Party
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound review! Bravely. Brave plus l y. Now the story pause. At the bottom of the well, she found … a golden key! Small and slow, then big!
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L1101 — Telling a Story Aloud
- **warn** punctuation `teacher.segments[17].subtitleEn` — "…" → "..."  
  > Your turn! Make your own tiny surprise. The old box was very quiet, and then… it moved! BOO!

### L1105 — Storytelling Night
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Out of the giant egg came… a baby star! Wait after came. Flutter has a short u, like up. Your turn! Out of the giant egg came… a baby star.…
- **warn** punctuation `teacher.segments[17].subtitleEn` — "…" → "..."  
  > Your turn! Begin your own story. Once, in a land beyond the sea, there lived… who? You choose!

### L1106 — Reading a Longer Tale
- **warn** punctuation `teacher.segments[2].subtitleEn` — "…" → "..."  
  > Tale. A story, often a very old one. Once upon a time… Tale!
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Story pause! She had never seen the sea before, and now… it was right in front of her! Brrr, as cold as ice. Your turn! Glance. Sizzle. Gen…
- **warn** punctuation `teacher.segments[17].subtitleEn` — "…" → "..."  
  > Your turn! Was he a bad king, or a tired king? Say, I think, and then your reason. Because…

### L1107 — Same Story, Different Hero
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Story pause! Little by little, the fog cleared, and they saw… the castle! Your turn! Wander. Rustle. Curiously. As light as a feather.

### L1108 — My Final Story
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Story pause! He reached into his pocket and pulled out… a glowing stone! Your turn! Grin. Drip. Proudly. Sleep like a log.
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1109 — Labyrinth of Tales Review
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Story pause! The thing under the bed was not a monster… but a puppy! Your turn! Stumble. Whoosh. Nervously. As quiet as a mouse.

### L1110 — World 37 Grand Review
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Kiko is last. Aria helped the youngest wind… Birimo asks, And then what happened? Kiko says, The wind carried her home!
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Story pause! The voice in the dark whispered one word… welcome! Your turn! Glimmer. Creak. Bravely. Like a shooting star.

### L1111 — The Highlands of the Heart
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Every one of us has a story to tell. Nib walks with us to the round exit of the Labyrinth, holding the…
- **warn** uk-word `teacher.segments[4].say` — "Biscuit" → cookie(s)  
  > Sheepdog. A smart dog that helps with the sheep. Woof! This is Biscuit. Sheepdog!
- **warn** uk-word `teacher.segments[4].subtitleEn` — "Biscuit" → cookie(s)  
  > Sheepdog. A smart dog that helps with the sheep. Woof! This is Biscuit. Sheepdog!

### L1112 — Not Just "Happy"
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, The weather here changes with your feelings. This morning, we wake up in Grandma Rowan's stone farmhou…
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, The weather here changes with your feelings. This morning, we wake up in Grandma Rowan's stone farmhou…
- **info** stiff-phrase `teacher.segments[7].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Over the moon means very, very happy. So happy, you could jump over the moon! Haru says, I'm thrilled! I want to climb Heart Hill.
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Over the moon means very, very happy. So happy, you could jump over the moon! Haru says, I'm thrilled! I want to climb Heart Hill.
- **info** stiff-phrase `teacher.segments[19].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! You are very, very happy. Which words are bigger? A, I'm OK. B, I'm over the moon! Think!
- **info** stiff-phrase `teacher.segments[19].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! You are very, very happy. Which words are bigger? A, I'm OK. B, I'm over the moon! Think!

### L1113 — Annoyed or Angry?
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, I'm not just happy. I'm over the moon! Today, we're helping Grandma Rowan in the farmyard. Birimo take…
- **warn** uk-word `conversation.scene` — "Biscuit" → cookie(s)  
  > Biscuit the sheepdog runs off with Birimo's sock
- **warn** uk-word `conversation.lines[0].en` — "Biscuit" → cookie(s)  
  > Hey! Biscuit, come back! That's my sock!
- **warn** uk-word `conversation.lines[6].en` — "Biscuit" → cookie(s)  
  > Because Biscuit is wagging his tail and looking at me with those big eyes. I can't stay grumpy!
- **warn** uk-word `conversation.aiTask.starterEn` — "Biscuit" → cookie(s)  
  > Let's pretend I'm Puff. Oh dear, Biscuit took your sock and ran across the whole field! Now it's wet and muddy. How are you really feeling?…
- **warn** uk-word `teacher.segments[0].say` — "Biscuit" → cookie(s)  
  > Hi, everyone! Last time, we said, I'm not just happy. I'm over the moon! But today, oh no! Biscuit has Birimo's sock!
- **warn** uk-word `teacher.segments[0].subtitleEn` — "Biscuit" → cookie(s)  
  > Hi, everyone! Last time, we said, I'm not just happy. I'm over the moon! But today, oh no! Biscuit has Birimo's sock!
- **warn** uk-word `teacher.segments[6].say` — "Biscuit" → cookie(s)  
  > Biscuit runs away with the sock. It's a game for Biscuit! The sock comes back all wet. Birimo says, I'm a little annoyed, not angry.
- **warn** uk-word `teacher.segments[6].subtitleEn` — "Biscuit" → cookie(s)  
  > Biscuit runs away with the sock. It's a game for Biscuit! The sock comes back all wet. Birimo says, I'm a little annoyed, not angry.
- **warn** uk-word `teacher.segments[6].slide.items[0]` — "Biscuit" → cookie(s)  
  > Hey! Biscuit, come back! That's my sock!

### L1114 — Relieved and Embarrassed
- **info** stiff-phrase `teacher.segments[9].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Furious. Very, very angry! It starts like fury. It ends with i, o, u, s. Furious.
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Furious. Very, very angry! It starts like fury. It ends with i, o, u, s. Furious.

### L1115 — Feelings Weather Report
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, I was so embarrassed, but then I felt relieved. Today, Grandma Rowan has an idea. Every evening, she l…

### L1118 — Just Listening
- **warn** punctuation `teacher.segments[12].subtitleEn` — "…" → "..."  
  > Let's move! Knit a scarf. Click, click. Now pull the yarn… oops, it's tangled!

### L1119 — Cheer Up!
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Do you want advice, or do you just want me to listen? Today is the day of the welcome party! Kiko has …
- **warn** uk-word `teacher.segments[9].say` — "Biscuit" → cookie(s)  
  > Sound time! Put up with. Accept something annoying. Link it, pu-tup. UP is strong. Grandma Rowan puts up with Biscuit's sock stealing!
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Biscuit" → cookie(s)  
  > Sound time! Put up with. Accept something annoying. Link it, pu-tup. UP is strong. Grandma Rowan puts up with Biscuit's sock stealing!

### L1120 — Good Listener Role-Play
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Cheer up! You'll do better next time. The morning after the party, I have a plan. I say, You've learne…
- **warn** uk-word `conversation.lines[3].en` — "Biscuit" → cookie(s)  
  > I painted the purple heather and left it outside to dry. Then Biscuit ran right across it!
- **warn** uk-word `conversation.lines[9].en` — "Biscuit" → cookie(s)  
  > Orange returned to the rainbow! Biscuit, you helped too, with your muddy paws!
- **warn** uk-word `teacher.segments[7].say` — "Biscuit" → cookie(s)  
  > Biscuit ran right across it! Kiko asks, Then what happened? My painting got muddy. There are paw prints all over my hills!
- **warn** uk-word `teacher.segments[7].subtitleEn` — "Biscuit" → cookie(s)  
  > Biscuit ran right across it! Kiko asks, Then what happened? My painting got muddy. There are paw prints all over my hills!
- **warn** uk-word `teacher.segments[19].slide.items[0]` — "Biscuit" → cookie(s)  
  > Orange returned to the rainbow! Biscuit, you helped too, with your muddy paws!

### L1126 — Wouldn't It Be Better If…?
- **warn** punctuation `title` — "…" → "..."  
  > Wouldn't It Be Better If…?
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, Calm down. Listen. Say how you feel. Find a solution. Today, we are having dinner at Grandma Rowan's f…
- **info** stiff-phrase `teacher.segments[9].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Idiom time! Over the moon. You're so happy, you jump over the moon! It means very, very happy.
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Idiom time! Over the moon. You're so happy, you jump over the moon! It means very, very happy.

### L1129 — Saying No Politely
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Gooseberry. A small green berry. It's very, very sour! Gooseberry.
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Gooseberry. A small green berry. It's very, very sour! Gooseberry.

### L1130 — Persuasion Challenge
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Thanks for asking, but I'd rather not. Today is the Persuasion Challenge at the village hall. The hall…

### L1131 — Someone I Look Up To
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Let me tell you why this is a great idea. Mr. Bram said yes, and next week the buddy bench will be bui…
- **warn** uk-word `teacher.segments[0].say` — "Biscuit" → cookie(s)  
  > Hi, everyone! Last time, Mr. Bram said yes to the buddy bench! Today, we're in Grandma Rowan's warm kitchen, with warm milk and Biscuit.
- **warn** uk-word `teacher.segments[0].subtitleEn` — "Biscuit" → cookie(s)  
  > Hi, everyone! Last time, Mr. Bram said yes to the buddy bench! Today, we're in Grandma Rowan's warm kitchen, with warm milk and Biscuit.

### L1133 — Interview a Grandparent
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, How did you feel at that moment? Today, Mr. Bram finally tells us the name of our guest for the Interv…
- **warn** uk-word `conversation.aiTask.starterEn` — "Biscuit" → cookie(s)  
  > Let's pretend I'm Grandma Rowan. Come in, come in! Biscuit and I are ready for your questions. I warn you, my stories are very old ones. Wh…

### L1134 — Writing an Interview Article
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, What was your childhood like? Today, we're turning our interview into an article for the Heatherbrook …
- **warn** uk-word `teacher.segments[9].say` — "Biscuit" → cookie(s)  
  > Sound time! Play plus f, u, l is playful, full of fun, like Biscuit chasing his tail. Attentive is from attention, plus i, v, e. You notice…
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Biscuit" → cookie(s)  
  > Sound time! Play plus f, u, l is playful, full of fun, like Biscuit chasing his tail. Attentive is from attention, plus i, v, e. You notice…
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1135 — Interview Show
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, 'I never gave up,' she told me. Tonight is the Interview Show! The village hall is full. Families sit …

### L1136 — Idioms of the Heart
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, Our guest today is Grandma Rowan. Today, a gentle rain is falling on Heatherbrook, so Grandma Rowan ha…
- **info** stiff-phrase `teacher.segments[19].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Over the moon! She's very, very happy. You're an idiom star!
- **info** stiff-phrase `teacher.segments[19].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Over the moon! She's very, very happy. You're an idiom star!

### L1139 — Highlands of the Heart Review
- **warn** uk-word `school.expressions[2].en` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, One kind word can change someone's day. Today, we take a goodbye walk around the highlands with Puff, …
- **warn** uk-word `conversation.lines[4].en` — "Biscuit" → cookie(s)  
  > Not really. I'm going to miss Biscuit so much.
- **warn** uk-word `conversation.lines[8].en` — "Biscuit" → cookie(s)  
  > Let's take one last picture with Biscuit and Grandma Rowan.
- **warn** uk-word `conversation.aiTask.targetExpressions[2]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[1].slide.items[2]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[7].say` — "Biscuit" → cookie(s)  
  > But Birimo is quiet. A tiny rain cloud follows along. Haru asks, Is everything OK? Birimo says, Not really. I'm going to miss Biscuit. Haru…
- **warn** uk-word `teacher.segments[7].slide.items[0]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[7].subtitleEn` — "Biscuit" → cookie(s)  
  > But Birimo is quiet. A tiny rain cloud follows along. Haru asks, Is everything OK? Birimo says, Not really. I'm going to miss Biscuit. Haru…
- **warn** uk-word `teacher.segments[8].say` — "Biscuit" → cookie(s)  
  > Here's the point. Every feeling is OK, and sharing it helps. Biscuit licks Birimo's nose, and the rain cloud is gone. The sky is clear!
- **warn** uk-word `teacher.segments[8].subtitleEn` — "Biscuit" → cookie(s)  
  > Here's the point. Every feeling is OK, and sharing it helps. Biscuit licks Birimo's nose, and the rain cloud is gone. The sky is clear!
- **warn** uk-word `teacher.segments[15].say` — "Biscuit" → cookie(s)  
  > Is everything OK? Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[15].slide.items[0]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[15].subtitleEn` — "Biscuit" → cookie(s)  
  > Is everything OK? Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[19].slide.items[2]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.

### L1140 — World 38 Grand Review
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, That must be hard for you. I should have noticed sooner. Today is the Heart Festival on Heart Hill! Th…

### L1148 — However…
- **warn** punctuation `title` — "…" → "..."  
  > However…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > However…

### L1149 — It Seems That…
- **warn** punctuation `title` — "…" → "..."  
  > It Seems That…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > It Seems That…

### L1152 — We Believe That…
- **warn** punctuation `title` — "…" → "..."  
  > We Believe That…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > We Believe That…
- **info** contraction `conversation.aiTask.starterEn` — "what is" → "what's"?

### L1153 — Our First Point Is…
- **warn** punctuation `title` — "…" → "..."  
  > Our First Point Is…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Our First Point Is…

### L1154 — We Disagree Because…
- **warn** punctuation `title` — "…" → "..."  
  > We Disagree Because…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > We Disagree Because…
- **info** contraction `conversation.lines[1].en` — "what is" → "what's"?

### L1156 — One Solution Is…
- **warn** punctuation `title` — "…" → "..."  
  > One Solution Is…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > One Solution Is…

### L1163 — Presenting Our Proposal
- **info** please-command `conversation.lines[3].en` — "Please take me." → Can you ~? / Let's ~. / plain imperative  
  > I'm playing a banana! Please take me. I don't want to go to waste!

### L1166 — Reading Different Views
- **info** please-command `conversation.lines[4].en` — "Please turn off the lights." → Can you ~? / Let's ~. / plain imperative  
  > I'm playing an owl! Hoo! Please turn off the lights. I'm trying to find my dinner!

### L1176 — My Best Work
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1181 — Interview Practice 1
- **info** please-command `conversation.lines[0].en` — "Please sit down." → Can you ~? / Let's ~. / plain imperative  
  > Good morning. Please sit down.

### L1182 — Interview Practice 2
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1184 — Interview Practice 4
- **warn** punctuation `school.grammar` — "…" → "..."  
  > Could you say that again, please? / Let me see… That's a good question. / I'm not sure, but I think ～.
- **warn** punctuation `school.expressions[1].en` — "…" → "..."  
  > Let me see… That's a good question. I think I'd choose a dolphin.
- **warn** punctuation `conversation.aiTask.targetExpressions[1]` — "…" → "..."  
  > Let me see… That's a good question. I think I'd choose a dolphin.
- **warn** punctuation `teacher.segments[1].slide.items[1]` — "…" → "..."  
  > Let me see… That's a good question. I think I'd choose a dolphin.
- **warn** punctuation `teacher.segments[16].slide.items[0]` — "…" → "..."  
  > Let me see… That's a good question. I think I'd choose a dolphin.
- **warn** punctuation `teacher.segments[21].slide.items[1]` — "…" → "..."  
  > Let me see… That's a good question. I think I'd choose a dolphin.

### L1185 — Mock Interview
- **info** stiff-phrase `teacherScript` — "do your best" → You can do it! (Do your best is OK)  
  > Hello, everyone! Last time, we said, Could you say that again, please? We've practiced every part of the interview: the self-introduction, …

### L1186 — I Hope to…
- **warn** punctuation `title` — "…" → "..."  
  > I Hope to…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Hope to…

### L1200 — World 40 Grand Finale
- **info** contraction `conversation.lines[7].en` — "is not" → "isn't"?

### chant:c-13 — What Are You Doing?
- **info** contraction `lines[1].en` — "What is" → "what's"?
- **info** contraction `lines[3].en` — "What is" → "what's"?

### chant:c-22 — It Was Made By
- **info** contraction `lines[3].en` — "it is" → "it's"?

### story:s1-07 — The Big Pig
- **info** contraction `lines[6].en` — "is not" → "isn't"?

### story:s2-13 — A Letter to the Future
- **warn** punctuation `lines[8].en` — missing end mark (. ! ?)  
  > From, Kiko of today

### story:s2-16 — The Toy Machine
- **info** stiff-phrase `lines[7].en` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > The machine shakes and beeps. Out comes a rabbit with very, very long ears.

### story:s3-14 — Bored or Boring?
- **info** contraction `lines[10].en` — "I am" → "I'm"?

### story:s4-08 — What If...?
- **info** contraction `lines[7].en` — "it is" → "it's"?

### story:s4-11 — The Map on the Tent
- **info** contraction `lines[6].en` — "It is" → "it's"?

### story:s4-16 — The Lost Passport
- **info** please-command `lines[9].en` — ""Please wait here," says the officer." → Can you ~? / Let's ~. / plain imperative  
  > "Please wait here," says the officer. "Someone will check the plane for you."

### story:s5-02 — Three Sentences Only
- **info** contraction `lines[5].en` — "what is" → "what's"?

### story:s5-07 — What Would You Do?
- **info** contraction `lines[1].en` — "will not" → "won't"?

### story:s5-18 — The Old Me, the Me Now
- **info** contraction `lines[2].en` — "I am" → "I'm"?
- **info** contraction `lines[5].en` — "It is" → "it's"?

### talk:t-food — すきな たべもの
- **info** uk-word `lines[2].en` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Curry! It's yummy! Do you like sweets?

### talk:t-dream — しょうらいの ゆめ
- **warn** sentence-length `lines[4].en` — 10 words > 8 (stage 1): "I want to be a writer because I love stories."  
  > That's wonderful! I want to be a writer because I love stories. What are you good at?

### yearly:3 — ステージ3 の 力だめし
- **info** contraction `listening[18].audio[0].en` — "do not" → "don't"?

### yearly:4 — ステージ4 の 力だめし
- **info** contraction `listening[13].audio[0].en` — "do not" → "don't"?
- **info** contraction `listening[16].audio[0].en` — "did not" → "didn't"?

### yearly:5 — ステージ5 の 力だめし
- **info** contraction `listening[17].audio[3].en` — "are not" → "aren't"?
- **info** contraction `listening[20].audio[1].en` — "it is" → "it's"?

### L0024 — Let's Play!
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0025 — Family Day at the Park (Review)
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0032 — Let's Be Friends!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0051 — Let's Go to the Park!
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0055 — Bus Trip (Review)
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0064 — Greetings Around the World
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0078 — Mixing Colors
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0094 — Body Letters
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0127 — Let's Play Tag!
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0128 — Rainy Day Games
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0129 — Hot Day, Cold Day
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0130 — Rainy Day Plans
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0134 — Let's Play on Saturday!
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0135 — Our Weekly Schedule
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0142 — I Have a Ruler.
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0147 — My Afternoon
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0150 — World 5 Grand Review
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0218 — How Much Is It?
- **info** near-duplicate `(lesson)` — lines differ by 1–2 letters (typo?)  
  > It's 500 yen. / It's 800 yen.
- **info** near-duplicate `(lesson)` — lines differ by 1–2 letters (typo?)  
  > It's 500 yen. / It's 300 yen.
- **info** near-duplicate `(lesson)` — lines differ by 1–2 letters (typo?)  
  > It's 800 yen. / It's 300 yen.

### L0295 — Save the Earth Idea Meeting
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0296 — My Proposal Speech
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0300 — World 10 Grand Review
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0502 — My Own Constellation
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0549 — Let's Try Again
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0559 — That's Not Fair!
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0664 — Measure It!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0854 — Let's Decide
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0855 — Class Meeting Role-Play
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0884 — Test and Improve
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0929 — Corridor of Time Review
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0986 — A Safety Poster
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1009 — I Lost My Passport
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1037 — How About Making a Map?
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1168 — A Message to the World
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1196 — Grand Review: Talk About Anything
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

## 書きかたの ゆれ（はんい ぜんたい）
- "me too" ×9 (L0004, L0005, L0007, …) vs "me, too" ×2 (L0183, L0244)
- "thank you" ×12 (L0010, L0019, L0028, …) vs "thank-you" ×1 (L0569)
- "beep, beep" ×1 (L0104) vs "beep beep" ×1 (L0498)
- "say thank you and bow" ×4 (L0145, L0160, L0380, …) vs "say, "Thank you!" and bow" ×1 (L0633)
- "once upon a time" ×3 (L0174, L0654, story:s2-09) vs "once. upon. a. time" ×1 (L0778)
- "make an x with your arms" ×1 (L0178) vs "make an X with your arms" ×1 (L0386)
- "january, February, March, April" ×1 (L0186) vs "january, February, March, April," ×1 (chant:c-10)
- "bow and say thank you" ×10 (L0219, L0298, L0520, …) vs "bow and say, Thank you" ×3 (L1001, L1180, L1191)
- "tug of war" ×2 (L0302, L0349) vs "tug-of-war" ×1 (L0434)
- "shout Bingo" ×1 (L0506) vs "shout, "Bingo" ×1 (L0700)
- "whisper thank you" ×1 (L0537) vs "whisper, "Thank you" ×1 (L0651)
- "rub your tummy and say yum" ×1 (L0582) vs "rub your tummy and say, Yum" ×1 (L1174)
- "shout, "Help" ×1 (L0651) vs "shout, Help" ×1 (L0762)
- "stem" ×2 (L0682, L0938) vs "STEM" ×2 (L0889, L0898)
- "take a deep breath. In and out" ×1 (L0773) vs "take a deep breath, in and out" ×1 (L1113)
- "sure. Go ahead" ×1 (L0833) vs "sure, go ahead" ×1 (L0853)
- "seat belt" ×1 (L0873) vs "seatbelt" ×1 (L0996)
- "put your hand on your heart and say thank you" ×2 (L1112, L1169) vs "put your hand on your heart and say, Thank you" ×1 (L1010)
