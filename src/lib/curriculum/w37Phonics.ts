/**
 * ワールド37（おとぎの迷宮・L1081〜1110・ステージ5）の フォニックス・つづりの表（物語の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 物語の 動詞: 「物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？」（say very quietly, using only your breath → whisper / grin / stumble）
 * - 音の ことば: 「音の ことば。この 場面の 音は どれ？」（The frog jumped into the pond. ＿＿! → splash / creak / hiss）
 * - 語りの 間: 「お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？」（She opened the box, and inside was a tiny dragon → was / She / tiny）
 * - -ly の 副詞: 「どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？」（The cat crept ＿＿ toward the bird, … → silently / proudly / eagerly）
 * - たとえ: 「たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？」（as brave as a ＿＿ → lion / mouse / snail）
 *
 * focus の かきかた:
 * - 物語の 動詞と 音の ことばは その ことば そのもの（"whisper" "creak"）。語りの 間は 間を とる ことばの 小文字（"was" "then"）。
 * - -ly は "-ly"。たとえは "as" と "like"。
 * まちがいの 選択肢は 表に 手で 書く（どれも いみが はっきり ちがう もの）。
 */

/** ワールド37 が はじまる レッスン（それより前の 回では ワールド37 の 問題に しない） */
export const W37_START = 1081;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// 物語の 動詞（ようすが 見える ことば）
// ---------------------------------------------------------------------------

/** ことば → ふつうの いいかた（英語の せつめい）・ふつうの 動詞・いみ・まちがい 2つ（いみが ちがう 表の ことば） */
const VERBS: Record<string, { plain: string; basic: string; ja: string; wrong: [string, string] }> = {
  whisper: { plain: "speak very quietly, using only your breath", basic: "say", ja: "ささやく", wrong: ["grin", "stumble"] },
  glimmer: { plain: "shine with a weak light that comes and goes", basic: "shine", ja: "ちらちら ひかる", wrong: ["gasp", "wander"] },
  tremble: { plain: "shake a little because you are scared or excited", basic: "shake", ja: "ふるえる", wrong: ["glance", "mutter"] },
  gasp: { plain: "breathe in quickly because you are surprised", basic: "breathe", ja: "はっと 息を のむ", wrong: ["sparkle", "wander"] },
  stumble: { plain: "almost fall while you are walking", basic: "walk", ja: "つまずく・よろける", wrong: ["whisper", "glimmer"] },
  glance: { plain: "look at something very quickly", basic: "look", ja: "ちらっと 見る", wrong: ["tremble", "flutter"] },
  shiver: { plain: "shake because you are cold", basic: "shake", ja: "（さむくて）ぶるぶる ふるえる", wrong: ["glance", "grin"] },
  sparkle: { plain: "shine with lots of tiny flashes of light", basic: "shine", ja: "きらきら かがやく", wrong: ["stumble", "mutter"] },
  wander: { plain: "walk slowly with no special place to go", basic: "walk", ja: "ぶらぶら 歩く・さまよう", wrong: ["gasp", "sparkle"] },
  grin: { plain: "smile a big smile that shows your teeth", basic: "smile", ja: "歯を 見せて にっこり わらう", wrong: ["shiver", "wander"] },
  mutter: { plain: "say something quietly, often because you are not happy", basic: "say", ja: "ぶつぶつ いう", wrong: ["sparkle", "stumble"] },
  flutter: { plain: "move up and down quickly and lightly, like a butterfly's wings", basic: "move", ja: "ひらひら・ぱたぱた うごく", wrong: ["grin", "gasp"] },
};

export interface StoryVerbQuestion {
  word: string;
  plain: string;
  basic: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 物語の 動詞の 問題（ふつうの いいかた → ことば）。表に なければ null */
export function storyVerbOf(word: string): StoryVerbQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(VERBS, w);
  if (!x) return null;
  return { word: w, plain: x.plain, basic: x.basic, ja: x.ja, answer: w, wrong: x.wrong };
}

export function storyVerbDisplay(q: StoryVerbQuestion): string {
  return `${q.plain} → ＿＿`;
}

