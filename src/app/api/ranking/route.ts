import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    rows: [
      { userId: "user-1", rank: 1, nickname: "ゲスト", value: 100 }
    ]
  });
}