/**
 * 認証の入口。
 *  - 保護者（メール + パスワード、または LINE）がログイン → 「だれが あそぶ？」で子どもを選ぶ → その子どもとして学習する
 *  - ログインしていない（または 子どもを まだ えらんでいない）→ この端末の おためし学習者（run5: 端末ごと。共有のデモユーザーは もう使わない）
 *  - DB が止まっている → これまでどおり「おためしモード」（ブラウザの中の きろく。API は withOffline が内蔵データを返す）
 *
 * resolveLearner(): 学習データを書きこむ相手と その種類（child / trial / none）
 * currentUserId(): resolveLearner().userId
 * currentParent(): ログイン中の保護者とセッション（無ければ null）
 * requireParent(): ログイン必須の API 用。無ければ AuthError(401)
 * requirePinUnlocked(): 「おうちの方」エリアの API 用。PIN を入れていなければ AuthError(403, PIN_REQUIRED)
 */
import { prisma, isDbUp } from "@/lib/db";
import { clearSessionToken, readSessionToken, writeSessionToken } from "./cookies";
import { getOrCreateTrialLearner, currentTrialLearner } from "./trialLearner";
import { createSession, destroySession, isPinUnlocked, purgeExpiredSessions, readSession, ROTATE_GRACE_MS, rotateSession, type SessionRecord } from "./session";

/** seed のデモ用（共有）。run5 から あそぶときには 使わない（seed・古いデータの ためだけに のこす） */
export const DEMO_USER_ID = "demo-user";
/**
 * だれでもない（DB が止まった・おためし学習者を つくれない 描画中など）。DB に この id の行は無いので、
 * 読むと「なにも ない」、書くと 外部キーの エラー（→ withOffline が オフラインの データを返す）。
 */
export const NO_LEARNER_ID = "no-learner";

export interface ParentRecord {
  id: string;
  /** LINE だけで登録した保護者は null */
  email: string | null;
  passwordHash: string | null;
  /** LINE で登録して まだ暗証番号を決めていないときだけ null */
  pinHash: string | null;
  lineUserId: string | null;
  lineDisplayName: string | null;
  settings: unknown;
}

export interface AuthContext {
  parent: ParentRecord;
  session: SessionRecord;
  token: string;
}

export type AuthErrorCode = "NOT_LOGGED_IN" | "PIN_REQUIRED" | "PIN_SETUP_REQUIRED" | "FORBIDDEN";

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
      select: { id: true, email: true, passwordHash: true, pinHash: true, lineUserId: true, lineDisplayName: true, settings: true },
    });
    return parent ? { parent, session, token } : null;
  } catch {
    return null;
  }
}

export type LearnerKind = "child" | "trial" | "none";
export interface ResolvedLearner {
  userId: string;
  kind: LearnerKind;
}

/**
 * 学習データを書きこむ相手（この順番）
 *  1. ログイン中の保護者が「だれが あそぶ？」で えらんだ 自分の子ども
 *  2. この端末の おためし学習者（cookie。create = true なら 無ければ つくる）
 *  3. どちらも無い・DB が止まっている → none（NO_LEARNER_ID）
 * create は ルートハンドラ（cookie を書ける場所）だけ true にする。Server Component では false。
 */
export async function resolveLearner(opts: { create?: boolean } = {}, now = new Date()): Promise<ResolvedLearner> {
  const none: ResolvedLearner = { userId: NO_LEARNER_ID, kind: "none" };
  try {
    if (!(await isDbUp())) return none;
    if (await readSessionToken()) {
      const ctx = await currentParent(now);
      const childId = ctx?.session.selectedChildId;
      if (ctx && childId) {
        const child = await prisma.user.findFirst({ where: { id: childId, parentId: ctx.parent.id }, select: { id: true } });
        if (child) return { userId: child.id, kind: "child" };
      }
    }
    const trial = opts.create === false ? await currentTrialLearner() : await getOrCreateTrialLearner(now);
    return trial ? { userId: trial.id, kind: "trial" } : none;
  } catch {
    return none;
  }
}

/** 学習データを書きこむ相手の User.id（ゲームの API 用。おためし学習者が いなければ つくる） */
export async function currentUserId(now = new Date()): Promise<string> {
  return (await resolveLearner({ create: true }, now)).userId;
}

export async function requireParent(now = new Date()): Promise<AuthContext> {
  const ctx = await currentParent(now);
  if (!ctx) throw new AuthError(401, "NOT_LOGGED_IN", "ログインしてください。");
  return ctx;
}

export function requirePinUnlocked(ctx: AuthContext, now = new Date()): void {
  if (!ctx.parent.pinHash) {
    // LINE で登録して まだ暗証番号を決めていない → さきに暗証番号を決めてもらう
    throw new AuthError(403, "PIN_SETUP_REQUIRED", "さきに保護者用の暗証番号（4けた）を決めてください。");
  }
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
