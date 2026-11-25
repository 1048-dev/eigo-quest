# Phase 1 - trial carry-over and avatars
- Schema: User.avatarCharacter ("haru" | "riko" | "kiko" | "birimo", default by order for existing rows). Migration via prisma migrate diff (no DB needed).
- Child create/edit UI and API accept the avatar; child picker, header and parent overview show it. Child can change it from a small settings sheet.
- Carry-over: detect trial progress (offline records in localStorage from offline mode; and progress of the demo/trial user if this device used it).
  After a child is selected for the first time, show "おためしで あそんだ きろくを ひきつぐ？" with yes/no. On yes, call an API that merges lessons completed,
  test passes, coins (sum), streak (max) and memories into that child, idempotently (only once per device, store a flag), then clears the local trial records.
  Never move another family's data; the demo user data in the DB stays for other trial players (copy, not move).
- Tests: merge logic (pure function), API ownership, idempotency.
