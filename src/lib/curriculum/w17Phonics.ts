/**
 * ワールド17（ほしふる天文台・L481〜510）の フォニックス・つづり の表。import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - おわりの つづり -tion（station）・-sion（television, mission）・-ture（future）: 「ただしい つづりは？」（sta＿＿＿＿ → station / stasion / stashun）
 * - will の 短縮形 'll（I'll, we'll）と won't: 「みじかい かたちは？」（I will → I'll / I'will / Il'l、will not → won't / willn't / wo'nt）
 * - 同音異義語（see / sea, sun / son, two / to / too, there / their）: 「ぶんに あう ことばは？」（I can ＿＿ the stars. → see / sea / meet）
 * - or・ore・oar・our（north, more, roar, four）: 「ただしい つづりは？」（4（よん）→ four / for / fore / foar）
 *
 * focus の かきかた: "-tion" "-sion" "-ture"、"'ll" "n't"、同音異義語は その回の ことばの 母音の つづり（"ee" "ea" "u" "o" "ue" "ew" "ere" "eir" "ear"）、
 * "or" "ore" "oar" "our"。どれも 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */

/** ワールド17 が はじまる レッスン（それより前の 回では ワールド17 の 問題に しない） */
export const W17_START = 481;

export const W17_ENDING_FOCUS = ["-tion", "-sion", "-ture"] as const;
export const W17_CONTRACTION_FOCUS = ["'ll", "n't"] as const;
export const W17_HOMOPHONE_RULE = "homophones";
export const W17_OR_FOCUS = ["or", "ore", "oar", "our"] as const;

/** ワールド17 の つづりの ことばの いみ（問題で「（えき）」のように 見せる） */
export const W17_MEANING: Readonly<Record<string, string>> = {
  // -tion
  station: "えき", vacation: "やすみ", information: "おしらせ", observation: "かんさつ", action: "うごき", direction: "ほうこう",
  collection: "コレクション", invitation: "しょうたいじょう", lotion: "ローション", motion: "うごき", section: "コーナー", emotion: "きもち",
  imagination: "そうぞうりょく", competition: "コンテスト", exploration: "たんけん", solution: "こたえ", celebration: "おいわい",
  constellation: "せいざ", rotation: "じてん", population: "じんこう", nation: "くに",
  // -sion
  television: "テレビ", vision: "みる ちから", decision: "きめた こと", division: "わりざん", mission: "にんむ", permission: "きょか",
  expression: "ひょうげん", discussion: "はなしあい", explosion: "ばくはつ", confusion: "こんらん",
  // -ture
  future: "みらい", picture: "え・しゃしん", nature: "しぜん", adventure: "ぼうけん", temperature: "きおん", creature: "いきもの",
  furniture: "かぐ", capture: "つかまえる", mixture: "まぜた もの",
  // or ore oar our
  north: "きた", storm: "あらし", orbit: "きどう", short: "みじかい", more: "もっと", shore: "うみべ", before: "まえに", explore: "たんけんする",
  roar: "ほえる", board: "ボード", aboard: "のって", keyboard: "キーボード", four: "4（よん）", pour: "そそぐ", your: "あなたの", fourteen: "14",
  sport: "スポーツ", score: "とくてん",
};

// ---------------------------------------------------------------------------
// -tion / -sion / -ture
// ---------------------------------------------------------------------------

export type EndingKind = "tion" | "sion" | "ture";

export interface EndingSpelling {
  answer: string;
  wrong: string[];
  /** おわりの つづりの まえ（sta） */
  stem: string;
  kind: EndingKind;
  meaning: string;
}

/** -tion / -sion / -ture で おわる 表の ことばの ただしい つづりと まちがえやすい つづり。表に なければ null */
export function endingSpelling(word: string): EndingSpelling | null {
  const w = word.toLowerCase();
  const meaning = W17_MEANING[w];
  if (!meaning) return null;
  const kind = (["tion", "sion", "ture"] as const).find((k) => w.endsWith(k));
  if (!kind) return null;
  const stem = w.slice(0, -4);
  const wrong = kind === "tion" ? [`${stem}sion`, `${stem}shun`] : kind === "sion" ? [`${stem}tion`, `${stem}shun`] : [`${stem}cher`, `${stem}chur`];
  return { answer: w, wrong, stem, kind, meaning };
}

export const ENDING_WHY: Record<EndingKind, (w: string) => string> = {
  tion: (w) => `${w} の おわりの「ション」は tion。「ション」の つづりで いちばん おおいのが tion だよ。`,
  sion: (w) => `${w} は sion。television・vision の「ジョン」と、mission の ss の あとの「ション」は sion だよ。`,
  ture: (w) => `${w} の おわりの「チャー」は ture と かくよ（future・picture・nature）。`,
};

// ---------------------------------------------------------------------------
// will の 短縮形（'ll・won't）と ワールド17 で つかう n't
// ---------------------------------------------------------------------------

const CONTRACTIONS: Record<string, string> = {
  "i'll": "I will", "you'll": "you will", "we'll": "we will", "they'll": "they will", "he'll": "he will", "she'll": "she will",
  "it'll": "it will", "that'll": "that will", "won't": "will not",
  "didn't": "did not", "weren't": "were not", "couldn't": "could not", "wouldn't": "would not", "isn't": "is not", "don't": "do not",
};

export interface WillContraction {
  full: string;
  answer: string;
  wrong: string[];
}

/**
 * 短縮形の もとの 形と まちがえやすい つづり。表に なければ null。
 * - 'll: ' の あとに will を のこす（I'will）・' の いちが ちがう（Il'l）。' を とった 形は hell / well に なるので つかわない
 * - won't: こどもが つくりがちな willn't と、' の いちが ちがう wo'nt
 * - ほかの n't: ' が ない（didnt）・' の いちが ちがう（did'nt）
 */
