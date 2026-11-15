/**
 * ルートハンドラ用の共通ラッパー。
 *  - 例外が起きても、必ず JSON（{ error: "..." }）を返す。空のボディやHTMLのエラーページを返さない
 *    → フロントの「JSON parse error」の原因をなくす
 *  - 正常時は契約の型（contracts.ts）を `satisfies` で満たした値を返す
 */
import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

export function withApi<C = unknown>(name: string, handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error(`[api:${name}]`, e);
      return jsonError("サーバーで問題が起きたよ。時間をおいてためしてね。", 500);
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
