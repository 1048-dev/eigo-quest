# Eigo Quest - owner decisions (source of truth for tonight)

You are working ALONE overnight. Never ask questions. When unsure, choose the most reasonable option,
do it, and record the decision in docs/night/PROGRESS.md (write PROGRESS.md in Japanese for the owner).

## Business
- Product: Eigo Quest, a monthly-subscription web app for families in Japan. Payer = parent, learner = child.
- Target: age 6-12 (children who can read). English level starts from ZERO (toddler level). Everyone starts at Lesson 1. NO skipping / no placement test.
- Core value: daily-conversation English INPUT and OUTPUT ("English brain"), with phonics as the foundation.
- School test prep is the entry point for Japanese parents: align topics with elementary school English from grade 1.
  - Grades 1-2: no national textbook; align with common pre-Let's-Try topics (greetings, colors, numbers, animals, food, body, feelings, weather...).
  - Grades 3-4: align with MEXT "Let's Try! 1/2" unit topics. Grades 5-6: align with Tokyo Shoseki "NEW HORIZON Elementary 5/6" unit topics.
  - NEVER copy textbook sentences or illustrations. Align topics/target expressions only; all sentences are original.
- Unlimited lessons per day, but the daily habit is the most important thing.
- Each lesson gets an optional 2-3 min "today's recap" video (auto-generated from lesson data).
- At the end of each lesson the child has a short English conversation with an AI character.
- Voice: AI voice (browser speech synthesis now). A realistic AI teacher video service will be chosen later: keep a videoUrl slot.
- Characters: original only (Haru 10 boy, Riko 8 girl, Kiko 7 girl, mascot Birimo, teacher Ms. Emma). Never copy Pokemon designs.
- Monthly PDF to parents via LINE, pricing, free trial, payments: NOT tonight.
- Do not put any company name in the product.

## Technical rules
- Next.js 15 App Router, TypeScript, Tailwind v4, Prisma 6 + PostgreSQL (DB is usually NOT running: do not depend on it), zod contracts, vitest.
- Curriculum single source: content/curriculum/lessons.json (LessonDef in src/lib/domain/types.ts). Items/tests are derived in src/lib/curriculum.
  worksheets/generate_worksheets.py reads the same JSON: keep existing fields; new fields must be optional.
- API contracts in src/lib/api/contracts.ts: every field has a safe default; the client never throws. Keep this style.
- Another branch "offline-resilience" (not on GitHub yet) rewrites src/lib/api/server.ts, src/lib/api/client.ts, src/lib/db.ts,
  src/lib/offline/*, the wrapper lines of every API route, page error handling and prisma/seed.ts.
  Keep your edits to those files minimal to make tomorrow's merge easy.
- Japanese UI text for children: simple hiragana-heavy Japanese.
- Finish every phase with: npx tsc --noEmit, npx vitest run, npx next build. Fix all failures. Then git add -A and git commit (Japanese message). NEVER push.
- Append to docs/night/PROGRESS.md: what was done, what was skipped and why, decisions, questions for the owner.
