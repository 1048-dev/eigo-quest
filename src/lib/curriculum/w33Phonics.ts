/**
 * ワールド33（ほのおの火山島・L961〜990・ステージ4）の フォニックス・つづりの表（地球の しくみ・防災の ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 語根 rupt: 「rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？」（The volcano may ＿＿ again someday.（ふんかする）→ erupt / eruption / interrupt）
 * - -ance・-ence・-ency・-ty: 「ものの なまえ（名詞）に すると？ ただしい つづりは どれ？」（distant（とおい）→ ＿＿（きょり）→ distance / distence / distanse）
 * - -proof の 複合語: 「-proof（〜を ふせぐ・〜に つよい）の ことば。あう ことばは どれ？」（Keep your papers in a ＿＿ bag.（水を とおさない）→ waterproof / fireproof / soundproof）
 * - リストの 読みかた: 「リストを いう ときの こえの 上がり下がりは どれ？」（water ↗, food ↗, and a flashlight ↘）・
 *   「どっち？と きく ときの こえの 上がり下がりは どれ？」（an earthquake ↗ or a typhoon ↘）。音は 文の おわりに . か ? を つけて よむ
 * - 語根 ject: 「ject（なげる）の まえに つく パーツは どれ？」（＿＿ject「スクリーンに うつす・けいかく」→ pro / in / ob）
 *
 * focus の かきかた:
 * - rupt は "rupt"。名詞の おわりは "-ance" "-ence" "-ency" "-ty"。-proof は "-proof"。ject は "ject"。
 * - リストは "and"（ならべて いう 文）と "or"（どっち？と きく 文）。
 * まちがいの 選択肢は 表に 手で 書く（名詞の おわりは ない ことば だけ。rupt・-proof は 表に ある ことば。ject は 表に ある パーツ）。
 */

/** ワールド33 が はじまる レッスン（それより前の 回では ワールド33 の 問題に しない） */
export const W33_START = 961;

const own = <T>(table: Record<string, T>, w: string): T | undefined => (Object.prototype.hasOwnProperty.call(table, w) ? table[w] : undefined);

// ---------------------------------------------------------------------------
// 語根 rupt（やぶれる・こわれる）
// ---------------------------------------------------------------------------

/** ことば → パーツ・いみ・文（＿＿ に 入る）・まちがいの 選択肢 2つ（表の ほかの rupt の ことば） */
const RUPT: Record<string, { parts: string; meaning: string; sentence: string; wrong: [string, string] }> = {
  erupt: { parts: "e（そとへ）＋ rupt（やぶれる）", meaning: "ふんかする", sentence: "The volcano may ＿＿ again someday.", wrong: ["eruption", "interrupt"] },
  eruption: { parts: "erupt（ふんかする）＋ ion（〜する こと）", meaning: "ふんか", sentence: "The last ＿＿ was about 300 years ago.", wrong: ["erupt", "disruption"] },
  erupted: { parts: "erupt（ふんかする）＋ ed（〜した）", meaning: "ふんかした", sentence: "Long ago, the volcano ＿＿ and made this island.", wrong: ["interrupted", "eruption"] },
  erupting: { parts: "erupt（ふんかする）＋ ing（〜して いる）", meaning: "ふんかして いる", sentence: "Look! Our model volcano is ＿＿!", wrong: ["interrupting", "eruption"] },
  interrupt: { parts: "inter（あいだに）＋ rupt（やぶる）", meaning: "（はなしに）わりこむ", sentence: "Please don't ＿＿ when someone is speaking.", wrong: ["erupt", "interruption"] },
  interruption: { parts: "interrupt（わりこむ）＋ ion（〜する こと）", meaning: "とちゅうで とまる こと・じゃま", sentence: "Sorry for the ＿＿. Please go on.", wrong: ["interrupt", "eruption"] },
  interrupted: { parts: "interrupt（わりこむ）＋ ed（〜された）", meaning: "とちゅうで とめられた", sentence: "The TV show was ＿＿ by an important message.", wrong: ["erupted", "interruption"] },
  interrupting: { parts: "interrupt（わりこむ）＋ ing（〜して いる）", meaning: "わりこんで いる", sentence: "Excuse me for ＿＿, but the bus is here.", wrong: ["erupting", "interruption"] },
  disrupt: { parts: "dis（ばらばらに）＋ rupt（こわす）", meaning: "（いつもの ようすを）みだす", sentence: "Heavy snow can ＿＿ trains and buses.", wrong: ["eruption", "abrupt"] },
  disruption: { parts: "disrupt（みだす）＋ ion（〜する こと）", meaning: "（いつもの くらしの）みだれ", sentence: "The storm caused a big ＿＿ to our town.", wrong: ["disrupt", "abrupt"] },
  abrupt: { parts: "ab（はなれて）＋ rupt（ちぎれる）", meaning: "とつぜんの", sentence: "The bus came to an ＿＿ stop.", wrong: ["erupt", "disruption"] },
  abruptly: { parts: "abrupt（とつぜんの）＋ ly（〜に）", meaning: "とつぜん・いきなり", sentence: "The shaking stopped ＿＿.", wrong: ["abrupt", "eruption"] },
  rupture: { parts: "rupt（やぶれる）＋ ure（〜する こと）", meaning: "はれつ・やぶれる こと", sentence: "A ＿＿ in the water pipe made a big puddle.", wrong: ["abrupt", "interrupt"] },
};

