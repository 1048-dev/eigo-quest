/**
 * ワールド15（かぜの草原・L421〜450）の フォニックス・つづり の表。
 * import は ワールド10 の y の 表だけ（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - -ing の つづり: e で おわる → e を とる（make → making）、みじかい 母音＋子音 1つ → 子音を 重ねる（run → running）、
 *   それ以外は そのまま（play → playing）
 * - 複合語: 2つの ことばが くっついた ことば（sun + flower → sunflower）。focus は "sun-flower" の ように ハイフンで わける
 * - 短縮形: I'm・she's・they're・isn't（' は きえた もじの しるし）
 * - y の 3つの おと: yes の「イェ」、happy の「イー」、fly の「アイ」
 *
 * focus の かきかた: -ing は "-ing"、複合語は "sun-flower"、短縮形は "'m" "'s" "'re" "n't"、y は "y"。
 */
import { ySound } from "./w10Phonics";

/** ワールド15 が はじまる レッスン（それより前の 回では ワールド15 の 問題に しない） */
export const W15_START = 421;

export const W15_ING_FOCUS = ["-ing"] as const;
export const W15_CONTRACTION_FOCUS = ["'m", "'s", "'re", "n't"] as const;
export const W15_Y_FOCUS = ["y"] as const;

// ---------------------------------------------------------------------------
// -ing の つづり
// ---------------------------------------------------------------------------

export type IngKind = "drop-e" | "double" | "plain";

export interface IngSpelling {
  answer: string;
  wrong: string[];
  base: string;
  kind: IngKind;
}

/** e を とって ing を つける ことば（もとの 形） */
const DROP_E = new Set([
  "make", "ride", "dance", "write", "hide", "smile", "skate", "wave", "shine", "slide", "dive", "bake", "take", "come", "give",
  "have", "chase", "hike", "bounce", "race", "close", "use", "move", "drive", "share", "wake", "shake", "bike", "joke", "glide",
  "rise", "sneeze", "breathe", "graze", "skate", "line", "save", "cycle", "juggle", "tickle", "giggle", "wiggle", "trace", "smile",
]);

/** さいごの 子音を 重ねて ing を つける ことば（もとの 形） */
const DOUBLE = new Set([
  "run", "swim", "sit", "dig", "hop", "clap", "get", "cut", "shop", "stop", "jog", "skip", "put", "win", "hug", "grab", "drop",
  "spin", "plan", "chat", "nap", "set", "hit", "wag", "rub", "step", "flap", "begin", "trot", "pat", "bat", "stir", "drip", "nod",
]);

/** ing の ついた ことばの ただしい つづりと まちがえやすい つづり。ing で おわらなければ null */
export function ingSpelling(word: string): IngSpelling | null {
  const w = word.toLowerCase();
  if (!/^[a-z]+ing$/.test(w)) return null;
  const stem = w.slice(0, -3);
  if (stem.length < 2) return null;
  if (DROP_E.has(`${stem}e`)) {
    const base = `${stem}e`;
    return { answer: w, wrong: [`${base}ing`, `${stem}${stem.slice(-1)}ing`], base, kind: "drop-e" };
  }
  const last = stem.slice(-1);
  if (stem.length >= 3 && stem.slice(-2, -1) === last && DOUBLE.has(stem.slice(0, -1))) {
    const base = stem.slice(0, -1);
    return { answer: w, wrong: [`${base}ing`, `${base}eing`], base, kind: "double" };
  }
  // seeing のように e で おわる ことばは まぎらわしい ので 出さない
  if (stem.endsWith("e")) return null;
  return { answer: w, wrong: [`${stem}${last}ing`, `${stem}eing`], base: stem, kind: "plain" };
}

export const ING_WHY: Record<IngKind, (base: string) => string> = {
  "drop-e": (b) => `${b} は e で おわるので、e を とって ing を つけるよ。`,
  double: (b) => `${b} は「みじかい 母音＋子音 1つ」で おわるので、さいごの ${b.slice(-1)} を 2つに して ing を つけるよ。`,
  plain: (b) => `${b} は そのまま ing を つけるよ。`,
};

// ---------------------------------------------------------------------------
// 複合語
// ---------------------------------------------------------------------------

/** 複合語の パーツの いみ（せつめいに つかう。なければ いみは 出さない） */
const PART_JA: Record<string, string> = {
  sun: "たいよう", flower: "はな", rain: "あめ", bow: "ゆみ", grass: "くさ", hopper: "はねるもの", foot: "あし", ball: "ボール",
  butter: "バター", fly: "とぶ・むし", dragon: "りゅう", cow: "うし", boy: "おとこのこ", star: "ほし", fish: "さかな", fire: "ひ",
  light: "ひかり", snow: "ゆき", man: "ひと", camp: "キャンプ", sand: "すな", box: "はこ", play: "あそぶ", ground: "じめん",
  water: "みず", fall: "おちる", down: "した", hill: "おか", side: "がわ", moon: "つき", tooth: "は", brush: "ブラシ", class: "クラス",
  room: "へや", note: "メモ", book: "ほん", home: "いえ", work: "しごと", birth: "うまれる", day: "ひ", rabbit: "うさぎ", hole: "あな",
  bed: "ベッド", time: "じかん", horse: "うま", back: "せなか", wind: "かぜ", mill: "こなひき", pop: "ポン", corn: "とうもろこし",
  lady: "おんなの ひと", bug: "むし", sky: "そら", scrape: "こする", sea: "うみ", shell: "かい",
};

