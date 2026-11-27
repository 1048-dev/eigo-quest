/**
 * ワールド36（しんかいの都・L1051〜1080・ステージ5 の はじまり）の フォニックス・つづりの表（調べ学習と 発表の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 語根 bio: 「bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？」（＿＿: the study of living things → biology / biography / biosphere）
 * - 学習語彙の 強勢: 「つよく いう ところ（●）が あう ことばは どれ？」（○●（2つの 音の 2ばんめを つよく）→ research / summary / topic）
 * - 発表の 区切り: 「発表の 文。ひと いき いれる（｜）のは どの ことばの あと？」（In short, the deep sea is dark and cold. → short / the / deep）
 * - -ology と -ologist: 「-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？」（A marine ＿＿ studies … → biologist / biology / biologyist）
 * - 数と たんいの 読みかた: 「数と たんいの 読みかた。英語で どう よむ？」（−2°C → minus two degrees / two minus degrees / minus twenty degrees）
 *
 * focus の かきかた:
 * - bio は "bio"。強勢は その ことば そのもの（"research"）。区切りは 区切る ことばの 小文字（"short" "first"）。
 * - -ology は "-ology"、-ologist は "-ologist"。数は その 書きかた そのもの（"3,800 meters" "−2°C"）。
 * まちがいの 選択肢は 表に 手で 書く（bio は 表の ほかの bio の ことば、強勢は 強勢の かたちが ちがう 表の ことば、
 * 区切りは おなじ 文の なかの まとまりの とちゅうの ことば、-ology は もう 1つの かたちと ない つづり、数は まちがった 読みかた）。
 */

/** ワールド36 が はじまる レッスン（それより前の 回では ワールド36 の 問題に しない） */
export const W36_START = 1051;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// 語根 bio（いのち）
// ---------------------------------------------------------------------------

/** ことば → パーツ・いみ・英語の せつめい・まちがい 2つ（表の ほかの bio の ことば） */
const BIO: Record<string, { parts: string; ja: string; definition: string; wrong: [string, string] }> = {
  biology: { parts: "bio（いのち）＋ logy（学問）", ja: "せいぶつがく", definition: "the study of living things", wrong: ["biography", "biosphere"] },
  biography: { parts: "bio（いのち）＋ graphy（かいた もの）", ja: "でんき（ある 人の 一生を かいた 本）", definition: "a book about the life of a real person, written by someone else", wrong: ["biology", "biome"] },
  biome: { parts: "bio（いのち）＋ ome（まとまり）", ja: "バイオーム（おなじ 気候と 生きものの 大きな まとまり）", definition: "a large area with its own climate and living things, like a desert or the deep sea", wrong: ["biofuel", "biography"] },
  bioluminescent: { parts: "bio（いのち）＋ luminescent（ひかる）", ja: "生きものが 自分で ひかる", definition: "able to make its own light, like a lanternfish", wrong: ["biodegradable", "antibiotic"] },
  biodiversity: { parts: "bio（いのち）＋ diversity（いろいろ）", ja: "生きものの 多様性（いろいろな 生きものが いる こと）", definition: "the many different kinds of living things in one place", wrong: ["biofuel", "biographer"] },
  biosphere: { parts: "bio（いのち）＋ sphere（きゅう）", ja: "生物圏（生きものが いる ちきゅうの ぶぶん）", definition: "all the parts of the Earth where living things can be found", wrong: ["antibiotic", "biomimicry"] },
  biographer: { parts: "bio（いのち）＋ graph（かく）＋ er（人）", ja: "でんきを かく 人", definition: "a person who writes the story of someone's life", wrong: ["biosphere", "biofuel"] },
  antibiotic: { parts: "anti（はんたい）＋ bio（いのち）＋ tic", ja: "こうせいぶっしつ（ばいきんを やっつける くすり）", definition: "a medicine that kills bacteria and helps sick people get better", wrong: ["biofuel", "biome"] },
  biodegradable: { parts: "bio（いのち）＋ degrade（ばらばらに なる）＋ able（できる）", ja: "小さな 生きものの 力で 自然に 分解される", definition: "able to break down naturally with the help of tiny living things", wrong: ["bioluminescent", "biographer"] },
  symbiosis: { parts: "sym（いっしょに）＋ bio（いのち）＋ sis", ja: "きょうせい（いっしょに 生きて たすけあう こと）", definition: "two different living things living together and helping each other", wrong: ["biodiversity", "antibiotic"] },
  biomimicry: { parts: "bio（いのち）＋ mimicry（まね）", ja: "生きものの まね（自然の アイデアを 発明に いかす こと）", definition: "copying ideas from nature to make new inventions", wrong: ["symbiosis", "biography"] },
  biofuel: { parts: "bio（いのち）＋ fuel（ねんりょう）", ja: "植物などから つくる ねんりょう", definition: "fuel made from plants or other living things", wrong: ["antibiotic", "biosphere"] },
};

