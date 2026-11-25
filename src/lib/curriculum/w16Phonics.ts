/**
 * ワールド16（きおくの遺跡・L451〜480）の フォニックス・つづり の表。
 * import は ワールド11 の -ed の おとの 表だけ（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - -ed の つづり: e で おわる → d だけ（like → liked）、みじかい 母音＋子音 1つ → 子音を 重ねる（stop → stopped）、
 *   子音＋y → y を i に かえて ed（cry → cried）、それ以外は そのまま（walk → walked）
 * - ふきそくな 過去形: i → a（sing → sang）、o…e に なる（write → wrote）、ew に なる（know → knew）、ought / aught（buy → bought, catch → caught）
 * - -ed の 3つの おと（ト・ド・イド）の ふりかえり（rule が "ed-sounds" の 回）
 *
 * focus の かきかた: -ed は "-ed"、i → a は "a"、o…e は "o_e"、ew は "ew"、"ought" "aught"。
 * ふきそくな 過去形は 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */
import { edSound, type EdSound } from "./w11Phonics";

/** ワールド16 が はじまる レッスン（それより前の 回では ワールド16 の 問題に しない） */
export const W16_START = 451;

export const W16_ED_FOCUS = ["-ed"] as const;
export const W16_IRREGULAR_FOCUS = ["a", "o_e", "ew", "ought", "aught"] as const;
/** -ed を つづりではなく おと（ト・ド・イド）で 問う 回の rule */
export const W16_ED_SOUND_RULE = "ed-sounds";

// ---------------------------------------------------------------------------
// -ed の つづり
// ---------------------------------------------------------------------------

export type EdKind = "drop-e" | "double" | "y-i" | "plain";

export interface EdSpelling {
  answer: string;
  wrong: string[];
  base: string;
  kind: EdKind;
}

/** e で おわる もとの 形（d だけ つける） */
const DROP_E = new Set([
  "like", "love", "live", "smile", "dance", "move", "close", "use", "arrive", "hope", "bake", "wave", "share", "save", "change",
  "decide", "invite", "race", "skate", "slide", "hike", "joke", "giggle", "juggle", "tickle", "chase", "believe", "place", "trace",
  "scare", "rescue", "surprise", "practice", "smile", "explore", "notice", "prepare", "paddle", "wiggle", "breathe", "create",
]);

/** さいごの 子音を 重ねて ed を つける もとの 形 */
const DOUBLE = new Set([
  "stop", "drop", "hop", "clap", "plan", "shop", "hug", "skip", "jog", "nap", "chat", "grab", "step", "trip", "nod", "wag", "pat",
  "rub", "tap", "zip", "flap", "drip", "beg", "slip", "trap", "spot", "knot", "dot", "pet", "fit",
]);

/** 子音＋y で おわる もとの 形（y を i に かえて ed） */
const Y_TO_I = new Set(["cry", "try", "carry", "study", "hurry", "worry", "copy", "fry", "dry", "reply", "tidy", "marry", "bury", "empty"]);

const PHONETIC: Record<EdSound, string> = { t: "t", d: "d", id: "id" };

/** -ed の ついた ことばの ただしい つづりと まちがえやすい つづり。-ed で おわらない・まぎらわしい ことばは null */
export function edSpelling(word: string): EdSpelling | null {
  const w = word.toLowerCase();
  if (!/^[a-z]+ed$/.test(w) || w.length < 5) return null;
  const stem = w.slice(0, -2);
  if (DROP_E.has(`${stem}e`)) {
    const base = `${stem}e`;
    return { answer: w, wrong: [`${base}ed`, `${stem}${stem.slice(-1)}ed`], base, kind: "drop-e" };
  }
  if (stem.endsWith("i") && Y_TO_I.has(`${stem.slice(0, -1)}y`)) {
    const base = `${stem.slice(0, -1)}y`;
    return { answer: w, wrong: [`${base}ed`, `${base}ied`], base, kind: "y-i" };
  }
  const last = stem.slice(-1);
  if (stem.length >= 3 && stem.slice(-2, -1) === last && DOUBLE.has(stem.slice(0, -1))) {
    const base = stem.slice(0, -1);
    return { answer: w, wrong: [`${base}ed`, `${base}eed`], base, kind: "double" };
  }
  // agreed・need のように e で おわる・e が つづく ことばは まぎらわしい ので 出さない
  if (stem.endsWith("e")) return null;
  const s = edSound(w);
  if (!s) return null;
  const wrong = [`${stem}${last}ed`, `${stem}${PHONETIC[s]}`];
  if (wrong.includes(w)) return null;
  return { answer: w, wrong, base: stem, kind: "plain" };
}

