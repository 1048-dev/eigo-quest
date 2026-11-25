/**
 * ワールド29（かんがえる灯台・L841〜870・ステージ4 の はじまり）の フォニックス・つづりの表（意見と 話し合いの ことば）。
 * import なし（純粋な データなので、レッスン画面（クライアント）からも使える）。
 *
 * - 語根 spect（みる）: 「spect（みる）の ことば。いみは どれ？」（inspect（in ＋ spect）→ よく 見て しらべる / …）
 * - 語根 dict（いう）: 「ぶんに あう dict の ことばは どれ？」（Can you ＿＿ the weather for tomorrow? → predict / contradict / dictate）
 * - 意見を 強める 文の 強勢（I REALLY think so）: 「いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？」（really / think / so）
 * - 弱形（can, to, for, and の よわい おと）: 「ふつうの はやさで いうと、can は どう きこえる？」（クン / キャン / カーン。選択肢は きまった 順）
 * - -ible・-able（possible, reasonable）: 「ただしい つづりは どれ？」（🔊（ありうる・できる）→ possible / possable / posible）
 *
 * focus の かきかた:
 * - 語根は "spect" "dict"。
 * - 強勢は つよく いう ことば（"really" "do"）。ことばは 文（"I really think so"。記号なし）。
 * - 弱形は よわく いう ことば（"can" "to" "for" "and"）。ことばは 文（"I can help you"。記号なし）。
 * - -ible・-able は "-ible" "-able"。
 * まちがいの 選択肢は 表に 手で 書く。どれも 表に ある ことばだけ 出題する。
 */

/** ワールド29 が はじまる レッスン（それより前の 回では ワールド29 の 問題に しない） */
export const W29_START = 841;

// ---------------------------------------------------------------------------
// 語根 spect（みる）
// ---------------------------------------------------------------------------

/** ことば → パーツ・いみ・まちがいの 選択肢に つかう 表の ことば 2つ（その いみを 出す） */
const SPECT: Record<string, { parts: string; meaning: string; wrong: [string, string] }> = {
  respect: { parts: "re ＋ spect", meaning: "大切に おもう・そんけいする", wrong: ["inspect", "spectator"] },
  inspect: { parts: "in ＋ spect", meaning: "よく 見て しらべる", wrong: ["respect", "suspect"] },
  spectator: { parts: "spect ＋ ator", meaning: "（しあいなどを）見る 人・かんきゃく", wrong: ["inspector", "respect"] },
  suspect: { parts: "su ＋ spect", meaning: "あやしいと おもう・うたがう", wrong: ["respect", "inspect"] },
  inspector: { parts: "in ＋ spect ＋ or", meaning: "しらべる 人・けんさを する 人", wrong: ["spectator", "suspect"] },
  respectful: { parts: "re ＋ spect ＋ ful", meaning: "あいてを 大切に する・ていねいな", wrong: ["spectacular", "suspect"] },
  spectacular: { parts: "spect ＋ acular", meaning: "目を みはる ほど すばらしい", wrong: ["respectful", "inspection"] },
  perspective: { parts: "per ＋ spect ＋ ive", meaning: "ものの 見かた・かんがえかた", wrong: ["spectrum", "inspection"] },
  inspection: { parts: "in ＋ spect ＋ ion", meaning: "よく しらべる こと・けんさ", wrong: ["perspective", "disrespect"] },
  disrespect: { parts: "dis ＋ re ＋ spect", meaning: "あいてを 大切に しない こと・しつれい", wrong: ["perspective", "inspection"] },
  spectacles: { parts: "spect ＋ acles", meaning: "めがね（すこし むかしの いいかた）", wrong: ["spectrum", "inspector"] },
  spectrum: { parts: "spect ＋ rum", meaning: "にじの ような いろの ならび", wrong: ["spectacles", "aspect"] },
  aspect: { parts: "a ＋ spect", meaning: "ものごとの ひとつの 面（見える がわ）", wrong: ["spectacles", "spectator"] },
  respectable: { parts: "re ＋ spect ＋ able", meaning: "ちゃんと して いて みとめられる", wrong: ["inspection", "spectrum"] },
};

