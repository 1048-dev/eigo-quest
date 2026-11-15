import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nodes: [],
    currentLessonNo: 1,
  });
}