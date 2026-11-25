/**
 * ワールド34（つばさの空港・L991〜1020・ステージ4）の フォニックス・つづりの表（旅行の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 空港の 数字の 読みかた: 「空港の 数字。英語で なんと よむ？」（Flight 205 → two oh five / twenty-five / two fifty）。音は 読みかたの 文
 * - 語根 vis: 「vis（見る）の ことば。英語の せつめいに あう ことばは どれ？」（a paper or stamp that lets you enter a country → visa / vision / visit）
 * - 2つ ならぶ 文字: 「ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）」（Could you ＿＿ a good restaurant? → recommend / reccomend / recomend）
 * - -ize の 動詞: 「-ize を つけて 動詞に すると？ ただしい つづりは どれ？」（apology（あやまる こと）→ ＿＿（あやまる）→ apologize / apologyize / appologize）
 * - イギリス英語と アメリカ英語: 「イギリス英語では なんと いう？」（アメリカ: elevator → イギリス: ＿＿ → lift / flat / queue）・
 *   「イギリスの つづりは どれ？」（アメリカ: color → イギリス: ＿＿ → colour / colur / coulor）
 *
 * focus の かきかた:
 * - 数字は その ことば そのもの（"Flight 205" "10:45" "Seat 14A" "Gate 23B"）。vis は "vis"。2つ ならぶ 文字は その 文字（"mm" "cc" "dd" …）。
 * - -ize は "-ize"。イギリス英語と アメリカ英語は その ことば そのもの（"lift" "elevator" "colour"）。
 * まちがいの 選択肢は 表に 手で 書く（数字は ほかの 数の 読みかた、vis・イギリスと アメリカの ことばは 表に ある ことば、
 * 2つ ならぶ 文字・-ize・イギリスの つづりは ない ことば だけ）。
 */

/** ワールド34 が はじまる レッスン（それより前の 回では ワールド34 の 問題に しない） */
export const W34_START = 991;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// 空港の 数字の 読みかた（便名・時刻・座席・ゲート）
// ---------------------------------------------------------------------------

export type TravelNumberKind = "flight" | "time" | "seat" | "gate";

/** ことば（表の かきかた）→ しゅるい・まえに つく ことば・読みかた・まちがい 2つ（ほかの 数の 読みかた）・いみ */
const TRAVEL_NUMBERS: Record<string, { kind: TravelNumberKind; head: string; answer: string; wrong: [string, string]; ja: string }> = {
  "Flight 205": { kind: "flight", head: "flight", answer: "two oh five", wrong: ["twenty-five", "two fifty"], ja: "205びん" },
  "Flight 318": { kind: "flight", head: "flight", answer: "three eighteen", wrong: ["three eighty", "thirty-eight"], ja: "318びん" },
  "Flight 760": { kind: "flight", head: "flight", answer: "seven sixty", wrong: ["seventy-six", "seven sixteen"], ja: "760びん" },
  "Flight 1120": { kind: "flight", head: "flight", answer: "eleven twenty", wrong: ["eleven twelve", "one twenty"], ja: "1120びん" },
  "10:45": { kind: "time", head: "", answer: "ten forty-five", wrong: ["ten fifty-four", "ten fourteen"], ja: "10じ45ふん" },
  "6:05": { kind: "time", head: "", answer: "six oh five", wrong: ["six fifty", "six fifteen"], ja: "6じ5ふん" },
  "12:30": { kind: "time", head: "", answer: "twelve thirty", wrong: ["twelve thirteen", "two thirty"], ja: "12じ30ぷん" },
  "7:15": { kind: "time", head: "", answer: "seven fifteen", wrong: ["seven fifty", "seven oh five"], ja: "7じ15ふん" },
  "Seat 14A": { kind: "seat", head: "seat", answer: "fourteen A", wrong: ["forty A", "four A"], ja: "14A の せき" },
  "Seat 32F": { kind: "seat", head: "seat", answer: "thirty-two F", wrong: ["twenty-three F", "thirty F"], ja: "32F の せき" },
  "Seat 8C": { kind: "seat", head: "seat", answer: "eight C", wrong: ["eighteen C", "eighty C"], ja: "8C の せき" },
  "Seat 21D": { kind: "seat", head: "seat", answer: "twenty-one D", wrong: ["twelve D", "twenty D"], ja: "21D の せき" },
  "Gate 23B": { kind: "gate", head: "gate", answer: "twenty-three B", wrong: ["thirty-two B", "twenty B"], ja: "23B ばんゲート" },
  "Gate 41C": { kind: "gate", head: "gate", answer: "forty-one C", wrong: ["fourteen C", "forty C"], ja: "41C ばんゲート" },
  "Gate 102": { kind: "gate", head: "gate", answer: "one oh two", wrong: ["one twenty", "twelve"], ja: "102 ばんゲート" },
  "Gate 15": { kind: "gate", head: "gate", answer: "fifteen", wrong: ["fifty", "five"], ja: "15 ばんゲート" },
};
const TRAVEL_NUMBER_KEYS: Record<string, string> = Object.fromEntries(Object.keys(TRAVEL_NUMBERS).map((k) => [k.toLowerCase(), k]));

