/**
 * 保護者アカウント系 API の共通ラッパー。
 *  - 状態を変えるリクエストは Origin を確認（CSRF 対策。middleware でも確認している）
 *  - DB が止まっている → success:false + ていねいなメッセージ（503）。アプリは落ちない
 *  - AuthError（未ログイン・PIN 未入力）→ そのステータスで JSON
 *  - ログにはエラーの種類だけを出す（リクエストの中身＝パスワード・PIN・トークンは出さない）
 */
import { NextResponse } from "next/server";
import { isDbUp, markDbDown } from "@/lib/db";
import type { z } from "zod";
import { isDbConnectionError, readJsonBody } from "@/lib/api/server";
import { AuthError } from "./index";
import { isSameOrigin, isStateChanging } from "./origin";

export const DB_DOWN_MESSAGE_JA = "ただいまアカウント機能を利用できません。しばらくしてからもう一度お試しください（おためしモードはそのまま遊べます）。";
export const SERVER_ERROR_MESSAGE_JA = "エラーが発生しました。時間をおいてもう一度お試しください。";
export const BAD_REQUEST_MESSAGE_JA = "入力内容を確認してください。";
/** メールとパスワードのどちらが違っていても同じ文言（登録の有無を教えない） */
export const LOGIN_FAILED_JA = "メールアドレスまたはパスワードが正しくありません。";
export const WRONG_PASSWORD_JA = "パスワードが正しくありません。";
export const WRONG_PIN_JA = "暗証番号が違います。";
export const CHILD_NOT_FOUND_JA = "お子さまの情報が見つかりません。";

type Body = Record<string, unknown>;

export function authOk(body: Body = {}, status = 200) {
  return NextResponse.json({ success: true, ok: true, messageJa: "", ...body }, { status, headers: { "cache-control": "no-store" } });
}

export function authFail(messageJa: string, status: number, code?: string, extra: Body = {}) {
  return NextResponse.json(
    { success: false, ok: false, error: messageJa, messageJa, ...(code ? { code } : {}), ...extra },
    { status, headers: { "cache-control": "no-store" } },
  );
}

/** ボディを zod で検証する。空・壊れた JSON・形違いは success:false（例外にしない） */
export async function parseBody<S extends z.ZodTypeAny>(req: Request, schema: S): Promise<z.SafeParseReturnType<unknown, z.output<S>>> {
  return schema.safeParse(await readJsonBody(req));
}

export function tooManyAttempts(retryAfterSec: number) {
  const min = Math.max(1, Math.ceil(retryAfterSec / 60));
  return authFail(`試行回数が多すぎます。${min}分ほど待ってからもう一度お試しください。`, 429, "RATE_LIMITED", { retryAfterSec });
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

export function withAuthApi<C = unknown>(name: string, handler: Handler<C>, opts: { offline?: () => Body } = {}): Handler<C> {
  return async (req, ctx) => {
    if (isStateChanging(req.method) && !isSameOrigin(req)) {
      return authFail("このリクエストは受け付けられません。ページを開き直してください。", 403, "BAD_ORIGIN");
    }
    const offline = () => (opts.offline
      ? NextResponse.json({ success: false, ok: false, offline: true, messageJa: DB_DOWN_MESSAGE_JA, ...opts.offline() }, { headers: { "cache-control": "no-store" } })
      : authFail(DB_DOWN_MESSAGE_JA, 503, "OFFLINE", { offline: true }));
    try {
      if (!(await isDbUp())) return offline();
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof AuthError) return authFail(e.messageJa, e.status, e.code);
      if (isDbConnectionError(e)) {
        markDbDown();
        return offline();
      }
      const err = e as { name?: string; code?: string } | null;
      console.error(`[auth:${name}] ${err?.name ?? "Error"}${err?.code ? ` (${err.code})` : ""}`);
      return authFail(SERVER_ERROR_MESSAGE_JA, 500, "SERVER_ERROR");
    }
  };
}
