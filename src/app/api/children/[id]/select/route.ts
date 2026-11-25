import { requireParent } from "@/lib/auth";
import { authFail, authOk, withAuthApi } from "@/lib/auth/api";
import { ChildIdSchema } from "@/lib/api/contracts";
import { selectChild } from "@/lib/services/parentService";

const NOT_FOUND_CHILD_JA = "その こは みつからなかったよ。";

/** POST /api/children/:id/select — 「だれが あそぶ？」で選ぶ（子どもが操作するので PIN はいらない） */
export const POST = withAuthApi<{ params: Promise<{ id: string }> }>("children-select", async (_req, { params }) => {
  const ctx = await requireParent();
  const id = ChildIdSchema.safeParse((await params).id);
  if (!id.success) return authFail(NOT_FOUND_CHILD_JA, 404, "NOT_FOUND");
  const child = await selectChild(ctx.parent.id, ctx.session.id, id.data);
  if (!child) return authFail(NOT_FOUND_CHILD_JA, 404, "NOT_FOUND");
  return authOk({ child, messageJa: `${child.nickname}さん、いっしょに がんばろう！` });
});
