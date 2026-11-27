# Phase 1 - style guide, lint tool, feedback button
1. docs/english-style-guide.md (English rules with short Japanese notes): American English; child-directed register by stage; contractions; natural classroom language;
   list of stiff/Japanese-English patterns to avoid with natural alternatives (textbook dialogues like "I'm fine, thank you. And you?", overuse of "Let's ~!",
   wasei-eigo, unnatural "very" chains, literal translations, wrong article/plural habits, "Please ~" commands that sound rude, etc.); punctuation and capitalization rules;
   how Ms. Emma talks (warm, short sentences, praise variety); per-stage sentence length and vocabulary guidance.
2. scripts/english-lint.ts (npm run english:lint -- --from N --to M): spelling check with cspell (devDependency, en-US, project word list for names),
   UK spellings, banned phrase list from the guide, sentence length by stage, duplicate/near-duplicate lines, inconsistent forms of recurring expressions, ASCII punctuation issues.
   Prints a summary and writes docs/run9/lint/<range>.md. Must run without network.
3. In-app "この英語、へん？" report button (lesson steps, teacher subtitles, library): sends lesson/segment id + optional comment to an API that stores it (DB) or,
   when the DB is down, keeps it locally and retries later. Parent page shows nothing; an admin script lists reports. Tests.
