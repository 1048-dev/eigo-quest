/**
 * 力だめしの サービス層（DB）。
 *  - じょうたい: 受ける ステージ（到達レッスンから）・受けられるか（1 年に 1 回・おためしは 1 回）・これまでの 結果
 *  - 提出: 受けられるかを サーバーで 確かめ、採点を サーバーで やりなおし（ブラウザの 点数は 信じない）、保存して 前回からの のびを かえす
 *  - 保護者向け: 子どもの さいしんの 結果と 前回からの のび
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { localDate } from "@/lib/domain/dates";
import { redactPersonalInfo } from "@/lib/conversation/engine";
import { getReachedLesson } from "@/lib/services/libraryService";
import { testStageFor, yearlyAvailability, type YearlyAvailability } from "@/lib/yearly/availability";
import { loadYearlyTest } from "@/lib/yearly/catalog";
import { buildResult, growthBetween, sanitizeAnswers } from "@/lib/yearly/scoring";
import { scoreOpenTasks } from "@/lib/yearly/aiScoring";
import type { SkillScores, YearlyAnswers, YearlyGrowth, YearlyResult, YearlyResultDetail } from "@/lib/yearly/types";

/** 一覧・保護者ページ用の 結果（1問ずつの こたえは ふくまない） */
export interface YearlySummary {
  id: string;
  stage: number;
  takenOn: string;
  scores: SkillScores;
  total: number;
  band: string;
  scaled: SkillScores & { total: number };
  gradedBy: string;
}

type Row = {
  id: string; stage: number; takenOn: string; listening: number; reading: number; speaking: number; writing: number;
  total: number; band: string; scaled: number; gradedBy: string; detail: unknown;
};

const SUMMARY_SELECT = {
  id: true, stage: true, takenOn: true, listening: true, reading: true, speaking: true, writing: true,
  total: true, band: true, scaled: true, gradedBy: true, detail: true,
} as const;

function toSummary(r: Row): YearlySummary {
  const d = (r.detail ?? {}) as { scaled?: Partial<SkillScores> };
  const num = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
  return {
    id: r.id,
    stage: r.stage,
    takenOn: r.takenOn,
    scores: { listening: r.listening, reading: r.reading, speaking: r.speaking, writing: r.writing },
    total: r.total,
    band: r.band,
    scaled: {
      listening: num(d.scaled?.listening, r.scaled), reading: num(d.scaled?.reading, r.scaled),
      speaking: num(d.scaled?.speaking, r.scaled), writing: num(d.scaled?.writing, r.scaled), total: r.scaled,
    },
    gradedBy: r.gradedBy,
  };
}

/** 新しい 順 */
export async function listYearlyResults(userId: string): Promise<YearlySummary[]> {
  const rows = await prisma.yearlyTestResult.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: SUMMARY_SELECT });
  return (rows as Row[]).map(toSummary).sort((a, b) => (a.takenOn < b.takenOn ? 1 : a.takenOn > b.takenOn ? -1 : 0));
}

export interface YearlyStatus {
  stage: number;
  reachedLesson: number;
  isTrial: boolean;
  availability: YearlyAvailability;
  history: YearlySummary[];
}

export async function getYearlyStatus(userId: string, now = new Date()): Promise<YearlyStatus> {
  const [reachedLesson, user, history] = await Promise.all([
    getReachedLesson(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { isTrial: true, parentId: true } }),
    listYearlyResults(userId),
  ]);
  const isTrial = isTrialUser(user);
  return {
    stage: testStageFor(reachedLesson),
    reachedLesson,
    isTrial,
    availability: yearlyAvailability({ isTrial, takenDays: history.map((h) => h.takenOn), today: localDate(now) }),
    history,
  };
}

/** 保護者が いない おためしの 学習者 */
const isTrialUser = (u: { isTrial?: boolean | null; parentId?: string | null } | null) => !!u && (u.isTrial === true || u.parentId == null);

export type YearlySubmitResult =
  | { status: "SAVED"; id: string; result: YearlyResult; growth: YearlyGrowth | null }
  | { status: "NOT_AVAILABLE"; availability: Exclude<YearlyAvailability, { available: true }> }
  | { status: "STAGE_CHANGED"; stage: number }
  | { status: "NOT_FOUND" };

/** 保存する こたえ（個人情報を ふせぎ、長さを きる） */
function storedDetail(result: YearlyResult): YearlyResultDetail & { scaled: YearlyResult["scaled"] } {
  const speaking: YearlyResultDetail["speaking"] = {};
  for (const [id, s] of Object.entries(result.detail.speaking)) speaking[id] = { ...s, text: redactPersonalInfo(s.text).slice(0, 300) };
  const w = result.detail.writing;
  const writingText = w.text.replace(/\S+@\S+/g, "***").replace(/https?:\/\/\S+/gi, "***").replace(/\d[\d\- ]{6,}\d/g, "***").slice(0, 1200);
  return { choices: result.detail.choices, speaking, writing: { ...w, text: writingText }, scaled: result.scaled };
}

export async function submitYearly(userId: string, input: { stage: number; answers: Partial<YearlyAnswers> }, now = new Date()): Promise<YearlySubmitResult> {
  const status = await getYearlyStatus(userId, now);
  if (!status.availability.available) return { status: "NOT_AVAILABLE", availability: status.availability };
  // 受けている あいだに レッスンが すすんで ステージが かわった（ふつうは おきない）→ 画面を 読みなおして もらう
  if (input.stage !== status.stage) return { status: "STAGE_CHANGED", stage: status.stage };
  const test = await loadYearlyTest(status.stage);
  if (!test) return { status: "NOT_FOUND" };

  const answers = sanitizeAnswers(test, input.answers);
  const open = await scoreOpenTasks(test, answers);
  const takenOn = localDate(now);
  const result = buildResult(test, answers, takenOn, open);
  const previous = status.history[0] ?? null;
  try {
    const row = await prisma.yearlyTestResult.create({
      data: {
        userId, stage: result.stage, takenOn, listening: result.scores.listening, reading: result.scores.reading, speaking: result.scores.speaking,
        writing: result.scores.writing, total: result.total, band: result.band, scaled: result.scaled.total, gradedBy: result.gradedBy,
        detail: storedDetail(result) as unknown as Prisma.InputJsonValue,
      },
      select: { id: true },
    });
    return { status: "SAVED", id: row.id, result, growth: previous ? growthBetween(previous, result) : null };
  } catch (e) {
    // 同じ日に 2 回 送られた（ユニーク制約違反）→ もう 受けた
    if ((e as { code?: string } | null)?.code === "P2002") {
      return { status: "NOT_AVAILABLE", availability: status.isTrial ? { available: false, reason: "TRIAL_USED" } : { available: false, reason: "WAIT", nextOn: takenOn } };
    }
    throw e;
  }
}

/** 保護者ページ用: さいしんの 結果と 前回からの のび（まだ 受けていなければ null） */
export interface ChildYearly {
  latest: YearlySummary;
  growth: YearlyGrowth | null;
  /** つぎに 受けられる 日（もう 受けられるなら null） */
  nextOn: string | null;
  count: number;
}

export async function getChildYearly(userId: string, now = new Date()): Promise<ChildYearly | null> {
  const history = await listYearlyResults(userId);
  const [latest, previous] = history;
  if (!latest) return null;
  const av = yearlyAvailability({ isTrial: false, takenDays: history.map((h) => h.takenOn), today: localDate(now) });
  return { latest, growth: previous ? growthBetween(previous, latest) : null, nextOn: av.available ? null : av.reason === "WAIT" ? av.nextOn : null, count: history.length };
}
