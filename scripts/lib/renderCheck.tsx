/**
 * run10 Phase 3: 画面の 描画の 確認（npm run check:render）。
 *
 * 1,200 レッスンの ステップの 画面（先生の 授業・カード・TPR・フォニックス・学校の 表現・発音・クイズ・スピードリスニング・かいわ・クリア）、
 * きょうの まとめ、テスト（復習・まとめ・ボス・アリーナ × モード・お宝）、としょかん（おはなし・チャンツ・フリートーク）、力だめし を
 * react-dom/server で ほんとうに 描いて、
 *   - 描画中の エラー（throw）
 *   - React の 警告（key が ない など）・おなじ key の リスト（renderHooks.ts）
 *   - 出る はずの 文字が 出ない（英文・訳・選択肢・字幕 …）
 *   - 「undefined」「NaN」「[object Object]」・文字も 名前も ない ボタン
 * を さがす。とちゅうの 画面（2まいめの カード・3問め・答えた あと・結果）は コンポーネントの initial（はじめの 状態）で 描く。
 *
 * ここの 関数は DB も ブラウザも つかわない（Node では 全ワールド・全フォニックスが 読みこまれて いる）。
 */
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { collectWarnings } from "./renderHooks";
import { ASSESSMENTS, LESSONS, TOTAL_LESSONS, getAssessment, getLesson } from "../../src/lib/curriculum";
import { buildTestQuestions, hashSeed, toPublic, type LessonStep, type Question } from "../../src/lib/curriculum/questions";
import { focusExampleWord, focusLabel } from "../../src/lib/curriculum/phonicsButtons";
import { CURRICULUM_RULES } from "../../src/lib/domain/config";
import type { ArenaMode } from "../../src/lib/domain/arena";
import type { AssessmentDef, LearningItemDef, LessonConversation, LessonDef } from "../../src/lib/domain/types";
import { offlineLesson, offlineLessonComplete } from "../../src/lib/offline";
import { offlineTestSubmit } from "../../src/lib/offline/tests";
import { buildTeacherTimeline, KIND_LABEL_JA, pausePrompt } from "../../src/lib/teacher/timeline";
import { buildRecapScript } from "../../src/lib/recap/script";
import { CHARACTER_NAME, buildSuggestions, concreteTarget, scriptedReply, starterLine, type ConversationCharacter, type ConversationTurn } from "../../src/lib/conversation/engine";
import { scorePronunciation } from "../../src/lib/speech/pronunciation";
import { LessonCompleteResponseSchema, RecapWatchedResponseSchema, type TestSubmitResponse } from "../../src/lib/api/contracts";
import { STORY_STAGES, loadChants, loadStoryStage, loadTalkThemes } from "../../src/lib/library/catalog";
import { gradeStory } from "../../src/lib/library/rules";
import { themeConversation, FREE_TALK_TURNS } from "../../src/lib/library/talk";
import { emptyLibrary } from "../../src/lib/library/localLibrary";
import type { LibraryState } from "../../src/lib/library/client";
import type { Chant, Story, TalkTheme } from "../../src/lib/library/types";
import { loadYearlyTest } from "../../src/lib/yearly/catalog";
import { YEARLY_STAGES } from "../../src/lib/yearly/spec";
import { buildResult, growthBetween, sanitizeAnswers } from "../../src/lib/yearly/scoring";
import type { YearlyState } from "../../src/lib/yearly/client";
import type { YearlyAnswers, YearlyTest } from "../../src/lib/yearly/types";

import { LessonPlayer, STEP_LABEL, type LoadedLesson } from "../../src/components/lesson/LessonPlayer";
import { Flashcards, Phonics, Pronunciation, QuizRun, SchoolExpressions, SpeedListening, TeacherVideo, TprDrill } from "../../src/components/lesson/LessonSteps";
import { ConversationStep, type Bubble, type ConversationInitial, type ConversationVariant } from "../../src/components/lesson/ConversationStep";
import { TeacherVideoPlayer, VirtualClassroom } from "../../src/components/teacher/VirtualClassroom";
import { RecapPlayer } from "../../src/components/recap/RecapPlayer";
import { QuestionView, SpeakButton } from "../../src/components/test/QuestionView";
import { TestRunner, type Session } from "../../src/components/test/TestRunner";
import { StoryView } from "../../src/components/library/StoryView";
import { ChantView } from "../../src/components/library/ChantView";
import { TalkView } from "../../src/components/library/TalkView";
import { ReadAlongText, type ReadAloud } from "../../src/components/library/ReadAlong";
import { YearlyView } from "../../src/components/yearly/YearlyView";

// ---------------------------------------------------------------------------
// 1回の 描画
// ---------------------------------------------------------------------------

export interface RenderCase {
  /** どこの 画面か（問題の 先頭に 出す） */
  where: string;
  el: ReactElement;
  /** 画面に 出る はずの 文字（空白は くらべない） */
  expect?: readonly (string | undefined | null | false)[];
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m);

/** HTML → 見える 文字（タグを けす。<span>c</span><span>a</span> が "ca" に なるよう 空白は 入れない） */
export function htmlText(html: string): string {
  return decode(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "").replace(/<[^>]*>/g, ""));
}
const squash = (s: string) => s.replace(/[\s 　]+/g, "");