/** focus（"sun-flower"）の 中から、ことばに あう 2つの パーツを 返す。なければ null */
export function compoundSplit(word: string, focus: readonly string[]): [string, string] | null {
  const w = word.toLowerCase();
  for (const f of focus) {
    const parts = f.toLowerCase().split("-");
    if (parts.length !== 2 || parts.some((p) => !/^[a-z]{2,}$/.test(p))) continue;
    if (parts.join("") === w) return [parts[0], parts[1]];
  }
  return null;
}

/** 複合語の わけかたの 選択肢（ただしい わけかた と 1もじ ずれた わけかた 2つ） */
export function compoundChoices(a: string, b: string): { answer: string; wrong: string[] } {
  return { answer: `${a} + ${b}`, wrong: [`${a.slice(0, -1)} + ${a.slice(-1)}${b}`, `${a}${b[0]} + ${b.slice(1)}`] };
}

export function compoundWhy(word: string, a: string, b: string): string {
  const ja = (p: string) => (PART_JA[p] ? `（${PART_JA[p]}）` : "");
  return `${word} は ${a}${ja(a)} と ${b}${ja(b)} の 2つの ことばが くっついた ことば だよ。`;
}

// ---------------------------------------------------------------------------
// 短縮形
// ---------------------------------------------------------------------------

/** 短縮形 → もとの 2語 */
const CONTRACTIONS: Record<string, string> = {
  "i'm": "I am", "you're": "you are", "we're": "we are", "they're": "they are", "he's": "he is", "she's": "she is", "it's": "it is",
  "what's": "what is", "that's": "that is", "there's": "there is", "who's": "who is", "where's": "where is", "let's": "let us",
  "isn't": "is not", "aren't": "are not", "don't": "do not", "doesn't": "does not", "can't": "cannot", "wasn't": "was not",
};

/** 短縮形の もとの 形と まちがえやすい つづり（' が ない・' の いちが ちがう）。あてはまらなければ null */
export function contractionOf(word: string): { full: string; answer: string; wrong: string[] } | null {
  const full = CONTRACTIONS[word.toLowerCase()];
  if (!full) return null;
  const answer = word;
  const noMark = answer.replace("'", "");
  const i = answer.indexOf("'");
  const head = answer.slice(0, i);
  const tail = answer.slice(i + 1);
  // n't: is'nt（' が 1つ まえ）、'm 's 're: I'am・she'is（きえた もじを のこして しまう）
  const misplaced = tail === "t" ? `${head.slice(0, -1)}'${head.slice(-1)}t` : `${head}'${full.split(" ")[1]}`;
  return { full, answer, wrong: [noMark, misplaced] };
}

/** 短縮形で きえた もじ（I am → I'm なら a、cannot → can't なら no） */
export function missingLetters(full: string, answer: string): string {
  const a = full.replace(/ /g, "").toLowerCase();
  const b = answer.replace("'", "").toLowerCase();
  let p = 0;
  while (p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return a.slice(p, a.length - s);
}

export function contractionWhy(full: string, answer: string): string {
  return `${full} を みじかく すると ${answer}。' は きえた もじ（${missingLetters(full, answer)}）の しるし だよ。`;
}

// ---------------------------------------------------------------------------
// y の 3つの おと
// ---------------------------------------------------------------------------

export type Y3Sound = "イェ" | "イー" | "アイ";
export const Y3_SOUNDS: readonly Y3Sound[] = ["イェ", "イー", "アイ"];
export const Y3_LABEL: Record<Y3Sound, string> = { "イェ": "イェ（yes の y）", "イー": "イー（happy の y）", "アイ": "アイ（fly の y）" };

/**
 * y の おと。y で はじまる → イェ、子音＋y で おわる ことばは ワールド10 の きまり（ほかに 母音が あれば イー、なければ アイ）。
 * y で はじまって y で おわる（yummy）・ay ey oy で おわる・y が まんなかだけ の ことばは null
 */
export function y3Sound(word: string): Y3Sound | null {
  const w = word.toLowerCase();
  const end = ySound(w);
  if (w.startsWith("y")) return w.length > 1 && !w.slice(1).includes("y") ? "イェ" : null;
  return end;
}

export const Y3_WHY: Record<Y3Sound, string> = {
  "イェ": "ことばの はじめの y は「イェ」（yes の y）。",
  "イー": "2はく いじょうの ことばの おわりの y は「イー」（happy の y）。",
  "アイ": "1はくの ことばの おわりの y は「アイ」（fly の y）。",
};
