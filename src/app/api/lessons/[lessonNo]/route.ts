import { NextResponse } from "next/server";
import { getLesson, itemsOfLesson, TEACHER } from "@/lib/curriculum";
import { buildLessonFlow } from "@/lib/curriculum/questions";
import { currentUserId } from "@/lib/auth";
import { getStageMap } from "@/lib/services/progressService";
import { canStartLesson } from "@/lib/domain/progression";

/** GET /api/lessons/:n — その日のレッスン構成（教師動画 → カード → TPR → フォニックス → 学校表現 → 発音 → クイズ → スピードリスニング） */
export async function GET(_req: Request, { params }: { params: Promise<{ lessonNo: string }> }) {
  const n = Number((await params).lessonNo);
  const lesson = getLesson(n);
  if (!lesson) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { nodes } = await getStageMap(await currentUserId());
  const guard = canStartLesson(nodes, n);
  if (!guard.ok) return NextResponse.json({ error: guard.reasonJa }, { status: 403 });

  // レッスン内クイズは「その場で答え合わせ」するので正解付きで返す（ゲートテストは /api/tests で正解を伏せる）
  const steps = buildLessonFlow(lesson);
  return NextResponse.json({ lesson, teacher: TEACHER, items: itemsOfLesson(lesson), steps });
}
