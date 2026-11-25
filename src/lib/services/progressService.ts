/**
 * アプリケーションサービス層。純粋ドメインロジック（lib/domain）と DB（Prisma）をつなぐ。
 * ルートハンドラはこの層だけを呼ぶ。
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ALL_ITEMS, ASSESSMENTS, TOTAL_LESSONS, gateTestAfterLesson, getAssessment, getItem, itemsInRange, reviewQuestFor } from "@/lib/curriculum";
import { buildTestQuestions, hashSeed, type Question } from "@/lib/curriculum/questions";
import { CURRICULUM_RULES, MEMORY_RULES } from "@/lib/domain/config";
import { daysBetween, endOfLocalDay, localDate } from "@/lib/domain/dates";
import { mergeRewards, nextStreak, rewardForConversation, rewardForLesson, rewardForStreak, rewardForTest, type Reward } from "@/lib/domain/coins";
import { buildStageMap, canStartLesson, canTakeGateTest } from "@/lib/domain/progression";
import { updateMemory } from "@/lib/domain/memory";
import { computeMastery } from "@/lib/domain/mastery";
import { decideTreasureAlert, findForgettingLessons } from "@/lib/domain/treasureAlert";
import { listArenas, type ArenaMode } from "@/lib/domain/arena";
import type { AttemptSource, MemoryState, ResponseLog, Skill } from "@/lib/domain/types";
import { gradeWritten } from "@/lib/grading/aiGrader";
import type { Strictness, Verdict } from "@/lib/grading/localGrader";
import { checkDailyLessonLimit } from "@/lib/services/dailyLimit";

type Tx = Prisma.TransactionClient;

// ---------------------------------------------------------------------------
// 読み込みヘルパ
// ---------------------------------------------------------------------------
async function loadProgress(userId: string) {
  const [lessons, passed] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId, status: "COMPLETED" } }),
    prisma.testAttempt.findMany({ where: { userId, passed: true, source: "NORMAL" }, orderBy: { createdAt: "asc" } }),
  ]);
  const completedLessons = new Map(lessons.map((l) => [l.lessonNo, l.completedOn!]));
  const passedTests = new Map<string, string>();
  for (const a of passed) if (!passedTests.has(a.assessmentId)) passedTests.set(a.assessmentId, a.takenOn);
  return { completedLessons, passedTests };
}

async function loadMemories(userId: string): Promise<Map<string, MemoryState>> {
  const rows = await prisma.itemMemory.findMany({ where: { userId } });
  return new Map(rows.map((r) => [r.itemId, { ...r }]));
}

// ---------------------------------------------------------------------------
// マップ（ステージ）
// ---------------------------------------------------------------------------
export async function getStageMap(userId: string, now = new Date()) {
  const { completedLessons, passedTests } = await loadProgress(userId);
  const map = buildStageMap({
    totalLessons: TOTAL_LESSONS,
    lessonsPerWorld: CURRICULUM_RULES.lessonsPerWorld,
    completedLessons,
    passedTests,
    gateTestAfter: gateTestAfterLesson,
    reviewQuestFor,
    today: localDate(now),
    skipDailyLock: process.env.SKIP_DAILY_LOCK === "1",
  });
  return { ...map, arenas: listArenas(ASSESSMENTS, passedTests) };
}

// ---------------------------------------------------------------------------
// 解答ログ → 記憶モデル更新
// ---------------------------------------------------------------------------
export interface AnswerLog {
  itemId: string;
  skill: Skill;
  questionType: string;
  correct: boolean;
  score?: number;
  responseMs?: number;
  playbackRate?: number;
  answer?: string;
}

async function recordResponses(tx: Tx, userId: string, logs: AnswerLog[], context: AttemptSource, attemptId: string | null, now: Date) {
  if (logs.length === 0) return;
  await tx.itemResponse.createMany({
    data: logs.map((l) => ({ userId, ...l, context, attemptId })),
  });
  // 同一項目が複数スキルで出ても、記憶更新は「項目単位」で1回（全問正解なら正解扱い）
  const byItem = new Map<string, { correct: boolean; score: number }>();
  for (const l of logs) {
    const p = byItem.get(l.itemId);
    const s = l.score ?? (l.correct ? 1 : 0);
    byItem.set(l.itemId, p ? { correct: p.correct && l.correct, score: Math.min(p.score, s) } : { correct: l.correct, score: s });
  }
  const existing = await tx.itemMemory.findMany({ where: { userId, itemId: { in: [...byItem.keys()] } } });
  const prev = new Map(existing.map((m) => [m.itemId, m]));
  for (const [itemId, r] of byItem) {
    const next = updateMemory(prev.get(itemId), itemId, r.correct, now, r.score);
    const { itemId: _id, ...data } = next;
    await tx.itemMemory.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: { userId, itemId, ...data },
      update: data,
    });
  }
}

// ---------------------------------------------------------------------------
// コイン付与（台帳に追記 → User キャッシュ更新）。idempotencyKey で二重付与防止。
// ---------------------------------------------------------------------------
async function grantReward(tx: Tx, userId: string, reward: Reward, refType: string, refId: string) {
  for (const [i, c] of reward.coins.entries()) {
    await tx.coinLedger.create({
      data: { userId, amount: c.amount, reason: c.reason, multiplier: c.multiplier, refType, refId, idempotencyKey: `${userId}:${refType}:${refId}:${c.reason}:${i}` }, // idempotencyKey は全ユーザーで一意 → userId を入れる
    });
  }
  for (let i = 0; i < reward.rareGachaTickets; i++) {
    await tx.gachaTicket.create({ data: { userId, kind: "RARE", source: refId } });
  }
  if (reward.total > 0) {
    await tx.user.update({ where: { id: userId }, data: { coins: { increment: reward.total }, totalCoinsEarned: { increment: reward.total } } });
  }
}

async function touchStreak(tx: Tx, userId: string, today: string): Promise<Reward> {
  const u = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (u.lastStudyDate === today) return { coins: [], rareGachaTickets: 0, total: 0 };
  const streak = nextStreak({ streakDays: u.streakDays, lastStudyDate: u.lastStudyDate }, today, daysBetween);
  await tx.user.update({ where: { id: userId }, data: { streakDays: streak, longestStreak: Math.max(u.longestStreak, streak), lastStudyDate: today } });
  return rewardForStreak(streak);
}

// ---------------------------------------------------------------------------
// レッスン完了
// ---------------------------------------------------------------------------
export async function completeLesson(userId: string, lessonNo: number, input: { quizScore: number; speedListeningBest?: number; logs: AnswerLog[]; conversationFinished?: boolean }, now = new Date()) {
  const { nodes } = await getStageMap(userId, now);
  const guard = canStartLesson(nodes, lessonNo);
  if (!guard.ok) return { ok: false as const, reasonJa: guard.reasonJa };
  // おうちの方が決めた「1日のレッスン回数」（設定がなければ制限なし）
  const limit = await checkDailyLessonLimit(userId, lessonNo, now);
  if (!limit.ok) return { ok: false as const, reasonJa: limit.reasonJa, code: limit.code };
  if (input.quizScore < CURRICULUM_RULES.lessonQuizPassRate) {
    return { ok: false as const, reasonJa: "クイズをもう一回やってみよう！7割できたらクリアだよ。" };
  }
  const today = localDate(now);

  return prisma.$transaction(async (tx) => {
    const prev = await tx.lessonProgress.findUnique({ where: { userId_lessonNo: { userId, lessonNo } } });
    const alreadyCompleted = prev?.status === "COMPLETED";
    // 今日これまでに完了した新しいレッスン数（今回を含まない）→ 1日の回数でコインが変わる
    const completedTodayBefore = alreadyCompleted ? 0 : await tx.lessonProgress.count({ where: { userId, status: "COMPLETED", completedOn: today } });
    await tx.lessonProgress.upsert({
      where: { userId_lessonNo: { userId, lessonNo } },
      create: { userId, lessonNo, status: "COMPLETED", completedAt: now, completedOn: today, quizScore: input.quizScore, speedListeningBest: input.speedListeningBest },
      update: alreadyCompleted ? { quizScore: Math.max(prev!.quizScore ?? 0, input.quizScore) } : { status: "COMPLETED", completedAt: now, completedOn: today, quizScore: input.quizScore, speedListeningBest: input.speedListeningBest },
    });
    await recordResponses(tx, userId, input.logs, "NORMAL", null, now);
    const reward = rewardForLesson({ alreadyCompleted, completedTodayBefore });
    await grantReward(tx, userId, reward, "lesson", `${lessonNo}`);
    // AIキャラとの かいわを さいごまで やった → レッスンごとに1回だけ +5（台帳の idempotencyKey で二重付与を防ぐ）
    const convKey = `${userId}:conversation:${lessonNo}:CONVERSATION_FINISHED:0`;
    const convAlready = input.conversationFinished ? (await tx.coinLedger.findUnique({ where: { idempotencyKey: convKey } })) != null : true;
    const convReward = rewardForConversation({ finished: !!input.conversationFinished, alreadyRewarded: convAlready });
    await grantReward(tx, userId, convReward, "conversation", `${lessonNo}`);
    const streakReward = await touchStreak(tx, userId, today);
    await grantReward(tx, userId, streakReward, "streak", today);
    // nextTest: 次に進むためのゲート（まとめ/ボス）があればそれ、無ければ復習クエスト（あした）
    return { ok: true as const, reward: mergeRewards(reward, convReward), streakReward, nextTest: (gateTestAfterLesson(lessonNo) ?? reviewQuestFor(lessonNo))?.id };
  });
}

// ---------------------------------------------------------------------------
// テスト出題
// ---------------------------------------------------------------------------
export async function startTest(userId: string, assessmentId: string, opts: { arenaMode?: ArenaMode; reviewAlertId?: string }, now = new Date()) {
  const a = getAssessment(assessmentId) ?? treasureAssessment(assessmentId);
  if (!a) return { ok: false as const, reasonJa: "テストが見つかりません" };

  let fixedItemIds: string[] | undefined;
  if (a.kind === "TREASURE") {
    const alert = await prisma.reviewAlert.findFirst({ where: { id: opts.reviewAlertId, userId, status: { in: ["OFFERED", "ACCEPTED"] } } });
    if (!alert || alert.expiresAt < now) return { ok: false as const, reasonJa: "このお宝はもう消えちゃった…また明日！" };
    await prisma.reviewAlert.update({ where: { id: alert.id }, data: { status: "ACCEPTED" } });
    fixedItemIds = alert.itemIds;
  } else if (a.kind === "ARENA") {
    const { arenas } = await getStageMap(userId, now);
    if (!arenas.find((x) => x.assessment.id === a.id)?.unlocked) return { ok: false as const, reasonJa: "ボスをたおすとアリーナが開くよ！" };
  } else {
    const { nodes } = await getStageMap(userId, now);
    const guard = canTakeGateTest(nodes, a.id);
    if (!guard.ok) return { ok: false as const, reasonJa: guard.reasonJa };
  }

  const seed = hashSeed(`${userId}:${a.id}:${now.getTime()}`);
  const memories = a.kind === "ARENA" ? await loadMemories(userId) : undefined;
  const questions = buildTestQuestions(a, { seed, memories, now, arenaMode: opts.arenaMode, fixedItemIds });
  return { ok: true as const, assessment: a, seed, questions };
}

/** お宝アラート用の動的テスト定義: "treasure-<lessonNo>" */
function treasureAssessment(id: string) {
  const m = /^treasure-(\d+)$/.exec(id);
  if (!m) return undefined;
  const n = Number(m[1]);
  return { id, kind: "TREASURE" as const, rangeStart: n, rangeEnd: n, questionCount: CURRICULUM_RULES.treasureQuestions, passRate: CURRICULUM_RULES.treasurePassRate, unlocksLesson: null };
}

