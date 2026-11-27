# English lint: all

- 日付: 2026-11-27
- はんい: レッスン 1〜1200 ＋ としょかん ＋ 力だめし（`npm run english:lint -- --quiet`）
- しらべた 文字列: 154505（1344 ユニット）
- 結果: **error 74 / warn 1258 / info 306**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 456 | 0 |
| capitalization | 0 | 4 | 0 |
| contraction | 0 | 0 | 110 |
| grammar-habit | 2 | 10 | 0 |
| inconsistent-form | 0 | 21 | 0 |
| lets-overuse | 0 | 0 | 30 |
| near-duplicate | 0 | 0 | 3 |
| please-command | 0 | 0 | 23 |
| punctuation | 0 | 317 | 0 |
| sentence-length | 0 | 122 | 0 |
| spelling | 1 | 0 | 0 |
| stiff-phrase | 0 | 55 | 116 |
| uk-spelling | 71 | 0 | 0 |
| uk-word | 0 | 271 | 24 |
| wasei-eigo | 0 | 2 | 0 |

## ユニットごと

### L0001 — Hello! I'm Haru.
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > Nice to meet you. or Go!?

### L0003 — How are you?
- **warn** stiff-phrase `school.expressions[1].en` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacherScript` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > Good morning! How are you? I'm great! きょうは「げんき？」と きく ことば。I'm fine, thank you. で こたえてみよう。Clap your hands! Jump!
- **warn** stiff-phrase `conversation.lines[3].en` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[6].say` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > あさの がっこうの もんで、せんせいと リコちゃんが あいさつ するよ。Good morning, Riko! Good morning, Ms. Emma! How are you? I'm fine, thank you. How are you? I'm great!
- **warn** stiff-phrase `teacher.segments[6].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > Good morning, Riko! / How are you? / I'm fine, thank you. How are you? / I'm great!
- **warn** stiff-phrase `teacher.segments[6].slide.items[2]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. / I'm great!
- **warn** stiff-phrase `teacher.segments[7].slide.items[0]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacher.segments[8].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[8].slide.items[0]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[16].say` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacher.segments[16].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacher.segments[16].slide.items[0]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** punctuation `teacher.segments[19].subtitleEn` — use one ! or ?  
  > I'm great! or Good morning!?

### L0007 — I Like Pink!
- **warn** punctuation `teacher.segments[18].subtitleEn` — use one ! or ?  
  > Me too! or Pop!?

### L0022 — Put On Your Hat!
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > It's hot. or It's cold!?

### L0031 — What Do You Like?
- **warn** punctuation `teacher.segments[15].subtitleEn` — use one ! or ?  
  > What do you like? I like books. or Me too!?

### L0038 — The Ice Cream Shop
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > One or two? Two, please. or Thank you!?

### L0039 — It's Sweet!
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > It's sweet. or It's sour!?

### L0040 — The Snack Shop (Review)
- **warn** punctuation `teacher.segments[15].subtitleEn` — use one ! or ?  
  > Here you are. or Thank you!?

### L0049 — Clean Up Time
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > Clean up, please. or All done!?

### L0051 — Let's Go to the Park!
- **warn** punctuation `conversation.lines[1].en` — "…" → "..."  
  > Hmm… it's hot. Let's go to the library.
- **warn** punctuation `teacher.segments[5].subtitleEn` — "…" → "..."  
  > Let's go to the park! / Hmm… it's hot. Let's go to the library. / Sounds good! / Me too! I like books.
- **warn** punctuation `teacher.segments[5].slide.items[1]` — "…" → "..."  
  > Hmm… it's hot. Let's go to the library.
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0062 — What's Your Name?
- **warn** stiff-phrase `school.grammar` — ". And you?" → How about you? / You?  
  > What's your name? ― I'm ～. And you?
- **warn** stiff-phrase `school.expressions[1].en` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacherScript` — "And you?" → How about you? / You?  
  > Hi! きょうは なまえの ききかた。「What's your name?」って きかれたら「I'm ～.」で こたえよう。「And you?」で ききかえして、さいごに「Nice to meet you, too.」も いえたら かっこいいよ。
- **warn** stiff-phrase `conversation.lines[2].en` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[1].say` — ". And you?" → How about you? / You?  
  > Our goal today. Ask, What's your name? Answer, I'm Kiko. And you? なまえを きいて、こたえて、ききかえす。これが きょうの ゴール！ ききかえすと、かいわが ながく つづくよ。
- **warn** stiff-phrase `teacher.segments[1].subtitleEn` — ". And you?" → How about you? / You?  
  > Our goal today. Ask, What's your name? Answer, I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[1].slide.items[0]` — ". And you?" → How about you? / You?  
  > What's your name? ― I'm ～. And you?
- **warn** stiff-phrase `teacher.segments[5].say` — ". And you?" → How about you? / You?  
  > Let's play the name game! Catch the ball and say your name. ハルくんが ボールを なげたよ。Here you go! What's your name? I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[5].subtitleEn` — ". And you?" → How about you? / You?  
  > Let's play the name game! Catch the ball and say your name. / Here you go! What's your name? / I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[5].slide.items[2]` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[7].say` — "And you?" → How about you? / You?  
  > ポイントは ふたつ。And you? は「あなたは？」と ききかえす ことば。そして Nice to meet you. と いわれたら、さいごに too を つけて、Nice to meet you, too. こちらこそ、の いみ だよ。
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you? / Nice to meet you, too.
- **warn** stiff-phrase `teacher.segments[7].slide.items[0]` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[14].say` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[14].subtitleEn` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[14].slide.items[0]` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[16].say` — ", And you?" → How about you? / You?  
  > Your turn! What's your name? I'm のあとに あなたの なまえ。ニックネームでも いいよ。Then ask, And you?
- **warn** stiff-phrase `teacher.segments[16].subtitleEn` — ". And you?" → How about you? / You?  
  > Your turn! What's your name? I'm ～. And you?
- **warn** stiff-phrase `teacher.segments[16].slide.items[1]` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?
- **warn** stiff-phrase `teacher.segments[19].say` — "And you?" → How about you? / You?  
  > Great job today! なまえを きいて、こたえて、And you? で ききかえせたね。おわりの sh も ばっちり。このあと ハルくんと おはなし してみてね。See you next time!
- **warn** stiff-phrase `teacher.segments[19].slide.items[1]` — ". And you?" → How about you? / You?  
  > I'm Kiko. And you?

### L0070 — At the Nurse's Office (Review)
- **info** stiff-phrase `teacher.segments[12].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Slow-motion challenge! Lie down. Close your eyes. Sit up slowly. Drink some water. Very, very slowly!
- **info** stiff-phrase `teacher.segments[12].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Slow-motion challenge! Lie down. Close your eyes. Sit up slowly. Drink some water. Very, very slowly!

### L0087 — Feelings Dice
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "One is happy, three is sleepy, six is hungry."  
  > Let's play! One is happy, three is sleepy, six is hungry. Roll the dice! How many?

### L0112 — It's Big! It's Small!
- **info** stiff-phrase `conversation.lines[4].en` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > No! It's small. Very, very small!
- **info** stiff-phrase `teacher.segments[7].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Kiko says, Look at the sloth. It's small. It's slow. なまけものは ちいさくて ゆっくり。せんせいが ねずみは おおきい？ って きくと、ビリモが No! It's small. Very, very small!
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Look at the sloth. It's small. It's slow. / No! It's small. Very, very small!
- **info** stiff-phrase `teacher.segments[7].slide.items[1]` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > No! It's small. Very, very small!

### L0123 — What's for Breakfast?
- **warn** sentence-length `conversation.lines[1].en` — 10 words > 8 (stage 1): "Toast from England, rice from Japan, and tortillas from Mexico."  
  > Look! Toast from England, rice from Japan, and tortillas from Mexico.

### L0161 — This Is Our School
- **warn** sentence-length `conversation.lines[0].en` — 9 words > 8 (stage 1): "Everyone, this is a new friend, Birimo's cousin Pipo!"  
  > Everyone, this is a new friend, Birimo's cousin Pipo!
- **info** please-command `conversation.aiTask.starterEn` — "Please show me the school!" → Can you ~? / Let's ~. / plain imperative  
  > I'm new here. Please show me the school! What's this room?

### L0191 — School Subjects
- **warn** uk-word `conversation.scene` — "timetable" → schedule  
  > Looking at the timetable in the island classroom
- **warn** uk-word `teacher.segments[0].say` — "timetable" → schedule  
  > Good morning, island explorers! Welcome to our island classroom. Look at the wall. It's a big timetable! Let's find out what's on it! きょうは …
- **warn** uk-word `teacher.segments[0].subtitleEn` — "timetable" → schedule  
  > Good morning, island explorers! Welcome to our island classroom. Look at the wall. It's a big timetable! Let's find out what's on it!

### L0192 — What Do You Have on Monday?
- **warn** uk-word `vocab[0].en` — "timetable" → schedule  
  > timetable
- **warn** uk-word `conversation.scene` — "timetable" → schedule  
  > Checking the timetable for the week
- **warn** uk-word `conversation.aiTask.starterEn` — "timetable" → schedule  
  > Let's look at the timetable! I have music on Monday. What do you have on Monday?
- **warn** uk-word `teacher.segments[0].say` — "timetable" → schedule  
  > Hello, hello! Last time, we learned subject names. Today, Kiko and Haru are checking the timetable for the whole week. Monday, Tuesday... w…
- **warn** uk-word `teacher.segments[0].subtitleEn` — "timetable" → schedule  
  > Hello, hello! Last time, we learned subject names. Today, Kiko and Haru are checking the timetable for the whole week. Monday, Tuesday... w…
- **warn** uk-word `teacher.segments[2].say` — "Timetable" → schedule  
  > Timetable. Days go across, subjects go down. timetable は じかんわり。Timetable!
- **warn** uk-word `teacher.segments[2].say` — "Timetable" → schedule  
  > Timetable. Days go across, subjects go down. timetable は じかんわり。Timetable!
- **warn** uk-word `teacher.segments[2].subtitleEn` — "Timetable" → schedule  
  > Timetable. Days go across, subjects go down. Timetable!
- **warn** uk-word `teacher.segments[2].slide.items[0]` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacher.segments[10].say` — "timetable" → schedule  
  > Let's move! Point to Monday on your timetable. Now, Play the recorder. ゆびを うごかして、ピーピー！
- **warn** uk-word `teacher.segments[10].subtitleEn` — "timetable" → schedule  
  > Let's move! Point to Monday on your timetable. Now, Play the recorder.
- **warn** uk-word `teacher.segments[19].slide.items[2]` — "timetable" → schedule  
  > timetable

### L0193 — I Have Math and Art
- **warn** uk-word `conversation.scene` — "timetables" → schedule  
  > Comparing timetables with an online friend
- **warn** uk-word `conversation.aiTask.starterEn` — "timetables" → schedule  
  > Let's compare our timetables! I have math and art on Wednesday. Do you have music on Thursday?
- **warn** uk-word `teacher.segments[0].say` — "timetables" → schedule  
  > Hi, everyone! Ding-dong! Riko is calling Haru on the tablet. They want to compare timetables. オンラインで じかんわり くらべ！
- **warn** uk-word `teacher.segments[0].subtitleEn` — "timetables" → schedule  
  > Hi, everyone! Ding-dong! Riko is calling Haru on the tablet. They want to compare timetables.

### L0194 — My Favorite Subject
- **info** contraction `conversation.lines[4].en` — "is not" → "isn't"?

### L0195 — My Dream Timetable
- **warn** uk-word `title` — "Timetable" → schedule  
  > My Dream Timetable
- **warn** uk-word `school.expressions[1].en` — "timetable" → schedule  
  > This is my dream timetable.
- **warn** uk-word `tpr[1].en` — "timetable" → schedule  
  > Show your timetable.
- **warn** uk-word `teacherScript` — "timetable" → schedule  
  > まとめ！ ゆめの じかんわりを つくろう。「This is my dream timetable. I have music and P.E. on Friday.」
- **warn** uk-word `conversation.scene` — "timetables" → schedule  
  > Showing dream timetables
- **warn** uk-word `conversation.lines[0].en` — "timetable" → schedule  
  > This is my dream timetable. I have P.E. on Monday, Tuesday, and Wednesday!
- **warn** uk-word `conversation.lines[4].en` — "timetables" → schedule  
  > I like your timetables!
- **warn** uk-word `conversation.aiTask.starterEn` — "timetables" → schedule  
  > Let's share dream timetables! I have cooking on Monday. What do you have on Monday?
- **warn** uk-word `teacher.segments[0].say` — "timetable" → schedule  
  > Hello, timetable designers! Today is a special day. We'll make our dream timetables. Any subject you want! ゆめの じかんわりを つくろう！
- **warn** uk-word `teacher.segments[0].subtitleEn` — "timetable" → schedule  
  > Hello, timetable designers! Today is a special day. We'll make our dream timetables. Any subject you want!
- **warn** uk-word `teacher.segments[0].slide.items[0]` — "Timetable" → schedule  
  > My Dream Timetable
- **warn** uk-word `teacher.segments[1].say` — "timetable" → schedule  
  > Today's goal. Show it and say, This is my dream timetable. I have music and P.E. on Friday. いままでの ぶんを ぜんぶ つかうよ。
- **warn** uk-word `teacher.segments[1].subtitleEn` — "timetable" → schedule  
  > Today's goal. Show it and say, This is my dream timetable. I have music and P.E. on Friday.
- **warn** uk-word `teacher.segments[1].slide.items[0]` — "timetable" → schedule  
  > This is my dream timetable.
- **warn** uk-word `teacher.segments[6].say` — "timetable" → schedule  
  > Haru shows his. This is my dream timetable. I have P.E. on Monday, Tuesday, and Wednesday! Riko asks, What do you have on Thursday? I have …
- **warn** uk-word `teacher.segments[6].subtitleEn` — "timetable" → schedule  
  > Haru shows his. This is my dream timetable. I have P.E. on Monday, Tuesday, and Wednesday! Riko asks, What do you have on Thursday? I have …
- **warn** uk-word `teacher.segments[6].slide.items[0]` — "timetable" → schedule  
  > This is my dream timetable. I have P.E. on Monday, Tuesday, and Wednesday!
- **warn** uk-word `teacher.segments[7].say` — "timetables" → schedule  
  > Riko says, I have music and cooking on Friday. Kiko smiles. I like your timetables! すてき だね って ほめたよ。
- **warn** uk-word `teacher.segments[7].subtitleEn` — "timetables" → schedule  
  > Riko says, I have music and cooking on Friday. Kiko smiles. I like your timetables!
- **warn** uk-word `teacher.segments[7].slide.items[1]` — "timetables" → schedule  
  > I like your timetables!
- **warn** uk-word `teacher.segments[8].say` — "timetable" → schedule  
  > Here's the point. First, This is my dream timetable. Then, I have, a subject, on, a day. しょうかい して から、ようびと きょうかを いうよ。
- **warn** uk-word `teacher.segments[8].subtitleEn` — "timetable" → schedule  
  > Here's the point. First, This is my dream timetable. Then, I have, a subject, on, a day.
- **warn** uk-word `teacher.segments[8].slide.items[0]` — "timetable" → schedule  
  > This is my dream timetable.
- **warn** uk-word `teacher.segments[11].say` — "timetable" → schedule  
  > Let's move! Write Monday in the air. M, o, n... Show your timetable. Hold it up high! かいて、たかく みせてね。
- **warn** uk-word `teacher.segments[11].subtitleEn` — "timetable" → schedule  
  > Let's move! Write Monday in the air. M, o, n... Show your timetable. Hold it up high!
- **warn** uk-word `teacher.segments[11].slide.items[1]` — "timetable" → schedule  
  > Show your timetable.
- **warn** uk-word `teacher.segments[13].say` — "timetable" → schedule  
  > Speed challenge! Show your timetable! Give a big smile! Write Monday! Turn to your partner! Wonderful!
- **warn** uk-word `teacher.segments[13].subtitleEn` — "timetable" → schedule  
  > Speed challenge! Show your timetable! Give a big smile! Write Monday! Turn to your partner! Wonderful!
- **warn** uk-word `teacher.segments[13].slide.items[0]` — "timetable" → schedule  
  > Show your timetable.
- **warn** uk-word `teacher.segments[14].say` — "timetable" → schedule  
  > Repeat after me. This is my dream timetable.
- **warn** uk-word `teacher.segments[14].subtitleEn` — "timetable" → schedule  
  > Repeat after me. This is my dream timetable.
- **warn** uk-word `teacher.segments[14].slide.items[0]` — "timetable" → schedule  
  > This is my dream timetable.
- **warn** uk-word `teacher.segments[20].say` — "timetable" → schedule  
  > What a great review! You can show your dream timetable and say what you have on each day. ee と ea も ききわけられたね。Next, talk with Kiko! このあと キコち…
- **warn** uk-word `teacher.segments[20].subtitleEn` — "timetable" → schedule  
  > What a great review! You can show your dream timetable and say what you have on each day. Next, talk with Kiko! See you soon!
- **warn** uk-word `teacher.segments[20].slide.items[0]` — "timetable" → schedule  
  > This is my dream timetable.

### L0207 — My Week at School
- **warn** uk-word `teacher.segments[11].say` — "timetable" → schedule  
  > Let's move! Point to Tuesday on your timetable. Now play the drums! Boom, boom! かようびを ゆびさして、たいこを たたいて！
- **warn** uk-word `teacher.segments[11].subtitleEn` — "timetable" → schedule  
  > Let's move! Point to Tuesday on your timetable. Now play the drums! Boom, boom!
- **warn** uk-word `teacher.segments[20].say` — "timetable" → schedule  
  > Smooth sailing! You can talk about your timetable, your favorite subject, and what you're good at. And you can read ea and oa words. Next, …
- **warn** uk-word `teacher.segments[20].subtitleEn` — "timetable" → schedule  
  > Smooth sailing! You can talk about your timetable, your favorite subject, and what you're good at. And you can read ea and oa words. Next, …

### L0209 — Speech Rehearsal
- **info** please-command `conversation.aiTask.starterEn` — "Please say your speech." → Can you ~? / Let's ~. / plain imperative  
  > Let's practice! I'm your coach today. Please say your speech. You can do it!

### L0214 — Next to the Park
- **warn** sentence-length `conversation.lines[3].en` — 10 words > 8 (stage 1): "Next to the park, between the park and the bookstore."  
  > Next to the park, between the park and the bookstore. Got it!

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

### L0228 — He Is Good at Soccer
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0232 — We Don't Have a Zoo
- **warn** sentence-length `school.expressions[2].en` — 10 words > 8 (stage 1): "We have a station, but we don't have an airport."  
  > We have a station, but we don't have an airport.
- **warn** sentence-length `conversation.lines[2].en` — 10 words > 8 (stage 1): "We have a station, but we don't have an airport."  
  > We have a station, but we don't have an airport.
- **warn** sentence-length `conversation.aiTask.starterEn` — 13 words > 8 (stage 1): "We have a station in our town, but we don't have an airport."  
  > We have a station in our town, but we don't have an airport. Do you have an aquarium in your town?

### L0234 — Our Town Is Nice
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0235 — Town Guidebook
- **warn** sentence-length `school.expressions[1].en` — 10 words > 8 (stage 1): "We don't have a zoo, but we have a farm."  
  > We don't have a zoo, but we have a farm.
- **warn** sentence-length `conversation.lines[1].en` — 10 words > 8 (stage 1): "We don't have a zoo, but we have a farm."  
  > We don't have a zoo, but we have a farm.

### L0239 — Hero Speech Rehearsal
- **warn** uk-word `phonics.words[3]` — "football" → soccer (football = American football in the US)  
  > football
- **warn** uk-word `teacher.segments[10].say` — "Football" → soccer (football = American football in the US)  
  > Cow, boy. Cowboy! Foot, ball. Football! Find the vowel teams. ぼいんの チームを みつけよう。Your turn. Moonlight, playground, cowboy, football.
- **warn** uk-word `teacher.segments[10].say` — "football" → soccer (football = American football in the US)  
  > Cow, boy. Cowboy! Foot, ball. Football! Find the vowel teams. ぼいんの チームを みつけよう。Your turn. Moonlight, playground, cowboy, football.
- **warn** uk-word `teacher.segments[10].subtitleEn` — "Football" → soccer (football = American football in the US)  
  > Cow, boy. Cowboy! Foot, ball. Football! Find the vowel teams. Your turn. Moonlight, playground, cowboy, football.
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "football" → soccer (football = American football in the US)  
  > football
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

### L0283 — Bow or Shake Hands?
- **warn** sentence-length `conversation.lines[3].en` — 9 words > 8 (stage 1): "I fly in the sky and wave my wings!"  
  > I fly in the sky and wave my wings!

### L0285 — A Day Around the World
- **warn** sentence-length `conversation.lines[3].en` — 12 words > 8 (stage 1): "Children around the world are different, but we all like to play."  
  > Children around the world are different, but we all like to play.

### L0286 — I Recommend This Book
- **warn** sentence-length `conversation.lines[2].en` — 11 words > 8 (stage 1): "It's about a little turtle and its trip around the world."  
  > It's about a little turtle and its trip around the world.
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0287 — My Recommended Food
- **info** stiff-phrase `teacher.segments[4].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good! Kiss your fingers. Delicious! delicious は とても おいしい。Delicious!
- **info** stiff-phrase `teacher.segments[4].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good! Kiss your fingers. Delicious! Delicious!

### L0290 — Our Recommendation Book
- **info** please-command `conversation.lines[4].en` — "Please read our book, everyone." → Can you ~? / Let's ~. / plain imperative  
  > What a wonderful book! Please read our book, everyone.

### L0292 — Let's Save Water
- **warn** uk-word `phonics.words[1]` — "autumn" → fall  
  > autumn
- **warn** sentence-length `conversation.lines[1].en` — 11 words > 8 (stage 1): "We can turn off the water when we brush our teeth."  
  > Oops! We can turn off the water when we brush our teeth.
- **warn** uk-word `teacher.segments[10].say` — "Autumn" → fall  
  > Sauce. Autumn. Launch. Pause. Rocket launch! Three, two, one, go! Your turn. Sauce, autumn, launch, pause! ぜんぶ オーの おと。
- **warn** uk-word `teacher.segments[10].subtitleEn` — "Autumn" → fall  
  > Sauce. Autumn. Launch. Pause. Rocket launch! Three, two, one, go! Your turn. Sauce, autumn, launch, pause!
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "autumn" → fall  
  > autumn
- **warn** uk-word `teacher.segments[20].say` — "autumn" → fall  
  > Fantastic! You can say We can turn off the water, and Let's save water. You can read au words like sauce and autumn, too. Next, talk with H…
- **warn** uk-word `teacher.segments[20].subtitleEn` — "autumn" → fall  
  > Fantastic! You can say We can turn off the water, and Let's save water. You can read au words like sauce and autumn, too. Next, talk with H…
- **warn** uk-word `teacher.segments[20].slide.items[3]` — "autumn" → fall  
  > autumn

### L0295 — Save the Earth Idea Meeting
- **warn** sentence-length `conversation.lines[3].en` — 10 words > 8 (stage 1): "We can pick up trash at the beach every month."  
  > We can pick up trash at the beach every month.
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0297 — Earth Quiz Show
- **info** contraction `conversation.lines[4].en` — "What is" → "what's"?

### L0298 — Proposal Speech Rehearsal
- **warn** uk-word `phonics.words[1]` — "autumn" → fall  
  > autumn
- **warn** uk-word `teacher.segments[9].say` — "autumn" → fall  
  > Sound review! Draw, lawn, and autumn say aw. Flew says oo. たてに あけて オー、まるく して ウー。
- **warn** uk-word `teacher.segments[9].subtitleEn` — "autumn" → fall  
  > Sound review! Draw, lawn, and autumn say aw. Flew says oo.
- **warn** uk-word `teacher.segments[10].say` — "autumn" → fall  
  > Draw on the lawn in autumn. A bird flew by! Your turn. Draw, autumn, flew, lawn! lawn は しばふ。
- **warn** uk-word `teacher.segments[10].subtitleEn` — "autumn" → fall  
  > Draw on the lawn in autumn. A bird flew by! Your turn. Draw, autumn, flew, lawn!
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "autumn" → fall  
  > autumn

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

### L0325 — Thank-You Party
- **warn** sentence-length `school.expressions[2].en` — 9 words > 8 (stage 1): "We could do our best because you helped us."  
  > We could do our best because you helped us.
- **warn** sentence-length `conversation.lines[3].en` — 9 words > 8 (stage 1): "We could do our best because you helped us."  
  > We could do our best because you helped us. Thank you!

### L0329 — City of Dreams Review
- **warn** sentence-length `conversation.lines[3].en` — 11 words > 8 (stage 1): "I want to join the art club in junior high school."  
  > I want to join the art club in junior high school.

### L0331 — I Am a New Student.
- **warn** sentence-length `conversation.lines[0].en` — 9 words > 8 (stage 1): "Today we visit a junior high school entrance ceremony."  
  > Welcome to the Kingdom of English! Today we visit a junior high school entrance ceremony.
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

### L0342 — Where Is the Library?
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

### L0349 — How Was the Festival?
- **warn** uk-word `school.expressions[2].en` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `phonics.words[1]` — "autumn" → fall  
  > autumn
- **warn** uk-word `conversation.lines[3].en` — "autumn" → fall  
  > It was fun. We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[7].say` — "autumn" → fall  
  > Kiko asks, How was the school festival? I say, It was fun. We had a big stage show in autumn. And Birimo says, I drew a picture of all of y…
