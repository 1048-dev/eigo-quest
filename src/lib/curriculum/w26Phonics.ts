/**
 * ワールド26（ひびきの劇場・L751〜780・ステージ3）の フォニックス・つづりの表（ことばの リズム）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - きもちの こえ（Really?! / Oh, really…）: 「この きもちで いうと、どんな こえ？」（↗ たかく げんきに / ↘ ひくく しずかに / → ずっと おなじ）
 * - -ed と -ing の きもちの ことば: 「＿＿ に あてはまる ことばは どれ？」（The play is ＿＿. → exciting / excited / exciteing）
 * - セリフの くとうてん（" "・,・!・…）: 「セリフの かきかたが ただしいのは どれ？」（"Help!" shouted the princess. / "Help"! … / "Help! …）
 * - いみを かえる 強勢: 「この いみに なるのは どれ？」（I didn't eat YOUR cake / I didn't EAT your cake / I didn't eat your CAKE）
 * - はやくちことば（オリジナル）: 「おなじ おとで はじまる ことばは どれ？」（Crazy crows carry ＿＿ crackers → crunchy / soft / big）
 *
 * focus の かきかた:
 * - きもちの こえは キーワード（"Really" "Thank you" "can't"。ボタンで よむので アポストロフィは さいしょの ことばだけ）。ことばは キーワードを ふくむ セリフ（"Really?!" "Oh, really…"）。
 * - -ed / -ing は "-ed" "-ing"。
 * - くとうてんは しるし そのもの（'"' "," "!" "…"）。? は 正規表現で こわれるので focus に しない。
 * - 強勢は つよく いう ことば（大文字の ことば "YOUR"）。ことばは 大文字を ふくむ 文（"I didn't eat YOUR cake"）。
 * - はやくちことばは はじめの おと（"cr" "th" "r" "l" など）。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 * レッスンの なかで 同じ id（小文字・記号を とった 形）に なる ことばを 2つ ならべない（"Really?!" と "Really…" は かさなる）。
 */

/** ワールド26 が はじまる レッスン（それより前の 回では ワールド26 の 問題に しない） */
export const W26_START = 751;

export const W26_ED_FOCUS = "-ed";
export const W26_ING_FOCUS = "-ing";

// ---------------------------------------------------------------------------
// きもちの こえ（たかく げんきに ↗ / ひくく しずかに ↘）
// ---------------------------------------------------------------------------

export const VOICE_CHOICES = ["↗ たかく げんきに", "↘ ひくく しずかに", "→ ずっと おなじ"] as const;

/** セリフ → キーワード（focus）・たかく いうか・きもち */
const VOICE: Record<string, { focus: string; up: boolean; feeling: string }> = {
  "Really?!": { focus: "Really", up: true, feeling: "びっくり！ ほんとうに？" },
  "Oh, really…": { focus: "Really", up: false, feeling: "がっかり。ざんねん" },
  "OK!": { focus: "OK", up: true, feeling: "やる気 いっぱい" },
  "Well, OK…": { focus: "OK", up: false, feeling: "しぶしぶ。ほんとうは いや" },
  "Yes! I got it!": { focus: "Yes", up: true, feeling: "やった！ うれしい" },
  "Yes… I think so.": { focus: "Yes", up: false, feeling: "じしんが ない" },
  "Thank you so much!": { focus: "Thank you", up: true, feeling: "とても うれしい" },
  "Thank you… goodbye.": { focus: "Thank you", up: false, feeling: "わかれが さびしい" },
  "Oh no! The dragon is coming!": { focus: "Oh no", up: true, feeling: "びっくり！ こわい" },
  "Oh no… I forgot my lines.": { focus: "Oh no", up: false, feeling: "しょんぼり" },
  "I'm so happy!": { focus: "I'm so", up: true, feeling: "うれしくて たまらない" },
  "I'm so sleepy…": { focus: "I'm so", up: false, feeling: "ねむくて ぼんやり" },
  "I did it!": { focus: "I did it", up: true, feeling: "ほこらしい" },
  "I can't wait!": { focus: "can't", up: true, feeling: "わくわく まちきれない" },
  "I can't do it…": { focus: "can't", up: false, feeling: "じしんが ない" },
  "It's raining again…": { focus: "again", up: false, feeling: "がっかり" },
};

