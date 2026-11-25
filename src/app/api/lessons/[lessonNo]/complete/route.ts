import { z } from "zod";
import { resolveLearner } from "@/lib/auth";
import { completeLesson } from "@/lib/services/progressService";
import { jsonError, jsonOk, readJsonBody, withOffline } from "@/lib/api/server";
import { offlineLessonComplete } from "@/lib/offline";
import type { LessonCompleteResponse } from "@/lib/api/contracts";

const Body = z.object({
  quizScore: z.number().min(0).max(1),
  speedListeningBest: z.number().min(0).max(1).optional(),
  /** AIキャラとの かいわを さいごまで やった（レッスンごとに1回 +5） */
  conversationFinished: z.boolean().optional(),
  logs: z.array(z.object({
    itemId: z.string(),
    skill: z.enum(["SCHOOL_TEST", "PHONICS", "LISTENING", "SPEAKING", "VOCABULARY", "WRITING"]),
    questionType: z.string(),
    correct: z.boolean(),
    score: z.number().min(0).max(1).optional(),
    responseMs: z.number().int().nonnegative().optional(),
    playbackRate: z.number().optional(),
    answer: z.string().max(200).optional(),
  })).max(200).default([]),
});

/** POST /api/lessons/:n/complete — レッスン完了・コイン付与・記憶モデル更新 */
export const POST = withOffline<{ params: Promise<{ lessonNo: string }> }>("lesson-complete", async (req, { params }) => {
  const parsed = Body.safeParse(await readJsonBody(req));
  if (!parsed.success) return jsonError("記録を読みとれなかったよ。", 400);
  const learner = await resolveLearner({ create: true });
  const r = await completeLesson(learner.userId, Number((await params).lessonNo), parsed.data);
  // trial: ログインした子どもでは ない（この端末の おためし学習者）。きろくは DB の おためし学習者に入る
  const trial = learner.kind !== "child";
  const body: LessonCompleteResponse = r.ok
    ? { ok: true, reasonJa: "", reward: { total: r.reward.total, rareGachaTickets: r.reward.rareGachaTickets, coins: r.reward.coins.map((c) => ({ amount: c.amount, labelJa: c.labelJa })) }, nextTest: r.nextTest, trial }
    : { ok: false, reasonJa: r.reasonJa ?? "", reward: { total: 0, rareGachaTickets: 0, coins: [] }, nextTest: undefined, code: "code" in r ? r.code : undefined };
  return jsonOk(body, r.ok ? 200 : 403);
}, async (req, { params }) => {
  const b = await readJsonBody(req);
  const conversationFinished = !!(b && typeof b === "object" && (b as { conversationFinished?: unknown }).conversationFinished === true);
  return offlineLessonComplete(Number((await params).lessonNo), { conversationFinished });
});
