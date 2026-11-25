import { readFile } from "node:fs/promises";
import { isDbConnectionError } from "@/lib/api/server";
import { isDbUp, markDbDown } from "@/lib/db";
import { deliveryFileFor, findDeliveryByToken } from "@/lib/services/monthlyDeliveryService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex, nofollow",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};

function text(msg: string, status: number) {
  return new Response(msg, { status, headers: { ...PRIVATE_HEADERS, "content-type": "text/plain; charset=utf-8" } });
}

/**
 * GET /d/<token>/<report|worksheets> — PDF をそのまま返す。
 * トークンが正しく期限内で、その配信の files に入っているファイルだけ（ほかの家・置き場所の外は 404）。
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string; file: string }> }) {
  const { token, file } = await params;
  try {
    if (!(await isDbUp())) return text("ただいま表示できません。しばらくしてからもう一度お試しください。", 503);
    const view = await findDeliveryByToken(token);
    const target = view ? deliveryFileFor(view, file) : null;
    if (!target) return text("このリンクは有効期限が切れているか、正しくありません。", 404);
    let data: Buffer;
    try {
      data = await readFile(target.abs);
    } catch {
      return text("ファイルが見つかりません。おうちの方のページから もう一度送ってください。", 404);
    }
    return new Response(new Uint8Array(data), {
      headers: {
        ...PRIVATE_HEADERS,
        "content-type": "application/pdf",
        "content-length": String(data.length),
        "content-disposition": `inline; filename="${target.file.filename.replace(/[^A-Za-z0-9._-]/g, "_")}"`,
      },
    });
  } catch (e) {
    if (isDbConnectionError(e)) {
      markDbDown();
      return text("ただいま表示できません。しばらくしてからもう一度お試しください。", 503);
    }
    console.error(`[download] ${(e as { name?: string } | null)?.name ?? "Error"}`);
    return text("エラーが発生しました。", 500);
  }
}
