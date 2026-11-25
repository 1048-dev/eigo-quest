/**
 * ワールド19（からくり工房・L541〜570）の フォニックス・つづり の表。import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - re-（remake, reuse, rewind）: 「『もう いちど』の いみの ことばは？」（make → ？（つくりなおす）→ remake / unmake / rimake）
 * - 道具の -er / -or（opener, cutter, elevator）: 「おわりの つづりは？」（elevat＿＿（エレベーター）→ or / er / ar）
 * - だまっている もじの まとめ（wr, kn, mb, gu, -stle）: 「＿ に はいる つづりは？」（＿ench（レンチ）→ wr / r / rr / wh）
 * - qu・squ（quick, square, squeeze）: 「＿ に はいる つづりは？」（＿iz（クイズ）→ qu / kw / cu / q）
 * - ou・ough の いろいろ（touch, soup, through, enough, though, thought）: 「この ことばの ou（ough）は どの おと？」
 *
 * focus の かきかた: "re-"、"-er" "-or"、"wr" "kn" "mb" "gu" "-stle"、"qu" "squ"、"ou" "ough"。
 * どれも 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */

/** ワールド19 が はじまる レッスン（それより前の 回では ワールド19 の 問題に しない） */
export const W19_START = 541;

export const W19_RE_FOCUS = "re-";
export const W19_TOOL_FOCUS = ["-er", "-or"] as const;
export const W19_SILENT_FOCUS = ["wr", "kn", "mb", "gu", "-stle"] as const;
export const W19_QU_FOCUS = ["qu", "squ"] as const;
export const W19_OU_FOCUS = ["ou", "ough"] as const;

// ---------------------------------------------------------------------------
// re-
// ---------------------------------------------------------------------------

/** re- の ことば → いみ（もとの ことばは re を とった もの） */
const RE: Record<string, string> = {
  remake: "つくりなおす", reuse: "もう いちど つかう", replay: "もう いちど あそぶ・ながす", redo: "やりなおす",
  retell: "もう いちど はなす", reread: "よみなおす", rewrite: "かきなおす", rebuild: "たてなおす・くみなおす",
  refill: "もう いちど いっぱいに する", reopen: "もう いちど あける", repaint: "ぬりなおす", restart: "もう いちど はじめる",
  recheck: "もう いちど たしかめる", retry: "もう いちど やってみる", refold: "おりなおす", rewind: "まきもどす",
};

export interface ReQuestion {
  base: string;
  answer: string;
  wrong: string[];
  meaning: string;
}

/** 表に ある re- の ことばの 問題（はんたいの un- と、おとの まま かいた ri-）。表に なければ null */
export function reOf(word: string): ReQuestion | null {
  const w = word.toLowerCase();
  const meaning = RE[w];
  if (!meaning) return null;
  const base = w.slice(2);
  return { base, answer: w, wrong: [`un${base}`, `ri${base}`], meaning };
}

export function reWhy(q: ReQuestion): string {
  return `${q.base} の まえに re を つけると「もう いちど」の いみ。${q.answer}（${q.meaning}）。un は「はんたい」、つづりは ri では なく re だよ。`;
}

// ---------------------------------------------------------------------------
// 道具の -er / -or
// ---------------------------------------------------------------------------

export type ToolKind = "add" | "e" | "double" | "or";

/** 道具・きかいの ことば → もとの ことば（あれば）と いみ */
const TOOLS: Record<string, { base: string; meaning: string }> = {
  // そのまま er
  opener: { base: "open", meaning: "あける どうぐ" }, mixer: { base: "mix", meaning: "まぜる きかい" }, heater: { base: "heat", meaning: "あたためる きかい" },
  toaster: { base: "toast", meaning: "パンを やく きかい" }, printer: { base: "print", meaning: "いんさつする きかい" }, blender: { base: "blend", meaning: "まぜる きかい（ミキサー）" },
  // e で おわる → r だけ
  eraser: { base: "erase", meaning: "けしゴム" }, stapler: { base: "staple", meaning: "ホッチキス" }, timer: { base: "time", meaning: "タイマー" },
  // みじかい 母音 ＋ 子音 1つ → 重ねて er
  cutter: { base: "cut", meaning: "カッター" }, scanner: { base: "scan", meaning: "スキャナー" },
  // or で おわる
  elevator: { base: "elevate", meaning: "エレベーター" }, calculator: { base: "calculate", meaning: "でんたく" }, projector: { base: "project", meaning: "プロジェクター" },
  motor: { base: "", meaning: "モーター" }, tractor: { base: "", meaning: "トラクター" }, inventor: { base: "invent", meaning: "はつめいか" },
};

