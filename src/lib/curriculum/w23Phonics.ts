/**
 * ワールド23（みどりの研究所・L661〜690・ステージ3）の フォニックス・つづり（理科の ことばの パーツ）の表。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 理科の パーツ micro- / -scope / -meter / thermo-（microscope, thermometer）: 「この ことばの micro は どんな いみ？」（ちいさい / みる どうぐ / はかる どうぐ / ねつ）
 * - -ment（experiment, measurement）: 「ただしい つづりは どれ？」（measure → ？（はかる こと）→ measurement / measurment / measuremant）
 * - 強勢の 移動（PHO-to-graph → pho-TOG-ra-phy、SCI-en-tist → sci-en-TIF-ic）: 「つよく よむ ところは どれ？」（pho-TOG-ra-phy / PHO-tog-ra-phy / …）
 * - -y の ようすの ことば（cloudy, sticky, shiny, sunny）: 「ただしい ことばは どれ？」（shine → ？（ぴかぴかの）→ shiny / shiney / shinie）
 * - -tion の 理科の ことば（observation, prediction, reaction）: 「ただしい ことばは どれ？」（predict → ？（よそう）→ prediction / predicsion / predictian）
 *
 * focus の かきかた: "micro-" "-scope" "-meter" "thermo-"、"-ment"、強勢は はくで わけた 小文字の 形（"pho-tog-ra-phy"。ことばと 1つずつ 対応）、"-y"、"-tion"。
 * まちがいの 選択肢は 表に 手で 書く（ほんとうに ある ことば・よく ある べつの つづりは 入れない）。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド23 が はじまる レッスン（それより前の 回では ワールド23 の 問題に しない） */
export const W23_START = 661;

export const W23_PART_FOCUS = ["micro-", "-scope", "-meter", "thermo-"] as const;
export const W23_MENT_FOCUS = "-ment";
export const W23_Y_FOCUS = "-y";
export const W23_TION_FOCUS = "-tion";

// ---------------------------------------------------------------------------
// 理科の パーツ（micro- / -scope / -meter / thermo-）
// ---------------------------------------------------------------------------

/** パーツの いみ（えらぶ 選択肢にも つかう） */
export const SCI_PART_MEANING: Record<string, string> = {
  micro: "ちいさい", scope: "みる どうぐ", meter: "はかる どうぐ", thermo: "ねつ・あたたかさ", tele: "とおく",
};
/** 選択肢に つかう パーツの いみ（この 順で） */
const SCI_CHOICE_ORDER = ["micro", "scope", "meter", "thermo", "tele"] as const;

/** ことば → パーツ・いみ（パーツの いみの せつめいは SCI_OTHER_PART に） */
const SCI_PARTS: Record<string, { parts: string[]; meaning: string }> = {
  microscope: { parts: ["micro", "scope"], meaning: "けんびきょう" },
  microphone: { parts: ["micro", "phone"], meaning: "マイク" },
  microwave: { parts: ["micro", "wave"], meaning: "でんしレンジ" },
  microchip: { parts: ["micro", "chip"], meaning: "ちいさな コンピューターの チップ" },
  telescope: { parts: ["tele", "scope"], meaning: "ぼうえんきょう" },
  periscope: { parts: ["peri", "scope"], meaning: "せんぼうきょう" },
  kaleidoscope: { parts: ["kaleido", "scope"], meaning: "まんげきょう" },
  stethoscope: { parts: ["stetho", "scope"], meaning: "ちょうしんき" },
  thermometer: { parts: ["thermo", "meter"], meaning: "おんどけい" },
  speedometer: { parts: ["speed", "o", "meter"], meaning: "スピードメーター" },
  pedometer: { parts: ["ped", "o", "meter"], meaning: "まんぽけい" },
  barometer: { parts: ["baro", "meter"], meaning: "きあつけい" },
  thermostat: { parts: ["thermo", "stat"], meaning: "おんどを たもつ スイッチ" },
};

/** パーツでは ない ほうの いみ（せつめいで つかう） */
const SCI_OTHER_PART: Record<string, string> = {
  phone: "おと・こえ", wave: "なみ", chip: "かけら", peri: "まわり", kaleido: "きれいな かたち", stetho: "むね",
  speed: "はやさ", ped: "あし", baro: "おもさ（くうきの）", stat: "とめる・たもつ", o: "つなぎの もじ",
};

export interface SciPartQuestion {
  part: string;
  answer: string;
  choices: string[];
  meaning: string;
  parts: string[];
}

/**
 * 表に ある ことばの パーツの いみを 問う。focus（"micro-" "-scope" …）の 順に、ことばに ふくまれる パーツを えらぶ。
 * あてはまらなければ null
 */
