/**
 * 問題ファクトリ。学習項目から問題を決定的（seed付き）に生成する。
 * サーバーは同じ seed で問題を再生成して採点するため、クライアントに正解を渡さずに済む。
 */
import type { AssessmentDef, LearningItemDef, LessonDef, MemoryState, Skill } from "@/lib/domain/types";
import { pickArenaItems, type ArenaMode } from "@/lib/domain/arena";
import { MAX_CONVERSATION_TURNS, pickConversationPartner } from "@/lib/conversation/engine";
import { getLesson, itemsInRange, itemsOfLesson } from "./index";
import { VOWEL_TEAMS, VOWEL_TEAM_INTRO, possibleSounds, shortVowelOf, teamSound } from "./vowelTeams";
import { R_MOUTH, R_VOWELS, R_VOWEL_INTRO, findRSpellings, rSound, shortVowelOfR } from "./rControlled";
import { CG_CHOICES, CG_KANA, CG_LETTER, W10_INTRO as W10_INTRO_MAP, W10_TEAMS, Y_TEAM, cgSounds, w10TeamSound, ySound } from "./w10Phonics";
import { ED_KANA, ED_LABEL, ER_MORE_WORDS, SIGHT_TIP, W11_INTRO as W11_INTRO_MAP, W11_SIGHT_WORDS, edSound } from "./w11Phonics";
import { W12_INTRO as W12_INTRO_MAP, W12_SIGHT_TIP, W12_SIGHT_WORDS, W12_START, W12_SYLLABLE_START, syllablesOf } from "./w12Phonics";
import { CH_CHOICES, S_KANA, S_LABEL, W13_CH_FOCUS, W13_HE_FOCUS, W13_IZ_START, W13_START, W13_S_FOCUS, chBlank, heSpelling, sSound, type SSound } from "./w13Phonics";
import { PLURAL_WHY, SILENT_CHOICES, SILENT_WHY, W14_NUMBER_FOCUS, W14_PLURAL_FOCUS, W14_SILENT_FOCUS, W14_START, numberSpelling, pluralSpelling, silentBlank } from "./w14Phonics";

export type QuestionType =
  | "listen_choose" // 音声を聞いて絵を選ぶ（リスニング）
  | "tpr_reflex" // 命令を聞いて動作を選ぶ（反射神経・制限時間あり）
  | "meaning_choose" // 英語 → 日本語の意味（語彙）
  | "expression_choose" // 学校テスト形式: 日本語に合う英文を選ぶ
  | "phonics_sound" // 単語を聞いて、最初の音/含まれる綴りを選ぶ（フォニックス）
  | "spell" // 絵と日本語を見て英語を書く（筆記・AI採点）
  | "speak"; // 発音判定

export interface Choice {
  id: string;
  label: string;
  sub?: string;
}

export interface Question {
  id: string;
  itemId: string;
  type: QuestionType;
  skill: Skill;
  promptJa: string;
  audioText?: string;
  playbackRate?: number;
  display?: string; // 画面に出す英語・絵文字など
  choices?: Choice[];
  answer: string; // 正解（choice.id もしくは期待するスペル）
  explanationJa: string; // 間違えたときの救済解説
  timeLimitMs?: number;
}

/**
 * クライアントに渡す形。正解・解説・itemId（スラッグに単語が含まれる）を伏せ、
 * 音声ファイルは itemId のハッシュ（audioKey）で引く。選択肢IDも a/b/c/d の不透明な記号。
 */
export type PublicQuestion = Omit<Question, "answer" | "explanationJa" | "itemId"> & { audioKey: string };
export const audioKeyOf = (itemId: string) => `a${hashSeed(itemId).toString(36)}`;
export const toPublic = ({ answer: _a, explanationJa: _e, itemId, ...q }: Question): PublicQuestion => ({
  ...q,
  // スペル問題は「日本語→英語で書く」学校テスト形式。読み上げ文字列＝正解なので渡さない
  audioText: q.type === "spell" ? undefined : q.audioText,
  audioKey: audioKeyOf(itemId),
});

// ---------------------------------------------------------------------------
// seed 付き乱数（mulberry32）
// ---------------------------------------------------------------------------
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** ダイグラフ（2文字で1つの音。ワールド3） */
export const DIGRAPHS = ["sh", "ch", "th", "wh", "ck", "ng", "nk"] as const;
/** ことばの はじめに来るダイグラフ */
const START_DIGRAPHS = ["sh", "ch", "th", "wh"];

/**
 * その回のフォーカスがダイグラフなら、ダイグラフで問う（ship の最初の音を「s」にしない）。
 * - sh / ch / th / wh で始まる → 「さいしょの おとは どれ？」（選択肢はダイグラフ4つ）
 * - 途中・おわりにある（fish, duck, ring）→ 「どの つづりが はいってる？」
 * フォーカスが1文字の回（ワールド1の duck など）は、今までどおり最初の文字で問う。
 */
export function digraphQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const w = item.text.toLowerCase();
  const start = START_DIGRAPHS.find((d) => w.startsWith(d));
  // sh / ch / th / wh で始まる語は、どの回でもダイグラフで問う（chipmunk の最初の音を「c」にしない）
  if (!start && !focus.some((f) => (DIGRAPHS as readonly string[]).includes(f))) return null;
  if (start) {
    return { promptJa: "さいしょの おとは どれ？", choices: shuffle(START_DIGRAPHS, rng).map((d) => ({ id: d, label: d })), answer: start,
      explanationJa: `${item.text} は「${start}」の音ではじまるよ。2もじで 1つの おと！` };
  }
  const inside = DIGRAPHS.find((d) => w.includes(d));
  if (!inside) return null;
  const others = shuffle(DIGRAPHS.filter((d) => !w.includes(d)), rng).slice(0, 3);
  return { promptJa: "どの つづりが はいってる？", choices: shuffle([inside, ...others], rng).map((d) => ({ id: d, label: d })), answer: inside,
    explanationJa: `${item.text} には「${inside}」が はいってるよ。2もじで 1つの おと！` };
}

