/**
 * ワールド40（はじまりの星・L1171〜1200・ステージ5 の さいご）の フォニックス・つづりの表（6 年間の 総まとめ）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - つづりの まとめ（ステージ1〜2）: 「つづりの まとめ。＿＿ に 入る つづりは どれ？」（r＿＿n（雨）→ ai / ay / ei）
 * - ことばの パーツの まとめ（ステージ3）: 「ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？」（＿＿ ＋ happy（しあわせ でない）→ un / dis / re）
 * - 語根の まとめ（ステージ4）: 「語根の まとめ。おなじ 語根の なかまは どれ？」（inspect（しらべる）→ spectator / structure / export）
 * - スピーチの 間: 「スピーチの 間。どの ことばの あとで 間（‖）を とる？」（Six years ago I didn't know any English. → ago / years / didn't）
 * - 苦手な 音の 総点検: 「苦手な 音の 総点検。きこえた ことばは どれ？」（🔊 right → right / light / night）
 *
 * focus の かきかた:
 * - つづり・パーツ・語根・音は その ことば（"rain" "unhappy" "inspect" "right"）。
 * - スピーチの 間は 小文字の フレーズ（"six years ago"）。
 * まちがいの 選択肢は 表に 手で 書く。
 */

/** ワールド40 が はじまる レッスン（それより前の 回では ワールド40 の 問題に しない） */
export const W40_START = 1171;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);
const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

// ---------------------------------------------------------------------------
// つづりの まとめ（ステージ1〜2 の つづりの きまり）
// ---------------------------------------------------------------------------

/** ことば → ＿＿ の まえ・答えの つづり・あと・まちがい 2つ・いみ・こつ */
const SPELLS: Record<string, { pre: string; answer: string; post: string; wrong: [string, string]; ja: string; note: string }> = {
  rain: { pre: "r", answer: "ai", post: "n", wrong: ["ay", "ei"], ja: "雨", note: "ai は ことばの まんなかで「エイ」（rain・train・paint）" },
  play: { pre: "pl", answer: "ay", post: "", wrong: ["ai", "ey"], ja: "あそぶ", note: "ay は ことばの さいごで「エイ」（play・day・say）" },
  dream: { pre: "dr", answer: "ea", post: "m", wrong: ["ee", "ie"], ja: "ゆめ", note: "ea も ee も「イー」。dream は ea（read・team とおなじ）" },
  green: { pre: "gr", answer: "ee", post: "n", wrong: ["ea", "ie"], ja: "みどり", note: "ee は「イー」（green・tree・see）" },
  boat: { pre: "b", answer: "oa", post: "t", wrong: ["ow", "oe"], ja: "ボート", note: "oa は ことばの まんなかで「オウ」（boat・coat・road）" },
  snow: { pre: "sn", answer: "ow", post: "", wrong: ["oa", "ou"], ja: "雪", note: "ow は ことばの さいごで「オウ」（snow・show・grow）" },
  light: { pre: "l", answer: "igh", post: "t", wrong: ["ie", "y"], ja: "光", note: "igh は「アイ」。gh は よまない（light・night・high）" },
  shirt: { pre: "sh", answer: "ir", post: "t", wrong: ["ur", "er"], ja: "シャツ", note: "ir・ur・er は おなじ 音。shirt は ir（bird・girl とおなじ）" },
  phone: { pre: "", answer: "ph", post: "one", wrong: ["f", "gh"], ja: "電話", note: "ph は f の 音（phone・photo・dolphin）" },
  knee: { pre: "", answer: "kn", post: "ee", wrong: ["n", "gn"], ja: "ひざ", note: "kn の k は よまない（knee・know・knock）" },
  wrong: { pre: "", answer: "wr", post: "ong", wrong: ["r", "rh"], ja: "まちがった", note: "wr の w は よまない（wrong・write・wrap）" },
  thumb: { pre: "thu", answer: "mb", post: "", wrong: ["m", "mm"], ja: "親指", note: "mb の b は よまない（thumb・climb・lamb）" },
};