export function sciPartOf(word: string, focus: readonly string[]): SciPartQuestion | null {
  const w = word.toLowerCase();
  const p = SCI_PARTS[w];
  if (!p) return null;
  const part = focus.map((f) => f.replace(/-/g, "")).find((f) => p.parts.includes(f) && f in SCI_PART_MEANING);
  if (!part) return null;
  const answer = SCI_PART_MEANING[part];
  // もう 1つの パーツの いみは 選択肢に 入れない（microscope の micro を きくとき「みる どうぐ」も 正しく 見えるので）
  const others = SCI_CHOICE_ORDER.filter((x) => x !== part && !p.parts.includes(x)).map((x) => SCI_PART_MEANING[x]);
  return { part, answer, choices: [answer, ...others].slice(0, 4), meaning: p.meaning, parts: p.parts };
}

export function sciPartWhy(word: string, q: SciPartQuestion): string {
  const split = q.parts.filter((x) => x !== "o").map((x) => `${x}（${SCI_PART_MEANING[x] ?? SCI_OTHER_PART[x] ?? ""}）`).join(" ＋ ");
  const o = q.parts.includes("o") ? "まんなかの o は つなぎの もじ。" : "";
  return `${word}（${q.meaning}）は ${split}。${o}${q.part} は「${q.answer}」の いみの パーツ。理科の どうぐの なまえは パーツで できて いる ことが おおいよ。`;
}

// ---------------------------------------------------------------------------
// -ment（理科の ことば）
// ---------------------------------------------------------------------------

export type MentTrap = "weak-ment" | "keep-e" | "no-double" | "keep-n";

/** -ment の ことば → もとの ことば（なければ null）・いみ・まちがい（ほんとうには ない つづり） */
const MENT: Record<string, { base: string | null; baseMeaning?: string; meaning: string; wrong: [string, string]; trap: MentTrap }> = {
  // もとの ことばが ない（おわりの「メント」は よわく よむので「マント」「ミント」に きこえる）
  experiment: { base: null, meaning: "じっけん", wrong: ["experimant", "experimint"], trap: "weak-ment" },
  instrument: { base: null, meaning: "どうぐ・がっき", wrong: ["instrumant", "instrumint"], trap: "weak-ment" },
  document: { base: null, meaning: "しょるい", wrong: ["documant", "documint"], trap: "weak-ment" },
  ornament: { base: null, meaning: "かざり", wrong: ["ornamant", "ornamint"], trap: "weak-ment" },
  // e で おわる ことば ＋ ment（e は のこす）
  measurement: { base: "measure", baseMeaning: "はかる", meaning: "はかった あたい・そくてい", wrong: ["measurment", "measuremant"], trap: "keep-e" },
  arrangement: { base: "arrange", baseMeaning: "ならべる", meaning: "ならべかた", wrong: ["arrangment", "arrangemant"], trap: "keep-e" },
  amazement: { base: "amaze", baseMeaning: "びっくりさせる", meaning: "おどろき", wrong: ["amazment", "amazemant"], trap: "keep-e" },
  basement: { base: "base", baseMeaning: "どだい", meaning: "ちかしつ", wrong: ["basment", "basemant"], trap: "keep-e" },
  // しいんを かさねない
  equipment: { base: "equip", baseMeaning: "そなえる", meaning: "せつび・どうぐ", wrong: ["equippment", "equipmant"], trap: "no-double" },
  development: { base: "develop", baseMeaning: "そだつ・のびる", meaning: "そだつ こと・せいちょう", wrong: ["developpment", "developmant"], trap: "no-double" },
  // まんなかの n を わすれやすい
  environment: { base: null, meaning: "かんきょう・まわりの しぜん", wrong: ["enviroment", "environmant"], trap: "keep-n" },
};

export interface MentQuestion {
  base: string | null;
  baseMeaning?: string;
  answer: string;
  wrong: [string, string];
  trap: MentTrap;
  meaning: string;
}

/** 表に ある -ment の ことばの 問題。表に なければ null */
export function mentOf(word: string): MentQuestion | null {
  const w = word.toLowerCase();
  const m = MENT[w];
  if (!m) return null;
  return { base: m.base, baseMeaning: m.baseMeaning, answer: w, wrong: m.wrong, trap: m.trap, meaning: m.meaning };
}

/** 問題の 見せかた（もとの ことばが あれば「measure（はかる）→ ？（…）」、なければ「？（じっけん）」） */
export function mentDisplay(q: MentQuestion): string {
  return q.base ? `${q.base}（${q.baseMeaning}）→ ？（${q.meaning}）` : `？（${q.meaning}）`;
}

