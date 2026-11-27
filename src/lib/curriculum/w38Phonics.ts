/**
 * ワールド38（こころの高原・L1111〜1140・ステージ5）の フォニックス・つづりの表（気持ちの ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 気持ちの ことばの つづり: 「気持ちの ことばの つづり。ただしい つづりは どれ？」（I fell in front of everyone. I was so ＿＿. → embarrassed / embarassed / embarrased）
 * - 句動詞: 「気持ちの 句動詞。＿＿ に 入る ことばは どれ？」（Cheer ＿＿! You'll do better next time. → up / down / off）
 * - 共感の イントネーション: 「共感の イントネーション。この 返事は どんな 声で いう？」（Kiko: I dropped my ice cream. → Oh no… → ↘ ひくく・ゆっくり・やさしく）
 * - 気持ちの 慣用句: 「気持ちの 慣用句。＿＿ に 入る ことばは どれ？」（I'm over the ＿＿! → moon / sun / rain）
 * - 性格の ことば: 「性格の ことば。＿＿ に 入る おわりは どれ？」（help＿＿ → -ful / -ive / -ous）
 *
 * focus の かきかた:
 * - 気持ちの ことばは その ことば（"embarrassed"）。句動詞は その 句動詞（"cheer up"）。イントネーションは 返事の 小文字（"oh no"）。
 * - 慣用句は かぎに なる ことば（"moon"）。性格の ことばは "-ful" "-ive" "-ous"。
 * まちがいの 選択肢は 表に 手で 書く。
 */

/** ワールド38 が はじまる レッスン（それより前の 回では ワールド38 の 問題に しない） */
export const W38_START = 1111;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// 気持ちの ことばの つづり
// ---------------------------------------------------------------------------

/** ことば → 文（＿＿ に 入る）・いみ・まちがいの つづり 2つ・つづりの こつ */
const FEELINGS: Record<string, { sentence: string; ja: string; wrong: [string, string]; tip: string }> = {
  embarrassed: { sentence: "I fell in front of everyone. I was so ＿＿.", ja: "はずかしい", wrong: ["embarassed", "embarrased"], tip: "r が 2つ、s も 2つ（emba・rr・a・ss・ed）" },
  frustrated: { sentence: "I tried ten times, and it still didn't work. I'm so ＿＿!", ja: "（うまく いかなくて）イライラ", wrong: ["frusterated", "frustratted"], tip: "frus ＋ trat ＋ ed。ter では なく tra、t は 1つずつ" },
  relieved: { sentence: "The lost puppy came home, and everyone felt ＿＿.", ja: "ほっと した", wrong: ["releived", "releaved"], tip: "i が 先、e が あと（rel・ie・ved）" },
  annoyed: { sentence: "My little brother keeps poking me. I'm a bit ＿＿.", ja: "ちょっと イライラ", wrong: ["anoyed", "annoied"], tip: "n が 2つ。oy の あとに ed" },
  anxious: { sentence: "I have a big test tomorrow, so I feel ＿＿.", ja: "しんぱい・そわそわ", wrong: ["anxous", "ancious"], tip: "x の あとに ious（アンクシャス）" },
  disappointed: { sentence: "It rained, and the picnic was canceled. We were ＿＿.", ja: "がっかり", wrong: ["dissapointed", "disapointed"], tip: "dis ＋ appoint ＋ ed。s は 1つ、p は 2つ" },
  jealous: { sentence: "My friend got a new bike, and I felt a little ＿＿.", ja: "うらやましい・やきもち", wrong: ["jelous", "jealus"], tip: "ea で「エ」の 音。おわりは -ous" },
  confused: { sentence: "The directions were so hard that I felt ＿＿.", ja: "わけが わからない", wrong: ["confussed", "confuzed"], tip: "f も s も 1つ。z では なく s" },
  grateful: { sentence: "Thank you so much for helping me. I'm really ＿＿.", ja: "かんしゃ して いる", wrong: ["greatful", "gratefull"], tip: "great では なく grate。-ful の l は 1つ" },
  furious: { sentence: "He wasn't just angry. He was ＿＿!", ja: "かんかんに おこって いる", wrong: ["furius", "fureous"], tip: "fur ＋ ious（i を わすれない）" },
  lonely: { sentence: "My best friend moved away, and I felt ＿＿.", ja: "さびしい", wrong: ["lonley", "lonly"], tip: "lone ＋ ly。lone の e を のこす" },
  exhausted: { sentence: "We walked up the hills all day, and I was ＿＿.", ja: "くたくたに つかれた", wrong: ["exausted", "exhasted"], tip: "x の あとに 音の ない h。au で「オー」" },
};

