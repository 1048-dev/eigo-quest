/**
 * ワールド35（ちえの議事堂・L1021〜1050・ステージ4 の 総まとめ）の フォニックス・つづりの表（社会の 話題の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - -ity の 名詞: 「-ity の ことば。もとの ことば（形容詞）は どれ？」（responsibility（せきにん）→ もとの ことば: ＿＿ → responsible / responsable / responsibil）
 * - inter- と co-: 「inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？」（If we all ＿＿, we can finish the poster faster. → cooperate / interview / intersection）
 * - 対比の 強勢: 「B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？」（A: Did you say Tuesday?　B: I said Thursday. → Thursday / I / said）
 * - あらたまった ことばと くだけた ことば: 「あらたまった ことば（手紙・発表で つかう）は どれ？」（ふだん: get（もらう）→ あらたまった: ＿＿ → receive / recieve / receeve）
 * - ステージ4 の 語根の まとめ: 「ステージ4 の 語根。＿＿ に 入る パーツは どれ？」（in＿＿（中まで よく 見る → しらべる）→ spect / port / rupt）
 *
 * focus の かきかた:
 * - -ity は "-ity"。inter- と co- は "inter" "co"。対比の 強勢は つよく いう ことばの 小文字（"this" "thursday"）。
 * - あらたまった ことばは その ことば そのもの（"children" "receive"）。語根は その 語根（"spect" "dict" "struct" "port" "rupt" "ject"）。
 * まちがいの 選択肢は 表に 手で 書く（-ity・あらたまった ことばは ない つづり、inter- と co- は 表に ある ほかの ことば、
 * 対比の 強勢は おなじ 文の ほかの ことば、語根は 入れても ことばに ならない ほかの 語根）。
 */

/** ワールド35 が はじまる レッスン（それより前の 回では ワールド35 の 問題に しない） */
export const W35_START = 1021;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// -ity の 名詞（〜な こと・〜さ）
// ---------------------------------------------------------------------------

/** 名詞 → もとの 形容詞・いみ・名詞の いみ・つくりかた・強勢・まちがいの つづり 2つ（ない ことば） */
const ITY: Record<string, { base: string; baseJa: string; ja: string; how: string; stress: string; wrong: [string, string] }> = {
  equality: { base: "equal", baseJa: "びょうどうな", ja: "びょうどう", how: "equal ＋ ity", stress: "e-QUAL-i-ty", wrong: ["equall", "equel"] },
  diversity: { base: "diverse", baseJa: "いろいろな", ja: "いろいろな ちがいが ある こと", how: "diverse の e を とって ＋ ity", stress: "di-VER-si-ty", wrong: ["diverce", "diversy"] },
  curiosity: { base: "curious", baseJa: "しりたがりの", ja: "こうきしん", how: "curious の ous が os に かわって ＋ ity", stress: "cu-ri-OS-i-ty", wrong: ["curios", "curiouse"] },
  personality: { base: "personal", baseJa: "その 人の", ja: "せいかく・こせい", how: "personal ＋ ity", stress: "per-son-AL-i-ty", wrong: ["personnal", "personel"] },
  creativity: { base: "creative", baseJa: "そうぞうりょくの ある", ja: "そうぞうりょく", how: "creative の e を とって ＋ ity", stress: "cre-a-TIV-i-ty", wrong: ["creativ", "createive"] },
  similarity: { base: "similar", baseJa: "にて いる", ja: "にて いる ところ", how: "similar ＋ ity", stress: "sim-i-LAR-i-ty", wrong: ["similer", "simillar"] },
  activity: { base: "active", baseJa: "かっぱつな", ja: "かつどう", how: "active の e を とって ＋ ity", stress: "ac-TIV-i-ty", wrong: ["activ", "activy"] },
  ability: { base: "able", baseJa: "できる", ja: "のうりょく・できる 力", how: "able の ble が bil に かわって ＋ ity", stress: "a-BIL-i-ty", wrong: ["abil", "abble"] },
  possibility: { base: "possible", baseJa: "ありうる・できる", ja: "かのうせい", how: "possible の ble が bil に かわって ＋ ity", stress: "pos-si-BIL-i-ty", wrong: ["possable", "possibil"] },
  majority: { base: "major", baseJa: "おおきな ほうの・おもな", ja: "だいたすう（はんぶんより おおい 人）", how: "major ＋ ity", stress: "ma-JOR-i-ty", wrong: ["majer", "majour"] },
  popularity: { base: "popular", baseJa: "にんきの ある", ja: "にんき", how: "popular ＋ ity", stress: "pop-u-LAR-i-ty", wrong: ["populer", "poppular"] },
  responsibility: { base: "responsible", baseJa: "せきにんの ある", ja: "せきにん・やくわり", how: "responsible の ble が bil に かわって ＋ ity", stress: "re-spon-si-BIL-i-ty", wrong: ["responsable", "responsibil"] },
  security: { base: "secure", baseJa: "あんぜんな・あんしんな", ja: "あんぜん・けいび", how: "secure の e を とって ＋ ity", stress: "se-CUR-i-ty", wrong: ["secur", "securre"] },
  reality: { base: "real", baseJa: "ほんとうの", ja: "げんじつ・ほんとうの こと", how: "real ＋ ity", stress: "re-AL-i-ty", wrong: ["reall", "reale"] },
};

