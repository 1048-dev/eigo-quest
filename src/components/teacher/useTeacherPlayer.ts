"use client";
/**
 * バーチャル先生の 再生エンジン（run8 P8）。
 *  - セグメントを じゅんばんに: 話す（言語ごとに en-US / ja-JP の 声）→ まち時間（カウントダウン）→ きりかえ
 *  - 音なし・声が ない ブラウザ・ミュートでも、timeline の 見つもり時間で 字幕と 口が すすむ
 *  - 一時停止 / もういちど（セグメント）/ とばす / 0.8・1.0 倍 / セグメントへ ジャンプ
 *  - 口の 形は speechSynthesis の boundary（ことばの 位置）で あわせる。来ない ときは 時間で ループ
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { MS_SEGMENT_GAP } from "@/lib/teacher/timing";
import { visemeAt, type SpeechUnit, type TeacherTimeline, type Viseme } from "@/lib/teacher/timeline";

export type PlayerPhase = "ready" | "speaking" | "pausing" | "gap" | "done";

export interface PlayerState {
  index: number;
  unit: number;
  phase: PlayerPhase;
  paused: boolean;
  rate: 0.8 | 1;
  muted: boolean;
  /** 声が つかえない（speechSynthesis が ない / 声が 見つからない）→ 時間で すすむ */
  silentMode: boolean;
  /** まち時間の のこり（ミリ秒）と 長さ */
  pauseLeft: number;
  pauseTotal: number;
  /** いまの セグメントの 中で すぎた 時間（シークバー用。1 倍換算ではなく 実時間） */
  segElapsed: number;
}

interface Run { cancelled: boolean }

/** いま 話している 文（口の 形の 計算に つかう。毎フレーム state を かえないよう ref で もつ） */
interface MouthClock {
  text: string;
  /** 1 文字 あたりの ミリ秒 */
  msPerChar: number;
  /** この 時刻に この 文字位置（boundary で 上書き） */
  baseAt: number;
  baseChar: number;
  /** boundary が 来た つぎの ことばの おわり（そこで 口を とめる） */
  limitChar: number;
  active: boolean;
  /** boundary が 来たか（来ない ときは 文を くりかえし ループ） */
  boundary: boolean;
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const synthOf = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);

const FEMALE = /female|woman|samantha|jenny|aria|zira|ava|allison|susan|karen|moira|tessa|fiona|victoria|kyoko|nanami|haruka|ayumi|mizuki|o-ren|google us english|google 日本語/i;
const MALE = /\bmale\b|daniel|alex|fred|ichiro|keita|otoya|hattori|david|mark|guy/i;

export function pickVoice(voices: SpeechSynthesisVoice[], lang: "en" | "ja"): SpeechSynthesisVoice | null {
  const want = lang === "en" ? "en-US" : "ja-JP";
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-");
  const exact = voices.filter((v) => norm(v).toLowerCase() === want.toLowerCase());
  const loose = voices.filter((v) => norm(v).toLowerCase().startsWith(lang));
  for (const pool of [exact, loose]) {
    const female = pool.find((v) => FEMALE.test(v.name) && !MALE.test(v.name));
    if (female) return female;
    const notMale = pool.find((v) => !MALE.test(v.name));
    if (notMale) return notMale;
  }
  return exact[0] ?? loose[0] ?? null;
}

