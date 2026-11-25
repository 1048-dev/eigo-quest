import { currentParent, rotateCurrentSession } from "@/lib/auth";
import { authOk, withAuthApi } from "@/lib/auth/api";
import { clearSessionToken, readSessionToken } from "@/lib/auth/cookies";
import { isPinUnlocked, needsRotation } from "@/lib/auth/session";
import { isLineLoginConfigured } from "@/lib/auth/line";
import type { AuthMeResponse } from "@/lib/api/contracts";
import { listChildren } from "@/lib/services/parentService";

const LOGGED_OUT = { loggedIn: false, parent: null, children: [], selectedChildId: null, pinUnlocked: false, lineLoginAvailable: false };

/**
 * GET /api/auth/me — いまの状態（ログイン中か・子ども・選ばれた子ども・PIN 入力ずみか・LINE ログインが使えるか）
 * 未ログイン・DB 停止は loggedIn:false（= おためしモード）。DB 停止時は success:false + offline:true。
 */
export const GET = withAuthApi("me", async () => {
  const now = new Date();
  const ctx = await currentParent(now);
  if (!ctx) {
    // 期限切れ・消されたセッションの cookie は片づける
    if (await readSessionToken()) await clearSessionToken();
    return authOk({ ...LOGGED_OUT, lineLoginAvailable: isLineLoginConfigured() });
  }
  const session = needsRotation(ctx.session, now) ? (await rotateCurrentSession(ctx, now, { routine: true })) ?? ctx.session : ctx.session;
  const children = await listChildren(ctx.parent.id);
  const selectedChildId = children.some((c) => c.id === session.selectedChildId) ? session.selectedChildId : null;
  return authOk({
    loggedIn: true,
    parent: {
      email: ctx.parent.email ?? "",
      lineLinked: !!ctx.parent.lineUserId,
      lineDisplayName: ctx.parent.lineDisplayName,
      hasPassword: !!ctx.parent.passwordHash,
      needsPin: !ctx.parent.pinHash,
    },
    children,
    selectedChildId,
    pinUnlocked: isPinUnlocked(session, now),
    lineLoginAvailable: isLineLoginConfigured(),
  } satisfies Omit<AuthMeResponse, "ok" | "messageJa">);
}, { offline: () => LOGGED_OUT });
