/**
 * 保護者アカウントのサービス層（登録・ログイン・子ども・ようす・設定・退会）。
 * ルートハンドラはこの層だけを呼ぶ。子どもを扱う関数は必ず parentId で絞りこむ
 * （ほかの保護者の子どもは「存在しない」のと同じ扱い）。
 */
import { randomInt } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { localDate } from "@/lib/domain/dates";
import { SKILL_LABELS_JA } from "@/lib/domain/mastery";
import { SKILLS } from "@/lib/domain/types";
import { defaultAvatarForNewChild, isAvatarCharacter, type AvatarCharacter } from "@/lib/domain/avatars";
import { AUTH_LIMITS, type Child, type ChildOverview, type ParentSettings } from "@/lib/api/contracts";
import { dummyHash, hashSecret, verifySecret } from "@/lib/auth/password";
import { computeUserMastery } from "@/lib/services/progressService";
import { dailyLimitFor, parseParentSettings, withDailyLimit } from "@/lib/services/dailyLimit";
import { deleteDeliveriesForChildren } from "@/lib/services/monthlyDeliveryService";

type Tx = Prisma.TransactionClient;

const CHILD_SELECT = { id: true, nickname: true, schoolGrade: true, birthYear: true, avatarCharacter: true } as const;

type ChildRow = { id: string; nickname: string; schoolGrade: number | null; birthYear: number | null; avatarCharacter: string | null };
/** DB の行 → 契約の形（知らない顔の名前は null = 画面が登録順の顔を出す） */
function toChild(r: ChildRow): Child {
  return { id: r.id, nickname: r.nickname, schoolGrade: r.schoolGrade, birthYear: r.birthYear, avatarCharacter: isAvatarCharacter(r.avatarCharacter) ? r.avatarCharacter : null };
}

function isUniqueViolation(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === "P2002";
}

// ---------------------------------------------------------------------------
// 登録・ログイン
// ---------------------------------------------------------------------------
export async function registerParent(input: { email: string; password: string; pin: string }): Promise<{ ok: true; parentId: string } | { ok: false; reason: "EMAIL_TAKEN" }> {
  const [passwordHash, pinHash] = await Promise.all([hashSecret(input.password), hashSecret(input.pin)]);
  try {
    const p = await prisma.parent.create({ data: { email: input.email, passwordHash, pinHash, settings: {} }, select: { id: true } });
    return { ok: true, parentId: p.id };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, reason: "EMAIL_TAKEN" };
    throw e;
  }
}

/** メールとパスワードを照合。どちらが違っても null（どちらが違うかは教えない）。登録の有無で時間が変わらないようにする */
export async function authenticateParent(email: string, password: string): Promise<{ id: string } | null> {
  const p = await prisma.parent.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  // パスワードを持たない（LINE だけの）保護者でも、ダミーと照合して時間をそろえる
  const ok = await verifySecret(password, p?.passwordHash ?? (await dummyHash()));
  return p?.passwordHash && ok ? { id: p.id } : null;
}

// ---------------------------------------------------------------------------
// LINE ログイン
// ---------------------------------------------------------------------------
export interface LineParentState {
  id: string;
  hasPin: boolean;
}

export async function findParentByLineUserId(lineUserId: string): Promise<LineParentState | null> {
  const p = await prisma.parent.findUnique({ where: { lineUserId }, select: { id: true, pinHash: true } });
  return p ? { id: p.id, hasPin: !!p.pinHash } : null;
}

/**
 * LINE で新しく登録する（メール・パスワード・暗証番号なし）。暗証番号はこのあと /setup-pin で決める。
 * 同じ LINE アカウントが同時に登録された（ユニーク違反）ときは、先にできた保護者を返す。
 */
export async function createLineParent(identity: { lineUserId: string; displayName: string | null }, now = new Date()): Promise<LineParentState> {
  try {
    const p = await prisma.parent.create({
      data: { email: null, passwordHash: null, pinHash: null, lineUserId: identity.lineUserId, lineDisplayName: identity.displayName, lineLinkedAt: now, settings: {} },
      select: { id: true },
    });
    return { id: p.id, hasPin: false };
  } catch (e) {
    if (isUniqueViolation(e)) {
      const existing = await findParentByLineUserId(identity.lineUserId);
      if (existing) return existing;
    }
    throw e;
  }
}