- **warn** uk-word `teacher.segments[7].subtitleEn` — "autumn" → fall  
  > Kiko asks, How was the school festival? I say, It was fun. We had a big stage show in autumn. And Birimo says, I drew a picture of all of y…
- **warn** uk-word `teacher.segments[7].slide.items[1]` — "autumn" → fall  
  > It was fun. We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[9].say` — "autumn" → fall  
  > Reading time! A W and A U say aw, like a big yawn. Saw, autumn. E W says oo. Drew, flew. オー と ウー だよ。
- **warn** uk-word `teacher.segments[9].subtitleEn` — "autumn" → fall  
  > Reading time! A W and A U say aw, like a big yawn. Saw, autumn. E W says oo. Drew, flew.
- **warn** uk-word `teacher.segments[10].say` — "autumn" → fall  
  > Now read in chunks. In autumn, I saw red leaves. I drew a picture. The leaves flew away. Saw, autumn, drew, flew! ゆっくり よもう。
- **warn** uk-word `teacher.segments[10].subtitleEn` — "autumn" → fall  
  > Now read in chunks. In autumn, I saw red leaves. I drew a picture. The leaves flew away. Saw, autumn, drew, flew!
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "autumn" → fall  
  > autumn
- **warn** uk-word `teacher.segments[16].say` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[16].subtitleEn` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[16].slide.items[0]` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[20].say` — "autumn" → fall  
  > Three cheers for you! You can ask, How was it? You can say, It was fun, and We had a stage show. And you read saw, autumn, drew and flew! N…
- **warn** uk-word `teacher.segments[20].subtitleEn` — "autumn" → fall  
  > Three cheers for you! You can ask, How was it? You can say, It was fun, and We had a stage show. And you read saw, autumn, drew and flew! N…

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

### L0421 — The Wind Is Blowing!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We left the Bustling Market, and now we're on wide green plains. Whoosh! Can you feel it? The wind is very strong here. We…

### L0423 — Look! She's Running!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today there's a race on the plains. Ready, set, go! Kiko is very fast. Haru is fast, too. When we talk about another perso…
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0425 — Windy Day Video Call
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today Ms. Emma is in the town, and you're on the plains. Let's call her on a video call. On a video call, your friend can'…

### L0427 — The Rabbit Is Behind the Rock
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! The animals on the plains are playing hide-and-seek. Can you find them? Look carefully. Today's sentence is: The rabbit is…

### L0428 — Between the Trees
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! We're at the edge of a forest. Listen. Tweet, tweet! A bird is singing. But where is it? Today's sentence is: The bird is bet…

### L0429 — What Is the Dog Doing?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! There's a big friendly dog on the farm. Its name is Pochi. Pochi is very busy today. Let's watch. To ask about an animal, …
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0430 — Animal Watching Report
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Congratulations, everyone! We watched so many animals this week. Now, let's give an animal watching report. A good report has three sentenc…

### L0431 — Every Day or Now?
- **warn** uk-word `phonics.words[0]` — "football" → soccer (football = American football in the US)  
  > football
- **warn** uk-word `teacherScript` — "Football" → soccer (football = American football in the US)  
  > Hello, everyone! The children on the plains are playing soccer. They ask us to join them. Let's play! Today we're learning two kinds of sen…
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! The children on the plains are playing soccer. They ask us to join them. Let's play! Today we're learning two kinds of sen…
- **warn** uk-word `teacher.segments[9].say` — "football" → soccer (football = American football in the US)  
  > Sound time! Two words can hold hands and become one. Foot plus ball, football! Play plus ground, playground!
- **warn** uk-word `teacher.segments[9].subtitleEn` — "football" → soccer (football = American football in the US)  
  > Sound time! Two words can hold hands and become one. Foot plus ball, football! Play plus ground, playground!
- **warn** uk-word `teacher.segments[10].say` — "Football" → soccer (football = American football in the US)  
  > Your turn. Football. Playground. Homework. Weekend. Home plus work, week plus end.
- **warn** uk-word `teacher.segments[10].subtitleEn` — "Football" → soccer (football = American football in the US)  
  > Your turn. Football. Playground. Homework. Weekend. Home plus work, week plus end.
- **warn** uk-word `teacher.segments[10].slide.items[0]` — "football" → soccer (football = American football in the US)  
  > football

### L0432 — Pass the Ball!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Today is a mini soccer game. Our team plays against the Plains team. In a game, players talk a lot. Today's sentences are: Pa…

### L0433 — Keep Going!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! There's a marathon on the plains today. Riko is running in it. It's a long race, and she's getting tired. Let's cheer for …
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Marathon. A very, very long race. Step, step, step, for a long time! Marathon!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Marathon. A very, very long race. Step, step, step, for a long time! Marathon!

### L0434 — Who's Winning?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! It's the tug-of-war contest on the plains. The red team and the blue team are pulling a long rope. Pull! Pull! Today's senten…

### L0435 — Sports Day on the Plains
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Congratulations, everyone! Today is Sports Day on the Plains, and you are the sports reporters. Here's your microphone! A reporter tells ev…

### L0436 — In the Picture
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we're visiting a painter's studio on the plains. There are so many paintings on the walls! Ms. Emma is pretending to…
- **info** please-command `conversation.lines[0].en` — "Please look at this picture." → Can you ~? / Let's ~. / plain imperative  
  > Welcome to my studio! I'm the painter here. Please look at this picture.

### L0438 — What's Happening?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we're reading the Plains Newspaper. There's a big photo on the front page. Let's talk about it. Today's sentence is:…

### L0439 — Spot the Difference
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Let's play Spot the Difference. Kiko has one picture, and Haru has another. They look the same, but there are five difference…
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0440 — Picture Talk Show
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Congratulations, everyone! It's the Picture Talk Show at the studio. Each of you will talk about one picture. A good picture talk has three…

### L0441 — A Rainy Afternoon
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Oh no, look outside. Drip, drop, drip, drop. It's raining on the plains. We can't play outside today. Today's sentence is:…
- **warn** canonical `conversation.lines[1].en` — "okay" → OK  
  > That's okay. We're staying inside. Let's play a game!
- **warn** canonical `teacher.segments[6].say` — "okay" → OK  
  > Let's listen. Riko sighs, Oh no. It's raining. We can't fly kites today. I say, That's okay. We're staying inside. Let's play a game! Haru …
- **warn** canonical `teacher.segments[6].subtitleEn` — "okay" → OK  
  > Let's listen. Riko sighs, Oh no. It's raining. We can't fly kites today. I say, That's okay. We're staying inside. Let's play a game! Haru …
- **warn** canonical `teacher.segments[6].slide.items[1]` — "okay" → OK  
  > That's okay. We're staying inside. Let's play a game!

### L0442 — Rainbow Over the Plains
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! The rain stopped. Let's go outside. Everything is wet and shiny. Look up! What can you see? Today's sentence is: Look! A rain…

### L0443 — Sunflower Field
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Wow, look at this field. It's full of yellow sunflowers! They're so big. Let's walk through the field. Today's sentence is…

### L0444 — Night on the Plains
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good evening, everyone! It's night on the plains. The campfire is warm, and the sky is very dark. Shh, let's talk quietly. Look up. Today's…
- **warn** canonical `conversation.lines[3].en` — "okay" → OK  
  > I wish for a big cake. Is that okay?
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Birimo closes his eyes. I wish for a big cake. Is that okay? Of course, Birimo. Now, it's late. Is anyone getting sleepy? Riko yawns. I'm g…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Birimo closes his eyes. I wish for a big cake. Is that okay? Of course, Birimo. Now, it's late. Is anyone getting sleepy? Riko yawns. I'm g…
- **warn** canonical `teacher.segments[7].slide.items[0]` — "okay" → OK  
  > I wish for a big cake. Is that okay?

### L0445 — Plains Diary
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We've had many adventures on the plains. Tonight, let's write a Plains Diary in the tent, and read it to each other. A dia…
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Okay, okay! Here's one for you, Haru.
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Kiko says, That's lovely, Riko! Haru, what about you? Haru reads, Today, I'm sitting next to Birimo. He's eating cookies again. I'm hungry …
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Kiko says, That's lovely, Riko! Haru, what about you? Haru reads, Today, I'm sitting next to Birimo. He's eating cookies again. I'm hungry …
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay, okay! Here's one for you, Haru.

### L0446 — Gesture Game
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Let's play the Gesture Game. One person acts something out without words. Everyone else guesses what they're doing. To gue…
- **warn** canonical `conversation.lines[3].en` — "Okay" → OK  
  > Okay, my turn. Guess what I'm doing!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Haru jumps up. Okay, my turn. Guess what I'm doing! He wiggles and spins. Riko asks, Are you dancing? Kiko, is he dancing? Haru says, Yes, …
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Haru jumps up. Okay, my turn. Guess what I'm doing! He wiggles and spins. Riko asks, Are you dancing? Kiko, is he dancing? Haru says, Yes, …
- **warn** canonical `teacher.segments[7].slide.items[0]` — "Okay" → OK  
  > Okay, my turn. Guess what I'm doing!

### L0447 — Who Is It?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! There's a big kite festival on the plains today. There are so many people! Let's play Who Is It? Describe one person, and you…

### L0448 — My Picture Sentences
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today you're the artist. Draw a picture of the plains, and write three sentences about it. Today's sentence is: In my pict…

### L0449 — Windy Plains Review
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! This is our last day on the Windy Plains. Let's have a goodbye picnic on the hill, and review everything. First, ask your …

### L0450 — World 15 Grand Review
- **warn** canonical `conversation.lines[4].en` — "okay" → OK  
  > I'm okay! I'm landing next to the sunflowers. Phew!
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Kiko cheers, Keep going, Birimo! Hold the string! You can do it! Birimo says, I'm okay! I'm landing next to the sunflowers. Phew! Then I sa…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Kiko cheers, Keep going, Birimo! Hold the string! You can do it! Birimo says, I'm okay! I'm landing next to the sunflowers. Phew! Then I sa…
- **warn** canonical `teacher.segments[7].slide.items[1]` — "okay" → OK  
  > I'm okay! I'm landing next to the sunflowers. Phew!

### L0452 — What Did You Do Yesterday?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good morning, everyone! We're at the entrance of the ruins. Before we go in, let's talk about yesterday. To ask about yesterday, say, What …

### L0453 — We Stopped and Looked
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, explorers! We're walking inside the ruins. It's a little dark, so we have flashlights. Suddenly, Riko says, Stop! There's a big pain…
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Oh no, I dropped my flashlight! Okay, I got it.
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Birimo giggles, And this boy hopped like a rabbit! Then, clunk! Haru says, Oh no, I dropped my flashlight! Okay, I got it. Phew!
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Birimo giggles, And this boy hopped like a rabbit! Then, clunk! Haru says, Oh no, I dropped my flashlight! Okay, I got it. Phew!
- **warn** canonical `teacher.segments[7].slide.items[1]` — "Okay" → OK  
  > Oh no, I dropped my flashlight! Okay, I got it.

### L0454 — Did You See That?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're in a long, dark passage in the ruins. Shh! What was that? Something moved! To ask a friend, say, Did you see that? S…
- **warn** canonical `conversation.lines[6].en` — "okay" → OK  
  > That's okay. Bye, little lizard!
- **warn** canonical `teacher.segments[7].slide.items[2]` — "okay" → OK  
  > That's okay. Bye, little lizard!

### L0455 — Ruins Diary, Day One
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Our first day at the ruins is over. Tonight, let's write a ruins diary in the tent. In a diary, we write about things that…

### L0456 — We Sang by the Fire
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good morning, everyone! Last night, we all made a campfire together in the plaza. Do you remember? Today's sentence is: We sang a song by t…

### L0457 — I Wrote a Letter
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Look, there's an old mailbox near the ruins. And it still works! Last night, Riko wrote a letter. Today's sentence is: I w…

### L0458 — Birimo Knew the Answer
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Today we found a big stone door. There's a riddle on it. I have many words, but I can't talk. You open me, but I'm not a d…

### L0459 — Where Did You Go Last Weekend?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Today we met the guide of the ruins. Ms. Emma will play the guide's daughter, Sana. Let's talk about last weekend. To ask,…
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we met the guide of the ruins. Ms. Emma will play the guide's daughter, Sana. Let's talk about last weekend. To ask,…

### L0460 — Weekend Talk
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're taking a break at the rest area of the ruins. Let's have a weekend talk. Today's sentences are: I went to the river.…

### L0461 — I Bought a Map
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! There's a souvenir shop near the gate of the ruins. Souvenirs are things you buy on a trip to remember it. Today's sentenc…

### L0462 — I Thought It Was a Ghost!
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last night, something funny happened. Haru woke up and saw something white moving in the dark. Was it a ghost? No! It was …

### L0463 — Who Taught You?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we visit a pot maker's workshop at the ruins. Ms. Emma will play the pot maker. Look at these beautiful old patterns…

### L0464 — It Wasn't Easy
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Look up. Can you see the top of the tower? There are one hundred stairs! Let's climb. Today's sentence is: It wasn't easy,…

### L0465 — A Day at the Ruins
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! What a busy day at the ruins! We climbed the tower, and at the top, we found an old key under a stone. Let's look back on …

### L0466 — Once Upon a Time
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we found a big stone with old words on it. It's a story! Many stories start with Once upon a time. It means long, lo…
- **warn** sentence-length `conversation.lines[3].en` — 13 words > 12 (stage 2): "He had a big castle and lots of gold, but he was lonely."  
  > He had a big castle and lots of gold, but he was lonely.

### L0467 — First, Then, After That
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Let's read more of the king's story. Stories happen in order, so we use special words to show the order. First. Then. Afte…
- **info** please-command `conversation.lines[0].en` — "Please read more!" → Can you ~? / Let's ~. / plain imperative  
  > What happened next? Please read more!

### L0468 — Finally, He Smiled
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we read the end of the king's story. The seed grew and grew into a big tree. Children came and played under it. The …

### L0469 — How Did He Feel?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Let's think about the king's feelings. To ask, say, How did he feel? Say it with me. How did he feel? Good! Felt is the pa…

### L0470 — Story Time at the Ruins
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Tonight is story time in the plaza of the ruins. Each of us will tell a short story. Use these story words. Once upon a ti…

### L0471 — Summer Stories
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we meet a traveler at the ruins. Birimo will play the traveler, Leo. Let's talk about summer vacation. To ask, say, …

### L0472 — Who Did You Go With?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Yesterday we talked about summer. Today, let's ask more questions to learn more. These are called follow-up questions. One…

### L0473 — Sounds Fun! Oh No!
- **warn** canonical `school.expressions[2].en` — "okay" → OK  
  > Are you okay now? ― Yes, I'm fine.
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Good listeners react to stories. Today, let's learn two reactions. For a happy story, say, Sounds fun! Say it with me. Sou…
- **warn** canonical `conversation.aiTask.targetExpressions[2]` — "okay" → OK  
  > Are you okay now?
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Good news? Big smile. Sounds fun! Bad news? Worried face. Oh no! What happened? Later, check on your friend. Are you okay…
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Good news? Big smile. Sounds fun! Bad news? Worried face. Oh no! What happened? Later, check on your friend. Are you okay…
- **warn** canonical `teacher.segments[8].slide.items[2]` — "okay" → OK  
  > Are you okay now? ― Yes, I'm fine.
- **warn** canonical `teacher.segments[16].say` — "okay" → OK  
  > Are you okay now?
- **warn** canonical `teacher.segments[16].subtitleEn` — "okay" → OK  
  > Are you okay now?
- **warn** canonical `teacher.segments[16].slide.items[0]` — "okay" → OK  
  > Are you okay now?
- **warn** canonical `teacher.segments[20].slide.items[2]` — "okay" → OK  
  > Are you okay now?