export interface RuptQuestion {
  word: string;
  parts: string;
  meaning: string;
  sentence: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある rupt の ことばの 問題（文と いみ → ことば）。表に なければ null */
export function ruptOf(word: string): RuptQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(RUPT, w);
  if (!x) return null;
  return { word: w, parts: x.parts, meaning: x.meaning, sentence: x.sentence, answer: w, wrong: x.wrong };
}

export function ruptDisplay(q: RuptQuestion): string {
  return `${q.sentence}（${q.meaning}）`;
}

export function ruptWhy(q: RuptQuestion): string {
  return `${q.answer}（${q.parts}）は「${q.meaning}」。rupt は「やぶれる・こわれる」と いう いみの パーツ。erupt（ふんかする）・interrupt（わりこむ）・disrupt（みだす）の ように、まえの パーツで いみが かわる。おわりの かたち（-ion・-ed・-ing・-ly）で 文の なかの やくわりも かわるよ。`;
}

// ---------------------------------------------------------------------------
// 名詞の おわり（-ance・-ence・-ency・-ty）
// ---------------------------------------------------------------------------

export type NounEndFocus = "-ance" | "-ence" | "-ency" | "-ty";

/** 名詞 → focus・もとの ことば・いみ・名詞の いみ・つくりかた・まちがいの つづり 2つ（ない ことば） */
const NOUN_END: Record<string, { focus: NounEndFocus; base: string; baseJa: string; nounJa: string; how: string; wrong: [string, string] }> = {
  distance: { focus: "-ance", base: "distant", baseJa: "とおい", nounJa: "きょり", how: "distant の ant → ance", wrong: ["distence", "distanse"] },
  importance: { focus: "-ance", base: "important", baseJa: "大切な", nounJa: "大切さ", how: "important の ant → ance", wrong: ["importence", "importanse"] },
  entrance: { focus: "-ance", base: "enter", baseJa: "入る", nounJa: "いりぐち", how: "enter の e が きえて entr ＋ ance", wrong: ["enterance", "entrence"] },
  guidance: { focus: "-ance", base: "guide", baseJa: "あんないする", nounJa: "あんない・しどう", how: "guide の e を とって ＋ ance", wrong: ["guideance", "guidence"] },
  assistance: { focus: "-ance", base: "assist", baseJa: "てつだう", nounJa: "てだすけ", how: "assist ＋ ance", wrong: ["assistence", "asistance"] },
  appearance: { focus: "-ance", base: "appear", baseJa: "あらわれる", nounJa: "あらわれる こと・見た目", how: "appear ＋ ance", wrong: ["appearence", "apperance"] },
  silence: { focus: "-ence", base: "silent", baseJa: "しずかな", nounJa: "しずけさ", how: "silent の ent → ence", wrong: ["silance", "silense"] },
  difference: { focus: "-ence", base: "different", baseJa: "ちがう", nounJa: "ちがい", how: "different の ent → ence", wrong: ["differance", "diference"] },
  confidence: { focus: "-ence", base: "confident", baseJa: "じしんの ある", nounJa: "じしん", how: "confident の ent → ence", wrong: ["confidance", "confidense"] },
  patience: { focus: "-ence", base: "patient", baseJa: "がまんづよい", nounJa: "にんたい・がまん", how: "patient の ent → ence", wrong: ["patiance", "pashence"] },
  absence: { focus: "-ence", base: "absent", baseJa: "やすんで いる", nounJa: "けっせき・いない こと", how: "absent の ent → ence", wrong: ["absance", "absense"] },
  emergency: { focus: "-ency", base: "emerge", baseJa: "きゅうに でて くる", nounJa: "ひじょうじ・きんきゅう", how: "emerge の e を とって ＋ ency", wrong: ["emergancy", "emergensy"] },
  urgency: { focus: "-ency", base: "urgent", baseJa: "いそぎの", nounJa: "いそぐ ひつよう", how: "urgent の ent → ency", wrong: ["urgancy", "urgensy"] },
  frequency: { focus: "-ency", base: "frequent", baseJa: "よく おこる", nounJa: "どの くらい よく おこるか・ひんど", how: "frequent の ent → ency", wrong: ["frequancy", "frequensy"] },
  fluency: { focus: "-ency", base: "fluent", baseJa: "すらすら はなせる", nounJa: "すらすら はなせる こと", how: "fluent の ent → ency", wrong: ["fluancy", "fluensy"] },
  safety: { focus: "-ty", base: "safe", baseJa: "あんぜんな", nounJa: "あんぜん", how: "safe の e は のこして ＋ ty", wrong: ["safty", "safetey"] },
  loyalty: { focus: "-ty", base: "loyal", baseJa: "ちゅうじつな", nounJa: "ちゅうじつさ", how: "loyal ＋ ty", wrong: ["loyality", "loyalety"] },
  honesty: { focus: "-ty", base: "honest", baseJa: "しょうじきな", nounJa: "しょうじきさ", how: "honest ＋ y（t は 1つ）", wrong: ["honestty", "honisty"] },
  certainty: { focus: "-ty", base: "certain", baseJa: "たしかな", nounJa: "たしかさ", how: "certain ＋ ty", wrong: ["certanty", "certainity"] },
};

