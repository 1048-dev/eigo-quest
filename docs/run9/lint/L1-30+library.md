# English lint: L1-30+library

- 日付: 2026-11-27
- はんい: レッスン 1〜30 ＋ としょかん（`npm run english:lint -- --from 1 --to 30 --library`）
- しらべた 文字列: 3613（40 ユニット）
- 結果: **error 0 / warn 19 / info 2**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| canonical | 0 | 1 | 0 |
| lets-overuse | 0 | 0 | 2 |
| punctuation | 0 | 4 | 0 |
| stiff-phrase | 0 | 14 | 0 |

## ユニットごと

### L0001 — Hello! I'm Haru.
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > Nice to meet you. or Go!?

### L0003 — How are you?
- **warn** stiff-phrase `school.expressions[1].en` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacherScript` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > Good morning! How are you? I'm great! きょうは「げんき？」と きく ことば。I'm fine, thank you. で こたえてみよう。Clap your hands! Jump!
- **warn** stiff-phrase `conversation.lines[3].en` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[6].say` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > あさの がっこうの もんで、せんせいと リコちゃんが あいさつ するよ。Good morning, Riko! Good morning, Ms. Emma! How are you? I'm fine, thank you. How are you? I'm great!
- **warn** stiff-phrase `teacher.segments[6].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > Good morning, Riko! / How are you? / I'm fine, thank you. How are you? / I'm great!
- **warn** stiff-phrase `teacher.segments[6].slide.items[2]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[7].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. / I'm great!
- **warn** stiff-phrase `teacher.segments[7].slide.items[0]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacher.segments[8].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[8].slide.items[0]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you. How are you?
- **warn** stiff-phrase `teacher.segments[16].say` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacher.segments[16].subtitleEn` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** stiff-phrase `teacher.segments[16].slide.items[0]` — "I'm fine, thank you" → I'm good! / Great, thanks!  
  > I'm fine, thank you.
- **warn** punctuation `teacher.segments[19].subtitleEn` — use one ! or ?  
  > I'm great! or Good morning!?

### L0007 — I Like Pink!
- **warn** punctuation `teacher.segments[18].subtitleEn` — use one ! or ?  
  > Me too! or Pop!?

### L0022 — Put On Your Hat!
- **warn** punctuation `teacher.segments[16].subtitleEn` — use one ! or ?  
  > It's hot. or It's cold!?

### chant:c-01 — Hello, Hello Chant
- **warn** stiff-phrase `lines[1].en` — ", and you?" → How about you? / You?  
  > I'm fine, I'm fine, and you?

### story:s1-05 — Picnic Day
- **warn** canonical `lines[6].en` — "okay" → OK  
  > "That's okay! Let's share!" says Riko.

### L0024 — Let's Play!
- **info** lets-overuse `(lesson)` — 5 "Let's" in one lesson (aim ≤ 3)

### L0025 — Family Day at the Park (Review)
- **info** lets-overuse `(lesson)` — 4 "Let's" in one lesson (aim ≤ 3)
