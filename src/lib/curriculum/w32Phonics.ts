/**
 * ワールド32（たいようの砂漠・L931〜960・ステージ4）の フォニックス・つづりの表（地理・気候・グラフの ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 語根 geo: 「geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？」（geo ＋ logy（〜の 学問）→ ＿＿（ちしつがく）→ geology / geography / geologist）
 * - -al: 「-al を つけて ようすの ことばに。ただしい つづりは どれ？」（nature ＋ al → natural / natureal / naturel）
 * - 方角の ことば: 「ほうがくの ことば。あう ことばは どれ？」（north → ＿＿（きたの）→ northern / northen / northal、北東 → northeast / eastnorth）
 * - 数・分数・割合の 読みかた: 「英語で なんと よむ？」（1/2 → one half、30% → thirty percent、2.5 → two point five）
 * - データの ことばの つづり: 「ただしい つづりは どれ？」（へいきん：The ＿＿ … → average / averege / avrage）
 *
 * focus の かきかた:
 * - geo は "geo"。-al は "-al"。方角は "-ern" "-east" "-west" "-ward"。
 * - 数は その ことば（"350" "1,000,000" "1/2" "30%" "2.5"）。
 * - データの ことばは つづりの むずかしい おわり（"-age" "-ure" "-ease" "-ount"）。
 * まちがいの 選択肢は 表に 手で 書く（-al・方角・つづりは ない ことば だけ）。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド32 が はじまる レッスン（それより前の 回では ワールド32 の 問題に しない） */
export const W32_START = 931;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// 語根 geo（ちきゅう・とち）
// ---------------------------------------------------------------------------

/** ことば → パーツ・いみ・まちがいの 選択肢 2つ（表の ほかの geo の ことば） */
const GEO: Record<string, { parts: string; meaning: string; wrong: [string, string] }> = {
  geography: { parts: "geo（ちきゅう）＋ graphy（かく・あらわす）", meaning: "ちり・ちりがく", wrong: ["geology", "geometry"] },
  geology: { parts: "geo（ちきゅう）＋ logy（〜の 学問）", meaning: "ちしつがく（いしや ちそうの 学問）", wrong: ["geography", "geologist"] },
  geometry: { parts: "geo（とち）＋ metry（はかる）", meaning: "きかがく（ずけいの 学問）", wrong: ["geography", "geothermal"] },
  geographer: { parts: "geography（ちり）＋ er（人）", meaning: "ちりがくしゃ", wrong: ["geologist", "geoscientist"] },
  geologist: { parts: "geology（ちしつがく）＋ ist（人）", meaning: "ちしつがくしゃ", wrong: ["geographer", "geometry"] },
  geoscientist: { parts: "geo（ちきゅう）＋ scientist（かがくしゃ）", meaning: "ちきゅうかがくしゃ", wrong: ["geologist", "geography"] },
  geothermal: { parts: "geo（ちきゅう）＋ thermal（ねつの）", meaning: "ちねつの（ちきゅうの なかの ねつの）", wrong: ["geometric", "geopark"] },
  geopark: { parts: "geo（ちきゅう）＋ park（こうえん）", meaning: "ジオパーク（ちきゅうの ようすを まなべる こうえん）", wrong: ["geoglyph", "geography"] },
  geoglyph: { parts: "geo（とち）＋ glyph（ほった しるし・え）", meaning: "ちじょうえ（じめんに えがいた 大きな え）", wrong: ["geopark", "geode"] },
  geographic: { parts: "geography（ちり）＋ ic（〜の）", meaning: "ちりの・ちりてきな", wrong: ["geometric", "geologist"] },
  geometric: { parts: "geometry（きかがく）＋ ic（〜の）", meaning: "ずけいの・きかがくもようの", wrong: ["geographic", "geothermal"] },
  geode: { parts: "geo（ちきゅう）＋ ode（〜の ような もの）", meaning: "ジオード（なかに 水晶が ある まるい いし）", wrong: ["geoglyph", "geology"] },
};

