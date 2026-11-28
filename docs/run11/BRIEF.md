# Run 11 - small fixes and cleanup (read earlier BRIEF.md files; this file wins)

You are working ALONE. Never ask questions. Record decisions in docs/run11/PROGRESS.md (Japanese).

## Owner decisions
1. Cleanup: remove the run-9 work folders (.run9-*/ and any other temporary work folders such as .run10-*) from git (git rm -r --cached) and add them to .gitignore.
   Keep any information that matters by making sure it is already in docs/run9 (change logs). Do not delete docs.
2. TPR emoji: the cross mark emoji (and similar) used for TPR actions like "Make an X" or for the word "mistake" is confusing because the app uses a cross for wrong answers.
   Replace it with a clearer emoji (for example a person crossing arms or another fitting one) everywhere in content and UI where it is not a wrong-answer marker.
3. Unify the remaining spelling variants to the more common American form everywhere: "me too" (not "me, too"), "seat belt", "tug-of-war", "lunchtime".
   Update learning item IDs and every reference (tests, slides, recap, conversation targets, phrasebook, lint rules) so validation passes. Add these to the phrasebook/lint so they stay unified.
4. Keep the UK-vs-US comparison lessons (L1011-1018) as they are.

## Rules
- Every phase ends with tsc, vitest, next build passing; git add -A; git commit (Japanese message). Never push. Never put a company name in the product.
- Real DB for checks: Docker or embedded-postgres on port 5544 only (never 5432).
