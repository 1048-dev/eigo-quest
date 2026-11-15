import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { getDashboard } from "@/lib/services/progressService";

/** GET /api/dashboard — リアルタイム習得率（6軸 + 総合 + 進捗 + 推移 + にがて項目） */
export async function GET() {
  return NextResponse.json(await getDashboard(await currentUserId()));
}