export function storyVerbWhy(q: StoryVerbQuestion): string {
  const others = q.wrong.map((w) => `${w}（${own(VERBS, w)!.ja}）`).join("・");
  return `${q.answer} は「${q.ja}」。ふつうの ${q.basic} より、${q.answer} の ほうが どんな ようすか 目に 見えるね。ほかの ${others} は いみが ちがうよ。物語では「いう」「見る」だけで なく、ようすが 見える 動詞を えらぼう。`;
}

// ---------------------------------------------------------------------------
// 音の ことば（オノマトペ）
// ---------------------------------------------------------------------------

/** ことば → 場面の 文（＿＿! に 入る）・日本語の 音・まちがい 2つ */
const SOUNDS: Record<string, { scene: string; ja: string; wrong: [string, string] }> = {
  thud: { scene: "A heavy book fell onto the carpet. ＿＿!", ja: "ドスン", wrong: ["splash", "hiss"] },
  rustle: { scene: "The wind moved the dry leaves on the ground. ＿＿!", ja: "カサカサ", wrong: ["clang", "drip"] },
  sizzle: { scene: "The eggs are cooking in a hot pan. ＿＿!", ja: "ジュージュー", wrong: ["thud", "creak"] },
  drip: { scene: "Water fell from the tap, one drop at a time. ＿＿!", ja: "ポタッ", wrong: ["boom", "crash"] },
  boom: { scene: "Fireworks exploded high in the night sky. ＿＿!", ja: "ドーン", wrong: ["drip", "rustle"] },
  crackle: { scene: "Dry sticks are burning in the campfire. ＿＿!", ja: "パチパチ", wrong: ["splash", "clang"] },
  hiss: { scene: "The angry snake opened its mouth. ＿＿!", ja: "シューッ", wrong: ["thud", "boom"] },
  whoosh: { scene: "A strong wind rushed past us very fast. ＿＿!", ja: "ビューン", wrong: ["drip", "creak"] },
  clang: { scene: "The metal pot lid fell on the stone floor. ＿＿!", ja: "カラーン・ガラン", wrong: ["rustle", "sizzle"] },
  crash: { scene: "A big plate fell off the table and broke into pieces. ＿＿!", ja: "ガシャン", wrong: ["drip", "rustle"] },
  splash: { scene: "The frog jumped into the pond. ＿＿!", ja: "バシャン・ポチャン", wrong: ["creak", "hiss"] },
  creak: { scene: "The old wooden door opened very slowly. ＿＿!", ja: "ギーッ", wrong: ["boom", "sizzle"] },
};

export interface SoundWordQuestion {
  word: string;
  scene: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 音の ことばの 問題（場面 → 音）。表に なければ null */
export function soundWordOf(word: string): SoundWordQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(SOUNDS, w);
  if (!x) return null;
  return { word: w, scene: x.scene, ja: x.ja, answer: w, wrong: x.wrong };
}

export function soundWordDisplay(q: SoundWordQuestion): string {
  return q.scene;
}

export function soundWordWhy(q: SoundWordQuestion): string {
  const others = q.wrong.map((w) => `${w}（${own(SOUNDS, w)!.ja}）`).join("・");
  return `${q.answer} は 日本語の「${q.ja}」の ような 音。${others} は べつの 音だよ。音の ことばを 入れると、きいて いる 人の 耳にも 場面が きこえて くるよ（Creak! The old door slowly opened.）。`;
}

// ---------------------------------------------------------------------------
// 語りの 間（サスペンス）
// ---------------------------------------------------------------------------

