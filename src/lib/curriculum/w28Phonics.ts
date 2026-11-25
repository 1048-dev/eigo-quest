/**
 * ワールド28（にじの架け橋・L811〜840・ステージ3 の 総まとめ）の フォニックス・つづりの表（文化と ことばの ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - カタカナ語と 英語の おと（energy, allergy, hamburger）: 「英語で いうと、つよく よむ ところは どれ？」（EN-er-gy / en-ER-gy / en-er-GY。選択肢は きまった 順）
 * - 英語に なった 日本語（sushi, tsunami, origami, emoji）: 「英語に なった 日本語。英語の つづりは どれ？」（🔊（つなみ）→ tsunami / tunami / sunami）
 * - 英語の リズム（I want to swim in the sea）: 「ふつうに いう とき、よわく みじかく いう ことばは どれ？」（to / swim / sea）
 * - 音の つながりの まとめ（meet you, bus stop, a kind of）: 「つなげて いうと どう きこえる？」（ミーチュー / ミート・ユー / …）
 * - ことばの パーツの まとめ（dis- un- -ful -ness -ment）: 「パーツを くっつけた ことばで ただしい つづりは どれ？」（un ＋ happy ＋ ness → unhappiness / unhappyness / unhapiness）
 *
 * focus の かきかた:
 * - カタカナ語は はくの 形（"en-er-gy"）。sounds は つよい はく（"EN"）。
 * - 英語に なった 日本語は ことば そのもの（"sushi"）。
 * - リズムは よわく いう ことば（"to" "of" "and"）。ことばは 文（"I want to swim in the sea"。記号なし）。
 * - 音の つながりは フレーズ そのもの（"meet you"）。
 * - ことばの パーツは そのことばで 問う パーツ（"dis-" "un-" "-ful" "-ness" "-ment"）。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド28 が はじまる レッスン（それより前の 回では ワールド28 の 問題に しない） */
export const W28_START = 811;

// ---------------------------------------------------------------------------
// カタカナ語と 英語の おと（つよい はく）
// ---------------------------------------------------------------------------

/** ことば → はくの まとまり・つよい はく（0 から）・カタカナ・英語の よみかたの めやす */
const KATAKANA: Record<string, { syllables: string; stress: number; kana: string; en: string }> = {
  energy: { syllables: "en-er-gy", stress: 0, kana: "エネルギー", en: "エナジー" },
  allergy: { syllables: "al-ler-gy", stress: 0, kana: "アレルギー", en: "アラジー" },
  vitamin: { syllables: "vi-ta-min", stress: 0, kana: "ビタミン", en: "ヴァイタミン" },
  hamburger: { syllables: "ham-bur-ger", stress: 0, kana: "ハンバーガー", en: "ハムバーガー" },
  camera: { syllables: "cam-er-a", stress: 0, kana: "カメラ", en: "キャメラ" },
  video: { syllables: "vid-e-o", stress: 0, kana: "ビデオ", en: "ヴィディオウ" },
  radio: { syllables: "ra-di-o", stress: 0, kana: "ラジオ", en: "レイディオウ" },
  calendar: { syllables: "cal-en-dar", stress: 0, kana: "カレンダー", en: "キャレンダー" },
  idea: { syllables: "i-de-a", stress: 1, kana: "アイデア", en: "アイディーア" },
  piano: { syllables: "pi-an-o", stress: 1, kana: "ピアノ", en: "ピアノウ" },
  museum: { syllables: "mu-se-um", stress: 1, kana: "ミュージアム・はくぶつかん", en: "ミューズィーアム" },
  volunteer: { syllables: "vol-un-teer", stress: 2, kana: "ボランティア", en: "ヴァランティア" },
  vanilla: { syllables: "va-nil-la", stress: 1, kana: "バニラ", en: "ヴァニラ" },
  pajamas: { syllables: "pa-ja-mas", stress: 1, kana: "パジャマ", en: "パジャーマズ" },
  spaghetti: { syllables: "spa-ghet-ti", stress: 1, kana: "スパゲッティ", en: "スパゲティ" },
  macaroni: { syllables: "mac-a-ro-ni", stress: 2, kana: "マカロニ", en: "マカロウニ" },
};

