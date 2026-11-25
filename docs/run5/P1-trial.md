# Phase 1 - trial learner per device + carry-over button
- Anonymous trial learner per device (User row flagged isTrial, no parent). Created lazily on first game API call when the DB is up; id in an httpOnly cookie.
  currentUserId(): logged-in selected child > device trial learner > (DB down) offline mode as today. Remove reliance on the shared "demo-user" for play (keep it only for seed/demo if needed).
- Carry-over now also copies the device trial learner's DB progress (plus browser offline records) into the chosen child, once per trial id.
- Parent page: "おためしの きろくを ひきつぐ" button (choose child, confirm) that works if this device still has trial progress.
- Cleanup: scripts/cleanup-trial.ts deletes trial learners (and their rows) unused for 60 days; dry-run flag; progress output.
- Tests: identity resolution order, carry-over of DB trial progress, cleanup selection.
