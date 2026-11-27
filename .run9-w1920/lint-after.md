# English lint: L541-600

- 日付: 2026-11-27
- はんい: レッスン 541〜600（`npm run english:lint -- --from 541 --to 600`）
- しらべた 文字列: 8273（60 ユニット）
- 結果: **error 0 / warn 1 / info 14**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 1 |
| inconsistent-form | 0 | 1 | 0 |
| lets-overuse | 0 | 0 | 2 |
| please-command | 0 | 0 | 4 |
| stiff-phrase | 0 | 0 | 6 |
| uk-word | 0 | 0 | 1 |

## ユニットごと

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

### L0549 — Let's Try Again
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0559 — That's Not Fair!
- **info** lets-overuse `(lesson)` — 6 "Let's" in one lesson (aim ≤ 3)

## 書きかたの ゆれ（はんい ぜんたい）
- "thank you" ×1 (L0554) vs "thank-you" ×1 (L0569)