### L0474 — My Best Day Ever
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're at the lookout on top of the ruins. What a view! Let's talk about our best days ever. Today's sentence is: My best d…

### L0475 — Memory Interview
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today we're reporters. Let's do a memory interview. To ask about the time, say, When did you learn to ride a bike? Say it …
- **warn** canonical `conversation.lines[1].en` — "Okay" → OK  
  > Okay! Haru, when did you learn to ride a bike?
- **warn** canonical `teacher.segments[6].say` — "Okay" → OK  
  > Let's listen. Ms. Emma says, Riko, you're the interviewer. Riko says, Okay! Haru, when did you learn to ride a bike? Haru says, Last year. …
- **warn** canonical `teacher.segments[6].subtitleEn` — "Okay" → OK  
  > Let's listen. Ms. Emma says, Riko, you're the interviewer. Riko says, Okay! Haru, when did you learn to ride a bike? Haru says, Last year. …
- **warn** canonical `teacher.segments[6].slide.items[0]` — "Okay" → OK  
  > Okay! Haru, when did you learn to ride a bike?

### L0476 — Past Tense Quest
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Do you remember the key we found at the top of the tower? Today we found a treasure box for it! But the box has a password…

### L0477 — Picture Story
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Birimo drew a picture story with four pictures. Let's tell the story together. Picture one. Today's sentences are: Yesterd…

### L0478 — My Diary Page
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! In the treasure box, we found an old diary. A child wrote it long ago. Let's read it. Today, I helped my mother. We made b…

### L0479 — Ruins of Memory Review
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! This is our last tour of the Ruins of Memory. Let's look back at everything we did. Ask your friends, What did you do at t…

### L0481 — The Observatory on the Hill
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Welcome to World 17, Starfall Observatory! Remember the star map from the old diary? It brought us here, to a white buildi…

### L0482 — What Are You Going to Do?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good morning, everyone! We're in the observatory cafeteria. Mmm, I smell pancakes! Today, we have a day off. So let's talk about plans for …

### L0483 — I'm Going to Visit My Grandma
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're at the observatory gift shop. Look at all the star goods! There are star key chains, moon postcards, and planet stic…

### L0484 — Are You Going to Join Us?
- **warn** canonical `school.expressions[2].en` — "Okay" → OK  
  > Okay. Maybe next time!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! There's a poster on the wall. Star Party Tonight! Riko wants to invite everyone. How do we invite people? Today's sentence is…
- **warn** canonical `conversation.lines[4].en` — "Okay" → OK  
  > Okay. Maybe next time!
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Hot cocoa? Okay, I'm going to join you!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Haru yawns. No, I'm not. I'm going to sleep early. Riko says, Okay. Maybe next time! Then Birimo whispers, There's hot cocoa at the party. …
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Haru yawns. No, I'm not. I'm going to sleep early. Riko says, Okay. Maybe next time! Then Birimo whispers, There's hot cocoa at the party. …
- **warn** canonical `teacher.segments[7].slide.items[1]` — "Okay" → OK  
  > Okay. Maybe next time!
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Hot cocoa? Okay, I'm going to join you!

### L0485 — Our Plan for Tonight
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! The star party is tonight. Let's make a plan together. In World 16, we used order words for stories. First, then, after th…
- **warn** sentence-length `conversation.lines[2].en` — 13 words > 12 (stage 2): "Then, we're going to put on our jackets and go to the roof."  
  > Then, we're going to put on our jackets and go to the roof.

### L0486 — Will It Rain Tomorrow?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're in the weather room of the observatory. There are lots of screens and maps. Stargazers need good weather. If it rain…

### L0487 — Tomorrow's Weather
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good morning, everyone! Today, we're going to be weather reporters. Riko is going to stand in front of the map. Haru has the microphone. Ki…

### L0488 — It Won't Be Cold
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're getting ready for the star party. Kiko is worried. She thinks it will be cold on the roof. Let's check the thermomet…

### L0489 — I'll Help You
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! We need to carry the telescope to the roof. Oh, it's heavy! Who can help? Today's sentence is: I'll help you. Say it with me.…

### L0490 — Weather Report Show
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today is a big day. We're going to make a weather report show! Our show is going to be on the observatory television. Toda…
- **warn** stiff-phrase `teacher.segments[20].say` — "That's all for today" → That's it for today! / Great job today!  
  > Bravo, everyone! You can give a whole weather show with will and won't. Next, talk with Riko! リコちゃん と おはなし してね. That's all for today. See y…
- **warn** stiff-phrase `teacher.segments[20].subtitleEn` — "That's all for today" → That's it for today! / Great job today!  
  > Bravo, everyone! You can give a whole weather show with will and won't. Next, talk with Riko! That's all for today. See you!

### L0491 — The Moon and the Earth
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're in the planetarium. The room is dark, and the stars are on the ceiling. It's beautiful! Today, we're going to learn …

### L0492 — Planets in Space
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Look at these planet models. They're hanging from the ceiling. There are eight planets around our sun. Today, we're going to …

### L0493 — Life on a Space Station
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today, we're in the space station room. There's a model of a real space station. Astronauts live there for months! How do …

### L0494 — Shooting Stars
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good evening, everyone! It's dark, and we're on the roof. We're lying on our blankets. Tonight, there will be lots of shooting stars. Keep …

### L0495 — Space Quiz Night
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good evening, everyone! It's Space Quiz Night at the observatory! We have two teams. Red team and blue team. Today's sentence is: Which pla…

### L0496 — Someday I Will Fly
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Look at these photos on the wall. They're astronauts. They are floating and smiling. Do you want to go to space someday? T…

### L0497 — What Will You Be?
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Today, let's use our imagination. Close your eyes. It's twenty years from now. You're a grown-up! What are you doing? Today's…

### L0498 — Robots Will Help Us
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! We're in the Future Life room. Look! There's a robot folding laundry, and a model of a flying car. What will life be like …
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're in the Future Life room. Look! There's a robot folding laundry, and a model of a flying car. What will life be like …

### L0499 — Because It's Exciting
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Imagine you have a space rocket. You can go anywhere! Where do you want to go? And why? Today's sentence is: I want to go to …

### L0500 — Lesson 500 Star Party
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Congratulations, everyone! This is Lesson 500! Five hundred lessons! You studied so hard. Let's have a star party! Today's sentence is: Let…

### L0501 — Night Sky Story
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good evening, everyone! Tonight, we're going to listen to an old story about the stars. Long ago, there were no lights in the towns. The ni…

### L0502 — My Own Constellation
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Yesterday, we heard the story of the Sleepy Bear. Today, we're going to make our own constellations! Look at the dots on y…
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0503 — A Message to Space
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! The observatory is going to send a message into space. Maybe someone far away will read it! What do we want to say about E…
- **info** please-command `conversation.lines[4].en` — "Please write back to us!" → Can you ~? / Let's ~. / plain imperative  
  > Please write back to us! From the children of Earth.

### L0504 — I'll Call You Tomorrow
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Today, Birimo is going to play a boy who lives at the observatory. His name is Luka. Luka loves stars, and he wants to talk w…
- **warn** canonical `conversation.lines[4].en` — "okay" → OK  
  > At four o'clock. Is that okay?
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Haru asks, What time? Luka says, At four o'clock. Is that okay? Kiko says, Yes! Don't forget! And Luka says, I won't! See you tomorrow on t…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Haru asks, What time? Luka says, At four o'clock. Is that okay? Kiko says, Yes! Don't forget! And Luka says, I won't! See you tomorrow on t…
- **warn** canonical `teacher.segments[7].slide.items[1]` — "okay" → OK  
  > At four o'clock. Is that okay?

### L0505 — Future Fair
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Welcome to the Future Fair! Everyone has a booth and a poster. You're going to talk about your future plans. Today's sente…

### L0506 — Going-to Bingo
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Let's play Going-to Bingo! Look at your bingo card. Each box has a question. Ask your friends and find someone who says ye…

### L0507 — Weekend Plan Talk
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hi, everyone! The weekend is coming. Let's talk about our plans with friends. Today's sentence is: I'm going to go hiking. How about you? S…

### L0508 — A Note to Future Me
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Today, we're going to write a note to ourselves. Not for today, for the future! We'll put the notes in the observatory tim…

### L0509 — Starfall Observatory Review
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Good evening, everyone! This is our last night at the observatory. Let's have a goodbye stargazing party and look back at World 17. Today's…

### L0510 — World 17 Grand Review
- **warn** stiff-phrase `school.expressions[2].en` — "Please enjoy" → Have fun!  
  > I think it will be a wonderful show. Please enjoy!
- **warn** stiff-phrase `teacher.segments[15].say` — "Please enjoy" → Have fun!  
  > I think it will be a wonderful show. Please enjoy!
- **warn** stiff-phrase `teacher.segments[15].subtitleEn` — "Please enjoy" → Have fun!  
  > I think it will be a wonderful show. Please enjoy!
- **warn** stiff-phrase `teacher.segments[15].slide.items[0]` — "Please enjoy" → Have fun!  
  > I think it will be a wonderful show. Please enjoy!

### L0511 — Hello! Hello! Hello!
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Welcome to Echo Valley! Look at the mountains. Now listen. Hello! Hello... hello... hello! That's an echo. Today we compar…

### L0513 — The Longest River
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay. The bridge is the safest way!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Riko says, Wait, Haru. The water is deep there. Be careful! Birimo asks, Is this the deepest part? I say, Yes, it is. Let's walk on the bri…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Riko says, Wait, Haru. The water is deep there. Be careful! Birimo asks, Is this the deepest part? I say, Yes, it is. Let's walk on the bri…
- **warn** canonical `teacher.segments[7].slide.items[3]` — "Okay" → OK  
  > Okay. The bridge is the safest way!
- **warn** canonical `teacher.segments[18].slide.items[0]` — "Okay" → OK  
  > Okay. The bridge is the safest way!
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

### L0518 — Better and Best
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! We're in the valley orchard. Look at all the fruit trees! There are apples, oranges and peaches. Mmm. Which do I like? I like…
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay! I found the best apple in the orchard!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Birimo says, I like peaches the best! Look, they're so soft. I say, These apples are good, but those red ones look better. And Haru says, O…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Birimo says, I like peaches the best! Look, they're so soft. I say, These apples are good, but those red ones look better. And Haru says, O…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay! I found the best apple in the orchard!

### L0521 — As Big as a Bus
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay. I'll be as careful as a scientist!
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay. I'll be as careful as a scientist!

### L0522 — Not as Fast as a Horse
- **warn** sentence-length `conversation.lines[4].en` — 14 words > 12 (stage 2): "A turtle is not as fast as a rabbit, but it never gives up."  
  > Everyone has a special power. A turtle is not as fast as a rabbit, but it never gives up.
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Not as fast as means the horse is faster. And that's okay! Everyone has a special power.
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Not as fast as means the horse is faster. And that's okay! Everyone has a special power.
- **info** contraction `conversation.lines[4].en` — "is not" → "isn't"?

### L0523 — Quickly and Quietly
- **warn** canonical `school.expressions[2].en` — "Okay" → OK  
  > Speak softly, please. ― Okay.
- **warn** canonical `teacher.segments[16].say` — "Okay" → OK  
  > Speak softly, please. Okay.
- **warn** canonical `teacher.segments[16].subtitleEn` — "Okay" → OK  
  > Speak softly, please. Okay.
- **warn** canonical `teacher.segments[16].slide.items[0]` — "Okay" → OK  
  > Speak softly, please. ― Okay.

### L0527 — Careful, Not Careless!
- **warn** canonical `conversation.lines[2].en` — "Okay" → OK  
  > Okay. ... Whoa, it's moving!
- **warn** canonical `teacher.segments[6].say` — "Okay" → OK  
  > Let's listen. Birimo cheers, Wow, a rope bridge! Let's go! I say, Be careful! Don't be careless. Hold the rope with both hands. Haru steps …
- **warn** canonical `teacher.segments[6].subtitleEn` — "Okay" → OK  
  > Let's listen. Birimo cheers, Wow, a rope bridge! Let's go! I say, Be careful! Don't be careless. Hold the rope with both hands. Haru steps …
- **warn** canonical `teacher.segments[6].slide.items[2]` — "Okay" → OK  
  > Okay. ... Whoa, it's moving!

### L0528 — I Think So, Too
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! We're at the valley gift shop. Let's buy a souvenir for our friends at home. Here are two choices, a keychain and a postca…
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Same idea? I think so, too. Different idea? I don't think so, and give a reason. Different ideas are okay. Just say them …
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Same idea? I think so, too. Different idea? I don't think so, and give a reason. Different ideas are okay. Just say them …

### L0529 — Because It's Cuter
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. I like it better, then because, then the reason. Bigger, cuter, softer. Every choice is okay, and every reason is great!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. I like it better, then because, then the reason. Bigger, cuter, softer. Every choice is okay, and every reason is great!

### L0530 — Dogs or Cats?
- **warn** canonical `teacher.segments[17].say` — "okay" → OK  
  > Your turn! Dogs or cats? I like... better because they're... No pet? That's okay. Just tell me your idea!
- **warn** canonical `teacher.segments[17].subtitleEn` — "okay" → OK  
  > Your turn! Dogs or cats? I like... better because they're... No pet? That's okay. Just tell me your idea!

### L0533 — Compare Two Pictures
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! Let's play a game. Find the differences! Look at picture A and picture B. They look the same, but they're different. Look at …

### L0534 — My Comparison Sentences
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, writers! Today you'll write comparison sentences. Let's look at Haru's sentences. My bag is heavier than Riko's bag. Say it with me.…

### L0535 — Echo Valley Quiz Show
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Welcome to the Echo Valley Quiz Show! I'm your host, Ms. Emma. Are you ready? Here's the first question. What is the tallest animal? Say it…
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?
- **info** contraction `conversation.lines[2].en` — "What is" → "what's"?
- **info** contraction `conversation.lines[4].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0536 — The Biggest Echo
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hi, everyone! The echo spirit is still unhappy. Let's make a plan to cheer it up. Here's my idea. Let's make the biggest echo ever! Say it …
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Okay, everyone. One, two, three... Thank you, Echo!

### L0537 — Thank You, Echo
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Listen. Hello! Hello! Hello! The echo is big and cheerful again! The echo spirit is happy. Let's say thank you. You're the…
- **info** stiff-phrase `teacher.segments[12].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Whisper thank you. Very, very softly. Now, Wave goodbye. Big waves!
- **info** stiff-phrase `teacher.segments[12].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Whisper thank you. Very, very softly. Now, Wave goodbye. Big waves!

### L0539 — Echo Valley Review
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0541 — Tick, Tock, Click!
- **info** please-command `conversation.lines[5].en` — "Please use my tools and make something wonderful." → Can you ~? / Let's ~. / plain imperative  
  > Here's a note. "Welcome to my workshop! Please use my tools and make something wonderful. — The Inventor"

### L0543 — How Do You Use It?
- **warn** canonical `conversation.lines[3].en` — "Okay" → OK  
  > Okay. Push... then turn... Wow! A ball came out!
- **warn** sentence-length `conversation.aiTask.starterEn` — 14 words > 12 (stage 2): "I have a new music box, but I don't know how to use it."  
  > Hi! I'm Ms. Emma. I have a new music box, but I don't know how to use it. Can you help me? How do you use it?
- **warn** canonical `teacher.segments[6].slide.items[3]` — "Okay" → OK  
  > Okay. Push... then turn... Wow! A ball came out!

### L0544 — Like This?
- **warn** canonical `conversation.lines[4].en` — "okay" → OK  
  > Oh, okay. Like this? Is this right?
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Haru says, Oh, okay. Like this? Is this right? And I say, Yes, that's right! Good job. The arm is tight now. Riko says, Let's recheck the o…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Haru says, Oh, okay. Like this? Is this right? And I say, Yes, that's right! Good job. The arm is tight now. Riko says, Let's recheck the o…
- **warn** canonical `teacher.segments[7].slide.items[0]` — "okay" → OK  
  > Oh, okay. Like this? Is this right?
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Not sure? Just ask! Like this? Is this right? Mistakes are okay. Your friend can say, Not quite, and help you. Asking is …
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Not sure? Just ask! Like this? Is this right? Mistakes are okay. Your friend can say, Not quite, and help you. Asking is …

### L0545 — Tool Quiz
- **warn** canonical `conversation.lines[3].en` — "Okay" → OK  
  > Okay. My tool is used for drawing straight lines.
- **warn** canonical `teacher.segments[7].slide.items[0]` — "Okay" → OK  
  > Okay. My tool is used for drawing straight lines.
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0547 — Next, Cut Along the Line
- **warn** canonical `conversation.lines[4].en` — "okay" → OK  
  > That's okay. Cut slowly. Here's another piece.
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Birimo says, Oops! I cut too fast. It's not straight. I say, That's okay. Cut slowly. Here's another piece. Riko says, Then, glue the two p…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Birimo says, Oops! I cut too fast. It's not straight. I say, That's okay. Cut slowly. Here's another piece. Riko says, Then, glue the two p…
- **warn** canonical `teacher.segments[7].slide.items[1]` — "okay" → OK  
  > That's okay. Cut slowly. Here's another piece.

### L0551 — You Have to Wear Goggles
- **warn** canonical `conversation.lines[4].en` — "Okay" → OK  
  > Okay! My hair is tied back now.
- **warn** canonical `teacher.segments[6].say` — "Okay" → OK  
  > Let's listen. I say, Rule one. You have to wear goggles. Haru asks, Do I have to wear gloves, too? I say, Yes, you do. And you have to tie …
- **warn** canonical `teacher.segments[6].subtitleEn` — "Okay" → OK  
  > Let's listen. I say, Rule one. You have to wear goggles. Haru asks, Do I have to wear gloves, too? I say, Yes, you do. And you have to tie …
- **warn** canonical `teacher.segments[6].slide.items[3]` — "Okay" → OK  
  > Okay! My hair is tied back now.

### L0552 — You Must Not Touch It
- **info** stiff-phrase `teacher.segments[2].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hot. Very, very warm. Don't touch! hot は あつい. Hot!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hot. Very, very warm. Don't touch! Hot!

### L0553 — You Don't Have to Hurry
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Kiko is painting a toy guitar. She is very worried. Is it okay? I'm so slow! Let's tell her. You don't have to hurry. Say …
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. You have to means you need to. You don't have to means it's okay not to. No worries. Kind words make friends smile.
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. You have to means you need to. You don't have to means it's okay not to. No worries. Kind words make friends smile.

### L0554 — May I Use This?
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Okay. Thanks!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Then Riko asks, Haru, may I use the hammer, too? Haru says, Sorry, I'm using it now. You can use it after me. Riko says, Okay. Thanks! And …
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Then Riko asks, Haru, may I use the hammer, too? Haru says, Sorry, I'm using it now. You can use it after me. Riko says, Okay. Thanks! And …
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay. Thanks!

### L0556 — You Should Rest
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Okay. Thanks, everyone.
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Haru says, You shouldn't work too late. You can finish it tomorrow. I say, And you should drink some water. Kiko says, Okay. Thanks, everyo…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Haru says, You shouldn't work too late. You can finish it tomorrow. I say, And you should drink some water. Kiko says, Okay. Thanks, everyo…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay. Thanks, everyone.

### L0557 — Game Rules
- **warn** sentence-length `conversation.lines[3].en` — 13 words > 12 (stage 2): "If you land on a duck, you have to answer a question card."  
  > That's right. If you land on a duck, you have to answer a question card.
- **warn** sentence-length `conversation.aiTask.starterEn` — 13 words > 12 (stage 2): "I want to play your favorite game, but I don't know the rules."  
  > Hi! I'm Ms. Emma. I want to play your favorite game, but I don't know the rules. Can you teach me? What do I have to do first?
- **warn** canonical `teacher.segments[18].say` — "okay" → OK  
  > Quiz time! Kiko wants to look at the cards first. Is that okay? A, Yes, you have to look. B, No, you must not look. Think!
- **warn** canonical `teacher.segments[18].subtitleEn` — "okay" → OK  
  > Quiz time! Kiko wants to look at the cards first. Is that okay? A, Yes, you have to look. B, No, you must not look. Think!

### L0558 — It's Your Turn
- **warn** canonical `conversation.lines[0].en` — "Okay" → OK  
  > I rolled a two. One, two. Okay, whose turn is it?
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Aww. Okay. Birimo, it's your turn!
- **warn** canonical `teacher.segments[6].say` — "Okay" → OK  
  > Let's listen. Haru says, I rolled a two. One, two. Okay, whose turn is it? Kiko says, It's Riko's turn. Riko says, Here I go... Three! Haru…