export interface SpectQuestion {
  word: string;
  parts: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある spect の ことばの 問題（答えも 選択肢も いみ）。表に なければ null */
export function spectOf(word: string): SpectQuestion | null {
  const w = word.toLowerCase();
  const x = SPECT[w];
  if (!x) return null;
  return { word: w, parts: x.parts, meaning: x.meaning, answer: x.meaning, wrong: [SPECT[x.wrong[0]].meaning, SPECT[x.wrong[1]].meaning] };
}

export function spectDisplay(q: SpectQuestion): string {
  return `${q.word}（${q.parts}）`;
}

export function spectWhy(q: SpectQuestion): string {
  return `spect は「みる」と いう いみの パーツ。${q.word}（${q.parts}）は「${q.meaning}」。パーツの いみが わかると、はじめて 見る ことばでも いみを そうぞう できるよ。`;
}

// ---------------------------------------------------------------------------
// 語根 dict（いう）
// ---------------------------------------------------------------------------

/** ことば → 文（＿＿ に 入る）・いみ・パーツの せつめい・まちがいの 選択肢 2つ */
const DICT: Record<string, { sentence: string; meaning: string; how: string; wrong: [string, string] }> = {
  predict: { sentence: "Can you ＿＿ the weather for tomorrow?", meaning: "よそうする", how: "pre（まえに）＋ dict（いう）→ まえもって いう", wrong: ["contradict", "dictate"] },
  dictionary: { sentence: "Let's look up this word in the ＿＿.", meaning: "じしょ", how: "dict（いう・ことば）＋ ionary → ことばを あつめた 本", wrong: ["dictation", "prediction"] },
  contradict: { sentence: "Your two answers ＿＿ each other.", meaning: "くいちがう・はんたいの ことを いう", how: "contra（はんたいに）＋ dict（いう）→ はんたいの ことを いう", wrong: ["predict", "dictate"] },
  prediction: { sentence: "My ＿＿ was right. It rained!", meaning: "よそう", how: "predict（よそうする）＋ ion → よそう", wrong: ["dictation", "contradiction"] },
  dictation: { sentence: "Let's do a ＿＿. I'll say a sentence, and you write it down.", meaning: "かきとり", how: "dict（いう）＋ ation → いわれた ことを かく こと", wrong: ["prediction", "dictionary"] },
  verdict: { sentence: "The judges gave their ＿＿. Team Blue wins!", meaning: "はんてい・けつろん", how: "ver（ほんとうの）＋ dict（いう）→ きめた ことを いう", wrong: ["dictionary", "prediction"] },
  predictable: { sentence: "The ending was so ＿＿. I knew it from the start.", meaning: "よそう できる・よめる", how: "predict（よそうする）＋ able（できる）", wrong: ["unpredictable", "dictionary"] },
  unpredictable: { sentence: "Mountain weather is ＿＿. It can change very quickly.", meaning: "よそう できない", how: "un（〜ない）＋ predict ＋ able", wrong: ["predictable", "dictation"] },
  dictate: { sentence: "Please ＿＿ the message, and I'll write it down.", meaning: "（かきとって もらう ために）こえに だして いう", how: "dict（いう）＋ ate → こえに だして いう", wrong: ["predict", "contradict"] },
  contradiction: { sentence: "He said yes and no at the same time. That's a ＿＿!", meaning: "むじゅん・くいちがい", how: "contradict（くいちがう）＋ ion", wrong: ["prediction", "dictionary"] },
  dictionaries: { sentence: "Our classroom has ten English ＿＿.", meaning: "じしょ（2さつ 以上）", how: "dictionary の y を i に かえて es", wrong: ["predictions", "verdicts"] },
  predicted: { sentence: "Kiko ＿＿ the winner, and she was right!", meaning: "よそうした", how: "predict（よそうする）＋ ed → よそうした", wrong: ["contradicted", "dictated"] },
};

export interface DictQuestion {
  word: string;
  sentence: string;
  meaning: string;
  how: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある dict の ことばの 問題。表に なければ null */
export function dictOf(word: string): DictQuestion | null {
  const w = word.toLowerCase();
  const x = DICT[w];
  if (!x) return null;
  return { word: w, sentence: x.sentence, meaning: x.meaning, how: x.how, answer: w, wrong: x.wrong };
}

export function dictWhy(q: DictQuestion): string {
  return `dict は「いう」と いう いみの パーツ。${q.answer}（${q.meaning}）は ${q.how}。文に 入れると「${q.sentence.replace("＿＿", q.answer)}」。`;
}

// ---------------------------------------------------------------------------
// 意見を 強める 文の 強勢
// ---------------------------------------------------------------------------

/** 文 → つよく いう ことば・まちがいの 選択肢 2つ（文の なかの ことば）・いみ */
const EMPHASIS: Record<string, { strong: string; wrong: [string, string]; meaning: string }> = {
  "I really think so": { strong: "really", wrong: ["think", "so"], meaning: "ほんとうに そう おもう" },
  "I totally agree with you": { strong: "totally", wrong: ["agree", "you"], meaning: "あなたに 大さんせい" },
  "This is so much fun": { strong: "so", wrong: ["This", "fun"], meaning: "これ、すっごく たのしい" },
  "I love this idea": { strong: "love", wrong: ["this", "idea"], meaning: "この アイデア、だいすき" },
  "We definitely need a break": { strong: "definitely", wrong: ["need", "break"], meaning: "ぜったいに きゅうけいが ひつよう" },
  "I strongly believe it": { strong: "strongly", wrong: ["believe", "it"], meaning: "つよく そう しんじて いる" },
  "That's absolutely true": { strong: "absolutely", wrong: ["That's", "true"], meaning: "まったく その とおり" },
  "I never said that": { strong: "never", wrong: ["said", "that"], meaning: "そんな こと、いちども いって ないよ" },
  "I completely understand": { strong: "completely", wrong: ["I", "understand"], meaning: "すっかり わかるよ" },
  "Reading is very important": { strong: "very", wrong: ["Reading", "important"], meaning: "よむ ことは とても 大切" },
  "I do agree with you": { strong: "do", wrong: ["agree", "you"], meaning: "ほんとうに さんせいだよ" },
  "That's exactly my point": { strong: "exactly", wrong: ["That's", "point"], meaning: "まさに それが いいたかった こと" },
  "It was such a good game": { strong: "such", wrong: ["was", "game"], meaning: "ほんとうに いい しあいだった" },
  "We really should try": { strong: "really", wrong: ["We", "try"], meaning: "ぜひ やって みるべきだよ" },
  "I always keep my promises": { strong: "always", wrong: ["keep", "my"], meaning: "やくそくは いつも まもるよ" },
  "You are so right": { strong: "so", wrong: ["You", "right"], meaning: "ほんとうに その とおり" },
};
const EMPHASIS_KEYS: Record<string, string> = Object.fromEntries(Object.keys(EMPHASIS).map((k) => [k.toLowerCase(), k]));

export interface EmphasisQuestion {
  sentence: string;
  strong: string;
  meaning: string;
  answer: string;
  wrong: [string, string];
}

/** 表に ある 文の 問題。表に なければ null */
export function emphasisOf(sentence: string): EmphasisQuestion | null {
  const k = EMPHASIS_KEYS[sentence.toLowerCase().trim()];
  if (!k) return null;
  const x = EMPHASIS[k];
  return { sentence: k, strong: x.strong, meaning: x.meaning, answer: x.strong, wrong: x.wrong };
}

export function emphasisDisplay(q: EmphasisQuestion): string {
  return `${q.sentence}.（${q.meaning}）`;
}

/** つよく いう ことばを 大文字に した 文（I REALLY think so） */
export function emphasisMarked(q: EmphasisQuestion): string {
  return q.sentence.split(" ").map((w) => (w.toLowerCase() === q.strong.toLowerCase() ? w.toUpperCase() : w)).join(" ");
}

export function emphasisWhy(q: EmphasisQuestion): string {
  return `${emphasisMarked(q)}. — ${q.strong} を いちばん つよく、すこし ながく いうと「${q.meaning}」の きもちが つたわる。いけんを つよく いいたい ときは、つよめる ことば（really・so・do など）を はっきり いおう。`;
}

// ---------------------------------------------------------------------------
// 弱形（can, to, for, and の よわい おと）
// ---------------------------------------------------------------------------

/** よわく いう ことば → よわい ときの きこえかた・ていねいに 1つだけ いう ときの きこえかた・まちがいの きこえかた（選択肢は この 順） */
const WEAK_FORMS: Record<string, { weak: string; strong: string; other: string; ipa: string }> = {
  can: { weak: "クン", strong: "キャン", other: "カーン", ipa: "/kən/" },
  to: { weak: "タ", strong: "トゥー", other: "トー", ipa: "/tə/" },
  for: { weak: "ファ", strong: "フォー", other: "フォーア", ipa: "/fər/" },
  and: { weak: "ン", strong: "アンド", other: "エンド", ipa: "/ən/" },
};

/** 文 → よわく いう ことば・いみ */
const WEAK: Record<string, { weak: string; meaning: string }> = {
  "I can help you": { weak: "can", meaning: "てつだえるよ" },
  "We can do it together": { weak: "can", meaning: "いっしょなら できるよ" },
  "Can you say that again": { weak: "can", meaning: "もう いちど いって くれる？" },
  "You can sit here": { weak: "can", meaning: "ここに すわって いいよ" },
  "I want to go": { weak: "to", meaning: "いきたい" },
  "Let's talk to Kiko": { weak: "to", meaning: "キコに はなして みよう" },
  "I'd like to say something": { weak: "to", meaning: "ひとこと いいたいです" },
  "It's time to decide": { weak: "to", meaning: "きめる じかんだよ" },
  "This is for you": { weak: "for", meaning: "これ、あなたに" },
  "Thanks for waiting": { weak: "for", meaning: "まって くれて ありがとう" },
  "Wait for me": { weak: "for", meaning: "まって" },
  "It's good for everyone": { weak: "for", meaning: "みんなに とって いい" },
  "Come and see": { weak: "and", meaning: "見に おいで" },
  "Let's stop and think": { weak: "and", meaning: "たちどまって かんがえよう" },
  "Kiko and Riko agree": { weak: "and", meaning: "キコと リコは さんせい" },
  "I like black and white": { weak: "and", meaning: "くろと しろが すき" },
};
const WEAK_KEYS: Record<string, string> = Object.fromEntries(Object.keys(WEAK).map((k) => [k.toLowerCase(), k]));

export interface WeakQuestion {
  sentence: string;
  weak: string;
  meaning: string;
  answer: string;
  /** 選択肢（よわい おと・つよい おと・まちがいの おと。きまった 順） */
  choices: [string, string, string];
  strongSay: string;
  ipa: string;
}

/** 表に ある 文の 問題。表に なければ null */
export function weakOf(sentence: string): WeakQuestion | null {
  const k = WEAK_KEYS[sentence.toLowerCase().trim()];
  if (!k) return null;
  const x = WEAK[k];
  const f = WEAK_FORMS[x.weak];
  return { sentence: k, weak: x.weak, meaning: x.meaning, answer: f.weak, choices: [f.weak, f.strong, f.other], strongSay: f.strong, ipa: f.ipa };
}

export function weakPrompt(q: WeakQuestion): string {
  return `ふつうの はやさで いうと、${q.weak} は どう きこえる？`;
}

export function weakDisplay(q: WeakQuestion): string {
  return `${q.sentence}.（${q.meaning}）`;
}

export function weakWhy(q: WeakQuestion): string {
  return `文の なかの ${q.weak} は ふつう「${q.answer}」（${q.ipa}）と よわく みじかく きこえる。「${q.strongSay}」と はっきり いうのは、${q.weak} だけを とりだして いう ときや、つよめたい ときだけ。よわい おとが わかると、はやい 英語も ききとれるよ。`;
}

// ---------------------------------------------------------------------------
// -ible・-able
// ---------------------------------------------------------------------------

export type IbleKind = "ible" | "able";
export type IbleTrap = "plain" | "drop-e" | "part";

/** ことば → いみ・-ible か -able か・もとの ことば（-ible は パーツ）・わなの 種類・まちがいの つづり 2つ */
const IBLE: Record<string, { meaning: string; base: string; trap: IbleTrap; wrong: [string, string] }> = {
  possible: { meaning: "ありうる・できる", base: "poss", trap: "part", wrong: ["possable", "posible"] },
  visible: { meaning: "目に 見える", base: "vis", trap: "part", wrong: ["visable", "visibel"] },
  terrible: { meaning: "とても ひどい", base: "terr", trap: "part", wrong: ["terrable", "terible"] },
  horrible: { meaning: "おそろしい・ひどい", base: "horr", trap: "part", wrong: ["horrable", "horible"] },
  incredible: { meaning: "しんじられない ほど すごい", base: "incred", trap: "part", wrong: ["incredable", "incredibel"] },
  edible: { meaning: "たべられる", base: "ed", trap: "part", wrong: ["edable", "eddible"] },
  audible: { meaning: "（おとが）きこえる", base: "aud", trap: "part", wrong: ["audable", "awdible"] },
  responsible: { meaning: "せきにんの ある", base: "respons", trap: "part", wrong: ["responsable", "responsibel"] },
  reasonable: { meaning: "すじが とおって いる・なっとく できる", base: "reason", trap: "plain", wrong: ["reasonible", "resonable"] },
  acceptable: { meaning: "うけいれられる", base: "accept", trap: "plain", wrong: ["acceptible", "aceptable"] },
  suitable: { meaning: "ぴったりの・ふさわしい", base: "suit", trap: "plain", wrong: ["suitible", "sutable"] },
  understandable: { meaning: "わかる・むりも ない", base: "understand", trap: "plain", wrong: ["understandible", "understandabel"] },
  remarkable: { meaning: "めだつ ほど すばらしい", base: "remark", trap: "plain", wrong: ["remarkible", "remarkabel"] },
  agreeable: { meaning: "かんじの いい・さんせい できる", base: "agree", trap: "plain", wrong: ["agreeible", "agreable"] },
  debatable: { meaning: "いけんが わかれる・はなしあう よちが ある", base: "debate", trap: "drop-e", wrong: ["debateable", "debatible"] },
  questionable: { meaning: "あやしい・ほんとうか うたがわしい", base: "question", trap: "plain", wrong: ["questionible", "questionabel"] },
};

/** -ible の ことばか（-able で なければ -ible） */
const kindOf = (w: string): IbleKind => (w.endsWith("ible") ? "ible" : "able");

export interface IbleQuestion {
  word: string;
  kind: IbleKind;
  /** "-ible" / "-able"（レッスンの focus） */
  focus: string;
  meaning: string;
  base: string;
  trap: IbleTrap;
  answer: string;
  wrong: [string, string];
}

/** 表に ある -ible・-able の ことばの 問題。表に なければ null */
export function ibleOf(word: string): IbleQuestion | null {
  const w = word.toLowerCase();
  const x = IBLE[w];
  if (!x) return null;
  const kind = kindOf(w);
  return { word: w, kind, focus: `-${kind}`, meaning: x.meaning, base: x.base, trap: x.trap, answer: w, wrong: x.wrong };
}

export function ibleWhy(q: IbleQuestion): string {
  const tail: Record<IbleTrap, string> = {
    part: `${q.base} だけでは ことばに ならない ときは ible に なる ことが おおい。`,
    plain: `${q.base} は それだけで ことば。ことばに そのまま つける ときは able に なる ことが おおい。`,
    "drop-e": `${q.base} は それだけで ことばなので able。おわりの e を とってから able を つける（${q.base}able では ない）。`,
  };
  return `${q.answer}（${q.meaning}）。ible も able も「〜できる・〜な」と いう いみの おわり。${tail[q.trap]}`;
}

// ---------------------------------------------------------------------------
// どの 表の ことばか・focus・読み上げ
// ---------------------------------------------------------------------------

/** その ことばの 問題に つかう focus（表に なければ null） */
export function w29FocusOf(word: string): string | null {
  if (spectOf(word)) return "spect";
  if (dictOf(word)) return "dict";
  return emphasisOf(word)?.strong.toLowerCase() ?? weakOf(word)?.weak ?? ibleOf(word)?.focus ?? null;
}

/**
 * その回の ことばが ワールド29 の 回の ものか。ことばが ぜんぶ ワールド29 の 表に ある とき。
 * まえの ワールドの 回は prediction・impossible などが まじっても、表に ない ことばが かならず あるので はたらかない
 * （L840 までの どの 回でも はたらかない ことを テストで たしかめる）
 */
function isW29Words(words: readonly string[]): boolean {
  return words.length > 0 && words.every((w) => w29FocusOf(w) !== null);
}

/** フォーカスの 読み上げ（ワールド29）。その focus で 問う ことば・文を よむ（"spect" "-ible" "can" だけで よまない）。あてはまらなければ null */
export function w29Say(focus: string, words: readonly string[]): string | null {
  if (!isW29Words(words)) return null;
  return words.find((w) => w29FocusOf(w) === focus) ?? null;
}

/** フォーカスの ボタンで よむ おてほん（ワールド29。英字と スペース だけ。文は 記号なしで 表に ある）。あてはまらなければ null */
export function w29Example(focus: string, words: readonly string[]): string | null {
  return w29Say(focus, words);
}