export interface VoiceQuestion {
  line: string;
  focus: string;
  feeling: string;
  up: boolean;
  answer: (typeof VOICE_CHOICES)[number];
}

/** 表に ある セリフの 問題。表に なければ null */
export function voiceOf(line: string): VoiceQuestion | null {
  const v = VOICE[line];
  if (!v) return null;
  return { line, focus: v.focus, feeling: v.feeling, up: v.up, answer: v.up ? VOICE_CHOICES[0] : VOICE_CHOICES[1] };
}

export function voiceWhy(q: VoiceQuestion): string {
  const how = q.up
    ? "うれしい・びっくり・わくわくの ときは こえを たかく、おおきく、げんきに いう ↗。! や ?! が その しるし。"
    : "がっかり・さびしい・ねむい ときは こえを ひくく、ちいさく、ゆっくり いう ↘。… は ことばが きえて いく しるし。";
  return `${q.line}（${q.feeling}）。${how}ずっと おなじ たかさで いうと、きもちが つたわらないよ。`;
}

// ---------------------------------------------------------------------------
// -ed と -ing の きもちの ことば（excited / exciting）
// ---------------------------------------------------------------------------

export type EdIngTrap = "drop-e" | "plain" | "y";

/** ことば → 文（＿＿ に 入る）・いみ・もとの ことば・もう 1つの 形・まちがいの つづり・つづりの きまり */
const ED_ING: Record<string, { sentence: string; meaning: string; base: string; other: string; misspell: string; trap: EdIngTrap }> = {
  tired: { sentence: "I'm ＿＿. I need a rest.", meaning: "つかれて いる", base: "tire", other: "tiring", misspell: "tireed", trap: "drop-e" },
  tiring: { sentence: "The practice was long and ＿＿.", meaning: "つかれる ような", base: "tire", other: "tired", misspell: "tireing", trap: "drop-e" },
  relaxed: { sentence: "After the show, I felt ＿＿.", meaning: "ほっと して いる", base: "relax", other: "relaxing", misspell: "relaxd", trap: "plain" },
  relaxing: { sentence: "A warm bath is ＿＿.", meaning: "ほっと させる", base: "relax", other: "relaxed", misspell: "relaxxing", trap: "plain" },
  excited: { sentence: "I'm so ＿＿!", meaning: "わくわく して いる", base: "excite", other: "exciting", misspell: "excitted", trap: "drop-e" },
  exciting: { sentence: "The play is ＿＿.", meaning: "わくわくさせる", base: "excite", other: "excited", misspell: "exciteing", trap: "drop-e" },
  interested: { sentence: "I'm ＿＿ in acting.", meaning: "きょうみが ある", base: "interest", other: "interesting", misspell: "intrested", trap: "plain" },
  interesting: { sentence: "This story is ＿＿.", meaning: "おもしろい（きょうみぶかい）", base: "interest", other: "interested", misspell: "intresting", trap: "plain" },
  bored: { sentence: "I'm ＿＿. Let's do something fun.", meaning: "たいくつ して いる", base: "bore", other: "boring", misspell: "boreed", trap: "drop-e" },
  boring: { sentence: "This scene is ＿＿.", meaning: "たいくつな", base: "bore", other: "bored", misspell: "boreing", trap: "drop-e" },
  amazed: { sentence: "Everyone was ＿＿ by the magic trick.", meaning: "びっくり かんしん して いる", base: "amaze", other: "amazing", misspell: "amazeed", trap: "drop-e" },
  amazing: { sentence: "You were ＿＿!", meaning: "すばらしい", base: "amaze", other: "amazed", misspell: "amazeing", trap: "drop-e" },
  surprised: { sentence: "I was ＿＿ by the loud noise.", meaning: "びっくり して いる", base: "surprise", other: "surprising", misspell: "suprised", trap: "drop-e" },
  surprising: { sentence: "The ending was ＿＿.", meaning: "おどろく ような", base: "surprise", other: "surprised", misspell: "surpriseing", trap: "drop-e" },
  worried: { sentence: "I'm ＿＿ about my lines.", meaning: "しんぱい して いる", base: "worry", other: "worrying", misspell: "worryed", trap: "y" },
  worrying: { sentence: "The dark sky is a little ＿＿.", meaning: "しんぱいに させる", base: "worry", other: "worried", misspell: "worriing", trap: "y" },
  confused: { sentence: "I'm ＿＿. Which way do I go?", meaning: "こんらん して いる（よく わからない）", base: "confuse", other: "confusing", misspell: "confuseed", trap: "drop-e" },
  confusing: { sentence: "This map is ＿＿.", meaning: "わかりにくい", base: "confuse", other: "confused", misspell: "confuseing", trap: "drop-e" },
};

