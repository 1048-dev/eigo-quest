/**
 * ワールド18（こだまの谷・L511〜540）の フォニックス・つづり の表。import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - くらべる かたちの つづり -er / -est（taller, nicer, bigger, happier）: 「くらべる かたちの ただしい つづりは？」（big → ？（もっと）→ bigger / biger / biggar）
 * - 音節と 強勢（EL-e-phant, ba-NA-na）: 「つよく よむ ところは どこ？」（elephant → EL-e-phant / el-E-phant / el-e-PHANT）
 * - -ly（quickly, happily, carefully）: 「ly を つけた ただしい つづりは？」（happy + ly → happily / happyly / happly）
 * - -ful・-less（colorful, careless）: 「いみに あう ことばは？」（「いろいろな いろの」→ colorful / colorless / colorfull）
 * - un-（unhappy, unlock）: 「はんたいの いみの ことばは？」（happy → ？（はんたい）→ unhappy / inhappy / dishappy）
 *
 * focus の かきかた: "-er" "-est"、強勢は ワールド12 と おなじ "el-e-phant"（まとまりを ハイフンで わける）、"-ly"、"-ful" "-less"、"un-"。
 * どれも 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */

/** ワールド18 が はじまる レッスン（それより前の 回では ワールド18 の 問題に しない） */
export const W18_START = 511;

export const W18_COMPARE_FOCUS = ["-er", "-est"] as const;
export const W18_LY_FOCUS = "-ly";
export const W18_FUL_FOCUS = ["-ful", "-less"] as const;
export const W18_UN_FOCUS = "un-";
/** 強勢の 回の rule（focus は "el-e-phant" の かたち） */
export const W18_STRESS_RULE = "stress";

// ---------------------------------------------------------------------------
// -er / -est
// ---------------------------------------------------------------------------

export type CompareKind = "add" | "e" | "double" | "y";

/** くらべる かたち → もとの ことばと いみ */
const COMPARE: Record<string, { base: string; meaning: string }> = {
  // そのまま つける
  taller: { base: "tall", meaning: "たかい" }, tallest: { base: "tall", meaning: "たかい" },
  longer: { base: "long", meaning: "ながい" }, longest: { base: "long", meaning: "ながい" },
  smaller: { base: "small", meaning: "ちいさい" }, smallest: { base: "small", meaning: "ちいさい" },
  older: { base: "old", meaning: "ふるい" }, oldest: { base: "old", meaning: "ふるい" },
  faster: { base: "fast", meaning: "はやい" }, fastest: { base: "fast", meaning: "はやい" },
  shorter: { base: "short", meaning: "みじかい・ひくい" }, shortest: { base: "short", meaning: "みじかい・ひくい" },
  colder: { base: "cold", meaning: "さむい" }, coldest: { base: "cold", meaning: "さむい" },
  deeper: { base: "deep", meaning: "ふかい" }, deepest: { base: "deep", meaning: "ふかい" },
  louder: { base: "loud", meaning: "こえが おおきい" }, loudest: { base: "loud", meaning: "こえが おおきい" },
  // e で おわる → r / st だけ
  larger: { base: "large", meaning: "おおきい" }, largest: { base: "large", meaning: "おおきい" },
  nicer: { base: "nice", meaning: "すてきな" }, nicest: { base: "nice", meaning: "すてきな" },
  wider: { base: "wide", meaning: "はばが ひろい" }, widest: { base: "wide", meaning: "はばが ひろい" },
  safer: { base: "safe", meaning: "あんぜんな" }, safest: { base: "safe", meaning: "あんぜんな" },
  cuter: { base: "cute", meaning: "かわいい" }, cutest: { base: "cute", meaning: "かわいい" },
  // みじかい 母音 ＋ 子音 1つ → 子音を 重ねる
  bigger: { base: "big", meaning: "おおきい" }, biggest: { base: "big", meaning: "おおきい" },
  hotter: { base: "hot", meaning: "あつい" }, hottest: { base: "hot", meaning: "あつい" },
  thinner: { base: "thin", meaning: "ほそい" }, thinnest: { base: "thin", meaning: "ほそい" },
  wetter: { base: "wet", meaning: "ぬれた" }, wettest: { base: "wet", meaning: "ぬれた" },
  fatter: { base: "fat", meaning: "ふとった" }, fattest: { base: "fat", meaning: "ふとった" },
  // 子音 ＋ y → i に かえる
  happier: { base: "happy", meaning: "うれしい" }, happiest: { base: "happy", meaning: "うれしい" },
  heavier: { base: "heavy", meaning: "おもい" }, heaviest: { base: "heavy", meaning: "おもい" },
  easier: { base: "easy", meaning: "かんたんな" }, easiest: { base: "easy", meaning: "かんたんな" },
  funnier: { base: "funny", meaning: "おもしろい" }, funniest: { base: "funny", meaning: "おもしろい" },
  earlier: { base: "early", meaning: "はやい（じかん）" }, earliest: { base: "early", meaning: "はやい（じかん）" },
  prettier: { base: "pretty", meaning: "きれいな" }, prettiest: { base: "pretty", meaning: "きれいな" },
};

