# Run 5 - owner decisions (read the BRIEF.md files of night, night2, run3, run4 too; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run5/PROGRESS.md (Japanese).

## Owner decisions (approved)
1. Keep LINE monthly delivery ON by default. Keep "send now" limits (10 min / 3 per day) and 30-day links.
2. Trial users per device: stop sharing one demo user. Each device gets its own anonymous trial learner (random id in an httpOnly cookie) when the DB is up;
   offline mode keeps using browser storage. Clean up trial learners unused for 60 days (script + documented cron).
3. Parent page gets a "おためしの きろくを ひきつぐ" button so carry-over is possible later even after answering "no".
4. Email password reset now (and "forgot PIN" via password). Payments/pricing: still later.
5. Prepare for publishing on the internet (needed for LINE): target Vercel + a managed PostgreSQL (e.g. Neon or Supabase), but keep the code vendor-neutral.

## Rules
- The DB is usually not running; keep trial/offline mode working. Docker Postgres for checks must use port 5544 (5432 is used by another project on this PC).
- Secrets only from environment variables; document new variables in .env.example (empty) and README. Never invent keys.
- Every phase ends with: npx tsc --noEmit, npx vitest run, npx next build all passing. git add -A and git commit (Japanese message). Never push.
- Long-running scripts you write must print progress lines, and must have a timeout.
- Never put a company name in the product.