export function mentWhy(q: MentQuestion): string {
  const tail: Record<MentTrap, string> = {
    "weak-ment": "おわりの「メント」は よわく よむので「マント」「ミント」に きこえる ことも ある。でも つづりは m・e・n・t。",
    "keep-e": `${q.base} の おわりの e は とらずに のこして ment を つけるよ（ment は しいんで はじまるから）。`,
    "no-double": `${q.base} の おわりの しいんは かさねずに ment を つけるよ。`,
    "keep-n": "environ の n を わすれやすい。en・vi・ron・ment と はくで わけて かくと まちがえないよ。",
  };
  const head = q.base ? `${q.base}（${q.baseMeaning}）に ment を つけると なまえの ことば ${q.answer}（${q.meaning}）。` : `${q.answer}（${q.meaning}）は ment で おわる なまえの ことば。`;
  return `${head}${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// 強勢の 移動（PHO-to-graph → pho-TOG-ra-phy）
// ---------------------------------------------------------------------------

/** ことば → はくの まとまり・つよい はく（0 から）・いみ・くらべる かぞくの ことば */
const SHIFT: Record<string, { syllables: string; stress: number; meaning: string; pair: string }> = {
  photograph: { syllables: "pho-to-graph", stress: 0, meaning: "しゃしん", pair: "photography" },
  photography: { syllables: "pho-tog-ra-phy", stress: 1, meaning: "しゃしんを とる こと", pair: "photograph" },
  photographer: { syllables: "pho-tog-ra-pher", stress: 1, meaning: "しゃしんか", pair: "photograph" },
  photographic: { syllables: "pho-to-graph-ic", stress: 2, meaning: "しゃしんの", pair: "photography" },
  scientist: { syllables: "sci-en-tist", stress: 0, meaning: "かがくしゃ", pair: "scientific" },
  scientific: { syllables: "sci-en-tif-ic", stress: 2, meaning: "かがくてきな", pair: "scientist" },
  energy: { syllables: "en-er-gy", stress: 0, meaning: "エネルギー・げんき", pair: "energetic" },
  energetic: { syllables: "en-er-get-ic", stress: 2, meaning: "げんきいっぱいの", pair: "energy" },
  magnetic: { syllables: "mag-net-ic", stress: 1, meaning: "じしゃくの", pair: "magnetism" },
  magnetism: { syllables: "mag-ne-tism", stress: 0, meaning: "じき（じしゃくの ちから）", pair: "magnetic" },
  electric: { syllables: "e-lec-tric", stress: 1, meaning: "でんきの", pair: "electricity" },
  electricity: { syllables: "e-lec-tric-i-ty", stress: 2, meaning: "でんき", pair: "electric" },
  biology: { syllables: "bi-ol-o-gy", stress: 1, meaning: "せいぶつがく", pair: "biological" },
  biological: { syllables: "bi-o-log-i-cal", stress: 2, meaning: "せいぶつの", pair: "biology" },
  experiment: { syllables: "ex-per-i-ment", stress: 1, meaning: "じっけん", pair: "experimental" },
  experimental: { syllables: "ex-per-i-men-tal", stress: 3, meaning: "じっけんの", pair: "experiment" },
};

/** はくの 形の つよい ところを 大文字に（pho-TOG-ra-phy） */
const markStress = (syllables: string, at: number) => syllables.split("-").map((p, i) => (i === at ? p.toUpperCase() : p)).join("-");

export interface ShiftQuestion {
  answer: string;
  /** 選択肢（answer を ふくむ 3〜4つ。きまった 順） */
  choices: string[];
  meaning: string;
  /** くらべる かぞくの ことばの つよい はく（PHO-to-graph） */
  pairStressed: string;
  pair: string;
}

/**
 * 表に ある ことばで、focus に はくの 形（"pho-tog-ra-phy"）が ある ものの 問題。あてはまらなければ null。
 * 選択肢は つよい はくを 1つずつ かえた 形（5はくの ことばは こたえと その まわりの 4つ）
 */
export function shiftOf(word: string, focus: readonly string[]): ShiftQuestion | null {
  const w = word.toLowerCase();
  const s = SHIFT[w];
  if (!s) return null;
  if (!focus.some((f) => f.toLowerCase() === s.syllables)) return null;
  const n = s.syllables.split("-").length;
  const all = Array.from({ length: n }, (_, i) => i);
  const near = all.sort((a, b) => Math.abs(a - s.stress) - Math.abs(b - s.stress) || a - b).slice(0, 4).sort((a, b) => a - b);
  const p = SHIFT[s.pair];
  return { answer: markStress(s.syllables, s.stress), choices: near.map((i) => markStress(s.syllables, i)), meaning: s.meaning, pairStressed: markStress(p.syllables, p.stress), pair: s.pair };
}

/** 表に ある ことばの はくの 形（focus に つかう。表に なければ null） */
export function shiftSyllables(word: string): string | null {
  return SHIFT[word.toLowerCase()]?.syllables ?? null;
}

export function shiftWhy(word: string, q: ShiftQuestion): string {
  return `${word}（${q.meaning}）は ${q.answer} と、大きい もじの ところを つよく よむ。かぞくの ${q.pair} は ${q.pairStressed}。おなじ かぞくでも、おわりが つくと つよく よむ ところが うごく ことが あるよ。`;
}

// ---------------------------------------------------------------------------
// -y の ようすの ことば（cloudy, shiny, sunny）
// ---------------------------------------------------------------------------

export type YAdjTrap = "add-y" | "drop-e" | "double";

/** -y の ことば → もとの ことば・いみ・まちがい（ほんとうには ない つづり。stony・smoky の ように -ey も ある ことばは 入れない） */
const YADJ: Record<string, { base: string; baseMeaning: string; meaning: string; wrong: [string, string] }> = {
  // そのまま y
  cloudy: { base: "cloud", baseMeaning: "くも", meaning: "くもりの", wrong: ["cloudey", "clouddy"] },
  sticky: { base: "stick", baseMeaning: "くっつく", meaning: "べたべたの", wrong: ["stickey", "stiky"] },
  bumpy: { base: "bump", baseMeaning: "でこぼこ", meaning: "でこぼこの", wrong: ["bumpey", "bumppy"] },
  salty: { base: "salt", baseMeaning: "しお", meaning: "しおからい", wrong: ["saltey", "saltty"] },
  rusty: { base: "rust", baseMeaning: "さび", meaning: "さびた", wrong: ["rustey", "rustty"] },
  windy: { base: "wind", baseMeaning: "かぜ", meaning: "かぜの つよい", wrong: ["windey", "winndy"] },
  dusty: { base: "dust", baseMeaning: "ほこり", meaning: "ほこりっぽい", wrong: ["dustey", "dustty"] },
  // e を とって y
  shiny: { base: "shine", baseMeaning: "ひかる", meaning: "ぴかぴかの", wrong: ["shiney", "shinie"] },
  icy: { base: "ice", baseMeaning: "こおり", meaning: "こおりの・つめたい", wrong: ["icey", "icie"] },
  noisy: { base: "noise", baseMeaning: "おと・さわぎ", meaning: "うるさい", wrong: ["noisey", "noisie"] },
  juicy: { base: "juice", baseMeaning: "しる・ジュース", meaning: "みずみずしい", wrong: ["juicey", "juicie"] },
  // みじかい ぼいん ＋ しいん 1つは しいんを かさねて y
  sunny: { base: "sun", baseMeaning: "たいよう", meaning: "はれた", wrong: ["suny", "sunney"] },
  muddy: { base: "mud", baseMeaning: "どろ", meaning: "どろだらけの", wrong: ["mudy", "muddey"] },
  spotty: { base: "spot", baseMeaning: "てん・しみ", meaning: "てんてんの", wrong: ["spoty", "spottey"] },
  starry: { base: "star", baseMeaning: "ほし", meaning: "ほしの いっぱいの", wrong: ["stary", "starrey"] },
};

export interface YAdjQuestion {
  base: string;
  answer: string;
  wrong: [string, string];
  trap: YAdjTrap;
  baseMeaning: string;
  meaning: string;
}

/** 表に ある -y の ことばの 問題。表に なければ null */
export function yAdjOf(word: string): YAdjQuestion | null {
  const w = word.toLowerCase();
  const a = YADJ[w];
  if (!a) return null;
  const trap: YAdjTrap = a.base.endsWith("e") ? "drop-e" : w === `${a.base}${a.base.slice(-1)}y` ? "double" : "add-y";
  return { base: a.base, answer: w, wrong: a.wrong, trap, baseMeaning: a.baseMeaning, meaning: a.meaning };
}

export function yAdjWhy(q: YAdjQuestion): string {
  const tail: Record<YAdjTrap, string> = {
    "add-y": "そのまま y を つけるよ（ey では ない）。",
    "drop-e": `${q.base} の おわりの e を とってから y を つけるよ（y は ぼいんの ように はたらくから）。`,
    "double": `${q.base} は みじかい ぼいん ＋ しいん 1つ なので、しいんを かさねてから y を つけるよ。`,
  };
  return `なまえの ことば（${q.base}＝${q.baseMeaning}）に y を つけると、ようすの ことば（${q.answer}＝${q.meaning}）に なる。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// -tion の 理科の ことば（observation, prediction, reaction）
// ---------------------------------------------------------------------------

export type TionTrap = "add-ion" | "drop-e" | "ate-tion";

/** -tion の ことば → もとの ことば・いみ・まちがい（ほんとうには ない つづり。predication の ように ある ことばは 入れない） */
const TION: Record<string, { base: string; baseMeaning: string; meaning: string; wrong: [string, string] }> = {
  // t で おわる ことば ＋ ion
  prediction: { base: "predict", baseMeaning: "よそうする", meaning: "よそう", wrong: ["predicsion", "predictian"] },
  reaction: { base: "react", baseMeaning: "はんのうする", meaning: "はんのう", wrong: ["reacsion", "reaktion"] },
  collection: { base: "collect", baseMeaning: "あつめる", meaning: "あつめた もの・コレクション", wrong: ["collecsion", "colection"] },
  // e で おわる ことば（e を とって ation）
  observation: { base: "observe", baseMeaning: "かんさつする", meaning: "かんさつ", wrong: ["observetion", "observasion"] },
  preparation: { base: "prepare", baseMeaning: "じゅんびする", meaning: "じゅんび", wrong: ["prepareation", "preperation"] },
  // ate で おわる ことば（te を とって tion）
  rotation: { base: "rotate", baseMeaning: "まわる", meaning: "かいてん", wrong: ["rotateion", "rotasion"] },
  migration: { base: "migrate", baseMeaning: "わたる", meaning: "（とり・チョウの）わたり", wrong: ["migrateion", "migrasion"] },
  evaporation: { base: "evaporate", baseMeaning: "じょうはつする", meaning: "じょうはつ", wrong: ["evaporateion", "evaporasion"] },
  celebration: { base: "celebrate", baseMeaning: "いわう", meaning: "おいわい", wrong: ["celebrateion", "celebrasion"] },
};

export interface TionQuestion {
  base: string;
  answer: string;
  wrong: [string, string];
  trap: TionTrap;
  baseMeaning: string;
  meaning: string;
}

/** 表に ある -tion の ことばの 問題。表に なければ null */
export function tionOf(word: string): TionQuestion | null {
  const w = word.toLowerCase();
  const t = TION[w];
  if (!t) return null;
  const trap: TionTrap = t.base.endsWith("ate") ? "ate-tion" : t.base.endsWith("e") ? "drop-e" : "add-ion";
  return { base: t.base, answer: w, wrong: t.wrong, trap, baseMeaning: t.baseMeaning, meaning: t.meaning };
}

export function tionWhy(q: TionQuestion): string {
  const tail: Record<TionTrap, string> = {
    "add-ion": `${q.base} は t で おわるので、ion を つけるだけ。`,
    "drop-e": `${q.base} の おわりの e を とって ation を つけるよ。`,
    "ate-tion": `${q.base} の おわりの te を とって tion を つけるよ（e を のこさない）。`,
  };
  return `うごきの ことば（${q.base}＝${q.baseMeaning}）に tion を つけると、なまえの ことば（${q.answer}＝${q.meaning}）に なる。おとは「ション」でも つづりは t・i・o・n。${tail[q.trap]}`;
}

/** フォーカスの ボタンの 読み上げ（ワールド23）。パーツ・おわりを そのまま よまず、その回の ことばで よむ。強勢の はくの 形は ことば まるごと。あてはまらなければ null */
export function w23Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  // まえの ワールドの -y・-tion・-ment の 回（sunny・rotation が まじる 回）の 読み上げを かえない ように、
  // その回の ことばが ぜんぶ ワールド23 の 表に ある ときだけ
  const inW23 = (w: string) => !!(SCI_PARTS[lw(w)] || MENT[lw(w)] || SHIFT[lw(w)] || YADJ[lw(w)] || TION[lw(w)]);
  if (words.length === 0 || !words.every(inW23)) return null;
  if ((W23_PART_FOCUS as readonly string[]).includes(focus)) {
    const part = focus.replace(/-/g, "");
    return words.find((w) => SCI_PARTS[lw(w)]?.parts.includes(part)) ?? null;
  }
  if (focus === W23_MENT_FOCUS) return words.find((w) => MENT[lw(w)]) ?? null;
  if (focus === W23_TION_FOCUS) return words.find((w) => TION[lw(w)]) ?? null;
  if (focus === W23_Y_FOCUS) return words.find((w) => YADJ[lw(w)]) ?? null;
  return null;
}
