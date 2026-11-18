import { z } from "zod";
import { getItem } from "@/lib/curriculum";
import { gradeWritten } from "@/lib/grading/aiGrader";
import { jsonError, jsonOk, readJsonBody, withOffline } from "@/lib/api/server";
import { gradeLocally } from "@/lib/grading/localGrader";
import type { GradeResponse } from "@/lib/api/contracts";

const Body = z.object({ itemId: z.string(), answer: z.string().max(200), strictness: z.enum(["lenient", "school"]).default("lenient") });

/** POST /api/grade/written — レッスン中のスペル練習の即時採点（合格・再挑戦・不正解＋やさしいアドバイス） */
export const POST = withOffline("grade", async (req) => {
  const parsed = Body.safeParse(await readJsonBody(req));
  if (!parsed.success) return jsonError("こたえを読みとれなかったよ。", 400);
  const item = getItem(parsed.data.itemId);
  if (!item) return jsonError("問題が見つからないよ。", 404);
  const r = await gradeWritten({ expected: item.text, answer: parsed.data.answer, strictness: parsed.data.strictness, itemId: item.id });
  return jsonOk({ verdict: r.verdict, feedbackJa: r.feedbackJa } satisfies GradeResponse);
}, async (req) => {
  // オフライン: ルール採点だけで判定する
  const parsed = Body.safeParse(await readJsonBody(req));
  const item = parsed.success ? getItem(parsed.data.itemId) : undefined;
  if (!parsed.success || !item) return { verdict: "WRONG", feedbackJa: "もう一回書いてみよう！" } satisfies GradeResponse;
  const g = gradeLocally(item.text, parsed.data.answer, parsed.data.strictness);
  return { verdict: g.verdict, feedbackJa: g.feedbackJa } satisfies GradeResponse;
});
