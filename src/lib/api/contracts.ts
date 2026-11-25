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
import { AVATAR_CHARACTERS } from "@/lib/domain/avatars";

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

/**
 * すべてのレスポンスに付く共通の目印。
 *  success: 処理として成功したか（オフラインのデータを返したときも true）
 *  offline: DBにつながらず、内蔵のオフライン用データを返したとき true
 */
export const META = {
  success: z.boolean().optional().catch(undefined),
  offline: z.boolean().optional().catch(undefined),
};

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
  ...META,
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
  ...META,
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
  ...META,
  show: bool(false),
  alert: nullable(TreasureAlertSchema),
  messageJa: str(""),
});
export type TreasureAlertResponse = z.output<typeof TreasureAlertResponseSchema>;

// ---------------------------------------------------------------------------
// GET /api/ranking
// ---------------------------------------------------------------------------
export const RankingResponseSchema = z.object({
  ...META,
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
  ...META,
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
  ...META,
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
  z.object({ kind: z.literal("conversation"), minutes: num(3), character: z.enum(["haru", "riko", "kiko", "birimo"]).catch("haru"), maxTurns: num(6) }),
]);
const LessonSchema = z.object({
  lessonNo: z.number(), world: num(1), title: str(), titleJa: str(),
  // run7: ステージ（1〜5）と レベル（CEFR の めやす）。古いデータには 無い
  stage: z.number().int().optional().catch(undefined), level: z.string().optional().catch(undefined),
  school: z.object({ grade: str(), topic: str(), grammar: str(), expressions: safeArray(z.object({ en: str(), ja: str(), core: z.boolean().optional() })), testPoints: safeArray(z.string()) }),
  tpr: safeArray(z.object({ en: str(), ja: str(), action: str(), emoji: str() })),
  phonics: z.object({ rule: str(), focus: safeArray(z.string()), sounds: safeArray(z.string()), words: safeArray(z.string()), tipJa: str() }),
  vocab: safeArray(z.object({ en: str(), ja: str(), emoji: str(), core: z.boolean().optional() })),
  teacherScript: str(),
  // 新しいレッスンだけが持つ（旧データ・壊れたデータは undefined / null になり、画面は会話ステップを出さない）
  conversation: nullable(z.object({
    scene: str(), sceneJa: str(),
    lines: safeArray(z.object({ speaker: str("Haru"), en: str(), ja: str() })),
    aiTask: z.object({ goalJa: str(), starterEn: str(), targetExpressions: safeArray(z.string()) })
      .catch({ goalJa: "", starterEn: "", targetExpressions: [] }),
  })).optional(),
  recap: nullable(z.object({ highlightsJa: safeArray(z.string()) })).optional(),
});
export const LessonResponseSchema = z.object({
  ...META,
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
  ...META,
  ok: bool(false),
  reasonJa: str(""),
  reward: RewardSchema,
  nextTest: z.string().optional().catch(undefined),
  /** ok:false の理由（"DAILY_LIMIT" = おうちの方が決めた1日の回数に届いた） */
  code: z.string().optional().catch(undefined),
  /** おためしモード（デモユーザー）の きろくとして保存された → 画面は この端末の「おためしの きろく」にも のこす */
  trial: z.boolean().optional().catch(undefined),
});
export type LessonCompleteResponse = z.output<typeof LessonCompleteResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/tests/:id/start , /submit
// ---------------------------------------------------------------------------
const PublicQuestionSchema = QuestionSchema.omit({ itemId: true, answer: true, explanationJa: true }).extend({ audioKey: str("") });
export const TestStartResponseSchema = z.object({
  ...META,
  assessment: nullable(AssessmentSchema),
  seed: num(0),
  questions: safeArray(PublicQuestionSchema),
});
export type TestStartResponse = z.output<typeof TestStartResponseSchema>;

