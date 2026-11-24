/**
 * 調整可能なゲームバランス定数。運営で調整する値はすべてここに集約する。
 */

export const CURRICULUM_RULES = {
  lessonsPerWorld: 30,
  miniTestEvery: 5,
  bossEvery: 30,
  checkQuestions: 6,
  miniQuestions: 15,
  bossQuestions: 30,
  arenaQuestions: 12,
  treasureQuestions: 6,
  checkPassRate: 0.8,
  miniPassRate: 0.8,
  bossPassRate: 0.75,
  arenaCoinMinScore: 0.6, // アリーナでコインがもらえる最低正答率（適当連打の防止）
  treasurePassRate: 0.8,
  lessonQuizPassRate: 0.7, // レッスン末の確認クイズ（完了条件）
} as const;

/**
 * コイン報酬表。
 * 「復習クエスト一発合格」が “1分あたり” 最もお得になるよう設計（目安所要時間で割った効率）。
 *   新しいレッスン  その日1〜3回目 10 / 4回目 6 / 5回目 4 / 6回目以降 2（約25分。一気にやるより毎日つづける方がお得）
 *   復習クエスト一発 30 coin / 約3分  = 10/分 ← 1分あたり一番お得
 *   まとめテスト    60 coin / 約8分  = 7.5/分（中ボーナス）
 *   ボス           300 coin + レアガチャ券（大ボーナス・一回きり）
 *   お宝アラート    基本報酬(20) × 2倍
 *   アリーナ        15 coin/回（1日5回まで満額、以降は3coin）
 *   連続学習（いちばん大きな報酬）: 毎日 +min(連続日数,10)、7日ごと +50、30日ごと +300＋レアガチャ券
 *   きょうのまとめ動画（任意）  5 coin / 約2〜3分。1日1回だけ（何本みても同じ）
 */
export const COIN_RULES = {
  /** 1日1回目のレッスン（互換用。= lessonCoinsByDailyIndex[0]） */
  lessonComplete: 10,
  /** その日の新しいレッスン k 回目（0始まり）のコイン。表より後ろは lessonCoinsAfterTable */
  lessonCoinsByDailyIndex: [10, 10, 10, 6, 4],
  lessonCoinsAfterTable: 2,
  dailyCheckFirstTry: 30,
  dailyCheckRetryPass: 5,
  miniTestFirstTry: 60,
  miniTestRetryPass: 20,
  bossFirstTry: 300,
  bossRetryPass: 150,
  bossRareTickets: 1,
  treasureBase: 20,
  treasureMultiplier: 2,
  arenaPlay: 15,
  arenaPlayAfterCap: 3,
  arenaFullRewardPlaysPerDay: 5,
  arenaPerfectBonus: 10,
  streakDailyMax: 10, // 毎日 +min(連続日数, 10)
  streakBonusEvery: 7, // 7日連続ごと
  streakBonus: 50,
  streakBigBonusEvery: 30, // 30日連続ごと
  streakBigBonus: 300,
  streakBigBonusRareTickets: 1,
  /** 「きょうのまとめ」動画を最後まで見た（1日1回まで） */
  recapWatched: 5,
} as const;

export const GACHA_RULES = {
  normalCost: 100,
  /** 通常ガチャの排出率 */
  normalRates: { COMMON: 0.78, RARE: 0.18, EPIC: 0.035, LEGENDARY: 0.005 },
  /** レアガチャ券（ボス合格）: RARE以上確定 */
  rareTicketRates: { COMMON: 0, RARE: 0.75, EPIC: 0.2, LEGENDARY: 0.05 },
} as const;

export const MEMORY_RULES = {
  initialStability: 1.0, // 初回学習直後: 約1日で想起率90%
  initialDifficulty: 5,
  targetRetention: 0.9,
  alertThreshold: 0.75, // 平均想起率がこれ未満のレッスンを「忘れかけ」とみなす
  urgentThreshold: 0.55, // これ未満なら必ずアラートを出す
  alertProbability: 0.6, // 通常はログイン時にこの確率でランダム表示（毎回出ると慣れてしまうため）
  ewmaAlpha: 0.35,
} as const;

export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "Asia/Tokyo";
