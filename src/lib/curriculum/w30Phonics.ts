/**
 * ワールド30（みらい都市・L871〜900・ステージ4）の フォニックス・つづりの表（科学技術と 発明の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - auto-（じぶんで）: 「auto（じぶんで）の ことば。いみに あう ことばは どれ？」（「（有名な 人の）サイン」→ autograph / automobile / autopilot）
 * - trans-（むこうへ・かわる）: 「trans の あとに つづく パーツは どれ？」（trans ＋ ＿＿（はこぶ）→ port / form / mit）
 * - -ic の 強勢: 「-ic の ことば。どこを いちばん つよく いう？」（electric → e-LEC-tric / E-lec-tric / e-lec-TRIC）
 * - 略語の 読みかた: 「なんと よむ？」（AI → エーアイ / アイ / エイ、km → キロメーターズ / ケーエム / クム）
 * - くだけた 話しことば: 「gonna を ふつうの いいかたに すると？」（going to / gone to / go and）
 *
 * focus の かきかた:
 * - auto- / trans- / -ic は "auto-" "trans-" "-ic"。
 * - 略語は その 略語（"AI" "km" "3D"）。ことばも その 略語。
 * - 話しことばは その かたち（"gonna"）。ことばは 文（"I'm gonna try it"。記号なし）。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド30 が はじまる レッスン（それより前の 回では ワールド30 の 問題に しない） */
export const W30_START = 871;

// ---------------------------------------------------------------------------
// auto-（じぶんで）
// ---------------------------------------------------------------------------

/** ことば → パーツ・いみ・まちがいの 選択肢に つかう 表の ことば 2つ */
const AUTO: Record<string, { parts: string; meaning: string; wrong: [string, string] }> = {
  automatic: { parts: "auto ＋ matic（うごく）", meaning: "じぶんで うごく・自動の", wrong: ["autograph", "autobiography"] },
  autograph: { parts: "auto ＋ graph（かく）", meaning: "（有名な 人が じぶんで かく）サイン", wrong: ["automobile", "autopilot"] },
  automobile: { parts: "auto ＋ mobile（うごく）", meaning: "じどうしゃ（じぶんで うごく くるま）", wrong: ["autograph", "autocorrect"] },
  autopilot: { parts: "auto ＋ pilot（そうじゅうし）", meaning: "ひこうきなどを 自動で 運転する しくみ", wrong: ["autograph", "autosave"] },
  autobiography: { parts: "auto ＋ bio（いのち）＋ graphy（かく）", meaning: "じぶんで かいた じぶんの 一生の 本・自伝", wrong: ["autocorrect", "automobile"] },
  automate: { parts: "auto ＋ mate", meaning: "（きかいで）自動に する", wrong: ["autograph", "autofocus"] },
  automation: { parts: "auto ＋ mation", meaning: "きかいが 自動で しごとを する こと", wrong: ["autobiography", "autoplay"] },
  autocorrect: { parts: "auto ＋ correct（なおす）", meaning: "まちがえた つづりを 自動で なおす きのう", wrong: ["autofocus", "autograph"] },
  autosave: { parts: "auto ＋ save（ほぞんする）", meaning: "とちゅうまでの ものを 自動で ほぞんする きのう", wrong: ["autocorrect", "autopilot"] },
  autofocus: { parts: "auto ＋ focus（ピント）", meaning: "カメラの ピントを 自動で あわせる きのう", wrong: ["autosave", "autobiography"] },
  autoplay: { parts: "auto ＋ play（さいせいする）", meaning: "つぎの どうがや おんがくが 自動で はじまる きのう", wrong: ["autofocus", "automobile"] },
  automatically: { parts: "auto ＋ matic ＋ ally", meaning: "自動で・ひとりでに", wrong: ["autograph", "autonomous"] },
  autonomous: { parts: "auto ＋ nomous（きまり）", meaning: "じぶんで かんがえて うごく・自律の", wrong: ["autobiography", "autoplay"] },
  automaton: { parts: "auto ＋ maton", meaning: "じぶんで うごく からくり人形", wrong: ["autocorrect", "autograph"] },
};

