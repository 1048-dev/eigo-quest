import { currentUserId } from "@/lib/auth";
import { getLesson } from "@/lib/curriculum";
import { recordRecapWatched } from "@/lib/services/recapService";
import { isDbUp } from "@/lib/db";
import { jsonError, jsonOk, withApi } from "@/lib/api/server";
import type { RecapWatchedResponse } from "@/lib/api/contracts";

/**
 * POST /api/recap/:n/watched — 「きょうのまとめ」を最後まで見た。
 * 1日1回だけ 5コイン（同じ日に何回送っても同じ結果＝冪等）。DB が止まっていても ok:true（コイン 0）。
 */
export const POST = withApi<{ params: Promise<{ lessonNo: string }> }>("recap-watched", async (_req, { params }) => {
  const n = Number((await params).lessonNo);
  if (!Number.isInteger(n) || !getLesson(n)) return jsonError("レッスンが見つからないよ。", 404);

  let body: RecapWatchedResponse;
  try {
    // DB が止まっているのが わかっていれば 待たずに「コインなしで成功」（接続待ちで 画面を 止めない）
    if (!(await isDbUp())) throw new Error("database is down");
    const r = await recordRecapWatched(await currentUserId(), n);
    body = r.status === "AWARDED"
      ? { ok: true, coinsAwarded: r.coins, alreadyToday: false, saved: true, messageJa: `${r.labelJa} コイン +${r.coins}` }
      : r.status === "ALREADY_TODAY"
        ? { ok: true, coinsAwarded: 0, alreadyToday: true, saved: true, messageJa: "きょうの まとめコインは もう もらったよ。また あしたね！" }
        : { ok: true, coinsAwarded: 0, alreadyToday: false, saved: true, messageJa: "レッスンを クリアすると コインが もらえるよ。" };
  } catch (e) {
    // DB が動いていないなど。まとめは「おまけ」なので成功あつかいにする
    console.error("[api:recap-watched] DB unavailable", e);
    body = { ok: true, coinsAwarded: 0, alreadyToday: false, saved: false, messageJa: "さいごまで みたね！ すごい！（いまは コインを きろくできなかったよ）" };
  }
  return jsonOk(body);
});
