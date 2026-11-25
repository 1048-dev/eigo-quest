/**
 * 月ごとの学習レポート（PDF）を LINE で届けるサービス層。
 *
 *  1. お子さまごとに「学習レポート（1ページ）」と「いまのワールドの 1か月ワークブック」を用意する
 *     （REPORT_STORAGE_DIR に保存。src/lib/report/storage.ts）
 *  2. ダウンロード用のランダムなトークンを作り、DB（ReportDelivery）には SHA-256 だけを入れる（30日で期限切れ）
 *  3. 保護者の LINE（Parent.lineUserId）に Flex メッセージ（名前・要約・「PDFをひらく」）を push する
 *     キーが無い・dry-run のときは送らず、outbox フォルダにメッセージと PDF を書く
 *
 * 呼び出し元: npm run line:monthly（scripts/line-monthly.ts）と、おうちの方ページの「今月のPDFを今すぐ送る」。
 */
import { randomBytes, randomUUID } from "node:crypto";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashToken, isWellFormedToken, newToken } from "@/lib/auth/session";
import { buildMonthlyReport, monthDayRange, monthOf, previousMonth, type MonthlyReport, type ReportSummary } from "@/lib/report/monthlyReport";
import { renderReportPdf, type ReportRenderer } from "@/lib/report/pdf";
import { ensureWorksheetBundle, fileSize, removeStored, reportStorageDir, resolveStored, toStoredRel, type WorksheetProvider } from "@/lib/report/storage";
import { buildMonthlyFlexMessage, canPush, downloadUrl, lineMessagingConfig, pushMessage, type LineMessagingConfig } from "@/lib/line/messaging";
import { computeUserMastery } from "@/lib/services/progressService";

export const DELIVERY_TTL_MS = 30 * 86_400_000;
/** 「今すぐ送る」: 前回から10分はあける・24時間に3回まで */
export const SEND_NOW_COOLDOWN_MS = 10 * 60_000;
export const SEND_NOW_DAILY_MAX = 3;
const DAY_MS = 86_400_000;
const DRY_RUN_BASE_URL = "http://localhost:3000";

export type DeliveryFileId = "report" | "worksheets";
export interface DeliveryFile {
  id: DeliveryFileId;
  labelJa: string;
  /** REPORT_STORAGE_DIR からの相対パス */
  path: string;
  /** ダウンロードするときのファイル名（ASCII） */
  filename: string;
  bytes: number;
}

export interface DeliveryDeps {
  renderReport?: ReportRenderer;
  worksheets?: WorksheetProvider;
  fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>;
  env?: Record<string, string | undefined>;
  log?: (line: string) => void;
}

export function outboxDir(env: Record<string, string | undefined> = process.env): string {
  return path.resolve(env.LINE_OUTBOX_DIR?.trim() || path.join(process.cwd(), ".data", "line-outbox"));
}

// ---------------------------------------------------------------------------
// レポートの材料を集める
// ---------------------------------------------------------------------------
export async function buildReportForChild(childId: string, month: string, now = new Date()): Promise<MonthlyReport | null> {
  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: { id: true, nickname: true, streakDays: true, longestStreak: true, lastStudyDate: true },
  });
  if (!child) return null;
  const [{ result, completedLessons }, attempts] = await Promise.all([
    computeUserMastery(childId, now),
    prisma.testAttempt.findMany({ where: { userId: childId, takenOn: monthDayRange(month) }, select: { assessmentId: true, passed: true, takenOn: true, source: true } }),
  ]);
  return buildMonthlyReport({ child, month, completedLessons, attempts, mastery: result, now });
}

interface PreparedPackage {
  deliveryId: string;
  token: string;
  childId: string;
  summary: ReportSummary;
  files: DeliveryFile[];
}

