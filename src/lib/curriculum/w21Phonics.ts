/**
 * ワールド21（ことづての塔・L601〜630・ステージ3 の はじまり）の フォニックス・つづり（形態素の はじまり）の表。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - dis-（dislike, disagree, disappear）: 「はんたいの いみの ことばは？」（agree → ？（さんせいしない）→ disagree / unagree / inagree）
 * - mis- / pre-（mistake, misspell, preview）: 「＿ に はいる パーツは？」（＿spell（つづりを まちがえる）→ mis / pre / dis）
 * - ことばの パーツ tele- / phone / graph / photo-（telephone, photograph, autograph）: 「この ことばの tele は どんな いみ？」（とおく / おと・こえ / かく・えがく / ひかり）
 * - -ment / -ness（agreement, kindness, happiness）: 「ことばの おわりを つけると？」（kind → ？（やさしさ）→ kindness / kindment / kindnes）
 * - 音の つながり（hold on, can I, check it out）: 「つなげて いうと どう きこえる？」（hold on → ホウルドン / ホウルド・オン / …）
 *
 * focus の かきかた: "dis-" "mis-" "pre-"、"tele-" "phone" "graph" "photo-"、"-ment" "-ness"、音の つながりは フレーズ そのもの（"hold on"）。
 * どれも 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */

/** ワールド21 が はじまる レッスン（それより前の 回では ワールド21 の 問題に しない） */
export const W21_START = 601;

export const W21_DIS_FOCUS = "dis-";
export const W21_MISPRE_FOCUS = ["mis-", "pre-"] as const;
export const W21_PART_FOCUS = ["tele-", "phone", "graph", "photo-"] as const;
export const W21_SUFFIX_FOCUS = ["-ment", "-ness"] as const;

// ---------------------------------------------------------------------------
// dis-
// ---------------------------------------------------------------------------

/** dis- の ことば → もとの ことばの いみ・dis- の ことばの いみ・まちがいの 選択肢（ほんとうに ある ことばは 入れない） */
const DIS: Record<string, { baseMeaning: string; meaning: string; wrong: [string, string] }> = {
  dislike: { baseMeaning: "すき", meaning: "きらう", wrong: ["inlike", "delike"] }, // unlike は べつの いみの ことばが あるので 入れない
  disagree: { baseMeaning: "さんせいする", meaning: "さんせいしない", wrong: ["unagree", "inagree"] },
  disappear: { baseMeaning: "あらわれる", meaning: "きえる", wrong: ["unappear", "inappear"] },
  dishonest: { baseMeaning: "しょうじきな", meaning: "しょうじきで ない", wrong: ["unhonest", "inhonest"] },
  disconnect: { baseMeaning: "つなぐ", meaning: "せつぞくを きる", wrong: ["unconnect", "inconnect"] },
  disobey: { baseMeaning: "いうことを きく", meaning: "いうことを きかない", wrong: ["unobey", "inobey"] },
  discomfort: { baseMeaning: "ここちよさ", meaning: "ここちわるさ", wrong: ["uncomfort", "incomfort"] },
  disorder: { baseMeaning: "せいとん・じゅんばん", meaning: "ちらかった ようす", wrong: ["unorder", "inorder"] },
};

export interface DisQuestion {
  base: string;
  answer: string;
  wrong: readonly string[];
  baseMeaning: string;
  meaning: string;
}

/** 表に ある dis- の ことばの 問題。表に なければ null */
export function disOf(word: string): DisQuestion | null {
  const w = word.toLowerCase();
  const d = DIS[w];
  if (!d) return null;
  return { base: w.slice(3), answer: w, wrong: d.wrong, baseMeaning: d.baseMeaning, meaning: d.meaning };
}

export function disWhy(q: DisQuestion): string {
  return `${q.base}（${q.baseMeaning}）の まえに dis を つけると「はんたい・〜しない」の いみに なる。${q.answer}（${q.meaning}）。dis は ことばの パーツ（接頭辞）だよ。`;
}

// ---------------------------------------------------------------------------
// mis- / pre-
// ---------------------------------------------------------------------------

export type MisPre = "mis" | "pre";

const MISPRE: Record<string, { prefix: MisPre; meaning: string }> = {
  // mis- ＝ まちがえて
  mistake: { prefix: "mis", meaning: "まちがい" }, misspell: { prefix: "mis", meaning: "つづりを まちがえる" },
  misunderstand: { prefix: "mis", meaning: "かんちがいする" }, mishear: { prefix: "mis", meaning: "ききまちがえる" },
  misplace: { prefix: "mis", meaning: "おきわすれる" },
  // pre- ＝ まえに
  preview: { prefix: "pre", meaning: "まえもって みる・よこく" }, preheat: { prefix: "pre", meaning: "まえもって あたためる" },
  preschool: { prefix: "pre", meaning: "ほいくえん・ようちえん" }, pretest: { prefix: "pre", meaning: "まえの テスト" },
  prepay: { prefix: "pre", meaning: "さきに はらう" }, precook: { prefix: "pre", meaning: "まえもって りょうりする" },
};