/** 語頭ブレンド（ワールド4）。2つの子音を つなげて読む */
export const BLENDS = ["st", "sp", "sn", "sm", "sk", "sw", "bl", "cl", "fl", "gl", "pl", "sl", "br", "cr", "dr", "fr", "gr", "tr", "tw"] as const;
/** 3つの子音のブレンド */
export const THREE_BLENDS = ["str", "spr", "scr", "spl"] as const;

/**
 * その回のフォーカスに語頭ブレンドがあり、語がブレンドで始まるなら「さいしょの 2つ（3つ）の おと」で問う
 * （stop の答えを「s」だけにしない）。まちがいの選択肢は、同じ1文字目（cl ↔ cr）や
 * 同じ2文字目（cl ↔ bl）のブレンドを優先する＝聞きくらべの練習になる。
 */
export function blendQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const all: readonly string[] = [...THREE_BLENDS, ...BLENDS];
  if (!focus.some((f) => all.includes(f))) return null;
  const w = item.text.toLowerCase();
  const start = all.find((b) => w.startsWith(b));
  if (!start) return null;
  const pool = (start.length === 3 ? THREE_BLENDS : BLENDS).filter((b) => b !== start && !w.startsWith(b)) as string[];
  const sameFirst = shuffle(pool.filter((b) => b[0] === start[0]), rng);
  const sameSecond = shuffle(pool.filter((b) => b[0] !== start[0] && b[1] === start[1]), rng);
  const rest = shuffle(pool.filter((b) => !sameFirst.includes(b) && !sameSecond.includes(b)), rng);
  // 同じ1文字目だけだと s- ブレンドばかりになるので、1つは2文字目が同じものを入れる
  const near = [...sameFirst.slice(0, 2), ...sameSecond.slice(0, 1)];
  const others = [...near, ...sameFirst.slice(2), ...sameSecond.slice(1), ...rest].slice(0, 3);
  const n = start.length === 3 ? "3つ" : "2つ";
  return { promptJa: `さいしょの ${n}の おとは どれ？`, choices: shuffle([start, ...others], rng).map((b) => ({ id: b, label: b })), answer: start,
    explanationJa: `${item.text} は「${start}」ではじまるよ。${start.split("").join(" と ")} を くっつけて よもう！` };
}

/** 語末ブレンド（ワールド5）。focus では "-st" のように 先頭に ハイフンを つけて「ことばの おわり」を あらわす */
export const FINAL_BLENDS = ["st", "nd", "mp", "nt", "lk", "ft", "sk", "lp"] as const;
/** 語尾（ワールド5）: 複数形の -s と -ing */
export const SUFFIXES = ["ing", "s"] as const;

/**
 * その回のフォーカスに語末（"-st" "-s" "-ing" など）があり、語が それで おわるなら「おわりの おと」で問う
 * （nest の答えを 最初の「n」にしない）。
 * - 語末ブレンド → 「おわりの 2つの おとは どれ？」（まちがいの選択肢は nd ↔ nt のような 1文字目が同じもの、
 *   st ↔ nt のような 2文字目が同じものを優先＝聞きくらべ）
 * - -s / -ing → 「おわりに ついている のは どれ？」
 */
export function endingQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  // ワールド10 の "-y" "-le" は w10Question で 問う（語末ブレンドの 選択肢に しない）
  const known: readonly string[] = [...SUFFIXES, ...FINAL_BLENDS];
  const endings = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => f.startsWith("-")).map((f) => f.slice(1).toLowerCase()).filter((e) => known.includes(e));
  if (endings.length === 0) return null;
  const w = item.text.toLowerCase();
  const end = endings.filter((e) => w.endsWith(e)).sort((a, b) => b.length - a.length)[0];
  if (!end) return null;
  const all: readonly string[] = [...SUFFIXES, ...FINAL_BLENDS];
  const pool = all.filter((e) => e !== end && !w.endsWith(e));
  if ((SUFFIXES as readonly string[]).includes(end)) {
    const others = [...pool.filter((e) => (SUFFIXES as readonly string[]).includes(e)), ...shuffle(pool.filter((e) => !(SUFFIXES as readonly string[]).includes(e)), rng)].slice(0, 3);
    return { promptJa: "おわりに ついている のは どれ？", choices: shuffle([end, ...others], rng).map((e) => ({ id: e, label: e })), answer: end,
      explanationJa: end === "s"
        ? `${item.text} は おわりに「s」。ふたつ いじょうの ときに つけるよ。`
        : `${item.text} は おわりに「ing」。「〜している」の いみに なるよ。` };
  }
  const blends = pool.filter((e) => (FINAL_BLENDS as readonly string[]).includes(e));
  const sameFirst = shuffle(blends.filter((b) => b[0] === end[0]), rng);
  const sameSecond = shuffle(blends.filter((b) => b[0] !== end[0] && b[1] === end[1]), rng);
  const rest = shuffle(blends.filter((b) => !sameFirst.includes(b) && !sameSecond.includes(b)), rng);
  const others = [...sameFirst.slice(0, 1), ...sameSecond.slice(0, 1), ...sameFirst.slice(1), ...sameSecond.slice(1), ...rest].slice(0, 3);
  return { promptJa: "おわりの 2つの おとは どれ？", choices: shuffle([end, ...others], rng).map((e) => ({ id: e, label: e })), answer: end,
    explanationJa: `${item.text} は「${end}」で おわるよ。${end.split("").join(" と ")} を くっつけて よもう！` };
}

/** マジック e（ワールド6）。focus では "a_e" のように書く（_ に子音が1つ入る） */
export const MAGIC_E = ["a_e", "i_e", "o_e", "u_e", "e_e"] as const;
const SHORT_VOWELS = ["a", "i", "o", "u", "e"] as const;
/** 長い母音＝アルファベットの なまえの よみ */
const LETTER_NAME: Record<string, string> = { a: "エイ", i: "アイ", o: "オウ", u: "ユー（ウー）", e: "イー" };

/**
 * その回のフォーカスにマジック e（"a_e" など）があれば、母音の おとで問う（cake の答えを 最初の「c」にしない）。
 * - cake / cakes / cupcake（おわりが 母音＋子音1つ＋e）→ 正解は a_e
 * - cap（短母音1つ。くらべの回）→ 正解は a
 * まちがいの選択肢には かならず 同じ母音の ペア（a ↔ a_e）を入れる＝みじかい おと と ながい おとの 聞きくらべ。
 */
