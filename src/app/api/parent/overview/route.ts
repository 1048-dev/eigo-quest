import { requireParentArea } from "@/lib/auth";
import { authOk, withAuthApi } from "@/lib/auth/api";
import { getParentOverview } from "@/lib/services/parentService";

/** GET /api/parent/overview — 子どもごとのようす（レッスン数・連続日数・コイン・総合習得率・最終学習日・にがてな能力） */
export const GET = withAuthApi("parent-overview", async () => {
  const ctx = await requireParentArea();
  return authOk({ children: await getParentOverview(ctx.parent.id) });
});
