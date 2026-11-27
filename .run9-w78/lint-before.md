# English lint: L181-240

- 日付: 2026-11-27
- はんい: レッスン 181〜240（`npm run english:lint -- --from 181 --to 240`）
- しらべた 文字列: 6427（60 ユニット）
- 結果: **error 0 / warn 70 / info 12**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 3 |
| inconsistent-form | 0 | 1 | 0 |
| near-duplicate | 0 | 0 | 3 |
| please-command | 0 | 0 | 2 |
| sentence-length | 0 | 6 | 0 |
| stiff-phrase | 0 | 0 | 4 |
| uk-word | 0 | 63 | 0 |

## ユニットごと

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

### L0218 — How Much Is It?
- **info** near-duplicate `(lesson)` — lines differ by 1–2 letters (typo?)  
  > It's 500 yen. / It's 800 yen.
- **info** near-duplicate `(lesson)` — lines differ by 1–2 letters (typo?)  
  > It's 500 yen. / It's 300 yen.
- **info** near-duplicate `(lesson)` — lines differ by 1–2 letters (typo?)  
  > It's 800 yen. / It's 300 yen.

## 書きかたの ゆれ（はんい ぜんたい）
- "give a thumbs up" ×2 (L0200, L0209) vs "give a thumbs-up" ×1 (L0224)
