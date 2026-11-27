# English lint: L961-1020

- 日付: 2026-11-27
- はんい: レッスン 961〜1020（`npm run english:lint -- --from 961 --to 1020`）
- しらべた 文字列: 7709（60 ユニット）
- 結果: **error 60 / warn 47 / info 17**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 5 |
| inconsistent-form | 0 | 1 | 0 |
| lets-overuse | 0 | 0 | 3 |
| please-command | 0 | 0 | 1 |
| punctuation | 0 | 8 | 0 |
| spelling | 1 | 0 | 0 |
| stiff-phrase | 0 | 0 | 5 |
| uk-spelling | 59 | 0 | 0 |
| uk-word | 0 | 38 | 3 |

## ユニットごと

### L0962 — Inside the Earth
- **info** contraction `conversation.lines[2].en` — "What is" → "what's"?

### L0963 — When a Volcano Erupts
- **info** contraction `conversation.lines[2].en` — "What is" → "what's"?

### L0965 — Earth Science Show
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, Volcanoes make hot springs and new islands. Today is the Earth Science Show at the museum! Dr. Mori, E…
- **info** stiff-phrase `teacher.segments[19].say` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > It's B! Very, very slowly. Only a few centimeters a year. Bravo!
- **info** stiff-phrase `teacher.segments[19].subtitleEn` — "Very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > It's B! Very, very slowly. Only a few centimeters a year. Bravo!

### L0968 — Tsunami Warnings
- **info** contraction `conversation.lines[0].en` — "what is" → "what's"?

### L0972 — Make Sure You…
- **warn** punctuation `title` — "…" → "..."  
  > Make Sure You…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Make Sure You…

### L0973 — A Family Meeting Place
- **info** contraction `conversation.lines[1].en` — "that is" → "that's"?

### L0977 — Stay Calm
- **error** spelling `teacherScript` — unknown word "osahashimo"  
  > Hello, everyone! Last time, we said, Get under a desk and hold on. Today, at the Island School, we learn what to do after the shaking stops…

### L0980 — Evacuation Drill
- **info** please-command `conversation.lines[1].en` — "Please listen carefully." → Can you ~? / Let's ~. / plain imperative  
  > Good morning, everyone. This is a drill. Please listen carefully.

### L0983 — Helping People Who Don't Speak Japanese
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L1000 — Lesson 1000 Welcome!
- **info** stiff-phrase `teacher.segments[0].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, I'd like to change some yen, please. Today is a very, very special day. Lesson one thousand! Flight el…
- **info** stiff-phrase `teacher.segments[0].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, I'd like to change some yen, please. Today is a very, very special day. Lesson one thousand! Flight el…

### L1002 — Would You Mind…?
- **warn** punctuation `title` — "…" → "..."  
  > Would You Mind…?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Would You Mind…?

### L1003 — Do You Know Where…?
- **warn** punctuation `title` — "…" → "..."  
  > Do You Know Where…?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Do You Know Where…?

### L1004 — Could You Recommend…?
- **warn** punctuation `title` — "…" → "..."  
  > Could You Recommend…?
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > Could You Recommend…?

### L1011 — Exploring the City
- **warn** uk-word `phonics.words[2]` — "queue" → line  
  > queue
- **warn** uk-word `phonics.words[3]` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacherScript` — "Queue" → line  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacherScript` — "Timetable" → schedule  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacherScript` — "pavement" → sidewalk  
  > Hello, everyone! Last time, we said, Thank you for your help. That's very kind of you. Today, it's time to explore Brightwater! The sun is …
- **warn** uk-word `teacher.segments[8].say` — "pavement" → sidewalk  
  > Sound time! Some words are different in the UK and the US. Underground. In the US, people say subway. Sidewalk. In the UK, people say pavem…
- **warn** uk-word `teacher.segments[8].subtitleEn` — "pavement" → sidewalk  
  > Sound time! Some words are different in the UK and the US. Underground. In the US, people say subway. Sidewalk. In the UK, people say pavem…
- **warn** uk-word `teacher.segments[9].say` — "Queue" → line  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].say` — "Timetable" → schedule  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Queue" → line  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Timetable" → schedule  
  > Queue. Q, u, e, u, e. It sounds just like the letter Q! In the US, people say line. Timetable. In the US, schedule. Both are correct Englis…
