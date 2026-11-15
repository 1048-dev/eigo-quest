"use client";
/**
 * 1日1レッスン（約25〜30分）のプレイヤー。
 * 教師動画 → フラッシュカード → TPR → フォニックス → 学校テスト対策 → 発音 → 確認クイズ → スピードリスニング → 完了（コイン）
 */
import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { LessonStep } from "@/lib/curriculum/questions";
import type { AnswerLog } from "@/lib/services/progressService";
import { Flashcards, Phonics, Pronunciation, QuizRun, SchoolExpressions, SpeedListening, TeacherVideo, TprDrill } from "@/components/lesson/LessonSteps";
import { StandingFigure } from "@/components/characters/StandingArt";
import { apiGet, apiPost } from "@/lib/api/client";
import { LessonCompleteResponseSchema, LessonResponseSchema, type LessonCompleteResponse, type LessonResponse } from "@/lib/api/contracts";

const STEP_LABEL: Record<LessonStep["kind"], string> = {
  teacher_video: "せんせい", flashcards: "カード", tpr: "うごこう", phonics: "フォニックス",
  school_expressions: "がっこう", pronunciation: "はつおん", quiz: "クイズ", speed_listening: "スピード",
};

export default function LessonPage({ params }: { params: Promise<{ lessonNo: string }> }) {
  const { lessonNo } = use(params);
  const [data, setData] = useState<LessonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [result, setResult] = useState<LessonCompleteResponse | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/lessons/${encodeURIComponent(lessonNo)}`, LessonResponseSchema).then((r) => {
      if (!alive) return;
      if (!r.ok || !r.data.lesson || r.data.steps.length === 0) setError(r.error ?? "レッスンを よみこめなかったよ。");
      else setData(r.data);
    });
    return () => { alive = false; };
  }, [lessonNo]);

  if (error) {
    return (
      <div className="card rpg-rivets mt-6 flex flex-col items-center p-6 text-center font-bold">
        <StandingFigure id="birimo" mood="worried" height={110} />
        <p className="mt-2">{error}</p>
        <Link href="/map" className="btn btn-primary mt-4 inline-block">マップへ</Link>
      </div>
    );
  }
  if (!data || !data.lesson) return <p className="rpg-title p-8 text-center text-xl">レッスンを よみこみちゅう…</p>;

  const lesson = data.lesson;
  const items = data.items ?? [];
  const steps = (data.steps ?? []) as LessonStep[];
  const teacher = data.teacher;
  const byIds = (ids: string[] | undefined) => (ids ?? []).flatMap((id) => {
    const it = items.find((i) => i.id === id);
    return it ? [it] : [];
  });
  const next = (more: AnswerLog[] = []) => { setLogs((l) => [...l, ...more]); setStep((s) => s + 1); };

  const finish = async (more: AnswerLog[], speedBest: number) => {
    const all = [...logs, ...more];
    setLogs(all);
    const r = await apiPost(`/api/lessons/${lesson.lessonNo}/complete`, LessonCompleteResponseSchema, { quizScore, speedListeningBest: speedBest, logs: all });
    setResult(r.ok ? r.data : { ...r.data, ok: false, reasonJa: r.data.reasonJa || r.error || "記録できなかったよ。もう一回ためしてね。" });
  };

  if (result) {
    return (
      <div className="card rpg-rivets p-6 text-center">
        <div className="flex items-end justify-center gap-1" aria-hidden>
          {result.ok ? (<>
            <StandingFigure id="riko" pose="cheer" height={100} />
            <StandingFigure id="haru" pose="cheer" height={118} />
            <StandingFigure id="kiko" pose="cheer" height={100} />
            <StandingFigure id="birimo" mood="excited" height={90} />
          </>) : <StandingFigure id="birimo" mood="worried" height={100} />}
        </div>
        <h2 className="font-title mt-2 text-2xl text-[var(--gold-dark)]">{result.ok ? `Lesson ${lesson.lessonNo} クリア！` : result.reasonJa}</h2>
        {result.ok && <p className="mt-2 text-xl font-black text-[var(--coin)]">🪙 +{result.reward?.total ?? 0}</p>}
        {result.ok && <p className="mt-3 text-[var(--ink-2)]">あしたは「翌日テスト」からスタート！一発合格でボーナスコインだよ。</p>}
        {!result.ok && <button className="btn btn-coin mt-4" onClick={() => { setResult(null); setStep(Math.max(0, steps.findIndex((s) => s.kind === "quiz"))); }}>クイズをもう一回</button>}
        <Link href="/map" className="btn btn-primary mt-4 block">マップへもどる</Link>
      </div>
    );
  }

  const s = steps[step];
  return (
    <div className="space-y-4">
      <header className="rpg-wood p-3">
        <p className="font-title text-xs text-[var(--volt)]">Session {lesson.lessonNo} ・ {lesson.school.grade}「{lesson.school.topic}」</p>
        <h1 className="text-xl font-black">{lesson.title} <span className="text-base text-[var(--on-dark-2)]">{lesson.titleJa}</span></h1>
        <ol className="mt-3 flex gap-1" aria-label="レッスンの進み具合">
          {steps.map((x, i) => (
            <li key={i} className={`flex-1 rounded-md border-2 py-1 text-center text-[10px] font-black ${i < step ? "border-[#0f5c37] bg-[var(--ok)] text-white" : i === step ? "border-[var(--gold-deep)] bg-gradient-to-b from-[#fff1a6] to-[var(--gold)] text-[#3b2a00]" : "border-black/40 bg-black/30 text-[var(--on-dark-2)]"}`}>{STEP_LABEL[x.kind]}</li>
          ))}
        </ol>
      </header>

      {s.kind === "teacher_video" && <TeacherVideo script={s.script} videoUrl={s.videoUrl} teacherName={teacher.nameJa} onDone={next} />}
      {s.kind === "flashcards" && <Flashcards items={byIds(s.itemIds)} onDone={next} />}
      {s.kind === "tpr" && <TprDrill items={byIds(s.itemIds)} actions={Object.fromEntries(lesson.tpr.map((t) => [t.en, t.action]))} onDone={next} />}
      {s.kind === "phonics" && <Phonics focus={s.focus} words={s.words} tipJa={s.tipJa} onDone={next} />}
      {s.kind === "school_expressions" && <SchoolExpressions items={byIds(s.itemIds)} testPoints={s.testPoints} onDone={next} />}
      {s.kind === "pronunciation" && <Pronunciation items={byIds(s.itemIds)} onDone={next} />}
      {s.kind === "quiz" && <QuizRun title="✅ かくにんクイズ" questions={s.questions} onDone={(l, score) => { setQuizScore(score); next(l); }} />}
      {s.kind === "speed_listening" && <SpeedListening rounds={s.rounds} onDone={finish} />}
    </div>
  );
}
