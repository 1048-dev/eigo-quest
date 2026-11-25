import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clientIp, tokenIpLimiter } from "@/lib/auth/rateLimit";
import { INVALID_RESET_LINK_JA } from "@/lib/auth/recoveryMessages";
import { MailTokenRequestSchema } from "@/lib/api/contracts";
import { checkPasswordResetToken } from "@/lib/services/accountRecoveryService";

/**
 * POST /api/auth/password-reset/check {token} — 再設定の画面を開いたとき、リンクが まだ使えるか（使わない）。
 * 画面は ?token= を すぐ URL から消して、ボディで送る。
 */
export const POST = withAuthApi("password-reset-check", async (req) => {
  const parsed = await parseBody(req, MailTokenRequestSchema);
  if (!parsed.success) return authFail(INVALID_RESET_LINK_JA, 400, "INVALID_TOKEN", { valid: false, maskedEmail: null });
  const limit = tokenIpLimiter.hit(clientIp(req));
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
  const r = await checkPasswordResetToken(parsed.data.token);
  return r.valid ? authOk(r) : authFail(INVALID_RESET_LINK_JA, 400, "INVALID_TOKEN", { valid: false, maskedEmail: null });
}, { offline: () => ({ valid: false, maskedEmail: null }) });
