/**
 * すべての API の「状態を変えるリクエスト」（POST/PUT/PATCH/DELETE）で Origin を確認する（CSRF 対策）。
 * ログイン中の子どもの学習記録（コイン・進捗）も守るため、保護者 API だけでなくゲームの API にもかける。
 */
import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/auth/origin";

export function middleware(req: NextRequest) {
  if (!isSameOrigin(req)) {
    const messageJa = "このリクエストは受け付けられません。ページを開き直してください。";
    return NextResponse.json({ success: false, ok: false, error: messageJa, messageJa, code: "BAD_ORIGIN" }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
