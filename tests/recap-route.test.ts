import { beforeEach, describe, expect, it, vi } from "vitest";

const record = vi.fn();
vi.mock("@/lib/auth", () => ({ currentUserId: async () => "u1" }));
let dbDown = false;
vi.mock("@/lib/db", () => ({ isDbUp: async () => true, markDbDown: () => {}, prisma: {} }));
vi.mock("@/lib/services/recapService", () => ({
  recordRecapWatched: async (...a: unknown[]) => {
    if (dbDown) throw new Error("Can't reach database server");
    return record(...a);
  },
}));

const { POST } = await import("@/app/api/recap/[lessonNo]/watched/route");
const call = async (n: string) => {
  const res = await POST(new Request(`http://x/api/recap/${n}/watched`, { method: "POST" }), { params: Promise.resolve({ lessonNo: n }) });
  return { status: res.status, body: await res.json() };
};

describe("POST /api/recap/:n/watched", () => {
  beforeEach(() => { record.mockReset(); dbDown = false; });

  it("はじめて → 5コイン", async () => {
    record.mockResolvedValue({ status: "AWARDED", coins: 5, labelJa: "きょうの まとめを みた！" });
    const r = await call("1");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, coinsAwarded: 5, saved: true, alreadyToday: false });
    expect(record).toHaveBeenCalledWith("u1", 1);
  });

  it("同じ日の2回目 → ok:true・0コイン", async () => {
    record.mockResolvedValue({ status: "ALREADY_TODAY" });
    expect((await call("1")).body).toMatchObject({ ok: true, coinsAwarded: 0, alreadyToday: true });
  });

  it("DB が止まっていても ok:true（コイン0・saved:false）", async () => {
    dbDown = true;
    const r = await call("1");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, coinsAwarded: 0, saved: false });
  });

  it("存在しないレッスンは 404（JSON）", async () => {
    const r = await call("abc");
    expect(r.status).toBe(404);
    expect(typeof r.body.error).toBe("string");
    expect(record).not.toHaveBeenCalled();
  });
});