export interface NounEndQuestion {
  word: string;
  focus: NounEndFocus;
  base: string;
  baseJa: string;
  nounJa: string;
  how: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 名詞の おわりの ことばの 問題（もとの ことば → 名詞の つづり）。表に なければ null */
export function nounEndOf(word: string): NounEndQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(NOUN_END, w);
  if (!x) return null;
  return { word: w, focus: x.focus, base: x.base, baseJa: x.baseJa, nounJa: x.nounJa, how: x.how, answer: w, wrong: x.wrong };
}

export function nounEndDisplay(q: NounEndQuestion): string {
  return `${q.base}（${q.baseJa}）→ ＿＿（${q.nounJa}）`;
}

export function nounEndWhy(q: NounEndQuestion): string {
  const how: Record<NounEndFocus, string> = {
    "-ance": "-ant で おわる ことば（distant・important）や enter・guide・assist・appear は ance に なる ことが おおい。",
    "-ence": "-ent で おわる ことば（silent・different）は ence に なる。ance と おとは おなじなので、もとの ことばの ant・ent を 思い出そう。",
    "-ency": "-ent で おわる ことば（urgent・fluent）は ency にも なる。おわりは「ンシー」と きこえるけど、つづりは e-n-c-y。",
    "-ty": "ようすの ことば ＋ ty（y）で「〜さ」と いう ものの なまえ。safe の e は きえないで safety に なるよ。",
  };
  return `${q.answer}（${q.how}）。${how[q.focus]}`;
}

// ---------------------------------------------------------------------------
// -proof の 複合語（〜を ふせぐ・〜に つよい）
// ---------------------------------------------------------------------------

