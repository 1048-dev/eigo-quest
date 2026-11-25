/**
 * 月ごとの学習レポート（PDF）を LINE で届ける（run4 Phase 3）。
 *  - レポートの中身（今月のレッスン・連続日数・習得率・にがて・来月の予定・ワールド）
 *  - ダウンロード用トークン: 期限（30日）・形・その家のファイルだけ
 *  - dry-run: キーが無い / --dry-run → LINE には送らず outbox に message.json と PDF
 *  - webhook の署名チェックと follow / unfollow
 *  - push のリクエストの形（fetch のモック）・失敗・送信ずみは送らない
 *  - おうちの方 API: 配信のオン/オフ・「今すぐ送る」の回数制限・暗証番号が必要
 * PDF の生成は かんたんな PDF（Python を呼ばない）、ワークシートは小さなダミーにする。
 */
import { mkdtempSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieJar, FakeDb } from "./helpers/fakePrisma";

const db = new FakeDb();
const jar = new CookieJar();
vi.mock("next/headers", () => ({ cookies: async () => jar }));
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => true, markDbDown: () => {} }));
vi.mock("@/lib/report/pdf", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/report/pdf")>();
  return { ...orig, renderReportPdf: orig.renderBasicReportPdf };
});
vi.mock("@/lib/report/storage", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/report/storage")>();
  return {
    ...orig,
    ensureWorksheetBundle: async (world: number) => {
      const key = orig.worksheetKey(world);
      const { getStorage } = await import("@/lib/storage");
      const data = new TextEncoder().encode(`%PDF-1.4 fake worksheets world ${world}`);
      await getStorage().put(key, data, "application/pdf");
      return { key, bytes: data.length };
    },
  };
});

const R = await import("@/lib/report/monthlyReport");
const M = await import("@/lib/line/messaging");
const S = await import("@/lib/services/monthlyDeliveryService");
const { hashToken } = await import("@/lib/auth/session");
const { ALL_ITEMS, TOTAL_LESSONS } = await import("@/lib/curriculum");
const webhook = await import("@/app/api/line/webhook/route");
const download = await import("@/app/d/[token]/[file]/route");
const lineMonthly = await import("@/app/api/parent/line-monthly/route");
const register = await import("@/app/api/auth/register/route");
const children = await import("@/app/api/children/route");
const childRoute = await import("@/app/api/children/[id]/route");
const { resetAllLimiters } = await import("@/lib/auth/rateLimit");

const LINE_A = "U" + "a".repeat(32);
const LINE_B = "U" + "b".repeat(32);
const SECRET = "test-channel-secret-not-real";
const ACCESS = "test-access-token-not-real";
const BASE = "https://app.example.test";
const NOW = new Date("2026-12-01T01:00:00Z"); // 日本時間 12/1 10:00 → 既定は 11月分

let storage = "";
let outbox = "";
const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ sentMessages: [{ id: "1" }] }));

function live(on: boolean) {
  vi.stubEnv("LINE_MESSAGING_CHANNEL_ACCESS_TOKEN", on ? ACCESS : "");
  vi.stubEnv("APP_BASE_URL", on ? BASE : "");
}

