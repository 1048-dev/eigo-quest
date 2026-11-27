/**
 * ワールド39（せかいの円卓・L1141〜1170・ステージ5）の フォニックス・つづりの表（せかいの 課題と ディベート）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 環境の ことばの パーツ: 「環境の ことばの パーツ。＿＿ に 入る パーツは どれ？」（re ＋ ＿＿ ＋ able（また 新しく つくれる）→ new / cycle / duce）
 * - 大きな 数と 割合: 「大きな 数と 割合。英語で どう よむ？」（1,000,000 → one million / one billion / ten thousand）
 * - ディベートの プロソディ: 「ディベートの プロソディ。いちばん つよく いう ことばは どれ？」（We believe that schools should have gardens. → believe / we / that）
 * - つなぎの ことば: 「つなぎの ことば。＿＿ に 入る ことばは どれ？」（Plastic is useful. ＿＿, it can harm the sea. → However / For example / In addition）
 * - ヘッジの ことば: 「ヘッジの ことば。いいすぎない ことばは どれ？」（It will ＿＿ rain this afternoon.（たぶん）→ probably / definitely / never）
 *
 * focus の かきかた:
 * - 環境の ことば・数・ヘッジは その ことば（"renewable" "one third" "might"）。
 * - ディベートの 文の はじめと つなぎの ことばは 小文字（"we believe that" "however"）。
 * まちがいの 選択肢は 表に 手で 書く。
 */

/** ワールド39 が はじまる レッスン（それより前の 回では ワールド39 の 問題に しない） */
export const W39_START = 1141;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);
const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

// ---------------------------------------------------------------------------
// 環境の ことばの パーツ
// ---------------------------------------------------------------------------

/** ことば → パーツ（つなげると ことば）・＿＿ に する パーツ・まちがい 2つ・いみ・こつ */
const ECO: Record<string, { parts: string[]; blank: number; wrong: [string, string]; ja: string; note: string }> = {
  environment: { parts: ["environ", "ment"], blank: 1, wrong: ["ness", "ful"], ja: "環境・まわりの 自然", note: "environ ＋ ment。ment の まえの n を わすれない" },
  sustainable: { parts: ["sustain", "able"], blank: 1, wrong: ["ment", "ous"], ja: "ずっと つづけられる", note: "sustain（ささえ つづける）＋ able（できる）" },
  renewable: { parts: ["re", "new", "able"], blank: 1, wrong: ["cycle", "duce"], ja: "また 新しく つくれる（太陽や 風の エネルギー）", note: "re（もう いちど）＋ new（新しい）＋ able（できる）" },
  pollution: { parts: ["pollut", "ion"], blank: 1, wrong: ["ment", "ness"], ja: "よごれ・汚染", note: "pollute（よごす）の e を とって -ion" },
  recycle: { parts: ["re", "cycle"], blank: 0, wrong: ["un", "dis"], ja: "リサイクル する", note: "re（もう いちど）＋ cycle（わ・まわる）" },
  conservation: { parts: ["conserv", "ation"], blank: 1, wrong: ["ment", "ness"], ja: "自然を まもる こと", note: "conserve（まもる）の e を とって -ation" },
  ecosystem: { parts: ["eco", "system"], blank: 0, wrong: ["auto", "tele"], ja: "生態系（いきものと 自然の つながり）", note: "eco（自然・すみか）＋ system（しくみ）" },
  deforestation: { parts: ["de", "forest", "ation"], blank: 0, wrong: ["pre", "un"], ja: "森を きって なくす こと", note: "de（とりさる）＋ forest（森）＋ ation" },
  global: { parts: ["glob", "al"], blank: 1, wrong: ["ful", "ous"], ja: "地球ぜんたいの・せかいの", note: "globe（地球）の e を とって -al" },
  endangered: { parts: ["en", "danger", "ed"], blank: 0, wrong: ["un", "dis"], ja: "絶滅の おそれが ある", note: "en（～の なかに）＋ danger（きけん）＋ ed" },
  solar: { parts: ["sol", "ar"], blank: 0, wrong: ["lun", "vol"], ja: "太陽の", note: "sol は「太陽」（lun は「月」で lunar ＝ 月の）" },
  reusable: { parts: ["re", "us", "able"], blank: 0, wrong: ["pre", "dis"], ja: "なんども つかえる", note: "re（もう いちど）＋ use（つかう）の e を とって ＋ able" },
};

