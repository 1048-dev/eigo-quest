# Run 9 - native-quality English review (read earlier BRIEF.md files; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run9/PROGRESS.md (Japanese).

## Owner decisions
- No real AI avatar videos (cost). The illustrated virtual classroom with Ms. Emma stays the teacher.
- No human native speaker can review the content. Build the most reliable AI-based process to make all English as close to native as possible.
- Standard: natural, warm, child-directed AMERICAN English (US spelling and usage everywhere).

## Review method (apply to every block)
1. Use docs/english-style-guide.md and the lint tool from Phase 1.
2. Mechanical checks first (npm run english:lint for the block): spelling, US/UK mix, banned stiff phrases, sentence length per stage, consistency of recurring expressions and names.
3. Three independent reviewer passes, done separately and written down before deciding:
   (A) an American elementary school teacher (is this what a teacher/child would really say?),
   (B) a child ESL / language-acquisition specialist (level, progression, clarity, one new thing at a time),
   (C) a voice actor reading the teacher script aloud (natural rhythm, easy to say, no tongue-twisters unless intended, good pauses).
   Change a line ONLY when at least two reviewers flag it, or when it is an objective error (grammar, spelling, factual, wrong meaning). Prefer the smallest natural fix.
4. Check that English and Japanese match in meaning, and that Japanese is natural, simple and hiragana-heavy for kids.
5. Keep lesson structure, item meaning and difficulty. If you change a vocab word or expression, update everything that references it (items, tests, teacher slides, recap, conversation targets) so validation still passes.
6. Log every change in docs/run9/changes/<block>.md: before -> after, which reviewers, reason (short). Mark reviewed lessons with "reviewed": "run9" (optional field) so later runs can skip them.

## Rules
- Original sentences only. Never put a company name in the product. Keep trial/offline mode working.
- Every phase ends with: npx tsc --noEmit, npx vitest run, npx next build all passing. git add -A and git commit (Japanese message). Never push.
- If a block is already marked reviewed and passes lint, verify quickly and move on (this run can be restarted safely).
