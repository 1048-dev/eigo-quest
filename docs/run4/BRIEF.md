# Run 4 - owner decisions (read docs/night/BRIEF.md, docs/night2/BRIEF.md, docs/run3/BRIEF.md too; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run4/PROGRESS.md (Japanese).

## Owner decisions (all approved)
1. Keep: max 6 children per parent, PIN unlock valid 10 minutes.
2. Trial progress carry-over: when a parent registers (or logs in for the first time on that device) and adds/selects a child,
   offer to move the progress played in trial mode on this device (offline records in the browser and/or the demo/trial user) to that child. One time only, with a clear confirmation.
3. Avatar choice: each child chooses an avatar (Haru, Riko, Kiko, Birimo) when created and can change it later. Use it everywhere (child picker, header, parent overview).
4. LINE first (before payments): "Log in with LINE" for parents + monthly PDF delivery to parents through the LINE Official Account.
   The owner has NOT created the LINE channels yet. Build everything so it works as soon as the keys are put in .env,
   and works in a safe "dry-run" mode without keys. Never invent or hard-code keys.
5. Email password reset: later (not tonight). Payments/pricing: later.

## Rules
- The DB is usually not running; keep trial/offline mode working. If Docker is available you may run a throwaway Postgres on a free port (5432 is used by another project on this PC: use 5544).
- Secrets only from environment variables; document every new variable in .env.example (empty values) and README.
- Every phase ends with: npx tsc --noEmit, npx vitest run, npx next build all passing. git add -A and git commit (Japanese message). Never push.
- Never put a company name in the product.
