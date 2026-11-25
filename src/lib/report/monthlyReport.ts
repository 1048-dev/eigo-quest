/**
 * 月ごとの学習レポート（保護者向け・A4 1ページ）の中身を作る純粋関数。
 * DB には触らない（サービス層 src/lib/services/monthlyDeliveryService.ts が材料を集めて渡す）。
 *
 *  - 今月のレッスン数・学習した日数・合格したテスト
 *  - 連続日数・最長連続日数
 *  - 6つの力の習得率（送信時点）と総合
 *  - にがて（習得率の低い力・忘れかけの項目）
 *  - 来月の予定（次に進むレッスンからの 単元・フォニックス）
 *  - 同封するワークシート: これから進む 20 レッスンの 1か月ワークブック（run7: ワールドごと → 20レッスンごと）
 *  - run7: いまの ステージ・レベル、学校の英語「○○ まで修了」、覚えた ことばの数
 */
import { countWordsLearned, getItem, getLesson, TOTAL_LESSONS } from "@/lib/curriculum";
import { levelOfLesson, monthPackOfLesson, schoolGradeCompleted, stageDef, stageOfLesson, type MonthPack } from "@/lib/curriculum/stages";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import { localDate } from "@/lib/domain/dates";
import { SKILL_LABELS_JA, type MasteryResult } from "@/lib/domain/mastery";
import { SKILLS, type Skill } from "@/lib/domain/types";
import { WORLD_COUNT, worldName } from "@/lib/game/worlds";

// ---------------------------------------------------------------------------
// 月（"YYYY-MM"、APP_TIMEZONE 基準）
// ---------------------------------------------------------------------------
const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidMonth(m: unknown): m is string {
  return typeof m === "string" && MONTH_RE.test(m);
}

/** その日時が属する月（APP_TIMEZONE） */
export function monthOf(d: Date): string {
  return localDate(d).slice(0, 7);
}

