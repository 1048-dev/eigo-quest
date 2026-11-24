# Phase 2 - curriculum plan + World 1
1. Write docs/curriculum-plan.md (Japanese): 12 worlds x 30 lessons = 360 lessons (about one year at one lesson per day).
   - Worlds 1-2: zero level (sounds, greetings, colors, numbers, body, feelings, TPR), aligned with grade 1-2 topics.
   - Worlds 3-6: aligned with Let's Try! 1/2 unit topics (grades 3-4). Worlds 7-12: aligned with NEW HORIZON Elementary 5/6 unit topics.
   - Phonics sequence over the year: letter sounds (s a t p i n m d g o c k e u r h b f l j v w x y z qu) -> CVC blending -> digraphs (sh ch th wh ck ng)
     -> blends -> magic e -> vowel teams -> common sight words.
   - Every lesson has one daily-conversation scene (input -> output). Grammar grows slowly.
   - A table: world -> lessons -> school grade/topic -> phonics -> conversation scenes.
2. Extend LessonDef (optional, backward compatible) with:
   conversation?: { scene: string; sceneJa: string; lines: { speaker: string; en: string; ja: string }[];
                    aiTask: { goalJa: string; starterEn: string; targetExpressions: string[] } }
   and recap?: { highlightsJa: string[] } if useful. Update types and any code that needs it.
3. Rewrite lessons 1-30 in content/curriculum/lessons.json following the plan (school.grade "小1"/"小2" style). Natural native English, short and kid friendly.
   Session 1 keeps: Look! / Stop! / Come here! / Go!, "Hello. I'm ~.", phonics s and a. Session 30 is a world review with fast TPR.
4. Add a vitest test that validates the whole curriculum (schema, unique lessonNo and item ids, non-empty fields, phonics words present, conversation present for new lessons).
5. If python and reportlab are available, run worksheets/generate_worksheets.py to confirm it still works; otherwise note it in PROGRESS.md.