const markStress = (syllables: string, at: number) => syllables.split("-").map((p, i) => (i === at ? p.toUpperCase() : p)).join("-");

export interface KatakanaQuestion {
  word: string;
  syllables: string;
  answer: string;
  /** 選択肢（つよい はくを 1つずつ かえた 形。きまった 順） */
  choices: string[];
  /** つよい はく（大文字。"EN"） */
  strong: string;
  kana: string;
  en: string;
}

/** 表に ある カタカナ語の 問題。表に なければ null */
export function katakanaOf(word: string): KatakanaQuestion | null {
  const w = word.toLowerCase();
  const x = KATAKANA[w];
  if (!x) return null;
  const parts = x.syllables.split("-");
  return {
    word: w, syllables: x.syllables, answer: markStress(x.syllables, x.stress), choices: parts.map((_, i) => markStress(x.syllables, i)),
    strong: parts[x.stress].toUpperCase(), kana: x.kana, en: x.en,
  };
}

export function katakanaDisplay(q: KatakanaQuestion): string {
  return `${q.word}（${q.kana}）`;
}

export function katakanaWhy(q: KatakanaQuestion): string {
  return `${q.word} は カタカナでは「${q.kana}」だけど、英語では ${q.answer}（${q.en}）。大きい もじの ${q.strong} を つよく ながく よむ。カタカナの まま たいらに よむと つたわりにくいので、英語の ことばは つよい はくごと おぼえよう。`;
}

// ---------------------------------------------------------------------------
// 英語に なった 日本語
// ---------------------------------------------------------------------------

export type LoanRule = "shi" | "tsu" | "fu" | "ji" | "m" | "long" | "plain";

/** ことば → いみ・まちがいの つづり 2つ・英語の よみかたの めやす・つづりの きまり */
const LOAN: Record<string, { meaning: string; wrong: [string, string]; en: string; rule: LoanRule }> = {
  sushi: { meaning: "すし", wrong: ["susi", "sushie"], en: "スーシ", rule: "shi" },
  tofu: { meaning: "とうふ", wrong: ["tohu", "toufu"], en: "トウフー", rule: "fu" },
  tempura: { meaning: "てんぷら", wrong: ["tenpura", "tempra"], en: "テンプーラ", rule: "m" },
  bento: { meaning: "おべんとう", wrong: ["bentou", "bentoe"], en: "ベントウ", rule: "long" },
  origami: { meaning: "おりがみ", wrong: ["oligami", "origamy"], en: "オーリガーミ", rule: "plain" },
  futon: { meaning: "ふとん", wrong: ["huton", "footon"], en: "フートン", rule: "fu" },
  kimono: { meaning: "きもの", wrong: ["kimonoh", "kimona"], en: "キモウノウ", rule: "plain" },
  emoji: { meaning: "えもじ", wrong: ["emozi", "imoji"], en: "イモウジ", rule: "ji" },
  haiku: { meaning: "はいく", wrong: ["haikoo", "hiku"], en: "ハイクー", rule: "plain" },
  karaoke: { meaning: "カラオケ", wrong: ["karaoki", "caraoke"], en: "キャリオウキ", rule: "plain" },
  tsunami: { meaning: "つなみ（うみから くる とても おおきな なみ）", wrong: ["tunami", "sunami"], en: "ツナーミ", rule: "tsu" },
  samurai: { meaning: "さむらい", wrong: ["samulai", "samurae"], en: "サムライ", rule: "plain" },
  judo: { meaning: "じゅうどう", wrong: ["zyudo", "juudou"], en: "ジュードウ", rule: "long" },
  manga: { meaning: "まんが", wrong: ["mannga", "mangah"], en: "マーンガ", rule: "plain" },
  anime: { meaning: "アニメ", wrong: ["animay", "aneme"], en: "アニメイ", rule: "plain" },
  ninja: { meaning: "にんじゃ", wrong: ["ninzya", "ninjya"], en: "ニンジャ", rule: "ji" },
};

export interface LoanQuestion {
  word: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
  en: string;
  rule: LoanRule;
}

