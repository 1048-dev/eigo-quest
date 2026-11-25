/**
 * ワールド27（いずみの里・L781〜810・ステージ3）の フォニックス・つづりの表（からだと けんこうの ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - k の おとの ch と -ache（echo, stomach, headache）: 「ただしい つづりは どれ？」（ずつう → headache / headake / hedache）
 * - だまって いる もじ（knee, wrist, thumb, muscle, calf, hour, should, listen）: 「こえに ださない もじは どれ？」（knee → k / n / e）
 * - for と since の リズム: 「＿＿ に 入る ことばは どれ？」（I've lived here ＿＿ ten years. → for / since / from。選択肢は きまった 順）
 * - -able（comfortable, enjoyable）: 「able の ことばで ただしい つづりは どれ？」（comfort → comfortable / comfortible / comfortabel）
 * - 同音異義語 2（week / weak, here / hear, flour / flower）: 「ぶんに あう ことばは どれ？」（I have a cold. I feel ＿＿. → weak / week / wake）
 *
 * focus の かきかた:
 * - k の おとの ch は "ch"、-ache の ことばは "-ache"。
 * - だまって いる もじは その もじ（"k" "w" "b" "c" "h" "l" "t"）。
 * - for / since は "for" "since"。ことばは フレーズ（"for ten years" "since I was five"）。
 * - -able は "-able"。
 * - 同音異義語は ことば そのもの（"week" "weak"。focus は ことばの なかの つづりで ないと いけない ため。おなじ 回に ペアで ならべる）。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド27 が はじまる レッスン（それより前の 回では ワールド27 の 問題に しない） */
export const W27_START = 781;

export const W27_CH_FOCUS = "ch";
export const W27_ACHE_FOCUS = "-ache";
export const W27_ABLE_FOCUS = "-able";

// ---------------------------------------------------------------------------
// k の おとの ch と -ache
// ---------------------------------------------------------------------------

/** ことば → いみ・まちがいの つづり 2つ。-ache の ことばは 2つの パーツも */
const CH_K: Record<string, { meaning: string; wrong: [string, string]; parts?: [string, string] }> = {
  echo: { meaning: "こだま", wrong: ["ecko", "eko"] },
  school: { meaning: "がっこう", wrong: ["skool", "scool"] },
  chorus: { meaning: "がっしょう", wrong: ["korus", "chorous"] },
  character: { meaning: "とうじょうじんぶつ・キャラクター", wrong: ["caracter", "charactor"] },
  ache: { meaning: "（ずきずき）いたむ・いたみ", wrong: ["ake", "aiche"] },
  stomach: { meaning: "おなか・い", wrong: ["stomack", "stomac"] },
  orchestra: { meaning: "オーケストラ", wrong: ["orkestra", "orchastra"] },
  christmas: { meaning: "クリスマス", wrong: ["Krismas", "Chrismas"] },
  anchor: { meaning: "（ふねの）いかり", wrong: ["ankor", "ancher"] },
  mechanic: { meaning: "せいびし（きかいを なおす ひと）", wrong: ["mekanic", "mechanick"] },
  headache: { meaning: "ずつう（あたまが いたい）", wrong: ["headake", "hedache"], parts: ["head", "ache"] },
  toothache: { meaning: "はいた（はが いたい）", wrong: ["toothake", "tuthache"], parts: ["tooth", "ache"] },
  earache: { meaning: "みみが いたい こと", wrong: ["earake", "eerache"], parts: ["ear", "ache"] },
  stomachache: { meaning: "ふくつう（おなかが いたい）", wrong: ["stomakache", "stomachake"], parts: ["stomach", "ache"] },
  bellyache: { meaning: "おなかいた（こどもの ことば）", wrong: ["bellyake", "bellyach"], parts: ["belly", "ache"] },
  backache: { meaning: "ようつう（せなか・こしが いたい）", wrong: ["backake", "bakache"], parts: ["back", "ache"] },
};

export interface ChKQuestion {
  word: string;
  focus: typeof W27_CH_FOCUS | typeof W27_ACHE_FOCUS;
  meaning: string;
  answer: string;
  wrong: [string, string];
  parts?: [string, string];
}

/** 表に ある k の おとの ch・-ache の ことばの 問題。表に なければ null（Christmas は 大文字で こたえる） */
export function chKOf(word: string): ChKQuestion | null {
  const w = word.toLowerCase();
  const x = CH_K[w];
  if (!x) return null;
  const answer = w === "christmas" ? "Christmas" : w;
  return { word: w, focus: x.parts ? W27_ACHE_FOCUS : W27_CH_FOCUS, meaning: x.meaning, answer, wrong: x.wrong, parts: x.parts };
}