export const TestSubmitResponseSchema = z.object({
  ...META,
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
  /** おためしモード（デモユーザー）の きろくとして保存された */
  trial: z.boolean().optional().catch(undefined),
});
export type TestSubmitResponse = z.output<typeof TestSubmitResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/grade/written
// ---------------------------------------------------------------------------
export const GradeResponseSchema = z.object({
  ...META,
  verdict: z.enum(["PASS", "RETRY", "WRONG"]).catch("WRONG"),
  feedbackJa: str("うまく採点できなかったよ。もう一回おしてね。"),
});
export type GradeResponse = z.output<typeof GradeResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/recap/:n/watched（きょうのまとめを最後まで見た → 1日1回 5コイン）
// DB が止まっていても ok:true（コイン 0）。まとめは「おまけ」なので失敗を子どもに見せない
// ---------------------------------------------------------------------------
export const RecapWatchedResponseSchema = z.object({
  ...META,
  ok: bool(true),
  /** 今回もらえたコイン（もう今日もらった・記録できなかったときは 0） */
  coinsAwarded: num(0),
  /** 今日の分はもう受け取りずみ */
  alreadyToday: bool(false),
  /** 記録できたか（DB が止まっていると false） */
  saved: bool(false),
  messageJa: str("さいごまで みたね！ すごい！"),
});
export type RecapWatchedResponse = z.output<typeof RecapWatchedResponseSchema>;

// ---------------------------------------------------------------------------
// POST /api/conversation（レッスンさいごの AIキャラとの かいわ）
// いつでも success:true。AI が使えないときは台本の返事（source:"script"）
// ---------------------------------------------------------------------------
export const ConversationTurnSchema = z.object({
  role: z.enum(["ai", "child"]).catch("child"),
  text: z.string().max(300).catch(""),
});
export const ConversationRequestSchema = z.object({
  lessonNo: z.coerce.number().int().min(1).catch(1),
  character: z.enum(["haru", "riko", "kiko", "birimo"]).catch("haru"),
  history: safeArray(ConversationTurnSchema).transform((h) => h.slice(-12)),
  childText: z.string().catch("").transform((s) => s.slice(0, 200)),
});
export type ConversationRequest = z.input<typeof ConversationRequestSchema>;
export const ConversationResponseSchema = z.object({
  success: bool(true),
  replyEn: str("Great job! Let's talk again!"),
  replyJa: str("よく できたね！ また おはなししよう！"),
  suggestions: safeArray(z.string()),
  usedTarget: bool(false),
  done: bool(false),
  turn: num(0),
  maxTurns: num(6),
  source: z.enum(["ai", "script"]).catch("script"),
});
export type ConversationResponse = z.output<typeof ConversationResponseSchema>;

// ---------------------------------------------------------------------------
// えいごの としょかん（run7 P-library）
// GET  /api/library            … 到達レッスン（解放の 判定）・きょうの ごほうびを もらったか
// POST /api/library/reward     … おはなし（クイズ）・チャンツ・フリートークを やりきった → 1日1回 5コイン
// POST /api/library/talk       … AI フリートーク（1ターン分の 返事）
// ---------------------------------------------------------------------------
export const LibraryStatusResponseSchema = z.object({
  ...META,
  /** クリアした いちばん先の レッスン（0 = まだ なし） */
  reachedLesson: num(0),
  rewardedToday: bool(false),
  coins: num(0),
  /** 1日1回の ごほうびの コイン数（表示用） */
  dailyCoins: num(5),
});
export type LibraryStatusResponse = z.output<typeof LibraryStatusResponseSchema>;

export const LibraryRewardRequestSchema = z.object({
  kind: z.enum(["story", "chant", "talk"]).catch("story"),
  id: z.string().max(40).catch(""),
  answers: z.array(z.number().int().min(-1).max(9)).max(10).catch([]),
  finished: z.boolean().catch(false),
  turns: z.coerce.number().int().min(0).max(50).catch(0),
});
export type LibraryRewardRequest = z.input<typeof LibraryRewardRequestSchema>;

export const LibraryRewardResponseSchema = z.object({
  ...META,
  ok: bool(true),
  coinsAwarded: num(0),
  alreadyToday: bool(false),
  /** やりきった（スタンプ・ごほうびの 対象） */
  completed: bool(false),
  /** コインを 記録できたか（DB が 止まっていると false） */
  saved: bool(false),
  messageJa: str(""),
});
export type LibraryRewardResponse = z.output<typeof LibraryRewardResponseSchema>;

export const LibraryTalkRequestSchema = z.object({
  themeId: z.string().max(40).catch(""),
  history: safeArray(ConversationTurnSchema).transform((h) => h.slice(-12)),
  childText: z.string().catch("").transform((s) => s.slice(0, 200)),
});
export type LibraryTalkRequest = z.input<typeof LibraryTalkRequestSchema>;