- **warn** canonical `teacher.segments[6].subtitleEn` — "Okay" → OK  
  > Let's listen. Haru says, I rolled a two. One, two. Okay, whose turn is it? Kiko says, It's Riko's turn. Riko says, Here I go... Three! Haru…
- **warn** canonical `teacher.segments[6].slide.items[0]` — "Okay" → OK  
  > I rolled a two. One, two. Okay, whose turn is it?
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Riko counts. One, two, three... Oh, it's a squid square! Kiko says, Oh no! Go back two spaces. Riko says, Aww. Okay. Birimo, it's your turn!
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Riko counts. One, two, three... Oh, it's a squid square! Kiko says, Oh no! Go back two spaces. Riko says, Aww. Okay. Birimo, it's your turn!
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Aww. Okay. Birimo, it's your turn!

### L0559 — That's Not Fair!
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Uh-oh. There's a problem in our game. Birimo moved four spaces, but he rolled a three. Haru says, that's not fair! Let's c…
- **warn** canonical `conversation.lines[6].en` — "okay" → OK  
  > It's okay. It's just a game. Let's have fun!
- **warn** canonical `conversation.aiTask.targetExpressions[2]` — "okay" → OK  
  > It's okay. It's just a game.
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Riko says, Let's check the rules. You can move the number on the dice. Birimo says, Oh. Sorry. You're right. Let's play again. Haru says, I…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Riko says, Let's check the rules. You can move the number on the dice. Birimo says, Oh. Sorry. You're right. Let's play again. Haru says, I…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "okay" → OK  
  > It's okay. It's just a game. Let's have fun!
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. No shouting. Say, That's not fair, in a calm voice. Then, Let's check the rules. If you were wrong, say sorry. If someone…
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. No shouting. Say, That's not fair, in a calm voice. Then, Let's check the rules. If you were wrong, say sorry. If someone…
- **warn** canonical `teacher.segments[8].slide.items[2]` — "okay" → OK  
  > It's okay. It's just a game.
- **warn** canonical `teacher.segments[18].say` — "okay" → OK  
  > Quiz time! Your friend says, Sorry. You're right. What do you say? A, It's okay. It's just a game. B, That's not fair! Think!
- **warn** canonical `teacher.segments[18].subtitleEn` — "okay" → OK  
  > Quiz time! Your friend says, Sorry. You're right. What do you say? A, It's okay. It's just a game. B, That's not fair! Think!
- **warn** canonical `teacher.segments[19].say` — "okay" → OK  
  > It's A! It's okay. It's just a game. Let's have fun! You're a kind friend!
- **warn** canonical `teacher.segments[19].subtitleEn` — "okay" → OK  
  > It's A! It's okay. It's just a game. Let's have fun! You're a kind friend!
- **warn** canonical `teacher.segments[19].slide.items[0]` — "okay" → OK  
  > It's okay. It's just a game. Let's have fun!
- **warn** canonical `teacher.segments[20].slide.items[2]` — "okay" → OK  
  > It's okay. It's just a game.
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

### L0562 — My Dream Machine
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hi, everyone! Today, let's imagine our dream machines. Riko's machine is amazing. My machine can clean my room. Say it with me. My machine …
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Use can for what it does. Use has for its parts. Add also for one more thing. And remember, any idea is okay!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Use can for what it does. Use has for its parts. Add also for one more thing. And remember, any idea is okay!

### L0566 — Squeeze, Turn, Pull
- **warn** canonical `conversation.lines[2].en` — "Okay" → OK  
  > Okay. I'll squeeze it... turn it... pull it! Hmm, nothing.
- **warn** canonical `teacher.segments[6].slide.items[1]` — "Okay" → OK  
  > Okay. I'll squeeze it... turn it... pull it! Hmm, nothing.

### L0569 — Gadget Workshop Review
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Must is a strong rule. Have to, you need to. Should, a good idea. Don't have to, it's okay not to. must は ぜったい.
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Must is a strong rule. Have to, you need to. Should, a good idea. Don't have to, it's okay not to.

### L0571 — Drums on the Island
- **warn** canonical `teacher.segments[12].say` — "Okay" → OK  
  > Shh. Put your hand to your ear and listen. Do you hear it? Boom, boom! Okay, Play the drums!
- **warn** canonical `teacher.segments[12].subtitleEn` — "Okay" → OK  
  > Shh. Put your hand to your ear and listen. Do you hear it? Boom, boom! Okay, Play the drums!

### L0573 — I'd Love To, But…
- **warn** punctuation `title` — "…" → "..."  
  > I'd Love To, But…
- **warn** canonical `school.expressions[2].en` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Sometimes a friend invites us, but we can't go. That's okay. We can say no kindly. Listen. Would you like to play soccer? …
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Sometimes a friend invites us, but we can't go. That's okay. We can say no kindly. Listen. Would you like to play soccer? …
- **warn** canonical `conversation.lines[3].en` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[0].say` — "okay" → OK  
  > Hello again! What if a friend invites you, but you can't go? Don't worry. Saying no is okay. Let's learn to say it kindly!
- **warn** canonical `teacher.segments[0].subtitleEn` — "okay" → OK  
  > Hello again! What if a friend invites you, but you can't go? Don't worry. Saying no is okay. Let's learn to say it kindly!
- **warn** canonical `teacher.segments[0].slide.items[0]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[1].slide.items[2]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[6].say` — "okay" → OK  
  > Let's listen. Haru asks, Riko, would you like to go fishing this afternoon? Riko says, I'd love to, but I have to help my mom. Sorry! Haru …
- **warn** canonical `teacher.segments[6].subtitleEn` — "okay" → OK  
  > Let's listen. Haru asks, Riko, would you like to go fishing this afternoon? Riko says, I'd love to, but I have to help my mom. Sorry! Haru …
- **warn** canonical `teacher.segments[6].slide.items[2]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. First, say I'd love to. Then, give a reason. And when a friend says no to you, just say, That's okay!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. First, say I'd love to. Then, give a reason. And when a friend says no to you, just say, That's okay!
- **warn** canonical `teacher.segments[8].slide.items[1]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[12].say` — "okay" → OK  
  > Your friend says, That's okay! Give a thumbs-up. Then, Wave goodbye. See you next time!
- **warn** canonical `teacher.segments[12].subtitleEn` — "okay" → OK  
  > Your friend says, That's okay! Give a thumbs-up. Then, Wave goodbye. See you next time!
- **warn** canonical `teacher.segments[16].say` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[16].subtitleEn` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[16].slide.items[0]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[18].say` — "okay" → OK  
  > Quiz time! Your friend can't come to your party. What do you say? A, That's okay. Maybe next time! B, I'd love to, but I'm full. Think!
- **warn** canonical `teacher.segments[18].subtitleEn` — "okay" → OK  
  > Quiz time! Your friend can't come to your party. What do you say? A, That's okay. Maybe next time! B, I'd love to, but I'm full. Think!
- **warn** canonical `teacher.segments[18].slide.items[0]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[19].say` — "okay" → OK  
  > It's A! That's okay. Maybe next time! Kind words make everyone feel good. Well done!
- **warn** canonical `teacher.segments[19].subtitleEn` — "okay" → OK  
  > It's A! That's okay. Maybe next time! Kind words make everyone feel good. Well done!
- **warn** canonical `teacher.segments[19].slide.items[0]` — "okay" → OK  
  > That's okay. Maybe next time!
- **warn** canonical `teacher.segments[20].say` — "okay" → OK  
  > You did it! Now you can say no kindly, give a reason, and say, That's okay. Next, talk with Haru! ハルくん と おはなし してね. See you next time!
- **warn** canonical `teacher.segments[20].subtitleEn` — "okay" → OK  
  > You did it! Now you can say no kindly, give a reason, and say, That's okay. Next, talk with Haru! See you next time!
- **warn** canonical `teacher.segments[20].slide.items[2]` — "okay" → OK  
  > That's okay. Maybe next time!

### L0574 — Shall We Dance?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hi, everyone! Listen to the music. The island people are dancing in a big circle. Shall we dance? Say it with me. Shall we dance? Sure! Sha…
- **warn** canonical `conversation.lines[4].en` — "okay" → OK  
  > That's okay. Watch first. Step to the right, clap two times, and turn around.
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > But Riko says, Um... I'm a little shy. I don't know the steps. I tell her, That's okay. Watch first. Riko tries. Oh, it's easy! Shall we jo…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > But Riko says, Um... I'm a little shy. I don't know the steps. I tell her, That's okay. Watch first. Riko tries. Oh, it's easy! Shall we jo…
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Shall we means, let's do it together. Answer, Sure! or, Yes, let's! Feeling shy? It's okay to watch first.
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Shall we means, let's do it together. Answer, Sure! or, Yes, let's! Feeling shy? It's okay to watch first.

### L0577 — Color Festival
- **info** uk-word `teacherScript` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Hello, everyone! The island has a small festival museum. Let's learn about festivals around the world. Look at this picture. It's a color f…

### L0578 — Harvest Festival
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! In autumn, many countries have a harvest festival. Harvest means picking rice, fruit, and vegetables from the fields. At t…
- **warn** uk-word `conversation.scene` — "autumn" → fall  
  > At the island's autumn harvest festival
- **warn** uk-word `teacher.segments[0].say` — "autumn" → fall  
  > Hello, everyone! It's autumn on the island. Look at all the baskets! Pumpkins, rice, and sweet potatoes. Yum!
- **warn** uk-word `teacher.segments[0].subtitleEn` — "autumn" → fall  
  > Hello, everyone! It's autumn on the island. Look at all the baskets! Pumpkins, rice, and sweet potatoes. Yum!

### L0580 — Festivals Around the World Show
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Welcome to the Festivals Around the World Show! Today, you'll introduce a festival. Use this sentence. In some countries, …

### L0581 — Welcome to My House
- **info** please-command `conversation.lines[2].en` — "Please take off your shoes here." → Can you ~? / Let's ~. / plain imperative  
  > My aunt says, make yourself at home. Please take off your shoes here.

### L0582 — Would You Like Some Tea?
- **info** please-command `conversation.aiTask.starterEn` — "Please sit down." → Can you ~? / Let's ~. / plain imperative  
  > Hi! I'm Ms. Emma. Welcome! Please sit down. Would you like some tea? I also have cookies and fruit.
- **info** stiff-phrase `teacher.segments[4].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good to eat. Yum! Delicious.
- **info** stiff-phrase `teacher.segments[4].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very good to eat. Yum! Delicious.

### L0583 — Thank You for Having Me
- **info** stiff-phrase `teacher.segments[3].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Great. Very, very good! Thumbs up! Great.
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Great. Very, very good! Thumbs up! Great.

### L0584 — When I Was Little
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Yesterday, Grandpa Toma, my aunt's father, told us a story. When he was little, he was scared of drums. Now he plays the b…
- **warn** canonical `conversation.aiTask.starterEn` — "okay" → OK  
  > Hi! I'm Ms. Emma. When I was little, I was scared of the dark. Now I'm okay! How about you? When you were little, what were you scared of?
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. When I was little, then the past. Then say, Now I, to show how you changed. Everyone was scared of something. That's okay!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. When I was little, then the past. Then say, Now I, to show how you changed. Everyone was scared of something. That's okay!

### L0586 — If It Rains
- **warn** sentence-length `conversation.lines[5].en` — 14 words > 12 (stage 2): "If it rains, the food stands will move to the kitchen of the hall."  
  > Yes! If it rains, the food stands will move to the kitchen of the hall.

### L0587 — Getting Ready
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay! Don't tickle me!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Birimo jumps up. Me! I'll make star badges for everyone. Riko says, We have to measure everyone's arms first. Haru, stand still. Okay! Don'…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Birimo jumps up. Me! I'll make star badges for everyone. Riko says, We have to measure everyone's arms first. Haru, stand still. Okay! Don'…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay! Don't tickle me!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Have to means you must. Don't have to means it's not needed. It's okay not to. Reusing old shirts is smart!

### L0588 — Practice, Practice!
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! The show is in three days. We're practicing every day. Say it with me. We're practicing every day. Great! We use be plus i…
- **warn** canonical `conversation.lines[5].en` — "okay" → OK  
  > That's okay. It's not a competition. It's a celebration!
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Riko says, I'm singing, but I always forget the second line. Birimo says, And I'm dancing, but I always step on my own feet! Kiko smiles. T…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Riko says, I'm singing, but I always forget the second line. Birimo says, And I'm dancing, but I always step on my own feet! Kiko smiles. T…
- **warn** canonical `teacher.segments[7].slide.items[2]` — "okay" → OK  
  > That's okay. It's not a competition. It's a celebration!
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Am, is, are, plus ing, means right now. I'm singing. He's playing. And mistakes are okay. Just say, Let's try it one more…
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Am, is, are, plus ing, means right now. I'm singing. He's playing. And mistakes are okay. Just say, Let's try it one more…
- **warn** canonical `teacher.segments[19].say` — "okay" → OK  
  > It's A! He's dancing. Sometimes he steps on his feet, but that's okay. Fantastic!
- **warn** canonical `teacher.segments[19].subtitleEn` — "okay" → OK  
  > It's A! He's dancing. Sometimes he steps on his feet, but that's okay. Fantastic!

### L0589 — Why Don't We…?
- **warn** punctuation `title` — "…" → "..."  
  > Why Don't We…?
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay. Drums, then a song, then a dance. Action!
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Why Don't We…?
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Then Birimo says, Why don't we have a banana-eating contest? Ha ha! Maybe at lunch, Birimo. Not on stage! Okay. Drums, then a song, then a …
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Then Birimo says, Why don't we have a banana-eating contest? Ha ha! Maybe at lunch, Birimo. Not on stage! Okay. Drums, then a song, then a …
- **warn** canonical `teacher.segments[7].slide.items[2]` — "Okay" → OK  
  > Okay. Drums, then a song, then a dance. Action!
- **warn** canonical `teacher.segments[18].slide.items[0]` — "Okay" → OK  
  > Okay. Drums, then a song, then a dance. Action!

### L0592 — Stage 2 Review: Now and Then
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay, okay! I'm dancing now!

### L0595 — Stage 2 Review: Rules
- **warn** canonical `conversation.lines[6].en` — "Okay" → OK  
  > Okay! And we have to throw our trash in the bin.

### L0598 — Rehearsal Night
- **warn** canonical `school.grammar` — "okay" → OK  
  > Speak slowly. / Look at the audience. / It's okay to be nervous.（コツを つたえる・はげます）
- **warn** canonical `school.expressions[1].en` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacherScript` — "okay" → OK  
  > Good evening, everyone! Tonight is rehearsal night. Here are three tips for a great show. Speak slowly. Look at the audience. Say it with m…
- **warn** canonical `teacherScript` — "okay" → OK  
  > Good evening, everyone! Tonight is rehearsal night. Here are three tips for a great show. Speak slowly. Look at the audience. Say it with m…
- **warn** canonical `conversation.lines[5].en` — "okay" → OK  
  > It's okay to be nervous. Take a deep breath and smile.
