/**
 * ワールド25（なぞときの洞くつ・L721〜750・ステージ3）の フォニックス・つづりの表。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - -ness（darkness, sadness, kindness）: 「『〜さ』を あらわす ことばは どれ？」（dark（くらい）→ darkness / darkly / darker。happy は happyness も）
 * - -ive（detective, creative, active）: 「ive の ことばで ただしい つづりは どれ？」（create → creative / creativ / createive）
 * - 複合語（footprint, flashlight, somebody）: 「あと 1つの ことばは どれ？」（＿＿print（あしあと）→ foot / ear / sky）
 * - にた いみの ことば（huge, tiny, giant）: 「にた いみの ことばは どれ？」（huge（とても おおきい）→ big / small / quiet）
 * - しつもんの イントネーション: 「この しつもんの おわりは？」（What is it? → ↘ さがる、Is it bigger than a box? → ↗ あがる）
 *
 * focus の かきかた: "-ness" "-ive"、複合語は 2つに わけた 形 "foot-print"、にた いみの ことばは ことば そのもの "huge"、
 * イントネーションは しつもん そのもの（? なし）"Is it bigger than a box"。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド25 が はじまる レッスン（それより前の 回では ワールド25 の 問題に しない） */
export const W25_START = 721;

export const W25_NESS_FOCUS = "-ness";
export const W25_IVE_FOCUS = "-ive";

// ---------------------------------------------------------------------------
// -ness（ようすの ことば → 「〜さ」の なまえの ことば）
// ---------------------------------------------------------------------------

/** -ness の ことば → もとの ことば・いみ・まちがいの 選択肢（-ly の ことば・-er の ことば、y で おわる ことばは y の まま つけた つづりも） */
const NESS: Record<string, { base: string; baseMeaning: string; meaning: string; ly: string; er: string; misspell?: string }> = {
  darkness: { base: "dark", baseMeaning: "くらい", meaning: "くらやみ・くらさ", ly: "darkly", er: "darker" },
  brightness: { base: "bright", baseMeaning: "あかるい", meaning: "あかるさ", ly: "brightly", er: "brighter" },
  softness: { base: "soft", baseMeaning: "やわらかい", meaning: "やわらかさ", ly: "softly", er: "softer" },
  coldness: { base: "cold", baseMeaning: "つめたい", meaning: "つめたさ", ly: "coldly", er: "colder" },
  sadness: { base: "sad", baseMeaning: "かなしい", meaning: "かなしみ", ly: "sadly", er: "sadder" },
  happiness: { base: "happy", baseMeaning: "しあわせな", meaning: "しあわせ", ly: "happily", er: "happier", misspell: "happyness" },
  kindness: { base: "kind", baseMeaning: "やさしい", meaning: "やさしさ", ly: "kindly", er: "kinder" },
  weakness: { base: "weak", baseMeaning: "よわい", meaning: "よわさ・にがてな ところ", ly: "weakly", er: "weaker" },
  loudness: { base: "loud", baseMeaning: "（おとが）おおきい", meaning: "おとの おおきさ", ly: "loudly", er: "louder" },
  sweetness: { base: "sweet", baseMeaning: "あまい", meaning: "あまさ", ly: "sweetly", er: "sweeter" },
  freshness: { base: "fresh", baseMeaning: "しんせんな", meaning: "しんせんさ", ly: "freshly", er: "fresher" },
  thickness: { base: "thick", baseMeaning: "ぶあつい", meaning: "あつさ（ぶあつさ）", ly: "thickly", er: "thicker" },
  fairness: { base: "fair", baseMeaning: "こうへいな", meaning: "こうへいさ", ly: "fairly", er: "fairer" },
  cleverness: { base: "clever", baseMeaning: "かしこい", meaning: "かしこさ", ly: "cleverly", er: "cleverer" },
  laziness: { base: "lazy", baseMeaning: "なまけた", meaning: "なまけぐせ", ly: "lazily", er: "lazier", misspell: "lazyness" },
  tidiness: { base: "tidy", baseMeaning: "きちんとした", meaning: "きちんと して いる こと", ly: "tidily", er: "tidier", misspell: "tidyness" },
};

