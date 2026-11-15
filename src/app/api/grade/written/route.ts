import { z } from "zod";
import { getItem } from "@/lib/curriculum";
import { gradeWritten } from "@/lib/grading/aiGrader";
import { jsonError, jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import type { GradeResponse } from "@/lib/api/contracts";

const Body = z.object({ itemId: z.string(), answer: z.string().max(200), strictness: z.enum(["lenient", "school"]).default("lenient") });

/** POST /api/grade/written — レッスン中のスペル練習の即時採点（合格・再挑戦・不正解＋やさしいアドバイス） */
export const POST = withApi("grade", async (req) => {
  const parsed = Body.safeParse(await readJsonBody(req));
  if (!parsed.success) return jsonError("こたえを読みとれなかったよ。", 400);
  const item = getItem(parsed.data.itemId);
  if (!item) return jsonError("問題が見つからないよ。", 404);
  const r = await gradeWritten({ expected: item.text, answer: parsed.data.answer, strictness: parsed.data.strictness, itemId: item.id });
  return jsonOk({ verdict: r.verdict, feedbackJa: r.feedbackJa } satisfies GradeResponse);
});
