import { prisma } from "@/lib/db";
import { requireParent } from "@/lib/auth";
import { authFail, authOk, parseBody, withAuthApi } from "@/lib/auth/api";
import { SetupPinRequestSchema } from "@/lib/api/contracts";
import { setInitialPin } from "@/lib/services/parentService";

/**
 * POST /api/auth/line/pin {pin}
 * LINE で登録した直後に、はじめての保護者用暗証番号（4けた）を決める。
 * すでに暗証番号がある保護者は変更できない（変更は「おうちの方」ページから、本人確認つきで）。
 * 決めたら、メールの登録と同じく「暗証番号を入力ずみ」として扱う（そのままお子さまを追加できる）。
 */
export const POST = withAuthApi("line-setup-pin", async (req) => {
  const ctx = await requireParent();
  const parsed = await parseBody(req, SetupPinRequestSchema);
  if (!parsed.success) return authFail("暗証番号は数字4けたで入力してください。", 400, "INVALID_INPUT");
  if (!(await setInitialPin(ctx.parent.id, parsed.data.pin))) {
    return authFail("暗証番号はすでに決まっています。変更は「おうちの方」のページから行ってください。", 409, "PIN_ALREADY_SET");
  }
  await prisma.session.update({ where: { id: ctx.session.id }, data: { pinVerifiedAt: new Date() } });
  return authOk({ messageJa: "暗証番号を決めました。" });
});
