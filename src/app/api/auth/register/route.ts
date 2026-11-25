import { beginSession } from "@/lib/auth";
import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { clientIp, registerLimiter } from "@/lib/auth/rateLimit";
import { PASSWORD_RULES_JA, RegisterRequestSchema } from "@/lib/api/contracts";
import { registerParent } from "@/lib/services/parentService";

const FIELD_MESSAGES: Record<string, string> = {
  email: "メールアドレスの形式を確認してください。",
  password: `パスワードは${PASSWORD_RULES_JA}`,
  pin: "暗証番号は数字4けたで入力してください。",
};

/**
 * POST /api/auth/register {email, password, pin}
 * 保護者を登録してそのままログインする。登録直後は子どもを追加できるよう、保護者PINも入力ずみとして扱う。
 */
export const POST = withAuthApi("register", async (req) => {
  const limit = await registerLimiter.hit(clientIp(req));
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);

  const parsed = await parseBody(req, RegisterRequestSchema);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    return authFail(FIELD_MESSAGES[field] ?? "入力内容を確認してください。", 400, "INVALID_INPUT", { field });
  }

  const r = await registerParent(parsed.data);
  if (!r.ok) return authFail("このメールアドレスでは登録できません。すでに登録済みの場合はログインしてください。", 409, "EMAIL_TAKEN");

  await beginSession(r.parentId, { pinVerified: true });
  return authOk({ messageJa: "登録が完了しました。" }, 201);
});
