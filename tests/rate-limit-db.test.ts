/**
 * レート制限・ロックを DB で（run5 Phase 3）。
 * 生の SQL（INSERT ... ON CONFLICT）を メモリ内の まね で うけて、
 *  - 2台のサーバー（2つの SharedRateLimiter）が 同じ数を見る
 *  - ウィンドウが すぎたら 数え直し・reset で消える
 *  - DB にはメールアドレスや IP を そのまま入れない
 *  - ロック: 1つだけ取れる・はずしたら取れる・期限で自動に とける
 *  - DB が止まっている / SQL が失敗 → このサーバーのメモリで数える
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

type Bucket = { count: number; resetAt: Date };
const rows = new Map<string, Bucket>();
const sqlLog: string[] = [];
let dbUp = true;
let failSql = false;

function sqlOf(strings: TemplateStringsArray): string {
  return strings.join("?").replace(/\s+/g, " ").trim();
}

/** Prisma の $queryRaw / $executeRaw の まね（このモジュールが使う 4種類の SQL だけ） */
const fakeRaw = {
  $queryRaw: async (strings: TemplateStringsArray, ...v: unknown[]) => {
    const sql = sqlOf(strings);
    sqlLog.push(sql);
    if (failSql) throw Object.assign(new Error("relation does not exist"), { name: "PrismaClientKnownRequestError" });
    if (sql.includes("CASE WHEN")) {
      const [k, newReset, at] = v as [string, Date, Date];
      const cur = rows.get(k);
      if (!cur) rows.set(k, { count: 1, resetAt: newReset });
      else if (cur.resetAt.getTime() <= at.getTime()) rows.set(k, { count: 1, resetAt: newReset });
      else cur.count++;
      const r = rows.get(k)!;
      return [{ count: r.count, resetAt: r.resetAt }];
    }
    if (sql.includes("RETURNING \"key\"")) {
      const [k, until, now] = v as [string, Date, Date];
      const cur = rows.get(k);
      if (cur && cur.resetAt.getTime() > now.getTime()) return [];
      rows.set(k, { count: 1, resetAt: until });
      return [{ key: k }];
    }
    throw new Error(`unexpected SQL: ${sql}`);
  },
  $executeRaw: async (strings: TemplateStringsArray, ...v: unknown[]) => {
    const sql = sqlOf(strings);
    sqlLog.push(sql);
    if (failSql) throw new Error("db error");
    if (sql.includes("\"key\" =")) return rows.delete(v[0] as string) ? 1 : 0;
    if (sql.includes("\"resetAt\" <")) {
      let n = 0;
      for (const [k, b] of rows) if (b.resetAt.getTime() < (v[0] as Date).getTime()) { rows.delete(k); n++; }
      return n;
    }
    throw new Error(`unexpected SQL: ${sql}`);
  },
};

vi.mock("@/lib/db", () => ({ prisma: fakeRaw, isDbUp: async () => dbUp, markDbDown: () => {} }));

const RL = await import("@/lib/auth/rateLimit");

beforeEach(() => {
  rows.clear();
  sqlLog.length = 0;
  dbUp = true;
  failSql = false;
  RL.resetAllLimiters();
});