export interface GeoQuestion {
  word: string;
  parts: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある geo の ことばの 問題（パーツと いみ → ことば）。表に なければ null */
export function geoOf(word: string): GeoQuestion | null {
  const w = word.toLowerCase();
  const x = own(GEO, w);
  if (!x) return null;
  return { word: w, parts: x.parts, meaning: x.meaning, answer: w, wrong: x.wrong };
}

export function geoDisplay(q: GeoQuestion): string {
  return `${q.parts} → ＿＿「${q.meaning}」`;
}

export function geoWhy(q: GeoQuestion): string {
  return `${q.answer} は「${q.meaning}」。geo は ギリシャ語で「ちきゅう・とち」。geography（ちり）・geology（ちしつがく）・geometry（きかがく）の ように、geo の あとの パーツで いみが きまるよ。`;
}

// ---------------------------------------------------------------------------
// -al（〜の・〜てきな）
// ---------------------------------------------------------------------------

/** ようすの ことば → もとの ことば・いみ・ようすの いみ・つくりかた・まちがいの つづり 2つ（ない ことば） */
const AL: Record<string, { base: string; baseJa: string; adjJa: string; how: string; wrong: [string, string] }> = {
  natural: { base: "nature", baseJa: "しぜん", adjJa: "しぜんの", how: "nature の e を とって ＋ al。よみかたも ネイ → ナ に かわる", wrong: ["natureal", "naturel"] },
  national: { base: "nation", baseJa: "くに", adjJa: "くにの・こくりつの", how: "nation ＋ al。よみかたが ネイ → ナ に かわる", wrong: ["nationel", "nationnal"] },
  tropical: { base: "tropic", baseJa: "ねったい（せきどうの ちかく）", adjJa: "ねったいの", how: "tropic ＋ al", wrong: ["tropicle", "tropickal"] },
  coastal: { base: "coast", baseJa: "かいがん", adjJa: "かいがんの・うみべの", how: "coast ＋ al", wrong: ["coastel", "coastle"] },
  seasonal: { base: "season", baseJa: "きせつ", adjJa: "きせつの", how: "season ＋ al", wrong: ["seasonel", "seasonle"] },
  central: { base: "center", baseJa: "まんなか", adjJa: "まんなかの・中央の", how: "center の er を r に して ＋ al", wrong: ["centeral", "centrel"] },
  global: { base: "globe", baseJa: "ちきゅう・ちきゅうぎ", adjJa: "せかいの・ちきゅう ぜんたいの", how: "globe の e を とって ＋ al", wrong: ["globeal", "globel"] },
  cultural: { base: "culture", baseJa: "ぶんか", adjJa: "ぶんかの", how: "culture の e を とって ＋ al", wrong: ["cultureal", "culturel"] },
  original: { base: "origin", baseJa: "はじまり・もと", adjJa: "もとの・どくじの", how: "origin ＋ al", wrong: ["originel", "origineal"] },
  environmental: { base: "environment", baseJa: "かんきょう", adjJa: "かんきょうの", how: "environment ＋ al", wrong: ["environmentel", "enviromental"] },
  musical: { base: "music", baseJa: "おんがく", adjJa: "おんがくの", how: "music ＋ al", wrong: ["musicle", "musicel"] },
  personal: { base: "person", baseJa: "人", adjJa: "こじんの・じぶんだけの", how: "person ＋ al", wrong: ["personle", "persenal"] },
};

export interface AlQuestion {
  word: string;
  base: string;
  baseJa: string;
  adjJa: string;
  how: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -al の ことばの 問題（もとの ことば ＋ al → つづり）。表に なければ null */
export function alOf(word: string): AlQuestion | null {
  const w = word.toLowerCase();
  const x = own(AL, w);
  if (!x) return null;
  return { word: w, base: x.base, baseJa: x.baseJa, adjJa: x.adjJa, how: x.how, answer: w, wrong: x.wrong };
}

export function alDisplay(q: AlQuestion): string {
  return `${q.base}（${q.baseJa}）＋ al → ＿＿（${q.adjJa}）`;
}

export function alWhy(q: AlQuestion): string {
  return `${q.answer}（${q.how}）。-al を つけると「〜の・〜てきな」と いう ようすの ことばに なる。おわりの e が きえたり、よみかたが かわったり する ことばが あるよ。`;
}

// ---------------------------------------------------------------------------
// 方角の ことば（-ern・北東などの くみあわせ・-ward）
// ---------------------------------------------------------------------------

export type DirectionFocus = "-ern" | "-east" | "-west" | "-ward";

/** ことば → focus・もとの ことば（くみあわせは null）・いみ・まちがいの 選択肢 2つ（ない ことば） */
const DIRECTION: Record<string, { focus: DirectionFocus; base: string | null; baseJa: string | null; meaning: string; wrong: [string, string] }> = {
  northern: { focus: "-ern", base: "north", baseJa: "きた", meaning: "きたの・北部の", wrong: ["northen", "northal"] },
  southern: { focus: "-ern", base: "south", baseJa: "みなみ", meaning: "みなみの・南部の", wrong: ["southen", "southal"] },
  eastern: { focus: "-ern", base: "east", baseJa: "ひがし", meaning: "ひがしの・東部の", wrong: ["eastan", "eastal"] },
  western: { focus: "-ern", base: "west", baseJa: "にし", meaning: "にしの・西部の", wrong: ["westen", "westal"] },
  northeast: { focus: "-east", base: null, baseJa: null, meaning: "北東（きたと ひがしの あいだ）", wrong: ["eastnorth", "northest"] },
  southeast: { focus: "-east", base: null, baseJa: null, meaning: "南東（みなみと ひがしの あいだ）", wrong: ["eastsouth", "southest"] },
  northwest: { focus: "-west", base: null, baseJa: null, meaning: "北西（きたと にしの あいだ）", wrong: ["westnorth", "nothwest"] },
  southwest: { focus: "-west", base: null, baseJa: null, meaning: "南西（みなみと にしの あいだ）", wrong: ["westsouth", "sowthwest"] },
  northward: { focus: "-ward", base: "north", baseJa: "きた", meaning: "きたへ・きたの ほうへ", wrong: ["northword", "northwerd"] },
  southward: { focus: "-ward", base: "south", baseJa: "みなみ", meaning: "みなみへ・みなみの ほうへ", wrong: ["southword", "southwerd"] },
  eastward: { focus: "-ward", base: "east", baseJa: "ひがし", meaning: "ひがしへ・ひがしの ほうへ", wrong: ["eastword", "eastwerd"] },
  westward: { focus: "-ward", base: "west", baseJa: "にし", meaning: "にしへ・にしの ほうへ", wrong: ["westword", "westwerd"] },
  upward: { focus: "-ward", base: "up", baseJa: "うえ", meaning: "うえへ・うえの ほうへ", wrong: ["upword", "upwerd"] },
  downward: { focus: "-ward", base: "down", baseJa: "した", meaning: "したへ・したの ほうへ", wrong: ["downword", "downwerd"] },
  forward: { focus: "-ward", base: "fore", baseJa: "まえ", meaning: "まえへ・まえの ほうへ", wrong: ["forword", "forwerd"] },
  backward: { focus: "-ward", base: "back", baseJa: "うしろ", meaning: "うしろへ・うしろの ほうへ", wrong: ["backword", "backwerd"] },
};

export interface DirectionQuestion {
  word: string;
  focus: DirectionFocus;
  base: string | null;
  baseJa: string | null;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 方角の ことばの 問題。表に なければ null */
export function directionOf(word: string): DirectionQuestion | null {
  const w = word.toLowerCase();
  const x = own(DIRECTION, w);
  if (!x) return null;
  return { word: w, focus: x.focus, base: x.base, baseJa: x.baseJa, meaning: x.meaning, answer: w, wrong: x.wrong };
}

export function directionDisplay(q: DirectionQuestion): string {
  return q.base ? `${q.base}（${q.baseJa}）→ ＿＿「${q.meaning}」` : `＿＿「${q.meaning}」`;
}

export function directionWhy(q: DirectionQuestion): string {
  const how: Record<DirectionFocus, string> = {
    "-ern": "north・south・east・west に ern を つけると「〜の・〜部の」（northern・southern）。southern の ou は「ア」と よむよ。",
    "-east": "英語では north か south を さきに いう（northeast・southeast）。eastnorth とは いわないよ。",
    "-west": "英語では north か south を さきに いう（northwest・southwest）。westnorth とは いわないよ。",
    "-ward": "ward は「〜の ほうへ」（northward・upward・forward）。word（ことば）と まちがえない ように w-a-r-d と おぼえよう。",
  };
  return `${q.answer}。${how[q.focus]}`;
}

// ---------------------------------------------------------------------------
// 数・分数・割合の 読みかた
// ---------------------------------------------------------------------------

export type NumberKind = "hundred" | "thousand" | "million" | "fraction" | "percent" | "decimal";

/** ことば → 種類・答えの よみ（読み上げにも つかう）・まちがいの よみ 2つ・いみ */
const NUMBERS: Record<string, { kind: NumberKind; answer: string; wrong: [string, string]; meaning: string }> = {
  "350": { kind: "hundred", answer: "three hundred fifty", wrong: ["three five zero", "thirty-five"], meaning: "さんびゃく ごじゅう" },
  "4,000": { kind: "thousand", answer: "four thousand", wrong: ["four hundred", "forty thousand"], meaning: "よんせん" },
  "12,000": { kind: "thousand", answer: "twelve thousand", wrong: ["twelve hundred", "one hundred twenty thousand"], meaning: "いちまん にせん" },
  "60,000": { kind: "thousand", answer: "sixty thousand", wrong: ["six thousand", "six hundred thousand"], meaning: "ろくまん" },
  "250,000": { kind: "thousand", answer: "two hundred fifty thousand", wrong: ["twenty-five thousand", "two thousand fifty"], meaning: "にじゅうごまん" },
  "1,000,000": { kind: "million", answer: "one million", wrong: ["one billion", "ten thousand"], meaning: "ひゃくまん" },
  "3,000,000": { kind: "million", answer: "three million", wrong: ["three thousand", "thirty million"], meaning: "さんびゃくまん" },
  "8,000,000": { kind: "million", answer: "eight million", wrong: ["eight billion", "eight hundred thousand"], meaning: "はっぴゃくまん" },
  "1/2": { kind: "fraction", answer: "one half", wrong: ["one two", "two ones"], meaning: "2ぶんの 1" },
  "1/4": { kind: "fraction", answer: "one quarter", wrong: ["one four", "four quarters"], meaning: "4ぶんの 1" },
  "3/4": { kind: "fraction", answer: "three quarters", wrong: ["three four", "four thirds"], meaning: "4ぶんの 3" },
  "1/3": { kind: "fraction", answer: "one third", wrong: ["one three", "three thirds"], meaning: "3ぶんの 1" },
  "30%": { kind: "percent", answer: "thirty percent", wrong: ["three zero percent", "thirteen percent"], meaning: "30 パーセント" },
  "75%": { kind: "percent", answer: "seventy-five percent", wrong: ["seven five percent", "seventeen percent"], meaning: "75 パーセント" },
  "2.5": { kind: "decimal", answer: "two point five", wrong: ["two dot five", "twenty-five"], meaning: "にてん ご" },
  "0.5": { kind: "decimal", answer: "zero point five", wrong: ["zero dot five", "five"], meaning: "れいてん ご" },
};

export interface NumberQuestion {
  word: string;
  kind: NumberKind;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 数の 問題。表に なければ null */
export function numberOf(word: string): NumberQuestion | null {
  const k = word.trim();
  const x = own(NUMBERS, k);
  if (!x) return null;
  return { word: k, kind: x.kind, meaning: x.meaning, answer: x.answer, wrong: x.wrong };
}

export function numberDisplay(q: NumberQuestion): string {
  return `${q.word}（${q.meaning}）`;
}

export function numberWhy(q: NumberQuestion): string {
  const how: Record<NumberKind, string> = {
    hundred: "100〜999 は「〇 hundred ＋ のこり」（350 → three hundred fifty）。hundred に s は つけない。",
    thousand: "さいごの カンマの まえの かず ＋ thousand（12,000 → twelve thousand、250,000 → two hundred fifty thousand）。thousand に s は つけない。",
    million: "0 が 6こ（カンマが 2つ）なら million（1,000,000 → one million）。million に s は つけない。",
    fraction: "分数は 上の かず（one・three）＋ 下の かずの じゅんばんの かたち（third）。2 は half、4 は quarter。上が 2 いじょうなら s を つける（three quarters）。",
    percent: "% は percent。percent に s は つけない（thirty percent）。",
    decimal: "小数点は point と よみ、あとの かずは 1つずつ よむ（2.5 → two point five）。",
  };
  return `${q.answer}。${how[q.kind]}`;
}

// ---------------------------------------------------------------------------
// データの ことばの つづり（-age・-ure・-ease・-ount）
// ---------------------------------------------------------------------------

export type DataFocus = "-age" | "-ure" | "-ease" | "-ount";

/** ことば → focus・いみ・文（＿＿ に 入る）・まちがいの つづり 2つ（ない ことば） */
const DATA: Record<string, { focus: DataFocus; meaning: string; sentence: string; wrong: [string, string] }> = {
  average: { focus: "-age", meaning: "へいきん", sentence: "The ＿＿ temperature in July is 35 degrees.", wrong: ["averege", "avrage"] },
  percentage: { focus: "-age", meaning: "わりあい・パーセント", sentence: "What ＿＿ of the land is desert?", wrong: ["percentege", "persentage"] },
  storage: { focus: "-age", meaning: "ためて おく こと・ちょぞう", sentence: "The village has a big water ＿＿ tank.", wrong: ["storege", "storrage"] },
  shortage: { focus: "-age", meaning: "たりない こと・ふそく", sentence: "There is a water ＿＿ in summer.", wrong: ["shortege", "shortige"] },
  temperature: { focus: "-ure", meaning: "おんど・きおん", sentence: "The ＿＿ was 40 degrees at noon.", wrong: ["temprature", "tempereture"] },
  measure: { focus: "-ure", meaning: "はかる", sentence: "Let's ＿＿ the rain every day.", wrong: ["mesure", "meazure"] },
  pressure: { focus: "-ure", meaning: "あつりょく・きあつ", sentence: "The air ＿＿ is low, so it may rain.", wrong: ["presure", "pressher"] },
  moisture: { focus: "-ure", meaning: "しめりけ・すいぶん", sentence: "A cactus keeps ＿＿ in its stem.", wrong: ["moistur", "moysture"] },
  increase: { focus: "-ease", meaning: "ふえる・ふやす", sentence: "The number of trees will ＿＿ every year.", wrong: ["increese", "encrease"] },
  decrease: { focus: "-ease", meaning: "へる・へらす", sentence: "We want to ＿＿ the water we waste.", wrong: ["decreese", "dicrease"] },
  release: { focus: "-ease", meaning: "はなす・ながす", sentence: "The dam will ＿＿ water into the river.", wrong: ["releese", "relase"] },
  amount: { focus: "-ount", meaning: "りょう", sentence: "A shower uses a large ＿＿ of water.", wrong: ["amaunt", "ammount"] },
  count: { focus: "-ount", meaning: "かぞえる", sentence: "Let's ＿＿ the camels at the oasis.", wrong: ["caunt", "cownt"] },
  account: { focus: "-ount", meaning: "せつめい・きろく・アカウント", sentence: "Please give an ＿＿ of what you saw.", wrong: ["acount", "accaunt"] },
};

export interface DataQuestion {
  word: string;
  focus: DataFocus;
  meaning: string;
  sentence: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある データの ことばの 問題（ただしい つづり）。表に なければ null */
export function dataOf(word: string): DataQuestion | null {
  const w = word.toLowerCase();
  const x = own(DATA, w);
  if (!x) return null;
  return { word: w, focus: x.focus, meaning: x.meaning, sentence: x.sentence, answer: w, wrong: x.wrong };
}

export function dataDisplay(q: DataQuestion): string {
  return `${q.meaning}：${q.sentence}`;
}

export function dataWhy(q: DataQuestion): string {
  const how: Record<DataFocus, string> = {
    "-age": "おわりの age は「イッジ」と きこえるけど、つづりは a-g-e。",
    "-ure": "おわりの ure は「チャー・ジャー・シャー」と きこえるけど、つづりは u-r-e。",
    "-ease": "ease は「イース」。ee では なく e-a。in（なかへ）・de（したへ）・re（もとへ）の あとに つく。",
    "-ount": "ount は「アウント」。ow では なく o-u。",
  };
  return `${q.answer}（${q.meaning}）。${how[q.focus]}`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w32FocusOf(word: string): string | null {
  if (geoOf(word)) return "geo";
  if (alOf(word)) return "-al";
  const d = directionOf(word);
  if (d) return d.focus;
  const n = numberOf(word);
  if (n) return n.word;
  const s = dataOf(word);
  if (s) return s.focus;
  return null;
}

/**
 * その回の ことばが ワールド32 の 回の ものか。ことばが ぜんぶ ワールド32 の 表に ある とき
 * （L930 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW32Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w32FocusOf(w) !== null);
}

/** フォーカスの 読み上げ（ワールド32）。その focus で 問う ことばを よむ（"geo" "-al" だけで よまない。数は 英語の よみかたで: 1/2 → one half。英字と スペース だけ）。あてはまらなければ null */
export function w32Say(focus: string, words: readonly string[]): string | null {
  if (!isW32Words(words)) return null;
  const w = words.find((x) => w32FocusOf(x) === focus);
  if (!w) return null;
  // ボタンの 読み上げは 英字と スペース だけ（seventy-five → seventy five）
  return numberOf(w)?.answer.replace(/-/g, " ") ?? w;
}

/** フォーカスの ボタンで よむ おてほん（ワールド32）。あてはまらなければ null */
export function w32Example(focus: string, words: readonly string[]): string | null {
  return w32Say(focus, words);
}
