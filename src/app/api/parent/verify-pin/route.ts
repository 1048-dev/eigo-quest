import { prisma } from "@/lib/db";
import { requireParent } from "@/lib/auth";
import { authFail, authOk, parseBody, tooManyAttempts, withAuthApi, WRONG_PIN_JA } from "@/lib/auth/api";
import { pinLimiter } from "@/lib/auth/rateLimit";
import { PIN_UNLOCK_MS } from "@/lib/auth/session";
import { VerifyPinRequestSchema } from "@/lib/api/contracts";
import { verifyParentPin } from "@/lib/services/parentService";

/** POST /api/parent/verify-pin {pin} — 「おうちの方」エリアに入る（一定時間だけ開く） */
export const POST = withAuthApi("verify-pin", async (req) => {
  const ctx = await requireParent();
  const parsed = await parseBody(req, VerifyPinRequestSchema);
  if (!parsed.success) return authFail("暗証番号は数字4けたで入力してください。", 400, "INVALID_INPUT");

  const key = `pin:${ctx.parent.id}`;
  const limit = pinLimiter.hit(key);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSec);
  if (!(await verifyParentPin(ctx.parent.id, parsed.data.pin))) return authFail(WRONG_PIN_JA, 401, "WRONG_PIN");

  pinLimiter.reset(key);
  const now = new Date();
  await prisma.session.update({ where: { id: ctx.session.id }, data: { pinVerifiedAt: now } });
  return authOk({ unlockedUntil: new Date(now.getTime() + PIN_UNLOCK_MS).toISOString() });
});
