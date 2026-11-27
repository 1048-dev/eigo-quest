"use client";
/**
 * 「きょうのまとめ」プレイヤー。動画ファイルは使わず、台本（buildRecapScript）を順番に再生する。
 *  - 英語は speechSynthesis（en-US・実効 rate 0.9）で読み上げ →「いってみよう！」で約2.5秒まつ → つぎへ
 *  - 音が出ない環境（speechSynthesis なし・おとなしモード）でも、見積もり時間で文字だけ進む
 *  - 一時停止 / さいせい / さいしょから。最後まで見たら POST /api/recap/:n/watched（1日1回 5コイン）
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StandingFigure } from "@/components/characters/StandingArt";
import { Portrait } from "@/components/characters/CharacterArt";
import type { Pose } from "@/components/characters/StandingArt";
import type { CharacterId } from "@/lib/game/characters";
import { apiPost } from "@/lib/api/client";
import { RecapWatchedResponseSchema, type RecapWatchedResponse } from "@/lib/api/contracts";
import { focusLabel } from "@/lib/curriculum/phonicsButtons";
import { recapProgress, RECAP_TIMING, type RecapScript, type RecapSegment } from "@/lib/recap/script";
import { speak } from "@/lib/speech/tts";

export type RecapPhase = "speak" | "repeat" | "gap";
type Phase = RecapPhase;

/** はじめの 状態（npm run check:render が とちゅう・おわりの 画面を サーバーで 描くため。ふだんは わたさない） */
export interface RecapInitial {
  index?: number;
  phase?: RecapPhase;
  playing?: boolean;
  finished?: boolean;
  muted?: boolean;
  soundSupported?: boolean;
  reward?: RecapWatchedResponse;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));
/** onend が来ないブラウザがあるので、読み上げには上限時間をつける */
const withTimeout = (p: Promise<void>, ms: number) => Promise.race([p, sleep(ms)]);

const SPEAKER_ID: Record<string, CharacterId> = { haru: "haru", riko: "riko", kiko: "kiko", birimo: "birimo" };
const speakerId = (name?: string): CharacterId | undefined => (name ? SPEAKER_ID[name.toLowerCase()] : undefined);

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function haruPose(s: RecapSegment): Pose {
  if (s.section === "outro") return "cheer";
  if (s.section === "intro") return "wave";
  return s.en ? "point" : "idle";
}