- **warn** canonical `conversation.aiTask.targetExpressions[2]` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[1].say` — "okay" → OK  
  > Today's goal. Give tips to a friend. Speak slowly. Look at the audience. And cheer them up. It's okay to be nervous.
- **warn** canonical `teacher.segments[1].subtitleEn` — "okay" → OK  
  > Today's goal. Give tips to a friend. Speak slowly. Look at the audience. And cheer them up. It's okay to be nervous.
- **warn** canonical `teacher.segments[1].slide.items[1]` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Riko says, My hands are shaking. I'm so nervous. Kiko says, It's okay to be nervous. Take a deep breath and smile. What a kind friend!
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Riko says, My hands are shaking. I'm so nervous. Kiko says, It's okay to be nervous. Take a deep breath and smile. What a kind friend!
- **warn** canonical `teacher.segments[7].slide.items[1]` — "okay" → OK  
  > It's okay to be nervous. Take a deep breath and smile.
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Tips start with a verb. Speak. Look. Take. And when a friend is nervous, say, It's okay. Everyone gets nervous, even me!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Tips start with a verb. Speak. Look. Take. And when a friend is nervous, say, It's okay. Everyone gets nervous, even me!
- **warn** canonical `teacher.segments[8].slide.items[2]` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[15].say` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[15].subtitleEn` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[15].slide.items[0]` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[17].say` — "okay" → OK  
  > Your turn! A friend is nervous. Cheer up your friend in your own words. It's okay to be nervous...
- **warn** canonical `teacher.segments[17].subtitleEn` — "okay" → OK  
  > Your turn! A friend is nervous. Cheer up your friend in your own words. It's okay to be nervous...
- **warn** canonical `teacher.segments[17].slide.items[0]` — "okay" → OK  
  > It's okay to be nervous.
- **warn** canonical `teacher.segments[20].slide.items[1]` — "okay" → OK  
  > It's okay to be nervous.

### L0599 — Festival Eve
- **warn** sentence-length `conversation.lines[4].en` — 13 words > 12 (stage 2): "There's a tall tower on it, and many letters are flying around it."  
  > It's a new map! There's a tall tower on it, and many letters are flying around it.

### L0600 — World 20 Grand Festival
- **warn** canonical `teacher.segments[19].say` — "okay" → OK  
  > It's A! Would you like to dance with us? And it's always okay to say, Maybe next time. Perfect!
- **warn** canonical `teacher.segments[19].subtitleEn` — "okay" → OK  
  > It's A! Would you like to dance with us? And it's always okay to say, Maybe next time. Perfect!
- **info** please-command `conversation.lines[2].en` — "Please clap with us!" → Can you ~? / Let's ~. / plain imperative  
  > Next, we're going to sing a song. Please clap with us!

### L0601 — The Tower of Messages
- **info** stiff-phrase `teacher.segments[6].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Far away. Not near. Over the sea. Very, very far. Far away!
- **info** stiff-phrase `teacher.segments[6].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Far away. Not near. Over the sea. Very, very far. Far away!

### L0602 — Hello, This Is Haru
- **warn** canonical `teacher.segments[12].say` — "Okay" → OK  
  > Someone answers! Say hello in a friendly voice. Big smile! Okay, bye! Now, hang up the phone.
- **warn** canonical `teacher.segments[12].subtitleEn` — "Okay" → OK  
  > Someone answers! Say hello in a friendly voice. Big smile! Okay, bye! Now, hang up the phone.

### L0604 — Sorry, Wrong Number
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Ring, ring! Kiko picks up the phone. "Hello, may I speak to Tom?" Tom? There's no one named Tom in the tower. It's a wrong…
- **warn** canonical `conversation.lines[4].en` — "okay" → OK  
  > That's okay. Have a nice day!
- **warn** canonical `conversation.aiTask.targetExpressions[2]` — "okay" → OK  
  > That's okay.
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Haru says, Oh, sorry to bother you. Birimo says, That's okay. Have a nice day! Riko claps. Wow, Birimo! That was very polite.
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Haru says, Oh, sorry to bother you. Birimo says, That's okay. Have a nice day! Riko claps. Wow, Birimo! That was very polite.
- **warn** canonical `teacher.segments[7].slide.items[1]` — "okay" → OK  
  > That's okay. Have a nice day!
- **warn** canonical `teacher.segments[8].slide.items[2]` — "okay" → OK  
  > That's okay.
- **warn** canonical `teacher.segments[20].slide.items[2]` — "okay" → OK  
  > That's okay.

### L0605 — Are You Free on Saturday?
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Calling a good friend? Say, Hi, it's Kiko. A polite call? Say, This is Kiko. Busy on Saturday? That's okay. Say, I'd love…
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Calling a good friend? Say, Hi, it's Kiko. A polite call? Say, This is Kiko. Busy on Saturday? That's okay. Say, I'd love…
- **warn** canonical `teacher.segments[12].say` — "Okay" → OK  
  > Your friend says yes! Jump for joy! Yay! Now, make a big OK sign. Okay!
- **warn** canonical `teacher.segments[12].subtitleEn` — "Okay" → OK  
  > Your friend says yes! Jump for joy! Yay! Now, make a big OK sign. Okay!

### L0606 — Can You Hear Me?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! I went back to Festival Island for a few days. I'm helping my aunt. But we can still talk. Let's make a video call! At the…

### L0608 — The Screen Froze
- **warn** canonical `teacher.segments[11].say` — "Okay" → OK  
  > Let's move! Oh no, the screen froze. Freeze like a statue! Don't move! Okay. Now, tap the screen twice. Tap, tap!
- **warn** canonical `teacher.segments[11].subtitleEn` — "Okay" → OK  
  > Let's move! Oh no, the screen froze. Freeze like a statue! Don't move! Okay. Now, tap the screen twice. Tap, tap!

### L0612 — Could You Tell Her…?
- **warn** punctuation `title` — "…" → "..."  
  > Could You Tell Her…?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Yesterday, we took messages. Today, let's ask someone to give a message. When the person you want is out, you can say, Cou…
- **warn** canonical `conversation.lines[2].en` — "okay" → OK  
  > Oh, okay. Could you tell her to call me back?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Could You Tell Her…?
- **warn** canonical `teacher.segments[6].slide.items[0]` — "okay" → OK  
  > Oh, okay. Could you tell her to call me back?

### L0617 — I Was Taking a Bath
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Last night at seven, I called Haru. Ring, ring, ring. But he didn't answer. Why? This morning, Haru said, I was taking a b…

### L0620 — Who Ate the Pie?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Today is the big day. Let's solve the pie mystery! Detectives, let's check our notes. At seven, what was everyone doing? H…
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Captain Pip says, Sorry! My babies were so hungry. It's okay, Pip. Mystery solved! Let's bake a new pie for everyone, and for the birds, to…
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Captain Pip says, Sorry! My babies were so hungry. It's okay, Pip. Mystery solved! Let's bake a new pie for everyone, and for the birds, to…

### L0622 — Thanks for Your Email
- **warn** canonical `conversation.lines[5].en` — "Okay" → OK  
  > Okay. I'll write: Thanks for your email. Soon we're going to write to a pen pal!

### L0623 — Best Wishes
- **warn** punctuation `school.expressions[0].en` — missing end mark (. ! ?)  
  > See you soon. Best wishes, Riko
- **warn** punctuation `school.expressions[2].en` — missing end mark (. ! ?)  
  > Love, Kiko

### L0624 — Stay Safe Online
- **warn** canonical `conversation.lines[4].en` — "Okay" → OK  
  > Okay. Ms. Emma, can I talk to you? This message feels strange.
- **warn** canonical `teacher.segments[8].slide.items[0]` — "Okay" → OK  
  > Okay. Ms. Emma, can I talk to you? This message feels strange.

### L0626 — Emoji Talk
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! In messages, we often use emojis. Emojis are small pictures. But sometimes we don't know what they mean. Today, let's expl…

### L0627 — Phone, Video or Email?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! We learned three ways to connect: phone calls, video calls, and emails. Which way is the best? It depends! Today, let's co…
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Birimo says, I like letters by bird post! Slow, but exciting! Here's the point. Everyone has a different reason, and that's okay. Just say …
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Birimo says, I like letters by bird post! Slow, but exciting! Here's the point. Everyone has a different reason, and that's okay. Just say …

### L0636 — The Main Character
- **info** stiff-phrase `teacher.segments[5].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Mountain. Very, very high land. Up, up, to the top! Mountain!
- **info** stiff-phrase `teacher.segments[5].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Mountain. Very, very high land. Up, up, to the top! Mountain!

### L0644 — What Happened Next?
- **warn** stiff-phrase `conversation.lines[6].en` — "that's all for today" → That's it for today! / Great job today!  
  > He opened it very slowly. But that's all for today!
- **warn** stiff-phrase `teacher.segments[7].say` — "that's all for today" → That's it for today! / Great job today!  
  > Riko leans in. Can you tell me more? The door was very small, and the cat was waiting there. Haru asks, And then? He opened it very slowly.…
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — "that's all for today" → That's it for today! / Great job today!  
  > Riko leans in. Can you tell me more? The door was very small, and the cat was waiting there. Haru asks, And then? He opened it very slowly.…
- **warn** stiff-phrase `teacher.segments[7].slide.items[3]` — "that's all for today" → That's it for today! / Great job today!  
  > He opened it very slowly. But that's all for today!
- **warn** stiff-phrase `teacher.segments[18].say` — "That's all for today" → That's it for today! / Great job today!  
  > Quiz time! Your friend tells a story. You want more details. What do you say? A, Can you tell me more? B, That's all for today. Think!
- **warn** stiff-phrase `teacher.segments[18].subtitleEn` — "That's all for today" → That's it for today! / Great job today!  
  > Quiz time! Your friend tells a story. You want more details. What do you say? A, Can you tell me more? B, That's all for today. Think!

### L0651 — "Help!" Shouted the Boy
- **warn** canonical `teacher.segments[16].say` — "okay" → OK  
  > Your turn! A cat is stuck in a tree. Make a line for the cat. Help! cried the cat. Or, I'm okay, said the cat.
- **warn** canonical `teacher.segments[16].subtitleEn` — "okay" → OK  
  > Your turn! A cat is stuck in a tree. Make a line for the cat. Help! cried the cat. Or, I'm okay, said the cat.
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Shout. Say it very, very loud. Hands around your mouth. Hey! Shout!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Shout. Say it very, very loud. Hands around your mouth. Hey! Shout!

### L0652 — She Said, "Thank You."
- **info** uk-word `teacher.segments[4].say` — "toilet" → bathroom / restroom  
  > Ask. Say a question. Hand up. Excuse me, where is the toilet? Ask!
- **info** uk-word `teacher.segments[4].subtitleEn` — "toilet" → bathroom / restroom  
  > Ask. Say a question. Hand up. Excuse me, where is the toilet? Ask!

### L0654 — Picture Book Reading
- **warn** canonical `phonics.words[2]` — "okay" → OK  
  > Are you okay
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Today, some little children are coming to the library. You will read a picture book to them! Many stories start with four …
- **warn** canonical `teacher.segments[9].say` — "okay" → OK  
  > Sound time! Who are you? A who question. Your voice goes down. Look out! Strong and quick! Are you okay? A yes or no question. Your voice g…
- **warn** canonical `teacher.segments[9].subtitleEn` — "okay" → OK  
  > Sound time! Who are you? A who question. Your voice goes down. Look out! Strong and quick! Are you okay? A yes or no question. Your voice g…
- **warn** canonical `teacher.segments[9].slide.items[2]` — "okay" → OK  
  > Are you okay
- **warn** canonical `teacher.segments[10].say` — "okay" → OK  
  > Your turn. Be the moon. Who are you? Be the fox. Look out! Be kind. Are you okay?
- **warn** canonical `teacher.segments[10].subtitleEn` — "okay" → OK  
  > Your turn. Be the moon. Who are you? Be the fox. Look out! Be kind. Are you okay?
- **warn** canonical `teacher.segments[10].slide.items[2]` — "okay" → OK  
  > Are you okay

### L0656 — The Book That Won't Open
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! The big day is here. We have the key from the Feelings Map. Let's open the Book That Won't Open! Click. The golden lock op…
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0657 — My Story Ending
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Not sure? Say maybe. Maybe his mother is waiting for him. Every ending is okay. There's no wrong answer!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Not sure? Say maybe. Maybe his mother is waiting for him. Every ending is okay. There's no wrong answer!

### L0658 — Book Recommendation Card
- **warn** canonical `teacher.segments[4].say` — "okay" → OK  
  > Rating. How good is it? One star, okay. Five stars, wow! Rating.
- **warn** canonical `teacher.segments[4].subtitleEn` — "okay" → OK  
  > Rating. How good is it? One star, okay. Five stars, wow! Rating.

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

### L0670 — Float or Sink Report
- **warn** canonical `teacher.segments[0].say` — "okay" → OK  
  > Hello, everyone! It's report day! The posters are up, and the audience is ready. A little nervous? It's okay. Deep breath!
- **warn** canonical `teacher.segments[0].subtitleEn` — "okay" → OK  
  > Hello, everyone! It's report day! The posters are up, and the audience is ready. A little nervous? It's okay. Deep breath!

### L0675 — If-Then Science Quiz
- **warn** uk-word `teacher.segments[3].say` — "autumn" → fall  
  > Fall. Go down, down, down to the floor. Leaves fall in autumn. Fall!
- **warn** uk-word `teacher.segments[3].subtitleEn` — "autumn" → fall  
  > Fall. Go down, down, down to the floor. Leaves fall in autumn. Fall!

### L0677 — Paper Is Made from Trees
- **info** contraction `conversation.lines[3].en` — "What is" → "what's"?
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0678 — Rice Is Grown in Japan
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Behind the Green Laboratory, there's a small rice field. Dr. Moss grows rice here every year. Rice is grown in many parts …

### L0680 — What Is It Made Of?
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0683 — Butterflies Change
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Look at the lemon tree in the greenhouse. There's a little green caterpillar (いもむし) on a leaf. Dr. Moss says it will chang…

### L0699 — How Many Times?
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. One time is once. Two times is twice. Then three times, ten times, many times! Zero times? Never. That's okay, too!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. One time is once. Two times is twice. Then three times, ten times, many times! Zero times? Never. That's okay, too!

### L0700 — Experience Bingo
- **warn** canonical `teacher.segments[7].say` — "okay" → OK  
  > Haru asks, Birimo, have you ever swum in the sea? Birimo says, No, I haven't. I can't swim yet! That's okay, Birimo. Maybe someday! Then Ri…
- **warn** canonical `teacher.segments[7].subtitleEn` — "okay" → OK  
  > Haru asks, Birimo, have you ever swum in the sea? Birimo says, No, I haven't. I can't swim yet! That's okay, Birimo. Maybe someday! Then Ri…

### L0702 — I Missed the Train!
- **warn** uk-word `vocab[2].en` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacherScript` — "timetable" → schedule  
  > Hello, everyone! We're still at Sky Harbor. Haru went to buy snacks for everyone. But when he came back, the train doors closed! The train …
- **warn** uk-word `conversation.scene` — "timetable" → schedule  
  > The friends miss the train and check the timetable
- **warn** uk-word `conversation.lines[3].en` — "timetable" → schedule  
  > Look at the timetable. Trains come every twenty minutes.
- **warn** uk-word `teacher.segments[1].say` — "timetable" → schedule  
  > Today's goal. When you're too late, say, I missed the train! When's the next one? Then find the answer on the timetable.
- **warn** uk-word `teacher.segments[1].subtitleEn` — "timetable" → schedule  
  > Today's goal. When you're too late, say, I missed the train! When's the next one? Then find the answer on the timetable.
- **warn** uk-word `teacher.segments[4].say` — "Timetable" → schedule  
  > Timetable. A list of train times. Ten o'clock, ten twenty, ten forty. Timetable!
- **warn** uk-word `teacher.segments[4].subtitleEn` — "Timetable" → schedule  
  > Timetable. A list of train times. Ten o'clock, ten twenty, ten forty. Timetable!
- **warn** uk-word `teacher.segments[4].slide.items[0]` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacher.segments[7].say` — "timetable" → schedule  
  > Kiko says, Look at the timetable. Trains come every twenty minutes. And I say, Don't worry. The next one comes in twenty minutes. Let's wai…
- **warn** uk-word `teacher.segments[7].subtitleEn` — "timetable" → schedule  
  > Kiko says, Look at the timetable. Trains come every twenty minutes. And I say, Don't worry. The next one comes in twenty minutes. Let's wai…
- **warn** uk-word `teacher.segments[7].slide.items[0]` — "timetable" → schedule  
  > Look at the timetable. Trains come every twenty minutes.

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

### L0724 — Describe and Draw
- **warn** canonical `conversation.lines[1].en` — "Okay" → OK  
  > Okay! I have my pencil.
- **warn** canonical `teacher.segments[6].say` — "Okay" → OK  
  > Listen. Riko says, Let's play Describe and Draw. I'll describe, and you draw, Birimo. Birimo says, Okay! I have my pencil.
- **warn** canonical `teacher.segments[6].subtitleEn` — "Okay" → OK  
  > Listen. Riko says, Let's play Describe and Draw. I'll describe, and you draw, Birimo. Birimo says, Okay! I have my pencil.
- **warn** canonical `teacher.segments[6].slide.items[1]` — "Okay" → OK  
  > Okay! I have my pencil.

### L0726 — It Might Be a Bat
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Not sure? Use might. It might be a bat. It might be the wind. Two guesses are okay!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Not sure? Use might. It might be a bat. It might be the wind. Two guesses are okay!

### L0727 — It Must Be a Key
- **info** contraction `conversation.lines[1].en` — "What is" → "what's"?

### L0728 — It Can't Be a Ghost
- **warn** canonical `teacher.segments[0].say` — "okay" → OK  
  > Hello, brave friends! Listen. Whoooo! Hmm, Birimo is a little scared. That's okay. We're all here together. Let's help him and find out wha…
- **warn** canonical `teacher.segments[0].subtitleEn` — "okay" → OK  
  > Hello, brave friends! Listen. Whoooo! Hmm, Birimo is a little scared. That's okay. We're all here together. Let's help him and find out wha…
- **info** stiff-phrase `teacher.segments[9].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! More ive words. Protect, protective. Mass, massive. Just add ive. Massive means very, very big!
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! More ive words. Protect, protective. Mass, massive. Just add ive. Massive means very, very big!

### L0736 — It Has Four Legs
- **warn** capitalization `teacher.segments[9].subtitleEn` — lowercase "i" → "I"  
  > Sound time! Listen to the vowels. Silent, i like eye. Strange, a like day. Scared, like hair. Clever, short e, like egg.
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
- **warn** canonical `phonics.words[2]` — "Okay" → OK  
  > Okay!
- **warn** canonical `phonics.words[3]` — "okay" → OK  
  > Well, okay…
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > Well, okay…
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Last time, we said, The case is closed! Great detective work! Today, we walk out of the cave and follow the echoes. Look! …
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
- **warn** canonical `teacher.segments[10].say` — "Okay" → OK  
  > Okay! Up and happy. Well, okay... Down and slow. Draw the arrow with your hand. Your turn! Really?! Oh, really... Okay! Well, okay...
- **warn** canonical `teacher.segments[10].subtitleEn` — "Okay" → OK  
  > Okay! Up and happy. Well, okay... Down and slow. Draw the arrow with your hand. Your turn! Really?! Oh, really... Okay! Well, okay...
- **warn** punctuation `teacher.segments[10].subtitleEn` — use one ! or ?  
  > Okay! Up and happy. Well, okay... Down and slow. Draw the arrow with your hand. Your turn! Really?! Oh, really... Okay! Well, okay...
- **warn** canonical `teacher.segments[10].slide.items[0]` — "Okay" → OK  
  > Okay
- **warn** canonical `teacher.segments[10].slide.items[1]` — "Okay" → OK  
  > Okay!
- **warn** canonical `teacher.segments[10].slide.items[2]` — "okay" → OK  
  > Well, okay…
- **warn** punctuation `teacher.segments[10].slide.items[2]` — "…" → "..."  
  > Well, okay…
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
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. We all have things we're not good at. That's okay! Say, I'm not good at dancing, but I'll try!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. We all have things we're not good at. That's okay! Say, I'm not good at dancing, but I'll try!
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
- **warn** canonical `conversation.lines[3].en` — "Okay" → OK  
  > Okay. Who is that? Is it the dragon? … I did it!
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > Okay. Who is that? Is it the dragon? … I did it!
- **info** stiff-phrase `teacherScript` — "do your best" → You can do it! (Do your best is OK)  
  > Hello, everyone! Last time, we said, Riko plays the princess. Birimo plays the dragon. Today is our first practice. Riko holds the script. …

### L0757 — Excited or Exciting?
- **error** grammar-habit `conversation.lines[1].en` — "I'm exciting" → excited  
  > I'm exciting, too!
- **warn** grammar-habit `teacherScript` — "I'm exciting" → excited (teacher script: intentional?)  
  > Hello, everyone! Last time, we said, I'm nervous. Today, we read the exciting part of the play. Listen to two words. Excited. Exciting. The…
- **warn** grammar-habit `teacher.segments[6].say` — "I'm exciting" → excited (teacher script: intentional?)  
  > Haru says, The dragon scene is coming! The play is exciting. I'm excited! And Birimo says, I'm exciting, too!
- **warn** grammar-habit `teacher.segments[6].subtitleEn` — "I'm exciting" → excited (teacher script: intentional?)  
  > Haru says, The dragon scene is coming! The play is exciting. I'm excited! And Birimo says, I'm exciting, too!
- **warn** grammar-habit `teacher.segments[6].slide.items[1]` — "I'm exciting" → excited (teacher script: intentional?)  
  > I'm exciting, too!
- **warn** grammar-habit `teacher.segments[18].say` — "I'm exciting" → excited (teacher script: intentional?)  
  > Quiz! Birimo is ready for the show. What does he say? A, I'm exciting! B, I'm excited! Think!
- **warn** grammar-habit `teacher.segments[18].subtitleEn` — "I'm exciting" → excited (teacher script: intentional?)  
  > Quiz! Birimo is ready for the show. What does he say? A, I'm exciting! B, I'm excited! Think!

### L0758 — Bored or Boring?
- **info** stiff-phrase `teacher.segments[18].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz! The king's speech is very, very long. A, The speech is boring. B, The speech is bored. Think!
- **info** stiff-phrase `teacher.segments[18].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz! The king's speech is very, very long. A, The speech is boring. B, The speech is bored. Think!

### L0759 — How Do You Feel Now?
- **warn** punctuation `conversation.lines[5].en` — use one ! or ?  
  > Really?! Maybe the echoes are coming back!

### L0760 — Feelings Charades
- **warn** canonical `teacherScript` — "Okay" → OK  
  > Hello, everyone! Last time, we said, I feel proud of myself. Today, we play a game called Feelings Charades. One actor shows a feeling with…
- **warn** punctuation `conversation.lines[3].en` — "…" → "..."  
  > Now Birimo. Hmm… you look bored.
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > Now Birimo. Hmm… you look bored.

### L0761 — I Decided to Write a Play
- **warn** canonical `teacher.segments[2].say` — "Okay" → OK  
  > Decide. Hmm, this one or that one? Okay, this one! Decide!
- **warn** canonical `teacher.segments[2].subtitleEn` — "Okay" → OK  
  > Decide. Hmm, this one or that one? Okay, this one! Decide!
- **warn** punctuation `teacher.segments[5].subtitleEn` — "…" → "..."  
  > Narrator. The person who tells the story. Once upon a time… Narrator!

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
  > Three dots, a long pause. Oh… thank you, said the dragon. Said comes first? The comma comes first. The dragon said, Please stay. Your turn!
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
- **warn** canonical `conversation.lines[3].en` — "Okay" → OK  
  > Okay. I'm free! I'm free!
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > Listen! The echo said, Free… free… It's a little louder now!
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Kiko says, She feels really happy. She was in the dark tower for a long time! Riko tries again. I'm free! I'm free! Listen. The echo says, …
- **warn** canonical `teacher.segments[7].slide.items[1]` — "Okay" → OK  
  > Okay. I'm free! I'm free!
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
  > Hi, it's Lulu the rabbit! I'm on the stage, and you're at the back. Hello… can you hear me?
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
- **warn** canonical `conversation.lines[2].en` — "Okay" → OK  
  > Okay. I'm walking to the center… and I'm looking up. The dragon must be up there!
- **warn** punctuation `conversation.lines[2].en` — "…" → "..."  
  > Okay. I'm walking to the center… and I'm looking up. The dragon must be up there!
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > Haru says, Okay. I'm walking to the center… and I'm looking up. The dragon must be up there! Birimo says, Kiko, you exit to the right. Not …
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > Haru says, Okay. I'm walking to the center… and I'm looking up. The dragon must be up there! Birimo says, Kiko, you exit to the right. Not …
- **warn** punctuation `teacher.segments[7].subtitleEn` — "…" → "..."  
  > Haru says, Okay. I'm walking to the center… and I'm looking up. The dragon must be up there! Birimo says, Kiko, you exit to the right. Not …
- **warn** canonical `teacher.segments[7].slide.items[0]` — "Okay" → OK  
  > Okay. I'm walking to the center… and I'm looking up. The dragon must be up there!
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > Okay. I'm walking to the center… and I'm looking up. The dragon must be up there!
- **warn** punctuation `teacher.segments[12].subtitleEn` — "…" → "..."  
  > Kneel down slowly. Slowly… Now stand up, and exit to the right.

### L0770 — Scene Practice
- **warn** punctuation `phonics.words[3]` — "…" → "..."  
  > "Oh… thank you," said the dragon.
- **warn** punctuation `conversation.lines[2].en` — "…" → "..."  
  > Oh… thank you.
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Listen! The echoes said, Friend… friend… They're getting louder!
- **warn** punctuation `conversation.aiTask.starterEn` — "…" → "..."  
  > Knock, knock. I'm the dragon, alone in my tower. Hmm… who's there?
- **warn** punctuation `teacher.segments[6].subtitleEn` — "…" → "..."  
  > Knock, knock. Birimo, the friendly dragon, says, Someone is knocking. Who's there? Riko says, It's me, your friend! We brought the music bo…
- **warn** punctuation `teacher.segments[6].slide.items[2]` — "…" → "..."  
  > Oh… thank you.
