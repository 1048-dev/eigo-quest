/**
 * 問題ファクトリ。学習項目から問題を決定的（seed付き）に生成する。
 * サーバーは同じ seed で問題を再生成して採点するため、クライアントに正解を渡さずに済む。
 */
import type { AssessmentDef, LearningItemDef, LessonDef, MemoryState, Skill } from "@/lib/domain/types";
import { pickArenaItems, type ArenaMode } from "@/lib/domain/arena";
import { itemsInRange, itemsOfLesson } from "./index";

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
      const first = item.text[0];
      const letters = shuffle([...new Set([first, ...shuffle("satpinmdgockeurhbfl".split(""), rng)])].slice(0, 4), rng);
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
  | { kind: "speed_listening"; minutes: number; rounds: { rate: number; questions: Question[] }[] };

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
  ];
}