export interface BioQuestion {
  word: string;
  parts: string;
  ja: string;
  definition: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある bio の ことばの 問題（英語の せつめい → ことば）。表に なければ null */
export function bioOf(word: string): BioQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(BIO, w);
  if (!x) return null;
  return { word: w, parts: x.parts, ja: x.ja, definition: x.definition, answer: w, wrong: x.wrong };
}

export function bioDisplay(q: BioQuestion): string {
  return `＿＿: ${q.definition}`;
}

export function bioWhy(q: BioQuestion): string {
  return `${q.answer} は ${q.parts}で「${q.ja}」。bio は ギリシャ語で「いのち」。biology（せいぶつがく）・biography（でんき）・bioluminescent（自分で ひかる）の ように、いのちに かんけいする ことばに つくよ。`;
}

// ---------------------------------------------------------------------------
// 学習語彙の 強勢（re-SEARCH・com-PARE・re-SULT）
// ---------------------------------------------------------------------------

/** ことば → 音節（大文字が つよく いう ところ）・いみ・まちがい 2つ（強勢の かたちが ちがう 表の ことば） */
const STRESS: Record<string, { syllables: string; ja: string; wrong: [string, string] }> = {
  research: { syllables: "re-SEARCH", ja: "けんきゅう・しらべる", wrong: ["summary", "topic"] },
  compare: { syllables: "com-PARE", ja: "くらべる", wrong: ["evidence", "information"] },
  result: { syllables: "re-SULT", ja: "けっか", wrong: ["topic", "example"] },
  summary: { syllables: "SUM-ma-ry", ja: "ようやく・まとめ", wrong: ["research", "discover"] },
  evidence: { syllables: "EV-i-dence", ja: "しょうこ・こんきょ", wrong: ["explain", "experiment"] },
  discover: { syllables: "dis-COV-er", ja: "はっけんする", wrong: ["summary", "presentation"] },
  explain: { syllables: "ex-PLAIN", ja: "せつめいする", wrong: ["topic", "evidence"] },
  information: { syllables: "in-for-MA-tion", ja: "じょうほう", wrong: ["experiment", "important"] },
  experiment: { syllables: "ex-PER-i-ment", ja: "じっけん", wrong: ["information", "summary"] },
  conclusion: { syllables: "con-CLU-sion", ja: "けつろん・まとめ", wrong: ["evidence", "compare"] },
  observe: { syllables: "ob-SERVE", ja: "かんさつする", wrong: ["topic", "discover"] },
  example: { syllables: "ex-AM-ple", ja: "れい", wrong: ["summary", "result"] },
  presentation: { syllables: "pres-en-TA-tion", ja: "はっぴょう", wrong: ["experiment", "evidence"] },
  important: { syllables: "im-POR-tant", ja: "たいせつな", wrong: ["topic", "information"] },
  topic: { syllables: "TOP-ic", ja: "わだい・テーマ", wrong: ["result", "important"] },
  conclude: { syllables: "con-CLUDE", ja: "しめくくる・けつろんを だす", wrong: ["summary", "conclusion"] },
};