/** ワールド21（-ment / -ness）の 表にも ある ことば（読み上げで ワールド21 の 回と 見わける ため） */
const W21_SHARED_NESS = new Set(["darkness", "brightness", "softness", "sadness", "happiness", "kindness"]);

export interface NessQuestion {
  base: string;
  baseMeaning: string;
  answer: string;
  meaning: string;
  /** まちがいの 選択肢（-ly・-er、y で おわる ことばは y の まま つけた つづりも） */
  wrong: string[];
  ly: string;
  er: string;
  /** y を i に かえる ことば */
  yToI: boolean;
}

/** 表に ある -ness の ことばの 問題。表に なければ null */
export function nessOf(word: string): NessQuestion | null {
  const w = word.toLowerCase();
  const n = NESS[w];
  if (!n) return null;
  return { base: n.base, baseMeaning: n.baseMeaning, answer: w, meaning: n.meaning, wrong: [n.ly, n.er, ...(n.misspell ? [n.misspell] : [])], ly: n.ly, er: n.er, yToI: !!n.misspell };
}

export function nessDisplay(q: NessQuestion): string {
  return `${q.base}（${q.baseMeaning}）→ ？（${q.meaning}）`;
}

export function nessWhy(q: NessQuestion): string {
  const y = q.yToI ? `${q.base} の ように しいん ＋ y で おわる ことばは、y を i に かえて ness（${q.base}ness では ない）。` : "";
  return `${q.base}（${q.baseMeaning}）に ness を つけると ${q.answer}（${q.meaning}）。ness は ようすの ことばを「〜さ」の なまえの ことばに する。${q.ly} は「〜に」と ようすを くわしく する ことば、${q.er} は「もっと 〜」の ことば。${y}`;
}

// ---------------------------------------------------------------------------
// -ive（〜する せいしつの・〜の）
// ---------------------------------------------------------------------------

export type IveTrap = "plain" | "drop-e" | "change" | "ative";

/** -ive の ことば → もとの ことば・いみ・わなの 種類・まちがいの つづり（v で おわる つづり・もう 1つ） */
const IVE: Record<string, { base: string; baseMeaning: string; meaning: string; trap: IveTrap; wrong: [string, string] }> = {
  active: { base: "act", baseMeaning: "する・うごく", meaning: "かつどうてきな・げんきな", trap: "plain", wrong: ["activ", "actative"] },
  detective: { base: "detect", baseMeaning: "みつけだす", meaning: "たんてい・たんていの", trap: "plain", wrong: ["detectiv", "detectative"] },
  inventive: { base: "invent", baseMeaning: "はつめいする", meaning: "くふうずきな", trap: "plain", wrong: ["inventiv", "inventative"] },
  impressive: { base: "impress", baseMeaning: "かんしんさせる", meaning: "すばらしい・みごとな", trap: "plain", wrong: ["impressiv", "impressative"] },
  attractive: { base: "attract", baseMeaning: "ひきつける", meaning: "みりょくてきな", trap: "plain", wrong: ["attractiv", "attractative"] },
  protective: { base: "protect", baseMeaning: "まもる", meaning: "まもって くれる", trap: "plain", wrong: ["protectiv", "protectative"] },
  massive: { base: "mass", baseMeaning: "かたまり", meaning: "とても おおきくて おもい", trap: "plain", wrong: ["massiv", "massative"] },
  supportive: { base: "support", baseMeaning: "ささえる", meaning: "ささえて くれる", trap: "plain", wrong: ["supportiv", "supportative"] },
  creative: { base: "create", baseMeaning: "つくりだす", meaning: "そうぞうりょくの ある", trap: "drop-e", wrong: ["creativ", "createive"] },
  expensive: { base: "expense", baseMeaning: "ひよう", meaning: "（ねだんが）たかい", trap: "drop-e", wrong: ["expensiv", "expenseive"] },
  decorative: { base: "decorate", baseMeaning: "かざる", meaning: "かざりの", trap: "drop-e", wrong: ["decorativ", "decorateive"] },
  explosive: { base: "explode", baseMeaning: "ばくはつする", meaning: "ばくはつしやすい", trap: "change", wrong: ["explosiv", "explodive"] },
  descriptive: { base: "describe", baseMeaning: "せつめいする", meaning: "くわしく せつめいする", trap: "change", wrong: ["descriptiv", "describive"] },
  defensive: { base: "defend", baseMeaning: "まもる", meaning: "まもりの", trap: "change", wrong: ["defensiv", "defendive"] },
  talkative: { base: "talk", baseMeaning: "はなす", meaning: "おしゃべりな", trap: "ative", wrong: ["talkativ", "talkive"] },
  imaginative: { base: "imagine", baseMeaning: "そうぞうする", meaning: "そうぞうりょく ゆたかな", trap: "ative", wrong: ["imaginativ", "imaginive"] },
};