export interface TravelNumberQuestion {
  word: string;
  kind: TravelNumberKind;
  ja: string;
  answer: string;
  wrong: [string, string];
  /** 読み上げる 文（Flight two oh five.） */
  say: string;
}

/** 表に ある 空港の 数字の 問題（かきかた → 読みかた）。表に なければ null */
export function travelNumberOf(word: string): TravelNumberQuestion | null {
  const k = own(TRAVEL_NUMBER_KEYS, word.toLowerCase().trim());
  if (!k) return null;
  const x = TRAVEL_NUMBERS[k];
  const full = x.head ? `${x.head} ${x.answer}` : x.answer;
  return { word: k, kind: x.kind, ja: x.ja, answer: x.answer, wrong: x.wrong, say: `${full[0].toUpperCase()}${full.slice(1)}.` };
}

export function travelNumberDisplay(q: TravelNumberQuestion): string {
  return `${q.word}（${q.ja}）`;
}

export function travelNumberWhy(q: TravelNumberQuestion): string {
  const how: Record<TravelNumberKind, string> = {
    flight: "びんめいは 2けたずつ くぎって よむ（205 = two oh five、1120 = eleven twenty）。0 は oh（オウ）と よむ ことが おおいよ。",
    time: "じこくは「じ」と「ふん」を ならべて よむ（10:45 = ten forty-five）。05 の ような 1けたの ふんは oh five。fifteen（15）と fifty（50）は さいごを つよく いうか まえを つよく いうかで ききわけよう。",
    seat: "ざせきは 数 ＋ アルファベット（14A = fourteen A）。fourteen（14）は さいごの teen を つよく、forty（40）は まえを つよく いうよ。",
    gate: "ゲートは 数 ＋ アルファベット（23B = twenty-three B）。3けたなら 1けたと 2けたに わけて よむ（102 = one oh two）。",
  };
  return `${q.word} は ${q.answer}。${how[q.kind]}`;
}

// ---------------------------------------------------------------------------
// 語根 vis（見る）
// ---------------------------------------------------------------------------

