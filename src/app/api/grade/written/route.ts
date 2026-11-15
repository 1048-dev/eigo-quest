import { NextResponse } from "next/server";
import { z } from "zod";
import { getItem } from "@/lib/curriculum";
import { gradeWritten } from "@/lib/grading/aiGrader";

const Body = z.object({ itemId: z.string(), answer: z.string().max(200), strictness: z.enum(["lenient", "school"]).default("lenient") });

/** POST /api/grade/written — レッスン中のスペル練習の即時採点（合格・再挑戦・不正解＋やさしいアドバイス） */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = getItem(parsed.data.itemId);
  if (!item) return NextResponse.json({ error: "unknown item" }, { status: 404 });
  const result = await gradeWritten({ expected: item.text, answer: parsed.data.answer, strictness: parsed.data.strictness, itemId: item.id });
  return NextResponse.json(result);
}