export interface IveQuestion {
  base: string;
  baseMeaning: string;
  answer: string;
  meaning: string;
  wrong: [string, string];
  trap: IveTrap;
}

/** 表に ある -ive の ことばの 問題。表に なければ null */
export function iveOf(word: string): IveQuestion | null {
  const w = word.toLowerCase();
  const x = IVE[w];
  if (!x) return null;
  return { base: x.base, baseMeaning: x.baseMeaning, answer: w, meaning: x.meaning, wrong: x.wrong, trap: x.trap };
}

export function iveDisplay(q: IveQuestion): string {
  return `${q.base}（${q.baseMeaning}）→ ？（${q.meaning}）`;
}

export function iveWhy(q: IveQuestion): string {
  const tail: Record<IveTrap, string> = {
    plain: `${q.base} に そのまま ive を つける。`,
    "drop-e": `${q.base} の おわりの e を とってから ive を つける。`,
    change: `${q.base} → ${q.answer} と、おわりの つづりが かわる なかま（explode → explosive・describe → descriptive・defend → defensive）。`,
    ative: `${q.answer} は ive では なく ative に なる なかま（talk → talkative・imagine → imaginative）。`,
  };
  return `${q.base}（${q.baseMeaning}）→ ${q.answer}（${q.meaning}）。ive を つけると「〜する せいしつの」の ようすの ことばに なる。英語の ことばは v で おわらないので、さいごの e を わすれずに。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// 複合語（footprint = foot ＋ print）
// ---------------------------------------------------------------------------

/** 複合語 → 2つの パーツ・かくす ほう（0 か 1）・いみ・パーツの いみ・まちがいの 選択肢（いみが あわない パーツ） */
const COMPOUND: Record<string, { parts: [string, string]; blank: 0 | 1; meaning: string; partMeanings: [string, string]; wrong: [string, string] }> = {
  footprint: { parts: ["foot", "print"], blank: 0, meaning: "あしあと", partMeanings: ["あし", "あと・しるし"], wrong: ["ear", "sky"] },
  fingerprint: { parts: ["finger", "print"], blank: 0, meaning: "しもん", partMeanings: ["ゆび", "あと・しるし"], wrong: ["nose", "rain"] },
  flashlight: { parts: ["flash", "light"], blank: 1, meaning: "かいちゅうでんとう", partMeanings: ["ぴかっと ひかる", "あかり"], wrong: ["ball", "book"] },
  somebody: { parts: ["some", "body"], blank: 0, meaning: "だれか", partMeanings: ["ある・いくつかの", "からだ・ひと"], wrong: ["every", "no"] },
  nobody: { parts: ["no", "body"], blank: 0, meaning: "だれも 〜ない", partMeanings: ["ない", "からだ・ひと"], wrong: ["some", "every"] },
  somewhere: { parts: ["some", "where"], blank: 0, meaning: "どこか", partMeanings: ["ある・いくつかの", "どこ"], wrong: ["no", "every"] },
  everywhere: { parts: ["every", "where"], blank: 0, meaning: "どこでも・いたる ところ", partMeanings: ["どの 〜も", "どこ"], wrong: ["some", "no"] },
  something: { parts: ["some", "thing"], blank: 1, meaning: "なにか", partMeanings: ["ある・いくつかの", "もの"], wrong: ["body", "where"] },
  keyhole: { parts: ["key", "hole"], blank: 1, meaning: "かぎあな", partMeanings: ["かぎ", "あな"], wrong: ["cup", "sun"] },
  footstep: { parts: ["foot", "step"], blank: 1, meaning: "あしおと", partMeanings: ["あし", "いっぽ"], wrong: ["ball", "cake"] },
  moonlight: { parts: ["moon", "light"], blank: 0, meaning: "つきの ひかり", partMeanings: ["つき", "ひかり"], wrong: ["sun", "star"] },
  waterfall: { parts: ["water", "fall"], blank: 1, meaning: "たき", partMeanings: ["みず", "おちる"], wrong: ["bird", "cup"] },
  doorway: { parts: ["door", "way"], blank: 0, meaning: "いりぐち", partMeanings: ["ドア", "みち"], wrong: ["sky", "milk"] },
  staircase: { parts: ["stair", "case"], blank: 1, meaning: "かいだん", partMeanings: ["（かいだんの）だん", "わく・いれもの"], wrong: ["ball", "road"] },
  bookshelf: { parts: ["book", "shelf"], blank: 0, meaning: "ほんだな", partMeanings: ["ほん", "たな"], wrong: ["fish", "rain"] },
  notebook: { parts: ["note", "book"], blank: 1, meaning: "ノート", partMeanings: ["メモ", "ほん"], wrong: ["ball", "shoe"] },
};

export interface CompoundQuestion {
  parts: [string, string];
  blank: 0 | 1;
  answer: string;
  wrong: [string, string];
  meaning: string;
  partMeanings: [string, string];
}

/** 表に ある 複合語で、focus に 2つに わけた 形（"foot-print"）が ある ものの 問題。あてはまらなければ null */
export function compoundOf(word: string, focus: readonly string[]): CompoundQuestion | null {
  const c = COMPOUND[word.toLowerCase()];
  if (!c) return null;
  if (!focus.some((f) => f.toLowerCase() === c.parts.join("-"))) return null;
  return { parts: c.parts, blank: c.blank, answer: c.parts[c.blank], wrong: c.wrong, meaning: c.meaning, partMeanings: c.partMeanings };
}

/** 表に ある 複合語の 2つに わけた 形（focus に つかう。表に なければ null） */
export function compoundFocus(word: string): string | null {
  return COMPOUND[word.toLowerCase()]?.parts.join("-") ?? null;
}

export function compoundDisplay(q: CompoundQuestion): string {
  const shown = q.parts.map((p, i) => (i === q.blank ? "＿＿" : p)).join("");
  return `${shown}（${q.meaning}）`;
}

export function compoundWhy25(word: string, q: CompoundQuestion): string {
  return `${word}（${q.meaning}）は ${q.parts[0]}（${q.partMeanings[0]}）＋ ${q.parts[1]}（${q.partMeanings[1]}）。2つの ことばの いみを たすと、しらない ことばの いみも わかるよ。`;
}

// ---------------------------------------------------------------------------
// にた いみの ことば（huge ≒ big, tiny ≒ small）
// ---------------------------------------------------------------------------

/** ことば → いみ・にた いみの ことば（こたえ）・まちがい（はんたいの いみ・べつの いみ）・ひとこと */
const SYN: Record<string, { meaning: string; answer: string; wrong: [string, string]; note?: string }> = {
  huge: { meaning: "とても おおきい", answer: "big", wrong: ["small", "quiet"], note: "big より ずっと おおきい ときに つかう。" },
  giant: { meaning: "きょじんの ように おおきい", answer: "big", wrong: ["tiny", "fast"], note: "big より ずっと おおきい ときに つかう。なまえの ことばでは「きょじん」。" },
  enormous: { meaning: "ものすごく おおきい", answer: "big", wrong: ["little", "soft"], note: "huge と おなじ くらい おおきい。" },
  large: { meaning: "おおきい", answer: "big", wrong: ["small", "loud"], note: "サイズや かずに よく つかう（a large box・a large pizza）。" },
  tiny: { meaning: "とても ちいさい", answer: "small", wrong: ["huge", "dark"], note: "small より ずっと ちいさい ときに つかう。" },
  little: { meaning: "ちいさい", answer: "small", wrong: ["large", "bright"], note: "a little cat の ように、かわいい きもちが はいる ことも ある。" },
  silent: { meaning: "しーんと した", answer: "quiet", wrong: ["loud", "angry"], note: "おとが まったく しない ときに つかう。" },
  scared: { meaning: "こわがって いる", answer: "afraid", wrong: ["brave", "tired"], note: "I'm scared. ＝ I'm afraid." },
  strange: { meaning: "へんな・ふしぎな", answer: "weird", wrong: ["normal", "kind"], note: "なぞときでは Something is strange. と よく いう。" },
  clever: { meaning: "かしこい", answer: "smart", wrong: ["silly", "slow"], note: "めいたんていは clever！" },
  begin: { meaning: "はじめる・はじまる", answer: "start", wrong: ["finish", "forget"], note: "Let's begin. ＝ Let's start." },
  finish: { meaning: "おえる・おわる", answer: "end", wrong: ["start", "borrow"], note: "The show will finish at five. ＝ The show will end at five." },
  quick: { meaning: "すばやい", answer: "fast", wrong: ["slow", "empty"], note: "a quick answer（すばやい こたえ）の ように つかう。" },
  simple: { meaning: "かんたんな", answer: "easy", wrong: ["difficult", "late"], note: "This riddle is simple. ＝ This riddle is easy." },
  glad: { meaning: "うれしい", answer: "happy", wrong: ["sad", "heavy"], note: "I'm glad to see you. の ように つかう。" },
  correct: { meaning: "ただしい", answer: "right", wrong: ["wrong", "early"], note: "That's correct! ＝ That's right!" },
};

export interface SynQuestion {
  word: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
  note?: string;
}

/** 表に ある ことばで、focus に その ことばが ある ものの 問題。あてはまらなければ null */
export function synOf(word: string, focus: readonly string[]): SynQuestion | null {
  const w = word.toLowerCase();
  const s = SYN[w];
  if (!s) return null;
  if (!focus.some((f) => f.toLowerCase() === w)) return null;
  return { word: w, meaning: s.meaning, answer: s.answer, wrong: s.wrong, note: s.note };
}

export function synWhy(q: SynQuestion): string {
  return `${q.word}（${q.meaning}）は ${q.answer} と にた いみ。${q.note ?? ""}おなじ ことばを くりかえさず、にた ことばを つかうと せつめいが ゆたかに なるよ。`;
}

// ---------------------------------------------------------------------------
// しつもんの イントネーション（Wh は さがる ↘・Yes / No は あがる ↗）
// ---------------------------------------------------------------------------

export const INTONATION_CHOICES = ["↗ あがる", "↘ さがる", "→ かわらない"] as const;
export type IntonationKind = "wh" | "yesno";

/** しつもん（小文字・? なし） → 種類・いみ */
const INTON: Record<string, { kind: IntonationKind; meaning: string }> = {
  "what is it": { kind: "wh", meaning: "それは なに？" },
  "is it bigger than a box": { kind: "yesno", meaning: "はこより おおきい？" },
  "can it fly": { kind: "yesno", meaning: "それは とべる？" },
  "where does it live": { kind: "wh", meaning: "どこに すんで いる？" },
  "was the thief tall": { kind: "yesno", meaning: "どろぼうは せが たかかった？" },
  "who took the crown": { kind: "wh", meaning: "だれが おうかんを とったの？" },
  "did you see anything": { kind: "yesno", meaning: "なにか みた？" },
  "what color was it": { kind: "wh", meaning: "なにいろ だった？" },
  "where were you": { kind: "wh", meaning: "どこに いたの？" },
  "were you with haru": { kind: "yesno", meaning: "ハルと いっしょ だった？" },
  "why do you think so": { kind: "wh", meaning: "どうして そう おもうの？" },
  "are you sure": { kind: "yesno", meaning: "ほんとうに？（たしか？）" },
  "do you know who took it": { kind: "yesno", meaning: "だれが とったか しってる？" },
  "how did you know": { kind: "wh", meaning: "どうして わかったの？" },
  "does it like shiny things": { kind: "yesno", meaning: "それは ぴかぴかの ものが すき？" },
  "when did it happen": { kind: "wh", meaning: "いつ おきたの？" },
  "who ate the cookies": { kind: "wh", meaning: "だれが クッキーを たべたの？" },
  "is something strange": { kind: "yesno", meaning: "なにか へん？" },
  "where did it go": { kind: "wh", meaning: "どこへ いったの？" },
  "was it the crow": { kind: "yesno", meaning: "カラス だったの？" },
  "who did it": { kind: "wh", meaning: "だれが やったの？" },
  "is the case closed": { kind: "yesno", meaning: "じけんは かいけつ？" },
};

export interface IntonationQuestion {
  phrase: string;
  kind: IntonationKind;
  answer: (typeof INTONATION_CHOICES)[number];
  meaning: string;
}

/** 表に ある しつもん（大文字・小文字・おわりの ? は とわない）の 問題。表に なければ null */
export function intonationOf(phrase: string): IntonationQuestion | null {
  const p = phrase.toLowerCase().replace(/\?$/, "").trim();
  const x = INTON[p];
  if (!x) return null;
  return { phrase: p, kind: x.kind, answer: x.kind === "wh" ? INTONATION_CHOICES[1] : INTONATION_CHOICES[0], meaning: x.meaning };
}

export function intonationWhy(phrase: string, q: IntonationQuestion): string {
  const text = phrase.replace(/\?$/, "");
  const first = text.split(" ")[0];
  if (q.kind === "wh") return `${text}?（${q.meaning}）は ${first} で はじまる しつもん。こたえが Yes / No では ないので、ふつうは おわりを さげて よむ ↘。`;
  const inner = /\b(who|what|where|when|why|how)\b/i.exec(text.split(" ").slice(1).join(" "));
  const note = inner ? `なかに ${inner[1]} が あっても、${text.split(" ").slice(0, 3).join(" ")} で はじまるので Yes / No の しつもん。` : "";
  return `${text}?（${q.meaning}）は ${first} で はじまる しつもん。Yes / No で こたえるので、おわりを あげて よむ ↗。${note}`;
}

/** フォーカスの ボタンの 読み上げ（ワールド25）。-ness・-ive は その回の ことばで よむ（複合語は ワールド12 の きまりで ことば まるごと、ことば・しつもんは そのまま）。あてはまらなければ null */
export function w25Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  // まえの ワールドの -ness の 回（kindness・agreement が まじる ワールド21 の 回など）の 読み上げを かえない ように、
  // その回の ことばが ぜんぶ ワールド25 の 表に あり、ワールド21 の -ness の 回と かさならない ことばが 1つ 以上 ある ときだけ
  // （L720 までの どの 回でも はたらかない ことを テストで たしかめる）
  const inW25 = (w: string) => !!(NESS[lw(w)] || IVE[lw(w)] || COMPOUND[lw(w)] || SYN[lw(w)] || INTON[lw(w)]);
  if (words.length === 0 || !words.every(inW25) || words.every((w) => W21_SHARED_NESS.has(lw(w)))) return null;
  if (focus === W25_NESS_FOCUS) return words.find((w) => NESS[lw(w)]) ?? null;
  if (focus === W25_IVE_FOCUS) return words.find((w) => IVE[lw(w)]) ?? null;
  return null;
}
