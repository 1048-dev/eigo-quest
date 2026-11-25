/**
 * 画面（ブラウザ）側の保護者アカウント用ヘルパー。
 *  - API はすべて src/lib/api/client.ts の安全な fetch を通す（例外を投げない）
 *  - ログイン状態が変わったら ACCOUNT_EVENT を投げ、ヘッダー（AccountBar）が読みなおす
 *  - 子どものアバター: 子どもが えらんだ顔（DB の avatarCharacter）。古いデータで無ければ 登録順で決める
 */
import type { z } from "zod";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { AuthMeResponseSchema, type AuthMeResponse } from "@/lib/api/contracts";
import type { CharacterId } from "@/lib/game/characters";
import { isAvatarCharacter } from "@/lib/domain/avatars";

export const ACCOUNT_EVENT = "eq:account-changed";

/** 「おためしで あそぶ」を選んだしるし（ログイン情報ではない。次回から最初の画面をとばすためだけ） */
export const TRIAL_COOKIE = "eq_trial";

export function notifyAccountChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ACCOUNT_EVENT));
}

export function rememberTrial() {
  if (typeof document === "undefined") return;
  document.cookie = `${TRIAL_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function fetchMe(): Promise<ApiResult<AuthMeResponse>> {
  return apiRequest("/api/auth/me", AuthMeResponseSchema, { cache: "no-store" });
}

export function sendJson<S extends z.ZodTypeAny>(method: "POST" | "PATCH" | "DELETE", url: string, schema: S, body?: unknown) {
  return apiRequest(url, schema, { method, body: JSON.stringify(body ?? {}) });
}

/** API の失敗理由（code）を取り出す */
export function codeOf(r: { data: unknown }): string | undefined {
  const c = (r.data as { code?: unknown } | null)?.code;
  return typeof c === "string" ? c : undefined;
}

/** DB 停止など「アカウント機能が使えない」応答か */
export function isAccountOffline(r: { status: number; data: unknown }): boolean {
  return r.status === 503 || r.status === 0 || (r.data as { offline?: unknown } | null)?.offline === true;
}

export const AVATARS: { id: CharacterId; ring: string; bg: string }[] = [
  { id: "haru", ring: "#4cc9f0", bg: "linear-gradient(160deg,#1f5a8a,#0b2236)" },
  { id: "riko", ring: "#ff6fa5", bg: "linear-gradient(160deg,#8a2a5a,#2a0b1e)" },
  { id: "kiko", ring: "#ffd83a", bg: "linear-gradient(160deg,#8a6a10,#2a1f04)" },
  { id: "birimo", ring: "#5fe39a", bg: "linear-gradient(160deg,#1f7a4a,#08281a)" },
];

/**
 * 子どものキャラクター。
 * avatar（子どもが えらんだ顔）があれば それ。
 * 無ければ index（きょうだいの登録順。API はいつも登録順で返す）で決める → きょうだいで顔がかぶらない（4人目まで）。
 * それも無ければ id から決める（同じ子はいつも同じ顔）。
 */
export function avatarFor(childId: string, index?: number, avatar?: string | null) {
  if (isAvatarCharacter(avatar)) return AVATARS.find((a) => a.id === avatar)!;
  if (index !== undefined && index >= 0) return AVATARS[index % AVATARS.length];
  let h = 0;
  for (let i = 0; i < childId.length; i++) h = (h * 31 + childId.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

export function gradeLabel(g: number | null | undefined): string {
  return g && g >= 1 && g <= 6 ? `${g}ねんせい` : "";
}

/** パスワードのルール（サーバーの PasswordInput と同じ）。画面のチェックリスト用 */
export function passwordChecks(pw: string) {
  return [
    { label: "8文字以上", ok: pw.length >= 8 && pw.length <= 128 },
    { label: "英字（半角）をふくむ", ok: /[A-Za-z]/.test(pw) },
    { label: "数字（半角）をふくむ", ok: /[0-9]/.test(pw) },
  ];
}