export interface ToolEnding {
  word: string;
  display: string;
  answer: "er" | "or";
  base: string;
  kind: ToolKind;
  meaning: string;
}

export const TOOL_CHOICES = ["er", "or", "ar"] as const;

/** 表に ある 道具の ことばの おわり（er / or）を ＿＿ に した 形。表に なければ null */
export function toolEnding(word: string): ToolEnding | null {
  const w = word.toLowerCase();
  const e = TOOLS[w];
  if (!e) return null;
  const answer = w.endsWith("or") ? "or" : "er";
  const { base, meaning } = e;
  let kind: ToolKind;
  if (answer === "or") kind = "or";
  else if (w === `${base}er`) kind = "add";
  else if (base.endsWith("e") && w === `${base}r`) kind = "e";
  else kind = "double";
  return { word: w, display: `${w.slice(0, -2)}＿＿（${meaning}）`, answer, base, kind, meaning };
}

export const TOOL_WHY: Record<ToolKind, (t: ToolEnding) => string> = {
  add: (t) => `${t.base} する もの → ${t.word}。どうぐや きかいの おわりは er が いちばん おおいよ。`,
  e: (t) => `${t.base} は e で おわるので r だけ つけて ${t.word}。`,
  double: (t) => `${t.base} は みじかい 母音 ＋ 子音 1つ。${t.base.slice(-1)} を 重ねて er で ${t.word}。`,
  or: (t) => t.base.endsWith("ate")
    ? `${t.word} の おわりは or。ate で おわる ことば（${t.base}）は ator に なるよ。`
    : `${t.word} の おわりは or。er と おなじ おとだけど、つづりで おぼえよう。`,
};

// ---------------------------------------------------------------------------
// だまっている もじの まとめ（wr kn mb gu -stle）
// ---------------------------------------------------------------------------

export type SilentFamily19 = (typeof W19_SILENT_FOCUS)[number];

/** だまっている もじの ことば → グループと いみ */
const SILENT: Record<string, { family: SilentFamily19; meaning: string }> = {
  wrench: { family: "wr", meaning: "レンチ" }, wrist: { family: "wr", meaning: "てくび" }, wrap: { family: "wr", meaning: "つつむ" }, write: { family: "wr", meaning: "かく" },
  knob: { family: "kn", meaning: "とっての つまみ" }, knot: { family: "kn", meaning: "むすびめ" }, knife: { family: "kn", meaning: "ナイフ" }, knock: { family: "kn", meaning: "ノックする" },
  thumb: { family: "mb", meaning: "おやゆび" }, climb: { family: "mb", meaning: "のぼる" }, comb: { family: "mb", meaning: "くし" }, plumber: { family: "mb", meaning: "すいどう やさん" },
  guitar: { family: "gu", meaning: "ギター" }, guess: { family: "gu", meaning: "あてる・すいりする" }, guide: { family: "gu", meaning: "あんないする" }, guard: { family: "gu", meaning: "まもる・けいび" },
  whistle: { family: "-stle", meaning: "ふえ" }, castle: { family: "-stle", meaning: "おしろ" }, bristle: { family: "-stle", meaning: "ブラシの け" }, rustle: { family: "-stle", meaning: "かさかさ なる" },
};

