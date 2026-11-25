"use client";
/**
 * 力だめしの「話す」: AI の キャラクターが しつもんを 読み上げ → 子どもが マイクで こたえる（使えない ときは 入力）。
 * 採点は さいごに まとめて（サーバーで AI、つながらない ときは ルール）。ここでは こたえを あつめるだけ。
 */
import { useEffect, useRef, useState } from "react";
import { StandingFigure } from "@/components/characters/StandingArt";
import { isSpeechRecognitionSupported, listenOnce, type Listening } from "@/lib/speech/recognition";
import { speak } from "@/lib/speech/tts";
import type { SpeakingPrompt, YearlyTest } from "@/lib/yearly/types";

export function SpeakingTask({ prompt, character, stage, value, onChange }: {
  prompt: SpeakingPrompt;
  character: YearlyTest["character"];
  stage: number;
  value: string;
  onChange: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [showJa, setShowJa] = useState(stage <= 2);
  const [supported, setSupported] = useState(false);
  const rec = useRef<Listening | null>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
    void speak(prompt.askEn, stage <= 2 ? 0.85 : 0.95);
    return () => { rec.current?.stop(); window.speechSynthesis?.cancel(); };
  }, [prompt.id, prompt.askEn, stage]);

  const talk = async () => {
    if (listening) { rec.current?.stop(); return; }
    window.speechSynthesis?.cancel();
    setListening(true);
    const long = prompt.kind === "readAloud" || prompt.minWords >= 15;
    rec.current = listenOnce(long ? 30_000 : 15_000);
    const text = await rec.current.result;
    setListening(false);
    if (text) onChange(value.trim() ? `${value.trim()} ${text}` : text);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <StandingFigure id={character} pose={listening ? "idle" : "point"} height={110} />
        <button className="relative flex-1 rounded-2xl bg-[var(--surface)] p-3 text-left" onClick={() => void speak(prompt.askEn, 0.9)} aria-label={`${prompt.askEn}（もういちど きく）`}>
          <span lang="en" className="block text-lg font-black leading-snug">{prompt.askEn} <span aria-hidden className="text-base">🔊</span></span>
          {showJa && <span className="mt-1 block text-sm text-[var(--ink-2)]">{prompt.askJa}</span>}
        </button>
      </div>
      {!showJa && <button className="text-xs font-bold text-[var(--ink-2)] underline" onClick={() => setShowJa(true)}>あ 日本語の ヒントを みる</button>}

      {prompt.picture && (
        <div className="rounded-2xl bg-[var(--surface)] p-4 text-center text-5xl leading-snug tracking-widest" role="img" aria-label={prompt.picture.descriptionEn}>
          {prompt.picture.emoji}
        </div>
      )}
      {prompt.readText && (
        <p lang="en" className="rounded-2xl border border-[var(--gold)]/40 bg-black/25 p-3 text-lg leading-relaxed">{prompt.readText}</p>
      )}

      {supported && (
        <button className={`btn w-full ${listening ? "btn-berry" : "btn-coin"}`} onClick={() => void talk()}>
          {listening ? "⏹ おわったら タップ" : value ? "🎤 つづけて 話す" : "🎤 タップして 話す"}
        </button>
      )}
      <label className="block">
        <span className="text-xs font-bold text-[var(--ink-2)]">{supported ? "きこえた ことば（なおしても いいよ）" : "マイクが つかえないので、英語で 入力してね"}</span>
        <textarea
          lang="en"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 400))}
          rows={prompt.minWords >= 15 ? 4 : 2}
          className="mt-1 w-full rounded-xl border border-[var(--gold)]/40 bg-black/30 p-2 text-base"
          placeholder={supported ? "🎤 で 話すと ここに 出るよ" : "I like ..."}
        />
      </label>
    </div>
  );
}
