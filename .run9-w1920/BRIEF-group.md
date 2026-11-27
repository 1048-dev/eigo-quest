# Group review brief (run9, worlds 19-20, L541-600)

You review ONE group of 10 lessons of a Japanese kids' English app (ages 6-12, Stage 2 (A2, world 20 is grade 中2 level), illustrated virtual teacher Ms. Emma).
Repo: C:\Users\EMICLE\eigo-quest-night. Work only inside .run9-w1920/. Do NOT edit content/ world files, do not run git, do not commit.

## Read first
- docs/run9/BRIEF.md (review method; this is the law)
- docs/english-style-guide.md (style guide)
- .run9-w1718/notes/L481-490.md (a finished example of the notes you must write; copy its shape and tone)
- .run9-w1718/patches/10-L481-490.json (example patch file)
- Your dump: .run9-w1920/dump/<GROUP>.txt. Each line is `<path> = <json string>` of the CURRENT lesson state (block-wide fixes below are already applied).

## Already done block-wide (do not redo or undo)
Double end marks after English in Japanese; quiz choices "A / B" in subtitleEn; "Yes, it is. Or no, it isn't." in say; Okay/okay -> OK (also learning items L559/L573/L598);
British praise (Lovely work, Lovely manners, Brilliant) -> American; "Ms. Emma says/asks" in her own narration -> "I say / I ask" (JA わたし「); lowercase after "Now, / Then, / Next, / First, / After that, / Finally," mid-sentence;
autumn -> fall (L578, L580); "…" -> "..." in English titles (L573, L589); "Yesterday we ..." in lesson openings -> "Last time, we ..." (L562, L572); JA 「むかしの かたち」 -> 「すぎた かたち」;
AI conversation starter "Hi! I'm Ms. Emma." -> "Hi! I'm <partner>." (partner = "Next, talk with X!" in the wrap-up; the app never makes Ms. Emma the partner). Check that the REST of each starter makes sense coming from that child character (e.g. a child would not say "Today I'm the workshop master" oddly, or "my little brother" if inconsistent with the story) and fix only real problems.
Known keepers (do not change): "Well done!", L581 vocab "lovely" / "What a lovely house!" (learning item; natural for a guest), letter spell-outs ("i n g", "I N G"), deliberate wrong forms in quizzes, "Hello, my stars!"-type greetings, Japanese かれ/かのじょ, 「すぎた かたち」, "Thumbs up!" as an interjection, Japanese "…" in Japanese text, the AI-conversation line "なまえは いわなくて OK" and safety lines tested in tests/curriculum.test.ts ("It's OK to say no", "ask an adult", "Stay in one place", "Never write your home address on the internet", "calmly").

## What to review (every lesson, every field)
School expressions and grammar, vocab, TPR, phonics words and tips, conversation lines and aiTask, recap, teacherScript, and every teacher segment (say, subtitleJa, subtitleEn, slide), testPoints.
Write three INDEPENDENT reviewer passes per lesson BEFORE deciding:
 (A) American elementary school teacher: is this what a teacher/child would really say? (US English)
 (B) child ESL / language-acquisition specialist: level, progression, clarity, one new thing at a time, correct grammar rules and explanations, EN/JA meaning match, natural hiragana-heavy Japanese
 (C) voice actor reading the script aloud (TTS will read `say`): rhythm, easy to say, pauses, no accidental tongue-twisters, heteronyms, sound spellings that TTS will misread
Change a line ONLY when at least two reviewers flag it, or it is an objective error (grammar, spelling, fact, wrong meaning, wrong rule, EN/JA mismatch, unnatural Japanese). Prefer the smallest natural fix. Stage 2: new English sentences 12 words or fewer (lint warns over 12; current over-12 lines: L541/L557 starters, L557 lines[3], L586 lines[5], L599 lines[4] - fix if a natural split exists).
For sound/syllable spell-outs use the hyphen beat form (Ob-ser-va-tion) or real words, not invented respellings like "vay"/"jih" (lint spelling error and they show in subtitles).

## Consistency rules for patches
- say and subtitleEn are normally the same English; say may also contain a short Japanese aside that subtitleEn omits. If you change one, change the other (and subtitleJa if meaning changes, and slide.items if the slide shows that sentence).
- slide.items must be text that exists in the lesson (the checker validates). If you change a vocab word, expression, TPR command or phonics word, update every field that references it (items, recap, slides, aiTask targets, testPoints, teacherScript). Avoid changing learning items (school.expressions[].en, vocab[].en, tpr[].en, phonics words) unless objectively wrong; report them instead. If you do, grep tests/ for the old text and report the test line to me (do not edit tests).
- Keep teacher script length 180-240 s and the English share in band (the checker reports this).

## Output (exactly these two files)
1. .run9-w1920/patches/<NN>-<GROUP>.json: a JSON array of {"lesson": n, "path": "...", "before": "<exact current string>", "after": "...", "reviewers": "A+B" | "A+C" | "B+C" | "A+B+C" | "objective" | "objective (JA)", "reason": "short English reason"}. `before` must equal the current value exactly (copy from the dump with JSON escaping). One patch per field; if two fixes hit the same field, merge them into one patch. Write the file with a small Node script if that is easier than hand-escaping.
2. .run9-w1920/notes/<GROUP>.md: English notes in the same shape as the example: header "### Run 9 review notes: <GROUP> (world N, Stage 2)", a summary paragraph (patch count, lessons with no change, ID changes if any, themes, check result), then for each lesson "#### L<n> <title>" with "- A:", "- B:", "- C:", "- Decision:", then "#### Block-wide notes" (things seen that may recur elsewhere, kept-on-purpose items, single flags).

## Verify before finishing
Run: `npx tsx .run9-w1920/check.ts .run9-w1920/patches/<NN>-<GROUP>.json` from the repo root. It must end with "ALL OK" (no MISMATCH / NOPATH / NOOP, lengths and English share OK, slide items valid). Fix and re-run until it passes.
Final reply to me: patch count, lessons touched, any learning-item ID changes (and test lines that reference them), the 3 most important before -> after examples, and any block-wide issue you think I should fix across all 60 lessons (with the pattern). Keep it under 300 words.