beforeEach(() => {
  db.reset();
  jar.clear();
  resetAllLimiters();
  fetchMock.mockClear();
  storage = mkdtempSync(path.join(tmpdir(), "eq-reports-"));
  outbox = mkdtempSync(path.join(tmpdir(), "eq-outbox-"));
  vi.stubEnv("REPORT_STORAGE_DIR", storage);
  vi.stubEnv("LINE_OUTBOX_DIR", outbox);
  vi.stubEnv("LINE_MESSAGING_CHANNEL_SECRET", SECRET);
  live(false);
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  rmSync(storage, { recursive: true, force: true });
  rmSync(outbox, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// テスト用のデータ
// ---------------------------------------------------------------------------
type Creator = { create: (a: unknown) => Promise<unknown> };
async function seedParent(id: string, over: Record<string, unknown> = {}) {
  await (db.client().parent as Creator).create({ data: { id, email: `${id}@example.com`, passwordHash: "x", pinHash: "x", lineUserId: null, ...over } });
}
async function seedChild(id: string, parentId: string, nickname: string, lessons: [number, string][] = [], over: Record<string, unknown> = {}) {
  const c = db.client();
  await (c.user as Creator).create({ data: { id, parentId, nickname, friendCode: `FC-${id}`, streakDays: 3, longestStreak: 9, createdAt: new Date(NOW.getTime() - 1000 + db.table("user").length), ...over } });
  for (const [lessonNo, day] of lessons) {
    await (c.lessonProgress as { create: (a: unknown) => Promise<unknown> }).create({ data: { userId: id, lessonNo, status: "COMPLETED", completedOn: day, completedAt: new Date(`${day}T09:00:00Z`) } });
  }
}
const deliveries = () => db.table("reportDelivery");
const tokenFromUrl = (url: string) => url.split("/d/")[1]!;

// ---------------------------------------------------------------------------
describe("月間レポートの中身", () => {
  const mastery = (scores: Partial<Record<string, number>> = {}) => ({
    scores: { SCHOOL_TEST: 70, PHONICS: 50, LISTENING: 60, SPEAKING: 20, VOCABULARY: 80, WRITING: 40, ...scores } as never,
    overall: 55, coverage: 5, weakestItemIds: ALL_ITEMS.slice(0, 9).map((i) => i.id),
  });
  const child = { id: "c", nickname: "はる", streakDays: 4, longestStreak: 12, lastStudyDate: "2026-11-20" };

  it("今月のレッスン・学習した日・合格したテストは その月の分だけ数える", () => {
    const completed = new Map<number, string>([[1, "2026-10-30"], [2, "2026-11-01"], [3, "2026-11-01"], [4, "2026-11-05"]]);
    const r = R.buildMonthlyReport({
      child, month: "2026-11", completedLessons: completed, mastery: mastery(), now: NOW,
      attempts: [
        { assessmentId: "check-2", passed: true, takenOn: "2026-11-07" },
        { assessmentId: "check-2", passed: true, takenOn: "2026-11-08" }, // 同じテストは1つ
        { assessmentId: "check-3", passed: false, takenOn: "2026-11-08" },
        { assessmentId: "check-1", passed: true, takenOn: "2026-10-31" }, // 先月
      ],
    });
    expect(r.lessonsThisMonth).toBe(3);
    expect(r.studyDaysThisMonth).toBe(4); // 11/1, 11/5, 11/7, 11/8
    expect(r.testsPassedThisMonth).toBe(1);
    expect(r.lessonsDone).toBe(4);
    expect(r.streakDays).toBe(4);
    expect(r.longestStreak).toBe(12);
    expect(r.monthLabelJa).toBe("2026年11月");
  });

  it("6つの力・にがて（低い2つ）・忘れかけの ことば（最大6）", () => {
    const r = R.buildMonthlyReport({ child, month: "2026-11", completedLessons: new Map([[1, "2026-11-02"]]), attempts: [], mastery: mastery(), now: NOW });
    expect(r.mastery.map((m) => m.skill)).toEqual(["SCHOOL_TEST", "PHONICS", "LISTENING", "SPEAKING", "VOCABULARY", "WRITING"]);
    expect(r.mastery.find((m) => m.skill === "SPEAKING")!.labelJa).toBe("発音");
    expect(r.weakSkills.map((w) => w.skill)).toEqual(["SPEAKING", "WRITING"]);
    expect(r.weakItems).toHaveLength(6);
    expect(r.weakItems[0]).toMatchObject({ text: ALL_ITEMS[0]!.text, lessonNo: ALL_ITEMS[0]!.lessonNo });
    expect(r.commentJa).toContain("発音");
  });

  it("来月の予定は次のレッスンから（単元はかぶらない・最大6）、ワールドは いま いる（これから始める）ところ", () => {
    const done = new Map<number, string>();
    for (let n = 1; n <= 30; n++) done.set(n, "2026-11-10");
    const r = R.buildMonthlyReport({ child, month: "2026-11", completedLessons: done, attempts: [], mastery: mastery(), now: NOW });
    expect(r.nextLessonNo).toBe(31);
    expect(r.world).toBe(2); // ワールド1を終えた → ワールド2のワークブック
    expect(r.worldNameJa).toBe("ことばの町");
    expect(r.nextTopics.length).toBeGreaterThan(0);
    expect(r.nextTopics.length).toBeLessThanOrEqual(6);
    expect(r.nextTopics[0]!.lessonNo).toBe(31);
    expect(new Set(r.nextTopics.map((t) => t.topicJa)).size).toBe(r.nextTopics.length);
    expect(R.currentWorld(new Map([[1, "x"]]))).toBe(1);
    expect(R.currentWorld(new Set<number>())).toBe(1);
  });

  it("まだ何もしていない子: にがて なし・はじめの ひとこと・ワールド1", () => {
    const r = R.buildMonthlyReport({ child, month: "2026-11", completedLessons: new Map(), attempts: [], mastery: mastery(), now: NOW });
    expect(r.lessonsThisMonth).toBe(0);
    expect(r.weakSkills).toEqual([]);
    expect(r.weakItems).toEqual([]);
    expect(r.world).toBe(1);
    expect(r.nextLessonNo).toBe(1);
    expect(r.commentJa).toContain("まだレッスンを始めていません");
  });

  it("全部おわった子: 来月の予定なし", () => {
    const done = new Map<number, string>();
    for (let n = 1; n <= TOTAL_LESSONS; n++) done.set(n, "2026-11-10");
    const r = R.buildMonthlyReport({ child, month: "2026-11", completedLessons: done, attempts: [], mastery: mastery(), now: NOW });
    expect(r.nextLessonNo).toBeNull();
    expect(r.nextTopics).toEqual([]);
    expect(r.commentJa).toContain("すべてのレッスン");
  });

  it("月のヘルパー", () => {
    expect(R.previousMonth("2026-01")).toBe("2025-12");
    expect(R.previousMonth("2026-11")).toBe("2026-10");
    expect(R.nextMonth("2026-12")).toBe("2027-01");
    expect(R.monthOf(NOW)).toBe("2026-12");
    expect(R.monthOf(new Date("2026-11-30T16:00:00Z"))).toBe("2026-12"); // 日本時間では12月
    expect(R.isValidMonth("2026-13")).toBe(false);
    expect(R.isValidMonth("2026-1")).toBe(false);
    expect(R.isValidMonth("2026-01")).toBe(true);
    expect(R.inMonth("2026-11-30", "2026-11")).toBe(true);
    expect(R.inMonth("2026-12-01", "2026-11")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("dry-run（キーなし・--dry-run）", () => {
  it("キーが無いと LINE には送らず、outbox に message.json と PDF を書く", async () => {
    await seedParent("pA", { lineUserId: LINE_A });
    await seedChild("kA1", "pA", "はる", [[1, "2026-11-03"], [2, "2026-11-04"]]);
    await seedChild("kA2", "pA", "りこ", [[1, "2026-10-03"]]);
    const sum = await S.runMonthlyDelivery({ now: NOW });
    expect(sum.mode).toBe("dry-run");
    expect(sum.month).toBe("2026-11");
    expect(fetchMock).not.toHaveBeenCalled();
    const [r] = sum.results;
    expect(r).toMatchObject({ parentId: "pA", status: "dry-run", reason: "NOT_CONFIGURED" });
    expect(r!.children.map((c) => c.childName)).toEqual(["はる", "りこ"]);
    // outbox
    const dir = r!.outboxPath!;
    expect(dir.startsWith(outbox)).toBe(true);
    const files = readdirSync(dir).sort();
    expect(files).toContain("message.json");
    expect(files.filter((f) => f.endsWith(".pdf"))).toHaveLength(4); // 2人 × (レポート + ワークブック)
    const msg = JSON.parse(readFileSync(path.join(dir, "message.json"), "utf8"));
    expect(msg.mode).toBe("dry-run");
    expect(msg.request.url).toBe(M.LINE_PUSH_URL);
    expect(msg.request.body.to).toBe(LINE_A);
    const flex = msg.request.body.messages[0];
    expect(flex.type).toBe("flex");
    expect(flex.contents.type).toBe("carousel");
    expect(flex.contents.contents).toHaveLength(2);
    expect(JSON.stringify(msg)).not.toContain(ACCESS);
    // レポート PDF は本物の PDF
    const report = files.find((f) => f.startsWith("1-report"))!;
    expect(readFileSync(path.join(dir, report)).subarray(0, 5).toString()).toBe("%PDF-");
    // DB は DRY_RUN（あとで本番を送れるよう SENT にはしない）・トークンは ハッシュだけ
    expect(deliveries().map((d) => d.status)).toEqual(["DRY_RUN", "DRY_RUN"]);
    const t = tokenFromUrl(r!.children[0]!.url);
    expect(deliveries().some((d) => d.tokenHash === hashToken(t))).toBe(true);
    expect(JSON.stringify(deliveries())).not.toContain(t);
  });

  it("キーがあっても --dry-run なら送らない（理由は DRY_RUN_FLAG）", async () => {
    live(true);
    await seedParent("pA", { lineUserId: LINE_A });
    await seedChild("kA1", "pA", "はる");
    const sum = await S.runMonthlyDelivery({ now: NOW, dryRun: true });
    expect(sum.mode).toBe("dry-run");
    expect(sum.results[0]).toMatchObject({ status: "dry-run", reason: "DRY_RUN_FLAG" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sum.results[0]!.children[0]!.url.startsWith(`${BASE}/d/`)).toBe(true);
  });

  it("対象: LINE と連携ずみで配信オンの保護者だけ。--parent なら dry-run で未連携の保護者も試せる", async () => {
    await seedParent("pA", { lineUserId: LINE_A });
    await seedParent("pOff", { lineUserId: LINE_B, lineMonthlyEnabled: false });
    await seedParent("pNoLine");
    for (const p of ["pA", "pOff", "pNoLine"]) await seedChild(`k-${p}`, p, `子-${p}`);
    const sum = await S.runMonthlyDelivery({ now: NOW });
    expect(sum.results.map((r) => r.parentId)).toEqual(["pA"]);
    const one = await S.runMonthlyDelivery({ now: NOW, parentId: "pNoLine" });
    expect(one.results[0]).toMatchObject({ parentId: "pNoLine", status: "dry-run" });
    const msg = JSON.parse(readFileSync(path.join(one.results[0]!.outboxPath!, "message.json"), "utf8"));
    expect(msg.request.body.to).toBe("(LINE 未連携)");
    const off = await S.runMonthlyDelivery({ now: NOW, parentId: "pOff" });
    expect(off.results[0]).toMatchObject({ status: "skipped", reason: "DISABLED" });
  });

  it("お子さまがいない保護者は とばす", async () => {
    await seedParent("pA", { lineUserId: LINE_A });
    const sum = await S.runMonthlyDelivery({ now: NOW });
    expect(sum.results[0]).toMatchObject({ status: "skipped", reason: "NO_CHILDREN" });
    expect(deliveries()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
describe("push（LINE へ送る）", () => {
  it("リクエストの形: URL・Bearer・retry key・宛先・Flex（名前・要約・PDFをひらく → /d/<token>）", async () => {
    live(true);
    await seedParent("pA", { lineUserId: LINE_A });
    await seedChild("kA1", "pA", "はる", [[1, "2026-11-03"]]);
    const sum = await S.runMonthlyDelivery({ now: NOW });
    expect(sum.mode).toBe("live");
    expect(sum.results[0]!.status).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://api.line.me/v2/bot/message/push");
    expect(init!.method).toBe("POST");
    const headers = init!.headers as Record<string, string>;
    expect(headers.authorization).toBe(`Bearer ${ACCESS}`);
    expect(headers["content-type"]).toBe("application/json");
    expect(headers["x-line-retry-key"]).toMatch(/^[0-9a-f-]{36}$/);
    const body = JSON.parse(String(init!.body));
    expect(body.to).toBe(LINE_A);
    expect(body.messages).toHaveLength(1);
    const m = body.messages[0];
    expect(m.type).toBe("flex");
    expect(m.altText).toContain("2026年11月の学習レポート");
    expect(m.altText).toContain("はるさん");
    expect(m.contents.type).toBe("bubble"); // 1人ならバブル
    const text = JSON.stringify(m.contents.body);
    expect(text).toContain("はる さん");
    expect(text).toContain("今月のレッスン: 1回");
    const button = m.contents.footer.contents[0];
    expect(button.action).toMatchObject({ type: "uri", label: "PDFをひらく" });
    expect(button.action.uri.startsWith(`${BASE}/d/`)).toBe(true);
    // そのリンクで本当に開ける
    const view = await S.findDeliveryByToken(tokenFromUrl(button.action.uri), NOW);
    expect(view?.childName).toBe("はる");
    expect(deliveries()[0]).toMatchObject({ status: "SENT", trigger: "MONTHLY", month: "2026-11" });
  });

  it("同じ月をもう一度実行しても、送信ずみのお子さまには送らない（--force なら送る）", async () => {
    live(true);
    await seedParent("pA", { lineUserId: LINE_A });
    await seedChild("kA1", "pA", "はる");
    await S.runMonthlyDelivery({ now: NOW });
    const again = await S.runMonthlyDelivery({ now: NOW });
    expect(again.results[0]).toMatchObject({ status: "skipped", reason: "ALREADY_SENT" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // あとから追加した きょうだいの分だけ送る
    await seedChild("kA2", "pA", "りこ");
    const third = await S.runMonthlyDelivery({ now: NOW });
    expect(third.results[0]!.children.map((c) => c.childName)).toEqual(["りこ"]);
    const forced = await S.runMonthlyDelivery({ now: NOW, force: true });
    expect(forced.results[0]!.children).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("LINE がエラーを返したら FAILED（理由だけ記録・トークンは記録しない）。次の実行で送り直す", async () => {
    live(true);
    fetchMock.mockImplementationOnce(async () => Response.json({ message: "The request body has 1 error(s)" }, { status: 400 }));
    await seedParent("pA", { lineUserId: LINE_A });
    await seedChild("kA1", "pA", "はる");
    const sum = await S.runMonthlyDelivery({ now: NOW });
    expect(sum.results[0]).toMatchObject({ status: "failed" });
    expect(sum.results[0]!.reason).toContain("HTTP_400");
    expect(deliveries()[0]!.status).toBe("FAILED");
    expect(String(deliveries()[0]!.error)).not.toContain(ACCESS);
    const retry = await S.runMonthlyDelivery({ now: NOW });
    expect(retry.results[0]!.status).toBe("sent");
  });

  it("ブロックされている（webhook で unfollow）保護者には送らない", async () => {
    live(true);
    await seedParent("pA", { lineUserId: LINE_A, lineFriend: false });
    await seedChild("kA1", "pA", "はる");
    const sum = await S.runMonthlyDelivery({ now: NOW });
    expect(sum.results[0]).toMatchObject({ status: "skipped", reason: "NOT_FRIEND" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pushMessage: ネットワークエラーは例外にしない・アクセストークンなしは送らない", async () => {
    const cfg = M.lineMessagingConfig({ LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: ACCESS, APP_BASE_URL: BASE });
    const r = await M.pushMessage(cfg, LINE_A, [], { fetchImpl: async () => { throw new Error("down"); } });
    expect(r).toEqual({ ok: false, status: 0, reason: "NETWORK_ERROR" });
    const none = await M.pushMessage(M.lineMessagingConfig({}), LINE_A, [], { fetchImpl: fetchMock as never });
    expect(none.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(M.canPush(M.lineMessagingConfig({ LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: ACCESS }))).toBe(false); // APP_BASE_URL が無い
    expect(M.normalizeBaseUrl("https://example.com/")).toBe("https://example.com");
    expect(M.normalizeBaseUrl("javascript:alert(1)")).toBeNull();
  });

  it("Flex: 6人でもカルーセル・代替テキストは400文字まで", () => {
    const summary = (n: number) => ({ childName: `子ども${n}`.repeat(20), month: "2026-11", monthLabelJa: "2026年11月", lessonsThisMonth: 1, studyDaysThisMonth: 1, testsPassedThisMonth: 0, streakDays: 1, longestStreak: 1, overall: 10, lessonsDone: 1, totalLessons: 360, world: 1, worldNameJa: "はじまりの森" });
    const m = M.buildMonthlyFlexMessage([1, 2, 3, 4, 5, 6].map((n) => ({ summary: summary(n), url: `${BASE}/d/x${n}` })));
    expect(m.contents.type).toBe("carousel");
    expect((m.contents as { contents: unknown[] }).contents).toHaveLength(6);
    expect(m.altText.length).toBeLessThanOrEqual(400);
  });
});

// ---------------------------------------------------------------------------
describe("ダウンロード用トークン", () => {
  async function deliverFor(parentId: string, lineUserId: string, childId: string, name: string) {
    await seedParent(parentId, { lineUserId });
    await seedChild(childId, parentId, name);
    const r = await S.deliverToParent(parentId, { month: "2026-11", trigger: "MONTHLY", now: NOW });
    return tokenFromUrl(r.children[0]!.url);
  }
  const getFile = async (token: string, file: string) => {
    const res = await download.GET(new Request(`http://localhost/d/${token}/${file}`), { params: Promise.resolve({ token, file }) });
    return { status: res.status, type: res.headers.get("content-type"), cache: res.headers.get("cache-control"), body: Buffer.from(await res.arrayBuffer()) };
  };

  it("30日で期限切れ（その直前までは使える）", async () => {
    const t = await deliverFor("pA", LINE_A, "kA", "はる");
    expect(await S.findDeliveryByToken(t, new Date(NOW.getTime() + S.DELIVERY_TTL_MS - 1000))).not.toBeNull();
    expect(await S.findDeliveryByToken(t, new Date(NOW.getTime() + S.DELIVERY_TTL_MS))).toBeNull();
    vi.useFakeTimers({ now: new Date(NOW.getTime() + S.DELIVERY_TTL_MS + 1), toFake: ["Date"] });
    try {
      expect((await getFile(t, "report")).status).toBe(404);
    } finally {
      vi.useRealTimers();
    }
  });

  it("形のおかしいトークン・知らないトークンは null / 404", async () => {
    await deliverFor("pA", LINE_A, "kA", "はる");
    for (const bad of ["", "abc", "../../etc/passwd", "x".repeat(43), "A".repeat(44)]) {
      expect(await S.findDeliveryByToken(bad, NOW)).toBeNull();
    }
    expect((await getFile("x".repeat(43), "report")).status).toBe(404);
  });

  it("その家のファイルだけを返す（ほかの家のトークンでは見えない・ほかの id・置き場所の外は 404）", async () => {
    const tA = await deliverFor("pA", LINE_A, "kA", "はる");
    const tB = await deliverFor("pB", LINE_B, "kB", "りこ");
    vi.useFakeTimers({ now: new Date(NOW.getTime() + 60_000), toFake: ["Date"] });
    try {
      const a = await getFile(tA, "report");
      const b = await getFile(tB, "report");
      expect(a.status).toBe(200);
      expect(a.type).toBe("application/pdf");
      expect(a.cache).toContain("no-store");
      expect(a.body.subarray(0, 5).toString()).toBe("%PDF-");
      expect(a.body.equals(b.body)).toBe(false);
      const viewA = (await S.findDeliveryByToken(tA))!;
      const viewB = (await S.findDeliveryByToken(tB))!;
      expect(viewA.parentId).toBe("pA");
      expect(viewA.files.find((f) => f.id === "report")!.path.startsWith("reports/pA/")).toBe(true);
      expect(viewB.files.find((f) => f.id === "report")!.path.startsWith("reports/pB/")).toBe(true);
      expect((await getFile(tA, "worksheets")).status).toBe(200);
      expect((await getFile(tA, "../../package.json")).status).toBe(404);
      expect((await getFile(tA, "summary")).status).toBe(404);
      // DB の行が書きかえられて ほかの家のレポートを指しても出さない
      const rowA = deliveries().find((d) => d.parentId === "pA")!;
      const fileB = viewB.files.find((f) => f.id === "report")!;
      rowA.files = [{ ...fileB }];
      expect((await getFile(tA, "report")).status).toBe(404);
      rowA.files = [{ id: "report", path: "reports/pA/../../../outside.pdf", labelJa: "", filename: "x.pdf", bytes: 0 }];
      expect((await getFile(tA, "report")).status).toBe(404);
      // 「reports/pA/」で始まっていても、.. で ほかの家のフォルダへ抜けるものは出さない（run4 Phase 4）
      rowA.files = [{ ...fileB, path: fileB.path.replace(/^reports\/pB\//, "reports/pA/../pB/") }];
      expect((await getFile(tA, "report")).status).toBe(404);
      rowA.files = [{ id: "worksheets", path: `worksheets/../${fileB.path}`, labelJa: "", filename: "x.pdf", bytes: 0 }];
      expect((await getFile(tA, "worksheets")).status).toBe(404);
    } finally {
      vi.useRealTimers();
    }
  });

  it("resolveStored は置き場所の外を指すパスを断る", async () => {
    const { resolveStored } = await import("@/lib/report/storage");
    expect(resolveStored("reports/p/x.pdf", storage)).toBe(path.join(storage, "reports", "p", "x.pdf"));
    expect(resolveStored("../x.pdf", storage)).toBeNull();
    expect(resolveStored(path.join(storage, "x.pdf"), storage)).toBeNull();
    expect(resolveStored("", storage)).toBeNull();
  });

  it("期限切れの配信は次の一斉配信のときに消える（レポート PDF も）", async () => {
    const t = await deliverFor("pA", LINE_A, "kA", "はる");
    const view = (await S.findDeliveryByToken(t, NOW))!;
    const reportAbs = path.join(storage, view.files.find((f) => f.id === "report")!.path);
    expect(existsSync(reportAbs)).toBe(true);
    const purged = await S.purgeExpiredDeliveries(new Date(NOW.getTime() + S.DELIVERY_TTL_MS + 1));
    expect(purged).toBe(1);
    expect(deliveries()).toHaveLength(0);
    expect(existsSync(reportAbs)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("webhook（友だち追加・ブロック）", () => {
  const event = (type: string, userId = LINE_A, timestamp = Date.now()) => ({ type, mode: "active", timestamp, source: { type: "user", userId }, webhookEventId: "x", deliveryContext: { isRedelivery: false } });
  async function post(body: unknown, signature?: string | null) {
    const raw = JSON.stringify(body);
    const sig = signature === undefined ? M.lineSignature(SECRET, raw) : signature;
    const res = await webhook.POST(new Request("http://localhost/api/line/webhook", { method: "POST", body: raw, headers: { "content-type": "application/json", ...(sig ? { "x-line-signature": sig } : {}) } }));
    return { status: res.status, body: await res.json() };
  }
  const parentA = () => db.table("parent").find((p) => p.id === "pA")!;

  it("正しい署名: follow → 友だち、unfollow → ブロック", async () => {
    await seedParent("pA", { lineUserId: LINE_A });
    const t0 = Date.now();
    expect(await post({ destination: "x", events: [event("follow", LINE_A, t0)] })).toEqual({ status: 200, body: { ok: true, handled: 1 } });
    expect(parentA().lineFriend).toBe(true);
    expect((await post({ events: [event("unfollow", LINE_A, t0 + 1000)] })).status).toBe(200);
    expect(parentA().lineFriend).toBe(false);
  });

  it("署名が違う・無い → 401 で何もしない", async () => {
    await seedParent("pA", { lineUserId: LINE_A });
    const body = { events: [event("follow")] };
    expect((await post(body, M.lineSignature("other-secret", JSON.stringify(body)))).status).toBe(401);
    expect((await post(body, null)).status).toBe(401);
    expect((await post(body, "AAAA")).status).toBe(401);
    expect(parentA().lineFriend).toBeNull();
  });

  it("本文を1文字でも変えると署名が合わない", () => {
    const raw = JSON.stringify({ events: [event("follow")] });
    const sig = M.lineSignature(SECRET, raw);
    expect(M.verifyLineSignature(SECRET, raw, sig)).toBe(true);
    expect(M.verifyLineSignature(SECRET, raw.replace("follow", "folloW"), sig)).toBe(false);
    expect(M.verifyLineSignature(null, raw, sig)).toBe(false);
    expect(M.verifyLineSignature(SECRET, raw, null)).toBe(false);
  });

  it("チャネルシークレットが無いときは受け付けない（503）", async () => {
    vi.stubEnv("LINE_MESSAGING_CHANNEL_SECRET", "");
    expect((await post({ events: [] })).status).toBe(503);
  });

  it("LINE Developers の「検証」（events が空）は 200・知らないユーザー・古いイベントは無視", async () => {
    await seedParent("pA", { lineUserId: LINE_A });
    expect(await post({ destination: "x", events: [] })).toEqual({ status: 200, body: { ok: true, handled: 0 } });
    expect((await post({ events: [event("follow", LINE_B)] })).body.handled).toBe(0);
    const t = Date.now();
    await post({ events: [event("unfollow", LINE_A, t)] });
    await post({ events: [event("follow", LINE_A, t - 5000)] }); // 再送された古い follow
    expect(parentA().lineFriend).toBe(false);
    expect(M.parseFriendEvents({ events: [{ type: "follow", source: { type: "group", groupId: "C1" } }, { type: "message", source: { type: "user", userId: LINE_A } }, null] })).toEqual([]);
  });

  it("LINE の連携を解除したら 友だち状態も わからない（null）に戻す", async () => {
    const { unlinkLine } = await import("@/lib/services/parentService");
    await seedParent("pA", { lineUserId: LINE_A, lineFriend: true, lineFriendChangedAt: new Date() });
    expect((await unlinkLine("pA")).ok).toBe(true);
    expect(parentA().lineFriend).toBeNull();
  });

  it("LINE の連携を解除したら、その LINE に送ったダウンロードのリンクも使えなくなる（ほかの家のリンクはそのまま）", async () => {
    const { unlinkLine } = await import("@/lib/services/parentService");
    await seedParent("pA", { lineUserId: LINE_A });
    await seedChild("kA", "pA", "はる");
    await seedParent("pB", { lineUserId: LINE_B });
    await seedChild("kB", "pB", "りこ");
    const now = new Date();
    const tA = tokenFromUrl((await S.deliverToParent("pA", { month: "2026-11", trigger: "MANUAL", now })).children[0]!.url);
    const tB = tokenFromUrl((await S.deliverToParent("pB", { month: "2026-11", trigger: "MANUAL", now })).children[0]!.url);
    expect(await S.findDeliveryByToken(tA)).not.toBeNull();
    expect((await unlinkLine("pA")).ok).toBe(true);
    expect(await S.findDeliveryByToken(tA)).toBeNull();
    expect(await S.findDeliveryByToken(tB)).not.toBeNull();
  });

  it("大きすぎる本文は署名を確かめる前に 413（Content-Length が無くても、流れてきた量で断る）", async () => {
    const big = JSON.stringify({ events: [], pad: "x".repeat(1_100_000) });
    const sig = M.lineSignature(SECRET, big);
    const declared = await webhook.POST(new Request("http://localhost/api/line/webhook", { method: "POST", body: big, headers: { "x-line-signature": sig, "content-length": String(big.length) } }));
    expect(declared.status).toBe(413);
    const bytes = new TextEncoder().encode(big);
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        for (let i = 0; i < bytes.length; i += 64_000) c.enqueue(bytes.subarray(i, i + 64_000));
        c.close();
      },
    });
    const streamed = await webhook.POST(new Request("http://localhost/api/line/webhook", { method: "POST", body: stream, headers: { "x-line-signature": sig }, duplex: "half" } as RequestInit));
    expect(streamed.status).toBe(413);
  });

  it("イベントの時刻がおかしい・未来すぎるときは「いま」として扱う（DB の更新が失敗しない・あとの正しいイベントを無視しない）", async () => {
    const now = 1_800_000_000_000;
    expect(M.sanitizeTimestamp(1e300, now)).toBe(now);
    expect(M.sanitizeTimestamp(-5, now)).toBe(now);
    expect(M.sanitizeTimestamp("123", now)).toBe(now);
    expect(M.sanitizeTimestamp(now + 365 * 86_400_000, now)).toBe(now + 60_000);
    expect(M.sanitizeTimestamp(now - 1000, now)).toBe(now - 1000);
    await seedParent("pA", { lineUserId: LINE_A });
    expect((await post({ events: [event("follow", LINE_A, 1e300)] })).status).toBe(200);
    expect(parentA().lineFriend).toBe(true);
    // 1回に 100 件まで
    const many = Array.from({ length: 150 }, () => event("follow"));
    expect(M.parseFriendEvents({ events: many })).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------
describe("おうちの方 API（/api/parent/line-monthly）", () => {
  type AnyHandler = (req: Request, ctx: never) => Promise<Response>;
  async function call(handler: AnyHandler, method: string, body?: unknown, params: Record<string, string> = {}) {
    const req = new Request("http://localhost:3000/api/parent/line-monthly", {
      method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body),
    });
    const res = await handler(req, { params: Promise.resolve(params) } as never);
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : {} };
  }
  async function setup(opts: { line?: boolean } = {}) {
    const r = await call(register.POST as AnyHandler, "POST", { email: "mama@example.com", password: "passw0rd-x", pin: "1234" });
    expect(r.status).toBe(201);
    const parent = db.table("parent")[0]!;
    if (opts.line !== false) parent.lineUserId = LINE_A;
    const c = await call(children.POST as AnyHandler, "POST", { nickname: "はる", schoolGrade: 2 });
    expect(c.status).toBe(201);
    return { parentId: parent.id as string, childId: c.body.child.id as string };
  }

  it("状態の取得と 配信のオン/オフ", async () => {
    const { parentId } = await setup();
    const g = await call(lineMonthly.GET as AnyHandler, "GET");
    expect(g.status).toBe(200);
    expect(g.body.status).toMatchObject({ linked: true, enabled: true, friend: null, messagingConfigured: false, nextAllowedAt: null });
    const off = await call(lineMonthly.PATCH as AnyHandler, "PATCH", { enabled: false });
    expect(off.body.status.enabled).toBe(false);
    expect(db.table("parent").find((p) => p.id === parentId)!.lineMonthlyEnabled).toBe(false);
    expect((await call(lineMonthly.PATCH as AnyHandler, "PATCH", { enabled: "yes" })).status).toBe(400);
  });

  it("「今すぐ送る」: キーなしは dry-run でリンクを返す → すぐもう一度は 429（10分）", async () => {
    await setup();
    const first = await call(lineMonthly.POST as AnyHandler, "POST");
    expect(first.status).toBe(200);
    expect(first.body.dryRun).toBe(true);
    expect(first.body.links).toHaveLength(1);
    expect(first.body.links[0].url).toMatch(/^\/d\/[A-Za-z0-9_-]{43}$/);
    expect(first.body.status.nextAllowedAt).not.toBeNull();
    expect(deliveries()[0]).toMatchObject({ trigger: "MANUAL", month: R.monthOf(new Date()) });
    const second = await call(lineMonthly.POST as AnyHandler, "POST");
    expect(second.status).toBe(429);
    expect(second.body.code).toBe("RATE_LIMITED");
    expect(deliveries()).toHaveLength(1);
  });

  it("回数制限: 10分あければ送れる・24時間に3回まで", async () => {
    const { parentId } = await setup();
    const t0 = new Date("2026-11-20T00:00:00Z");
    const at = (min: number) => new Date(t0.getTime() + min * 60_000);
    expect((await S.sendNowForParent(parentId, at(0))).ok).toBe(true);
    expect(await S.sendNowForParent(parentId, at(5))).toMatchObject({ ok: false, reason: "RATE_LIMITED", retryAfterSec: 300 });
    expect((await S.sendNowForParent(parentId, at(11))).ok).toBe(true);
    expect((await S.sendNowForParent(parentId, at(22))).ok).toBe(true);
    const fourth = await S.sendNowForParent(parentId, at(40));
    expect(fourth).toMatchObject({ ok: false, reason: "RATE_LIMITED" });
    expect((fourth as { retryAfterSec: number }).retryAfterSec).toBe((24 * 60 - 40) * 60);
    expect((await S.sendNowForParent(parentId, at(24 * 60 + 1))).ok).toBe(true);
  });

  it("本番の設定で LINE 未連携なら送れない（409）。連携ずみなら push する", async () => {
    live(true);
    await setup({ line: false });
    const r = await call(lineMonthly.POST as AnyHandler, "POST");
    expect(r.status).toBe(409);
    expect(r.body.code).toBe("NOT_LINKED");
    expect(fetchMock).not.toHaveBeenCalled();
    db.table("parent")[0]!.lineUserId = LINE_A;
    const ok = await call(lineMonthly.POST as AnyHandler, "POST");
    expect(ok.status).toBe(200);
    expect(ok.body.dryRun).toBe(false);
    expect(ok.body.links).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(ok.body.status.lastSentAt).not.toBeNull();
  });

  it("暗証番号を入れていないと使えない（403 PIN_REQUIRED）・ログインしていないと 401", async () => {
    await setup();
    db.table("session")[0]!.pinVerifiedAt = null;
    expect((await call(lineMonthly.POST as AnyHandler, "POST")).body.code).toBe("PIN_REQUIRED");
    expect((await call(lineMonthly.GET as AnyHandler, "GET")).status).toBe(403);
    jar.clear();
    expect((await call(lineMonthly.GET as AnyHandler, "GET")).status).toBe(401);
    expect(deliveries()).toHaveLength(0);
  });

  it("お子さまを削除すると、その子の配信と レポート PDF も消える", async () => {
    const { childId } = await setup();
    await call(lineMonthly.POST as AnyHandler, "POST");
    const view = deliveries()[0]!;
    const rel = (view.files as { id: string; path: string }[]).find((f) => f.id === "report")!.path;
    expect(existsSync(path.join(storage, rel))).toBe(true);
    const del = await call(childRoute.DELETE as AnyHandler, "DELETE", undefined, { id: childId });
    expect(del.status).toBe(200);
    expect(deliveries()).toHaveLength(0);
    // PDF の削除は トランザクションの外（応答のあと）
    const { flushBackgroundTasks } = await import("@/lib/mail/background");
    await flushBackgroundTasks();
    expect(existsSync(path.join(storage, rel))).toBe(false);
  });
});
