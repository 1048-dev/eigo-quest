# Run 10 - full quality check + phrasebook (read earlier BRIEF.md files; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run10/PROGRESS.md (Japanese).

## Owner request
- Functional checks must be as close to perfect as possible. The owner cannot judge English, so everything must be verified by tests and reported with numbers.
- English expressions must be consistent across the whole app (one canonical way per function and stage, American English, natural spoken style).

## Rules
- Prefer exhaustive checks (all 1,200 lessons, all assessments, all stories) over sampling whenever it runs in reasonable time.
- When a check finds a bug, fix the root cause, add a regression test, and re-run.
- Test-only hooks (e.g. revealing correct answers for the click-through robot) must exist only when NODE_ENV=test or E2E=1 and must never ship to production builds.
- Real database for checks: use Docker Postgres on port 5544 if Docker works; otherwise use the npm package "embedded-postgres" (devDependency) on port 5544. Never touch the database on port 5432 (another project).
- Long-running scripts print progress and have timeouts. Every phase ends with tsc, vitest, next build passing; git add -A; git commit (Japanese message). Never push.
- Never put a company name in the product. Keep trial/offline mode working.
