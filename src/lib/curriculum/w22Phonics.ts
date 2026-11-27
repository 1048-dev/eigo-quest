/**
 * ワールド22（こはくの図書館・L631〜660・ステージ3）の フォニックス・つづり（形態素の つづき）の表。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 人を あらわす -er / -or / -ist（writer, actor, artist）: 「〜する 人を あらわす ことばは？」（write → ？（さっか）→ writer / writor / writist）
 * - 語の家族（act / action / actor / active）: 「act の かぞくで「はいゆう」は どれ？」（action / actor / active）
 * - あいまい母音と 強勢（a-SLEEP, PEN-cil, SEC-ond）: 「よわい「ア」の ところに はいる もじは？」（PEN・cil → penc＿l → i / u / a / e）
 * - -ous / -al（famous, dangerous, magical）: 「ようすの ことばに すると？」（danger → ？（きけんな）→ dangerous / dangeral / dangerus）
 * - 文の おわりの しるし（Help! / Who are you?）: 「おわりに つける しるしは？」（Who are you ＿ → ? / ! / .）
 *
 * focus の かきかた: "-er" "-or" "-ist"、語の家族は もとの ことば（"act" "invent" "protect" "direct"）、
 * あいまい母音は はくで わけた 形（"pen-cil"）、"-ous" "-al"、しるしの 回は フレーズ そのもの（"Who are you"）。
 * どれも 表に ある ことばだけ 出題する（focus の もじが 入っていても 表に なければ 出さない）。
 */

/** ワールド22 が はじまる レッスン（それより前の 回では ワールド22 の 問題に しない） */
export const W22_START = 631;

export const W22_PERSON_FOCUS = ["-er", "-or", "-ist"] as const;
export const W22_FAMILY_FOCUS = ["act", "invent", "protect", "direct"] as const;
export const W22_ADJ_FOCUS = ["-ous", "-al"] as const;

// ---------------------------------------------------------------------------
// 人を あらわす -er / -or / -ist
// ---------------------------------------------------------------------------

export type PersonKind = "er" | "or" | "ist";

/** 人の ことば → もとの ことば・いみ（まちがいの 選択肢は ほかの 2つの おわり。どれも ほんとうには ない ことば） */
const PERSON: Record<string, { base: string; baseMeaning: string; meaning: string }> = {
  // -er（いちばん おおい）
  writer: { base: "write", baseMeaning: "かく", meaning: "さっか・かく 人" },
  reader: { base: "read", baseMeaning: "よむ", meaning: "よむ 人・どくしゃ" },
  painter: { base: "paint", baseMeaning: "えを かく", meaning: "がか" },
  teacher: { base: "teach", baseMeaning: "おしえる", meaning: "せんせい" },
  dancer: { base: "dance", baseMeaning: "おどる", meaning: "ダンサー" },
  singer: { base: "sing", baseMeaning: "うたう", meaning: "かしゅ" },
  explorer: { base: "explore", baseMeaning: "たんけんする", meaning: "たんけんか" },
  // -or（t で おわる ことばに おおい。sailor・visitor・inventor は べつの つづりも あるので 入れない）
  actor: { base: "act", baseMeaning: "えんじる", meaning: "はいゆう" },
  editor: { base: "edit", baseMeaning: "へんしゅうする", meaning: "へんしゅうしゃ" },
  narrator: { base: "narrate", baseMeaning: "ものがたる", meaning: "ナレーター・かたりて" },
  illustrator: { base: "illustrate", baseMeaning: "さしえを かく", meaning: "さしえの がか・イラストレーター" },
  creator: { base: "create", baseMeaning: "つくりだす", meaning: "つくった 人・つくりて" },
  // -ist（もの・ぶんやの ことばに つける）
  artist: { base: "art", baseMeaning: "げいじゅつ・え", meaning: "げいじゅつか" },
  cartoonist: { base: "cartoon", baseMeaning: "まんが", meaning: "まんがか" },
  novelist: { base: "novel", baseMeaning: "しょうせつ", meaning: "しょうせつか" },
  guitarist: { base: "guitar", baseMeaning: "ギター", meaning: "ギターを ひく 人" },
  violinist: { base: "violin", baseMeaning: "バイオリン", meaning: "バイオリンを ひく 人" },
};

export const PERSON_KINDS: readonly PersonKind[] = ["er", "or", "ist"];

export interface PersonQuestion {
  kind: PersonKind;
  base: string;
  answer: string;
  /** まちがいの 選択肢（ほかの 2つの おわり） */
  wrong: [string, string];
  baseMeaning: string;
  meaning: string;
}

