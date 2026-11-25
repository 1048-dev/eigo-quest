"use client";
/**
 * 力だめしの「書く」: ステージ1 は 絵を みて ことばを 3 つ、ステージ2 以上は 文・メールの 返事・意見文。
 */
import { englishWords } from "@/lib/yearly/scoring";
import type { WritingTask } from "@/lib/yearly/types";

export function WritingTaskView({ task, text, words, onText, onWords }: {
  task: WritingTask;
  text: string;
  words: string[];
  onText: (t: string) => void;
  onWords: (w: string[]) => void;
}) {
  const count = englishWords(text).length;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[var(--surface)] p-3">
        <p lang="en" className="font-black leading-snug">{task.promptEn}</p>
        <p className="mt-1 text-sm text-[var(--ink-2)]">{task.promptJa}</p>
      </div>

      {task.email && (
        <article lang="en" className="rounded-xl border border-[var(--gold)]/40 bg-black/25 p-3 text-sm leading-relaxed" aria-label="メール">
          {task.email.map((l, i) => <p key={i}>{l}</p>)}
        </article>
      )}

      {task.kind === "words" ? (
        <div className="grid gap-2">
          {(task.items ?? []).map((it, i) => (
            <label key={i} className="flex items-center gap-3 rounded-xl bg-black/25 p-2">
              <span className="text-4xl" aria-hidden>{it.emoji}</span>
              <span className="flex-1">
                <span className="block text-xs text-[var(--ink-2)]">{it.hintJa}</span>
                <input
                  lang="en"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={words[i] ?? ""}
                  onChange={(e) => { const next = [...words]; next[i] = e.target.value.slice(0, 20); onWords(next); }}
                  className="mt-1 w-full rounded-lg border border-[var(--gold)]/40 bg-black/30 p-2 text-xl font-black tracking-wider"
                  aria-label={`${i + 1}つめの ことば`}
                />
              </span>
            </label>
          ))}
        </div>
      ) : (
        <label className="block">
          <textarea
            lang="en"
            value={text}
            onChange={(e) => onText(e.target.value.slice(0, 1200))}
            rows={task.kind === "opinion" ? 8 : 5}
            spellCheck={false}
            className="w-full rounded-xl border border-[var(--gold)]/40 bg-black/30 p-2 text-base leading-relaxed"
            aria-label="英語で 書こう"
          />
          <span className="mt-1 block text-right text-xs font-bold text-[var(--ink-2)] tabular-nums">
            {count} 語{task.minWords ? `（めやす ${task.minWords}〜${task.maxWords} 語）` : ""}
          </span>
        </label>
      )}
    </div>
  );
}
