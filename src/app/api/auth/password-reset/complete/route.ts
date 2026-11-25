import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clearSessionToken } from "@/lib/auth/cookies";
import { clientIp, tokenIpLimiter } from "@/lib/auth/rateLimit";
import { INVALID_RESET_LINK_JA, PASSWORD_RESET_DONE_JA } from "@/lib/auth/recoveryMessages";
import { PASSWORD_RULES_JA, ResetPasswordRequestSchema } from "@/lib/api/contracts";
import { runAfterResponse } from "@/lib/mail/background";
import { mailLinkBase, resetPassword, sendPasswordChangedNotice } from "@/lib/services/accountRecoveryService";

/**
 * POST /api/auth/password-reset/complete {token, newPassword}
 * リンクは1回だけ。成功したら すべての端末のログインを終わらせる（この端末の cookie も消す）→ 新しいパスワードで ログインしてもらう。
 * 「パスワードを再設定しました」の お知らせメールも送る。
 */
export const POST = withAuthApi("password-reset-complete", async (req) => {
  const parsed = await parseBody(req, ResetPasswordRequestSchema);
  if (!parsed.success) {
    const onPassword = parsed.error.issues.some((i) => i.path.includes("newPassword"));
    return onPassword
      ? authFail(`新しいパスワードは${PASSWORD_RULES_JA}`, 400, "INVALID_INPUT")
      : authFail(INVALID_RESET_LINK_JA, 400, "INVALID_TOKEN");
  }
  const limit = await tokenIpLimiter.hit(clientIp(req));
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);

  const r = await resetPassword(parsed.data.token, parsed.data.newPassword);
  if (!r.ok) return authFail(INVALID_RESET_LINK_JA, 400, "INVALID_TOKEN");

  await clearSessionToken();
  const base = mailLinkBase(req);
  runAfterResponse("password-changed", () => sendPasswordChangedNotice(r.email, base));
  return authOk({ messageJa: PASSWORD_RESET_DONE_JA });
});
