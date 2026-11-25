/**
 * ワールド20（まつりの島・L571〜600）の フォニックス・つづり の表。import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - -ure（picture, treasure, pure）: 「この ことばの ure は どの おと？」（チャー / ジャー / ユア。t の あと・s の あと・それ いがい）
 * - ear / eer（near, cheer, deer）: 「イア」の ことばは「＿ に はいる つづりは？」（ch＿（おうえんする）→ eer / ear / ere / ier）。
 *   「イア」では ない ear（bear の「エア」・learn の「アー」）は「この ことばの ear は どの おと？」（イア / エア / アー）
 * - あいまい母音（about, banana, lemon）: 「よわい『ア』の ところに はいる もじは？」（＿bout → a / u / e / o）
 * - ステージ2 の つづりの まとめ（-tch -dge -tion・だまっている もじ・-ed・-ing）は まえの ワールドの 問題を そのまま つかう
 *   （questions.ts の w13Question・w17Question・w14Question・w19Question・w16Question・w15Question）。
 *
 * focus の かきかた: "-ure"、"ear" "eer"、あいまい母音は "a-bout" "ba-na-na" の ような はくの まとまり。
 * どれも 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */

/** ワールド20 が はじまる レッスン（それより前の 回では ワールド20 の 問題に しない） */
export const W20_START = 571;

export const W20_URE_FOCUS = "-ure";
export const W20_EAR_FOCUS = ["ear", "eer"] as const;

// ---------------------------------------------------------------------------
// -ure
// ---------------------------------------------------------------------------

/** -ure の おと: picture の「チャー」・treasure の「ジャー」・pure の「ユア」 */
export type UreSound = "チャー" | "ジャー" | "ユア";
export const URE_SOUNDS: readonly UreSound[] = ["チャー", "ジャー", "ユア"];

const URE: Record<string, string> = {
  // t ＋ ure → チャー
  picture: "え・しゃしん", culture: "ぶんか", mixture: "まぜた もの", gesture: "みぶり", nature: "しぜん", future: "みらい",
  adventure: "ぼうけん", creature: "いきもの", furniture: "かぐ", sculpture: "ちょうこく",
  // s ＋ ure → ジャー
  treasure: "たからもの", measure: "はかる", pleasure: "よろこび",
  // それ いがい（p・c）＋ ure → ユア
  pure: "まじりけの ない・きれいな", cure: "なおす", secure: "あんぜんな・しっかりした",
};

export interface UreQuestion {
  answer: UreSound;
  /** ure の まえの もじ（t・s・p・c） */
  before: string;
  meaning: string;
}

/** 表に ある -ure の ことばの おと。表に なければ null */
export function ureSound(word: string): UreQuestion | null {
  const w = word.toLowerCase();
  const meaning = URE[w];
  if (!meaning || !w.endsWith("ure")) return null;
  const before = w.slice(-4, -3);
  const answer: UreSound = before === "t" ? "チャー" : before === "s" ? "ジャー" : "ユア";
  return { answer, before, meaning };
}

export function ureWhy(word: string, q: UreQuestion): string {
  const rule = q.answer === "チャー" ? "t の あとの ure は「チャー」（picture・nature）"
    : q.answer === "ジャー" ? "s の あとの ure は「ジャー」（treasure・measure）"
    : `${q.before} の あとの ure は「ユア」（pure・cure）`;
  return `${word} の おわりは「${q.answer}」。${rule}。ure の まえの もじを みよう。`;
}

// ---------------------------------------------------------------------------
// ear / eer
// ---------------------------------------------------------------------------

export type EarSpelling = (typeof W20_EAR_FOCUS)[number];
/** ear の おと: near の「イア」・bear の「エア」・learn の「アー」（eer は いつも「イア」） */
export type EarSound = "イア" | "エア" | "アー";
export const EAR_SOUNDS: readonly EarSound[] = ["イア", "エア", "アー"];
export const EAR_EXAMPLE: Record<EarSound, string> = { イア: "near", エア: "bear", アー: "learn" };

const EAR: Record<string, { sound: EarSound; meaning: string }> = {
  // ear ＝ イア
  near: { sound: "イア", meaning: "ちかくに" }, clear: { sound: "イア", meaning: "すきとおった・はっきりした" }, year: { sound: "イア", meaning: "とし・1ねん" },
  beard: { sound: "イア", meaning: "あごひげ" }, dear: { sound: "イア", meaning: "だいすきな（てがみの はじめ）" }, appear: { sound: "イア", meaning: "あらわれる" },
  hear: { sound: "イア", meaning: "きこえる" }, fear: { sound: "イア", meaning: "こわさ" },
  // eer ＝ イア
  cheer: { sound: "イア", meaning: "おうえんする" }, deer: { sound: "イア", meaning: "しか" }, steer: { sound: "イア", meaning: "かじを とる" },
  volunteer: { sound: "イア", meaning: "ボランティア" }, engineer: { sound: "イア", meaning: "エンジニア" },
  // ear ＝ エア
  bear: { sound: "エア", meaning: "くま" }, pear: { sound: "エア", meaning: "なし（くだもの）" }, wear: { sound: "エア", meaning: "きる・みに つける" },
  // ear ＝ アー
  learn: { sound: "アー", meaning: "まなぶ" }, earth: { sound: "アー", meaning: "ちきゅう" }, early: { sound: "アー", meaning: "はやく" }, heard: { sound: "アー", meaning: "きいた（hear の 過去形）" },
};