/** ことば → 英語の せつめい・日本語の いみ・パーツ・まちがい 2つ（表の ほかの vis の ことば） */
const VIS: Record<string, { def: string; ja: string; parts: string; wrong: [string, string] }> = {
  visit: { def: "to go and see a person or a place", ja: "おとずれる・たずねる", parts: "vis（見る）＋ it（いく）", wrong: ["vision", "advise"] },
  visitor: { def: "a person who comes to see a place or a person", ja: "たずねて くる 人・観光客", parts: "visit（たずねる）＋ or（人）", wrong: ["supervisor", "visa"] },
  visa: { def: "a paper or stamp that lets you enter a country", ja: "ビザ（入国の きょか）", parts: "vis（見る）＋ a（見て みとめられた もの）", wrong: ["vision", "visit"] },
  vision: { def: "how well you can see", ja: "しりょく・見る 力", parts: "vis（見る）＋ ion（〜する こと）", wrong: ["visibility", "visitor"] },
  visual: { def: "about seeing; something you can see, like a picture or a map", ja: "目で 見る・見て わかる", parts: "vis（見る）＋ ual（〜の）", wrong: ["visa", "invisible"] },
  invisible: { def: "impossible to see", ja: "目に 見えない", parts: "in（〜ない）＋ vis（見る）＋ ible（できる）", wrong: ["visual", "television"] },
  television: { def: "a machine that shows pictures from far away", ja: "テレビ", parts: "tele（とおく）＋ vis（見る）＋ ion", wrong: ["vision", "supervise"] },
  revise: { def: "to look at your work again and make it better", ja: "見なおして なおす", parts: "re（もう いちど）＋ vis（見る）＋ e", wrong: ["advise", "visit"] },
  supervise: { def: "to watch people and make sure they are safe and doing things right", ja: "見まもる・かんとくする", parts: "super（上から）＋ vis（見る）＋ e", wrong: ["revise", "visualize"] },
  supervisor: { def: "a person who watches and guides other workers", ja: "かんとくする 人", parts: "supervise（見まもる）＋ or（人）", wrong: ["visitor", "television"] },
  advise: { def: "to tell someone what you think they should do", ja: "アドバイスする・すすめる", parts: "ad（〜に むけて）＋ vis（見る）＋ e", wrong: ["revise", "supervise"] },
  visibility: { def: "how far you can see, for example on a foggy day", ja: "見とおし（どこまで 見えるか）", parts: "visible（見える）＋ ity（〜さ）", wrong: ["vision", "visual"] },
  visualize: { def: "to make a picture of something in your mind", ja: "あたまの なかで 思いうかべる", parts: "visual（目で 見る）＋ ize（〜に する）", wrong: ["visual", "revise"] },
};

export interface VisQuestion {
  word: string;
  def: string;
  ja: string;
  parts: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある vis の ことばの 問題（英語の せつめい → ことば）。表に なければ null */
export function visOf(word: string): VisQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(VIS, w);
  if (!x) return null;
  return { word: w, def: x.def, ja: x.ja, parts: x.parts, answer: w, wrong: x.wrong };
}

export function visDisplay(q: VisQuestion): string {
  return q.def;
}

export function visWhy(q: VisQuestion): string {
  return `${q.answer}（${q.parts}）は「${q.ja}」。vis は「見る」と いう いみの パーツ。visit（見に いく）・visa（見て みとめた しるし）・television（とおくを 見る きかい）の ように、見る ことに かんけいする ことばに 入って いるよ。`;
}

// ---------------------------------------------------------------------------
// 2つ ならぶ 文字（recommend・accommodation・address …）
// ---------------------------------------------------------------------------

export type DoubleFocus = "mm" | "cc" | "dd" | "ss" | "ll" | "ff" | "rr" | "gg";

