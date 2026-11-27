/**
 * レート制限（固定ウィンドウ）。
 *  - SharedRateLimiter（アプリで使うもの）: DB の表 RateLimitBucket で数える（run5 Phase 3）。
 *    Vercel などで サーバーが何台あっても・再起動しても 同じ数え方になる。
 *    DB が止まっている・使えないときは このサーバーのメモリで数える（RateLimiter）。
 *  - RateLimiter: メモリだけの数え方（フォールバック・テスト用）
 * DB のキーは「制限の名前:キーの SHA-256」。メールアドレスや IP をそのまま保存しない。
 */
import { createHash } from "node:crypto";
import { isDbUp, prisma } from "@/lib/db";

export interface LimitResult {
  ok: boolean;
  retryAfterSec: number;
}

export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly max: number, private readonly windowMs: number, private readonly maxKeys = 10_000) {}

  /** 1回ぶん数える。制限を超えていたら false（数えない） */
  hit(key: string, now = Date.now()): LimitResult {
    const e = this.hits.get(key);
    if (!e || e.resetAt <= now) {
      if (this.hits.size >= this.maxKeys) this.sweep(now);
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true, retryAfterSec: 0 };
    }
    if (e.count >= this.max) return { ok: false, retryAfterSec: Math.ceil((e.resetAt - now) / 1000) };
    e.count++;
    return { ok: true, retryAfterSec: 0 };
  }

  /** 成功したら数え直す */
  reset(key: string): void {
    this.hits.delete(key);
  }

  clear(): void {
    this.hits.clear();
  }

  private sweep(now: number) {
    for (const [k, v] of this.hits) if (v.resetAt <= now) this.hits.delete(k);
    // それでも多すぎるときは古いものから捨てる（メモリを使いすぎない）
    while (this.hits.size >= this.maxKeys) {
      const first = this.hits.keys().next().value;
      if (first === undefined) break;
      this.hits.delete(first);
    }
  }
}

// ---------------------------------------------------------------------------
// DB で数える
// ---------------------------------------------------------------------------
type RawClient = {
  $queryRaw: <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
  $executeRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<number>;
};

let warned = false;
function warnOnce(e: unknown) {
  if (warned) return;
  warned = true;
  console.warn(`[rate-limit] DB で数えられないため、このサーバーのメモリで数えます（${(e as Error)?.name ?? "Error"}）`);
}

/** DB の生の SQL が使えるときだけ そのクライアント（DB 停止・テスト用のメモリ内 Prisma では null） */
async function rawDb(): Promise<RawClient | null> {
  try {
    if (!(await isDbUp())) return null;
    const c = prisma as unknown as Partial<RawClient>;
    return typeof c.$queryRaw === "function" && typeof c.$executeRaw === "function" ? (c as RawClient) : null;
  } catch {
    return null;
  }
}

export function bucketKey(name: string, key: string): string {
  return `${name}:${createHash("sha256").update(key).digest("hex").slice(0, 40)}`;
}

/** 1回ぶん数えて、いまの回数と ウィンドウの終わりを返す（1つの SQL なので 同時に来ても数えもれがない） */
async function dbHit(db: RawClient, k: string, windowMs: number, now: number): Promise<{ count: number; resetAt: Date }> {
  const at = new Date(now);
  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt") VALUES (${k}, 1, ${new Date(now + windowMs)})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= ${at} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${at} THEN EXCLUDED."resetAt" ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count", "resetAt"`;
  const row = rows[0];
  if (!row) throw new Error("rate limit upsert returned no row");
  return { count: Number(row.count), resetAt: new Date(row.resetAt) };
}

export class SharedRateLimiter {
  private readonly memory: RateLimiter;

  constructor(readonly name: string, readonly max: number, readonly windowMs: number) {
    this.memory = new RateLimiter(max, windowMs);
  }

  async hit(key: string, now = Date.now()): Promise<LimitResult> {
    const db = await rawDb();
    if (db) {
      try {
        const r = await dbHit(db, bucketKey(this.name, key), this.windowMs, now);
        if (r.count <= this.max) return { ok: true, retryAfterSec: 0 };
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((r.resetAt.getTime() - now) / 1000)) };
      } catch (e) {
        warnOnce(e);
      }
    }
    return this.memory.hit(key, now);
  }

  /** 成功したら数え直す */
  async reset(key: string): Promise<void> {
    this.memory.reset(key);
    const db = await rawDb();
    if (!db) return;
    try {
      await db.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "key" = ${bucketKey(this.name, key)}`;
    } catch (e) {
      warnOnce(e);
    }
  }

  /** メモリの分だけ消す（テスト用） */
  clearMemory(): void {
    this.memory.clear();
  }
}

// ---------------------------------------------------------------------------
// ロック（同じことを同時に2回しない。サーバーが何台でも）
// ---------------------------------------------------------------------------
const memoryLocks = new Map<string, number>();