/** 表に ある 人の ことばの 問題。表に なければ null */
export function personOf(word: string): PersonQuestion | null {
  const w = word.toLowerCase();
  const p = PERSON[w];
  if (!p) return null;
  const kind: PersonKind = w.endsWith("ist") ? "ist" : w.endsWith("or") ? "or" : "er";
  // e で おわる ことばは e を とってから つける（write → writ ＋ er）
  const stem = p.base.endsWith("e") ? p.base.slice(0, -1) : p.base;
  const others = PERSON_KINDS.filter((k) => k !== kind).map((k) => stem + k) as [string, string];
  return { kind, base: p.base, answer: w, wrong: others, baseMeaning: p.baseMeaning, meaning: p.meaning };
}

export function personWhy(q: PersonQuestion): string {
  const tail: Record<PersonKind, string> = {
    er: "-er が いちばん おおい「〜する 人」の おわり。",
    or: "-or は act・edit・narrate の ような t の おとで おわる ことばに おおい「〜する 人」の おわり。",
    ist: "-ist は art・cartoon・guitar の ような もの・ぶんやの ことばに つけて「それを する 人」に する おわり。",
  };
  const e = q.base.endsWith("e") ? `${q.base} の おわりの e は とってから つけるよ。` : "";
  return `${q.base}（${q.baseMeaning}）→ ${q.answer}（${q.meaning}）。${tail[q.kind]}${e}`;
}

// ---------------------------------------------------------------------------
// 語の家族（act / action / actor / active）
// ---------------------------------------------------------------------------

/** かぞくの もとの ことば → もとの いみと メンバー（ことば → いみ）。パーツの はたらきは FAMILY_PART */
const FAMILY: Record<string, { baseMeaning: string; members: Record<string, string> }> = {
  act: { baseMeaning: "する・えんじる", members: { action: "こうどう・うごき", actor: "はいゆう", active: "かっぱつな・よく うごく", activity: "かつどう" } },
  invent: { baseMeaning: "はつめいする", members: { invention: "はつめい・はつめいした もの", inventor: "はつめいか", inventive: "はつめいの さいのうが ある" } },
  protect: { baseMeaning: "まもる", members: { protection: "まもる こと", protector: "まもる 人", protective: "まもろうと する" } },
  direct: { baseMeaning: "ちょくせつの・あんないする", members: { direction: "ほうこう", director: "かんとく", directly: "ちょくせつ・まっすぐに" } },
};

/** おわりの パーツの はたらき */
export const FAMILY_PART: Record<string, string> = {
  ion: "こと・もの（なまえの ことば）", or: "人", ive: "ようす（〜な）", ity: "こと（なまえの ことば）", ly: "やりかた（〜に）",
};

export interface FamilyQuestion {
  root: string;
  answer: string;
  /** 選択肢（answer を ふくむ 3つ。きまった 順。もとの ことばも まちがいに つかう） */
  choices: string[];
  meaning: string;
  baseMeaning: string;
  /** かぞくの メンバー（ことば → いみ） */
  members: Record<string, string>;
}

/**
 * 表に ある 語の家族の ことばの 問題。focus（もとの ことば）の 順に、ことばの かぞくを えらぶ。
 * あてはまらなければ null
 */
export function familyOf(word: string, focus: readonly string[]): FamilyQuestion | null {
  const w = word.toLowerCase();
  const root = focus.map((f) => f.toLowerCase()).find((f) => FAMILY[f]?.members[w]);
  if (!root) return null;
  const fam = FAMILY[root];
  const others = [...Object.keys(fam.members).filter((m) => m !== w), root];
  return { root, answer: w, choices: [w, ...others].slice(0, 3), meaning: fam.members[w], baseMeaning: fam.baseMeaning, members: fam.members };
}

/** おわりの パーツ（action → ion、actor → or、activity → ity） */
export function familyEnding(root: string, word: string): string {
  const rest = word.slice(root.length);
  return Object.keys(FAMILY_PART).sort((a, b) => b.length - a.length).find((p) => rest.endsWith(p)) ?? rest;
}

export function familyWhy(q: FamilyQuestion): string {
  const list = Object.entries(q.members).map(([m, ja]) => `${m}（${ja}）`).join("・");
  const end = familyEnding(q.root, q.answer);
  return `${q.root}（${q.baseMeaning}）の かぞく: ${list}。おわりの ${end} は「${FAMILY_PART[end]}」に する パーツ。もとの ことばが わかると、かぞくの ことばも わかるよ。`;
}

// ---------------------------------------------------------------------------
// あいまい母音と 強勢
// ---------------------------------------------------------------------------