export function RecapPlayer({ script, offline = false, initial }: { script: RecapScript; offline?: boolean; initial?: RecapInitial }) {
  const segs = script.segments;
  const [index, setIndex] = useState(initial?.index ?? 0);
  const [phase, setPhase] = useState<Phase>(initial?.phase ?? "speak");
  const [playing, setPlaying] = useState(initial?.playing ?? false);
  const [finished, setFinished] = useState(initial?.finished ?? false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [soundSupported, setSoundSupported] = useState(initial?.soundSupported ?? true);
  const [muted, setMuted] = useState(initial?.muted ?? false);
  const [reward, setReward] = useState<RecapWatchedResponse | null>(initial?.reward ?? null);

  const runRef = useRef(0);
  const indexRef = useRef(0);
  const segStartRef = useRef(0);
  const phaseStartRef = useRef(0);
  const mutedRef = useRef(false);
  const soundRef = useRef(true);
  const reportedRef = useRef(false);

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const reportWatched = useCallback(async () => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    const r = await apiPost(`/api/recap/${script.lessonNo}/watched`, RecapWatchedResponseSchema, {});
    // 通信に失敗しても「見たね！」は出す（まとめはおまけ・ゲートではない）
    setReward(r.data);
  }, [script.lessonNo]);

  const run = useCallback(async (from: number) => {
    const token = ++runRef.current;
    const alive = () => runRef.current === token;
    setPlaying(true);
    setFinished(false);
    for (let i = from; i < segs.length; i++) {
      if (!alive()) return;
      const s = segs[i];
      indexRef.current = i;
      segStartRef.current = phaseStartRef.current = performance.now();
      setIndex(i);
      setPhase("speak");
      setElapsed(0);
      setPhaseElapsed(0);

      const useVoice = !!s.en && soundRef.current && !mutedRef.current;
      if (useVoice) {
        // tts.ts の speak は rate×0.9 → 実効 0.9（RECAP_TIMING.speechRate）
        await withTimeout(speak(s.en!, RECAP_TIMING.speechRate / 0.9, "en-US"), Math.max(4000, s.speakMs * 2.5));
        if (!alive()) return;
        // トークつきの行は、日本語を読む時間を少しだけ確保
        if (!s.repeat) await sleep(s.speakMs - (performance.now() - segStartRef.current));
      } else {
        await sleep(s.speakMs);
      }
      if (!alive()) return;

      phaseStartRef.current = performance.now();
      setPhaseElapsed(0);
      setPhase(s.repeat ? "repeat" : "gap");
      await sleep(s.pauseMs);
    }
    if (!alive()) return;
    setPlaying(false);
    setFinished(true);
    void reportWatched();
  }, [segs, reportWatched]);

  const pause = () => {
    runRef.current++;
    stopSpeech();
    setPlaying(false);
  };
  const resume = () => void run(indexRef.current);
  const replay = () => {
    runRef.current++;
    stopSpeech();
    void run(0);
  };
  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (mutedRef.current) stopSpeech();
  };

  // 自動再生（声のリストの読みこみを少しまつ）。ページを離れたら止める
  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
    soundRef.current = ok;
    setSoundSupported(ok);
    if (ok) window.speechSynthesis.getVoices();
    const t = setTimeout(() => void run(0), 700);
    return () => {
      clearTimeout(t);
      runRef.current++;
      stopSpeech();
    };
  }, [run]);

  // 進み具合の表示用タイマー
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const now = performance.now();
      setElapsed(now - segStartRef.current);
      setPhaseElapsed(now - phaseStartRef.current);
    }, 150);
    return () => clearInterval(id);
  }, [playing]);

  const seg = segs[Math.min(index, segs.length - 1)];
  if (!seg) return <p className="card p-6 text-center font-bold">まとめを つくれなかったよ。</p>;

  const progress = finished ? 1 : recapProgress(script, index, elapsed);
  const chapterNow = [...script.chapters].reverse().find((c) => c.index <= index);
  const activeHost = seg.host;
  const sid = speakerId(seg.speaker);
  const repeatLeft = phase === "repeat" ? Math.max(0, 1 - phaseElapsed / seg.pauseMs) : 0;

  return (
    <div className="space-y-4">
      <header className="rpg-wood p-3">
        <p className="font-title text-xs text-[var(--volt)]">🎬 きょうの まとめ ・ Lesson {script.lessonNo}</p>
        <h1 className="text-xl font-black">{script.title} <span className="text-base text-[var(--on-dark-2)]">{script.titleJa}</span></h1>
        <ol className="mt-3 flex gap-1" aria-label="まとめの進み具合">
          {script.chapters.map((c) => {
            const done = finished || (chapterNow && c.index < chapterNow.index);
            const now = !finished && chapterNow?.index === c.index;
            return (
              <li key={c.index} className={`flex-1 rounded-md border-2 py-1 text-center text-[10px] font-black ${done ? "border-[#0b5e37] bg-[#2fd08a] text-white" : now ? "border-[#7a4e0c] bg-[#f2c14e] text-[#2a1a03]" : "border-[#7a4e0c]/60 bg-black/40 text-[var(--on-dark-2)]"}`}>{c.labelJa}</li>
            );
          })}
        </ol>
      </header>

      {/* ステージ */}
      <section className="card relative overflow-hidden p-0" aria-live="polite">
        <div className="relative min-h-[360px] bg-[radial-gradient(120%_90%_at_50%_10%,#f2c46a_0%,#1d4a52_55%,#0b1f2e_100%)] px-3 pb-4 pt-3">
          {/* ホストのふきだし */}
          <div className={`mx-auto max-w-md rounded-2xl border-2 border-[#7a4e0c] bg-[#fff8e6] px-4 py-2 text-center text-base font-black text-[#2a1a03] shadow-md ${activeHost === "birimo" ? "mr-2" : "ml-2"}`}>
            <span className="mr-1 text-xs text-[#9a6a12]">{seg.speaker && !seg.repeat ? seg.speaker : activeHost === "birimo" ? "ビリモ" : "ハル"}</span>
            {seg.sayJa}
          </div>

          {/* まんなかのカード */}
          <div className="mx-auto mt-3 flex min-h-[150px] max-w-sm flex-col items-center justify-center rounded-2xl border-2 border-[var(--gold)] bg-black/45 px-4 py-3 text-center text-white">
            {seg.letters && seg.letters.length > 0 && (
              <div className="mb-1 flex gap-2" aria-label="フォニックスの もじ">
                {seg.letters.map((l) => (
                  <span key={l} className="font-title rounded-lg bg-[#f2c14e] px-3 py-1 text-3xl font-black text-[#2a1a03]">{focusLabel(l).main}</span>
                ))}
              </div>
            )}
            {seg.speaker && (
              <div className="mb-1 flex items-center gap-2 text-sm font-bold text-[var(--gold-dark)]">
                {sid ? <Portrait id={sid} size={36} /> : <span className="text-2xl" aria-hidden>👩‍🏫</span>}
                {seg.speaker}
              </div>
            )}
            {seg.emoji && !seg.speaker && <div className="text-5xl" aria-hidden>{seg.emoji}</div>}
            {seg.en && <p className="mt-1 text-3xl font-black leading-tight tracking-wide" lang="en">{seg.en}</p>}
            {seg.en && seg.ja && seg.ja !== seg.sayJa && <p className="mt-1 text-sm text-[var(--on-dark-2)]">{seg.ja}</p>}
            {phase === "repeat" && (
              <div className="mt-3 w-full">
                <p className="text-2xl font-black text-[#ffe066]">🎤 いってみよう！</p>
                <div className="mx-auto mt-1 h-2 w-3/4 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-[#ffe066]" style={{ width: `${repeatLeft * 100}%`, transition: "width 150ms linear" }} />
                </div>
              </div>
            )}
          </div>

          {/* ホスト */}
          <div className="mt-2 flex items-end justify-between px-2" aria-hidden>
            <div className={`transition-transform ${activeHost === "haru" ? "bob scale-105" : "opacity-80"}`}>
              <StandingFigure id="haru" pose={haruPose(seg)} height={130} />
            </div>
            <div className={`transition-transform ${activeHost === "birimo" ? "bob scale-110" : "opacity-80"}`}>
              <StandingFigure id="birimo" mood={seg.section === "outro" ? "cheer" : activeHost === "birimo" ? "excited" : "happy"} height={96} flip />
            </div>
          </div>
        </div>

        {/* そうさ */}
        <div className="space-y-2 p-3">
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/40" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="さいせいの すすみぐあい">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#8dffcb,#2fd08a)]" style={{ width: `${progress * 100}%`, transition: "width 150ms linear" }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--on-dark-2)]">{fmt(progress * script.totalMs)} / {fmt(script.totalMs)}</span>
            <div className="flex gap-2">
              {playing
                ? <button className="btn btn-primary px-4 py-2" onClick={pause} aria-label="とめる">⏸ とめる</button>
                : <button className="btn btn-coin px-4 py-2" onClick={finished ? replay : resume} aria-label="さいせい">▶ {finished ? "もういちど" : "さいせい"}</button>}
              <button className="btn btn-primary px-3 py-2" onClick={replay} aria-label="さいしょから">↺</button>
              {soundSupported && <button className="btn btn-primary px-3 py-2" onClick={toggleMute} aria-label={muted ? "おとを だす" : "おとを けす"}>{muted ? "🔇" : "🔊"}</button>}
            </div>
          </div>
          {!soundSupported && <p className="text-xs text-[var(--on-dark-2)]">このブラウザでは おとが でないので、もじだけで すすむよ。</p>}
          {offline && <p className="text-xs text-[var(--on-dark-2)]">いまは きろくに つながらないけど、まとめは みられるよ。</p>}
        </div>
      </section>

      {finished && (
        <div className="card rpg-rivets p-5 text-center">
          <div className="flex items-end justify-center gap-1" aria-hidden>
            <StandingFigure id="haru" pose="cheer" height={100} />
            <StandingFigure id="birimo" mood="excited" height={80} />
          </div>
          <h2 className="font-title mt-2 text-2xl text-[var(--gold-dark)]">さいごまで みたね！</h2>
          {reward
            ? <>
                {reward.coinsAwarded > 0 && <p className="mt-2 text-xl font-black text-[var(--coin)]">🪙 +{reward.coinsAwarded}</p>}
                <p className="mt-2 text-[var(--ink-2)]">{reward.messageJa}</p>
              </>
            : <p className="mt-2 text-[var(--ink-2)]">きろくしています…</p>}
          <button className="btn btn-coin mt-4 block w-full" onClick={replay}>もういちど みる</button>
          <Link href="/map" className="btn btn-primary mt-3 block">マップへもどる</Link>
        </div>
      )}

      {!finished && <Link href="/map" className="block text-center text-sm font-bold text-[var(--on-dark-2)] underline">マップへもどる（とちゅうで やめても だいじょうぶ）</Link>}
    </div>
  );
}