export const ED_WHY: Record<EdKind, (base: string) => string> = {
  "drop-e": (b) => `${b} は e で おわるので、d だけ つけるよ。`,
  double: (b) => `${b} は「みじかい 母音＋子音 1つ」で おわるので、さいごの ${b.slice(-1)} を 2つに して ed を つけるよ。`,
  "y-i": (b) => `${b} は「子音＋y」で おわるので、y を i に かえて ed を つけるよ。`,
  plain: (b) => `${b} は そのまま ed を つけるよ。おとは ちいさく「ト」「ド」「イド」でも、つづりは いつも ed。`,
};

// ---------------------------------------------------------------------------
// ふきそくな 過去形
// ---------------------------------------------------------------------------

export type IrregularKind = "i-a" | "o-e" | "ew" | "ought" | "aught";

/** 過去形 → [もとの 形, しゅるい] */
const IRREGULAR: Record<string, [string, IrregularKind]> = {
  // i → a
  sang: ["sing", "i-a"], swam: ["swim", "i-a"], drank: ["drink", "i-a"], rang: ["ring", "i-a"], began: ["begin", "i-a"],
  sat: ["sit", "i-a"], gave: ["give", "i-a"], sank: ["sink", "i-a"],
  // o…e（まんなかが「オウ」に なる）
  wrote: ["write", "o-e"], rode: ["ride", "o-e"], drove: ["drive", "o-e"], rose: ["rise", "o-e"], woke: ["wake", "o-e"],
  broke: ["break", "o-e"], spoke: ["speak", "o-e"], chose: ["choose", "o-e"], froze: ["freeze", "o-e"], stole: ["steal", "o-e"],
  // ew
  knew: ["know", "ew"], grew: ["grow", "ew"], threw: ["throw", "ew"], blew: ["blow", "ew"], flew: ["fly", "ew"], drew: ["draw", "ew"],
  // ought / aught（どちらも「オート」）
  bought: ["buy", "ought"], thought: ["think", "ought"], brought: ["bring", "ought"], fought: ["fight", "ought"],
  caught: ["catch", "aught"], taught: ["teach", "aught"],
};

/** 過去形の しゅるいと focus の 対応（focus に あう しゅるいだけ 問う） */
export const IRREGULAR_FOCUS_OF: Record<IrregularKind, string> = { "i-a": "a", "o-e": "o_e", ew: "ew", ought: "ought", aught: "aught" };

/** こどもが つくりがちな「きそくどおりの -ed」（singed, writed, buyed, flied）。もとの 形に ふつうの きまりで ed を つける */
export function regularEd(base: string): string {
  if (base.endsWith("e")) return `${base}d`;
  if (/[^aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
  if (DOUBLE.has(base) || base === "swim" || base === "sit" || base === "begin") return `${base}${base.slice(-1)}ed`;
  return `${base}ed`;
}

export interface IrregularPast {
  base: string;
  answer: string;
  wrong: string[];
  kind: IrregularKind;
}

/**
 * ふきそくな 過去形の もとの 形と まちがえやすい つづり。表に なければ null。
 * まちがい: きそくどおりの -ed（buyed）と、ought / aught は いれかえ（baught）、それ以外は 過去形に もう一度 ed（sanged）。
 */
export function irregularPast(word: string): IrregularPast | null {
  const w = word.toLowerCase();
  const hit = IRREGULAR[w];
  if (!hit) return null;
  const [base, kind] = hit;
  const second = kind === "ought" ? w.replace("ought", "aught") : kind === "aught" ? w.replace("aught", "ought") : regularEd(w);
  return { base, answer: w, wrong: [regularEd(base), second], kind };
}

export const IRREGULAR_WHY: Record<IrregularKind, (base: string, past: string) => string> = {
  "i-a": (b, p) => `${b} → ${p}。i が a に かわるよ（ed は つけない）。`,
  "o-e": (b, p) => `${b} → ${p}。まんなかが「オウ」の o…e に かわるよ（ed は つけない）。`,
  ew: (b, p) => `${b} → ${p}。おわりが ew（ウー）に かわるよ（ed は つけない）。`,
  ought: (b, p) => `${b} → ${p}。ought と aught は おなじ「オート」の おと。buy・think・bring・fight は ought だよ。`,
  aught: (b, p) => `${b} → ${p}。ought と aught は おなじ「オート」の おと。catch・teach は aught だよ。`,
};