- **warn** punctuation `teacher.segments[10].subtitleEn` — "…" → "..."  
  > Now, the marks. Who's there? asked the dragon. The question mark goes inside. Oh… thank you, said the dragon. A long pause. Your turn!
- **warn** punctuation `teacher.segments[10].slide.items[5]` — "…" → "..."  
  > "Oh… thank you," said the dragon.

### L0772 — Dress Rehearsal
- **warn** canonical `teacher.segments[4].say` — "okay" → OK  
  > Mistake. Oops, something went wrong. That's okay! Everyone makes mistakes. Mistake!
- **warn** canonical `teacher.segments[4].subtitleEn` — "okay" → OK  
  > Mistake. Oops, something went wrong. That's okay! Everyone makes mistakes. Mistake!
- **warn** canonical `teacher.segments[19].say` — "okay" → OK  
  > Bravo! You can say, It's fun to, and, It's hard to. And mistakes are okay. Keep going! Next, go and talk with Birimo! See you!
- **warn** canonical `teacher.segments[19].subtitleEn` — "okay" → OK  
  > Bravo! You can say, It's fun to, and, It's hard to. And mistakes are okay. Keep going! Next, go and talk with Birimo! See you!

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
- **warn** canonical `phonics.words[0]` — "okay" → OK  
  > Well, okay…
- **warn** punctuation `phonics.words[0]` — "…" → "..."  
  > Well, okay…
- **warn** punctuation `phonics.words[2]` — "…" → "..."  
  > "Wait… what's that sound?" asked the knight.
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last time, we said, Narrator: One day, a fox found a magic hat. Today, we'll play Story Circle. We sit in a circle. Each p…
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
  > Hello! I'm Echo. I love stories. Let's make one together, one word at a time. Once…
- **warn** punctuation `conversation.aiTask.starterEn` — missing end mark (. ! ?)  
  > Hello! I'm Echo. I love stories. Let's make one together, one word at a time. Once…
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
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Sound review! Voice down means not so happy. Well, okay… Dots mean a long pause. Wait… what's that sound? asked the knight. Spooky!
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Sound review! Voice down means not so happy. Well, okay… Dots mean a long pause. Wait… what's that sound? asked the knight. Spooky!
- **warn** punctuation `teacher.segments[8].subtitleEn` — "…" → "..."  
  > Sound review! Voice down means not so happy. Well, okay… Dots mean a long pause. Wait… what's that sound? asked the knight. Spooky!
- **warn** canonical `teacher.segments[8].slide.items[1]` — "okay" → OK  
  > Well, okay…
- **warn** punctuation `teacher.segments[8].slide.items[1]` — "…" → "..."  
  > Well, okay…
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
  > Hi, it's Toto! I've practiced morning exercises for two years. What's your hobby? How long have you practiced?

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

### L0803 — It's OK to Feel Sad
- **warn** punctuation `conversation.aiTask.starterEn` — "…" → "..."  
  > Hi… I'm Toto. My best friend Mimi moved away. I feel so sad today.

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

### L0818 — You Can See It in Spring
- **warn** uk-word `school.expressions[2].en` — "autumn" → fall  
  > When is the best time to visit? ― I think autumn is the best. The leaves turn red.
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Last time, we said, A furoshiki is used for wrapping things. Today, our new friends ask, When is the best time to visit Ja…
- **warn** uk-word `conversation.lines[3].en` — "autumn" → fall  
  > I think autumn is the best. The leaves turn red.
- **warn** uk-word `conversation.aiTask.targetExpressions[2]` — "autumn" → fall  
  > When is the best time to visit? ― I think autumn is the best. The leaves turn red.
- **warn** uk-word `teacher.segments[3].say` — "autumn" → fall  
  > Season. Spring, summer, autumn, winter. There are four seasons. Hold up four fingers. Season!
- **warn** uk-word `teacher.segments[3].subtitleEn` — "autumn" → fall  
  > Season. Spring, summer, autumn, winter. There are four seasons. Hold up four fingers. Season!
- **warn** uk-word `teacher.segments[4].say` — "autumn" → fall  
  > Leaf. One green part of a tree. In autumn, it turns red or yellow. Leaf!
- **warn** uk-word `teacher.segments[4].subtitleEn` — "autumn" → fall  
  > Leaf. One green part of a tree. In autumn, it turns red or yellow. Leaf!
- **warn** uk-word `teacher.segments[7].say` — "autumn" → fall  
  > Kiko says, I think autumn is the best. The leaves turn red. Birimo says, And in winter, you can eat hot noodles! Every season is noodle sea…
- **warn** uk-word `teacher.segments[7].subtitleEn` — "autumn" → fall  
  > Kiko says, I think autumn is the best. The leaves turn red. Birimo says, And in winter, you can eat hot noodles! Every season is noodle sea…
- **warn** uk-word `teacher.segments[7].slide.items[0]` — "autumn" → fall  
  > I think autumn is the best. The leaves turn red.
- **warn** uk-word `teacher.segments[12].say` — "Autumn" → fall  
  > Autumn! Catch a falling leaf. Got it! Winter! Build a little snowman. Pat, pat.
- **warn** uk-word `teacher.segments[12].subtitleEn` — "Autumn" → fall  
  > Autumn! Catch a falling leaf. Got it! Winter! Build a little snowman. Pat, pat.
- **warn** uk-word `teacher.segments[16].say` — "autumn" → fall  
  > I think autumn is the best. The leaves turn red.
- **warn** uk-word `teacher.segments[16].subtitleEn` — "autumn" → fall  
  > I think autumn is the best. The leaves turn red.
- **warn** uk-word `teacher.segments[16].slide.items[0]` — "autumn" → fall  
  > I think autumn is the best. The leaves turn red.
- **warn** uk-word `teacher.segments[17].slide.items[0]` — "autumn" → fall  
  > I think autumn is the best. The leaves turn red.

### L0821 — I Think… Because…
- **warn** punctuation `title` — "…" → "..."  
  > I Think… Because…
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Last time, we said, Welcome to Japan! Let me show you around. Our video was a big hit on the bridge! Today, we talk about …
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Think… Because…

### L0822 — In My Opinion
- **info** stiff-phrase `teacher.segments[5].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very tasty! Mmm, yum! Delicious!
- **info** stiff-phrase `teacher.segments[5].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Delicious. Very, very tasty! Mmm, yum! Delicious!

### L0823 — Do You Agree?
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Different opinions are okay! Say, I see your point. Then say but, and your idea. Kind words keep friends happy.
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Different opinions are okay! Say, I see your point. Then say but, and your idea. Kind words keep friends happy.

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
- **warn** canonical `teacher.segments[8].say` — "okay" → OK  
  > Here's the point. Friends can be different. That's okay! Different is interesting. Taught is the past of teach.
- **warn** canonical `teacher.segments[8].subtitleEn` — "okay" → OK  
  > Here's the point. Friends can be different. That's okay! Different is interesting. Taught is the past of teach.

### L0834 — Rehearsal on the Bridge
- **warn** punctuation `conversation.lines[0].en` — "…" → "..."  
  > Hello, everyone. My speech is about… um… friendship.

### L0836 — Letters Across the Bridge
- **warn** punctuation `school.expressions[2].en` — missing end mark (. ! ?)  
  > Please write back soon. ― Your friend, Haru
- **info** please-command `conversation.lines[3].en` — "Please write back soon." → Can you ~? / Let's ~. / plain imperative  
  > Don't forget the ending. Please write back soon.

### L0837 — Questions for the World
- **warn** uk-word `conversation.lines[1].en` — "football" → soccer (football = American football in the US)  
  > I'm playing Amara! We play football and run races. And I love looking at the stars.
- **warn** uk-word `teacher.segments[6].say` — "football" → soccer (football = American football in the US)  
  > Kiko asks, What do children in your country do for fun? Birimo plays Amara. We play football and run races. And I love looking at the stars.
- **warn** uk-word `teacher.segments[6].subtitleEn` — "football" → soccer (football = American football in the US)  
  > Kiko asks, What do children in your country do for fun? Birimo plays Amara. We play football and run races. And I love looking at the stars.
- **warn** uk-word `teacher.segments[6].slide.items[1]` — "football" → soccer (football = American football in the US)  
  > I'm playing Amara! We play football and run races. And I love looking at the stars.

### L0838 — My Japan Introduction
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Last time, we said, What do children in your country do for fun? Today, we are writing an introduction of Japan for the Wo…

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
- **info** contraction `conversation.aiTask.starterEn` — "that is" → "that's"?

### L0875 — City Tour Guide
- **warn** stiff-phrase `teacherScript` — "Please enjoy" → Have fun!  
  > Hello, everyone! Last time, we said, That building makes its own energy. Today, we have an important job. A group of little ducklings is vi…
- **info** please-command `conversation.aiTask.starterEn` — "Please show me Solar Tree Park!" → Can you ~? / Let's ~. / plain imperative  
  > Beep! Today you are the tour guide, and I am a visitor. Please show me Solar Tree Park! What can I see here?
- **info** contraction `conversation.aiTask.starterEn` — "I am" → "I'm"?

### L0887 — Screens Everywhere
- **info** contraction `conversation.aiTask.starterEn` — "what is" → "what's"?

### L0888 — Safe and Smart Online
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0891 — In 2050…
- **warn** punctuation `title` — "…" → "..."  
  > In 2050…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > In 2050…

### L0897 — Reading a Tech Article
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

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

### L0909 — Who Was It Made By?
- **info** stiff-phrase `conversation.aiTask.starterEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Welcome to the clay pot room! These pots are very, very old. Which pot would you like to know about? Go ahead and ask me a question.

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

### L0932 — Hot Days, Cold Nights
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0935 — Climate Report
- **info** contraction `conversation.aiTask.starterEn` — "what is" → "what's"?

### L0938 — Cactus Secrets
- **warn** grammar-habit `teacherScript` — "a rain" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Hello, everyone! Last time, we said, Desert foxes have big ears so that they can stay cool. Today, Fen takes us to a cactus garden. Some ca…

### L0941 — North, South, East, West
- **info** contraction `conversation.aiTask.starterEn` — "what is" → "what's"?

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

### L0950 — Graph Presentation
- **info** please-command `conversation.aiTask.starterEn` — "Please show me your graph." → Can you ~? / Let's ~. / plain imperative  
  > It's Graph Presentation Day! I'm so excited. Please show me your graph. What does it show, and what can we see?

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

### L0967 — Typhoons and Heavy Rain
- **warn** uk-word `teacherScript` — "autumn" → fall  
  > Hello, everyone! Last time, we said, An earthquake happens when the ground moves. Today, Dr. Mori shows us the Volcano Watch Center. It's v…

### L0968 — Tsunami Warnings
- **info** contraction `conversation.lines[0].en` — "what is" → "what's"?

### L0972 — Make Sure You…
- **warn** punctuation `title` — "…" → "..."  
  > Make Sure You…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Make Sure You…

### L0973 — A Family Meeting Place
- **info** contraction `conversation.lines[1].en` — "that is" → "that's"?

### L0977 — Stay Calm
- **error** spelling `teacherScript` — unknown word "osahashimo"  
  > Hello, everyone! Last time, we said, Get under a desk and hold on. Today, at the Island School, we learn what to do after the shaking stops…

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
- **warn** uk-word `teacherScript` — "queue" → line  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacherScript` — "timetable" → schedule  
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
- **warn** uk-word `teacherScript` — "biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. Ms. Emma takes us to t…
- **warn** uk-word `teacherScript` — "rubbish" → trash  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. Ms. Emma takes us to t…
- **warn** uk-word `conversation.lines[4].en` — "biscuit" → cookie(s)  
  > I'd like the children's plate, please. Does it come with a biscuit?
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
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. Ms. Emma takes us to t…
- **info** uk-word `teacher.segments[10].say` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **info** uk-word `teacher.segments[10].subtitleEn` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.

### L1013 — Lift or Elevator?
- **warn** uk-word `teacherScript` — "biscuits" → cookie(s)  
  > Hello, everyone! Last time, we said, Could we have the menu, please? This evening, we come back to the Seagull Hotel. Two friendly traveler…
- **warn** uk-word `teacherScript` — "on holiday" → on vacation  
  > Hello, everyone! Last time, we said, Could we have the menu, please? This evening, we come back to the Seagull Hotel. Two friendly traveler…
- **warn** uk-word `conversation.lines[4].en` — "on holiday" → on vacation  
  > I'm playing Mrs. Brown! I'm on holiday. Let's take the lift!
- **warn** uk-word `conversation.aiTask.starterEn` — "on holiday" → on vacation  
  > Hello, dears! I'm Mrs. Brown, and I'm on holiday from the UK. Shall we take the lift together? Oh, what do you call it?
- **warn** uk-word `teacher.segments[7].say` — "on holiday" → on vacation  
  > Kiko asks, What do people say in the US? Riko says, They say elevator. Mr. Green told me! Then Birimo says, I'm on holiday. Haru says, I'm …
- **warn** uk-word `teacher.segments[7].subtitleEn` — "on holiday" → on vacation  
  > Kiko asks, What do people say in the US? Riko says, They say elevator. Mr. Green told me! Then Birimo says, I'm on holiday. Haru says, I'm …
- **warn** uk-word `teacher.segments[7].slide.items[2]` — "on holiday" → on vacation  
  > I'm playing Mrs. Brown! I'm on holiday. Let's take the lift!

### L1014 — Museum Tickets
- **error** uk-spelling `school.expressions[2].en` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? ― It's in the Science Centre, on the second floor.
- **error** uk-spelling `phonics.words[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `phonics.words[1]` — "centre" → "center" (US)  
  > centre
- **error** uk-spelling `phonics.words[2]` — "theatre" → "theater" (US)  
  > theatre
- **error** uk-spelling `phonics.words[3]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacherScript` — "Colour" → "Color" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "Centre" → "center" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "Theatre" → "theater" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "colour" → "color" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "centre" → "center" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "Favourite" → "Favorite" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "favourite" → "favorite" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `conversation.lines[4].en` — "Centre" → "center" (US)  
  > It's in the Science Centre, on the second floor.
- **error** uk-spelling `conversation.aiTask.targetExpressions[2]` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? ― It's in the Science Centre, on the second floor.
- **error** uk-spelling `teacher.segments[1].slide.items[1]` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? ― It's in the Science Centre, on the second floor.
- **error** uk-spelling `teacher.segments[7].say` — "Centre" → "center" (US)  
  > Riko asks, Where can we see the dinosaur? It's in the Science Centre, on the second floor. Haru asks, Does Birimo need a ticket, too? Yes! …
- **error** uk-spelling `teacher.segments[7].subtitleEn` — "Centre" → "center" (US)  
  > Riko asks, Where can we see the dinosaur? It's in the Science Centre, on the second floor. Haru asks, Does Birimo need a ticket, too? Yes! …
- **error** uk-spelling `teacher.segments[7].slide.items[1]` — "Centre" → "center" (US)  
  > It's in the Science Centre, on the second floor.
- **error** uk-spelling `teacher.segments[8].say` — "colour" → "color" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].say` — "Favourite" → "Favorite" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].subtitleEn` — "colour" → "color" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].subtitleEn` — "Favourite" → "Favorite" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[8].slide.items[1]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacher.segments[9].say` — "Centre" → "center" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "Colour" → "Color" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "Theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "Favourite" → "Favorite" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Centre" → "center" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Colour" → "Color" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Favourite" → "Favorite" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[9].slide.items[1]` — "centre" → "center" (US)  
  > centre
- **error** uk-spelling `teacher.segments[9].slide.items[2]` — "theatre" → "theater" (US)  
  > theatre
- **error** uk-spelling `teacher.segments[9].slide.items[3]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacher.segments[15].say` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? It's in the Science Centre.
- **error** uk-spelling `teacher.segments[15].subtitleEn` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? It's in the Science Centre.
- **error** uk-spelling `teacher.segments[15].slide.items[0]` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? ― It's in the Science Centre, on the second floor.
- **error** uk-spelling `teacher.segments[17].say` — "colour" → "color" (US)  
  > Quiz time! Which spelling is from the UK? A, colour with a u. B, color with no u. Think!
- **error** uk-spelling `teacher.segments[17].subtitleEn` — "colour" → "color" (US)  
  > Quiz time! Which spelling is from the UK? A, colour with a u. B, color with no u. Think!
- **error** uk-spelling `teacher.segments[17].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[18].say` — "colour" → "color" (US)  
  > It's A! In the UK, colour has a u. Both are correct English. Excellent!
- **error** uk-spelling `teacher.segments[18].subtitleEn` — "colour" → "color" (US)  
  > It's A! In the UK, colour has a u. Both are correct English. Excellent!
- **error** uk-spelling `teacher.segments[18].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[19].slide.items[1]` — "Centre" → "center" (US)  
  > Where can we see the dinosaur? ― It's in the Science Centre, on the second floor.
- **error** uk-spelling `teacher.segments[19].slide.items[2]` — "colour" → "color" (US)  
  > colour

### L1015 — A Day in the City
- **error** uk-spelling `phonics.words[1]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacherScript` — "Colour" → "Color" (US)  
  > Hello, everyone! Last time, we said, One adult and four children, please. Is there a family discount? Tonight, Skye flies down to the hotel…
- **error** uk-spelling `teacherScript` — "colour" → "color" (US)  
  > Hello, everyone! Last time, we said, One adult and four children, please. Is there a family discount? Tonight, Skye flies down to the hotel…
- **error** uk-spelling `teacher.segments[9].say` — "Colour" → "Color" (US)  
  > Sound time! Let's review. Lift. In the US, elevator. Colour. In the UK, it has a u. Memorize. Memory, drop the y, and add i, z, e.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Colour" → "Color" (US)  
  > Sound time! Let's review. Lift. In the US, elevator. Colour. In the UK, it has a u. Memorize. Memory, drop the y, and add i, z, e.
- **error** uk-spelling `teacher.segments[9].slide.items[1]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[10].say` — "Colour" → "Color" (US)  
  > Necessary. One c and two s's. Flight seven sixty. Read two numbers at a time. Your turn! Lift. Colour. Memorize. Necessary. Flight seven si…
- **error** uk-spelling `teacher.segments[10].subtitleEn` — "Colour" → "Color" (US)  
  > Necessary. One c and two s's. Flight seven sixty. Read two numbers at a time. Your turn! Lift. Colour. Memorize. Necessary. Flight seven si…
- **error** uk-spelling `teacher.segments[10].slide.items[1]` — "colour" → "color" (US)  
  > colour

### L1017 — Travel Brochure
- **error** uk-spelling `phonics.words[4]` — "theatre" → "theater" (US)  
  > theatre
- **error** uk-spelling `teacherScript` — "Theatre" → "theater" (US)  
  > Hello, everyone! Last time, we said, I'm writing to ask about the airport bus. Today is our last full day in Brightwater, and we have one f…
- **error** uk-spelling `teacherScript` — "theatre" → "theater" (US)  
  > Hello, everyone! Last time, we said, I'm writing to ask about the airport bus. Today is our last full day in Brightwater, and we have one f…
- **error** uk-spelling `teacher.segments[10].say` — "Theatre" → "theater" (US)  
  > Modernize. Modern plus ize. Make it new! Theatre. In the US, theater. Your turn! Gate one oh two. Visitor. Excellent. Modernize. Theatre.
- **error** uk-spelling `teacher.segments[10].subtitleEn` — "Theatre" → "theater" (US)  
  > Modernize. Modern plus ize. Make it new! Theatre. In the US, theater. Your turn! Gate one oh two. Visitor. Excellent. Modernize. Theatre.
- **error** uk-spelling `teacher.segments[10].slide.items[4]` — "theatre" → "theater" (US)  
  > theatre

### L1018 — My Travel Journal
- **error** uk-spelling `phonics.words[4]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacherScript` — "favourite" → "favorite" (US)  
  > Hello, everyone! Last time, we said, Read the brochure. Which tour would you choose? Tonight is our last night in Brightwater. Ms. Emma giv…
- **error** uk-spelling `teacherScript` — "Favourite" → "Favorite" (US)  
  > Hello, everyone! Last time, we said, Read the brochure. Which tour would you choose? Tonight is our last night in Brightwater. Ms. Emma giv…
- **error** uk-spelling `teacher.segments[10].say` — "Favourite" → "Favorite" (US)  
  > Tomorrow. One m, two r's. Realize. Real plus ize. Favourite. In the US, favorite. Your turn! Seven fifteen. Visit. Tomorrow. Realize. Favou…
- **error** uk-spelling `teacher.segments[10].subtitleEn` — "Favourite" → "Favorite" (US)  
  > Tomorrow. One m, two r's. Realize. Real plus ize. Favourite. In the US, favorite. Your turn! Seven fifteen. Visit. Tomorrow. Realize. Favou…