export function magicEQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  if (!focus.some((f) => (MAGIC_E as readonly string[]).includes(f))) return null;
  const w = item.text.toLowerCase();
  const magic = w.match(/([aeiou])[b-df-hj-np-tv-z]es?$/);
  const short = w.match(/^[^aeiou]*([aeiou])[^aeiou]+$/);
  const v = magic?.[1] ?? short?.[1];
  if (!v) return null;
  const answer = magic ? `${v}_e` : v;
  const pair = magic ? v : `${v}_e`;
  const all: string[] = [...MAGIC_E, ...SHORT_VOWELS];
  const rest = all.filter((x) => x !== answer && x !== pair);
  // その回の フォーカスに ある おとを 先に（ふりかえり回は a_e / i_e / o_e の 聞きわけに なる）
  const others = [...shuffle(rest.filter((x) => focus.includes(x)), rng), ...shuffle(rest.filter((x) => !focus.includes(x)), rng)].slice(0, 2);
  return { promptJa: "きこえた ぼいん（a i u e o）の おとは どれ？", choices: shuffle([answer, pair, ...others], rng).map((x) => ({ id: x, label: x })), answer,
    explanationJa: magic
      ? `${item.text} は「${answer}」。おわりの e は よまないで、${v} を なまえの「${LETTER_NAME[v]}」で よむよ。`
      : `${item.text} は みじかい「${v}」の おと。おわりに e が ないね。` };
}

/** 母音チーム（ワールド7〜8）。おとの表は ./vowelTeams.ts（oo・ow は ことばで おとが かわる） */
export { VOWEL_TEAM_GROUPS, VOWEL_TEAMS } from "./vowelTeams";

/**
 * その回のフォーカスに母音チーム（"ai" "oo" "igh" など）があれば、母音の おとで問う（rain の答えを 最初の「r」にしない）。
 * 音声だけの問題なので、おなじ おとに なりうる つづり（ai ↔ ay、ee ↔ ea、oa ↔ ow、ou ↔ ow、oi ↔ oy、igh ↔ ie）は
 * いっしょに 選択肢に 出さない（聞きわけられない）。ことばの 中に きこえる おとの つづりも 出さない（playground の ay など）。
 * 選択肢 = 正解 ＋ みじかい母音（rain ↔ a、night ↔ i）＋ ほかの おとの つづり 2つ（その回の フォーカスを 先に。まだ ならっていない つづりは 出さない）。
 * ことばに 入っている チームが 2つ あるとき（railway、moonlight）は フォーカスの 順で 先の もの。
 */
export function vowelTeamQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const teams = focus.filter((f) => VOWEL_TEAMS.includes(f));
  if (teams.length === 0) return null;
  const w = item.text.toLowerCase();
  const answer = teams.find((f) => w.includes(f));
  if (!answer) return null;
  const ja = teamSound(answer, w);
  const short = shortVowelOf(answer);
  // 正解の つづりが なりうる おと（ow なら オウ と アウ → oa も ou も 出さない）と、ことばの 中で きこえる おとは 出さない
  const blocked = new Set<string>([ja, ...possibleSounds(answer), ...VOWEL_TEAMS.filter((x) => w.includes(x)).map((x) => teamSound(x, w))]);
  const learned = VOWEL_TEAMS.filter((x) => x !== answer && (VOWEL_TEAM_INTRO[x] <= item.lessonNo || focus.includes(x)));
  const ordered = [...shuffle(learned.filter((x) => focus.includes(x)), rng), ...shuffle(learned.filter((x) => !focus.includes(x)), rng)];
  const others: string[] = [];
  for (const x of ordered) {
    if (others.length === 2) break;
    const s = possibleSounds(x);
    if (s.some((v) => blocked.has(v))) continue;
    others.push(x);
    s.forEach((v) => blocked.add(v));
  }
  // おとの グループが たりない とき（seaweed＋ai など）は、のこりの みじかい母音で うめる
  const fill = shuffle(["a", "e", "i", "o", "u"].filter((x) => x !== short && !others.some((o) => shortVowelOf(o) === x)), rng);
  const choices = [answer, short, ...others, ...fill].slice(0, 4);
  return { promptJa: "きこえた ぼいんの おとは どれ？", choices: shuffle(choices, rng).map((x) => ({ id: x, label: x })), answer,
    explanationJa: `${item.text} は「${answer}」。${answer.length}つの もじで「${ja}」の おとに なるよ（みじかい ${short} とは ちがう おと）。` };
}

/** r の つく母音（ワールド9）。おとの表は ./rControlled.ts（er / ir / ur は おなじ おと） */
export { R_VOWEL_GROUPS, R_VOWELS } from "./rControlled";

/**
 * その回のフォーカスに r の つく母音（"ar" "er" "air" など）があれば、母音の おとで問う（car の答えを 最初の「c」に、
 * shark の答えを「sh」に しない）。
 * 音声だけの問題なので、おなじ おとの つづり（er ↔ ir ↔ ur）は いっしょに 選択肢に 出さない。
 * ことばの 中に ある ほかの r の つく母音（airport の or、farmer の er）の おとも 出さない。
 * 選択肢 = 正解 ＋ みじかい母音（car ↔ a、bird ↔ i）＋ ほかの おとの つづり 2つ（その回の フォーカスを 先に。
 * まだ ならっていない つづりは 出さない。たりない ときは のこりの みじかい母音で うめる）。
 * ことばに 2つ あるとき（farmer、airport）は フォーカスの 順で 先の もの。
 */
