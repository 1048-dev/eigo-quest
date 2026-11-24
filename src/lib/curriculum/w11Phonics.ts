/**
 * ワールド11 の フォニックス（-ed の 3つの おと・-er・-est・サイトワード）の「おと」の表。
 * import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * - -ed は まえの おとで 3つに わかれる: t・d の あとは「イド」（wanted）、いきだけの おと（p k f s sh ch x、ce の c）の あとは「ト」（jumped）、
 *   それ以外（こえの でる おと・母音）の あとは「ド」（played）
 * - -er は「～する ひと」（teacher）と「もっと」（taller）。-est は「いちばん」（tallest）
 * - サイトワード（was were said there could would because）は つづりの きまりどおりに よめない ので、ことばごと おぼえる
 *
 * focus の かきかた: "-ed" "-er" "-est"、サイトワードは ことばの まま（"was"）。サイトワードの 回の rule は "sight-words"。
 */

/** つづり（ことば）と、はじめて ならう レッスン（それより前の 回の 問題には つかわない） */
export const W11_INTRO: Record<string, number> = {
  "-ed": 301, was: 306, were: 307, said: 308, there: 309, "-er": 311, "-est": 316, could: 321, would: 322, because: 323,
};
export const W11_FOCUS = Object.keys(W11_INTRO);
export const W11_ENDINGS = ["-ed", "-er", "-est"] as const;
export const W11_SIGHT_WORDS = W11_FOCUS.filter((f) => !f.startsWith("-"));

export type EdSound = "t" | "d" | "id";

/** -ed の おと（-ed で おわらない ことばは null）。passed のような ss は「ト」、used のような 1つの s は つかわない（テストで 確認） */
export function edSound(word: string): EdSound | null {
  const w = word.toLowerCase();
  if (!w.endsWith("ed") || w.length < 4) return null;
  const stem = w.slice(0, -2);
  const last = stem[stem.length - 1];
  if (last === "t" || last === "d") return "id";
  return "pkfxcsh".includes(last) ? "t" : "d";
}
/** -ed の おとの 選択肢の 表示 */
export const ED_LABEL: Record<EdSound, string> = { t: "ト（t）", d: "ド（d）", id: "イド（id）" };
export const ED_KANA: Record<EdSound, string> = { t: "ト", d: "ド", id: "イド" };

/** 「もっと」の -er の ことば（それ以外の -er は「～する ひと」） */
export const ER_MORE_WORDS = new Set(["taller", "faster", "bigger", "older", "smaller", "longer", "nicer", "stronger", "higher", "colder"]);

/** サイトワードの よみかたの ヒント（問題の 説明に つかう） */
export const SIGHT_TIP: Record<string, string> = {
  was: "was は「ワズ」。a が「オ」に ちかい おと。saw と もじが ぎゃくだよ。",
  saw: "saw は「ソー」（aw は「オー」）。was と もじが ぎゃくだよ。",
  what: "what は「ワット」。w の あとの a は「オ」に ちかい おと。",
  want: "want は「ウォント」。w の あとの a は「オ」に ちかい おと。",
  were: "were は「ワー」。e が 2つ あるけど みじかく よむよ。where とは ちがう おと。",
  we: "we は「ウィー」。",
  her: "her は「ハー」（er は「ア～」）。",
  where: "where は「ウェア」。there と おなじ おわりの おと。",
  said: "said は「セッド」。ai だけど「エ」と よむ とくべつな ことば。",
  say: "say は「セイ」（ay は「エイ」）。said とは ちがう おと。",
  says: "says は「セズ」。ay だけど「エ」と よむ とくべつな ことば。",
  again: "again は「アゲン」。ai だけど「エ」と よむ ことが おおいよ。",
  there: "there は「ゼア」。where と おなじ おわりの おと。th は したを かるく かんで。",
  here: "here は「ヒア」。there とは ちがう おと。",
  then: "then は「ゼン」。th は したを かるく かんで。",
  could: "could は「クッド」。l は よまないよ。",
  would: "would は「ウッド」。l は よまないよ。wood（き）と おなじ おと。",
  should: "should は「シュッド」。l は よまないよ。",
  good: "good は「グッド」。could と おなじ おわりの おと。",
  wood: "wood は「ウッド」（き）。would と おなじ おと。",
  look: "look は「ルック」（oo は みじかい「ウ」）。",
  foot: "foot は「フット」（oo は みじかい「ウ」）。",
  because: "because は「ビコーズ」。「～だから」と りゆうを つなぐ ことば。",
  why: "why は「ワイ」（なぜ）。",
  so: "so は「ソウ」（だから）。",
  but: "but は「バット」（でも）。",
};

/** フォーカスの ボタンの 読み上げ（"-ed" を「エド」と よまない ように、その回の ことばで よむ）。あてはまらなければ null */
export function w11Say(focus: string, words: readonly string[] = []): string | null {
  if ((W11_ENDINGS as readonly string[]).includes(focus)) {
    const end = focus.slice(1);
    return words.find((w) => w.toLowerCase().endsWith(end)) ?? null;
  }
  return null;
}