export interface CompareSpelling {
  base: string;
  answer: string;
  wrong: string[];
  suffix: "er" | "est";
  kind: CompareKind;
  meaning: string;
}

/** 表に ある くらべる かたちの つづりと、こどもが しがちな まちがい。表に なければ null */
export function compareSpelling(word: string): CompareSpelling | null {
  const w = word.toLowerCase();
  const e = COMPARE[w];
  if (!e) return null;
  const suffix = w.endsWith("est") ? "est" : "er";
  const { base, meaning } = e;
  const alt = suffix === "er" ? "ar" : "ist";
  let kind: CompareKind;
  let wrong: string[];
  if (w === base + suffix) {
    kind = "add";
    // 子音を 重ねすぎ（talller）・母音を まちがえる（tallar）
    wrong = [`${base}${base.slice(-1)}${suffix}`, `${base}${alt}`];
  } else if (base.endsWith("e") && w === base + suffix.slice(1)) {
    kind = "e";
    // e を のこしたまま（largeer）・母音を まちがえる（largar）
    wrong = [`${base}${suffix}`, `${base.slice(0, -1)}${alt}`];
  } else if (w === base + base.slice(-1) + suffix) {
    kind = "double";
    // 重ねない（biger）・重ねて 母音を まちがえる（biggar）
    wrong = [`${base}${suffix}`, `${base}${base.slice(-1)}${alt}`];
  } else {
    kind = "y";
    // y の まま（happyer）・y を とるだけ（happer）
    wrong = [`${base}${suffix}`, `${base.slice(0, -1)}${suffix}`];
  }
  return { base, answer: w, wrong, suffix, kind, meaning };
}

export const COMPARE_WHY: Record<CompareKind, (c: CompareSpelling) => string> = {
  add: (c) => `${c.base} は そのまま ${c.suffix} を つけて ${c.answer}。`,
  e: (c) => `${c.base} は e で おわるので、${c.suffix === "er" ? "r" : "st"} だけ つけて ${c.answer}。`,
  double: (c) => `${c.base} は みじかい 母音 ＋ 子音 1つ。さいごの ${c.base.slice(-1)} を 重ねて ${c.answer}。`,
  y: (c) => `${c.base} は さいごの y を i に かえて ${c.suffix}。${c.answer} だよ。`,
};

// ---------------------------------------------------------------------------
// 音節と 強勢
// ---------------------------------------------------------------------------

/** ことば → つよく よむ まとまりの ばんごう（0 から）と いみ。まとまりは focus（"el-e-phant"）から とる */
const STRESS: Record<string, { at: number; meaning: string }> = {
  elephant: { at: 0, meaning: "ぞう" }, kangaroo: { at: 2, meaning: "カンガルー" }, gorilla: { at: 1, meaning: "ゴリラ" }, octopus: { at: 0, meaning: "たこ" },
  banana: { at: 1, meaning: "バナナ" }, tomato: { at: 1, meaning: "トマト" }, potato: { at: 1, meaning: "じゃがいも" }, pineapple: { at: 0, meaning: "パイナップル" },
  dinosaur: { at: 0, meaning: "きょうりゅう" }, butterfly: { at: 0, meaning: "ちょうちょ" }, chimpanzee: { at: 2, meaning: "チンパンジー" }, flamingo: { at: 1, meaning: "フラミンゴ" },
  avocado: { at: 2, meaning: "アボカド" }, alligator: { at: 0, meaning: "ワニ" }, helicopter: { at: 0, meaning: "ヘリコプター" }, caterpillar: { at: 0, meaning: "いもむし" },
  camera: { at: 0, meaning: "カメラ" }, animal: { at: 0, meaning: "どうぶつ" }, beautiful: { at: 0, meaning: "うつくしい" }, computer: { at: 1, meaning: "コンピューター" },
  volcano: { at: 1, meaning: "かざん" }, hamburger: { at: 0, meaning: "ハンバーガー" }, spaghetti: { at: 1, meaning: "スパゲッティ" }, telephone: { at: 0, meaning: "でんわ" },
};

