/** ドメイン型（Prisma に依存しない純粋な型。ロジックはこの型だけで単体テストできる） */

export type Skill = "SCHOOL_TEST" | "PHONICS" | "LISTENING" | "SPEAKING" | "VOCABULARY" | "WRITING";
export const SKILLS: readonly Skill[] = ["SCHOOL_TEST", "PHONICS", "LISTENING", "SPEAKING", "VOCABULARY", "WRITING"];

export type ItemKind = "WORD" | "EXPRESSION" | "COMMAND" | "PHONICS";
export type AssessmentKind = "DAILY_CHECK" | "MINI" | "BOSS" | "ARENA" | "TREASURE";
export type AttemptSource = "NORMAL" | "ARENA" | "TREASURE_ALERT";

export interface LessonDef {
  lessonNo: number;
  world: number;
  /** run7: ステージ（1〜5。省略時は ワールドから決まる。src/lib/curriculum/stages.ts） */
  stage?: number;
  /** run7: CEFR の めやす（"Pre-A1" / "A1" / "A1+" / "A2" / "A2+" / "B1" / "B1+"。省略時は ワールドから決まる） */
  level?: string;
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
  /** run8: 3〜4 分の 授業の 台本（バーチャル先生 / 将来の アバター動画）。docs/teacher-plan.md。旧データには 無いので 省略可 */
  teacher?: TeacherScript;
}

export type TeacherSegmentKind = "greet" | "goal" | "words" | "expressions" | "phonics" | "tpr" | "repeat" | "check" | "wrap";
export type TeacherGesture = "wave" | "point" | "nod" | "clap" | "think" | "open_hands" | "mime";

export interface TeacherSegment {
  kind: TeacherSegmentKind;
  /** say の 言語（mix = 日本語と 英語が まざる。プレイヤーは 言語ごとに 声を きりかえる） */
  lang: "en" | "ja" | "mix";
  /** Ms. Emma が 話す ことば（TTS の テキスト） */
  say: string;
  /** 日本語字幕（かならず つける） */
  subtitleJa?: string;
  /** 英語字幕（英語が 入る セグメントに つける） */
  subtitleEn?: string;
  /** 黒板（スライド）。items は レッスンの ことば・表現・フォニックスから えらぶ */
  slide?: { title: string; items: string[]; emoji?: string };
  gesture?: TeacherGesture;
  /** 話した あとの「まち時間」（子どもが まねして いう / からだを うごかす）ミリ秒 */
  pauseMs?: number;
}

export interface TeacherScript {
  /** 予定の 長さ（分。3〜4） */
  minutes: number;
  segments: TeacherSegment[];
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