// ---------------------------------------------------------------------------
// テスト採点・提出
// ---------------------------------------------------------------------------
export interface SubmittedAnswer {
  questionId: string;
  value: string; // choice.id / 入力文字列 / 発音スコア("0.82")
  responseMs?: number;
}

export interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  verdict?: Verdict;
  feedbackJa: string;
  explanationJa?: string; // 救済措置: 不正解時の解説
  correctAnswer?: string;
}

export async function submitTest(
  userId: string,
  input: { assessmentId: string; seed: number; answers: SubmittedAnswer[]; arenaMode?: ArenaMode; reviewAlertId?: string },
  now = new Date(),
) {
  const started = await startTestQuestionsForGrading(userId, input, now);
  if (!started.ok) return started;
  const { assessment: a, questions } = started;
  const strictness: Strictness = a.kind === "MINI" || a.kind === "BOSS" ? "school" : "lenient";

  const feedback: QuestionFeedback[] = [];
  const logs: AnswerLog[] = [];
  for (const q of questions) {
    const ans = input.answers.find((x) => x.questionId === q.id);
    const fb = await gradeQuestion(q, ans?.value ?? "", strictness);
    feedback.push(fb);
    logs.push({ itemId: q.itemId, skill: q.skill, questionType: q.type, correct: fb.correct, responseMs: ans?.responseMs, playbackRate: q.playbackRate, answer: ans?.value });
  }
  const score = feedback.filter((f) => f.correct).length / Math.max(1, questions.length);
  const passed = score >= a.passRate;
  const today = localDate(now);
  const source: AttemptSource = a.kind === "ARENA" ? "ARENA" : a.kind === "TREASURE" ? "TREASURE_ALERT" : "NORMAL";
  // TREASURE は動的ID（treasure-12）なので Assessment テーブルの共通行 "treasure" にぶら下げる
  const assessmentRowId = a.kind === "TREASURE" ? "treasure" : a.id;

  return prisma.$transaction(async (tx) => {
    const prevAttempts = a.kind === "TREASURE" ? [] : await tx.testAttempt.findMany({ where: { userId, assessmentId: a.id } });
    const arenaPlaysToday = a.kind === "ARENA" ? await tx.testAttempt.count({ where: { userId, source: "ARENA", takenOn: today } }) : 0;
    const reward = rewardForTest({
      kind: a.kind,
      passed,
      score,
      isFirstAttempt: prevAttempts.length === 0,
      alreadyPassed: prevAttempts.some((p) => p.passed),
      arenaPlaysToday,
      viaTreasureAlert: a.kind === "TREASURE",
    });
    const attempt = await tx.testAttempt.create({
      data: { userId, assessmentId: assessmentRowId, source, reviewAlertId: input.reviewAlertId, score, passed, isFirstAttempt: prevAttempts.length === 0, coinsAwarded: reward.total, takenOn: today },
    });
    await recordResponses(tx, userId, logs, source, attempt.id, now);
    await grantReward(tx, userId, reward, "attempt", attempt.id);
    if (a.kind === "TREASURE" && passed && input.reviewAlertId) {
      await tx.reviewAlert.update({ where: { id: input.reviewAlertId }, data: { status: "CLEARED", clearedAt: now } });
    }
    const streakReward = source === "NORMAL" ? await touchStreak(tx, userId, today) : { coins: [], rareGachaTickets: 0, total: 0 };
    await grantReward(tx, userId, streakReward, "streak", today);
    return { ok: true as const, score, passed, passRate: a.passRate, feedback, reward, streakReward, unlocksLesson: passed ? a.unlocksLesson : null };
  });
}