/**
 * name + id のロックを取る。取れたら はずす関数、ほかで使用中なら null。
 * ttlMs をすぎたロックは（はずし忘れ・サーバーが落ちたときも）自動でとける。
 */
export async function acquireLock(name: string, id: string, ttlMs: number, now = Date.now()): Promise<(() => Promise<void>) | null> {
  const k = bucketKey(`lock:${name}`, id);
  const db = await rawDb();
  if (db) {
    try {
      const rows = await db.$queryRaw<{ key: string }[]>`
        INSERT INTO "RateLimitBucket" ("key", "count", "resetAt") VALUES (${k}, 1, ${new Date(now + ttlMs)})
        ON CONFLICT ("key") DO UPDATE SET "count" = 1, "resetAt" = EXCLUDED."resetAt"
        WHERE "RateLimitBucket"."resetAt" <= ${new Date(now)}
        RETURNING "key"`;
      if (rows.length === 0) return null;
      return async () => {
        await db.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "key" = ${k}`.catch(() => {});
      };
    } catch (e) {
      warnOnce(e);
    }
  }
  const until = memoryLocks.get(k);
  if (until && until > now) return null;
  memoryLocks.set(k, now + ttlMs);
  return async () => {
    memoryLocks.delete(k);
  };
}

/** 期限が切れて1時間たった行を消す（cron のそうじから呼ぶ） */
export async function purgeExpiredRateLimits(now = new Date()): Promise<number> {
  const db = await rawDb();
  if (!db) return 0;
  return db.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < ${new Date(now.getTime() - 3_600_000)}`;
}

const MIN = 60_000;
/**
 * ログイン: 同じ IP + メールで 15分に 8回、同じ IP から 15分に 30回、
 * さらに IP に関係なく同じメールに 15分に 20回まで。
 * （x-forwarded-for はプロキシの無い環境では送り手が自由に書けるので、IP だけの制限はすりぬけられる。
 *   メールごとの制限があれば、IP を変えながら 1つのアカウントを総当たりすることはできない）
 */
export const loginLimiter = new SharedRateLimiter("login", 8, 15 * MIN);
export const loginIpLimiter = new SharedRateLimiter("login-ip", 30, 15 * MIN);
export const loginEmailLimiter = new SharedRateLimiter("login-email", 20, 15 * MIN);
/** 登録: 同じ IP から 1時間に 10回まで */
export const registerLimiter = new SharedRateLimiter("register", 10, 60 * MIN);
/** 保護者PIN（4けた = 1万通り）: 同じ保護者で 15分に 5回まで（子どもが当てずっぽうで開けられないように） */
export const pinLimiter = new SharedRateLimiter("pin", 5, 15 * MIN);
/** パスワードの再入力（暗証番号・パスワードの変更、退会）: 同じ保護者で 15分に 8回まで */
export const reauthLimiter = new SharedRateLimiter("reauth", 8, 15 * MIN);
/**
 * パスワードを忘れた（run5）:
 *  - 同じ IP から 1時間に 10回まで（こえたら 429。登録の有無とは関係ないので 何も教えない）
 *  - 同じメールアドレスへは 1時間に 3通まで（こえても 答えは同じ。だまって 送らない = 登録の有無を教えない・メール爆撃を防ぐ）
 */
export const forgotIpLimiter = new SharedRateLimiter("forgot-ip", 10, 60 * MIN);
export const forgotEmailLimiter = new SharedRateLimiter("forgot-email", 3, 60 * MIN);
/** 再設定リンク・確認リンクの 確認と 使用: 同じ IP から 15分に 20回まで（トークンの総当たり対策。トークン自体も 256bit） */
export const tokenIpLimiter = new SharedRateLimiter("token-ip", 20, 15 * MIN);
/** メールアドレスの追加（確認メール）: 同じ保護者で 1時間に 5回まで */
export const emailAddLimiter = new SharedRateLimiter("email-add", 5, 60 * MIN);
/** 「この英語、へん？」（run9）: 同じ IP から 10分に 30件まで（端末の 送りなおしも ふくめる） */
export const englishReportLimiter = new SharedRateLimiter("english-report", 30, 10 * MIN);

/**
 * レート制限のキーにする IP。x-forwarded-for の先頭 → x-real-ip → "unknown"。
 * 本番でプロキシ（Vercel など）の後ろに置く前提。プロキシが無いと書きかえられるので、
 * 総当たり対策の本命はメールごと・保護者ごとの制限（上）。
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** テスト用: メモリの数とロックを消す（DB の分は消さない） */
export function resetAllLimiters() {
  for (const l of [loginLimiter, loginIpLimiter, loginEmailLimiter, registerLimiter, pinLimiter, reauthLimiter, forgotIpLimiter, forgotEmailLimiter, tokenIpLimiter, emailAddLimiter, englishReportLimiter]) l.clearMemory();
  memoryLocks.clear();
}