async function preparePackage(
  parentId: string, child: { id: string }, month: string, trigger: "MONTHLY" | "MANUAL", batchId: string, now: Date, deps: DeliveryDeps,
): Promise<PreparedPackage | null> {
  const report = await buildReportForChild(child.id, month, now);
  if (!report) return null;
  const root = reportStorageDir(deps.env);
  const reportRel = `reports/${parentId}/${month}/${randomBytes(12).toString("hex")}.pdf`;
  const reportAbs = resolveStored(reportRel, root)!;
  await (deps.renderReport ?? renderReportPdf)(report, reportAbs);
  const files: DeliveryFile[] = [
    { id: "report", labelJa: `${report.monthLabelJa}の 学習レポート（1ページ）`, path: toStoredRel(reportAbs, root), filename: `eigo-quest-report-${month}.pdf`, bytes: await fileSize(reportAbs) },
  ];
  const wsRel = await (deps.worksheets ?? ensureWorksheetBundle)(report.world);
  const wsAbs = wsRel ? resolveStored(wsRel, root) : null;
  if (wsRel && wsAbs) {
    files.push({
      id: "worksheets",
      labelJa: `ワールド${report.world}「${report.worldNameJa}」 1か月ワークブック`,
      path: wsRel,
      filename: `eigo-quest-world-${String(report.world).padStart(2, "0")}-workbook.pdf`,
      bytes: await fileSize(wsAbs),
    });
  }
  const summary: ReportSummary = {
    childName: report.childName, month: report.month, monthLabelJa: report.monthLabelJa,
    lessonsThisMonth: report.lessonsThisMonth, studyDaysThisMonth: report.studyDaysThisMonth, testsPassedThisMonth: report.testsPassedThisMonth,
    streakDays: report.streakDays, longestStreak: report.longestStreak, overall: report.overall,
    lessonsDone: report.lessonsDone, totalLessons: report.totalLessons, world: report.world, worldNameJa: report.worldNameJa,
  };
  const token = newToken();
  const row = await prisma.reportDelivery.create({
    data: {
      parentId, childId: child.id, childName: report.childName, month, trigger, batchId,
      tokenHash: hashToken(token), expiresAt: new Date(now.getTime() + DELIVERY_TTL_MS),
      files: files as unknown as Prisma.InputJsonValue, summary: summary as unknown as Prisma.InputJsonValue, status: "PENDING", createdAt: now,
    },
    select: { id: true },
  });
  return { deliveryId: row.id, token, childId: child.id, summary, files };
}

// ---------------------------------------------------------------------------
// 1人の保護者に届ける
// ---------------------------------------------------------------------------
export type ParentDeliveryStatus = "sent" | "dry-run" | "failed" | "skipped";
export interface ParentDeliveryResult {
  parentId: string;
  status: ParentDeliveryStatus;
  /** skipped / failed / dry-run の理由（"NO_CHILDREN" | "NOT_LINKED" | "NOT_FRIEND" | "DISABLED" | "ALREADY_SENT" | "NOT_CONFIGURED" | "DRY_RUN_FLAG" | "HTTP_400: ..." など） */
  reason?: string;
  month: string;
  children: { childId: string; childName: string; url: string; files: DeliveryFile[] }[];
  /** dry-run で書いた フォルダ */
  outboxPath?: string;
}