/** あいまい母音の ことば → はくの まとまり・つよく よむ はく・よわい「ア」の もじの いち・いみ */
const SCHWA: Record<string, { syllables: string; stress: number; at: number; meaning: string }> = {
  // はじめの a（ものがたりの ことば）
  asleep: { syllables: "a-sleep", stress: 1, at: 0, meaning: "ねむって" }, awake: { syllables: "a-wake", stress: 1, at: 0, meaning: "おきて" },
  around: { syllables: "a-round", stress: 1, at: 0, meaning: "まわりに" }, across: { syllables: "a-cross", stress: 1, at: 0, meaning: "よこぎって" },
  // i・o も よわい「ア」に なる（lesson は lessen と おなじ おとなので 入れない）
  pencil: { syllables: "pen-cil", stress: 0, at: 4, meaning: "えんぴつ" }, second: { syllables: "sec-ond", stress: 0, at: 3, meaning: "2ばんめ・びょう" },
  dragon: { syllables: "drag-on", stress: 0, at: 4, meaning: "ドラゴン" }, button: { syllables: "but-ton", stress: 0, at: 4, meaning: "ボタン" },
  // e・u も
  problem: { syllables: "prob-lem", stress: 0, at: 5, meaning: "もんだい" }, children: { syllables: "chil-dren", stress: 0, at: 6, meaning: "こどもたち" },
  circus: { syllables: "cir-cus", stress: 0, at: 4, meaning: "サーカス" }, happen: { syllables: "hap-pen", stress: 0, at: 4, meaning: "おこる" },
  // ものがたりの 登場人物
  giant: { syllables: "gi-ant", stress: 0, at: 2, meaning: "きょじん" }, lion: { syllables: "li-on", stress: 0, at: 2, meaning: "ライオン" },
  pilot: { syllables: "pi-lot", stress: 0, at: 3, meaning: "パイロット" }, wizard: { syllables: "wiz-ard", stress: 0, at: 3, meaning: "まほうつかい" },
};

export interface SchwaStressQuestion {
  display: string;
  answer: string;
  choices: string[];
  /** つよい はくを 大文字に した 形（PEN・cil） */
  stressed: string;
  meaning: string;
}

/** 表に ある ことばを、つよい はくを 大文字に して、よわい「ア」の もじを ＿ に した 形（pencil → penc＿l）。表に なければ null */
export function schwaStressBlank(word: string): SchwaStressQuestion | null {
  const w = word.toLowerCase();
  const s = SCHWA[w];
  if (!s) return null;
  const answer = w[s.at];
  const choices = [answer, ...["u", "a", "e", "o", "i"].filter((x) => x !== answer)].slice(0, 4);
  const stressed = s.syllables.split("-").map((p, i) => (i === s.stress ? p.toUpperCase() : p)).join("・");
  return { display: `${w.slice(0, s.at)}＿${w.slice(s.at + 1)}（${stressed}・${s.meaning}）`, answer, choices, stressed, meaning: s.meaning };
}

export function schwaStressWhy(word: string, q: SchwaStressQuestion): string {
  return `${word} は ${q.stressed} と、大きい もじの ところを つよく よむ。つよく ない ところの ぼいんは、あいまいな「ア」（ə）に なりやすい。おとは「ア」でも つづりは ${q.answer} だよ。`;
}

// ---------------------------------------------------------------------------
// -ous / -al
// ---------------------------------------------------------------------------

export type AdjKind = "ous" | "al";
export type AdjTrap = "drop-e" | "y-to-i" | "ous-not-us" | "al-not-le";

const ADJ: Record<string, { base: string; baseMeaning: string; meaning: string }> = {
  // -ous（nervous・humorous は もう 1つの おわりで ほんとうに ある ことばに なるので 入れない）
  famous: { base: "fame", baseMeaning: "めいせい", meaning: "ゆうめいな" },
  dangerous: { base: "danger", baseMeaning: "きけん", meaning: "きけんな" },
  poisonous: { base: "poison", baseMeaning: "どく", meaning: "どくの ある" },
  adventurous: { base: "adventure", baseMeaning: "ぼうけん", meaning: "ぼうけんずきな" },
  mysterious: { base: "mystery", baseMeaning: "なぞ", meaning: "なぞの・ふしぎな" },
  joyous: { base: "joy", baseMeaning: "よろこび", meaning: "よろこびに みちた" },
  envious: { base: "envy", baseMeaning: "うらやましさ", meaning: "うらやましがる" },
  // -al
  magical: { base: "magic", baseMeaning: "まほう", meaning: "まほうの・ふしぎな" },
  musical: { base: "music", baseMeaning: "おんがく", meaning: "おんがくの" },
  natural: { base: "nature", baseMeaning: "しぜん", meaning: "しぜんの" },
  personal: { base: "person", baseMeaning: "ひと", meaning: "こじんの・じぶんだけの" },
  seasonal: { base: "season", baseMeaning: "きせつ", meaning: "きせつの" },
  original: { base: "origin", baseMeaning: "はじまり", meaning: "オリジナルの・さいしょの" },
};

export interface AdjQuestion {
  kind: AdjKind;
  base: string;
  answer: string;
  /** まちがいの 選択肢（もう 1つの おわり・つづりの まちがい） */
  wrong: [string, string];
  trap: AdjTrap;
  baseMeaning: string;
  meaning: string;
}