export interface EdIngQuestion {
  word: string;
  focus: typeof W26_ED_FOCUS | typeof W26_ING_FOCUS;
  sentence: string;
  meaning: string;
  base: string;
  answer: string;
  /** もう 1つの 形（-ed なら -ing）・まちがいの つづり */
  wrong: [string, string];
  trap: EdIngTrap;
}

/** 表に ある -ed / -ing の ことばの 問題。表に なければ null */
export function edIngOf(word: string): EdIngQuestion | null {
  const w = word.toLowerCase();
  const x = ED_ING[w];
  if (!x) return null;
  return { word: w, focus: w.endsWith("ing") ? W26_ING_FOCUS : W26_ED_FOCUS, sentence: x.sentence, meaning: x.meaning, base: x.base, answer: w, wrong: [x.other, x.misspell], trap: x.trap };
}

export function edIngDisplay(q: EdIngQuestion): string {
  return `${q.sentence}（${q.meaning}）`;
}

export function edIngWhy(q: EdIngQuestion): string {
  const ed = q.focus === W26_ED_FOCUS;
  const sense = ed ? `-ed の ${q.answer} は「（ひとが）${q.meaning}」きもち。` : `-ing の ${q.answer} は「（ものや ことが）${q.meaning}」。ひとを そういう きもちに させる ほう。`;
  const spell: Record<EdIngTrap, string> = {
    "drop-e": ed ? `${q.base} は e で おわるので、d だけ つける（${q.base}ed では ない）。` : `${q.base} は おわりの e を とってから ing（${q.base}ing では ない）。`,
    plain: `${q.base} に そのまま ${ed ? "ed" : "ing"} を つける。`,
    y: ed ? `${q.base} は y を i に かえて ed（worryed では ない）。` : `ing の ときは y の まま（worriing では ない）。`,
  };
  return `${sense}${spell[q.trap]}`;
}

// ---------------------------------------------------------------------------
// セリフの くとうてん（" "・,・!・…）
// ---------------------------------------------------------------------------

export type MarkPoint = '"' | "," | "!" | "…";

