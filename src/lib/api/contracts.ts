/**
 * API の「契約」= サーバー（route.ts）とフロント（page.tsx）が共有する唯一のデータ定義。
 *
 * - ルートは `satisfies XxxResponse` で、この形どおりに返していることを型でチェックする。
 * - フロントは `apiGet(url, XxxSchema)` で受け取り、zod で検証する。
 *   各フィールドに `.catch(デフォルト)` を付けているので、
 *   空のレスポンス・壊れたJSON・項目の欠け・型違いがあっても、必ず「安全なデフォルト値」に置き換わる。
 *   → 画面側で `undefined.map` のような TypeError が起きない。
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// 部品
// ---------------------------------------------------------------------------
const str = (d = "") => z.string().catch(d);
const num = (d = 0) => z.number().finite().catch(d);
const bool = (d = false) => z.boolean().catch(d);

/** 配列: 配列でなければ []、要素ごとに検証して壊れた要素だけ捨てる */
export function safeArray<T extends z.ZodTypeAny>(item: T) {
  return z
    .array(z.unknown())
    .catch([])
    .transform((arr) => arr.flatMap((x) => {
      const r = item.safeParse(x);
      return r.success ? [r.data as z.output<T>] : [];
    }));
}

/** null 許容のオブジェクト: 壊れていたら null */
export function nullable<T extends z.ZodTypeAny>(s: T) {
  return z.unknown().transform((x) => {
    if (x == null) return null;
    const r = s.safeParse(x);
    return r.success ? (r.data as z.output<T>) : null;
  });
}

const SKILL = z.enum(["SCHOOL_TEST", "PHONICS", "LISTENING", "SPEAKING", "VOCABULARY", "WRITING"]);

export const UserSummarySchema = z.object({
  nickname: str("ハル"),
  coins: num(0),
  streakDays: num(0),
});
export type UserSummary = z.output<typeof UserSummarySchema>;
export const DEFAULT_USER: UserSummary = { nickname: "ハル", coins: 0, streakDays: 0 };

export const StageNodeSchema = z.object({
  key: z.string(),
  type: z.enum(["LESSON", "CHECK", "MINI", "BOSS"]),
  lessonNo: z.number(),
  assessmentId: z.string().optional(),
  world: num(1),
  status: z.enum(["CLEARED", "AVAILABLE", "WAIT_TOMORROW", "LOCKED"]),
});

const AssessmentSchema = z.object({
  id: z.string(),
  kind: z.enum(["DAILY_CHECK", "MINI", "BOSS", "ARENA", "TREASURE"]),
  rangeStart: num(1),
  rangeEnd: num(1),
  questionCount: num(0),
  passRate: num(0.8),
  unlocksLesson: z.number().nullable().catch(null),
});

export const ArenaInfoSchema = z.object({
  assessment: AssessmentSchema,
  unlocked: bool(false),
  titleJa: str("アリーナ"),
});

const LearningItemSchema = z.object({
  id: z.string(),
  lessonNo: num(0),
  kind: z.enum(["WORD", "EXPRESSION", "COMMAND", "PHONICS"]).catch("WORD"),
  text: str(),
  ja: str(),
  emoji: z.string().optional().catch(undefined),
  schoolCore: bool(false),
  skills: safeArray(SKILL),
});

// ---------------------------------------------------------------------------
// GET /api/map
// ---------------------------------------------------------------------------
export const MapResponseSchema = z.object({
  nodes: safeArray(StageNodeSchema),
  current: nullable(StageNodeSchema),
  arenas: safeArray(ArenaInfoSchema),
  user: nullable(UserSummarySchema),
});
export type MapResponse = z.output<typeof MapResponseSchema>;

