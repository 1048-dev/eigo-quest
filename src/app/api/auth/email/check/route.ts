import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clientIp, tokenIpLimiter } from "@/lib/auth/rateLimit";
import { INVALID_EMAIL_LINK_JA } from "@/lib/auth/recoveryMessages";
import { MailTokenRequestSchema } from "@/lib/api/contracts";
import { checkEmailToken } from "@/lib/services/accountRecoveryService";

/** POST /api/auth/email/check {token} — メールアドレス確認の画面を開いたとき、リンクが まだ使えるか（使わない） */
export const POST = withAuthApi("email-check", async (req) => {
  const parsed = await parseBody(req, MailTokenRequestSchema);
  if (!parsed.success) return authFail(INVALID_EMAIL_LINK_JA, 400, "INVALID_TOKEN", { valid: false, maskedEmail: null });
  const limit = tokenIpLimiter.hit(clientIp(req));
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
  const r = await checkEmailToken(parsed.data.token);
  return r.valid ? authOk(r) : authFail(INVALID_EMAIL_LINK_JA, 400, "INVALID_TOKEN", { valid: false, maskedEmail: null });
}, { offline: () => ({ valid: false, maskedEmail: null }) });
