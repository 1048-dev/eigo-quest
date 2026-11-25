import { requireParent } from "@/lib/auth";
import { authFail, authOk, parseBody, withAuthApi } from "@/lib/auth/api";
import { ChildIdSchema, TrialCarryRequestSchema, type TrialCarryResponse } from "@/lib/api/contracts";
import { carryOverTrial } from "@/lib/services/trialCarryService";

const NOT_FOUND_JA = "その こは みつからなかったよ。";

/**
 * POST /api/children/:id/carry-over — この端末の おためしの きろくを その子に ひきつぐ。
 * 「だれが あそぶ？」で子どもが「はい」を おすので 暗証番号は いらない（ログインは必要・自分の家の子どもだけ）。
 * 端末の おためしIDごとに1回だけ（2回目は alreadyCarried:true で なにもしない）。
 */
export const POST = withAuthApi<{ params: Promise<{ id: string }> }>("children-carry-over", async (req, { params }) => {
  const ctx = await requireParent();
  const id = ChildIdSchema.safeParse((await params).id);
  if (!id.success) return authFail(NOT_FOUND_JA, 404, "NOT_FOUND");
  const parsed = await parseBody(req, TrialCarryRequestSchema);
  if (!parsed.success) return authFail("おためしの きろくを よみとれなかったよ。", 400, "INVALID_INPUT");
  const r = await carryOverTrial(ctx.parent.id, id.data, parsed.data);
  if (!r.ok) return authFail(NOT_FOUND_JA, 404, "NOT_FOUND");
  const messageJa = r.alreadyCarried ? "この きろくは もう ひきついで あるよ。" : "おためしの きろくを ひきついだよ！";
  return authOk({ alreadyCarried: r.alreadyCarried, carried: r.carried, messageJa } satisfies Omit<TrialCarryResponse, "ok" | "success">);
});