export function rControlledQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => R_VOWELS.includes(f));
  if (focus.length === 0) return null;
  const found = findRSpellings(item.text);
  const answer = focus.find((f) => found.includes(f));
  if (!answer) return null;
  const ja = rSound(answer);
  const short = shortVowelOfR(answer);
  const blocked = new Set<string>([ja, ...found.map(rSound)]);
  const lessonFocus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const learned = R_VOWELS.filter((x) => x !== answer && (R_VOWEL_INTRO[x] <= item.lessonNo || lessonFocus.includes(x)));
  const ordered = [...shuffle(learned.filter((x) => lessonFocus.includes(x)), rng), ...shuffle(learned.filter((x) => !lessonFocus.includes(x)), rng)];
  const others: string[] = [];
  for (const x of ordered) {
    if (others.length === 2) break;
    if (blocked.has(rSound(x))) continue;
    others.push(x);
    blocked.add(rSound(x));
  }
  const fill = shuffle(["a", "e", "i", "o", "u"].filter((x) => x !== short), rng);
  const choices = [answer, short, ...others, ...fill].slice(0, 4);
  return { promptJa: "きこえた ぼいんの おとは どれ？", choices: shuffle(choices, rng).map((x) => ({ id: x, label: x })), answer,
    explanationJa: `${item.text} は「${answer}」。r が つくと ${R_MOUTH[ja]}「${ja}」の おとに なるよ（みじかい ${short} とは ちがう おと）。` };
}

/** ワールド10（soft c・soft g・-y・-le・aw au ew）。おとの表は ./w10Phonics.ts */
export { W10_FOCUS, W10_INTRO } from "./w10Phonics";

/**
 * その回のフォーカスに ワールド10 の つづりが あれば（W10_INTRO より あとの 回だけ）、フォーカスの 順に ことばに あうもので 問う。
 * - "c" / "g": 「この ことばの c は どの おと？」（s / k / ch / sh、g は j / g / ch / d）。ことばを 画面に 出す（あとの もじで きまる ため）。
 *   ことばの 中で c（g）の おとが まざる とき（bicycle）は 問わない。
 * - "-y": 「おわりの y は どの つづりと おなじ おと？」（happy → ee、fly → igh ＋ ほかの ながい おと 2つ）
 * - "-le": 「おわりに きこえる おとは どれ？」（-le ＋ -y / -er / -ing）
 * - "aw" "au" "ew": 「きこえた ぼいんの おとは どれ？」（正解 ＋ みじかい母音 ＋ ちがう おとの つづり。aw と au は いっしょに 出さない）
 * 語末（endingQuestion）より 先に よぶ（"-y" "-le" を 語末ブレンドとして 問わない）。
 */
export function w10Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  const focus = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => W10_INTRO_MAP[f] !== undefined && W10_INTRO_MAP[f] <= item.lessonNo);
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if (f === "c" || f === "g") {
      const s = cgSounds(f, w);
      if (s.length === 0 || s.some((x) => x !== s[0])) continue;
      const answer = CG_LETTER[f][s[0]];
      const kana = CG_KANA[f][s[0]];
      const why = s[0] === "soft" ? `${f} の あとに e・i・y が くると「${kana}」に なるよ。` : `${f} の あとが e・i・y では ない ときは「${kana}」だよ。`;
      return { promptJa: `この ことばの ${f} は どの おと？`, display: item.text, choices: pick(CG_CHOICES[f]), answer,
        explanationJa: `${item.text} の ${f} は「${kana}」（${answer} と おなじ おと）。${why}` };
    }
    if (f === "-y") {
      const ys = ySound(w);
      if (!ys) continue;
      const answer = Y_TEAM[ys];
      const other = Y_TEAM[ys === "イー" ? "アイ" : "イー"];
      const fill = shuffle(["ai", "oa", "oo", "oi"], rng).slice(0, 2);
      return { promptJa: "おわりの y は どの つづりと おなじ おと？", display: item.text, choices: pick([answer, other, ...fill]), answer,
        explanationJa: ys === "イー"
          ? `${item.text} の おわりの y は「イー」（ee と おなじ おと）。2つ いじょうの まとまりの ことばの おわりの y は「イー」が おおいよ。`
          : `${item.text} の おわりの y は「アイ」（igh と おなじ おと）。ほかに ぼいんの ない みじかい ことばの y は「アイ」だよ。` };
    }
    if (f === "-le") {
      if (!w.endsWith("le")) continue;
      return { promptJa: "おわりに きこえる おとは どれ？", choices: pick(["-le", "-y", "-er", "-ing"]), answer: "-le",
        explanationJa: `${item.text} は おわりが「-le」。さいごの e は よまないで、かるく「ル」と よむよ。` };
    }
    if ((W10_TEAMS as readonly string[]).includes(f)) {
      if (!w.includes(f)) continue;
      const ja = w10TeamSound(f);
      const short = f[0];
      // aw と au は おなじ おと。ew の ときは aw（au）を、aw / au の ときは ew を（ならっていれば）くらべに 入れる
      const pair = (ja === "オー" ? ["ew"] : ["aw", "au"]).filter((x) => W10_INTRO_MAP[x] <= item.lessonNo || focus.includes(x));
      const contrast = shuffle(pair, rng).slice(0, 1);
      const fill = shuffle(["ai", "ee", "igh", "oi", "ou"].filter((x) => !w.includes(x)), rng);
      const choices = [f, short, ...contrast, ...fill].slice(0, 4);
      return { promptJa: "きこえた ぼいんの おとは どれ？", choices: pick(choices), answer: f,
        explanationJa: ja === "オー"
          ? `${item.text} は「${f}」。2つの もじで「オー」の おとに なるよ（aw と au は おなじ おと。みじかい a とは ちがう）。`
          : `${item.text} は「ew」。2つの もじで「ウー」の おとに なるよ（moon の oo と おなじ おと）。` };
    }
  }
  return null;
}

/** ワールド11（-ed・-er・-est・サイトワード）。おとの表は ./w11Phonics.ts */
export { W11_FOCUS, W11_INTRO } from "./w11Phonics";

/**
 * その回のフォーカスに ワールド11 の つづりが あれば（W11_INTRO より あとの 回だけ）、フォーカスの 順に ことばに あうもので 問う。
 * - "-ed": 「この ことばの おわりの -ed は どの おと？」（ト / ド / イド）。まえの もじで きまるので ことばを 画面に 出す。
 * - "-er" / "-est": 「おわりに きこえる おとは どれ？」（-er / -est / -ed / -ing）
 * - サイトワード: 「きこえた ことばは どれ？」（その回の ことば・ならった サイトワードから にている つづりを 選択肢に）。
 *   サイトワードの 回（rule "sight-words"）は、その回の ことば（saw, wood など）も おなじ 形で 問う。
 * 語末（endingQuestion）より 先に よぶ。
 */
