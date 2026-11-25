import { z } from "zod";
import { resolveLearner } from "@/lib/auth";
import { submitTest } from "@/lib/services/progressService";
import { jsonError, jsonOk, readJsonBody, withOffline } from "@/lib/api/server";
import { offlineTestSubmit } from "@/lib/offline/tests";
import type { TestSubmitResponse } from "@/lib/api/contracts";

const Body = z.object({
  seed: z.number().int(),
  arenaMode: z.enum(["MIXED", "LISTENING", "SPEAKING", "WRITING"]).optional(),
  reviewAlertId: z.string().optional(),
  answers: z.array(z.object({ questionId: z.string(), value: z.string().max(200), responseMs: z.number().int().optional() })).max(60),
});

/** POST /api/tests/:id/submit — 採点（選択式＋AI筆記採点）・解説（救済措置）・コイン付与 */
export const POST = withOffline<{ params: Promise<{ assessmentId: string }> }>("test-submit", async (req, { params }) => {
  const parsed = Body.safeParse(await readJsonBody(req));
  if (!parsed.success) return jsonError("こたえを読みとれなかったよ。", 400);
  const learner = await resolveLearner({ create: true });
  const r = await submitTest(learner.userId, { assessmentId: (await params).assessmentId, ...parsed.data });
  if (!r.ok) return jsonError(r.reasonJa ?? "採点できなかったよ。", 403);
  return jsonOk({
    ok: true, reasonJa: "", score: r.score, passed: r.passed, passRate: r.passRate,
    feedback: r.feedback.map((f) => ({ questionId: f.questionId, correct: f.correct, verdict: f.verdict, feedbackJa: f.feedbackJa, explanationJa: f.explanationJa, correctAnswer: f.correctAnswer })),
    reward: { total: r.reward.total, rareGachaTickets: r.reward.rareGachaTickets, coins: r.reward.coins.map((c) => ({ amount: c.amount, labelJa: c.labelJa })) },
    unlocksLesson: r.unlocksLesson,
    trial: learner.kind !== "child",
  } satisfies TestSubmitResponse);
}, async (req, { params }) => {
  const parsed = Body.safeParse(await readJsonBody(req));
  return offlineTestSubmit((await params).assessmentId, parsed.success ? parsed.data : {});
});