- **warn** uk-word `teacher.segments[9].slide.items[2]` — "queue" → line  
  > queue
- **warn** uk-word `teacher.segments[9].slide.items[3]` — "timetable" → schedule  
  > timetable
- **warn** uk-word `teacher.segments[17].say` — "queue" → line  
  > Quiz time! In the UK, people say queue. What do people in the US say? A, line. B, bridge. Think!
- **warn** uk-word `teacher.segments[17].subtitleEn` — "queue" → line  
  > Quiz time! In the UK, people say queue. What do people in the US say? A, line. B, bridge. Think!
- **warn** uk-word `teacher.segments[17].slide.items[0]` — "queue" → line  
  > queue
- **warn** uk-word `teacher.segments[18].say` — "queue" → line  
  > It's A, line! A queue is a line of people waiting. Fantastic!
- **warn** uk-word `teacher.segments[18].subtitleEn` — "queue" → line  
  > It's A, line! A queue is a line of people waiting. Fantastic!
- **warn** uk-word `teacher.segments[18].slide.items[0]` — "queue" → line  
  > queue
- **warn** uk-word `teacher.segments[19].slide.items[3]` — "queue" → line  
  > queue

### L1012 — At the Restaurant
- **warn** uk-word `phonics.words[1]` — "biscuit" → cookie(s)  
  > biscuit
- **warn** uk-word `teacherScript` — "Biscuit" → cookie(s)  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. We go to the fish rest…
- **warn** uk-word `teacherScript` — "rubbish" → trash  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. We go to the fish rest…
- **warn** uk-word `teacher.segments[9].say` — "Biscuit" → cookie(s)  
  > Sound time! More UK and US words. Bill. In the US, people say check. Biscuit. Bis, kit. Don't say the u! In the US, it's a cookie.
- **warn** uk-word `teacher.segments[9].subtitleEn` — "Biscuit" → cookie(s)  
  > Sound time! More UK and US words. Bill. In the US, people say check. Biscuit. Bis, kit. Don't say the u! In the US, it's a cookie.
- **warn** uk-word `teacher.segments[9].slide.items[1]` — "biscuit" → cookie(s)  
  > biscuit
