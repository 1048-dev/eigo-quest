/**
 * レッスンの「フォニックス」ステップの ボタン（純粋関数。クライアントからも つかう）。
 *
 * つづりを そのまま 読み上げると「エー・アンダーバー・イー」「ハイフン・エス・ティー」のような
 * へんな 音に なるので、ボタンは
 *   - 見た目: 子どもに わかる 書きかた（a_e → a…e「マジック e」、-st → …st「おわりの おと」、sun-set → sun・set）
 *   - 音:    その つづりが 入った おてほんの ことば（ai → rain、ir → bird、aw → saw）を 読む
 */
import { w26Example } from "./w26Phonics";
import { w27Example } from "./w27Phonics";
import { w28Example } from "./w28Phonics";

export interface FocusLabel {
  /** 大きく 見せる つづり */
  main: string;
  /** 小さな せつめい（なければ ""） */
  hintJa: string;
}

const isMagicE = (f: string) => /^[a-z]_e$/.test(f);
const isEnding = (f: string) => /^-[a-z]+$/.test(f);
const isSyllables = (f: string) => /^[a-z]+(-[a-z]+)+$/.test(f);
/** 短縮形の おわり（ワールド15: 'm 's 're n't） */
const isContraction = (f: string) => /^(n't|'[a-z]+)$/.test(f);
/** はじめに つける つづり（ワールド18: un-） */
const isPrefix = (f: string) => /^[a-z]+-$/.test(f);

export function focusLabel(focus: string): FocusLabel {
  const f = focus.trim();
  if (isMagicE(f)) return { main: `${f[0]}…e`, hintJa: "マジック e" };
  if (isEnding(f)) return { main: `…${f.slice(1)}`, hintJa: "おわりの おと" };
  if (isSyllables(f)) return { main: f.split("-").join("・"), hintJa: "はくで よもう" };
  if (isContraction(f)) return { main: `…${f}`, hintJa: "みじかい かたち" };
  if (isPrefix(f)) return { main: `${f.slice(0, -1)}…`, hintJa: "はじめに つける" };
  return { main: f, hintJa: "" };
}

/** つづりごとの おてほん（その回の ことばに 見つからないときだけ つかう） */
const DEFAULT_EXAMPLES: Record<string, string> = {
  a: "apple", b: "bear", c: "cat", d: "dog", e: "egg", f: "fish", g: "goat", h: "hat", i: "ink", j: "jam", k: "kite", l: "lion", m: "milk",
  n: "nest", o: "octopus", p: "pig", q: "queen", qu: "queen", r: "rabbit", s: "sun", t: "ten", u: "up", v: "van", w: "water", x: "box", y: "yes", z: "zoo",
  sh: "ship", ch: "chip", th: "three", wh: "whale", ck: "duck", ng: "ring", nk: "pink",
  ai: "rain", ay: "play", ee: "tree", ea: "sea", oa: "boat", ow: "snow", oo: "moon", ou: "house", oi: "coin", oy: "boy", igh: "night", ie: "pie",
  ar: "car", or: "corn", er: "her", ir: "bird", ur: "turn", air: "hair", ear: "ear",
  aw: "saw", au: "August", ew: "new",
  a_e: "cake", i_e: "kite", o_e: "rope", u_e: "cute", e_e: "these",
};

/** ボタンを おしたときに 読む おてほんの ことば */
export function focusExampleWord(focus: string, words: readonly string[] = []): string {
  const f = focus.trim().toLowerCase();
  if (!f) return words[0] ?? "";
  const ws = words.map((w) => w.trim()).filter(Boolean);
  const lower = (w: string) => w.toLowerCase();

  // ワールド26（セリフ・文・はやくちことば）は 記号を よまない ように、しるしの なまえ・キーワード・つよく いう ことばを よむ
  const w26 = w26Example(focus.trim(), ws);
  if (w26) return w26;
  // ワールド27（k の おとの ch・だまって いる もじ・for / since・同音異義語）は その focus で 問う ことば・フレーズを よむ（ch を chip、l を lion で よまない）
  const w27 = w27Example(focus.trim(), ws);
  if (w27) return w27;
  // ワールド28（カタカナ語・日本語・リズム・音の つながり・パーツ）は その focus で 問う ことば・文・フレーズを よむ（"to" "dis-" だけで よまない）
  const w28 = w28Example(focus.trim(), ws);
  if (w28) return w28;

  // sun-set → sunset（はくに わけた ことばは ことば まるごと）
  if (isSyllables(f)) return f.replace(/-/g, "");

  let hit: string | undefined;
  if (isMagicE(f)) {
    const re = new RegExp(`${f[0]}[a-z]e`);
    hit = ws.find((w) => re.test(lower(w)));
  } else if (isPrefix(f)) {
    const head = f.slice(0, -1);
    hit = ws.find((w) => lower(w).startsWith(head));
  } else if (isEnding(f)) {
    const end = f.slice(1);
    hit = ws.find((w) => lower(w).endsWith(end)) ?? ws.find((w) => lower(w).includes(end));
  } else {
    // サイトワード（was, said …）は その ことばを そのまま
    hit = ws.find((w) => lower(w) === f) ?? ws.find((w) => lower(w).startsWith(f)) ?? ws.find((w) => lower(w).includes(f));
  }
  if (hit) return hit;
  return DEFAULT_EXAMPLES[f] ?? ws[0] ?? f.replace(/[-_]/g, "");
}
