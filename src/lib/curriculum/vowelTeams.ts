/**
 * 母音チーム（ワールド7〜8）の「おと」の表。import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * つづりと おとは 1対1 では ない:
 *   - oo は moon の「ウー」と book の「ウ」
 *   - ow は snow の「オウ」（ワールド7）と cow の「アウ」（ワールド8）
 * どちらの おとかは ことばで きまるので、ことばの 表（OO_SHORT_WORDS / OW_AU_WORDS）で 見分ける。
 */

/** 母音チームの つづりと、はじめて ならう レッスン（それより前の 回の 問題の 選択肢には 出さない） */
export const VOWEL_TEAM_INTRO: Record<string, number> = {
  ai: 181, ay: 183, ee: 186, ea: 191, oa: 196, ow: 201,
  oo: 211, ou: 216, oi: 226, oy: 228, igh: 231, ie: 233,
};
export const VOWEL_TEAMS = Object.keys(VOWEL_TEAM_INTRO);

/** おなじ おとに なる つづりの グループ（ow は 2つの グループに 入る） */
export const VOWEL_TEAM_GROUPS = [["ai", "ay"], ["ee", "ea"], ["oa", "ow"], ["oo"], ["ou", "ow"], ["oi", "oy"], ["igh", "ie"]] as const;

/** おとの めやす（カタカナ）。こどもに 見せる 解説で つかう */
export type TeamSound = "エイ" | "イー" | "オウ" | "ウー" | "ウ" | "アウ" | "オイ" | "アイ";

/** book の「ウ」と よむ oo の ことば（それ以外の oo は moon の「ウー」） */
export const OO_SHORT_WORDS = new Set([
  "book", "look", "cook", "good", "foot", "wood", "hook", "wool", "took", "stood", "hood", "shook", "brook",
  "football", "notebook", "cookbook", "goodbye", "wooden", "cookie", "woodland",
]);
/** cow の「アウ」と よむ ow の ことば（それ以外の ow は snow の「オウ」） */
export const OW_AU_WORDS = new Set([
  "cow", "how", "now", "wow", "town", "down", "brown", "crown", "gown", "frown", "clown", "drown", "owl", "howl", "growl",
  "flower", "tower", "power", "shower", "towel", "vowel", "crowd", "allow", "plow", "cowboy", "downtown", "sunflower",
]);

const base = (word: string) => {
  const w = word.toLowerCase();
  return w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
};
const inSet = (set: Set<string>, word: string) => set.has(word.toLowerCase()) || set.has(base(word));

/** その ことばの 中で、つづり team が どの おとに なるか */
export function teamSound(team: string, word: string): TeamSound {
  switch (team) {
    case "ai": case "ay": return "エイ";
    case "ee": case "ea": return "イー";
    case "oa": return "オウ";
    case "ow": return inSet(OW_AU_WORDS, word) ? "アウ" : "オウ";
    case "oo": return inSet(OO_SHORT_WORDS, word) ? "ウ" : "ウー";
    case "ou": return "アウ";
    case "oi": case "oy": return "オイ";
    default: return "アイ"; // igh, ie
  }
}

/** つづりが なりうる おと（選択肢で おなじ おとの つづりを 2つ 出さない ために つかう） */
export function possibleSounds(team: string): TeamSound[] {
  if (team === "ow") return ["オウ", "アウ"];
  if (team === "oo") return ["ウー", "ウ"];
  return [teamSound(team, "")];
}

/** くらべる みじかい母音（つづりの 1もじめ: rain ↔ a、night ↔ i） */
export const shortVowelOf = (team: string) => team[0];

/**
 * フォーカスの ボタンを おしたときの 読み上げ。つづりのままだと "ai" を「エーアイ」と よんでしまうので おとで よむ。
 * ow と oo は その回の ことばで おとを きめる（cow の回は "ow"、snow の回は "oh"。book だけの回は ことばを そのまま よむ）。
 */
export function focusSay(focus: string, words: readonly string[] = []): string {
  const withF = words.filter((w) => w.toLowerCase().includes(focus));
  switch (focus) {
    case "ai": case "ay": return "ay";
    case "ee": case "ea": return "ee";
    case "oa": return "oh";
    case "ow": return withF.length > 0 && withF.every((w) => teamSound("ow", w) === "アウ") ? "ow" : "oh";
    case "oo": return withF.length > 0 && withF.every((w) => teamSound("oo", w) === "ウ") ? withF[0] : "oo";
    case "ou": return "ow";
    case "oi": case "oy": return "oy";
    case "igh": case "ie": return "eye";
    default: return focus.replace(/^-/, "").replace(/_/g, " ");
  }
}
