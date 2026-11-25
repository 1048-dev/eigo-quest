"use client";
/**
 * おはなしの あとの 3問クイズ。1問ずつ、えらぶと すぐ ⭕ / ❌ と 正解を 見せる。しつもんは 🔊 で 読み上げ できる。
 */
import { useState } from "react";
import { speak } from "@/lib/speech/tts";
import type { StoryQuestion } from "@/lib/library/types";

export function StoryQuiz({ questions, onDone }: { questions: StoryQuestion[]; onDone: (answers: number[]) => void }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const picked = answers[idx];
  const q = questions[idx];
  if (!q) return null;
  const answered = picked !== undefined;

  const pick = (i: number) => {
    if (answered) return;
    const next = [...answers];
    next[idx] = i;
    setAnswers(next);
    void speak(q.choices[i], 0.95);
  };

  const next = () => {
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else onDone(answers);
  };

  return (
    <div className="card p-5">
      <p className="text-sm font-bold text-[var(--ink-2)]">クイズ {idx + 1} / {questions.length}</p>
      <button className="mt-2 block w-full rounded-xl bg-[var(--surface)] p-3 text-left" onClick={() => void speak(q.q, 0.9)} aria-label={`${q.q}（もういちど きく）`}>
        <span lang="en" className="block text-xl font-black">{q.q} <span aria-hidden className="text-base">🔊</span></span>
        <span className="block text-sm text-[var(--ink-2)]">{q.qJa}</span>
      </button>
      <div className="mt-4 grid gap-2">
        {q.choices.map((c, i) => {
          const isAnswer = i === q.answer;
          const style = !answered ? "" : isAnswer ? "bg-[#2fd08a] text-white" : picked === i ? "bg-[#e05656] text-white" : "opacity-60";
          return (
            <button key={c} lang="en" className={`btn w-full justify-start text-left text-lg ${style}`} onClick={() => pick(i)} disabled={answered && !isAnswer && picked !== i}>
              {answered && isAnswer ? "⭕ " : answered && picked === i ? "❌ " : ""}{c}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-4 text-center">
          <p className="text-lg font-black">{picked === q.answer ? "せいかい！ 🎉" : "おしい！ こたえは みどりの ほうだよ。"}</p>
          <button className="btn btn-primary mt-3 w-full" onClick={next}>{idx + 1 < questions.length ? "つぎへ ▶" : "けっかを みる ▶"}</button>
        </div>
      )}
    </div>
  );
}