async function startTestQuestionsForGrading(userId: string, input: { assessmentId: string; seed: number; arenaMode?: ArenaMode; reviewAlertId?: string }, now: Date) {
  const a = getAssessment(input.assessmentId) ?? treasureAssessment(input.assessmentId);
  if (!a) return { ok: false as const, reasonJa: "テストが見つかりません" };
  let fixedItemIds: string[] | undefined;
  if (a.kind === "TREASURE") {
    const alert = await prisma.reviewAlert.findFirst({ where: { id: input.reviewAlertId, userId } });
    fixedItemIds = alert?.itemIds;
  }
  // アリーナは出題時の記憶状態に依存するため、本番では出題内容を TestSession テーブルに保存して採点時に読む。
  // 骨組みでは seed + 現在の記憶状態から再生成する（出題〜提出の間に記憶状態は変わらない前提）。
  const memories = a.kind === "ARENA" ? await loadMemories(userId) : undefined;
  const questions = buildTestQuestions(a, { seed: input.seed, memories, now, arenaMode: input.arenaMode, fixedItemIds });
  return { ok: true as const, assessment: a, questions };
}

async function gradeQuestion(q: Question, value: string, strictness: Strictness): Promise<QuestionFeedback> {
  if (q.type === "spell") {
    const g = await gradeWritten({ expected: q.answer, answer: value, strictness, itemId: q.itemId });
    return { questionId: q.id, correct: g.verdict === "PASS", verdict: g.verdict, feedbackJa: g.feedbackJa, explanationJa: g.verdict === "PASS" ? undefined : q.explanationJa, correctAnswer: g.verdict === "PASS" ? undefined : q.answer };
  }
  if (q.type === "speak") {
    const s = Number(value);
    const correct = Number.isFinite(s) && s >= 0.7;
    return { questionId: q.id, correct, feedbackJa: correct ? "いい発音！" : "もう一回まねしてみよう！", explanationJa: correct ? undefined : q.explanationJa };
  }
  const correct = value === q.answer;
  const right = q.choices?.find((c) => c.id === q.answer)?.label ?? q.answer;
  return { questionId: q.id, correct, feedbackJa: correct ? "せいかい！" : "ざんねん！", explanationJa: correct ? undefined : q.explanationJa, correctAnswer: correct ? undefined : right };
}

