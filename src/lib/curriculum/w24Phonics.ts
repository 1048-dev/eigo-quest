/**
 * ワールド24（くもの上の鉄道・L691〜720・ステージ3）の フォニックス・つづりの表。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 地名の 音節と 強勢（CAN-a-da, o-ki-NA-wa）: 「つよく よむ ところは どれ？」（focus は はくで わけた 小文字の 形 "can-a-da"。ことばと 1つずつ 対応）
 * - 過去分詞（seen, been, done, gone, eaten, written）: 「have の あとに くる かたちは どれ？」（seen / saw / see。t・d を かさねる ことばは まちがいの つづりも）
 * - 短縮形 I've / haven't / she's（has）: 「みじかい かたちは どれ？」（I have → I've / Ive / I'have）
 * - over- / under-（overnight, underground）: 「この ことばの over は どんな いみ？」（うえ・こえて・〜すぎる / した / まえ / もう いちど）
 * - im- / in-（impossible, incorrect, invisible）: 「ただしい ことばは どれ？」（possible の はんたい → impossible / inpossible / unpossible）
 *
 * focus の かきかた: 地名は "can-a-da"、過去分詞は おわりの "-een" "-one" "-en" "-wn" "-um"、短縮形は "'ve" "n't" "'s"、"over-" "under-" "im-" "in-"。
 * まちがいの 選択肢は 表に 手で 書く（ほんとうに ある ことば・よく ある べつの つづりは 入れない）。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド24 が はじまる レッスン（それより前の 回では ワールド24 の 問題に しない） */
export const W24_START = 691;

export const W24_PP_FOCUS = ["-een", "-one", "-en", "-wn", "-um"] as const;
export const W24_CONTRACTION_FOCUS = ["'ve", "n't", "'s"] as const;
export const W24_OU_FOCUS = ["over-", "under-"] as const;
export const W24_IMIN_FOCUS = ["im-", "in-"] as const;

// ---------------------------------------------------------------------------
// 地名の 音節と 強勢
// ---------------------------------------------------------------------------

/** 地名（小文字） → はくの まとまり・つよい はく（0 から）・いみ・日本の 地名か */
const PLACE: Record<string, { syllables: string; stress: number; meaning: string; japan?: true }> = {
  canada: { syllables: "can-a-da", stress: 0, meaning: "カナダ" },
  italy: { syllables: "it-a-ly", stress: 0, meaning: "イタリア" },
  mexico: { syllables: "mex-i-co", stress: 0, meaning: "メキシコ" },
  africa: { syllables: "af-ri-ca", stress: 0, meaning: "アフリカ" },
  india: { syllables: "in-di-a", stress: 0, meaning: "インド" },
  singapore: { syllables: "sin-ga-pore", stress: 0, meaning: "シンガポール" },
  portugal: { syllables: "por-tu-gal", stress: 0, meaning: "ポルトガル" },
  america: { syllables: "a-mer-i-ca", stress: 1, meaning: "アメリカ" },
  australia: { syllables: "aus-tra-li-a", stress: 1, meaning: "オーストラリア" },
  korea: { syllables: "ko-re-a", stress: 1, meaning: "かんこく" },
  antarctica: { syllables: "ant-arc-ti-ca", stress: 1, meaning: "なんきょく" },
  argentina: { syllables: "ar-gen-ti-na", stress: 2, meaning: "アルゼンチン" },
  osaka: { syllables: "o-sa-ka", stress: 1, meaning: "おおさか", japan: true },
  hokkaido: { syllables: "hok-kai-do", stress: 1, meaning: "ほっかいどう", japan: true },
  okinawa: { syllables: "o-ki-na-wa", stress: 2, meaning: "おきなわ", japan: true },
  nagasaki: { syllables: "na-ga-sa-ki", stress: 2, meaning: "ながさき", japan: true },
};

const markStress = (syllables: string, at: number) => syllables.split("-").map((p, i) => (i === at ? p.toUpperCase() : p)).join("-");

export interface PlaceQuestion {
  answer: string;
  /** 選択肢（つよい はくを 1つずつ かえた 形。きまった 順） */
  choices: string[];
  meaning: string;
  japan: boolean;
}

/** 表に ある 地名で、focus に はくの 形（"can-a-da"）が ある ものの 問題。あてはまらなければ null */
export function placeOf(word: string, focus: readonly string[]): PlaceQuestion | null {
  const p = PLACE[word.toLowerCase()];
  if (!p) return null;
  if (!focus.some((f) => f.toLowerCase() === p.syllables)) return null;
  const n = p.syllables.split("-").length;
  return { answer: markStress(p.syllables, p.stress), choices: Array.from({ length: n }, (_, i) => markStress(p.syllables, i)), meaning: p.meaning, japan: !!p.japan };
}