export function willContraction(word: string): WillContraction | null {
  const full = CONTRACTIONS[word.toLowerCase()];
  if (!full) return null;
  const answer = word;
  if (answer.toLowerCase() === "won't") return { full, answer, wrong: ["willn't", "wo'nt"] };
  const i = answer.indexOf("'");
  const head = answer.slice(0, i);
  const tail = answer.slice(i + 1);
  if (tail === "ll") return { full, answer, wrong: [`${head}'will`, `${head}l'l`] };
  return { full, answer, wrong: [answer.replace("'", ""), `${head.slice(0, -1)}'${head.slice(-1)}t`] };
}

export function willContractionWhy(full: string, answer: string): string {
  if (answer.toLowerCase() === "won't") return `will not を みじかく すると won't。willn't では なく、とくべつな かたち だよ。`;
  if (answer.endsWith("'ll")) return `${full} を みじかく すると ${answer}。' は きえた もじ（wi）の しるし だよ。`;
  return `${full} を みじかく すると ${answer}。' は きえた もじ（o）の しるし だよ。`;
}

// ---------------------------------------------------------------------------
// 同音異義語
// ---------------------------------------------------------------------------

export interface Homophone {
  /** ＿＿ の ところに 入る ぶん */
  sentence: string;
  meaning: string;
  /** おなじ おとの ことば（じぶんを のぞく） */
  sameSound: string[];
  /** こたえ いがいの 選択肢（2つ） */
  choices: string[];
}

const H = (sentence: string, meaning: string, sameSound: string[], other: string[]): Homophone => ({
  sentence, meaning, sameSound, choices: [...sameSound, ...other],
});

/** 同音異義語の 表（ことば → ぶん・いみ・おなじ おとの ことば・ほかの 選択肢）。choices は こたえ いがいの 2つ（こたえを 足して つかう） */
const HOMOPHONES: Record<string, Homophone> = {
  see: H("I can ＿＿ the stars.", "みる", ["sea"], ["meet"]),
  sea: H("Fish swim in the ＿＿.", "うみ", ["see"], ["meat"]),
  meet: H("Nice to ＿＿ you!", "あう", ["meat"], ["see"]),
  meat: H("My dog loves ＿＿.", "にく", ["meet"], ["sea"]),
  sun: H("The ＿＿ is a big star.", "たいよう", ["son"], ["won"]),
  son: H("The king had one ＿＿.", "むすこ", ["sun"], ["won"]),
  one: H("I have ＿＿ telescope.", "ひとつ", ["won"], ["sun"]),
  won: H("Our team ＿＿ the game!", "かった", ["one"], ["son"]),
  two: H("I have ＿＿ eyes.", "ふたつ", ["to", "too"], []),
  to: H("Let's go ＿＿ the moon.", "〜へ", ["two", "too"], []),
  too: H("I like stars, ＿＿.", "〜も", ["to", "two"], []),
  blue: H("The sky is ＿＿ today.", "あお", ["blew"], ["too"]),
  blew: H("The wind ＿＿ hard last night.", "ふいた", ["blue"], ["two"]),
  there: H("Look over ＿＿! It's Mars!", "あそこ", ["their"], ["here"]),
  their: H("The kids are looking in ＿＿ telescope.", "かれらの", ["there"], ["hear"]),
  here: H("Come ＿＿, please!", "ここ", ["hear"], ["there"]),
  hear: H("I can ＿＿ the music.", "きく", ["here"], ["their"]),
};

export function homophoneOf(word: string): Homophone | null {
  return HOMOPHONES[word.toLowerCase()] ?? null;
}

export function homophoneWhy(word: string, h: Homophone): string {
  return `ここは ${word}（${h.meaning}）。${[word, ...h.sameSound].join(" と ")} は おなじ おとだけど、いみと つづりが ちがうよ。`;
}

// ---------------------------------------------------------------------------
// or・ore・oar・our（どれも「オー」）
// ---------------------------------------------------------------------------

export type OrKind = "or" | "ore" | "oar" | "our";
const OR_KINDS: readonly OrKind[] = ["or", "ore", "oar", "our"];

export interface OrSpelling {
  answer: string;
  wrong: string[];
  kind: OrKind;
  meaning: string;
}

/** 表に ある「オー」の ことばの ただしい つづりと、ほかの 3つの つづりに かえた もの。表に なければ null */
export function orSpelling(word: string): OrSpelling | null {
  const w = word.toLowerCase();
  const meaning = W17_MEANING[w];
  if (!meaning) return null;
  const m = /oar|our|ore(?![aeiouy])|or/.exec(w);
  if (!m) return null;
  const kind = m[0] as OrKind;
  const pre = w.slice(0, m.index);
  const post = w.slice(m.index + kind.length);
  const wrong = OR_KINDS.filter((k) => k !== kind).map((k) => `${pre}${k}${post}`);
  return { answer: w, wrong, kind, meaning };
}

export const OR_WHY: Record<OrKind, (w: string) => string> = {
  or: (w) => `${w} は or。「オー」の つづりで いちばん よく あるのが or だよ。`,
  ore: (w) => `${w} は ore。ことばの おわりの「オー」は ore が おおいよ（more・shore）。`,
  oar: (w) => `${w} は oar。roar・board の「オー」は oa の あとに r。`,
  our: (w) => `${w} は our。four・pour・your の「オー」は our（hour・our は「アウア」で ちがう おと）。`,
};

/** focus と しゅるいの 対応 */
export const OR_FOCUS_OF: Record<OrKind, string> = { or: "or", ore: "ore", oar: "oar", our: "our" };