/** すべてのエラーレスポンスの形（ok=false + error） */
export const ErrorBodySchema = z.object({ error: str("") });

// ---------------------------------------------------------------------------
// GET /api/announcements（おしらせ）
// ---------------------------------------------------------------------------
export const AnnouncementSchema = z.object({
  id: z.string(),
  category: z.enum(["update", "event", "tips", "parents", "maintenance"]).catch("update"),
  title: str(""),
  body: str(""),
  date: str(""),
  pinned: bool(false),
});
export type Announcement = z.output<typeof AnnouncementSchema>;
export const AnnouncementsResponseSchema = z.object({
  ...META,
  announcements: safeArray(AnnouncementSchema),
});
export type AnnouncementsResponse = z.output<typeof AnnouncementsResponseSchema>;

// ===========================================================================
// 保護者アカウント（run3）
//  - リクエスト（〜RequestSchema）: サーバーが厳しく検証する（.catch を付けない。だめなら 400）
//  - レスポンス（〜ResponseSchema）: ほかと同じく .catch で安全なデフォルトに置きかわる
//  - 保護者向けの文言はていねい語、子ども向け（だれが あそぶ？・回数制限）はひらがな多め
// ===========================================================================

export const PASSWORD_RULES_JA = "8文字以上で、英字と数字を両方ふくめてください。";
export const AUTH_LIMITS = { maxChildren: 6, nicknameMax: 12, dailyLessonLimitMax: 10, passwordMin: 8, passwordMax: 128 } as const;

const EmailInput = z.string().trim().toLowerCase().min(3).max(254).email();
const PasswordInput = z.string().min(AUTH_LIMITS.passwordMin).max(AUTH_LIMITS.passwordMax)
  .refine((s) => /[A-Za-z]/.test(s) && /[0-9]/.test(s), { message: "password must contain letters and digits" });
const PinInput = z.string().regex(/^\d{4}$/);
const ChildIdInput = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);
const NicknameInput = z.string().trim().min(1).max(AUTH_LIMITS.nicknameMax)
  // 制御文字・HTML の山かっこは入れない
  .refine((s) => !/[\u0000-\u001f\u007f<>]/.test(s), { message: "invalid characters" });
const SchoolGradeInput = z.number().int().min(1).max(6);
const BirthYearInput = z.number().int().min(2000).max(2100).nullable();
const AvatarInput = z.enum(AVATAR_CHARACTERS);

export const RegisterRequestSchema = z.object({ email: EmailInput, password: PasswordInput, pin: PinInput });
export type RegisterRequest = z.input<typeof RegisterRequestSchema>;

/** ログインはルールを見せない（パスワードの形だけでヒントを与えない）。長すぎるものだけ弾く */
export const LoginRequestSchema = z.object({ email: z.string().trim().toLowerCase().min(1).max(254), password: z.string().min(1).max(AUTH_LIMITS.passwordMax) });
export type LoginRequest = z.input<typeof LoginRequestSchema>;

export const ChildCreateRequestSchema = z.object({
  nickname: NicknameInput,
  schoolGrade: SchoolGradeInput,
  birthYear: BirthYearInput.optional(),
  /** えらばなければ、きょうだいが まだ使っていない顔 */
  avatarCharacter: AvatarInput.optional(),
});
export type ChildCreateRequest = z.input<typeof ChildCreateRequestSchema>;

export const ChildUpdateRequestSchema = z.object({
  nickname: NicknameInput.optional(),
  schoolGrade: SchoolGradeInput.optional(),
  birthYear: BirthYearInput.optional(),
  avatarCharacter: AvatarInput.optional(),
}).refine((v) => v.nickname !== undefined || v.schoolGrade !== undefined || v.birthYear !== undefined || v.avatarCharacter !== undefined, { message: "nothing to update" });
export type ChildUpdateRequest = z.input<typeof ChildUpdateRequestSchema>;

export const ChildIdSchema = ChildIdInput;

/** PATCH /api/children/:id/avatar — 子どもが じぶんで 顔を かえる（暗証番号は いらない） */
export const ChildAvatarRequestSchema = z.object({ avatarCharacter: AvatarInput });

const TrialDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const TRIAL_LIMITS = { lessons: 400, tests: 400, studyDates: 800, items: 8000, coins: 1_000_000 } as const;
/**
 * POST /api/children/:id/carry-over — この端末の おためしの きろくを その子に ひきつぐ（端末の おためしIDごとに1回）。
 * 形が おかしい・多すぎるものは 400。中身の正しさ（無いレッスン・コインの上限）はサーバーの planTrialMerge が しらべる。
 */
export const TrialCarryRequestSchema = z.object({
  trialId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  lessons: z.record(z.string().regex(/^\d{1,4}$/), TrialDate).refine((o) => Object.keys(o).length <= TRIAL_LIMITS.lessons).default({}),
  tests: z.record(z.string().regex(/^[a-z0-9-]{1,40}$/), TrialDate).refine((o) => Object.keys(o).length <= TRIAL_LIMITS.tests).default({}),
  coins: z.number().int().min(0).max(TRIAL_LIMITS.coins).default(0),
  studyDates: z.array(TrialDate).max(TRIAL_LIMITS.studyDates).default([]),
  items: z.record(z.string().min(1).max(80), z.object({ t: z.number().finite(), ok: z.boolean() }))
    .refine((o) => Object.keys(o).length <= TRIAL_LIMITS.items).default({}),
});
export type TrialCarryRequest = z.input<typeof TrialCarryRequestSchema>;

export const VerifyPinRequestSchema = z.object({ pin: PinInput });

/** POST /api/auth/line/pin — LINE で登録したあと、はじめての暗証番号を決める */
export const SetupPinRequestSchema = z.object({ pin: PinInput });

export const ParentSettingsRequestSchema = z.object({
  /** 子どもごとの1日のレッスン回数の上限。null で「制限なし」 */
  dailyLessonLimit: z.object({ childId: ChildIdInput, limit: z.number().int().min(1).max(AUTH_LIMITS.dailyLessonLimitMax).nullable() }).optional(),
  /** PIN の変更（パスワードの再入力が必要） */
  changePin: z.object({ password: z.string().min(1).max(AUTH_LIMITS.passwordMax), newPin: PinInput }).optional(),
  /** パスワードの変更（今のパスワードが必要。ほかの端末はログアウト） */
  changePassword: z.object({ currentPassword: z.string().min(1).max(AUTH_LIMITS.passwordMax), newPassword: PasswordInput }).optional(),
}).refine((v) => v.dailyLessonLimit || v.changePin || v.changePassword, { message: "nothing to update" });
export type ParentSettingsRequest = z.input<typeof ParentSettingsRequestSchema>;

export const DeleteAccountRequestSchema = z.object({ password: z.string().min(1).max(AUTH_LIMITS.passwordMax) });

// --- レスポンス -------------------------------------------------------------
const AUTH_META = {
  ...META,
  ok: bool(false),
  /** 画面にそのまま出せるメッセージ（成功時は空のこともある） */
  messageJa: str(""),
  /** 機械向けの理由（"PIN_REQUIRED" | "NOT_LOGGED_IN" | "DAILY_LIMIT" など） */
  code: z.string().optional().catch(undefined),
};

export const ChildSchema = z.object({
  id: z.string(),
  nickname: str("なまえ"),
  schoolGrade: z.number().int().nullable().catch(null),
  birthYear: z.number().int().nullable().catch(null),
  /** えらんだ顔。古いデータ・壊れた値は null（画面は登録順の顔を出す） */
  avatarCharacter: z.enum(AVATAR_CHARACTERS).nullable().catch(null),
});
export type Child = z.output<typeof ChildSchema>;

export const AuthResultResponseSchema = z.object({ ...AUTH_META });
export type AuthResultResponse = z.output<typeof AuthResultResponseSchema>;

/** GET /api/auth/me — 未ログイン・DB 停止のときは loggedIn:false（= おためしモード） */
export const AuthMeResponseSchema = z.object({
  ...AUTH_META,
  loggedIn: bool(false),
  parent: nullable(z.object({
    /** LINE だけで登録した保護者は "" */
    email: str(""),
    /** LINE と連携ずみか・その表示名 */
    lineLinked: bool(false),
    lineDisplayName: z.string().nullable().catch(null),
    /** メール + パスワードでもログインできるか（false = LINE だけ。暗証番号の変更・退会の確認は暗証番号で行う） */
    hasPassword: bool(true),
    /** LINE で登録して まだ暗証番号を決めていない → /setup-pin へ */
    needsPin: bool(false),
  })),
  children: safeArray(ChildSchema),
  selectedChildId: z.string().nullable().catch(null),
  /** 保護者PINを入れてから一定時間内（おうちの方エリアに入れる） */
  pinUnlocked: bool(false),
  /** LINE ログインが使えるか（環境変数がそろっていて DB が動いている）。false なら LINE のボタンを出さない */
  lineLoginAvailable: bool(false),
});
export type AuthMeResponse = z.output<typeof AuthMeResponseSchema>;