const BAD_TEXT = /\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b/;
const BAD_ATTR = /="[^"]*(?:\bundefined\b|\bNaN\b|\[object Object\])[^"]*"/;

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** <p> の 中に 入れられない もの（ブラウザが <p> を とじて しまい、ハイドレーションの エラーに なる） */
const NOT_IN_P = new Set(["address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "main", "menu", "nav", "ol", "p", "pre", "section", "table", "ul"]);
const INTERACTIVE = new Set(["a", "button", "input", "select", "textarea", "details", "label"]);

/** HTML の 入れ子の きまり（React が ブラウザで「cannot be a descendant of」と 警告する もの）を しらべる */
export function nestingProblems(html: string): string[] {
  const out = new Set<string>();
  const stack: string[] = [];
  for (const m of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g)) {
    const [, close, rawTag, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      const i = stack.lastIndexOf(tag);
      if (i >= 0) stack.length = i;
      continue;
    }
    if (stack.includes("svg") && tag !== "svg") { if (!selfClose) stack.push(tag); continue; }
    const parent = stack[stack.length - 1];
    if (NOT_IN_P.has(tag) && stack.includes("p")) out.add(`<${tag}> が <p> の 中に ある`);
    if (INTERACTIVE.has(tag)) {
      const outer = [...stack].reverse().find((t) => t === "a" || t === "button");
      if (outer && !(tag === "label" && outer === "a")) out.add(`<${tag}> が <${outer}> の 中に ある`);
    }
    if (tag === "li" && parent !== "ul" && parent !== "ol" && parent !== "menu") out.add(`<li> の 親が <${parent ?? "なし"}>`);
    if (tag === "form" && stack.includes("form")) out.add("<form> が <form> の 中に ある");
    if (!selfClose && !VOID.has(tag)) stack.push(tag);
  }
  return [...out];
}

/** 1つの 画面を 描いて 問題を かえす */
export function renderCase(c: RenderCase): string[] {
  const out: string[] = [];
  const r = collectWarnings(() => renderToStaticMarkup(c.el));
  if (r.error !== undefined) {
    const e = r.error;
    out.push(`${c.where}: 描画で エラー: ${e instanceof Error ? `${e.message}${e.stack ? ` @ ${e.stack.split("\n").slice(1, 3).map((l) => l.trim()).join(" ← ")}` : ""}` : String(e)}`);
  }
  for (const w of new Set(r.warnings)) out.push(`${c.where}: 警告: ${w.slice(0, 300)}`);
  const html = r.value ?? "";
  if (r.error === undefined) {
    const text = htmlText(html);
    const flat = squash(text);
    const bad = text.match(BAD_TEXT);
    if (bad) out.push(`${c.where}: 画面に「${bad[0]}」: …${text.slice(Math.max(0, (bad.index ?? 0) - 40), (bad.index ?? 0) + 40)}…`);
    const badAttr = html.match(BAD_ATTR);
    if (badAttr) out.push(`${c.where}: 属性に ${badAttr[0].slice(0, 120)}`);
    for (const p of nestingProblems(html)) out.push(`${c.where}: HTML の 入れ子: ${p}`);
    for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      if (!squash(htmlText(m[2])) && !/\baria-label="[^"]+"|\btitle="[^"]+"/.test(m[1])) out.push(`${c.where}: 文字も 名前も ない ボタン <button${m[1].slice(0, 80)}>`);
    }
    for (const want of c.expect ?? []) {
      if (!want || !squash(want)) continue;
      if (!flat.includes(squash(want))) out.push(`${c.where}: 「${want.slice(0, 80)}」が 画面に ない`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 共通
// ---------------------------------------------------------------------------

const noop = () => {};
const qExpect = (q: Question) => [q.promptJa, q.display, ...(q.choices ?? []).map((c) => c.label)];

/** ReadAlongText に わたす 読みあげの 状態（音は ださない） */
const readerAt = (lineIdx: number, wordIdx: number, playing = lineIdx >= 0, yourTurn = false): ReadAloud =>
  ({ lineIdx, wordIdx, playing, yourTurn, play: async () => false, stop: noop, sayWord: noop });

/** かいわを 台本エンジンで すすめて、1ターンごとの 画面の 状態を つくる（子どもは 目標の 表現を 言う） */
function conversationStates(conv: LessonConversation, character: ConversationCharacter, maxTurns: number): { initial: ConversationInitial; expect: string[] }[] {
  const starter = starterLine(conv, character);
  const bubbles: Bubble[] = [{ role: "ai", text: starter }];
  const first = buildSuggestions(conv, []);
  const states: { initial: ConversationInitial; expect: string[] }[] = [
    { initial: { started: true, bubbles: [...bubbles], suggestions: first }, expect: [starter, ...first] },
  ];
  let stars = 0;
  const targets = conv.aiTask.targetExpressions;
  for (let k = 0; k < maxTurns; k++) {
    const say = targets.length ? concreteTarget(targets[k % targets.length], conv) : "Hello!";
    const history: ConversationTurn[] = bubbles.map(({ role, text }) => ({ role, text }));
    const r = scriptedReply({ conversation: conv, history, childText: say, maxTurns });
    bubbles.push({ role: "child", text: say }, { role: "ai", text: r.replyEn, ja: r.replyJa });
    if (r.usedTarget) stars++;
    const done = r.done || k + 1 >= maxTurns;
    states.push({ initial: { started: true, bubbles: [...bubbles], suggestions: r.suggestions, stars, done }, expect: [say, r.replyEn, r.replyJa, ...(done ? [] : r.suggestions)] });
    if (done) break;
  }
  return states;
}

function conversationCases(where: string, conv: LessonConversation, character: ConversationCharacter, maxTurns: number, items: LearningItemDef[], lessonNo: number, variant?: ConversationVariant): RenderCase[] {
  const base = { lessonNo, conversation: conv, character, maxTurns, items, onDone: noop, variant };
  const name = CHARACTER_NAME[character];
  const cases: RenderCase[] = [
    { where: `${where} はじめる まえ`, el: <ConversationStep {...base} />, expect: [name, conv.sceneJa, conv.aiTask.goalJa, variant?.skipLabel ?? "きょうは とばす"] },
    { where: `${where} はじめる まえ（マイク あり）`, el: <ConversationStep {...base} initial={{ micOk: true }} />, expect: ["🎤 で えいごを はなしてね"] },
  ];
  const states = conversationStates(conv, character, maxTurns);
  states.forEach((s, i) => cases.push({ where: `${where} ${i}ターン`, el: <ConversationStep {...base} initial={s.initial} />, expect: [...s.expect, s.initial.done ? (variant?.doneLabel ?? "レッスン クリア！") : "おくる"] }));
  const mid = states[Math.min(1, states.length - 1)].initial;
  cases.push(
    { where: `${where} きいてる`, el: <ConversationStep {...base} initial={{ ...mid, done: false, micOk: true, listening: true }} />, expect: ["きいてるよ"] },
    { where: `${where} きこえない`, el: <ConversationStep {...base} initial={{ ...mid, done: false, micOk: true, heardNothing: true }} />, expect: ["うまく きこえなかったよ"] },
    { where: `${where} かんがえちゅう`, el: <ConversationStep {...base} initial={{ ...mid, done: false, busy: true }} />, expect: [`${name}が かんがえちゅう`] },
  );
  return cases;
}

// ---------------------------------------------------------------------------
// レッスン（ステップ・先生・まとめ・かいわ・クリア）
// ---------------------------------------------------------------------------

export interface LessonCases { lesson: RenderCase[]; teacher: RenderCase[]; recap: RenderCase[]; conversation: RenderCase[] }

export function lessonCases(lessonNo: number): LessonCases {
  const data = offlineLesson(lessonNo) as LoadedLesson;
  const lesson = data.lesson;
  const L = `L${lessonNo}`;
  const steps = data.steps as LessonStep[];
  const items = data.items;
  const byIds = (ids: readonly string[]) => ids.flatMap((id) => items.filter((i) => i.id === id));
  const out: LessonCases = { lesson: [], teacher: [], recap: [], conversation: [] };
  const push = out.lesson.push.bind(out.lesson);

  // プレイヤーの わく（ステップごと・はじめの 状態）
  steps.forEach((s, i) => push({
    where: `${L} プレイヤー ${i + 1}.${s.kind}`,
    el: <LessonPlayer data={data} offline={i % 2 === 1} initial={{ step: i }} />,
    expect: [`Lesson ${lessonNo}`, lesson.title, lesson.titleJa, lesson.school.topic, ...steps.map((x) => STEP_LABEL[x.kind]), s.kind === "teacher_video" ? "せんせいを よんでいるよ" : null],
  }));
  push({ where: `${L} プレイヤー おわり`, el: <LessonPlayer data={data} offline={false} initial={{ step: steps.length }} />, expect: ["きろくしています"] });
  // クリアの 画面（オフライン・つうしん できない とき の 2 とおり）
  const ok = LessonCompleteResponseSchema.parse(offlineLessonComplete(lessonNo, { conversationFinished: true }));
  const gate = ok.nextTest && /^(mini|boss)-/.test(ok.nextTest) ? ok.nextTest : "";
  push({
    where: `${L} クリア`, el: <LessonPlayer data={data} offline initial={{ result: ok }} />,
    expect: [`Lesson ${lessonNo} クリア！`, `+${ok.reward.total}`, ...(ok.reward.coins.length > 1 ? ok.reward.coins.map((c) => `${c.labelJa} +${c.amount}`) : []), "きょうのまとめを見る", gate ? (gate.startsWith("boss-") ? "ボスに いどむ" : "まとめテストへ") : lessonNo < TOTAL_LESSONS ? "つぎのレッスンへ" : "ぜんぶクリア", "今回のきろくとコインは保存されないよ"],
  });
  push({ where: `${L} クリア できない`, el: <LessonPlayer data={data} offline={false} initial={{ result: { ...ok, ok: false, reasonJa: "きょうは ここまでに しよう。" } }} />, expect: ["きょうは ここまでに しよう。", "クイズをもう一回"] });

  for (const [si, s] of steps.entries()) {
    const at = `${L} ${si + 1}.${s.kind}`;
    if (s.kind === "teacher_video") {
      push({ where: at, el: <TeacherVideo lesson={lesson} videoUrl={s.videoUrl} teacherName={data.teacher.nameJa} onDone={noop} />, expect: [s.videoUrl ? null : "せんせいを よんでいるよ"] });
      out.teacher.push(...teacherCases(L, data, steps.find((x) => x.kind === "conversation")?.character, s.videoUrl));
    } else if (s.kind === "flashcards") {
      const its = byIds(s.itemIds);
      its.forEach((it, i) => {
        push({ where: `${at} ${i + 1}まいめ`, el: <Flashcards items={its} onDone={noop} initial={{ index: i }} />, expect: [`（${i + 1}/${its.length}）`, it.emoji ?? "❓"] });
        push({ where: `${at} ${i + 1}まいめ（うら）`, el: <Flashcards items={its} onDone={noop} initial={{ index: i, flipped: true }} />, expect: [it.text, it.ja] });
      });
    } else if (s.kind === "tpr") {
      const its = byIds(s.itemIds);
      const actions = Object.fromEntries(lesson.tpr.map((t) => [t.en, t.action]));
      const order = [...its, ...its].slice(0, Math.max(4, its.length * 2));
      order.forEach((it, r) => push({ where: `${at} ${r + 1}かいめ`, el: <TprDrill items={its} actions={actions} onDone={noop} initial={{ round: r }} />, expect: [it.emoji, it.text, it.ja, actions[it.text]] }));
      push({ where: `${at} おわり`, el: <TprDrill items={its} actions={actions} onDone={noop} initial={{ round: order.length }} />, expect: ["からだで おぼえたね！"] });
    } else if (s.kind === "phonics") {
      const exp = [s.tipJa, ...s.focus.map((f) => focusLabel(f).main), ...s.focus.map((f, i) => s.examples?.[i] || focusExampleWord(f, s.words)), ...s.words];
      push({ where: at, el: <Phonics focus={s.focus} words={s.words} tipJa={s.tipJa} examples={s.examples} spoken={s.spoken} onDone={noop} />, expect: exp });
      s.words.forEach((w, i) => push({ where: `${at} 「${w}」を ひからせる`, el: <Phonics focus={s.focus} words={s.words} tipJa={s.tipJa} examples={s.examples} spoken={s.spoken} onDone={noop} initial={{ lit: { word: w, n: Math.max(1, Math.ceil(w.length / 2)) } }} />, expect: i === 0 ? exp : [w] }));
    } else if (s.kind === "school_expressions") {
      const its = byIds(s.itemIds);
      const core = its.filter((i) => i.schoolCore);
      const base = [...s.testPoints, ...its.flatMap((i) => [i.text, i.ja])];
      core.forEach((t, k) => {
        push({ where: `${at} ${k + 1}こめ`, el: <SchoolExpressions items={its} testPoints={s.testPoints} onDone={noop} initial={{ index: k }} />, expect: [...(k === 0 ? base : []), `かいてみよう：「${t.ja}」`] });
        for (const [verdict, label] of [["PASS", "⭕ ごうかく"], ["RETRY", "🟡 さいちょうせん"], ["FAIL", "❌ ざんねん"]] as const) {
          push({ where: `${at} ${k + 1}こめ ${verdict}`, el: <SchoolExpressions items={its} testPoints={s.testPoints} onDone={noop} initial={{ index: k, text: t.text, res: { verdict, feedbackJa: "テストの ことば" } }} />, expect: [`${label}：テストの ことば`, "つぎ"] });
        }
      });
      push({ where: `${at} おわり`, el: <SchoolExpressions items={its} testPoints={s.testPoints} onDone={noop} initial={{ index: core.length }} />, expect: base });
    } else if (s.kind === "pronunciation") {
      const its = byIds(s.itemIds);
      its.forEach((it, i) => {
        push({ where: `${at} ${i + 1}こめ`, el: <Pronunciation items={its} onDone={noop} initial={{ index: i }} />, expect: [it.emoji, it.text, "🔊 おてほん", "🎤 いってみる"] });
        const good = scorePronunciation(it.text, it.text, 0.9);
        const half = scorePronunciation(it.text, it.text.split(/\s+/).filter((_, j) => j % 2 === 0).join(" "), 0.5);
        for (const [label, last] of [["まね できた", good], ["半分", half]] as const) {
          push({ where: `${at} ${i + 1}こめ ${label}`, el: <SpeakButton target={it.text} itemId={it.id} onDone={noop} initial={{ last }} />, expect: [...last.wordResults.map((w) => w.word), `“${last.transcript || "…"}”`] });
        }
      });
      push({ where: `${at} おわり`, el: <Pronunciation items={its} onDone={noop} initial={{ index: its.length }} />, expect: ["つぎへ"] });
      push({ where: `${at} マイク なし`, el: <SpeakButton target={its[0]?.text ?? "Hello"} itemId="x" onDone={noop} initial={{ state: "unsupported" }} />, expect: ["マイク判定に対応していません"] });
    } else if (s.kind === "quiz") {
      s.questions.forEach((q, i) => {
        const e = qExpect(q);
        push({ where: `${at} ${i + 1}もんめ ${q.type}`, el: <QuizRun title="✅ かくにんクイズ" questions={s.questions} onDone={noop} initial={{ index: i }} />, expect: ["かくにんクイズ", ...e] });
        push({ where: `${at} ${i + 1}もんめ せいかい`, el: <QuizRun questions={s.questions} onDone={noop} initial={{ index: i, flash: { ok: true, explain: q.explanationJa } }} />, expect: ["⭕ せいかい！"] });
        push({ where: `${at} ${i + 1}もんめ まちがい`, el: <QuizRun questions={s.questions} onDone={noop} initial={{ index: i, flash: { ok: false, explain: q.explanationJa } }} />, expect: [`❌ ${q.explanationJa}`] });
      });
    } else if (s.kind === "speed_listening") {
      s.rounds.forEach((round, r) => round.questions.forEach((q, i) => push({
        where: `${at} ×${round.rate} ${i + 1}もんめ`,
        el: <SpeedListening rounds={s.rounds} onDone={noop} initial={{ round: r, quiz: { index: i } }} />,
        expect: [`スピードリスニング ラウンド${r + 1}：${round.rate}ばいそく`, `⚡ ${round.rate}ばいそく`, ...qExpect(q)],
      })));
    } else if (s.kind === "conversation") {
      out.conversation.push(...conversationCases(`${L} かいわ`, lesson.conversation!, s.character, s.maxTurns, items, lessonNo));
    }
  }
  out.recap.push(...recapCases(L, getLesson(lessonNo)!));
  return out;
}

function teacherCases(L: string, data: LoadedLesson, partner: string | undefined, videoUrl: string | undefined): RenderCase[] {
  const lesson = data.lesson;
  const tl = buildTeacherTimeline(lesson, { partner });
  const name = data.teacher.nameJa;
  const base = { lesson, partner, teacherName: name, onDone: noop };
  const n = tl.segments.length;
  const out: RenderCase[] = [
    { where: `${L} 先生 はじめる まえ`, el: <VirtualClassroom {...base} />, expect: [name, "じゅぎょうを はじめる", `${n} パート`] },
    { where: `${L} 先生 おわり`, el: <VirtualClassroom {...base} initial={{ phase: "done", index: n - 1, segElapsed: 1000 }} />, expect: ["よく できました！", "つぎへ ▶ れんしゅう しよう"] },
  ];
  for (const s of tl.segments) {
    const at = `${L} 先生 #${s.index + 1} ${s.kind}`;
    const exp = [s.slide.title, ...s.slide.items, s.subtitleEn, s.subtitleJa, `${s.index + 1} / ${n}`, KIND_LABEL_JA[s.kind]];
    out.push({ where: `${at} 話す`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: s.index, unit: 0 }} />, expect: exp });
    if (s.units.length > 1) out.push({ where: `${at} 話す（さいごの 文）`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: s.index, unit: s.units.length - 1 }} />, expect: [s.subtitleEn, s.subtitleJa] });
    if (s.pauseMs > 0) out.push({ where: `${at} まつ`, el: <VirtualClassroom {...base} initial={{ phase: "pausing", index: s.index, pauseLeft: s.pauseMs / 2, pauseTotal: s.pauseMs }} />, expect: [pausePrompt(s.kind), String(Math.ceil(s.pauseMs / 2 / 1000))] });
    out.push({ where: `${at} きりかえ`, el: <VirtualClassroom {...base} initial={{ phase: "gap", index: s.index }} />, expect: [s.slide.title] });
  }
  const s0 = tl.segments[0];
  out.push(
    { where: `${L} 先生 字幕 にほんご`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: 0, sub: "ja" }} />, expect: [s0.subtitleJa, "にほんご"] },
    { where: `${L} 先生 字幕 えいご`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: 0, sub: "en" }} />, expect: [s0.subtitleEn, "えいご"] },
    { where: `${L} 先生 字幕 なし`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: 0, sub: "off" }} />, expect: ["じまく なし"] },
    { where: `${L} 先生 ていし・ゆっくり・おと なし`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: 0, paused: true, rate: 0.8, muted: true }} />, expect: ["さいかい", "ゆっくり", "おと なし"] },
    { where: `${L} 先生 声が ない`, el: <VirtualClassroom {...base} initial={{ phase: "speaking", index: 0, silentMode: true }} />, expect: ["こえが でない ときは じまくで すすむよ"] },
  );
  if (videoUrl) out.push({ where: `${L} 先生の 動画`, el: <TeacherVideoPlayer videoUrl={videoUrl} teacherName={name} onDone={noop} />, expect: [name] });
  return out;
}

