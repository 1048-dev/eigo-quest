/**
 * ワールド31（ときの回廊・L901〜930・ステージ4）の フォニックス・つづりの表（歴史と 伝記の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 動詞と 名詞の 家族: 「動詞を 名詞（もの・こと）に すると？」（invent（はつめいする）→ ＿＿ → invention / inventment / invental）
 * - 年号と 数の 読みかた: 「英語で なんと よむ？」（1868 → eighteen sixty-eight / one eight six eight / eighty-six eighteen）
 * - 語根 struct: 「struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？」（The ＿＿ of the castle took twenty years. → construction / construct / constructive）
 * - -ian・-ist: 「〜を する 人は？」（music（おんがく）→ ＿＿ → musician / musicist / musicer）
 * - 語根 port: 「port の ことば。いみは どれ？」（export（ex ＝ そとへ ＋ port ＝ はこぶ）→ 外国へ 売る / 外国から 買い入れる / もちはこびが できる）
 *
 * focus の かきかた:
 * - 家族は 名詞の おわり（"-tion" "-ation" "-ment" "-al" "-y"）。ことばは 名詞（"invention"）。
 * - 年号は その ことば（"1868" "the 1990s" "the 21st century"）。
 * - struct・port は "struct" "port"。-ian・-ist は "-ian" "-ist"。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド31 が はじまる レッスン（それより前の 回では ワールド31 の 問題に しない） */
export const W31_START = 901;

// ---------------------------------------------------------------------------
// 動詞と 名詞の 家族（invent → invention）
// ---------------------------------------------------------------------------

export type FamilyEnding = "-tion" | "-ation" | "-ment" | "-al" | "-y";