/** 表に ある 地名の はくの 形（focus に つかう。表に なければ null） */
export function placeSyllables(word: string): string | null {
  return PLACE[word.toLowerCase()]?.syllables ?? null;
}

export function placeWhy(word: string, q: PlaceQuestion): string {
  const tail = q.japan
    ? "日本語では たいらに よむ 日本の 地名も、英語の なかでは 1つの はくを つよく ながく よむよ。"
    : "日本語の よみかたと ちがう ところを つよく よむ ことが あるので、英語の 地名は つよい はくごと おぼえよう。";
  return `${word}（${q.meaning}）は ${q.answer} と、大きい もじの ところを つよく よむ。${tail}`;
}

// ---------------------------------------------------------------------------
// 過去分詞（have ＋ seen / eaten …）
// ---------------------------------------------------------------------------

export type PpTrap = "irregular" | "en" | "double" | "wn";

/** 過去分詞 → もとの かたち・すぎた かたち・いみ・（t・d を かさねる ことばだけ）まちがいの つづり */
const PP: Record<string, { base: string; past: string; meaning: string; misspell?: string }> = {
  seen: { base: "see", past: "saw", meaning: "みる" },
  been: { base: "be", past: "was", meaning: "いる・ある（I've been to ～ ＝ ～に いった ことが ある）" },
  done: { base: "do", past: "did", meaning: "する" },
  gone: { base: "go", past: "went", meaning: "いく" },
  eaten: { base: "eat", past: "ate", meaning: "たべる" },
  taken: { base: "take", past: "took", meaning: "とる・のる" },
  given: { base: "give", past: "gave", meaning: "あげる" },
  spoken: { base: "speak", past: "spoke", meaning: "はなす" },
  written: { base: "write", past: "wrote", meaning: "かく", misspell: "writen" },
  ridden: { base: "ride", past: "rode", meaning: "のる", misspell: "riden" },
  forgotten: { base: "forget", past: "forgot", meaning: "わすれる", misspell: "forgoten" },
  hidden: { base: "hide", past: "hid", meaning: "かくす・かくれる", misspell: "hiden" },
  flown: { base: "fly", past: "flew", meaning: "とぶ" },
  drawn: { base: "draw", past: "drew", meaning: "（えを）かく" },
  grown: { base: "grow", past: "grew", meaning: "そだつ" },
  swum: { base: "swim", past: "swam", meaning: "およぐ" },
};

export interface PpQuestion {
  base: string;
  past: string;
  answer: string;
  /** まちがいの 選択肢（すぎた かたち・もとの かたち、t・d を かさねる ことばは かさねない つづりも） */
  wrong: string[];
  meaning: string;
  trap: PpTrap;
  /** t・d を かさねない まちがいの つづり（かさねる ことばだけ） */
  misspell?: string;
}

/** 表に ある 過去分詞の 問題。表に なければ null */
export function ppOf(word: string): PpQuestion | null {
  const w = word.toLowerCase();
  const p = PP[w];
  if (!p) return null;
  const trap: PpTrap = p.misspell ? "double" : w.endsWith("wn") ? "wn" : w.endsWith("en") && w !== "seen" && w !== "been" ? "en" : "irregular";
  return { base: p.base, past: p.past, answer: w, wrong: [p.past, p.base, ...(p.misspell ? [p.misspell] : [])], meaning: p.meaning, trap, misspell: p.misspell };
}

export function ppDisplay(q: PpQuestion): string {
  return `I have ＿＿.（${q.base}＝${q.meaning.replace(/（.*）$/, "")}）`;
}