export type LinkLineResult = { ok: true } | { ok: false; reason: "ALREADY_LINKED_OTHER" | "HAS_OTHER_LINE" | "NOT_FOUND" };

/** メールで登録した保護者に LINE を連携する。その LINE がほかの保護者に連携ずみなら できない */
export async function linkLine(parentId: string, identity: { lineUserId: string; displayName: string | null }, now = new Date()): Promise<LinkLineResult> {
  const [me, owner] = await Promise.all([
    prisma.parent.findUnique({ where: { id: parentId }, select: { id: true, lineUserId: true } }),
    prisma.parent.findUnique({ where: { lineUserId: identity.lineUserId }, select: { id: true } }),
  ]);
  if (!me) return { ok: false, reason: "NOT_FOUND" };
  if (owner && owner.id !== parentId) return { ok: false, reason: "ALREADY_LINKED_OTHER" };
  if (me.lineUserId && me.lineUserId !== identity.lineUserId) return { ok: false, reason: "HAS_OTHER_LINE" };
  try {
    await prisma.parent.update({
      where: { id: parentId },
      data: { lineUserId: identity.lineUserId, lineDisplayName: identity.displayName, ...(me.lineUserId ? {} : { lineLinkedAt: now }) },
    });
  } catch (e) {
    // ほぼ同時に ほかの保護者が同じ LINE を連携した
    if (isUniqueViolation(e)) return { ok: false, reason: "ALREADY_LINKED_OTHER" };
    throw e;
  }
  return { ok: true };
}

export type UnlinkLineResult = { ok: true } | { ok: false; reason: "NOT_LINKED" | "NEEDS_PASSWORD" };

/** LINE の連携を外す。メール + パスワードでログインできない保護者は外せない（ログインできなくなるため） */
export async function unlinkLine(parentId: string): Promise<UnlinkLineResult> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { email: true, passwordHash: true, lineUserId: true } });
  if (!p?.lineUserId) return { ok: false, reason: "NOT_LINKED" };
  if (!p.email || !p.passwordHash) return { ok: false, reason: "NEEDS_PASSWORD" };
  await prisma.parent.update({ where: { id: parentId }, data: { lineUserId: null, lineDisplayName: null, lineLinkedAt: null, lineFriend: null, lineFriendChangedAt: null } });
  return { ok: true };
}

/** はじめての暗証番号（まだ決めていないときだけ。すでにあれば false） */
export async function setInitialPin(parentId: string, pin: string): Promise<boolean> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { pinHash: true } });
  if (!p || p.pinHash) return false;
  const pinHash = await hashSecret(pin);
  const r = await prisma.parent.updateMany({ where: { id: parentId, pinHash: null }, data: { pinHash } });
  return r.count === 1;
}

/**
 * LINE で登録した直後に「やめる」: 暗証番号もパスワードも子どももない保護者だけ消せる。
 * （メールで登録ずみの方が まちがえて LINE で新しく登録してしまったとき用）
 */
export async function cancelLineSignup(parentId: string): Promise<boolean> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { pinHash: true, passwordHash: true, lineUserId: true } });
  if (!p || p.pinHash || p.passwordHash || !p.lineUserId) return false;
  if ((await prisma.user.count({ where: { parentId } })) > 0) return false;
  await deleteParentAccount(parentId);
  return true;
}

// ---------------------------------------------------------------------------
// 子ども
// ---------------------------------------------------------------------------
export async function listChildren(parentId: string): Promise<Child[]> {
  const rows = await prisma.user.findMany({ where: { parentId }, select: CHILD_SELECT, orderBy: { createdAt: "asc" } });
  return rows.map(toChild);
}

export async function getOwnedChild(parentId: string, childId: string): Promise<Child | null> {
  const r = await prisma.user.findFirst({ where: { id: childId, parentId }, select: CHILD_SELECT });
  return r ? toChild(r) : null;
}

const FRIEND_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // まぎらわしい 0/O・1/I は使わない
export function newFriendCode(): string {
  const pick = (n: number) => Array.from({ length: n }, () => FRIEND_CODE_CHARS[randomInt(FRIEND_CODE_CHARS.length)]).join("");
  return `${pick(4)}-${pick(4)}`;
}

