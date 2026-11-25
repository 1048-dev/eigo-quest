import { requireParent } from "@/lib/auth";
import { authFail, authOk, parseBody, withAuthApi } from "@/lib/auth/api";
import { ChildAvatarRequestSchema, ChildIdSchema } from "@/lib/api/contracts";
import { setChildAvatar } from "@/lib/services/parentService";

const NOT_FOUND_JA = "その こは みつからなかったよ。";

/**
 * PATCH /api/children/:id/avatar {avatarCharacter} — 子どもが じぶんで 顔を かえる。
 * 子どもが操作するので 暗証番号は いらない（ログインは必要・自分の家の子どもだけ）。
 */
export const PATCH = withAuthApi<{ params: Promise<{ id: string }> }>("children-avatar", async (req, { params }) => {
  const ctx = await requireParent();
  const id = ChildIdSchema.safeParse((await params).id);
  if (!id.success) return authFail(NOT_FOUND_JA, 404, "NOT_FOUND");
  const parsed = await parseBody(req, ChildAvatarRequestSchema);
  if (!parsed.success) return authFail("その キャラクターは えらべないよ。", 400, "INVALID_INPUT");
  const child = await setChildAvatar(ctx.parent.id, id.data, parsed.data.avatarCharacter);
  if (!child) return authFail(NOT_FOUND_JA, 404, "NOT_FOUND");
  return authOk({ child, messageJa: "かおを かえたよ！" });
});
