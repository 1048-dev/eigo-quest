/**
 * 定期実行（cron）の API を守る（run5 Phase 3）。
 *  - Vercel Cron Jobs は 環境変数 CRON_SECRET があると「Authorization: Bearer <CRON_SECRET>」を付けて GET してくる
 *  - ほかのスケジューラ（GitHub Actions・cron-job.org・自分のサーバーの crontab + curl）からも同じヘッダーで呼べる
 *  - CRON_SECRET が無い（または短すぎる）ときは 何もしない（503）。ちがう値なら 401
 */
import { createHash, timingSafeEqual } from "node:crypto";

export const CRON_SECRET_MIN_LENGTH = 16;

export type CronAuth = { ok: true } | { ok: false; status: 401 | 503; code: "CRON_NOT_CONFIGURED" | "UNAUTHORIZED" };

const digest = (s: string) => createHash("sha256").update(s, "utf8").digest();

export function cronSecret(env: Record<string, string | undefined> = process.env): string | null {
  const s = env.CRON_SECRET?.trim() ?? "";
  return s.length >= CRON_SECRET_MIN_LENGTH ? s : null;
}

export function checkCronAuth(req: Request, env: Record<string, string | undefined> = process.env): CronAuth {
  const secret = cronSecret(env);
  if (!secret) return { ok: false, status: 503, code: "CRON_NOT_CONFIGURED" };
  const header = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!m) return { ok: false, status: 401, code: "UNAUTHORIZED" };
  // 長さの違いも わからないよう、ハッシュどうしを 一定時間で くらべる
  return timingSafeEqual(digest(m[1]!.trim()), digest(secret)) ? { ok: true } : { ok: false, status: 401, code: "UNAUTHORIZED" };
}

export function cronJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export function cronDenied(auth: Exclude<CronAuth, { ok: true }>): Response {
  return cronJson({ ok: false, code: auth.code }, auth.status);
}
