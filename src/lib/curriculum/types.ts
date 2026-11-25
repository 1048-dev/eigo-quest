import type { LessonDef } from "@/lib/domain/types";

/** content/curriculum/worlds/world-NN.json（1ワールド = 30レッスン） */
export interface WorldFile {
  world: number;
  stage: number;
  level: string;
  lessons: LessonDef[];
}

export interface WorldIndexEntry {
  world: number;
  file: string;
  stage: number;
  level: string;
  firstLesson: number;
  lastLesson: number;
  lessonCount: number;
}

/** content/curriculum/index.json（小さな 索引。ブラウザにも のる） */
export interface CurriculumIndex {
  meta: { version: string; teacher: { name: string; nameJa: string }; lessonsPerWorld: number; miniTestEvery: number; note?: string };
  totalLessons: number;
  worlds: WorldIndexEntry[];
}
