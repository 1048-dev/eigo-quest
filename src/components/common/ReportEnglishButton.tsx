"use client";
/**
 * 「この英語、へん？」ボタン（run9 Phase 1）。レッスンの ステップ・先生の 字幕・としょかんに おく。
 * おすと ひとこと（かかなくても OK）を 書く 小さな まどが ひらき、「おくる」で 報告する。
 * オフラインでも この 端末に のこして あとで 送る（src/lib/englishReport/client.ts）。
 */
import { useEffect, useState } from "react";
import { reportEnglish, startEnglishReportRetry, type ReportInput } from "@/lib/englishReport/client";

type Phase = "idle" | "open" | "sending" | "done";

export function ReportEnglishButton({ page, lessonNo, segmentId, text, tone = "light", className = "" }: ReportInput & { tone?: "light" | "dark"; className?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [comment, setComment] = useState("");
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    startEnglishReportRetry();
  }, []);
  // べつの ところ（字幕が かわった など）に うつったら とじる
  useEffect(() => {
    setPhase("idle");
    setComment("");
  }, [segmentId]);

  const ink = tone === "dark" ? "text-white/70 hover:text-white" : "text-[var(--ink-2)] hover:text-[var(--ink)]";

  if (phase === "idle") {
    return (
      <button type="button" className={`text-xs font-bold underline decoration-dotted underline-offset-2 ${ink} ${className}`} onClick={() => setPhase("open")} data-testid="report-english">
        🤔 この英語、へん？
      </button>
    );
  }
  if (phase === "done") {
    return (
      <p className={`text-xs font-bold ${tone === "dark" ? "text-[#ffe9b0]" : "text-[var(--ink-2)]"} ${className}`} role="status" data-testid="report-english-done">
        {queued ? "ありがとう！ つながったら おくるね。" : "ありがとう！ せんせいが しらべるね。"}
      </p>
    );
  }

  const send = async () => {
    setPhase("sending");
    const out = await reportEnglish({ page, lessonNo, segmentId, text, comment });
    setQueued(out !== "sent");
    setPhase("done");
  };

  return (
    <div className={`rounded-xl border-2 border-[var(--ink-2)]/30 bg-white p-2 text-left text-[var(--ink)] ${className}`} data-testid="report-english-form">
      <p className="text-xs font-black">この英語、へん？</p>
      {text && <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-2)]" lang="en">「{text}」</p>}
      <label className="mt-1 block text-[11px] text-[var(--ink-2)]">
        どこが へんかな？（かかなくても OK）
        <textarea
          className="mt-0.5 w-full rounded-lg border border-[var(--ink-2)]/40 p-1.5 text-sm"
          rows={2}
          maxLength={200}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          data-testid="report-english-comment"
        />
      </label>
      <div className="mt-1 flex justify-end gap-2">
        <button type="button" className="rounded-lg border border-[var(--ink-2)]/40 px-3 py-1 text-xs font-bold" onClick={() => setPhase("idle")} disabled={phase === "sending"}>やめる</button>
        <button type="button" className="rounded-lg bg-[#2f7de1] px-3 py-1 text-xs font-black text-white disabled:opacity-60" onClick={() => void send()} disabled={phase === "sending"} data-testid="report-english-send">
          {phase === "sending" ? "おくっています…" : "おくる"}
        </button>
      </div>
    </div>
  );
}
