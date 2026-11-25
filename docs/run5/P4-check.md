# Phase 4 - full check
- Build, start with the DB down, run the smoke script (add the new pages). Fix everything.
- If Docker is available: Postgres on 5544, migrate, seed, then: two different browsers play in trial mode (separate progress and coins) -> register -> carry-over from the parent page button
  -> forgot password (read the email from the outbox) -> reset -> old session is logged out -> forgot PIN -> monthly dry-run with STORAGE_DRIVER=local: report PDF made in Node + worksheet bundle link works.
- Make sure scripts/run4-flow-check.ts (and any new flow check) prints progress and has timeouts.
- Security self-review of reset tokens, mailer, storage, cron routes. Fix findings and list them in PROGRESS.md.
