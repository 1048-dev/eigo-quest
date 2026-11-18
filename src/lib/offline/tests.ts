/**
 * テストのオフライン処理（DBなし）。出題は本物と同じ seed から作り、採点はルール採点（localGrader）で行う。
 * 記録・コインは保存されない（offline: true）。
 */
import { getAssessment } from "@/lib/curriculum";
import { buildTestQuestions, hashSeed, toPublic, type Question } from "@/lib/curriculum/questions";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import { rewardForTest } from "@/lib/domain/coins";
import type { AssessmentDef } from "@/lib/domain/types";
import type { ArenaMode } from "@/lib/domain/arena";
import { gradeLocally } from "@/lib/grading/localGrader";
import type { TestStartResponse, TestSubmitResponse } from "@/lib/api/contracts";

function assessmentOf(id: string): AssessmentDef | undefined {
  const a = getAssessment(id);
  if (a) return a;
  const m = /^treasure-(\d+)$/.exec(id);
  if (!m) return undefined;
  const n = Number(m[1]);
  return { id, kind: "TREASURE", rangeStart: n, rangeEnd: n, questionCount: CURRICULUM_RULES.treasureQuestions, passRate: CURRICULUM_RULES.treasurePassRate, unlocksLesson: null };
}

export function offlineTestStart(id: string, opts: { arenaMode?: ArenaMode }): TestStartResponse {
  const a = assessmentOf(id);
  if (!a) return { success: true, offline: true, assessment: null, seed: 0, questions: [] };
  const seed = hashSeed(`offline:${id}:${Date.now()}`);
  const questions = buildTestQuestions(a, { seed, arenaMode: opts.arenaMode });
  return { success: true, offline: true, assessment: a, seed, questions: questions.map(toPublic) };
}

function grade(q: Question, value: string, strictness: "lenient" | "school") {
  if (q.type === "spell") {
    const g = gradeLocally(q.answer, value, strictness);
    const correct = g.verdict === "PASS";
    return { questionId: q.id, correct, verdict: g.verdict, feedbackJa: g.feedbackJa, explanationJa: correct ? undefined : q.explanationJa, correctAnswer: correct ? undefined : q.answer };
  }
  if (q.type === "speak") {
    const s = Number(value);
    const correct = Number.isFinite(s) && s >= 0.7;
    return { questionId: q.id, correct, verdict: undefined, feedbackJa: correct ? "いい発音！" : "もう一回まねしてみよう！", explanationJa: correct ? undefined : q.explanationJa, correctAnswer: undefined };
  }
  const correct = value === q.answer;
  const right = q.choices?.find((c) => c.id === q.answer)?.label ?? q.answer;
  return { questionId: q.id, correct, verdict: undefined, feedbackJa: correct ? "せいかい！" : "ざんねん！", explanationJa: correct ? undefined : q.explanationJa, correctAnswer: correct ? undefined : right };
}

export function offlineTestSubmit(id: string, body: { seed?: unknown; arenaMode?: ArenaMode; answers?: unknown }): TestSubmitResponse {
  const a = assessmentOf(id);
  const empty: TestSubmitResponse = { success: true, offline: true, ok: true, reasonJa: "", score: 0, passed: false, passRate: 0.8, feedback: [], reward: { total: 0, rareGachaTickets: 0, coins: [] }, unlocksLesson: null };
  if (!a) return empty;
  const seed = typeof body.seed === "number" && Number.isFinite(body.seed) ? body.seed : 0;
  const answers = Array.isArray(body.answers) ? (body.answers as { questionId?: unknown; value?: unknown }[]) : [];
  const questions = buildTestQuestions(a, { seed, arenaMode: body.arenaMode });
  const strictness = a.kind === "MINI" || a.kind === "BOSS" ? "school" : "lenient";
  const feedback = questions.map((q) => {
    const ans = answers.find((x) => x?.questionId === q.id);
    return grade(q, typeof ans?.value === "string" ? ans.value : "", strictness);
  });
  const score = questions.length ? feedback.filter((f) => f.correct).length / questions.length : 0;
  const passed = score >= a.passRate;
  const r = rewardForTest({ kind: a.kind, passed, score, isFirstAttempt: true, alreadyPassed: false, arenaPlaysToday: 0, viaTreasureAlert: a.kind === "TREASURE" });
  return {
    ...empty,
    score, passed, passRate: a.passRate, feedback,
    reward: { total: r.total, rareGachaTickets: r.rareGachaTickets, coins: r.coins.map((c) => ({ amount: c.amount, labelJa: c.labelJa })) },
    unlocksLesson: passed ? a.unlocksLesson : null,
  };
}
