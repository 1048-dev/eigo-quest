import { requireParent } from "@/lib/auth";
import { authFail, authOk, withAuthApi } from "@/lib/auth/api";
import { clearSessionToken } from "@/lib/auth/cookies";
import { cancelLineSignup } from "@/lib/services/parentService";

/**
 * POST /api/auth/line/cancel
 * LINE で登録した直後（暗証番号を決める前・お子さま未登録）に「やめる」→ 作ったばかりのアカウントを消してログアウト。
 * メールで登録ずみの方が まちがえて LINE で新しく登録してしまったとき用。それ以外のアカウントは消せない（409）。
 */
export const POST = withAuthApi("line-cancel-signup", async () => {
  const ctx = await requireParent();
  if (!(await cancelLineSignup(ctx.parent.id))) {
    return authFail("このアカウントは取り消せません。退会は「おうちの方」のページから行ってください。", 409, "CANNOT_CANCEL");
  }
  await clearSessionToken();
  return authOk({ messageJa: "LINE での登録を取り消しました。" });
});
