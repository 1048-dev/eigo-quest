import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient; dbHealth?: { up: boolean; at: number } };

let client: PrismaClient | undefined = g.prisma;
function getClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient();
    if (process.env.NODE_ENV !== "production") g.prisma = client;
  }
  return client;
}

/** Prisma クライアント（最初に使われたときに作る。import しただけでは接続しない） */
export const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const v = c[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
});

const HEALTH_TTL_UP_MS = 30_000; // つながっていたら30秒は再確認しない
const HEALTH_TTL_DOWN_MS = 5_000; // つながらなかったら5秒後にまた試す（DBが起動したらすぐ戻る）
const HEALTH_TIMEOUT_MS = 1_500;

/**
 * DBにつながるかを素早く確認する（結果は短時間キャッシュ）。
 * PostgreSQL が止まっていると Prisma は接続を数秒待ってしまうので、
 * 1.5秒で見切りをつけて、API はすぐにオフライン用データを返せるようにする。
 */
export async function isDbUp(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  const now = Date.now();
  const h = g.dbHealth;
  if (h && now - h.at < (h.up ? HEALTH_TTL_UP_MS : HEALTH_TTL_DOWN_MS)) return h.up;
  let up = false;
  try {
    up = await Promise.race([
      getClient().$queryRaw`SELECT 1`.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), HEALTH_TIMEOUT_MS)),
    ]);
  } catch {
    up = false;
  }
  g.dbHealth = { up, at: now };
  return up;
}

/** DBの処理中にエラーが起きたら「つながっていない」と記録し、次のリクエストはすぐオフラインにする */
export function markDbDown() {
  g.dbHealth = { up: false, at: Date.now() };
}