export const ChildrenResponseSchema = z.object({
  ...AUTH_META,
  children: safeArray(ChildSchema),
  selectedChildId: z.string().nullable().catch(null),
});
export type ChildrenResponse = z.output<typeof ChildrenResponseSchema>;

export const ChildResponseSchema = z.object({ ...AUTH_META, child: nullable(ChildSchema) });
export type ChildResponse = z.output<typeof ChildResponseSchema>;

/** ひきつぎの結果（なにを いくつ ひきついだか）。alreadyCarried = この端末の きろくは もう ひきついである */
export const TrialCarryResponseSchema = z.object({
  ...AUTH_META,
  alreadyCarried: bool(false),
  /** ひきつぐものが なにも なかった（この端末の おためしの きろくが 空） */
  nothing: bool(false),
  carried: z.object({ lessons: num(0), tests: num(0), coins: num(0), memories: num(0), streakDays: num(0), monsters: num(0) })
    .catch({ lessons: 0, tests: 0, coins: 0, memories: 0, streakDays: 0, monsters: 0 }),
});
export type TrialCarryResponse = z.output<typeof TrialCarryResponseSchema>;

/**
 * GET /api/trial — この端末の おためし学習者（DB）に ひきつげる きろくが あるか（run5）。
 * つくらない・書かない。ref は「いいえ」を おぼえておくための しるし（トークンや User.id ではない）。
 */
export const TrialStatusResponseSchema = z.object({
  ...AUTH_META,
  hasProgress: bool(false),
  ref: z.string().nullable().catch(null),
  lessons: num(0),
  tests: num(0),
  coins: num(0),
});
export type TrialStatusResponse = z.output<typeof TrialStatusResponseSchema>;

export const VerifyPinResponseSchema = z.object({ ...AUTH_META, unlockedUntil: z.string().nullable().catch(null) });
export type VerifyPinResponse = z.output<typeof VerifyPinResponseSchema>;

export const ChildOverviewSchema = z.object({
  id: z.string(),
  nickname: str("なまえ"),
  schoolGrade: z.number().int().nullable().catch(null),
  avatarCharacter: z.enum(AVATAR_CHARACTERS).nullable().catch(null),
  lessonsDone: num(0),
  totalLessons: num(0),
  lessonsToday: num(0),
  streakDays: num(0),
  longestStreak: num(0),
  coins: num(0),
  /** 総合習得率 0〜100 */
  masteryOverall: num(0),
  lastStudyDate: z.string().nullable().catch(null),
  /** 習得率の低い能力（低い順・最大3つ。まだ学習していなければ空） */
  weakestSkills: safeArray(z.object({ skill: SKILL, labelJa: str(""), score: num(0) })),
  dailyLessonLimit: z.number().int().nullable().catch(null),
  // run7（6年カリキュラム）: いまの ステージ・レベル、学校の英語「○○ まで修了」、覚えた ことばの数
  stage: num(1),
  stageNameJa: str(""),
  level: str(""),
  /** 修了した 学校の英語（「小6」「中2」など。まだなら null） */
  schoolCompletedJa: z.string().nullable().catch(null),
  schoolLineJa: str(""),
  wordsLearned: num(0),
});
export type ChildOverview = z.output<typeof ChildOverviewSchema>;

export const ParentOverviewResponseSchema = z.object({ ...AUTH_META, children: safeArray(ChildOverviewSchema) });
export type ParentOverviewResponse = z.output<typeof ParentOverviewResponseSchema>;

export const ParentSettingsSchema = z.object({
  // 1つだけ壊れた値があっても、ほかの子の設定は残す（値ごとに検証して整数だけ通す）
  dailyLessonLimits: z.record(z.string(), z.unknown()).catch({})
    .transform((o) => Object.fromEntries(Object.entries(o).filter((e): e is [string, number] => Number.isInteger(e[1])))),
});
export type ParentSettings = z.output<typeof ParentSettingsSchema>;