// ---------------------------------------------------------------------------
// GET /api/dashboard
// ---------------------------------------------------------------------------
const ScoresSchema = z.object({
  SCHOOL_TEST: num(0), PHONICS: num(0), LISTENING: num(0), SPEAKING: num(0), VOCABULARY: num(0), WRITING: num(0),
});
export const DashboardResponseSchema = z.object({
  user: nullable(UserSummarySchema),
  scores: ScoresSchema.catch({ SCHOOL_TEST: 0, PHONICS: 0, LISTENING: 0, SPEAKING: 0, VOCABULARY: 0, WRITING: 0 }),
  overall: num(0),
  coverage: num(0),
  lessonsCompleted: num(0),
  totalLessons: num(0),
  weakest: safeArray(LearningItemSchema),
  history: safeArray(z.object({ date: z.string(), overall: num(0) })),
});
export type DashboardResponse = z.output<typeof DashboardResponseSchema>;

// ---------------------------------------------------------------------------
// GET /api/treasure-alert
// ---------------------------------------------------------------------------
export const TreasureAlertSchema = z.object({ id: z.string(), lessonNo: z.number(), multiplier: num(2) });
export const TreasureAlertResponseSchema = z.object({
  show: bool(false),
  alert: nullable(TreasureAlertSchema),
  messageJa: str(""),
});
export type TreasureAlertResponse = z.output<typeof TreasureAlertResponseSchema>;

// ---------------------------------------------------------------------------
// GET /api/ranking
// ---------------------------------------------------------------------------
export const RankingResponseSchema = z.object({
  scope: z.enum(["national", "friends"]).catch("national"),
  metric: z.enum(["coins", "streak"]).catch("coins"),
  rows: safeArray(z.object({ rank: z.number(), userId: z.string(), nickname: str("???"), value: num(0) })),
});
export type RankingResponse = z.output<typeof RankingResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/gacha
// ---------------------------------------------------------------------------
export const MonsterSchema = z.object({
  id: z.string(), nameEn: str("???"), nameJa: str("？？？"),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY"]).catch("COMMON"),
  theme: str(), imageKey: str(),
});
export const GachaResponseSchema = z.object({
  ok: bool(false),
  monster: nullable(MonsterSchema),
  /** はじめて手に入れたモンスターなら true */
  isNew: bool(false),
  coins: num(0),
  rareTickets: num(0),
  reasonJa: str(""),
});
export type GachaResponse = z.output<typeof GachaResponseSchema>;

// ---------------------------------------------------------------------------
// GET /api/monsters（図鑑: 持っているモンスター）
// ---------------------------------------------------------------------------
export const CollectionResponseSchema = z.object({
  owned: safeArray(z.object({ id: z.string(), count: num(1) })),
  coins: num(0),
  rareTickets: num(0),
});
export type CollectionResponse = z.output<typeof CollectionResponseSchema>;

