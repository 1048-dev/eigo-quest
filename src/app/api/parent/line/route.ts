import { requireParentArea } from "@/lib/auth";
import { authFail, authOk, withAuthApi } from "@/lib/auth/api";
import { unlinkLine } from "@/lib/services/parentService";

/**
 * DELETE /api/parent/line — LINE の連携を外す（おうちの方エリア = 暗証番号が必要）。
 * メール + パスワードでログインできない（LINE だけで登録した）アカウントは外せない（ログインできなくなるため）。
 * 連携は GET /api/auth/line/start?mode=link から（LINE の画面を通るのでページ移動）。
 */
export const DELETE = withAuthApi("parent-line-unlink", async () => {
  const ctx = await requireParentArea();
  const r = await unlinkLine(ctx.parent.id);
  if (r.ok) return authOk({ messageJa: "LINE の連携を解除しました。" });
  if (r.reason === "NEEDS_PASSWORD") {
    return authFail("LINE だけで登録したアカウントは、LINE の連携を解除できません（ログインできなくなるため）。", 409, "NEEDS_PASSWORD");
  }
  return authFail("LINE とは連携していません。", 404, "NOT_LINKED");
});
