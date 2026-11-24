# Phase 3 - "today's recap" video
- New page /recap/[lessonNo]: a 2-3 minute auto-playing scene generated from lesson data (no video files needed).
- Hosts: Haru and Birimo (use existing character components). Sections: words, expressions, phonics, TPR, conversation highlight.
- Call-and-response: speak the English with speechSynthesis (en-US, rate about 0.9) -> show "いってみよう！" and pause about 2.5 s -> next.
  Progress bar, play/pause, replay. Works without sound support (text only) and without the DB.
- Optional, never a gate. Available for every completed lesson. Map: "きょうのまとめを見る" button for the latest completed lesson. Lesson result: link to it.
- Reward: 5 coins once per day when finished (POST /api/recap/[lessonNo]/watched, idempotent per day, success:true even if the DB is down).
- Tests for the recap script builder (pure function that turns a lesson into timed segments).
