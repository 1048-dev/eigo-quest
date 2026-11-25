# Phase 4 - full check
- Build, start with the DB down, run the smoke script (add new pages). Fix everything.
- If Docker is available: throwaway Postgres on port 5544, migrate, seed, then a real flow: play in trial mode -> register -> add child with avatar -> accept carry-over -> parent overview shows the trial progress -> run line:monthly --dry-run and open the generated download link.
- Security self-review of LINE login, download tokens and webhook. Fix findings and list them in PROGRESS.md.
- Write docs/run4/LINE-SETUP.md in Japanese for the owner: step by step how to create the LINE Official Account, the Messaging API channel and the LINE Login channel,
  which values to copy into which .env variables, which callback/webhook URLs to register, and that a public HTTPS URL is needed for real use.
