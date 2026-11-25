import { currentUserId } from "@/lib/auth";
import { isDbUp } from "@/lib/db";
import { submitYearly } from "@/lib/services/yearlyService";
import { jsonError, jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import { YearlySubmitRequestSchema, type YearlySubmitResponse } from "@/lib/api/contracts";
import { localDate } from "@/lib/domain/dates";
import { formatDayJa } from "@/lib/yearly/availability";
import { loadYearlyTest } from "@/lib/yearly/catalog";
import { buildResult, sanitizeAnswers } from "@/lib/yearly/scoring";

/**
 * POST /api/yearly/submit — 力だめしを 出す。サーバーで 受けられるかを 確かめ、採点しなおして 保存する。
 *  - 1 年に 1 回（おためしは 1 回）。もう 受けていたら 409
 *  - DB が 止まっている ときは ルール採点だけ して saved:false（ブラウザが 自分の きろくに のこす・おためしモードと 同じ）
 */
export const POST = withApi("yearly-submit", async (req) => {
  const body = YearlySubmitRequestSchema.parse(await readJsonBody(req));

  let dbUp = false;
  try {
    dbUp = await isDbUp();
  } catch {
    dbUp = false;
  }
  if (dbUp) {
    try {
      const r = await submitYearly(await currentUserId(), body);
      switch (r.status) {
        case "SAVED":
          return jsonOk({ ok: true, saved: true, result: r.result, growth: r.growth, messageJa: "けっかを きろくしたよ！" } satisfies YearlySubmitResponse);
        case "NOT_AVAILABLE":
          return jsonError(
            r.availability.reason === "TRIAL_USED" ? "おためしでは 力だめしは 1 回だけだよ。" : `つぎの 力だめしは ${formatDayJa(r.availability.nextOn)} から 受けられるよ。`,
            409, { code: r.availability.reason },
          );
        case "STAGE_CHANGED":
          return jsonError("もういちど さいしょから ひらいてね。", 409, { code: "STAGE_CHANGED", stage: r.stage });
        case "NOT_FOUND":
          return jsonError("その 力だめしは みつからないよ。", 404);
      }
    } catch (e) {
      console.error("[api:yearly-submit] DB unavailable; scoring without saving", e);
    }
  }
  // DB なし: ルール採点だけ（保存しない）
  const test = await loadYearlyTest(body.stage);
  if (!test) return jsonError("その 力だめしは みつからないよ。", 404);
  const result = buildResult(test, sanitizeAnswers(test, body.answers), localDate(new Date()));
  return jsonOk({ ok: true, saved: false, result, growth: null, messageJa: "けっかは この たんまつに のこすよ。" } satisfies YearlySubmitResponse);
});
