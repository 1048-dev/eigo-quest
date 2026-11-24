# Phase 1 - learning rules
1. Target age text -> 6-12 (README.md, package.json description, the system prompt in src/lib/grading/aiGrader.ts).
2. Assessments (src/lib/curriculum/index.ts buildAssessments):
   - check-N (DAILY_CHECK) for EVERY lesson N. It is now the "review quest" (fukushuu quest). unlocksLesson = null.
   - mini-(N-4)-N after every lesson divisible by 5 (not 30), boss-1-N after every multiple of 30: these remain GATES (unlocksLesson N+1). Arenas unchanged.
   - gateTestAfterLesson(N) returns only MINI/BOSS. Add reviewQuestFor(N).
3. Progression (src/lib/domain/progression.ts buildStageMap):
   - Lesson N+1 unlocks immediately when lesson N is completed AND the gate after N (if any) is passed. Gates are available immediately (no next-day wait).
   - Review quest nodes stay on the map right after their lesson but NEVER block: LOCKED until the lesson is done, WAIT_TOMORROW on the completion day,
     AVAILABLE from the next day, CLEARED when passed. skipDailyLock only affects review quests.
   - current = first AVAILABLE uncleared review quest, otherwise the first available blocking node.
   - Update canTakeGateTest messages ("this review quest opens tomorrow").
4. Coins (src/lib/domain/config.ts, coins.ts, progressService.ts):
   - New-lesson coins per day: 1st-3rd = 10, 4th = 6, 5th = 4, 6th+ = 2 (count today's completions before this one).
   - Review quest first try stays the best coins per minute (30). Labels: "fukushuu quest" in Japanese (復習クエスト).
   - Streak is the biggest reward: every study day +min(streakDays,10); every 7 days +50; every 30 days +300 and 1 rare gacha ticket.
5. Replace every "翌日テスト" wording with "復習クエスト" (map, TestRunner, lesson result, companion lines, comments, README).
   Lesson result: tell the child they can continue to the next lesson now, and tomorrow the review quest gives the most coins.
6. Update/extend tests (tests/progression.test.ts, tests/coins.test.ts) for all rules above.
