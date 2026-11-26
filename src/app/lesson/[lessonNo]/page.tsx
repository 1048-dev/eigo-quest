"use client";
/**
 * 1日1レッスン（約25〜30分）のプレイヤー。
 * 教師動画 → フラッシュカード → TPR → フォニックス → 学校テスト対策 → 発音 → 確認クイズ → スピードリスニング → AIキャラと かいわ → 完了（コイン）
 */
import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { LessonStep } from "@/lib/curriculum/questions";
import type { AnswerLog } from "@/lib/services/progressService";
import { Flashcards, Phonics, Pronunciation, QuizRun, SchoolExpressions, SpeedListening, TeacherVideo, TprDrill } from "@/components/lesson/LessonSteps";
import { ConversationStep } from "@/components/lesson/ConversationStep";
import { StandingFigure } from "@/components/characters/StandingArt";
import { HeroScene } from "@/components/scene/HeroScene";
import { apiGet, apiPost, isUnreachable } from "@/lib/api/client";
import { loadOfflineLesson, offlineLessonComplete } from "@/lib/offline";
import { recordLocalLesson } from "@/lib/offline/localProgress";
import { recordTrialLesson } from "@/lib/offline/trialLog";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { worldName } from "@/lib/game/worlds";
import { OfflineNote } from "@/components/common/OfflineNote";
import { LessonCompleteResponseSchema, LessonResponseSchema, type LessonCompleteResponse, type LessonResponse } from "@/lib/api/contracts";

const STEP_LABEL: Record<LessonStep["kind"], string> = {
  teacher_video: "せんせい", flashcards: "カード", tpr: "うごこう", phonics: "フォニックス",
  school_expressions: "がっこう", pronunciation: "はつおん", quiz: "クイズ", speed_listening: "スピード", conversation: "かいわ",
};