export async function deliverToParent(
  parentId: string,
  opts: { month: string; trigger: "MONTHLY" | "MANUAL"; dryRun?: boolean; force?: boolean; allowUnlinkedDryRun?: boolean; now?: Date; deps?: DeliveryDeps },
): Promise<ParentDeliveryResult> {
  const now = opts.now ?? new Date();
  const deps = opts.deps ?? {};
  const { month, trigger } = opts;
  const base: ParentDeliveryResult = { parentId, status: "skipped", month, children: [] };
  const cfg = lineMessagingConfig(deps.env);
  const real = !opts.dryRun && canPush(cfg);

  const parent = await prisma.parent.findUnique({ where: { id: parentId }, select: { id: true, lineUserId: true, lineFriend: true, lineMonthlyEnabled: true } });
  if (!parent) return { ...base, reason: "NOT_FOUND" };
  if (trigger === "MONTHLY" && !parent.lineMonthlyEnabled && !opts.force) return { ...base, reason: "DISABLED" };
  if (!parent.lineUserId && (real || !opts.allowUnlinkedDryRun)) return { ...base, reason: "NOT_LINKED" };
  if (real && parent.lineFriend === false) return { ...base, reason: "NOT_FRIEND" };

  let children = await prisma.user.findMany({ where: { parentId }, select: { id: true, nickname: true }, orderBy: { createdAt: "asc" } });
  if (children.length === 0) return { ...base, reason: "NO_CHILDREN" };
  if (trigger === "MONTHLY" && !opts.force) {
    const sent = await prisma.reportDelivery.findMany({ where: { parentId, month, trigger: "MONTHLY", status: "SENT" }, select: { childId: true } });
    const done = new Set(sent.map((s) => s.childId));
    children = children.filter((c) => !done.has(c.id));
    if (children.length === 0) return { ...base, reason: "ALREADY_SENT" };
  }

  const batchId = randomUUID();
  const packages: PreparedPackage[] = [];
  for (const c of children) {
    const p = await preparePackage(parentId, c, month, trigger, batchId, now, deps);
    if (p) packages.push(p);
  }
  if (packages.length === 0) return { ...base, reason: "NO_CHILDREN" };

  const baseUrl = cfg.baseUrl ?? DRY_RUN_BASE_URL;
  const items = packages.map((p) => ({ summary: p.summary, url: downloadUrl(baseUrl, p.token) }));
  const message = buildMonthlyFlexMessage(items);
  const childrenOut = packages.map((p, i) => ({ childId: p.childId, childName: p.summary.childName, url: items[i]!.url, files: p.files }));
  const ids = packages.map((p) => p.deliveryId);

  if (real) {
    const r = await pushMessage(cfg, parent.lineUserId!, [message], { fetchImpl: deps.fetchImpl, retryKey: batchId });
    if (r.ok) {
      await prisma.reportDelivery.updateMany({ where: { id: { in: ids } }, data: { status: "SENT", sentAt: now } });
      return { ...base, status: "sent", children: childrenOut };
    }
    await prisma.reportDelivery.updateMany({ where: { id: { in: ids } }, data: { status: "FAILED", error: r.reason } });
    return { ...base, status: "failed", reason: r.reason, children: childrenOut };
  }

  const reason = opts.dryRun ? "DRY_RUN_FLAG" : "NOT_CONFIGURED";
  const outboxPath = await writeOutbox({ parentId, to: parent.lineUserId, message, packages, reason, cfg, now, deps });
  await prisma.reportDelivery.updateMany({ where: { id: { in: ids } }, data: { status: "DRY_RUN" } });
  return { ...base, status: "dry-run", reason, children: childrenOut, outboxPath };
}

/** dry-run: LINE に送るはずだったメッセージ（message.json）と PDF のコピーを outbox に書く */
async function writeOutbox(a: {
  parentId: string; to: string | null; message: unknown; packages: PreparedPackage[]; reason: string; cfg: LineMessagingConfig; now: Date; deps: DeliveryDeps;
}): Promise<string> {
  const stamp = a.now.toISOString().replace(/[:.]/g, "-");
  const dir = path.join(outboxDir(a.deps.env), `${stamp}-${a.parentId}`);
  await mkdir(dir, { recursive: true });
  const root = reportStorageDir(a.deps.env);
  const copied: string[] = [];
  for (const [i, p] of a.packages.entries()) {
    for (const f of p.files) {
      const src = resolveStored(f.path, root);
      if (!src) continue;
      const name = `${i + 1}-${f.id === "report" ? "report" : f.filename.replace(/^eigo-quest-/, "")}`.replace(/\.pdf$/, "") + ".pdf";
      await copyFile(src, path.join(dir, name));
      copied.push(name);
    }
  }
  const payload = {
    mode: "dry-run",
    reasonJa: a.reason === "DRY_RUN_FLAG" ? "--dry-run が指定されたため送信していません" : "LINE_MESSAGING_CHANNEL_ACCESS_TOKEN または APP_BASE_URL が未設定のため送信していません",
    request: { method: "POST", url: "https://api.line.me/v2/bot/message/push", body: { to: a.to ?? "(LINE 未連携)", messages: [a.message] } },
    files: copied,
    createdAt: a.now.toISOString(),
  };
  await writeFile(path.join(dir, "message.json"), JSON.stringify(payload, null, 2), "utf8");
  return dir;
}