export function w11Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  const lesson = getLesson(item.lessonNo);
  const focus = (lesson?.phonics.focus ?? []).filter((f) => W11_INTRO_MAP[f] !== undefined && W11_INTRO_MAP[f] <= item.lessonNo);
  if (!lesson || focus.length === 0) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if (f === "-ed") {
      const s = edSound(w);
      if (!s) continue;
      const why = s === "id" ? "t や d の あとの -ed は「イド」と よむよ。"
        : s === "t" ? "p・k・s・sh・ch のような いきだけの おとの あとの -ed は ちいさく「ト」と よむよ。"
        : "こえの でる おと（n・l・y など）の あとの -ed は「ド」と よむよ。";
      return { promptJa: "この ことばの おわりの -ed は どの おと？", display: item.text,
        choices: shuffle(["t", "d", "id"] as const, rng).map((x) => ({ id: x, label: ED_LABEL[x] })), answer: s,
        explanationJa: `${item.text} の -ed は「${ED_KANA[s]}」。${why}` };
    }
    if (f === "-er" || f === "-est") {
      const end = f.slice(1);
      if (!w.endsWith(end)) continue;
      const mean = f === "-est" ? "「いちばん」の いみ" : ER_MORE_WORDS.has(w) ? "「もっと」の いみ" : "「～する ひと」の いみ";
      return { promptJa: "おわりに きこえる おとは どれ？", choices: pick(["-er", "-est", "-ed", "-ing"]), answer: f,
        explanationJa: `${item.text} は おわりが「${f}」。${f} が つくと ${mean}に なるよ。` };
    }
    // サイトワード: その ことばか、サイトワードの 回の ことば
    if (w !== f && lesson.phonics.rule !== "sight-words") continue;
    const ending = (x: string) => focus.some((e) => e.startsWith("-") && x.endsWith(e.slice(1)));
    const fromLesson = lesson.phonics.words.map((x) => x.toLowerCase()).filter((x) => x !== w && !ending(x));
    const learned = W11_SIGHT_WORDS.filter((x) => W11_INTRO_MAP[x] <= item.lessonNo && x !== w && !fromLesson.includes(x));
    const others = [...shuffle(fromLesson, rng), ...shuffle(learned, rng)].slice(0, 3);
    return { promptJa: "きこえた ことばは どれ？", choices: pick([w, ...others]), answer: w,
      explanationJa: `${SIGHT_TIP[w] ?? `${item.text} は サイトワード。`}もじを みたら すぐ よめるように しよう。` };
  }
  return null;
}

/** ワールド12（サイトワード 総復習・5W1H・多音節語）。おとの表は ./w12Phonics.ts */
export { W12_INTRO, W12_SIGHT_WORDS } from "./w12Phonics";

/**
 * ワールド12 の 回（L331〜）で、フォーカスに サイトワード か 多音節語（"bas-ket-ball"）が あれば 問う。
 * - サイトワード: 「きこえた ことばは どれ？」（w11Question と おなじ 形。選択肢は その回の ことば → ならった サイトワード
 *   〈ワールド11 ＋ ワールド12〉の じゅん。-ed / -er / -est の ことばや 多音節語は 入れない）。
 *   サイトワードの 回（rule "sight-words"）は その回の ことば（where, then など）も おなじ 形で 問う。ふりかえり回は その ことば だけ。
 * - 多音節語（L336〜）: 「この ことばは いくつに わけて よむ？」（てを たたく かず。ことばを 画面に 出す。選択肢は 1〜5 の ちかい かず 4つ）
 * あてはまらなければ null（音読の 回の a_e・ai・-ed などは それぞれの ワールドの 問題で 問う）。
 * blendQuestion の つぎ・ワールド10 の まえに よぶ（what / when / where / why の wh を ダイグラフで 問わない）。
 */
export function w12Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W12_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const introOf = (x: string) => W11_INTRO_MAP[x] ?? W12_INTRO_MAP[x];
  const allSight = [...W11_SIGHT_WORDS, ...W12_SIGHT_WORDS];
  const sightFocus = lesson.phonics.focus.filter((f) => allSight.includes(f) && introOf(f) <= item.lessonNo);

  const syl = item.lessonNo >= W12_SYLLABLE_START ? syllablesOf(w, lesson.phonics.focus) : null;
  if (syl) {
    const n = syl.length;
    const near = [1, 2, 3, 4, 5].filter((k) => k !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || a - b).slice(0, 3);
    return { promptJa: "この ことばは いくつに わけて よむ？（てを たたいて かぞえよう）", display: item.text,
      choices: shuffle([n, ...near], rng).map((k) => ({ id: String(k), label: `${k}つ` })), answer: String(n),
      explanationJa: `${item.text} は ${syl.join("・")} の ${n}つ。まとまりごとに てを たたいて よもう。` };
  }

  if (sightFocus.length === 0) return null;
  if (!sightFocus.includes(w) && lesson.phonics.rule !== "sight-words") return null;
  const skip = (x: string) => (/(ed|er|est)$/.test(x) && !allSight.includes(x)) || syllablesOf(x, lesson.phonics.focus) !== null;
  const fromLesson = lesson.phonics.words.map((x) => x.toLowerCase()).filter((x) => x !== w && !skip(x));
  const learned = allSight.filter((x) => introOf(x) <= item.lessonNo && x !== w && !fromLesson.includes(x));
  const others = [...shuffle(fromLesson, rng), ...shuffle(learned, rng)].slice(0, 3);
  return { promptJa: "きこえた ことばは どれ？", choices: pick([w, ...others]), answer: w,
    explanationJa: `${W12_SIGHT_TIP[w] ?? SIGHT_TIP[w] ?? `${item.text} は サイトワード。`}もじを みたら すぐ よめるように しよう。` };
}

