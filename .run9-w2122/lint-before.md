# English lint: L601-660

- 日付: 2026-11-27
- はんい: レッスン 601〜660（`npm run english:lint -- --from 601 --to 660 --out .run9-w2122/lint-before.md --quiet`）
- しらべた 文字列: 8017（60 ユニット）
- 結果: **error 0 / warn 56 / info 9**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 46 | 0 |
| contraction | 0 | 0 | 1 |
| punctuation | 0 | 4 | 0 |
| stiff-phrase | 0 | 6 | 6 |
| uk-word | 0 | 0 | 2 |

## ユニットごと

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
