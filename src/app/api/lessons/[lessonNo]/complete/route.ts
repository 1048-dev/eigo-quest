import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUserId } from "@/lib/auth";
import { completeLesson } from "@/lib/services/progressService";

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
  })).max(200),
});

/** POST /api/lessons/:n/complete — レッスン完了・コイン付与・記憶モデル更新 */
export async function POST(req: Request, { params }: { params: Promise<{ lessonNo: string }> }) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const result = await completeLesson(await currentUserId(), Number((await params).lessonNo), parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 403 });
}