export interface FeelingSpellQuestion {
  word: string;
  sentence: string;
  ja: string;
  tip: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 気持ちの ことばの つづりの 問題。表に なければ null */
export function feelingSpellOf(word: string): FeelingSpellQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(FEELINGS, w);
  if (!x) return null;
  return { word: w, sentence: x.sentence, ja: x.ja, tip: x.tip, answer: w, wrong: x.wrong };
}

export function feelingSpellDisplay(q: FeelingSpellQuestion): string {
  return `${q.sentence}（${q.ja}）`;
}

export function feelingSpellWhy(q: FeelingSpellQuestion): string {
  return `${q.answer}（${q.ja}）。${q.tip}。${q.wrong.join("・")} は よく ある まちがいの つづりだよ。気持ちの ことばは 手紙や 日記で よく つかうから、つづりも おぼえよう。`;
}

// ---------------------------------------------------------------------------
// 句動詞（音の つながりと つよさ）
// ---------------------------------------------------------------------------

/** 句動詞 → 文（＿＿ に 小さな ことば）・答え・いみ・まちがい 2つ・音の つながり */
const PHRASALS: Record<string, { sentence: string; answer: string; ja: string; wrong: [string, string]; sound: string }> = {
  "cheer up": { sentence: "Cheer ＿＿! You'll do better next time.", answer: "up", ja: "げんきを 出す", wrong: ["down", "off"], sound: "cheer‿up（チアラップ。up を つよく）" },
  "calm down": { sentence: "Take a deep breath and calm ＿＿.", answer: "down", ja: "おちつく", wrong: ["up", "out"], sound: "calm DOWN（l は 音が ない。down を つよく）" },
  "make up": { sentence: "They had a fight, but they made ＿＿ the next day.", answer: "up", ja: "なかなおり する", wrong: ["out", "off"], sound: "make‿up（メイカップ。up を つよく）" },
  "look up to": { sentence: "I look ＿＿ my aunt because she's so patient.", answer: "up to", ja: "（あこがれて）そんけい する", wrong: ["down on", "out for"], sound: "look‿up to（ルッカップ トゥ。up を つよく）" },
  "let down": { sentence: "I promised to help, and I don't want to let my team ＿＿.", answer: "down", ja: "がっかり させる", wrong: ["up", "in"], sound: "let DOWN（down を つよく）" },
  "get over": { sentence: "It took her a few days to get ＿＿ losing the game.", answer: "over", ja: "（かなしい ことから）たちなおる", wrong: ["up", "off"], sound: "get‿over（ゲトウヴァー。over を つよく）" },
  "open up": { sentence: "After a while, Kiko opened ＿＿ and told us how she felt.", answer: "up", ja: "心を ひらいて 話す", wrong: ["down", "off"], sound: "open‿up（オウプナップ。up を つよく）" },
  "count on": { sentence: "You can count ＿＿ me. I'll always help you.", answer: "on", ja: "たよる・あてに する", wrong: ["up", "off"], sound: "count‿on（カウントン。count を つよく）" },
  "stand up for": { sentence: "It takes courage to stand ＿＿ a friend.", answer: "up for", ja: "（友だちの）みかたを する", wrong: ["down on", "out of"], sound: "stand‿up for（スタンダップ フォー。up を つよく）" },
  "put up with": { sentence: "I can't put ＿＿ this noise any longer!", answer: "up with", ja: "がまん する", wrong: ["down on", "out for"], sound: "put‿up with（プタップ ウィズ。up を つよく）" },
  "work out": { sentence: "Don't worry. I'm sure everything will work ＿＿.", answer: "out", ja: "うまく いく", wrong: ["up", "down"], sound: "work‿out（ワーカウト。out を つよく）" },
  "turn to": { sentence: "When I feel sad, I can always turn ＿＿ my grandma.", answer: "to", ja: "たよる・相談 する", wrong: ["off", "down"], sound: "TURN to（turn を つよく、to は かるく）" },
};

