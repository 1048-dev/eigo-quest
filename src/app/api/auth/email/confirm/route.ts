import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clientIp, tokenIpLimiter } from "@/lib/auth/rateLimit";
import { INVALID_EMAIL_LINK_JA } from "@/lib/auth/recoveryMessages";
import { MailTokenRequestSchema } from "@/lib/api/contracts";
import { confirmEmailAddition } from "@/lib/services/accountRecoveryService";

/**
 * POST /api/auth/email/confirm {token}
 * 確認リンクの画面で「確定する」を押したとき（メールのリンクを開いただけでは 確定しない = メールの安全チェックが
 * 自動でリンクを開いても 勝手に確定しない）。成功したら メールアドレス + パスワードでも ログインできる。
 */
export const POST = withAuthApi("email-confirm", async (req) => {
  const parsed = await parseBody(req, MailTokenRequestSchema);
  if (!parsed.success) return authFail(INVALID_EMAIL_LINK_JA, 400, "INVALID_TOKEN");
  const limit = tokenIpLimiter.hit(clientIp(req));
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
  const r = await confirmEmailAddition(parsed.data.token);
  if (r.ok) return authOk({ messageJa: "メールアドレスを確認しました。次からは、メールアドレスとパスワードでもログインできます。" });
  if (r.reason === "HAS_EMAIL") return authFail("このアカウントには、すでにメールアドレスが登録されています。", 409, "HAS_EMAIL");
  if (r.reason === "EMAIL_TAKEN") return authFail("このメールアドレスは、すでに別のアカウントで登録されているため追加できませんでした。", 409, "EMAIL_TAKEN");
  return authFail(INVALID_EMAIL_LINK_JA, 400, "INVALID_TOKEN");
});
