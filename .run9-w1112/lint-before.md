# English lint: L301-360

- 日付: 2026-11-27
- はんい: レッスン 301〜360（`npm run english:lint -- --from 301 --to 360`）
- しらべた 文字列: 6489（60 ユニット）
- 結果: **error 0 / warn 38 / info 14**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 14 |
| inconsistent-form | 0 | 1 | 0 |
| sentence-length | 0 | 21 | 0 |
| uk-word | 0 | 16 | 0 |

## ユニットごと

### L0314 — When I'm Older
- **warn** sentence-length `school.expressions[1].en` — 9 words > 8 (stage 1): "When I'm older, I want to be a teacher."  
  > When I'm older, I want to be a teacher.
- **warn** sentence-length `conversation.lines[2].en` — 9 words > 8 (stage 1): "When I'm older, I want to be a teacher."  
  > When I'm older, I want to be a teacher.
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "When I'm older, I want to be a teacher."  
  > When I'm older, I want to be a teacher. What do you want to be when you're older?
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "What do you want to be when you're older?"  
  > When I'm older, I want to be a teacher. What do you want to be when you're older?

### L0317 — In Junior High School
- **warn** sentence-length `conversation.lines[0].en` — 10 words > 8 (stage 1): "I want to study English hard in junior high school."  
  > I want to study English hard in junior high school.
- **warn** sentence-length `conversation.aiTask.starterEn` — 10 words > 8 (stage 1): "In junior high school, I want to study English hard."  
  > In junior high school, I want to study English hard. What do you want to do?

### L0318 — The Biggest Club
- **warn** sentence-length `conversation.lines[1].en` — 9 words > 8 (stage 1): "They practice after school, even on the hottest days!"  
  > They practice after school, even on the hottest days!

### L0321 — Thank You for Your Help
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "What do you want to say thank you for?"  
  > Let's say thank you! Thank you for your help. What do you want to say thank you for?

### L0323 — Because You Were Kind
- **warn** sentence-length `conversation.lines[2].en` — 10 words > 8 (stage 1): "Because you were kind to me on my first day."  
  > Because you were kind to me on my first day.

### L0324 — A Message for Our Teacher
- **warn** sentence-length `conversation.lines[2].en` — 11 words > 8 (stage 1): "I would like to see you again in junior high school."  
  > I would like to see you again in junior high school.

### L0325 — Thank-You Party
- **warn** sentence-length `school.expressions[2].en` — 9 words > 8 (stage 1): "We could do our best because you helped us."  
  > We could do our best because you helped us.
- **warn** sentence-length `conversation.lines[3].en` — 9 words > 8 (stage 1): "We could do our best because you helped us."  
  > We could do our best because you helped us. Thank you!

### L0329 — City of Dreams Review
- **warn** sentence-length `conversation.lines[3].en` — 11 words > 8 (stage 1): "I want to join the art club in junior high school."  
  > I want to join the art club in junior high school.

### L0331 — I Am a New Student.
- **warn** sentence-length `conversation.lines[0].en` — 9 words > 8 (stage 1): "Today we visit a junior high school entrance ceremony."  
  > Welcome to the Kingdom of English! Today we visit a junior high school entrance ceremony.
