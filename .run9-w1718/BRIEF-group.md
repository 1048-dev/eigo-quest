# Group review brief (run9, worlds 17-18, L481-540)

You review ONE group of 10 lessons of a Japanese kids' English app (ages 6-12, Stage 2, illustrated virtual teacher Ms. Emma).
Repo: C:\Users\EMICLE\eigo-quest-night. Work only inside .run9-w1718/. Do NOT edit content/ world files, do not run git, do not commit.

## Read first
- docs/run9/BRIEF.md (review method; this is the law)
- docs/english-style-guide.md (style guide)
- .run9-w1516/notes/L441-450.md (a finished example of the notes you must write; copy its shape and tone)
- .run9-w1516/patches/10-L421-430.json (example patch file)
- Your dump: .run9-w1718/dump/<GROUP>.txt. Each line is `<path> = <json string>` of the CURRENT lesson state.

## Already done block-wide (do not redo or undo)
Double end marks after English in Japanese; quiz choices "A / B" in subtitleEn; "Yes, I am. Or no, I'm not." in say; Okay/okay -> OK; British praise (Lovely, Brilliant) -> American;
"Ms. Emma says" in her own narration -> "I say"; lowercase after "Now, / Then, / Next, / First, / After that, / Finally," mid-sentence; L510 "Please enjoy!" -> "Have fun!"; L490 seg20 "That's it for today."; L510 "speed challenge"; L483 "key chain" will become "keychain".
Also known keepers (do not change): "Well done!", the reporter line "That's all for today's weather.", letter spell-outs ("i n g"), deliberate wrong forms in quizzes, "Hello, my stars!"-type greetings, Japanese かれ/かのじょ, 「すぎた かたち」 as the Japanese name for the past form.

## What to review (every lesson, every field)
School expressions and grammar, vocab, TPR, phonics words and tips, conversation lines and aiTask, recap, teacherScript, and every teacher segment (say, subtitleJa, subtitleEn, slide), testPoints.
Write three INDEPENDENT reviewer passes per lesson BEFORE deciding:
 (A) American elementary school teacher: is this what a teacher/child would really say? (US English)
 (B) child ESL / language-acquisition specialist: level, progression, clarity, one new thing at a time, EN/JA meaning match, natural hiragana-heavy Japanese
 (C) voice actor reading the script aloud (TTS will read `say`): rhythm, easy to say, pauses, no accidental tongue-twisters, heteronyms
Change a line ONLY when at least two reviewers flag it, or it is an objective error (grammar, spelling, fact, wrong meaning, wrong rule, EN/JA mismatch, unnatural Japanese). Prefer the smallest natural fix. Stage 2: new English sentences 12 words or fewer.

## Consistency rules for patches
- say and subtitleEn are normally the same English; say may also contain a short Japanese aside that subtitleEn omits. If you change one, change the other (and subtitleJa if meaning changes, and slide.items if the slide shows that sentence).
- slide.items must be text that exists in the lesson (the checker validates). If you change a vocab word, expression, TPR command or phonics word, update every field that references it (items, recap, slides, aiTask targets, testPoints). Avoid changing learning items (school.expressions[].en, vocab[].word, tpr[].en, phonics words) unless objectively wrong; report them instead. Also grep tests/ for the old text if you do.
- Keep teacher script length 180-240 s and the English share in band (the checker reports this).

## Output (exactly these two files)
1. .run9-w1718/patches/<NN>-<GROUP>.json: a JSON array of {"lesson": n, "path": "...", "before": "<exact current string>", "after": "...", "reviewers": "A+B" | "A+C" | "B+C" | "A+B+C" | "objective" | "objective (JA)", "reason": "short English reason"}. `before` must equal the current value exactly (copy from the dump with JSON escaping). One patch per field; if two fixes hit the same field, merge them into one patch.
2. .run9-w1718/notes/<GROUP>.md: English notes in the same shape as the example: header "### Run 9 review notes: <GROUP> (world N, Stage 2)", a summary paragraph (patch count, lessons with no change, ID changes if any, themes, check result), then for each lesson "#### L<n> <title>" with "- A:", "- B:", "- C:", "- Decision:", then "#### Block-wide notes" (things seen that may recur elsewhere, kept-on-purpose items, single flags).

## Verify before finishing
Run: `npx tsx .run9-w1718/check.ts .run9-w1718/patches/<NN>-<GROUP>.json` from the repo root. It must end with "ALL OK" (no MISMATCH / NOPATH / NOOP, lengths and English share OK, slide items valid). Fix and re-run until it passes.
Final reply to me: patch count, lessons touched, any learning-item ID changes, the 3 most important before -> after examples, and any block-wide issue you think I should fix across all 60 lessons (with the pattern). Keep it under 300 words.
