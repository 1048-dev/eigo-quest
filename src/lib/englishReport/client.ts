/**
 * 「この英語、へん？」の 報告を 送る（ブラウザ用・run9 Phase 1）。
 *  - おした ときに まず この 端末の localStorage に のこし、すぐ 送る
 *  - 送れなかった（オフライン・サーバーが 5xx・DB が 止まって saved:false・429）→ のこした まま。
 *    つぎに ボタンの ある 画面を ひらいた とき・ネットが もどった とき（online）・5分ごとに 送りなおす
 *  - 400 など 形の まちがい・403 は 送りなおしても むだなので すてる
 *  - いちどに のこすのは 50件まで・30日を すぎた ものと 20回 失敗した ものは すてる
 *  - localStorage が 使えなくても 例外は 投げない
 */
import type { EnglishReportRequest } from "@/lib/api/contracts";

export const ENGLISH_REPORT_QUEUE_KEY = "eigo-quest:english-reports:v1";
export const ENGLISH_REPORT_URL = "/api/english-report";
const MAX_QUEUE = 50;
const MAX_ATTEMPTS = 20;
const MAX_AGE_MS = 30 * 24 * 3600 * 1000;
const RETRY_EVERY_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 8000;

export interface QueuedReport {
  report: EnglishReportRequest;
  attempts: number;
}

export type ReportInput = Omit<EnglishReportRequest, "clientId" | "reportedAt">;
export type SendOutcome = "sent" | "queued" | "dropped";
type FetchLike = (url: string, init: RequestInit) => Promise<Pick<Response, "status" | "json">>;

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

function newClientId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // つかえない 環境は 下へ
  }
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function readQueue(): QueuedReport[] {
  const s = storage();
  if (!s) return [];
  try {
    const v = JSON.parse(s.getItem(ENGLISH_REPORT_QUEUE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((q): q is QueuedReport =>
      !!q && typeof q === "object" && typeof (q as QueuedReport).attempts === "number" &&
      !!(q as QueuedReport).report && typeof (q as QueuedReport).report.clientId === "string" && typeof (q as QueuedReport).report.segmentId === "string");
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedReport[]): void {
  const s = storage();
  if (!s) return;
  try {
    if (q.length) s.setItem(ENGLISH_REPORT_QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
    else s.removeItem(ENGLISH_REPORT_QUEUE_KEY);
  } catch {
    // いっぱい・使えない → あきらめる（子どもには 見せない）
  }
}

/** 1件 送る。のこす べきか どうかを かえす */
async function sendOne(r: EnglishReportRequest, fetchImpl: FetchLike): Promise<SendOutcome> {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : undefined;
  try {
    const res = await fetchImpl(ENGLISH_REPORT_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(r),
      signal: ctrl?.signal,
    });
    if (res.status === 429 || res.status === 408 || res.status >= 500) return "queued";
    if (res.status >= 400) return "dropped";
    const body = (await res.json().catch(() => ({}))) as { saved?: unknown };
    return body?.saved === true ? "sent" : "queued";
  } catch {
    return "queued";
  } finally {
    if (timer) clearTimeout(timer);
  }
}

let flushing: Promise<number> | null = null;

/** のこっている 報告を 送りなおす。送れた 件数を かえす（同時に 2回 はしらない） */
export function flushEnglishReports(fetchImpl: FetchLike = (u, i) => fetch(u, i), now = Date.now()): Promise<number> {
  if (flushing) return flushing;
  flushing = (async () => {
    let sent = 0;
    const snapshot = readQueue();
    const seen = new Set(snapshot.map((q) => q.report.clientId));
    const keep: QueuedReport[] = [];
    for (const q of snapshot) {
      if (q.attempts >= MAX_ATTEMPTS || (q.report.reportedAt && now - q.report.reportedAt > MAX_AGE_MS)) continue;
      const out = await sendOne(q.report, fetchImpl);
      if (out === "sent") sent++;
      else if (out === "queued") keep.push({ ...q, attempts: q.attempts + 1 });
    }
    // 送って いる あいだに ふえた ものも のこす
    const added = readQueue().filter((q) => !seen.has(q.report.clientId));
    writeQueue([...keep, ...added]);
    return sent;
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

/** ボタンを おした: のこして から 送る */
export async function reportEnglish(input: ReportInput, fetchImpl?: FetchLike, now = Date.now()): Promise<SendOutcome> {
  const report: EnglishReportRequest = {
    ...input,
    text: input.text?.slice(0, 300),
    comment: input.comment?.trim() ? input.comment.trim().slice(0, 200) : undefined,
    clientId: newClientId(),
    reportedAt: now,
  };
  writeQueue([...readQueue(), { report, attempts: 0 }]);
  if (flushing) await flushing.catch(() => 0);
  await flushEnglishReports(fetchImpl, now);
  return readQueue().some((q) => q.report.clientId === report.clientId) ? "queued" : "sent";
}

let started = false;
/** ネットが もどった とき・5分ごとに 送りなおす（ブラウザで 1回だけ はじめる） */
export function startEnglishReportRetry(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  const run = () => {
    if (readQueue().length) void flushEnglishReports();
  };
  try {
    window.addEventListener("online", run);
    window.setInterval(run, RETRY_EVERY_MS);
  } catch {
    // テスト環境など
  }
  run();
}