/** パーツの 選択肢（この 順で、ほんとうに ある ことばに なる ものは のぞく） */
const PREFIX_ORDER = ["mis", "pre", "dis", "un", "re"] as const;
/** パーツを かえると ほんとうに ある ことばに なる もの（選択肢に 出さない） */
const REAL_WORDS = new Set(["review", "repay", "retake", "reheat", "retest", "respell", "replace", "displace", "recook", "unheard", "rehear"]);

export const MISPRE_MEANING: Record<MisPre, string> = { mis: "まちがえて", pre: "まえに・まえもって" };

export interface MisPreQuestion {
  base: string;
  answer: MisPre;
  /** 選択肢（answer を ふくむ 3つ。きまった 順） */
  choices: string[];
  display: string;
  meaning: string;
}

/** 表に ある mis- / pre- の ことばを、パーツを ＿ に した 形（misspell → ＿spell）。表に なければ null */
export function misPreBlank(word: string): MisPreQuestion | null {
  const w = word.toLowerCase();
  const m = MISPRE[w];
  if (!m) return null;
  const base = w.slice(3);
  const others = PREFIX_ORDER.filter((p) => p !== m.prefix && !REAL_WORDS.has(p + base));
  return { base, answer: m.prefix, choices: [m.prefix, ...others].slice(0, 3), display: `＿${base}（${m.meaning}）`, meaning: m.meaning };
}

export function misPreWhy(word: string, q: MisPreQuestion): string {
  const other: MisPre = q.answer === "mis" ? "pre" : "mis";
  return `${word} は ${q.answer} ＋ ${q.base}。${q.answer} は「${MISPRE_MEANING[q.answer]}」の いみの パーツ（${q.meaning}）。${other} は「${MISPRE_MEANING[other]}」だよ。`;
}

// ---------------------------------------------------------------------------
// ことばの パーツ（tele- / phone / graph / photo-）
// ---------------------------------------------------------------------------

/** ギリシャ語から きた パーツの いみ */
export const PART_MEANING: Record<string, string> = {
  tele: "とおく", phone: "おと・こえ", graph: "かく・えがく", photo: "ひかり",
  scope: "みる どうぐ", vision: "みる こと", micro: "ちいさい", auto: "じぶんで",
};
/** 選択肢に つかう パーツの いみ（この 順で） */
const PART_CHOICE_ORDER = ["tele", "phone", "graph", "photo", "auto", "micro"] as const;

const PARTS: Record<string, { parts: string[]; meaning: string }> = {
  telephone: { parts: ["tele", "phone"], meaning: "でんわ" },
  telescope: { parts: ["tele", "scope"], meaning: "ぼうえんきょう" },
  television: { parts: ["tele", "vision"], meaning: "テレビ" },
  microphone: { parts: ["micro", "phone"], meaning: "マイク" },
  headphones: { parts: ["head", "phone"], meaning: "ヘッドホン" },
  smartphone: { parts: ["smart", "phone"], meaning: "スマートフォン" },
  xylophone: { parts: ["xylo", "phone"], meaning: "もっきん" },
  photograph: { parts: ["photo", "graph"], meaning: "しゃしん" },
  photographer: { parts: ["photo", "graph", "er"], meaning: "しゃしんか" },
  photocopy: { parts: ["photo", "copy"], meaning: "コピー（ひかりで うつす）" },
  autograph: { parts: ["auto", "graph"], meaning: "サイン（じぶんで かいた なまえ）" },
  paragraph: { parts: ["para", "graph"], meaning: "だんらく" },
  graphic: { parts: ["graph", "ic"], meaning: "えや ずの" },
};

export interface PartQuestion {
  part: string;
  answer: string;
  choices: string[];
  meaning: string;
  parts: string[];
}

/**
 * 表に ある ことばの パーツの いみを 問う。focus（"tele-" "phone" …）の 順に、ことばに ふくまれる パーツを えらぶ。
 * あてはまらなければ null
 */
export function partOf(word: string, focus: readonly string[]): PartQuestion | null {
  const w = word.toLowerCase();
  const p = PARTS[w];
  if (!p) return null;
  const part = focus.map((f) => f.replace(/-/g, "")).find((f) => p.parts.includes(f) && f in PART_MEANING);
  if (!part) return null;
  const answer = PART_MEANING[part];
  // もう 1つの パーツの いみは 選択肢に 入れない（telephone の tele を きくとき「おと・こえ」も 正しく 見えるので）
  const others = PART_CHOICE_ORDER.filter((x) => x !== part && !p.parts.includes(x)).map((x) => PART_MEANING[x]);
  return { part, answer, choices: [answer, ...others].slice(0, 4), meaning: p.meaning, parts: p.parts };
}

