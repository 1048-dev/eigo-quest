/**
 * メール送信（run5）。送り方は環境変数で えらぶ（どの会社のサービスにも しばらない）。
 *
 *   MAIL_PROVIDER = resend | smtp | outbox
 *     - resend : Resend の HTTP API（RESEND_API_KEY, MAIL_FROM）
 *     - smtp   : nodemailer で SMTP（SMTP_URL 例 smtps://user:pass@smtp.example.com:465, MAIL_FROM）
 *     - outbox : 送らずに .data/mail-outbox（MAIL_OUTBOX_DIR）へ書いて、ログに ファイルの場所を出す（開発用）
 *   MAIL_PROVIDER が空なら: RESEND_API_KEY があれば resend → SMTP_URL があれば smtp → どちらも無ければ outbox。
 *   resend / smtp を えらんでも キーや MAIL_FROM が足りなければ outbox にする（警告を出す）。
 *
 * ログには あて先・件名・本文（リンクのトークン）を出さない。出すのは 送り方と 失敗の種類だけ。
 */
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type MailProviderName = "resend" | "smtp" | "outbox";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailResult {
  provider: MailProviderName;
  /** resend: メッセージID、smtp: messageId、outbox: 書いたファイル */
  id: string | null;
}

export interface MailConfig {
  provider: MailProviderName;
  from: string;
  resendApiKey?: string;
  smtpUrl?: string;
  outboxDir: string;
  /** 指定された送り方が使えず outbox にした理由（ログ用） */
  fallbackReason?: string;
}

export const RESEND_API_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 15_000;
const DEFAULT_FROM = "英語クエスト <no-reply@localhost>";

export class MailError extends Error {
  constructor(public readonly provider: MailProviderName, public readonly reason: string) {
    super(`${provider}: ${reason}`);
    this.name = "MailError";
  }
}

type Env = Record<string, string | undefined>;

export function mailConfig(env: Env = process.env): MailConfig {
  const from = env.MAIL_FROM?.trim() ?? "";
  const resendApiKey = env.RESEND_API_KEY?.trim() || undefined;
  const smtpUrl = env.SMTP_URL?.trim() || undefined;
  const outboxDir = env.MAIL_OUTBOX_DIR?.trim() || path.join(process.cwd(), ".data", "mail-outbox");
  const wanted = env.MAIL_PROVIDER?.trim().toLowerCase();
  const chosen: MailProviderName = wanted === "resend" || wanted === "smtp" || wanted === "outbox"
    ? wanted
    : resendApiKey ? "resend" : smtpUrl ? "smtp" : "outbox";
  const outbox = (fallbackReason?: string): MailConfig => ({ provider: "outbox", from: from || DEFAULT_FROM, outboxDir, fallbackReason });
  if (chosen === "resend") {
    if (!resendApiKey) return outbox("RESEND_API_KEY is empty");
    if (!from) return outbox("MAIL_FROM is empty");
    return { provider: "resend", from, resendApiKey, outboxDir };
  }
  if (chosen === "smtp") {
    if (!smtpUrl) return outbox("SMTP_URL is empty");
    if (!from) return outbox("MAIL_FROM is empty");
    return { provider: "smtp", from, smtpUrl, outboxDir };
  }
  return outbox();
}

/** 本番で outbox のまま（= メールが届かない）かどうか。README と起動時の警告用 */
export function isMailDeliverable(env: Env = process.env): boolean {
  return mailConfig(env).provider !== "outbox";
}

type Fetch = typeof fetch;

async function sendResend(cfg: MailConfig, m: MailMessage, fetchImpl: Fetch): Promise<MailResult> {
  let res: Response;
  try {
    res = await fetchImpl(RESEND_API_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.resendApiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: cfg.from, to: [m.to], subject: m.subject, text: m.text, html: m.html }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (e) {
    throw new MailError("resend", (e as { name?: string } | null)?.name === "TimeoutError" ? "timeout" : "network");
  }
  if (!res.ok) throw new MailError("resend", `http ${res.status}`);
  let id: string | null = null;
  try {
    const j = (await res.json()) as { id?: unknown };
    id = typeof j?.id === "string" ? j.id : null;
  } catch {
    id = null;
  }
  return { provider: "resend", id };
}

async function sendSmtp(cfg: MailConfig, m: MailMessage): Promise<MailResult> {
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    url: cfg.smtpUrl,
    connectionTimeout: SEND_TIMEOUT_MS,
    greetingTimeout: SEND_TIMEOUT_MS,
    socketTimeout: SEND_TIMEOUT_MS,
  } as Parameters<typeof nodemailer.createTransport>[0]);
  try {
    const info = await transport.sendMail({ from: cfg.from, to: m.to, subject: m.subject, text: m.text, html: m.html });
    return { provider: "smtp", id: typeof info.messageId === "string" ? info.messageId : null };
  } catch (e) {
    const err = e as { code?: string; responseCode?: number } | null;
    throw new MailError("smtp", err?.code ?? (err?.responseCode ? `smtp ${err.responseCode}` : "error"));
  } finally {
    transport.close();
  }
}

async function writeOutbox(cfg: MailConfig, m: MailMessage, now: Date): Promise<MailResult> {
  await mkdir(cfg.outboxDir, { recursive: true });
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const base = path.join(cfg.outboxDir, `${stamp}-${randomBytes(4).toString("hex")}`);
  const file = `${base}.json`;
  await writeFile(file, JSON.stringify({ from: cfg.from, ...m, createdAt: now.toISOString() }, null, 2), "utf8");
  await writeFile(`${base}.html`, m.html, "utf8");
  console.log(`[mail:outbox] メールは送らずに ファイルに書きました: ${file}`);
  return { provider: "outbox", id: file };
}

/** 1通送る。失敗したら MailError（呼ぶ側で ログだけ出す。画面の答えは かえない） */
export async function sendMail(m: MailMessage, opts: { env?: Env; fetchImpl?: Fetch; now?: Date } = {}): Promise<MailResult> {
  const cfg = mailConfig(opts.env);
  if (cfg.provider === "resend") return sendResend(cfg, m, opts.fetchImpl ?? fetch);
  if (cfg.provider === "smtp") return sendSmtp(cfg, m);
  if (cfg.fallbackReason) console.warn(`[mail] ${cfg.fallbackReason} → outbox に書きます（メールは届きません）`);
  else if (process.env.NODE_ENV === "production") console.warn("[mail] MAIL_PROVIDER が未設定のため outbox に書きます（メールは届きません）");
  return writeOutbox(cfg, m, opts.now ?? new Date());
}