// ---------------------------------------------------------------------------
// お宝復習アラート（ログイン時に呼ぶ）
// ---------------------------------------------------------------------------
export async function getOrCreateTreasureAlert(userId: string, now = new Date(), rng: () => number = Math.random) {
  const today = localDate(now);
  const todays = await prisma.reviewAlert.findFirst({ where: { userId, offeredOn: today }, orderBy: { createdAt: "desc" } });
  if (todays) {
    return todays.status === "OFFERED" || todays.status === "ACCEPTED" ? { show: true, alert: todays, messageJa: alertMessage(todays.lessonNo) } : { show: false };
  }
  const [memories, { completedLessons }] = await Promise.all([loadMemories(userId), loadProgress(userId)]);
  const current = Math.max(0, ...completedLessons.keys()) + 1;
  const candidates = findForgettingLessons(ALL_ITEMS, memories, current, now);
  const decision = decideTreasureAlert({ candidates, alreadyOfferedToday: false, rng });
  if (!decision.show || !decision.candidate) return { show: false };

  const alert = await prisma.reviewAlert.create({
    data: {
      userId,
      lessonNo: decision.candidate.lessonNo,
      itemIds: decision.candidate.itemIds.slice(0, CURRICULUM_RULES.treasureQuestions),
      retrievability: decision.candidate.avgRetrievability,
      offeredOn: today,
      expiresAt: endOfLocalDay(now),
    },
  });
  return { show: true, alert, messageJa: decision.messageJa };
}