- **warn** uk-word `teacher.segments[10].say` — "Biscuit" → cookie(s)  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].say` — "rubbish" → trash  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].subtitleEn` — "Biscuit" → cookie(s)  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].subtitleEn` — "rubbish" → trash  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **warn** uk-word `teacher.segments[10].slide.items[1]` — "biscuit" → cookie(s)  
  > biscuit
- **info** uk-word `teacherScript` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Hello, everyone! Last time, we said, Excuse me. Could you take our picture? Today, we're hungry after our long walk. We go to the fish rest…
- **info** uk-word `teacher.segments[10].say` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.
- **info** uk-word `teacher.segments[10].subtitleEn` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Candy. In the UK, people say sweets. Trash. In the UK, it's rubbish. Both are correct English! Your turn. Bill. Biscuit. Candy. Trash.

### L1013 — Lift or Elevator?
- **warn** uk-word `teacherScript` — "biscuits" → cookie(s)  
  > Hello, everyone! Last time, we said, Could we have the menu, please? After lunch, we stop by the Seagull Hotel. Two friendly travelers are …
- **warn** uk-word `teacherScript` — "on holiday" → on vacation  
  > Hello, everyone! Last time, we said, Could we have the menu, please? After lunch, we stop by the Seagull Hotel. Two friendly travelers are …
- **warn** uk-word `conversation.lines[4].en` — "on holiday" → on vacation  
  > I'm playing Mrs. Brown! I'm on holiday. Let's take the lift!
- **warn** uk-word `conversation.aiTask.starterEn` — "on holiday" → on vacation  
  > Let's pretend I'm Mrs. Brown from the UK. Hello, dears! I'm on holiday here. Shall we take the lift together? Oh, what do you call it in th…
- **warn** uk-word `teacher.segments[7].say` — "on holiday" → on vacation  
  > Kiko asks, What do people say in the US? Riko says, They say elevator. Mr. Green told me! Then Birimo says, I'm on holiday. Haru says, I'm …
- **warn** uk-word `teacher.segments[7].subtitleEn` — "on holiday" → on vacation  
  > Kiko asks, What do people say in the US? Riko says, They say elevator. Mr. Green told me! Then Birimo says, I'm on holiday. Haru says, I'm …
- **warn** uk-word `teacher.segments[7].slide.items[2]` — "on holiday" → on vacation  
  > I'm playing Mrs. Brown! I'm on holiday. Let's take the lift!
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1014 — Museum Tickets
- **error** uk-spelling `phonics.words[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `phonics.words[1]` — "centre" → "center" (US)  
  > centre
- **error** uk-spelling `phonics.words[2]` — "theatre" → "theater" (US)  
  > theatre
- **error** uk-spelling `phonics.words[3]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacherScript` — "Colour" → "Color" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "colour" → "color" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "Centre" → "center" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "centre" → "center" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "Theatre" → "theater" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "Favourite" → "Favorite" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacherScript` — "favourite" → "favorite" (US)  
  > Hello, everyone! Last time, we said, In the UK, people say lift. Today, we visit the City Museum. It's a big stone building near the castle…
- **error** uk-spelling `teacher.segments[8].say` — "colour" → "color" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].say` — "Favourite" → "Favorite" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].subtitleEn` — "colour" → "color" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].subtitleEn` — "Favourite" → "Favorite" (US)  
  > Sound time! Today, look at the spelling. In the UK, colour has a u. In the US, color has no u. Favourite has a u in the UK, too. The sound …
- **error** uk-spelling `teacher.segments[8].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[8].slide.items[1]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacher.segments[9].say` — "Centre" → "center" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "Colour" → "Color" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "Theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].say` — "Favourite" → "Favorite" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Centre" → "center" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Colour" → "Color" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Theatre" → "theater" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Favourite" → "Favorite" (US)  
  > Centre and theatre end with r, e in the UK. In the US, they end with e, r. Both are correct! Your turn. Colour. Centre. Theatre. Favourite.
- **error** uk-spelling `teacher.segments[9].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[9].slide.items[1]` — "centre" → "center" (US)  
  > centre
- **error** uk-spelling `teacher.segments[9].slide.items[2]` — "theatre" → "theater" (US)  
  > theatre
- **error** uk-spelling `teacher.segments[9].slide.items[3]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacher.segments[17].say` — "colour" → "color" (US)  
  > Quiz time! Which spelling is from the UK? A, colour with a u. B, color with no u. Think!
- **error** uk-spelling `teacher.segments[17].subtitleEn` — "colour" → "color" (US)  
  > Quiz time! Which spelling is from the UK? A, colour with a u. B, color with no u. Think!
- **error** uk-spelling `teacher.segments[17].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[18].say` — "colour" → "color" (US)  
  > It's A! In the UK, colour has a u. Both are correct English. Excellent!
- **error** uk-spelling `teacher.segments[18].subtitleEn` — "colour" → "color" (US)  
  > It's A! In the UK, colour has a u. Both are correct English. Excellent!
- **error** uk-spelling `teacher.segments[18].slide.items[0]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[19].slide.items[2]` — "colour" → "color" (US)  
  > colour

### L1015 — A Day in the City
- **error** uk-spelling `phonics.words[1]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacherScript` — "Colour" → "Color" (US)  
  > Hello, everyone! Last time, we said, One adult and four children, please. Is there a family discount? Tonight, Skye flies down to the hotel…
- **error** uk-spelling `teacherScript` — "colour" → "color" (US)  
  > Hello, everyone! Last time, we said, One adult and four children, please. Is there a family discount? Tonight, Skye flies down to the hotel…
