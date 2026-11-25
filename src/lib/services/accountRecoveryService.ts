/**
 * パスワードの再設定・メールアドレスの追加（run5）。
 *
 * トークン（メールのリンクに入れるもの）:
 *  - 32バイトの乱数（base64url 43文字）。DB には SHA-256 だけを保存（セッションと同じ）
 *  - 1回だけ使える（usedAt を「まだ null のときだけ」書く = 同時に2回送られても 1回しか通らない）
 *  - パスワードの再設定は 30分、メールアドレスの確認は 24時間で 期限切れ
 *  - 新しく発行したら、同じ保護者の 同じ種類の 古いトークンは 消す（さいごに届いたメールだけが使える）
 *
 * パスワードを再設定したら: その保護者の ほかの再設定トークンと、すべてのセッション（= すべての端末のログイン）を消す。
 * 「パスワードを忘れた」は 登録の有無で 答え・時間が かわらないように、ルートは この関数を 応答のあとに動かす。
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashSecret } from "@/lib/auth/password";
import { hashToken, isWellFormedToken, newToken } from "@/lib/auth/session";
import { normalizeBaseUrl } from "@/lib/line/messaging";
import { sendMail } from "@/lib/mail";
import { emailInUseMail, emailVerifyMail, passwordChangedMail, passwordResetMail } from "@/lib/mail/templates";

export const RESET_TOKEN_TTL_MS = 30 * 60_000;
export const EMAIL_TOKEN_TTL_MS = 24 * 3_600_000;
/** 期限が切れて これだけ たった トークンの行は 消す */
const PURGE_AFTER_MS = 7 * 86_400_000;

export type TokenPurpose = "PASSWORD_RESET" | "EMAIL_VERIFY";

/** トランザクションを 取り消すための しるし（メールアドレスが とちゅうで かわった） */
class TokenRaceAbort extends Error {}

function isUniqueViolation(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === "P2002";
}

/**
 * メールに入れる リンクのもと。APP_BASE_URL（公開している URL）→ 開発中だけ リクエストの URL。
 * 本番で APP_BASE_URL が無いときは null（Host ヘッダーを書きかえて 他人の再設定リンクを 自分のサイトに向けさせる攻撃を防ぐ）。
 */
export function mailLinkBase(req: Request, env: Record<string, string | undefined> = process.env): string | null {
  const fromEnv = normalizeBaseUrl(env.APP_BASE_URL);
  if (fromEnv) return fromEnv;
  if (env.NODE_ENV === "production") return null;
  try {
    return new URL(req.url).origin;
  } catch {
    return null;
  }
}

function link(base: string, path: string, token?: string): string {
  const u = new URL(base.replace(/\/+$/, "") + path);
  if (token) u.searchParams.set("token", token);
  return u.toString();
}

/** 画面に出す メールアドレス（a****@example.com） */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "****";
  const local = email.slice(0, at);
  return `${local.slice(0, Math.min(2, Math.max(1, local.length - 1)))}****${email.slice(at)}`;
}

async function issueToken(tx: Prisma.TransactionClient | typeof prisma, parentId: string, purpose: TokenPurpose, email: string, now: Date, extra: { passwordHash?: string } = {}): Promise<string> {
  const token = newToken();
  await tx.authToken.deleteMany({ where: { parentId, purpose, usedAt: null } });
  await tx.authToken.create({
    data: {
      parentId,
      purpose,
      tokenHash: hashToken(token),
      email,
      passwordHash: extra.passwordHash ?? null,
      expiresAt: new Date(now.getTime() + (purpose === "PASSWORD_RESET" ? RESET_TOKEN_TTL_MS : EMAIL_TOKEN_TTL_MS)),
      createdAt: now,
    },
  });
  return token;
}

interface TokenRow {
  id: string;
  parentId: string;
  purpose: TokenPurpose;
  email: string;
  passwordHash: string | null;
  expiresAt: Date;
  usedAt: Date | null;
}

/** 使えるトークン（形・種類・未使用・期限内）。だめなら null */
async function findUsableToken(token: unknown, purpose: TokenPurpose, now: Date): Promise<TokenRow | null> {
  if (!isWellFormedToken(token)) return null;
  const row = (await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } })) as TokenRow | null;
  if (!row || row.purpose !== purpose || row.usedAt || row.expiresAt.getTime() <= now.getTime()) return null;
  return row;
}