// ---------------------------------------------------------------------------
// 毎月の一斉配信（npm run line:monthly）
// ---------------------------------------------------------------------------
export interface MonthlyRunOptions {
  dryRun?: boolean;
  parentId?: string;
  /** "YYYY-MM"。省略時は先月（毎月1日に実行する想定） */
  month?: string;
  /** 送信ずみ・配信オフでも送る */
  force?: boolean;
  now?: Date;
  deps?: DeliveryDeps;
}

export interface MonthlyRunSummary {
  month: string;
  mode: "live" | "dry-run";
  results: ParentDeliveryResult[];
  purged: number;
}

export async function runMonthlyDelivery(opts: MonthlyRunOptions = {}): Promise<MonthlyRunSummary> {
  const now = opts.now ?? new Date();
  const deps = opts.deps ?? {};
  const month = opts.month ?? previousMonth(monthOf(now));
  const live = !opts.dryRun && canPush(lineMessagingConfig(deps.env));
  const purged = await purgeExpiredDeliveries(now, deps.env);
  const parents = opts.parentId
    ? [{ id: opts.parentId }]
    : await prisma.parent.findMany({ where: { lineUserId: { not: null }, lineMonthlyEnabled: true }, select: { id: true }, orderBy: { createdAt: "asc" } });
  const results: ParentDeliveryResult[] = [];
  for (const p of parents) {
    try {
      results.push(await deliverToParent(p.id, { month, trigger: "MONTHLY", dryRun: opts.dryRun, force: opts.force, allowUnlinkedDryRun: !!opts.parentId, now, deps }));
    } catch (e) {
      const err = e as { name?: string; code?: string } | null;
      results.push({ parentId: p.id, status: "failed", reason: `${err?.name ?? "Error"}${err?.code ? ` (${err.code})` : ""}`, month, children: [] });
    }
  }
  return { month, mode: live ? "live" : "dry-run", results, purged };
}

// ---------------------------------------------------------------------------
// おうちの方ページ: 設定・状態・今すぐ送る
// ---------------------------------------------------------------------------
export interface LineMonthlyStatus {
  linked: boolean;
  /** 公式アカウントを友だち追加しているか（null = まだ わからない） */
  friend: boolean | null;
  enabled: boolean;
  /** LINE へ本当に送れる設定か（false なら dry-run） */
  messagingConfigured: boolean;
  lastSentAt: string | null;
  /** 次に「今すぐ送る」を押せる時刻（null = いつでも） */
  nextAllowedAt: string | null;
}

