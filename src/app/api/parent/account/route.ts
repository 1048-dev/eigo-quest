import { requireParentArea } from "@/lib/auth";
import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi, WRONG_PASSWORD_JA } from "@/lib/auth/api";
import { clearSessionToken } from "@/lib/auth/cookies";
import { pinLimiter } from "@/lib/auth/rateLimit";
import { DeleteAccountRequestSchema } from "@/lib/api/contracts";
import { deleteParentAccount, verifyParentPassword } from "@/lib/services/parentService";

/**
 * DELETE /api/parent/account {password}
 * 退会。保護者・すべての子ども・子どもの学習記録を完全に削除する（元に戻せない）。
 */
export const DELETE = withAuthApi("parent-account-delete", async (req) => {
  const ctx = await requireParentArea();
  const parsed = await parseBody(req, DeleteAccountRequestSchema);
  if (!parsed.success) return authFail("確認のため、パスワードを入力してください。", 400, "INVALID_INPUT");

  const key = `pw:${ctx.parent.id}`;
  const limit = pinLimiter.hit(key);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
  if (!(await verifyParentPassword(ctx.parent.id, parsed.data.password))) return authFail(WRONG_PASSWORD_JA, 401, "WRONG_PASSWORD");
  pinLimiter.reset(key);

  await deleteParentAccount(ctx.parent.id);
  await clearSessionToken();
  return authOk({ messageJa: "アカウントとすべての学習記録を削除しました。ご利用ありがとうございました。" });
});
