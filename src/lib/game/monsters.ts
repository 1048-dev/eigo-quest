/**
 * 英語モンスター図鑑（全100体）。
 *
 * 10の「種族」（ドラゴン・神狼・甲獣・不死鳥・海竜・精霊・巨人・聖獣・鷲獅子・獅子王）×
 * 10の「属性」（炎・水・雷・森・光・闇・氷・大地・風・晶）＝100体を、決まったルールで生成する。
 * 絵は components/characters/MonsterArt.tsx が「種族の形」×「属性の色と光」で描く。
 *
 * どの関数も、知らない id や壊れた値を渡されても必ず有効なモンスターを返す（画面がクラッシュしない）。
 */

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export const RARITIES: readonly Rarity[] = ["LEGENDARY", "EPIC", "RARE", "COMMON"];

export type ElementId = "flame" | "tide" | "thunder" | "verdant" | "radiant" | "umbra" | "frost" | "terra" | "gale" | "crystal";
export type ArchetypeId = "dragon" | "wolf" | "behemoth" | "phoenix" | "leviathan" | "spirit" | "golem" | "unicorn" | "griffin" | "lion";

export interface ElementDef {
  id: ElementId;
  ja: string; // カタカナの名前
  kanji: string; // 称号用の一字
  en: string; // 英語名（名前の前半）
  word: string; // この属性で覚える英単語
  wordJa: string;
  main: string;
  light: string;
  dark: string;
  glow: string;
  weight: number; // レア度計算用
}

export interface ArchetypeDef {
  id: ArchetypeId;
  ja: string;
  en: string;
  kind: string; // 称号用（竜・狼 …）
  word: string;
  wordJa: string;
  weight: number;
}

export const ELEMENTS: readonly ElementDef[] = [
  { id: "flame", ja: "フレア", kanji: "炎", en: "Flame", word: "fire", wordJa: "火", main: "#e2461a", light: "#ffd27a", dark: "#4a0b03", glow: "#ff9a3c", weight: 5 },
  { id: "tide", ja: "タイド", kanji: "水", en: "Tide", word: "water", wordJa: "水", main: "#1f7fd1", light: "#b8f0ff", dark: "#051d40", glow: "#4fd8ff", weight: 5 },
  { id: "thunder", ja: "ボルト", kanji: "雷", en: "Volt", word: "thunder", wordJa: "かみなり", main: "#e0b419", light: "#fff6b0", dark: "#4a3503", glow: "#fff27a", weight: 6 },
  { id: "verdant", ja: "シルヴァ", kanji: "森", en: "Sylva", word: "forest", wordJa: "森", main: "#2f9a4e", light: "#c9ffb0", dark: "#082e14", glow: "#8dff9e", weight: 3 },
  { id: "radiant", ja: "ルミナ", kanji: "光", en: "Lumina", word: "light", wordJa: "光", main: "#e8c66a", light: "#fffbe6", dark: "#6b4f12", glow: "#fff2c2", weight: 9 },
  { id: "umbra", ja: "アンブラ", kanji: "闇", en: "Umbra", word: "shadow", wordJa: "かげ", main: "#4a2f7a", light: "#b89cff", dark: "#0b0518", glow: "#b07bff", weight: 9 },
  { id: "frost", ja: "フロスト", kanji: "氷", en: "Frost", word: "ice", wordJa: "氷", main: "#7fc6e6", light: "#ffffff", dark: "#173d5a", glow: "#c9f6ff", weight: 5 },
  { id: "terra", ja: "テラ", kanji: "地", en: "Terra", word: "earth", wordJa: "大地", main: "#9a6a3a", light: "#e8c79a", dark: "#261506", glow: "#ffb15e", weight: 3 },
  { id: "gale", ja: "ゲイル", kanji: "風", en: "Gale", word: "wind", wordJa: "風", main: "#3fbf9c", light: "#e0fff6", dark: "#0a3a30", glow: "#a8ffe6", weight: 4 },
  { id: "crystal", ja: "プリズム", kanji: "晶", en: "Prism", word: "crystal", wordJa: "水晶", main: "#c25fe0", light: "#ffe0ff", dark: "#2e0a3d", glow: "#ff9cf0", weight: 7 },
];

