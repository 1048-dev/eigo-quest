/**
 * 問題ファクトリ。学習項目から問題を決定的（seed付き）に生成する。
 * サーバーは同じ seed で問題を再生成して採点するため、クライアントに正解を渡さずに済む。
 */
import type { AssessmentDef, LearningItemDef, LessonDef, MemoryState, Skill } from "@/lib/domain/types";
import { pickArenaItems, type ArenaMode } from "@/lib/domain/arena";
import { MAX_CONVERSATION_TURNS } from "@/lib/conversation/engine";
import { getLesson, itemsInRange, itemsOfLesson } from "./index";
import { VOWEL_TEAMS, VOWEL_TEAM_INTRO, possibleSounds, shortVowelOf, teamSound } from "./vowelTeams";

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
  const endings = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => f.startsWith("-")).map((f) => f.slice(1).toLowerCase());
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

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(target: LearningItemDef, pool: readonly LearningItemDef[], n: number, rng: () => number) {
  const same = pool.filter((p) => p.id !== target.id && p.kind === target.kind && p.text !== target.text);
  return shuffle(same, rng).slice(0, n);
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
      // 語頭ブレンド → 語末（-st / -s / -ing）→ マジック e → 母音チーム → ダイグラフ の順
      // （shopping は sh ではなく ing の回、shape は sh ではなく a_e の回、sheep は sh ではなく ee の回の問題にする）
      const dq = blendQuestion(item, rng) ?? endingQuestion(item, rng) ?? magicEQuestion(item, rng) ?? vowelTeamQuestion(item, rng) ?? digraphQuestion(item, rng);
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
    // さいごに AIキャラ（ふだんはハル）と かいわ。会話データのある レッスンだけ
    ...(lesson.conversation
      ? [{ kind: "conversation" as const, minutes: 3, character: "haru" as const, maxTurns: MAX_CONVERSATION_TURNS }]
      : []),
  ];
}
