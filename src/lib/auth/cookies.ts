/**
 * セッション cookie の読み書き（next/headers）。
 * httpOnly（JS から読めない）・SameSite=Lax・本番では Secure。
 */
import { cookies } from "next/headers";
import { SESSION_TTL_MS } from "./session";

export const SESSION_COOKIE = "eq_session";

export function sessionCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt ?? new Date(Date.now() + SESSION_TTL_MS),
  };
}

export async function readSessionToken(): Promise<string | undefined> {
  try {
    return (await cookies()).get(SESSION_COOKIE)?.value;
  } catch {
    return undefined; // リクエストの外（ビルド時など）
  }
}

/** ルートハンドラ・Server Action の中でだけ書ける。Server Component の描画中は書けないので黙って無視する */
export async function writeSessionToken(token: string, expiresAt: Date): Promise<void> {
  try {
    (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  } catch {
    /* 描画中は書けない */
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    (await cookies()).set(SESSION_COOKIE, "", { ...sessionCookieOptions(new Date(0)), maxAge: 0 });
  } catch {
    /* 描画中は書けない */
  }
}
