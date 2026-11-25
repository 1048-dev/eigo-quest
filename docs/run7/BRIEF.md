# Run 7 - 6-year curriculum (read all earlier BRIEF.md files; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run7/PROGRESS.md (Japanese).

## Owner decision (approved)
- Children should use the app from grade 1 to grade 6 (six years), not finish in 1.5 years. Many children do more than one lesson a day.
- Ideal: a grade-1 starter talks like a native 6th grader at grade 6. Promise to parents (realistic): CEFR A2-B1 conversation by grade 6
  (roughly Eiken grade 3 to grade 2 level); aim higher for children who use the extra input a lot. Going faster than school is fine.
- Structure by LEVEL, not school grade. Total about 1,200 lessons (about 6 years at 5 lessons a week, 40 weeks a year).
  The existing 360 lessons (school grade 1-6 topics) become Stage 1 (Pre-A1 to A1). New stages continue to A2, A2+, B1 and stretch toward B2.
- School alignment stays visible as a parent indicator: "school English completed up to grade N".
- Monthly PDF per 20 lessons (about one month at weekday pace) instead of per 30-lesson world.
- Extra daily input outside lessons (graded stories, read-alouds, songs/chants, free AI talk) is part of the design (the biggest lever for fluency).
- A yearly "力だめし" test (Eiken-like format, original questions) to show growth to parents.

## Content rules
- Natural native English. Original sentences only (never copy textbooks or published materials). Ages 6-12, topics stay child-appropriate as they grow older.
- Later stages: real conversation skills (asking follow-up questions, explaining, opinions with reasons, storytelling, describing pictures, phone/video call manners,
  school life, hobbies, travel, science/nature, social topics for kids), plus reading and writing growth. Phonics continues into spelling patterns and morphology.
- Every lesson keeps the existing schema including conversation, recap and teacher (the 3-4 minute teaching script format from docs/teacher-plan.md if it exists).
  English immersion in teacher scripts: Stage 2 mostly English with short Japanese help; Stage 3+ English only except tiny Japanese hints.

## Technical rules
- 1,200 lessons must not slow the app: never ship the whole curriculum to the browser. Split content into per-world JSON files loaded on the server
  (or lazily per world on the client for offline mode). Keep client bundles small; measure and record bundle sizes before/after.
- Keep trial/offline mode working. Every phase ends with tsc, vitest and next build passing; git add -A; git commit (Japanese message). Never push.
- If the requested world already exists and passes validation, do not redo it: just verify and move on (this run can be restarted safely).
- Long-running scripts print progress and have timeouts. Never put a company name in the product.