/** ことば → いみ・文（＿＿ に 入る）・まちがいの 選択肢 2つ（表の ほかの -proof の ことば） */
const PROOF: Record<string, { meaning: string; sentence: string; wrong: [string, string] }> = {
  waterproof: { meaning: "水を とおさない", sentence: "Keep your papers in a ＿＿ bag.", wrong: ["fireproof", "soundproof"] },
  windproof: { meaning: "風を とおさない", sentence: "This ＿＿ jacket keeps out the cold wind.", wrong: ["fireproof", "childproof"] },
  leakproof: { meaning: "もれない", sentence: "My ＿＿ water bottle never drips.", wrong: ["fireproof", "soundproof"] },
  childproof: { meaning: "小さな 子どもが あけられない", sentence: "Medicine bottles have ＿＿ caps.", wrong: ["shockproof", "windproof"] },
  heatproof: { meaning: "ねつに つよい", sentence: "Put the hot pot on a ＿＿ mat.", wrong: ["soundproof", "childproof"] },
  shockproof: { meaning: "おとしても こわれにくい", sentence: "My ＿＿ watch still works after I dropped it.", wrong: ["heatproof", "soundproof"] },
  soundproof: { meaning: "おとを とおさない", sentence: "The music room has ＿＿ walls.", wrong: ["waterproof", "shockproof"] },
  dustproof: { meaning: "ほこりや すなが 入らない", sentence: "The radio is ＿＿, so sand can't get inside.", wrong: ["heatproof", "childproof"] },
  rustproof: { meaning: "さびない", sentence: "The ladder is ＿＿, so it stays shiny in the rain.", wrong: ["soundproof", "foolproof"] },
  fireproof: { meaning: "火に つよい・もえない", sentence: "Important papers are kept in a ＿＿ box.", wrong: ["windproof", "childproof"] },
  "earthquake-proof": { meaning: "じしんに つよい", sentence: "This new school building is ＿＿.", wrong: ["soundproof", "waterproof"] },
  foolproof: { meaning: "だれでも まちがえずに つかえる", sentence: "This ＿＿ flashlight is easy for anyone to use.", wrong: ["dustproof", "heatproof"] },
};

export interface ProofQuestion {
  word: string;
  meaning: string;
  sentence: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -proof の ことばの 問題（文と いみ → ことば）。表に なければ null */
export function proofOf(word: string): ProofQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(PROOF, w);
  if (!x) return null;
  return { word: w, meaning: x.meaning, sentence: x.sentence, answer: w, wrong: x.wrong };
}

export function proofDisplay(q: ProofQuestion): string {
  return `${q.sentence}（${q.meaning}）`;
}

export function proofWhy(q: ProofQuestion): string {
  const first = q.answer.replace(/-?proof$/, "");
  const hyphen = q.answer.includes("-") ? `${first} の ような ながい ことばの ときは ハイフン（-）で つなぐ ことが おおい。` : "ふつうは 1つの ことばに くっつけて かく（スペースは いれない）。";
  return `${q.answer} は「${q.meaning}」。proof は「〜を ふせぐ・〜に つよい」。${first} ＋ proof で「${first} から まもる」と いう ことば。${hyphen}`;
}

// ---------------------------------------------------------------------------
// リストの 読みかた（ならべる 文 ↗ ↗ ↘ ・ どっち？の 文 ↗ ↘）
// ---------------------------------------------------------------------------

export type ListFocus = "and" | "or";

/** 文（おわりの . ? なし）→ focus・まとまり（こえを 上げ下げする ところ）・いみ */
const LISTS: Record<string, { focus: ListFocus; items: string[]; meaning: string }> = {
  "We need water, food, and a flashlight": { focus: "and", items: ["water", "food", "and a flashlight"], meaning: "水と たべものと かいちゅうでんとうが ひつようだ" },
  "Drop, cover, and hold on": { focus: "and", items: ["Drop", "cover", "and hold on"], meaning: "ひくく して、あたまを まもって、じっと して" },
  "Bring a radio, batteries, and a whistle": { focus: "and", items: ["a radio", "batteries", "and a whistle"], meaning: "ラジオと でんちと ふえを もって いこう" },
  "Stay calm, listen, and follow your teacher": { focus: "and", items: ["Stay calm", "listen", "and follow your teacher"], meaning: "おちついて、よく きいて、先生に ついて いこう" },
  "Check the doors, the windows, and the gas": { focus: "and", items: ["the doors", "the windows", "and the gas"], meaning: "ドアと まどと ガスを たしかめよう" },
  "We have rice, bread, crackers, and water": { focus: "and", items: ["rice", "bread", "crackers", "and water"], meaning: "おこめと パンと クラッカーと 水が ある" },
  "Pack socks, gloves, and a warm hat": { focus: "and", items: ["socks", "gloves", "and a warm hat"], meaning: "くつしたと てぶくろと あたたかい ぼうしを つめよう" },
  "Find the exits, the stairs, and the meeting place": { focus: "and", items: ["the exits", "the stairs", "and the meeting place"], meaning: "でぐちと かいだんと あつまる ばしょを さがそう" },
  "Is it an earthquake or a typhoon": { focus: "or", items: ["an earthquake", "or a typhoon"], meaning: "じしん？ それとも たいふう？" },
  "Should we go up or stay here": { focus: "or", items: ["go up", "or stay here"], meaning: "上に いく？ それとも ここに いる？" },
  "Is the exit on the left or on the right": { focus: "or", items: ["on the left", "or on the right"], meaning: "でぐちは ひだり？ それとも みぎ？" },
  "Do you want water or juice": { focus: "or", items: ["water", "or juice"], meaning: "水が いい？ それとも ジュース？" },
  "Do we use the stairs or the elevator": { focus: "or", items: ["the stairs", "or the elevator"], meaning: "かいだんを つかう？ それとも エレベーター？" },
  "Is it safe or dangerous": { focus: "or", items: ["safe", "or dangerous"], meaning: "あんぜん？ それとも きけん？" },
  "Do we walk or run": { focus: "or", items: ["walk", "or run"], meaning: "あるく？ それとも はしる？" },
  "Is the shelter near or far": { focus: "or", items: ["near", "or far"], meaning: "ひなんじょは ちかい？ それとも とおい？" },
  "Is it a drill or a real alarm": { focus: "or", items: ["a drill", "or a real alarm"], meaning: "くんれん？ それとも ほんものの けいほう？" },
};
const LIST_KEYS: Record<string, string> = Object.fromEntries(Object.keys(LISTS).map((k) => [k.toLowerCase(), k]));

