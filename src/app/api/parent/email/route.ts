import { requireParentArea } from "@/lib/auth";
import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi } from "@/lib/auth/api";
import { emailAddLimiter } from "@/lib/auth/rateLimit";
import { AddEmailRequestSchema, PASSWORD_RULES_JA } from "@/lib/api/contracts";
import { runAfterResponse } from "@/lib/mail/background";
import { canAddEmail, mailLinkBase, requestEmailAddition } from "@/lib/services/accountRecoveryService";

/**
 * POST /api/parent/email {email, password}  （おうちの方エリア = 暗証番号を入力ずみ）
 * LINE だけで登録した保護者が、メールアドレス + パスワードでのログインを追加する。
 * 確認メールのリンクを開いて「確定する」を押すまでは 追加されない。
 * そのメールアドレスが ほかのアカウントで使われていても 答えは同じ（そのアドレスには お知らせが届く）。
 */
export const POST = withAuthApi("parent-email-add", async (req) => {
  const ctx = await requireParentArea();
  const parsed = await parseBody(req, AddEmailRequestSchema);
  if (!parsed.success) {
    const onPassword = parsed.error.issues.some((i) => i.path.includes("password"));
    return authFail(onPassword ? `パスワードは${PASSWORD_RULES_JA}` : "メールアドレスを正しく入力してください。", 400, "INVALID_INPUT", { field: onPassword ? "password" : "email" });
  }
  const pre = await canAddEmail(ctx.parent.id);
  if (!pre.ok) return authFail("このアカウントには、すでにメールアドレスが登録されています。", 409, "HAS_EMAIL");

  const limit = emailAddLimiter.hit(`email-add:${ctx.parent.id}`);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);

  const { email, password } = parsed.data;
  const base = mailLinkBase(req);
  const parentId = ctx.parent.id;
  runAfterResponse("email-add", () => requestEmailAddition(parentId, email, password, base));
  return authOk({
    messageJa: `${email} に確認メールをお送りしました。メールのリンクを24時間以内に開いて、お手続きを完了してください。届かない場合は、迷惑メールフォルダもご確認ください。`,
  });
});
