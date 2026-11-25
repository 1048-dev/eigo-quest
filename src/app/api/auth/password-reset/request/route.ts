import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clientIp, forgotEmailLimiter, forgotIpLimiter } from "@/lib/auth/rateLimit";
import { FORGOT_PASSWORD_SENT_JA } from "@/lib/auth/recoveryMessages";
import { ForgotPasswordRequestSchema } from "@/lib/api/contracts";
import { runAfterResponse } from "@/lib/mail/background";
import { mailLinkBase, requestPasswordReset } from "@/lib/services/accountRecoveryService";

/**
 * POST /api/auth/password-reset/request {email}
 *  - 答えは いつも同じ（登録の有無を教えない）。DB を しらべる・メールを送るのは 応答のあと（時間でも わからないように）
 *  - 同じ IP から 1時間に 10回（こえたら 429）。同じメールへは 1時間に 3通（こえても 同じ答えで だまって 送らない）
 */
export const POST = withAuthApi("password-reset-request", async (req) => {
  const parsed = await parseBody(req, ForgotPasswordRequestSchema);
  if (!parsed.success) return authFail("メールアドレスを正しく入力してください。", 400, "INVALID_INPUT");

  const byIp = forgotIpLimiter.hit(clientIp(req));
  if (!byIp.ok) return tooManyAttempts(byIp.retryAfterSec);

  const email = parsed.data.email;
  if (forgotEmailLimiter.hit(email).ok) {
    const base = mailLinkBase(req);
    runAfterResponse("password-reset", () => requestPasswordReset(email, base));
  }
  return authOk({ messageJa: FORGOT_PASSWORD_SENT_JA });
});
