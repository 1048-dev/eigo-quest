/**
 * えいごの としょかん（レッスンの外の 毎日の インプット）の データの形。
 * データは content/library/ の JSON（ステージごとに わけた おはなし・チャンツ・フリートークの テーマ）。
 * ブラウザは 小さな 索引（index.json）だけ さきに 読み、本文は ひらいたときに あとから 読む。
 */

export interface LibraryLine {
  en: string;
  ja: string;
}

export interface StoryQuestion {
  /** 英語の しつもん（読み上げ用） */
  q: string;
  qJa: string;
  /** 3つの 選択肢（英語） */
  choices: string[];
  /** 正解の 位置（0始まり） */
  answer: number;
}

export interface Story {
  id: string;
  stage: number;
  level: string;
  /** この レッスンを クリアしたら ひらく（0 = さいしょから） */
  unlockLesson: number;
  emoji: string;
  title: string;
  titleJa: string;
  lines: LibraryLine[];
  /** あたらしい ことば（2〜5%） */
  words: LibraryLine[];
  questions: StoryQuestion[];
}

export interface Chant {
  id: string;
  stage: number;
  unlockLesson: number;
  emoji: string;
  title: string;
  titleJa: string;
  /** なにを おぼえる チャンツか（表示用） */
  focusJa: string;
  lines: LibraryLine[];
}

export type TalkCharacter = "haru" | "riko" | "kiko" | "birimo";

export interface TalkTheme {
  id: string;
  stage: number;
  unlockLesson: number;
  emoji: string;
  character: TalkCharacter;
  titleJa: string;
  scene: string;
  sceneJa: string;
  starterEn: string;
  goalJa: string;
  targetExpressions: string[];
  lines: { speaker: string; en: string; ja: string }[];
}

/** 索引の 1行（本文なし） */
export interface StoryMeta {
  id: string;
  stage: number;
  level: string;
  unlockLesson: number;
  emoji: string;
  title: string;
  titleJa: string;
  wordCount: number;
  /** 読んで クイズまで やる めやすの 分 */
  minutes: number;
}

export interface ChantMeta {
  id: string;
  stage: number;
  unlockLesson: number;
  emoji: string;
  title: string;
  titleJa: string;
  focusJa: string;
}

export interface TalkMeta {
  id: string;
  stage: number;
  unlockLesson: number;
  emoji: string;
  character: TalkCharacter;
  titleJa: string;
}

export interface LibraryIndex {
  note?: string;
  stories: StoryMeta[];
  chants: ChantMeta[];
  talks: TalkMeta[];
}

export type LibraryKind = "story" | "chant" | "talk";