const UP = "↗";
const DOWN = "↘";

/** まとまりに 矢印を つけた 1つの 選択肢（water ↗, food ↗, and a flashlight ↘） */
function marked(items: readonly string[], arrows: readonly string[], focus: ListFocus): string {
  const parts = items.map((x, i) => `${x} ${arrows[i]}`);
  return focus === "or" ? parts.join(" ") : parts.join(", ");
}

export interface ListQuestion {
  sentence: string;
  focus: ListFocus;
  items: string[];
  meaning: string;
  answer: string;
  wrong: [string, string];
  /** 読み上げる 文（おわりに . か ?） */
  say: string;
}

/** 表に ある 文の 問題。表に なければ null */
export function listOf(sentence: string): ListQuestion | null {
  const k = own(LIST_KEYS, sentence.toLowerCase().trim());
  if (!k) return null;
  const x = LISTS[k];
  const n = x.items.length;
  const fill = (f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i));
  const last = (i: number) => i === n - 1;
  const answer = marked(x.items, fill((i) => (last(i) ? DOWN : UP)), x.focus);
  const wrong: [string, string] =
    x.focus === "or"
      ? [marked(x.items, [DOWN, UP], x.focus), marked(x.items, [DOWN, DOWN], x.focus)]
      : [marked(x.items, fill((i) => (last(i) ? UP : DOWN)), x.focus), marked(x.items, fill(() => UP), x.focus)];
  return { sentence: k, focus: x.focus, items: [...x.items], meaning: x.meaning, answer, wrong, say: `${k}${x.focus === "or" ? "?" : "."}` };
}

export function listPrompt(q: ListQuestion): string {
  return q.focus === "or" ? "「どっち？」と きく ときの こえの 上がり下がりは どれ？" : "リストを いう ときの こえの 上がり下がりは どれ？";
}

export function listDisplay(q: ListQuestion): string {
  return `${q.say}（${q.meaning}）`;
}

export function listWhy(q: ListQuestion): string {
  if (q.focus === "or") return `${q.answer}。「A？ それとも B？」と えらんで もらう ときは、A で こえを 上げて（↗）、さいごの B で 下げる（↘）。下げると「どちらか 1つ えらんでね」と つたわるよ。`;
  return `${q.answer}。ならべて いう ときは、とちゅうの ものは こえを 上げて（↗「まだ つづくよ」）、さいごの and の あとで 下げる（↘「これで おわり」）。ひなんの ときの もちものや 手じゅんも、この 上がり下がりで はっきり つたわるよ。`;
}

// ---------------------------------------------------------------------------
// 語根 ject（なげる）
// ---------------------------------------------------------------------------