export default function LessonPage({ params }: { params: Promise<{ lessonNo: string }> }) {
  const { lessonNo } = use(params);
  const [data, setData] = useState<LessonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [speedBest, setSpeedBest] = useState(0);
  const [result, setResult] = useState<LessonCompleteResponse | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/lessons/${encodeURIComponent(lessonNo)}`, LessonResponseSchema).then(async (r) => {
      if (!alive) return;
      if (r.ok && r.data.lesson && r.data.steps.length > 0) { setData(r.data); setOffline(!!r.data.offline); return; }
      // サーバーに届かない → 内蔵の教材でそのままレッスンできる（そのワールドの JSON だけを あとから 読む）
      if (isUnreachable(r) || (r.ok && !r.data.lesson)) {
        const o = await loadOfflineLesson(Number(lessonNo)).catch(() => null);
        if (!alive) return;
        if (o?.lesson && o.steps.length > 0) { setData(o); setOffline(true); return; }
      }
      // ここに来るのは「まだひらいていない」などゲーム上の理由だけ
      setError(r.error ?? "このレッスンは まだ ひらいていないよ。");
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

  const finish = async (more: AnswerLog[], speedBest: number, conversationFinished = false) => {
    const all = [...logs, ...more];
    setLogs(all);
    const r = await apiPost(`/api/lessons/${lesson.lessonNo}/complete`, LessonCompleteResponseSchema, { quizScore, speedListeningBest: speedBest, logs: all, conversationFinished });
    // おためしモード: この ブラウザに だけ クリアを おぼえておく（マップに ✓ と「きょうのまとめ」が 出る）
    // おためしの きろく（あとで 保護者が登録したら 子どもに ひきつげる）: オフラインのときだけ ブラウザに のこす。
    // サーバーに つながるときは この端末の おためし学習者（DB）に きろくされる（run5）
    const trialRecord = (coins: number) => recordTrialLesson(lesson.lessonNo, { coins, logs: all });
    if (isUnreachable(r)) {
      const off = offlineLessonComplete(lesson.lessonNo, { conversationFinished });
      setOffline(true); recordLocalLesson(lesson.lessonNo); trialRecord(off.reward.total); setResult(off); return;
    }
    if (r.data.offline) { setOffline(true); if (r.ok && r.data.ok) { recordLocalLesson(lesson.lessonNo); trialRecord(r.data.reward.total); } }
    setResult(r.ok ? r.data : { ...r.data, ok: false, reasonJa: r.data.reasonJa || r.error || "もう一回ためしてね。" });
  };

  if (result) {
    const isLast = lesson.lessonNo >= TOTAL_LESSONS;
    const gate = /^(mini|boss)-/.test(result.nextTest ?? "") ? result.nextTest ?? "" : "";
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
        {result.ok && (result.reward?.coins ?? []).length > 1 && (
          <ul className="mt-1 text-sm font-bold text-[var(--ink-2)]">{result.reward.coins.map((c, i) => <li key={i}>{c.labelJa} +{c.amount}</li>)}</ul>
        )}
        {result.ok && isLast && <p className="font-title mt-3 text-3xl text-[var(--coin)]">🎉 ぜんぶクリア！ 🎉</p>}
        {result.ok && isLast && <p className="mt-1 text-[var(--ink-2)]">{TOTAL_LESSONS}こ ぜんぶの レッスンを クリアしたよ！ ほんとうに すごい！</p>}
        {result.ok && !isLast && <p className="mt-3 text-[var(--ink-2)]">このまま つぎのレッスンに すすめるよ！<br />あしたは「復習クエスト」から はじめよう。いちばん コインが もらえるよ 🪙</p>}
        {result.ok && (gate
          ? <Link href={`/test/${encodeURIComponent(gate)}`} className="btn btn-coin mt-4 block">{gate.startsWith("boss-") ? (isLast ? "さいごの ボスに いどむ！" : "ボスに いどむ！") : "まとめテストへ"}</Link>
          : !isLast && <Link href={`/lesson/${lesson.lessonNo + 1}`} className="btn btn-coin mt-4 block">つぎのレッスンへ</Link>)}
        {result.ok && <Link href={`/recap/${lesson.lessonNo}`} className="btn btn-primary mt-3 block">🎬 きょうのまとめを見る（2ぷん・おまけ）</Link>}
        {offline && <div className="mt-3"><OfflineNote show note="今回のきろくとコインは保存されないよ" /></div>}
        {!result.ok && <button className="btn btn-coin mt-4" onClick={() => { setResult(null); setStep(Math.max(0, steps.findIndex((s) => s.kind === "quiz"))); }}>クイズをもう一回</button>}
        <Link href="/map" className="btn btn-primary mt-4 block">マップへもどる</Link>
      </div>
    );
  }

  const s = steps[step];
  if (!s) return <p className="rpg-title p-8 text-center text-xl">きろくしています…</p>;
  return (
    <div className="space-y-4">
      <OfflineNote show={offline} />
      {s.kind === "teacher_video" && <HeroScene title={`Lesson ${lesson.lessonNo}`} subtitle={`${lesson.title}｜${lesson.titleJa}`} variant="lesson" />}
      <header className="rpg-wood p-3">
        <p className="font-title text-xs text-[var(--volt)]">Lesson {lesson.lessonNo} ・ {worldName(lesson.world)}{lesson.stage ? ` ・ ステージ${lesson.stage}${lesson.level ? `（${lesson.level}）` : ""}` : ""} ・ {lesson.school.grade}「{lesson.school.topic}」</p>
        <h1 className="text-xl font-black">{lesson.title} <span className="text-base text-[var(--on-dark-2)]">{lesson.titleJa}</span></h1>
        <ol className="mt-3 flex gap-1" aria-label="レッスンの進み具合">
          {steps.map((x, i) => (
            <li key={i} className={`flex-1 rounded-md border-2 py-1 text-center text-[10px] font-black ${i < step ? "border-[#0b5e37] bg-[radial-gradient(120%_90%_at_50%_0%,#8dffcb,#2fd08a_45%,#0f7a48)] text-white" : i === step ? "border-[#7a4e0c] bg-[radial-gradient(120%_90%_at_50%_0%,#fff8cf,#f2c14e_45%,#b07a1c)] text-[#2a1a03] shadow-[0_0_12px_rgba(242,193,78,.5)]" : "border-[#7a4e0c]/60 bg-black/40 text-[var(--on-dark-2)]"}`}>{STEP_LABEL[x.kind]}</li>
          ))}
        </ol>
      </header>

      {s.kind === "teacher_video" && <TeacherVideo lesson={lesson} partner={steps.find((x) => x.kind === "conversation")?.character} videoUrl={s.videoUrl} teacherName={teacher.nameJa} onDone={next} />}
      {s.kind === "flashcards" && <Flashcards items={byIds(s.itemIds)} onDone={next} />}
      {s.kind === "tpr" && <TprDrill items={byIds(s.itemIds)} actions={Object.fromEntries(lesson.tpr.map((t) => [t.en, t.action]))} onDone={next} />}
      {s.kind === "phonics" && <Phonics focus={s.focus} words={s.words} tipJa={s.tipJa} examples={s.examples} onDone={next} />}
      {s.kind === "school_expressions" && <SchoolExpressions items={byIds(s.itemIds)} testPoints={s.testPoints} onDone={next} />}
      {s.kind === "pronunciation" && <Pronunciation items={byIds(s.itemIds)} onDone={next} />}
      {s.kind === "quiz" && <QuizRun title="✅ かくにんクイズ" questions={s.questions} onDone={(l, score) => { setQuizScore(score); next(l); }} />}
      {s.kind === "speed_listening" && <SpeedListening rounds={s.rounds} onDone={(l, best) => {
        // さいごの「かいわ」ステップがあれば そこへ。なければ ここで完了
        if (steps[step + 1]?.kind === "conversation") { setSpeedBest(best); next(l); } else void finish(l, best);
      }} />}
      {s.kind === "conversation" && <ConversationStep lessonNo={lesson.lessonNo} conversation={lesson.conversation} character={s.character} maxTurns={s.maxTurns} items={items} onDone={(l, finished) => void finish(l, speedBest, finished)} />}
    </div>
  );
}