- **error** uk-spelling `teacher.segments[10].slide.items[4]` — "favourite" → "favorite" (US)  
  > favourite

### L1023 — Longer Breaks?
- **warn** uk-word `vocab[3].en` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacherScript` — "timetable" → schedule  
  > Hello, everyone! Last time, we said, Should students wear uniforms? Today, Olive rings her bell, and Amara raises her hand. She says, At my…
- **warn** uk-word `teacher.segments[5].say` — "Timetable" → schedule  
  > Timetable. It shows when each lesson starts. Math, then music, then lunch! Timetable!
- **warn** uk-word `teacher.segments[5].subtitleEn` — "Timetable" → schedule  
  > Timetable. It shows when each lesson starts. Math, then music, then lunch! Timetable!
- **warn** uk-word `teacher.segments[5].slide.items[0]` — "timetable" → schedule  
  > timetable

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
  > Hi! I'm Amara. I have a dog named Biscuit and a cat named Pepper. What should pet owners do every day? Can you give me an example?
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
  > Good morning, team! Last time, we took care of Biscuit and Pepper. Today, Olive asks a new question. What jobs do you do at home?
- **warn** uk-word `teacher.segments[0].subtitleEn` — "Biscuit" → cookie(s)  
  > Good morning, team! Last time, we took care of Biscuit and Pepper. Today, Olive asks a new question. What jobs do you do at home?

### L1036 — I Suggest That We…
- **warn** punctuation `title` — "…" → "..."  
  > I Suggest That We…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Suggest That We…

### L1040 — Children's Proposal
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1048 — Final Debate Practice
- **warn** uk-word `teacherScript` — "summer holidays" → summer/winter/spring vacation or break  
  > Hello, everyone! Last time, we said, Dear Mayor, I suggest that we put more benches in the park. Today, we are practicing for the big counc…

### L1050 — World 35 Grand Review
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1051 — Down to Deep Sea City
- **info** contraction `conversation.lines[1].en` — "it is" → "it's"?

### L1054 — Life Under Pressure
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last time, we said, The reason why it's dark is that sunlight can't reach this deep. Today, Dr. Vale shows us something we…
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, The reason why it's dark is that sunlight can't reach this deep. Today, Dr. Vale shows us something we…

### L1056 — My Research Question
- **warn** wasei-eigo `teacher.segments[5].say` — "white board" → whiteboard  
  > Whiteboard. A big white board you write on with a marker. Squeak, squeak! Whiteboard!
- **warn** wasei-eigo `teacher.segments[5].subtitleEn` — "white board" → whiteboard  
  > Whiteboard. A big white board you write on with a marker. Squeak, squeak! Whiteboard!

### L1057 — Where Can We Find Information?
- **warn** canonical `conversation.lines[4].en` — "Okay" → OK  
  > Hmm, that's true. Okay, then I'll use books, too.

### L1059 — Is This Website Reliable?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last time, we said, According to this book, lanternfish swim up at night to eat. Today, Ms. Emma and Dr. Vale help us look…

### L1061 — In Short
- **warn** sentence-length `conversation.aiTask.starterEn` — 27 words > 22 (stage 5): "Here's a long fact: anglerfish live in the dark, they wait very still, and some…"  
  > Let's find out! Here's a long fact: anglerfish live in the dark, they wait very still, and some have a glowing lure on their head that smal…

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
  > Sound time! Let's review. Whisper. Very, very quiet. W-h sounds like w. Gasp. Haaa! A quick breath, because you're surprised.
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Let's review. Whisper. Very, very quiet. W-h sounds like w. Gasp. Haaa! A quick breath, because you're surprised.

### L1091 — If I Were a Dragon
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound time! Pause right before the surprise. Small and slow, then BIG! Inside was … a tiny dragon!
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
  > Sound time! Pause before the surprise. Small and slow, then BIG! At the bottom of the well, she found … a golden key!
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
  > Sound time! Pause before the surprise. Small and slow, then BIG! She lifted the lid and saw … a pair of eyes!
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
  > Sound time! Pause before the big moment. Small and slow, then BIG! And now … it was right in front of her!
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
  > Sound review! The story pause. Small and slow, then BIG! Inside was … a tiny dragon!
- **warn** punctuation `teacher.segments[9].slide.items[0]` — "…" → "..."  
  > was …
- **info** contraction `conversation.lines[9].en` — "it is" → "it's"?

### L1100 — Lesson 1100 Story Party
- **warn** punctuation `teacher.segments[9].subtitleEn` — "…" → "..."  
  > Sound review! Bravely. Brave plus l y. Now the story pause. At the bottom of the well, she found … a golden key! Small and slow, then big!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1103 — Feedback for Friends
- **warn** sentence-length `conversation.aiTask.starterEn` — 25 words > 22 (stage 5): "A tiny mouse found a giant cheese in the moonlight, but it was too heavy to car…"  
  > Here's my story! A tiny mouse found a giant cheese in the moonlight, but it was too heavy to carry, so he asked a friendly owl for help. Th…

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
  > Oh dear, Biscuit took your sock and ran across the whole field! Now it's wet and muddy. How are you really feeling? Are you angry, or just …
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
  > Sound time! Furious. Very, very angry! Fyoo, ree, us. It ends with i, o, u, s. Furious.
- **info** stiff-phrase `teacher.segments[9].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Sound time! Furious. Very, very angry! Fyoo, ree, us. It ends with i, o, u, s. Furious.

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
  > Hello, everyone! Last time, we said, Cheer up! You'll do better next time. The morning after the party, Ms. Emma has a plan. You've learned…
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
  > Good morning, everyone! Last time, Mr. Bram said yes to the buddy bench! Today, we're in Grandma Rowan's warm kitchen, with warm milk and B…
- **warn** uk-word `teacher.segments[0].subtitleEn` — "Biscuit" → cookie(s)  
  > Good morning, everyone! Last time, Mr. Bram said yes to the buddy bench! Today, we're in Grandma Rowan's warm kitchen, with warm milk and B…

### L1133 — Interview a Grandparent
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, How did you feel at that moment? Today, Mr. Bram finally tells us the name of our guest for the Interv…
- **warn** uk-word `conversation.aiTask.starterEn` — "Biscuit" → cookie(s)  
  > Come in, come in! Biscuit and I are ready for your questions. I warn you, my stories are very old ones. Where shall we start?

### L1134 — Writing an Interview Article
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, What was your childhood like? Today, we're turning our interview into an article for the Heatherbrook …
- **warn** uk-word `teacher.segments[9].say` — "Biscuit" → cookie(s)  
  > Sound time! Play plus ful is playful, full of fun, like Biscuit chasing his tail. Attentive is from attention, plus ive. You notice everyth…
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Biscuit" → cookie(s)  
  > Sound time! Play plus ful is playful, full of fun, like Biscuit chasing his tail. Attentive is from attention, plus ive. You notice everyth…

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
  > Hello, everyone! Last time, we said, One kind word can change someone's day. Today, we take a goodbye walk around the highlands with Ms. Em…
- **warn** uk-word `conversation.lines[4].en` — "Biscuit" → cookie(s)  
  > Not really. I'm going to miss Biscuit so much.
- **warn** uk-word `conversation.lines[8].en` — "Biscuit" → cookie(s)  
  > Let's take one last picture with Biscuit and Grandma Rowan.
- **warn** uk-word `conversation.aiTask.targetExpressions[2]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[1].slide.items[2]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[7].say` — "Biscuit" → cookie(s)  
  > But Birimo is quiet. A tiny rain cloud follows along. Haru asks, Is everything OK? Not really. I'm going to miss Biscuit. Haru says, That m…
- **warn** uk-word `teacher.segments[7].slide.items[0]` — "Biscuit" → cookie(s)  
  > Is everything OK? ― Not really. I'm going to miss Biscuit.
- **warn** uk-word `teacher.segments[7].subtitleEn` — "Biscuit" → cookie(s)  
  > But Birimo is quiet. A tiny rain cloud follows along. Haru asks, Is everything OK? Not really. I'm going to miss Biscuit. Haru says, That m…
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

### L1143 — Clean Water for Everyone
- **warn** uk-word `teacherScript` — "football" → soccer (football = American football in the US)  
  > Hello, everyone! Last time, we said, About one third of food is wasted. Today, Amina from Africa shares a story with the whole table. She h…

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
- **warn** canonical `conversation.aiTask.starterEn` — "Okay" → OK  
  > Your claim is that schools should have gardens. Okay, I'm listening carefully. What are your reasons?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Our First Point Is…

### L1154 — We Disagree Because…
- **warn** punctuation `title` — "…" → "..."  
  > We Disagree Because…
- **warn** uk-word `school.expressions[1].en` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? ― Maybe families could help.
- **warn** uk-word `vocab[2].en` — "summer holidays" → summer/winter/spring vacation or break  
  > summer holidays
- **warn** uk-word `teacherScript` — "summer holidays" → summer/winter/spring vacation or break  
  > Hello, everyone! Last time, we said, Our first point is that gardens teach us about food. Today, it's the no team's turn. Kiko and Birimo l…
- **warn** uk-word `conversation.scene` — "summer holidays" → summer/winter/spring vacation or break  
  > The no team gives a rebuttal about time and the summer holidays
- **warn** uk-word `conversation.lines[4].en` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? Nobody is at school then.
- **warn** uk-word `conversation.aiTask.targetExpressions[1]` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? ― Maybe families could help.
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > We Disagree Because…
- **warn** uk-word `teacher.segments[1].slide.items[1]` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? ― Maybe families could help.
- **warn** uk-word `teacher.segments[4].say` — "Summer holidays" → summer/winter/spring vacation or break  
  > Summer holidays. The long, hot break with no school. Swimming and ice cream! Summer holidays!
- **warn** uk-word `teacher.segments[4].slide.items[0]` — "summer holidays" → summer/winter/spring vacation or break  
  > summer holidays
- **warn** uk-word `teacher.segments[4].subtitleEn` — "Summer holidays" → summer/winter/spring vacation or break  
  > Summer holidays. The long, hot break with no school. Swimming and ice cream! Summer holidays!
- **warn** uk-word `teacher.segments[7].say` — "summer holidays" → summer/winter/spring vacation or break  
  > Riko says, Students can take turns. Kiko says, Good point, but what about the summer holidays? Haru thinks. Maybe families could help. Noti…
- **warn** uk-word `teacher.segments[7].slide.items[1]` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? Nobody is at school then.
- **warn** uk-word `teacher.segments[7].subtitleEn` — "summer holidays" → summer/winter/spring vacation or break  
  > Riko says, Students can take turns. Kiko says, Good point, but what about the summer holidays? Haru thinks. Maybe families could help. Noti…
- **warn** uk-word `teacher.segments[14].say` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays?
- **warn** uk-word `teacher.segments[14].slide.items[0]` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? ― Maybe families could help.
- **warn** uk-word `teacher.segments[14].subtitleEn` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays?
- **warn** uk-word `teacher.segments[17].say` — "summer holidays" → summer/winter/spring vacation or break  
  > Quiz time! Which is a good rebuttal? A, Your idea is silly! B, Good point, but what about the summer holidays? Think!
- **warn** uk-word `teacher.segments[17].subtitleEn` — "summer holidays" → summer/winter/spring vacation or break  
  > Quiz time! Which is a good rebuttal? A, Your idea is silly! B, Good point, but what about the summer holidays? Think!
- **warn** uk-word `teacher.segments[18].slide.items[0]` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? ― Maybe families could help.
- **warn** uk-word `teacher.segments[19].slide.items[1]` — "summer holidays" → summer/winter/spring vacation or break  
  > Good point, but what about the summer holidays? ― Maybe families could help.
- **info** contraction `conversation.lines[1].en` — "what is" → "what's"?

### L1155 — Mini Debate
- **warn** uk-word `teacherScript` — "summer holidays" → summer/winter/spring vacation or break  
  > Hello, everyone! Last time, we said, We disagree because gardens take a lot of time. Today is the big day: our first mini debate! All six c…

### L1156 — One Solution Is…
- **warn** punctuation `title` — "…" → "..."  
  > One Solution Is…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > One Solution Is…

### L1160 — Action Plan
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last time, we said, Let's combine our ideas. Today, the friends turn their ideas into an action plan. An action plan tells…

### L1163 — Presenting Our Proposal
- **info** please-command `conversation.lines[3].en` — "Please take me." → Can you ~? / Let's ~. / plain imperative  
  > I'm playing a banana! Please take me. I don't want to go to waste!

### L1166 — Reading Different Views
- **info** please-command `conversation.lines[4].en` — "Please turn off the lights." → Can you ~? / Let's ~. / plain imperative  
  > I'm playing an owl! Hoo! Please turn off the lights. I'm trying to find my dinner!

### L1173 — I've Learned So Much
- **warn** uk-word `conversation.lines[1].en` — "Year 1" → first/second/... grade  
  > I can write my own stories. In Year 1, I couldn't even spell cat!

### L1174 — My Favorite World
- **warn** canonical `conversation.lines[8].en` — "Okay" → OK  
  > Wrong! It was the dumplings. Okay, and the pancakes.
- **warn** canonical `teacher.segments[7].say` — "Okay" → OK  
  > And Birimo? Mine was the Bustling Market. Food! Food everywhere! Haru guesses, The pancakes? Birimo shouts, Wrong! It was the dumplings. Ok…
- **warn** canonical `teacher.segments[7].subtitleEn` — "Okay" → OK  
  > And Birimo? Mine was the Bustling Market. Food! Food everywhere! Haru guesses, The pancakes? Birimo shouts, Wrong! It was the dumplings. Ok…
- **warn** canonical `teacher.segments[7].slide.items[1]` — "Okay" → OK  
  > Wrong! It was the dumplings. Okay, and the pancakes.

### L1176 — My Best Work
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1181 — Interview Practice 1
- **info** please-command `conversation.lines[0].en` — "Please sit down." → Can you ~? / Let's ~. / plain imperative  
  > Good morning. Please sit down.

### L1182 — Interview Practice 2
- **warn** sentence-length `conversation.aiTask.starterEn` — 23 words > 22 (stage 5): "There's a boy with a dog, a girl under a tree, two children with a kite, and a …"  
  > Here is a picture card. It shows a sunny park. There's a boy with a dog, a girl under a tree, two children with a kite, and a man with a li…
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

### chant:c-01 — Hello, Hello Chant
- **warn** stiff-phrase `lines[1].en` — ", and you?" → How about you? / You?  
  > I'm fine, I'm fine, and you?

### chant:c-09 — Magic E
- **warn** sentence-length `lines[4].en` — 11 words > 8 (stage 1): "Magic e, quiet e, it makes the vowel say its name!"  
  > Magic e, quiet e, it makes the vowel say its name!

### chant:c-13 — What Are You Doing?
- **info** contraction `lines[1].en` — "What is" → "what's"?
- **info** contraction `lines[3].en` — "What is" → "what's"?

### chant:c-14 — Did You? Yes, I Did!
- **warn** canonical `lines[3].en` — "Okay" → OK  
  > Go and clean it now! Okay, I will!

### chant:c-21 — I See Your Point
- **warn** canonical `lines[3].en` — "Okay" → OK  
  > Because they're kind. Okay, let's both try!

### chant:c-22 — It Was Made By
- **info** contraction `lines[3].en` — "it is" → "it's"?

### chant:c-27 — I Should Have
- **warn** canonical `lines[2].en` — "okay" → OK  
  > That's okay, next time I'll try,

### story:s1-05 — Picnic Day
- **warn** canonical `lines[6].en` — "okay" → OK  
  > "That's okay! Let's share!" says Riko.

### story:s1-07 — The Big Pig
- **info** contraction `lines[6].en` — "is not" → "isn't"?
- **info** contraction `lines[7].en` — "I am" → "I'm"?

### story:s1-16 — A Birthday Present
- **warn** sentence-length `lines[7].en` — 10 words > 8 (stage 1): "Riko draws a picture of Haru with the new pencils."  
  > Riko draws a picture of Haru with the new pencils.

### story:s1-17 — Excuse Me, Where Is the Station?
- **warn** sentence-length `lines[0].en` — 9 words > 8 (stage 1): "A traveler has a big bag and a map."  
  > A traveler has a big bag and a map.

### story:s1-18 — My Summer Vacation
- **warn** sentence-length `lines[1].en` — 9 words > 8 (stage 1): ""I went to my grandma's house by the sea.""  
  > "I went to my grandma's house by the sea."

### story:s1-19 — Save the Sea Turtle
- **warn** sentence-length `lines[8].en` — 9 words > 8 (stage 1): "That day, they picked up trash on the beach."  
  > That day, they picked up trash on the beach.

### story:s1-20 — My Dream
- **warn** sentence-length `lines[2].en` — 12 words > 8 (stage 1): "Riko says, "I want to be a vet, because I love animals.""  
  > Riko says, "I want to be a vet, because I love animals."
- **warn** sentence-length `lines[7].en` — 10 words > 8 (stage 1): ""Because English is fun, and I want to share it!""  
  > "Because English is fun, and I want to share it!"

### story:s2-06 — Look! It's Flying!
- **info** contraction `lines[6].en` — "What is" → "what's"?

### story:s2-09 — The Stone Fox
- **warn** sentence-length `lines[0].en` — 15 words > 12 (stage 2): "Once upon a time, there was a stone fox in front of an old temple."  
  > Once upon a time, there was a stone fox in front of an old temple.

### story:s2-11 — The Shooting Star Night
- **warn** sentence-length `lines[5].en` — 13 words > 12 (stage 2): "At ten o'clock, they lie on blankets on the roof of the observatory."  
  > At ten o'clock, they lie on blankets on the roof of the observatory.
- **info** contraction `lines[8].en` — "What is" → "what's"?

### story:s2-12 — Will It Rain Tomorrow?
- **warn** sentence-length `lines[3].en` — 14 words > 12 (stage 2): ""It says it will be cloudy in the morning and sunny in the afternoon.""  
  > Riko checks the weather app. "It says it will be cloudy in the morning and sunny in the afternoon."
- **warn** sentence-length `lines[4].en` — 14 words > 12 (stage 2): "Birimo makes a paper doll for good weather and hangs it by the window."  
  > Birimo makes a paper doll for good weather and hangs it by the window.
- **info** contraction `lines[6].en` — "it is" → "it's"?

### story:s2-13 — A Letter to the Future
- **warn** sentence-length `lines[6].en` — 16 words > 12 (stage 2): "I will practice English every day, so you can talk with people all over the wor…"  
  > I will practice English every day, so you can talk with people all over the world.
- **warn** punctuation `lines[8].en` — missing end mark (. ! ?)  
  > From, Kiko of today

### story:s2-14 — The Tallest Tree in the Valley
- **info** contraction `lines[5].en` — "It is" → "it's"?

### story:s2-16 — The Toy Machine
- **info** stiff-phrase `lines[7].en` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > The machine shakes and beeps. Out comes a rabbit with very, very long ears.

### story:s2-17 — You Have to Wait Your Turn
- **warn** canonical `lines[8].en` — "okay" → OK  
  > "It's okay. You don't have to be sad. Let's start again."

### story:s2-18 — The Helping Robot
- **warn** sentence-length `lines[3].en` — 13 words > 12 (stage 2): "He makes the robot by using old boxes, wheels, and a small motor."  
  > He makes the robot by using old boxes, wheels, and a small motor.
- **warn** sentence-length `lines[7].en` — 13 words > 12 (stage 2): "At the fair, the robot carries a bag of apples across the room."  
  > At the fair, the robot carries a bag of apples across the room.

### story:s2-19 — Would You Like to Come?
- **warn** sentence-length `lines[4].en` — 15 words > 12 (stage 2): ""I'd love to, but I have to help my mom at her shop on Saturday.""  
  > "I'd love to, but I have to help my mom at her shop on Saturday."
- **warn** canonical `lines[5].en` — "okay" → OK  
  > "That's okay. Maybe next time!"

### story:s2-20 — If It Rains
- **warn** sentence-length `lines[8].en` — 13 words > 12 (stage 2): "In the evening, the rain stops, and a rainbow appears over the sea."  
  > In the evening, the rain stops, and a rainbow appears over the sea.

### story:s3-04 — If I Find the Key
- **info** contraction `lines[8].en` — "It is" → "it's"?

### story:s3-06 — The Book with an Empty Page
- **warn** sentence-length `lines[9].en` — 19 words > 15 (stage 3): "So Kiko wrote: Mina climbed the mountain with all her friends, and they had a p…"  
  > So Kiko wrote: Mina climbed the mountain with all her friends, and they had a picnic with the giant.

