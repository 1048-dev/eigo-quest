import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { getRanking } from "@/lib/services/progressService";

/** GET /api/ranking?scope=national|friends&metric=coins|streak */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const scope = u.searchParams.get("scope") === "friends" ? "friends" : "national";
  const metric = u.searchParams.get("metric") === "streak" ? "streak" : "coins";
  return NextResponse.json({ scope, metric, rows: await getRanking(await currentUserId(), scope, metric) });
}