export interface ItyQuestion {
  word: string;
  base: string;
  baseJa: string;
  ja: string;
  how: string;
  stress: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -ity の ことばの 問題（名詞 → もとの 形容詞）。表に なければ null */
export function ityOf(word: string): ItyQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(ITY, w);
  if (!x) return null;
  return { word: w, base: x.base, baseJa: x.baseJa, ja: x.ja, how: x.how, stress: x.stress, answer: x.base, wrong: x.wrong };
}

export function ityDisplay(q: ItyQuestion): string {
  return `${q.word}（${q.ja}）→ もとの ことば: ＿＿（${q.baseJa}）`;
}

export function ityWhy(q: ItyQuestion): string {
  return `${q.word} は ${q.how}（${q.baseJa} → ${q.ja}）。-ity は「〜な こと・〜さ」の 名詞を つくる。-ity の すぐ まえを いちばん つよく いうよ（${q.stress}）。ble は bil、ous は os に かわる ことに 気を つけよう。`;
}

// ---------------------------------------------------------------------------
// inter-（あいだ・おたがいに）と co-（いっしょに）
// ---------------------------------------------------------------------------

export type InterCoPrefix = "inter" | "co";

/** ことば → パーツ・のこりの パーツと いみ・ことばの いみ・文（＿＿ に 入る）・まちがい 2つ（表の ほかの ことば） */
const INTER_CO: Record<string, { prefix: InterCoPrefix; rest: string; restJa: string; ja: string; sentence: string; wrong: [string, string] }> = {
  international: { prefix: "inter", rest: "national", restJa: "国の", ja: "国と 国の あいだの・国際的な", sentence: "Children from twenty countries came to the ＿＿ meeting.", wrong: ["intermission", "copilot"] },
  interview: { prefix: "inter", rest: "view", restJa: "見る", ja: "インタビューする（むかいあって 話を きく）", sentence: "Riko is going to ＿＿ the mayor for the school newspaper.", wrong: ["cooperate", "coexist"] },
  interact: { prefix: "inter", rest: "act", restJa: "うごく", ja: "ふれあう・やりとりする", sentence: "At the farm, children can ＿＿ with the friendly goats.", wrong: ["coauthor", "intermission"] },
  intersection: { prefix: "inter", rest: "section", restJa: "くぎり", ja: "こうさてん（みちが まじわる ところ）", sentence: "Wait for the green light at the busy ＿＿.", wrong: ["internet", "coworker"] },
  internet: { prefix: "inter", rest: "net", restJa: "あみ", ja: "インターネット", sentence: "We looked for facts about pandas on the ＿＿.", wrong: ["intermission", "coworker"] },
  intermission: { prefix: "inter", rest: "mission", restJa: "おくりだす こと", ja: "（げきや コンサートの とちゅうの）きゅうけい", sentence: "We bought juice during the ＿＿ of the play.", wrong: ["internet", "copilot"] },
  cooperate: { prefix: "co", rest: "operate", restJa: "はたらく", ja: "きょうりょくする", sentence: "If we all ＿＿, we can finish the poster faster.", wrong: ["interview", "intersection"] },
  copilot: { prefix: "co", rest: "pilot", restJa: "パイロット", ja: "ふくそうじゅうし", sentence: "The pilot and the ＿＿ fly the plane together.", wrong: ["costar", "interview"] },
  coworker: { prefix: "co", rest: "worker", restJa: "はたらく 人", ja: "いっしょに はたらく 人・どうりょう", sentence: "Ms. Emma's ＿＿ teaches music in the next classroom.", wrong: ["coexist", "intersection"] },
  coexist: { prefix: "co", rest: "exist", restJa: "いる・そんざいする", ja: "いっしょに くらす・きょうぞんする", sentence: "People and wild animals can ＿＿ if we give them space.", wrong: ["interview", "coauthor"] },
  coauthor: { prefix: "co", rest: "author", restJa: "さっか", ja: "いっしょに 本を かいた 人", sentence: "She wrote the book with a ＿＿.", wrong: ["intersection", "intermission"] },
  costar: { prefix: "co", rest: "star", restJa: "スター", ja: "いっしょに 主役を する はいゆう", sentence: "The actor smiled and waved with his ＿＿ from the movie.", wrong: ["internet", "coexist"] },
};