export function previousMonth(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function monthLabelJa(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

/** "YYYY-MM-DD" がその月か */
export function inMonth(day: string | null | undefined, month: string): boolean {
  return !!day && day.startsWith(`${month}-`);
}

/** DB で月の範囲を文字列で絞りこむための上下限（"YYYY-MM-01" 〜 "YYYY-MM-31"） */
export function monthDayRange(month: string): { gte: string; lte: string } {
  return { gte: `${month}-01`, lte: `${month}-31` };
}

// ---------------------------------------------------------------------------
// どこまで進んだか
// ---------------------------------------------------------------------------
/** 次に進むレッスン（1から順に、まだ完了していない最初のレッスン）。全部おわっていれば null */
export function nextLessonNo(completed: ReadonlyMap<number, string> | ReadonlySet<number>, total = TOTAL_LESSONS): number | null {
  for (let n = 1; n <= total; n++) if (!completed.has(n)) return n;
  return null;
}

/** いま いる（これから始める）ワールド。ワールドの最後まで終えたら 次のワールド。全部おわったら最後のワールド */
export function currentWorld(completed: ReadonlyMap<number, string> | ReadonlySet<number>, total = TOTAL_LESSONS): number {
  const next = nextLessonNo(completed, total);
  if (next == null) return Math.min(WORLD_COUNT, Math.max(1, Math.ceil(total / CURRICULUM_RULES.lessonsPerWorld)));
  return getLesson(next)?.world ?? Math.ceil(next / CURRICULUM_RULES.lessonsPerWorld);
}

// ---------------------------------------------------------------------------
// レポート
// ---------------------------------------------------------------------------
export interface ReportInput {
  child: { id: string; nickname: string; streakDays: number; longestStreak: number; lastStudyDate: string | null };
  month: string;
  /** 完了したレッスン → 完了した日（"YYYY-MM-DD"） */
  completedLessons: ReadonlyMap<number, string>;
  /** その月のテストの記録（ふつうのテスト・アリーナ・お宝） */
  attempts: readonly { assessmentId: string; passed: boolean; takenOn: string; source?: string }[];
  mastery: MasteryResult;
  now: Date;
}

/** メッセージ・ダウンロードページに出す要約（DB の ReportDelivery.summary にも入れる） */
export interface ReportSummary {
  childName: string;
  month: string;
  monthLabelJa: string;
  lessonsThisMonth: number;
  studyDaysThisMonth: number;
  testsPassedThisMonth: number;
  streakDays: number;
  longestStreak: number;
  overall: number;
  lessonsDone: number;
  totalLessons: number;
  world: number;
  worldNameJa: string;
  // run7（古い 記録には 無い）
  /** いまの ステージ（1〜5）と その名前・レベル（CEFR の めやす） */
  stage?: number;
  stageNameJa?: string;
  level?: string;
  /** 学校の英語「小6 の内容まで修了」など */
  schoolLineJa?: string;
  /** 覚えた ことば（完了した レッスンの 単語の数） */
  wordsLearned?: number;
  /** 同封する 1か月ワークブックの 番号と 範囲 */
  pack?: number;
  packStart?: number;
  packEnd?: number;
}

export interface MonthlyReport extends ReportSummary {
  stage: number;
  stageNameJa: string;
  level: string;
  schoolLineJa: string;
  wordsLearned: number;
  pack: number;
  packStart: number;
  packEnd: number;
  generatedOn: string;
  mastery: { skill: Skill; labelJa: string; score: number }[];
  weakSkills: { skill: Skill; labelJa: string; score: number }[];
  weakItems: { text: string; ja: string; lessonNo: number }[];
  nextLessonNo: number | null;
  nextTopics: { lessonNo: number; topicJa: string; titleJa: string }[];
  nextPhonics: string[];
  commentJa: string;
}

const MAX_WEAK_ITEMS = 6;
const MAX_TOPICS = 6;
const MAX_PHONICS = 6;
/** 来月の予定に入れるレッスン数の下限・上限（今月のペースで見積もる） */
const PLAN_MIN = 10;
const PLAN_MAX = CURRICULUM_RULES.lessonsPerWorld;

export function buildMonthlyReport(input: ReportInput): MonthlyReport {
  const { child, month, completedLessons, attempts, mastery, now } = input;

  const lessonDays = [...completedLessons.values()].filter((d) => inMonth(d, month));
  const monthAttempts = attempts.filter((a) => inMonth(a.takenOn, month));
  const studyDays = new Set([...lessonDays, ...monthAttempts.map((a) => a.takenOn)]);
  const passedIds = new Set(monthAttempts.filter((a) => a.passed).map((a) => a.assessmentId));

  const lessonsDone = completedLessons.size;
  const masteryList = SKILLS.map((skill) => ({ skill, labelJa: SKILL_LABELS_JA[skill], score: mastery.scores[skill] ?? 0 }));
  const weakSkills = lessonsDone === 0 ? [] : [...masteryList].sort((a, b) => a.score - b.score).slice(0, 2);

  const weakItems = lessonsDone === 0 ? [] : mastery.weakestItemIds
    .map((id) => getItem(id))
    .filter((i): i is NonNullable<typeof i> => !!i)
    .slice(0, MAX_WEAK_ITEMS)
    .map((i) => ({ text: i.text, ja: i.ja, lessonNo: i.lessonNo }));

  const next = nextLessonNo(completedLessons);
  const planCount = Math.min(PLAN_MAX, Math.max(PLAN_MIN, lessonDays.length));
  const nextTopics: MonthlyReport["nextTopics"] = [];
  const phonics: string[] = [];
  if (next != null) {
    const seenTopic = new Set<string>();
    for (let n = next; n < next + planCount && n <= TOTAL_LESSONS; n++) {
      const l = getLesson(n);
      if (!l) continue;
      if (!seenTopic.has(l.school.topic) && nextTopics.length < MAX_TOPICS) {
        seenTopic.add(l.school.topic);
        nextTopics.push({ lessonNo: n, topicJa: l.school.topic, titleJa: l.titleJa });
      }
      for (const f of l.phonics.focus) if (!phonics.includes(f) && phonics.length < MAX_PHONICS) phonics.push(f);
    }
  }

  const world = currentWorld(completedLessons);
  // いまの いる レッスン（つぎに進む レッスン。全部おわっていれば さいご）→ ステージ・レベル・ワークブック
  const here = Math.max(1, Math.min(next ?? TOTAL_LESSONS, TOTAL_LESSONS));
  const stage = stageOfLesson(here);
  const pack: MonthPack = monthPackOfLesson(here);
  const cleared = next == null ? TOTAL_LESSONS : next - 1;
  const summary: ReportSummary & Pick<MonthlyReport, "stage" | "stageNameJa" | "level" | "schoolLineJa" | "wordsLearned" | "pack" | "packStart" | "packEnd"> = {
    childName: child.nickname,
    month,
    monthLabelJa: monthLabelJa(month),
    lessonsThisMonth: lessonDays.length,
    studyDaysThisMonth: studyDays.size,
    testsPassedThisMonth: passedIds.size,
    streakDays: child.streakDays,
    longestStreak: child.longestStreak,
    overall: mastery.overall,
    lessonsDone,
    totalLessons: TOTAL_LESSONS,
    world,
    worldNameJa: worldName(world),
    stage,
    stageNameJa: stageDef(stage).nameJa,
    level: levelOfLesson(here),
    schoolLineJa: schoolGradeCompleted(cleared).lineJa,
    wordsLearned: countWordsLearned(completedLessons.keys()),
    pack: pack.pack,
    packStart: pack.start,
    packEnd: Math.min(pack.end, TOTAL_LESSONS),
  };

  return {
    ...summary,
    generatedOn: localDate(now),
    mastery: masteryList,
    weakSkills,
    weakItems,
    nextLessonNo: next,
    nextTopics,
    nextPhonics: phonics,
    commentJa: commentFor(summary, weakSkills[0]?.labelJa ?? null),
  };
}

/** 保護者への ひとこと（数字から決める。ほめる → 次の一歩の順） */
export function commentFor(s: Pick<ReportSummary, "lessonsThisMonth" | "studyDaysThisMonth" | "streakDays" | "lessonsDone" | "totalLessons">, weakestLabel: string | null): string {
  if (s.lessonsDone >= s.totalLessons) return "すべてのレッスンを終えました。復習アリーナで、にがてな所をくり返すと さらに定着します。";
  if (s.lessonsThisMonth === 0) {
    return s.lessonsDone === 0
      ? "まだレッスンを始めていません。1日1レッスン（10分ほど）から、いっしょに始めてみましょう。"
      : "今月はレッスンがありませんでした。前に習ったことを忘れないうちに、1日1レッスンから再開してみましょう。";
  }
  const praise = s.studyDaysThisMonth >= 20 ? "ほぼ毎日の学習、すばらしいです！"
    : s.studyDaysThisMonth >= 10 ? "よいペースで続けられています。"
      : "少しずつ前に進んでいます。";
  const tip = weakestLabel ? `「${weakestLabel}」がまだ伸びしろです。同封のワークシートや復習クエストで、いっしょに声に出して練習してみてください。` : "";
  return praise + tip;
}

/** メッセージの短い説明（Flex の本文・代替テキスト用） */
export function summaryLinesJa(s: ReportSummary): string[] {
  return [
    `今月のレッスン: ${s.lessonsThisMonth}回（学習した日 ${s.studyDaysThisMonth}日）`,
    `連続: ${s.streakDays}日（最長 ${s.longestStreak}日）`,
    `総合習得率: ${Math.round(s.overall)}%`,
    `いまのワールド: ${s.world}「${s.worldNameJa}」`,
    ...(s.stage ? [`ステージ${s.stage}${s.level ? `（${s.level}）` : ""}・覚えた ことば ${s.wordsLearned ?? 0}語`] : []),
    ...(s.schoolLineJa ? [s.schoolLineJa] : []),
  ];
}