export interface PhrasalQuestion {
  phrase: string;
  sentence: string;
  ja: string;
  sound: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 句動詞の 問題（文 → 小さな ことば）。表に なければ null */
export function phrasalOf(phrase: string): PhrasalQuestion | null {
  const p = phrase.toLowerCase().trim().replace(/\s+/g, " ");
  const x = own(PHRASALS, p);
  if (!x) return null;
  return { phrase: p, sentence: x.sentence, ja: x.ja, sound: x.sound, answer: x.answer, wrong: x.wrong };
}

export function phrasalDisplay(q: PhrasalQuestion): string {
  return `${q.sentence}（${q.ja}）`;
}

export function phrasalWhy(q: PhrasalQuestion): string {
  return `${q.phrase}（${q.ja}）。いうときは ${q.sound}。おわりの 子音と つぎの 母音が つながって、小さな ことばを つよく いうのが 句動詞の リズムだよ（${q.wrong.join("・")} では いみが ちがう）。`;
}

// ---------------------------------------------------------------------------
// 共感の イントネーション
// ---------------------------------------------------------------------------

export type ToneKind = "sad" | "happy" | "ask";

/** 声の 出しかた（選択肢） */
export const TONE_LABEL: Record<ToneKind, string> = {
  sad: "↘ ひくく・ゆっくり・やさしく",
  happy: "↗↘ 高く・明るく・大きく",
  ask: "↗ さいごを 上げて きく",
};

/** 返事 → しゅるい・場面（友だちの ことば）・返事の かたち */
const TONES: Record<string, { kind: ToneKind; situation: string; reply: string }> = {
  "Oh no": { kind: "sad", situation: "Kiko: I dropped my ice cream on the ground.", reply: "Oh no…" },
  "That must be hard": { kind: "sad", situation: "Haru: My best friend moved to another town.", reply: "That must be hard." },
  "I'm so sorry": { kind: "sad", situation: "Riko: My painting got wet in the rain.", reply: "I'm so sorry." },
  "That's too bad": { kind: "sad", situation: "Birimo: It rained, so our picnic was canceled.", reply: "That's too bad." },
  "That's great": { kind: "happy", situation: "Riko: I passed my swimming test!", reply: "That's great!" },
  Congratulations: { kind: "happy", situation: "Haru: Our team won the final!", reply: "Congratulations!" },
  "Good for you": { kind: "happy", situation: "Kiko: I finally finished the whole book!", reply: "Good for you!" },
  "How wonderful": { kind: "happy", situation: "Birimo: My grandma is coming to visit!", reply: "How wonderful!" },
  Really: { kind: "ask", situation: "Haru: I saw a fox in the park this morning!", reply: "Really?" },
  "Are you OK": { kind: "ask", situation: "Riko: Ouch! I bumped my head.", reply: "Are you OK?" },
  "Is everything all right": { kind: "ask", situation: "Kiko looks sad and is very quiet today.", reply: "Is everything all right?" },
  "Did it hurt": { kind: "ask", situation: "Birimo: I fell off my bike yesterday.", reply: "Did it hurt?" },
};
const TONE_KEYS: Record<string, string> = Object.fromEntries(Object.keys(TONES).map((k) => [k.toLowerCase(), k]));

export interface ToneQuestion {
  phrase: string;
  kind: ToneKind;
  situation: string;
  reply: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 共感の 返事の 問題。表に なければ null */
export function toneOf(phrase: string): ToneQuestion | null {
  const k = own(TONE_KEYS, phrase.toLowerCase().trim());
  if (!k) return null;
  const x = TONES[k];
  const others = (Object.keys(TONE_LABEL) as ToneKind[]).filter((t) => t !== x.kind).map((t) => TONE_LABEL[t]) as [string, string];
  return { phrase: k, kind: x.kind, situation: x.situation, reply: x.reply, answer: TONE_LABEL[x.kind], wrong: others };
}

export function toneDisplay(q: ToneQuestion): string {
  return `${q.situation} → ${q.reply}`;
}

export function toneWhy(q: ToneQuestion): string {
  const why: Record<ToneKind, string> = {
    sad: "かなしい・こまった 話には、ひくく ゆっくり やさしい 声で、さいごを 下げて いうと 気持ちが つたわるよ。明るく 元気に いうと、ふざけて いる ように きこえて しまう。",
    happy: "うれしい 話には、高く 明るく、大きく 上がって 下がる 声で いうと「いっしょに よろこんで いる」と つたわるよ。ひくい 声だと うれしく なさそうに きこえる。",
    ask: "はい・いいえで こたえる しつもんで あいてを しんぱいしたり、びっくりして たしかめたり する ときは、さいごを 上げるよ。",
  };
  return `${q.reply} は「${q.answer}」。${why[q.kind]}`;
}

// ---------------------------------------------------------------------------
// 気持ちの 慣用句
// ---------------------------------------------------------------------------

/** 慣用句 → かぎの ことば・＿＿ の 文・いみ・まちがい 2つ */
const IDIOMS: Record<string, { key: string; blank: string; ja: string; wrong: [string, string] }> = {
  "over the moon": { key: "moon", blank: "I'm over the ＿＿!", ja: "とても うれしい", wrong: ["sun", "rain"] },
  "feel blue": { key: "blue", blank: "Rainy days make me feel ＿＿.", ja: "かなしい・ゆううつ", wrong: ["red", "green"] },
  "a piece of cake": { key: "cake", blank: "The test was a piece of ＿＿.", ja: "とても かんたん", wrong: ["bread", "rock"] },
  "butterflies in my stomach": { key: "butterflies", blank: "I have ＿＿ in my stomach before the show.", ja: "どきどき きんちょう して いる", wrong: ["bees", "frogs"] },
  "on cloud nine": { key: "cloud", blank: "She has been on ＿＿ nine since she won.", ja: "とても しあわせ", wrong: ["star", "hill"] },
  "break the ice": { key: "ice", blank: "Let's play a game to break the ＿＿.", ja: "（はじめての 人と）うちとける", wrong: ["glass", "door"] },
  "under the weather": { key: "weather", blank: "I'm feeling a bit under the ＿＿ today.", ja: "ちょっと ぐあいが わるい", wrong: ["table", "bridge"] },
  "keep your chin up": { key: "chin", blank: "Keep your ＿＿ up! You can do it.", ja: "元気を 出して・くじけないで", wrong: ["nose", "foot"] },
  "get cold feet": { key: "feet", blank: "Don't get cold ＿＿ now. You practiced so much!", ja: "（きゅうに）おじけづく", wrong: ["hands", "ears"] },
  "all ears": { key: "ears", blank: "Tell me everything. I'm all ＿＿.", ja: "しっかり きいて いるよ", wrong: ["eyes", "hands"] },
  "a heart of gold": { key: "gold", blank: "Grandma Rowan has a heart of ＿＿.", ja: "とても やさしい 心", wrong: ["stone", "ice"] },
  "lose your temper": { key: "temper", blank: "Try not to lose your ＿＿, even when you're annoyed.", ja: "かっと おこる", wrong: ["smile", "way"] },
};

export interface IdiomQuestion {
  phrase: string;
  key: string;
  blank: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 慣用句の 問題（＿＿ に 入る ことば）。表に なければ null */
export function idiomOf(phrase: string): IdiomQuestion | null {
  const p = phrase.toLowerCase().trim().replace(/\s+/g, " ");
  const x = own(IDIOMS, p);
  if (!x) return null;
  return { phrase: p, key: x.key, blank: x.blank, ja: x.ja, answer: x.key, wrong: x.wrong };
}

export function idiomDisplay(q: IdiomQuestion): string {
  return `${q.blank}（${q.ja}）`;
}

export function idiomWhy(q: IdiomQuestion): string {
  return `${q.phrase}（${q.ja}）。慣用句は ことばを 1つずつ 訳しても いみが わからない、まとまりの いいかた。まるごと おぼえて、気持ちを いきいきと つたえよう（${q.wrong.join("・")} では この いみに ならない）。`;
}

// ---------------------------------------------------------------------------
// 性格の ことば（-ful・-ive・-ous）
// ---------------------------------------------------------------------------

export type CharacterSuffix = "-ful" | "-ive" | "-ous";
const SUFFIXES: CharacterSuffix[] = ["-ful", "-ive", "-ous"];

/** ことば → はじめの 部分・おわり・いみ・こつ */
const CHARACTER: Record<string, { stem: string; suffix: CharacterSuffix; ja: string; note?: string }> = {
  helpful: { stem: "help", suffix: "-ful", ja: "よく 手つだう・やくに 立つ" },
  thoughtful: { stem: "thought", suffix: "-ful", ja: "思いやりの ある" },
  cheerful: { stem: "cheer", suffix: "-ful", ja: "いつも 明るい" },
  playful: { stem: "play", suffix: "-ful", ja: "あそび心の ある・ちゃめっけの ある" },
  creative: { stem: "creat", suffix: "-ive", ja: "アイデアが ゆたか", note: "create の e を とって -ive" },
  sensitive: { stem: "sensit", suffix: "-ive", ja: "人の 気持ちに 気づきやすい" },
  supportive: { stem: "support", suffix: "-ive", ja: "いつも ささえて くれる" },
  attentive: { stem: "attent", suffix: "-ive", ja: "よく 気を くばる・しっかり きく" },
  generous: { stem: "gener", suffix: "-ous", ja: "気前が いい・心が ひろい" },
  courageous: { stem: "courage", suffix: "-ous", ja: "ゆうきの ある", note: "courage の e を のこして -ous（e が ないと g の 音が かわる）" },
  adventurous: { stem: "adventur", suffix: "-ous", ja: "ぼうけんずき", note: "adventure の e を とって -ous" },
  humorous: { stem: "humor", suffix: "-ous", ja: "ユーモアの ある" },
};
const SUFFIX_MEAN: Record<CharacterSuffix, string> = {
  "-ful": "-ful は「～で いっぱい」（help → helpful）",
  "-ive": "-ive は「～する せいしつの ある」（create → creative）",
  "-ous": "-ous は「～を たくさん もって いる」（courage → courageous）",
};

export interface CharacterQuestion {
  word: string;
  stem: string;
  suffix: CharacterSuffix;
  ja: string;
  note?: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 性格の ことばの 問題（はじめの 部分 → おわり）。表に なければ null */
export function characterOf(word: string): CharacterQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(CHARACTER, w);
  if (!x) return null;
  return { word: w, stem: x.stem, suffix: x.suffix, ja: x.ja, note: x.note, answer: x.suffix, wrong: SUFFIXES.filter((s) => s !== x.suffix) as [string, string] };
}

export function characterDisplay(q: CharacterQuestion): string {
  return `${q.stem}＿＿（${q.ja}）`;
}

export function characterWhy(q: CharacterQuestion): string {
  return `${q.word}（${q.ja}）。${SUFFIX_MEAN[q.suffix]}。${q.note ? `${q.note}。` : ""}人の よい ところを ほめる ときに つかえるね。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w38FocusOf(word: string): string | null {
  const f = feelingSpellOf(word);
  if (f) return f.word;
  const p = phrasalOf(word);
  if (p) return p.phrase;
  const t = toneOf(word);
  if (t) return t.phrase.toLowerCase();
  const i = idiomOf(word);
  if (i) return i.key;
  const c = characterOf(word);
  if (c) return c.suffix;
  return null;
}

/**
 * その回の ことばが ワールド38 の 回の ものか。ことばが ぜんぶ ワールド38 の 表に あり、
 * 性格の ことば だけの ときは 2 しゅるい いじょうの おわり（-ful だけの まえの ワールドの 回で はたらかない ように）。
 * （L1110 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW38Words(words: readonly string[]): boolean {
  if (words.length === 0 || !words.every((w) => w38FocusOf(w) !== null)) return false;
  if (words.every((w) => characterOf(w))) return new Set(words.map((w) => characterOf(w)!.suffix)).size >= 2;
  return true;
}

/**
 * フォーカスの 読み上げ（ワールド38）。その focus で 問う ことば・句動詞・返事・慣用句を よむ（"-ful" "moon" だけで よまない）。
 * 英字・スペース・アポストロフィ だけ。あてはまらなければ null
 */
export function w38Say(focus: string, words: readonly string[]): string | null {
  if (!isW38Words(words)) return null;
  const w = words.find((x) => w38FocusOf(x) === focus);
  if (!w) return null;
  return w.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド38）。あてはまらなければ null */
export function w38Example(focus: string, words: readonly string[]): string | null {
  return w38Say(focus, words);
}
