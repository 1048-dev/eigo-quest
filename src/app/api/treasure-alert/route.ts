import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { dismissTreasureAlert, getOrCreateTreasureAlert } from "@/lib/services/progressService";

/** GET /api/treasure-alert — ログイン時に呼ぶ。忘れかけレッスンがあればランダムでお宝アラート */
export async function GET() {
  return NextResponse.json(await getOrCreateTreasureAlert(await currentUserId()));
}

/** DELETE /api/treasure-alert?id=... — 「あとで」 */
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (id) await dismissTreasureAlert(await currentUserId(), id);
  return NextResponse.json({ ok: true });
}