### story:s3-07 — What Happens If a Plant Gets No Light?
- **warn** sentence-length `lines[4].en` — 16 words > 15 (stage 3): "Kiko put the third cup by the window, too, but she didn't give it any water."  
  > Kiko put the third cup by the window, too, but she didn't give it any water.

### story:s3-12 — The Riddle Doors
- **warn** sentence-length `lines[0].en` — 16 words > 15 (stage 3): "Deep in the Crystal Cave, the friends found a stone door with words carved on i…"  
  > Deep in the Crystal Cave, the friends found a stone door with words carved on it.

### story:s3-13 — Where Were You Last Night?
- **warn** sentence-length `lines[11].en` — 16 words > 15 (stage 3): "Next to it, a mother fox and two baby foxes were sleeping in its soft light."  
  > Next to it, a mother fox and two baby foxes were sleeping in its soft light.

### story:s3-14 — Bored or Boring?
- **info** contraction `lines[10].en` — "I am" → "I'm"?

### story:s3-15 — The Show in the Dark
- **warn** sentence-length `lines[0].en` — 16 words > 15 (stage 3): "It's the night of the big show at the Echo Theater, and every seat is full."  
  > It's the night of the big show at the Echo Theater, and every seat is full.
- **warn** sentence-length `lines[1].en` — 19 words > 15 (stage 3): "Behind the curtain, Kiko is checking the props: a paper moon, a wooden train, a…"  
  > Behind the curtain, Kiko is checking the props: a paper moon, a wooden train, and a box of stars.
- **warn** sentence-length `lines[12].en` — 17 words > 15 (stage 3): ""That was the most interesting show I've ever seen," says an old man in the fro…"  
  > "That was the most interesting show I've ever seen," says an old man in the front row.

### story:s3-16 — The Theater That Wanted to Talk
- **warn** sentence-length `lines[12].en` — 21 words > 15 (stage 3): "A week later, at the end of a play, the theater spoke all by itself: "Thank you…"  
  > A week later, at the end of a play, the theater spoke all by itself: "Thank you for listening to me."

### story:s3-18 — How Long Have You Known Each Other?
- **warn** sentence-length `lines[8].en` — 24 words > 15 (stage 3): ""One morning, I found a cup of warm tea on my desk at school, with a note that …"  
  > "One morning, I found a cup of warm tea on my desk at school, with a note that said, 'I miss you,'" says Mrs. Yuki.
- **warn** sentence-length `lines[10].en` — 16 words > 15 (stage 3): ""And we have made tea together every morning since then," they say at the same …"  
  > "And we have made tea together every morning since then," they say at the same time.

### story:s3-19 — Something to Wrap Them With
- **warn** sentence-length `lines[1].en` — 20 words > 15 (stage 3): "People from the towns on both sides of the river will meet in the middle and gi…"  
  > People from the towns on both sides of the river will meet in the middle and give each other presents.
- **warn** sentence-length `lines[13].en` — 17 words > 15 (stage 3): ""Now we're ready for the festival," said Haru, and they all gave each other a h…"  
  > "Now we're ready for the festival," said Haru, and they all gave each other a high five.

### story:s3-20 — Meeting in the Middle
- **warn** sentence-length `lines[0].en` — 17 words > 15 (stage 3): "On the day of the Friendship Festival, the Rainbow Bridge shone in seven colors…"  
  > On the day of the Friendship Festival, the Rainbow Bridge shone in seven colors over the river.
- **warn** sentence-length `lines[6].en` — 24 words > 15 (stage 3): "It was a big paper kite with four faces painted on it: a boy, two girls, and a …"  
  > It was a big paper kite with four faces painted on it: a boy, two girls, and a little yellow friend with long ears.
- **warn** sentence-length `lines[8].en` — 18 words > 15 (stage 3): ""We saw you on the screen when our two classes had an online lesson together," …"  
  > "We saw you on the screen when our two classes had an online lesson together," said Lina, smiling.
- **warn** sentence-length `lines[12].en` — 19 words > 15 (stage 3): "That afternoon, they flew the kite high above the bridge, and the wind carried …"  
  > That afternoon, they flew the kite high above the bridge, and the wind carried their laughter across the river.
- **warn** sentence-length `lines[13].en` — 19 words > 15 (stage 3): ""A bridge is made of stone and light," she said softly, "but friendship is what…"  
  > Ms. Emma watched them from the riverbank. "A bridge is made of stone and light," she said softly, "but friendship is what makes people cros…

### story:s4-03 — Is It Really True?
- **warn** canonical `lines[10].en` — "okay" → OK  
  > "It's okay," says Haru. "Now we know how to check. That's a useful skill."

### story:s4-06 — A Park for Everyone
- **warn** sentence-length `lines[11].en` — 20 words > 18 (stage 4): "When they show the map to the city planners, one of them says, "This really is …"  
  > When they show the map to the city planners, one of them says, "This really is a park for everyone."

### story:s4-08 — What If...?
- **warn** sentence-length `lines[6].en` — 19 words > 18 (stage 4): "After a week, the plant in the closet has grown tall and thin, and its leaves a…"  
  > After a week, the plant in the closet has grown tall and thin, and its leaves are pale yellow.
- **info** contraction `lines[7].en` — "it is" → "it's"?

### story:s4-11 — The Map on the Tent
- **info** contraction `lines[6].en` — "It is" → "it's"?

### story:s4-15 — Let's Practice Helping
- **warn** canonical `lines[6].en` — "okay" → OK  
  > "It's okay. I'm Birimo. Let's go to a safe place together and find a grown-up who can help."

### story:s4-16 — The Lost Passport
- **info** please-command `lines[9].en` — ""Please wait here." → Can you ~? / Let's ~. / plain imperative  
  > "Please wait here. Someone will check the plane for you."

### story:s4-18 — Who Does the Dishes?
- **warn** sentence-length `lines[0].en` — 24 words > 18 (stage 4): "At the Hall of Wisdom, the friends are staying in a guest house for a week, and…"  
  > At the Hall of Wisdom, the friends are staying in a guest house for a week, and they have to do the chores themselves.
- **warn** sentence-length `lines[10].en` — 20 words > 18 (stage 4): "Haru still loves cooking, so they agree that he can cook twice a week if he als…"  
  > Haru still loves cooking, so they agree that he can cook twice a week if he also cleans the bathroom.

### story:s4-19 — The Big Vote
- **warn** sentence-length `lines[11].en` — 20 words > 18 (stage 4): ""Kiko told us that many people want a reading corner, too, so we've asked the l…"  
  > "Kiko told us that many people want a reading corner, too, so we've asked the library if they can help."

### story:s4-20 — Could You Possibly Help Us?
- **warn** sentence-length `lines[0].en` — 22 words > 18 (stage 4): "To say thank you, the friends decide to hold a small party for all the people w…"  
  > To say thank you, the friends decide to hold a small party for all the people who have helped them this year.
- **warn** canonical `lines[10].en` — "okay" → OK  
  > "That's okay," says Riko. "Thank you for thinking about it. We understand."
- **warn** sentence-length `lines[11].en` — 25 words > 18 (stage 4): "On Saturday, the big room is full of people who have helped them: the desert gu…"  
  > On Saturday, the big room is full of people who have helped them: the desert guide, the tree doctor, the river guide, and many more.
- **warn** sentence-length `lines[14].en` — 20 words > 18 (stage 4): ""Those are words that open doors," she says, "and I can't wait to see which doo…"  
  > "Those are words that open doors," she says, "and I can't wait to see which doors you will open next."

### story:s5-02 — Three Sentences Only
- **warn** sentence-length `lines[0].en` — 24 words > 22 (stage 5): "Emma gave the class a strange homework: "Read this long article about the coral…"  
  > Ms. Emma gave the class a strange homework: "Read this long article about the coral garden, and tell me about it in only three sentences."
- **info** contraction `lines[5].en` — "what is" → "what's"?

### story:s5-03 — To Sum Up
- **warn** sentence-length `lines[7].en` — 23 words > 22 (stage 5): ""To sum up, whales sing to talk to each other, their songs can travel very far,…"  
  > "To sum up, whales sing to talk to each other, their songs can travel very far, and every year they learn new songs."

### story:s5-04 — Any Questions?
- **info** contraction `lines[8].en` — "What is" → "what's"?

### story:s5-05 — When the Bubble Lights Went Out
- **warn** canonical `lines[12].en` — "okay" → OK  
  > A small boy asked, "Will the sea cucumbers be okay?"

### story:s5-07 — What Would You Do?
- **info** contraction `lines[1].en` — "will not" → "won't"?

### story:s5-14 — From the Shop's Side
- **error** grammar-habit `lines[14].en` — "breads" → uncountable: no -s  
  > Birimo ordered three melon breads every day. "From my stomach's side," he said, "this is the best plan ever."

### story:s5-15 — My First Point Is...
- **warn** sentence-length `lines[0].en` — 25 words > 22 (stage 5): "The town council of the World Round Table had a question for the children: what…"  
  > The town council of the World Round Table had a question for the children: what should be built on the empty land by the river?

### story:s5-16 — The Bridge of Many Hands
- **warn** sentence-length `lines[0].en` — 23 words > 22 (stage 5): "For the World Round Table Festival, teams of children from five different count…"  
  > For the World Round Table Festival, teams of children from five different countries had to build a model bridge together in one afternoon.
- **info** contraction `lines[5].en` — "What is" → "what's"?

### story:s5-18 — The Old Me, the Me Now
- **info** contraction `lines[2].en` — "I am" → "I'm"?
- **info** contraction `lines[5].en` — "It is" → "it's"?

### story:s5-19 — The Practice Interview
- **warn** sentence-length `lines[6].en` — 25 words > 22 (stage 5): "When I was nine, I wrote a letter to my future self at an observatory, and that…"  
  > "I want to be a guide because I believe the night sky makes people feel connected. When I was nine, I wrote a letter to my future self at a…
- **warn** sentence-length `lines[10].en` — 24 words > 22 (stage 5): ""For example, last week a little boy asked me why stars twinkle, and I explaine…"  
  > "For example, last week a little boy asked me why stars twinkle, and I explained it with a glass of water and a flashlight."
- **warn** sentence-length `lines[12].en` — 24 words > 22 (stage 5): ""Saturn," said Kiko, "because its rings remind me that beautiful things are oft…"  
  > "Saturn," said Kiko, "because its rings remind me that beautiful things are often made of many small pieces, just like a group of friends."
- **info** contraction `lines[11].en` — "What is" → "what's"?

### story:s5-20 — A Letter to Me in Ten Years
- **warn** sentence-length `lines[5].en` — 24 words > 22 (stage 5): ""We traveled through forests, cities, deserts, and even the bottom of the sea, …"  
  > "We traveled through forests, cities, deserts, and even the bottom of the sea, and in every place, English opened a new door for us."
- **warn** sentence-length `lines[7].en` — 25 words > 22 (stage 5): ""If you are having a hard day when you read this, remember the night the bubble…"  
  > "If you are having a hard day when you read this, remember the night the bubble lights went out, and how we fixed them together."
- **warn** sentence-length `lines[12].en` — 26 words > 22 (stage 5): "Haru's envelope was covered in drawings of rockets, Kiko's had a tiny star map …"  
  > Haru's envelope was covered in drawings of rockets, Kiko's had a tiny star map on it, and Birimo's had a sticky mark that looked like jam.

### talk:t-food — すきな たべもの
- **info** uk-word `lines[2].en` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Curry! It's yummy! Do you like sweets?

### talk:t-day — わたしの 1日
- **info** contraction `lines[6].en` — "What is" → "what's"?

### talk:t-dream — しょうらいの ゆめ
- **warn** sentence-length `lines[4].en` — 10 words > 8 (stage 1): "I want to be a writer because I love stories."  
  > That's wonderful! I want to be a writer because I love stories. What are you good at?

### talk:t-compare — どっちが すき？
- **info** contraction `lines[6].en` — "What is" → "what's"?

### talk:t-anything — なんでも トーク
- **info** contraction `lines[2].en` — "What is" → "what's"?

### yearly:1 — ステージ1 の 力だめし
- **warn** punctuation `reading[7].prompt` — double space  
  > A: How are you?  B: ( )
- **warn** punctuation `reading[8].prompt` — double space  
  > A: What time do you get up?  B: ( )
- **warn** punctuation `reading[9].prompt` — double space  
  > A: Can I have some orange juice, please?  B: ( )

### yearly:2 — ステージ2 の 力だめし
- **warn** canonical `listening[6].choices[2]` — "okay" → OK  
  > That's okay. Maybe next time.
- **warn** canonical `listening[12].audio[2].en` — "Okay" → OK  
  > Okay. Let's play after that.
- **warn** sentence-length `passages[0].lines[4]` — 14 words > 12 (stage 2): "The third-grade students will sing songs in the gym at 11:00 a.m."  
  > The third-grade students will sing songs in the gym at 11:00 a.m.
- **warn** sentence-length `passages[0].lines[7]` — 13 words > 12 (stage 2): "If it rains, the games on the playground will move to the gym."  
  > If it rains, the games on the playground will move to the gym.
- **warn** punctuation `reading[7].prompt` — double space  
  > A: Would you like some more soup?  B: ( ) It's delicious.
- **warn** punctuation `reading[8].prompt` — double space  
  > A: What are you going to do this weekend?  B: ( )
- **warn** punctuation `reading[9].prompt` — double space  
  > A: Can I borrow your eraser?  B: ( )
- **warn** sentence-length `speaking.prompts[0].picture.descriptionEn` — 19 words > 12 (stage 2): "In a park, a boy is playing soccer, a girl is riding a bike, and a dog is runni…"  
  > In a park, a boy is playing soccer, a girl is riding a bike, and a dog is running.

### yearly:3 — ステージ3 の 力だめし
- **warn** canonical `listening[3].choices[0]` — "okay" → OK  
  > That's okay. I wanted to ask about the homework.
- **warn** canonical `listening[7].audio[0].en` — "okay" → OK  
  > Emma, you look tired. Are you okay?
- **warn** sentence-length `passages[0].lines[6]` — 16 words > 15 (stage 3): "My cousin Taro is a great skier, so he taught me how to stop and turn."  
  > My cousin Taro is a great skier, so he taught me how to stop and turn.
- **warn** sentence-length `passages[0].lines[9]` — 16 words > 15 (stage 3): "Tomorrow we're going to visit a snow monkey park, and then we'll go home on Wed…"  
  > Tomorrow we're going to visit a snow monkey park, and then we'll go home on Wednesday.
- **warn** sentence-length `passages[1].lines[8]` — 16 words > 15 (stage 3): ""I sat on that bench with my husband many years ago," she said with a smile."  
  > "I sat on that bench with my husband many years ago," she said with a smile.
- **warn** sentence-length `reading[1].prompt` — 16 words > 15 (stage 3): "The museum is very popular, so we had to wait in a long ( ) to buy tickets."  
  > The museum is very popular, so we had to wait in a long ( ) to buy tickets.
- **warn** sentence-length `speaking.prompts[1].picture.descriptionEn` — 21 words > 15 (stage 3): "At a lake, a boy is fishing, a girl is reading a book under a tree, and a dog i…"  
  > At a lake, a boy is fishing, a girl is reading a book under a tree, and a dog is running.
- **info** contraction `listening[18].audio[0].en` — "do not" → "don't"?

### yearly:4 — ステージ4 の 力だめし
- **error** uk-spelling `listening[18].audio[0].en` — "cancelled" → "canceled" (US)  
  > Attention, passengers. Because of strong winds, this afternoon's ferry to Green Island has been cancelled. The next ferry will leave tomorr…
- **warn** sentence-length `speaking.prompts[2].sample` — 20 words > 18 (stage 4): "I think children should have a little homework every day because it helps us re…"  
  > I think children should have a little homework every day because it helps us remember what we learned at school. But it shouldn't take too …
- **info** contraction `listening[13].audio[0].en` — "do not" → "don't"?
- **info** contraction `listening[16].audio[0].en` — "did not" → "didn't"?

### yearly:5 — ステージ5 の 力だめし
- **warn** canonical `listening[15].audio[0].en` — "okay" → OK  
  > Nina, you seem quiet today. Is everything okay?
- **warn** sentence-length `listening[22].audio[1].en` — 25 words > 22 (stage 5): "In one old tale, the moon was a shy girl who only came out at night because she…"  
  > In one old tale, the moon was a shy girl who only came out at night because she did not want people to see her.
- **warn** sentence-length `listening[23].audio[2].en` — 25 words > 22 (stage 5): "The most popular idea was to put more benches and shade trees along the roads t…"  
  > The most popular idea was to put more benches and shade trees along the roads to school, because many children get tired on hot days.
- **warn** sentence-length `passages[0].lines[10]` — 23 words > 22 (stage 5): "It is eaten in soups and salads, and it can be turned into animal food, fertili…"  
  > It is eaten in soups and salads, and it can be turned into animal food, fertilizer, and even packaging that breaks down naturally.
- **warn** sentence-length `passages[2].lines[2]` — 23 words > 22 (stage 5): "When she arrived at his small house by the harbor, however, she was so nervous …"  
  > When she arrived at his small house by the harbor, however, she was so nervous that she forgot to take out her notebook.
- **warn** sentence-length `passages[2].lines[5]` — 26 words > 22 (stage 5): "He told her about windy nights when he climbed the 120 steps to the top of the …"  
  > He told her about windy nights when he climbed the 120 steps to the top of the lighthouse again and again to keep the light shining.
- **warn** sentence-length `reading[2].prompt` — 26 words > 22 (stage 5): "Leo couldn't think of a topic for his story, but after a long walk in the fores…"  
  > Leo couldn't think of a topic for his story, but after a long walk in the forest, he ( ) with a great idea about a talking owl.
- **info** contraction `listening[17].audio[3].en` — "are not" → "aren't"?
- **info** contraction `listening[20].audio[1].en` — "it is" → "it's"?
- **info** contraction `listening[22].audio[1].en` — "did not" → "didn't"?

### L0024 — Let's Play!
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0025 — Family Day at the Park (Review)
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0032 — Let's Be Friends!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

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
- **info** lets-overuse `(lesson)` — 7 "Let's" in one lesson (aim ≤ 3)

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

### L0296 — My Proposal Speech
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0300 — World 10 Grand Review
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0549 — Let's Try Again
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0664 — Measure It!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0855 — Class Meeting Role-Play
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1037 — How About Making a Map?
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1168 — A Message to the World
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

## 書きかたの ゆれ（はんい ぜんたい）
- "me too" ×9 (L0004, L0005, L0007, …) vs "me, too" ×2 (L0183, L0244)
- "thank you" ×12 (L0010, L0019, L0028, …) vs "thank-you" ×1 (L0569)
- "give a thumbs-up" ×14 (L0118, L0179, L0224, …) vs "give a thumbs up" ×7 (L0088, L0133, L0200, …)
- "beep, beep" ×1 (L0104) vs "beep beep" ×1 (L0498)
- "say thank you and bow" ×4 (L0145, L0160, L0380, …) vs "say, "Thank you!" and bow" ×1 (L0633)
- "once upon a time" ×3 (L0174, L0654, story:s2-09) vs "once. upon. a. time" ×1 (L0778)
- "make an x with your arms" ×1 (L0178) vs "make an X with your arms" ×1 (L0386)
- "january, February, March, April" ×1 (L0186) vs "january, February, March, April," ×1 (chant:c-10)
- "bow and say thank you" ×10 (L0219, L0298, L0520, …) vs "bow and say, Thank you" ×3 (L1001, L1180, L1191)
- "give me a thumbs-up" ×2 (L0551, L0786) vs "give me a thumbs up" ×1 (L0274)
- "tug of war" ×2 (L0302, L0349) vs "tug-of-war" ×1 (L0434)
- "keychain" ×4 (L0461, L0528, L0717, …) vs "key chain" ×1 (L0483)
- "shout Bingo" ×1 (L0506) vs "shout, "Bingo" ×1 (L0700)
- "whisper thank you" ×1 (L0537) vs "whisper, "Thank you" ×1 (L0651)
- "rub your tummy and say yum" ×1 (L0582) vs "rub your tummy and say, Yum" ×1 (L1174)
- "shout, "Help" ×1 (L0651) vs "shout, Help" ×1 (L0762)
- "stem" ×2 (L0682, L0938) vs "STEM" ×2 (L0889, L0898)
- "take a deep breath. In and out" ×1 (L0773) vs "take a deep breath, in and out" ×1 (L1113)
- "sure. Go ahead" ×1 (L0833) vs "sure, go ahead" ×1 (L0853)
- "seat belt" ×1 (L0873) vs "seatbelt" ×1 (L0996)
- "put your hand on your heart and say thank you" ×2 (L1112, L1169) vs "put your hand on your heart and say, Thank you" ×1 (L1010)