/** 表に ある -ous / -al の ことばの 問題。表に なければ null */
export function adjOf(word: string): AdjQuestion | null {
  const w = word.toLowerCase();
  const a = ADJ[w];
  if (!a) return null;
  const kind: AdjKind = w.endsWith("ous") ? "ous" : "al";
  const stem = w.slice(0, -kind.length); // famous → fam、mysterious → mysteri、magical → magic
  const other = stem + (kind === "ous" ? "al" : "ous");
  let trap: AdjTrap;
  let misspelt: string;
  if (/[^aeiou]y$/.test(a.base)) { trap = "y-to-i"; misspelt = `${a.base}${kind}`; } // mystery → mysteryous
  else if (a.base.endsWith("e")) { trap = "drop-e"; misspelt = `${a.base}${kind}`; } // fame → fameous、nature → natureal
  else if (kind === "ous") { trap = "ous-not-us"; misspelt = `${stem}us`; } // danger → dangerus
  else { trap = "al-not-le"; misspelt = `${stem}le`; } // magic → magicle
  return { kind, base: a.base, answer: w, wrong: [other, misspelt], trap, baseMeaning: a.baseMeaning, meaning: a.meaning };
}

export function adjWhy(q: AdjQuestion): string {
  const tail: Record<AdjTrap, string> = {
    "drop-e": `${q.base} の おわりの e は とってから つけるよ。`,
    "y-to-i": "しいん ＋ y で おわる ことばは y を i に かえて つけるよ。",
    "ous-not-us": "おとは「アス」でも つづりは o・u・s の 3もじ。",
    "al-not-le": "おとは「アル」でも つづりは a・l だよ（le では ない）。",
  };
  return `なまえの ことば（${q.base}＝${q.baseMeaning}）に ${q.kind} を つけると、ようすの ことば（${q.answer}＝${q.meaning}）に なる。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// 文の おわりの しるし（? と !）
// ---------------------------------------------------------------------------

export type EndMark = "?" | "!";

/** フレーズ → おわりの しるし・いみ（いみには ！ ？ を つけない。こたえが わかって しまうので）。「.」も いえる ことば（Thank you など）は 入れない */
const MARK: Record<string, { mark: EndMark; meaning: string }> = {
  "help": { mark: "!", meaning: "たすけて" },
  "watch out": { mark: "!", meaning: "あぶない" },
  "who's there": { mark: "?", meaning: "だれ" },
  "where are you": { mark: "?", meaning: "どこに いるの" },
  "wow": { mark: "!", meaning: "わあ" },
  "can you help me": { mark: "?", meaning: "てつだって くれる" },
  "oh no": { mark: "!", meaning: "たいへん" },
  "what happened": { mark: "?", meaning: "なにが あったの" },
  "hooray": { mark: "!", meaning: "ばんざい" },
  "who are you": { mark: "?", meaning: "あなたは だれ" },
  "look out": { mark: "!", meaning: "きを つけて" },
  "are you ok": { mark: "?", meaning: "だいじょうぶ" },
};

/** 選択肢（この 順） */
export const MARK_CHOICES = ["?", "!", "."] as const;

export interface MarkQuestion {
  phrase: string;
  answer: EndMark;
  meaning: string;
}

/** 表に ある フレーズの 問題。表に なければ null */
export function markOf(phrase: string): MarkQuestion | null {
  const p = phrase.toLowerCase().trim();
  const m = MARK[p];
  if (!m) return null;
  return { phrase: p, answer: m.mark, meaning: m.meaning };
}

export function markWhy(phrase: string, q: MarkQuestion): string {
  const sentence = phrase.charAt(0).toUpperCase() + phrase.slice(1) + q.answer;
  return q.answer === "?"
    ? `${sentence}（${q.meaning}）は しつもん なので「?」。よむ ときは きもちを こめて、きく ように よもう。`
    : `${sentence}（${q.meaning}）は さけぶ ことば・びっくりした きもち なので「!」。よむ ときは つよく、大きな こえで よもう。`;
}

/** フォーカスの ボタンの 読み上げ（ワールド22）。-ist・-ous・-al は その回の ことばで、しるしの 回は フレーズで よむ。あてはまらなければ null */
export function w22Say(focus: string, words: readonly string[]): string | null {
  const lw = (w: string) => w.toLowerCase();
  if (focus === "-ist") return words.find((w) => PERSON[lw(w)] && lw(w).endsWith("ist")) ?? null;
  if ((W22_ADJ_FOCUS as readonly string[]).includes(focus)) return words.find((w) => ADJ[lw(w)] && lw(w).endsWith(focus.slice(1))) ?? null;
  if (MARK[lw(focus)]) return focus;
  return null;
}