/** ことば → focus（2つ ならぶ 文字）・文（＿＿ に 入る）・いみ・こつ・まちがいの つづり 2つ（ない ことば） */
const DOUBLE: Record<string, { focus: DoubleFocus; sentence: string; ja: string; tip: string; wrong: [string, string] }> = {
  accommodation: { focus: "cc", sentence: "The tour price includes ＿＿ for two nights.", ja: "とまる ところ・しゅくはく", tip: "c が 2つ、m も 2つ（a-cc-o-mm-o-dation）", wrong: ["accomodation", "acommodation"] },
  address: { focus: "dd", sentence: "Please write the hotel ＿＿ on the card.", ja: "じゅうしょ", tip: "d が 2つ、s も 2つ（a-dd-re-ss）", wrong: ["adress", "addres"] },
  necessary: { focus: "ss", sentence: "Is a visa ＿＿ for this trip?", ja: "ひつような", tip: "c は 1つ、s は 2つ（ne-c-e-ss-ary）", wrong: ["neccessary", "necesary"] },
  pillow: { focus: "ll", sentence: "Could I have an extra ＿＿, please?", ja: "まくら", tip: "l が 2つ（pi-ll-ow）", wrong: ["pilow", "pillo"] },
  coffee: { focus: "ff", sentence: "Would you like tea or ＿＿?", ja: "コーヒー", tip: "f が 2つ、e も 2つ（co-ff-ee）", wrong: ["cofee", "coffe"] },
  occupied: { focus: "cc", sentence: "Sorry, this seat is ＿＿.", ja: "（せきや トイレが）つかわれて いる", tip: "c が 2つ、p は 1つ（o-cc-u-p-ied）", wrong: ["ocupied", "occuppied"] },
  tomorrow: { focus: "rr", sentence: "Our flight leaves ＿＿ morning.", ja: "あした", tip: "m は 1つ、r は 2つ（to-m-o-rr-ow）", wrong: ["tommorow", "tomorow"] },
  different: { focus: "ff", sentence: "This city is very ＿＿ from my town.", ja: "ちがう", tip: "f が 2つ、おわりは ent（di-ff-er-ent）", wrong: ["diferent", "differant"] },
  arrive: { focus: "rr", sentence: "What time do we ＿＿ in Brightwater?", ja: "つく・とうちゃくする", tip: "r が 2つ（a-rr-ive）", wrong: ["arive", "arrieve"] },
  recommend: { focus: "mm", sentence: "Could you ＿＿ a good restaurant?", ja: "すすめる", tip: "c は 1つ、m は 2つ（re-c-o-mm-end）", wrong: ["reccomend", "recomend"] },
  excellent: { focus: "ll", sentence: "The food here is ＿＿!", ja: "とても すばらしい", tip: "l が 2つ、おわりは ent（exce-ll-ent）", wrong: ["excelent", "exellent"] },
  suggest: { focus: "gg", sentence: "I ＿＿ we take the river boat.", ja: "ていあんする", tip: "g が 2つ（su-gg-est）", wrong: ["sugest", "suggesst"] },
  luggage: { focus: "gg", sentence: "Please wait for your ＿＿ here.", ja: "にもつ（旅行の かばん）", tip: "g が 2つ、おわりは age（lu-gg-age）", wrong: ["lugage", "luggege"] },
  baggage: { focus: "gg", sentence: "The ＿＿ claim is on the first floor.", ja: "にもつ（あずけた かばん）", tip: "g が 2つ、おわりは age（ba-gg-age）", wrong: ["bagage", "baggege"] },
};

export interface DoubleQuestion {
  word: string;
  focus: DoubleFocus;
  sentence: string;
  ja: string;
  tip: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 2つ ならぶ 文字の ことばの 問題（文と いみ → つづり）。表に なければ null */
export function doubleOf(word: string): DoubleQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(DOUBLE, w);
  if (!x) return null;
  return { word: w, focus: x.focus, sentence: x.sentence, ja: x.ja, tip: x.tip, answer: w, wrong: x.wrong };
}

export function doubleDisplay(q: DoubleQuestion): string {
  return `${q.sentence}（${q.ja}）`;
}

export function doubleWhy(q: DoubleQuestion): string {
  return `${q.answer} は ${q.tip}。おなじ 文字が 2つ ならんでも おとは 1つぶん。どこが 2つで どこが 1つかを、ことばの かたまりで おぼえよう。`;
}

// ---------------------------------------------------------------------------
// -ize の 動詞（〜に する・〜する）
// ---------------------------------------------------------------------------