export function chKWhy(q: ChKQuestion): string {
  if (q.parts) return `${q.answer}（${q.meaning}）は ${q.parts[0]} ＋ ache。ache（エイク）の ch は k の おと、さいごの e は よまない。からだの ばしょ ＋ ache で「〜が いたい」に なるよ。`;
  return `${q.answer}（${q.meaning}）の ch は「チ」では なく k の おと。ギリシャ語から きた ことばに おおい つづり（school・echo・stomach・ache）。k や ck では なく ch と かくよ。`;
}

// ---------------------------------------------------------------------------
// だまって いる もじ（からだと けんこうの ことば）
// ---------------------------------------------------------------------------

/** ことば → だまって いる もじ（focus）・いみ・よみかた・まちがいの 選択肢（よむ もじ 2つ） */
const SILENT: Record<string, { letter: string; meaning: string; kana: string; wrong: [string, string] }> = {
  knee: { letter: "k", meaning: "ひざ", kana: "ニー", wrong: ["n", "e"] },
  wrist: { letter: "w", meaning: "てくび", kana: "リスト", wrong: ["r", "t"] },
  answer: { letter: "w", meaning: "こたえ・こたえる", kana: "アンサー", wrong: ["n", "r"] },
  thumb: { letter: "b", meaning: "おやゆび", kana: "サム", wrong: ["m", "u"] },
  climb: { letter: "b", meaning: "のぼる", kana: "クライム", wrong: ["c", "m"] },
  hour: { letter: "h", meaning: "1じかん", kana: "アワー", wrong: ["r", "u"] },
  honest: { letter: "h", meaning: "しょうじきな", kana: "オネスト", wrong: ["n", "t"] },
  should: { letter: "l", meaning: "〜した ほうが いい", kana: "シュッド", wrong: ["s", "d"] },
  muscle: { letter: "c", meaning: "きんにく", kana: "マッスル", wrong: ["s", "m"] },
  calf: { letter: "l", meaning: "ふくらはぎ", kana: "キャフ", wrong: ["c", "f"] },
  palm: { letter: "l", meaning: "てのひら", kana: "パーム", wrong: ["p", "m"] },
  walk: { letter: "l", meaning: "あるく", kana: "ウォーク", wrong: ["w", "k"] },
  talk: { letter: "l", meaning: "はなす", kana: "トーク", wrong: ["t", "k"] },
  half: { letter: "l", meaning: "はんぶん", kana: "ハーフ", wrong: ["h", "f"] },
  salmon: { letter: "l", meaning: "さけ（さかな）", kana: "サモン", wrong: ["s", "m"] },
  listen: { letter: "t", meaning: "きく", kana: "リスン", wrong: ["s", "n"] },
};

