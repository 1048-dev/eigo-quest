import { currentUserId } from "@/lib/auth";
import { dismissTreasureAlert, getOrCreateTreasureAlert } from "@/lib/services/progressService";
import { jsonOk, withOffline } from "@/lib/api/server";
import { offlineTreasureAlert } from "@/lib/offline";
import type { TreasureAlertResponse } from "@/lib/api/contracts";

/** GET /api/treasure-alert — ログイン時に呼ぶ。忘れかけレッスンがあればランダムでお宝アラート */
export const GET = withOffline("treasure-alert", async () => {
  const r = await getOrCreateTreasureAlert(await currentUserId());
  const body: TreasureAlertResponse = r.show && "alert" in r && r.alert
    ? { show: true, alert: { id: r.alert.id, lessonNo: r.alert.lessonNo, multiplier: r.alert.multiplier }, messageJa: r.messageJa ?? "" }
    : { show: false, alert: null, messageJa: "" };
  return jsonOk(body);
}, () => offlineTreasureAlert());

/** DELETE /api/treasure-alert?id=... — 「あとで」 */
export const DELETE = withOffline("treasure-alert", async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (id) await dismissTreasureAlert(await currentUserId(), id);
  return jsonOk({ show: false, alert: null, messageJa: "" } satisfies TreasureAlertResponse);
}, () => offlineTreasureAlert());
