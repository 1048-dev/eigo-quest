# English lint: L721-780

- 日付: 2026-11-27
- はんい: レッスン 721〜780（`npm run english:lint -- --from 721 --to 780`）
- しらべた 文字列: 7806（60 ユニット）
- 結果: **error 1 / warn 171 / info 18**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| capitalization | 0 | 3 | 0 |
| contraction | 0 | 0 | 2 |
| grammar-habit | 1 | 6 | 0 |
| lets-overuse | 0 | 0 | 1 |
| please-command | 0 | 0 | 1 |
| punctuation | 0 | 162 | 0 |
| stiff-phrase | 0 | 0 | 14 |

## ユニットごと

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