/** 名詞 → もとの 動詞・動詞の いみ・名詞の いみ・名詞の おわり（focus）・つくりかた・まちがいの 選択肢 2つ（ない ことば） */
const FAMILY: Record<string, { verb: string; verbJa: string; nounJa: string; ending: FamilyEnding; how: string; wrong: [string, string] }> = {
  invention: { verb: "invent", verbJa: "はつめいする", nounJa: "はつめい・はつめいした もの", ending: "-tion", how: "invent ＋ ion", wrong: ["inventment", "invental"] },
  protection: { verb: "protect", verbJa: "まもる", nounJa: "まもる こと・ほご", ending: "-tion", how: "protect ＋ ion", wrong: ["protectment", "protectal"] },
  collection: { verb: "collect", verbJa: "あつめる", nounJa: "あつめた もの・コレクション", ending: "-tion", how: "collect ＋ ion", wrong: ["collectment", "collectery"] },
  connection: { verb: "connect", verbJa: "つなぐ", nounJa: "つながり", ending: "-tion", how: "connect ＋ ion", wrong: ["connectment", "connectal"] },
  celebration: { verb: "celebrate", verbJa: "いわう", nounJa: "おいわい", ending: "-tion", how: "celebrate の e を とって ＋ ion", wrong: ["celebratement", "celebratal"] },
  education: { verb: "educate", verbJa: "きょういくする", nounJa: "きょういく", ending: "-tion", how: "educate の e を とって ＋ ion", wrong: ["educatement", "educatery"] },
  creation: { verb: "create", verbJa: "つくりだす", nounJa: "つくりだした もの・そうぞう", ending: "-tion", how: "create の e を とって ＋ ion", wrong: ["createment", "creatal"] },
  decoration: { verb: "decorate", verbJa: "かざる", nounJa: "かざり", ending: "-tion", how: "decorate の e を とって ＋ ion", wrong: ["decoratement", "decoratal"] },
  exploration: { verb: "explore", verbJa: "たんけんする", nounJa: "たんけん", ending: "-ation", how: "explore の e を とって ＋ ation", wrong: ["explorement", "explorion"] },
  imagination: { verb: "imagine", verbJa: "そうぞうする", nounJa: "そうぞうりょく", ending: "-ation", how: "imagine の e を とって ＋ ation", wrong: ["imaginement", "imaginion"] },
  information: { verb: "inform", verbJa: "しらせる", nounJa: "じょうほう", ending: "-ation", how: "inform ＋ ation", wrong: ["informment", "informion"] },
  preparation: { verb: "prepare", verbJa: "じゅんびする", nounJa: "じゅんび", ending: "-ation", how: "prepare の e を とって ＋ ation", wrong: ["preparement", "preparion"] },
  invitation: { verb: "invite", verbJa: "しょうたいする", nounJa: "しょうたい・しょうたいじょう", ending: "-ation", how: "invite の e を とって ＋ ation", wrong: ["invitement", "invital"] },
  observation: { verb: "observe", verbJa: "かんさつする", nounJa: "かんさつ", ending: "-ation", how: "observe の e を とって ＋ ation", wrong: ["observement", "observion"] },
  combination: { verb: "combine", verbJa: "くみあわせる", nounJa: "くみあわせ", ending: "-ation", how: "combine の e を とって ＋ ation", wrong: ["combinement", "combinion"] },
  admiration: { verb: "admire", verbJa: "すごいと おもう・あこがれる", nounJa: "あこがれ・そんけいの きもち", ending: "-ation", how: "admire の e を とって ＋ ation", wrong: ["admirement", "admirion"] },
  development: { verb: "develop", verbJa: "はってんさせる・かいはつする", nounJa: "はってん・かいはつ", ending: "-ment", how: "develop ＋ ment", wrong: ["develoption", "developal"] },
  movement: { verb: "move", verbJa: "うごく", nounJa: "うごき", ending: "-ment", how: "move ＋ ment", wrong: ["movation", "movery"] },
  achievement: { verb: "achieve", verbJa: "なしとげる", nounJa: "なしとげた こと・せいか", ending: "-ment", how: "achieve ＋ ment", wrong: ["achievation", "achieval"] },
  agreement: { verb: "agree", verbJa: "さんせいする", nounJa: "さんせい・とりきめ", ending: "-ment", how: "agree ＋ ment", wrong: ["agreetion", "agreeal"] },
  improvement: { verb: "improve", verbJa: "よく する", nounJa: "よく なった ところ・かいぜん", ending: "-ment", how: "improve ＋ ment", wrong: ["improvation", "improval"] },
  enjoyment: { verb: "enjoy", verbJa: "たのしむ", nounJa: "たのしみ", ending: "-ment", how: "enjoy ＋ ment", wrong: ["enjoytion", "enjoyal"] },
  equipment: { verb: "equip", verbJa: "（どうぐを）そなえる", nounJa: "どうぐ・せつび", ending: "-ment", how: "equip ＋ ment", wrong: ["equipation", "equipal"] },
  entertainment: { verb: "entertain", verbJa: "たのしませる", nounJa: "ごらく・もよおし", ending: "-ment", how: "entertain ＋ ment", wrong: ["entertaination", "entertainal"] },
  arrival: { verb: "arrive", verbJa: "とうちゃくする", nounJa: "とうちゃく", ending: "-al", how: "arrive の e を とって ＋ al", wrong: ["arrivement", "arrivation"] },
  survival: { verb: "survive", verbJa: "いきのびる", nounJa: "いきのびる こと", ending: "-al", how: "survive の e を とって ＋ al", wrong: ["survivement", "survivation"] },
  proposal: { verb: "propose", verbJa: "ていあんする", nounJa: "ていあん", ending: "-al", how: "propose の e を とって ＋ al", wrong: ["proposement", "proposery"] },
  approval: { verb: "approve", verbJa: "みとめる", nounJa: "しょうにん・みとめる こと", ending: "-al", how: "approve の e を とって ＋ al", wrong: ["approvement", "approvation"] },
  discovery: { verb: "discover", verbJa: "はっけんする", nounJa: "はっけん", ending: "-y", how: "discover ＋ y", wrong: ["discoverment", "discoveration"] },
  delivery: { verb: "deliver", verbJa: "とどける", nounJa: "はいたつ", ending: "-y", how: "deliver ＋ y", wrong: ["deliverment", "deliveral"] },
  recovery: { verb: "recover", verbJa: "（げんきを）とりもどす", nounJa: "かいふく", ending: "-y", how: "recover ＋ y", wrong: ["recoverment", "recoveration"] },
  mastery: { verb: "master", verbJa: "みに つける・マスターする", nounJa: "じゅくたつ・マスターする こと", ending: "-y", how: "master ＋ y", wrong: ["masterment", "masteral"] },
};