export function partWhy(word: string, q: PartQuestion): string {
  const split = q.parts.join(" ＋ ");
  return `${word}（${q.meaning}）は ${split}。${q.part} は「${q.answer}」の いみの パーツ。パーツの いみが わかると、はじめて みる ことばも わかるように なるよ。`;
}

// ---------------------------------------------------------------------------
// -ment / -ness
// ---------------------------------------------------------------------------

export type SuffixKind = "ment" | "ness";

const SUFFIX: Record<string, { base: string; baseMeaning: string; meaning: string }> = {
  // うごきの ことば ＋ ment
  agreement: { base: "agree", baseMeaning: "さんせいする", meaning: "さんせい・やくそく" },
  payment: { base: "pay", baseMeaning: "はらう", meaning: "しはらい" },
  movement: { base: "move", baseMeaning: "うごく", meaning: "うごき" },
  excitement: { base: "excite", baseMeaning: "わくわくさせる", meaning: "わくわく" },
  enjoyment: { base: "enjoy", baseMeaning: "たのしむ", meaning: "たのしみ" },
  announcement: { base: "announce", baseMeaning: "しらせる", meaning: "おしらせ" },
  improvement: { base: "improve", baseMeaning: "よくする", meaning: "よく なる こと" },
  // ようすの ことば ＋ ness
  kindness: { base: "kind", baseMeaning: "やさしい", meaning: "やさしさ" },
  sadness: { base: "sad", baseMeaning: "かなしい", meaning: "かなしみ" },
  darkness: { base: "dark", baseMeaning: "くらい", meaning: "くらやみ" },
  brightness: { base: "bright", baseMeaning: "あかるい", meaning: "あかるさ" },
  softness: { base: "soft", baseMeaning: "やわらかい", meaning: "やわらかさ" },
  happiness: { base: "happy", baseMeaning: "しあわせな", meaning: "しあわせ" },
  loneliness: { base: "lonely", baseMeaning: "さびしい", meaning: "さびしさ" },
};

export type SuffixTrap = "drop-e" | "y-to-i" | "keep-y" | "single-s" | "keep-ee";

export interface SuffixQuestion {
  kind: SuffixKind;
  base: string;
  answer: string;
  /** まちがいの 選択肢（もう 1つの おわり・つづりの まちがい） */
  wrong: [string, string];
  trap: SuffixTrap;
  baseMeaning: string;
  meaning: string;
}

/** 表に ある -ment / -ness の ことばの 問題。表に なければ null */
export function suffixOf(word: string): SuffixQuestion | null {
  const w = word.toLowerCase();
  const s = SUFFIX[w];
  if (!s) return null;
  const kind: SuffixKind = w.endsWith("ment") ? "ment" : "ness";
  const b = s.base;
  const swapped = kind === "ment" ? `${b}ness` : `${b}ment`;
  let trap: SuffixTrap;
  let misspelt: string;
  if (kind === "ment") {
    if (b.endsWith("ee")) { trap = "keep-ee"; misspelt = `${b.slice(0, -1)}ment`; } // agree → agrement
    else if (b.endsWith("e")) { trap = "drop-e"; misspelt = `${b.slice(0, -1)}ment`; } // move → movment
    else { trap = "keep-y"; misspelt = `${b.slice(0, -1)}iment`; } // pay → paiment（ぼいん ＋ y は そのまま）
  } else if (b.endsWith("y")) { trap = "y-to-i"; misspelt = `${b}ness`; } // happy → happyness
  else { trap = "single-s"; misspelt = `${b}nes`; } // kind → kindnes
  // y → i の ことばの もう 1つの おわりも y を i に（happiment）
  const other = kind === "ness" && b.endsWith("y") ? `${b.slice(0, -1)}iment` : swapped;
  return { kind, base: b, answer: w, wrong: [other, misspelt], trap, baseMeaning: s.baseMeaning, meaning: s.meaning };
}

