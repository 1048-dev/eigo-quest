"use client";
/**
 * 1日1レッスン（約25〜30分）のプレイヤー。
 * 教師動画 → フラッシュカード → TPR → フォニックス → 学校テスト対策 → 発音 → 確認クイズ → スピードリスニング → 完了（コイン）
 */
import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { LearningItemDef, LessonDef } from "@/lib/domain/types";
import type { LessonStep } from "@/lib/curriculum/questions";
import type { AnswerLog } from "@/lib/services/progressService";
import { Flashcards, Phonics, Pronunciation, QuizRun, SchoolExpressions, SpeedListening, TeacherVideo, TprDrill } from "@/components/lesson/LessonSteps";

interface LessonResponse { lesson: LessonDef; teacher: { name: string; nameJa: string }; items: LearningItemDef[]; steps: LessonStep[] }

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
  const [result, setResult] = useState<{ ok: boolean; reasonJa?: string; reward?: { total: number }; nextTest?: string } | null>(null);

  useEffect(() => {
    fetch(`/api/lessons/${lessonNo}`).then(async (r) => (r.ok ? setData(await r.json()) : setError((await r.json()).error)));
  }, [lessonNo]);

  if (error) return <div className="card p-6 text-center font-bold">{error}<br /><Link href="/map" className="btn btn-primary mt-4 inline-block">マップへ</Link></div>;
  if (!data) return <p className="p-8 text-center">よみこみちゅう…</p>;

  const { lesson, items, steps, teacher } = data;
  const byIds = (ids: string[]) => ids.map((id) => items.find((i) => i.id === id)!).filter(Boolean);
  const next = (more: AnswerLog[] = []) => { setLogs((l) => [...l, ...more]); setStep((s) => s + 1); };

  const finish = async (more: AnswerLog[], speedBest: number) => {
    const all = [...logs, ...more];
    setLogs(all);
    const r = await fetch(`/api/lessons/${lesson.lessonNo}/complete`, {
      method: "POST",
      body: JSON.stringify({ quizScore, speedListeningBest: speedBest, logs: all }),
    }).then((x) => x.json());
    setResult(r);
  };

  if (result) {
    return (
      <div className="card p-6 text-center">
        <p className="text-6xl">{result.ok ? "🎉" : "🔁"}</p>
        <h2 className="mt-2 text-2xl font-black">{result.ok ? `Lesson ${lesson.lessonNo} クリア！` : result.reasonJa}</h2>
        {result.ok && <p className="mt-2 text-xl font-black text-[var(--coin)]">🪙 +{result.reward?.total ?? 0}</p>}
        {result.ok && <p className="mt-3 text-[var(--ink-2)]">あしたは「翌日テスト」からスタート！一発合格でボーナスコインだよ。</p>}
        {!result.ok && <button className="btn btn-coin mt-4" onClick={() => { setResult(null); setStep(steps.findIndex((s) => s.kind === "quiz")); }}>クイズをもう一回</button>}
        <Link href="/map" className="btn btn-primary mt-4 block">マップへもどる</Link>
      </div>
    );
  }

  const s = steps[step];
  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-bold text-[var(--ink-2)]">Session {lesson.lessonNo} ・ {lesson.school.grade}「{lesson.school.topic}」</p>
        <h1 className="text-xl font-black">{lesson.title} <span className="text-base text-[var(--ink-2)]">{lesson.titleJa}</span></h1>
        <ol className="mt-3 flex gap-1" aria-label="レッスンの進み具合">
          {steps.map((x, i) => (
            <li key={i} className={`flex-1 rounded-full py-1 text-center text-[10px] font-bold ${i < step ? "bg-[var(--ok)] text-white" : i === step ? "bg-[var(--accent)] text-white" : "bg-[var(--locked)]"}`}>{STEP_LABEL[x.kind]}</li>
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