const PREFIX_JA: Record<InterCoPrefix, string> = { inter: "あいだ・おたがいに", co: "いっしょに" };

export interface InterCoQuestion {
  word: string;
  prefix: InterCoPrefix;
  rest: string;
  restJa: string;
  ja: string;
  sentence: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある inter- と co- の ことばの 問題（英語の 文 → ことば）。表に なければ null */
export function interCoOf(word: string): InterCoQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(INTER_CO, w);
  if (!x) return null;
  return { word: w, prefix: x.prefix, rest: x.rest, restJa: x.restJa, ja: x.ja, sentence: x.sentence, answer: w, wrong: x.wrong };
}

export function interCoDisplay(q: InterCoQuestion): string {
  return q.sentence;
}

export function interCoWhy(q: InterCoQuestion): string {
  return `${q.answer} は ${q.prefix}（${PREFIX_JA[q.prefix]}）＋ ${q.rest}（${q.restJa}）で「${q.ja}」。inter は「あいだ・おたがいに」（international・interview）、co は「いっしょに」（cooperate・copilot）の パーツだよ。`;
}

// ---------------------------------------------------------------------------
// 対比の 強勢（くらべる とき、あたらしい・ちがう ことばを つよく いう）
// ---------------------------------------------------------------------------

/** B の 文 → つよく いう ことば・A の 文（まえの しつもん）・いみ・まちがい 2つ（おなじ 文の ほかの ことば） */
const CONTRAST: Record<string, { strong: string; context: string; meaning: string; wrong: [string, string] }> = {
  "I like this one": { strong: "this", context: "Do you like that one?", meaning: "こっちが すき", wrong: ["like", "one"] },
  "I said Thursday": { strong: "Thursday", context: "Did you say Tuesday?", meaning: "木曜日って いったんだよ", wrong: ["I", "said"] },
  "Let's meet at four": { strong: "four", context: "Should we meet at three?", meaning: "4じに あおう", wrong: ["Let's", "meet"] },
  "It's on the right": { strong: "right", context: "Is the library on the left?", meaning: "みぎがわだよ", wrong: ["It's", "on"] },
  "I feed the dog": { strong: "dog", context: "Do you feed the cat?", meaning: "わたしが えさを あげるのは いぬ", wrong: ["I", "feed"] },
  "Kiko feeds the fish": { strong: "Kiko", context: "Does Haru feed the fish?", meaning: "さかなに えさを あげるのは キコ", wrong: ["feeds", "fish"] },
  "I walk him in the morning": { strong: "morning", context: "Do you walk the dog at night?", meaning: "さんぽは あさだよ", wrong: ["walk", "him"] },
  "The bowl is full": { strong: "full", context: "Is the bowl empty?", meaning: "おさらは いっぱいだよ", wrong: ["bowl", "is"] },
  "I dry the dishes": { strong: "dry", context: "Do you wash the dishes?", meaning: "わたしは おさらを ふく ほう", wrong: ["I", "dishes"] },
  "My sister cooks": { strong: "sister", context: "Does your brother cook?", meaning: "りょうりを するのは いもうと（あね）", wrong: ["My", "cooks"] },
  "We clean on Saturday": { strong: "Saturday", context: "Do you clean on Sunday?", meaning: "そうじは 土曜日だよ", wrong: ["We", "clean"] },
  "I'm making dinner": { strong: "dinner", context: "Are you making lunch?", meaning: "つくって いるのは ばんごはん", wrong: ["I'm", "making"] },
  "We planted sunflowers": { strong: "sunflowers", context: "Did you plant roses?", meaning: "うえたのは ひまわり", wrong: ["We", "planted"] },
  "It's on Saturday afternoon": { strong: "afternoon", context: "Is the event on Saturday morning?", meaning: "土曜日の ごごだよ", wrong: ["It's", "Saturday"] },
  "I want the small poster": { strong: "small", context: "Do you want the big poster?", meaning: "ほしいのは 小さい ポスター", wrong: ["want", "poster"] },
  "It's near the library": { strong: "library", context: "Is the station near the school?", meaning: "としょかんの ちかくだよ", wrong: ["It's", "near"] },
};
const CONTRAST_KEYS: Record<string, string> = Object.fromEntries(Object.keys(CONTRAST).map((k) => [k.toLowerCase(), k]));

