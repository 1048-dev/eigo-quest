/**
 * 力だめしの ステージごとの 形（docs/curriculum-6year.md §8）。問題の 数・形式・選択肢の 数・ライティングの 種類。
 * データの チェック（validate.ts）と 画面の 説明で 使う。
 */
import type { ListeningFormat, ReadingFormat, SpeakingKind, WritingKind } from "./types";

export interface YearlyStageSpec {
  stage: number;
  minutes: number;
  listening: number;
  reading: number;
  /** 選択肢の 数（ステージ1 は 3、ステージ2 以上は 3 か 4） */
  choiceCounts: readonly number[];
  listeningFormats: readonly ListeningFormat[];
  readingFormats: readonly ReadingFormat[];
  speakingPrompts: readonly [number, number];
  /** かならず ふくむ スピーキングの 種類 */
  speakingMust: readonly SpeakingKind[];
  writing: WritingKind;
  /** 書く 量の めやす（表示用） */
  writingJa: string;
  formatJa: { listening: string; reading: string; speaking: string; writing: string };
}

export const YEARLY_SPECS: readonly YearlyStageSpec[] = [
  {
    stage: 1, minutes: 15, listening: 10, reading: 10, choiceCounts: [3],
    listeningFormats: ["picture", "response"], readingFormats: ["vocab", "grammar", "conversation"],
    speakingPrompts: [3, 3], speakingMust: ["intro", "question"], writing: "words", writingJa: "絵を みて ことばを 3つ",
    formatJa: { listening: "きいて 絵を えらぶ", reading: "ことばと みじかい 文", speaking: "AI に じこしょうかいと 2 つの しつもん", writing: "絵を みて ことばを 書く" },
  },
  {
    stage: 2, minutes: 20, listening: 15, reading: 15, choiceCounts: [3, 4],
    listeningFormats: ["picture", "response", "dialog"], readingFormats: ["vocab", "grammar", "conversation", "text"],
    speakingPrompts: [4, 4], speakingMust: ["picture", "question"], writing: "sentences", writingJa: "3 文",
    formatJa: { listening: "絵・会話の つづき・会話の しつもん", reading: "会話文・おしらせ", speaking: "絵の 説明 ＋ しつもん 3 つ", writing: "じぶんの ことを 3 文" },
  },
  {
    stage: 3, minutes: 25, listening: 20, reading: 15, choiceCounts: [3, 4],
    listeningFormats: ["response", "dialog", "passage"], readingFormats: ["vocab", "grammar", "conversation", "text"],
    speakingPrompts: [4, 4], speakingMust: ["readAloud", "picture", "question"], writing: "email", writingJa: "5 文の メールの 返事",
    formatJa: { listening: "会話の つづき・会話と 話の しつもん", reading: "メール・物語", speaking: "音読 ＋ 絵の 説明 ＋ じぶんの こと", writing: "メールの 返事（5 文）" },
  },
  {
    stage: 4, minutes: 30, listening: 20, reading: 15, choiceCounts: [4],
    listeningFormats: ["response", "dialog", "passage"], readingFormats: ["vocab", "grammar", "conversation", "text"],
    speakingPrompts: [4, 4], speakingMust: ["readAloud", "opinion", "followUp"], writing: "opinion", writingJa: "意見文 50〜60 語",
    formatJa: { listening: "会話の つづき・会話と 話の しつもん", reading: "説明文", speaking: "意見 ＋ 理由", writing: "意見文（50〜60 語）" },
  },
  {
    stage: 5, minutes: 35, listening: 25, reading: 15, choiceCounts: [4],
    listeningFormats: ["response", "dialog", "passage"], readingFormats: ["vocab", "grammar", "conversation", "text"],
    speakingPrompts: [4, 5], speakingMust: ["opinion", "followUp"], writing: "opinion", writingJa: "意見文 80〜100 語",
    formatJa: { listening: "会話の つづき・会話と 話の しつもん", reading: "記事・資料", speaking: "意見 ＋ 理由 ＋ 例・追加の しつもん", writing: "意見文（80〜100 語）" },
  },
];

export const YEARLY_STAGES = YEARLY_SPECS.map((s) => s.stage);

export function yearlySpec(stage: number): YearlyStageSpec {
  return YEARLY_SPECS.find((s) => s.stage === stage) ?? YEARLY_SPECS[0];
}