export interface EcoWordQuestion {
  word: string;
  parts: string[];
  blank: number;
  ja: string;
  note: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 環境の ことばの パーツの 問題。表に なければ null */
export function ecoWordOf(word: string): EcoWordQuestion | null {
  const w = norm(word);
  const x = own(ECO, w);
  if (!x) return null;
  return { word: w, parts: x.parts, blank: x.blank, ja: x.ja, note: x.note, answer: x.parts[x.blank], wrong: x.wrong };
}

export function ecoWordDisplay(q: EcoWordQuestion): string {
  return `${q.parts.map((p, i) => (i === q.blank ? "＿＿" : p)).join(" ＋ ")}（${q.ja}）`;
}

export function ecoWordWhy(q: EcoWordQuestion): string {
  return `${q.word}（${q.ja}）。${q.note}。長い 環境の ことばも パーツに わけると いみが わかって、つづりも おぼえやすいよ。`;
}

// ---------------------------------------------------------------------------
// 大きな 数と 割合
// ---------------------------------------------------------------------------

/** よみかた → 数字・ばめん・まちがい 2つ・こつ */
const NUMBERS: Record<string, { shown: string; ctx?: string; wrong: [string, string]; tip: string }> = {
  "one million": { shown: "1,000,000", ctx: "0 が 6こ", wrong: ["one billion", "ten thousand"], tip: "0 が 6こで million（100 万）" },
  "ten million": { shown: "10,000,000", ctx: "1,000 万", wrong: ["one million", "ten millions"], tip: "million が 10こで ten million。数の あとの million に s は つけない" },
  "one hundred million": { shown: "100,000,000", ctx: "1 億", wrong: ["ten million", "one hundred millions"], tip: "1 億は one hundred million（100 × 100 万）。million に s は つけない" },
  "one billion": { shown: "1,000,000,000", ctx: "0 が 9こ・10 億", wrong: ["one million", "ten billion"], tip: "0 が 9こで billion（10 億）" },
  "eight billion": { shown: "8,000,000,000", ctx: "地球の 人口 やく 80 億人", wrong: ["eight billions", "eight million"], tip: "80 億は eight billion。数の あとの billion に s は つけない" },
  "two point five million": { shown: "2.5 million", ctx: "250 万", wrong: ["two five million", "twenty-five million"], tip: "小数点は point と よむ（2.5 ＝ two point five）" },
  half: { shown: "1/2", ctx: "2 分の 1", wrong: ["one two", "a second"], tip: "2 分の 1 は half（a half・one half とも いう）" },
  "one third": { shown: "1/3", ctx: "3 分の 1", wrong: ["one three", "one thirds"], tip: "分母は third（3 番目）の 形。1 つだから s は つけない" },
  "two thirds": { shown: "2/3", ctx: "3 分の 2", wrong: ["two third", "two threes"], tip: "分子が 2 いじょうなら thirds と s を つける" },
  "a quarter": { shown: "1/4", ctx: "4 分の 1", wrong: ["a four", "one fours"], tip: "4 分の 1 は a quarter（one fourth とも いう）" },
  "fifty percent": { shown: "50%", ctx: "半分", wrong: ["fifty percents", "fifteen percent"], tip: "% は percent。s は つけない。fifty（50）と fifteen（15）に ちゅうい" },
  "seventy percent": { shown: "70%", ctx: "地球の 表面の 水の わりあい", wrong: ["seventy percents", "seventeen percent"], tip: "% は percent。s は つけない。seventy（70）と seventeen（17）に ちゅうい" },
};

export interface BigNumberQuestion {
  word: string;
  shown: string;
  ctx?: string;
  tip: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 数の よみかたの 問題。表に なければ null */
export function bigNumberOf(word: string): BigNumberQuestion | null {
  const w = norm(word);
  const x = own(NUMBERS, w);
  if (!x) return null;
  return { word: w, shown: x.shown, ctx: x.ctx, tip: x.tip, answer: w, wrong: x.wrong };
}

export function bigNumberDisplay(q: BigNumberQuestion): string {
  return q.ctx ? `${q.shown}（${q.ctx}）` : q.shown;
}

export function bigNumberWhy(q: BigNumberQuestion): string {
  return `${q.shown} は ${q.answer}。${q.tip}。せかいの 課題の データを 話す ときに よく つかうよ。`;
}

// ---------------------------------------------------------------------------
// ディベートの プロソディ（主張は つよく・はっきり）
// ---------------------------------------------------------------------------

/** 文の はじめ → 例文・いちばん つよく いう ことば・まちがい 2つ（どれも 例文の なかの ことば） */
const DEBATES: Record<string, { sentence: string; stress: string; wrong: [string, string] }> = {
  "Our main point is": { sentence: "Our main point is that gardens are good for everyone.", stress: "main", wrong: ["our", "is"] },
  "Let me explain why": { sentence: "Let me explain why we need a sharing shelf.", stress: "why", wrong: ["let", "me"] },
  "This is the key point": { sentence: "This is the key point of our speech.", stress: "key", wrong: ["this", "the"] },
  "We believe that": { sentence: "We believe that schools should have gardens.", stress: "believe", wrong: ["we", "that"] },
  "We strongly believe": { sentence: "We strongly believe that every child can help.", stress: "strongly", wrong: ["we", "that"] },
  "That is not true": { sentence: "I'm afraid that is not true.", stress: "not", wrong: ["that", "is"] },
  "Our first point is": { sentence: "Our first point is that gardens teach us about food.", stress: "first", wrong: ["our", "is"] },
  "Our second point is": { sentence: "Our second point is that gardens are fun.", stress: "second", wrong: ["our", "is"] },
  "Let me give an example": { sentence: "Let me give an example from my town.", stress: "example", wrong: ["let", "an"] },
  "We disagree because": { sentence: "We disagree because gardens take a lot of time.", stress: "disagree", wrong: ["we", "because"] },
  "We do not agree": { sentence: "We do not agree with that idea.", stress: "not", wrong: ["we", "do"] },
  "The other team said": { sentence: "The other team said that gardens cost too much.", stress: "other", wrong: ["the", "said"] },
};
const DEBATE_KEYS: Record<string, string> = Object.fromEntries(Object.keys(DEBATES).map((k) => [norm(k), k]));
/** つよく いう ところ（大文字）の かきかた */
const STRESSED: Record<string, string> = { believe: "beLIEVE", strongly: "STRONGly", second: "SECond", example: "exAMple", disagree: "disaGREE", other: "OTHer" };

export interface DebateQuestion {
  phrase: string;
  sentence: string;
  stressed: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある ディベートの 文の はじめの 問題。表に なければ null */
export function debateOf(phrase: string): DebateQuestion | null {
  const k = own(DEBATE_KEYS, norm(phrase));
  if (!k) return null;
  const x = DEBATES[k];
  return { phrase: k, sentence: x.sentence, stressed: STRESSED[x.stress] ?? x.stress.toUpperCase(), answer: x.stress, wrong: x.wrong };
}

export function debateDisplay(q: DebateQuestion): string {
  return q.sentence;
}

export function debateWhy(q: DebateQuestion): string {
  return `${q.phrase} は ${q.stressed} を いちばん つよく。ディベートでは 主張の かぎに なる ことばを ゆっくり はっきり つよく いって、さいごは 下げる（↘）と 自信が つたわるよ。${q.wrong.join("・")} は かるく いう ことば。`;
}

// ---------------------------------------------------------------------------
// つなぎの ことば（ディスコースマーカー）
// ---------------------------------------------------------------------------

/** つなぎの ことば → ＿＿ の 文・いみ・よみかた・まちがい 2つ（どれも この 表の ことば） */
const MARKERS: Record<string, { blank: string; ja: string; say: string; wrong: [string, string] }> = {
  However: { blank: "Plastic is useful. ＿＿, it can harm the sea.", ja: "でも・しかし（はんたいの ことを いう）", say: "howEVer,", wrong: ["For example", "In addition"] },
  Therefore: { blank: "A dripping tap wastes a lot of water. ＿＿, we should fix it.", ja: "だから・したがって", say: "THEREfore,", wrong: ["However", "Instead"] },
  "For example": { blank: "We can save energy at home. ＿＿, we can turn off the lights.", ja: "たとえば", say: "for exAMple,", wrong: ["However", "In conclusion"] },
  Moreover: { blank: "School gardens teach us about food. ＿＿, they make the school beautiful.", ja: "さらに（もっと 点を くわえる）", say: "moreOver,", wrong: ["However", "Instead"] },
  "As a result": { blank: "Many people brought their own bags. ＿＿, the town used less plastic.", ja: "その けっか", say: "as a reSULT,", wrong: ["However", "For example"] },
  "On the other hand": { blank: "Cars are fast. ＿＿, bikes are better for the air.", ja: "いっぽうで（べつの がわから 見ると）", say: "on the OTHer hand,", wrong: ["Therefore", "For example"] },
  "In addition": { blank: "We will put up posters. ＿＿, we will sing a song at lunch.", ja: "それに くわえて", say: "in adDItion,", wrong: ["However", "Instead"] },
  Instead: { blank: "Don't throw away the bread. ＿＿, put it on the sharing shelf.", ja: "その かわりに", say: "inSTEAD,", wrong: ["Moreover", "As a result"] },
  "In conclusion": { blank: "＿＿, small actions can make a big difference.", ja: "さいごに まとめると", say: "in conCLUsion,", wrong: ["For example", "Instead"] },
  "First of all": { blank: "We have three ideas. ＿＿, we will start a sharing shelf.", ja: "まず はじめに", say: "FIRST of all,", wrong: ["However", "As a result"] },
  Finally: { blank: "First, we made posters. Next, we wrote a song. ＿＿, we sang it at lunch.", ja: "さいごに", say: "FInally,", wrong: ["First of all", "For example"] },
  "Because of this": { blank: "The shop now sells funny-shaped carrots. ＿＿, less food is wasted.", ja: "この ために", say: "because of THIS,", wrong: ["However", "Instead"] },
};
const MARKER_KEYS: Record<string, string> = Object.fromEntries(Object.keys(MARKERS).map((k) => [norm(k), k]));

export interface MarkerQuestion {
  marker: string;
  blank: string;
  ja: string;
  say: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある つなぎの ことばの 問題。表に なければ null */
export function markerOf(word: string): MarkerQuestion | null {
  const k = own(MARKER_KEYS, norm(word));
  if (!k) return null;
  const x = MARKERS[k];
  return { marker: k, blank: x.blank, ja: x.ja, say: x.say, answer: k, wrong: x.wrong };
}

export function markerDisplay(q: MarkerQuestion): string {
  return q.blank;
}

export function markerWhy(q: MarkerQuestion): string {
  return `${q.marker}（${q.ja}）。よむ ときは ${q.say} と 大文字の ところを つよく いって、コンマの あとに ちょっと 間を あけると、きいて いる 人に 話の 道すじが つたわるよ。`;
}

// ---------------------------------------------------------------------------
// ヘッジの ことば（いいすぎない）
// ---------------------------------------------------------------------------

/** ことば → ＿＿ の 文・いみ・まちがい 2つ（いいすぎの ことば） */
const HEDGES: Record<string, { blank: string; ja: string; wrong: [string, string] }> = {
  seem: { blank: "Kids ＿＿ to like the sharing shelf.", ja: "～の ようだ", wrong: ["are sure", "are certain"] },
  appear: { blank: "The water ＿＿ to be clean, but let's test it.", ja: "～の ように 見える", wrong: ["is sure", "is certain"] },
  might: { blank: "This idea ＿＿ work in our town.", ja: "～かも しれない", wrong: ["will", "must"] },
  may: { blank: "The shelf ＿＿ need more helpers.", ja: "～かも しれない", wrong: ["will", "must"] },
  probably: { blank: "It will ＿＿ rain this afternoon.", ja: "たぶん", wrong: ["definitely", "never"] },
  possibly: { blank: "The river could ＿＿ be clean again in ten years.", ja: "ひょっとしたら", wrong: ["definitely", "surely"] },
  perhaps: { blank: "This is ＿＿ the best idea.", ja: "もしかしたら", wrong: ["definitely", "clearly"] },
  likely: { blank: "More families are ＿＿ to join next year.", ja: "～しそう", wrong: ["sure", "certain"] },
  usually: { blank: "The shop ＿＿ throws away bread at night.", ja: "たいてい", wrong: ["always", "never"] },
  generally: { blank: "Children ＿＿ like sweet fruit.", ja: "だいたい・ふつうは", wrong: ["all", "always"] },
  almost: { blank: "We recycled ＿＿ all of our bottles.", ja: "ほとんど", wrong: ["exactly", "totally"] },
  about: { blank: "We waste ＿＿ one third of our food.", ja: "やく・だいたい", wrong: ["exactly", "only"] },
};

export interface HedgeQuestion {
  word: string;
  blank: string;
  ja: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある ヘッジの ことばの 問題。表に なければ null */
export function hedgeOf(word: string): HedgeQuestion | null {
  const w = norm(word);
  const x = own(HEDGES, w);
  if (!x) return null;
  return { word: w, blank: x.blank, ja: x.ja, answer: w, wrong: x.wrong };
}

export function hedgeDisplay(q: HedgeQuestion): string {
  return `${q.blank}（${q.ja}）`;
}

export function hedgeWhy(q: HedgeQuestion): string {
  return `${q.word}（${q.ja}）。${q.wrong.join("・")} だと「ぜったい」の いいかたに なって いいすぎに なるよ。たしかでない ときは ヘッジの ことばで ていねいに いおう。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w39FocusOf(word: string): string | null {
  const e = ecoWordOf(word);
  if (e) return e.word;
  const n = bigNumberOf(word);
  if (n) return n.word;
  const d = debateOf(word);
  if (d) return d.phrase.toLowerCase();
  const m = markerOf(word);
  if (m) return m.marker.toLowerCase();
  const h = hedgeOf(word);
  if (h) return h.word;
  return null;
}

/**
 * その回の ことばが ワールド39 の 回の ものか（ことばが 2こ いじょうで、ぜんぶ ワールド39 の 表に ある。
 * about・may・half の 1こだけの まえの 回で はたらかない ように）。
 * （L1140 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW39Words(words: readonly string[]): boolean {
  return words.length >= 2 && words.every((w) => w39FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド39）。その focus の ことば・数・文の はじめ・つなぎの ことばを よむ。
 * 英字・スペース・アポストロフィ だけ。あてはまらなければ null
 */
export function w39Say(focus: string, words: readonly string[]): string | null {
  if (!isW39Words(words)) return null;
  const w = words.find((x) => w39FocusOf(x) === focus);
  if (!w) return null;
  return w.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド39）。あてはまらなければ null */
export function w39Example(focus: string, words: readonly string[]): string | null {
  return w39Say(focus, words);
}