/** 表に ある 英語に なった 日本語の 問題。表に なければ null */
export function loanOf(word: string): LoanQuestion | null {
  const w = word.toLowerCase();
  const x = LOAN[w];
  if (!x) return null;
  return { word: w, meaning: x.meaning, answer: w, wrong: x.wrong, en: x.en, rule: x.rule };
}

export function loanWhy(q: LoanQuestion): string {
  const rule: Record<LoanRule, string> = {
    shi: "「し」は si では なく shi と かく。",
    tsu: "「つ」は tu では なく tsu と かく。",
    fu: "「ふ」は hu では なく fu と かく。",
    ji: "「じ」は zi では なく j（ji・ja）と かく。",
    m: "p の まえの「ん」は n では なく m と かく（tempura）。",
    long: "のばす おと（とう・じゅう）は u を かかずに みじかく かく。",
    plain: "ローマ字の とおりに かく ことばだよ。",
  };
  return `${q.answer}（${q.meaning}）は 英語でも つかう 日本の ことば。${rule[q.rule]}英語の ひとは「${q.en}」の ように よむ ことが おおいよ。`;
}

// ---------------------------------------------------------------------------
// 英語の リズム（つよい ことばと よわい ことば）
// ---------------------------------------------------------------------------

/** 文 → よわく いう ことば・つよく いう ことば 2つ（選択肢）・いみ */
const RHYTHM: Record<string, { weak: string; strong: [string, string]; meaning: string }> = {
  "I like summer and winter": { weak: "and", strong: ["summer", "winter"], meaning: "なつと ふゆが すき" },
  "I want to swim in the sea": { weak: "to", strong: ["swim", "sea"], meaning: "うみで およぎたい" },
  "It's the best season for swimming": { weak: "for", strong: ["best", "swimming"], meaning: "およぐのに いちばん いい きせつ" },
  "We can see fireworks in summer": { weak: "can", strong: ["see", "fireworks"], meaning: "なつは はなびが みられる" },
  "We have a bowl of rice": { weak: "of", strong: ["bowl", "rice"], meaning: "ごはんを 1ぱい たべる" },
  "We eat lunch at school": { weak: "at", strong: ["eat", "lunch"], meaning: "がっこうで おひるを たべる" },
  "Do you want rice or bread": { weak: "or", strong: ["rice", "bread"], meaning: "ごはんと パン、どっちが いい？" },
  "We serve lunch to our classmates": { weak: "to", strong: ["serve", "classmates"], meaning: "クラスの みんなに きゅうしょくを くばる" },
  "What do you think of my idea": { weak: "of", strong: ["think", "idea"], meaning: "わたしの アイデアを どう おもう？" },
  "Can I ask a question": { weak: "can", strong: ["ask", "question"], meaning: "しつもんしても いい？" },
  "I was surprised at first": { weak: "was", strong: ["surprised", "first"], meaning: "さいしょは びっくりした" },
  "Are your reasons the same": { weak: "are", strong: ["reasons", "same"], meaning: "りゆうは おなじ？" },
  "It's good for our health": { weak: "for", strong: ["good", "health"], meaning: "けんこうに いい" },
  "It's fun to cook with friends": { weak: "to", strong: ["fun", "cook"], meaning: "ともだちと りょうりするのは たのしい" },
  "Vegetables are good for your body": { weak: "are", strong: ["vegetables", "body"], meaning: "やさいは からだに いい" },
  "Let's ask them to help": { weak: "them", strong: ["ask", "help"], meaning: "かれらに てつだって もらおう" },
};
const RHYTHM_KEYS: Record<string, string> = Object.fromEntries(Object.keys(RHYTHM).map((k) => [k.toLowerCase(), k]));

/** よわく いう ことば → よわい ときの よみかたの めやす */
const WEAK_SAY: Record<string, string> = { and: "ン・アン", to: "タ", for: "ファ", can: "クン", of: "アヴ", at: "アッ", or: "ア", was: "ワズ（よわく）", are: "ア", them: "ゼム（よわく）・ム" };