function recapCases(L: string, lesson: LessonDef): RenderCase[] {
  const script = buildRecapScript(lesson);
  const head = [`Lesson ${lesson.lessonNo}`, script.title, script.titleJa, ...script.chapters.map((c) => c.labelJa)];
  const out: RenderCase[] = [];
  script.segments.forEach((s, i) => {
    const exp = [...(i === 0 ? head : []), s.sayJa, s.en, s.en && s.ja && s.ja !== s.sayJa ? s.ja : null, s.speaker, ...(s.letters ?? []).map((l) => focusLabel(l).main)];
    out.push({ where: `${L} まとめ ${s.id}`, el: <RecapPlayer script={script} initial={{ index: i, playing: true }} />, expect: [...exp, "とめる"] });
    if (s.repeat) out.push({ where: `${L} まとめ ${s.id} いってみよう`, el: <RecapPlayer script={script} initial={{ index: i, phase: "repeat", playing: true }} />, expect: ["🎤 いってみよう！"] });
  });
  const reward = RecapWatchedResponseSchema.parse({ success: true, coinsAwarded: 5, messageJa: "まとめを みたので コイン ゲット！" });
  out.push(
    { where: `${L} まとめ さいご（コイン）`, el: <RecapPlayer script={script} initial={{ index: script.segments.length - 1, finished: true, reward }} />, expect: ["さいごまで みたね！", "+5", reward.messageJa, "もういちど みる"] },
    { where: `${L} まとめ さいご（きろくちゅう）`, el: <RecapPlayer script={script} initial={{ index: script.segments.length - 1, finished: true }} />, expect: ["きろくしています"] },
    { where: `${L} まとめ とめた・おと なし`, el: <RecapPlayer script={script} offline initial={{ index: 1, muted: true }} />, expect: ["さいせい", "いまは きろくに つながらないけど"] },
    { where: `${L} まとめ 声が でない`, el: <RecapPlayer script={script} initial={{ index: 0, soundSupported: false }} />, expect: ["もじだけで すすむよ"] },
  );
  return out;
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

export interface TestUnit { id: string; arenaMode?: ArenaMode }

export const ARENA_MODES: readonly (ArenaMode | undefined)[] = [undefined, "MIXED", "LISTENING", "SPEAKING", "WRITING"];

/** テスト ぜんぶ（復習・まとめ・ボス・アリーナ × モード 5・お宝 1,200） */
export function testUnits(): TestUnit[] {
  const out: TestUnit[] = [];
  for (const a of ASSESSMENTS) {
    if (a.kind === "ARENA") for (const m of ARENA_MODES) out.push({ id: a.id, arenaMode: m });
    else out.push({ id: a.id });
  }
  for (let n = 1; n <= TOTAL_LESSONS; n++) out.push({ id: `treasure-${n}` });
  return out;
}

const TEST_TITLES: Record<string, string> = { DAILY_CHECK: "復習クエスト", MINI: "まとめテスト", BOSS: "ボス戦", ARENA: "復習アリーナ", TREASURE: "お宝クエスト" };

function assessmentOf(id: string): AssessmentDef {
  const a = getAssessment(id);
  if (a) return a;
  const n = Number(/^treasure-(\d+)$/.exec(id)?.[1]);
  return { id, kind: "TREASURE", rangeStart: n, rangeEnd: n, questionCount: CURRICULUM_RULES.treasureQuestions, passRate: CURRICULUM_RULES.treasurePassRate, unlocksLesson: null };
}

export function testCases(u: TestUnit): { cases: RenderCase[]; questions: number } {
  const a = assessmentOf(u.id);
  const T = `${u.id}${u.arenaMode ? ` ${u.arenaMode}` : ""}`;
  const seed = hashSeed(`render:${T}`);
  const qs = buildTestQuestions(a, { seed, arenaMode: u.arenaMode });
  const session: Session = { success: true, offline: true, assessment: a, seed, questions: qs.map(toPublic) };
  const base = { assessmentId: a.id, arenaMode: u.arenaMode };
  const head = `${TEST_TITLES[a.kind]} ${a.rangeStart}〜${a.rangeEnd}`;
  const cases: RenderCase[] = qs.map((q, i) => ({
    where: `${T} ${i + 1}もんめ ${q.type}`,
    el: <TestRunner {...base} initial={{ session, idx: i }} />,
    expect: [head, `${i + 1} / ${qs.length}`, a.kind === "BOSS" ? "遺跡のボス" : null, ...qExpect(q), q.type === "spell" ? "こたえる" : null, q.type === "speak" ? "🎤 いってみる" : null],
  }));
  const right = qs.map((q) => ({ questionId: q.id, value: q.type === "speak" ? "0.95" : q.answer }));
  const wrong = qs.map((q) => ({ questionId: q.id, value: q.type === "speak" ? "0.1" : q.type === "spell" ? "" : "zz" }));
  const results: [string, TestSubmitResponse][] = [
    ["ぜんぶ せいかい", offlineTestSubmit(a.id, { seed, arenaMode: u.arenaMode, answers: right })],
    ["ぜんぶ まちがい", offlineTestSubmit(a.id, { seed, arenaMode: u.arenaMode, answers: wrong })],
  ];
  for (const [label, r] of results) {
    const wrongFb = r.feedback.filter((f) => !f.correct);
    cases.push({
      where: `${T} 結果 ${label}`,
      el: <TestRunner {...base} initial={{ session, result: r }} />,
      expect: [r.passed ? "ごうかく！" : "おしい！もう一回ちょうせんしよう", `せいかいりつ ${Math.round(r.score * 100)}%`, ...r.reward.coins.map((c) => `+${c.amount} ${c.labelJa}`),
        r.unlocksLesson ? `Lesson ${r.unlocksLesson} がひらいた` : null, wrongFb.length ? "まちがえた問題のかいせつ" : null,
        ...wrongFb.flatMap((f) => [f.feedbackJa, f.explanationJa, f.correctAnswer]), (!r.passed || a.kind === "ARENA") ? (a.kind === "ARENA" ? "もう一周！" : "もう一回！") : null],
    });
  }
  cases.push({ where: `${T} さいてんちゅう`, el: <TestRunner {...base} initial={{ session, submitting: true }} />, expect: ["さいてんちゅう"] });
  return { cases, questions: qs.length };
}

// ---------------------------------------------------------------------------
// としょかん
// ---------------------------------------------------------------------------

const libraryState = (offline: boolean, reachedLesson = TOTAL_LESSONS): LibraryState => ({ reachedLesson, offline, coins: 0, rewardedToday: false, dailyCoins: 5, local: emptyLibrary() });

const lineText = (l: { en: string }) => l.en;

export function storyCases(story: Story): RenderCase[] {
  const S = `おはなし ${story.id}`;
  const st = libraryState(false);
  const head = [story.title, story.titleJa, `ステージ${story.stage}・${story.level}`];
  const words = story.words.flatMap((w) => [w.en, w.ja]);
  const jaShown = story.stage <= 1;
  const out: RenderCase[] = [
    { where: `${S} よむ`, el: <StoryView story={story} state={st} />, expect: [...head, ...story.lines.map(lineText), ...(jaShown ? story.lines.map((l) => l.ja) : []), ...words, "クイズに こたえる", jaShown ? "やくを かくす" : "やくを みる"] },
    { where: `${S} よむ（やく あり・ゆっくり・おためし）`, el: <StoryView story={story} state={libraryState(true)} initial={{ showJa: true, slow: true }} />, expect: [...story.lines.map((l) => l.ja), "ゆっくり", "コインは きろくされないよ"] },
    { where: `${S} よむ（やく なし）`, el: <StoryView story={story} state={st} initial={{ showJa: false }} />, expect: [...story.lines.map(lineText), "やくを みる"] },
  ];
  story.lines.forEach((l, i) => out.push({ where: `${S} ${i + 1}ぎょうめを よむ`, el: <ReadAlongText lines={story.lines} reader={readerAt(i, i % Math.max(1, l.en.split(/\s+/).length))} showJa />, expect: [l.en, l.ja] }));
  story.questions.forEach((q, i) => {
    const before = story.questions.slice(0, i).map((x) => x.answer);
    const exp = [`クイズ ${i + 1} / ${story.questions.length}`, q.q, q.qJa, ...q.choices];
    out.push({ where: `${S} クイズ ${i + 1}`, el: <StoryView story={story} state={st} initial={{ phase: "quiz", quiz: { idx: i, answers: before } }} />, expect: exp });
    out.push({ where: `${S} クイズ ${i + 1} せいかい`, el: <StoryView story={story} state={st} initial={{ phase: "quiz", quiz: { idx: i, answers: [...before, q.answer] } }} />, expect: [...exp, "せいかい！", i + 1 < story.questions.length ? "つぎへ" : "けっかを みる"] });
    const wrongPick = (q.answer + 1) % q.choices.length;
    out.push({ where: `${S} クイズ ${i + 1} まちがい`, el: <StoryView story={story} state={st} initial={{ phase: "quiz", quiz: { idx: i, answers: [...before, wrongPick] } }} />, expect: [...exp, "おしい！ こたえは みどりの ほうだよ。"] });
  });
  const pass = gradeStory(story, story.questions.map((q) => q.answer));
  const fail = gradeStory(story, story.questions.map(() => -1));
  out.push(
    { where: `${S} けっか ごうかく`, el: <StoryView story={story} state={st} initial={{ phase: "result", grade: pass, result: { completed: true, stampedNow: true, coinsAwarded: 5, messageJa: "きょうの スタンプ ゲット！" } }} />, expect: [`${pass.correct} / ${pass.total} もん せいかい！`, "きょうの スタンプ ゲット！", "もういちど よむ"] },
    { where: `${S} けっか ざんねん`, el: <StoryView story={story} state={st} initial={{ phase: "result", grade: fail }} />, expect: [`${fail.correct} / ${fail.total} もん せいかい！`, "きろくしているよ"] },
  );
  if (story.unlockLesson > 0) out.push({ where: `${S} まだ ひらいて いない`, el: <StoryView story={story} state={libraryState(false, story.unlockLesson - 1)} />, expect: [`Lesson ${story.unlockLesson} を クリアすると ひらくよ`] });
  return out;
}

export function chantCases(chant: Chant): RenderCase[] {
  const C = `チャンツ ${chant.id}`;
  const st = libraryState(false);
  const out: RenderCase[] = [
    { where: `${C} きく`, el: <ChantView chant={chant} state={st} />, expect: [chant.title, chant.titleJa, chant.focusJa, ...chant.lines.flatMap((l) => [l.en, l.ja]), "🎵 きく", "🗣️ まねっこ"] },
    { where: `${C} まねっこ（やく なし・おためし）`, el: <ChantView chant={chant} state={libraryState(true)} initial={{ mode: "echo", showJa: false, slow: true }} />, expect: [...chant.lines.map(lineText), "よく きいてね", "やくを みる", "ゆっくり"] },
    { where: `${C} おわり`, el: <ChantView chant={chant} state={st} initial={{ result: { completed: true, stampedNow: false, coinsAwarded: 0, messageJa: "きょうの スタンプは もう もらったよ。" } }} />, expect: ["さいごまで できたね！", "きょうの スタンプは もう もらったよ。"] },
  ];
  chant.lines.forEach((l, i) => out.push({ where: `${C} ${i + 1}ぎょうめ`, el: <ReadAlongText lines={chant.lines} reader={readerAt(i, 0, true, i % 2 === 1)} showJa big />, expect: [l.en, l.ja] }));
  if (chant.unlockLesson > 0) out.push({ where: `${C} まだ ひらいて いない`, el: <ChantView chant={chant} state={libraryState(false, chant.unlockLesson - 1)} />, expect: [`Lesson ${chant.unlockLesson} を クリアすると ひらくよ`] });
  return out;
}

export function talkCases(theme: TalkTheme): RenderCase[] {
  const T = `フリートーク ${theme.id}`;
  const st = libraryState(false);
  const conv = themeConversation(theme);
  const variant: ConversationVariant = { endpoint: { url: "/api/library/talk", body: { themeId: theme.id } }, coinNote: null, doneText: "おはなし おしまい！", doneLabel: "おわる ▶", skipLabel: "としょかんへ もどる" };
  const out: RenderCase[] = [
    { where: `${T} はじめる まえ`, el: <TalkView theme={theme} state={st} />, expect: [theme.titleJa, conv.sceneJa, conv.aiTask.goalJa, "はなすと きょうの スタンプ（🪙+5"] },
    { where: `${T} おためし`, el: <TalkView theme={theme} state={libraryState(true)} />, expect: ["だいほんで おへんじ するよ"] },
    { where: `${T} おわり（スタンプ）`, el: <TalkView theme={theme} state={st} initial={{ result: { completed: true, stampedNow: true, coinsAwarded: 5, messageJa: "きょうの スタンプ ゲット！", turns: 4 } }} />, expect: ["4かい おはなし したよ！", "きょうの スタンプ ゲット！"] },
    { where: `${T} おわり（すくない）`, el: <TalkView theme={theme} state={st} initial={{ result: { completed: false, stampedNow: false, coinsAwarded: 0, messageJa: "", turns: 1 } }} />, expect: ["1かい おはなし したよ！", "いじょう はなすと スタンプが もらえるよ"] },
    { where: `${T} まだ ひらいて いない`, el: <TalkView theme={theme} state={libraryState(false, 0)} />, expect: ["を クリアすると ひらくよ"] },
  ];
  const states = conversationStates(conv, theme.character, FREE_TALK_TURNS);
  states.forEach((s, i) => out.push({ where: `${T} ${i}ターン`, el: <TalkView theme={theme} state={st} initial={{ conversation: s.initial }} />, expect: [...s.expect, s.initial.done ? "おわる ▶" : "おくる"] }));
  out.push(...conversationCases(`${T} かいわ`, conv, theme.character, FREE_TALK_TURNS, [], 1, variant).slice(0, 2));
  return out;
}

// ---------------------------------------------------------------------------
// 力だめし
// ---------------------------------------------------------------------------

export function yearlyCases(test: YearlyTest): RenderCase[] {
  const Y = `力だめし ステージ${test.stage}`;
  const state: YearlyState = { offline: true, stage: test.stage, reachedLesson: TOTAL_LESSONS, isTrial: true, availability: { available: true }, history: [] };
  const passages = new Map((test.passages ?? []).map((p) => [p.id, p]));
  const sample: YearlyAnswers = {
    choices: Object.fromEntries([...test.listening, ...test.reading].map((i) => [i.id, i.answer])),
    speaking: Object.fromEntries(test.speaking.prompts.map((p) => [p.id, p.readText ?? p.sample])),
    writingText: test.writing.sample,
    writingWords: test.writing.items?.map((x) => x.answer) ?? [],
  };
  const result = buildResult(test, sanitizeAnswers(test, sample), "2026-11-27");
  const prev = buildResult(test, sanitizeAnswers(test, { choices: {}, speaking: {}, writingText: "", writingWords: [] }), "2025-11-20");
  const growth = growthBetween(prev, result);
  const summary = (r: typeof result, id: string) => ({ id, stage: r.stage, takenOn: r.takenOn, scores: r.scores, total: r.total, band: r.band, scaled: r.scaled, gradedBy: r.gradedBy });
  const out: RenderCase[] = [
    { where: `${Y} はじめに`, el: <YearlyView state={state} test={test} />, expect: ["年に1回の 力だめし", test.titleJa, test.levelJa, `${test.listening.length}もん`, `${test.reading.length}もん`, "はじめる ▶", "おためしでは 1 かいだけ 受けられるよ。"] },
    { where: `${Y} はじめに（おためし 済み）`, el: <YearlyView state={{ ...state, availability: { available: false, reason: "TRIAL_USED" }, history: [summary(result, "a")] }} test={test} />, expect: ["おためしでは 力だめしは 1 かいだけ", result.band] },
    { where: `${Y} はじめに（1年 まつ）`, el: <YearlyView state={{ ...state, isTrial: false, offline: false, availability: { available: false, reason: "WAIT", nextOn: "2027-11-27" }, history: [summary(result, "a"), summary(prev, "b")] }} test={test} />, expect: ["つぎの 力だめしは", "これまでの 力だめし（2かい）", result.band, prev.band] },
  ];
  for (const section of ["listening", "reading"] as const) {
    const list = section === "listening" ? test.listening : test.reading;
    list.forEach((item, i) => {
      const passage = item.passageId ? passages.get(item.passageId) : undefined;
      const showPrompt = item.prompt && (section === "reading" || item.format === "dialog" || item.format === "passage");
      const exp = [item.promptJa, showPrompt ? item.prompt : null, ...(item.format === "picture" ? [] : item.choices), passage?.title, ...(passage?.lines ?? []), section === "listening" ? "きく（のこり" : null, `${i + 1} / ${list.length}`];
      out.push({ where: `${Y} ${section} ${i + 1}`, el: <YearlyView state={state} test={test} initial={{ phase: section, idx: i }} />, expect: exp });
      out.push({ where: `${Y} ${section} ${i + 1} えらんだ`, el: <YearlyView state={state} test={test} initial={{ phase: section, idx: i, answers: { ...sample } }} />, expect: [i + 1 < list.length ? "つぎへ ▶" : section === "listening" ? "つぎは 読む ▶" : "つぎは 話す ▶"] });
    });
  }
  test.speaking.prompts.forEach((p, i) => {
    out.push({ where: `${Y} speaking ${i + 1}`, el: <YearlyView state={state} test={test} initial={{ phase: "speaking", idx: i }} />, expect: [p.askEn, test.stage <= 2 ? p.askJa : "日本語の ヒントを みる", p.readText, i === 0 ? test.speaking.introEn : null, i === 0 ? test.speaking.introJa : null, "つぎへ」で とばしても いいよ"] });
    out.push({ where: `${Y} speaking ${i + 1} こたえた`, el: <YearlyView state={state} test={test} initial={{ phase: "speaking", idx: i, answers: sample }} />, expect: [p.readText ?? p.sample] });
  });
  out.push(
    { where: `${Y} writing`, el: <YearlyView state={state} test={test} initial={{ phase: "writing" }} />, expect: [test.writing.promptEn, test.writing.promptJa, ...(test.writing.email ?? []), ...(test.writing.items ?? []).map((x) => x.hintJa), "おわり（さいてんする）"] },
    { where: `${Y} writing 書いた`, el: <YearlyView state={state} test={test} initial={{ phase: "writing", answers: sample }} />, expect: [test.writing.kind === "words" ? null : test.writing.sample] },
    { where: `${Y} さいてんちゅう`, el: <YearlyView state={state} test={test} initial={{ phase: "submitting" }} />, expect: ["さいてんちゅう"] },
    {
      where: `${Y} 結果（はじめて）`, el: <YearlyView state={state} test={test} initial={{ phase: "result", outcome: { ok: true, result, growth: null, saved: false, messageJa: "けっかは この たんまつに のこしたよ" } }} />,
      expect: ["よく がんばったね！", result.band, "おうちの方へ", "はじめての 力だめしです", ...test.speaking.prompts.flatMap((p) => [p.askEn, p.kind !== "readAloud" ? p.sample : null]), test.writing.sample, `${result.total}`],
    },
    { where: `${Y} 結果（のびた）`, el: <YearlyView state={state} test={test} initial={{ phase: "result", outcome: { ok: true, result, growth, saved: true, messageJa: "きろくしたよ" } }} />, expect: [growth.delta.total > 0 ? `ちから スコアが ${growth.delta.total} アップ` : null, "からの のび"] },
    { where: `${Y} 結果（だめ）`, el: <YearlyView state={state} test={test} initial={{ phase: "result", outcome: { ok: false, messageJa: "いまは 採点できなかったよ。" } }} />, expect: ["いまは 採点できなかったよ。", "マップへ もどる"] },
  );
  return out;
}

// ---------------------------------------------------------------------------
// ぜんぶ（しごとの 単位）
// ---------------------------------------------------------------------------

export type RenderUnit =
  | { kind: "lesson"; n: number }
  | { kind: "test"; test: TestUnit }
  | { kind: "stories"; stage: number }
  | { kind: "chants" }
  | { kind: "talks" }
  | { kind: "yearly"; stage: number };

/** しごとの 単位（ワーカーに くばる）。重い としょかん・力だめしを さきに */
export function renderUnits(): RenderUnit[] {
  return [
    ...STORY_STAGES.map((stage) => ({ kind: "stories" as const, stage })),
    { kind: "chants" as const },
    { kind: "talks" as const },
    ...YEARLY_STAGES.map((stage) => ({ kind: "yearly" as const, stage })),
    ...LESSONS.map((l) => ({ kind: "lesson" as const, n: l.lessonNo })),
    ...testUnits().map((test) => ({ kind: "test" as const, test })),
  ];
}

export const GROUP_TITLES: Record<string, string> = {
  lesson: "レッスンの ステップ（プレイヤー・カード・TPR・フォニックス・学校・発音・クイズ・スピード・クリア）",
  teacher: "先生の 授業（バーチャル教室・ぜんぶの セグメント）",
  conversation: "かいわ（AI キャラ・台本で さいごまで）",
  recap: "きょうの まとめ（ぜんぶの セグメント）",
  tests: "テスト（復習・まとめ・ボス・アリーナ × モード・お宝）",
  library: "としょかん（おはなし・チャンツ・フリートーク）",
  yearly: "力だめし（5 ステージ）",
};

export interface GroupTally { renders: number; counts: Record<string, number>; problems: string[]; ms: number }
export type Tally = Record<string, GroupTally>;

export const emptyTally = (): Tally => Object.fromEntries(Object.keys(GROUP_TITLES).map((k) => [k, { renders: 0, counts: {}, problems: [], ms: 0 }]));

function runCases(t: GroupTally, cases: readonly RenderCase[], maxProblems: number) {
  const t0 = Date.now();
  for (const c of cases) {
    t.renders++;
    t.counts["しらべた 文字"] = (t.counts["しらべた 文字"] ?? 0) + (c.expect ?? []).filter((x) => x && squash(x)).length;
    const p = renderCase(c);
    if (p.length && t.problems.length < maxProblems) t.problems.push(...p.slice(0, maxProblems - t.problems.length));
    else if (p.length) t.counts["のせきれない 問題"] = (t.counts["のせきれない 問題"] ?? 0) + p.length;
  }
  t.ms += Date.now() - t0;
}
const bump = (t: GroupTally, k: string, n = 1) => { t.counts[k] = (t.counts[k] ?? 0) + n; };

/** 1つの 単位を 描いて tally に たす（問題は グループごとに maxProblems まで のせる） */
export async function runUnit(u: RenderUnit, tally: Tally, maxProblems = 400): Promise<void> {
  const safe = async (group: string, where: string, fn: () => void | Promise<void>) => {
    try { await fn(); } catch (e) { tally[group].problems.push(`${where}: 画面の データが 作れない: ${e instanceof Error ? e.message : e}`); }
  };
  if (u.kind === "lesson") {
    await safe("lesson", `L${u.n}`, () => {
      const c = lessonCases(u.n);
      runCases(tally.lesson, c.lesson, maxProblems); bump(tally.lesson, "レッスン");
      runCases(tally.teacher, c.teacher, maxProblems); bump(tally.teacher, "レッスン");
      runCases(tally.recap, c.recap, maxProblems); bump(tally.recap, "レッスン");
      if (c.conversation.length) { runCases(tally.conversation, c.conversation, maxProblems); bump(tally.conversation, "レッスン"); }
    });
  } else if (u.kind === "test") {
    await safe("tests", u.test.id, () => {
      const r = testCases(u.test);
      runCases(tally.tests, r.cases, maxProblems);
      bump(tally.tests, "テスト"); bump(tally.tests, "出題", r.questions);
    });
  } else if (u.kind === "stories") {
    await safe("library", `おはなし ステージ${u.stage}`, async () => {
      for (const s of await loadStoryStage(u.stage)) { runCases(tally.library, storyCases(s), maxProblems); bump(tally.library, "おはなし"); }
    });
  } else if (u.kind === "chants") {
    await safe("library", "チャンツ", async () => {
      for (const c of await loadChants()) { runCases(tally.library, chantCases(c), maxProblems); bump(tally.library, "チャンツ"); }
    });
  } else if (u.kind === "talks") {
    await safe("library", "フリートーク", async () => {
      for (const t of await loadTalkThemes()) { runCases(tally.library, talkCases(t), maxProblems); bump(tally.library, "フリートーク"); }
    });
  } else if (u.kind === "yearly") {
    await safe("yearly", `力だめし ステージ${u.stage}`, async () => {
      const t = await loadYearlyTest(u.stage);
      if (!t) { tally.yearly.problems.push(`力だめし ステージ${u.stage}: 問題が 読めない`); return; }
      runCases(tally.yearly, yearlyCases(t), maxProblems); bump(tally.yearly, "ステージ");
    });
  }
}

/** ワーカーの tally を たしあわせる */
export function mergeTally(into: Tally, from: Tally, maxProblems = 400) {
  for (const [k, g] of Object.entries(from)) {
    const t = (into[k] ??= { renders: 0, counts: {}, problems: [], ms: 0 });
    t.renders += g.renders;
    t.ms += g.ms;
    for (const [c, n] of Object.entries(g.counts)) t.counts[c] = (t.counts[c] ?? 0) + n;
    const room = maxProblems - t.problems.length;
    t.problems.push(...g.problems.slice(0, Math.max(0, room)));
    if (g.problems.length > room) t.counts["のせきれない 問題"] = (t.counts["のせきれない 問題"] ?? 0) + g.problems.length - Math.max(0, room);
  }
}

export const problemCount = (t: Tally) => Object.values(t).reduce((n, g) => n + g.problems.length + (g.counts["のせきれない 問題"] ?? 0), 0);
export const renderCount = (t: Tally) => Object.values(t).reduce((n, g) => n + g.renders, 0);

export function summarizeRender(t: Tally): string {
  return [
    `レッスン ${(t.lesson?.counts["レッスン"] ?? 0).toLocaleString("en-US")}`,
    `テスト ${(t.tests?.counts["テスト"] ?? 0).toLocaleString("en-US")}`,
    `おはなし ${t.library?.counts["おはなし"] ?? 0}`,
    `力だめし ${t.yearly?.counts["ステージ"] ?? 0}`,
    `描画 ${renderCount(t).toLocaleString("en-US")}`,
    `問題 ${problemCount(t)}`,
  ].join("・");
}

export function renderReportMarkdown(t: Tally, meta: { ms: number; workers: number }, maxPerGroup = 40): string {
  const lines = [
    "# 画面の 描画の 確認（run10 Phase 3）",
    "",
    `- 実行: \`npm run check:render\`（scripts/render-check.ts → scripts/lib/renderCheck.tsx・react-dom/server）・ワーカー ${meta.workers}・${(meta.ms / 1000).toFixed(1)} 秒`,
    `- まとめ: ${summarizeRender(t)}`,
    "- しらべる こと: 描画の エラー・React の 警告（key が ない など）・おなじ key の リスト・出る はずの 文字（英文・訳・選択肢・字幕 …）・「undefined」「NaN」「[object Object]」「null」・文字も 名前も ない ボタン",
    "",
    "| 画面 | 数 | 描画 | 問題 | 時間（ワーカーの 合計） |",
    "|---|---|---|---|---|",
    ...Object.entries(t).map(([k, g]) => `| ${GROUP_TITLES[k] ?? k} | ${Object.entries(g.counts).filter(([c]) => c !== "のせきれない 問題").map(([c, n]) => `${c} ${n.toLocaleString("en-US")}`).join("・")} | ${g.renders.toLocaleString("en-US")} | ${g.problems.length + (g.counts["のせきれない 問題"] ?? 0)} | ${(g.ms / 1000).toFixed(1)}s |`),
    "",
  ];
  for (const [k, g] of Object.entries(t).filter(([, g]) => g.problems.length)) {
    lines.push(`## ${GROUP_TITLES[k] ?? k}（${g.problems.length + (g.counts["のせきれない 問題"] ?? 0)}）`, "");
    for (const p of g.problems.slice(0, maxPerGroup)) lines.push(`- ${p}`);
    if (g.problems.length > maxPerGroup) lines.push(`- …ほか ${g.problems.length - maxPerGroup}`);
    lines.push("");
  }
  return lines.join("\n");
}