export interface SilentQuestion {
  word: string;
  letter: string;
  meaning: string;
  kana: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある ことばの 問題。表に なければ null */
export function silentOf(word: string): SilentQuestion | null {
  const w = word.toLowerCase();
  const x = SILENT[w];
  if (!x) return null;
  return { word: w, letter: x.letter, meaning: x.meaning, kana: x.kana, answer: x.letter, wrong: x.wrong };
}

export function silentWhy(q: SilentQuestion): string {
  const family: Record<string, string> = {
    k: "kn の k は よまない（knee）。",
    w: "wr の w は よまない（wrist）。answer の w も だまって いる。",
    b: "mb の b は よまない（thumb・climb）。",
    c: "sc の c は よまない（muscle）。",
    h: "hour・honest の h は よまない。だから an hour・an honest ～ と an を つかう。",
    l: "alk・alf・alm の l は よまない（walk・talk・half・calf・palm）。salmon・should の l も だまって いる。",
    t: "sten の t は よまない（listen）。",
  };
  return `${q.word}（${q.meaning}）は「${q.kana}」と よむ。${family[q.letter] ?? ""}${q.letter} は かくけど こえに ださない もじ。かく ときは わすれずに！`;
}

// ---------------------------------------------------------------------------
// for と since の リズム
// ---------------------------------------------------------------------------

export const FOR_SINCE_CHOICES = ["for", "since", "from"] as const;

/** フレーズ → 文（＿＿ に for / since が 入る）・いみ */
const FOR_SINCE: Record<string, { sentence: string; meaning: string }> = {
  "for ten years": { sentence: "I've lived here ＿＿ ten years.", meaning: "10ねん まえから ずっと" },
  "for many years": { sentence: "Granny Capy has lived in this village ＿＿ many years.", meaning: "なんねんも ずっと" },
  "for a long time": { sentence: "I've known Riko ＿＿ a long time.", meaning: "ながい あいだ ずっと" },
  "for six months": { sentence: "I've practiced judo ＿＿ six months.", meaning: "6かげつ まえから ずっと" },
  "since I was five": { sentence: "I've played the piano ＿＿ I was five.", meaning: "5さいの ときから ずっと" },
  "since April": { sentence: "I've known Haru ＿＿ April.", meaning: "4がつから ずっと" },
  "since kindergarten": { sentence: "Kiko and I have been friends ＿＿ kindergarten.", meaning: "ようちえんの ころから ずっと" },
  "since Monday": { sentence: "We've been in the village ＿＿ Monday.", meaning: "げつようびから ずっと" },
  "for three days": { sentence: "I've had a cough ＿＿ three days.", meaning: "3にち まえから ずっと" },
  "since last week": { sentence: "Toto has had a cold ＿＿ last week.", meaning: "せんしゅうから ずっと" },
  "for two hours": { sentence: "We've walked ＿＿ two hours.", meaning: "2じかん ずっと" },
  "since this morning": { sentence: "I've had a headache ＿＿ this morning.", meaning: "けさから ずっと" },
  "for a week": { sentence: "Birimo has stayed at the inn ＿＿ a week.", meaning: "1しゅうかん ずっと" },
  "since yesterday": { sentence: "Kiko has felt tired ＿＿ yesterday.", meaning: "きのうから ずっと" },
  "for five minutes": { sentence: "We've waited ＿＿ five minutes.", meaning: "5ふん ずっと" },
  "since lunch": { sentence: "I haven't eaten anything ＿＿ lunch.", meaning: "おひるから ずっと" },
};

export interface ForSinceQuestion {
  phrase: string;
  focus: "for" | "since";
  sentence: string;
  meaning: string;
  /** for / since の あとの ことば（ten years・Monday） */
  rest: string;
  answer: "for" | "since";
}

/** 表に ある フレーズの 問題。表に なければ null */
export function forSinceOf(phrase: string): ForSinceQuestion | null {
  const x = FOR_SINCE[phrase];
  if (!x) return null;
  const [head, ...rest] = phrase.split(" ");
  const focus = head as "for" | "since";
  return { phrase, focus, sentence: x.sentence, meaning: x.meaning, rest: rest.join(" "), answer: focus };
}

export function forSinceDisplay(q: ForSinceQuestion): string {
  return `${q.sentence}（${q.meaning}）`;
}

export function forSinceWhy(q: ForSinceQuestion): string {
  const sense = q.focus === "for"
    ? `for ＋ ながさ（${q.rest}）で「〜の あいだ ずっと」。`
    : `since ＋ はじまった とき（${q.rest}）で「〜から ずっと」。`;
  const rhythm = q.focus === "for"
    ? `よむ ときは for を よわく みじかく「ファ」、${q.rest} を つよく いう（for TEN YEARS）。`
    : `よむ ときは since を かるく、${q.rest} を つよく いう。`;
  return `${q.phrase}。${sense}${rhythm}from は I've ～ の 文では つかわない（from ～ to ～ の ときに つかう）。`;
}

// ---------------------------------------------------------------------------
// -able（〜できる・〜しやすい）
// ---------------------------------------------------------------------------

export type AbleTrap = "plain" | "drop-e" | "y" | "keep-e" | "double";

/** -able の ことば → もとの ことば・いみ・わなの 種類・まちがいの つづり 2つ */
const ABLE: Record<string, { base: string; baseMeaning: string; meaning: string; trap: AbleTrap; wrong: [string, string] }> = {
  comfortable: { base: "comfort", baseMeaning: "らくさ・ここちよさ", meaning: "いごこちの いい・らくな", trap: "plain", wrong: ["comfortible", "comfortabel"] },
  drinkable: { base: "drink", baseMeaning: "のむ", meaning: "のめる", trap: "plain", wrong: ["drinkible", "drinkabel"] },
  washable: { base: "wash", baseMeaning: "あらう", meaning: "あらえる", trap: "plain", wrong: ["washible", "washabel"] },
  valuable: { base: "value", baseMeaning: "かち", meaning: "たいせつな・かちの ある", trap: "drop-e", wrong: ["valueable", "valuible"] },
  enjoyable: { base: "enjoy", baseMeaning: "たのしむ", meaning: "たのしい", trap: "plain", wrong: ["enjoyible", "enjoiable"] },
  readable: { base: "read", baseMeaning: "よむ", meaning: "よみやすい", trap: "plain", wrong: ["readible", "readabel"] },
  believable: { base: "believe", baseMeaning: "しんじる", meaning: "しんじられる", trap: "drop-e", wrong: ["believeable", "believible"] },
  reliable: { base: "rely", baseMeaning: "たよる", meaning: "たよりに なる", trap: "y", wrong: ["relyable", "relible"] },
  foldable: { base: "fold", baseMeaning: "おる・たたむ", meaning: "おりたためる", trap: "plain", wrong: ["foldible", "foldabel"] },
  bendable: { base: "bend", baseMeaning: "まげる", meaning: "まげられる", trap: "plain", wrong: ["bendible", "bendabel"] },
  breakable: { base: "break", baseMeaning: "こわす", meaning: "こわれやすい", trap: "plain", wrong: ["breakible", "brakeable"] },
  adorable: { base: "adore", baseMeaning: "だいすきだ", meaning: "とても かわいい", trap: "drop-e", wrong: ["adoreable", "adorible"] },
  fixable: { base: "fix", baseMeaning: "なおす", meaning: "なおせる", trap: "plain", wrong: ["fixible", "fixabel"] },
  changeable: { base: "change", baseMeaning: "かわる", meaning: "かわりやすい", trap: "keep-e", wrong: ["changable", "changible"] },
  noticeable: { base: "notice", baseMeaning: "きづく", meaning: "めだつ・すぐ わかる", trap: "keep-e", wrong: ["noticable", "noticible"] },
  unforgettable: { base: "forget", baseMeaning: "わすれる", meaning: "わすれられない", trap: "double", wrong: ["unforgetable", "unforgettible"] },
};

export interface AbleQuestion {
  base: string;
  baseMeaning: string;
  answer: string;
  meaning: string;
  wrong: [string, string];
  trap: AbleTrap;
}

/** 表に ある -able の ことばの 問題。表に なければ null */
export function ableOf(word: string): AbleQuestion | null {
  const w = word.toLowerCase();
  const x = ABLE[w];
  if (!x) return null;
  return { base: x.base, baseMeaning: x.baseMeaning, answer: w, meaning: x.meaning, wrong: x.wrong, trap: x.trap };
}

export function ableDisplay(q: AbleQuestion): string {
  return `${q.base}（${q.baseMeaning}）→ ？（${q.meaning}）`;
}

export function ableWhy(q: AbleQuestion): string {
  const tail: Record<AbleTrap, string> = {
    plain: `${q.base} に そのまま able を つける。`,
    "drop-e": `${q.base} の おわりの e を とってから able を つける（${q.base}able では ない）。`,
    y: `${q.base} の y を i に かえてから able（${q.base}able では ない）。`,
    "keep-e": `${q.base} の e は とらない。c / g の あとの e を のこすと「ス」「ジ」の おとの まま よめる。`,
    double: `forget の t を 2つに して able。さらに un-（〜ない）が ついて「わすれられない」。`,
  };
  return `${q.base}（${q.baseMeaning}）→ ${q.answer}（${q.meaning}）。able は「〜できる・〜しやすい」。ible や abel と まちがえやすいけど、この ことばは able。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// 同音異義語 2（ワールド17 の see / sea などとは べつの ことば）
// ---------------------------------------------------------------------------

/** ことば → 文・いみ・おなじ おとの ことば・ほかの 選択肢・focus（2つの ことばを " / " で） */
const HOMO: Record<string, { sentence: string; meaning: string; same: string; other: string; focus: string }> = {
  week: { sentence: "I go swimming twice a ＿＿.", meaning: "しゅう", same: "weak", other: "wake", focus: "week / weak" },
  weak: { sentence: "I have a cold. I feel ＿＿.", meaning: "よわい・ちからが でない", same: "week", other: "wake", focus: "week / weak" },
  here: { sentence: "Don't worry. I'm ＿＿ for you.", meaning: "ここに", same: "hear", other: "hair", focus: "here / hear" },
  hear: { sentence: "I can ＿＿ the birds by the spring.", meaning: "きこえる", same: "here", other: "hair", focus: "here / hear" },
  piece: { sentence: "Can I have a ＿＿ of cake?", meaning: "ひとつ・ひときれ", same: "peace", other: "peach", focus: "piece / peace" },
  peace: { sentence: "The spring is a place of ＿＿ and quiet.", meaning: "へいわ・おだやかさ", same: "piece", other: "peach", focus: "piece / peace" },
  nose: { sentence: "Breathe in through your ＿＿.", meaning: "はな（かおの）", same: "knows", other: "news", focus: "nose / knows" },
  knows: { sentence: "Granny Capy ＿＿ a lot about plants.", meaning: "しって いる", same: "nose", other: "news", focus: "nose / knows" },
  flour: { sentence: "We need ＿＿ to make bread.", meaning: "こむぎこ", same: "flower", other: "floor", focus: "flour / flower" },
  flower: { sentence: "Riko picked a pretty ＿＿ for Kiko.", meaning: "はな（くさばなの）", same: "flour", other: "floor", focus: "flour / flower" },
  whole: { sentence: "Birimo ate the ＿＿ pizza!", meaning: "まるごと・ぜんぶの", same: "hole", other: "hold", focus: "whole / hole" },
  hole: { sentence: "There's a ＿＿ in my sock.", meaning: "あな", same: "whole", other: "hold", focus: "whole / hole" },
  right: { sentence: "You're ＿＿. Let's take a break.", meaning: "ただしい", same: "write", other: "ride", focus: "right / write" },
  write: { sentence: "Let's ＿＿ a get-well card.", meaning: "かく", same: "right", other: "ride", focus: "right / write" },
  pair: { sentence: "I need a new ＿＿ of shoes.", meaning: "ひとくみ（2つで 1つ）", same: "pear", other: "pain", focus: "pair / pear" },
  pear: { sentence: "A ＿＿ is a sweet, juicy fruit.", meaning: "ようなし", same: "pair", other: "pain", focus: "pair / pear" },
};

export interface HomoQuestion {
  word: string;
  /** focus は ことば そのもの（"weak"。focus は ことばの なかに ある つづりで ないと いけない） */
  focus: string;
  /** 2つの ことばを " / " で つないだ 形（"week / weak"） */
  pair: string;
  sentence: string;
  meaning: string;
  same: string;
  sameMeaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 同音異義語の 問題。表に なければ null */
export function homoOf(word: string): HomoQuestion | null {
  const w = word.toLowerCase();
  const x = HOMO[w];
  if (!x) return null;
  return { word: w, focus: w, pair: x.focus, sentence: x.sentence, meaning: x.meaning, same: x.same, sameMeaning: HOMO[x.same]?.meaning ?? "", answer: w, wrong: [x.same, x.other] };
}

export function homoWhy(q: HomoQuestion): string {
  return `ここは ${q.answer}（${q.meaning}）。${q.same}（${q.sameMeaning}）と おなじ おとだけど、いみと つづりが ちがう。文の いみから つづりを えらぼう。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w27FocusOf(word: string): string | null {
  return chKOf(word)?.focus ?? silentOf(word)?.letter ?? forSinceOf(word)?.focus ?? (ableOf(word) ? W27_ABLE_FOCUS : null) ?? homoOf(word)?.focus ?? null;
}

/**
 * その回の ことばが ワールド27 の 回の ものか。ことばが ぜんぶ ワールド27 の 表に ある とき。
 * まえの ワールドの 回は knee・thumb・here などが まじっても、表に ない ことば（knife・lamb・there）が かならず あるので はたらかない
 * （L780 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW27Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w27FocusOf(w) !== null);
}

/** フォーカスの 読み上げ（ワールド27）。その focus で 問う ことば・フレーズを よむ（"ch" を「チ」、"-able" を「エイブル」だけで よまない）。あてはまらなければ null */
export function w27Say(focus: string, words: readonly string[]): string | null {
  if (!isW27Words(words)) return null;
  return words.find((w) => w27FocusOf(w) === focus) ?? null;
}

/**
 * フォーカスの ボタンで よむ おてほん（ワールド27。英字と スペース だけ）。
 * その focus の ことば・フレーズ（同音異義語は その回の 1つめの ことば、Christmas は 大文字の まま）。あてはまらなければ null
 */
export function w27Example(focus: string, words: readonly string[]): string | null {
  if (!isW27Words(words)) return null;
  const hit = words.find((w) => w27FocusOf(w) === focus);
  return hit ?? null;
}
