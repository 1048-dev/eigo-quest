# Phase 1 - teacher script design + World 1
1. docs/teacher-plan.md (Japanese): structure, timing (3-4 min), immersion ratio per world, gesture list, slide rules, how pauses for repeating work.
2. Extend LessonDef (optional): teacher?: { minutes: number; segments: {
     kind: "greet"|"goal"|"words"|"expressions"|"phonics"|"tpr"|"repeat"|"check"|"wrap";
     lang: "en"|"ja"|"mix"; say: string;            // what Emma says (TTS text)
     subtitleJa?: string; subtitleEn?: string;       // subtitles
     slide?: { title: string; items: string[]; emoji?: string };
     gesture?: "wave"|"point"|"nod"|"clap"|"think"|"open_hands"|"mime";
     pauseMs?: number;                               // time for the child to repeat / move
   }[] }
3. Write teacher scripts for lessons 1-30. Add a vitest validation (every lesson with teacher has 8+ segments, total spoken length fits 3-4 min, repeat segments have pauses, slide items exist in the lesson).