export function ppWhy(q: PpQuestion): string {
  const tail: Record<PpTrap, string> = {
    irregular: "かたちが がらっと かわるので、3つ セットで おぼえよう。",
    en: "おわりに n や en が つく かたち。",
    double: `${q.answer} の まんなかの ぼいんは みじかい おと なので、もじを かさねて en を つける（${q.misspell} では ない）。`,
    wn: "おわりが w・n に なる なかま（flown・drawn・grown）。",
  };
  return `${q.base} → ${q.past} → ${q.answer}。have / has の あとには 3つめの かたち（${q.answer}）を つかうよ。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// 短縮形 I've / haven't / she's（has）
// ---------------------------------------------------------------------------

/** 短縮形（小文字） → もとの 2語・まちがいの つづり */
const CONTR: Record<string, { full: string; wrong: [string, string] }> = {
  "i've": { full: "I have", wrong: ["Ive", "I'have"] },
  "you've": { full: "you have", wrong: ["youve", "you'have"] },
  "we've": { full: "we have", wrong: ["weve", "we'have"] },
  "they've": { full: "they have", wrong: ["theyve", "they'have"] },
  "haven't": { full: "have not", wrong: ["havent", "have'nt"] },
  "hasn't": { full: "has not", wrong: ["hasnt", "has'nt"] },
  "she's": { full: "she has", wrong: ["shes", "she'has"] },
  "he's": { full: "he has", wrong: ["hes", "he'has"] },
  "it's": { full: "it has", wrong: ["it'has", "its'"] }, // its（その）は ほんとうに ある ことばなので 入れない
  "who's": { full: "who has", wrong: ["whos", "who'has"] },
};

export interface ContrQuestion {
  full: string;
  answer: string;
  wrong: [string, string];
  /** 's が has の みじかい かたち（she's ＝ she is と まちがえやすい） */
  hasS: boolean;
}

/** 表に ある 短縮形の 問題（大文字・小文字は ことばの とおり）。表に なければ null */
export function contrOf(word: string): ContrQuestion | null {
  const c = CONTR[word.toLowerCase()];
  if (!c) return null;
  return { full: c.full, answer: word, wrong: c.wrong, hasS: word.toLowerCase().endsWith("'s") };
}

export function contrWhy(q: ContrQuestion): string {
  const gone = q.full.endsWith("not") ? "o" : "ha";
  const s = q.hasS ? `${q.answer} は「${q.full.split(" ")[0]} is」の ことも あるけど、うしろに been・seen の ような かたちが あれば has の みじかい かたち。` : "";
  return `${q.full} を みじかく すると ${q.answer}。' は きえた もじ（${gone}）の しるし だよ。${s}`;
}

// ---------------------------------------------------------------------------
// over- / under-
// ---------------------------------------------------------------------------

export const OU_MEANING: Record<string, string> = { over: "うえ・こえて・〜すぎる", under: "した" };
/** over- / under- の 問題の まちがいの いみ（ほかの はじめの パーツ: pre- ＝ まえ、re- ＝ もう いちど） */
const OU_OTHERS = ["まえ", "もう いちど"] as const;

/** ことば → はじめの パーツ・のこりの パーツ・のこりの いみ・ことばの いみ */
const OU: Record<string, { part: "over" | "under"; rest: string; restMeaning: string; meaning: string }> = {
  overlook: { part: "over", rest: "look", restMeaning: "みる", meaning: "みおろす" },
  overpass: { part: "over", rest: "pass", restMeaning: "とおる", meaning: "ほどうきょう・せんろの うえの みち" },
  overflow: { part: "over", rest: "flow", restMeaning: "ながれる", meaning: "あふれる" },
  overtake: { part: "over", rest: "take", restMeaning: "とる", meaning: "おいこす" },
  overhead: { part: "over", rest: "head", restMeaning: "あたま", meaning: "あたまの うえの" },
  overcoat: { part: "over", rest: "coat", restMeaning: "うわぎ", meaning: "オーバー（いちばん うえに きる コート）" },
  overnight: { part: "over", rest: "night", restMeaning: "よる", meaning: "ひとばん じゅう・よどおし" },
  overeat: { part: "over", rest: "eat", restMeaning: "たべる", meaning: "たべすぎる" },
  oversleep: { part: "over", rest: "sleep", restMeaning: "ねむる", meaning: "ねぼうする" },
  underwater: { part: "under", rest: "water", restMeaning: "みず", meaning: "すいちゅうの" },
  underline: { part: "under", rest: "line", restMeaning: "せん", meaning: "かせんを ひく" },
  undersea: { part: "under", rest: "sea", restMeaning: "うみ", meaning: "かいていの" },
  underpass: { part: "under", rest: "pass", restMeaning: "とおる", meaning: "ちかどう・せんろの したの みち" },
  underground: { part: "under", rest: "ground", restMeaning: "じめん", meaning: "ちかの・ちかてつ" },
  undershirt: { part: "under", rest: "shirt", restMeaning: "シャツ", meaning: "したに きる シャツ" },
};

export interface OverUnderQuestion {
  part: "over" | "under";
  answer: string;
  choices: string[];
  meaning: string;
  rest: string;
  restMeaning: string;
}

/** 表に ある ことばで、focus（"over-" / "under-"）に あう パーツの いみを 問う。あてはまらなければ null */
export function overUnderOf(word: string, focus: readonly string[]): OverUnderQuestion | null {
  const o = OU[word.toLowerCase()];
  if (!o) return null;
  if (!focus.some((f) => f === `${o.part}-`)) return null;
  const other = o.part === "over" ? "under" : "over";
  const answer = OU_MEANING[o.part];
  return { part: o.part, answer, choices: [answer, OU_MEANING[other], ...OU_OTHERS], meaning: o.meaning, rest: o.rest, restMeaning: o.restMeaning };
}