/** 「今すぐ送る」の回数制限（DB で数えるので サーバーが複数台・再起動でも効く） */
export async function sendNowAllowedAt(parentId: string, now = new Date()): Promise<Date | null> {
  const rows = await prisma.reportDelivery.findMany({
    where: { parentId, trigger: "MANUAL", createdAt: { gte: new Date(now.getTime() - DAY_MS) } },
    select: { batchId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const batches = new Map<string, Date>();
  for (const r of rows) if (!batches.has(r.batchId)) batches.set(r.batchId, r.createdAt);
  const times = [...batches.values()].sort((a, b) => a.getTime() - b.getTime());
  let allowed = 0;
  const last = times.at(-1);
  if (last) allowed = Math.max(allowed, last.getTime() + SEND_NOW_COOLDOWN_MS);
  if (times.length >= SEND_NOW_DAILY_MAX) allowed = Math.max(allowed, times[times.length - SEND_NOW_DAILY_MAX]!.getTime() + DAY_MS);
  return allowed > now.getTime() ? new Date(allowed) : null;
}

export async function getLineMonthlyStatus(parentId: string, now = new Date(), env: Record<string, string | undefined> = process.env): Promise<LineMonthlyStatus> {
  const [p, last, next] = await Promise.all([
    prisma.parent.findUnique({ where: { id: parentId }, select: { lineUserId: true, lineFriend: true, lineMonthlyEnabled: true } }),
    prisma.reportDelivery.findFirst({ where: { parentId, status: "SENT" }, orderBy: { createdAt: "desc" }, select: { sentAt: true } }),
    sendNowAllowedAt(parentId, now),
  ]);
  return {
    linked: !!p?.lineUserId,
    friend: p?.lineFriend ?? null,
    enabled: p?.lineMonthlyEnabled ?? true,
    messagingConfigured: canPush(lineMessagingConfig(env)),
    lastSentAt: last?.sentAt?.toISOString() ?? null,
    nextAllowedAt: next?.toISOString() ?? null,
  };
}

export async function setLineMonthlyEnabled(parentId: string, enabled: boolean): Promise<void> {
  await prisma.parent.update({ where: { id: parentId }, data: { lineMonthlyEnabled: enabled } });
}

const inFlight = new Set<string>();

export type SendNowResult =
  | { ok: true; result: ParentDeliveryResult }
  | { ok: false; reason: "RATE_LIMITED"; retryAfterSec: number }
  | { ok: false; reason: "BUSY" | "NOT_LINKED" | "NOT_FRIEND" | "NO_CHILDREN" | "FAILED"; detail?: string };

/**
 * 「今月のPDFを今すぐ送る」（今月のここまでの分）。配信のオン/オフに関係なく送る（本人が頼んだので）。
 * LINE の送信が設定されていないときは dry-run（outbox に書く）。LINE と連携していなければ送れない。
 */
export async function sendNowForParent(parentId: string, now = new Date(), deps: DeliveryDeps = {}): Promise<SendNowResult> {
  if (inFlight.has(parentId)) return { ok: false, reason: "BUSY" };
  inFlight.add(parentId);
  try {
    const allowedAt = await sendNowAllowedAt(parentId, now);
    if (allowedAt) return { ok: false, reason: "RATE_LIMITED", retryAfterSec: Math.ceil((allowedAt.getTime() - now.getTime()) / 1000) };
    const r = await deliverToParent(parentId, { month: monthOf(now), trigger: "MANUAL", now, deps });
    if (r.status === "sent" || r.status === "dry-run") return { ok: true, result: r };
    if (r.status === "failed") return { ok: false, reason: "FAILED", detail: r.reason };
    if (r.reason === "NOT_FRIEND" || r.reason === "NO_CHILDREN") return { ok: false, reason: r.reason };
    return { ok: false, reason: "NOT_LINKED" };
  } finally {
    inFlight.delete(parentId);
  }
}

// ---------------------------------------------------------------------------
// ダウンロード（/d/<token>）
// ---------------------------------------------------------------------------
export interface DeliveryView {
  id: string;
  parentId: string;
  childName: string;
  month: string;
  summary: ReportSummary | null;
  files: DeliveryFile[];
  expiresAt: Date;
}

function parseFiles(raw: unknown): DeliveryFile[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((f) => {
    const x = f as Partial<DeliveryFile> | null;
    if (!x || (x.id !== "report" && x.id !== "worksheets") || typeof x.path !== "string") return [];
    return [{ id: x.id, path: x.path, labelJa: String(x.labelJa ?? ""), filename: String(x.filename ?? `${x.id}.pdf`), bytes: Number(x.bytes) || 0 }];
  });
}

function parseSummary(raw: unknown): ReportSummary | null {
  const s = raw as Partial<ReportSummary> | null;
  return s && typeof s === "object" && typeof s.childName === "string" ? (s as ReportSummary) : null;
}

/** トークン → 配信。形がおかしい・見つからない・期限切れは null（どれかは区別しない） */
export async function findDeliveryByToken(token: unknown, now = new Date()): Promise<DeliveryView | null> {
  if (!isWellFormedToken(token)) return null;
  const row = await prisma.reportDelivery.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, parentId: true, childName: true, month: true, summary: true, files: true, expiresAt: true },
  });
  if (!row || row.expiresAt.getTime() <= now.getTime()) return null;
  return { id: row.id, parentId: row.parentId, childName: row.childName, month: row.month, summary: parseSummary(row.summary), files: parseFiles(row.files), expiresAt: row.expiresAt };
}

