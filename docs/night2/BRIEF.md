# Night 2 - owner decisions (read docs/night/BRIEF.md too; this file wins when they differ)

You are working ALONE overnight. Never ask questions. Decide reasonably, do it, and record decisions in docs/night2/PROGRESS.md (Japanese).

## Decisions made by the owner today
- AI conversation privacy: NO consent form is needed. Keep the existing redaction of phone/email/URL. Do not store child utterances.
- Characters: keep SVG, but polish much further (quality is the top priority tonight).
- World names: you decide. Make ONE consistent name per world everywhere (map, docs/curriculum-plan.md, conversations, recap, README).
- After all 360 lessons: decide later. For now only: on the last lesson hide "next lesson" and show a simple "ぜんぶクリア！" message.

## Decisions delegated to you (apply them)
- Treasure alert must give less than a review-quest first try: base 12 x2 = 24 coins.
- Recap video reward: keep once per day (5 coins).
- Finishing the AI conversation: +5 coins (once per lesson).
- Spelling questions for grade 1-2 lessons: core words/expressions only (keep).
- Phonics buttons: read an example word (rain, bird, saw) instead of strange letter-name sounds; child-friendly labels instead of "a_e", "-st".
- Japanese lines are shown, not read aloud (keep).
- AI conversation partner rotates per lesson among Haru, Riko, Kiko and Birimo, matching who speaks in that lesson's scene.
- Seasonal events: skip.
- Playwright may be added as a devDependency, and "npx playwright install chromium" may be run, for screenshots and smoke tests.

## Rules
- The DB is usually not running. The app must still work (offline mode). Never show error screens for server/network problems.
- After every phase: npx tsc --noEmit, npx vitest run, npx next build must pass. Fix failures. git add -A and git commit (Japanese message). Never push.
- Never put a company name in the product. Never copy textbook text or Pokemon designs.