export interface ContrastQuestion {
  sentence: string;
  strong: string;
  context: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 対比の 文の 問題。表に なければ null */
export function contrastOf(sentence: string): ContrastQuestion | null {
  const k = own(CONTRAST_KEYS, sentence.toLowerCase().trim());
  if (!k) return null;
  const x = CONTRAST[k];
  return { sentence: k, strong: x.strong, context: x.context, meaning: x.meaning, answer: x.strong, wrong: x.wrong };
}

export function contrastDisplay(q: ContrastQuestion): string {
  return `A: ${q.context}　B: ${q.sentence}.（${q.meaning}）`;
}

/** つよく いう ことばを 大文字に した 文（I like THIS one） */
export function contrastMarked(q: ContrastQuestion): string {
  return q.sentence.split(" ").map((w) => (w === q.strong ? w.toUpperCase() : w)).join(" ");
}

export function contrastWhy(q: ContrastQuestion): string {
  return `${contrastMarked(q)}. — A の 文と くらべて ちがう ところ（${q.strong}）を つよく いうと「${q.meaning}」が はっきり つたわる。I like THIS one, not THAT one. の ように、くらべる ときは あたらしい ことばを つよく いおう。`;
}

// ---------------------------------------------------------------------------
// あらたまった ことばと くだけた ことば（kids → children、get → receive）
// ---------------------------------------------------------------------------

/** あらたまった ことば → ふだんの ことば・いみ・つづりの こつ・まちがいの つづり 2つ（ない ことば） */
const FORMAL: Record<string, { casual: string; ja: string; tip: string; wrong: [string, string] }> = {
  children: { casual: "kids", ja: "子どもたち", tip: "child の ふくすう形。childs とは いわない", wrong: ["childs", "childern"] },
  receive: { casual: "get", ja: "うけとる・もらう", tip: "c の あとは ei（re-c-ei-ve）", wrong: ["recieve", "receeve"] },
  request: { casual: "ask for", ja: "おねがいする・もとめる", tip: "re ＋ quest。q の あとには u", wrong: ["reqest", "requist"] },
  purchase: { casual: "buy", ja: "こうにゅうする・かう", tip: "pur ＋ chase。おわりは -ase", wrong: ["purchace", "perchase"] },
  assist: { casual: "help", ja: "てつだう・たすける", tip: "s が 2つ（a-ss-ist）", wrong: ["asist", "assisst"] },
  provide: { casual: "give", ja: "あたえる・ようい する", tip: "pro ＋ vide。おわりの e を わすれずに", wrong: ["provid", "privide"] },
  perhaps: { casual: "maybe", ja: "もしかすると・たぶん", tip: "per ＋ haps。おわりは s", wrong: ["perhap", "prehaps"] },
  require: { casual: "need", ja: "ひつようと する", tip: "re ＋ quire。q の あとには u、おわりは -ire", wrong: ["requier", "reqire"] },
  repair: { casual: "fix", ja: "しゅうりする・なおす", tip: "re ＋ pair。おわりは -air", wrong: ["repare", "repiar"] },
  inform: { casual: "tell", ja: "しらせる", tip: "in ＋ form（imform では ない）", wrong: ["imform", "infrom"] },
  bicycle: { casual: "bike", ja: "じてんしゃ", tip: "bi（2つ）＋ cycle（わ）。i と y の ばしょに 気を つけて", wrong: ["bycicle", "bicicle"] },
  photograph: { casual: "photo", ja: "しゃしん", tip: "photo（ひかり）＋ graph（かく）。f では なく ph", wrong: ["fotograph", "photograf"] },
};

export interface FormalQuestion {
  word: string;
  casual: string;
  ja: string;
  tip: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある あらたまった ことばの 問題（ふだんの ことば → あらたまった ことばの つづり）。表に なければ null */
export function formalOf(word: string): FormalQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(FORMAL, w);
  if (!x) return null;
  return { word: w, casual: x.casual, ja: x.ja, tip: x.tip, answer: w, wrong: x.wrong };
}

export function formalDisplay(q: FormalQuestion): string {
  return `ふだん: ${q.casual}（${q.ja}）→ あらたまった: ＿＿`;
}

export function formalWhy(q: FormalQuestion): string {
  return `友だちとの 会話では ${q.casual}、手紙・発表・おしらせでは ${q.answer}（${q.ja}）を よく つかう。どちらも ただしい 英語。${q.answer} は ${q.tip}。ばめんで つかいわけよう。`;
}

// ---------------------------------------------------------------------------
// ステージ4 の 語根の まとめ（spect dict struct port rupt ject）
// ---------------------------------------------------------------------------

export type StageRoot = "spect" | "dict" | "struct" | "port" | "rupt" | "ject";

export const ROOT_JA: Record<StageRoot, string> = { spect: "見る", dict: "いう", struct: "つみあげる・たてる", port: "はこぶ", rupt: "やぶる", ject: "なげる" };

/** ことば → 語根・まえと うしろの パーツ・ヒント（パーツの いみ → ことばの いみ）・パーツ・まちがいの 語根 2つ（入れても ことばに ならない） */
const ROOTS: Record<string, { root: StageRoot; before: string; after: string; hint: string; parts: string; wrong: [StageRoot, StageRoot] }> = {
  inspect: { root: "spect", before: "in", after: "", hint: "中まで よく 見る → しらべる", parts: "in（中）＋ spect（見る）", wrong: ["port", "rupt"] },
  predict: { root: "dict", before: "pre", after: "", hint: "まえもって いう → よそうする", parts: "pre（まえ）＋ dict（いう）", wrong: ["spect", "ject"] },
  structure: { root: "struct", before: "", after: "ure", hint: "つみあげて できた もの → しくみ・たてもの", parts: "struct（つみあげる）＋ ure（もの）", wrong: ["dict", "ject"] },
  export: { root: "port", before: "ex", after: "", hint: "そとへ はこぶ → 外国へ うる（ゆしゅつする）", parts: "ex（そと）＋ port（はこぶ）", wrong: ["spect", "dict"] },
  interrupt: { root: "rupt", before: "inter", after: "", hint: "あいだを やぶる → わりこむ", parts: "inter（あいだ）＋ rupt（やぶる）", wrong: ["port", "spect"] },
  reject: { root: "ject", before: "re", after: "", hint: "なげかえす → ことわる", parts: "re（もとへ）＋ ject（なげる）", wrong: ["rupt", "struct"] },
  respect: { root: "spect", before: "re", after: "", hint: "ふりかえって 見る → そんけいする", parts: "re（ふたたび）＋ spect（見る）", wrong: ["rupt", "dict"] },
  contradict: { root: "dict", before: "contra", after: "", hint: "はんたいを いう → くいちがう ことを いう", parts: "contra（はんたい）＋ dict（いう）", wrong: ["port", "ject"] },
  construct: { root: "struct", before: "con", after: "", hint: "あつめて つみあげる → たてる", parts: "con（いっしょに）＋ struct（つみあげる）", wrong: ["rupt", "spect"] },
  transport: { root: "port", before: "trans", after: "", hint: "むこうへ はこぶ → はこぶ・ゆそう", parts: "trans（むこうへ）＋ port（はこぶ）", wrong: ["dict", "rupt"] },
  erupt: { root: "rupt", before: "e", after: "", hint: "そとへ やぶれ出る → ふんかする", parts: "e（そと）＋ rupt（やぶれる）", wrong: ["struct", "spect"] },
  project: { root: "ject", before: "pro", after: "", hint: "まえへ なげる → うつしだす・けいかく", parts: "pro（まえ）＋ ject（なげる）", wrong: ["dict", "rupt"] },
};

export interface RootQuestion {
  word: string;
  root: StageRoot;
  before: string;
  after: string;
  hint: string;
  parts: string;
  answer: StageRoot;
  wrong: [StageRoot, StageRoot];
}

/** 表に ある 語根の ことばの 問題（パーツの いみ → 語根）。表に なければ null */
export function rootOf(word: string): RootQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(ROOTS, w);
  if (!x) return null;
  return { word: w, root: x.root, before: x.before, after: x.after, hint: x.hint, parts: x.parts, answer: x.root, wrong: x.wrong };
}

