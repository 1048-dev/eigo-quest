import { requireParentArea } from "@/lib/auth";
import { authFail, authOk, CHILD_NOT_FOUND_JA, parseBody, withAuthApi } from "@/lib/auth/api";
import { AUTH_LIMITS, ChildIdSchema, ChildUpdateRequestSchema } from "@/lib/api/contracts";
import { deleteChild, updateChild } from "@/lib/services/parentService";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/children/:id {nickname?, schoolGrade?, birthYear?} — 保護者PINが必要 */
export const PATCH = withAuthApi<Ctx>("children-update", async (req, { params }) => {
  const ctx = await requireParentArea();
  const id = ChildIdSchema.safeParse((await params).id);
  if (!id.success) return authFail(CHILD_NOT_FOUND_JA, 404, "NOT_FOUND");
  const parsed = await parseBody(req, ChildUpdateRequestSchema);
  if (!parsed.success) {
    return authFail(`ニックネーム（${AUTH_LIMITS.nicknameMax}文字まで）と学年（1〜6年生）を確認してください。`, 400, "INVALID_INPUT");
  }
  const child = await updateChild(ctx.parent.id, id.data, parsed.data);
  if (!child) return authFail(CHILD_NOT_FOUND_JA, 404, "NOT_FOUND");
  return authOk({ child, messageJa: "変更を保存しました。" });
});

/** DELETE /api/children/:id — その子どもの学習データもすべて消す（保護者PINが必要） */
export const DELETE = withAuthApi<Ctx>("children-delete", async (_req, { params }) => {
  const ctx = await requireParentArea();
  const id = ChildIdSchema.safeParse((await params).id);
  if (!id.success) return authFail(CHILD_NOT_FOUND_JA, 404, "NOT_FOUND");
  const ok = await deleteChild(ctx.parent.id, id.data);
  if (!ok) return authFail(CHILD_NOT_FOUND_JA, 404, "NOT_FOUND");
  return authOk({ messageJa: "お子さまの情報と学習記録を削除しました。" });
});
