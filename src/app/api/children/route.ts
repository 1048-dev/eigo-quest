import { requireParent, requireParentArea } from "@/lib/auth";
import { authFail, authOk, parseBody, withAuthApi } from "@/lib/auth/api";
import { AUTH_LIMITS, ChildCreateRequestSchema } from "@/lib/api/contracts";
import { createChild, listChildren } from "@/lib/services/parentService";

/** GET /api/children — 「だれが あそぶ？」用。ログインしていれば PIN なしで見られる */
export const GET = withAuthApi("children-list", async () => {
  const ctx = await requireParent();
  const children = await listChildren(ctx.parent.id);
  const selectedChildId = children.some((c) => c.id === ctx.session.selectedChildId) ? ctx.session.selectedChildId : null;
  return authOk({ children, selectedChildId });
});

/** POST /api/children {nickname, schoolGrade, birthYear?} — 子どもを追加（保護者PINが必要） */
export const POST = withAuthApi("children-create", async (req) => {
  const ctx = await requireParentArea();
  const parsed = await parseBody(req, ChildCreateRequestSchema);
  if (!parsed.success) {
    return authFail(`ニックネーム（${AUTH_LIMITS.nicknameMax}文字まで）と学年（1〜6年生）を確認してください。`, 400, "INVALID_INPUT");
  }
  const r = await createChild(ctx.parent.id, parsed.data);
  if (!r.ok) return authFail(`登録できるお子さまは${AUTH_LIMITS.maxChildren}人までです。`, 409, "TOO_MANY_CHILDREN");
  return authOk({ child: r.child, messageJa: "お子さまを追加しました。" }, 201);
});
