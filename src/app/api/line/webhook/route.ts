import { NextResponse } from "next/server";
import { isDbConnectionError } from "@/lib/api/server";
import { isDbUp, markDbDown } from "@/lib/db";
import { lineMessagingConfig, parseFriendEvents, verifyLineSignature } from "@/lib/line/messaging";
import { recordFriendEvent } from "@/lib/services/monthlyDeliveryService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_000_000;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

/** 本文を maxBytes まで読む。超えたら（Content-Length でも、実際に流れてきた量でも）null */
async function readLimited(req: Request, maxBytes: number): Promise<Buffer | null> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!req.body) return Buffer.alloc(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

/**
 * POST /api/line/webhook — LINE 公式アカウント（Messaging API）の webhook。
 *  - X-Line-Signature を LINE_MESSAGING_CHANNEL_SECRET で確かめる（違えば 401。何もしない）
 *  - follow（友だち追加・ブロック解除）/ unfollow（ブロック）で Parent.lineFriend を更新する
 *  - LINE Developers の「検証」ボタン（events が空）にも 200 を返す
 * LINE のサーバーからのリクエストなので Origin は付かない（middleware の CSRF チェックは通る）。
 */
export async function POST(req: Request) {
  const cfg = lineMessagingConfig();
  if (!cfg.channelSecret) return json({ ok: false, code: "NOT_CONFIGURED" }, 503);
  // 署名を確かめる前なので、大きすぎる本文は読み切らずに断る（メモリを使い切らせない）
  const raw = await readLimited(req, MAX_BODY_BYTES);
  if (!raw) return json({ ok: false, code: "TOO_LARGE" }, 413);
  // 署名は受け取ったバイト列そのものに対して計算する（文字列に直すと不正な UTF-8 で値が変わるため）
  if (!verifyLineSignature(cfg.channelSecret, raw, req.headers.get("x-line-signature"))) {
    return json({ ok: false, code: "BAD_SIGNATURE" }, 401);
  }
  let body: unknown;
  try {
    body = JSON.parse(raw.toString("utf8"));
  } catch {
    return json({ ok: false, code: "BAD_REQUEST" }, 400);
  }
  const events = parseFriendEvents(body);
  if (events.length === 0) return json({ ok: true, handled: 0 });
  // DB が止まっていたら 503（LINE の「webhook の再送」を有効にしておけば あとで届きなおす）
  if (!(await isDbUp())) return json({ ok: false, code: "OFFLINE" }, 503);
  try {
    let handled = 0;
    for (const e of events) handled += await recordFriendEvent(e.userId, e.type === "follow", new Date(e.timestamp));
    return json({ ok: true, handled });
  } catch (e) {
    if (isDbConnectionError(e)) {
      markDbDown();
      return json({ ok: false, code: "OFFLINE" }, 503);
    }
    console.error(`[line-webhook] ${(e as { name?: string } | null)?.name ?? "Error"}`);
    return json({ ok: false, code: "SERVER_ERROR" }, 500);
  }
}