- **error** uk-spelling `teacher.segments[9].say` — "Colour" → "Color" (US)  
  > Sound time! Let's review. Lift. In the US, elevator. Colour. In the UK, it has a u. Memorize. Memory, drop the y, and add i, z, e.
- **error** uk-spelling `teacher.segments[9].subtitleEn` — "Colour" → "Color" (US)  
  > Sound time! Let's review. Lift. In the US, elevator. Colour. In the UK, it has a u. Memorize. Memory, drop the y, and add i, z, e.
- **error** uk-spelling `teacher.segments[9].slide.items[1]` — "colour" → "color" (US)  
  > colour
- **error** uk-spelling `teacher.segments[10].say` — "Colour" → "Color" (US)  
  > Necessary. One c and two s's. Flight seven sixty. Read it in two parts. Your turn! Lift. Colour. Memorize. Necessary. Flight seven sixty.
- **error** uk-spelling `teacher.segments[10].subtitleEn` — "Colour" → "Color" (US)  
  > Necessary. One c and two s's. Flight seven sixty. Read it in two parts. Your turn! Lift. Colour. Memorize. Necessary. Flight seven sixty.
- **error** uk-spelling `teacher.segments[10].slide.items[1]` — "colour" → "color" (US)  
  > colour

### L1017 — Travel Brochure
- **error** uk-spelling `phonics.words[4]` — "theatre" → "theater" (US)  
  > theatre
- **error** uk-spelling `teacherScript` — "Theatre" → "theater" (US)  
  > Hello, everyone! Last time, we said, I'm writing to ask about the airport bus. Today is our last full day in Brightwater, and we have one f…
- **error** uk-spelling `teacherScript` — "theatre" → "theater" (US)  
  > Hello, everyone! Last time, we said, I'm writing to ask about the airport bus. Today is our last full day in Brightwater, and we have one f…
- **error** uk-spelling `teacher.segments[10].say` — "Theatre" → "theater" (US)  
  > Modernize. Modern plus i, z, e. Make it new! Theatre. In the US, theater. Your turn! Gate one oh two. Visitor. Excellent. Modernize. Theatr…
- **error** uk-spelling `teacher.segments[10].subtitleEn` — "Theatre" → "theater" (US)  
  > Modernize. Modern plus i, z, e. Make it new! Theatre. In the US, theater. Your turn! Gate one oh two. Visitor. Excellent. Modernize. Theatr…
- **error** uk-spelling `teacher.segments[10].slide.items[4]` — "theatre" → "theater" (US)  
  > theatre

### L1018 — My Travel Journal
- **error** uk-spelling `phonics.words[4]` — "favourite" → "favorite" (US)  
  > favourite
- **error** uk-spelling `teacherScript` — "Favourite" → "Favorite" (US)  
  > Hello, everyone! Last time, we said, Read the brochure. Which tour would you choose? Tonight is our last night in Brightwater. I give each …
- **error** uk-spelling `teacherScript` — "favourite" → "favorite" (US)  
  > Hello, everyone! Last time, we said, Read the brochure. Which tour would you choose? Tonight is our last night in Brightwater. I give each …
- **error** uk-spelling `teacher.segments[10].say` — "Favourite" → "Favorite" (US)  
  > Tomorrow. One m, two r's. Realize. Real plus i, z, e. Favourite. In the US, favorite. Your turn! Seven fifteen. Visit. Tomorrow. Realize. F…
- **error** uk-spelling `teacher.segments[10].subtitleEn` — "Favourite" → "Favorite" (US)  
  > Tomorrow. One m, two r's. Realize. Real plus i, z, e. Favourite. In the US, favorite. Your turn! Seven fifteen. Visit. Tomorrow. Realize. F…
- **error** uk-spelling `teacher.segments[10].slide.items[4]` — "favourite" → "favorite" (US)  
  > favourite

### L0986 — A Safety Poster
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L1009 — I Lost My Passport
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

## 書きかたの ゆれ（はんい ぜんたい）
- "bow and say thank you" ×1 (L0995) vs "bow and say, Thank you" ×1 (L1001)