export function overUnderWhy(word: string, q: OverUnderQuestion): string {
  const ex = q.part === "over" ? "over は「うえ・こえて」。たべすぎる（overeat）の ように「〜すぎる」の いみにも なるよ。" : "under は「した」。";
  return `${word}（${q.meaning}）は ${q.part}（${q.answer}）＋ ${q.rest}（${q.restMeaning}）。${ex}`;
}

// ---------------------------------------------------------------------------
// im- / in-（はんたいの いみ）
// ---------------------------------------------------------------------------

/** im- / in- の ことば → もとの ことば・いみ・まちがい（ほんとうには ない つづり。inpatient の ように ある ことばは 入れない） */
const IMIN: Record<string, { base: string; baseMeaning: string; meaning: string; wrong: [string, string] }> = {
  impossible: { base: "possible", baseMeaning: "できる", meaning: "できない・ありえない", wrong: ["inpossible", "unpossible"] },
  impolite: { base: "polite", baseMeaning: "れいぎ ただしい", meaning: "しつれいな", wrong: ["inpolite", "unpolite"] },
  imperfect: { base: "perfect", baseMeaning: "かんぺきな", meaning: "かんぺきでは ない", wrong: ["inperfect", "unperfect"] },
  impatient: { base: "patient", baseMeaning: "がまんづよい", meaning: "がまん できない・せっかちな", wrong: ["unpatient", "impatiant"] },
  invisible: { base: "visible", baseMeaning: "みえる", meaning: "みえない", wrong: ["imvisible", "unvisible"] },
  incorrect: { base: "correct", baseMeaning: "ただしい", meaning: "まちがった", wrong: ["imcorrect", "uncorrect"] },
  incomplete: { base: "complete", baseMeaning: "そろった・できあがった", meaning: "できあがって いない", wrong: ["imcomplete", "uncomplete"] },
  inexpensive: { base: "expensive", baseMeaning: "（ねだんが）たかい", meaning: "やすい", wrong: ["imexpensive", "unexpensive"] },
  informal: { base: "formal", baseMeaning: "あらたまった", meaning: "くだけた・ふだんの", wrong: ["imformal", "unformal"] },
};

export interface ImInQuestion {
  base: string;
  answer: string;
  wrong: [string, string];
  prefix: "im" | "in";
  baseMeaning: string;
  meaning: string;
}

/** 表に ある im- / in- の ことばの 問題。表に なければ null */
export function imInOf(word: string): ImInQuestion | null {
  const w = word.toLowerCase();
  const x = IMIN[w];
  if (!x) return null;
  return { base: x.base, answer: w, wrong: x.wrong, prefix: w.startsWith("im") ? "im" : "in", baseMeaning: x.baseMeaning, meaning: x.meaning };
}

export function imInWhy(q: ImInQuestion): string {
  const tail = q.prefix === "im"
    ? `${q.base} は p で はじまるので in では なく im（p・b・m の まえは くちを とじる m に なる）。`
    : `${q.base} は p・b・m 以外で はじまるので in。`;
  return `${q.base}（${q.baseMeaning}）の はんたいは ${q.answer}（${q.meaning}）。un- では なく ${q.prefix}- を つける ことばだよ。${tail}`;
}

/** フォーカスの ボタンの 読み上げ（ワールド24）。おわり・はじめ・短縮形を そのまま よまず、その回の ことばで よむ。地名の はくの 形は ワールド12 の きまりで ことば まるごと。あてはまらなければ null */
export function w24Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  // まえの ワールドの 回（she's・it's が まじる ワールド15 の 回など）の 読み上げを かえない ように、その回の ことばが ぜんぶ ワールド24 の 表に ある ときだけ
  const inW24 = (w: string) => !!(PLACE[lw(w)] || PP[lw(w)] || CONTR[lw(w)] || OU[lw(w)] || IMIN[lw(w)]);
  if (words.length === 0 || !words.every(inW24)) return null;
  if ((W24_PP_FOCUS as readonly string[]).includes(focus)) return words.find((w) => PP[lw(w)] && lw(w).endsWith(focus.slice(1))) ?? null;
  if ((W24_CONTRACTION_FOCUS as readonly string[]).includes(focus)) return words.find((w) => CONTR[lw(w)] && lw(w).includes(focus)) ?? null;
  if ((W24_OU_FOCUS as readonly string[]).includes(focus)) return words.find((w) => OU[lw(w)]?.part === focus.slice(0, -1)) ?? null;
  if ((W24_IMIN_FOCUS as readonly string[]).includes(focus)) return words.find((w) => IMIN[lw(w)] && lw(w).startsWith(focus.slice(0, -1))) ?? null;
  return null;
}