/** 文 → 間を とる ことば（文の なかの かたち）・いみ・まちがい 2つ（まとまりの とちゅうの ことば など） */
const SUSPENSE: Record<string, { pause: string; ja: string; wrong: [string, string] }> = {
  "She opened the box, and inside was a tiny dragon": { pause: "was", ja: "はこを あけると、中に いたのは… 小さな ドラゴン", wrong: ["She", "tiny"] },
  "The footsteps came closer and closer, and then they stopped": { pause: "then", ja: "あしおとが どんどん ちかづいて きて、そして… とまった", wrong: ["footsteps", "they"] },
  "He looked up, and there in the tree sat a giant owl": { pause: "sat", ja: "見上げると、木の 上に いたのは… 大きな フクロウ", wrong: ["He", "giant"] },
  "Behind the curtain stood a little gray mouse": { pause: "stood", ja: "カーテンの うしろに 立って いたのは… 小さな はいいろの ネズミ", wrong: ["the", "little"] },
  "The cave was dark and silent, until suddenly a voice said hello": { pause: "suddenly", ja: "ほらあなは くらくて しずかだった。すると とつぜん… 声が「こんにちは」", wrong: ["dark", "voice"] },
  "At the bottom of the well, she found a golden key": { pause: "found", ja: "いどの そこで 見つけたのは… 金の かぎ", wrong: ["the", "golden"] },
  "The thing under the bed was not a monster, but a puppy": { pause: "monster", ja: "ベッドの 下に いたのは かいぶつ では なくて… 子犬", wrong: ["thing", "a"] },
  "When the clock struck twelve, the statue opened its eyes": { pause: "statue", ja: "時計が 12 じを うつと、石の ぞうが… 目を ひらいた", wrong: ["clock", "its"] },
  "She lifted the lid very slowly and saw a pair of eyes": { pause: "saw", ja: "ふたを ゆっくり 上げると、見えたのは… 2つの 目", wrong: ["lifted", "pair"] },
  "Out of the giant egg came a baby star": { pause: "came", ja: "大きな たまごから 出て きたのは… 赤ちゃんの 星", wrong: ["the", "baby"] },
  "The last door opened, and in the room was the dragon queen": { pause: "was", ja: "さいごの 扉が ひらくと、部屋に いたのは… ドラゴンの 女王", wrong: ["last", "dragon"] },
  "The rabbit lifted the cup, and under it sat a frog": { pause: "sat", ja: "ウサギが コップを もちあげると、下に いたのは… カエル", wrong: ["rabbit", "a"] },
  "She had never seen the sea before, and now it was right in front of her": { pause: "now", ja: "いちども 海を 見た ことが なかった。そして いま… 海が 目の まえに", wrong: ["had", "front"] },
  "Little by little, the fog cleared, and they saw the castle": { pause: "saw", ja: "すこしずつ きりが はれて、見えたのは… お城", wrong: ["Little", "the"] },
  "He reached into his pocket and pulled out a glowing stone": { pause: "out", ja: "ポケットに 手を 入れて、とりだしたのは… ひかる 石", wrong: ["his", "glowing"] },
  "The voice in the dark whispered one word, welcome": { pause: "word", ja: "くらやみの 声が ささやいた ことばは ひとつ… ようこそ", wrong: ["voice", "the"] },
};
const SUSPENSE_KEYS: Record<string, string> = Object.fromEntries(Object.keys(SUSPENSE).map((k) => [k.toLowerCase(), k]));

