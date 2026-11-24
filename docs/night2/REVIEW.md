# Curriculum quality review (one block of worlds per run)
Review every lesson in the requested worlds of content/curriculum/lessons.json and FIX problems in place:
- English: natural native English a child would really hear; short; correct grammar and punctuation; consistent names.
- Japanese: simple hiragana-heavy Japanese for ages 6-12; correct meaning.
- Progression: vocabulary and grammar only use what was introduced before (or is introduced in that lesson); difficulty grows smoothly.
- School alignment: topics match docs/curriculum-plan.md; test points are realistic for that grade.
- Phonics: focus/sounds/words are correct and real words; words fit the phonics stage.
- Conversation: a real daily-life scene; lines flow naturally; aiTask goal is achievable; targetExpressions appear in the lesson.
- Titles: no confusing duplicates (review lessons may share a theme but titles must differ).
- TPR actions are safe and doable at home.
Keep the schema. Run the curriculum validation test, tsc, vitest, next build; commit. Write in docs/night2/PROGRESS.md what you changed (counts + examples).