/** 音節 → ●○ の かたち（re-SEARCH → ○●） */
export function academicPattern(syllables: string): string {
  return syllables.split("-").map((s) => (s === s.toUpperCase() ? "●" : "○")).join("");
}

export interface AcademicQuestion {
  word: string;
  syllables: string;
  pattern: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 学習語彙の 強勢の 問題（●○ の かたち → ことば）。表に なければ null */
export function academicOf(word: string): AcademicQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(STRESS, w);
  if (!x) return null;
  return { word: w, syllables: x.syllables, pattern: academicPattern(x.syllables), ja: x.ja, answer: w, wrong: x.wrong };
}

/** 表の ことばの ●○ の かたち（表に なければ null） */
export function academicPatternOf(word: string): string | null {
  const x = own(STRESS, word.toLowerCase().trim());
  return x ? academicPattern(x.syllables) : null;
}

export function academicDisplay(q: AcademicQuestion): string {
  const n = q.pattern.length;
  const i = q.pattern.indexOf("●") + 1;
  return `${q.pattern}（${n}つの 音の ${i}ばんめを つよく）`;
}

export function academicWhy(q: AcademicQuestion): string {
  const others = q.wrong.map((w) => `${w} は ${own(STRESS, w)!.syllables}（${academicPattern(own(STRESS, w)!.syllables)}）`).join("、");
  return `${q.answer}（${q.ja}）は ${q.syllables}（${q.pattern}）。${others}。発表で つかう ながい ことばは、つよく いう ところが 1つ だけ。-tion で おわる ことばは -tion の すぐ まえを つよく いうよ（in-for-MA-tion）。`;
}

// ---------------------------------------------------------------------------
// 発表の 区切り（ひと いき いれる ところ ｜）
// ---------------------------------------------------------------------------

/** 文 → 区切る ことば（文の なかの かたち）・いみ・まちがい 2つ（まとまりの とちゅうの ことば） */
const PAUSE: Record<string, { pause: string; ja: string; wrong: [string, string] }> = {
  "In short, the deep sea is dark and cold": { pause: "short", ja: "つまり、深海は くらくて つめたい", wrong: ["the", "deep"] },
  "Anglerfish live in the dark, so they make their own light": { pause: "dark", ja: "チョウチンアンコウは くらやみに すむので、自分で 光を つくる", wrong: ["the", "their"] },
  "The animals that live down there have special bodies": { pause: "there", ja: "そこに すむ 動物たちは とくべつな 体を もって いる", wrong: ["The", "special"] },
  "As you know, sunlight cannot reach the bottom": { pause: "know", ja: "しって いる とおり、日の 光は 海の そこまで とどかない", wrong: ["cannot", "the"] },
  "The main point is that the ocean needs our help": { pause: "is", ja: "いちばん 大切な ことは、海には わたしたちの たすけが ひつようだ と いう こと", wrong: ["main", "our"] },
  "According to this book, giant squid have huge eyes": { pause: "book", ja: "この 本に よると、ダイオウイカは とても 大きな 目を もって いる", wrong: ["this", "giant"] },
  "Most of the deep sea has never been explored": { pause: "sea", ja: "深海の ほとんどは まだ たんけん されて いない", wrong: ["of", "been"] },
  "Like a flashlight, some fish can make light": { pause: "flashlight", ja: "かいちゅうでんとうの ように、光を つくれる 魚も いる", wrong: ["a", "some"] },
  "In this article, the writer explains marine snow": { pause: "article", ja: "この 記事で、書いた 人は マリンスノーを せつめい して いる", wrong: ["this", "marine"] },
  "First, it tells us where lanternfish live": { pause: "First", ja: "まず、ハダカイワシが どこに すむかを おしえて くれる", wrong: ["it", "where"] },
  "Every night, they swim up to find food": { pause: "night", ja: "まいばん、えさを さがしに 上へ およいで いく", wrong: ["they", "to"] },
  "When the sun comes up, they swim down again": { pause: "up", ja: "日が のぼると、また 下へ およいで いく", wrong: ["the", "they"] },
  "If you take notes, you can remember more": { pause: "notes", ja: "メモを とると、もっと おぼえて いられる", wrong: ["take", "can"] },
  "Write short words, not long sentences": { pause: "words", ja: "ながい 文では なく、みじかい ことばを 書こう", wrong: ["short", "long"] },
  "The most important word in this paragraph is glow": { pause: "paragraph", ja: "この だんらくで いちばん 大切な ことばは glow（ひかる）", wrong: ["most", "this"] },
  "After you read, look at your notes again": { pause: "read", ja: "読んだ あとで、もう いちど メモを 見よう", wrong: ["you", "your"] },
};
const PAUSE_KEYS: Record<string, string> = Object.fromEntries(Object.keys(PAUSE).map((k) => [k.toLowerCase(), k]));

