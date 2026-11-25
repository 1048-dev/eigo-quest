/**
 * 年に1回の「力だめし」（run7 P-yearly）の データの形。
 * 問題は content/yearly/stage-N.json（ステージごとに 1 つ・すべて オリジナル）。ブラウザは 受ける ステージの JSON だけを あとから 読む。
 *
 * 4 つの 技能:
 *  - listening: 読み上げ（speechSynthesis）を きいて えらぶ。picture（絵＝絵文字を えらぶ）/ response（つづく ことばを えらぶ）/ dialog（会話の しつもん）/ passage（話の しつもん）
 *  - reading: 読んで えらぶ。vocab（ことば）/ grammar（文の かたち）/ conversation（会話の あなうめ）/ text（文章の しつもん。passageId で 文章を さす）
 *  - speaking: AI の キャラクターが きく → 子どもが 話す（マイク または 入力）。ルーブリックで 0〜4 点
 *  - writing: 書く（ステージ1 は 絵を みて ことばを 書く・ステージ2 以上は 文・メールの 返事・意見文）
 */

export type YearlySkill = "listening" | "reading" | "speaking" | "writing";
export const YEARLY_SKILLS: readonly YearlySkill[] = ["listening", "reading", "speaking", "writing"];

export type ListeningFormat = "picture" | "response" | "dialog" | "passage";
export type ReadingFormat = "vocab" | "grammar" | "conversation" | "text";

export interface AudioLine {
  /** A / B = 会話の ふたり、N = ナレーター */
  speaker: "A" | "B" | "N";
  en: string;
}

export interface ChoiceItem {
  /** "y2-l03"（listening）/ "y2-r07"（reading） */
  id: string;
  skill: "listening" | "reading";
  format: ListeningFormat | ReadingFormat;
  /** listening: 読み上げる 英語（2回まで きける） */
  audio?: AudioLine[];
  /** reading の text: どの 文章の しつもんか */
  passageId?: string;
  /** 画面に 出す 英語（しつもん・あなうめの 文。listening の dialog / passage では しつもんも 読み上げる）。空欄は ( ) */
  prompt?: string;
  /** 日本語の 小さな ヒント（ステージ1〜2 だけ・答えは 書かない） */
  promptJa?: string;
  /** 選択肢（英語。picture は 絵文字） */
  choices: string[];
  /** picture の 選択肢の 読み上げ用の ことば（画面には 出さない） */
  alt?: string[];
  /** 正解の 位置（0始まり） */
  answer: number;
}

export interface ReadingPassage {
  id: string;
  /** notice（おしらせ）/ email / story / article / chart など（表示の かざり） */
  kind: string;
  title: string;
  lines: string[];
}

export type SpeakingKind = "intro" | "question" | "picture" | "readAloud" | "opinion" | "followUp";

export interface SpeakingPrompt {
  id: string;
  kind: SpeakingKind;
  /** AI の キャラクターが 言う ことば（読み上げ） */
  askEn: string;
  askJa: string;
  /** picture: 絵（絵文字の ならび）と その 説明（採点用） */
  picture?: { emoji: string; descriptionEn: string };
  /** readAloud: 音読する 文 */
  readText?: string;
  /** この こたえに 出てきてほしい ことば（ルール採点の「内容」） */
  keywords: string[];
  /** めやすの 語数（これ以上で「長さ」満点） */
  minWords: number;
  /** お手本の こたえ（結果画面に 出す） */
  sample: string;
}

export interface WritingWordItem {
  emoji: string;
  /** 正しい つづり（小文字） */
  answer: string;
  hintJa: string;
}

export type WritingKind = "words" | "sentences" | "email" | "opinion";

export interface WritingTask {
  kind: WritingKind;
  promptEn: string;
  promptJa: string;
  /** words（ステージ1）: 絵を みて ことばを 書く */
  items?: WritingWordItem[];
  /** email: 返事を 書く メール */
  email?: string[];
  /** sentences: 文の 数の めやす */
  targetSentences?: number;
  minWords?: number;
  maxWords?: number;
  keywords?: string[];
  sample: string;
}

export interface YearlyTest {
  stage: number;
  /** ねらいの レベル（表示用 "Pre-A1 → A1" など） */
  levelJa: string;
  minutes: number;
  titleJa: string;
  /** AI の しけんかん（キャラクター） */
  character: "haru" | "riko" | "kiko" | "birimo";
  listening: ChoiceItem[];
  passages: ReadingPassage[];
  reading: ChoiceItem[];
  speaking: { introEn: string; introJa: string; prompts: SpeakingPrompt[] };
  writing: WritingTask;
}

// ---------------------------------------------------------------------------
// こたえ・採点
// ---------------------------------------------------------------------------
export interface YearlyAnswers {
  /** itemId → えらんだ 位置 */
  choices: Record<string, number>;
  /** promptId → 話した ことば（音声認識 または 入力） */
  speaking: Record<string, string>;
  /** writing: 文・メール・意見文 */
  writingText?: string;
  /** writing（words）: 1つずつの ことば */
  writingWords?: string[];
}

/** 0〜4 点の 評価（スピーキング 1 問・ライティング） */
export interface RubricScore {
  score: number;
  max: number;
  /** ひらがな 多めの みじかい コメント */
  commentJa: string;
}

export interface SkillScores {
  listening: number;
  reading: number;
  speaking: number;
  writing: number;
}

export interface YearlyResultDetail {
  /** itemId → 正解か */
  choices: Record<string, boolean>;
  speaking: Record<string, RubricScore & { text: string }>;
  writing: RubricScore & { text: string };
}

export interface YearlyResult {
  stage: number;
  takenOn: string;
  /** 技能ごと 0〜100 */
  scores: SkillScores;
  /** 重みつきの 合計 0〜100 */
  total: number;
  /** 推定 CEFR バンド */
  band: string;
  /** ステージを こえて くらべる「ちから スコア」（技能ごと と 合計） */
  scaled: SkillScores & { total: number };
  gradedBy: "rule" | "ai";
  detail: YearlyResultDetail;
}

/** 前回からの のび */
export interface YearlyGrowth {
  previousTakenOn: string;
  previousStage: number;
  previousBand: string;
  /** ちから スコアの さ（技能ごと と 合計） */
  delta: SkillScores & { total: number };
  /** バンドが いくつ あがったか（さがったら マイナス） */
  bandSteps: number;
}
