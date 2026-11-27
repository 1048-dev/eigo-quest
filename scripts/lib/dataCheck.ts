/**
 * run10 Phase 2: すべての データの 確認（1,200 レッスン・すべての テスト・としょかん・力だめし）。
 *
 *  - scripts/data-check.ts（npm run check:data）が これを よんで 進みぐあい・表・docs/run10/report/data.md を 出す
 *  - tests/data-check.test.ts も おなじ 関数で「問題 0」を たしかめる（seed は すくなめ）
 *
 * ここの 関数は DB も ブラウザも つかわない。サーバー（Node）では 全ワールド・全フォニックスが 読みこまれて いる。
 */
import { ASSESSMENTS, LESSONS, TOTAL_LESSONS, gateTestAfterLesson, getItem, itemsInRange, itemsOfLesson } from "../../src/lib/curriculum";
import {
  SPEED_ROUNDS, blendQuestion, buildLessonFlow, buildTestQuestions, makeQuestion, seededRng, typesFor, w10Question, w11Question, w12Question,
  type LessonStep, type Question,
} from "../../src/lib/curriculum/questions";
import { shuffle } from "../../src/lib/curriculum/shuffle";
import { FIRST_LAZY_PHONICS_WORLD, LAST_PHONICS_WORLD, worldPhonics } from "../../src/lib/curriculum/phonicsWorlds";
import { LESSONS_PER_MONTH_PACK, monthPack, monthPackCount } from "../../src/lib/curriculum/stages";
import { CURRICULUM_RULES } from "../../src/lib/domain/config";
import type { ArenaMode } from "../../src/lib/domain/arena";
import type { AssessmentDef, LearningItemDef, LessonConversation, LessonDef, MemoryState } from "../../src/lib/domain/types";
import { gradeLocally, normalizeInput } from "../../src/lib/grading/localGrader";
import { offlineTestSubmit } from "../../src/lib/offline/tests";
import { buildTeacherTimeline } from "../../src/lib/teacher/timeline";
import { TEACHER_MAX_MS, TEACHER_MIN_MS, lessonSlideVocabulary } from "../../src/lib/teacher/timing";
import { RECAP_TIMING, buildRecapScript } from "../../src/lib/recap/script";
import {
  CONVERSATION_CHARACTERS, GENERIC_CONVERSATION, MAX_CONVERSATION_TURNS, concreteTarget, pickConversationPartner, scriptedReply, starterLine, usedTargets,
  type ConversationTurn,
} from "../../src/lib/conversation/engine";
import { worksheetKey } from "../../src/lib/report/storage";
import { LIBRARY_INDEX, STORY_STAGES, loadChants, loadStory, loadStoryStage, loadTalkThemes } from "../../src/lib/library/catalog";
import { buildLibraryIndex } from "../../src/lib/library/buildIndex";
import { gradeStory, validateChant, validateStory, validateTalkTheme } from "../../src/lib/library/rules";
import { themeConversation } from "../../src/lib/library/talk";
import type { Chant, Story, TalkTheme } from "../../src/lib/library/types";
import { loadYearlyTest } from "../../src/lib/yearly/catalog";
import { YEARLY_STAGES } from "../../src/lib/yearly/spec";
import { validateYearlyTest } from "../../src/lib/yearly/validate";
import { SPEAKING_MAX, buildResult, gradeChoices, sanitizeAnswers, scoreSpeakingRule, scoreWritingRule, writingMax } from "../../src/lib/yearly/scoring";
import type { YearlyTest } from "../../src/lib/yearly/types";

export interface Section {
  name: string;
  title: string;
  /** しらべた 数（「レッスン 1,200」「問題 123,456」など。表に 出す） */
  counts: Record<string, number>;
  problems: string[];
  ms: number;
}

export interface DataCheckOptions {
  /** テストを つくる seed（いくつかの seed で 出題が かわっても こわれない ことを みる） */
  seeds?: readonly number[];
  /** しらべる セクション（なければ ぜんぶ） */
  only?: readonly string[];
  progress?: (msg: string) => void;
  /** worksheets/generate_worksheets.py の 中身（定数を くらべる。なければ その 確認を とばす） */
  worksheetPy?: string;
  /** この 時刻（Date.now()）を こえたら とちゅうで 止める（重い ループの 中でも 止まる ように） */
  deadlineAt?: number;
}

export const DEFAULT_SEEDS = [1, 2, 3, 42, 20261127] as const;