export interface StressQuestion {
  answer: string;
  wrong: string[];
  parts: string[];
  meaning: string;
}

/** 強勢の 選択肢（つよい まとまりを 大文字に した もの）。表に ない、または focus に わけかたが なければ null */
export function stressChoices(word: string, focus: readonly string[]): StressQuestion | null {
  const w = word.toLowerCase();
  const s = STRESS[w];
  if (!s) return null;
  const f = focus.find((x) => x.includes("-") && x.replace(/-/g, "") === w);
  if (!f) return null;
  const parts = f.split("-");
  if (parts.length < 3 || s.at >= parts.length) return null;
  const mark = (i: number) => parts.map((p, j) => (j === i ? p.toUpperCase() : p)).join("-");
  const all = parts.map((_, i) => mark(i));
  return { answer: all[s.at], wrong: all.filter((_, i) => i !== s.at), parts, meaning: s.meaning };
}

export function stressWhy(q: StressQuestion): string {
  return `${q.parts.join("・")} の なかで つよく よむのは「${q.parts[STRESS[q.parts.join("")]!.at]}」。${q.answer} と よむと えいごらしく なるよ。`;
}

// ---------------------------------------------------------------------------
// -ly
// ---------------------------------------------------------------------------

export type LyKind = "add" | "y" | "ful";

/** -ly の ことば → もとの ことばと いみ */
const LY: Record<string, { base: string; meaning: string }> = {
  quickly: { base: "quick", meaning: "すばやく" }, slowly: { base: "slow", meaning: "ゆっくり" }, quietly: { base: "quiet", meaning: "しずかに" }, loudly: { base: "loud", meaning: "おおきな こえで" },
  softly: { base: "soft", meaning: "やさしく・そっと" }, sadly: { base: "sad", meaning: "かなしそうに" }, kindly: { base: "kind", meaning: "しんせつに" }, safely: { base: "safe", meaning: "あんぜんに" },
  nicely: { base: "nice", meaning: "じょうずに" }, bravely: { base: "brave", meaning: "ゆうかんに" },
  happily: { base: "happy", meaning: "たのしそうに" }, easily: { base: "easy", meaning: "かんたんに" }, angrily: { base: "angry", meaning: "おこって" }, luckily: { base: "lucky", meaning: "うんよく" },
  noisily: { base: "noisy", meaning: "さわがしく" },
  carefully: { base: "careful", meaning: "ちゅういして" }, beautifully: { base: "beautiful", meaning: "うつくしく" }, wonderfully: { base: "wonderful", meaning: "すばらしく" },
  peacefully: { base: "peaceful", meaning: "おだやかに" }, cheerfully: { base: "cheerful", meaning: "げんきよく" },
};

export interface LySpelling {
  base: string;
  answer: string;
  wrong: string[];
  kind: LyKind;
  meaning: string;
}

/** 表に ある -ly の ことばの つづりと まちがい。表に なければ null */
export function lySpelling(word: string): LySpelling | null {
  const w = word.toLowerCase();
  const e = LY[w];
  if (!e) return null;
  const { base, meaning } = e;
  if (base.endsWith("ful")) return { base, answer: w, wrong: [`${base}y`, `${base}ley`], kind: "ful", meaning }; // carefuly・carefulley
  if (w === `${base.slice(0, -1)}ily`) return { base, answer: w, wrong: [`${base}ly`, `${base.slice(0, -1)}ly`], kind: "y", meaning }; // happyly・happly
  return { base, answer: w, wrong: [`${base}ley`, `${base}lly`], kind: "add", meaning }; // quickley・quicklly
}

