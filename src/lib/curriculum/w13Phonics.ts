/**
 * ワールド13（あさひの港町・L361〜390）の フォニックス・つづり の「おと」の表。
 * import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * - 3 単現の -s の 3つの おと: いきだけの おと（p t k f）の あとは「ス」（likes）、こえの でる おと・母音の あとは「ズ」（plays）、
 *   s・z・x・ch・sh（と ce・ge・se・ze）の あとは「イズ」（watches, washes, fixes, dances）
 * - -ies と とくべつな 形: 子音＋y は y を i に かえて es（study → studies）。母音＋y は そのまま s（play → plays）。
 *   go → goes、do → does、have → has
 * - -tch / -dge: みじかい母音の すぐ あとの「チ」「ヂ」は tch / dge（catch, bridge）。それ以外（ながい母音・子音の あと）は ch / ge（teach, lunch, page, large）
 *
 * focus の かきかた: "-s" "-es" "-ies"、とくべつな 形は ことばの まま（"goes" "does" "has"）、"tch" "dge"（ふりかえりの くらべ用に "ch" "ge"）。
 */

/** ワールド13 が はじまる レッスン（それより前の 回では ワールド13 の 問題に しない） */
export const W13_START = 361;
/** -es の「イズ」を ならう レッスン（それより前の -s の 問題の 選択肢は ス / ズ だけ） */
export const W13_IZ_START = 366;

export const W13_S_FOCUS = ["-s", "-es"] as const;
export const W13_HE_FOCUS = ["-ies", "goes", "does", "has"] as const;
export const W13_CH_FOCUS = ["tch", "ch", "dge", "ge"] as const;

export type SSound = "s" | "z" | "iz";
export const S_LABEL: Record<SSound, string> = { s: "ス（s）", z: "ズ（z）", iz: "イズ（iz）" };
export const S_KANA: Record<SSound, string> = { s: "ス", z: "ズ", iz: "イズ" };

const SPECIAL_S: Record<string, SSound> = { has: "z", does: "z", goes: "z", says: "z" };

/** 3 単現（と 複数形）の おわりの s の おと。s で おわらない ことばは null */
export function sSound(word: string): SSound | null {
  const w = word.toLowerCase();
  if (!/^[a-z]+s$/.test(w) || w.length < 3) return null;
  if (SPECIAL_S[w]) return SPECIAL_S[w];
  if (w.endsWith("ies")) return "z";
  if (w.endsWith("es")) {
    const stem = w.slice(0, -2); // watch-es
    const base = w.slice(0, -1); // dance-s
    if (/(ch|sh|x|s|z)$/.test(stem) || /(ce|ge|se|ze)$/.test(base)) return "iz";
    // like-s, ride-s, see-s, goe-s: おわりの e は よまない。その まえの おとで きまる
    const last = base.replace(/e$/, "").slice(-1);
    return "ptkf".includes(last) ? "s" : "z";
  }
  if (/(ss|us|is)$/.test(w)) return null; // kiss, bus, this などは 3 単現の s では ない
  const last = w[w.length - 2];
  return "ptkf".includes(last) ? "s" : "z";
}

/** he / she の ときの とくべつな 形（もとの ことば → まちがえやすい つづり） */
const IRREGULAR_HE: Record<string, { base: string; wrong: string[] }> = {
  goes: { base: "go", wrong: ["gos", "gose"] },
  does: { base: "do", wrong: ["dos", "doos"] },
  has: { base: "have", wrong: ["haves", "havs"] },
};

export interface HeSpelling {
  answer: string;
  wrong: string[];
  base: string;
  kind: "ies" | "ys" | "irregular";
}

/** -ies（studies）・母音＋ys（plays）・とくべつな 形（goes does has）の ただしい つづりと まちがえやすい つづり。あてはまらなければ null */
export function heSpelling(word: string): HeSpelling | null {
  const w = word.toLowerCase();
  const irr = IRREGULAR_HE[w];
  if (irr) return { answer: w, wrong: irr.wrong, base: irr.base, kind: "irregular" };
  let m = w.match(/^([a-z]*[^aeiou])ies$/);
  if (m && m[1].length >= 2) return { answer: w, wrong: [`${m[1]}ys`, `${m[1]}yes`], base: `${m[1]}y`, kind: "ies" };
  m = w.match(/^([a-z]*[aeiou])ys$/);
  if (m) return { answer: w, wrong: [`${m[1]}ies`, `${m[1]}yes`], base: `${m[1]}y`, kind: "ys" };
  return null;
}

export type ChFamily = "tch" | "ch" | "dge" | "ge";

/**
 * 「チ」「ヂ」の つづりを ＿ に した 形（catch → ca＿、kitchen → ki＿en）。
 * tch → ch、dge → ge の じゅんに さがす（tch の なかの ch を ch と しない）。ge は ことばの おわりの ge だけ（get の g は かたい おと）。
 * allowed に ある つづりだけ さがす。なければ null。
 */
export function chBlank(word: string, allowed: readonly string[]): { display: string; answer: ChFamily; before: string } | null {
  const w = word.toLowerCase();
  for (const f of ["tch", "dge", "ch", "ge"] as const) {
    if (!allowed.includes(f)) continue;
    let i = w.indexOf(f);
    if (f === "ch" && w.includes("tch")) continue;
    if (f === "ge") {
      if (w.includes("dge") || !w.endsWith("ge")) continue;
      i = w.length - 2;
    }
    if (i <= 0) continue; // 見つからない・ことばの はじめ（chip の ch は ダイグラフの 問題）
    return { display: `${w.slice(0, i)}＿${w.slice(i + f.length)}`, answer: f, before: w[i - 1] };
  }
  return null;
}

/** ＿ に はいる つづりの 選択肢（チ の なかま / ヂ の なかま） */
export const CH_CHOICES: Record<ChFamily, readonly string[]> = {
  tch: ["tch", "ch", "sh", "dge"],
  ch: ["ch", "tch", "sh", "dge"],
  dge: ["dge", "ge", "j", "tch"],
  ge: ["ge", "dge", "j", "tch"],
};