/** 動詞 → もとの ことば・もとの いみ・動詞の いみ・つくりかた・まちがいの つづり 2つ（ない ことば） */
const IZE: Record<string, { base: string; baseJa: string; ja: string; how: string; wrong: [string, string] }> = {
  apologize: { base: "apology", baseJa: "あやまる こと", ja: "あやまる", how: "apology の y を とって ＋ ize", wrong: ["apologyize", "appologize"] },
  realize: { base: "real", baseJa: "ほんとうの", ja: "（ほんとうだと）気づく", how: "real ＋ ize", wrong: ["reallize", "realeize"] },
  summarize: { base: "summary", baseJa: "まとめ", ja: "まとめる", how: "summary の y を とって ＋ ize", wrong: ["summaryize", "sumarize"] },
  modernize: { base: "modern", baseJa: "あたらしい・げんだいの", ja: "あたらしく する", how: "modern ＋ ize", wrong: ["modernnize", "moderize"] },
  energize: { base: "energy", baseJa: "エネルギー・げんき", ja: "げんきに する", how: "energy の y を とって ＋ ize", wrong: ["energyize", "enerjize"] },
  finalize: { base: "final", baseJa: "さいごの", ja: "さいごまで きめる・しあげる", how: "final ＋ ize", wrong: ["finallize", "finalyze"] },
  categorize: { base: "category", baseJa: "しゅるい", ja: "しゅるいに わける", how: "category の y を とって ＋ ize", wrong: ["categoryize", "catagorize"] },
  specialize: { base: "special", baseJa: "とくべつな", ja: "せんもんに する", how: "special ＋ ize", wrong: ["speciallize", "specialyze"] },
  personalize: { base: "personal", baseJa: "じぶんの・こじんの", ja: "じぶん用に する", how: "personal ＋ ize", wrong: ["personnalize", "personalyze"] },
  memorize: { base: "memory", baseJa: "きおく", ja: "おぼえる・あんきする", how: "memory の y を とって ＋ ize", wrong: ["memoryize", "memmorize"] },
  sympathize: { base: "sympathy", baseJa: "おもいやり・どうじょう", ja: "きもちを わかって あげる", how: "sympathy の y を とって ＋ ize", wrong: ["sympathyize", "simpathize"] },
  symbolize: { base: "symbol", baseJa: "しるし・シンボル", ja: "あらわす・しょうちょうする", how: "symbol ＋ ize", wrong: ["symbollize", "simbolize"] },
};

export interface IzeQuestion {
  word: string;
  base: string;
  baseJa: string;
  ja: string;
  how: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -ize の ことばの 問題（もとの ことば → 動詞の つづり）。表に なければ null */
export function izeOf(word: string): IzeQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(IZE, w);
  if (!x) return null;
  return { word: w, base: x.base, baseJa: x.baseJa, ja: x.ja, how: x.how, answer: w, wrong: x.wrong };
}

export function izeDisplay(q: IzeQuestion): string {
  return `${q.base}（${q.baseJa}）→ ＿＿（${q.ja}）`;
}

export function izeWhy(q: IzeQuestion): string {
  return `${q.answer}（${q.how}）。-ize を つけると「〜に する・〜する」と いう 動詞に なる。y で おわる ことば（apology・memory）は y を とって ize。イギリスでは apologise の ように -ise と かく ことも あるよ。`;
}

// ---------------------------------------------------------------------------
// イギリス英語と アメリカ英語（ことば・つづり）
// ---------------------------------------------------------------------------

export type UkUsSide = "UK" | "US";

/** ことば → イギリスか アメリカか・もう かたほうの ことば・いみ・ことばか つづりか・まちがい 2つ */
const UKUS: Record<string, { side: UkUsSide; other: string; ja: string; kind: "word" | "spelling"; wrong: [string, string] }> = {
  lift: { side: "UK", other: "elevator", ja: "エレベーター", kind: "word", wrong: ["flat", "queue"] },
  elevator: { side: "US", other: "lift", ja: "エレベーター", kind: "word", wrong: ["apartment", "sidewalk"] },
  holiday: { side: "UK", other: "vacation", ja: "（ながい）やすみ・りょこう", kind: "word", wrong: ["biscuit", "timetable"] },
  vacation: { side: "US", other: "holiday", ja: "（ながい）やすみ・りょこう", kind: "word", wrong: ["candy", "subway"] },
  underground: { side: "UK", other: "subway", ja: "ちかてつ", kind: "word", wrong: ["pavement", "lift"] },
  sidewalk: { side: "US", other: "pavement", ja: "ほどう", kind: "word", wrong: ["subway", "trash"] },
  queue: { side: "UK", other: "line", ja: "（じゅんばんを まつ）れつ", kind: "word", wrong: ["bill", "underground"] },
  timetable: { side: "UK", other: "schedule", ja: "じこくひょう", kind: "word", wrong: ["queue", "holiday"] },
  bill: { side: "UK", other: "check", ja: "（レストランの）おかんじょう", kind: "word", wrong: ["biscuit", "rubbish"] },
  biscuit: { side: "UK", other: "cookie", ja: "クッキー", kind: "word", wrong: ["sweets", "bill"] },
  candy: { side: "US", other: "sweets", ja: "あめ・おかし", kind: "word", wrong: ["cookie", "check"] },
  trash: { side: "US", other: "rubbish", ja: "ごみ", kind: "word", wrong: ["candy", "elevator"] },
  colour: { side: "UK", other: "color", ja: "いろ", kind: "spelling", wrong: ["colur", "coulor"] },
  centre: { side: "UK", other: "center", ja: "まんなか・センター", kind: "spelling", wrong: ["centr", "centere"] },
  theatre: { side: "UK", other: "theater", ja: "げきじょう", kind: "spelling", wrong: ["theatr", "theetre"] },
  favourite: { side: "UK", other: "favorite", ja: "いちばん すきな", kind: "spelling", wrong: ["favourit", "favoruite"] },
};