/** ただしい セリフ → ポイントの しるし（focus）・いみ・まちがいの かきかた 2つ */
const PUNCT: Record<string, { point: MarkPoint; meaning: string; wrong: [string, string] }> = {
  '"Let\'s write a play," said Riko.': { point: ",", meaning: "「げきを かこう」と リコが いった", wrong: ['"Let\'s write a play", said Riko.', 'Let\'s write a play," said Riko.'] },
  '"I\'ll be the narrator," said Haru.': { point: ",", meaning: "「ぼくが ナレーターを やる」と ハルが いった", wrong: ['"I\'ll be the narrator" said, Haru.', '"I\'ll be the narrator, said Haru."'] },
  'Kiko said, "I have an idea."': { point: '"', meaning: "キコが「いい かんがえが ある」と いった", wrong: ['Kiko said, I have an idea."', 'Kiko said, "I have an idea".'] },
  '"Good idea," said Ms. Emma.': { point: ",", meaning: "「いい かんがえね」と エマ先生が いった", wrong: ['"Good idea" said Ms. Emma,', 'Good idea, said "Ms. Emma."'] },
  '"Help!" shouted the princess.': { point: "!", meaning: "「たすけて！」と おひめさまが さけんだ", wrong: ['"Help"! shouted the princess.', '"Help! shouted the princess."'] },
  '"Run!" cried the knight.': { point: "!", meaning: "「にげて！」と きしが さけんだ", wrong: ['"Run"! cried the knight.', 'Run! "cried the knight."'] },
  '"Who\'s there?" asked the dragon.': { point: '"', meaning: "「だれだ？」と ドラゴンが きいた", wrong: ['"Who\'s there"? asked the dragon.', '"Who\'s there? asked the dragon."'] },
  '"Look out!" yelled the little bird.': { point: "!", meaning: "「あぶない！」と ことりが さけんだ", wrong: ['"Look out"! yelled the little bird.', 'Look out! yelled "the little bird."'] },
  '"I\'m… I\'m scared," whispered the princess.': { point: "…", meaning: "「わ、わたし… こわい」と おひめさまが ささやいた", wrong: ['"I\'m… I\'m scared" whispered, the princess.', 'I\'m… I\'m scared," whispered the princess.'] },
  '"Wait… what\'s that sound?" asked the knight.': { point: "…", meaning: "「まって… あの おとは なに？」と きしが きいた", wrong: ['"Wait… what\'s that sound"? asked the knight.', 'Wait… "what\'s that sound? asked the knight."'] },
  '"The door is… locked!" said the bird.': { point: "…", meaning: "「ドアが… しまってる！」と ことりが いった", wrong: ['"The door is… locked"! said the bird.', '"The door is… locked! said the bird.'] },
  '"Luckily, I have a key," said the bird.': { point: ",", meaning: "「よかった、かぎを もってるよ」と ことりが いった", wrong: ['"Luckily, I have a key" said, the bird.', 'Luckily, I have a key," said the bird.'] },
  '"We\'re free!" shouted the friends.': { point: "!", meaning: "「じゆうだ！」と なかまたちが さけんだ", wrong: ['"We\'re free"! shouted the friends.', 'We\'re free! "shouted the friends."'] },
  '"Is anyone there?" called the princess.': { point: '"', meaning: "「だれか いますか？」と おひめさまが よんだ", wrong: ['"Is anyone there"? called the princess.', 'Is anyone there? called "the princess."'] },
  '"Oh… thank you," said the dragon.': { point: "…", meaning: "「あ… ありがとう」と ドラゴンが いった", wrong: ['"Oh… thank you" said, the dragon.', 'Oh… thank you, said the "dragon."'] },
  'The dragon said, "Please stay."': { point: ",", meaning: "ドラゴンが「いかないで」と いった", wrong: ['The dragon said "Please stay".', 'The dragon said, Please stay."'] },
};

export interface PunctQuestion {
  line: string;
  point: MarkPoint;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある セリフの 問題。表に なければ null */
export function punctOf(line: string): PunctQuestion | null {
  const p = PUNCT[line];
  if (!p) return null;
  return { line, point: p.point, meaning: p.meaning, answer: line, wrong: p.wrong };
}

export function punctWhy(q: PunctQuestion): string {
  const tip: Record<MarkPoint, string> = {
    '"': 'いった ことばを " " で はさむ。? や . も " の なかに 入れる。',
    ",": '"…," said ～. の ように、セリフの あとの , は " の なかに 入れる。said の まえで 文を とめないので . では なく , に する。',
    "!": '! も " の なかに 入れる（"Help!" shouted ～.）。',
    "…": "… は ことばが とぎれる・まを とる しるし。よむ ときは すこし まって、きもちを こめよう。",
  };
  return `${q.answer}（${q.meaning}）。${tip[q.point]}`;
}

// ---------------------------------------------------------------------------
// いみを かえる 強勢（I didn't eat YOUR cake）
// ---------------------------------------------------------------------------

/** つよく いう 文（大文字の ところを つよく） → いみ・ほかの ところを つよく いう 文 2つ */
const STRESS: Record<string, { meaning: string; others: [string, string] }> = {
  "I want the RED cape": { meaning: "あおでは なく、あかい マントが ほしい", others: ["I want the red CAPE", "I WANT the red cape"] },
  "The show starts at SIX": { meaning: "5じでは なく、6じに はじまる", others: ["The SHOW starts at six", "The show STARTS at six"] },
  "Can you OPEN the door": { meaning: "しめるのでは なく、あけて ほしい", others: ["Can YOU open the door", "Can you open the DOOR"] },
  "We need TWO chairs": { meaning: "3つでは なく、2つ いる", others: ["WE need two chairs", "We need two CHAIRS"] },
  "SHE plays the princess": { meaning: "ほかの ひとでは なく、かのじょが おひめさま やく", others: ["She PLAYS the princess", "She plays the PRINCESS"] },
  "RIKO sang this song": { meaning: "ハルでは なく、リコが うたった", others: ["Riko SANG this song", "Riko sang THIS song"] },
  "This is MY line": { meaning: "あなたのでは なく、わたしの セリフ", others: ["THIS is my line", "This is my LINE"] },
  "We practice on MONDAY": { meaning: "かようびでは なく、げつようびに れんしゅうする", others: ["WE practice on Monday", "We PRACTICE on Monday"] },
  "I didn't eat YOUR cake": { meaning: "ほかの ひとの ケーキは たべたけど、あなたのは たべて いない", others: ["I didn't EAT your cake", "I didn't eat your CAKE"] },
  "I didn't say SHE took it": { meaning: "ほかの ひとが とったと いったんだよ", others: ["I didn't SAY she took it", "I didn't say she TOOK it"] },
  "Birimo ate the LAST cookie": { meaning: "さいごの 1まいを たべちゃった", others: ["BIRIMO ate the last cookie", "Birimo ate the last COOKIE"] },
  "My BROTHER made this crown": { meaning: "おねえさんでは なく、おにいさん（おとうと）が つくった", others: ["MY brother made this crown", "My brother made this CROWN"] },
  "The bird FOUND the key": { meaning: "なくしたのでは なく、みつけた", others: ["The BIRD found the key", "The bird found the KEY"] },
  "I'll bring the props TOMORROW": { meaning: "きょうでは なく、あした もって くる", others: ["I'LL bring the props tomorrow", "I'll bring the PROPS tomorrow"] },
  "Haru was the KNIGHT": { meaning: "ドラゴンでは なく、きしの やく だった", others: ["HARU was the knight", "Haru WAS the knight"] },
  "I like your BLUE hat": { meaning: "あかい ぼうしでは なく、あおい ぼうしが すき", others: ["I LIKE your blue hat", "I like your blue HAT"] },
};

export interface StressQuestion {
  line: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
  /** つよく いう ことば（大文字の ところ） */
  stressed: string;
}

/** 表に ある 文の 問題。表に なければ null */
export function stressOf(line: string): StressQuestion | null {
  const s = STRESS[line];
  if (!s) return null;
  const stressed = line.split(" ").find((w) => w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w)) ?? "";
  return { line, meaning: s.meaning, answer: line, wrong: s.others, stressed };
}