/** ワールド13（3 単現の -s / -es / -ies・-tch / -dge）。おとの表は ./w13Phonics.ts */
export { W13_START } from "./w13Phonics";

/**
 * ワールド13 の 回（L361〜）で、フォーカスに ワールド13 の つづりが あれば、フォーカスの 順に ことばに あうもので 問う。
 * - "-s" / "-es": 「この ことばの おわりの s は どの おと？」（ス / ズ / イズ。イズは -es を ならう L366 から）。ことばを 画面に 出す。
 * - "-ies" / "goes" / "does" / "has": 「he / she の ときの ただしい つづりは どれ？」（studies / studys / studyes、plays / plaies …）
 * - "tch" / "dge"（ふりかえりの "ch" / "ge"）: 「＿ に はいる つづりは どれ？」（ca＿ → tch、tea＿ → ch）。みじかい母音の あとかで きまる。
 * あてはまらなければ null。語末（endingQuestion：複数形の -s）より 先に よぶ。
 */
export function w13Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W13_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W13_S_FOCUS as readonly string[]).includes(f)) {
      const s = sSound(w);
      if (!s) continue;
      const opts: SSound[] = item.lessonNo >= W13_IZ_START || s === "iz" ? ["s", "z", "iz"] : ["s", "z"];
      const why = s === "iz" ? "s・x・ch・sh の あとは es を つけて「イズ」と よむよ。"
        : s === "s" ? "p・t・k・f のような いきだけの おとの あとの s は「ス」と よむよ。"
        : "こえの でる おと（n・m・l・d・y や 母音）の あとの s は「ズ」と よむよ。";
      return { promptJa: "この ことばの おわりの s は どの おと？", display: item.text,
        choices: shuffle(opts, rng).map((x) => ({ id: x, label: S_LABEL[x] })), answer: s,
        explanationJa: `${item.text} の おわりは「${S_KANA[s]}」。${why}` };
    }
    if ((W13_HE_FOCUS as readonly string[]).includes(f)) {
      const h = heSpelling(w);
      if (!h) continue;
      const why = h.kind === "ies" ? `${h.base} は y の まえが 子音なので、y を i に かえて es を つけるよ。`
        : h.kind === "ys" ? `${h.base} は y の まえが 母音（a e i o u）なので、そのまま s を つけるよ。`
        : `${h.base} は he / she の とき とくべつな 形「${h.answer}」に なるよ。`;
      return { promptJa: "he / she の ときの ただしい つづりは どれ？", choices: pick([h.answer, ...h.wrong]), answer: h.answer,
        explanationJa: `ただしい つづりは「${h.answer}」。${why}` };
    }
    if ((W13_CH_FOCUS as readonly string[]).includes(f)) {
      const b = chBlank(w, focus);
      if (!b) continue;
      const short = b.answer === "tch" || b.answer === "dge";
      const sound = b.answer === "tch" || b.answer === "ch" ? "チ" : "ヂ";
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(CH_CHOICES[b.answer]), answer: b.answer,
        explanationJa: short
          ? `${item.text} は「${b.answer}」。みじかい 母音（${b.before}）の すぐ あとの「${sound}」は ${b.answer} と かくよ。`
          : `${item.text} は「${b.answer}」。みじかい 母音の すぐ あと では ない（${b.before} の あと）ので ${b.answer} と かくよ。` };
    }
  }
  return null;
}

/** ワールド14（複数形の -es / -ies / -ves・だまっている もじ kn wr mb・ph・大きな数の つづり）。表は ./w14Phonics.ts */
export { W14_START } from "./w14Phonics";

/**
 * ワールド14 の 回（L391〜）で、フォーカスに ワールド14 の つづりが あれば、フォーカスの 順に ことばに あうもので 問う。
 * - "es" / "ies" / "ys" / "ves": 「ふたつ いじょうの ときの ただしい つづりは どれ？」（box → boxes / boxs / boxis、knife → knives / knifes / knifs）
 * - "kn" / "wr" / "mb" / "ph": 「＿ に はいる つづりは どれ？」（＿ife → kn、la＿ → mb、＿one → ph）
 * - "-ty" / "-teen" / "hundred" / "thousand": 「きこえた 数の ただしい つづりは どれ？」（forty / fourty。-teen と -ty の 回は thirteen / thirty の ききわけ）
 * あてはまらなければ null。ワールド13 の 問題より 先に よぶ（ふりかえり回の ワールド13 の focus は w13Question へ）。
 */
