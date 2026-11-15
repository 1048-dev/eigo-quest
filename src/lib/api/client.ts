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

export async function apiRequest<S extends z.ZodTypeAny>(url: string, schema: S, init?: RequestInit): Promise<ApiResult<z.output<S>>> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    return { data: coerce(schema, undefined), ok: false, status: 0, error: NETWORK_ERROR };
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

export const apiGet = <S extends z.ZodTypeAny>(url: string, schema: S) => apiRequest(url, schema);

export const apiPost = <S extends z.ZodTypeAny>(url: string, schema: S, body?: unknown) =>
  apiRequest(url, schema, { method: "POST", body: JSON.stringify(body ?? {}) });

export const apiDelete = <S extends z.ZodTypeAny>(url: string, schema: S) => apiRequest(url, schema, { method: "DELETE" });