export const LY_WHY: Record<LyKind, (l: LySpelling) => string> = {
  add: (l) => `${l.base} に ly を つけるだけ。${l.answer}（${l.meaning}）。`,
  y: (l) => `${l.base} は さいごの y を i に かえて ly。${l.answer}（${l.meaning}）。`,
  ful: (l) => `${l.base} の ful の あとに ly で、l が 2つ。${l.answer}（${l.meaning}）。`,
};

// ---------------------------------------------------------------------------
// -ful / -less
// ---------------------------------------------------------------------------

/** -ful / -less の ことば → もとの ことばと いみ */
const FUL_LESS: Record<string, { stem: string; meaning: string }> = {
  colorful: { stem: "color", meaning: "いろいろな いろの" }, helpful: { stem: "help", meaning: "やくに たつ" }, wonderful: { stem: "wonder", meaning: "すばらしい" },
  careful: { stem: "care", meaning: "ちゅういぶかい" }, playful: { stem: "play", meaning: "あそびずきな" }, peaceful: { stem: "peace", meaning: "おだやかな" },
  thankful: { stem: "thank", meaning: "かんしゃ している" }, cheerful: { stem: "cheer", meaning: "げんきな・あかるい" }, useful: { stem: "use", meaning: "べんりな" },
  careless: { stem: "care", meaning: "ふちゅういな" }, useless: { stem: "use", meaning: "やくに たたない" }, endless: { stem: "end", meaning: "おわりの ない" },
  fearless: { stem: "fear", meaning: "こわいものしらずの" }, harmless: { stem: "harm", meaning: "がいの ない" }, spotless: { stem: "spot", meaning: "しみ ひとつ ない" },
  sleepless: { stem: "sleep", meaning: "ねむれない" }, wireless: { stem: "wire", meaning: "コードの ない" }, helpless: { stem: "help", meaning: "じぶんでは なにも できない" },
};

export interface FulLessQuestion {
  answer: string;
  wrong: string[];
  suffix: "ful" | "less";
  stem: string;
  meaning: string;
}

/** 表に ある -ful / -less の ことばの 問題（もう一方の おわり・つづりまちがい）。表に なければ null */
export function fulLessOf(word: string): FulLessQuestion | null {
  const w = word.toLowerCase();
  const e = FUL_LESS[w];
  if (!e) return null;
  const suffix = w.endsWith("less") ? "less" : "ful";
  const { stem, meaning } = e;
  const wrong = suffix === "ful" ? [`${stem}less`, `${stem}full`] : [`${stem}ful`, `${stem}les`];
  return { answer: w, wrong, suffix, stem, meaning };
}

export function fulLessWhy(q: FulLessQuestion): string {
  return q.suffix === "ful"
    ? `${q.answer} は ${q.stem} ＋ ful（〜が いっぱい）。ful の l は 1つ だよ。`
    : `${q.answer} は ${q.stem} ＋ less（〜が ない）。less の s は 2つ だよ。`;
}

// ---------------------------------------------------------------------------
// un-
// ---------------------------------------------------------------------------

/** un- の ことば → いみ（もとの ことばは un を とった もの） */
const UN: Record<string, string> = {
  unhappy: "かなしい", unkind: "いじわるな", unfair: "ずるい・ふこうへいな", unsafe: "あぶない",
  unlock: "かぎを あける", untie: "ほどく", unpack: "にもつを だす", unzip: "ファスナーを あける",
  unlucky: "うんが わるい", unusual: "めずらしい", unknown: "しられて いない", untidy: "ちらかった",
  unfriendly: "つめたい・なかよく しない", unhealthy: "けんこうに よくない", unwrap: "つつみを あける", unbutton: "ボタンを はずす",
};

export interface UnQuestion {
  base: string;
  answer: string;
  wrong: string[];
  meaning: string;
}

/** 表に ある un- の ことばの 問題（in- / dis- に かえた もの）。表に なければ null */
export function unOf(word: string): UnQuestion | null {
  const w = word.toLowerCase();
  const meaning = UN[w];
  if (!meaning) return null;
  const base = w.slice(2);
  return { base, answer: w, wrong: [`in${base}`, `dis${base}`], meaning };
}

export function unWhy(q: UnQuestion): string {
  return `${q.base} の まえに un を つけると はんたいの いみ。${q.answer}（${q.meaning}）。`;
}
