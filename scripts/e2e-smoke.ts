/**
 * E2E スモークテスト（開発用）: 実サーバー + 実DBに対して「正解する子ども」を模擬する。
 *   npx tsx scripts/e2e-smoke.ts http://localhost:3000
 * 日付をまたぐ動作は DB の completedOn/takenOn を1日前にずらして再現する。
 * run5: 記録先は この スクリプト用の おためし学習者（cookie）。共有のデモユーザーは つかわない。
 */
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { getAssessment, getItem, getLesson } from "../src/lib/curriculum";
import { buildLessonFlow, buildTestQuestions } from "../src/lib/curriculum/questions";

const BASE = process.argv[2] ?? "http://localhost:3000";
const prisma = new PrismaClient();
/** run5: ログインしていない人は 端末ごとの おためし学習者（cookie eq_trial_learner）。さいしょの API で きまる */
let USER = "";
let trialCookie = "";
const j = async (path: string, init?: RequestInit) => {
  const r = await fetch(BASE + path, { ...init, headers: { "content-type": "application/json", origin: BASE, ...(trialCookie ? { cookie: `eq_trial_learner=${trialCookie}` } : {}) } });
  const m = /eq_trial_learner=([A-Za-z0-9_-]{43})/.exec(r.headers.get("set-cookie") ?? "");
  if (m) trialCookie = m[1];
  return { status: r.status, body: await r.json() };
};
async function resolveTrialUser() {
  await j("/api/map");
  if (!trialCookie) throw new Error("おためし学習者の cookie が もらえなかった（DB は動いている？）");
  const u = await prisma.user.findFirst({ where: { trialTokenHash: createHash("sha256").update(trialCookie).digest("hex") } });
  if (!u) throw new Error("おためし学習者が DB に ない");
  USER = u.id;
  console.log("おためし学習者:", USER);
}
const yesterday = () => {
  const d = new Date(Date.now() - 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(d);
};

async function doLesson(n: number) {
  const flow = buildLessonFlow(getLesson(n)!);
  const quiz = flow.find((s) => s.kind === "quiz")!;
  const logs = quiz.kind === "quiz" ? quiz.questions.map((q) => ({ itemId: q.itemId, skill: q.skill, questionType: q.type, correct: true, responseMs: 1500 })) : [];
  const r = await j(`/api/lessons/${n}/complete`, { method: "POST", body: JSON.stringify({ quizScore: 1, speedListeningBest: 1, logs }) });
  console.log(`Lesson ${n} complete:`, r.status, r.body.reward?.total ?? r.body.reasonJa, "next:", r.body.nextTest);
}

async function doTest(id: string, opts: { correct?: boolean; reviewAlertId?: string; arenaMode?: string } = {}) {
  const start = await j(`/api/tests/${id}/start`, { method: "POST", body: JSON.stringify(opts) });
  if (start.status !== 200) return console.log(`Test ${id} start:`, start.status, start.body.error);
  const a = getAssessment(id) ?? { id, kind: "TREASURE" as const, rangeStart: Number(id.split("-")[1]), rangeEnd: Number(id.split("-")[1]), questionCount: 6, passRate: 0.8, unlocksLesson: null };
  const alert = opts.reviewAlertId ? await prisma.reviewAlert.findUnique({ where: { id: opts.reviewAlertId } }) : null;
  const memories = a.kind === "ARENA" ? new Map((await prisma.itemMemory.findMany({ where: { userId: USER } })).map((m) => [m.itemId, m])) : undefined;
  const qs = buildTestQuestions(a, { seed: start.body.seed, memories, arenaMode: opts.arenaMode as never, fixedItemIds: alert?.itemIds });
  const answers = qs.map((q) => ({
    questionId: q.id,
    value: opts.correct === false ? "zzz" : q.type === "speak" ? "0.9" : q.type === "spell" ? getItem(q.itemId)!.text : q.answer,
    responseMs: 1800,
  }));
  const r = await j(`/api/tests/${id}/submit`, { method: "POST", body: JSON.stringify({ seed: start.body.seed, answers, reviewAlertId: opts.reviewAlertId, arenaMode: opts.arenaMode }) });
  console.log(`Test ${id}:`, r.status, `score=${r.body.score?.toFixed?.(2)} passed=${r.body.passed} coins=${r.body.reward?.total} tickets=${r.body.reward?.rareGachaTickets ?? 0} unlocks=${r.body.unlocksLesson}`,
    r.body.feedback?.filter((f: { correct: boolean }) => !f.correct).slice(0, 1).map((f: { feedbackJa: string; explanationJa?: string }) => `| 解説: ${f.feedbackJa} ${f.explanationJa ?? ""}`).join("") ?? "");
}

async function shiftDay() {
  const y = yesterday();
  await prisma.lessonProgress.updateMany({ where: { userId: USER }, data: { completedOn: y } });
  await prisma.testAttempt.updateMany({ where: { userId: USER }, data: { takenOn: y } });
  await prisma.reviewAlert.deleteMany({ where: { userId: USER } });
}

async function main() {
  await resolveTrialUser();
  await prisma.$transaction([
    prisma.itemResponse.deleteMany({ where: { userId: USER } }), prisma.itemMemory.deleteMany({ where: { userId: USER } }),
    prisma.testAttempt.deleteMany({ where: { userId: USER } }), prisma.lessonProgress.deleteMany({ where: { userId: USER } }),
    prisma.coinLedger.deleteMany({ where: { userId: USER } }), prisma.gachaTicket.deleteMany({ where: { userId: USER } }),
    prisma.reviewAlert.deleteMany({ where: { userId: USER } }), prisma.masterySnapshot.deleteMany({ where: { userId: USER } }),
    prisma.user.update({ where: { id: USER }, data: { coins: 0, totalCoinsEarned: 0, streakDays: 0, lastStudyDate: null } }),
  ]);

  console.log("== Day 1 ==");
  await doLesson(1);
  await doTest("check-1"); // 復習クエストは当日は受けられない
  console.log("map current:", (await j("/api/map")).body.current);
  await doLesson(2); // 同じ日でもすぐ次のレッスンに進める（2回目も10コイン）

  console.log("== Day 2 ==");
  await shiftDay();
  await doTest("check-1", { correct: false }); // 不合格 → 解説
  await doTest("check-1"); // 再挑戦合格（一発合格ボーナスなし）
  await doTest("check-2"); // 復習クエスト一発合格

  console.log("== Days 3-30（早送り） ==");
  for (let n = 3; n <= 30; n++) {
    await shiftDay();
    const prev = n - 1;
    if (prev >= 3) await doTest(`check-${prev}`).catch(() => undefined); // 復習クエスト（ブロックしない）
    if (prev % 5 === 0) await doTest(`mini-${prev - 4}-${prev}`); // 関門
    await doLesson(n);
  }
  await shiftDay();
  await doTest("boss-1-30");
  await doTest("arena-1-30", { arenaMode: "MIXED" });
  await doTest("arena-1-30", { arenaMode: "LISTENING" });

  console.log("== 30日後: お宝復習アラート ==");
  await prisma.itemMemory.updateMany({ where: { userId: USER }, data: { lastReviewedAt: new Date(Date.now() - 30 * 86_400_000) } });
  await prisma.reviewAlert.deleteMany({ where: { userId: USER } });
  let alert = (await j("/api/treasure-alert")).body;
  for (let k = 0; k < 5 && !alert.show; k++) { await prisma.reviewAlert.deleteMany({ where: { userId: USER } }); alert = (await j("/api/treasure-alert")).body; }
  console.log("alert:", alert.show, alert.messageJa);
  if (alert.show) await doTest(`treasure-${alert.alert.lessonNo}`, { reviewAlertId: alert.alert.id });

  const dash = (await j("/api/dashboard")).body;
  console.log("dashboard:", { overall: dash.overall, coverage: dash.coverage, scores: dash.scores });
  const map = (await j("/api/map")).body;
  console.log("user:", map.user, "current:", map.current?.key, "arenas:", map.arenas.map((a: { assessment: { id: string }; unlocked: boolean }) => `${a.assessment.id}:${a.unlocked}`));
  console.log("ranking:", (await j("/api/ranking")).body.rows.slice(0, 3));
  console.log("gacha(rare):", (await j("/api/gacha", { method: "POST", body: JSON.stringify({ useRareTicket: true }) })).body);
}

main().finally(() => prisma.$disconnect());
