import { requireParent } from "@/lib/auth";
import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi, WRONG_PASSWORD_JA } from "@/lib/auth/api";
import { reauthLimiter } from "@/lib/auth/rateLimit";
import { isLineReauthFresh } from "@/lib/auth/session";
import { isLineLoginConfigured } from "@/lib/auth/line";
import { ResetPinRequestSchema } from "@/lib/api/contracts";
import { resetParentPin, verifyParentPassword } from "@/lib/services/parentService";

/** GET /api/parent/reset-pin — 「暗証番号を忘れた」画面: どの本人確認が使えるか（ログイン必須・暗証番号は いらない） */
export const GET = withAuthApi("reset-pin-status", async () => {
  const ctx = await requireParent();
  return authOk({
    hasPassword: !!ctx.parent.passwordHash,
    lineLinked: !!ctx.parent.lineUserId,
    lineVerified: !!ctx.parent.lineUserId && isLineReauthFresh(ctx.session),
    lineLoginAvailable: isLineLoginConfigured(),
  });
}, { offline: () => ({ hasPassword: false, lineLinked: false, lineVerified: false, lineLoginAvailable: false }) });

/**
 * POST /api/parent/reset-pin {password?, newPin}
 *  - password あり: アカウントのパスワードで本人確認（15分に 8回まで）
 *  - password なし: この端末で さきに LINE で本人確認（/api/auth/line/start?mode=reauth）して 10分以内
 * 成功したら 新しい暗証番号にして、この端末は「暗証番号を入力ずみ」（そのまま おうちの方ページへ）。
 */
export const POST = withAuthApi("reset-pin", async (req) => {
  const ctx = await requireParent();
  const parsed = await parseBody(req, ResetPinRequestSchema);
  if (!parsed.success) {
    const onPin = parsed.error.issues.some((i) => i.path.includes("newPin"));
    return authFail(onPin ? "暗証番号は数字4けたで入力してください。" : "入力内容を確認してください。", 400, "INVALID_INPUT");
  }
  const { password, newPin } = parsed.data;
  if (password !== undefined) {
    if (!ctx.parent.passwordHash) return authFail("このアカウントにはパスワードがありません。LINE で本人確認してください。", 400, "NO_PASSWORD");
    const key = `pw:${ctx.parent.id}`;
    const limit = await reauthLimiter.hit(key);
    if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
    if (!(await verifyParentPassword(ctx.parent.id, password))) return authFail(WRONG_PASSWORD_JA, 401, "WRONG_PASSWORD");
    await reauthLimiter.reset(key);
  } else if (!ctx.parent.lineUserId || !isLineReauthFresh(ctx.session)) {
    return authFail(
      ctx.parent.passwordHash ? "アカウントのパスワードを入力してください。" : "さきに LINE で本人確認をしてください（確認から10分以内に暗証番号を決めてください）。",
      403, "REAUTH_REQUIRED",
    );
  }
  await resetParentPin(ctx.parent.id, ctx.session.id, newPin);
  return authOk({ messageJa: "新しい暗証番号を設定しました。" });
});
