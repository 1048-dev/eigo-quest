import { z } from "zod";
import { currentUserId } from "@/lib/auth";
import { completeLesson } from "@/lib/services/progressService";
import { jsonError, jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import type { LessonCompleteResponse } from "@/lib/api/contracts";

const Body = z.object({
  quizScore: z.number().min(0).max(1),
  speedListeningBest: z.number().min(0).max(1).optional(),
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
export const POST = withApi<{ params: Promise<{ lessonNo: string }> }>("lesson-complete", async (req, { params }) => {
  const parsed = Body.safeParse(await readJsonBody(req));
  if (!parsed.success) return jsonError("記録を読みとれなかったよ。", 400);
  const r = await completeLesson(await currentUserId(), Number((await params).lessonNo), parsed.data);
  const body: LessonCompleteResponse = r.ok
    ? { ok: true, reasonJa: "", reward: { total: r.reward.total, rareGachaTickets: r.reward.rareGachaTickets, coins: r.reward.coins.map((c) => ({ amount: c.amount, labelJa: c.labelJa })) }, nextTest: r.nextTest }
    : { ok: false, reasonJa: r.reasonJa ?? "", reward: { total: 0, rareGachaTickets: 0, coins: [] }, nextTest: undefined };
  return jsonOk(body, r.ok ? 200 : 403);
});
