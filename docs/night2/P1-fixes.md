# Phase 1 - fixes and owner decisions
1. Apply every decision in docs/night2/BRIEF.md (rewards, phonics labels and example-word audio, conversation partner rotation, last-lesson message, world names).
2. Make sure the offline mode (src/lib/offline, withOffline in src/lib/api/server.ts) also covers the new night-1 features:
   lesson 9th step (conversation) and recap must work with the DB down; the map "recap" link must appear in offline mode for lesson 1 after finishing it offline if possible.
3. Install Playwright (devDependency) and chromium. Write scripts/smoke.ts that starts from a running server URL, visits every page
   (/map /dashboard /gacha /arena /ranking /lesson/1 /test/check-1 /recap/1 and a lesson from each world), fails on any page error or error text,
   and saves screenshots to docs/night2/screens/. Run it against "npx next start" (build first) with the DB down. Fix everything it finds.
