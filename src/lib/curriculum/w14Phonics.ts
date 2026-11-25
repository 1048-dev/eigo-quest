/**
 * ワールド14（にぎわいの市場・L391〜420）の フォニックス・つづり の表。
 * import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * - 複数形の つづり: s・x・ch・sh・z で おわる → es（boxes, peaches, dishes）、o で おわる → es（tomatoes）、
 *   子音＋y → ies（berries）、母音＋y → s（keys）、f / fe → ves（loaves, knives）
 * - だまっている もじ: kn の k（knife）、wr の w（write）、mb の b（lamb）。ph は f と おなじ「フ」（phone）
 * - 大きな数の つづり: -ty（forty, fifty）、-teen（fifteen）、hundred、thousand
 *
 * focus の かきかた: 複数形は "es" "ies" "ys" "ves"、だまっている もじは "kn" "wr" "mb" "ph"、数は "-ty" "-teen" "hundred" "thousand"。
 * （ワールド13 の "-es"（3 単現の おと）と ぶつからないように、複数形の focus には ハイフンを つけない）
 */

/** ワールド14 が はじまる レッスン（それより前の 回では ワールド14 の 問題に しない） */
export const W14_START = 391;

export const W14_PLURAL_FOCUS = ["es", "ies", "ys", "ves"] as const;
export const W14_SILENT_FOCUS = ["kn", "wr", "mb", "ph"] as const;
export const W14_NUMBER_FOCUS = ["-ty", "-teen", "hundred", "thousand"] as const;

export type PluralKind = "es" | "oes" | "ies" | "ys" | "ves";

export interface PluralSpelling {
  answer: string;
  wrong: string[];
  base: string;
  kind: PluralKind;
}

/** f / fe → ves の ことば（ふくすう → ひとつ） */
const VES_BASE: Record<string, string> = {
  knives: "knife", wives: "wife", lives: "life", leaves: "leaf", loaves: "loaf", halves: "half",
  shelves: "shelf", wolves: "wolf", calves: "calf", scarves: "scarf", thieves: "thief", elves: "elf",
};

/** 複数形の ただしい つづりと まちがえやすい つづり。あてはまらなければ null（apples のような ふつうの s も null） */
export function pluralSpelling(word: string): PluralSpelling | null {
  const w = word.toLowerCase();
  const ves = VES_BASE[w];
  if (ves) {
    const wrong = ves.endsWith("fe") ? [`${ves}s`, `${ves.slice(0, -1)}s`] : [`${ves}s`, `${ves}es`];
    return { answer: w, wrong, base: ves, kind: "ves" };
  }
  let m = w.match(/^([a-z]*[^aeiou])ies$/);
  if (m && m[1].length >= 2) return { answer: w, wrong: [`${m[1]}ys`, `${m[1]}yes`], base: `${m[1]}y`, kind: "ies" };
  m = w.match(/^([a-z]*[aeiou])ys$/);
  if (m) return { answer: w, wrong: [`${m[1]}ies`, `${m[1]}yes`], base: `${m[1]}y`, kind: "ys" };
  m = w.match(/^([a-z]+(?:ch|sh|x|ss|us|z))es$/);
  if (m) return { answer: w, wrong: [`${m[1]}s`, `${m[1]}is`], base: m[1], kind: "es" };
  m = w.match(/^([a-z]+[^aeiou]o)es$/);
  if (m) return { answer: w, wrong: [`${m[1]}s`, `${m[1]}se`], base: m[1], kind: "oes" };
  return null;
}

export const PLURAL_WHY: Record<PluralKind, (base: string) => string> = {
  es: (b) => `${b} は s・x・ch・sh で おわるので es を つけるよ（「イズ」と よむ）。`,
  oes: (b) => `${b} は 子音＋o で おわるので es を つけるよ。`,
  ies: (b) => `${b} は y の まえが 子音なので、y を i に かえて es を つけるよ。`,
  ys: (b) => `${b} は y の まえが 母音（a e i o u）なので、そのまま s を つけるよ。`,
  ves: (b) => `${b} は f / fe で おわるので、f を v に かえて es を つけるよ。`,
};

export type SilentFamily = (typeof W14_SILENT_FOCUS)[number];