describe("DB で数える レート制限", () => {
  it("2台のサーバー（別々のインスタンス）でも 同じ数を見る", async () => {
    const serverA = new RL.SharedRateLimiter("t-login", 3, 60_000);
    const serverB = new RL.SharedRateLimiter("t-login", 3, 60_000);
    const t = 1_000_000;
    expect((await serverA.hit("mama@example.com", t)).ok).toBe(true);
    expect((await serverB.hit("mama@example.com", t + 1)).ok).toBe(true);
    expect((await serverA.hit("mama@example.com", t + 2)).ok).toBe(true);
    const fourth = await serverB.hit("mama@example.com", t + 3);
    expect(fourth.ok).toBe(false);
    expect(fourth.retryAfterSec).toBe(60);
    // ほかのキー・ほかの制限の名前は 別に数える
    expect((await serverA.hit("papa@example.com", t + 4)).ok).toBe(true);
    expect((await new RL.SharedRateLimiter("t-other", 3, 60_000).hit("mama@example.com", t + 5)).ok).toBe(true);
  });

  it("ウィンドウが すぎたら 数え直し、reset で消える", async () => {
    const l = new RL.SharedRateLimiter("t-pin", 1, 1_000);
    expect((await l.hit("p1", 0)).ok).toBe(true);
    expect((await l.hit("p1", 500)).ok).toBe(false);
    expect((await l.hit("p1", 1_000)).ok).toBe(true);
    expect((await l.hit("p1", 1_001)).ok).toBe(false);
    await l.reset("p1");
    expect((await l.hit("p1", 1_002)).ok).toBe(true);
  });

  it("DB の キーは 名前 + SHA-256（メールアドレス・IP は入らない）", async () => {
    await RL.loginEmailLimiter.hit("secret.person@example.com");
    await RL.loginIpLimiter.hit("203.0.113.7");
    const keys = [...rows.keys()];
    expect(keys).toHaveLength(2);
    for (const k of keys) {
      expect(k).toMatch(/^login-(email|ip):[0-9a-f]{40}$/);
      expect(k).not.toContain("example.com");
      expect(k).not.toContain("203.0.113");
    }
    expect(RL.bucketKey("login-email", "a")).toBe(RL.bucketKey("login-email", "a"));
  });

  it("期限切れの行の そうじ（1時間より前に切れたものだけ）", async () => {
    const now = new Date("2026-12-01T00:00:00Z");
    rows.set("old", { count: 1, resetAt: new Date(now.getTime() - 2 * 3_600_000) });
    rows.set("recent", { count: 1, resetAt: new Date(now.getTime() - 60_000) });
    rows.set("live", { count: 1, resetAt: new Date(now.getTime() + 60_000) });
    expect(await RL.purgeExpiredRateLimits(now)).toBe(1);
    expect([...rows.keys()].sort()).toEqual(["live", "recent"]);
  });
});

describe("ロック（今すぐ送る を 同時に2回しない）", () => {
  it("1つだけ取れる → はずしたら取れる。期限が すぎたら 自動で とける", async () => {
    const t = 5_000_000;
    const a = await RL.acquireLock("send-now", "parent1", 60_000, t);
    expect(a).not.toBeNull();
    expect(await RL.acquireLock("send-now", "parent1", 60_000, t + 1)).toBeNull(); // べつのサーバーからでも
    expect(await RL.acquireLock("send-now", "parent2", 60_000, t + 1)).not.toBeNull(); // ほかの保護者は べつ
    await a!();
    const b = await RL.acquireLock("send-now", "parent1", 60_000, t + 2);
    expect(b).not.toBeNull();
    // はずし忘れても ttl で とける
    expect(await RL.acquireLock("send-now", "parent1", 60_000, t + 60_002)).not.toBeNull();
  });
});

describe("DB が使えないとき", () => {
  it("DB 停止: このサーバーのメモリで数える（SQL は投げない）", async () => {
    dbUp = false;
    const l = new RL.SharedRateLimiter("t-mem", 2, 60_000);
    expect((await l.hit("k", 0)).ok).toBe(true);
    expect((await l.hit("k", 1)).ok).toBe(true);
    expect((await l.hit("k", 2)).ok).toBe(false);
    expect(sqlLog).toHaveLength(0);
    const lock = await RL.acquireLock("send-now", "p", 60_000, 0);
    expect(lock).not.toBeNull();
    expect(await RL.acquireLock("send-now", "p", 60_000, 1)).toBeNull();
    await lock!();
    expect(await RL.acquireLock("send-now", "p", 60_000, 2)).not.toBeNull();
    expect(await RL.purgeExpiredRateLimits()).toBe(0);
  });

  it("SQL が失敗（表がまだ無い など）: 警告して メモリで数える（ログイン自体は止めない）", async () => {
    failSql = true;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const l = new RL.SharedRateLimiter("t-fail", 1, 60_000);
      expect((await l.hit("k", 0)).ok).toBe(true);
      expect((await l.hit("k", 1)).ok).toBe(false);
      await l.reset("k");
      expect((await l.hit("k", 2)).ok).toBe(true);
      expect(await RL.acquireLock("send-now", "x", 1000, 0)).not.toBeNull();
    } finally {
      warn.mockRestore();
    }
  });

  it("メモリだけの RateLimiter（同期）は これまでどおり", () => {
    const l = new RL.RateLimiter(1, 1000);
    expect(l.hit("k", 0).ok).toBe(true);
    expect(l.hit("k", 1).ok).toBe(false);
  });
});
