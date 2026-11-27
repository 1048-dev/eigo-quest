"use client";
/**
 * としょかんの 読み聞かせ（おはなし・チャンツ）。
 *  - useReadAloud: 行を じゅんばんに 読み上げ、いま 読んでいる 行と ことばを しらせる。まねっこ（echo）モードでは 1行ごとに「きみの ばん」の 間を あける
 *  - ReadAlongText: 行を ならべて、いまの 行・ことばを ハイライト。行を タップ → その 行を 読む、ことばを タップ → その ことばを ゆっくり 読む
 * speechSynthesis が ない ブラウザでも ハイライトは 時間の 見つもりで 動く（音は 出ない）。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { speak, speakTracked, type TrackedSpeech } from "@/lib/speech/tts";
import { bareWord, estimateWordDurations, wordRanges } from "@/lib/library/words";
import type { LibraryLine } from "@/lib/library/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** まねっこの 間（読み上げの 見つもり × 1.3 ＋ 少し） */
export const echoPauseMs = (text: string, rate: number) => Math.round(estimateWordDurations(text, rate).reduce((a, b) => a + b, 0) * 1.3 + 600);

export interface ReadAloud {
  lineIdx: number;
  wordIdx: number;
  playing: boolean;
  /** まねっこの「きみの ばん」中 */
  yourTurn: boolean;
  /** from 行目から 読む。さいごまで 読みきったら true（とちゅうで とめたら false） */
  play: (from?: number, opts?: { single?: boolean; echo?: boolean }) => Promise<boolean>;
  stop: () => void;
  sayWord: (word: string) => void;
}

export function useReadAloud(lines: readonly LibraryLine[], rate: number): ReadAloud {
  const [lineIdx, setLineIdx] = useState(-1);
  const [wordIdx, setWordIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [yourTurn, setYourTurn] = useState(false);
  const run = useRef(0);
  const current = useRef<TrackedSpeech | null>(null);

  const stop = useCallback(() => {
    run.current++;
    current.current?.cancel();
    current.current = null;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPlaying(false);
    setWordIdx(-1);
    setYourTurn(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const play = useCallback(async (from = 0, opts: { single?: boolean; echo?: boolean } = {}) => {
    stop();
    const id = ++run.current;
    const alive = () => run.current === id;
    setPlaying(true);
    for (let i = Math.max(0, from); i < lines.length; i++) {
      if (!alive()) return false;
      setLineIdx(i);
      const t = speakTracked(lines[i].en, rate, (w) => { if (alive()) setWordIdx(w); });
      current.current = t;
      await t.done;
      if (!alive()) return false;
      if (opts.echo) {
        setYourTurn(true);
        await sleep(echoPauseMs(lines[i].en, rate));
        if (!alive()) return false;
        setYourTurn(false);
      } else {
        await sleep(opts.single ? 0 : 280);
      }
      if (opts.single) break;
    }
    if (!alive()) return false;
    setPlaying(false);
    setWordIdx(-1);
    if (!opts.single) setLineIdx(-1);
    return !opts.single;
  }, [lines, rate, stop]);

  const sayWord = useCallback((word: string) => {
    const w = bareWord(word);
    if (!w) return;
    stop();
    void speak(w, 0.75);
  }, [stop]);

  return { lineIdx, wordIdx, playing, yourTurn, play, stop, sayWord };
}

export function ReadAlongText({ lines, reader, showJa, big = false }: {
  lines: readonly LibraryLine[];
  reader: ReadAloud;
  showJa: boolean;
  big?: boolean;
}) {
  return (
    <ol className="space-y-2" aria-live="off">
      {lines.map((l, i) => {
        const active = reader.lineIdx === i;
        return (
          <li key={i}>
            <div
              role="button" tabIndex={0}
              onClick={() => void reader.play(i, { single: true })}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); void reader.play(i, { single: true }); } }}
              // run10: aria-label は つけない（日本語の 訳が 見えているとき 名前と ずれる。axe label-content-name-mismatch）。
              // 名前は 英文（＋訳）＋「（タップで よむ）」
              className={`cursor-pointer rounded-xl px-3 py-2 transition ${active ? "bg-[#fff4c2] text-[#2a1a03] shadow-[inset_0_0_0_2px_#f2c14e] [&_p]:text-[#2a1a03]" : "hover:bg-black/5"}`}
            >
              <p lang="en" className={`${big ? "text-2xl" : "text-xl"} font-black leading-relaxed`}>
                {wordRanges(l.en).map((w, j) => (
                  <span key={j}>
                    <span
                      onClick={(e) => { e.stopPropagation(); reader.sayWord(w.word); }}
                      className={`rounded px-0.5 ${active && reader.wordIdx === j ? "bg-[#ffd54a] text-[#2a1a03]" : ""}`}
                    >{w.word}</span>{" "}
                  </span>
                ))}
              </p>
              {showJa && <p className="text-sm text-[var(--ink-2)]">{l.ja}</p>}
              <span className="sr-only">（タップで よむ）</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