const LATIN = /[A-Za-z]/;
const JA = /[぀-ヿ㐀-鿿]/;
/** テンプレートの まちがいで 出る 文字（"undefined" "NaN" "[object Object]"） */
const TEMPLATE_BUG = /\bundefined\b|\bNaN\b|\[object |\bnull\b/;
/** こどもが キーボードで 打てる 文字（NFKC の あと） */
const TYPEABLE = /^[A-Za-z0-9 .,!?'"\-:;()&/$%]+$/;

const NEEDS_AUDIO = new Set<Question["type"]>(["listen_choose", "tpr_reflex", "meaning_choose", "phonics_sound", "speak"]);
const CHOICE_TYPES = new Set<Question["type"]>(["listen_choose", "tpr_reflex", "meaning_choose", "expression_choose", "phonics_sound"]);

// ---------------------------------------------------------------------------
// 1問の 確認
// ---------------------------------------------------------------------------

/** 1問の 中身（正解が 選択肢に ある・選択肢が かさならない・からっぽが ない・音声・解説・スペルの 採点） */
export function questionProblems(q: Question, where: string): string[] {
  const out: string[] = [];
  const bad = (m: string) => out.push(`${where} ${q.id} ${q.type} ${q.itemId}: ${m}`);
  const item = getItem(q.itemId);
  if (!item) bad("学習項目が ない");
  if (!q.promptJa?.trim()) bad("問題文（promptJa）が からっぽ");
  if (!q.explanationJa?.trim()) bad("まちがえた ときの 解説（explanationJa）が ない");
  if (typeof q.answer !== "string" || !q.answer.trim()) bad("正解（answer）が からっぽ");
  for (const [k, v] of Object.entries({ promptJa: q.promptJa, explanationJa: q.explanationJa, display: q.display, audioText: q.audioText, answer: q.answer })) {
    if (typeof v === "string" && TEMPLATE_BUG.test(v)) bad(`${k} に「${v}」`);
  }
  if (NEEDS_AUDIO.has(q.type) && !(q.audioText?.trim() && LATIN.test(q.audioText))) bad("読みあげる 英語（audioText）が ない");
  if (q.timeLimitMs !== undefined && !(q.timeLimitMs > 0)) bad(`制限時間 ${q.timeLimitMs}`);
  if (q.playbackRate !== undefined && !(SPEED_ROUNDS as readonly number[]).includes(q.playbackRate)) bad(`再生の 速さ ${q.playbackRate}`);

  if (CHOICE_TYPES.has(q.type)) {
    const cs = q.choices ?? [];
    // フォニックスは 2つの おとの 聞きわけ（-s の ス / ズ）も あるので 2つ 以上。ことばを えらぶ 問題は 3つ 以上（2択は あてずっぽうで 半分 あたる）
    const minChoices = q.type === "phonics_sound" ? 2 : 3;
    if (cs.length < minChoices) bad(`選択肢が ${cs.length}つ（${minChoices}つ 以上）`);
    if (new Set(cs.map((c) => c.id)).size !== cs.length) bad(`選択肢の id が かさなる: ${cs.map((c) => c.id).join(",")}`);
    const labels = cs.map((c) => c.label.trim());
    if (labels.some((l) => !l)) bad("からっぽの 選択肢");
    if (new Set(labels).size !== labels.length) bad(`選択肢が かさなる: ${labels.join(" / ")}`);
    for (const l of labels) if (TEMPLATE_BUG.test(l)) bad(`選択肢に「${l}」`);
    const right = cs.find((c) => c.id === q.answer);
    if (!right) bad(`正解「${q.answer}」が 選択肢（${cs.map((c) => c.id).join(",")}）に ない`);
    else if (item) {
      // 正解の 選択肢の 文字が その ことばに あって いるか
      if (q.type === "meaning_choose" && right.label !== item.ja) bad(`正解の 選択肢「${right.label}」が 意味「${item.ja}」と ちがう`);
      if (q.type === "expression_choose" && right.label !== item.text) bad(`正解の 選択肢「${right.label}」が「${item.text}」と ちがう`);
      if (q.type === "tpr_reflex" && !right.label.includes(item.ja)) bad(`正解の 選択肢「${right.label}」に「${item.ja}」が ない`);
      if (q.type === "listen_choose" && !right.label.includes(item.emoji ?? item.ja)) bad(`正解の 選択肢「${right.label}」が 絵（${item.emoji ?? item.ja}）と ちがう`);
      if (q.type === "phonics_sound") out.push(...phonicsAnswerProblems(q, item, right.label).map((m) => `${where} ${q.id} ${q.type} ${q.itemId}: ${m}`));
    }
  } else if (q.choices?.length) bad("この 形式に 選択肢は いらない");

  if (q.type === "spell" && item && typeof q.answer === "string") out.push(...spellingProblems(q.answer, item).map((m) => `${where} ${q.id} spell ${q.itemId}: ${m}`));
  if (q.type === "speak" && item && q.answer !== item.text) bad(`お手本「${q.answer}」が「${item.text}」と ちがう`);
  return out;
}

/** スペル問題: こどもが 打てる 文字だけ・お手本どおりなら 学校モードでも 合格・から / べつの ことばは 合格に しない */
export function spellingProblems(answer: string, item: Pick<LearningItemDef, "text">): string[] {
  const out: string[] = [];
  const norm = normalizeInput(answer);
  if (answer !== item.text) out.push(`正解「${answer}」が「${item.text}」と ちがう`);
  if (!TYPEABLE.test(norm)) out.push(`キーボードで 打てない 文字が ある「${norm}」（${[...norm].filter((ch) => !TYPEABLE.test(ch)).join("")}）`);
  for (const s of ["school", "lenient"] as const) {
    const g = gradeLocally(answer, answer, s);
    if (g.verdict !== "PASS" || !g.certain) out.push(`お手本どおりに 書いても ${s} で ${g.verdict}`);
  }
  if (gradeLocally(answer, "", "lenient").verdict === "PASS") out.push("から でも 合格に なる");
  if (gradeLocally(answer, "zzzz qqqq", "lenient").verdict === "PASS") out.push("べつの ことばでも 合格に なる");
  // 全角で 打っても（スマホの 日本語キーボード）合格
  const wide = answer.replace(/[A-Za-z0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
  if (gradeLocally(answer, wide, "school").verdict !== "PASS") out.push("全角で 打つと 合格に ならない");
  return out;
}

/** フォニックス: 問いかたと 正解の つづりが その ことばに あって いるか（ことばの はじめ・なか・おわり） */
export function phonicsAnswerProblems(q: Question, item: LearningItemDef, label: string): string[] {
  const out: string[] = [];
  const w = item.text.toLowerCase();
  const a = label.toLowerCase().replace(/^-/, "");
  const prompt = q.promptJa;
  if (/^[A-Za-z]$/.test(label) && label !== label.toLowerCase()) out.push(`正解の 文字「${label}」が 大文字（ほかの 選択肢は 小文字）`);
  if (/^さいしょの (2つの |3つの )?おとは どれ？$/.test(prompt) && !w.startsWith(a)) out.push(`「${prompt}」の 正解「${label}」で ${item.text} が はじまらない`);
  if (prompt === "どの つづりが はいってる？" && !w.includes(a)) out.push(`「${prompt}」の 正解「${label}」が ${item.text} に ない`);
  if ((prompt === "おわりの 2つの おとは どれ？" || prompt === "おわりに ついている のは どれ？") && !w.endsWith(a)) out.push(`「${prompt}」の 正解「${label}」で ${item.text} が おわらない`);
  if (q.choices && q.choices.some((c) => c.id !== q.answer && /^[a-z]+$/.test(c.label) && /^さいしょの (2つの |3つの )?おとは どれ？$/.test(prompt) && c.label.length >= a.length && w.startsWith(c.label))) {
    out.push(`まちがいの 選択肢でも ${item.text} が はじまる（${q.choices.map((c) => c.label).join(" / ")}）`);
  }
  return out;
}

/** フォニックスの 問題が ステージに あって いるか（まだ ならって いない ワールドの 問いかたを つかわない） */
export function phonicsStageProblems(item: LearningItemDef, world: number): string[] {
  const out: string[] = [];
  for (let n = Math.max(world + 1, FIRST_LAZY_PHONICS_WORLD); n <= LAST_PHONICS_WORLD; n++) {
    const q = worldPhonics(n)?.question(item, seededRng(7));
    if (q) out.push(`${item.id}（ワールド${world}）: ワールド${n} の 問いかた「${q.promptJa}」に なる`);
  }
  const early: [number, (i: LearningItemDef, r: () => number) => unknown][] = [[10, w10Question], [11, w11Question], [12, w12Question]];
  for (const [w0, fn] of early) if (world < w0 && fn(item, seededRng(7))) out.push(`${item.id}（ワールド${world}）: ワールド${w0} の 問いかたに なる`);
  // 語頭ブレンドは ワールド4 から（それより まえは さいしょの 1文字）
  if (world < 4 && blendQuestion(item, seededRng(7))) out.push(`${item.id}（ワールド${world}）: ワールド4 の ブレンドの 問いかたに なる`);
  return out;
}

function stepQuestions(step: LessonStep): Question[] {
  if (step.kind === "quiz") return step.questions;
  if (step.kind === "speed_listening") return step.rounds.flatMap((r) => r.questions);
  return [];
}

const STEP_ORDER: LessonStep["kind"][] = ["teacher_video", "flashcards", "tpr", "phonics", "school_expressions", "pronunciation", "quiz", "speed_listening"];

/** 1レッスンの ながれ（ステップの じゅんばん・項目 ID・クイズ・スピードリスニング） */
export function lessonFlowProblems(lesson: LessonDef, seed: number): { problems: string[]; questions: number } {
  const out: string[] = [];
  const where = `L${lesson.lessonNo} seed=${seed}`;
  let flow: LessonStep[];
  try {
    flow = buildLessonFlow(lesson, seed);
  } catch (e) {
    return { problems: [`${where}: レッスンの ながれが 作れない: ${e instanceof Error ? e.message : e}`], questions: 0 };
  }
  const kinds = flow.map((s) => s.kind);
  const expected = [...STEP_ORDER, ...(lesson.conversation ? (["conversation"] as const) : [])];
  if (kinds.join(",") !== expected.join(",")) out.push(`${where}: ステップの じゅんばん ${kinds.join(",")}`);
  const ids = new Set(itemsOfLesson(lesson).map((i) => i.id));
  let questions = 0;
  for (const step of flow) {
    if (!(step.minutes > 0)) out.push(`${where} ${step.kind}: minutes ${step.minutes}`);
    if ("itemIds" in step) {
      for (const id of step.itemIds) if (!ids.has(id)) out.push(`${where} ${step.kind}: この レッスンに ない 項目 ${id}`);
      if (step.itemIds.length === 0 && step.kind !== "tpr") out.push(`${where} ${step.kind}: 項目が 0`);
    }
    if (step.kind === "teacher_video" && !step.script.trim()) out.push(`${where}: 先生の 台本（teacherScript）が からっぽ`);
    if (step.kind === "school_expressions" && step.testPoints.some((t) => !t.trim())) out.push(`${where}: からっぽの testPoints`);
    if (step.kind === "phonics") {
      if (!step.focus.length || !step.words.length || !step.tipJa.trim()) out.push(`${where}: フォニックスの focus / words / tipJa が ない`);
      if ((step.examples ?? []).length !== step.focus.length) out.push(`${where}: フォニックスの おてほんの 数 ${(step.examples ?? []).length} ≠ focus ${step.focus.length}`);
      step.examples?.forEach((x, i) => { if (!x?.trim()) out.push(`${where}: フォーカス「${step.focus[i]}」の おてほんが からっぽ`); });
    }
    if (step.kind === "conversation" && !CONVERSATION_CHARACTERS.includes(step.character)) out.push(`${where}: かいわの あいて ${step.character}`);
    if (step.kind === "quiz" && step.questions.length !== Math.min(8, ids.size)) out.push(`${where}: クイズが ${step.questions.length}問`);
    if (step.kind === "speed_listening") {
      if (step.rounds.length !== SPEED_ROUNDS.length) out.push(`${where}: スピードリスニングの ラウンド ${step.rounds.length}`);
      for (const r of step.rounds) {
        if (r.questions.length === 0) out.push(`${where}: スピードリスニング ×${r.rate} が 0問`);
        for (const q of r.questions) if (q.playbackRate !== r.rate) out.push(`${where}: スピードリスニング ×${r.rate} の 速さ ${q.playbackRate}`);
      }
    }
    const qs = stepQuestions(step);
    const qids = qs.map((q) => q.id);
    if (new Set(qids).size !== qids.length) out.push(`${where} ${step.kind}: 問題の id が かさなる`);
    for (const q of qs) out.push(...questionProblems(q, `${where} ${step.kind}`));
    questions += qs.length;
  }
  return { problems: out, questions };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

export function treasureAssessment(n: number): AssessmentDef {
  return { id: `treasure-${n}`, kind: "TREASURE", rangeStart: n, rangeEnd: n, questionCount: CURRICULUM_RULES.treasureQuestions, passRate: CURRICULUM_RULES.treasurePassRate, unlocksLesson: null };
}

/** アリーナ用の それっぽい 記憶（よく おぼえた ものと わすれかけの ものを まぜる） */
export function fakeMemories(pool: readonly LearningItemDef[], seed: number, now: Date): Map<string, MemoryState> {
  const rng = seededRng(seed);
  const m = new Map<string, MemoryState>();
  for (const it of pool) {
    if (rng() < 0.3) continue;
    const days = Math.floor(rng() * 60);
    m.set(it.id, { itemId: it.id, stability: 0.5 + rng() * 30, difficulty: 1 + rng() * 9, reviewCount: Math.floor(rng() * 10), lapses: Math.floor(rng() * 3), accuracyEwma: rng(), lastReviewedAt: new Date(now.getTime() - days * 86_400_000) });
  }
  return m;
}

const LISTENING_TYPES = new Set<Question["type"]>(["listen_choose", "tpr_reflex", "phonics_sound"]);

export interface TestVariant {
  a: AssessmentDef;
  seed: number;
  arenaMode?: ArenaMode;
  memories?: boolean;
  fixedItemIds?: string[];
}

/** 1つの テスト（1つの seed・モード）: 問題数・範囲・かさなり・モードの 形式・1問ずつの 中身 */
export function testProblems(v: TestVariant, now = new Date("2026-11-27T09:00:00+09:00")): { problems: string[]; questions: Question[] } {
  const { a, seed } = v;
  const where = `${a.id} seed=${seed}${v.arenaMode ? ` ${v.arenaMode}` : ""}${v.memories ? " (記憶あり)" : ""}${v.fixedItemIds ? " (お宝の 項目)" : ""}`;
  let qs: Question[];
  try {
    const pool = itemsInRange(a.rangeStart, a.rangeEnd);
    qs = buildTestQuestions(a, { seed, arenaMode: v.arenaMode, now, memories: v.memories ? fakeMemories(pool, seed, now) : undefined, fixedItemIds: v.fixedItemIds });
  } catch (e) {
    return { problems: [`${where}: 問題が 作れない: ${e instanceof Error ? e.message : e}`], questions: [] };
  }
  const out: string[] = [];
  const want = v.fixedItemIds ? Math.min(a.questionCount, v.fixedItemIds.length) : a.questionCount;
  if (qs.length !== want) out.push(`${where}: ${qs.length}問（${want}問の はず）`);
  const itemIds = qs.map((q) => q.itemId);
  if (new Set(itemIds).size !== itemIds.length) out.push(`${where}: おなじ 項目が 2回 出る`);
  if (new Set(qs.map((q) => q.id)).size !== qs.length) out.push(`${where}: 問題の id が かさなる`);
  for (const q of qs) {
    const it = getItem(q.itemId);
    if (it && (it.lessonNo < a.rangeStart || it.lessonNo > a.rangeEnd)) out.push(`${where} ${q.id}: 範囲 ${a.rangeStart}〜${a.rangeEnd} の 外の 項目 ${q.itemId}`);
    if (v.fixedItemIds && !v.fixedItemIds.includes(q.itemId)) out.push(`${where} ${q.id}: お宝の 項目で ない ${q.itemId}`);
    if (it && v.arenaMode) {
      const allowed = typesFor(it, v.arenaMode === "SPEAKING" || v.arenaMode === "MIXED");
      const modeOk = v.arenaMode === "LISTENING" ? LISTENING_TYPES.has(q.type) : v.arenaMode === "WRITING" ? q.type === "spell" || q.type === "expression_choose" : v.arenaMode === "SPEAKING" ? q.type === "speak" : true;
      // モードに あう 形式が ない 項目（PHONICS の スピーキングなど）は ふつうの 形式に もどる
      const fallback = !modeOk && !allowed.some((t) => (v.arenaMode === "LISTENING" ? LISTENING_TYPES.has(t) : v.arenaMode === "WRITING" ? t === "spell" || t === "expression_choose" : t === "speak")) && typesFor(it, false).includes(q.type);
      if (!modeOk && !fallback) out.push(`${where} ${q.id}: ${v.arenaMode} に ${q.type}`);
    }
    out.push(...questionProblems(q, where));
  }
  return { problems: out, questions: qs };
}

/** 正しい こたえで 100点・まちがいで 0点（オフラインの 採点。サーバーと おなじ seed で 作りなおして 採点する） */
export function gradingRoundTripProblems(a: AssessmentDef, seed: number, questions: readonly Question[], arenaMode?: ArenaMode): string[] {
  const where = `${a.id} seed=${seed}${arenaMode ? ` ${arenaMode}` : ""}`;
  const right = questions.map((q) => ({ questionId: q.id, value: q.type === "speak" ? "0.95" : q.answer }));
  const wrong = questions.map((q) => ({ questionId: q.id, value: q.type === "speak" ? "0.1" : q.type === "spell" ? "" : "zz" }));
  const out: string[] = [];
  const ok = offlineTestSubmit(a.id, { seed, arenaMode, answers: right });
  if (ok.score !== 1 || !ok.passed) out.push(`${where}: 正しい こたえで ${Math.round(ok.score * 100)}点（${ok.feedback.filter((f) => !f.correct).map((f) => f.questionId).join(",")} が ×）`);
  if (a.unlocksLesson && ok.unlocksLesson !== a.unlocksLesson) out.push(`${where}: 合格しても Lesson ${a.unlocksLesson} が ひらかない`);
  const ng = offlineTestSubmit(a.id, { seed, arenaMode, answers: wrong });
  if (ng.score !== 0 || ng.passed) out.push(`${where}: まちがった こたえで ${Math.round(ng.score * 100)}点`);
  for (const f of ng.feedback) if (!f.explanationJa?.trim()) out.push(`${where} ${f.questionId}: まちがえた ときの 解説が とどかない`);
  return out;
}

// ---------------------------------------------------------------------------
// 先生・まとめ・かいわ
// ---------------------------------------------------------------------------

export function teacherProblems(lesson: LessonDef): { problems: string[]; ms: number; source: string } {
  const where = `L${lesson.lessonNo} 先生`;
  const out: string[] = [];
  const partner = lesson.conversation ? pickConversationPartner(lesson.lessonNo, lesson.conversation) : undefined;
  const tl = buildTeacherTimeline(lesson, { partner });
  if (tl.totalMs < TEACHER_MIN_MS || tl.totalMs > TEACHER_MAX_MS) out.push(`${where}: 長さ ${(tl.totalMs / 1000).toFixed(1)} 秒（${TEACHER_MIN_MS / 1000}〜${TEACHER_MAX_MS / 1000} 秒）・${tl.source}`);
  if (tl.segments.length < 3) out.push(`${where}: セグメントが ${tl.segments.length}`);
  const vocab = lessonSlideVocabulary(lesson);
  const norm = (s: string) => s.toLowerCase().replace(/[’]/g, "'").replace(/[.!?,。！？、]+$/g, "").replace(/\s+/g, " ").trim();
  let t = 0;
  for (const s of tl.segments) {
    const at = `${where} #${s.index} ${s.kind}`;
    if (s.startMs !== t || !(s.endMs > s.startMs)) out.push(`${at}: 時間が つながらない（${s.startMs}〜${s.endMs}）`);
    t = s.endMs;
    if (s.units.length === 0) out.push(`${at}: 読みあげる ことばが ない`);
    if (!s.subtitleJa.trim() && !s.subtitleEn.trim()) out.push(`${at}: 字幕が ない`);
    if (lesson.world <= 20 && !s.subtitleJa.trim()) out.push(`${at}: 日本語字幕が ない`);
    for (const x of [s.say, s.subtitleJa, s.subtitleEn, s.slide.title, ...s.slide.items]) if (TEMPLATE_BUG.test(x)) out.push(`${at}: 「${x}」`);
    for (const it of s.slide.items) if (!vocab.has(norm(it))) out.push(`${at}: スライドの「${it}」が レッスンに ない`);
  }
  if (t !== tl.totalMs) out.push(`${where}: 合計 ${tl.totalMs} ≠ ${t}`);
  return { problems: out, ms: tl.totalMs, source: tl.source };
}

export function recapProblems(lesson: LessonDef): { problems: string[]; ms: number } {
  const where = `L${lesson.lessonNo} まとめ`;
  const out: string[] = [];
  let s;
  try {
    s = buildRecapScript(lesson);
  } catch (e) {
    return { problems: [`${where}: 作れない: ${e instanceof Error ? e.message : e}`], ms: 0 };
  }
  if (s.totalMs < RECAP_TIMING.minTotalMs || s.totalMs > RECAP_TIMING.maxTotalMs) out.push(`${where}: 長さ ${(s.totalMs / 1000).toFixed(1)} 秒（${RECAP_TIMING.minTotalMs / 1000}〜${RECAP_TIMING.maxTotalMs / 1000} 秒）`);
  if (new Set(s.segments.map((x) => x.id)).size !== s.segments.length) out.push(`${where}: セグメントの id が かさなる`);
  let t = 0;
  for (const seg of s.segments) {
    if (seg.startMs !== t || !(seg.durationMs > 0)) out.push(`${where} ${seg.id}: 時間が つながらない`);
    t += seg.durationMs;
    if (!seg.sayJa.trim()) out.push(`${where} ${seg.id}: sayJa が からっぽ`);
    if (seg.en !== undefined && !LATIN.test(seg.en)) out.push(`${where} ${seg.id}: 英語が からっぽ`);
    if (seg.en && JA.test(seg.en)) out.push(`${where} ${seg.id}: 英語に 日本語「${seg.en}」`);
    for (const x of [seg.sayJa, seg.en ?? "", seg.ja ?? ""]) if (TEMPLATE_BUG.test(x)) out.push(`${where} ${seg.id}: 「${x}」`);
  }
  if (t !== s.totalMs) out.push(`${where}: 合計が あわない`);
  const sections = s.chapters.map((c) => c.section);
  for (const need of ["intro", "words", "outro"] as const) if (!sections.includes(need)) out.push(`${where}: 「${need}」の 章が ない`);
  return { problems: out, ms: s.totalMs };
}

/**
 * かいわの 台本エンジン（AI が つかえない ときの 返事）: 目標の 表現を 言う・なにも 言えない・ちがう ことを 言う の 3とおりで
 * さいごまで 話して、返事が かならず ある・～ が のこらない・おわる ことを みる。
 */
export function conversationProblems(conv: LessonConversation, where: string, lessonNo: number): { problems: string[]; replies: number } {
  const out: string[] = [];
  let replies = 0;
  const char = pickConversationPartner(lessonNo, conv);
  const starter = starterLine(conv, char);
  if (!starter.trim() || JA.test(starter)) out.push(`${where}: さいしょの ひとこと「${starter}」`);
  if (!conv.aiTask.goalJa.trim()) out.push(`${where}: goalJa が からっぽ`);
  if (conv.aiTask.targetExpressions.length === 0) out.push(`${where}: 目標の 表現が ない`);
  if (conv.lines.length < 2) out.push(`${where}: 台本が ${conv.lines.length}行`);
  for (const [i, l] of conv.lines.entries()) if (!l.en.trim() || !l.ja.trim() || JA.test(l.en)) out.push(`${where}: ${i + 1}行目「${l.en}」/「${l.ja}」`);
  for (const t of conv.aiTask.targetExpressions) {
    const c = concreteTarget(t, conv);
    // ～ の ある 目標は 台本の 文で お手本を つくる。台本に なければ「I like ....」のような 文に なって しまう
    if (/[～~＿_]/.test(c) || (/[～~＿_]/.test(t) && c.includes("..."))) out.push(`${where}: 目標「${t}」の お手本に ～ が のこる「${c}」`);
    if (usedTargets(c, [t]).length === 0) out.push(`${where}: お手本「${c}」を 言っても 目標「${t}」を つかった ことに ならない`);
  }
  const plans: [string, (turn: number) => string][] = [
    ["目標", (k) => concreteTarget(conv.aiTask.targetExpressions[k % Math.max(1, conv.aiTask.targetExpressions.length)] ?? "Hello!", conv)],
    ["だまる", () => ""],
    ["ちがう", () => "banana pizza rocket"],
  ];
  for (const [label, say] of plans) {
    const history: ConversationTurn[] = [{ role: "ai", text: starter }];
    let done = false;
    for (let k = 0; k < MAX_CONVERSATION_TURNS + 1 && !done; k++) {
      const childText = say(k);
      const r = scriptedReply({ conversation: conv, history, childText });
      replies++;
      const at = `${where} ${label} ${k + 1}回目`;
      if (!r.replyEn.trim() || !r.replyJa.trim()) out.push(`${at}: 返事が からっぽ`);
      if (JA.test(r.replyEn)) out.push(`${at}: 英語の 返事に 日本語「${r.replyEn}」`);
      if (/[～~＿]/.test(r.replyEn) || TEMPLATE_BUG.test(r.replyEn) || TEMPLATE_BUG.test(r.replyJa)) out.push(`${at}: 返事「${r.replyEn}」`);
      for (const sug of r.suggestions) if (/[～~＿]/.test(sug) || JA.test(sug) || !sug.trim()) out.push(`${at}: タップの 候補「${sug}」`);
      if (!r.done && r.suggestions.length === 0) out.push(`${at}: タップの 候補が ない`);
      if (label === "目標" && conv.aiTask.targetExpressions.length && !r.usedTarget) out.push(`${at}: 「${childText}」で 目標を つかった ことに ならない`);
      history.push({ role: "child", text: childText }, { role: "ai", text: r.replyEn });
      done = r.done;
    }
    if (!done) out.push(`${where} ${label}: ${MAX_CONVERSATION_TURNS} 回で おわらない`);
  }
  return { problems: out, replies };
}

// ---------------------------------------------------------------------------
// 1か月ワークブック（worksheets/generate_worksheets.py が 読む データ）
// ---------------------------------------------------------------------------

/** generate_worksheets.py の 定数（MINI_EVERY など）を とりだす */
export function pyConstants(src: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of src.matchAll(/^([A-Z_]+)\s*=\s*(\d+)\s*$/gm)) out[m[1]] = Number(m[2]);
  return out;
}

/** 1つの パック（20 レッスン）を python と おなじ ルールで みる */
export function worksheetPackProblems(pack: number): { problems: string[]; lessons: number; tests: number; noFirstSound: number; noTestD: number } {
  const out: string[] = [];
  let noFirstSound = 0;
  let noTestD = 0;
  const { start, end } = monthPack(pack);
  const where = `ワークブック No.${pack}（L${start}〜${end}）`;
  const key = worksheetKey(pack);
  if (key !== `worksheets/monthly/month-${String(pack).padStart(2, "0")}.pdf`) out.push(`${where}: ファイル名 ${key}`);
  let lessons = 0;
  let tests = 0;
  const all = LESSONS;
  for (let n = start; n <= Math.min(end, TOTAL_LESSONS); n++) {
    const l = all[n - 1];
    if (!l || l.lessonNo !== n) { out.push(`${where}: L${n} が ない`); continue; }
    lessons++;
    const at = `${where} L${n}`;
    const words = l.vocab;
    const exprs = l.school.expressions;
    // 1. なぞりがき（TPR 2つ ＋ 単語）・4. リスニング（単語 4つ）
    if (words.length < 1) out.push(`${at}: 単語が ない（なぞりがき・リスニング）`);
    for (const x of [...l.tpr.slice(0, 2).map((t) => t.en), ...words.map((v) => v.en)]) if (!x.trim() || JA.test(x)) out.push(`${at}: なぞりがきの「${x}」`);
    // 2. フォニックス「さいしょの 音に ○」（python と おなじ: 英字だけの ことばの w[0].lower()。数・セリフの 回は この 欄なし）
    if (l.phonics.words.length < 1) out.push(`${at}: フォニックスの ことばが ない`);
    const fs = firstSoundWords(l.phonics.words);
    if (fs.length === 0) noFirstSound++;
    for (const w of fs.slice(0, 3)) if (!/^[a-z]$/.test(w[0].toLowerCase())) out.push(`${at}: フォニックスの「${w}」の さいしょの 文字`);
    // 3. 学校テスト（ヒント: さいしょの 文字）
    if (exprs.length < 1) out.push(`${at}: 表現が ない`);
    for (const e of exprs) if (!e.en.trim().split(/\s+/)[0]?.[0] || !e.ja.trim()) out.push(`${at}: 表現「${e.en}」/「${e.ja}」`);
    if (l.school.testPoints.length === 0) out.push(`${at}: テストの ねらいめ（testPoints）が ない`);
    for (const t of l.tpr) if (!t.action.trim() || !t.ja.trim()) out.push(`${at}: TPR あそびの「${t.en}」の action / ja`);
    // テスト（まとめ / ボス）: アプリの ゲートと おなじ 範囲
    const gate = gateTestAfterLesson(n);
    const pyGate = n % CURRICULUM_RULES.bossEvery === 0 ? [1, n] : n % CURRICULUM_RULES.miniTestEvery === 0 ? [n - CURRICULUM_RULES.miniTestEvery + 1, n] : null;
    if (!!gate !== !!pyGate || (gate && pyGate && (gate.rangeStart !== pyGate[0] || gate.rangeEnd !== pyGate[1]))) out.push(`${at}: ワークの テストの 範囲が アプリと ちがう`);
    if (gate) {
      tests++;
      const pool = itemsInRange(gate.rangeStart, gate.rangeEnd);
      if (pool.filter((i) => i.kind === "WORD").length < 3) out.push(`${at}: テストの 単語が 3つ ない`);
      if (pool.filter((i) => i.kind === "WORD" && i.schoolCore).length < 1) out.push(`${at}: テストの スペル（core の 単語）が ない`);
      if (pool.filter((i) => i.kind === "EXPRESSION" && i.schoolCore).length < 1) out.push(`${at}: テストの 表現（core）が ない`);
      // D（さいしょの 文字）に つかえる ことばが ない テストは D を 出さない（python も 見出しごと とばす）
      if (firstSoundWords(pool.filter((i) => i.kind === "PHONICS").map((i) => i.text)).length === 0) noTestD++;
    }
  }
  if (lessons === 0) out.push(`${where}: レッスンが ない`);
  return { problems: out, lessons, tests, noFirstSound, noTestD };
}

/** generate_worksheets.py の first_sound_words と おなじ（英字だけの ことば。数・年号・"セリフ" は のぞく） */
export const firstSoundWords = (words: readonly string[]) => words.filter((w) => /^[A-Za-z][A-Za-z' -]*$/.test(w));

// ---------------------------------------------------------------------------
// としょかん・力だめし
// ---------------------------------------------------------------------------

const FUNCTION_WORDS = new Set(["be", "the", "a", "an", "to", "of", "in", "on", "at", "for", "it", "is", "i", "i'll", "you", "and", "or", "up", "do", "get", "make"]);

/**
 * おはなしの「あたらしい ことば」が 本文に 出てくるか。"forget (forgot)"・"some / any"・"If I find ..., I'll ..." のような 書きかたも あるので、
 * / と ( ) で わけた どれかの 中身の ことば（3文字 以上・機能語 以外）の 語幹（さいごの 2文字を のぞく・4文字 以上）が 本文に あれば OK
 */
export function storyWordInText(entry: string, text: string): boolean {
  const lower = text.toLowerCase();
  const parts = entry.toLowerCase().split(/[/()]|\.\.\.|…/).map((p) => p.trim()).filter(Boolean);
  return parts.some((p) => {
    const words = p.replace(/[^a-z' ]/g, " ").split(/\s+/).filter((x) => x.length >= 3 && !FUNCTION_WORDS.has(x));
    const ws = words.length ? words : p.replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);
    return ws.some((x) => lower.includes(x.length > 5 ? x.slice(0, x.length - 2) : x.length >= 4 ? x.slice(0, 4) : x));
  });
}

export function storyProblems(s: Story): string[] {
  const out = validateStory(s);
  if (s.unlockLesson > TOTAL_LESSONS) out.push(`${s.id}: unlockLesson ${s.unlockLesson} が レッスンの 数より 大きい`);
  const g = gradeStory(s, s.questions.map((q) => q.answer));
  if (!g.passed || g.correct !== s.questions.length) out.push(`${s.id}: 正しい こたえで 合格に ならない`);
  if (gradeStory(s, s.questions.map(() => -1)).passed) out.push(`${s.id}: こたえなしで 合格`);
  const text = [s.title, ...s.lines.map((l) => l.en)].join(" ").toLowerCase();
  for (const w of s.words) {
    if (!w.en.trim() || !w.ja.trim()) out.push(`${s.id}: あたらしい ことばが からっぽ`);
    if (!storyWordInText(w.en, text)) out.push(`${s.id}: あたらしい ことば「${w.en}」が 本文に ない`);
  }
  for (const [i, q] of s.questions.entries()) if (JA.test(q.q) || !JA.test(q.qJa)) out.push(`${s.id}: Q${i + 1} の 英語 / 日本語`);
  return out;
}

export function yearlyProblems(test: YearlyTest): { problems: string[]; items: number } {
  const out = validateYearlyTest(test);
  const at = (m: string) => out.push(`stage ${test.stage}: ${m}`);
  const items = [...test.listening, ...test.reading];
  const right = Object.fromEntries(items.map((i) => [i.id, i.answer]));
  const g = gradeChoices(items, right);
  if (g.percent !== 100) at(`正しい こたえで ${g.percent}%`);
  for (const p of test.speaking.prompts) {
    const s = scoreSpeakingRule(p, p.readText ?? p.sample);
    if (s.score < SPEAKING_MAX - 1) at(`${p.id}: お手本の こたえ「${p.sample}」が ${s.score}/${SPEAKING_MAX}`);
    if (scoreSpeakingRule(p, "").score !== 0) at(`${p.id}: なにも 言わなくても 点が ある`);
  }
  const w = test.writing;
  const ws = scoreWritingRule(w, { writingText: w.sample, writingWords: w.items?.map((x) => x.answer) });
  if (ws.score < writingMax(w) - (w.kind === "words" ? 0 : 1)) at(`writing: お手本が ${ws.score}/${writingMax(w)}`);
  try {
    const answers = sanitizeAnswers(test, { choices: right, speaking: Object.fromEntries(test.speaking.prompts.map((p) => [p.id, p.readText ?? p.sample])), writingText: w.sample, writingWords: w.items?.map((x) => x.answer) });
    const r = buildResult(test, answers, "2026-11-27");
    const nums = JSON.stringify(r).match(/NaN|null(?=[,}])/);
    if (nums && /NaN/.test(nums[0])) at("結果に NaN");
  } catch (e) {
    at(`結果が 作れない: ${e instanceof Error ? e.message : e}`);
  }
  return { problems: out, items: items.length + test.speaking.prompts.length + 1 };
}

// ---------------------------------------------------------------------------
// ぜんぶ
// ---------------------------------------------------------------------------

export const SECTION_TITLES: Record<string, string> = {
  lessons: "レッスンの ながれ（クイズ・スピードリスニング）",
  items: "ぜんぶの 項目 × ぜんぶの 形式",
  phonics: "フォニックス（ステージに あう 問いかた）",
  tests: "テスト（復習・まとめ・ボス・アリーナ・お宝）",
  grading: "採点（正しい こたえで 100点・まちがいで 0点）",
  teacher: "先生の 授業（180〜240 秒・スライド）",
  recap: "まとめ動画の 台本",
  conversation: "かいわの 台本エンジン（AI なし）",
  worksheets: "1か月ワークブック（20 レッスンごと）",
  library: "としょかん（おはなし・チャンツ・フリートーク）",
  yearly: "力だめし（年 1回）",
};

export async function runDataChecks(opts: DataCheckOptions = {}): Promise<Section[]> {
  const seeds = opts.seeds ?? DEFAULT_SEEDS;
  const log = opts.progress ?? (() => {});
  const want = (name: string) => !opts.only?.length || opts.only.includes(name);
  const sections: Section[] = [];
  const section = async (name: string, fn: (s: Section) => void | Promise<void>) => {
    if (!want(name)) return;
    const s: Section = { name, title: SECTION_TITLES[name] ?? name, counts: {}, problems: [], ms: 0 };
    const t0 = Date.now();
    log(`▶ ${s.title}`);
    await fn(s);
    s.ms = Date.now() - t0;
    log(`  ${s.problems.length ? "✗" : "✓"} ${s.title}: ${Object.entries(s.counts).map(([k, v]) => `${k} ${v.toLocaleString("en-US")}`).join("・")}・問題 ${s.problems.length}（${(s.ms / 1000).toFixed(1)}s）`);
    sections.push(s);
  };
  const every = (i: number, n: number, label: string) => {
    if (opts.deadlineAt && Date.now() > opts.deadlineAt) throw new Error(`時間切れ（${label} ${i + 1}/${n}）`);
    if ((i + 1) % 200 === 0 || i + 1 === n) log(`    … ${label} ${i + 1}/${n}`);
  };

  await section("lessons", (s) => {
    let questions = 0;
    let flows = 0;
    LESSONS.forEach((l, i) => {
      for (const seed of [l.lessonNo, ...seeds]) {
        const r = lessonFlowProblems(l, seed);
        s.problems.push(...r.problems);
        questions += r.questions;
        flows++;
      }
      every(i, LESSONS.length, "レッスン");
    });
    if (LESSONS.length !== TOTAL_LESSONS) s.problems.push(`レッスンが ${LESSONS.length}（${TOTAL_LESSONS} の はず）`);
    s.counts = { レッスン: LESSONS.length, ながれ: flows, 問題: questions };
  });

  await section("items", (s) => {
    let questions = 0;
    let items = 0;
    LESSONS.forEach((l, i) => {
      const own = itemsOfLesson(l);
      const near = itemsInRange(Math.max(1, l.lessonNo - 4), l.lessonNo);
      for (const it of own) {
        items++;
        if (!it.text.trim() || !it.ja.trim()) s.problems.push(`${it.id}: text / ja が からっぽ`);
        if (JA.test(it.text)) s.problems.push(`${it.id}: 英語に 日本語「${it.text}」`);
        for (const type of typesFor(it, true)) {
          for (const [poolName, pool] of [["レッスン", own], ["直前5回", near]] as const) {
            for (const seed of seeds.slice(0, 2)) {
              try {
                const q = makeQuestion(it, type, pool, seededRng(seed), 0);
                s.problems.push(...questionProblems(q, `L${l.lessonNo} ${poolName} seed=${seed}`));
                questions++;
              } catch (e) {
                s.problems.push(`${it.id} ${type}: 作れない: ${e instanceof Error ? e.message : e}`);
              }
            }
          }
        }
      }
      every(i, LESSONS.length, "レッスン");
    });
    s.counts = { 項目: items, 問題: questions };
  });

  await section("phonics", (s) => {
    let n = 0;
    for (const l of LESSONS) {
      for (const it of itemsOfLesson(l).filter((x) => x.kind === "PHONICS")) {
        n++;
        s.problems.push(...phonicsStageProblems(it, l.world));
      }
      if (!l.phonics.focus.length) s.problems.push(`L${l.lessonNo}: フォニックスの focus が ない`);
      if (!l.phonics.tipJa.trim()) s.problems.push(`L${l.lessonNo}: フォニックスの tipJa が ない`);
    }
    s.counts = { ことば: n };
  });

  const roundTrip: { a: AssessmentDef; seed: number; arenaMode?: ArenaMode; qs: Question[] }[] = [];
  await section("tests", (s) => {
    const byKind: Record<string, number> = {};
    let questions = 0;
    let variants = 0;
    const treasures = LESSONS.map((l) => treasureAssessment(l.lessonNo));
    const all = [...ASSESSMENTS, ...treasures];
    all.forEach((a, i) => {
      byKind[a.kind] = (byKind[a.kind] ?? 0) + 1;
      const vs: TestVariant[] = [];
      for (const seed of seeds) {
        if (a.kind === "ARENA") {
          for (const mode of [undefined, "MIXED", "LISTENING", "SPEAKING", "WRITING"] as const) vs.push({ a, seed, arenaMode: mode });
          vs.push({ a, seed, arenaMode: "MIXED", memories: true });
        } else if (a.kind === "TREASURE") {
          vs.push({ a, seed });
          const ids = shuffle(itemsOfLesson(LESSONS[a.rangeStart - 1]).map((x) => x.id), seededRng(seed)).slice(0, a.questionCount);
          vs.push({ a, seed, fixedItemIds: ids });
        } else vs.push({ a, seed });
      }
      for (const v of vs) {
        const r = testProblems(v);
        s.problems.push(...r.problems);
        questions += r.questions.length;
        variants++;
        if (v.seed === seeds[0] && !v.memories && !v.fixedItemIds) roundTrip.push({ a, seed: v.seed, arenaMode: v.arenaMode, qs: r.questions });
      }
      every(i, all.length, "テスト");
    });
    s.counts = { テスト: all.length, ...Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v])), "テスト×seed×モード": variants, 問題: questions };
  });

  await section("grading", (s) => {
    if (!roundTrip.length) {
      for (const a of [...ASSESSMENTS, ...LESSONS.map((l) => treasureAssessment(l.lessonNo))]) {
        const modes = a.kind === "ARENA" ? [undefined, "MIXED", "LISTENING", "SPEAKING", "WRITING"] as const : [undefined];
        for (const arenaMode of modes) roundTrip.push({ a, seed: seeds[0], arenaMode, qs: buildTestQuestions(a, { seed: seeds[0], arenaMode }) });
      }
    }
    let spell = 0;
    roundTrip.forEach((r, i) => {
      s.problems.push(...gradingRoundTripProblems(r.a, r.seed, r.qs, r.arenaMode));
      spell += r.qs.filter((q) => q.type === "spell").length;
      every(i, roundTrip.length, "採点");
    });
    s.counts = { テスト: roundTrip.length, スペル問題: spell };
  });

  await section("teacher", (s) => {
    let script = 0;
    let min = Infinity;
    let max = 0;
    for (const l of LESSONS) {
      const r = teacherProblems(l);
      s.problems.push(...r.problems);
      if (r.source === "script") script++;
      min = Math.min(min, r.ms);
      max = Math.max(max, r.ms);
    }
    s.counts = { レッスン: LESSONS.length, 台本あり: script, "最短(秒)": Math.round(min / 1000), "最長(秒)": Math.round(max / 1000) };
  });

  await section("recap", (s) => {
    let min = Infinity;
    let max = 0;
    for (const l of LESSONS) {
      const r = recapProblems(l);
      s.problems.push(...r.problems);
      min = Math.min(min, r.ms);
      max = Math.max(max, r.ms);
    }
    s.counts = { レッスン: LESSONS.length, "最短(秒)": Math.round(min / 1000), "最長(秒)": Math.round(max / 1000) };
  });

  await section("conversation", async (s) => {
    let replies = 0;
    let lessons = 0;
    for (const l of LESSONS) {
      if (!l.conversation) { s.problems.push(`L${l.lessonNo}: かいわの データが ない`); continue; }
      lessons++;
      const r = conversationProblems(l.conversation, `L${l.lessonNo} かいわ`, l.lessonNo);
      s.problems.push(...r.problems);
      replies += r.replies;
    }
    const g = conversationProblems(GENERIC_CONVERSATION, "GENERIC かいわ", 1);
    s.problems.push(...g.problems);
    replies += g.replies;
    const talks = await loadTalkThemes();
    for (const t of talks) {
      const r = conversationProblems(themeConversation(t), `${t.id} フリートーク`, 1);
      s.problems.push(...r.problems);
      replies += r.replies;
    }
    s.counts = { レッスン: lessons, フリートーク: talks.length, 返事: replies };
  });

  await section("worksheets", (s) => {
    const packs = monthPackCount(TOTAL_LESSONS);
    let lessons = 0;
    let tests = 0;
    let noFirstSound = 0;
    let noTestD = 0;
    for (let p = 1; p <= packs; p++) {
      const r = worksheetPackProblems(p);
      s.problems.push(...r.problems);
      lessons += r.lessons;
      tests += r.tests;
      noFirstSound += r.noFirstSound;
      noTestD += r.noTestD;
    }
    if (lessons !== TOTAL_LESSONS) s.problems.push(`ワークブックの レッスンが ${lessons}（${TOTAL_LESSONS} の はず）`);
    if (opts.worksheetPy) {
      const c = pyConstants(opts.worksheetPy);
      const expect: Record<string, number> = {
        MINI_EVERY: CURRICULUM_RULES.miniTestEvery, BOSS_EVERY: CURRICULUM_RULES.bossEvery, MINI_QUESTIONS: CURRICULUM_RULES.miniQuestions,
        BOSS_QUESTIONS: CURRICULUM_RULES.bossQuestions, LESSONS_PER_PACK: LESSONS_PER_MONTH_PACK,
      };
      for (const [k, v] of Object.entries(expect)) if (c[k] !== v) s.problems.push(`generate_worksheets.py の ${k} = ${c[k]}（アプリは ${v}）`);
    }
    s.counts = { パック: packs, レッスン: lessons, テスト: tests, "さいしょの音の 欄なし(数・セリフの 回)": noFirstSound, "テストD なし": noTestD };
  });

  await section("library", async (s) => {
    const stories: Story[] = [];
    for (const st of STORY_STAGES) stories.push(...(await loadStoryStage(st)));
    const chants: Chant[] = await loadChants();
    const talks: TalkTheme[] = await loadTalkThemes();
    for (const x of stories) s.problems.push(...storyProblems(x));
    for (const c of chants) {
      s.problems.push(...validateChant(c));
      if (c.unlockLesson > TOTAL_LESSONS) s.problems.push(`${c.id}: unlockLesson ${c.unlockLesson}`);
    }
    for (const t of talks) {
      s.problems.push(...validateTalkTheme(t));
      if (t.unlockLesson > TOTAL_LESSONS) s.problems.push(`${t.id}: unlockLesson ${t.unlockLesson}`);
    }
    const ids = [...stories, ...chants, ...talks].map((x) => x.id);
    for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) s.problems.push(`${id}: id が かさなる`);
    const idx = buildLibraryIndex(stories, chants, talks);
    if (JSON.stringify({ ...idx, note: undefined }) !== JSON.stringify({ ...LIBRARY_INDEX, note: undefined })) s.problems.push("content/library/index.json が 古い（npm run library:index）");
    for (const m of LIBRARY_INDEX.stories) if (!(await loadStory(m.id))) s.problems.push(`${m.id}: 索引に あるのに 本文が 読めない`);
    s.counts = { おはなし: stories.length, しつもん: stories.reduce((n, x) => n + x.questions.length, 0), チャンツ: chants.length, フリートーク: talks.length };
  });

  await section("yearly", async (s) => {
    let items = 0;
    for (const st of YEARLY_STAGES) {
      const t = await loadYearlyTest(st);
      if (!t) { s.problems.push(`stage ${st}: 力だめしが 読めない`); continue; }
      const r = yearlyProblems(t);
      s.problems.push(...r.problems);
      items += r.items;
    }
    s.counts = { ステージ: YEARLY_STAGES.length, 問題: items };
  });

  return sections;
}

/** 表（レポート・画面）用の 1行まとめ */
export function summarize(sections: readonly Section[]): string {
  const bad = sections.reduce((n, s) => n + s.problems.length, 0);
  const pick = (name: string, key: string) => sections.find((s) => s.name === name)?.counts[key];
  const parts = [
    pick("lessons", "レッスン") !== undefined ? `レッスン ${pick("lessons", "レッスン")!.toLocaleString("en-US")}` : null,
    pick("tests", "テスト") !== undefined ? `テスト ${pick("tests", "テスト")!.toLocaleString("en-US")}` : null,
    `問題 ${sections.reduce((n, s) => n + (s.counts["問題"] ?? 0), 0).toLocaleString("en-US")}`,
    pick("library", "おはなし") !== undefined ? `おはなし ${pick("library", "おはなし")}` : null,
    pick("yearly", "ステージ") !== undefined ? `力だめし ${pick("yearly", "ステージ")}` : null,
  ].filter(Boolean);
  return `${parts.join("・")}・問題の ある データ ${bad}`;
}

export function reportMarkdown(sections: readonly Section[], seeds: readonly number[], totalMs: number, maxPerSection = 40): string {
  const lines = [
    "# データの 確認（run10 Phase 2）",
    "",
    `- 実行: \`npm run check:data\`（scripts/data-check.ts → scripts/lib/dataCheck.ts）・seed ${seeds.join(", ")}・${(totalMs / 1000).toFixed(1)} 秒`,
    `- まとめ: ${summarize(sections)}`,
    "",
    "| しらべた もの | 数 | 問題 | 時間 |",
    "|---|---|---|---|",
    ...sections.map((s) => `| ${s.title} | ${Object.entries(s.counts).map(([k, v]) => `${k} ${v.toLocaleString("en-US")}`).join("・")} | ${s.problems.length} | ${(s.ms / 1000).toFixed(1)}s |`),
    "",
  ];
  for (const s of sections.filter((x) => x.problems.length)) {
    lines.push(`## ${s.title}（${s.problems.length}）`, "");
    for (const p of s.problems.slice(0, maxPerSection)) lines.push(`- ${p}`);
    if (s.problems.length > maxPerSection) lines.push(`- …ほか ${s.problems.length - maxPerSection}`);
    lines.push("");
  }
  return lines.join("\n");
}