export function stressWhy(q: StressQuestion): string {
  return `${q.answer}（${q.meaning}）。${q.stressed} を つよく いうと、「${q.stressed.toLowerCase()} の ところが だいじ・ほかと ちがう」と つたわる。おなじ 文でも、どこを つよく いうかで いみが かわるよ。`;
}

// ---------------------------------------------------------------------------
// はやくちことば（オリジナル）
// ---------------------------------------------------------------------------

/** はじめの おと → くちの つかいかた */
const SOUND_TIP: Record<string, string> = {
  cr: "c と r を くっつけて、くちを まるく つきだす。",
  p: "くちびるを とじて、ぱっと いきを だす。",
  th: "したの さきを はの あいだに かるく はさむ。",
  ch: "くちを すこし つきだして「チ」と つよく。",
  r: "したの さきを どこにも つけずに、うしろに まるめる。",
  l: "したの さきを うえの はの うらに つける。",
  b: "くちびるを とじて、こえを だしながら ひらく。",
  v: "うえの はで したの くちびるに かるく ふれて、こえを だす。",
  f: "うえの はで したの くちびるに かるく ふれて、いきだけ だす。",
};

/** はやくちことば → はじめの おと（focus）・かくす ことば・まちがいの 選択肢（ちがう おとで はじまる） */
const TWISTER: Record<string, { sound: string; blank: string; wrong: [string, string] }> = {
  "Crazy crows carry crunchy crackers": { sound: "cr", blank: "crunchy", wrong: ["soft", "big"] },
  "A creaky crown and a crumpled cape": { sound: "cr", blank: "crown", wrong: ["hat", "bag"] },
  "Pink paper props pop on the purple stage": { sound: "p", blank: "props", wrong: ["hats", "toys"] },
  "Pip packs puppets in purple paper": { sound: "p", blank: "puppets", wrong: ["dolls", "books"] },
  "Three thin thumbs and thirty thick threads": { sound: "th", blank: "threads", wrong: ["ropes", "lines"] },
  "Think first, then thank the theater": { sound: "th", blank: "thank", wrong: ["call", "help"] },
  "Cheerful children choose cheese and cherries": { sound: "ch", blank: "cherries", wrong: ["apples", "grapes"] },
  "A chubby chick chews chocolate chips": { sound: "ch", blank: "chews", wrong: ["eats", "likes"] },
  "Riko rolls a round red rug": { sound: "r", blank: "red", wrong: ["blue", "green"] },
  "Lucky Lulu lights little lamps": { sound: "l", blank: "lamps", wrong: ["candles", "fires"] },
  "Real rabbits run around the rocks": { sound: "r", blank: "run", wrong: ["hop", "jump"] },
  "Lily's lion loves lemon lollipops": { sound: "l", blank: "lemon", wrong: ["orange", "cherry"] },
  "Brave Birimo bakes big blue buns": { sound: "b", blank: "big", wrong: ["small", "tiny"] },
  "Very vivid violets in a velvet vase": { sound: "v", blank: "violets", wrong: ["roses", "tulips"] },
  "Five funny frogs find a flute": { sound: "f", blank: "flute", wrong: ["drum", "horn"] },
  "Fresh fruit for four friends": { sound: "f", blank: "four", wrong: ["two", "six"] },
};