/** 1回だけ使う: まだ使われていない・期限内のときだけ usedAt を書く。書けたら true */
async function consumeToken(id: string, now: Date): Promise<boolean> {
  const r = await prisma.authToken.updateMany({ where: { id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
  return r.count === 1;
}

async function purgeOldTokens(now: Date): Promise<void> {
  await prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - PURGE_AFTER_MS) } } });
}

// ---------------------------------------------------------------------------
// パスワードの再設定
// ---------------------------------------------------------------------------

/**
 * 「パスワードを忘れた」: 登録があれば 再設定のリンクを送る。無ければ 何もしない（どちらも 呼んだ側の答えは同じ）。
 * 応答のあとに動かす前提（例外は 呼ぶ側が ログに出す）。送ったかどうかは テスト用に返す。
 */
export async function requestPasswordReset(email: string, base: string | null, now = new Date()): Promise<{ sent: boolean }> {
  await purgeOldTokens(now);
  const parent = await prisma.parent.findUnique({ where: { email }, select: { id: true, email: true } });
  if (!parent?.email) return { sent: false };
  if (!base) {
    console.error("[auth:password-reset] APP_BASE_URL が未設定のため 再設定メールを送れません");
    return { sent: false };
  }
  const token = await issueToken(prisma, parent.id, "PASSWORD_RESET", parent.email, now);
  await sendMail(passwordResetMail(parent.email, link(base, "/reset-password", token), RESET_TOKEN_TTL_MS / 60_000), { now });
  return { sent: true };
}

/** 再設定の画面を開いたとき: リンクが まだ使えるか（使わない） */
export async function checkPasswordResetToken(token: unknown, now = new Date()): Promise<{ valid: boolean; maskedEmail: string | null }> {
  const row = await findUsableToken(token, "PASSWORD_RESET", now);
  return row ? { valid: true, maskedEmail: maskEmail(row.email) } : { valid: false, maskedEmail: null };
}

export type ResetPasswordResult = { ok: true; parentId: string; email: string } | { ok: false; reason: "INVALID_TOKEN" };

/**
 * 新しいパスワードを決める。リンクは1回だけ。
 * 成功したら: パスワードを入れかえ、その保護者の ほかの再設定リンクと すべてのセッションを消す。
 */
export async function resetPassword(token: unknown, newPassword: string, now = new Date()): Promise<ResetPasswordResult> {
  const row = await findUsableToken(token, "PASSWORD_RESET", now);
  if (!row) return { ok: false, reason: "INVALID_TOKEN" };
  const parent = await prisma.parent.findUnique({ where: { id: row.parentId }, select: { id: true, email: true } });
  // 送ったあとで メールアドレスが かわった・アカウントが消えた → 使えない
  if (!parent?.email || parent.email !== row.email) return { ok: false, reason: "INVALID_TOKEN" };
  const passwordHash = await hashSecret(newPassword);
  // run5 Phase 4: 「トークンを使う」と「パスワードを入れかえる・セッションを消す」を 1つのトランザクションに
  // （とちゅうで失敗したとき リンクだけ使われて パスワードが かわらない・セッションが のこる ことが無いように）。
  // パスワードを書くのは メールアドレスが まだ トークンと同じときだけ（ハッシュ計算の間に かわっていたら やめる）
  const done = await prisma.$transaction(async (tx) => {
    const used = await tx.authToken.updateMany({ where: { id: row.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
    if (used.count !== 1) return false;
    const updated = await tx.parent.updateMany({ where: { id: parent.id, email: row.email }, data: { passwordHash } });
    if (updated.count !== 1) throw new TokenRaceAbort();
    await tx.authToken.deleteMany({ where: { parentId: parent.id, purpose: "PASSWORD_RESET", id: { not: row.id } } });
    await tx.session.deleteMany({ where: { parentId: parent.id } });
    return true;
  }).catch((e) => {
    if (e instanceof TokenRaceAbort) return false;
    throw e;
  });
  if (!done) return { ok: false, reason: "INVALID_TOKEN" };
  return { ok: true, parentId: parent.id, email: parent.email };
}

export async function sendPasswordChangedNotice(email: string, base: string | null, now = new Date()): Promise<void> {
  if (!base) return;
  await sendMail(passwordChangedMail(email, link(base, "/login")), { now });
}

/** パスワードを（設定画面で）変えたら、まだ使われていない 再設定リンクは 使えなくする */
export async function revokePasswordResetTokens(parentId: string): Promise<void> {
  await prisma.authToken.deleteMany({ where: { parentId, purpose: "PASSWORD_RESET" } });
}

// ---------------------------------------------------------------------------
// LINE だけで登録した保護者が メールアドレス + パスワードを追加する
// ---------------------------------------------------------------------------

export type EmailAddPrecheck = { ok: true } | { ok: false; reason: "HAS_EMAIL" | "NOT_FOUND" };

/** すでに メールアドレスがある保護者は 追加できない（変更は この機能の対象外） */
export async function canAddEmail(parentId: string): Promise<EmailAddPrecheck> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { email: true } });
  if (!p) return { ok: false, reason: "NOT_FOUND" };
  if (p.email) return { ok: false, reason: "HAS_EMAIL" };
  return { ok: true };
}

