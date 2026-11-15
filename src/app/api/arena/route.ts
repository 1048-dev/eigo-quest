import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    arenaUser: { nickname: "ゲスト", coins: 100 },
    battles: [],
    history: [],
    status: "ready",
  });
}