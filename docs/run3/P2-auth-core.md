# Phase 2 - parent accounts: data and API
1. Schema: Parent gets passwordHash, pinHash, settings (Json, e.g. dailyLessonLimit per child), deletedAt not needed (hard delete).
   New model Session { id, parentId, tokenHash @unique, selectedChildId?, expiresAt, createdAt }. Migration as described in BRIEF.
2. src/lib/auth/*: hashing (scrypt + timingSafeEqual), session create/read/rotate/destroy, currentParent(), currentUserId(), requireParent().
3. API (zod contracts in src/lib/api/contracts.ts, safe defaults):
   POST /api/auth/register {email,password,pin}, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me,
   GET/POST /api/children, PATCH/DELETE /api/children/:id, POST /api/children/:id/select,
   POST /api/parent/verify-pin, GET /api/parent/overview (each child: lessons done, streak, coins, mastery overall, last study date, weakest skills),
   PATCH /api/parent/settings, DELETE /api/parent/account (requires password).
   When the DB is down: auth endpoints return success:false with a friendly message (no crash); game endpoints keep the offline mode.
4. Daily lesson limit: enforce in lesson completion/start when set (friendly child message), default none.
5. Tests: hashing, sessions (expiry, rotation), contracts, route handlers with mocked prisma, ownership checks (a parent can never read another parent's child).