- **info** contraction `conversation.lines[1].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[3].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?
- **info** contraction `conversation.aiTask.starterEn` — "I am" → "I'm"?

### L0332 — He Is My Friend.
- **info** contraction `conversation.lines[5].en` — "I am" → "I'm"?

### L0334 — My Friend Poster
- **warn** sentence-length `conversation.lines[1].en` — 9 words > 8 (stage 1): "He can run fast because he practices every day."  
  > Thank you, Riko! This is Haru. He can run fast because he practices every day.

### L0335 — Hello, Junior High!
- **info** contraction `conversation.lines[1].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[2].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[3].en` — "I am" → "I'm"?
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?

### L0342 — Where Is the Library?
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?

### L0343 — My Day at Junior High
- **warn** sentence-length `conversation.lines[4].en` — 10 words > 8 (stage 1): "After school, I want to go to the club room!"  
  > After school, I want to go to the club room!

### L0345 — My Day Speech
- **warn** sentence-length `conversation.lines[4].en` — 10 words > 8 (stage 1): "I eat snacks at noon, at three, and at night!"  
  > I eat snacks at noon, at three, and at night!

### L0347 — I Saw a Big Tree.
- **warn** sentence-length `conversation.aiTask.starterEn` — 9 words > 8 (stage 1): "I saw a big tree on the field trip."  
  > I saw a big tree on the field trip. It was so tall! What did you see this year?

### L0349 — How Was the Festival?
- **warn** uk-word `school.expressions[2].en` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `phonics.words[1]` — "autumn" → fall  
  > autumn
- **warn** uk-word `conversation.lines[3].en` — "autumn" → fall  
  > It was fun. We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[7].say` — "autumn" → fall  
  > Kiko asks, How was the school festival? I say, It was fun. We had a big stage show in autumn. And Birimo says, I drew a picture of all of y…
- **warn** uk-word `teacher.segments[7].subtitleEn` — "autumn" → fall  
  > Kiko asks, How was the school festival? I say, It was fun. We had a big stage show in autumn. And Birimo says, I drew a picture of all of y…
- **warn** uk-word `teacher.segments[7].slide.items[1]` — "autumn" → fall  
  > It was fun. We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[9].say` — "autumn" → fall  
  > Reading time! A W and A U say aw, like a big yawn. Saw, autumn. E W says oo. Drew, flew. オー と ウー だよ。
- **warn** uk-word `teacher.segments[9].subtitleEn` — "autumn" → fall  
  > Reading time! A W and A U say aw, like a big yawn. Saw, autumn. E W says oo. Drew, flew.
- **warn** uk-word `teacher.segments[10].say` — "autumn" → fall  
  > Now read in chunks. In autumn, I saw red leaves. I drew a picture. The leaves flew away. Saw, autumn, drew, flew! ゆっくり よもう。
- **warn** uk-word `teacher.segments[10].subtitleEn` — "autumn" → fall  
  > Now read in chunks. In autumn, I saw red leaves. I drew a picture. The leaves flew away. Saw, autumn, drew, flew!
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "autumn" → fall  
  > autumn
- **warn** uk-word `teacher.segments[16].say` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[16].subtitleEn` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[16].slide.items[0]` — "autumn" → fall  
  > We had a big stage show in autumn.
- **warn** uk-word `teacher.segments[20].say` — "autumn" → fall  
  > Three cheers for you! You can ask, How was it? You can say, It was fun, and We had a stage show. And you read saw, autumn, drew and flew! N…
- **warn** uk-word `teacher.segments[20].subtitleEn` — "autumn" → fall  
  > Three cheers for you! You can ask, How was it? You can say, It was fun, and We had a stage show. And you read saw, autumn, drew and flew! N…

### L0351 — Who and What Questions
- **info** contraction `conversation.lines[3].en` — "What is" → "what's"?

### L0353 — Why Do You Like It?
- **warn** sentence-length `conversation.lines[1].en` — 9 words > 8 (stage 1): "Because I can ski and play in the snow!"  
  > Because I can ski and play in the snow!

### L0356 — Welcome to the Party!
- **warn** sentence-length `conversation.lines[3].en` — 9 words > 8 (stage 1): "Kiko said, "I want to sing at the party!""  
  > Kiko said, "I want to sing at the party!"
- **info** contraction `conversation.lines[4].en` — "I am" → "I'm"?

### L0357 — I Can Speak English!
- **warn** sentence-length `conversation.lines[2].en` — 9 words > 8 (stage 1): "I want to talk with friends around the world!"  
  > I can speak English now. I want to talk with friends around the world!

### L0358 — Memories of the Year
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L0360 — World 12 Grand Finale
- **info** contraction `conversation.lines[1].en` — "I am" → "I'm"?

## 書きかたの ゆれ（はんい ぜんたい）
- "give a thumbs-up" ×1 (L0321) vs "give a thumbs up" ×1 (L0334)