export function suffixWhy(q: SuffixQuestion): string {
  const head = q.kind === "ment"
    ? `うごきの ことば（${q.base}＝${q.baseMeaning}）に ment を つけると「〜する こと」の なまえの ことば。`
    : `ようすの ことば（${q.base}＝${q.baseMeaning}）に ness を つけると「〜さ」の なまえの ことば。`;
  const tail: Record<SuffixTrap, string> = {
    "drop-e": "ment の まえの e は とらずに のこすよ。",
    "keep-ee": "ee は そのまま のこすよ。",
    "keep-y": "ぼいん ＋ y は y の まま ment を つけるよ。",
    "y-to-i": "しいん ＋ y で おわる ことばは y を i に かえて ness。",
    "single-s": "ness は s が 2つ だよ。",
  };
  return `${head}${q.answer}（${q.meaning}）。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// 音の つながり（リンキング）
// ---------------------------------------------------------------------------

/** フレーズ → つなげた ときの きこえかた・1つずつ いう ときの きこえかた・いみ */
const LINK: Record<string, { linked: string; split: string; meaning: string }> = {
  "hold on": { linked: "ホウルドン", split: "ホウルド・オン", meaning: "まってね" },
  "can i": { linked: "キャナイ", split: "キャン・アイ", meaning: "〜しても いい？" },
  "come in": { linked: "カミン", split: "カム・イン", meaning: "はいって" },
  "check it out": { linked: "チェキタウト", split: "チェック・イット・アウト", meaning: "みてみて" },
  "pick it up": { linked: "ピキタップ", split: "ピック・イット・アップ", meaning: "ひろって・でんわに でて" },
  "think about it": { linked: "シンカバウティット", split: "シンク・アバウト・イット", meaning: "かんがえてみて" },
  "leave a message": { linked: "リーヴァメッセージ", split: "リーヴ・ア・メッセージ", meaning: "でんごんを のこす" },
  "take a message": { linked: "テイカメッセージ", split: "テイク・ア・メッセージ", meaning: "でんごんを うけとる" },
  "send it": { linked: "センディット", split: "センド・イット", meaning: "それを おくって" },
  "an email": { linked: "アニーメイル", split: "アン・イーメイル", meaning: "メール 1つ" },
  "log in": { linked: "ロギン", split: "ログ・イン", meaning: "ログインする" },
  "sign in": { linked: "サイニン", split: "サイン・イン", meaning: "サインインする" },
  "turn on": { linked: "ターノン", split: "ターン・オン", meaning: "スイッチを いれる" },
  "turn off": { linked: "ターノフ", split: "ターン・オフ", meaning: "スイッチを きる" },
};
const LINK_KEYS = Object.keys(LINK);

export interface LinkQuestion {
  phrase: string;
  answer: string;
  /** まちがいの 選択肢: 1つずつ はなした いいかた・ほかの フレーズの つなげた いいかた */
  split: string;
  others: string[];
  meaning: string;
  /** つながる ところ（さいしょの「しいんで おわる ことば ＋ ぼいんで はじまる ことば」） */
  joint: { end: string; start: string };
}

/** 表に ある フレーズの 問題。表に なければ null */
export function linkOf(phrase: string): LinkQuestion | null {
  const p = phrase.toLowerCase().trim();
  const l = LINK[p];
  if (!l) return null;
  const ws = p.split(/\s+/);
  // おわりの おと: come・take・leave の おわりの e は よまないので、その まえの しいん（m・k・v）
  const endSound = (w: string) => (/[^aeiou]e$/.test(w) ? w.slice(-2, -1) : /[aeiou]$/.test(w) ? null : w.slice(-1));
  let joint = { end: endSound(ws[0]) ?? ws[0].slice(-1), start: (ws[1] ?? "")[0] ?? "" };
  for (let i = 0; i + 1 < ws.length; i++) {
    const end = endSound(ws[i]);
    if (end && /^[aeiou]/.test(ws[i + 1])) { joint = { end, start: ws[i + 1][0] }; break; }
  }
  const others = LINK_KEYS.filter((k) => k !== p).map((k) => LINK[k].linked);
  return { phrase: p, answer: l.linked, split: l.split, others, meaning: l.meaning, joint };
}

export function linkWhy(phrase: string, q: LinkQuestion): string {
  return `${phrase}（${q.meaning}）は「${q.answer}」の ように きこえる。${q.joint.end} の おと（しいん）で おわる ことばの あとに ${q.joint.start}（ぼいん）で はじまる ことばが くると、つながって 1つの ことばの ように なるよ。`;
}

/** フォーカスの ボタンの 読み上げ（ワールド21）。パーツを そのまま よまず、その回の ことばで よむ。あてはまらなければ null */
export function w21Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  if (focus === W21_DIS_FOCUS) return words.find((w) => DIS[lw(w)]) ?? null;
  if ((W21_MISPRE_FOCUS as readonly string[]).includes(focus)) return words.find((w) => MISPRE[lw(w)] && lw(w).startsWith(focus.slice(0, -1))) ?? null;
  if ((W21_PART_FOCUS as readonly string[]).includes(focus)) {
    const part = focus.replace(/-/g, "");
    return words.find((w) => PARTS[lw(w)]?.parts.includes(part)) ?? null;
  }
  if ((W21_SUFFIX_FOCUS as readonly string[]).includes(focus)) return words.find((w) => SUFFIX[lw(w)] && lw(w).endsWith(focus.slice(1))) ?? null;
  if (LINK[lw(focus)]) return focus;
  return null;
}
