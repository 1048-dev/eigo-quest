import { currentUserId } from "@/lib/auth";
import { isDbUp } from "@/lib/db";
import { claimLibraryReward } from "@/lib/services/libraryService";
import { jsonError, jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import { LibraryRewardRequestSchema, type LibraryRewardResponse } from "@/lib/api/contracts";
import { metaOf } from "@/lib/library/catalog";
import type { LibraryActivity } from "@/lib/library/rules";

/**
 * POST /api/library/reward — としょかんで おはなしを よめた（クイズ 2問以上 正解）・チャンツを さいごまで・フリートークを 3回以上。
 * 1日1回だけ 5コイン（同じ日に 何回 送っても 同じ結果＝冪等）。採点と 解放は サーバーで やりなおす。
 * DB が 止まっていても ok:true（コイン 0・saved:false）。としょかんは「おまけ」なので 失敗を 子どもに 見せない。
 */
export const POST = withApi("library-reward", async (req) => {
  const body = LibraryRewardRequestSchema.parse(await readJsonBody(req));
  if (!metaOf(body.kind, body.id)) return jsonError("その おはなしは みつからないよ。", 404);
  const activity: LibraryActivity =
    body.kind === "story" ? { kind: "story", id: body.id, answers: body.answers }
      : body.kind === "chant" ? { kind: "chant", id: body.id, finished: body.finished }
        : { kind: "talk", id: body.id, turns: body.turns };

  let res: LibraryRewardResponse;
  try {
    if (!(await isDbUp())) throw new Error("database is down");
    const r = await claimLibraryReward(await currentUserId(), activity);
    switch (r.status) {
      case "AWARDED":
        res = { ok: true, coinsAwarded: r.coins, alreadyToday: false, completed: true, saved: true, messageJa: `${r.labelJa} コイン +${r.coins}` };
        break;
      case "ALREADY_TODAY":
        res = { ok: true, coinsAwarded: 0, alreadyToday: true, completed: true, saved: true, messageJa: "きょうの としょかんコインは もう もらったよ。また あしたね！" };
        break;
      case "NOT_COMPLETE":
        res = { ok: true, coinsAwarded: 0, alreadyToday: false, completed: false, saved: true, messageJa: activity.kind === "story" ? "2もん いじょう あたると コインが もらえるよ。もういちど よんでみよう！" : "さいごまで やると コインが もらえるよ。" };
        break;
      case "LOCKED":
        return jsonError(`Lesson ${r.unlockLesson} を クリアすると ひらくよ。`, 403, { code: "LOCKED", unlockLesson: r.unlockLesson });
      case "NOT_FOUND":
        return jsonError("その おはなしは みつからないよ。", 404);
    }
  } catch (e) {
    console.error("[api:library-reward] DB unavailable", e);
    res = { ok: true, coinsAwarded: 0, alreadyToday: false, completed: false, saved: false, messageJa: "よく がんばったね！（いまは コインを きろくできなかったよ）" };
  }
  return jsonOk(res);
});
