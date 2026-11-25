# Run 3 - owner decisions (read docs/night/BRIEF.md and docs/night2/BRIEF.md too; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run3/PROGRESS.md (Japanese).

## Goals of this run
1. Cleanup: night-logs/ must not be in git (add to .gitignore, git rm -r --cached night-logs). Rename World 12 to "えいごの王国" everywhere.
2. Parent accounts: parent registers and logs in; registers one or more children; children choose "who is playing"; parent dashboard.
   This is the base for monthly LINE reports and subscriptions later (NOT tonight: no LINE, no payments, no pricing).
3. Keep "trial mode" (おためしモード): without login, or when the DB is down, the app still works with built-in data as it does now.

## Product rules
- Payer/owner = parent (email + password). Learners = children (nickname, school grade 1-6, optional birth year). No real names required.
- AI conversation privacy: no consent form (owner decision). Collect the minimum data about children.
- Parent area is protected from children by a 4-digit parent PIN (set at registration), asked again when entering the parent area.
- Parent settings: optional daily lesson limit per child (default: no limit), change PIN/password, delete account (deletes all child data).
- Child UI text: simple hiragana-heavy Japanese. Parent UI text: polite standard Japanese.
- Never put a company name in the product.

## Technical rules
- Password hashing with Node crypto scrypt (no native modules). Sessions: random token in an httpOnly, Secure (in production), SameSite=Lax cookie;
  store only a hash of the token in the DB with expiry. Check the Origin header on state-changing requests. Simple in-memory rate limit for login.
- Never log passwords, tokens or PINs. Validate all input with zod. Generic error for wrong email/password.
- Replace the stub src/lib/auth.ts: currentUserId() = selected child of the logged-in parent; not logged in -> demo/trial user as today.
- DB schema changes: write a Prisma migration WITHOUT a running DB using
  npx prisma migrate diff --from-schema-datamodel <old schema copy> --to-schema-datamodel prisma/schema.prisma --script
  and save it under prisma/migrations/<timestamp>_<name>/migration.sql. Update prisma/seed.ts (demo parent optional, keep demo-user).
- The DB is usually not running: unit-test services with a mocked prisma. If Docker is available, also run docker compose up -d,
  migrate, seed and test for real; otherwise record that it was not possible.
- Every phase ends with: npx tsc --noEmit, npx vitest run, npx next build all passing. git add -A and git commit (Japanese message). Never push.
