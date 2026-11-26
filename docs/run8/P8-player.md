# Phase 8 - built-in virtual teacher player
- Replace the simple teacher step (when no videoUrl) with a "virtual classroom": large animated Ms. Emma (SVG) on the left/top, slide board on the right/bottom, subtitles below.
- Emma animation: idle breathing, blinking, mouth shapes while speaking (drive from speechSynthesis boundary events when available, otherwise a timed mouth loop),
  gestures per segment (wave, point at the board, nod, clap, think, open hands, mime for TPR), smooth transitions. Keep her adult and premium-looking, same character design.
- Voice: en-US female voice for English, ja-JP voice for Japanese, mixed lines split by language. Speed control (0.8 / 1.0), pause, replay segment, skip.
- Repeat-after-me: show "いってみよう！" with a countdown ring for pauseMs; optional mic level meter if permission is given (never required).
- Works without sound (subtitles + timed progression), without the DB, on phones (360-430px) and tablets.
- If videoUrl exists, play the real video instead (with subtitles if a .vtt exists next to it).
- Playwright screenshots of lesson 1, 300, 700 and 1100 teacher steps to docs/run8/screens/; look at them and fix layout problems. Tests for the segment timeline builder.
