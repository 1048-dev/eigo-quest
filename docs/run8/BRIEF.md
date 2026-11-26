# Run 8 - virtual teacher (read the BRIEF.md files of night, night2, run3, run4, run5, run7 too; this file wins)

You are working ALONE. Never ask questions. Decide reasonably, do it, record decisions in docs/run8/PROGRESS.md (Japanese).

## Why
The owner's core idea: a human-like teacher (Ms. Emma) teaches every lesson by video, input -> output.
Today the teacher step is only a ~30-second TTS greeting (teacherScript, about 84 characters). A realistic AI avatar video service will be chosen later.
Now: (1) write real 3-4 minute teaching scripts for all 1,200 lessons (content/curriculum/worlds/*.json, 40 worlds), (2) build a built-in animated "virtual teacher" player that teaches with those scripts now,
(3) prepare an exporter so the same scripts can later be turned into real avatar videos by any vendor, and plug those videos in through videoUrl.

## Teaching style (very important)
- Ms. Emma: warm, energetic native English teacher. Input first, then output: model -> children repeat -> use it.
- English immersion grows: World 1-2 mostly Japanese explanations with English models; World 3-6 about half; World 7-12 mostly simple English with short Japanese support;
  Stage 2 (worlds 13-20) English with tiny Japanese hints; Stage 3+ (worlds 21-40) English only (Japanese subtitles still provided).
- Every script: greeting -> today's goal -> new words with gestures -> expressions in a tiny scene -> phonics point -> TPR "do it with your body" -> repeat-after-me practice
  (with pauses for the child to speak) -> quick check question -> wrap-up and praise. Original sentences only. Ages 6-12.
- Natural native English; simple hiragana-heavy Japanese.

## Rules
- Keep the old teacherScript field (short summary) for compatibility. New data is optional (backward compatible).
- The DB is usually not running; keep trial/offline mode working.
- The curriculum lives in per-world files (see docs/curriculum-6year.md and src/lib/curriculum); never ship the whole curriculum to the browser.
- If the requested lessons already have valid teacher scripts, do not redo them (this run can be restarted safely).
- Every phase ends with: npx tsc --noEmit, npx vitest run, npx next build all passing. git add -A and git commit (Japanese message). Never push.
- Long-running scripts print progress and have timeouts. Never put a company name in the product. Never invent vendor API details: if unsure, build an exporter instead of calling an API.