export function w14Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W14_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W14_PLURAL_FOCUS as readonly string[]).includes(f)) {
      const p = pluralSpelling(w);
      if (!p) continue;
      return { promptJa: "ふたつ いじょうの ときの ただしい つづりは どれ？", display: `${p.base} → ？`, choices: pick([p.answer, ...p.wrong]), answer: p.answer,
        explanationJa: `${p.base} → ${p.answer}。${PLURAL_WHY[p.kind](p.base)}` };
    }
    if ((W14_SILENT_FOCUS as readonly string[]).includes(f)) {
      const b = silentBlank(w, f);
      if (!b) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(SILENT_CHOICES[b.answer]), answer: b.answer,
        explanationJa: `${item.text} は「${b.answer}」。${SILENT_WHY[b.answer]}` };
    }
    if ((W14_NUMBER_FOCUS as readonly string[]).includes(f)) {
      const n = numberSpelling(w, focus);
      if (!n) continue;
      return { promptJa: "きこえた 数の ただしい つづりは どれ？", choices: pick([n.answer, ...n.wrong]), answer: n.answer,
        explanationJa: `ただしい つづりは「${n.answer}」。${n.tip}` };
    }
  }
  return null;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(target: LearningItemDef, pool: readonly LearningItemDef[], n: number, rng: () => number) {
  // おなじ ことば・おなじ 日本語の 項目が べつの 回にも あるので、選択肢が かさならないように 1つずつに する
  const norm = (s: string) => s.trim().toLowerCase();
  const seenText = new Set([norm(target.text)]);
  const seenJa = new Set([target.ja.trim()]);
  const out: LearningItemDef[] = [];
  for (const p of shuffle(pool, rng)) {
    if (out.length >= n) break;
    if (p.id === target.id || p.kind !== target.kind) continue;
    if (seenText.has(norm(p.text)) || seenJa.has(p.ja.trim())) continue;
    seenText.add(norm(p.text));
    seenJa.add(p.ja.trim());
    out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1項目 → 1問
// ---------------------------------------------------------------------------
export function makeQuestion(item: LearningItemDef, type: QuestionType, pool: readonly LearningItemDef[], rng: () => number, idx: number): Question {
  const base = { id: `q${idx}`, itemId: item.id };
  // 選択肢IDは位置ベースの記号（a,b,c,d）。正解はその記号。
  const LETTERS = "abcd";
  let correctId = "";
  let optItems: LearningItemDef[] = [];
  const opts = (labelOf: (i: LearningItemDef) => string, n = 3) => {
    optItems = shuffle([item, ...distractors(item, pool, n, rng)], rng);
    return optItems.map((i, k) => {
      if (i.id === item.id) correctId = LETTERS[k];
      return { id: LETTERS[k], label: labelOf(i) };
    });
  };

  switch (type) {
    case "listen_choose": {
      const raw = opts((i) => i.emoji ?? i.ja);
      // 絵だけで区別できないとき（曜日がすべて📅など）は日本語も添える
      const pics = optItems.map((i) => i.emoji ?? i.ja);
      const choices = new Set(pics).size === pics.length ? raw : raw.map((c, k) => ({ ...c, label: `${pics[k]} ${optItems[k].ja}` }));
      return { ...base, type, skill: "LISTENING", promptJa: "きこえた ことばの えを えらんでね", audioText: item.text,
        choices, answer: correctId,
        explanationJa: `「${item.text}」は「${item.ja}」だよ。もう一度きいてみよう！` };
    }
    case "tpr_reflex": {
      const choices = opts((i) => `${i.emoji ?? ""} ${i.ja}`);
      return { ...base, type, skill: "LISTENING", promptJa: "めいれいを きいたら すぐに うごきを えらぼう！", audioText: item.text,
        choices, answer: correctId, timeLimitMs: 4000,
        explanationJa: `「${item.text}」は「${item.ja}」。体をうごかしながら言うと覚えやすいよ。` };
    }
    case "meaning_choose": {
      const choices = opts((i) => i.ja);
      return { ...base, type, skill: "VOCABULARY", promptJa: "いみを えらんでね", display: item.text, audioText: item.text,
        choices, answer: correctId, explanationJa: `${item.text} ＝ ${item.ja}` };
    }
    case "expression_choose": {
      const choices = opts((i) => i.text);
      return { ...base, type, skill: "SCHOOL_TEST", promptJa: `「${item.ja}」を英語にすると？`,
        choices, answer: correctId,
        explanationJa: `正解は「${item.text}」。文の最初は大文字、最後はピリオド（.）かクエスチョンマーク（?）だよ。` };
    }
    case "phonics_sound": {
      // 語頭ブレンド → ワールド12（サイトワード・多音節語）→ ワールド10（soft c / g・-y・-le・aw au ew）→ ワールド11（-ed・-er・-est・サイトワード）→ 語末（-st / -s / -ing）→ マジック e → 母音チーム → r の つく母音 → ダイグラフ の順
      // （shopping は sh ではなく ing の回、shape は sh ではなく a_e の回、sheep は sh ではなく ee の回、shark は sh ではなく ar の回、
      //   shy は sh ではなく -y の回、chew は ch ではなく ew の回、what は wh ではなく サイトワードの 回の問題にする）
      // ワールド13（3 単現の -s・-tch / -dge）は いちばん 先（likes を 複数形の -s、catch を ダイグラフの ch で 問わない）
      // ワールド14（複数形・だまっている もじ・数の つづり）は さらに その 先（boxes を ワールド13 の -s の おと、knife を さいしょの おとで 問わない）
      const dq = w14Question(item, rng) ?? w13Question(item, rng) ?? blendQuestion(item, rng) ?? w12Question(item, rng) ?? w10Question(item, rng) ?? w11Question(item, rng) ?? endingQuestion(item, rng) ?? magicEQuestion(item, rng) ?? vowelTeamQuestion(item, rng)
        ?? rControlledQuestion(item, rng) ?? digraphQuestion(item, rng);
      if (dq) return { ...base, type, skill: "PHONICS", audioText: item.text, display: "🔊", ...dq };
      const first = item.text[0];
      // c と k は同じ /k/ の音なので、聞き分けられない組み合わせは出さない
      const sameSound = first === "c" ? "k" : first === "k" ? "c" : "";
      const letterPool = "satpinmdgockeurhbfl".split("").filter((l) => l !== sameSound);
      const letters = shuffle([...new Set([first, ...shuffle(letterPool, rng)])].slice(0, 4), rng);
      return { ...base, type, skill: "PHONICS", promptJa: "さいしょの おとは どれ？", audioText: item.text, display: "🔊",
        choices: letters.map((l) => ({ id: l, label: l })), answer: first,
        explanationJa: `${item.text} は「${first}」の音ではじまるよ。${item.ja}` };
    }
    case "spell":
      return { ...base, type, skill: "WRITING", promptJa: `「${item.ja}」を英語で書いてみよう`, display: item.emoji,
        answer: item.text, explanationJa: `正しいつづりは「${item.text}」。` };
    case "speak":
      return { ...base, type, skill: "SPEAKING", promptJa: "マイクをおして、まねして言ってみよう", display: item.text, audioText: item.text,
        answer: item.text, explanationJa: `お手本をよく聞いて、もう一回！` };
  }
}

/** 項目の種類ごとに出題可能な形式 */
function typesFor(item: LearningItemDef, allowSpeak: boolean): QuestionType[] {
  const t: QuestionType[] = [];
  switch (item.kind) {
    case "WORD":
      t.push("listen_choose", "meaning_choose");
      if (item.schoolCore) t.push("spell");
      break;
    case "EXPRESSION":
      t.push("expression_choose");
      if (item.schoolCore) t.push("spell");
      break;
    case "COMMAND":
      t.push("tpr_reflex");
      break;
    case "PHONICS":
      t.push("phonics_sound");
      break;
  }
  if (allowSpeak && item.kind !== "PHONICS") t.push("speak");
  return t;
}

// ---------------------------------------------------------------------------
// テスト（復習クエスト / まとめ / ボス / アリーナ / お宝）
// ---------------------------------------------------------------------------
export interface BuildTestOptions {
  seed: number;
  memories?: ReadonlyMap<string, MemoryState>;
  now?: Date;
  arenaMode?: ArenaMode;
  /** お宝アラート: 対象項目を固定 */
  fixedItemIds?: string[];
}

export function buildTestQuestions(a: AssessmentDef, o: BuildTestOptions): Question[] {
  const rng = seededRng(o.seed);
  const pool = itemsInRange(a.rangeStart, a.rangeEnd);
  const allowSpeak = o.arenaMode === "SPEAKING" || o.arenaMode === "MIXED";

  let chosen: LearningItemDef[];
  if (o.fixedItemIds?.length) {
    chosen = pool.filter((i) => o.fixedItemIds!.includes(i.id)).slice(0, a.questionCount);
  } else if (a.kind === "ARENA" && o.memories) {
    chosen = pickArenaItems(pool, o.memories, a.questionCount, o.now ?? new Date(), rng);
  } else {
    // 範囲内の各レッスンから均等に、学校頻出項目を優先して抽出
    const lessons = [...new Set(pool.map((i) => i.lessonNo))];
    const perLesson = Math.max(1, Math.ceil(a.questionCount / lessons.length));
    chosen = lessons.flatMap((n) => {
      const li = pool.filter((i) => i.lessonNo === n);
      const core = shuffle(li.filter((i) => i.schoolCore), rng);
      const rest = shuffle(li.filter((i) => !i.schoolCore), rng);
      return [...core, ...rest].slice(0, perLesson);
    });
    chosen = shuffle(chosen, rng).slice(0, a.questionCount);
  }

  return chosen.map((item, idx) => {
    let types = typesFor(item, allowSpeak);
    if (o.arenaMode === "LISTENING") types = types.filter((t) => ["listen_choose", "tpr_reflex", "phonics_sound"].includes(t));
    if (o.arenaMode === "WRITING") types = types.filter((t) => t === "spell" || t === "expression_choose");
    if (o.arenaMode === "SPEAKING") types = ["speak"];
    if (types.length === 0) types = typesFor(item, false);
    const type = types[Math.floor(rng() * types.length)];
    return makeQuestion(item, type, pool, rng, idx);
  });
}

// ---------------------------------------------------------------------------
// 1日のレッスン構成（約25〜30分）
// ---------------------------------------------------------------------------
export type LessonStep =
  | { kind: "teacher_video"; minutes: number; script: string; videoUrl?: string }
  | { kind: "flashcards"; minutes: number; itemIds: string[] }
  | { kind: "tpr"; minutes: number; itemIds: string[] }
  | { kind: "phonics"; minutes: number; focus: string[]; words: string[]; tipJa: string }
  | { kind: "school_expressions"; minutes: number; itemIds: string[]; testPoints: string[] }
  | { kind: "pronunciation"; minutes: number; itemIds: string[] }
  | { kind: "quiz"; minutes: number; questions: Question[] }
  | { kind: "speed_listening"; minutes: number; rounds: { rate: number; questions: Question[] }[] }
  | { kind: "conversation"; minutes: number; character: "haru" | "riko" | "kiko" | "birimo"; maxTurns: number };

export const SPEED_ROUNDS = [0.8, 1.0, 1.2] as const;

export function buildLessonFlow(lesson: LessonDef, seed = lesson.lessonNo): LessonStep[] {
  const rng = seededRng(seed);
  const items = itemsOfLesson(lesson);
  const ids = (k: LearningItemDef["kind"]) => items.filter((i) => i.kind === k).map((i) => i.id);
  // 反射クイズのプールは「当日 + 直前4レッスン」（ずっと同じ4択にならないように）
  const reflexPool = itemsInRange(Math.max(1, lesson.lessonNo - 4), lesson.lessonNo).filter((i) => i.kind !== "PHONICS" && i.kind !== "EXPRESSION");
  const todays = items.filter((i) => i.kind === "WORD" || i.kind === "COMMAND");

  const quizItems = shuffle(items, rng).slice(0, 8);
  return [
    { kind: "teacher_video", minutes: 3, script: lesson.teacherScript },
    { kind: "flashcards", minutes: 4, itemIds: [...ids("COMMAND"), ...ids("WORD")] },
    { kind: "tpr", minutes: 4, itemIds: ids("COMMAND") },
    { kind: "phonics", minutes: 5, focus: lesson.phonics.focus, words: lesson.phonics.words, tipJa: lesson.phonics.tipJa },
    { kind: "school_expressions", minutes: 4, itemIds: ids("EXPRESSION"), testPoints: lesson.school.testPoints },
    { kind: "pronunciation", minutes: 3, itemIds: [...ids("WORD").slice(0, 3), ...ids("EXPRESSION").slice(0, 1)] },
    { kind: "quiz", minutes: 4, questions: quizItems.map((it, i) => makeQuestion(it, typesFor(it, false)[0], items, rng, i)) },
    {
      kind: "speed_listening",
      minutes: 3,
      rounds: SPEED_ROUNDS.map((rate, r) => ({
        rate,
        questions: shuffle(todays, rng).slice(0, 4).map((it, i) => ({
          ...makeQuestion(it, it.kind === "COMMAND" ? "tpr_reflex" : "listen_choose", reflexPool, rng, r * 10 + i),
          playbackRate: rate,
          timeLimitMs: Math.round(5000 / rate),
        })),
      })),
    },
    // さいごに AIキャラと かいわ（相手は レッスンごとに Haru → Riko → Kiko → Birimo。その回の 台本で 話す キャラから）。会話データのある レッスンだけ
    ...(lesson.conversation
      ? [{ kind: "conversation" as const, minutes: 3, character: pickConversationPartner(lesson.lessonNo, lesson.conversation), maxTurns: MAX_CONVERSATION_TURNS }]
      : []),
  ];
}
