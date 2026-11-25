import { isLineLoginConfigured } from "@/lib/auth/line";
import { cronSecret } from "@/lib/cron";
import { isDbUp } from "@/lib/db";
import { canPush, lineMessagingConfig } from "@/lib/line/messaging";
import { mailConfig } from "@/lib/mail";
import { createStorage, isEphemeralLocal, storageConfig } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORAGE_PING_TIMEOUT_MS = 5_000;

export interface HealthReport {
  ok: boolean;
  time: string;
  db: { configured: boolean; reachable: boolean };
  storage: { driver: "local" | "s3"; configured: boolean; reachable: boolean; persistent: boolean };
  line: { login: boolean; messaging: boolean; webhook: boolean };
  mail: { provider: string; deliverable: boolean };
  cron: { configured: boolean };
}

async function pingStorage(): Promise<boolean> {
  const cfg = storageConfig();
  if (cfg.missing.length) return false;
  try {
    const storage = createStorage(cfg);
    const r = await Promise.race([
      storage.ping(),
      new Promise<{ ok: false }>((resolve) => setTimeout(() => resolve({ ok: false }), STORAGE_PING_TIMEOUT_MS)),
    ]);
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * GET /api/health — 動いているかの確認（公開。秘密・バケット名・パス・ホスト名は出さない。「設定されているか」と「つながるか」だけ）。
 * DB と ファイルの置き場所に つながれば 200、どちらかが だめなら 503。
 */
export async function GET(): Promise<Response> {
  const dbConfigured = !!process.env.DATABASE_URL?.trim();
  const [dbUp, storageUp] = await Promise.all([dbConfigured ? isDbUp() : Promise.resolve(false), pingStorage()]);
  const sc = storageConfig();
  const lineCfg = lineMessagingConfig();
  const mail = mailConfig();
  const body: HealthReport = {
    ok: dbUp && storageUp,
    time: new Date().toISOString(),
    db: { configured: dbConfigured, reachable: dbUp },
    storage: { driver: sc.driver, configured: sc.missing.length === 0, reachable: storageUp, persistent: !isEphemeralLocal() },
    line: { login: isLineLoginConfigured(), messaging: canPush(lineCfg), webhook: !!lineCfg.channelSecret },
    mail: { provider: mail.provider, deliverable: mail.provider !== "outbox" },
    cron: { configured: !!cronSecret() },
  };
  return Response.json(body, { status: body.ok ? 200 : 503, headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } });
}