export const ParentSettingsResponseSchema = z.object({
  ...AUTH_META,
  settings: ParentSettingsSchema.catch({ dailyLessonLimits: {} }),
});
export type ParentSettingsResponse = z.output<typeof ParentSettingsResponseSchema>;

/** 月ごとの学習レポート（LINE）の設定・状態 */
export const LineMonthlyStatusSchema = z.object({
  linked: bool(false),
  /** 公式アカウントを友だち追加しているか（null = まだ わからない） */
  friend: z.boolean().nullable().catch(null),
  enabled: bool(true),
  /** LINE へ本当に送れる設定か（false = 送信は準備中。押しても LINE には届かない） */
  messagingConfigured: bool(false),
  lastSentAt: z.string().nullable().catch(null),
  /** 次に「今すぐ送る」を押せる時刻（null = いつでも） */
  nextAllowedAt: z.string().nullable().catch(null),
});
export type LineMonthlyStatus = z.output<typeof LineMonthlyStatusSchema>;
const LINE_MONTHLY_DEFAULT: LineMonthlyStatus = { linked: false, friend: null, enabled: true, messagingConfigured: false, lastSentAt: null, nextAllowedAt: null };

/** GET/PATCH/POST /api/parent/line-monthly */
export const LineMonthlyResponseSchema = z.object({
  ...AUTH_META,
  status: LineMonthlyStatusSchema.catch(LINE_MONTHLY_DEFAULT),
  /** POST（今すぐ送る）: LINE には送らず outbox に書いた（送信の設定がまだ） */
  dryRun: bool(false),
  /** POST で dryRun のときだけ: ダウンロードページへのリンク（動作確認用） */
  links: safeArray(z.object({ childName: str(""), url: str("") })),
});
export type LineMonthlyResponse = z.output<typeof LineMonthlyResponseSchema>;

export const LineMonthlyRequestSchema = z.object({ enabled: z.boolean() });

// ===========================================================================
// パスワードの再設定・暗証番号を忘れた・メールアドレスの追加（run5）
// ===========================================================================
/** メールのリンクの トークン（形の くわしい確認は サーバーの isWellFormedToken） */
const MailTokenInput = z.string().min(1).max(128);

/** POST /api/auth/password-reset/request — 登録の有無に かかわらず 同じ答え */
export const ForgotPasswordRequestSchema = z.object({ email: EmailInput });
/** POST /api/auth/password-reset/check・/api/auth/email/check・/api/auth/email/confirm */
export const MailTokenRequestSchema = z.object({ token: MailTokenInput });
/** POST /api/auth/password-reset/complete */
export const ResetPasswordRequestSchema = z.object({ token: MailTokenInput, newPassword: PasswordInput });
/** POST /api/parent/email — LINE だけで登録した保護者が メールアドレス + パスワードを追加する（確認メールを送る） */
export const AddEmailRequestSchema = z.object({ email: EmailInput, password: PasswordInput });
/**
 * POST /api/parent/reset-pin — 暗証番号を忘れた。
 * password があれば パスワードで本人確認。無ければ この端末で さきに LINE の本人確認をしていること。
 */
export const ResetPinRequestSchema = z.object({ password: z.string().min(1).max(AUTH_LIMITS.passwordMax).optional(), newPin: PinInput });

/** check の答え: リンクが まだ使えるか と、どのメールアドレスあてか（一部を伏せる） */
export const MailTokenStatusResponseSchema = z.object({
  ...AUTH_META,
  valid: bool(false),
  maskedEmail: z.string().nullable().catch(null),
});
export type MailTokenStatusResponse = z.output<typeof MailTokenStatusResponseSchema>;

/** GET /api/parent/reset-pin — 「暗証番号を忘れた」画面で どの本人確認が使えるか */
export const ResetPinStatusResponseSchema = z.object({
  ...AUTH_META,
  hasPassword: bool(false),
  lineLinked: bool(false),
  /** この端末で LINE の本人確認をすませて、まだ時間内 */
  lineVerified: bool(false),
  lineLoginAvailable: bool(false),
});
export type ResetPinStatusResponse = z.output<typeof ResetPinStatusResponseSchema>;
