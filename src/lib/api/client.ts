/**
 * フロント用の安全な fetch。
 *  - 通信失敗・HTTPエラー・空のボディ・JSONでない応答（HTMLのエラーページ等）でも例外を投げない
 *  - 受け取ったデータは契約（contracts.ts）の zod スキーマで検証し、欠けた項目はデフォルト値で埋める
 * → 戻り値の `data` はいつでも「契約どおりの形」。画面側はそのまま使える。
 */
import type { z } from "zod";
import { ErrorBodySchema } from "./contracts";

export interface ApiResult<T> {
  /** 契約どおりの形（失敗時はデフォルト値で埋めたもの） */
  data: T;
  /** HTTP 2xx かつ JSON として読めたとき true */
  ok: boolean;
  status: number;
  /** 子ども向けに表示できるエラーメッセージ */
  error: string | null;
}

const NETWORK_ERROR = "通信がうまくいかなかったよ。少し待ってもう一回ためしてね。";
const SERVER_ERROR = "サーバーで問題が起きたよ。時間をおいてためしてね。";

/** レスポンス本文を安全にJSONとして読む（空・壊れたJSONは undefined） */
export function parseJsonSafely(text: string): unknown {
  if (!text || !text.trim()) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** 任意の値を契約スキーマにかける。どんな入力でも例外にならない */
export function coerce<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.output<S> {
  const input = raw && typeof raw === "object" ? raw : {};
  const r = schema.safeParse(input);
  if (r.success) return r.data;
  // スキーマが必須項目を持つ場合の最後の砦: 空オブジェクトで再挑戦
  const empty = schema.safeParse({});
  if (empty.success) return empty.data;
  throw new Error("contract schema must accept an empty object");
}

/** 1回分のリクエスト（タイムアウト付き）。例外は投げない */
async function requestOnce<S extends z.ZodTypeAny>(url: string, schema: S, init: RequestInit | undefined, timeoutMs: number): Promise<ApiResult<z.output<S>>> {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : undefined;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      signal: ctrl?.signal,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    return { data: coerce(schema, undefined), ok: false, status: 0, error: NETWORK_ERROR };
  } finally {
    if (timer) clearTimeout(timer);
  }

  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }
  const raw = parseJsonSafely(text);
  const data = coerce(schema, raw);

  if (!res.ok) {
    const body = ErrorBodySchema.safeParse(raw ?? {});
    const msg = (body.success && body.data.error) || (res.status >= 500 ? SERVER_ERROR : NETWORK_ERROR);
    return { data, ok: false, status: res.status, error: msg };
  }
  if (raw === undefined) {
    return { data, ok: false, status: res.status, error: SERVER_ERROR };
  }
  return { data, ok: true, status: res.status, error: null };
}

/** 通信失敗（status 0）・5xx・JSONでない応答 = 「サーバーに届かなかった」扱い。画面は内蔵データに切り替える */
export function isUnreachable(r: { ok: boolean; status: number }): boolean {
  return !r.ok && (r.status === 0 || r.status >= 500 || r.status === 200);
}

export interface RequestOptions { timeoutMs?: number; retries?: number }

export async function apiRequest<S extends z.ZodTypeAny>(url: string, schema: S, init?: RequestInit, opts: RequestOptions = {}): Promise<ApiResult<z.output<S>>> {
  const timeoutMs = opts.timeoutMs ?? 8000;
  // GET はつながらなければ少し待って自動でもう一回（POSTは二重送信を避けるためリトライしない）
  const retries = opts.retries ?? ((init?.method ?? "GET") === "GET" ? 1 : 0);
  let r = await requestOnce(url, schema, init, timeoutMs);
  for (let i = 0; i < retries && isUnreachable(r); i++) {
    await new Promise((ok) => setTimeout(ok, 700 * (i + 1)));
    r = await requestOnce(url, schema, init, timeoutMs);
  }
  return r;
}

export const apiGet = <S extends z.ZodTypeAny>(url: string, schema: S) => apiRequest(url, schema);

export const apiPost = <S extends z.ZodTypeAny>(url: string, schema: S, body?: unknown) =>
  apiRequest(url, schema, { method: "POST", body: JSON.stringify(body ?? {}) });

export const apiDelete = <S extends z.ZodTypeAny>(url: string, schema: S) => apiRequest(url, schema, { method: "DELETE" });
