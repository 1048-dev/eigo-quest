/**
 * おためしモードの きろく → 子どもの きろく への ひきつぎ（DB を使わない純粋な計算）。
 *
 * ルール（run4 Phase 1）
 *  - レッスン: 子どもが まだクリアしていない分だけ「クリア」にする（クリアした日は おためしの日）
 *  - テスト合格: 子どもが まだ合格していない分だけ 合格にする（復習クエスト・まとめ・ボスのみ。アリーナ・お宝は のぞく）
 *  - コイン: たし算。ただし おためしの きろくで ありえる上限で おさえる（手で書きかえた値を そのまま信じない）
 *  - れんぞく日数: 大きい方（max）。いちばん長い れんぞく日数も 大きい方
 *  - 記憶（ItemMemory）: 子どもに まだ無い項目だけ、おためしの さいごの答えから つくる（子どもの きろくを 上書きしない）
 */
import { COIN_RULES } from "./config";
import { daysBetween } from "./dates";
import { updateMemory } from "./memory";
import type { AssessmentKind, MemoryState } from "./types";

/** 端末に のこっている おためしの きろく（API にも この形で送る） */
export interface TrialCarryData {
  /** 端末ごとの おためしID（ひきつぎは このIDごとに1回だけ） */
  trialId: string;
  /** lessonNo → クリアした日 "YYYY-MM-DD" */
  lessons: Record<string, string>;
  /** assessmentId → 合格した日 */
  tests: Record<string, string>;
  /** おためしで もらったコインの合計 */
  coins: number;
  /** あそんだ日 "YYYY-MM-DD" */
  studyDates: string[];
  /** itemId → さいごの答え（t: 時刻ミリ秒, ok: 正解か） */
  items: Record<string, { t: number; ok: boolean }>;
}