// ---------------------------------------------------------------------------
// GET /api/lessons/:n , POST /api/lessons/:n/complete
// ---------------------------------------------------------------------------
const QuestionSchema = z.object({
  id: z.string(), itemId: z.string(),
  type: z.enum(["listen_choose", "tpr_reflex", "meaning_choose", "expression_choose", "phonics_sound", "spell", "speak"]),
  skill: SKILL, promptJa: str(),
  audioText: z.string().optional().catch(undefined),
  playbackRate: z.number().optional().catch(undefined),
  display: z.string().optional().catch(undefined),
  choices: z.array(z.object({ id: z.string(), label: str() })).optional().catch(undefined),
  answer: str(), explanationJa: str(),
  timeLimitMs: z.number().optional().catch(undefined),
});
const LessonStepSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("teacher_video"), minutes: num(3), script: str(), videoUrl: z.string().optional() }),
  z.object({ kind: z.literal("flashcards"), minutes: num(4), itemIds: safeArray(z.string()) }),
  z.object({ kind: z.literal("tpr"), minutes: num(4), itemIds: safeArray(z.string()) }),
  z.object({ kind: z.literal("phonics"), minutes: num(5), focus: safeArray(z.string()), words: safeArray(z.string()), tipJa: str() }),
  z.object({ kind: z.literal("school_expressions"), minutes: num(4), itemIds: safeArray(z.string()), testPoints: safeArray(z.string()) }),
  z.object({ kind: z.literal("pronunciation"), minutes: num(3), itemIds: safeArray(z.string()) }),
  z.object({ kind: z.literal("quiz"), minutes: num(4), questions: safeArray(QuestionSchema) }),
  z.object({ kind: z.literal("speed_listening"), minutes: num(3), rounds: safeArray(z.object({ rate: num(1), questions: safeArray(QuestionSchema) })) }),
]);
const LessonSchema = z.object({
  lessonNo: z.number(), world: num(1), title: str(), titleJa: str(),
  school: z.object({ grade: str(), topic: str(), grammar: str(), expressions: safeArray(z.object({ en: str(), ja: str(), core: z.boolean().optional() })), testPoints: safeArray(z.string()) }),
  tpr: safeArray(z.object({ en: str(), ja: str(), action: str(), emoji: str() })),
  phonics: z.object({ rule: str(), focus: safeArray(z.string()), sounds: safeArray(z.string()), words: safeArray(z.string()), tipJa: str() }),
  vocab: safeArray(z.object({ en: str(), ja: str(), emoji: str(), core: z.boolean().optional() })),
  teacherScript: str(),
});
export const LessonResponseSchema = z.object({
  lesson: nullable(LessonSchema),
  teacher: z.object({ name: str("Ms. Emma"), nameJa: str("エマ先生") }).catch({ name: "Ms. Emma", nameJa: "エマ先生" }),
  items: safeArray(LearningItemSchema),
  steps: safeArray(LessonStepSchema),
});
export type LessonResponse = z.output<typeof LessonResponseSchema>;

const CoinAwardSchema = z.object({ amount: num(0), labelJa: str("") });
const RewardSchema = z.object({ total: num(0), rareGachaTickets: num(0), coins: safeArray(CoinAwardSchema) })
  .catch({ total: 0, rareGachaTickets: 0, coins: [] });

export const LessonCompleteResponseSchema = z.object({
  ok: bool(false),
  reasonJa: str(""),
  reward: RewardSchema,
  nextTest: z.string().optional().catch(undefined),
});
export type LessonCompleteResponse = z.output<typeof LessonCompleteResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/tests/:id/start , /submit
// ---------------------------------------------------------------------------
const PublicQuestionSchema = QuestionSchema.omit({ itemId: true, answer: true, explanationJa: true }).extend({ audioKey: str("") });
export const TestStartResponseSchema = z.object({
  assessment: nullable(AssessmentSchema),
  seed: num(0),
  questions: safeArray(PublicQuestionSchema),
});
export type TestStartResponse = z.output<typeof TestStartResponseSchema>;

export const TestSubmitResponseSchema = z.object({
  ok: bool(false),
  reasonJa: str(""),
  score: num(0),
  passed: bool(false),
  passRate: num(0.8),
  feedback: safeArray(z.object({
    questionId: z.string(), correct: bool(false), verdict: z.string().optional().catch(undefined),
    feedbackJa: str(""), explanationJa: z.string().optional().catch(undefined), correctAnswer: z.string().optional().catch(undefined),
  })),
  reward: RewardSchema,
  unlocksLesson: z.number().nullable().catch(null),
});
export type TestSubmitResponse = z.output<typeof TestSubmitResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/grade/written
// ---------------------------------------------------------------------------
export const GradeResponseSchema = z.object({
  verdict: z.enum(["PASS", "RETRY", "WRONG"]).catch("WRONG"),
  feedbackJa: str("うまく採点できなかったよ。もう一回おしてね。"),
});
export type GradeResponse = z.output<typeof GradeResponseSchema>;

/** すべてのエラーレスポンスの形（ok=false + error） */
export const ErrorBodySchema = z.object({ error: str("") });
