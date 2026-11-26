# Phase 9 - export for real AI avatar videos (later)
- scripts/teacher-export.ts: for each lesson write exports/teacher/<lessonNo>/ with script.txt (plain, per segment with pause markers), script.json (segments),
  subtitles.vtt (Japanese + English) and slides.json. Also exports/teacher/summary.csv with total minutes per lesson and in total (for vendor cost estimates).
- A provider interface src/lib/teacherVideo/ (generate(lesson) -> video URL) with only a "manual" provider implemented: the owner uploads finished videos to storage and
  runs scripts/teacher-link.ts to set videoUrl (stored in a DB table or a JSON manifest; choose and document). No real vendor API calls tonight.
- docs/run8/VIDEO-VENDORS.md (Japanese): what to look for when choosing an AI avatar video service (Japanese + English voice quality, lip sync, custom avatar rights, commercial license, price per minute,
  API/batch), and how to estimate cost from summary.csv. Do not state prices you are not sure about; tell the owner to check current prices.
