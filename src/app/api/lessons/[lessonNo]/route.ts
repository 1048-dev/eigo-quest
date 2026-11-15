import { getLesson, itemsOfLesson, TEACHER } from "@/lib/curriculum";
import { buildLessonFlow } from "@/lib/curriculum/questions";
import { currentUserId } from "@/lib/auth";
import { getStageMap } from "@/lib/services/progressService";
import { canStartLesson } from "@/lib/domain/progression";
import { jsonError, jsonOk, withApi } from "@/lib/api/server";
import type { LessonResponse } from "@/lib/api/contracts";

/** GET /api/lessons/:n — その日のレッスン構成（教師動画 → カード → TPR → フォニックス → 学校表現 → 発音 → クイズ → スピードリスニング） */
export const GET = withApi<{ params: Promise<{ lessonNo: string }> }>("lesson", async (_req, { params }) => {
  const n = Number((await params).lessonNo);
  const lesson = Number.isInteger(n) ? getLesson(n) : undefined;
  if (!lesson) return jsonError("レッスンが見つからないよ。", 404);

  const { nodes } = await getStageMap(await currentUserId());
  const guard = canStartLesson(nodes, n);
  if (!guard.ok) return jsonError(guard.reasonJa ?? "まだ開いていないよ。", 403);

  // レッスン内クイズは「その場で答え合わせ」するので正解付きで返す（ゲートテストは /api/tests で正解を伏せる）
  return jsonOk({ lesson, teacher: TEACHER, items: itemsOfLesson(lesson), steps: buildLessonFlow(lesson) } satisfies LessonResponse);
});