/** ことば → まえの パーツ・パーツの いみ・のこり（ject・jection など）・いみ・まちがいの パーツ 2つ（表に ある パーツ） */
const JECT: Record<string, { prefix: string; prefixJa: string; rest: string; meaning: string; wrong: [string, string] }> = {
  project: { prefix: "pro", prefixJa: "まえへ", rest: "ject", meaning: "スクリーンに うつす・けいかく（プロジェクト）", wrong: ["in", "ob"] },
  projector: { prefix: "pro", prefixJa: "まえへ", rest: "jector", meaning: "プロジェクター（えいぞうを うつす きかい）", wrong: ["in", "e"] },
  subject: { prefix: "sub", prefixJa: "したへ", rest: "ject", meaning: "かもく・テーマ", wrong: ["ob", "re"] },
  object: { prefix: "ob", prefixJa: "〜に むかって", rest: "ject", meaning: "もの・たいしょう", wrong: ["sub", "pro"] },
  objection: { prefix: "ob", prefixJa: "〜に むかって", rest: "jection", meaning: "はんたいの いけん", wrong: ["in", "pro"] },
  interject: { prefix: "inter", prefixJa: "あいだへ", rest: "ject", meaning: "（はなしの とちゅうで）ことばを はさむ", wrong: ["sub", "pro"] },
  inject: { prefix: "in", prefixJa: "なかへ", rest: "ject", meaning: "（くすりを）ちゅうしゃする・なかへ 入れる", wrong: ["pro", "re"] },
  injection: { prefix: "in", prefixJa: "なかへ", rest: "jection", meaning: "ちゅうしゃ", wrong: ["ob", "re"] },
  eject: { prefix: "e", prefixJa: "そとへ", rest: "ject", meaning: "そとへ はじきだす・ふきとばす", wrong: ["in", "sub"] },
  reject: { prefix: "re", prefixJa: "うしろへ・もとへ", rest: "ject", meaning: "ことわる・うけいれない", wrong: ["pro", "sub"] },
  rejection: { prefix: "re", prefixJa: "うしろへ・もとへ", rest: "jection", meaning: "ことわられる こと", wrong: ["in", "pro"] },
  dejected: { prefix: "de", prefixJa: "したへ", rest: "jected", meaning: "がっかりした・しょんぼりした", wrong: ["in", "pro"] },
};

export interface JectQuestion {
  word: string;
  prefix: string;
  prefixJa: string;
  rest: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある ject の ことばの 問題（いみ → まえの パーツ）。表に なければ null */
export function jectOf(word: string): JectQuestion | null {
  const w = word.toLowerCase().trim();
  const x = own(JECT, w);
  if (!x) return null;
  return { word: w, prefix: x.prefix, prefixJa: x.prefixJa, rest: x.rest, meaning: x.meaning, answer: x.prefix, wrong: x.wrong };
}

export function jectDisplay(q: JectQuestion): string {
  return `＿＿${q.rest}「${q.meaning}」`;
}

export function jectWhy(q: JectQuestion): string {
  return `${q.word}（${q.prefix}（${q.prefixJa}）＋ ${q.rest}）は「${q.meaning}」。ject は「なげる」と いう いみの パーツ。pro（まえへ）・in（なかへ）・e（そとへ）・re（うしろへ）・ob（〜に むかって）・sub（したへ）の ように、まえの パーツが「どこへ なげるか」を きめるよ。`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w33FocusOf(word: string): string | null {
  if (ruptOf(word)) return "rupt";
  const e = nounEndOf(word);
  if (e) return e.focus;
  if (proofOf(word)) return "-proof";
  const l = listOf(word);
  if (l) return l.focus;
  if (jectOf(word)) return "ject";
  return null;
}

/**
 * その回の ことばが ワールド33 の 回の ものか。ことばが ぜんぶ ワールド33 の 表に ある とき
 * （L960 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW33Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w33FocusOf(w) !== null);
}

/**
 * フォーカスの 読み上げ（ワールド33）。その focus で 問う ことば・文を よむ（"rupt" "-ance" "and" だけで よまない）。
 * ボタンは 英字と スペース だけ（earthquake-proof → earthquake proof、リストの 文の , は とる）。
 * 上がり下がりを きかせる 問題の 音は listOf(w).say（おわりに . か ?）で よむ。あてはまらなければ null
 */
export function w33Say(focus: string, words: readonly string[]): string | null {
  if (!isW33Words(words)) return null;
  const w = words.find((x) => w33FocusOf(x) === focus);
  if (!w) return null;
  return w.replace(/-/g, " ").replace(/[^A-Za-z' ]/g, "").replace(/\s+/g, " ").trim();
}

/** フォーカスの ボタンで よむ おてほん（ワールド33）。あてはまらなければ null */
export function w33Example(focus: string, words: readonly string[]): string | null {
  return w33Say(focus, words);
}