export async function createChild(parentId: string, input: { nickname: string; schoolGrade: number; birthYear?: number | null; avatarCharacter?: AvatarCharacter }): Promise<{ ok: true; child: Child } | { ok: false; reason: "TOO_MANY" }> {
  const siblings = await prisma.user.findMany({ where: { parentId }, select: { avatarCharacter: true }, orderBy: { createdAt: "asc" } });
  if (siblings.length >= AUTH_LIMITS.maxChildren) return { ok: false, reason: "TOO_MANY" };
  const avatarCharacter = input.avatarCharacter ?? defaultAvatarForNewChild(siblings.map((x) => x.avatarCharacter));
  for (let attempt = 0; ; attempt++) {
    try {
      const child = await prisma.user.create({
        data: { parentId, nickname: input.nickname, schoolGrade: input.schoolGrade, birthYear: input.birthYear ?? null, avatarCharacter, friendCode: newFriendCode() },
        select: CHILD_SELECT,
      });
      return { ok: true, child: toChild(child) };
    } catch (e) {
      // フレンドコードが偶然かぶったら作りなおす
      if (isUniqueViolation(e) && attempt < 4) continue;
      throw e;
    }
  }
}

export async function updateChild(parentId: string, childId: string, input: { nickname?: string; schoolGrade?: number; birthYear?: number | null; avatarCharacter?: AvatarCharacter }): Promise<Child | null> {
  const owned = await getOwnedChild(parentId, childId);
  if (!owned) return null;
  const data: Prisma.UserUpdateInput = {};
  if (input.nickname !== undefined) data.nickname = input.nickname;
  if (input.schoolGrade !== undefined) data.schoolGrade = input.schoolGrade;
  if (input.birthYear !== undefined) data.birthYear = input.birthYear;
  if (input.avatarCharacter !== undefined) data.avatarCharacter = input.avatarCharacter;
  return toChild(await prisma.user.update({ where: { id: owned.id }, data, select: CHILD_SELECT }));
}

/** 子どもが じぶんで 顔を かえる（自分の家の子どもだけ） */
export async function setChildAvatar(parentId: string, childId: string, avatarCharacter: AvatarCharacter): Promise<Child | null> {
  return updateChild(parentId, childId, { avatarCharacter });
}

/** 子どもの学習データをすべて消す（ハード削除） */
export async function deleteUsersData(tx: Tx, userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  await deleteDeliveriesForChildren(tx, userIds);
  const mine = { userId: { in: userIds } };
  await tx.friendship.deleteMany({ where: { OR: [mine, { friendId: { in: userIds } }] } });
  await tx.itemResponse.deleteMany({ where: mine });
  await tx.itemMemory.deleteMany({ where: mine });
  await tx.masterySnapshot.deleteMany({ where: mine });
  await tx.coinLedger.deleteMany({ where: mine });
  await tx.reviewAlert.deleteMany({ where: mine });
  await tx.userMonster.deleteMany({ where: mine });
  await tx.gachaTicket.deleteMany({ where: mine });
  await tx.userShopItem.deleteMany({ where: mine });
  await tx.testAttempt.deleteMany({ where: mine });
  await tx.lessonProgress.deleteMany({ where: mine });
  await tx.user.deleteMany({ where: { id: { in: userIds } } });
}

export async function deleteChild(parentId: string, childId: string): Promise<boolean> {
  const owned = await getOwnedChild(parentId, childId);
  if (!owned) return false;
  await prisma.$transaction(async (tx) => {
    await deleteUsersData(tx, [owned.id]);
    await tx.session.updateMany({ where: { parentId, selectedChildId: owned.id }, data: { selectedChildId: null } });
    const p = await tx.parent.findUnique({ where: { id: parentId }, select: { settings: true } });
    const settings = withDailyLimit(parseParentSettings(p?.settings), owned.id, null);
    await tx.parent.update({ where: { id: parentId }, data: { settings: settings as unknown as Prisma.InputJsonValue } });
  });
  return true;
}

/** 「だれが あそぶ？」— 自分の子どもだけ選べる */
export async function selectChild(parentId: string, sessionId: string, childId: string): Promise<Child | null> {
  const owned = await getOwnedChild(parentId, childId);
  if (!owned) return null;
  await prisma.session.update({ where: { id: sessionId }, data: { selectedChildId: owned.id } });
  return owned;
}

