/**
 * 冒険のなかま（オリジナルキャラクター）。
 * 主人公ハルと仲間リコ・キコ、電撃系の相棒ビリモ。見た目は components/characters/CharacterArt.tsx の SVG。
 */
export type CharacterId = "haru" | "riko" | "kiko" | "birimo";

export interface CharacterDef {
  id: CharacterId;
  name: string;
  age?: number;
  role: string;
  /** ステータスボードでの肩書き */
  title: string;
  /** キャラのテーマカラー（枠やバッジ） */
  color: string;
  profile: string;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  haru: {
    id: "haru", name: "ハル", age: 10, role: "主人公", title: "ゆうしゃ見習い", color: "#e5484d",
    profile: "えいごの古代遺跡を探す10歳の男の子。こまっている人をほうっておけない。とくいわざは大きな声のあいさつ。",
  },
  riko: {
    id: "riko", name: "リコ", age: 8, role: "なかま", title: "フォニックス使い", color: "#ff8a3d",
    profile: "音を聞き分けるのがとくいな8歳の女の子。文字と音をくっつける「ブレンディングの呪文」で道をひらく。",
  },
  kiko: {
    id: "kiko", name: "キコ", age: 7, role: "なかま", title: "ことばコレクター", color: "#9b6bff",
    profile: "見つけた単語をノートに集める7歳の女の子。図鑑のモンスターとすぐなかよくなる。",
  },
  birimo: {
    id: "birimo", name: "ビリモ", role: "相棒", title: "でんげきナビゲーター", color: "#ffd23f",
    profile: "しっぽがいなずまの形をした、ふわふわの電撃モンスター。正解するとほっぺの星がピカッと光る。口ぐせは「〜ビリ！」。",
  },
};

export const PARTY: CharacterId[] = ["haru", "riko", "kiko"];

/** 5レッスン（= まとめテスト1回）ごとにレベルアップ */
export const LESSONS_PER_LEVEL = 5;

export function partyLevel(lessonsCleared: number) {
  const level = Math.floor(lessonsCleared / LESSONS_PER_LEVEL) + 1;
  const exp = lessonsCleared % LESSONS_PER_LEVEL;
  return { level, exp, expToNext: LESSONS_PER_LEVEL, expRate: exp / LESSONS_PER_LEVEL };
}
