# English lint: L601-660

- 日付: 2026-11-27
- はんい: レッスン 601〜660（`npm run english:lint -- --from 601 --to 660 --out .run9-w2122/lint-after.md --quiet`）
- しらべた 文字列: 8017（60 ユニット）
- 結果: **error 0 / warn 8 / info 7**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 1 |
| punctuation | 0 | 2 | 0 |
| stiff-phrase | 0 | 6 | 6 |

## ユニットごと

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