export function rootDisplay(q: RootQuestion): string {
  return `${q.before}＿＿${q.after}（${q.hint}）`;
}

export function rootWhy(q: RootQuestion): string {
  return `${q.word} は ${q.parts}。${q.root} は「${ROOT_JA[q.root]}」。ステージ4 で まなんだ 語根: spect（見る）・dict（いう）・struct（つみあげる）・port（はこぶ）・rupt（やぶる）・ject（なげる）。パーツの いみを たすと ことばの いみが わかるよ。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w35FocusOf(word: string): string | null {
  if (ityOf(word)) return "-ity";
  const ic = interCoOf(word);
  if (ic) return ic.prefix;
  const c = contrastOf(word);
  if (c) return c.strong.toLowerCase();
  const f = formalOf(word);
  if (f) return f.word;
  const r = rootOf(word);
  if (r) return r.root;
  return null;
}

/**
 * その回の ことばが ワールド35 の 回の ものか。ことばが ぜんぶ ワールド35 の 表に ある とき
 * （L1020 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW35Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w35FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド35）。その focus で 問う ことばを よむ（"-ity" "inter" "spect" だけで よまない）。
 * 対比の 強勢は 文を よむ。ボタンは 英字・スペース・アポストロフィ だけ。あてはまらなければ null
 */
export function w35Say(focus: string, words: readonly string[]): string | null {
  if (!isW35Words(words)) return null;
  const w = words.find((x) => w35FocusOf(x) === focus);
  if (!w) return null;
  return w.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド35）。あてはまらなければ null */
export function w35Example(focus: string, words: readonly string[]): string | null {
  return w35Say(focus, words);
}
