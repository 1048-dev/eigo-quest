/**
 * ワールド10 の フォニックス（soft c・soft g・おわりの -y・おわりの -le・aw au ew）の「おと」の表。
 * import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * - c は あとに e・i・y が くると「ス」（city, ice）、それ以外は「ク」（cat, cup）
 * - g は あとに e・i・y が くると「ジ」（giant, page）、それ以外は「グ」（goat, bag）。get / girl / give などは れいがい（「グ」）
 * - おわりの y は、ほかに 母音の ない みじかい ことばでは「アイ」（fly, sky）、それ以外は「イー」（happy, baby）
 * - おわりの -le は「ル」（apple, little）
 * - aw と au は おなじ「オー」（saw, sauce）、ew は「ウー」（new, flew）
 *
 * focus の かきかた: soft c は "c"、soft g は "g"、おわりの y は "-y"、おわりの le は "-le"、"aw" "au" "ew"。
 * "c" "g" は ワールド1 の 文字の 音と おなじ なので、W10_INTRO より前の 回では つかわない（問題も 出さない）。
 */

/** つづりと、はじめて ならう レッスン（それより前の 回の 問題には つかわない） */
export const W10_INTRO: Record<string, number> = {
  c: 271, g: 276, "-y": 281, "-le": 286, aw: 291, au: 292, ew: 293,
};
export const W10_FOCUS = Object.keys(W10_INTRO);

export type CgSound = "soft" | "hard";

/** e・i・y の まえでも「グ」と よむ g の ことば（ワールド10 の フォニックスの ことばには つかわない） */
export const G_HARD_WORDS = new Set([
  "get", "gets", "give", "gives", "girl", "girls", "gift", "gifts", "tiger", "tigers", "begin", "together", "forget",
  "target", "finger", "fingers", "giggle", "giggles", "geese", "gear", "hungry", "angry", "bigger", "foggy", "buggy",
]);

/**
 * ことばの 中の c（または g）の おとを、まえから じゅんに。
 * ch・ck・sc の c、gh・ng（あとに e i y が こない とき）・gg の 1つめの g は かぞえない。
 */
export function cgSounds(letter: "c" | "g", word: string): CgSound[] {
  const w = word.toLowerCase();
  const out: CgSound[] = [];
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== letter) continue;
    const next = w[i + 1] ?? "";
    const prev = w[i - 1] ?? "";
    if (letter === "c" && (next === "h" || next === "k" || prev === "s")) continue;
    if (letter === "g" && (next === "h" || next === "g")) continue;
    const soft = "eiy".includes(next) && next !== "";
    if (letter === "g" && prev === "n" && !soft) continue; // sing, jungle の ng
    out.push(soft && !(letter === "g" && G_HARD_WORDS.has(w)) ? "soft" : "hard");
  }
  return out;
}

/** c / g の おとを あらわす もじ（選択肢）と カタカナ */
export const CG_LETTER: Record<"c" | "g", Record<CgSound, string>> = { c: { soft: "s", hard: "k" }, g: { soft: "j", hard: "g" } };
export const CG_KANA: Record<"c" | "g", Record<CgSound, string>> = { c: { soft: "ス", hard: "ク" }, g: { soft: "ジ", hard: "グ" } };
/** 選択肢（4つ）。こたえ 2つ（soft / hard）＋ ちがう おとの もじ 2つ */
export const CG_CHOICES: Record<"c" | "g", readonly string[]> = { c: ["s", "k", "ch", "sh"], g: ["j", "g", "ch", "d"] };

export type YSound = "イー" | "アイ";

/** おわりの y の おと（y の まえが 母音の ことば〈day, key, toy〉は 母音チームなので null） */
export function ySound(word: string): YSound | null {
  const w = word.toLowerCase();
  if (!w.endsWith("y") || w.length < 2 || "aeiou".includes(w[w.length - 2])) return null;
  return /[aeiou]/.test(w.slice(0, -1)) ? "イー" : "アイ";
}
/** おわりの y の おとと おなじ おとの つづり（イー ↔ ee、アイ ↔ igh） */
export const Y_TEAM: Record<YSound, string> = { "イー": "ee", "アイ": "igh" };

/** aw / au / ew の おと */
export type W10TeamSound = "オー" | "ウー";
export const W10_TEAMS = ["aw", "au", "ew"] as const;
export const w10TeamSound = (team: string): W10TeamSound => (team === "ew" ? "ウー" : "オー");

/** フォーカスの ボタンの 読み上げ（つづりの まま だと "aw" を「エー・ダブリュー」と よむ ため）。あてはまらなければ null */
export function w10Say(focus: string, words: readonly string[] = []): string | null {
  switch (focus) {
    case "aw": case "au": return "awe";
    case "ew": return "oo";
    case "-le": return words.find((w) => w.toLowerCase().endsWith("le")) ?? "le";
    case "-y": {
      const ys = words.map(ySound).filter((s): s is YSound => s !== null);
      if (ys.length > 0 && ys.every((s) => s === "イー")) return "ee";
      if (ys.length > 0 && ys.every((s) => s === "アイ")) return "eye";
      return words[0] ?? "y";
    }
    case "c": case "g": {
      // soft c / soft g だけの 回は ことばを そのまま よむ（ワールド1 の c・g の 回は いままでどおり）
      const withF = words.filter((w) => cgSounds(focus, w).length > 0);
      return withF.length > 0 && withF.every((w) => cgSounds(focus, w).every((s) => s === "soft")) ? withF[0] : null;
    }
    default: return null;
  }
}