// ---------------------------------------------------------------------------
// ようす（保護者ダッシュボード）
// ---------------------------------------------------------------------------
export async function getParentOverview(parentId: string, now = new Date()): Promise<ChildOverview[]> {
  const [children, parent] = await Promise.all([
    prisma.user.findMany({
      where: { parentId },
      orderBy: { createdAt: "asc" },
      select: { id: true, nickname: true, schoolGrade: true, avatarCharacter: true, coins: true, streakDays: true, longestStreak: true, lastStudyDate: true },
    }),
    prisma.parent.findUnique({ where: { id: parentId }, select: { settings: true } }),
  ]);
  const settings = parseParentSettings(parent?.settings);
  const today = localDate(now);
  return Promise.all(children.map(async (c) => {
    const { result, completedLessons } = await computeUserMastery(c.id, now);
    const lessonsDone = completedLessons.size;
    const lessonsToday = [...completedLessons.values()].filter((d) => d === today).length;
    const weakestSkills = lessonsDone === 0 ? [] : [...SKILLS]
      .sort((a, b) => result.scores[a] - result.scores[b])
      .slice(0, 3)
      .map((skill) => ({ skill, labelJa: SKILL_LABELS_JA[skill], score: result.scores[skill] }));
    return {
      id: c.id,
      nickname: c.nickname,
      schoolGrade: c.schoolGrade,
      avatarCharacter: isAvatarCharacter(c.avatarCharacter) ? c.avatarCharacter : null,
      lessonsDone,
      totalLessons: TOTAL_LESSONS,
      lessonsToday,
      streakDays: c.streakDays,
      longestStreak: c.longestStreak,
      coins: c.coins,
      masteryOverall: result.overall,
      lastStudyDate: c.lastStudyDate,
      weakestSkills,
      dailyLessonLimit: dailyLimitFor(settings, c.id),
    };
  }));
}

// ---------------------------------------------------------------------------
// 設定・PIN・パスワード・退会
// ---------------------------------------------------------------------------
export async function getParentSettings(parentId: string): Promise<ParentSettings> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { settings: true } });
  return parseParentSettings(p?.settings);
}

/** 自分の子どもでなければ null */
export async function setDailyLessonLimit(parentId: string, childId: string, limit: number | null): Promise<ParentSettings | null> {
  const owned = await getOwnedChild(parentId, childId);
  if (!owned) return null;
  const next = withDailyLimit(await getParentSettings(parentId), owned.id, limit);
  await prisma.parent.update({ where: { id: parentId }, data: { settings: next as unknown as Prisma.InputJsonValue } });
  return next;
}

export async function verifyParentPassword(parentId: string, password: string): Promise<boolean> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { passwordHash: true } });
  return verifySecret(password, p?.passwordHash ?? (await dummyHash())).then((ok) => ok && !!p?.passwordHash);
}

/**
 * 大事な操作（暗証番号の変更・退会）の前の本人確認。
 * パスワードがある保護者はパスワード、LINE だけで登録した保護者（パスワードなし）は暗証番号で確かめる。
 */
export async function verifyParentReauth(parentId: string, secret: string): Promise<boolean> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { passwordHash: true, pinHash: true } });
  const stored = p?.passwordHash ?? p?.pinHash ?? null;
  return verifySecret(secret, stored ?? (await dummyHash())).then((ok) => ok && !!stored);
}

export async function parentHasPassword(parentId: string): Promise<boolean> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { passwordHash: true } });
  return !!p?.passwordHash;
}

export async function verifyParentPin(parentId: string, pin: string): Promise<boolean> {
  const p = await prisma.parent.findUnique({ where: { id: parentId }, select: { pinHash: true } });
  return verifySecret(pin, p?.pinHash ?? (await dummyHash())).then((ok) => ok && !!p);
}

export async function changeParentPin(parentId: string, newPin: string): Promise<void> {
  await prisma.parent.update({ where: { id: parentId }, data: { pinHash: await hashSecret(newPin) } });
}

export async function changeParentPassword(parentId: string, newPassword: string): Promise<void> {
  await prisma.parent.update({ where: { id: parentId }, data: { passwordHash: await hashSecret(newPassword) } });
}

/** 退会: 保護者・セッション・子どもと子どもの学習データをすべて消す */
export async function deleteParentAccount(parentId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const children = await tx.user.findMany({ where: { parentId }, select: { id: true } });
    await deleteUsersData(tx, children.map((c) => c.id));
    await tx.session.deleteMany({ where: { parentId } });
    await tx.parent.delete({ where: { id: parentId } });
  });
}
