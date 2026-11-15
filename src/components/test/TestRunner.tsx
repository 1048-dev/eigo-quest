"use client";
/**
 * テスト画面（翌日テスト / 5回ごとまとめ / 30回ごとボス戦 / 復習アリーナ / お宝アラート）。
 * 1問ずつ解答 → まとめて提出 → サーバー採点（筆記はAI採点）→ 結果と「まちがえた問題の解説」（救済措置）→ 何度でも再挑戦。
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PublicQuestion } from "@/lib/curriculum/questions";
import type { AssessmentDef } from "@/lib/domain/types";
import { QuestionView, type AnswerEvent } from "./QuestionView";
import { Portrait } from "@/components/characters/CharacterArt";

interface Feedback { questionId: string; correct: boolean; verdict?: string; feedbackJa: string; explanationJa?: string; correctAnswer?: string }
interface SubmitResult {
  ok: boolean; score: number; passed: boolean; passRate: number; feedback: Feedback[];
  reward: { total: number; rareGachaTickets: number; coins: { amount: number; labelJa: string }[] };
  unlocksLesson: number | null; reasonJa?: string;
}

const TITLES: Record<string, string> = { DAILY_CHECK: "翌日テスト", MINI: "まとめテスト", BOSS: "ボス戦", ARENA: "復習アリーナ", TREASURE: "お宝クエスト" };

export function TestRunner({ assessmentId, arenaMode, reviewAlertId }: { assessmentId: string; arenaMode?: string; reviewAlertId?: string }) {
  const [session, setSession] = useState<{ assessment: AssessmentDef; seed: number; questions: PublicQuestion[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; value: string; responseMs: number }[]>([]);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const start = useCallback(() => {
    setResult(null); setIdx(0); setAnswers([]); setError(null);
    fetch(`/api/tests/${assessmentId}/start`, { method: "POST", body: JSON.stringify({ arenaMode, reviewAlertId }) })
      .then(async (r) => (r.ok ? setSession(await r.json()) : setError((await r.json()).error)));
  }, [assessmentId, arenaMode, reviewAlertId]);

  useEffect(start, [start]);

  const onAnswer = useCallback((a: AnswerEvent) => {
    if (!session) return;
    const q = session.questions[idx];
    const next = [...answers, { questionId: q.id, value: a.value, responseMs: a.responseMs }];
    setAnswers(next);
    if (idx + 1 < session.questions.length) return setIdx(idx + 1);
    setSubmitting(true);
    fetch(`/api/tests/${assessmentId}/submit`, { method: "POST", body: JSON.stringify({ seed: session.seed, arenaMode, reviewAlertId, answers: next }) })
      .then((r) => r.json()).then(setResult).finally(() => setSubmitting(false));
  }, [session, idx, answers, assessmentId, arenaMode, reviewAlertId]);

  if (error) return <div className="card p-6 text-center"><p className="text-lg font-bold">{error}</p><Link className="btn btn-primary mt-4 inline-block" href="/map">マップへ</Link></div>;
  if (!session) return <p className="p-8 text-center">じゅんびちゅう…</p>;
  const kind = session.assessment.kind;

  if (submitting) return <p className="p-8 text-center text-xl font-black">さいてんちゅう… ✏️</p>;

  if (result) {
    const wrong = result.feedback.filter((f) => !f.correct);
    return (
      <div className="space-y-4">
        <div className="card rpg-rivets p-6 text-center">
          <p className="text-6xl">{result.passed ? (kind === "BOSS" ? "🐉💥" : "🎉") : "💪"}</p>
          <h2 className="font-pixel mt-2 text-2xl text-[var(--gold-dark)]">{result.passed ? "ごうかく！" : "おしい！もう一回ちょうせんしよう"}</h2>
          <p className="mt-1 text-[var(--ink-2)]">せいかいりつ {Math.round(result.score * 100)}%（ごうかくライン {Math.round(result.passRate * 100)}%）</p>
          {result.reward.coins.map((c, i) => <p key={i} className="mt-2 text-lg font-black text-[var(--coin)]">🪙 +{c.amount} {c.labelJa}</p>)}
          {result.reward.rareGachaTickets > 0 && <p className="mt-2 text-lg font-black">🎟️ レアガチャけん ×{result.reward.rareGachaTickets}</p>}
          {result.unlocksLesson && <p className="mt-2 font-bold">🔓 Lesson {result.unlocksLesson} がひらいた！</p>}
        </div>

        {wrong.length > 0 && (
          <div className="card p-5">
            <h3 className="font-black">📘 まちがえた問題のかいせつ</h3>
            <ul className="mt-3 space-y-3">
              {wrong.map((f) => (
                <li key={f.questionId} className="rounded-xl bg-[var(--bg)] p-3">
                  <p className="font-bold">{f.verdict === "RETRY" ? "🟡 おしい！" : "❌"} {f.feedbackJa}</p>
                  {f.explanationJa && <p className="mt-1 text-sm">{f.explanationJa}</p>}
                  {f.correctAnswer && <p className="mt-1 text-sm">こたえ: <b>{f.correctAnswer}</b></p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          {(!result.passed || kind === "ARENA") && <button className="btn btn-coin flex-1" onClick={start}>{kind === "ARENA" ? "もう一周！" : "もう一回！"}</button>}
          <Link className="btn btn-primary flex-1 text-center" href="/map">マップへ</Link>
        </div>
      </div>
    );
  }

  const q = session.questions[idx];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="rpg-title text-lg">{kind === "BOSS" ? "🏰 " : kind === "ARENA" ? "⚔️ " : "📝 "}{TITLES[kind]} {session.assessment.rangeStart}〜{session.assessment.rangeEnd}</h1>
        <span className="rounded-full border-2 border-[var(--gold)] bg-black/30 px-3 py-0.5 font-pixel text-[var(--volt)]">{idx + 1} / {session.questions.length}</span>
      </div>
      {kind === "BOSS" && <BossHp total={session.questions.length} answered={idx} />}
      <QuestionView key={q.id} q={q} onAnswer={onAnswer} />
    </div>
  );
}

/** ボス戦の演出: ハルたちパーティ vs 遺跡のボス。正誤は提出後にわかるので、HPは進行度で減らす */
function BossHp({ total, answered }: { total: number; answered: number }) {
  return (
    <div className="rpg-wood flex items-center gap-3 p-3">
      <div className="flex -space-x-3">
        <Portrait id="haru" size={44} ring="#e5484d" />
        <Portrait id="riko" size={36} ring="#ff8a3d" />
        <Portrait id="kiko" size={36} ring="#9b6bff" />
      </div>
      <span className="font-pixel text-lg text-[var(--volt)]">VS</span>
      <div className="flex-1">
        <p className="font-pixel text-xs text-[var(--on-dark-2)]">遺跡のボス・アルファドラゴン</p>
        <div className="rpg-gauge mt-1"><span style={{ width: `${100 - (answered / total) * 100}%`, ["--gauge" as string]: "linear-gradient(90deg,#ff6fa5,#e5484d)" }} /></div>
      </div>
      <span className="text-4xl bob" aria-hidden>🐉</span>
    </div>
  );
}
