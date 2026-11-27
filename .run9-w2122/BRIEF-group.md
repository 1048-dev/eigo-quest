# Group review brief (run9, worlds 21-22, L601-660)

You review ONE group of 10 lessons of a Japanese kids' English app (ages 6-12, Stage 3 (A2 -> A2+; world 21 = Tower of Messages: phone, messages, email, letters, past continuous; world 22 = Amber Library: books, stories, retelling, quotes, because/so), illustrated virtual teacher Ms. Emma).
Repo: C:\Users\EMICLE\eigo-quest-night. Work only inside .run9-w2122/. Do NOT edit content/ world files, src/, tests/, do not run git, do not commit.

## Read first
- docs/run9/BRIEF.md (review method; this is the law)
- docs/english-style-guide.md (style guide)
- .run9-w1920/notes/L541-550.md (a finished example of the notes you must write; copy its shape and tone)
- .run9-w1920/patches/10-L541-550.json (example patch file)
- Your dump: .run9-w2122/dump/<GROUP>.txt. Each line is `<path> = <json string>` of the CURRENT lesson state (block-wide fixes below are already applied).

## Already done block-wide (do not redo or undo)
Double end marks after English in Japanese; "A. Or, B." running examples -> "A. Or B." (L617, L651); Okay/okay -> OK everywhere (also learning items L604 "That's OK.", L654 phonics "Are you OK" - code/test already updated);
British praise (Lovely, Lovely manners, Brilliant) -> Great / Fantastic; lowercase TPR command after "Now," mid-sentence ("Now, write a note quickly!") and L614 "Then, pass it on!";
L612 title "…" -> "..."; L652 "where is the toilet?" -> "where is the bathroom?"; JA 「むかしの かたち」 -> 「すぎた かたち」 (L633, L638).
AI conversation partners were checked: starter, wrap-up "Next, talk with X!" and the app's partner all match (no "I'm Ms. Emma" starters in this block). Still check that each starter makes sense coming from that child character.
Known keepers (do not change): "Well done!", letter closings without end mark in L623 ("See you soon. Best wishes, Riko", "Love, Kiko" - correct letter format, tested), L644 "But that's all for today!" (storyteller cliffhanger line) and the quiz distractor "That's all for today.", quoted answers/word lists after "Then," / "First," that keep a capital ("Then, Sure. I'll tell her.", "First, Then, and Also", "First, Then, At the end"), L639 "answer, Me too! or Really?", Ms. Emma's own "I'm Ms. Emma" as the show host (L630), letter spell-outs ("e d", "R e"), deliberate wrong forms in quizzes, Japanese かれ/かのじょ, 「すぎた かたち」, "Thumbs up!" as an interjection, Japanese "…" in Japanese text, the AI-conversation line "なまえは いわなくて OK", and safety lines (L624 "Don't share your address online.", "Keep your password secret.", "If something feels strange, tell an adult." and anything matched in tests/curriculum.test.ts - grep before touching any learning item).
Quoted speech style: this app quotes speech in `say` WITHOUT quotation marks ("Haru says, She found an old book.", "He says, My birds can ..."), capital letter after the comma. This is the house style for TTS; keep it.

## What to review (every lesson, every field)
School expressions and grammar, vocab, TPR, phonics words and tips, conversation lines and aiTask, recap, teacherScript, and every teacher segment (say, subtitleJa, subtitleEn, slide), testPoints.
Write three INDEPENDENT reviewer passes per lesson BEFORE deciding:
 (A) American elementary school teacher: is this what a teacher/child would really say? (US English)
 (B) child ESL / language-acquisition specialist: level, progression, clarity, one new thing at a time, correct grammar rules and explanations, EN/JA meaning match, natural hiragana-heavy Japanese
 (C) voice actor reading the script aloud (TTS will read `say`): rhythm, easy to say, pauses, no accidental tongue-twisters, heteronyms (read/read, live, wind, close, tear, lead...), sound spellings that TTS will misread
Change a line ONLY when at least two reviewers flag it, or it is an objective error (grammar, spelling, fact, wrong meaning, wrong rule, EN/JA mismatch, unnatural Japanese). Prefer the smallest natural fix. Stage 3: new English sentences 15 words or fewer (lint warns over 15; the block currently has none).
For sound/syllable spell-outs use the hyphen beat form (Ob-ser-va-tion) or real words, not invented respellings like "vay"/"jih".
Watch especially: past continuous explanations (was/were + -ing, when/while), reported "says" relay messages, email/letter conventions (US: "Dear X," then a new line / comma; "Best wishes," "Love,"), British vs US usage (post/mail, mobile/cell phone, rubbish, queue, holiday/vacation, "at the weekend"), "this week"-type pacing words that assume a weekly schedule (fix in teacher narration only; fine inside stories), and story-telling grammar (said/asked/shouted with quotes, because vs so).

## Consistency rules for patches
- say and subtitleEn are normally the same English; say may also contain a short Japanese aside that subtitleEn omits. If you change one, change the other (and subtitleJa if meaning changes, and slide.items if the slide shows that sentence; also teacherScript if it contains the same sentence).
- slide.items must be text that exists in the lesson (the checker validates). If you change a vocab word, expression, TPR command or phonics word, update every field that references it (items, recap, slides, aiTask targets, testPoints, teacherScript). Avoid changing learning items (school.expressions[].en, vocab[].en, tpr[].en, phonics words) unless objectively wrong; report them instead. If you do, grep tests/ and src/lib/curriculum/ for the old text and report the lines to me (do not edit tests or src).
- Keep teacher script length 180-240 s and the English share in band (the checker reports this).

## Output (exactly these two files)
1. .run9-w2122/patches/<NN>-<GROUP>.json: a JSON array of {"lesson": n, "path": "...", "before": "<exact current string>", "after": "...", "reviewers": "A+B" | "A+C" | "B+C" | "A+B+C" | "objective" | "objective (JA)", "reason": "short English reason"}. `before` must equal the current value exactly (copy from the dump with JSON escaping). One patch per field; if two fixes hit the same field, merge them into one patch. Write the file with a small Node script if that is easier than hand-escaping (put the script inside .run9-w2122/tmp/).
2. .run9-w2122/notes/<GROUP>.md: English notes in the same shape as the example: header "### Run 9 review notes: <GROUP> (world N, Stage 3)", a summary paragraph (patch count, lessons with no change, ID changes if any, themes, check result), then for each lesson "#### L<n> <title>" with "- A:", "- B:", "- C:", "- Decision:", then "#### Block-wide notes" (things seen that may recur elsewhere, kept-on-purpose items, single flags).

## Verify before finishing
Run: `npx tsx .run9-w2122/check.ts .run9-w2122/patches/<NN>-<GROUP>.json` from the repo root. It must end with "ALL OK" (no MISMATCH / NOPATH / NOOP, lengths and English share OK, slide items valid). Fix and re-run until it passes.
Final reply to me: patch count, lessons touched, any learning-item ID changes (and test/src lines that reference them), the 3 most important before -> after examples, and any block-wide issue you think I should fix across all 60 lessons (with the pattern). Keep it under 300 words.
