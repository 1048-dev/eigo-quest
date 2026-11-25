/**
 * おうちの方が決める「1日のレッスン回数の上限」（子どもごと・既定は制限なし）。
 *  - 保存場所: Parent.settings.dailyLessonLimits[childId]
 *  - 数えるもの: きょう（APP_TIMEZONE）あたらしく完了したレッスンの数
 *  - 上限に届いたら、まだ完了していないレッスンは始められない・完了にできない
 *    （もう完了したレッスンの おさらいは できる。コインはほとんど増えないので回数に数えない）
 *  - おためしモード（保護者のいないデモユーザー）には かからない
 */
import { prisma } from "@/lib/db";
import { localDate } from "@/lib/domain/dates";
import { AUTH_LIMITS, ParentSettingsSchema, type ParentSettings } from "@/lib/api/contracts";

export const DAILY_LIMIT_MESSAGE_JA = "きょうの レッスンは ここまで！ また あした あそぼうね。";

/** DB の settings（Json）を安全に読む。おかしな値は捨てる */
export function parseParentSettings(raw: unknown): ParentSettings {
  const parsed = ParentSettingsSchema.safeParse(raw && typeof raw === "object" ? raw : {});
  const limits = parsed.success ? parsed.data.dailyLessonLimits : {};
  const clean: Record<string, number> = {};
  for (const [k, v] of Object.entries(limits)) {
    if (Number.isInteger(v) && v >= 1 && v <= AUTH_LIMITS.dailyLessonLimitMax) clean[k] = v;
  }
  return { dailyLessonLimits: clean };
}

export function dailyLimitFor(settings: ParentSettings, childId: string): number | null {
  return settings.dailyLessonLimits[childId] ?? null;
}

export function withDailyLimit(settings: ParentSettings, childId: string, limit: number | null): ParentSettings {
  const next = { ...settings.dailyLessonLimits };
  if (limit == null) delete next[childId];
  else next[childId] = limit;
  return { ...settings, dailyLessonLimits: next };
}

export type DailyLimitResult = { ok: true } | { ok: false; reasonJa: string; code: "DAILY_LIMIT" };

export async function checkDailyLessonLimit(userId: string, lessonNo: number, now = new Date()): Promise<DailyLimitResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { parent: { select: { settings: true } } } });
  const limit = user?.parent ? dailyLimitFor(parseParentSettings(user.parent.settings), userId) : null;
  if (limit == null) return { ok: true };
  const prev = await prisma.lessonProgress.findUnique({ where: { userId_lessonNo: { userId, lessonNo } }, select: { status: true } });
  if (prev?.status === "COMPLETED") return { ok: true };
  const doneToday = await prisma.lessonProgress.count({ where: { userId, status: "COMPLETED", completedOn: localDate(now) } });
  return doneToday >= limit ? { ok: false, reasonJa: DAILY_LIMIT_MESSAGE_JA, code: "DAILY_LIMIT" } : { ok: true };
}
