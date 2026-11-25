"use client";
/**
 * としょかんの うた・チャンツ: 🎵 きく（ぜんぶ 読み上げ）／🗣️ まねっこ（1行 きいたら「きみの ばん」で まねする）。
 * さいごまで やったら 1日1回 スタンプ（＋ コイン）。おためしモードでも 動く。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReadAlongText, useReadAloud } from "@/components/library/ReadAlong";
import { OfflineNote } from "@/components/common/OfflineNote";
import { Portrait } from "@/components/characters/CharacterArt";
import { loadChant } from "@/lib/library/catalog";
import { finishActivity, loadLibraryState, type FinishResult, type LibraryState } from "@/lib/library/client";
import { isUnlocked } from "@/lib/library/rules";
import type { Chant } from "@/lib/library/types";

export default function ChantPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [chant, setChant] = useState<Chant | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState | null>(null);
  const [slow, setSlow] = useState(false);
  const [showJa, setShowJa] = useState(true);
  const [mode, setMode] = useState<"listen" | "echo" | null>(null);
  const [result, setResult] = useState<FinishResult | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([loadChant(id), loadLibraryState()]).then(([c, st]) => {
      if (!alive) return;
      setChant(c);
      setState(st);
    });
    return () => { alive = false; };
  }, [id]);

  const reader = useReadAloud(chant?.lines ?? [], slow ? 0.75 : 1);

  if (chant === undefined || !state) return <p className="rpg-title p-8 text-center text-xl">うたを よみこみちゅう…</p>;
  if (!chant || !isUnlocked(chant, state.reachedLesson)) {
    return (
      <div className="card p-6 text-center">
        <p className="text-4xl" aria-hidden>🔒</p>
        <p className="font-black">{chant ? `この チャンツは Lesson ${chant.unlockLesson} を クリアすると ひらくよ。` : "その チャンツは みつからないよ。"}</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }

  const start = async (m: "listen" | "echo") => {
    setMode(m);
    setResult(null);
    const completed = await reader.play(0, { echo: m === "echo" });
    setMode(null);
    if (completed) setResult(await finishActivity({ kind: "chant", id: chant.id, finished: true }, null, state.offline));
  };

  return (
    <div className="space-y-4">
      <OfflineNote show={state.offline} note="コインは きろくされないよ" />
      <Link href="/library" className="text-sm font-bold text-[var(--on-dark-2)] underline" onClick={() => reader.stop()}>◀ としょかん</Link>

      <header className="card rpg-rivets p-4 text-center">
        <p className={`text-5xl ${reader.playing ? "bob" : ""}`} aria-hidden>{chant.emoji}</p>
        <h1 lang="en" className="font-title text-2xl">{chant.title}</h1>
        <p className="text-sm text-[var(--ink-2)]">{chant.titleJa}・{chant.focusJa}</p>
      </header>

      <div className="card grid grid-cols-2 gap-2 p-3">
        {reader.playing ? (
          <button className="btn btn-berry col-span-2 whitespace-nowrap" onClick={() => { reader.stop(); setMode(null); }}>⏸ とめる</button>
        ) : (
          <>
            <button className="btn btn-coin whitespace-nowrap" onClick={() => void start("listen")}>🎵 きく</button>
            <button className="btn btn-primary whitespace-nowrap" onClick={() => void start("echo")}>🗣️ まねっこ</button>
          </>
        )}
        <button className="btn btn-ghost whitespace-nowrap px-2 text-sm" onClick={() => { reader.stop(); setSlow((s) => !s); }} aria-pressed={slow}>{slow ? "🐢 ゆっくり" : "🐇 ふつう"}</button>
        <button className="btn btn-ghost whitespace-nowrap px-2 text-sm" onClick={() => setShowJa((v) => !v)} aria-pressed={showJa}>{showJa ? "あ やくを かくす" : "あ やくを みる"}</button>
      </div>

      {mode === "echo" && (
        <div className={`card flex items-center gap-3 p-3 ${reader.yourTurn ? "bg-[#2fd08a] text-white" : ""}`} aria-live="polite">
          <Portrait id="riko" size={44} />
          <p className="text-lg font-black">{reader.yourTurn ? "🗣️ きみの ばん！ おおきな こえで まねしてね" : "👂 よく きいてね…"}</p>
        </div>
      )}

      <div className="card p-3">
        <ReadAlongText lines={chant.lines} reader={reader} showJa={showJa} big />
      </div>

      {result && (
        <div className="card p-5 text-center">
          <p className="text-4xl" aria-hidden>🎉</p>
          <p className="font-black">さいごまで できたね！</p>
          <p className="mt-1 font-bold">{result.messageJa}</p>
          <Link href="/library" className="btn btn-primary mt-4 w-full">としょかんへ もどる</Link>
        </div>
      )}
    </div>
  );
}
