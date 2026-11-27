"use client";
/**
 * としょかんの おはなしの 画面（/library/story/[id] が データを 読んだ あとに 描く）:
 * よむ（読み聞かせ＋ことばの ハイライト）→ 3問クイズ → けっか（1日1回 スタンプ＋コイン）。
 * run10 P3: ページから 分けた（npm run check:render が 100 の おはなし ぜんぶを サーバーで 描いて たしかめる）。
 */
import { useState } from "react";
import Link from "next/link";
import { ReadAlongText, useReadAloud } from "@/components/library/ReadAlong";
import { StoryQuiz } from "@/components/library/StoryQuiz";
import { OfflineNote } from "@/components/common/OfflineNote";
import { ReportEnglishButton } from "@/components/common/ReportEnglishButton";
import { StandingFigure } from "@/components/characters/StandingArt";
import { finishActivity, type FinishResult, type LibraryState } from "@/lib/library/client";
import { gradeStory, isUnlocked, type StoryGrade } from "@/lib/library/rules";
import type { Story } from "@/lib/library/types";

export type StoryPhase = "read" | "quiz" | "result";

/** initial: はじめの 状態（npm run check:render が とちゅう・けっかの 画面を サーバーで 描くため。ふだんは わたさない） */
export interface StoryViewInitial {
  phase?: StoryPhase;
  showJa?: boolean;
  slow?: boolean;
  grade?: StoryGrade;
  result?: FinishResult;
  quiz?: { idx?: number; answers?: number[] };
}

export function StoryView({ story, state, initial }: { story: Story; state: LibraryState; initial?: StoryViewInitial }) {
  const [phase, setPhase] = useState<StoryPhase>(initial?.phase ?? "read");
  const [slow, setSlow] = useState(initial?.slow ?? false);
  const [showJa, setShowJa] = useState<boolean | null>(initial?.showJa ?? null);
  const [grade, setGrade] = useState<StoryGrade | null>(initial?.grade ?? null);
  const [result, setResult] = useState<FinishResult | null>(initial?.result ?? null);
  const [round, setRound] = useState(0);
  const reader = useReadAloud(story.lines, slow ? 0.75 : 1);

  if (!isUnlocked(story, state.reachedLesson)) {
    return (
      <div className="card p-6 text-center">
        <p className="text-4xl" aria-hidden>🔒</p>
        <p className="font-black">この おはなしは Lesson {story.unlockLesson} を クリアすると ひらくよ。</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }

  // 日本語訳: ステージ1 は さいしょから 見せる、ステージ2 は かくす（タップで 見られる）
  const ja = showJa ?? story.stage <= 1;

  const onQuizDone = async (answers: number[]) => {
    const g = gradeStory(story, answers);
    setGrade(g);
    setPhase("result");
    setResult(await finishActivity({ kind: "story", id: story.id, answers }, story, state.offline));
  };

  const again = () => {
    reader.stop();
    setGrade(null);
    setResult(null);
    setRound((r) => r + 1);
    setPhase("read");
  };

  return (
    <div className="space-y-4">
      <OfflineNote show={state.offline} note="コインは きろくされないよ" />
      <div className="flex items-center justify-between">
        <Link href="/library" className="text-sm font-bold text-[var(--on-dark-2)] underline" onClick={() => reader.stop()}>◀ としょかん</Link>
        <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold text-[var(--on-dark-2)]">ステージ{story.stage}・{story.level}</span>
      </div>

      <header className="card rpg-rivets p-4 text-center">
        <p className="text-5xl" aria-hidden>{story.emoji}</p>
        <h1 lang="en" className="font-title text-2xl">{story.title}</h1>
        <p className="text-sm text-[var(--ink-2)]">{story.titleJa}</p>
      </header>

      {phase === "read" && (
        <>
          <div className="card sticky top-2 z-10 grid grid-cols-2 gap-2 p-3">
            {reader.playing
              ? <button className="btn btn-berry col-span-2 whitespace-nowrap" onClick={reader.stop}>⏸ とめる</button>
              : <button className="btn btn-coin col-span-2 whitespace-nowrap" onClick={() => void reader.play(0)}>▶ よみきかせ</button>}
            <button className="btn btn-ghost whitespace-nowrap px-2 text-sm" onClick={() => { reader.stop(); setSlow((s) => !s); }} aria-pressed={slow}>{slow ? "🐢 ゆっくり" : "🐇 ふつう"}</button>
            <button className="btn btn-ghost whitespace-nowrap px-2 text-sm" onClick={() => setShowJa(!ja)} aria-pressed={ja}>{ja ? "あ やくを かくす" : "あ やくを みる"}</button>
          </div>
          <p className="text-center text-xs font-bold text-[var(--on-dark-2)]">ぶんを タップすると その ぶんを、ことばを タップすると その ことばを よむよ</p>

          <div key={round} className="card p-3">
            <ReadAlongText lines={story.lines} reader={reader} showJa={ja} />
            <div className="mt-2 text-right">
              {/* さいごに よんだ（タップした）文を いっしょに 送る */}
              <ReportEnglishButton page="library" segmentId={`story:${story.id}:${reader.lineIdx >= 0 ? reader.lineIdx : "all"}`} text={story.lines[reader.lineIdx]?.en} />
            </div>
          </div>

          {story.words.length > 0 && (
            <div className="card p-4">
              <p className="font-black">📝 あたらしい ことば</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {story.words.map((w) => (
                  <li key={w.en}>
                    <button className="btn bg-[var(--surface)] px-3 py-1 text-sm" onClick={() => reader.sayWord(w.en.split(" / ")[0])}>
                      <span lang="en" className="font-black">{w.en}</span>　{w.ja}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-primary w-full" onClick={() => { reader.stop(); setPhase("quiz"); }}>クイズに こたえる（3もん）▶</button>
        </>
      )}

      {phase === "quiz" && <StoryQuiz key={round} questions={story.questions} onDone={(a) => void onQuizDone(a)} initial={round === 0 ? initial?.quiz : undefined} />}

      {phase === "result" && grade && (
        <div className="card p-6 text-center">
          <div className="flex justify-center"><StandingFigure id="kiko" pose={grade.passed ? "cheer" : "idle"} height={140} /></div>
          <p className="mt-2 text-3xl" aria-label={`${grade.correct}もん せいかい`}>{"⭐".repeat(grade.correct)}{"☆".repeat(grade.total - grade.correct)}</p>
          <p className="text-xl font-black">{grade.correct} / {grade.total} もん せいかい！</p>
          <p className="mt-2 font-bold">{result ? result.messageJa : "きろくしているよ…"}</p>
          <div className="mt-4 grid gap-2">
            <button className="btn btn-ghost w-full" onClick={again}>🔁 もういちど よむ</button>
            <Link href="/library" className="btn btn-primary w-full">としょかんへ もどる</Link>
          </div>
        </div>
      )}
    </div>
  );
}
