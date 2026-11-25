"use client";
/**
 * 力だめしの 選ぶ 問題（聞く・読む）。テストなので その場では ⭕❌ を 出さない（さいごに まとめて 採点）。
 *  - 聞く: ▶ で 読み上げ（YEARLY_RULES.playsPerItem 回まで）。会話は A / B で 声の 高さを かえる。
 *    ステージ1〜2 の「つづきを えらぶ」問題は 選択肢も 読み上げる（英検の 低い級と 同じ）
 *  - 読む: 文章（あれば）＋ しつもん
 */
import { useEffect, useRef, useState } from "react";
import { YEARLY_RULES } from "@/lib/domain/config";
import type { ChoiceItem, ReadingPassage } from "@/lib/yearly/types";

const NUM = ["1", "2", "3", "4"];

function say(text: string, pitch = 1, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    u.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    u.voice = voices.find((v) => v.lang.startsWith("en") && /female|samantha|jenny|aria|zira/i.test(v.name)) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
    // onend が こない ブラウザが あるので、ことばの 数から 見つもった 時間で かならず おわる
    const guard = setTimeout(resolve, 2500 + text.split(/\s+/).length * 700);
    u.onend = () => { clearTimeout(guard); resolve(); };
    u.onerror = () => { clearTimeout(guard); resolve(); };
    window.speechSynthesis.speak(u);
  });
}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ChoiceQuestion({ item, stage, passage, picked, onPick }: {
  item: ChoiceItem;
  stage: number;
  passage?: ReadingPassage;
  picked: number | undefined;
  onPick: (i: number) => void;
}) {
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
  }, []);

  const listening = item.skill === "listening";
  const readChoices = listening && item.format === "response" && stage <= 2;
  const left = YEARLY_RULES.playsPerItem - plays;

  const play = async () => {
    if (playing || left <= 0) return;
    setPlays((p) => p + 1);
    setPlaying(true);
    window.speechSynthesis?.cancel();
    for (const line of item.audio ?? []) {
      if (!alive.current) return;
      await say(line.en, line.speaker === "B" ? 1.35 : line.speaker === "A" ? 0.9 : 1);
      await pause(350);
    }
    if ((item.format === "dialog" || item.format === "passage") && item.prompt) {
      await pause(400);
      if (alive.current) await say(`Question. ${item.prompt}`);
    }
    if (readChoices) {
      for (const [i, c] of item.choices.entries()) {
        if (!alive.current) return;
        await pause(300);
        await say(`${NUM[i]}. ${c}`);
      }
    }
    if (alive.current) setPlaying(false);
  };

  return (
    <div className="space-y-3">
      {item.promptJa && <p className="text-sm font-bold text-[var(--ink-2)]">{item.promptJa}</p>}

      {listening && (
        <button className={`btn w-full ${left > 0 ? "btn-coin" : "btn-ghost"}`} onClick={() => void play()} disabled={playing || left <= 0} aria-label={`きく（のこり ${left} かい）`}>
          {playing ? "🔊 きいてね…" : left > 0 ? `▶ きく（のこり ${left} かい）` : "もう きけないよ。えらんでね"}
        </button>
      )}

      {passage && (
        <article className="rounded-xl border border-[var(--gold)]/40 bg-black/25 p-3" aria-label={passage.title}>
          <p lang="en" className="font-black">{passage.title}</p>
          <div lang="en" className="mt-1 space-y-1 text-sm leading-relaxed">
            {passage.lines.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        </article>
      )}

      {item.prompt && (!listening || item.format === "dialog" || item.format === "passage") && (
        <p lang="en" className="text-lg font-black leading-snug">{item.prompt}</p>
      )}

      {item.format === "picture" ? (
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="絵を えらぶ">
          {item.choices.map((c, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={picked === i}
              aria-label={`${NUM[i]}: ${item.alt?.[i] ?? c}`}
              onClick={() => onPick(i)}
              className={`rounded-2xl border-4 bg-[var(--surface)] p-3 text-center transition ${picked === i ? "border-[var(--volt)] bg-[var(--volt)]/20" : "border-transparent"}`}
            >
              <span className="block text-xs font-black text-[var(--ink-2)]">{NUM[i]}</span>
              <span className="block text-4xl leading-tight" aria-hidden>{c}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-2" role="radiogroup" aria-label="こたえを えらぶ">
          {item.choices.map((c, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={picked === i}
              lang="en"
              onClick={() => onPick(i)}
              className={`btn w-full justify-start text-left ${stage <= 2 ? "text-lg" : "text-base"} ${picked === i ? "!bg-[var(--volt)] !text-black" : ""}`}
            >
              <span className="mr-2 inline-block w-5 shrink-0 text-center font-black opacity-70">{NUM[i]}</span>{c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