/** ＿ に はいる つづりの 選択肢 */
export const SILENT19_CHOICES: Record<SilentFamily19, readonly string[]> = {
  wr: ["wr", "r", "rr", "wh"],
  kn: ["kn", "n", "nn", "gn"],
  mb: ["mb", "m", "mm", "mp"],
  gu: ["gu", "g", "gw", "gh"],
  "-stle": ["stle", "sle", "ssle", "sel"],
};

export const SILENT19_WHY: Record<SilentFamily19, string> = {
  wr: "wr の w は よまない（だまっている もじ）。r の おとだけ だよ。",
  kn: "kn の k は よまない（だまっている もじ）。n の おとだけ だよ。",
  mb: "mb の b は よまない（だまっている もじ）。m の おとだけ だよ。",
  gu: "gu の u は よまない（だまっている もじ）。g を「グ」と かたく よむ しるし だよ。",
  "-stle": "stle の t は よまない（だまっている もじ）。「スル」と よむよ。",
};

export interface SilentBlank19 {
  display: string;
  answer: string;
  family: SilentFamily19;
  meaning: string;
}

/** 表に ある だまっている もじの ことばを ＿ に した 形（wrench → ＿ench、whistle → whi＿）。表に なければ null */
export function silentBlank19(word: string): SilentBlank19 | null {
  const w = word.toLowerCase();
  const e = SILENT[w];
  if (!e) return null;
  const letters = e.family.replace(/^-/, "");
  const i = w.indexOf(letters);
  if (i < 0) return null;
  return { display: `${w.slice(0, i)}＿${w.slice(i + letters.length)}（${e.meaning}）`, answer: letters, family: e.family, meaning: e.meaning };
}

// ---------------------------------------------------------------------------
// qu・squ
// ---------------------------------------------------------------------------

export type QuFamily = (typeof W19_QU_FOCUS)[number];

/** qu・squ の ことば → いみ（グループは つづりで きまる） */
const QU: Record<string, string> = {
  quick: "はやい・すばやい", quiet: "しずかな", quiz: "クイズ", queen: "じょおう",
  question: "しつもん", quilt: "キルト（かけぶとん）", quit: "やめる", quack: "ガーガー（あひるの こえ）",
  liquid: "えきたい", equal: "おなじ・ひとしい",
  square: "しかく・ひろば", squeeze: "ぎゅっと にぎる・しぼる", squid: "いか", squash: "つぶす・かぼちゃの なかま",
  squeak: "キーキー なる", squirrel: "りす",
};

export const QU_CHOICES: Record<QuFamily, readonly string[]> = {
  qu: ["qu", "kw", "cu", "q"],
  squ: ["squ", "skw", "scu", "sq"],
};

export const QU_WHY: Record<QuFamily, string> = {
  qu: "q の あとには いつも u。qu の 2もじで「クw」の おと だよ。",
  squ: "s ＋ qu で squ。「スクw」の おと。q の あとには いつも u だよ。",
};

export interface QuBlank {
  display: string;
  answer: QuFamily;
  meaning: string;
}

/** 表に ある qu・squ の ことばを ＿ に した 形（quiz → ＿iz、liquid → li＿id、square → ＿are）。表に なければ null */
export function quBlank(word: string): QuBlank | null {
  const w = word.toLowerCase();
  const meaning = QU[w];
  if (!meaning) return null;
  const answer: QuFamily = w.includes("squ") ? "squ" : "qu";
  const i = w.indexOf(answer);
  return { display: `${w.slice(0, i)}＿${w.slice(i + answer.length)}（${meaning}）`, answer, meaning };
}

// ---------------------------------------------------------------------------
// ou・ough の いろいろ
// ---------------------------------------------------------------------------

/** ou の おと: house の「アウ」・touch の「ア」・soup の「ウー」 */
export type OuSound = "アウ" | "ア" | "ウー";
/** ough の おと: through の「ウー」・enough の「アフ」・though の「オウ」・thought の「オー」 */
export type OughSound = "ウー" | "アフ" | "オウ" | "オー";

export const OU_SOUNDS: readonly OuSound[] = ["アウ", "ア", "ウー"];
export const OUGH_SOUNDS: readonly OughSound[] = ["ウー", "アフ", "オウ", "オー"];