export interface TwisterQuestion {
  line: string;
  sound: string;
  answer: string;
  wrong: [string, string];
  tip: string;
}

/** 表に ある はやくちことばの 問題。表に なければ null */
export function twisterOf(line: string): TwisterQuestion | null {
  const t = TWISTER[line];
  if (!t) return null;
  return { line, sound: t.sound, answer: t.blank, wrong: t.wrong, tip: SOUND_TIP[t.sound] ?? "" };
}

export function twisterDisplay(q: TwisterQuestion): string {
  return q.line.split(" ").map((w) => (w === q.answer ? "＿＿" : w)).join(" ");
}

export function twisterWhy(q: TwisterQuestion): string {
  return `${q.line}。${q.sound} の おとが つづく はやくちことば。${q.tip}さいしょは ゆっくり、はっきり。いえたら だんだん はやく！`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w26FocusOf(word: string): string | null {
  return VOICE[word]?.focus ?? edIngOf(word)?.focus ?? PUNCT[word]?.point ?? stressOf(word)?.stressed ?? TWISTER[word]?.sound ?? null;
}

/**
 * その回の ことばが ワールド26 の 回の ものか。まえの ワールドの -ed / -ing の 回を かえない ように、ことばが ぜんぶ ワールド26 の 表に あり、
 * -ed / -ing の 表 だけでは ない（セリフ・文が まじる）か、-ed と -ing の ペアが そろう ときだけ（L750 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW26Words(words: readonly string[]): boolean {
  if (words.length === 0 || !words.every((w) => w26FocusOf(w) !== null)) return false;
  if (!words.every((w) => edIngOf(w))) return true;
  return words.some((w) => w.toLowerCase().endsWith("ing") && words.some((v) => edIngOf(v)?.wrong[0] === w.toLowerCase()));
}

/** フォーカスの 読み上げ（ワールド26）。その focus で 問う ことば（セリフ・文）を よむ。あてはまらなければ null */
export function w26Say(focus: string, words: readonly string[]): string | null {
  if (!isW26Words(words)) return null;
  return words.find((w) => w26FocusOf(w) === focus) ?? null;
}

/** くとうてんの ボタンで よむ しるしの なまえ */
const MARK_NAME: Record<MarkPoint, string> = { '"': "quotation marks", ",": "comma", "!": "exclamation mark", "…": "three dots" };

/**
 * フォーカスの ボタンで よむ おてほん（ワールド26。英字と スペース だけに する）。
 * くとうてんは しるしの なまえ（comma）、きもちの こえは キーワード（Really）、強勢は つよく いう ことば（YOUR）、
 * はやくちことばは その おとの はやくちことば（, を とる）、-ed / -ing は その回の ことば。あてはまらなければ null
 */
export function w26Example(focus: string, words: readonly string[]): string | null {
  if (!isW26Words(words)) return null;
  if (focus in MARK_NAME) return MARK_NAME[focus as MarkPoint];
  const hit = words.find((w) => w26FocusOf(w) === focus);
  if (!hit) return null;
  if (TWISTER[hit]) return hit.replace(/,/g, "");
  if (edIngOf(hit)) return hit;
  return focus;
}
