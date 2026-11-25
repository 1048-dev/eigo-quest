import { requireParentArea } from "@/lib/auth";
import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi, WRONG_PASSWORD_JA, WRONG_PIN_JA } from "@/lib/auth/api";
import { clearSessionToken } from "@/lib/auth/cookies";
import { reauthLimiter } from "@/lib/auth/rateLimit";
import { DeleteAccountRequestSchema } from "@/lib/api/contracts";
import { deleteParentAccount, verifyParentReauth } from "@/lib/services/parentService";

/**
 * DELETE /api/parent/account {password}
 * 退会。保護者・すべての子ども・子どもの学習記録を完全に削除する（元に戻せない）。
 * LINE だけで登録した保護者（パスワードなし）は password に暗証番号を入れる。
 */
export const DELETE = withAuthApi("parent-account-delete", async (req) => {
  const ctx = await requireParentArea();
  const parsed = await parseBody(req, DeleteAccountRequestSchema);
  if (!parsed.success) return authFail("確認のため、パスワードを入力してください。", 400, "INVALID_INPUT");

  const key = `pw:${ctx.parent.id}`;
  const limit = reauthLimiter.hit(key);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
  if (!(await verifyParentReauth(ctx.parent.id, parsed.data.password))) {
    return ctx.parent.passwordHash ? authFail(WRONG_PASSWORD_JA, 401, "WRONG_PASSWORD") : authFail(WRONG_PIN_JA, 401, "WRONG_PIN");
  }
  reauthLimiter.reset(key);

  await deleteParentAccount(ctx.parent.id);
  await clearSessionToken();
  return authOk({ messageJa: "アカウントとすべての学習記録を削除しました。ご利用ありがとうございました。" });
});
