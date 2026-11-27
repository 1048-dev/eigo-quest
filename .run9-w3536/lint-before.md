# English lint: L1021-1080

- 日付: 2026-11-27
- はんい: レッスン 1021〜1080（`npm run english:lint -- --from 1021 --to 1080`）
- しらべた 文字列: 7781（60 ユニット）
- 結果: **error 0 / warn 37 / info 27**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 3 | 0 |
| contraction | 0 | 0 | 6 |
| lets-overuse | 0 | 0 | 2 |
| punctuation | 0 | 10 | 0 |
| sentence-length | 0 | 1 | 0 |
| stiff-phrase | 0 | 6 | 19 |
| uk-word | 0 | 15 | 0 |
| wasei-eigo | 0 | 2 | 0 |

## ユニットごと

### L1023 — Longer Breaks?
- **warn** uk-word `vocab[3].en` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacherScript` — "timetable" → schedule  
  > Hello, everyone! Last time, we said, Should students wear uniforms? Today, Olive rings her bell, and Amara raises her hand. She says, At my…
- **warn** uk-word `teacher.segments[5].say` — "Timetable" → schedule  
  > Timetable. It shows when each lesson starts. Math, then music, then lunch! Timetable!
- **warn** uk-word `teacher.segments[5].subtitleEn` — "Timetable" → schedule  
  > Timetable. It shows when each lesson starts. Math, then music, then lunch! Timetable!
- **warn** uk-word `teacher.segments[5].slide.items[0]` — "timetable" → schedule  
  > timetable

### L1032 — We Are Responsible For…
- **warn** punctuation `title` — "…" → "..."  
  > We Are Responsible For…
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Children have the right to learn and play. Today, Amara brings her drawing book to the Children's Coun…
- **warn** uk-word `conversation.lines[0].en` — "Biscuit" → cookie(s)  
  > I'm playing Amara! This is Biscuit, and this is Pepper. Who is responsible for feeding the cat?
- **warn** uk-word `conversation.lines[5].en` — "Biscuit" → cookie(s)  
  > I see your point. Amara walks Biscuit with her dad, right?
- **warn** uk-word `conversation.aiTask.starterEn` — "Biscuit" → cookie(s)  
  > Hi! I'm Amara. I have a dog named Biscuit and a cat named Pepper. What should pet owners do every day? Can you give me an example?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > We Are Responsible For…
- **warn** uk-word `teacher.segments[6].say` — "Biscuit" → cookie(s)  
  > Birimo plays Amara. This is Biscuit the dog, and this is Pepper the cat. Who is responsible for feeding the cat? Kiko says, Amara is. She f…
- **warn** uk-word `teacher.segments[6].subtitleEn` — "Biscuit" → cookie(s)  
  > Birimo plays Amara. This is Biscuit the dog, and this is Pepper the cat. Who is responsible for feeding the cat? Kiko says, Amara is. She f…
- **warn** uk-word `teacher.segments[6].slide.items[0]` — "Biscuit" → cookie(s)  
  > I'm playing Amara! This is Biscuit, and this is Pepper. Who is responsible for feeding the cat?

### L1033 — Helping at Home
- **warn** uk-word `teacher.segments[0].say` — "Biscuit" → cookie(s)  
  > Good morning, team! Last time, we took care of Biscuit and Pepper. Today, Olive asks a new question. What jobs do you do at home?
- **warn** uk-word `teacher.segments[0].subtitleEn` — "Biscuit" → cookie(s)  
  > Good morning, team! Last time, we took care of Biscuit and Pepper. Today, Olive asks a new question. What jobs do you do at home?

### L1036 — I Suggest That We…
- **warn** punctuation `title` — "…" → "..."  
  > I Suggest That We…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Suggest That We…

### L1040 — Children's Proposal
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1048 — Final Debate Practice
- **warn** uk-word `teacherScript` — "summer holidays" → summer/winter/spring vacation or break  
  > Hello, everyone! Last time, we said, Dear Mayor, I suggest that we put more benches in the park. Today, we are practicing for the big counc…

### L1050 — World 35 Grand Review
- **info** contraction `conversation.aiTask.starterEn` — "What is" → "what's"?

### L1051 — Down to Deep Sea City
- **info** contraction `conversation.lines[1].en` — "it is" → "it's"?

### L1054 — Life Under Pressure
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last time, we said, The reason why it's dark is that sunlight can't reach this deep. Today, Dr. Vale shows us something we…
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, The reason why it's dark is that sunlight can't reach this deep. Today, Dr. Vale shows us something we…

### L1056 — My Research Question
- **warn** wasei-eigo `teacher.segments[5].say` — "white board" → whiteboard  
  > Whiteboard. A big white board you write on with a marker. Squeak, squeak! Whiteboard!
- **warn** wasei-eigo `teacher.segments[5].subtitleEn` — "white board" → whiteboard  
  > Whiteboard. A big white board you write on with a marker. Squeak, squeak! Whiteboard!

### L1057 — Where Can We Find Information?
- **warn** canonical `conversation.lines[4].en` — "Okay" → OK  
  > Hmm, that's true. Okay, then I'll use books, too.

### L1059 — Is This Website Reliable?
- **warn** canonical `teacherScript` — "okay" → OK  
  > Hello, everyone! Last time, we said, According to this book, lanternfish swim up at night to eat. Today, Ms. Emma and Dr. Vale help us look…

### L1061 — In Short
- **warn** sentence-length `conversation.aiTask.starterEn` — 27 words > 22 (stage 5): "Here's a long fact: anglerfish live in the dark, they wait very still, and some…"  
  > Let's find out! Here's a long fact: anglerfish live in the dark, they wait very still, and some have a glowing lure on their head that smal…

### L1062 — The Main Point Is…
- **warn** punctuation `title` — "…" → "..."  
  > The Main Point Is…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > The Main Point Is…

### L1063 — Summarize in Three Sentences
- **info** contraction `conversation.lines[4].en` — "what is" → "what's"?
- **info** stiff-phrase `teacher.segments[3].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Tiny bit. A very, very small piece. This small! Tiny bit!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Tiny bit. A very, very small piece. This small! Tiny bit!