export const ARCHETYPES: readonly ArchetypeDef[] = [
  { id: "dragon", ja: "ドラゴン", en: "Dragon", kind: "竜", word: "dragon", wordJa: "竜", weight: 9 },
  { id: "wolf", ja: "フェンリル", en: "Fenrir", kind: "神狼", word: "wolf", wordJa: "おおかみ", weight: 5 },
  { id: "behemoth", ja: "ベヒモス", en: "Behemoth", kind: "甲獣", word: "armor", wordJa: "よろい", weight: 4 },
  { id: "phoenix", ja: "フェニックス", en: "Phoenix", kind: "不死鳥", word: "bird", wordJa: "鳥", weight: 8 },
  { id: "leviathan", ja: "リヴァイアサン", en: "Leviathan", kind: "海竜", word: "sea", wordJa: "海", weight: 8 },
  { id: "spirit", ja: "スピリット", en: "Spirit", kind: "精霊", word: "spirit", wordJa: "精霊", weight: 5 },
  { id: "golem", ja: "ゴーレム", en: "Golem", kind: "巨人", word: "stone", wordJa: "石", weight: 3 },
  { id: "unicorn", ja: "ユニコーン", en: "Unicorn", kind: "聖獣", word: "horn", wordJa: "つの", weight: 7 },
  { id: "griffin", ja: "グリフォン", en: "Griffin", kind: "鷲獅子", word: "wing", wordJa: "つばさ", weight: 6 },
  { id: "lion", ja: "レオ", en: "Leo", kind: "獅子王", word: "king", wordJa: "王さま", weight: 6 },
];

export interface MonsterDef {
  id: string; // "mon-001" …
  no: number; // 図鑑番号 1〜100
  nameJa: string; // 例: フレア・ドラゴン
  nameEn: string; // 例: Flame Dragon
  titleJa: string; // 二つ名（レア度で豪華になる）
  rarity: Rarity;
  element: ElementId;
  archetype: ArchetypeId;
  /** このモンスターで覚える英単語 */
  words: { en: string; ja: string }[];
  power: number; // ちから（演出用）
  theme: string; // DB 互換（属性 id）
  imageKey: string; // DB 互換（id と同じ）
}

/** レア度ごとのカードの格（フレーム・称号・星・演出） */
export const RARITY_STYLE: Record<Rarity, { frame: "bronze" | "gold" | "platinum" | "darkepic"; frameJa: string; gradeJa: string; stars: number; aura: boolean; holo: boolean }> = {
  COMMON: { frame: "bronze", frameJa: "ブロンズ", gradeJa: "通常種", stars: 1, aura: false, holo: false },
  RARE: { frame: "gold", frameJa: "ゴールド", gradeJa: "希少種", stars: 2, aura: false, holo: false },
  EPIC: { frame: "platinum", frameJa: "プラチナ", gradeJa: "英雄級", stars: 3, aura: true, holo: true },
  LEGENDARY: { frame: "darkepic", frameJa: "ダークエピック", gradeJa: "神話級", stars: 4, aura: true, holo: true },
};

/** レア度ごとの体数（合計100） */
export const RARITY_COUNTS: Record<Rarity, number> = { LEGENDARY: 6, EPIC: 14, RARE: 30, COMMON: 50 };

function titleFor(rarity: Rarity, el: ElementDef, ar: ArchetypeDef): string {
  switch (rarity) {
    case "LEGENDARY": return `${el.kanji}を統べる神話の${ar.kind}`;
    case "EPIC": return `${el.kanji}の守護${ar.kind}`;
    case "RARE": return `${el.kanji}をまとう${ar.kind}`;
    case "COMMON": return `${el.kanji}の${ar.kind}`;
  }
}