/** その配信のファイルだけを返す（ほかの id・置き場所の外は null） */
export function deliveryFileFor(view: DeliveryView, fileId: string, env: Record<string, string | undefined> = process.env): { file: DeliveryFile; abs: string } | null {
  const file = view.files.find((f) => f.id === fileId);
  if (!file) return null;
  const root = reportStorageDir(env);
  const abs = resolveStored(file.path, root);
  if (!abs) return null;
  // お子さまのレポートは、その家のフォルダの中にあるものだけ。ワークシートは共有のフォルダの中だけ。
  // 「reports/<家>/../<ほかの家>/…」のような書き方でも抜けられないよう、正規化したあとの絶対パスで確かめる
  const allowed = file.id === "report" ? path.join(root, "reports", view.parentId) : file.id === "worksheets" ? path.join(root, "worksheets") : null;
  if (!allowed || !abs.startsWith(allowed + path.sep)) return null;
  return { file, abs };
}

/** 期限切れの配信を消す（その家のレポート PDF も消す。ワークシートは共有なので残す） */
export async function purgeExpiredDeliveries(now = new Date(), env: Record<string, string | undefined> = process.env): Promise<number> {
  const old = await prisma.reportDelivery.findMany({ where: { expiresAt: { lt: now } }, select: { id: true, files: true } });
  if (old.length === 0) return 0;
  const root = reportStorageDir(env);
  for (const r of old) {
    for (const f of parseFiles(r.files)) if (f.id === "report") await removeStored(f.path, root).catch(() => {});
  }
  const { count } = await prisma.reportDelivery.deleteMany({ where: { id: { in: old.map((r) => r.id) } } });
  return count;
}

/** お子さまを消すとき: その子の配信と レポート PDF を消す */
export async function deleteDeliveriesForChildren(tx: Prisma.TransactionClient, childIds: string[], env: Record<string, string | undefined> = process.env): Promise<void> {
  if (childIds.length === 0) return;
  const rows = await tx.reportDelivery.findMany({ where: { childId: { in: childIds } }, select: { files: true } });
  await tx.reportDelivery.deleteMany({ where: { childId: { in: childIds } } });
  const root = reportStorageDir(env);
  for (const r of rows) for (const f of parseFiles(r.files)) if (f.id === "report") await removeStored(f.path, root).catch(() => {});
}

// ---------------------------------------------------------------------------
// webhook: 友だち追加・ブロック
// ---------------------------------------------------------------------------
/** 友だち状態を記録する。LINE は同じイベントを再送したり順番が入れかわったりするので、新しいイベントだけで上書きする */
export async function recordFriendEvent(lineUserId: string, follow: boolean, at: Date): Promise<number> {
  const { count } = await prisma.parent.updateMany({
    where: { lineUserId, OR: [{ lineFriendChangedAt: null }, { lineFriendChangedAt: { lt: at } }] },
    data: { lineFriend: follow, lineFriendChangedAt: at },
  });
  return count;
}