export interface SuspenseQuestion {
  sentence: string;
  pause: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 語りの 間の 文の 問題。表に なければ null */
export function suspenseOf(sentence: string): SuspenseQuestion | null {
  const k = own(SUSPENSE_KEYS, sentence.toLowerCase().trim());
  if (!k) return null;
  const x = SUSPENSE[k];
  return { sentence: k, pause: x.pause, ja: x.ja, answer: x.pause, wrong: x.wrong };
}

export function suspenseDisplay(q: SuspenseQuestion): string {
  return `${q.sentence}.（${q.ja}）`;
}

/** 間の しるしを 入れた 文（She opened the box, and inside was … a tiny dragon!） */
export function suspenseMarked(q: SuspenseQuestion): string {
  const ws = q.sentence.split(" ");
  const i = ws.findIndex((w) => w.replace(/[^A-Za-z']/g, "") === q.pause);
  return [...ws.slice(0, i + 1), "…", ...ws.slice(i + 1)].join(" ") + "!";
}

export function suspenseWhy(q: SuspenseQuestion): string {
  return `${suspenseMarked(q)} — びっくりする ところの すぐ まえで、声を 小さく して ゆっくり、ひと いき 間を とると、きいて いる 人が どきどき するよ。${q.wrong.map((w) => `${w} の あと`).join("や ")}で 間を とると、まとまりが こわれたり、びっくりが 早く わかったり して しまう。`;
}

// ---------------------------------------------------------------------------
// -ly の 副詞（どんな ふうに？）
// ---------------------------------------------------------------------------

/** ことば → 文（＿＿ に 入る）・もとの ことば・つくりかた・いみ・まちがい 2つ（文に あわない -ly の ことば） */
const LY: Record<string, { sentence: string; base: string; how: string; ja: string; wrong: [string, string] }> = {
  suddenly: { sentence: "＿＿, the lights went out, and the room was dark.", base: "sudden", how: "sudden ＋ ly", ja: "とつぜん", wrong: ["gracefully", "proudly"] },
  carefully: { sentence: "She ＿＿ carried the full glass of water so she wouldn't spill it.", base: "careful", how: "careful ＋ ly（l が 2つ）", ja: "ちゅういぶかく", wrong: ["fiercely", "suddenly"] },
  bravely: { sentence: "The little knight was scared, but he ＿＿ walked into the dark cave.", base: "brave", how: "brave ＋ ly", ja: "ゆうかんに", wrong: ["gently", "gracefully"] },
  silently: { sentence: "The cat crept ＿＿ toward the bird, without making a sound.", base: "silent", how: "silent ＋ ly", ja: "音を たてずに", wrong: ["proudly", "eagerly"] },
  nervously: { sentence: "Before the big race, Haru ＿＿ checked his shoes again and again.", base: "nervous", how: "nervous ＋ ly", ja: "どきどき しながら", wrong: ["gracefully", "fiercely"] },
  gently: { sentence: "Please hold the baby bird ＿＿ so you don't hurt it.", base: "gentle", how: "gentle の le を ly に（gentlely では ない）", ja: "やさしく・そっと", wrong: ["fiercely", "suddenly"] },
  proudly: { sentence: "With a big smile, Riko ＿＿ showed everyone the prize she won.", base: "proud", how: "proud ＋ ly", ja: "ほこらしげに", wrong: ["fiercely", "nervously"] },
  eagerly: { sentence: "The children loved this storyteller, so they waited ＿＿ for the story to begin.", base: "eager", how: "eager ＋ ly", ja: "わくわく しながら・まちきれずに", wrong: ["sadly", "angrily"] },
  fiercely: { sentence: "The storm wind blew ＿＿ and bent the tall trees.", base: "fierce", how: "fierce ＋ ly（e は のこす）", ja: "はげしく", wrong: ["gently", "gracefully"] },
  finally: { sentence: "After walking for three long days, they ＿＿ reached the castle.", base: "final", how: "final ＋ ly（l が 2つ）", ja: "ついに・やっと", wrong: ["gently", "fiercely"] },
  curiously: { sentence: "The puppy sniffed the strange box ＿＿, wondering what was inside.", base: "curious", how: "curious ＋ ly", ja: "きょうみ しんしんで", wrong: ["proudly", "fiercely"] },
  gracefully: { sentence: "The swan moved ＿＿ across the lake, like a dancer.", base: "graceful", how: "graceful ＋ ly（l が 2つ）", ja: "ゆうがに", wrong: ["nervously", "fiercely"] },
};

export interface AdverbQuestion {
  word: string;
  sentence: string;
  base: string;
  how: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -ly の 副詞の 問題（文 → ことば）。表に なければ null */
export function adverbOf(word: string): AdverbQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(LY, w);
  if (!x) return null;
  return { word: w, sentence: x.sentence, base: x.base, how: x.how, ja: x.ja, answer: w, wrong: x.wrong };
}

export function adverbDisplay(q: AdverbQuestion): string {
  return q.sentence;
}

export function adverbWhy(q: AdverbQuestion): string {
  return `${q.answer}（${q.ja}）。${q.how}。-ly の ことばは 登場人物が「どんな ふうに」したかを おしえて くれる。文の ようすに あう ものを えらぼう（${q.wrong.join("・")} は この 場面に あわない）。`;
}

// ---------------------------------------------------------------------------
// たとえ（as ～ as・like）
// ---------------------------------------------------------------------------

export type SimileKind = "as" | "like";

/** たとえ → ＿＿ に した 形・答え・いみ・まちがい 2つ */
const SIMILES: Record<string, { blank: string; answer: string; ja: string; wrong: [string, string] }> = {
  "as brave as a lion": { blank: "as brave as a ＿＿", answer: "lion", ja: "とても ゆうかん", wrong: ["mouse", "snail"] },
  "as quiet as a mouse": { blank: "as quiet as a ＿＿", answer: "mouse", ja: "とても しずか", wrong: ["lion", "bee"] },
  "as busy as a bee": { blank: "as busy as a ＿＿", answer: "bee", ja: "とても いそがしい", wrong: ["snail", "log"] },
  "as cold as ice": { blank: "as cold as ＿＿", answer: "ice", ja: "とても つめたい", wrong: ["fire", "feather"] },
  "as light as a feather": { blank: "as light as a ＿＿", answer: "feather", ja: "とても かるい", wrong: ["rock", "snail"] },
  "as slow as a snail": { blank: "as slow as a ＿＿", answer: "snail", ja: "とても おそい", wrong: ["bee", "lion"] },
  "as white as snow": { blank: "as white as ＿＿", answer: "snow", ja: "まっしろ", wrong: ["coal", "fire"] },
  "as hard as a rock": { blank: "as hard as a ＿＿", answer: "rock", ja: "とても かたい", wrong: ["feather", "fish"] },
  "like a shooting star": { blank: "It flew across the sky like a shooting ＿＿.", answer: "star", ja: "ながれ星の ように（はやく ひかって）", wrong: ["snail", "log"] },
  "sleep like a log": { blank: "sleep like a ＿＿", answer: "log", ja: "ぐっすり ねむる（丸太の ように うごかない）", wrong: ["bee", "fish"] },
  "swim like a fish": { blank: "swim like a ＿＿", answer: "fish", ja: "とても じょうずに およぐ", wrong: ["rock", "log"] },
  "run like the wind": { blank: "run like the ＿＿", answer: "wind", ja: "とても はやく はしる", wrong: ["snail", "rock"] },
};

export interface SimileQuestion {
  phrase: string;
  kind: SimileKind;
  blank: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある たとえの 問題（＿＿ に 入る ことば）。表に なければ null */
export function simileOf(phrase: string): SimileQuestion | null {
  const w = phrase.toLowerCase().trim();
  const x = own(SIMILES, w);
  if (!x) return null;
  return { phrase: w, kind: w.startsWith("as ") ? "as" : "like", blank: x.blank, ja: x.ja, answer: x.answer, wrong: x.wrong };
}

export function simileDisplay(q: SimileQuestion): string {
  return `${q.blank}（${q.ja}）`;
}

export function simileWhy(q: SimileQuestion): string {
  const how = q.kind === "as" ? "as ＋ ようすの ことば ＋ as ＋ もの で「～と おなじくらい …」" : "like ＋ もの で「～の ように」";
  return `${q.phrase}（${q.ja}）。${how}。たとえを つかうと、きいて いる 人が すぐ 絵を 思いうかべられるよ。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w37FocusOf(word: string): string | null {
  const v = storyVerbOf(word);
  if (v) return v.word;
  const s = soundWordOf(word);
  if (s) return s.word;
  const p = suspenseOf(word);
  if (p) return p.pause.toLowerCase();
  if (adverbOf(word)) return "-ly";
  const m = simileOf(word);
  if (m) return m.kind;
  return null;
}

/**
 * その回の ことばが ワールド37 の 回の ものか。ことばが ぜんぶ ワールド37 の 表に ある とき
 * （L1080 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW37Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w37FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド37）。その focus で 問う ことば・文・たとえを よむ（"-ly" "as" だけで よまない）。
 * 英字・スペース・アポストロフィ だけ。あてはまらなければ null
 */
export function w37Say(focus: string, words: readonly string[]): string | null {
  if (!isW37Words(words)) return null;
  const w = words.find((x) => w37FocusOf(x) === focus);
  if (!w) return null;
  return w.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド37）。あてはまらなければ null */
export function w37Example(focus: string, words: readonly string[]): string | null {
  return w37Say(focus, words);
}
