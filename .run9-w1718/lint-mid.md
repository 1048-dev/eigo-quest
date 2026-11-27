# English lint: L481-540

- 日付: 2026-11-27
- はんい: レッスン 481〜540（`npm run english:lint -- --from 481 --to 540 --out .run9-w1718/lint-mid.md`）
- しらべた 文字列: 8140（60 ユニット）
- 結果: **error 0 / warn 3 / info 17**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 7 |
| inconsistent-form | 0 | 1 | 0 |
| lets-overuse | 0 | 0 | 1 |
| please-command | 0 | 0 | 1 |
| sentence-length | 0 | 2 | 0 |
| stiff-phrase | 0 | 0 | 8 |

## ユニットごと

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
- **warn** sentence-length `conversation.lines[4].en` — 14 words > 12 (stage 2): "A turtle is not as fast as a rabbit, but it never gives up."  
  > Everyone has a special power. A turtle is not as fast as a rabbit, but it never gives up.
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

### L0502 — My Own Constellation
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

## 書きかたの ゆれ（はんい ぜんたい）
- "key chain" ×1 (L0483) vs "keychain" ×1 (L0528)