function buildCatalog(): MonsterDef[] {
  // 1) 全組み合わせを作り、(種族の格 + 属性の格) でレア度を決める（同点は図鑑番号順）
  const combos = ARCHETYPES.flatMap((ar, ai) => ELEMENTS.map((el, ei) => ({ ar, el, no: ai * 10 + ei + 1, score: ar.weight + el.weight })));
  const ranked = [...combos].sort((a, b) => b.score - a.score || a.no - b.no);
  const rarityOf = new Map<number, Rarity>();
  let k = 0;
  for (const r of RARITIES) {
    for (let n = 0; n < RARITY_COUNTS[r]; n++) rarityOf.set(ranked[k++].no, r);
  }
  // 2) 図鑑番号順に並べる
  return combos.map(({ ar, el, no, score }) => {
    const rarity = rarityOf.get(no) ?? "COMMON";
    const id = `mon-${String(no).padStart(3, "0")}`;
    return {
      id,
      no,
      nameJa: `${el.ja}・${ar.ja}`,
      nameEn: `${el.en} ${ar.en}`,
      titleJa: titleFor(rarity, el, ar),
      rarity,
      element: el.id,
      archetype: ar.id,
      words: [{ en: el.word, ja: el.wordJa }, { en: ar.word, ja: ar.wordJa }],
      power: 120 + score * 48 + (no % 7) * 11,
      theme: el.id,
      imageKey: id,
    };
  });
}

export const MONSTERS: readonly MonsterDef[] = buildCatalog();
export const MONSTER_COUNT = MONSTERS.length;

const BY_ID = new Map(MONSTERS.map((m) => [m.id, m]));
const ELEMENT_BY_ID = new Map(ELEMENTS.map((e) => [e.id, e]));
const ARCHETYPE_BY_ID = new Map(ARCHETYPES.map((a) => [a.id, a]));

export const findMonster = (archetype: ArchetypeId, element: ElementId): MonsterDef =>
  MONSTERS.find((m) => m.archetype === archetype && m.element === element) ?? MONSTERS[0];

/** 以前のモンスターID（m-…）から新しい図鑑への対応。古いデータや画面の参照もそのまま表示できる */
export const LEGACY_ALIASES: Record<string, string> = {
  "m-alpha-dragon": findMonster("dragon", "umbra").id,
  "m-tiger-tap": findMonster("lion", "flame").id,
  "m-penguin-pop": findMonster("phoenix", "frost").id,
  "m-magic-e-fairy": findMonster("spirit", "radiant").id,
  "m-shhh-ghost": findMonster("spirit", "umbra").id,
  "m-sammy-snake": findMonster("leviathan", "verdant").id,
  "m-ant-anty": findMonster("behemoth", "terra").id,
  "m-volt": findMonster("wolf", "thunder").id,
  "m-gold": findMonster("golem", "radiant").id,
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** どんな id でも必ずモンスターを返す（図鑑 id → 旧 id → それ以外は id から決まった1体） */
export function resolveMonster(id: string | null | undefined): MonsterDef {
  const key = typeof id === "string" ? id : "";
  return BY_ID.get(key) ?? BY_ID.get(LEGACY_ALIASES[key] ?? "") ?? MONSTERS[hash(key) % MONSTERS.length] ?? MONSTERS[0];
}

export function getMonster(id: string | null | undefined): MonsterDef | undefined {
  return typeof id === "string" ? BY_ID.get(id) : undefined;
}

export const elementOf = (m: MonsterDef): ElementDef => ELEMENT_BY_ID.get(m.element) ?? ELEMENTS[0];
export const archetypeOf = (m: MonsterDef): ArchetypeDef => ARCHETYPE_BY_ID.get(m.archetype) ?? ARCHETYPES[0];

export const monstersByRarity = (r: Rarity) => MONSTERS.filter((m) => m.rarity === r);

/** 演出用のおすすめ（キービジュアルなどで使う） */
export const FEATURED = {
  boss: findMonster("dragon", "umbra").id,
  guardian: findMonster("dragon", "radiant").id,
  phoenix: findMonster("phoenix", "flame").id,
  wolf: findMonster("wolf", "thunder").id,
  unicorn: findMonster("unicorn", "crystal").id,
  griffin: findMonster("griffin", "gale").id,
  lion: findMonster("lion", "flame").id,
  leviathan: findMonster("leviathan", "tide").id,
  golem: findMonster("golem", "terra").id,
  spirit: findMonster("spirit", "radiant").id,
  behemoth: findMonster("behemoth", "frost").id,
  shade: findMonster("spirit", "umbra").id,
} as const;
