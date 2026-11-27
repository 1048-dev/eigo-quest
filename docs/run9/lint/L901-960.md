# English lint: L901-960

- 日付: 2026-11-27
- はんい: レッスン 901〜960（`npm run english:lint -- --from 901 --to 960`）
- しらべた 文字列: 7776（60 ユニット）
- 結果: **error 0 / warn 7 / info 13**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 4 |
| grammar-habit | 0 | 1 | 0 |
| lets-overuse | 0 | 0 | 1 |
| punctuation | 0 | 6 | 0 |
| stiff-phrase | 0 | 0 | 5 |
| uk-word | 0 | 0 | 3 |

## ユニットごと

### L0907 — It Was Invented by…
- **warn** punctuation `title` — "…" → "..."  
  > It Was Invented by…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > It Was Invented by…

### L0908 — It Was Found Under the Sea
- **info** contraction `conversation.lines[0].en` — "it is" → "it's"?

### L0912 — When She Was Ten
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L0922 — I Respect Her Because…
- **warn** punctuation `title` — "…" → "..."  
  > I Respect Her Because…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Respect Her Because…

### L0926 — A Biography to Read
- **info** contraction `conversation.lines[4].en` — "What is" → "what's"?

### L0931 — The Desert of the Sun
- **info** stiff-phrase `teacher.segments[2].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Desert. A very, very dry place. Lots of sun, very little rain. Desert!
- **info** stiff-phrase `teacher.segments[2].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Desert. A very, very dry place. Lots of sun, very little rain. Desert!

### L0938 — Cactus Secrets
- **warn** grammar-habit `teacherScript` — "a rain" → uncountable: no a/an (some ~ / a piece of ~) (teacher script: intentional?)  
  > Hello, everyone! Last time, we said, Desert foxes have big ears so that they can stay cool. Today, Fen takes us to a cactus garden. Some ca…

### L0943 — Continents and Oceans
- **info** stiff-phrase `teacher.segments[3].say` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Ocean. A very, very big sea. Deep, blue, and wide. Ocean!
- **info** stiff-phrase `teacher.segments[3].subtitleEn` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Ocean. A very, very big sea. Deep, blue, and wide. Ocean!

### L0946 — The Graph Shows…
- **warn** punctuation `title` — "…" → "..."  
  > The Graph Shows…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > The Graph Shows…

### L0949 — Half, a Quarter, Thirty Percent
- **info** stiff-phrase `teacherScript` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > Hello, everyone! Last time, we said, There are twice as many camels as horses. Today, Dr. Mira draws a big circle on the whiteboard and cut…

### L0954 — How Much Water Do We Use?
- **info** uk-word `teacherScript` — "toilet" → bathroom / restroom  
  > Hello, everyone! Last time, we said, People planted trees. As a result, the village became green again. Today, we are back at our camp. Dr.…
- **info** uk-word `teacher.segments[5].say` — "toilet" → bathroom / restroom  
  > Flush. Push the button, and the toilet water goes whoosh! Flush!
- **info** uk-word `teacher.segments[5].subtitleEn` — "toilet" → bathroom / restroom  
  > Flush. Push the button, and the toilet water goes whoosh! Flush!

### L0956 — A Desert Story
- **info** contraction `conversation.lines[6].en` — "What is" → "what's"?

### L0929 — Corridor of Time Review
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)
