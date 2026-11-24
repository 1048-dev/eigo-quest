/**
 * r の つく母音（ワールド9）の「おと」の表。import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * - ar は car の「アー」（くちを おおきく）
 * - or は fork の「オー」
 * - er / ir / ur は 3つとも おなじ おと（her / bird / turn の「ア～」。くちを ちいさく して したを まるめる）
 * - air は hair の「エア」、ear は ear の「イア」
 *
 * ear の ことばの 中には ar が、air の ことばの 中には ai が 見えるので、
 * ことばを 左から よんで いちばん ながい つづり（air・ear → ar・or・er・ir・ur）を とる（findRSpellings）。
 * r の あとに 母音が つづく とき（here, hero, orange）は r の つく母音に しない＝ワールド9の ことばには つかわない。
 */

/** r の つく母音の つづりと、はじめて ならう レッスン（それより前の 回の 問題の 選択肢には 出さない） */
export const R_VOWEL_INTRO: Record<string, number> = {
  ar: 241, or: 246, er: 251, ir: 252, ur: 253, air: 256, ear: 258,
};
export const R_VOWELS = Object.keys(R_VOWEL_INTRO);

/** おとの めやす（カタカナ）。ar の「アー」と er の「ア～」は くちの かたちで 分ける */
export type RSound = "アー" | "オー" | "ア～" | "エア" | "イア";

/** おなじ おとに なる つづりの グループ */
export const R_VOWEL_GROUPS = [["ar"], ["or"], ["er", "ir", "ur"], ["air"], ["ear"]] as const;

export function rSound(spelling: string): RSound {
  switch (spelling) {
    case "ar": return "アー";
    case "or": return "オー";
    case "air": return "エア";
    case "ear": return "イア";
    default: return "ア～"; // er, ir, ur
  }
}

/** こどもに 見せる 解説の ひとこと（くちの かたち） */
export const R_MOUTH: Record<RSound, string> = {
  "アー": "くちを おおきく あけて",
  "オー": "くちを まるく して",
  "ア～": "くちを ちいさく して したを まるめて",
  "エア": "「エ」から したを まるめて",
  "イア": "「イ」から したを まるめて",
};

/** ことばの 中の r の つく母音（左から、ながい つづりを 先に。r の あとが 母音なら かぞえない） */
export function findRSpellings(word: string): string[] {
  const re = /(air|ear|ar|or|er|ir|ur)(?![aeiou])/g;
  return [...word.toLowerCase().matchAll(re)].map((m) => m[1]);
}

/** くらべる みじかい母音（つづりの 1もじめ: car ↔ a、bird ↔ i、hair ↔ a、ear ↔ e） */
export const shortVowelOfR = (spelling: string) => spelling[0];

/**
 * フォーカスの ボタンを おしたときの 読み上げ。"ar" を「エー・アール」と よまない ように、おとが おなじ ことばで よむ。
 * er / ir / ur は おなじ おとなので どれも "er"。
 */
export const R_SAY: Record<string, string> = { ar: "are", or: "or", er: "er", ir: "er", ur: "er", air: "air", ear: "ear" };