export interface FamilyQuestion {
  noun: string;
  verb: string;
  verbJa: string;
  nounJa: string;
  ending: FamilyEnding;
  how: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 名詞の 問題（動詞 → 名詞）。表に なければ null */
export function familyOf(word: string): FamilyQuestion | null {
  const w = word.toLowerCase();
  const x = Object.prototype.hasOwnProperty.call(FAMILY, w) ? FAMILY[w] : undefined;
  if (!x) return null;
  return { noun: w, verb: x.verb, verbJa: x.verbJa, nounJa: x.nounJa, ending: x.ending, how: x.how, answer: w, wrong: x.wrong };
}

export function familyDisplay(q: FamilyQuestion): string {
  return `${q.verb}（${q.verbJa}）→ ＿＿（${q.nounJa}）`;
}

export function familyWhy(q: FamilyQuestion): string {
  return `${q.answer}（${q.how}）。動詞の おわりに ${q.ending.slice(1)} を つけると「〜する こと・もの」の 名詞に なる。${q.verb} と ${q.answer} は おなじ 家族の ことばだよ。`;
}

// ---------------------------------------------------------------------------
// 年号と 数の 読みかた
// ---------------------------------------------------------------------------

export type YearKind = "year" | "oh" | "thousand" | "decade" | "century";

/** ことば → 種類・答えの よみ（読み上げにも つかう）・まちがいの よみ 2つ・いみ */
const YEARS: Record<string, { kind: YearKind; answer: string; wrong: [string, string]; meaning: string }> = {
  "1600": { kind: "year", answer: "sixteen hundred", wrong: ["one six zero zero", "sixty hundred"], meaning: "1600 年" },
  "1868": { kind: "year", answer: "eighteen sixty-eight", wrong: ["one eight six eight", "eighty-six eighteen"], meaning: "1868 年" },
  "1964": { kind: "year", answer: "nineteen sixty-four", wrong: ["one nine six four", "ninety-six fourteen"], meaning: "1964 年" },
  "1850": { kind: "year", answer: "eighteen fifty", wrong: ["eighteen five zero", "eight hundred fifty"], meaning: "1850 年" },
  "1903": { kind: "oh", answer: "nineteen oh three", wrong: ["nineteen three", "nine hundred three"], meaning: "1903 年" },
  "1801": { kind: "oh", answer: "eighteen oh one", wrong: ["eighteen one", "eighty-one"], meaning: "1801 年" },
  "2001": { kind: "thousand", answer: "two thousand one", wrong: ["twenty one", "two zero zero one"], meaning: "2001 年" },
  "2008": { kind: "thousand", answer: "two thousand eight", wrong: ["twenty eight", "two hundred eight"], meaning: "2008 年" },
  "the 1990s": { kind: "decade", answer: "the nineteen nineties", wrong: ["the nineteen ninety", "the one nine nine zeros"], meaning: "1990 年代" },
  "the 1800s": { kind: "decade", answer: "the eighteen hundreds", wrong: ["the eight hundreds", "the eighteen zeros"], meaning: "1800 年代" },
  "the 1960s": { kind: "decade", answer: "the nineteen sixties", wrong: ["the nineteen sixty", "the nineteen sixes"], meaning: "1960 年代" },
  "the 2000s": { kind: "decade", answer: "the two thousands", wrong: ["the twenty", "the two zero zeros"], meaning: "2000 年代" },
  "the 21st century": { kind: "century", answer: "the twenty-first century", wrong: ["the twenty-one century", "the two one century"], meaning: "21 世紀（2001〜2100 年）" },
  "the 19th century": { kind: "century", answer: "the nineteenth century", wrong: ["the nineteen century", "the ninth century"], meaning: "19 世紀（1801〜1900 年）" },
  "the 20th century": { kind: "century", answer: "the twentieth century", wrong: ["the twenty century", "the second century"], meaning: "20 世紀（1901〜2000 年）" },
  "the 15th century": { kind: "century", answer: "the fifteenth century", wrong: ["the fifteen century", "the fifty century"], meaning: "15 世紀（1401〜1500 年）" },
};
const YEAR_KEYS: Record<string, string> = Object.fromEntries(Object.keys(YEARS).map((k) => [k.toLowerCase(), k]));

export interface YearQuestion {
  word: string;
  kind: YearKind;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 年号の 問題。表に なければ null */
export function yearOf(word: string): YearQuestion | null {
  const k = YEAR_KEYS[word.toLowerCase().trim()];
  if (!k) return null;
  const x = YEARS[k];
  return { word: k, kind: x.kind, meaning: x.meaning, answer: x.answer, wrong: x.wrong };
}

export function yearDisplay(q: YearQuestion): string {
  return `${q.word}（${q.meaning}）`;
}

export function yearWhy(q: YearQuestion): string {
  const how: Record<YearKind, string> = {
    year: "年号は 2けたずつ 2つに わけて よむ（18｜68 → eighteen sixty-eight。00 なら hundred）。",
    oh: "2つに わけた あとが 01〜09 の ときは 0 を oh（オウ）と よむ（19｜03 → nineteen oh three）。",
    thousand: "2001〜2009 年は two thousand ＋ かず で よむ。",
    decade: "〜年代は 年号の よみかたの おわりを -ies / -s に して、the を つける（the 1990s → the nineteen nineties）。",
    century: "〜世紀は じゅんばんの かず（first・nineteenth など）＋ century。the を つける。1900 年代は 20 世紀だよ。",
  };
  return `${q.answer}。${how[q.kind]}`;
}

// ---------------------------------------------------------------------------
// 語根 struct（たてる・くみたてる）
// ---------------------------------------------------------------------------

/** ことば → 品詞・いみ・文（＿＿ に 入る）・まちがいの 選択肢 2つ（おなじ 家族の ことば） */
const STRUCT: Record<string, { pos: string; meaning: string; sentence: string; wrong: [string, string] }> = {
  construct: { pos: "動詞", meaning: "たてる・くみたてる", sentence: "They are going to ＿＿ a new bridge next year.", wrong: ["construction", "structure"] },
  construction: { pos: "名詞", meaning: "けんせつ・たてる こと", sentence: "The ＿＿ of the castle took twenty years.", wrong: ["construct", "constructive"] },
  structure: { pos: "名詞", meaning: "しくみ・たてもの・こうぞう", sentence: "This old tower has a very strong ＿＿.", wrong: ["construct", "instruct"] },
  instruct: { pos: "動詞", meaning: "おしえる・しじする", sentence: "The coach will ＿＿ the new players.", wrong: ["instruction", "instructor"] },
  instruction: { pos: "名詞", meaning: "しじ・せつめい", sentence: "Listen to each ＿＿ carefully.", wrong: ["instruct", "instructor"] },
  instructions: { pos: "名詞（ふくすう）", meaning: "せつめいしょ・しじ", sentence: "Read the ＿＿ before you build the model.", wrong: ["instructor", "instructs"] },
  instructor: { pos: "名詞（人）", meaning: "おしえる 人・コーチ", sentence: "Our swimming ＿＿ is very kind.", wrong: ["instruction", "instruct"] },
  destruction: { pos: "名詞", meaning: "はかい・こわす こと", sentence: "The big storm caused a lot of ＿＿.", wrong: ["destructive", "construction"] },
  destructive: { pos: "形容詞", meaning: "はかいてきな・こわす ちからが つよい", sentence: "Some storms are very ＿＿.", wrong: ["destruction", "instruction"] },
  constructive: { pos: "形容詞", meaning: "やくに たつ・まえむきな", sentence: "Thank you for your ＿＿ advice. It really helped.", wrong: ["construction", "construct"] },
  reconstruct: { pos: "動詞", meaning: "たてなおす", sentence: "After the fire, people worked together to ＿＿ the old temple.", wrong: ["reconstruction", "structure"] },
  reconstruction: { pos: "名詞", meaning: "たてなおし・ふっこう", sentence: "The ＿＿ of the old gate finished last year.", wrong: ["reconstruct", "destructive"] },
};

export interface StructQuestion {
  word: string;
  pos: string;
  meaning: string;
  sentence: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある struct の ことばの 問題（文に 入れる）。表に なければ null */
export function structOf(word: string): StructQuestion | null {
  const w = word.toLowerCase();
  const x = Object.prototype.hasOwnProperty.call(STRUCT, w) ? STRUCT[w] : undefined;
  if (!x) return null;
  return { word: w, pos: x.pos, meaning: x.meaning, sentence: x.sentence, answer: w, wrong: x.wrong };
}

export function structDisplay(q: StructQuestion): string {
  return q.sentence;
}

export function structWhy(q: StructQuestion): string {
  return `${q.answer}（${q.pos}・${q.meaning}）。struct は「たてる・くみたてる」と いう いみの パーツ。おなじ struct の 家族でも、文の なかの はたらき（動詞・名詞・人・ようす）で つかう かたちが かわるよ。`;
}

// ---------------------------------------------------------------------------
// -ian・-ist（〜を する 人・〜の せんもんか）
// ---------------------------------------------------------------------------

/** 人の ことば → もとの ことば・その いみ・人の いみ・おわり・つくりかた・まちがいの 選択肢 2つ（ない ことば） */
const PERSON: Record<string, { base: string; baseJa: string; personJa: string; ending: "-ian" | "-ist"; how: string; wrong: [string, string] }> = {
  historian: { base: "history", baseJa: "れきし", personJa: "れきしを しらべる 人・れきしがくしゃ", ending: "-ian", how: "history の y を とって ＋ ian", wrong: ["historist", "historyer"] },
  musician: { base: "music", baseJa: "おんがく", personJa: "おんがくか・ミュージシャン", ending: "-ian", how: "music ＋ ian", wrong: ["musicist", "musicer"] },
  librarian: { base: "library", baseJa: "としょかん", personJa: "としょかんの 人・ししょ", ending: "-ian", how: "library の y を とって ＋ ian", wrong: ["librarist", "libraryer"] },
  magician: { base: "magic", baseJa: "てじな・まほう", personJa: "てじなし・まほうつかい", ending: "-ian", how: "magic ＋ ian", wrong: ["magicist", "magicer"] },
  comedian: { base: "comedy", baseJa: "おわらい・きげき", personJa: "おわらい げいにん・コメディアン", ending: "-ian", how: "comedy の y を とって ＋ ian", wrong: ["comedist", "comedyer"] },
  electrician: { base: "electric", baseJa: "でんきの", personJa: "でんきの こうじを する 人", ending: "-ian", how: "electric ＋ ian", wrong: ["electricist", "electricer"] },
  mathematician: { base: "mathematics", baseJa: "すうがく", personJa: "すうがくしゃ", ending: "-ian", how: "mathematics の s を とって ＋ ian", wrong: ["mathematist", "mathematicser"] },
  guardian: { base: "guard", baseJa: "まもる・みはる", personJa: "まもる 人・ほごしゃ", ending: "-ian", how: "guard ＋ ian", wrong: ["guardist", "guardor"] },
  scientist: { base: "science", baseJa: "かがく", personJa: "かがくしゃ", ending: "-ist", how: "science の ce を t に かえて ＋ ist", wrong: ["sciencian", "sciencer"] },
  artist: { base: "art", baseJa: "げいじゅつ・びじゅつ", personJa: "げいじゅつか・がか", ending: "-ist", how: "art ＋ ist", wrong: ["artian", "arter"] },
  pianist: { base: "piano", baseJa: "ピアノ", personJa: "ピアニスト", ending: "-ist", how: "piano の o を とって ＋ ist", wrong: ["pianian", "pianoer"] },
  cyclist: { base: "cycle", baseJa: "じてんしゃに のる", personJa: "じてんしゃに のる 人", ending: "-ist", how: "cycle の e を とって ＋ ist", wrong: ["cyclian", "cycler"] },
  tourist: { base: "tour", baseJa: "りょこう・ツアー", personJa: "かんこうきゃく", ending: "-ist", how: "tour ＋ ist", wrong: ["tourian", "tourer"] },
  journalist: { base: "journal", baseJa: "しんぶん・ざっし", personJa: "きしゃ・ジャーナリスト", ending: "-ist", how: "journal ＋ ist", wrong: ["journalian", "journaler"] },
  violinist: { base: "violin", baseJa: "バイオリン", personJa: "バイオリンを ひく 人", ending: "-ist", how: "violin ＋ ist", wrong: ["violinian", "violiner"] },
  novelist: { base: "novel", baseJa: "しょうせつ", personJa: "しょうせつか", ending: "-ist", how: "novel ＋ ist", wrong: ["novelian", "noveler"] },
};

export interface PersonQuestion {
  word: string;
  base: string;
  baseJa: string;
  personJa: string;
  ending: "-ian" | "-ist";
  how: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 人の ことばの 問題（もとの ことば → 人）。表に なければ null */
export function personOf(word: string): PersonQuestion | null {
  const w = word.toLowerCase();
  const x = Object.prototype.hasOwnProperty.call(PERSON, w) ? PERSON[w] : undefined;
  if (!x) return null;
  return { word: w, base: x.base, baseJa: x.baseJa, personJa: x.personJa, ending: x.ending, how: x.how, answer: w, wrong: x.wrong };
}

export function personDisplay(q: PersonQuestion): string {
  return `${q.base}（${q.baseJa}）→ ＿＿（${q.personJa}）`;
}

export function personWhy(q: PersonQuestion): string {
  return `${q.answer}（${q.how}）。-ian も -ist も「〜を する 人・〜の せんもんか」を あらわす おわり。historian・musician・scientist・artist の ように、しごとの なまえで よく つかうよ。`;
}

// ---------------------------------------------------------------------------
// 語根 port（はこぶ / みなと）
// ---------------------------------------------------------------------------

/** ことば → パーツの せつめい・いみ・まちがいの 選択肢 2つ（表の ほかの ことば。いみを 選択肢に する） */
const PORT: Record<string, { parts: string; meaning: string; wrong: [string, string] }> = {
  import: { parts: "im ＝ なかへ ＋ port ＝ はこぶ", meaning: "外国から 買い入れる（ゆにゅう）", wrong: ["export", "portable"] },
  export: { parts: "ex ＝ そとへ ＋ port ＝ はこぶ", meaning: "外国へ 売る（ゆしゅつ）", wrong: ["import", "portable"] },
  portable: { parts: "port ＝ はこぶ ＋ able ＝ できる", meaning: "もちはこびが できる", wrong: ["import", "support"] },
  report: { parts: "re ＝ もとへ ＋ port ＝ はこぶ", meaning: "しらせを もちかえる・ほうこくする", wrong: ["support", "export"] },
  reporter: { parts: "report ＋ er ＝ 人", meaning: "ニュースを しらせる 人・きしゃ", wrong: ["porter", "passport"] },
  support: { parts: "sup ＝ 下から ＋ port ＝ はこぶ", meaning: "下から ささえる・おうえんする", wrong: ["report", "import"] },
  porter: { parts: "port ＝ はこぶ ＋ er ＝ 人", meaning: "にもつを はこぶ 人", wrong: ["reporter", "airport"] },
  airport: { parts: "air ＝ そら ＋ port ＝ みなと", meaning: "くうこう（ひこうきの みなと）", wrong: ["seaport", "passport"] },
  seaport: { parts: "sea ＝ うみ ＋ port ＝ みなと", meaning: "ふねが とまる みなとまち", wrong: ["airport", "spaceport"] },
  passport: { parts: "pass ＝ とおる ＋ port ＝ みなと", meaning: "パスポート（みなとを とおる ための しょうめいしょ）", wrong: ["portable", "report"] },
  heliport: { parts: "heli（copter）＝ ヘリコプター ＋ port ＝ みなと", meaning: "ヘリコプターの はっちゃくじょう", wrong: ["airport", "seaport"] },
  spaceport: { parts: "space ＝ うちゅう ＋ port ＝ みなと", meaning: "うちゅうせんの はっしゃじょう", wrong: ["heliport", "seaport"] },
};

export interface PortQuestion {
  word: string;
  parts: string;
  meaning: string;
  /** 答えの いみ */
  answer: string;
  /** まちがいの いみ 2つ */
  wrong: [string, string];
}

/** 表に ある port の ことばの 問題（ことば → いみ）。表に なければ null */
export function portOf(word: string): PortQuestion | null {
  const w = word.toLowerCase();
  const x = Object.prototype.hasOwnProperty.call(PORT, w) ? PORT[w] : undefined;
  if (!x) return null;
  return { word: w, parts: x.parts, meaning: x.meaning, answer: x.meaning, wrong: [PORT[x.wrong[0]].meaning, PORT[x.wrong[1]].meaning] };
}

export function portDisplay(q: PortQuestion): string {
  return `${q.word}（${q.parts}）`;
}

export function portWhy(q: PortQuestion): string {
  return `${q.word} は「${q.meaning}」。port には「はこぶ」（import・export・report）と「みなと」（airport・seaport）の 2つの いみが ある。まえに つく パーツを 見ると いみが わかるよ。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w31FocusOf(word: string): string | null {
  const f = familyOf(word);
  if (f) return f.ending;
  const y = yearOf(word);
  if (y) return y.word;
  if (structOf(word)) return "struct";
  const p = personOf(word);
  if (p) return p.ending;
  if (portOf(word)) return "port";
  return null;
}

/**
 * その回の ことばが ワールド31 の 回の ものか。ことばが ぜんぶ ワールド31 の 表に ある とき
 * （L900 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW31Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w31FocusOf(w) !== null);
}

/** フォーカスの 読み上げ（ワールド31）。その focus で 問う ことばを よむ（"-tion" "struct" だけで よまない。年号は 英語の よみかたで: 1868 → eighteen sixty eight。英字と スペース だけ）。あてはまらなければ null */
export function w31Say(focus: string, words: readonly string[]): string | null {
  if (!isW31Words(words)) return null;
  const w = words.find((x) => w31FocusOf(x) === focus);
  if (!w) return null;
  // ボタンの 読み上げは 英字と スペース だけ（sixty-eight → sixty eight）
  return yearOf(w)?.answer.replace(/-/g, " ") ?? w;
}

/** フォーカスの ボタンで よむ おてほん（ワールド31）。あてはまらなければ null */
export function w31Example(focus: string, words: readonly string[]): string | null {
  return w31Say(focus, words);
}
