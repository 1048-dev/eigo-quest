"use client";
/**
 * バーチャル教室（run8 P8）: うごく エマ先生 ＋ 黒板（スライド）＋ 字幕 ＋ コントロール。
 * 台本（lesson.teacher）が あれば それで、まだ なければ レッスンの ことばから つくった 授業で 教える。
 * 音が 出なくても（声が ない・ミュート）字幕と 時間で すすむ。DB が なくても うごく（レッスンの データだけ つかう）。
 * videoUrl が ある レッスンは 本物の 動画を 再生する（となりに .vtt が あれば 字幕つき）。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { buildTeacherTimeline, KIND_LABEL_JA, pausePrompt, segmentDurationMs, type TeacherTimeline, type TimelineLesson, type TimelineSegment } from "@/lib/teacher/timeline";
import { vttUrlFor } from "@/lib/teacher/media";
import type { TeacherSegmentKind } from "@/lib/domain/types";
import { EmmaAnimated, type EmmaGesture } from "./EmmaAnimated";
import { useTeacherPlayer, type PlayerState } from "./useTeacherPlayer";

const KIND_COLOR: Record<TeacherSegmentKind, string> = {
  greet: "#f2c14e", goal: "#ff9f43", words: "#4fc3f7", expressions: "#7e8cff", phonics: "#c77dff",
  tpr: "#2fd08a", repeat: "#ff6b9a", check: "#ffd23a", wrap: "#f2c14e",
};

type SubMode = "both" | "ja" | "en" | "off";
const SUB_LABEL: Record<SubMode, string> = { both: "りょうほう", ja: "にほんご", en: "えいご", off: "なし" };
const SUB_NEXT: Record<SubMode, SubMode> = { both: "ja", ja: "en", en: "off", off: "both" };

function gestureFor(seg: TimelineSegment | undefined, s: PlayerState): EmmaGesture {
  if (!seg || s.phase === "ready") return "rest";
  if (s.phase === "done") return s.segElapsed < 2500 ? "clap" : "rest";
  if (s.paused) return "rest";
  if (s.phase === "pausing") return seg.kind === "tpr" ? "mime" : seg.kind === "check" ? "think" : "open_hands";
  if (s.phase === "gap") return "talk";
  const g = seg.gesture;
  // 手を ふる・はくしゅ などは さいしょの 3.5 秒だけ。そのあとは 話す ときの 手に もどす
  if ((g === "wave" || g === "clap" || g === "nod" || g === "open_hands") && s.segElapsed > 3500) return "talk";
  return g;
}

const lc = (s: string) => s.toLowerCase().replace(/[.!?。！？]+$/g, "").trim();

function Board({ seg, state, onStart, total, mic }: { seg?: TimelineSegment; state: PlayerState; onStart: () => void; total: number; mic: MicApi }) {
  const unitText = seg?.units[state.unit]?.text.toLowerCase() ?? "";
  if (state.phase === "ready" || !seg) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-bold text-[#cfe8d8]">エマせんせいの じゅぎょう（やく {Math.max(1, Math.round(total / 60000))} ぷん）</p>
        <button type="button" className="btn btn-coin px-6 py-3 text-lg" onClick={onStart} data-testid="teacher-start">▶ じゅぎょうを はじめる</button>
        <p className="text-xs text-[#a9cdb8]">おとが でなくても じまくで すすむよ</p>
      </div>
    );
  }
  if (state.phase === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-5xl" aria-hidden>🌟</p>
        <p className="font-chalk text-2xl font-black text-[#fff6c8]">よく できました！</p>
        <p className="text-sm text-[#cfe8d8]">したの「つぎへ」で れんしゅうに すすもう</p>
      </div>
    );
  }
  const items = seg.slide.items;
  const big = items.length <= 2;
  return (
    <div className="relative flex h-full flex-col p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-chalk truncate text-base font-black text-[#fff6c8] sm:text-lg">{seg.slide.emoji ? `${seg.slide.emoji} ` : ""}{seg.slide.title}</p>
        {seg.slide.title !== KIND_LABEL_JA[seg.kind] && <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black text-[#14231c]" style={{ background: KIND_COLOR[seg.kind] }}>{KIND_LABEL_JA[seg.kind]}</span>}
      </div>
      <div className={`flex flex-1 flex-col justify-center gap-2 py-2 ${big ? "items-center text-center" : ""}`}>
        {items.length === 0 && seg.slide.emoji && <p className="text-center text-6xl" aria-hidden>{seg.slide.emoji}</p>}
        {items.map((it, i) => {
          const on = unitText.includes(lc(it)) && state.phase === "speaking";
          return (
            <p key={`${seg.index}-${i}`} className={`font-chalk break-words font-black leading-tight transition-colors duration-200 ${big ? (it.length > 22 ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl") : "text-base sm:text-lg"} ${on ? "text-[#ffe066] underline decoration-[#ffe066]/60 decoration-4 underline-offset-4" : "text-white"}`}>
              {!big && <span className="mr-1 text-[#9fd8b5]">•</span>}{it}
            </p>
          );
        })}
      </div>
      {state.phase === "pausing" && <Countdown key={seg.index} left={state.pauseLeft} total={state.pauseTotal} prompt={pausePrompt(seg.kind)} mic={mic} />}
    </div>
  );
}

function Countdown({ left, total, prompt, mic }: { left: number; total: number; prompt: string; mic: MicApi }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0;
  return (
    <div className="ring-pop absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-[#0f2a20]/80 backdrop-blur-[2px]" role="status" aria-live="polite">
      <p className="font-chalk text-xl font-black text-[#ffe066] sm:text-2xl">{prompt}</p>
      <svg viewBox="0 0 80 80" className="h-20 w-20 sm:h-24 sm:w-24" aria-hidden>
        <circle cx={40} cy={40} r={r} fill="none" stroke="#ffffff22" strokeWidth={7} />
        <circle cx={40} cy={40} r={r} fill="none" stroke="#ffe066" strokeWidth={7} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} transform="rotate(-90 40 40)" style={{ transition: "stroke-dashoffset 80ms linear" }} />
        <text x={40} y={47} textAnchor="middle" fontSize={22} fontWeight={900} fill="#fff">{Math.ceil(left / 1000)}</text>
      </svg>
      {mic.on && <MicBar level={mic.level} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// マイクの 音量メーター（任意。ゆるされなくても 授業は すすむ）
// ---------------------------------------------------------------------------
interface MicApi { on: boolean; level: number; error: string; toggle: () => void }

function useMicMeter(): MicApi {
  const [on, setOn] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const stopRef = useRef<() => void>(() => {});
  const stop = () => { stopRef.current(); stopRef.current = () => {}; setOn(false); setLevel(0); };
  useEffect(() => () => stopRef.current(), []);
  const toggle = async () => {
    if (on) { stop(); return; }
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no mic");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) throw new Error("no audio");
      const ctx = new Ctx();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      let raf = 0;
      let last = 0;
      const loop = (t: number) => {
        if (t - last > 66) {
          an.getByteTimeDomainData(buf);
          let sum = 0;
          for (const b of buf) sum += ((b - 128) / 128) ** 2;
          setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4));
          last = t;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      stopRef.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((tr) => tr.stop()); void ctx.close().catch(() => {}); };
      setOn(true);
    } catch {
      setError("マイクは つかわなくても だいじょうぶ！");
      setOn(false);
    }
  };
  return { on, level, error, toggle: () => void toggle() };
}

function MicBar({ level }: { level: number }) {
  const n = 10;
  const lit = Math.round(level * n);
  return (
    <div className="flex items-end gap-0.5" aria-label="こえの 大きさ">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="w-2 rounded-sm transition-colors" style={{ height: 6 + i * 2, background: i < lit ? (i > 7 ? "#ff6b6b" : "#2fd08a") : "#ffffff33" }} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 本体
// ---------------------------------------------------------------------------
function CtrlBtn({ onClick, label, icon, active, disabled, testId }: { onClick: () => void; label: string; icon: string; active?: boolean; disabled?: boolean; testId?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} data-testid={testId} aria-label={label}
      className={`flex min-h-11 flex-col items-center justify-center rounded-xl border-2 px-1 py-1 text-[11px] font-black leading-tight transition disabled:opacity-40 ${active ? "border-[#7a4e0c] bg-[radial-gradient(120%_90%_at_50%_0%,#fff8cf,#f2c14e_45%,#b07a1c)] text-[#2a1a03]" : "border-[#7a4e0c]/50 bg-[var(--surface)] text-[var(--ink)]"}`}>
      <span className="text-base leading-none" aria-hidden>{icon}</span>
      <span className="mt-0.5 whitespace-nowrap">{label}</span>
    </button>
  );
}

function Timeline({ tl, state, rate, onJump }: { tl: TeacherTimeline; state: PlayerState; rate: number; onJump: (i: number) => void }) {
  return (
    <div className="flex h-3 w-full gap-[2px]" role="group" aria-label="じゅぎょうの すすみぐあい">
      {tl.segments.map((s) => {
        const d = segmentDurationMs(s, rate);
        const fill = s.index < state.index || state.phase === "done" ? 1 : s.index === state.index && state.phase !== "ready" ? Math.min(1, state.segElapsed / d) : 0;
        return (
          <button key={s.index} type="button" onClick={() => onJump(s.index)} aria-label={`${s.index + 1}: ${KIND_LABEL_JA[s.kind]}`} title={KIND_LABEL_JA[s.kind]}
            className={`relative h-full overflow-hidden rounded-sm bg-white/15 ${s.index === state.index && state.phase !== "ready" && state.phase !== "done" ? "outline outline-2 outline-[#ffe066]" : ""}`} style={{ flexGrow: d, flexBasis: 0 }}>
            <span className="absolute inset-y-0 left-0" style={{ width: `${fill * 100}%`, background: KIND_COLOR[s.kind] }} />
          </button>
        );
      })}
    </div>
  );
}

export function VirtualClassroom({ lesson, partner, teacherName, onDone }: { lesson: TimelineLesson; partner?: string; teacherName: string; onDone: () => void }) {
  const timeline = useMemo(() => buildTeacherTimeline(lesson, { partner }), [lesson, partner]);
  const { state, controls, getViseme } = useTeacherPlayer(timeline);
  const [sub, setSub] = useState<SubMode>("both");
  const mic = useMicMeter();
  const seg = timeline.segments[state.index];
  const gesture = gestureFor(seg, state);
  const rate = state.rate;
  const started = state.phase !== "ready";
  const showEn = (sub === "both" || sub === "en") && !!seg?.subtitleEn;
  const showJa = (sub === "both" || sub === "ja") && !!seg?.subtitleJa;

  return (
    <div className="card overflow-hidden" data-testid="virtual-classroom" data-source={timeline.source}>
      <div className="grid bg-[radial-gradient(120%_90%_at_30%_0%,#f2c46a_0%,#1d4a52_55%,#0b1f2e_100%)] sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* エマ先生 */}
        <div className="relative mx-auto h-[220px] w-[220px] sm:h-auto sm:w-full sm:max-w-none sm:aspect-square">
          <EmmaAnimated gesture={gesture} getViseme={state.phase === "speaking" ? getViseme : undefined} label={teacherName} />
          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-black text-white backdrop-blur">👩‍🏫 {teacherName}</span>
        </div>
        {/* 黒板 */}
        <div className="p-2 sm:p-3">
          <div className="h-full min-h-[180px] rounded-2xl border-[6px] border-[#8a5a2b] bg-[radial-gradient(130%_100%_at_50%_0%,#2f5a48_0%,#1d3d31_60%,#15302a_100%)] shadow-[inset_0_0_24px_rgba(0,0,0,.45)]">
            <Board seg={seg} state={state} onStart={controls.start} total={timeline.totalMs} mic={mic} />
          </div>
        </div>
      </div>

      {/* 字幕 */}
      <div className="min-h-[76px] bg-[#0b1720] px-3 py-2 text-center" aria-live="polite">
        {started && state.phase !== "done" && seg && (showEn || showJa) ? (
          <>
            {showEn && <p className="text-base font-bold leading-snug text-white sm:text-lg" lang="en">{seg.subtitleEn}</p>}
            {showJa && <p className="mt-0.5 text-sm leading-snug text-[#ffe9b0]" lang="ja">{seg.subtitleJa}</p>}
          </>
        ) : (
          <p className="pt-4 text-xs text-white/50">{sub === "off" && started ? "じまく なし" : "じまく"}</p>
        )}
      </div>

      <div className="space-y-3 p-3">
        <Timeline tl={timeline} state={state} rate={rate} onJump={controls.jump} />
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          <CtrlBtn icon="⏮" label="もどる" onClick={controls.back} disabled={!started} />
          {state.paused
            ? <CtrlBtn icon="▶" label="さいかい" onClick={controls.togglePause} active testId="teacher-pause" />
            : <CtrlBtn icon="⏸" label="ていし" onClick={controls.togglePause} disabled={!started || state.phase === "done"} testId="teacher-pause" />}
          <CtrlBtn icon="↺" label="もういちど" onClick={state.phase === "done" ? controls.start : controls.replay} disabled={!started} testId="teacher-replay" />
          <CtrlBtn icon="⏭" label="とばす" onClick={controls.skip} disabled={!started || state.phase === "done"} testId="teacher-skip" />
          <CtrlBtn icon="🐢" label={rate === 0.8 ? "ゆっくり" : "ふつう"} onClick={() => controls.setRate(rate === 1 ? 0.8 : 1)} active={rate === 0.8} />
          <CtrlBtn icon={state.muted ? "🔇" : "🔊"} label={state.muted ? "おと なし" : "おと あり"} onClick={controls.toggleMute} active={state.muted} />
          <CtrlBtn icon="💬" label={SUB_LABEL[sub]} onClick={() => setSub(SUB_NEXT[sub])} />
          <CtrlBtn icon="🎤" label={mic.on ? "マイク ON" : "マイク"} onClick={mic.toggle} active={mic.on} />
        </div>
        {mic.error && <p className="text-center text-xs font-bold text-[var(--ink-2)]">{mic.error}</p>}
        {started && state.silentMode && !state.muted && <p className="text-center text-xs text-[var(--ink-2)]">🔇 こえが でない ときは じまくで すすむよ</p>}
        <p className="text-center text-xs font-bold text-[var(--ink-2)]">{started && seg ? `${state.index + 1} / ${timeline.segments.length}　${KIND_LABEL_JA[seg.kind]}` : `${timeline.segments.length} パート`}</p>
        <button type="button" className={`btn mt-1 w-full ${state.phase === "done" ? "btn-coin" : "btn-primary"}`} onClick={() => { controls.stop(); onDone(); }} data-testid="teacher-next">
          {state.phase === "done" ? "つぎへ ▶ れんしゅう しよう" : "つぎへ ▶"}
        </button>
      </div>
    </div>
  );
}

/** 本物の アバター動画（となりに 同じ 名前の .vtt が あれば 字幕を つける） */
export function TeacherVideoPlayer({ videoUrl, teacherName, onDone }: { videoUrl: string; teacherName: string; onDone: () => void }) {
  const vtt = vttUrlFor(videoUrl);
  const [hasVtt, setHasVtt] = useState(false);
  useEffect(() => {
    let alive = true;
    if (!vtt) return;
    fetch(vtt, { method: "HEAD" }).then((r) => { if (alive) setHasVtt(r.ok); }).catch(() => {});
    return () => { alive = false; };
  }, [vtt]);
  return (
    <div className="card overflow-hidden" data-testid="teacher-video">
      <video src={videoUrl} controls playsInline preload="metadata" crossOrigin="anonymous" className="aspect-video w-full bg-black" onEnded={onDone}>
        {hasVtt && vtt && <track kind="subtitles" src={vtt} srcLang="ja" label="にほんご" default />}
      </video>
      <div className="p-4">
        <p className="font-black">👩‍🏫 {teacherName}</p>
        <button type="button" className="btn btn-primary mt-4 w-full" onClick={onDone}>つぎへ ▶</button>
      </div>
    </div>
  );
}
