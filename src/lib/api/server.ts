/**
 * ルートハンドラ用の共通ラッパー。
 *  - withOffline: DBにつながらない・処理中に例外が起きたときは、内蔵のオフライン用データを
 *    success: true / offline: true で返す（画面にエラーを出さない）
 *  - withApi: オフライン用データを持たないルート用。例外でも必ず JSON を返す
 *  - 空のボディやHTMLのエラーページは返さない（フロントの JSON parse error を防ぐ）
 */
import { NextResponse } from "next/server";
import { isDbUp, markDbDown } from "@/lib/db";

export function jsonOk<T>(data: T, status = 200) {
  const body = data && typeof data === "object" && !Array.isArray(data) && !("success" in (data as object)) ? { success: true, ...(data as object) } : data;
  return NextResponse.json(body, { status });
}

/** ゲーム上の理由（ロック中・コイン不足など）のお知らせ。サーバーの障害ではない */
export function jsonError(error: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, ok: false, error, ...extra }, { status });
}

/** Prisma の「DBにつながらない」系のエラーか */
export function isDbConnectionError(e: unknown): boolean {
  const err = e as { name?: string; code?: string; constructor?: { name?: string } } | null;
  const name = `${err?.name ?? ""} ${err?.constructor?.name ?? ""}`;
  const code = err?.code ?? "";
  return /PrismaClientInitializationError|PrismaClientRustPanicError/.test(name) || ["P1001", "P1002", "P1008", "P1017", "P2024"].includes(code);
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;
type Fallback<C> = (req: Request, ctx: C) => unknown | Promise<unknown>;

async function offlineResponse<C>(name: string, fallback: Fallback<C>, req: Request, ctx: C) {
  try {
    const data = await fallback(req, ctx);
    const obj = data && typeof data === "object" ? (data as object) : {};
    return NextResponse.json({ ...obj, success: true, offline: true }, { status: 200 });
  } catch (e) {
    // オフライン用データの組み立てまで失敗しても、空ではない JSON を返す
    console.error(`[api:${name}] offline fallback failed`, e);
    return NextResponse.json({ success: true, offline: true }, { status: 200 });
  }
}

export function withOffline<C = unknown>(name: string, handler: Handler<C>, fallback: Fallback<C>): Handler<C> {
  return async (req, ctx) => {
    // 本処理がボディを読んでしまっても、オフライン用に読めるよう複製しておく
    const spare = req.clone();
    if (!(await isDbUp())) return offlineResponse(name, fallback, spare, ctx);
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (isDbConnectionError(e)) markDbDown();
      console.error(`[api:${name}] falling back to offline data`, e);
      return offlineResponse(name, fallback, spare, ctx);
    }
  };
}

export function withApi<C = unknown>(name: string, handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error(`[api:${name}]`, e);
      return jsonError("もう一回ためしてね。", 500);
    }
  };
}

/** リクエストボディを安全に読む（空・壊れたJSONは {}） */
export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}
