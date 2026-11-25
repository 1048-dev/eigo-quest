/**
 * 端末ごとの おためし学習者（run5 Phase 1）。
 *
 *  - これまでは ログインしていない人が みんな 1人の「デモユーザー」を共有していた（ほかの人の きろくが まざる）。
 *    いまは 端末ごとに 保護者なしの User（isTrial = true）を つくる。
 *  - つくるのは DB が動いているときの さいしょの ゲーム API（ルートハンドラ）だけ。DB が止まっているときは
 *    これまでどおり ブラウザの中の きろく（オフラインモード）。
 *  - cookie（eq_trial_learner, httpOnly）には 32バイトの乱数だけ。DB には その SHA-256 だけを保存する
 *    （ランキングなどで User.id が見えても なりすませない・DB が もれても cookie は つくれない）。
 *  - lastActiveAt を ときどき（1時間に1回まで）更新する。60日 つかわれなかったら scripts/cleanup-trial.ts が消す。
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashToken, isWellFormedToken, newToken } from "./session";
import { newFriendCode } from "@/lib/services/parentService";

export const TRIAL_LEARNER_COOKIE = "eq_trial_learner";
/** cookie の期限（さいごに あそんでから。あそぶたびに のばす） */
export const TRIAL_COOKIE_TTL_MS = 400 * 86_400_000;
/** 60日 つかわれなかった おためし学習者は消す（scripts/cleanup-trial.ts） */
export const TRIAL_STALE_DAYS = 60;
/** lastActiveAt を書きなおす間隔（毎回 書かない） */
export const TRIAL_TOUCH_INTERVAL_MS = 60 * 60_000;
export const TRIAL_NICKNAME = "おためし";

export interface TrialLearner {
  id: string;
  lastActiveAt: Date | null;
}

function cookieOptions(now: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(now.getTime() + TRIAL_COOKIE_TTL_MS),
  };
}

export async function readTrialToken(): Promise<string | undefined> {
  try {
    return (await cookies()).get(TRIAL_LEARNER_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

/** cookie を書けたら true（Server Component の描画中は書けない → false） */
async function writeTrialToken(token: string, now: Date): Promise<boolean> {
  try {
    (await cookies()).set(TRIAL_LEARNER_COOKIE, token, cookieOptions(now));
    return true;
  } catch {
    return false;
  }
}

export async function clearTrialToken(): Promise<void> {
  try {
    (await cookies()).set(TRIAL_LEARNER_COOKIE, "", { ...cookieOptions(new Date(0)), maxAge: 0 });
  } catch {
    /* 描画中は書けない */
  }
}

/** cookie の トークン → おためし学習者（無い・形ちがい・消えた・保護者の子ども は null）。DB には書かない */
export async function findTrialLearner(token: string | null | undefined): Promise<TrialLearner | null> {
  if (!isWellFormedToken(token)) return null;
  return prisma.user.findFirst({
    where: { trialTokenHash: hashToken(token), isTrial: true, parentId: null },
    select: { id: true, lastActiveAt: true },
  });
}

/** この端末の おためし学習者（cookie を読むだけ。つくらない） */
export async function currentTrialLearner(): Promise<TrialLearner | null> {
  return findTrialLearner(await readTrialToken());
}

/** あそんだ しるし（1時間に1回まで書く）。失敗しても あそぶのは とめない */
export async function touchTrialLearner(learner: TrialLearner, now = new Date()): Promise<void> {
  const last = learner.lastActiveAt?.getTime() ?? 0;
  if (now.getTime() - last < TRIAL_TOUCH_INTERVAL_MS) return;
  try {
    await prisma.user.updateMany({ where: { id: learner.id, isTrial: true }, data: { lastActiveAt: now } });
  } catch {
    /* むし */
  }
}

/**
 * この端末の おためし学習者を かえす。無ければ つくって cookie に入れる。
 * cookie を書けない場所（Server Component）では つくらない（null）— 書けない cookie の ために 行を ふやさない。
 */
export async function getOrCreateTrialLearner(now = new Date()): Promise<TrialLearner | null> {
  const token = await readTrialToken();
  const found = await findTrialLearner(token);
  if (found) {
    await touchTrialLearner(found, now);
    // ときどき cookie の期限も のばす（lastActiveAt を書いたときだけ）
    if (now.getTime() - (found.lastActiveAt?.getTime() ?? 0) >= TRIAL_TOUCH_INTERVAL_MS && token) await writeTrialToken(token, now);
    return found;
  }
  const next = newToken();
  if (!(await writeTrialToken(next, now))) return null;
  for (let attempt = 0; ; attempt++) {
    try {
      const created = await prisma.user.create({
        data: { nickname: TRIAL_NICKNAME, friendCode: newFriendCode(), isTrial: true, trialTokenHash: hashToken(next), lastActiveAt: now },
        select: { id: true, lastActiveAt: true },
      });
      return created;
    } catch (e) {
      // フレンドコードが偶然かぶったら作りなおす
      if ((e as { code?: string } | null)?.code === "P2002" && attempt < 4) continue;
      await clearTrialToken();
      throw e;
    }
  }
}

/** 60日（days）より前から つかわれていない おためし学習者の条件 */
export function staleTrialWhere(now: Date, days = TRIAL_STALE_DAYS) {
  const cutoff = new Date(now.getTime() - days * 86_400_000);
  return {
    isTrial: true,
    parentId: null,
    OR: [
      { lastActiveAt: { lt: cutoff } },
      // lastActiveAt が 書かれていない古い行は つくった日で きめる
      { lastActiveAt: null, createdAt: { lt: cutoff } },
    ],
  };
}

/** staleTrialWhere と同じ判定（テスト・表示用の 純粋な関数） */
export function isStaleTrial(u: { isTrial: boolean; parentId: string | null; lastActiveAt: Date | null; createdAt: Date }, now: Date, days = TRIAL_STALE_DAYS): boolean {
  if (!u.isTrial || u.parentId !== null) return false;
  const cutoff = now.getTime() - days * 86_400_000;
  return (u.lastActiveAt ?? u.createdAt).getTime() < cutoff;
}
