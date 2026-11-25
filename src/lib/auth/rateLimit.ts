/**
 * かんたんなメモリ内レート制限（固定ウィンドウ）。
 * サーバーが1台のときの総当たり対策。複数台・再起動をまたぐ制限が必要になったら DB / Redis に置きかえる。
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly max: number, private readonly windowMs: number, private readonly maxKeys = 10_000) {}

  /** 1回ぶん数える。制限を超えていたら false（数えない） */
  hit(key: string, now = Date.now()): { ok: boolean; retryAfterSec: number } {
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

const MIN = 60_000;
/** ログイン: 同じ IP + メールで 15分に 8回、同じ IP から 15分に 30回まで */
export const loginLimiter = new RateLimiter(8, 15 * MIN);
export const loginIpLimiter = new RateLimiter(30, 15 * MIN);
/** 登録: 同じ IP から 1時間に 10回まで */
export const registerLimiter = new RateLimiter(10, 60 * MIN);
/** 保護者PIN・パスワード再入力（設定変更・退会）: 同じ保護者で 15分に 8回まで */
export const pinLimiter = new RateLimiter(8, 15 * MIN);

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function resetAllLimiters() {
  for (const l of [loginLimiter, loginIpLimiter, registerLimiter, pinLimiter]) l.clear();
}
