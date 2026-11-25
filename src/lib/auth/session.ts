/**
 * ログインセッション（DB）。
 *  - トークン: 32バイトの乱数（base64url）。cookie にだけ入れる
 *  - DB にはトークンの SHA-256 だけを保存（DB が漏れてもトークンは復元できない）
 *  - 有効期限つき。期限切れのセッションは読んだときに消す
 *  - rotate: 新しいトークンに入れ替えて古いものを消す（ログイン時・パスワード変更時・1日ごと）
 */
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

export const SESSION_TTL_MS = 30 * 86_400_000; // 30日
export const SESSION_ROTATE_AFTER_MS = 86_400_000; // 1日たったら入れ替える
export const PIN_UNLOCK_MS = 10 * 60_000; // 保護者PINを入れてから10分は「おうちの方」エリアを開けたまま
/**
 * ふだんの入れ替え（1日ごと）では、古いトークンをすぐ消さずにこの時間だけ使えるようにする。
 * 同じ画面から同時に出ているリクエスト（例: me で入れ替え中にレッスン完了）が古い cookie のままでも、
 * 未ログイン扱い（= おためしモードのデモユーザーに記録）にならないようにするため。
 * パスワード変更などの「安全のための入れ替え」では猶予なし（すぐ消す）。
 */
export const ROTATE_GRACE_MS = 60_000;

export interface SessionRecord {
  id: string;
  parentId: string;
  tokenHash: string;
  selectedChildId: string | null;
  pinVerifiedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isWellFormedToken(token: unknown): token is string {
  return typeof token === "string" && TOKEN_RE.test(token);
}

export async function createSession(
  parentId: string,
  opts: { selectedChildId?: string | null; pinVerifiedAt?: Date | null } = {},
  now = new Date(),
): Promise<{ token: string; session: SessionRecord }> {
  const token = newToken();
  const session = await prisma.session.create({
    data: {
      parentId,
      tokenHash: hashToken(token),
      selectedChildId: opts.selectedChildId ?? null,
      pinVerifiedAt: opts.pinVerifiedAt ?? null,
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      createdAt: now,
    },
  });
  return { token, session };
}

/** トークンからセッションを読む。形式違い・存在しない・期限切れは null（期限切れは消す） */
export async function readSession(token: string | null | undefined, now = new Date()): Promise<SessionRecord | null> {
  if (!isWellFormedToken(token)) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!session) return null;
  if (session.expiresAt.getTime() <= now.getTime()) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }
  return session;
}

/**
 * 新しいトークンに入れ替える（選んだ子ども・PIN の状態は引きつぐ）。
 *  - graceMs = 0（既定）: 古いトークンはすぐ使えなくなる
 *  - graceMs > 0: 古いトークンは graceMs のあいだだけ使える（その間に もう一度 入れ替えることはできない）
 */
export async function rotateSession(
  token: string | null | undefined,
  now = new Date(),
  opts: { graceMs?: number } = {},
): Promise<{ token: string; session: SessionRecord } | null> {
  const old = await readSession(token, now);
  if (!old) return null;
  const graceMs = Math.max(0, opts.graceMs ?? 0);
  // 猶予中の（すでに入れ替えた）古いトークンからは、新しいセッションを増やさない
  if (graceMs > 0 && old.expiresAt.getTime() - now.getTime() <= graceMs) return null;
  const next = newToken();
  const retireOld = graceMs > 0
    ? prisma.session.updateMany({ where: { id: old.id }, data: { expiresAt: new Date(now.getTime() + graceMs) } })
    : prisma.session.deleteMany({ where: { id: old.id } });
  const [, session] = await prisma.$transaction([
    retireOld,
    prisma.session.create({
      data: {
        parentId: old.parentId,
        tokenHash: hashToken(next),
        selectedChildId: old.selectedChildId,
        pinVerifiedAt: old.pinVerifiedAt,
        expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
        createdAt: now,
      },
    }),
  ]);
  return { token: next, session };
}

export async function destroySession(token: string | null | undefined): Promise<void> {
  if (!isWellFormedToken(token)) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

/** その保護者のセッションをすべて消す（exceptId だけ残す）。パスワード変更時に他の端末をログアウトさせる */
export async function destroyOtherSessions(parentId: string, exceptId?: string): Promise<void> {
  await prisma.session.deleteMany({ where: { parentId, ...(exceptId ? { id: { not: exceptId } } : {}) } });
}

/** 期限切れのセッションを掃除する（ログイン時についでに呼ぶ） */
export async function purgeExpiredSessions(parentId: string, now = new Date()): Promise<void> {
  await prisma.session.deleteMany({ where: { parentId, expiresAt: { lte: now } } });
}

export function needsRotation(session: Pick<SessionRecord, "createdAt">, now = new Date()): boolean {
  return now.getTime() - session.createdAt.getTime() >= SESSION_ROTATE_AFTER_MS;
}

export function isPinUnlocked(session: Pick<SessionRecord, "pinVerifiedAt">, now = new Date()): boolean {
  const t = session.pinVerifiedAt?.getTime();
  return t != null && now.getTime() - t >= 0 && now.getTime() - t < PIN_UNLOCK_MS;
}
