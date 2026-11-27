"use client";
/**
 * としょかんの おはなし: よむ（読み聞かせ＋ことばの ハイライト）→ 3問クイズ → けっか（1日1回 スタンプ＋コイン）。
 * 本文は ステージごとの JSON を この 画面で あとから 読む。おためしモードでも 動く。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReadAlongText, useReadAloud } from "@/components/library/ReadAlong";
import { StoryQuiz } from "@/components/library/StoryQuiz";
import { OfflineNote } from "@/components/common/OfflineNote";
import { ReportEnglishButton } from "@/components/common/ReportEnglishButton";
import { StandingFigure } from "@/components/characters/StandingArt";
import { loadStory } from "@/lib/library/catalog";
import { finishActivity, loadLibraryState, type FinishResult, type LibraryState } from "@/lib/library/client";
import { gradeStory, isUnlocked, type StoryGrade } from "@/lib/library/rules";
import type { Story } from "@/lib/library/types";

type Phase = "read" | "quiz" | "result";

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [story, setStory] = useState<Story | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState | null>(null);
  const [phase, setPhase] = useState<Phase>("read");
  const [slow, setSlow] = useState(false);
  const [showJa, setShowJa] = useState<boolean | null>(null);
  const [grade, setGrade] = useState<StoryGrade | null>(null);
  const [result, setResult] = useState<FinishResult | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let alive = true;
    void Promise.all([loadStory(id), loadLibraryState()]).then(([s, st]) => {
      if (!alive) return;
      setStory(s);
      setState(st);
    });
    return () => { alive = false; };
  }, [id]);

  const lines = story?.lines ?? [];
  const reader = useReadAloud(lines, slow ? 0.75 : 1);

  if (story === undefined || !state) return <p className="rpg-title p-8 text-center text-xl">おはなしを よみこみちゅう…</p>;
  if (!story) {
    return (
      <div className="card p-6 text-center">
        <p className="font-black">その おはなしは みつからないよ。</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }
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

      {phase === "quiz" && <StoryQuiz key={round} questions={story.questions} onDone={(a) => void onQuizDone(a)} />}

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
