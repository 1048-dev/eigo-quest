/** ドメイン型（Prisma に依存しない純粋な型。ロジックはこの型だけで単体テストできる） */

export type Skill = "SCHOOL_TEST" | "PHONICS" | "LISTENING" | "SPEAKING" | "VOCABULARY" | "WRITING";
export const SKILLS: readonly Skill[] = ["SCHOOL_TEST", "PHONICS", "LISTENING", "SPEAKING", "VOCABULARY", "WRITING"];

export type ItemKind = "WORD" | "EXPRESSION" | "COMMAND" | "PHONICS";
export type AssessmentKind = "DAILY_CHECK" | "MINI" | "BOSS" | "ARENA" | "TREASURE";
export type AttemptSource = "NORMAL" | "ARENA" | "TREASURE_ALERT";

export interface LessonDef {
  lessonNo: number;
  world: number;
  title: string;
  titleJa: string;
  school: {
    grade: string;
    topic: string;
    grammar: string;
    expressions: { en: string; ja: string; core?: boolean }[];
    testPoints: string[];
  };
  tpr: { en: string; ja: string; action: string; emoji: string }[];
  phonics: { rule: string; focus: string[]; sounds: string[]; words: string[]; tipJa: string };
  vocab: { en: string; ja: string; emoji: string; core?: boolean }[];
  teacherScript: string;
  /** その日の「日常会話シーン」（インプット → AIキャラとのアウトプット）。旧データには無いので省略可 */
  conversation?: LessonConversation;
  /** 「きょうのまとめ」動画用のハイライト（省略可） */
  recap?: { highlightsJa: string[] };
}

export interface ConversationLine {
  /** 話す人: "Haru" | "Riko" | "Kiko" | "Birimo" | "Ms. Emma" */
  speaker: string;
  en: string;
  ja: string;
}

export interface LessonConversation {
  scene: string;
  sceneJa: string;
  lines: ConversationLine[];
  aiTask: {
    /** 子ども向けのゴール（ひらがな多め） */
    goalJa: string;
    /** AIキャラの最初のひとこと */
    starterEn: string;
    /** 使ってほしい表現（"I'm ～." のように ～ はあき） */
    targetExpressions: string[];
  };
}

export interface LearningItemDef {
  id: string;
  lessonNo: number;
  kind: ItemKind;
  text: string;
  ja: string;
  emoji?: string;
  schoolCore: boolean;
  skills: Skill[];
}

export interface AssessmentDef {
  id: string;
  kind: AssessmentKind;
  rangeStart: number;
  rangeEnd: number;
  questionCount: number;
  passRate: number;
  unlocksLesson: number | null;
}

/** 記憶状態（DB: ItemMemory） */
export interface MemoryState {
  itemId: string;
  stability: number; // 日
  difficulty: number; // 1..10
  reviewCount: number;
  lapses: number;
  accuracyEwma: number; // 0..1
  lastReviewedAt: Date;
}

/** 解答ログ（DB: ItemResponse の必要部分） */
export interface ResponseLog {
  itemId: string;
  skill: Skill;
  correct: boolean;
  score?: number | null;
  responseMs?: number | null;
  playbackRate?: number | null;
  createdAt: Date;
}

export type MasteryScores = Record<Skill, number>;