const alertMessage = (n: number) => `きみ、少し前にやった Lesson ${n} の単語を忘れかけてるみたいだぞ！今クリアするとコイン2倍！`;

export async function dismissTreasureAlert(userId: string, alertId: string) {
  await prisma.reviewAlert.updateMany({ where: { id: alertId, userId, status: "OFFERED" }, data: { status: "DISMISSED" } });
}

// ---------------------------------------------------------------------------
// 習得率ダッシュボード
// ---------------------------------------------------------------------------
/** 習得率を計算するだけ（DB には書かない）。保護者の「ようす」画面でも使う */
export async function computeUserMastery(userId: string, now = new Date()) {
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const [memories, { completedLessons }, recent] = await Promise.all([
    loadMemories(userId),
    loadProgress(userId),
    prisma.itemResponse.findMany({ where: { userId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 500 }),
  ]);
  const introduced = ALL_ITEMS.filter((i) => completedLessons.has(i.lessonNo));
  const result = computeMastery({
    introducedItems: introduced,
    totalItemCount: ALL_ITEMS.length,
    memories,
    recentResponses: recent as ResponseLog[],
    now,
  });
  return { result, completedLessons };
}

export async function getDashboard(userId: string, now = new Date()) {
  const [{ result, completedLessons }, history] = await Promise.all([
    computeUserMastery(userId, now),
    prisma.masterySnapshot.findMany({ where: { userId }, orderBy: { date: "asc" }, take: 60 }),
  ]);

  // 日次スナップショット（推移グラフ用）。同日は上書き。
  const date = localDate(now);
  const s = result.scores;
  const snap = { schoolTest: s.SCHOOL_TEST, phonics: s.PHONICS, listening: s.LISTENING, speaking: s.SPEAKING, vocabulary: s.VOCABULARY, writing: s.WRITING, overall: result.overall, coverage: result.coverage };
  await prisma.masterySnapshot.upsert({ where: { userId_date: { userId, date } }, create: { userId, date, ...snap }, update: snap });

  return {
    ...result,
    lessonsCompleted: completedLessons.size,
    weakest: result.weakestItemIds.map((id) => getItem(id)).filter(Boolean),
    history: [...history.filter((h) => h.date !== date), { date, ...snap }],
    memoryRules: { targetRetention: MEMORY_RULES.targetRetention },
  };
}

// ---------------------------------------------------------------------------
// ランキング（週間コイン / 連続日数）
// ---------------------------------------------------------------------------
export async function getRanking(userId: string, scope: "national" | "friends", metric: "coins" | "streak", now = new Date()) {
  const friendIds = scope === "friends"
    ? [userId, ...(await prisma.friendship.findMany({ where: { userId } })).map((f) => f.friendId)]
    : undefined;
  // 端末ごとの おためし学習者（run5）は 全国ランキングに のせない（自分だけは見える）
  const visible = { OR: [{ isTrial: false }, { id: userId }] };
  if (metric === "streak") {
    const users = await prisma.user.findMany({ where: friendIds ? { id: { in: friendIds }, ...visible } : visible, orderBy: { streakDays: "desc" }, take: 50, select: { id: true, nickname: true, streakDays: true, avatar: true } });
    return users.map((u, i) => ({ rank: i + 1, userId: u.id, nickname: u.nickname, value: u.streakDays, avatar: u.avatar }));
  }
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const rows = await prisma.coinLedger.groupBy({
    by: ["userId"],
    where: { amount: { gt: 0 }, createdAt: { gte: weekAgo }, ...(friendIds ? { userId: { in: friendIds } } : {}) },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 200,
  });
  const users = await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.userId) }, ...visible }, select: { id: true, nickname: true, avatar: true } });
  return rows.flatMap((r) => {
    const u = users.find((x) => x.id === r.userId);
    return u ? [{ userId: r.userId, nickname: u.nickname, value: r._sum.amount ?? 0, avatar: u.avatar }] : [];
  }).slice(0, 50).map((r, i) => ({ rank: i + 1, ...r }));
}

export { itemsInRange };