/** ＿ に はいる つづりの 選択肢 */
export const SILENT_CHOICES: Record<SilentFamily, readonly string[]> = {
  kn: ["kn", "n", "nn", "gn"],
  wr: ["wr", "r", "rr", "wh"],
  mb: ["mb", "m", "mm", "mp"],
  ph: ["ph", "f", "ff", "p"],
};

export const SILENT_WHY: Record<SilentFamily, string> = {
  kn: "kn の k は よまない（だまっている もじ）。「ン」の おとだけ だよ。",
  wr: "wr の w は よまない（だまっている もじ）。r の おとだけ だよ。",
  mb: "mb の b は よまない（だまっている もじ）。m の おとだけ だよ。",
  ph: "ph は 2もじで f と おなじ「フ」の おと だよ。",
};

/** だまっている もじ（kn wr mb ph）を ＿ に した 形（knife → ＿ife、lamb → la＿）。family が なければ null */
export function silentBlank(word: string, family: string): { display: string; answer: SilentFamily } | null {
  if (!(W14_SILENT_FOCUS as readonly string[]).includes(family)) return null;
  const w = word.toLowerCase();
  const i = w.indexOf(family);
  if (i < 0) return null;
  return { display: `${w.slice(0, i)}＿${w.slice(i + family.length)}`, answer: family as SilentFamily };
}

/** 数の ことばの まちがえやすい つづりと ヒント */
const NUMBERS: Record<string, { wrong: [string, string]; tip: string }> = {
  twenty: { wrong: ["twenti", "tweny"], tip: "two では なく tw。さいごは ty。" },
  thirty: { wrong: ["thurty", "therty"], tip: "three では なく thir。" },
  forty: { wrong: ["fourty", "forthy"], tip: "four なのに u が ない！ forty。" },
  fifty: { wrong: ["fivety", "fifthy"], tip: "five では なく fif。" },
  sixty: { wrong: ["sixy", "sixtey"], tip: "six に ty を つけるだけ。" },
  seventy: { wrong: ["sevendy", "seventie"], tip: "seven に ty を つけるだけ。" },
  eighty: { wrong: ["eightty", "eigthy"], tip: "eight の t は ひとつだけ。" },
  ninety: { wrong: ["ninty", "nintey"], tip: "nine の e を のこして ninety。" },
  thirteen: { wrong: ["thirtean", "thurteen"], tip: "thir に teen。teen は ee。" },
  fourteen: { wrong: ["forteen", "fourtean"], tip: "fourteen は four の u を のこす（forty と ちがう）。" },
  fifteen: { wrong: ["fiveteen", "fifteem"], tip: "five では なく fif。" },
  sixteen: { wrong: ["sixtean", "sixten"], tip: "six に teen。teen は ee。" },
  eighteen: { wrong: ["eightteen", "eigteen"], tip: "eight の t と teen の t が ひとつに なる。" },
  nineteen: { wrong: ["ninteen", "ninetean"], tip: "nine の e を のこして nineteen。" },
  hundred: { wrong: ["hundered", "handred"], tip: "hun・dred。dred の r は d の すぐ あと。" },
  thousand: { wrong: ["thousend", "tousand"], tip: "th で はじまって、さいごは sand。" },
};

/** -teen と -ty の くらべ（ききわけ） */
const TEEN_TY: Record<string, string> = {
  thirteen: "thirty", thirty: "thirteen", fourteen: "forty", forty: "fourteen", fifteen: "fifty", fifty: "fifteen",
  sixteen: "sixty", sixty: "sixteen", eighteen: "eighty", eighty: "eighteen", nineteen: "ninety", ninety: "nineteen",
};

/**
 * 数の ことばの ただしい つづりと まちがえやすい つづり。
 * focus に "-teen" と "-ty" が ならぶ 回は、ペアの 数（thirteen ↔ thirty）を 選択肢に いれて ききわけに する。
 */
export function numberSpelling(word: string, focus: readonly string[] = []): { answer: string; wrong: string[]; tip: string } | null {
  const w = word.toLowerCase();
  const n = NUMBERS[w];
  if (!n) return null;
  const pair = TEEN_TY[w];
  const wrong = pair && focus.includes("-teen") && focus.includes("-ty") ? [pair, n.wrong[0]] : [...n.wrong];
  return { answer: w, wrong, tip: n.tip };
}
