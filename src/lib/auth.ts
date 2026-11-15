/**
 * 認証スタブ。本番は保護者アカウント（メール/Apple/Google）→ 子どもプロフィール選択 の2段階にする。
 * 骨組みでは cookie "uid"（無ければ seed のデモユーザー）を使う。
 */
import { cookies } from "next/headers";

export const DEMO_USER_ID = "demo-user";

export async function currentUserId(): Promise<string> {
  const c = await cookies();
  return c.get("uid")?.value ?? DEMO_USER_ID;
}
