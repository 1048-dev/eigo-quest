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
 *   お宝アラート    基本報酬(12) × 2倍 = 24 coin（復習クエスト一発の30より少なくする＝毎日の復習がいちばんお得）
 *   アリーナ        15 coin/回（1日5回まで満額、以降は3coin）
 *   連続学習（いちばん大きな報酬）: 毎日 +min(連続日数,10)、7日ごと +50、30日ごと +300＋レアガチャ券
 *   AIキャラとの かいわを さいごまで  5 coin（レッスンごとに1回だけ）
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
  treasureBase: 12,
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
  /** レッスンさいごの AIキャラとの かいわを さいごまで やった（レッスンごとに1回だけ） */
  conversationFinished: 5,
  /** えいごの としょかん（おはなし・チャンツ・フリートーク）。1日1回だけ（何を いくつ やっても 同じ） */
  libraryDaily: 5,
} as const;

/**
 * えいごの としょかん（run7 P-library）。
 *  - おはなし: 3問の うち storyPassCorrect 問 以上 正解で「よめた！」（ごほうびの 対象）
 *  - チャンツ: さいごまで きいた（まねした）ら 対象
 *  - フリートーク: talkMinTurns 回 以上 話したら 対象。ひらくのは ステージ1 の ワールド4 から（Lesson 90 クリア）
 */
export const LIBRARY_RULES = {
  storyPassCorrect: 2,
  talkMinTurns: 3,
  freeTalkUnlockLesson: 90,
} as const;

/**
 * 年に1回の 力だめし（run7 P-yearly・docs/curriculum-6year.md §8）。
 *  - 合計は 4 技能の 重みつき平均。会話の 力を いちばん だいじに するので スピーキングを 重く する
 *  - どの ステージの 問題を 受けるか: そのステージに 入って stageEntryMargin レッスン（2 ワールド）すすんだら その ステージ
 *  - ちから スコア: ステージを こえて のびを くらべる 目もり。(ステージ − 1) × scaledStageOffset ＋ 点数(0〜100) × scaledPerPercent
 *    （となりの ステージと 50 点ぶん かさなる: ステージ1 の 満点 200 ＝ ステージ2 の 25 点）
 *  - バンドの スピーキングの 条件: そのステージの いちばん上の バンドは スピーキング speakingTopBandMin 点 以上。
 *    スピーキングが speakingLowDrop 点 未満なら 1 段 さげる
 *  - 受けられるのは 1 年に 1 回（前回の 日から 1 年後の 同じ日から）。おためしは 1 回だけ
 */
export const YEARLY_RULES = {
  weights: { listening: 0.25, reading: 0.25, speaking: 0.3, writing: 0.2 },
  stageEntryMargin: 60,
  scaledStageOffset: 150,
  scaledPerPercent: 2,
  speakingTopBandMin: 60,
  speakingLowDrop: 25,
  /** listening の 1問を きける 回数 */
  playsPerItem: 2,
  /** 子どもの こたえを 保存・AI に 送る ときの 長さの 上限 */
  answerMaxChars: 1200,
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