export interface SpellQuestion {
  word: string;
  pre: string;
  post: string;
  ja: string;
  note: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある つづりの まとめの 問題。表に なければ null */
export function spellReviewOf(word: string): SpellQuestion | null {
  const w = norm(word);
  const x = own(SPELLS, w);
  if (!x) return null;
  return { word: w, pre: x.pre, post: x.post, ja: x.ja, note: x.note, answer: x.answer, wrong: x.wrong };
}

export function spellReviewDisplay(q: SpellQuestion): string {
  return `${q.pre}＿＿${q.post}（${q.ja}）`;
}

export function spellReviewWhy(q: SpellQuestion): string {
  return `${q.word}（${q.ja}）。${q.note}。1 年生の ころから ならった つづりの きまりだよ。`;
}

// ---------------------------------------------------------------------------
// ことばの パーツの まとめ（ステージ3 の 接頭辞・接尾辞）
// ---------------------------------------------------------------------------

/** ことば → パーツ（つなげると ことば）・＿＿ に する パーツ・まちがい 2つ・いみ・こつ */
const PARTS: Record<string, { parts: string[]; blank: number; wrong: [string, string]; ja: string; note: string }> = {
  unhappy: { parts: ["un", "happy"], blank: 0, wrong: ["dis", "re"], ja: "しあわせ でない", note: "un は「～でない」" },
  rewrite: { parts: ["re", "write"], blank: 0, wrong: ["un", "dis"], ja: "書きなおす", note: "re は「もう いちど」" },
  preview: { parts: ["pre", "view"], blank: 0, wrong: ["un", "dis"], ja: "まえもって 見る・予告", note: "pre は「まえに」" },
  dislike: { parts: ["dis", "like"], blank: 0, wrong: ["pre", "im"], ja: "きらう", note: "dis は「はんたい」" },
  careful: { parts: ["care", "ful"], blank: 1, wrong: ["ness", "ment"], ja: "ちゅういぶかい", note: "-ful は「～で いっぱい」（l は 1つ）" },
  careless: { parts: ["care", "less"], blank: 1, wrong: ["ness", "ment"], ja: "ふちゅういな", note: "-less は「～が ない」" },
  kindness: { parts: ["kind", "ness"], blank: 1, wrong: ["ment", "ful"], ja: "やさしさ", note: "-ness で「ようす」の ことばに なる" },
  quickly: { parts: ["quick", "ly"], blank: 1, wrong: ["ful", "ness"], ja: "すばやく", note: "-ly で「どんなふうに」の ことばに なる" },
  movement: { parts: ["move", "ment"], blank: 1, wrong: ["ness", "tion"], ja: "うごき", note: "-ment で「こと・もの」の ことばに なる（move の e は のこす）" },
  invention: { parts: ["invent", "ion"], blank: 1, wrong: ["ment", "ness"], ja: "発明", note: "invent（発明する）＋ -ion で「発明」" },
  comfortable: { parts: ["comfort", "able"], blank: 1, wrong: ["ful", "ness"], ja: "ここちよい", note: "-able は「～できる・～に むいて いる」" },
  impossible: { parts: ["im", "possible"], blank: 0, wrong: ["un", "dis"], ja: "できない・ありえない", note: "p の まえでは in が im に なる（im ＋ possible）" },
};

export interface PartsQuestion {
  word: string;
  parts: string[];
  blank: number;
  ja: string;
  note: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある ことばの パーツの まとめの 問題。表に なければ null */
export function partsReviewOf(word: string): PartsQuestion | null {
  const w = norm(word);
  const x = own(PARTS, w);
  if (!x) return null;
  return { word: w, parts: x.parts, blank: x.blank, ja: x.ja, note: x.note, answer: x.parts[x.blank], wrong: x.wrong };
}

export function partsReviewDisplay(q: PartsQuestion): string {
  return `${q.parts.map((p, i) => (i === q.blank ? "＿＿" : p)).join(" ＋ ")}（${q.ja}）`;
}

export function partsReviewWhy(q: PartsQuestion): string {
  return `${q.word}（${q.ja}）＝ ${q.parts.join(" ＋ ")}。${q.note}。パーツが わかれば はじめて 見る ことばも いみが よめるよ。`;
}

// ---------------------------------------------------------------------------
// 語根の まとめ（ステージ4 の 語根）
// ---------------------------------------------------------------------------

/** ことば → 語根・語根の いみ・ことばの いみ・おなじ 語根の なかま・まちがい 2つ（ちがう 語根の ことば） */
const ROOTS: Record<string, { root: string; rootJa: string; ja: string; answer: string; wrong: [string, string] }> = {
  inspect: { root: "spect", rootJa: "見る", ja: "しらべる", answer: "spectator", wrong: ["structure", "export"] },
  construct: { root: "struct", rootJa: "たてる", ja: "たてる・組み立てる", answer: "structure", wrong: ["dictionary", "reject"] },
  predict: { root: "dict", rootJa: "いう", ja: "予想する", answer: "dictionary", wrong: ["spectator", "vision"] },
  erupt: { root: "rupt", rootJa: "こわれる・われる", ja: "ふん火する", answer: "interrupt", wrong: ["project", "audio"] },
  project: { root: "ject", rootJa: "なげる", ja: "うつす・計画", answer: "reject", wrong: ["export", "telescope"] },
  transport: { root: "port", rootJa: "はこぶ", ja: "はこぶ", answer: "export", wrong: ["scribble", "interrupt"] },
  visible: { root: "vis", rootJa: "見る", ja: "目に 見える", answer: "vision", wrong: ["audio", "structure"] },
  describe: { root: "scrib", rootJa: "書く", ja: "せつめいする", answer: "scribble", wrong: ["telescope", "dictionary"] },
  audience: { root: "aud", rootJa: "きく", ja: "聞く 人たち・観客", answer: "audio", wrong: ["vision", "reject"] },
  telephone: { root: "tele", rootJa: "とおく", ja: "電話", answer: "telescope", wrong: ["export", "spectator"] },
  paragraph: { root: "graph", rootJa: "書く・えがく", ja: "段落", answer: "autograph", wrong: ["scribble", "interrupt"] },
  geography: { root: "geo", rootJa: "地球・土地", ja: "地理", answer: "geology", wrong: ["telescope", "audio"] },
};

export interface RootQuestion {
  word: string;
  root: string;
  rootJa: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 語根の まとめの 問題。表に なければ null */
export function rootReviewOf(word: string): RootQuestion | null {
  const w = norm(word);
  const x = own(ROOTS, w);
  if (!x) return null;
  return { word: w, root: x.root, rootJa: x.rootJa, ja: x.ja, answer: x.answer, wrong: x.wrong };
}

export function rootReviewDisplay(q: RootQuestion): string {
  return `${q.word}（${q.ja}）`;
}

export function rootReviewWhy(q: RootQuestion): string {
  return `${q.word} と ${q.answer} は どちらも ${q.root}（${q.rootJa}）の なかま。語根を 知って いると、長い ことばも いみが 見えて くるよ。`;
}

// ---------------------------------------------------------------------------
// スピーチの 間（プロソディの まとめ）
// ---------------------------------------------------------------------------

/** はじめの フレーズ → コンマの ない 文・間を とる ことば・まちがい 2つ（どれも 文の なかの ことば）・よみかた */
const PAUSES: Record<string, { sentence: string; after: string; wrong: [string, string]; say: string }> = {
  "Six years ago": { sentence: "Six years ago I didn't know any English.", after: "ago", wrong: ["years", "didn't"], say: "six years aGO ‖" },
  "Good morning everyone": { sentence: "Good morning everyone today is a special day.", after: "everyone", wrong: ["morning", "today"], say: "good morning EVeryone ‖" },
  "When I was six": { sentence: "When I was six I could only say hello.", after: "six", wrong: ["was", "could"], say: "when I was SIX ‖" },
  "At first": { sentence: "At first English was really hard for me.", after: "first", wrong: ["really", "was"], say: "at FIRST ‖" },
  "After a while": { sentence: "After a while I could read whole books.", after: "while", wrong: ["after", "could"], say: "after a WHILE ‖" },
  "Most of all": { sentence: "Most of all I want to thank my friends.", after: "all", wrong: ["of", "want"], say: "most of ALL ‖" },
  "Thanks to you": { sentence: "Thanks to you I never gave up.", after: "you", wrong: ["thanks", "never"], say: "thanks to YOU ‖" },
  "In the future": { sentence: "In the future I'd like to travel the world.", after: "future", wrong: ["the", "like"], say: "in the FUture ‖" },
  "No matter what": { sentence: "No matter what we will keep learning.", after: "what", wrong: ["matter", "keep"], say: "no matter WHAT ‖" },
  "Before I finish": { sentence: "Before I finish I have one more thing to say.", after: "finish", wrong: ["before", "have"], say: "before I FINish ‖" },
  "Looking back": { sentence: "Looking back I'm proud of our journey.", after: "back", wrong: ["looking", "proud"], say: "looking BACK ‖" },
  Together: { sentence: "Together we can do anything.", after: "together", wrong: ["we", "can"], say: "toGETHer ‖" },
};
const PAUSE_KEYS: Record<string, string> = Object.fromEntries(Object.keys(PAUSES).map((k) => [norm(k), k]));

export interface PauseQuestion {
  phrase: string;
  sentence: string;
  /** 間の ところに コンマを 入れた 文（読み上げ・せつめい） */
  spoken: string;
  say: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある スピーチの 間の 問題。表に なければ null */
export function pauseReviewOf(phrase: string): PauseQuestion | null {
  const k = own(PAUSE_KEYS, norm(phrase));
  if (!k) return null;
  const x = PAUSES[k];
  const spoken = `${k},${x.sentence.slice(k.length)}`;
  return { phrase: k, sentence: x.sentence, spoken, say: x.say, answer: x.after, wrong: x.wrong };
}

export function pauseReviewDisplay(q: PauseQuestion): string {
  return q.sentence;
}

export function pauseReviewWhy(q: PauseQuestion): string {
  return `${q.spoken} ― ${q.answer} の あとで ひと休み（${q.say}）。スピーチでは はじめの まとまりの あとに 間を とって、聞く 人の 顔を 見ると、気持ちが つたわるよ。`;
}

// ---------------------------------------------------------------------------
// 苦手な 音の 総点検（聞きわけ）
// ---------------------------------------------------------------------------

/** ことば → にて いる ことば 2つ・どの 音か・こつ */
const SOUNDS: Record<string, { wrong: [string, string]; pair: string; tip: string }> = {
  right: { wrong: ["light", "night"], pair: "R と L", tip: "R は したを どこにも つけない。L は したの さきを 上の 歯の うらに つける" },
  read: { wrong: ["lead", "need"], pair: "R と L", tip: "R は くちびるを すこし まるめて、したを どこにも つけない" },
  very: { wrong: ["berry", "merry"], pair: "V と B", tip: "V は 上の 歯を 下の くちびるに かるく あてて ふるわせる" },
  vest: { wrong: ["best", "west"], pair: "V と B", tip: "V は 歯と くちびる、B は くちびるを とじて ぱっと ひらく" },
  think: { wrong: ["sink", "pink"], pair: "TH と S", tip: "TH は したの さきを 上と 下の 歯で かるく はさむ" },
  three: { wrong: ["free", "tree"], pair: "TH と F・T", tip: "TH は したを 歯で はさんで いきを だす" },
  she: { wrong: ["see", "tea"], pair: "SH と S", tip: "SH は くちびるを まるく つきだして シー" },
  fall: { wrong: ["hall", "ball"], pair: "F と H", tip: "F は 上の 歯を 下の くちびるに あてる。H は のどから いきだけ" },
  hat: { wrong: ["hut", "hot"], pair: "a の 音", tip: "hat の a は 口を よこに 大きく あけて「ア」と「エ」の あいだ" },
  world: { wrong: ["word", "wild"], pair: "ER と L", tip: "world は wor（ER の 音）の あとに L を わすれずに、さいごに d" },
  walk: { wrong: ["work", "woke"], pair: "AW と ER", tip: "walk は 口を たてに あけて「オー」（l は よまない）。work は ER の 音" },
  heard: { wrong: ["hard", "head"], pair: "ER と AR", tip: "heard は ER の 音（bird と おなじ）。hard は 口を 大きく あける AR" },
};

export interface SoundQuestion {
  word: string;
  pair: string;
  tip: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 苦手な 音の 問題。表に なければ null */
export function soundCheckOf(word: string): SoundQuestion | null {
  const w = norm(word);
  const x = own(SOUNDS, w);
  if (!x) return null;
  return { word: w, pair: x.pair, tip: x.tip, answer: w, wrong: x.wrong };
}

export function soundCheckDisplay(q: SoundQuestion): string {
  return `🔊（${q.pair}）`;
}

export function soundCheckWhy(q: SoundQuestion): string {
  return `きこえたのは ${q.word}（${q.wrong.join("・")} では ない）。${q.tip}。にて いる 音を くらべて、自分の 口でも いって みよう。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w40FocusOf(word: string): string | null {
  const s = spellReviewOf(word);
  if (s) return s.word;
  const p = partsReviewOf(word);
  if (p) return p.word;
  const r = rootReviewOf(word);
  if (r) return r.word;
  const a = pauseReviewOf(word);
  if (a) return a.phrase.toLowerCase();
  const o = soundCheckOf(word);
  if (o) return o.word;
  return null;
}

/**
 * その回の ことばが ワールド40 の 回の ものか（ことばが 2こ いじょうで、ぜんぶ ワールド40 の 表に ある）。
 * （L1170 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW40Words(words: readonly string[]): boolean {
  return words.length >= 2 && words.every((w) => w40FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド40）。その focus の ことば・フレーズを よむ。
 * 英字・スペース・アポストロフィ だけ。あてはまらなければ null
 */
export function w40Say(focus: string, words: readonly string[]): string | null {
  if (!isW40Words(words)) return null;
  const w = words.find((x) => w40FocusOf(x) === focus);
  if (!w) return null;
  return w.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド40）。あてはまらなければ null */
export function w40Example(focus: string, words: readonly string[]): string | null {
  return w40Say(focus, words);
}
