"use client";
/**
 * テスト画面（翌日テスト / 5回ごとまとめ / 30回ごとボス戦 / 復習アリーナ / お宝アラート）。
 * 1問ずつ解答 → まとめて提出 → サーバー採点（筆記はAI採点）→ 結果と「まちがえた問題の解説」（救済措置）→ 何度でも再挑戦。
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PublicQuestion } from "@/lib/curriculum/questions";
import { QuestionView, type AnswerEvent } from "./QuestionView";
import { Portrait } from "@/components/characters/CharacterArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { StandingFigure } from "@/components/characters/StandingArt";
import { apiPost } from "@/lib/api/client";
import { TestStartResponseSchema, TestSubmitResponseSchema, type TestStartResponse, type TestSubmitResponse } from "@/lib/api/contracts";

type Session = Omit<TestStartResponse, "assessment"> & { assessment: NonNullable<TestStartResponse["assessment"]> };

const TITLES: Record<string, string> = { DAILY_CHECK: "翌日テスト", MINI: "まとめテスト", BOSS: "ボス戦", ARENA: "復習アリーナ", TREASURE: "お宝クエスト" };

export function TestRunner({ assessmentId, arenaMode, reviewAlertId }: { assessmentId: string; arenaMode?: string; reviewAlertId?: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; value: string; responseMs: number }[]>([]);
  const [result, setResult] = useState<TestSubmitResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const start = useCallback(() => {
    setResult(null); setIdx(0); setAnswers([]); setError(null);
    apiPost(`/api/tests/${encodeURIComponent(assessmentId)}/start`, TestStartResponseSchema, { arenaMode, reviewAlertId }).then((r) => {
      const a = r.data.assessment;
      if (!r.ok || !a || r.data.questions.length === 0) return setError(r.error ?? "テストを よみこめなかったよ。");
      setSession({ ...r.data, assessment: a });
    });
  }, [assessmentId, arenaMode, reviewAlertId]);

  useEffect(start, [start]);

  const onAnswer = useCallback((a: AnswerEvent) => {
    if (!session) return;
    const q = session.questions[idx];
    if (!q) return;
    const next = [...answers, { questionId: q.id, value: a.value, responseMs: a.responseMs }];
    setAnswers(next);
    if (idx + 1 < session.questions.length) return setIdx(idx + 1);
    setSubmitting(true);
    apiPost(`/api/tests/${encodeURIComponent(assessmentId)}/submit`, TestSubmitResponseSchema, { seed: session.seed, arenaMode, reviewAlertId, answers: next })
      .then((r) => {
        if (r.ok && r.data.ok) setResult(r.data);
        else setError(r.data.reasonJa || r.error || "採点できなかったよ。もう一回ためしてね。");
      })
      .finally(() => setSubmitting(false));
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
          <div className="flex items-end justify-center gap-1" aria-hidden>
            {result.passed ? (<>
              <StandingFigure id="haru" pose="cheer" height={110} />
              <StandingFigure id="birimo" mood="excited" height={84} />
              {kind === "BOSS" && <MonsterFigure id="mon-006" size={80} flip className="opacity-60 grayscale" />}
            </>) : (<>
              <StandingFigure id="riko" pose="cheer" height={100} />
              <StandingFigure id="birimo" mood="cheer" height={84} />
            </>)}
          </div>
          <h2 className="font-title mt-2 text-2xl text-[var(--gold-dark)]">{result.passed ? "ごうかく！" : "おしい！もう一回ちょうせんしよう"}</h2>
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
  if (!q) return <p className="rpg-title p-8 text-center text-xl">さいてんちゅう…</p>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="rpg-title text-lg">{kind === "BOSS" ? "🏰 " : kind === "ARENA" ? "⚔️ " : "📝 "}{TITLES[kind]} {session.assessment.rangeStart}〜{session.assessment.rangeEnd}</h1>
        <span className="rounded-full border-2 border-[var(--gold)] bg-black/30 px-3 py-0.5 font-title text-[var(--volt)]">{idx + 1} / {session.questions.length}</span>
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
      <span className="font-title text-lg text-[var(--volt)]">VS</span>
      <div className="flex-1">
        <p className="font-title text-xs text-[var(--on-dark-2)]">遺跡のボス・アンブラ・ドラゴン</p>
        <div className="rpg-gauge mt-1"><span style={{ width: `${100 - (answered / total) * 100}%`, ["--gauge" as string]: "linear-gradient(90deg,#ff6fa5,#e5484d)" }} /></div>
      </div>
      <MonsterFigure id="mon-006" size={56} flip className="bob" />
    </div>
  );
}