export interface ChildProgressState {
  completedLessons: ReadonlySet<number>;
  passedTests: ReadonlySet<string>;
  memoryItemIds: ReadonlySet<string>;
  streakDays: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export interface TrialMergeCatalog {
  isLesson: (lessonNo: number) => boolean;
  /** テストの種類（無いテストは undefined） */
  assessmentKind: (id: string) => AssessmentKind | undefined;
  isItem: (itemId: string) => boolean;
}

export interface TrialMergePlan {
  lessons: { lessonNo: number; completedOn: string }[];
  tests: { assessmentId: string; takenOn: string }[];
  coins: number;
  streak: { streakDays: number; longestStreak: number; lastStudyDate: string | null };
  memories: MemoryState[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (d: unknown): d is string => typeof d === "string" && DATE_RE.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
const CARRY_TEST_KINDS: ReadonlySet<AssessmentKind> = new Set(["DAILY_CHECK", "MINI", "BOSS"]);

/** あそんだ日から「いちばん長い れんぞく」と「さいごの日で おわる れんぞく」を出す */
export function trialStreak(studyDates: readonly string[], today?: string): { current: number; longest: number; last: string | null } {
  const days = [...new Set(studyDates.filter(isDate))].filter((d) => !today || d <= today).sort();
  if (days.length === 0) return { current: 0, longest: 0, last: null };
  let run = 1;
  let longest = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current: run, longest, last: days[days.length - 1] };
}

/** おためしの きろくで ありえるコインの上限（レッスン・かいわ・テスト・れんぞくボーナス・まとめ動画） */
export function maxTrialCoins(input: { lessonCount: number; testKinds: readonly AssessmentKind[]; studyDays: number }): number {
  const perLesson = Math.max(...COIN_RULES.lessonCoinsByDailyIndex) + COIN_RULES.conversationFinished;
  const testMax = (k: AssessmentKind) => (k === "BOSS" ? COIN_RULES.bossFirstTry : k === "MINI" ? COIN_RULES.miniTestFirstTry : k === "DAILY_CHECK" ? COIN_RULES.dailyCheckFirstTry : 0);
  const d = Math.max(0, input.studyDays);
  const perDay = COIN_RULES.streakDailyMax + COIN_RULES.recapWatched;
  return (
    Math.max(0, input.lessonCount) * perLesson +
    input.testKinds.reduce((s, k) => s + testMax(k), 0) +
    d * perDay +
    Math.floor(d / COIN_RULES.streakBonusEvery) * COIN_RULES.streakBonus +
    Math.floor(d / COIN_RULES.streakBigBonusEvery) * COIN_RULES.streakBigBonus
  );
}

/** ひきつぎの中身を決める（DB には書かない） */
export function planTrialMerge(child: ChildProgressState, trial: TrialCarryData, catalog: TrialMergeCatalog, now: Date, today: string): TrialMergePlan {
  // --- 正しい おためしの きろくだけ のこす（未来の日付・無いレッスンなどは すてる）
  const validLessons = Object.entries(trial.lessons ?? {})
    .map(([k, d]) => ({ lessonNo: Number(k), completedOn: d }))
    .filter((l) => Number.isInteger(l.lessonNo) && catalog.isLesson(l.lessonNo) && isDate(l.completedOn) && l.completedOn <= today)
    .sort((a, b) => a.lessonNo - b.lessonNo);
  const validTests = Object.entries(trial.tests ?? {})
    .map(([assessmentId, takenOn]) => ({ assessmentId, takenOn, kind: catalog.assessmentKind(assessmentId) }))
    .filter((t): t is { assessmentId: string; takenOn: string; kind: AssessmentKind } => !!t.kind && CARRY_TEST_KINDS.has(t.kind) && isDate(t.takenOn) && t.takenOn <= today)
    .sort((a, b) => a.assessmentId.localeCompare(b.assessmentId));

  // あそんだ日: 送られた日 + レッスン・テストの日（どちらかが欠けていても れんぞく日数が出るように）
  const studyDates = [...(trial.studyDates ?? []), ...validLessons.map((l) => l.completedOn), ...validTests.map((t) => t.takenOn)];
  const s = trialStreak(studyDates, today);

  const cap = maxTrialCoins({ lessonCount: validLessons.length, testKinds: validTests.map((t) => t.kind), studyDays: new Set(studyDates.filter(isDate)).size });
  const claimed = Number.isFinite(trial.coins) ? Math.floor(trial.coins) : 0;
  const coins = Math.min(Math.max(0, claimed), cap);

  const lastStudyDate = [child.lastStudyDate, s.last].filter((d): d is string => !!d).sort().pop() ?? null;
  const streakDays = Math.max(child.streakDays, s.current);
  const streak = {
    streakDays,
    longestStreak: Math.max(child.longestStreak, s.longest, streakDays),
    lastStudyDate,
  };

  const memories: MemoryState[] = [];
  for (const [itemId, r] of Object.entries(trial.items ?? {})) {
    if (child.memoryItemIds.has(itemId) || !catalog.isItem(itemId)) continue;
    if (!r || typeof r.ok !== "boolean" || !Number.isFinite(r.t)) continue;
    const at = new Date(Math.min(r.t, now.getTime()));
    if (at.getFullYear() < 2020) continue;
    memories.push(updateMemory(undefined, itemId, r.ok, at));
  }
  memories.sort((a, b) => a.itemId.localeCompare(b.itemId));

  return {
    lessons: validLessons.filter((l) => !child.completedLessons.has(l.lessonNo)),
    tests: validTests.filter((t) => !child.passedTests.has(t.assessmentId)).map(({ assessmentId, takenOn }) => ({ assessmentId, takenOn })),
    coins,
    streak,
    memories,
  };
}

/** ひきつぐものが なにも無いか（「ひきつぐ？」を出さない） */
export function isTrialDataEmpty(t: Pick<TrialCarryData, "lessons" | "tests" | "coins">): boolean {
  return Object.keys(t.lessons ?? {}).length === 0 && Object.keys(t.tests ?? {}).length === 0 && !(t.coins > 0);
}
