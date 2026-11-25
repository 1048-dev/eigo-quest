import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";
import { clearSessionToken } from "@/lib/auth/cookies";
import { authFail } from "@/lib/auth/api";
import { isSameOrigin } from "@/lib/auth/origin";

/**
 * POST /api/auth/logout
 * DB が止まっていても cookie は必ず消す（ログアウトできない状態にしない）。
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return authFail("このリクエストは受け付けられません。ページを開き直してください。", 403, "BAD_ORIGIN");
  try {
    await endSession();
  } catch {
    await clearSessionToken();
  }
  return NextResponse.json({ success: true, ok: true, messageJa: "ログアウトしました。" }, { headers: { "cache-control": "no-store" } });
}
