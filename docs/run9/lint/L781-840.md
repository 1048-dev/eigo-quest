# English lint: L781-840

- 日付: 2026-11-27
- はんい: レッスン 781〜840（`npm run english:lint -- --from 781 --to 840`）
- しらべた 文字列: 7899（60 ユニット）
- 結果: **error 0 / warn 32 / info 8**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 5 |
| please-command | 0 | 0 | 1 |
| punctuation | 0 | 31 | 0 |
| stiff-phrase | 0 | 1 | 2 |

## ユニットごと

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
