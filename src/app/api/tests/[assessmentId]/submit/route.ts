import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUserId } from "@/lib/auth";
import { submitTest } from "@/lib/services/progressService";

const Body = z.object({
  seed: z.number().int(),
  arenaMode: z.enum(["MIXED", "LISTENING", "SPEAKING", "WRITING"]).optional(),
  reviewAlertId: z.string().optional(),
  answers: z.array(z.object({ questionId: z.string(), value: z.string().max(200), responseMs: z.number().int().optional() })).max(60),
});

/** POST /api/tests/:id/submit — 採点（選択式＋AI筆記採点）・解説（救済措置）・コイン付与 */
export async function POST(req: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const r = await submitTest(await currentUserId(), { assessmentId: (await params).assessmentId, ...parsed.data });
  return NextResponse.json(r, { status: r.ok ? 200 : 403 });
}
