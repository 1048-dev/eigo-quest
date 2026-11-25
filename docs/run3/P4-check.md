# Phase 4 - full check
- Build, start with the DB down, run npm run smoke (extend scripts/smoke.ts with the new pages). Fix everything.
- If Docker is available: start Postgres, migrate, seed, and run a real flow (register -> add 2 children -> play lesson 1 as child A -> parent overview shows it -> switch to child B -> delete account). Fix bugs.
- Security self-review of the auth code (session fixation, cookie flags, ownership checks, rate limit, logging). Fix findings and list them in PROGRESS.md.