export interface PauseQuestion {
  sentence: string;
  pause: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 区切りの 文の 問題。表に なければ null */
export function pauseOf(sentence: string): PauseQuestion | null {
  const k = own(PAUSE_KEYS, sentence.toLowerCase().trim());
  if (!k) return null;
  const x = PAUSE[k];
  return { sentence: k, pause: x.pause, ja: x.ja, answer: x.pause, wrong: x.wrong };
}

export function pauseDisplay(q: PauseQuestion): string {
  return `${q.sentence}.（${q.ja}）`;
}

/** 区切りの しるしを 入れた 文（In short, ｜ the deep sea is dark and cold.） */
export function pauseMarked(q: PauseQuestion): string {
  const ws = q.sentence.split(" ");
  const i = ws.findIndex((w) => w.replace(/[^A-Za-z']/g, "") === q.pause);
  return [...ws.slice(0, i + 1), "｜", ...ws.slice(i + 1)].join(" ") + ".";
}

export function pauseWhy(q: PauseQuestion): string {
  return `${pauseMarked(q)} — 区切るのは まとまりの おわり（はじめの ことばの あと・コンマの ところ・ながい 主語の あと）。${q.wrong.map((w) => `${w} の あと`).join("や ")}で 区切ると まとまりが こわれて わかりにくい。発表では 区切りで 少し 間を とると、きく 人が ついて こられるよ。`;
}

// ---------------------------------------------------------------------------
// -ology（学問）と -ologist（その 学問を する 人）
// ---------------------------------------------------------------------------

/** ことば → 英語の 文（＿＿ に 入る）・いみ・強勢・まちがい 2つ（もう 1つの かたち・ない つづり） */
const OLOGY: Record<string, { sentence: string; ja: string; stress: string; wrong: [string, string] }> = {
  biologist: { sentence: "A marine ＿＿ studies animals and plants that live in the sea.", ja: "せいぶつがくしゃ", stress: "bi-OL-o-gist", wrong: ["biology", "biologyist"] },
  zoology: { sentence: "Kiko wants to study ＿＿ because she loves animals.", ja: "どうぶつがく", stress: "zo-OL-o-gy", wrong: ["zoologist", "zooology"] },
  zoologist: { sentence: "The ＿＿ told us how elephants talk to each other.", ja: "どうぶつがくしゃ", stress: "zo-OL-o-gist", wrong: ["zoology", "zooist"] },
  ecology: { sentence: "In ＿＿, we learn how living things depend on each other.", ja: "せいたいがく（生きものと まわりの つながりの 学問）", stress: "e-COL-o-gy", wrong: ["ecologist", "ecolegy"] },
  ecologist: { sentence: "An ＿＿ checks how the plants and animals in the forest are doing.", ja: "せいたいがくしゃ", stress: "e-COL-o-gist", wrong: ["ecology", "ecologyst"] },
  technology: { sentence: "New ＿＿ helps scientists explore the deep sea.", ja: "かがく ぎじゅつ", stress: "tech-NOL-o-gy", wrong: ["tecnology", "technolgy"] },
  archaeology: { sentence: "Haru loves old things, so he reads books about ＿＿.", ja: "こうこがく（むかしの 人の くらしを しらべる 学問）", stress: "ar-chae-OL-o-gy", wrong: ["archaeologist", "archeaology"] },
  archaeologist: { sentence: "An ＿＿ found an old clay pot under the ground.", ja: "こうこがくしゃ", stress: "ar-chae-OL-o-gist", wrong: ["archaeology", "archaeologyst"] },
  mythology: { sentence: "The library has many books of world ＿＿, full of old stories about the sun and the moon.", ja: "しんわ（むかしから つたわる ふしぎな 話）", stress: "my-THOL-o-gy", wrong: ["mythologist", "mithology"] },
  meteorology: { sentence: "The study of weather is called ＿＿.", ja: "きしょうがく（てんきの 学問）", stress: "me-te-or-OL-o-gy", wrong: ["meteorologist", "meteorolgy"] },
  meteorologist: { sentence: "The ＿＿ on TV said it will rain tomorrow.", ja: "きしょうがくしゃ・きしょう よほうし", stress: "me-te-or-OL-o-gist", wrong: ["meteorology", "weatherologist"] },
  volcanologist: { sentence: "A ＿＿ studies volcanoes and how they erupt.", ja: "かざんがくしゃ", stress: "vol-can-OL-o-gist", wrong: ["volcanology", "volcanoist"] },
};

export type OlogyKind = "-ology" | "-ologist";

export interface OlogyQuestion {
  word: string;
  kind: OlogyKind;
  sentence: string;
  ja: string;
  stress: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -ology / -ologist の ことばの 問題（英語の 文 → ことば）。表に なければ null */
export function ologyOf(word: string): OlogyQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(OLOGY, w);
  if (!x) return null;
  return { word: w, kind: w.endsWith("ologist") ? "-ologist" : "-ology", sentence: x.sentence, ja: x.ja, stress: x.stress, answer: w, wrong: x.wrong };
}

export function ologyDisplay(q: OlogyQuestion): string {
  return q.sentence;
}

export function ologyWhy(q: OlogyQuestion): string {
  const what = q.kind === "-ologist" ? "その 学問を する 人（-ologist）" : "学問（-ology）";
  return `${q.answer}（${q.ja}）。この 文には ${what} が 入る。-ology は「〜の 学問」、-ologist は「〜を けんきゅう する 人」。つよく いうのは -ology の まえの o の ところ（${q.stress}）だよ。`;
}

// ---------------------------------------------------------------------------
// 数と たんいの 読みかた（3,800 meters・−2°C・100 km/h）
// ---------------------------------------------------------------------------

type UnitKind = "big" | "temp" | "unit" | "decimal" | "per" | "times";

/** 書きかた → 読みかた・まちがい 2つ・いみ・しゅるい */
const UNITS: Record<string, { answer: string; wrong: [string, string]; ja: string; kind: UnitKind }> = {
  "3,800 meters": { answer: "three thousand eight hundred meters", wrong: ["three hundred eighty meters", "thirty-eight thousand meters"], ja: "3800 メートル", kind: "big" },
  "11,000 meters": { answer: "eleven thousand meters", wrong: ["one thousand one hundred meters", "one hundred ten thousand meters"], ja: "1まん 1000 メートル", kind: "big" },
  "200 meters": { answer: "two hundred meters", wrong: ["twenty meters", "two thousand meters"], ja: "200 メートル", kind: "big" },
  "−2°C": { answer: "minus two degrees", wrong: ["two minus degrees", "minus twenty degrees"], ja: "マイナス 2 ど", kind: "temp" },
  "4°C": { answer: "four degrees", wrong: ["four degree", "forty degrees"], ja: "4 ど", kind: "temp" },
  "350°C": { answer: "three hundred fifty degrees", wrong: ["thirty-five degrees", "three five zero degrees"], ja: "350 ど", kind: "temp" },
  "13 meters": { answer: "thirteen meters", wrong: ["thirty meters", "one three meters"], ja: "13 メートル", kind: "unit" },
  "27 cm": { answer: "twenty-seven centimeters", wrong: ["twenty-seven centimeter", "two seven centimeters"], ja: "27 センチメートル", kind: "unit" },
  "11 km": { answer: "eleven kilometers", wrong: ["eleven kilometer", "one one kilometers"], ja: "11 キロメートル", kind: "unit" },
  "400 times": { answer: "four hundred times", wrong: ["forty times", "four hundreds times"], ja: "400 ばい", kind: "times" },
  "3.8 km": { answer: "three point eight kilometers", wrong: ["three dot eight kilometers", "thirty-eight kilometers"], ja: "3.8 キロメートル", kind: "decimal" },
  "100 km/h": { answer: "one hundred kilometers per hour", wrong: ["one hundred kilometer hours", "one hundred per kilometers hour"], ja: "じそく 100 キロメートル", kind: "per" },
};
const UNIT_KEYS: Record<string, string> = Object.fromEntries(Object.keys(UNITS).map((k) => [k.toLowerCase(), k]));

const UNIT_HOW: Record<UnitKind, string> = {
  big: "3けたごとの コンマの まえは thousand（せん）。3,800 = three thousand eight hundred、11,000 = eleven thousand。",
  temp: "°C は degrees（ど）と よむ。0 より ひくい ときは まえに minus を つける（−2°C = minus two degrees）。1 より 大きい 数なら degrees と s が つくよ。",
  unit: "cm は centimeters、km は kilometers、m は meters と よむ。1 より 大きい 数の あとは s を つける（27 centimeters）。",
  times: "〜ばいは times。hundred は 数の あとでも s を つけない（four hundred times）。",
  decimal: "小数点は point と よむ（3.8 = three point eight）。dot とは よまないよ。",
  per: "/h（1じかん あたり）は per hour と よむ（100 km/h = one hundred kilometers per hour）。",
};

export interface UnitQuestion {
  word: string;
  ja: string;
  kind: UnitKind;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 数と たんいの 問題（書きかた → 読みかた）。表に なければ null */
export function unitOf(word: string): UnitQuestion | null {
  const k = own(UNIT_KEYS, word.toLowerCase().trim());
  if (!k) return null;
  const x = UNITS[k];
  return { word: k, ja: x.ja, kind: x.kind, answer: x.answer, wrong: x.wrong };
}

export function unitDisplay(q: UnitQuestion): string {
  return `${q.word}（${q.ja}）`;
}

export function unitWhy(q: UnitQuestion): string {
  return `${q.word} は ${q.answer}。${UNIT_HOW[q.kind]}発表で 数を いう ときは、ゆっくり はっきり いおう。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w36FocusOf(word: string): string | null {
  if (bioOf(word)) return "bio";
  const s = academicOf(word);
  if (s) return s.word;
  const p = pauseOf(word);
  if (p) return p.pause.toLowerCase();
  const o = ologyOf(word);
  if (o) return o.kind;
  const u = unitOf(word);
  if (u) return u.word;
  return null;
}

/**
 * その回の ことばが ワールド36 の 回の ものか。ことばが ぜんぶ ワールド36 の 表に ある とき
 * （L1050 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW36Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w36FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド36）。その focus で 問う ことばを よむ（"bio" "-ology" だけで よまない）。
 * 区切りは 文を、数は 英語の 読みかたを よむ（−2°C → minus two degrees）。英字・スペース・アポストロフィ だけ。あてはまらなければ null
 */
export function w36Say(focus: string, words: readonly string[]): string | null {
  if (!isW36Words(words)) return null;
  const w = words.find((x) => w36FocusOf(x) === focus);
  if (!w) return null;
  const u = unitOf(w);
  const text = u ? u.answer : w;
  return text.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド36）。あてはまらなければ null */
export function w36Example(focus: string, words: readonly string[]): string | null {
  return w36Say(focus, words);
}