const OU: Record<string, { sound: OuSound; meaning: string }> = {
  house: { sound: "アウ", meaning: "いえ" }, cloud: { sound: "アウ", meaning: "くも" }, mouth: { sound: "アウ", meaning: "くち" }, mouse: { sound: "アウ", meaning: "ねずみ" },
  touch: { sound: "ア", meaning: "さわる" }, young: { sound: "ア", meaning: "わかい" }, country: { sound: "ア", meaning: "くに" }, double: { sound: "ア", meaning: "2ばいの" },
  soup: { sound: "ウー", meaning: "スープ" }, group: { sound: "ウー", meaning: "グループ" }, youth: { sound: "ウー", meaning: "わかい ころ" }, coupon: { sound: "ウー", meaning: "クーポン" },
};

const OUGH: Record<string, { sound: OughSound; meaning: string }> = {
  through: { sound: "ウー", meaning: "〜を とおって" },
  enough: { sound: "アフ", meaning: "じゅうぶんな" }, rough: { sound: "アフ", meaning: "ざらざらの" }, tough: { sound: "アフ", meaning: "かたい・たいへんな" },
  though: { sound: "オウ", meaning: "〜だけど" }, dough: { sound: "オウ", meaning: "パンの きじ" },
  thought: { sound: "オー", meaning: "かんがえた（think の 過去形）" }, brought: { sound: "オー", meaning: "もってきた（bring の 過去形）" },
};

export const OU_EXAMPLE: Record<OuSound, string> = { アウ: "house", ア: "touch", ウー: "soup" };
export const OUGH_EXAMPLE: Record<OughSound, string> = { ウー: "through", アフ: "enough", オウ: "though", オー: "thought" };

export interface OuQuestion {
  team: "ou" | "ough";
  answer: string;
  choices: readonly string[];
  meaning: string;
}

/** 表に ある ou / ough の ことばの おとの 問題（ough を ふくむ ことばは ough で 問う）。表に なければ null */
export function ouSound(word: string): OuQuestion | null {
  const w = word.toLowerCase();
  const g = OUGH[w];
  if (g) return { team: "ough", answer: g.sound, choices: OUGH_SOUNDS, meaning: g.meaning };
  const o = OU[w];
  if (o) return { team: "ou", answer: o.sound, choices: OU_SOUNDS, meaning: o.meaning };
  return null;
}

export function ouWhy(word: string, q: OuQuestion): string {
  const others = q.team === "ough"
    ? OUGH_SOUNDS.filter((s) => s !== q.answer).map((s) => `${OUGH_EXAMPLE[s]}（${s}）`).join("・")
    : OU_SOUNDS.filter((s) => s !== q.answer).map((s) => `${OU_EXAMPLE[s]}（${s}）`).join("・");
  return `${word} の ${q.team} は「${q.answer}」。おなじ つづりでも ${others} の ように おとが かわるよ。`;
}

/** フォーカスの ボタンの 読み上げ（ワールド19）。つづりを そのまま よまず、その回の ことばで よむ。あてはまらなければ null */
export function w19Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  if (focus === "re-") return words.find((w) => lw(w).startsWith("re") && RE[lw(w)]) ?? null;
  if (focus === "-or") return words.find((w) => lw(w).endsWith("or")) ?? null;
  // wr kn mb（ワールド14）・qu（ワールド1）は これまでどおり（ここでは あつかわない）
  if (focus === "-stle" || focus === "gu" || focus === "squ" || focus === "ough") {
    const letters = focus.replace(/^-/, "");
    return words.find((w) => lw(w).includes(letters) && (SILENT[lw(w)] || QU[lw(w)] || OUGH[lw(w)])) ?? null;
  }
  // ou は アウ 以外の おとの ことばが ある 回だけ ことばで よむ（ワールド8 の ou は "ow" の まま）
  if (focus === "ou") return words.find((w) => OU[lw(w)] && OU[lw(w)].sound !== "アウ") ?? null;
  return null;
}
