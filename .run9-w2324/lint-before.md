# English lint: L661-720

- 日付: 2026-11-27
- はんい: レッスン 661〜720（`npm run english:lint -- --from 661 --to 720`）
- しらべた 文字列: 8078（60 ユニット）
- 結果: **error 0 / warn 23 / info 18**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 6 | 0 |
| contraction | 0 | 0 | 4 |
| lets-overuse | 0 | 0 | 1 |
| please-command | 0 | 0 | 1 |
| sentence-length | 0 | 1 | 0 |
| stiff-phrase | 0 | 0 | 9 |
| uk-word | 0 | 16 | 3 |

## ユニットごと

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

### L0664 — Measure It!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)