export interface AutoQuestion {
  word: string;
  parts: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある auto- の ことばの 問題（いみ → ことば）。表に なければ null */
export function autoOf(word: string): AutoQuestion | null {
  const w = word.toLowerCase();
  const x = AUTO[w];
  if (!x) return null;
  return { word: w, parts: x.parts, meaning: x.meaning, answer: w, wrong: x.wrong };
}

export function autoDisplay(q: AutoQuestion): string {
  return `「${q.meaning}」`;
}

export function autoWhy(q: AutoQuestion): string {
  return `auto は「じぶんで」と いう いみの パーツ。${q.answer}（${q.parts}）は「${q.meaning}」。auto が 見えたら「じぶんで・自動で」の ことばかな？ と かんがえよう。`;
}

// ---------------------------------------------------------------------------
// trans-（むこうへ・かわる）
// ---------------------------------------------------------------------------

/** ことば → trans の あとの パーツ・その いみ・ことばの いみ・まちがいの パーツ 2つ（表の ほかの ことばの パーツ） */
const TRANS: Record<string, { rest: string; restJa: string; meaning: string; wrong: [string, string] }> = {
  transport: { rest: "port", restJa: "はこぶ", meaning: "はこぶ・ゆそうする", wrong: ["form", "mit"] },
  transform: { rest: "form", restJa: "かたち", meaning: "すがたを かえる・へんしんする", wrong: ["port", "late"] },
  translate: { rest: "late", restJa: "はこばれた（むかしの ことば）", meaning: "ほかの ことばに なおす・ほんやくする", wrong: ["fer", "form"] },
  transfer: { rest: "fer", restJa: "はこぶ", meaning: "うつす・のりかえる", wrong: ["late", "plant"] },
  transmit: { rest: "mit", restJa: "おくる", meaning: "（でんぱや じょうほうを）おくる", wrong: ["port", "form"] },
  transplant: { rest: "plant", restJa: "うえる", meaning: "（しょくぶつを）うえかえる", wrong: ["form", "mit"] },
  transportation: { rest: "portation", restJa: "はこぶ こと", meaning: "のりもの・ゆそう", wrong: ["formation", "lation"] },
  translation: { rest: "lation", restJa: "（late の なかま）", meaning: "ほんやく", wrong: ["portation", "formation"] },
  transformation: { rest: "formation", restJa: "かたちを つくる こと", meaning: "へんしん・大きな へんか", wrong: ["portation", "lation"] },
  transit: { rest: "it", restJa: "いく", meaning: "（人や ものが）うつりうごく こと・のりつぎ", wrong: ["mit", "fer"] },
  translator: { rest: "lator", restJa: "（late の なかま）＋ する 人", meaning: "ほんやくする 人・ほんやくする きかい", wrong: ["former", "portation"] },
  transformer: { rest: "former", restJa: "かたちを かえる もの", meaning: "へんしんする もの・でんきの つよさを かえる きかい", wrong: ["lator", "port"] },
  transmission: { rest: "mission", restJa: "おくる こと", meaning: "おくる こと・そうしん", wrong: ["portation", "formation"] },
};

export interface TransQuestion {
  word: string;
  rest: string;
  restJa: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある trans- の ことばの 問題（trans ＋ ＿＿）。表に なければ null */
export function transOf(word: string): TransQuestion | null {
  const w = word.toLowerCase();
  const x = TRANS[w];
  if (!x) return null;
  return { word: w, rest: x.rest, restJa: x.restJa, meaning: x.meaning, answer: x.rest, wrong: x.wrong };
}

export function transDisplay(q: TransQuestion): string {
  return `trans ＋ ＿＿（${q.meaning}）`;
}

export function transWhy(q: TransQuestion): string {
  return `trans は「むこうへ・かわって」と いう いみの パーツ。trans ＋ ${q.rest}（${q.restJa}）で ${q.word}（${q.meaning}）。パーツを くみあわせると、ながい ことばも よめるよ。`;
}

// ---------------------------------------------------------------------------
// -ic の 強勢（-ic の すぐ まえを つよく）
// ---------------------------------------------------------------------------

/** ことば → はく（音節）・いみ。つよく いうのは いつも -ic の すぐ まえの はく */
const IC: Record<string, { syllables: string[]; meaning: string }> = {
  electric: { syllables: ["e", "lec", "tric"], meaning: "でんきの・でんきで うごく" },
  robotic: { syllables: ["ro", "bot", "ic"], meaning: "ロボットの・ロボットのような" },
  scientific: { syllables: ["sci", "en", "tif", "ic"], meaning: "かがくの・かがくてきな" },
  fantastic: { syllables: ["fan", "tas", "tic"], meaning: "すばらしい" },
  magnetic: { syllables: ["mag", "net", "ic"], meaning: "じしゃくの・じしゃくの ような" },
  electronic: { syllables: ["e", "lec", "tron", "ic"], meaning: "でんしの・でんしきの" },
  energetic: { syllables: ["en", "er", "get", "ic"], meaning: "げんき いっぱいの" },
  futuristic: { syllables: ["fu", "tur", "is", "tic"], meaning: "みらいてきな・みらいの ような" },
  artistic: { syllables: ["ar", "tis", "tic"], meaning: "げいじゅつの・えや ものづくりが じょうずな" },
  athletic: { syllables: ["ath", "let", "ic"], meaning: "うんどうが とくいな" },
  dramatic: { syllables: ["dra", "mat", "ic"], meaning: "げきてきな・おどろく ほどの" },
  terrific: { syllables: ["ter", "rif", "ic"], meaning: "すばらしい・すごい" },
  realistic: { syllables: ["re", "al", "is", "tic"], meaning: "ほんものそっくりの・げんじつてきな" },
  historic: { syllables: ["his", "tor", "ic"], meaning: "れきしに のこる・れきしてきな" },
  organic: { syllables: ["or", "gan", "ic"], meaning: "のうやくを つかわない・ゆうきの" },
  volcanic: { syllables: ["vol", "can", "ic"], meaning: "かざんの" },
};

/** はくを ハイフンで つなぎ、i ばんめを 大文字に（e-LEC-tric） */
const marked = (syl: readonly string[], i: number) => syl.map((s, j) => (j === i ? s.toUpperCase() : s)).join("-");

export interface IcQuestion {
  word: string;
  meaning: string;
  syllables: string[];
  /** つよく いう はくの 番号（0 から。いつも おわりから 2つめ） */
  stress: number;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -ic の ことばの 問題。表に なければ null */
export function icOf(word: string): IcQuestion | null {
  const w = word.toLowerCase();
  const x = IC[w];
  if (!x) return null;
  const n = x.syllables.length;
  const stress = n - 2;
  return { word: w, meaning: x.meaning, syllables: [...x.syllables], stress, answer: marked(x.syllables, stress), wrong: [marked(x.syllables, 0), marked(x.syllables, n - 1)] };
}

export function icDisplay(q: IcQuestion): string {
  return `${q.word}（${q.meaning}）`;
}

export function icWhy(q: IcQuestion): string {
  return `${q.answer}。-ic で おわる ことばは、-ic の すぐ まえの はく（${q.syllables[q.stress]}）を いちばん つよく いう。electric（e-LEC-tric）・robotic（ro-BOT-ic）と おなじ きまりだよ。`;
}

// ---------------------------------------------------------------------------
// 略語の 読みかた
// ---------------------------------------------------------------------------

export type AbbrKind = "letters" | "word" | "unit" | "number";

/** 略語 → 読みかたの 種類・読み上げ（英字と スペース）・答えの よみ・まちがいの よみ 2つ・いみ・もとの ことば */
const ABBR: Record<string, { kind: AbbrKind; say: string; answer: string; wrong: [string, string]; meaning: string; full: string }> = {
  AI: { kind: "letters", say: "A I", answer: "エーアイ", wrong: ["アイ", "エイ"], meaning: "じんこう ちのう", full: "artificial intelligence" },
  USB: { kind: "letters", say: "U S B", answer: "ユーエスビー", wrong: ["ウスブ", "ユーエスベー"], meaning: "きかいを つなぐ ための きまった かたち", full: "Universal Serial Bus" },
  TV: { kind: "letters", say: "T V", answer: "ティーヴィー", wrong: ["トゥヴ", "テーヴェー"], meaning: "テレビ", full: "television" },
  PC: { kind: "letters", say: "P C", answer: "ピースィー", wrong: ["ピック", "ペーセー"], meaning: "パソコン", full: "personal computer" },
  km: { kind: "unit", say: "kilometers", answer: "キロメーターズ", wrong: ["ケーエム", "クム"], meaning: "キロメートル（ながい きょりの たんい）", full: "kilometer(s)" },
  cm: { kind: "unit", say: "centimeters", answer: "センチメーターズ", wrong: ["シーエム", "クム"], meaning: "センチメートル（ながさの たんい）", full: "centimeter(s)" },
  kg: { kind: "unit", say: "kilograms", answer: "キログラムズ", wrong: ["ケージー", "クグ"], meaning: "キログラム（おもさの たんい）", full: "kilogram(s)" },
  mm: { kind: "unit", say: "millimeters", answer: "ミリメーターズ", wrong: ["エムエム", "ム"], meaning: "ミリメートル（とても みじかい ながさの たんい）", full: "millimeter(s)" },
  "3D": { kind: "number", say: "three D", answer: "スリーディー", wrong: ["サンディー", "スリード"], meaning: "りったい（たて・よこ・おくゆき）", full: "three-dimensional" },
  VR: { kind: "letters", say: "V R", answer: "ヴィーアール", wrong: ["ヴァー", "ヴル"], meaning: "かそう げんじつ（ゴーグルで 見る せかい）", full: "virtual reality" },
  LED: { kind: "letters", say: "L E D", answer: "エルイーディー", wrong: ["レッド", "リード"], meaning: "すくない でんきで ひかる あかり", full: "light-emitting diode" },
  GPS: { kind: "letters", say: "G P S", answer: "ジーピーエス", wrong: ["ジプス", "ゲーピーエス"], meaning: "いまいる ばしょが わかる しくみ", full: "Global Positioning System" },
  NASA: { kind: "word", say: "NASA", answer: "ナサ", wrong: ["エヌエーエスエー", "ナシャ"], meaning: "アメリカの うちゅうの けんきゅう きかん", full: "National Aeronautics and Space Administration" },
  STEM: { kind: "word", say: "STEM", answer: "ステム", wrong: ["エスティーイーエム", "スティーム"], meaning: "かがく・ぎじゅつ・こうがく・すうがくの まなび", full: "science, technology, engineering, and math" },
  ID: { kind: "letters", say: "I D", answer: "アイディー", wrong: ["イド", "イーディー"], meaning: "みぶんしょう・じぶんを しめす もの", full: "identification" },
  DIY: { kind: "letters", say: "D I Y", answer: "ディーアイワイ", wrong: ["ディイ", "ダイ"], meaning: "じぶんで つくる こと", full: "do it yourself" },
};

export interface AbbrQuestion {
  abbr: string;
  kind: AbbrKind;
  say: string;
  meaning: string;
  full: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 略語の 問題（大文字・小文字も 表の とおり）。表に なければ null */
export function abbrOf(word: string): AbbrQuestion | null {
  const k = word.trim();
  const x = Object.prototype.hasOwnProperty.call(ABBR, k) ? ABBR[k] : undefined;
  if (!x) return null;
  return { abbr: k, kind: x.kind, say: x.say, meaning: x.meaning, full: x.full, answer: x.answer, wrong: x.wrong };
}

export function abbrDisplay(q: AbbrQuestion): string {
  return `${q.abbr}（${q.meaning}）`;
}

export function abbrWhy(q: AbbrQuestion): string {
  const how: Record<AbbrKind, string> = {
    letters: `${q.abbr} は 1もじずつ アルファベットの なまえで よむ（${q.say}）。`,
    word: `${q.abbr} は 1つの ことばの ように よむ（1もじずつ よまない）。`,
    unit: `たんいの ${q.abbr} は もとの ことば（${q.say}）で よむ。2 いじょうなら おわりに s。`,
    number: `${q.abbr} は かずを 英語で いってから もじを よむ（${q.say}）。`,
  };
  return `${q.answer}。${how[q.kind]}もとの ことばは ${q.full}。`;
}

// ---------------------------------------------------------------------------
// くだけた 話しことば（gonna・wanna など）
// ---------------------------------------------------------------------------

/** くだけた かたち → ふつうの いいかた・まちがいの いいかた 2つ */
const CASUAL_FORMS: Record<string, { full: string; wrong: [string, string] }> = {
  gonna: { full: "going to", wrong: ["gone to", "go and"] },
  wanna: { full: "want to", wrong: ["went to", "won't"] },
  gotta: { full: "got to", wrong: ["go to", "get a"] },
  kinda: { full: "kind of", wrong: ["kindly", "kind and"] },
  lemme: { full: "let me", wrong: ["lend me", "leave me"] },
  gimme: { full: "give me", wrong: ["get me", "give in"] },
  dunno: { full: "don't know", wrong: ["do now", "didn't go"] },
  outta: { full: "out of", wrong: ["out to", "outer"] },
};

/** 文 → くだけた かたち・いみ */
const CASUAL: Record<string, { form: string; meaning: string }> = {
  "I'm gonna try it": { form: "gonna", meaning: "やって みるよ" },
  "We're gonna be late": { form: "gonna", meaning: "おくれちゃう" },
  "I wanna see the robot": { form: "wanna", meaning: "ロボットが 見たい" },
  "Do you wanna play": { form: "wanna", meaning: "あそびたい？" },
  "You gotta see this": { form: "gotta", meaning: "これ、ぜったい 見て" },
  "I gotta go now": { form: "gotta", meaning: "もう いかなきゃ" },
  "It's kinda cool": { form: "kinda", meaning: "ちょっと かっこいい" },
  "I'm kinda tired": { form: "kinda", meaning: "ちょっと つかれた" },
  "Lemme try": { form: "lemme", meaning: "やらせて" },
  "Lemme see": { form: "lemme", meaning: "見せて" },
  "Gimme a minute": { form: "gimme", meaning: "ちょっと まって" },
  "Gimme five": { form: "gimme", meaning: "ハイタッチ しよう" },
  "I dunno": { form: "dunno", meaning: "わからない" },
  "I dunno why": { form: "dunno", meaning: "なんでか わからない" },
  "Let's get outta here": { form: "outta", meaning: "ここから でよう" },
  "Get outta the rain": { form: "outta", meaning: "あめの あたらない ところに おいで" },
};
const CASUAL_KEYS: Record<string, string> = Object.fromEntries(Object.keys(CASUAL).map((k) => [k.toLowerCase(), k]));

export interface CasualQuestion {
  sentence: string;
  form: string;
  full: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 文の 問題。表に なければ null */
export function casualOf(sentence: string): CasualQuestion | null {
  const k = CASUAL_KEYS[sentence.toLowerCase().trim()];
  if (!k) return null;
  const x = CASUAL[k];
  const f = CASUAL_FORMS[x.form];
  return { sentence: k, form: x.form, full: f.full, meaning: x.meaning, answer: f.full, wrong: f.wrong };
}

export function casualPrompt(q: CasualQuestion): string {
  return `${q.form} を ふつうの いいかたに すると？`;
}

export function casualDisplay(q: CasualQuestion): string {
  return `${q.sentence}.（${q.meaning}）`;
}

/** ふつうの いいかたに なおした 文（I'm going to try it） */
export function casualFull(q: CasualQuestion): string {
  return q.sentence.replace(new RegExp(`\\b${q.form}\\b`, "i"), (m) => (m[0] === m[0].toUpperCase() ? q.full[0].toUpperCase() + q.full.slice(1) : q.full));
}

export function casualWhy(q: CasualQuestion): string {
  return `${q.form} は ${q.full} を はやく いった かたち。「${q.sentence}」＝「${casualFull(q)}」。ともだちとの おしゃべりで よく きくけど、かく ときや テストでは ${q.full} と かこう。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w30FocusOf(word: string): string | null {
  if (autoOf(word)) return "auto-";
  if (transOf(word)) return "trans-";
  if (icOf(word)) return "-ic";
  return abbrOf(word)?.abbr ?? casualOf(word)?.form ?? null;
}

/**
 * その回の ことばが ワールド30 の 回の ものか。ことばが ぜんぶ ワールド30 の 表に ある とき
 * （L870 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW30Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w30FocusOf(w) !== null);
}

/** フォーカスの 読み上げ（ワールド30）。その focus で 問う ことば・文を よむ（"auto-" "-ic" だけで よまない。略語は 読みかたで よむ: km → kilometers）。あてはまらなければ null */
export function w30Say(focus: string, words: readonly string[]): string | null {
  if (!isW30Words(words)) return null;
  const w = words.find((x) => w30FocusOf(x) === focus);
  if (!w) return null;
  return abbrOf(w)?.say ?? w;
}

/** フォーカスの ボタンで よむ おてほん（ワールド30。英字と スペース だけ。' は さいしょの ことばだけ）。あてはまらなければ null */
export function w30Example(focus: string, words: readonly string[]): string | null {
  return w30Say(focus, words);
}
