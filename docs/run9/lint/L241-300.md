# English lint: L241-300

- 日付: 2026-11-27
- はんい: レッスン 241〜300（`npm run english:lint -- --from 241 --to 300`）
- しらべた 文字列: 6386（60 ユニット）
- 結果: **error 0 / warn 22 / info 10**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 2 |
| lets-overuse | 0 | 0 | 3 |
| please-command | 0 | 0 | 1 |
| sentence-length | 0 | 9 | 0 |
| stiff-phrase | 0 | 0 | 4 |
| uk-word | 0 | 13 | 0 |

## ユニットごと

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

### L0296 — My Proposal Speech
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0300 — World 10 Grand Review
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)