/**
 * 確認メールを送る。そのメールアドレスが ほかのアカウントで使われていれば、確認リンクではなく
 * 「すでに登録があります」のお知らせを そのアドレスに送る（画面の答えは同じ = 登録の有無を教えない）。
 * パスワードは この時点で ハッシュにして トークンの行に入れておき、確認したときに 保護者へ写す。
 */
export async function requestEmailAddition(parentId: string, email: string, password: string, base: string | null, now = new Date()): Promise<{ sent: "verify" | "in_use" | "none" }> {
  await purgeOldTokens(now);
  const passwordHash = await hashSecret(password);
  if (!base) {
    console.error("[auth:email-add] APP_BASE_URL が未設定のため 確認メールを送れません");
    return { sent: "none" };
  }
  const owner = await prisma.parent.findUnique({ where: { email }, select: { id: true } });
  if (owner) {
    if (owner.id === parentId) return { sent: "none" };
    await sendMail(emailInUseMail(email, link(base, "/login"), link(base, "/forgot-password")), { now });
    return { sent: "in_use" };
  }
  const token = await issueToken(prisma, parentId, "EMAIL_VERIFY", email, now, { passwordHash });
  await sendMail(emailVerifyMail(email, link(base, "/verify-email", token), EMAIL_TOKEN_TTL_MS / 3_600_000), { now });
  return { sent: "verify" };
}

export async function checkEmailToken(token: unknown, now = new Date()): Promise<{ valid: boolean; maskedEmail: string | null }> {
  const row = await findUsableToken(token, "EMAIL_VERIFY", now);
  return row ? { valid: true, maskedEmail: maskEmail(row.email) } : { valid: false, maskedEmail: null };
}

export type ConfirmEmailResult = { ok: true; email: string } | { ok: false; reason: "INVALID_TOKEN" | "HAS_EMAIL" | "EMAIL_TAKEN" };

/** 確認リンクを開いて「確定」: 保護者に メールアドレスとパスワードを入れる（1回だけ） */
export async function confirmEmailAddition(token: unknown, now = new Date()): Promise<ConfirmEmailResult> {
  const row = await findUsableToken(token, "EMAIL_VERIFY", now);
  if (!row?.passwordHash) return { ok: false, reason: "INVALID_TOKEN" };
  const parent = await prisma.parent.findUnique({ where: { id: row.parentId }, select: { id: true, email: true } });
  if (!parent) return { ok: false, reason: "INVALID_TOKEN" };
  if (parent.email) return { ok: false, reason: "HAS_EMAIL" };
  if (!(await consumeToken(row.id, now))) return { ok: false, reason: "INVALID_TOKEN" };
  try {
    // email: null のときだけ書く（同時に 2つの確認リンクが使われても 上書きしない）
    const r = await prisma.parent.updateMany({ where: { id: parent.id, email: null }, data: { email: row.email, passwordHash: row.passwordHash } });
    if (r.count !== 1) return { ok: false, reason: "HAS_EMAIL" };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, reason: "EMAIL_TAKEN" };
    throw e;
  }
  await prisma.authToken.deleteMany({ where: { parentId: parent.id, purpose: "EMAIL_VERIFY", id: { not: row.id } } });
  return { ok: true, email: row.email };
}