export interface RhythmQuestion {
  sentence: string;
  weak: string;
  strong: [string, string];
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 文の 問題。表に なければ null */
export function rhythmOf(sentence: string): RhythmQuestion | null {
  const k = RHYTHM_KEYS[sentence.toLowerCase().trim()];
  if (!k) return null;
  const x = RHYTHM[k];
  return { sentence: k, weak: x.weak, strong: x.strong, meaning: x.meaning, answer: x.weak, wrong: x.strong };
}

export function rhythmDisplay(q: RhythmQuestion): string {
  return `${q.sentence}.（${q.meaning}）`;
}

export function rhythmWhy(q: RhythmQuestion): string {
  return `${q.weak} は「${WEAK_SAY[q.weak] ?? q.weak}」と よわく みじかく いう。${q.strong[0]}・${q.strong[1]} の ような いみの だいじな ことばは つよく はっきり。つよい・よわいが まざって 英語の リズムに なるよ。`;
}

// ---------------------------------------------------------------------------
// 音の つながりの まとめ（ぼいんと つながる・おなじ おとは 1かい・t / d ＋ you）
// ---------------------------------------------------------------------------

export type LinkKind = "link" | "same" | "you";

/** フレーズ → つなげた ときの きこえかた・1つずつ いう ときの きこえかた・いみ・つながりの しゅるい */
const LINK: Record<string, { linked: string; split: string; meaning: string; kind: LinkKind }> = {
  "meet you": { linked: "ミーチュー", split: "ミート・ユー", meaning: "あなたに あう", kind: "you" },
  "could you": { linked: "クッジュー", split: "クッド・ユー", meaning: "〜して くれますか", kind: "you" },
  "would you": { linked: "ウッジュー", split: "ウッド・ユー", meaning: "〜しませんか", kind: "you" },
  "did you": { linked: "ディジュー", split: "ディド・ユー", meaning: "〜したの？", kind: "you" },
  "don't you": { linked: "ドンチュー", split: "ドント・ユー", meaning: "〜しないの？", kind: "you" },
  "a kind of": { linked: "アカインダヴ", split: "ア・カインド・オブ", meaning: "〜の 一しゅ", kind: "link" },
  "made of": { linked: "メイダヴ", split: "メイド・オブ", meaning: "〜で できて いる", kind: "link" },
  "put it on": { linked: "プティトン", split: "プット・イット・オン", meaning: "それを みに つける", kind: "link" },
  "keep in touch": { linked: "キーピンタッチ", split: "キープ・イン・タッチ", meaning: "れんらくを とりあおう", kind: "link" },
  "take off": { linked: "テイコフ", split: "テイク・オフ", meaning: "ぬぐ", kind: "link" },
  "all over": { linked: "オーロウヴァー", split: "オール・オウヴァー", meaning: "あちこちに", kind: "link" },
  "bus stop": { linked: "バスタップ", split: "バス・ストップ", meaning: "バスてい", kind: "same" },
  "take care": { linked: "テイケア", split: "テイク・ケア", meaning: "げんきでね", kind: "same" },
  "good day": { linked: "グッデイ", split: "グッド・デイ", meaning: "いい 一日", kind: "same" },
  "hot tea": { linked: "ハッティー", split: "ホット・ティー", meaning: "あたたかい おちゃ", kind: "same" },
  "this summer": { linked: "ディサマー", split: "ディス・サマー", meaning: "この なつ", kind: "same" },
};
const LINK_KEYS = Object.keys(LINK);

export interface LinkQuestion {
  phrase: string;
  kind: LinkKind;
  meaning: string;
  answer: string;
  /** まちがいの 選択肢: 1つずつ いう いいかた・おなじ しゅるいの ほかの フレーズの つなげた いいかた */
  wrong: [string, string];
}

/** 表に ある フレーズの 問題。表に なければ null */
export function linkOf(phrase: string): LinkQuestion | null {
  const p = phrase.toLowerCase().trim();
  const x = LINK[p];
  if (!x) return null;
  const same = LINK_KEYS.filter((k) => LINK[k].kind === x.kind);
  const other = LINK[same[(same.indexOf(p) + 1) % same.length]].linked;
  return { phrase: p, kind: x.kind, meaning: x.meaning, answer: x.linked, wrong: [x.split, other] };
}

export function linkWhy(q: LinkQuestion): string {
  const rule: Record<LinkKind, string> = {
    link: "しいんで おわる ことばの あとに ぼいんで はじまる ことばが くると、つながって 1つの ことばの ように なる。",
    same: "おなじ おと（s と s、k と c、d と d、t と t）が つづく ときは 1かいだけ いう。",
    you: "t や d の あとに you が くると、まざって「チュ」「ジュ」の おとに なる。",
  };
  return `${q.phrase}（${q.meaning}）は「${q.answer}」の ように きこえる。${rule[q.kind]}`;
}

// ---------------------------------------------------------------------------
// ことばの パーツの まとめ（dis- un- -ful -ness -ment）
// ---------------------------------------------------------------------------

export const W28_PART_FOCUS = ["dis-", "un-", "-ful", "-ness", "-ment"] as const;
export type PartFocus = (typeof W28_PART_FOCUS)[number];
export type PartTrap = "plain" | "y-to-i" | "keep-e" | "drop-e" | "double" | "single";

/** ことば → パーツ・問う パーツ（focus）・いみ・つづりの きまり・まちがいの つづり 2つ */
const PARTS: Record<string, { parts: string[]; focus: PartFocus; meaning: string; trap: PartTrap; wrong: [string, string] }> = {
  disappear: { parts: ["dis", "appear"], focus: "dis-", meaning: "きえる", trap: "single", wrong: ["dissappear", "disapear"] },
  unnatural: { parts: ["un", "natural"], focus: "un-", meaning: "しぜんで ない", trap: "double", wrong: ["unatural", "unnaturel"] },
  dishonest: { parts: ["dis", "honest"], focus: "dis-", meaning: "しょうじきで ない", trap: "plain", wrong: ["disonest", "dishonnest"] },
  unusual: { parts: ["un", "usual"], focus: "un-", meaning: "めずらしい", trap: "plain", wrong: ["unnusual", "unusuel"] },
  beautiful: { parts: ["beauty", "ful"], focus: "-ful", meaning: "うつくしい", trap: "y-to-i", wrong: ["beautyful", "beautifull"] },
  helpful: { parts: ["help", "ful"], focus: "-ful", meaning: "やくに たつ", trap: "single", wrong: ["helpfull", "helpfule"] },
  wonderful: { parts: ["wonder", "ful"], focus: "-ful", meaning: "すばらしい", trap: "single", wrong: ["wonderfull", "wondreful"] },
  peaceful: { parts: ["peace", "ful"], focus: "-ful", meaning: "へいわな・おだやかな", trap: "keep-e", wrong: ["peacful", "peacefull"] },
  kindness: { parts: ["kind", "ness"], focus: "-ness", meaning: "やさしさ", trap: "plain", wrong: ["kindnes", "kindniss"] },
  happiness: { parts: ["happy", "ness"], focus: "-ness", meaning: "しあわせ", trap: "y-to-i", wrong: ["happyness", "happines"] },
  friendliness: { parts: ["friendly", "ness"], focus: "-ness", meaning: "したしみやすさ", trap: "y-to-i", wrong: ["friendlyness", "friendlines"] },
  openness: { parts: ["open", "ness"], focus: "-ness", meaning: "こころが ひらいて いる こと", trap: "double", wrong: ["openess", "opennes"] },
  excitement: { parts: ["excite", "ment"], focus: "-ment", meaning: "わくわく", trap: "keep-e", wrong: ["excitment", "exsitement"] },
  argument: { parts: ["argue", "ment"], focus: "-ment", meaning: "いいあい・いけんの ぶつかりあい", trap: "drop-e", wrong: ["arguement", "argumant"] },
  enjoyment: { parts: ["enjoy", "ment"], focus: "-ment", meaning: "たのしみ", trap: "plain", wrong: ["enjoyement", "enjoymant"] },
  amazement: { parts: ["amaze", "ment"], focus: "-ment", meaning: "おどろき", trap: "keep-e", wrong: ["amazment", "amazemant"] },
  disagreement: { parts: ["dis", "agree", "ment"], focus: "-ment", meaning: "いけんが ちがう こと", trap: "plain", wrong: ["disagreemant", "dissagreement"] },
  thankfulness: { parts: ["thank", "ful", "ness"], focus: "-ful", meaning: "かんしゃの きもち", trap: "single", wrong: ["thankfullness", "thankfulnes"] },
  unhelpful: { parts: ["un", "help", "ful"], focus: "un-", meaning: "やくに たたない", trap: "single", wrong: ["unhelpfull", "unnhelpful"] },
  unhappiness: { parts: ["un", "happy", "ness"], focus: "-ness", meaning: "ふしあわせ", trap: "y-to-i", wrong: ["unhappyness", "unhapiness"] },
  disrespectful: { parts: ["dis", "respect", "ful"], focus: "dis-", meaning: "しつれいな", trap: "single", wrong: ["disrespectfull", "dissrespectful"] },
  unkindness: { parts: ["un", "kind", "ness"], focus: "un-", meaning: "いじわる・やさしく ない こと", trap: "plain", wrong: ["unkindnes", "unnkindness"] },
};

const PART_MEANING: Record<PartFocus, string> = {
  "dis-": "dis-（〜ない・はんたい）",
  "un-": "un-（〜ない）",
  "-ful": "-ful（〜で いっぱい）",
  "-ness": "-ness（〜な こと・〜さ）",
  "-ment": "-ment（〜する こと）",
};

export interface PartsQuestion {
  word: string;
  parts: string[];
  focus: PartFocus;
  meaning: string;
  trap: PartTrap;
  answer: string;
  wrong: [string, string];
}

/** 表に ある ことばの 問題。表に なければ null */
export function partsOf(word: string): PartsQuestion | null {
  const w = word.toLowerCase();
  const x = PARTS[w];
  if (!x) return null;
  return { word: w, parts: x.parts, focus: x.focus, meaning: x.meaning, trap: x.trap, answer: w, wrong: x.wrong };
}

export function partsDisplay(q: PartsQuestion): string {
  return `${q.parts.join(" ＋ ")} → ？（${q.meaning}）`;
}

export function partsWhy(q: PartsQuestion): string {
  const tail: Record<PartTrap, string> = {
    plain: "パーツを そのまま つなげるだけ。",
    "y-to-i": "おわりの y は i に かえてから つなげる（happy → happi）。",
    "keep-e": "おわりの e は のこした まま つなげる。",
    "drop-e": "argue の おわりの e を とってから ment を つける（arguement では ない）。",
    double: "おなじ もじが 2つ ならぶ けど、どちらも のこす（un＋n・n＋ness）。",
    single: "ful の l は 1つ、dis の s も 1つ（full・diss では ない）。",
  };
  return `${q.parts.join(" ＋ ")} → ${q.answer}（${q.meaning}）。${PART_MEANING[q.focus]} の ことば。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w28FocusOf(word: string): string | null {
  return katakanaOf(word)?.syllables ?? loanOf(word)?.word ?? rhythmOf(word)?.weak ?? linkOf(word)?.phrase ?? partsOf(word)?.focus ?? null;
}

/**
 * その回の ことばが ワールド28 の 回の ものか。ことばが ぜんぶ ワールド28 の 表に ある とき。
 * まえの ワールドの 回は video・piano などが まじっても、表に ない ことばが かならず あるので はたらかない
 * （L810 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW28Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w28FocusOf(w) !== null);
}

/** フォーカスの 読み上げ（ワールド28）。その focus で 問う ことば・文・フレーズを よむ（"to" "dis-" だけで よまない）。あてはまらなければ null */
export function w28Say(focus: string, words: readonly string[]): string | null {
  if (!isW28Words(words)) return null;
  return words.find((w) => w28FocusOf(w) === focus) ?? null;
}

/** フォーカスの ボタンで よむ おてほん（ワールド28。英字と スペース だけ。文は 記号なしで 表に ある）。あてはまらなければ null */
export function w28Example(focus: string, words: readonly string[]): string | null {
  return w28Say(focus, words);
}
