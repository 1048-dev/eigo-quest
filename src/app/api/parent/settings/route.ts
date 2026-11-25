import { requireParentArea, rotateCurrentSession } from "@/lib/auth";
import { authFail, authOk, CHILD_NOT_FOUND_JA, parseBody, tooManyAttempts, withAuthApi, WRONG_PASSWORD_JA } from "@/lib/auth/api";
import { reauthLimiter } from "@/lib/auth/rateLimit";
import { destroyOtherSessions } from "@/lib/auth/session";
import { PASSWORD_RULES_JA, ParentSettingsRequestSchema } from "@/lib/api/contracts";
import {
  changeParentPassword, changeParentPin, getParentSettings, setDailyLessonLimit, verifyParentPassword,
} from "@/lib/services/parentService";

/** GET /api/parent/settings — いまの設定（子どもごとの1日のレッスン回数） */
export const GET = withAuthApi("parent-settings-get", async () => {
  const ctx = await requireParentArea();
  return authOk({ settings: await getParentSettings(ctx.parent.id) });
});

/**
 * PATCH /api/parent/settings
 *  { dailyLessonLimit?: {childId, limit|null}, changePin?: {password, newPin}, changePassword?: {currentPassword, newPassword} }
 * PIN・パスワードの変更は今のパスワードの確認が先（どれか1つでも違えば何も変えない）。
 * パスワードを変えたら、ほかの端末のログインはすべて終了し、この端末のトークンも入れ替える。
 */
export const PATCH = withAuthApi("parent-settings", async (req) => {
  const ctx = await requireParentArea();
  const parsed = await parseBody(req, ParentSettingsRequestSchema);
  if (!parsed.success) {
    const onPassword = parsed.error.issues.some((i) => i.path.includes("newPassword"));
    const onPin = parsed.error.issues.some((i) => i.path.includes("newPin"));
    const msg = onPassword ? `新しいパスワードは${PASSWORD_RULES_JA}` : onPin ? "暗証番号は数字4けたで入力してください。" : "入力内容を確認してください。";
    return authFail(msg, 400, "INVALID_INPUT");
  }
  const { dailyLessonLimit, changePin, changePassword } = parsed.data;

  const passwords = [changePin?.password, changePassword?.currentPassword].filter((p): p is string => p !== undefined);
  if (passwords.length > 0) {
    const key = `pw:${ctx.parent.id}`;
    const limit = reauthLimiter.hit(key);
    if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
    for (const p of passwords) {
      if (!(await verifyParentPassword(ctx.parent.id, p))) return authFail(WRONG_PASSWORD_JA, 401, "WRONG_PASSWORD");
    }
    reauthLimiter.reset(key);
  }

  let settings = undefined;
  if (dailyLessonLimit) {
    settings = await setDailyLessonLimit(ctx.parent.id, dailyLessonLimit.childId, dailyLessonLimit.limit);
    if (!settings) return authFail(CHILD_NOT_FOUND_JA, 404, "NOT_FOUND");
  }
  if (changePin) await changeParentPin(ctx.parent.id, changePin.newPin);
  if (changePassword) {
    await changeParentPassword(ctx.parent.id, changePassword.newPassword);
    await destroyOtherSessions(ctx.parent.id, ctx.session.id);
    await rotateCurrentSession(ctx);
  }
  return authOk({ settings: settings ?? (await getParentSettings(ctx.parent.id)), messageJa: "設定を保存しました。" });
});
