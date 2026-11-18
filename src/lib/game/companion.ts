/**
 * 相棒ビリモのセリフ選び（純粋関数）。
 * 冒険の状況（今日のクエスト・連続日数・お宝アラート・苦手な力）から、子どもが次にやることが分かる一言を返す。
 */
import type { Skill } from "@/lib/domain/types";

export type Mood = "happy" | "excited" | "sleepy" | "cheer" | "worried";

export interface CompanionInput {
  playerName: string;
  streakDays: number;
  coins: number;
  lessonsCleared: number;
  /** マップの現在ノード */
  current?: { type: "LESSON" | "CHECK" | "MINI" | "BOSS"; status: string; lessonNo: number } | null;
  hasTreasureAlert?: boolean;
  /** ダッシュボード用: いちばん低い力 */
  weakestSkill?: Skill | null;
  /** 0〜23 */
  hour?: number;
}

export interface CompanionLine {
  text: string;
  mood: Mood;
}

const SKILL_TIPS: Record<Skill, string> = {
  SCHOOL_TEST: "学校テストの力がのびしろビリ！文のはじめの大文字に気をつけようビリ。",
  PHONICS: "フォニックスをきたえようビリ！音をつなげて読むとどんどん強くなるビリ。",
  LISTENING: "リスニングの反射神経をきたえるなら、スピードリスニングがおすすめビリ！",
  SPEAKING: "発音にチャレンジビリ！マイクにむかって大きな声で言ってみてビリ。",
  VOCABULARY: "ことばをもっと集めようビリ！アリーナでわすれかけの単語をつかまえるビリ。",
  WRITING: "書く力をみがこうビリ！4本線の3本目に文字をのせるのがコツビリ。",
};

export function companionLine(i: CompanionInput): CompanionLine {
  const name = i.playerName;
  if (i.hasTreasureAlert) {
    return { mood: "excited", text: `${name}、お宝のにおいがするビリ！わすれかけの単語をクリアするとコイン2倍ビリ！` };
  }
  const c = i.current;
  if (c?.status === "WAIT_TOMORROW") {
    return { mood: "sleepy", text: `今日の冒険はここまでビリ…。あしたの復習クエストに一発合格すると30コインもらえるビリ！` };
  }
  if (c?.type === "BOSS") {
    return { mood: "excited", text: `ついにボスのいる遺跡ビリ！1〜30の総まとめ、みんなの力をあわせてたおすビリ！` };
  }
  if (c?.type === "MINI") {
    return { mood: "cheer", text: `宝箱のまとめテストビリ！何回でもちょうせんできるから、こわくないビリ。` };
  }
  if (c?.type === "CHECK") {
    return { mood: "cheer", text: `Lesson ${c.lessonNo} の復習クエストビリ！おぼえてるかな？一発クリアで30コイン、いちばんお得ビリ！` };
  }
  if (i.weakestSkill) {
    return { mood: "worried", text: SKILL_TIPS[i.weakestSkill] };
  }
  if (i.streakDays >= 7) {
    return { mood: "happy", text: `${i.streakDays}日れんぞくビリ！${name}はほんものの冒険者ビリ！` };
  }
  if (i.lessonsCleared === 0) {
    return { mood: "happy", text: `${name}、冒険のはじまりビリ！まずは Lesson 1 で「Look! Stop! Come here! Go!」をおぼえるビリ！` };
  }
  if (c?.type === "LESSON") {
    const greet = i.hour != null && i.hour < 11 ? "おはようビリ！" : i.hour != null && i.hour >= 18 ? "こんばんはビリ！" : "やあビリ！";
    return { mood: "happy", text: `${greet} 今日は Lesson ${c.lessonNo} を探検するビリ。30分でクリアできるビリ！` };
  }
  return { mood: "happy", text: `いつでもアリーナでコインをかせげるビリ！いまは ${i.coins} コイン持ってるビリ。` };
}

/** オフラインモード（内蔵データで表示中）のセリフ。こわがらせず、そのまま遊べることを伝える */
export const OFFLINE_LINE: CompanionLine = {
  mood: "happy",
  text: "いまは おためしモードで あそべるビリ！Lesson 1 から ぼうけんしてみようビリ！",
};