/** 「イア」の ＿ に はいる つづりの 選択肢 */
export const EAR_CHOICES = ["ear", "eer", "ere", "ier"] as const;

export type EarQuestion =
  | { kind: "blank"; spelling: EarSpelling; display: string; answer: EarSpelling; meaning: string }
  | { kind: "sound"; spelling: "ear"; answer: EarSound; meaning: string };

/** 表に ある ear / eer の ことばの 問題（イア は つづり、エア・アー は おと）。表に なければ null */
export function earOf(word: string): EarQuestion | null {
  const w = word.toLowerCase();
  const e = EAR[w];
  if (!e) return null;
  const spelling: EarSpelling = w.includes("eer") ? "eer" : "ear";
  if (e.sound !== "イア") return { kind: "sound", spelling: "ear", answer: e.sound, meaning: e.meaning };
  const i = w.indexOf(spelling);
  return { kind: "blank", spelling, display: `${w.slice(0, i)}＿${w.slice(i + 3)}（${e.meaning}）`, answer: spelling, meaning: e.meaning };
}

export function earWhy(word: string, q: EarQuestion): string {
  if (q.kind === "blank") {
    return `${word} は「${q.answer}」。「イア」の おとの つづりは ear と eer が おおいよ。dear（だいすきな）と deer（しか）の ように おとが おなじでも つづりで いみが かわるので、ことばごとに おぼえよう。`;
  }
  const others = EAR_SOUNDS.filter((s) => s !== q.answer).map((s) => `${EAR_EXAMPLE[s]}（${s}）`).join("・");
  return `${word} の ear は「${q.answer}」。おなじ ear でも ${others} の ように おとが かわるよ。`;
}

// ---------------------------------------------------------------------------
// あいまい母音（schwa）
// ---------------------------------------------------------------------------

/** あいまい母音の ことば → はくの まとまり・よわい「ア」の もじの いち・いみ */
const SCHWA: Record<string, { syllables: string; at: number; meaning: string }> = {
  // はじめの a
  about: { syllables: "a-bout", at: 0, meaning: "〜に ついて" }, again: { syllables: "a-gain", at: 0, meaning: "もう いちど" },
  away: { syllables: "a-way", at: 0, meaning: "はなれて" }, alone: { syllables: "a-lone", at: 0, meaning: "ひとりで" },
  // おわりの a
  banana: { syllables: "ba-na-na", at: 5, meaning: "バナナ" }, sofa: { syllables: "so-fa", at: 3, meaning: "ソファー" },
  panda: { syllables: "pan-da", at: 4, meaning: "パンダ" }, zebra: { syllables: "ze-bra", at: 4, meaning: "しまうま" },
  // o・e も よわい「ア」に なる
  lemon: { syllables: "lem-on", at: 3, meaning: "レモン" }, melon: { syllables: "mel-on", at: 3, meaning: "メロン" },
  seven: { syllables: "sev-en", at: 3, meaning: "7" }, garden: { syllables: "gar-den", at: 4, meaning: "にわ" },
  // おまつりの ことば
  festival: { syllables: "fes-ti-val", at: 6, meaning: "おまつり" }, parade: { syllables: "pa-rade", at: 1, meaning: "パレード" },
  balloon: { syllables: "bal-loon", at: 1, meaning: "ふうせん" }, today: { syllables: "to-day", at: 1, meaning: "きょう" },
};

export interface SchwaQuestion {
  display: string;
  answer: string;
  choices: string[];
  syllables: string;
  meaning: string;
}

/** 表に ある あいまい母音の ことばを、よわい「ア」の もじを ＿ に した 形（about → ＿bout、lemon → lem＿n）。表に なければ null */
export function schwaBlank(word: string): SchwaQuestion | null {
  const w = word.toLowerCase();
  const s = SCHWA[w];
  if (!s) return null;
  const answer = w[s.at];
  // 「ア」に きこえるので u が いちばん まちがえやすい。のこりは a e o i から
  const choices = [answer, ...["u", "a", "e", "o", "i"].filter((x) => x !== answer)].slice(0, 4);
  return { display: `${w.slice(0, s.at)}＿${w.slice(s.at + 1)}（${s.meaning}）`, answer, choices, syllables: s.syllables, meaning: s.meaning };
}

export function schwaWhy(word: string, q: SchwaQuestion): string {
  return `${word}（${q.syllables.split("-").join("・")}）の よわい ところは、あいまいな「ア」（ə）の おと。つづりは ${q.answer} だよ。おとでは わからないので、つづりで おぼえよう。`;
}

/** フォーカスの ボタンの 読み上げ（ワールド20）。つづりを そのまま よまず、その回の ことばで よむ。あてはまらなければ null */
export function w20Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  if (focus === W20_URE_FOCUS) return words.find((w) => URE[lw(w)]) ?? null;
  // ear は ワールド9 の「イア」の よみかた（"ear"）の まま。eer は その回の ことばで
  if (focus === "eer") return words.find((w) => lw(w).includes("eer") && EAR[lw(w)]) ?? null;
  return null;
}
