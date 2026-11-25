/**
 * 認証の土台: パスワードハッシュ・セッション（期限・入れ替え）・Origin 確認・レート制限
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => true, markDbDown: () => {} }));

const { hashSecret, verifySecret, dummyHash } = await import("@/lib/auth/password");
const S = await import("@/lib/auth/session");
const { isSameOrigin, isStateChanging } = await import("@/lib/auth/origin");
const { RateLimiter, clientIp } = await import("@/lib/auth/rateLimit");

// テストを速くするため、ハッシュの強さを下げた版も使う（本番の既定は N=16384）
const FAST = { N: 1024, r: 8, p: 1 };

describe("パスワード・PIN のハッシュ（scrypt）", () => {
  it("正しいものだけ照合が通る", async () => {
    const h = await hashSecret("abc12345", FAST);
    expect(await verifySecret("abc12345", h)).toBe(true);
    expect(await verifySecret("abc12346", h)).toBe(false);
    expect(await verifySecret("", h)).toBe(false);
  });

  it("平文を含まず、salt が毎回ちがう", async () => {
    const a = await hashSecret("abc12345", FAST);
    const b = await hashSecret("abc12345", FAST);
    expect(a).not.toBe(b);
    expect(a).not.toContain("abc12345");
    expect(a.split("$")).toHaveLength(6);
    expect(a.startsWith("scrypt$1024$8$1$")).toBe(true);
  });

  it("既定のパラメータ（N=16384）でも作れて照合できる", async () => {
    const h = await hashSecret("1234");
    expect(h.startsWith("scrypt$16384$8$1$")).toBe(true);
    expect(await verifySecret("1234", h)).toBe(true);
    expect(await verifySecret("4321", h)).toBe(false);
  });

  it("壊れたハッシュ・空・null は例外にならず false", async () => {
    for (const bad of ["", "scrypt$x", "bcrypt$1$2$3$4$5", "scrypt$99999999$8$1$AA$AA", "scrypt$1024$8$1$$", null, undefined]) {
      expect(await verifySecret("abc12345", bad as string)).toBe(false);
    }
  });

  it("全角・半角のゆれ（NFKC）は同じとみなす", async () => {
    const h = await hashSecret("abc12345", FAST);
    expect(await verifySecret("ａｂｃ１２３４５", h)).toBe(true);
  });

  it("ダミーハッシュは使い回され、どんな入力とも一致しない", async () => {
    const d = await dummyHash();
    expect(await dummyHash()).toBe(d);
    expect(await verifySecret("anything1", d)).toBe(false);
  });
});

describe("セッション", () => {
  beforeEach(() => db.reset());
  const t0 = new Date("2026-11-25T00:00:00Z");

  it("作成: DB にはトークンのハッシュだけが入る", async () => {
    const { token, session } = await S.createSession("p1", {}, t0);
    expect(S.isWellFormedToken(token)).toBe(true);
    const row = db.table("session")[0];
    expect(row.tokenHash).toBe(S.hashToken(token));
    expect(row.tokenHash).not.toBe(token);
    expect(JSON.stringify(db.table("session"))).not.toContain(token);
    expect(session.expiresAt.getTime() - t0.getTime()).toBe(S.SESSION_TTL_MS);
  });

  it("読む: 正しいトークンだけ。形式違い・知らないトークンは null", async () => {
    const { token } = await S.createSession("p1", {}, t0);
    expect((await S.readSession(token, t0))?.parentId).toBe("p1");
    expect(await S.readSession(S.newToken(), t0)).toBeNull();
    expect(await S.readSession("short", t0)).toBeNull();
    expect(await S.readSession(undefined, t0)).toBeNull();
    expect(await S.readSession(S.hashToken(token), t0)).toBeNull(); // ハッシュそのものを出しても使えない
  });

  it("期限切れ: null になり、DB からも消える", async () => {
    const { token } = await S.createSession("p1", {}, t0);
    const justBefore = new Date(t0.getTime() + S.SESSION_TTL_MS - 1);
    expect(await S.readSession(token, justBefore)).not.toBeNull();
    const after = new Date(t0.getTime() + S.SESSION_TTL_MS);
    expect(await S.readSession(token, after)).toBeNull();
    expect(db.table("session")).toHaveLength(0);
  });

  it("入れ替え: 新トークンが使え、古いトークンは使えない。選んだ子ども・PIN は引きつぐ", async () => {
    const pinAt = new Date(t0.getTime() + 1000);
    const { token } = await S.createSession("p1", { selectedChildId: "c1", pinVerifiedAt: pinAt }, t0);
    const later = new Date(t0.getTime() + S.SESSION_ROTATE_AFTER_MS);
    const r = await S.rotateSession(token, later);
    expect(r).not.toBeNull();
    expect(r!.token).not.toBe(token);
    expect(await S.readSession(token, later)).toBeNull();
    const s = await S.readSession(r!.token, later);
    expect(s).toMatchObject({ parentId: "p1", selectedChildId: "c1" });
    expect(s!.pinVerifiedAt?.getTime()).toBe(pinAt.getTime());
    expect(s!.expiresAt.getTime()).toBe(later.getTime() + S.SESSION_TTL_MS); // 期限ものびる
    expect(db.table("session")).toHaveLength(1);
  });

  it("ふだんの入れ替え（猶予つき）: 古いトークンは猶予のあいだだけ使え、そこから2つめのセッションは作れない", async () => {
    const { token } = await S.createSession("p1", { selectedChildId: "c1" }, t0);
    const later = new Date(t0.getTime() + S.SESSION_ROTATE_AFTER_MS);
    const r = await S.rotateSession(token, later, { graceMs: S.ROTATE_GRACE_MS });
    expect(r).not.toBeNull();
    // 同時に出ていたリクエストは古いトークンのままでも同じ子どもとして扱われる
    expect(await S.readSession(token, new Date(later.getTime() + S.ROTATE_GRACE_MS - 1))).toMatchObject({ selectedChildId: "c1" });
    // 猶予中の古いトークンからは入れ替えられない（セッションを増やさない）
    expect(await S.rotateSession(token, new Date(later.getTime() + 1000), { graceMs: S.ROTATE_GRACE_MS })).toBeNull();
    expect(db.table("session")).toHaveLength(2);
    // 猶予が切れたら使えない
    expect(await S.readSession(token, new Date(later.getTime() + S.ROTATE_GRACE_MS))).toBeNull();
    expect(await S.readSession(r!.token, new Date(later.getTime() + S.ROTATE_GRACE_MS))).not.toBeNull();
  });

  it("期限切れのセッションは入れ替えられない", async () => {
    const { token } = await S.createSession("p1", {}, t0);
    expect(await S.rotateSession(token, new Date(t0.getTime() + S.SESSION_TTL_MS + 1))).toBeNull();
  });

  it("needsRotation: 1日たったら true", () => {
    expect(S.needsRotation({ createdAt: t0 }, new Date(t0.getTime() + S.SESSION_ROTATE_AFTER_MS - 1))).toBe(false);
    expect(S.needsRotation({ createdAt: t0 }, new Date(t0.getTime() + S.SESSION_ROTATE_AFTER_MS))).toBe(true);
  });

  it("破棄: destroySession / destroyOtherSessions / purgeExpiredSessions", async () => {
    const a = await S.createSession("p1", {}, t0);
    const b = await S.createSession("p1", {}, t0);
    await S.createSession("p2", {}, t0);
    await S.destroySession(a.token);
    expect(await S.readSession(a.token, t0)).toBeNull();
    await S.createSession("p1", {}, t0);
    await S.destroyOtherSessions("p1", b.session.id);
    expect(db.table("session").filter((s) => s.parentId === "p1").map((s) => s.id)).toEqual([b.session.id]);
    expect(db.table("session").filter((s) => s.parentId === "p2")).toHaveLength(1);
    await S.purgeExpiredSessions("p1", new Date(t0.getTime() + S.SESSION_TTL_MS));
    expect(db.table("session").filter((s) => s.parentId === "p1")).toHaveLength(0);
  });

  it("isPinUnlocked: PIN を入れてから10分だけ", () => {
    expect(S.isPinUnlocked({ pinVerifiedAt: null }, t0)).toBe(false);
    expect(S.isPinUnlocked({ pinVerifiedAt: t0 }, new Date(t0.getTime() + S.PIN_UNLOCK_MS - 1))).toBe(true);
    expect(S.isPinUnlocked({ pinVerifiedAt: t0 }, new Date(t0.getTime() + S.PIN_UNLOCK_MS))).toBe(false);
  });
});

describe("Origin の確認（CSRF）", () => {
  const req = (method: string, headers: Record<string, string>) => new Request("http://localhost:3000/api/x", { method, headers });

  it("GET はいつも OK", () => {
    expect(isStateChanging("GET")).toBe(false);
    expect(isSameOrigin(req("GET", { origin: "https://evil.example" }))).toBe(true);
  });

  it("同じホストからの POST は OK、ほかのサイトからは NG", () => {
    expect(isSameOrigin(req("POST", { origin: "http://localhost:3000", host: "localhost:3000" }))).toBe(true);
    expect(isSameOrigin(req("POST", { origin: "https://evil.example", host: "localhost:3000" }))).toBe(false);
    expect(isSameOrigin(req("DELETE", { origin: "null" }))).toBe(false);
    expect(isSameOrigin(req("PATCH", { origin: "not a url" }))).toBe(false);
  });

  it("プロキシの x-forwarded-host を見る", () => {
    expect(isSameOrigin(req("POST", { origin: "https://app.example.jp", host: "internal:3000", "x-forwarded-host": "app.example.jp" }))).toBe(true);
  });

  it("Origin が無いとき: sec-fetch-site が cross-site なら NG、それ以外は OK", () => {
    expect(isSameOrigin(req("POST", {}))).toBe(true);
    expect(isSameOrigin(req("POST", { "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOrigin(req("POST", { "sec-fetch-site": "cross-site" }))).toBe(false);
  });

  it("ALLOWED_ORIGINS に書いたものは OK", () => {
    process.env.ALLOWED_ORIGINS = "https://partner.example";
    try {
      expect(isSameOrigin(req("POST", { origin: "https://partner.example", host: "localhost:3000" }))).toBe(true);
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  });
});

describe("レート制限", () => {
  it("上限をこえたら false、時間がたてば戻る、reset で数え直す", () => {
    const l = new RateLimiter(2, 1000);
    expect(l.hit("k", 0).ok).toBe(true);
    expect(l.hit("k", 10).ok).toBe(true);
    const third = l.hit("k", 20);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSec).toBe(1);
    expect(l.hit("other", 20).ok).toBe(true);
    expect(l.hit("k", 1000).ok).toBe(true);
    l.reset("k");
    expect(l.hit("k", 1001).ok).toBe(true);
    expect(l.hit("k", 1002).ok).toBe(true);
  });

  it("キーが多すぎてもメモリを使いすぎない", () => {
    const l = new RateLimiter(1, 1000, 3);
    for (let i = 0; i < 10; i++) l.hit(`k${i}`, 0);
    expect((l as unknown as { hits: Map<string, unknown> }).hits.size).toBeLessThanOrEqual(3);
  });

  it("clientIp: x-forwarded-for の先頭 → x-real-ip → unknown", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } }))).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe("9.9.9.9");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
