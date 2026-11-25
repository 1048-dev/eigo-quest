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

// ---------------------------------------------------------------------------
// run5: 端末ごとの おためし学習者（DB）の きろくも いっしょに ひきつぐ
// ---------------------------------------------------------------------------

/** 端末の おためし学習者（DB の User, isTrial）の きろく */
export interface DbTrialSnapshot {
  userId: string;
  /** lessonNo → クリアした日 */
  lessons: Record<string, string>;
  /** assessmentId → 合格した日（NORMAL の合格だけ） */
  tests: Record<string, string>;
  /** いまの コイン（DB の きろくなので 上限で おさえない。ガチャで つかった分は へっている） */
  coins: number;
  streakDays: number;
  longestStreak: number;
  lastStudyDate: string | null;
  /** 記憶（そのまま コピーする） */
  memories: MemoryState[];
  /** ガチャで あつめた モンスター */
  monsters: { monsterId: string; count: number }[];
}

export interface DeviceTrialMergePlan extends TrialMergePlan {
  monsters: { monsterId: string; count: number }[];
  /** coins の内わけ（台帳に べつべつに 書く） */
  coinParts: { browser: number; db: number };
}

const earlier = (a: Record<string, string>, b: Record<string, string>): Record<string, string> => {
  const out = { ...a };
  for (const [k, d] of Object.entries(b)) if (!out[k] || d < out[k]) out[k] = d;
  return out;
};

const NO_CHILD: ChildProgressState = { completedLessons: new Set(), passedTests: new Set(), memoryItemIds: new Set(), streakDays: 0, longestStreak: 0, lastStudyDate: null };

/**
 * ブラウザの おためしの きろく（browser）と 端末の おためし学習者（db）を 子どもに ひきつぐ中身を決める。
 * どちらか片方だけでも よい（もう ひきついだ方は null で わたす）。
 *  - レッスン・テスト: 両方を あわせて、子どもが まだ持っていない分（日付は 早い方）
 *  - コイン: ブラウザの分は 上限で おさえる（手で書きかえられるので）＋ DB の分は そのまま
 *  - れんぞく: 子ども・ブラウザ・DB の 大きい方
 *  - 記憶: 子どもに無い項目だけ。DB の記憶を そのまま コピー、のこりは ブラウザの さいごの答えから
 *  - モンスター: DB の分を たす
 */
export function planDeviceTrialMerge(
  child: ChildProgressState,
  browser: TrialCarryData | null,
  db: DbTrialSnapshot | null,
  catalog: TrialMergeCatalog,
  now: Date,
  today: string,
): DeviceTrialMergePlan {
  const dbMemories = (db?.memories ?? []).filter((m) => !child.memoryItemIds.has(m.itemId) && catalog.isItem(m.itemId));
  const dbStudyDates = db ? [...Object.values(db.lessons), ...Object.values(db.tests), ...(db.lastStudyDate ? [db.lastStudyDate] : [])] : [];
  const combined: TrialCarryData = {
    trialId: browser?.trialId ?? db?.userId ?? "none",
    lessons: earlier(db?.lessons ?? {}, browser?.lessons ?? {}),
    tests: earlier(db?.tests ?? {}, browser?.tests ?? {}),
    coins: 0, // コインは 下で べつに 計算する
    studyDates: [...(browser?.studyDates ?? []), ...dbStudyDates],
    items: browser?.items ?? {},
  };
  const base = planTrialMerge(
    { ...child, memoryItemIds: new Set([...child.memoryItemIds, ...dbMemories.map((m) => m.itemId)]) },
    combined, catalog, now, today,
  );
  const browserCoins = browser ? planTrialMerge(NO_CHILD, browser, catalog, now, today).coins : 0;
  const dbCoins = db && Number.isFinite(db.coins) ? Math.max(0, Math.floor(db.coins)) : 0;

  const streakDays = Math.max(base.streak.streakDays, db?.streakDays ?? 0);
  const streak = {
    streakDays,
    longestStreak: Math.max(base.streak.longestStreak, db?.longestStreak ?? 0, streakDays),
    lastStudyDate: base.streak.lastStudyDate,
  };
  const monsters = (db?.monsters ?? []).filter((m) => m.count > 0).map((m) => ({ monsterId: m.monsterId, count: Math.floor(m.count) }));
  return {
    ...base,
    coins: browserCoins + dbCoins,
    coinParts: { browser: browserCoins, db: dbCoins },
    streak,
    memories: [...dbMemories, ...base.memories].sort((a, b) => a.itemId.localeCompare(b.itemId)),
    monsters,
  };
}

/** DB の おためし学習者に ひきつぐものが あるか */
export function isDbTrialEmpty(db: Pick<DbTrialSnapshot, "lessons" | "tests" | "coins" | "monsters"> | null): boolean {
  return !db || (Object.keys(db.lessons).length === 0 && Object.keys(db.tests).length === 0 && !(db.coins > 0) && db.monsters.length === 0);
}
