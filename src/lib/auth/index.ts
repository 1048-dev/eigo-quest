/**
 * 認証の入口。
 *  - 保護者（メール + パスワード）がログイン → 「だれが あそぶ？」で子どもを選ぶ → その子どもとして学習する
 *  - ログインしていない・DB が止まっている → これまでどおり「おためしモード」（デモユーザー）
 *
 * currentUserId(): 学習データを書きこむ相手（= 選ばれた子どもの User.id、無ければ DEMO_USER_ID）
 * currentParent(): ログイン中の保護者とセッション（無ければ null）
 * requireParent(): ログイン必須の API 用。無ければ AuthError(401)
 * requirePinUnlocked(): 「おうちの方」エリアの API 用。PIN を入れていなければ AuthError(403, PIN_REQUIRED)
 */
import { prisma, isDbUp } from "@/lib/db";
import { clearSessionToken, readSessionToken, writeSessionToken } from "./cookies";
import { createSession, destroySession, isPinUnlocked, purgeExpiredSessions, readSession, ROTATE_GRACE_MS, rotateSession, type SessionRecord } from "./session";

export const DEMO_USER_ID = "demo-user";

export interface ParentRecord {
  id: string;
  email: string;
  passwordHash: string;
  pinHash: string;
  settings: unknown;
}

export interface AuthContext {
  parent: ParentRecord;
  session: SessionRecord;
  token: string;
}

export type AuthErrorCode = "NOT_LOGGED_IN" | "PIN_REQUIRED" | "FORBIDDEN";

export class AuthError extends Error {
  constructor(public readonly status: number, public readonly code: AuthErrorCode, public readonly messageJa: string) {
    super(code);
    this.name = "AuthError";
  }
}

/** ログイン中の保護者（cookie → セッション → 保護者）。どんな失敗でも null（例外にしない） */
export async function currentParent(now = new Date()): Promise<AuthContext | null> {
  const token = await readSessionToken();
  if (!token) return null;
  try {
    const session = await readSession(token, now);
    if (!session) return null;
    const parent = await prisma.parent.findUnique({
      where: { id: session.parentId },
      select: { id: true, email: true, passwordHash: true, pinHash: true, settings: true },
    });
    return parent ? { parent, session, token } : null;
  } catch {
    return null;
  }
}

/**
 * 学習データを書きこむ子ども。
 * ログイン中で、選ばれた子どもが本当にその保護者の子どもなら その id。
 * それ以外（未ログイン・子ども未選択・DB 停止）はデモユーザー（おためしモード）。
 */
export async function currentUserId(now = new Date()): Promise<string> {
  const token = await readSessionToken();
  if (!token) return DEMO_USER_ID; // おためしモードは DB に問い合わせない
  try {
    if (!(await isDbUp())) return DEMO_USER_ID;
    const ctx = await currentParent(now);
    const childId = ctx?.session.selectedChildId;
    if (!ctx || !childId) return DEMO_USER_ID;
    const child = await prisma.user.findFirst({ where: { id: childId, parentId: ctx.parent.id }, select: { id: true } });
    return child?.id ?? DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}

export async function requireParent(now = new Date()): Promise<AuthContext> {
  const ctx = await currentParent(now);
  if (!ctx) throw new AuthError(401, "NOT_LOGGED_IN", "ログインしてください。");
  return ctx;
}

export function requirePinUnlocked(ctx: AuthContext, now = new Date()): void {
  if (!isPinUnlocked(ctx.session, now)) {
    throw new AuthError(403, "PIN_REQUIRED", "保護者用の暗証番号（4けた）を入力してください。");
  }
}

/**
 * ログイン成功時: 新しいセッションを作って cookie に入れる。
 * すでに cookie にセッションがあれば消してから作る（セッション固定攻撃の対策 = ログインのたびに新しいトークン）。
 */
export async function beginSession(parentId: string, opts: { pinVerified?: boolean } = {}, now = new Date()): Promise<SessionRecord> {
  const old = await readSessionToken();
  if (old) await destroySession(old);
  await purgeExpiredSessions(parentId, now);
  const { token, session } = await createSession(parentId, { pinVerifiedAt: opts.pinVerified ? now : null }, now);
  await writeSessionToken(token, session.expiresAt);
  return session;
}

/**
 * セッションを新しいトークンに入れ替えて cookie も書きかえる。
 * routine = true（1日ごとの入れ替え）のときは、古いトークンを ROTATE_GRACE_MS だけ使えるようにする。
 * パスワード変更など安全のための入れ替えは routine = false（古いトークンはすぐ無効）。
 */
export async function rotateCurrentSession(ctx: AuthContext, now = new Date(), opts: { routine?: boolean } = {}): Promise<SessionRecord | null> {
  const next = await rotateSession(ctx.token, now, { graceMs: opts.routine ? ROTATE_GRACE_MS : 0 });
  if (!next) return null;
  await writeSessionToken(next.token, next.session.expiresAt);
  return next.session;
}

export async function endSession(): Promise<void> {
  const token = await readSessionToken();
  if (token) await destroySession(token);
  await clearSessionToken();
}

/** ログイン中の保護者 + PIN 入力ずみ（おうちの方エリア） */
export async function requireParentArea(now = new Date()): Promise<AuthContext> {
  const ctx = await requireParent(now);
  requirePinUnlocked(ctx, now);
  return ctx;
}