export interface UkUsQuestion {
  word: string;
  side: UkUsSide;
  other: string;
  ja: string;
  kind: "word" | "spelling";
  answer: string;
  wrong: [string, string];
}

/** 表に ある イギリス英語・アメリカ英語の 問題。表に なければ null */
export function ukUsOf(word: string): UkUsQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(UKUS, w);
  if (!x) return null;
  return { word: w, side: x.side, other: x.other, ja: x.ja, kind: x.kind, answer: w, wrong: x.wrong };
}

const SIDE_JA: Record<UkUsSide, string> = { UK: "イギリス", US: "アメリカ" };

export function ukUsPrompt(q: UkUsQuestion): string {
  if (q.kind === "spelling") return `${SIDE_JA[q.side]}の つづりは どれ？`;
  return `${SIDE_JA[q.side]}英語では なんと いう？`;
}

export function ukUsDisplay(q: UkUsQuestion): string {
  const otherSide: UkUsSide = q.side === "UK" ? "US" : "UK";
  return `${SIDE_JA[otherSide]}: ${q.other}（${q.ja}）→ ${SIDE_JA[q.side]}: ＿＿`;
}

export function ukUsWhy(q: UkUsQuestion): string {
  const uk = q.side === "UK" ? q.answer : q.other;
  const us = q.side === "US" ? q.answer : q.other;
  if (q.kind === "spelling") return `イギリスでは ${uk}、アメリカでは ${us}（${q.ja}）。イギリスの つづりは colour の -our や centre の -re の ように、アメリカより 1文字 おおかったり ならびが ちがったり するよ。どちらも ただしい 英語。`;
  return `イギリスでは ${uk}、アメリカでは ${us}（${q.ja}）。おなじ 英語でも 国に よって つかう ことばが ちがう ことが ある。どちらも ただしいので、あいての ことばを きいて あわせられると かっこいいよ。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w34FocusOf(word: string): string | null {
  const n = travelNumberOf(word);
  if (n) return n.word;
  if (visOf(word)) return "vis";
  const d = doubleOf(word);
  if (d) return d.focus;
  if (izeOf(word)) return "-ize";
  const u = ukUsOf(word);
  if (u) return u.word;
  return null;
}

/**
 * その回の ことばが ワールド34 の 回の ものか。ことばが ぜんぶ ワールド34 の 表に ある とき
 * （L990 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW34Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w34FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド34）。その focus で 問う ことばを よむ（"vis" "mm" "-ize" だけで よまない）。
 * 数字は 英語の 読みかたで よむ（Flight 205 → Flight two oh five）。ボタンは 英字と スペース だけ。あてはまらなければ null
 */
export function w34Say(focus: string, words: readonly string[]): string | null {
  if (!isW34Words(words)) return null;
  const w = words.find((x) => w34FocusOf(x) === focus);
  if (!w) return null;
  const n = travelNumberOf(w);
  const text = n ? n.say : w;
  return text.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド34）。あてはまらなければ null */
export function w34Example(focus: string, words: readonly string[]): string | null {
  return w34Say(focus, words);
}
