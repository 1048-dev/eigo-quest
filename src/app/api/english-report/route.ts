import { NO_LEARNER_ID, resolveLearner } from "@/lib/auth";
import { clientIp, englishReportLimiter } from "@/lib/auth/rateLimit";
import { isDbUp, markDbDown } from "@/lib/db";
import { saveEnglishReport } from "@/lib/services/englishReportService";
import { isDbConnectionError, jsonError, jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import { EnglishReportRequestSchema, type EnglishReportResponse } from "@/lib/api/contracts";

/**
 * POST /api/english-report — 「この英語、へん？」（run9 Phase 1）。
 *  - 保存できたら { ok: true, saved: true }。おなじ clientId を もう一度 送っても 1件だけ（冪等）
 *  - DB が 止まっている → { ok: true, saved: false }（端末が のこして あとで 送りなおす）
 *  - 形が おかしい → 400（端末は すてる）／ 送りすぎ → 429（端末は あとで 送りなおす）
 * 学習者を あたらしく つくらない（create: false）。わからなければ userId は null。
 */
export const POST = withApi("english-report", async (req) => {
  const parsed = EnglishReportRequestSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return jsonError("報告の 形が ちがうよ。", 400, { code: "INVALID" });
  const limit = await englishReportLimiter.hit(clientIp(req));
  if (!limit.ok) return jsonError("ちょっと まってから また 送ってね。", 429, { code: "RATE_LIMITED", retryAfterSec: limit.retryAfterSec });

  let res: EnglishReportResponse;
  try {
    if (!(await isDbUp())) throw new Error("database is down");
    const learner = await resolveLearner({ create: false });
    await saveEnglishReport(parsed.data, learner.userId === NO_LEARNER_ID ? null : learner.userId);
    res = { ok: true, saved: true };
  } catch (e) {
    if (isDbConnectionError(e)) markDbDown();
    console.error("[api:english-report] not saved", e);
    res = { ok: true, saved: false };
  }
  return jsonOk(res);
});
