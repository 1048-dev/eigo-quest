# English lint: L841-900

- 日付: 2026-11-27
- はんい: レッスン 841〜900（`npm run english:lint -- --from 841 --to 900`）
- しらべた 文字列: 7861（60 ユニット）
- 結果: **error 0 / warn 14 / info 5**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 2 |
| lets-overuse | 0 | 0 | 3 |
| punctuation | 0 | 14 | 0 |

## ユニットごと

### L0842 — I Think So Because…
- **warn** punctuation `title` — "…" → "..."  
  > I Think So Because…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I Think So Because…

### L0847 — I See Your Point, But…
- **warn** punctuation `title` — "…" → "..."  
  > I See Your Point, But…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > I See Your Point, But…

### L0857 — So You Mean…
- **warn** punctuation `title` — "…" → "..."  
  > So You Mean…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > So You Mean…

### L0859 — Good Question!
- **warn** punctuation `conversation.lines[6].en` — "…" → "..."  
  > Hmm, give me a second… Because the sea is very dark at night!
- **warn** punctuation `teacher.segments[7].slide.items[1]` — "…" → "..."  
  > Hmm, give me a second… Because the sea is very dark at night!
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L0860 — Interview with Follow-Ups
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > Anchor waits at the door for me every day. He loves bones… and cake!

### L0868 — My Opinion Paragraph
- **warn** punctuation `conversation.lines[4].en` — "…" → "..."  
  > I think we should eat cake every day. First, it's sweet. Second, it's… sweet!
- **warn** punctuation `teacher.segments[7].slide.items[0]` — "…" → "..."  
  > I think we should eat cake every day. First, it's sweet. Second, it's… sweet!

### L0874 — The Building Which Makes Energy
- **info** contraction `conversation.lines[0].en` — "What is" → "what's"?

### L0891 — In 2050…
- **warn** punctuation `title` — "…" → "..."  
  > In 2050…
- **warn** punctuation `teacher.segments[0].slide.items[0]` — "…" → "..."  
  > In 2050…

### L0899 — City of Tomorrow Review
- **warn** punctuation `conversation.lines[5].en` — "…" → "..."  
  > I'm playing Nova! Beep… I'm not sure. It has a big clock on it.

### L0854 — Let's Decide
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0855 — Class Meeting Role-Play
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)

### L0884 — Test and Improve
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)
