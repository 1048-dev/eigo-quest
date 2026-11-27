# English lint: L541-600

- 日付: 2026-11-27
- はんい: レッスン 541〜600（`npm run english:lint -- --from 541 --to 600`）
- しらべた 文字列: 8273（60 ユニット）
- 結果: **error 0 / warn 160 / info 14**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 146 | 0 |
| contraction | 0 | 0 | 1 |
| inconsistent-form | 0 | 1 | 0 |
| lets-overuse | 0 | 0 | 2 |
| please-command | 0 | 0 | 4 |
| punctuation | 0 | 3 | 0 |
| sentence-length | 0 | 5 | 0 |
| stiff-phrase | 0 | 0 | 6 |
| uk-word | 0 | 5 | 1 |

## ユニットごと

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

### L0549 — Let's Try Again
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

## 書きかたの ゆれ（はんい ぜんたい）
- "thank you" ×1 (L0554) vs "thank-you" ×1 (L0569)