/** initial: はじめの 状態（npm run check:render が とちゅうの 画面を サーバーで 描くため。ふだんは わたさない） */
export function useTeacherPlayer(timeline: TeacherTimeline, initial?: Partial<PlayerState>) {
  const [state, setState] = useState<PlayerState>({
    index: 0, unit: 0, phase: "ready", paused: false, rate: 1, muted: false, silentMode: false, pauseLeft: 0, pauseTotal: 0, segElapsed: 0,
    ...initial,
  });
  const st = useRef(state);
  st.current = state;
  const patch = useCallback((p: Partial<PlayerState>) => setState((s) => ({ ...s, ...p })), []);

  const runRef = useRef<Run | null>(null);
  const pausedRef = useRef(false);
  const rateRef = useRef<0.8 | 1>(1);
  const mutedRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const mouth = useRef<MouthClock>({ text: "", msPerChar: 80, baseAt: 0, baseChar: 0, limitChar: 0, active: false, boundary: false });
  const segStart = useRef(0);

  // 声の 一覧は あとから とどく ブラウザが ある
  useEffect(() => {
    const synth = synthOf();
    if (!synth) { patch({ silentMode: true }); return; }
    const load = () => { voicesRef.current = synth.getVoices(); };
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => { synth.removeEventListener?.("voiceschanged", load); synth.cancel(); };
  }, [patch]);

  /** ms だけ まつ（一時停止中は 時計を とめる）。onTick で のこりを しらせる */
  const wait = useCallback(async (ms: number, run: Run, onTick?: (left: number) => void) => {
    let left = ms;
    let last = now();
    while (left > 0) {
      await new Promise((r) => setTimeout(r, 50));
      if (run.cancelled) return false;
      const t = now();
      if (!pausedRef.current) left -= t - last;
      last = t;
      onTick?.(Math.max(0, left));
    }
    return !run.cancelled;
  }, []);

  const waitWhilePaused = useCallback(async (run: Run) => {
    while (pausedRef.current && !run.cancelled) await new Promise((r) => setTimeout(r, 80));
    return !run.cancelled;
  }, []);

  /** 1 つの 文を 話す（声が なければ 見つもり時間だけ 口を うごかす） */
  const speakUnit = useCallback(async (u: SpeechUnit, run: Run): Promise<boolean> => {
    for (;;) {
      if (!(await waitWhilePaused(run))) return false;
      const rate = rateRef.current;
      const est = u.ms / rate;
      const m = mouth.current;
      m.text = u.text; m.msPerChar = est / Math.max(1, u.text.length); m.baseAt = now(); m.baseChar = 0; m.limitChar = u.text.length; m.boundary = false; m.active = true;
      const synth = synthOf();
      const voice = synth ? pickVoice(voicesRef.current.length ? voicesRef.current : synth.getVoices(), u.lang) : null;
      const silent = !synth || mutedRef.current || !voice;
      if (st.current.silentMode !== (!synth || !voice)) patch({ silentMode: !synth || !voice });

      let interrupted = false;
      if (silent) {
        const ok = await wait(est, run);
        if (!ok) { m.active = false; return false; }
        // 一時停止しても 時計が とまるだけなので そのまま つづける
      } else {
        await new Promise<void>((resolve) => {
          let settled = false;
          const done = () => { if (!settled) { settled = true; clearInterval(watch); clearTimeout(safety); resolve(); } };
          const ut = new SpeechSynthesisUtterance(u.speak);
          ut.lang = u.lang === "en" ? "en-US" : "ja-JP";
          ut.voice = voice;
          ut.rate = rate * (u.lang === "en" ? 0.9 : 1);
          ut.pitch = 1.05;
          ut.onstart = () => { m.baseAt = now(); m.baseChar = 0; };
          ut.onboundary = (e) => {
            if (e.name && e.name !== "word") return;
            // speak は 読み上げ用に 文字を かえているので、もとの 文の 位置へ わりあいで もどす
            const ratio = u.text.length / Math.max(1, u.speak.length);
            const at = Math.floor(e.charIndex * ratio);
            const len = Math.max(1, Math.floor((e.charLength || u.speak.slice(e.charIndex).search(/\s|$/) || 4) * ratio));
            m.boundary = true; m.baseChar = at; m.baseAt = now(); m.limitChar = at + len + 1;
          };
          ut.onend = done;
          ut.onerror = done;
          // 一時停止 / とばす → 声を とめる
          const watch = setInterval(() => {
            if (run.cancelled || pausedRef.current) { interrupted = true; synth!.cancel(); done(); }
          }, 80);
          // onend が 来ない ブラウザの 保険
          const safety = setTimeout(done, est * 2.2 + 3000);
          synth!.cancel();
          synth!.speak(ut);
        });
      }
      m.active = false;
      if (run.cancelled) return false;
      if (interrupted && pausedRef.current) continue; // 再開したら この 文を もういちど
      return true;
    }
  }, [patch, wait, waitWhilePaused]);

  const runFrom = useCallback(async (start: number) => {
    if (runRef.current) runRef.current.cancelled = true;
    synthOf()?.cancel();
    const run: Run = { cancelled: false };
    runRef.current = run;
    for (let i = start; i < timeline.segments.length; i++) {
      const seg = timeline.segments[i];
      segStart.current = now();
      patch({ index: i, unit: 0, phase: "speaking", pauseLeft: 0, pauseTotal: 0, segElapsed: 0 });
      for (let k = 0; k < seg.units.length; k++) {
        patch({ unit: k });
        if (!(await speakUnit(seg.units[k], run))) return;
      }
      if (seg.pauseMs > 0) {
        patch({ phase: "pausing", pauseLeft: seg.pauseMs, pauseTotal: seg.pauseMs });
        if (!(await wait(seg.pauseMs, run, (left) => patch({ pauseLeft: left })))) return;
      }
      patch({ phase: "gap", pauseLeft: 0 });
      if (!(await wait(MS_SEGMENT_GAP, run))) return;
    }
    if (!run.cancelled) patch({ phase: "done" });
  }, [timeline, patch, speakUnit, wait]);

  // セグメントの 中の 経過（シークバー）
  useEffect(() => {
    if (state.phase === "ready" || state.phase === "done") return;
    const id = setInterval(() => { if (!pausedRef.current) setState((s) => ({ ...s, segElapsed: now() - segStart.current })); }, 250);
    return () => clearInterval(id);
  }, [state.phase, state.index]);

  // おわる とき（ステップを はなれる）は かならず 声を とめる
  useEffect(() => () => { if (runRef.current) runRef.current.cancelled = true; synthOf()?.cancel(); }, []);

  const controls = {
    start: () => { pausedRef.current = false; patch({ paused: false }); void runFrom(0); },
    togglePause: () => {
      const p = !pausedRef.current;
      pausedRef.current = p;
      if (p) synthOf()?.cancel();
      patch({ paused: p });
    },
    replay: () => { pausedRef.current = false; patch({ paused: false }); void runFrom(st.current.index); },
    skip: () => {
      pausedRef.current = false;
      const n = st.current.index + 1;
      if (n >= timeline.segments.length) { if (runRef.current) runRef.current.cancelled = true; synthOf()?.cancel(); patch({ phase: "done", paused: false }); return; }
      patch({ paused: false });
      void runFrom(n);
    },
    back: () => { pausedRef.current = false; patch({ paused: false }); void runFrom(Math.max(0, st.current.index - 1)); },
    jump: (i: number) => { pausedRef.current = false; patch({ paused: false }); void runFrom(Math.min(Math.max(0, i), timeline.segments.length - 1)); },
    setRate: (r: 0.8 | 1) => { rateRef.current = r; patch({ rate: r }); },
    toggleMute: () => {
      mutedRef.current = !mutedRef.current;
      patch({ muted: mutedRef.current });
      // いま 話している 文から 声あり / 声なしで やりなおす
      if (st.current.phase === "speaking") void runFrom(st.current.index);
    },
    stop: () => { if (runRef.current) runRef.current.cancelled = true; synthOf()?.cancel(); },
  };

  /** 口の 形（毎フレーム よぶ） */
  const getViseme = useCallback((): Viseme => {
    const m = mouth.current;
    if (!m.active || pausedRef.current) return "rest";
    const t = now() - m.baseAt;
    let pos = m.baseChar + t / Math.max(20, m.msPerChar);
    if (m.boundary) {
      if (pos >= m.limitChar) return "rest";
    } else if (m.text.length > 0) {
      pos = pos % m.text.length; // boundary が 来ない 声: 文を くりかえし ループ
    }
    return visemeAt(m.text, pos);
  }, []);

  return { state, controls, getViseme };
}
