"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ArenaInfo } from "@/lib/domain/arena";
import { COIN_RULES } from "@/lib/domain/config";

const MODES = [
  { mode: "MIXED", label: "ミックス", icon: "🌀" },
  { mode: "LISTENING", label: "リスニング", icon: "👂" },
  { mode: "SPEAKING", label: "はつおん", icon: "🎤" },
  { mode: "WRITING", label: "ひっき", icon: "✏️" },
];

export default function ArenaPage() {
  const [arenas, setArenas] = useState<ArenaInfo[] | null>(null);
  useEffect(() => { fetch("/api/map").then((r) => r.json()).then((d) => setArenas(d.arenas)); }, []);
  if (!arenas) return <p className="p-8 text-center">よみこみちゅう…</p>;

  return (
    <div className="space-y-4">
      <h1 className="rpg-title text-center text-2xl">⚔️ 復習アリーナ</h1>
      <p className="speech ml-3 px-3 py-2 text-sm font-bold"><span className="font-pixel mr-1 text-[var(--gold-dark)]">ビリモ</span>なんどでも ちょうせんOK！1回 🪙{COIN_RULES.arenaPlay}（1日{COIN_RULES.arenaFullRewardPlaysPerDay}回まで）。わすれかけの もんだいが でやすいよ。</p>
      {arenas.length === 0 && <p className="card rpg-rivets p-6 text-center font-bold">Lesson 30 のボスをたおすと アリーナが ひらくよ！🏰</p>}
      {arenas.map((a) => (
        <div key={a.assessment.id} className={`card rpg-rivets p-4 ${a.unlocked ? "" : "opacity-50"}`}>
          <p className="font-pixel text-lg text-[var(--gold-dark)]">{a.unlocked ? "🏟️" : "🔒"} {a.titleJa}</p>
          {a.unlocked && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {MODES.map((m) => (
                <Link key={m.mode} href={`/test/${a.assessment.id}?mode=${m.mode}`} className="btn flex flex-col items-center bg-gradient-to-b from-[#fffaf0] to-[var(--bg)] px-1 py-2 text-xs">
                  <span className="text-2xl">{m.icon}</span>{m.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