### L1066 — Today, I'd Like to Talk About…
- **warn** punctuation `title` — "…" → "..."  
  > Today, I'd Like to Talk About…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Today, I'd Like to Talk About…

### L1067 — First, Second, Finally
- **info** contraction `conversation.lines[5].en` — "it is" → "it's"?

### L1070 — Practice Presentation
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, In conclusion, the deep sea is full of surprises. Today is rehearsal day in the Great Dome. Lumi, Dr. …
- **info** contraction `conversation.lines[3].en` — "it is" → "it's"?

### L1072 — I'm Not Sure, But…
- **warn** punctuation `title` — "…" → "..."  
  > I'm Not Sure, But…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I'm Not Sure, But…

### L1073 — Asking Good Questions
- **info** stiff-phrase `teacher.segments[4].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Giant. Very, very big! Stretch up tall. Giant!
- **info** stiff-phrase `teacher.segments[4].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Giant. Very, very big! Stretch up tall. Giant!

### L1074 — I'll Look It Up
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, I have a question about the giant squid. Today, it's Birimo's turn. His research question is, Do deep-…
- **info** stiff-phrase `teacher.segments[7].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin opens a big encyclopedia, very, very slowly. Birimo copies the old turtle. Check your sources, young one!
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin opens a big encyclopedia, very, very slowly. Birimo copies the old turtle. Check your sources, young one!

### L1076 — Reading Three Sources
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, Does anyone have any questions? Today, Haru has a problem. He wants to say how long giant squid can gr…
- **info** stiff-phrase `teacher.segments[6].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin puts three sources on the table, very, very slowly. Haru reads. Source A says the squid was twelve meters l…
- **info** stiff-phrase `teacher.segments[6].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > At the Coral Library, Mr. Oswin puts three sources on the table, very, very slowly. Haru reads. Source A says the squid was twelve meters l…

### L1078 — My Presentation Script
- **warn** stiff-phrase `conversation.lines[2].en` — "very, very, very" → really ~ / super ~ / so ~  
  > Next, lanternfish are very, very, very cute!
- **warn** stiff-phrase `teacher.segments[7].say` — "very, very, very" → really ~ / super ~ / so ~  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very, very" → really ~ / super ~ / so ~  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **warn** stiff-phrase `teacher.segments[7].slide.items[0]` — "very, very, very" → really ~ / super ~ / so ~  
  > Next, lanternfish are very, very, very cute!
- **warn** stiff-phrase `teacher.segments[19].say` — "very, very, very" → really ~ / super ~ / so ~  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **warn** stiff-phrase `teacher.segments[19].subtitleEn` — "very, very, very" → really ~ / super ~ / so ~  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, We need to protect the places where these animals live. Today, it's time to write our presentation scr…
- **info** stiff-phrase `conversation.lines[2].en` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Next, lanternfish are very, very, very cute!
- **info** stiff-phrase `teacher.segments[7].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **info** stiff-phrase `teacher.segments[7].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Birimo adds, Next, lanternfish are very, very, very cute! Kiko laughs. That's not a fact, Birimo. How can we make it better?
- **info** stiff-phrase `teacher.segments[7].slide.items[0]` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Next, lanternfish are very, very, very cute!
- **info** stiff-phrase `teacher.segments[19].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **info** stiff-phrase `teacher.segments[19].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Quiz time! Which is better for a script? A, Lanternfish are very, very, very cute! B, Many lanternfish swim up toward the surface at night …
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1037 — How About Making a Map?
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)
