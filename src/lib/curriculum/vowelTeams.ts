/**
 * 母音チーム（ワールド7〜8）の「おと」の表。純粋な データ（import は おなじく 純粋な ./rControlled と ./w10Phonics だけ）なので、レッスン画面（クライアント）からも使える。
 *
 * つづりと おとは 1対1 では ない:
 *   - oo は moon の「ウー」と book の「ウ」
 *   - ow は snow の「オウ」（ワールド7）と cow の「アウ」（ワールド8）
 * どちらの おとかは ことばで きまるので、ことばの 表（OO_SHORT_WORDS / OW_AU_WORDS）で 見分ける。
 */
import { R_SAY } from "./rControlled";
import { w10Say } from "./w10Phonics";
import { w11Say } from "./w11Phonics";
import { w12Say } from "./w12Phonics";
import { w19Say } from "./w19Phonics";
import { w20Say } from "./w20Phonics";
import { w21Say } from "./w21Phonics";
import { w22Say } from "./w22Phonics";
import { w23Say } from "./w23Phonics";
import { w24Say } from "./w24Phonics";
import { w25Say } from "./w25Phonics";
import { w26Say } from "./w26Phonics";
import { w27Say } from "./w27Phonics";
import { w28Say } from "./w28Phonics";
import { w29Say } from "./w29Phonics";
import { w30Say } from "./w30Phonics";
import { w31Say } from "./w31Phonics";
import { w32Say } from "./w32Phonics";
import { w33Say } from "./w33Phonics";
import { w34Say } from "./w34Phonics";
import { w35Say } from "./w35Phonics";

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
  // ワールド35 は その回の ことば・文で よむ（"-ity" "inter" "spect" だけで よまない。対比の 強勢は 文を よむ）
  const w35 = w35Say(focus, words);
  if (w35) return w35;
  // ワールド34 は その回の ことばで よむ（"vis" "mm" "-ize" だけで よまない。数字は 英語の 読みかた: Flight 205 → Flight two oh five）
  const w34 = w34Say(focus, words);
  if (w34) return w34;
  // ワールド33 は その回の ことば・文で よむ（"rupt" "-ance" "and" "or" だけで よまない。英字と スペース だけ）。
  // リストの "or" を ワールド9 の r の つく母音（or）で よまない ように、R_SAY より 先に みる（ワールド33 の 回の ことば だけで はたらく）
  const w33 = w33Say(focus, words);
  if (w33) return w33;
  if (R_SAY[focus]) return R_SAY[focus]; // r の つく母音（ワールド9）
  // ワールド32 は その回の ことばで よむ（"geo" "-al" だけで よまない。数は 1/2 → one half）
  const w32 = w32Say(focus, words);
  if (w32) return w32;
  // ワールド31 は その回の ことばで よむ（"-tion" "struct" だけで よまない。年号は 1868 → eighteen sixty-eight）
  const w31 = w31Say(focus, words);
  if (w31) return w31;
  // ワールド30 は その回の ことば・文で よむ（"auto-" "-ic" だけで よまない。略語は km → kilometers）
  const w30 = w30Say(focus, words);
  if (w30) return w30;
  // ワールド29 は その回の ことば・文で よむ（"spect" "can" "-ible" だけで よまない）
  const w29 = w29Say(focus, words);
  if (w29) return w29;
  // ワールド28 は その回の ことば・文・フレーズで よむ（"to" や "-ness" だけで よまない）
  const w28 = w28Say(focus, words);
  if (w28) return w28;
  // ワールド27 は その回の ことば・フレーズで よむ（"ch" を「チ」、"-able" を「エイブル」だけで よまない）
  const w27 = w27Say(focus, words);
  if (w27) return w27;
  // ワールド26 は その回の セリフ・文・ことばで よむ（"…" や '"' や "-ed" を そのまま よまない）
  const w26 = w26Say(focus, words);
  if (w26) return w26;
  // ワールド25 の -ness・-ive は その回の ことばで よむ（ワールド21 の -ness より 先）
  const w25 = w25Say(focus, words);
  if (w25) return w25;
  // ワールド24 の 過去分詞の おわり・I've / haven't / she's・over- / under-・im- / in- は その回の ことばで よむ
  const w24 = w24Say(focus, words);
  if (w24) return w24;
  // ワールド23 の micro-・-scope・-meter・thermo-・-ment・-y・-tion は その回の ことばで よむ（ワールド10 の -y より 先）
  const w23 = w23Say(focus, words);
  if (w23) return w23;
  const w10 = w10Say(focus, words); // soft c / g・-y・-le・aw au ew（ワールド10）
  if (w10) return w10;
  const w11 = w11Say(focus, words); // -ed・-er・-est（ワールド11）
  if (w11) return w11;
  const w12 = w12Say(focus); // "bas-ket-ball" は ことば まるごと（ワールド12。L116〜144 の "sun-set" も おなじ）
  if (w12) return w12;
  // ワールド18 の -ly・-ful・-less・un- は その回の ことばで よむ（「ハイフン エル ワイ」と よまない）
  if (/^-(ly|ful|less)$/.test(focus)) {
    const hit = words.find((w) => w.toLowerCase().endsWith(focus.slice(1)));
    if (hit) return hit;
  }
  if (focus === "un-") {
    const hit = words.find((w) => w.toLowerCase().startsWith("un"));
    if (hit) return hit;
  }
  // ワールド22 の -ist・-ous・-al は その回の ことばで、おわりの しるしの 回は フレーズで よむ
  const w22 = w22Say(focus, words);
  if (w22) return w22;
  // ワールド21 の dis-・mis-・pre-・tele-・phone・graph・photo-・-ment・-ness は その回の ことばで、音の つながりは フレーズで よむ
  const w21 = w21Say(focus, words);
  if (w21) return w21;
  // ワールド20 の -ure・eer は その回の ことばで よむ
  const w20 = w20Say(focus, words);
  if (w20) return w20;
  // ワールド19 の re-・-or・-stle・gu・squ・ough と、いろいろな おとの ou は その回の ことばで よむ
  const w19 = w19Say(focus, words);
  if (w19) return w19;
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
