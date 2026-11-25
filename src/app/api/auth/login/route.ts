import { beginSession } from "@/lib/auth";
import { authFail, authOk, LOGIN_FAILED_JA, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clientIp, loginEmailLimiter, loginIpLimiter, loginLimiter } from "@/lib/auth/rateLimit";
import { LoginRequestSchema } from "@/lib/api/contracts";
import { authenticateParent } from "@/lib/services/parentService";

/**
 * POST /api/auth/login {email, password}
 * ログインのたびに新しいセッション（トークン）を発行する。保護者PINはまだ入力していない扱い。
 */
export const POST = withAuthApi("login", async (req) => {
  const parsed = await parseBody(req, LoginRequestSchema);
  if (!parsed.success) return authFail("メールアドレスとパスワードを入力してください。", 400, "INVALID_INPUT");

  const ip = clientIp(req);
  const key = `${ip}|${parsed.data.email}`;
  const byIp = await loginIpLimiter.hit(ip);
  if (!byIp.ok) return tooManyAttempts(byIp.retryAfterSec);
  const byKey = await loginLimiter.hit(key);
  if (!byKey.ok) return tooManyAttempts(byKey.retryAfterSec);
  const byEmail = await loginEmailLimiter.hit(parsed.data.email);
  if (!byEmail.ok) return tooManyAttempts(byEmail.retryAfterSec);

  const parent = await authenticateParent(parsed.data.email, parsed.data.password);
  if (!parent) return authFail(LOGIN_FAILED_JA, 401, "LOGIN_FAILED");

  await loginLimiter.reset(key);
  await loginEmailLimiter.reset(parsed.data.email);
  await beginSession(parent.id);
  return authOk({ messageJa: "ログインしました。" });
});
