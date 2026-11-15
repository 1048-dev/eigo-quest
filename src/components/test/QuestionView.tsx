"use client";
/**
 * 1問の表示（選択式 / 反射クイズ / スペル入力 / 発音）。レッスン内クイズ・テスト・アリーナで共通。
 */
import { useEffect, useRef, useState } from "react";
import type { PublicQuestion } from "@/lib/curriculum/questions";
import { playItemAudio } from "@/lib/speech/tts";
import { BrowserPronunciationScorer, type PronunciationResult } from "@/lib/speech/pronunciation";

export interface AnswerEvent {
  value: string;
  responseMs: number;
  /** 発音問題のときのみ */
  pronunciation?: PronunciationResult;
}

export function QuestionView({ q, onAnswer, disabled }: { q: PublicQuestion; onAnswer: (a: AnswerEvent) => void; disabled?: boolean }) {
  const shownAt = useRef(performance.now());
  const [text, setText] = useState("");
  const [left, setLeft] = useState(q.timeLimitMs ?? 0);
  const elapsed = () => Math.round(performance.now() - shownAt.current);

  // 出題時に自動で音声を再生（スピードリスニングは playbackRate 付き）
  useEffect(() => {
    shownAt.current = performance.now();
    setText("");
    if (q.audioText && q.type !== "speak") playItemAudio(q.audioKey, q.audioText, q.playbackRate ?? 1).then(() => (shownAt.current = performance.now()));
  }, [q]);

  // 反射クイズのタイマー（時間切れ＝不正解）
  useEffect(() => {
    if (!q.timeLimitMs || disabled) return;
    setLeft(q.timeLimitMs);
    const t0 = performance.now();
    const id = setInterval(() => {
      const rest = q.timeLimitMs! - (performance.now() - t0);
      setLeft(rest);
      if (rest <= 0) {
        clearInterval(id);
        onAnswer({ value: "__timeout__", responseMs: q.timeLimitMs! });
      }
    }, 100);
    return () => clearInterval(id);
  }, [q, disabled, onAnswer]);

  return (
    <div className="card p-5">
      <p className="text-center font-bold text-[var(--ink-2)]">{q.promptJa}</p>
      {q.playbackRate && <p className="mt-1 text-center text-xs font-black text-[var(--accent)]">⚡ {q.playbackRate}ばいそく</p>}
      {q.timeLimitMs ? (
        <div className="mx-auto mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--locked)]">
          <div className="h-full bg-[var(--coin)] transition-[width]" style={{ width: `${Math.max(0, (left / q.timeLimitMs) * 100)}%` }} />
        </div>
      ) : null}

      {q.display && <p className="my-4 text-center text-5xl font-black">{q.display}</p>}
      {q.audioText && q.type !== "speak" && (
        <div className="text-center">
          <button className="btn bg-[var(--surface)]" onClick={() => playItemAudio(q.audioKey, q.audioText!, q.playbackRate ?? 1)} aria-label="もういちど きく">🔊 もういちど</button>
        </div>
      )}

      {q.choices && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {q.choices.map((c) => (
            <button key={c.id} disabled={disabled} onClick={() => onAnswer({ value: c.id, responseMs: elapsed() })}
              className="card min-h-20 border-2 border-transparent p-3 text-2xl font-black hover:border-[var(--accent)] disabled:opacity-60">
              {c.label}
            </button>
          ))}
        </div>
      )}

      {q.type === "spell" && (
        <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); onAnswer({ value: text, responseMs: elapsed() }); }}>
          {/* 英語4線風の入力欄 */}
          <input value={text} onChange={(e) => setText(e.target.value)} disabled={disabled} autoCapitalize="off" autoCorrect="off" spellCheck={false}
            className="rounded-xl border-y-4 border-double border-[var(--ink-2)]/40 bg-[var(--bg)] px-4 py-3 text-center text-3xl tracking-wider" aria-label="えいごで かいてね" />
          <button className="btn btn-primary" disabled={disabled || !text.trim()}>こたえる</button>
        </form>
      )}

      {q.type === "speak" && <SpeakButton target={q.display ?? q.audioText ?? ""} itemId={q.audioKey} disabled={disabled} onDone={(r) => onAnswer({ value: String(r.score), responseMs: elapsed(), pronunciation: r })} />}
    </div>
  );
}

export function SpeakButton({ target, itemId, onDone, disabled }: { target: string; itemId: string; onDone: (r: PronunciationResult) => void; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "listening" | "unsupported">("idle");
  const [last, setLast] = useState<PronunciationResult | null>(null);

  const start = async () => {
    if (!BrowserPronunciationScorer.isSupported()) return setState("unsupported");
    setState("listening");
    try {
      const r = await new BrowserPronunciationScorer().assess(target);
      setLast(r);
      onDone(r);
    } finally {
      setState("idle");
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <button className="btn bg-[var(--surface)]" onClick={() => playItemAudio(itemId, target)}>🔊 おてほん</button>
        <button className="btn btn-primary" onClick={start} disabled={disabled || state === "listening"}>{state === "listening" ? "🎙️ きいてるよ…" : "🎤 いってみる"}</button>
      </div>
      {state === "unsupported" && <p className="text-sm text-[var(--ng)]">このブラウザはマイク判定に対応していません（Chrome / Safari 推奨）</p>}
      {last && (
        <div className="text-center">
          <p className="text-3xl">{"⭐".repeat(last.stars)}{"☆".repeat(3 - last.stars)}</p>
          <p className="text-sm">
            {last.wordResults.map((w) => <span key={w.word} className={`mx-1 font-bold ${w.ok ? "text-[var(--ok)]" : "text-[var(--ng)] underline"}`}>{w.word}</span>)}
          </p>
          <p className="text-xs text-[var(--ink-2)]">きこえたことば: “{last.transcript || "…"}”</p>
        </div>
      )}
    </div>
  );
}
