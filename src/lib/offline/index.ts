/**
 * オフライン用の内蔵データ（DBにつながらない・サーバーに届かないときの表示用）。
 *
 * DBを使わない純粋な処理（カリキュラム・ステージの進み方・モンスター図鑑）だけで組み立てるので、
 * サーバー（APIルート）からもブラウザ（画面）からも同じものを使える。
 * 中身はすべて契約（lib/api/contracts.ts）どおりの形で、offline: true の目印が付く。
 */
import announcementsRaw from "@content/announcements.json";
import { ASSESSMENTS, TOTAL_LESSONS, ensureLessonsLoaded, gateTestAfterLesson, getLesson, itemsOfLesson, reviewQuestFor, TEACHER } from "@/lib/curriculum";
import { toProgressMaps, type LocalProgress } from "./localProgress";
import { buildLessonFlow } from "@/lib/curriculum/questions";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import { localDate } from "@/lib/domain/dates";
import { buildStageMap } from "@/lib/domain/progression";
import { listArenas } from "@/lib/domain/arena";
import { mergeRewards, rewardForConversation, rewardForLesson } from "@/lib/domain/coins";
import { rollMonster } from "@/lib/domain/gacha";
import { MONSTERS } from "@/lib/game/monsters";
import {
  AnnouncementsResponseSchema, DEFAULT_USER,
  type AnnouncementsResponse, type CollectionResponse, type DashboardResponse, type GachaResponse, type LessonCompleteResponse,
  type LessonResponse, type MapResponse, type RankingResponse, type TreasureAlertResponse,
} from "@/lib/api/contracts";

const OFF = { success: true, offline: true } as const;

/**
 * ぼうけんマップ: ふつうは はじめから（Lesson 1 から遊べる状態）。ステージの並び・ロックは本物と同じルール。
 * ブラウザでは、おためしモードで クリアした分（lib/offline/localProgress）を progress に わたすと、そこまで すすんだ マップになる。
 */
export function offlineMap(now = new Date(), progress?: LocalProgress): MapResponse {
  const { completedLessons, passedTests } = toProgressMaps(progress ?? { lessons: {}, tests: {} });
  const map = buildStageMap({
    totalLessons: TOTAL_LESSONS,
    lessonsPerWorld: CURRICULUM_RULES.lessonsPerWorld,
    completedLessons,
    passedTests,
    gateTestAfter: gateTestAfterLesson,
    reviewQuestFor,
    today: localDate(now),
  });
  return { ...OFF, nodes: map.nodes, current: map.current, arenas: listArenas(ASSESSMENTS, passedTests), user: DEFAULT_USER };
}

/** ステータス（習得率）: まだ記録がない状態 */
export function offlineDashboard(): DashboardResponse {
  return {
    ...OFF,
    user: DEFAULT_USER,
    scores: { SCHOOL_TEST: 0, PHONICS: 0, LISTENING: 0, SPEAKING: 0, VOCABULARY: 0, WRITING: 0 },
    overall: 0,
    coverage: 0,
    lessonsCompleted: 0,
    totalLessons: TOTAL_LESSONS,
    weakest: [],
    history: [],
  };
}

/** おしらせ: content/announcements.json（ピン留め→新しい順） */
export function offlineAnnouncements(): AnnouncementsResponse {
  const parsed = AnnouncementsResponseSchema.safeParse(announcementsRaw);
  const list = parsed.success ? parsed.data.announcements : [];
  const sorted = [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));
  return { ...OFF, announcements: sorted };
}

export const offlineCollection = (): CollectionResponse => ({ ...OFF, owned: [], coins: 0, rareTickets: 0 });

export const offlineTreasureAlert = (): TreasureAlertResponse => ({ ...OFF, show: false, alert: null, messageJa: "" });

export const offlineRanking = (scope: "national" | "friends", metric: "coins" | "streak"): RankingResponse => ({ ...OFF, scope, metric, rows: [] });

/** おためし召喚（記録はされない）。図鑑の100体から本物と同じ確率で出る */
export function offlineGacha(useRareTicket: boolean, rng: () => number = Math.random): GachaResponse {
  const m = rollMonster(MONSTERS, useRareTicket ? "RARE" : "NORMAL", rng);
  return {
    ...OFF,
    ok: true,
    monster: { id: m.id, nameEn: m.nameEn, nameJa: m.nameJa, rarity: m.rarity, theme: m.theme, imageKey: m.imageKey },
    isNew: true,
    coins: 0,
    rareTickets: 0,
    reasonJa: "",
  };
}

/**
 * ブラウザ用: そのレッスン（と スピードリスニングで使う 直前の4レッスン）の ワールドを 読みこんでから 組み立てる。
 * run7: カリキュラム全体は ブラウザに のせず、ワールドごとの JSON を あとから 読む
 */
export async function loadOfflineLesson(lessonNo: number): Promise<LessonResponse> {
  if (Number.isInteger(lessonNo) && lessonNo >= 1 && lessonNo <= TOTAL_LESSONS) await ensureLessonsLoaded(Math.max(1, lessonNo - 4), lessonNo);
  return offlineLesson(lessonNo);
}

/** レッスン: カリキュラムだけで組み立てられるので、DBなしでも全部遊べる（サーバー、または loadOfflineLesson の あと） */
export function offlineLesson(lessonNo: number): LessonResponse {
  const lesson = getLesson(lessonNo);
  if (!lesson) return { ...OFF, lesson: null, teacher: TEACHER, items: [], steps: [] };
  return { ...OFF, lesson, teacher: TEACHER, items: itemsOfLesson(lesson), steps: buildLessonFlow(lesson) };
}

/** レッスン完了（記録はされない。もらえるはずのコインだけ表示する） */
export function offlineLessonComplete(lessonNo = 1, opts: { conversationFinished?: boolean } = {}): LessonCompleteResponse {
  const r = mergeRewards(
    rewardForLesson({ alreadyCompleted: false }),
    rewardForConversation({ finished: !!opts.conversationFinished, alreadyRewarded: false }),
  );
  return { ...OFF, ok: true, reasonJa: "", reward: { total: r.total, rareGachaTickets: r.rareGachaTickets, coins: r.coins.map((c) => ({ amount: c.amount, labelJa: c.labelJa })) }, nextTest: gateTestAfterLesson(lessonNo)?.id };
}
