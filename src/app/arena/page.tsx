"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HeroScene } from "@/components/scene/HeroScene";
import { PeekMonster } from "@/components/scene/Peek";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { CompanionBubble } from "@/components/game/CompanionBubble";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { Portrait } from "@/components/characters/CharacterArt";
import { apiGet } from "@/lib/api/client";
import { MapResponseSchema, type MapResponse } from "@/lib/api/contracts";
import { COIN_RULES } from "@/lib/domain/config";
import type { CharacterId } from "@/lib/game/characters";

const MODES: { mode: string; label: string; buddy: CharacterId }[] = [
  { mode: "MIXED", label: "ミックス", buddy: "haru" },
  { mode: "LISTENING", label: "リスニング", buddy: "birimo" },
  { mode: "SPEAKING", label: "はつおん", buddy: "riko" },
  { mode: "WRITING", label: "ひっき", buddy: "kiko" },
];
const ARENA_BOSSES = ["m-alpha-dragon", "m-shhh-ghost", "m-tiger-tap"];

export default function ArenaPage() {
  const [arenas, setArenas] = useState<MapResponse["arenas"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet("/api/map", MapResponseSchema).then((r) => {
      if (!alive) return;
      setArenas(r.data.arenas ?? []);
      setError(r.error);
    });
    return () => { alive = false; };
  }, []);

  if (!arenas) return <p className="rpg-title p-8 text-center text-xl">アリーナを よみこみちゅう…</p>;

  return (
    <div className="space-y-5">
      <HeroScene title="復習アリーナ" subtitle="なんどでも ちょうせんOK！" variant="arena" />
      <ErrorBanner message={error} />
      <CompanionBubble line={{ mood: "excited", text: `1回 🪙${COIN_RULES.arenaPlay}（1日${COIN_RULES.arenaFullRewardPlaysPerDay}回まで）もらえるビリ！わすれかけの もんだいが でやすいビリ。` }} />

      {arenas.length === 0 && (
        <div className="card rpg-rivets relative mt-10 flex items-center gap-3 p-5">
          <PeekMonster id="m-alpha-dragon" size={64} />
          <MonsterFigure id="m-alpha-dragon" size={64} />
          <p className="font-bold">Lesson 30 のボス「アルファベットドラゴン」をたおすと、アリーナが ひらくよ！</p>
        </div>
      )}

      {arenas.map((a, i) => (
        <div key={a.assessment.id} className={`card rpg-rivets relative mt-10 p-4 ${a.unlocked ? "" : "opacity-60"}`}>
          <PeekMonster id={ARENA_BOSSES[i % ARENA_BOSSES.length]} flip size={60} />
          <p className="font-title text-lg text-[var(--gold-dark)]">{a.unlocked ? "🏟️" : "🔒"} {a.titleJa}</p>
          {a.unlocked && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {MODES.map((m) => (
                <Link key={m.mode} href={`/test/${encodeURIComponent(a.assessment.id)}?mode=${m.mode}`}
                  className="btn flex flex-col items-center gap-1 px-1 py-2 text-xs">
                  <Portrait id={m.buddy} size={34} />{m.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
