/**
 * コイン獲得ロジック（純粋関数）。
 * どのイベントで何コインを付与するかをここだけで決め、DB層は結果を CoinLedger に追記するだけ。
 */
import { COIN_RULES as C } from "./config";
import type { AssessmentKind } from "./types";

export type CoinReason =
  | "LESSON_COMPLETE"
  | "DAILY_CHECK_FIRST_TRY"
  | "DAILY_CHECK_PASS"
  | "MINI_TEST_PASS"
  | "BOSS_TEST_PASS"
  | "TREASURE_ALERT_CLEAR"
  | "ARENA_PLAY"
  | "STREAK_BONUS"
  | "RECAP_WATCHED"
  | "CONVERSATION_FINISHED";

export interface CoinAward {
  amount: number;
  reason: CoinReason;
  multiplier: number;
  /** 演出用の一言 */
  labelJa: string;
}

export interface Reward {
  coins: CoinAward[];
  rareGachaTickets: number;
  total: number;
}

const award = (amount: number, reason: CoinReason, labelJa: string, multiplier = 1): CoinAward => ({
  amount: Math.round(amount * multiplier),
  reason,
  multiplier,
  labelJa,
});

const finalize = (coins: CoinAward[], rareGachaTickets = 0): Reward => ({
  coins,
  rareGachaTickets,
  total: coins.reduce((s, c) => s + c.amount, 0),
});

/** その日 k 回目（0始まり＝今日これまでに完了した新しいレッスン数）の新しいレッスンのコイン */
export function lessonCoinsForDailyIndex(completedTodayBefore: number): number {
  const k = Math.max(0, Math.floor(completedTodayBefore));
  return C.lessonCoinsByDailyIndex[k] ?? C.lessonCoinsAfterTable;
}

/** 通常レッスン完了。completedTodayBefore = 今日これまでに完了した新しいレッスンの数（今回を含まない） */
export function rewardForLesson(input: { alreadyCompleted: boolean; completedTodayBefore?: number }): Reward {
  if (input.alreadyCompleted) return finalize([]); // 復習受講は経験値のみ（コイン稼ぎはアリーナへ誘導）
  return finalize([award(lessonCoinsForDailyIndex(input.completedTodayBefore ?? 0), "LESSON_COMPLETE", "レッスンクリア！")]);
}

export interface TestResultInput {
  kind: AssessmentKind;
  passed: boolean;
  score: number; // 0..1
  /** そのテストへの初回挑戦か（一発合格判定） */
  isFirstAttempt: boolean;
  /** 既に合格済みのテストを再受験した（ゲート系テストの二重取り防止） */
  alreadyPassed: boolean;
  /** アリーナ: 今日すでに何回プレイしたか（今回を含まない） */
  arenaPlaysToday?: number;
  /** お宝アラート経由のプレイか */
  viaTreasureAlert?: boolean;
}

export function rewardForTest(t: TestResultInput): Reward {
  switch (t.kind) {
    case "DAILY_CHECK":
      if (!t.passed || t.alreadyPassed) return finalize([]);
      return t.isFirstAttempt
        ? finalize([award(C.dailyCheckFirstTry, "DAILY_CHECK_FIRST_TRY", "復習クエスト 一発クリアボーナス！")])
        : finalize([award(C.dailyCheckRetryPass, "DAILY_CHECK_PASS", "復習クエスト クリア！")]);

    case "MINI":
      if (!t.passed || t.alreadyPassed) return finalize([]);
      return finalize([
        award(t.isFirstAttempt ? C.miniTestFirstTry : C.miniTestRetryPass, "MINI_TEST_PASS",
          t.isFirstAttempt ? "まとめテスト 一発合格！" : "まとめテスト合格！"),
      ]);

    case "BOSS":
      if (!t.passed || t.alreadyPassed) return finalize([]);
      return finalize(
        [award(t.isFirstAttempt ? C.bossFirstTry : C.bossRetryPass, "BOSS_TEST_PASS", "ボスをたおした！")],
        C.bossRareTickets,
      );

    case "TREASURE":
      if (!t.passed) return finalize([]);
      return finalize([award(C.treasureBase, "TREASURE_ALERT_CLEAR", "お宝ゲット！コイン2倍！", C.treasureMultiplier)]);

    case "ARENA": {
      // 周回モード: 合否ではなく「最低正答率」を満たせば毎回もらえる（ただし1日の満額回数に上限）
      if (t.score < 0.6) return finalize([]);
      const plays = t.arenaPlaysToday ?? 0;
      const base = plays < C.arenaFullRewardPlaysPerDay ? C.arenaPlay : C.arenaPlayAfterCap;
      const coins = [award(base, "ARENA_PLAY", plays < C.arenaFullRewardPlaysPerDay ? "アリーナ周回ボーナス" : "アリーナ（本日の満額回数おわり）")];
      if (t.score === 1) coins.push(award(C.arenaPerfectBonus, "ARENA_PLAY", "パーフェクト！"));
      if (t.viaTreasureAlert) return finalize(coins.map((c) => award(c.amount, c.reason, c.labelJa, C.treasureMultiplier)));
      return finalize(coins);
    }
  }
}

/**
 * 連続学習ボーナス（いちばん大きな報酬）。その日はじめて学習したときに1回だけ呼ぶ。
 *   毎日 +min(連続日数, 10) / 7日ごと +50 / 30日ごと +300 とレアガチャ券1枚
 */
export function rewardForStreak(newStreakDays: number): Reward {
  const d = Math.floor(newStreakDays);
  if (d <= 0) return finalize([]);
  const coins = [award(Math.min(d, C.streakDailyMax), "STREAK_BONUS", `${d}日れんぞく！まいにちボーナス`)];
  if (d % C.streakBonusEvery === 0) coins.push(award(C.streakBonus, "STREAK_BONUS", `${d}日連続ボーナス！`));
  let tickets = 0;
  if (d % C.streakBigBonusEvery === 0) {
    coins.push(award(C.streakBigBonus, "STREAK_BONUS", `${d}日連続！だいボーナス！`));
    tickets = C.streakBigBonusRareTickets;
  }
  return finalize(coins, tickets);
}

/** 「きょうのまとめ」動画を最後まで見た。1日1回だけ（alreadyRewardedToday なら 0） */
export function rewardForRecap(input: { alreadyRewardedToday: boolean }): Reward {
  if (input.alreadyRewardedToday) return finalize([]);
  return finalize([award(C.recapWatched, "RECAP_WATCHED", "きょうの まとめを みた！")]);
}

/** レッスンさいごの AIキャラとの かいわを さいごまで やった。レッスンごとに1回だけ（alreadyRewarded なら 0） */
export function rewardForConversation(input: { finished: boolean; alreadyRewarded: boolean }): Reward {
  if (!input.finished || input.alreadyRewarded) return finalize([]);
  return finalize([award(C.conversationFinished, "CONVERSATION_FINISHED", "かいわ クリア！")]);
}

/** 2つの ごほうびを 1つに まとめる（表示用） */
export function mergeRewards(a: Reward, b: Reward): Reward {
  return finalize([...a.coins, ...b.coins], a.rareGachaTickets + b.rareGachaTickets);
}

/** 連続日数の更新（同日2回目は変化なし、1日空いたらリセット） */
export function nextStreak(prev: { streakDays: number; lastStudyDate: string | null }, today: string, daysBetween: (a: string, b: string) => number): number {
  if (!prev.lastStudyDate) return 1;
  const gap = daysBetween(prev.lastStudyDate, today);
  if (gap <= 0) return prev.streakDays;
  if (gap === 1) return prev.streakDays + 1;
  return 1;
}
