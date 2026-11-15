import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { toPublic } from "@/lib/curriculum/questions";
import { startTest } from "@/lib/services/progressService";
import type { ArenaMode } from "@/lib/domain/arena";

/** POST /api/tests/:id/start — 出題（正解は伏せて返す）。body: { arenaMode?, reviewAlertId? } */
export async function POST(req: Request, { params }: { params: Promise<{ assessmentId: string }> }) {
  const body = (await req.json().catch(() => ({}))) as { arenaMode?: ArenaMode; reviewAlertId?: string };
  const r = await startTest(await currentUserId(), (await params).assessmentId, body);
  if (!r.ok) return NextResponse.json({ error: r.reasonJa }, { status: 403 });
  return NextResponse.json({ assessment: r.assessment, seed: r.seed, questions: r.questions.map(toPublic) });
}
