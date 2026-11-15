"use client";
import { useEffect, useState } from "react";
import { HeroScene } from "@/components/scene/HeroScene";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { Portrait } from "@/components/characters/CharacterArt";
import { apiGet } from "@/lib/api/client";
import { RankingResponseSchema, type RankingResponse } from "@/lib/api/contracts";
import type { CharacterId } from "@/lib/game/characters";

const AVATARS: CharacterId[] = ["haru", "riko", "kiko", "birimo"];

export default function RankingPage() {
  const [scope, setScope] = useState<"national" | "friends">("national");
  const [metric, setMetric] = useState<"coins" | "streak">("coins");
  const [rows, setRows] = useState<RankingResponse["rows"]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/ranking?scope=${scope}&metric=${metric}`, RankingResponseSchema).then((r) => {
      if (!alive) return;
      setRows(r.data.rows ?? []);
      setError(r.error);
    });
    return () => { alive = false; };
  }, [scope, metric]);

  const Tab = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} className={`btn flex-1 px-2 py-2 text-sm ${on ? "btn-coin" : "bg-[var(--surface)]"}`}>{children}</button>
  );
  return (
    <div className="space-y-4">
      <HeroScene title="🏆 ランキング" subtitle="ぜんこくの冒険者と きそおう！" variant="ranking" />
      <ErrorBanner message={error} />
      <div className="flex gap-2"><Tab on={scope === "national"} onClick={() => setScope("national")}>ぜんこく</Tab><Tab on={scope === "friends"} onClick={() => setScope("friends")}>フレンド</Tab></div>
      <div className="flex gap-2"><Tab on={metric === "coins"} onClick={() => setMetric("coins")}>こんしゅうのコイン</Tab><Tab on={metric === "streak"} onClick={() => setMetric("streak")}>れんぞく日数</Tab></div>
      <ol className="card rpg-rivets divide-y-2 divide-dashed divide-[var(--parchment-edge)]">
        {rows.map((r, i) => (
          <li key={r.userId} className="flex items-center gap-3 p-3">
            <span className="w-8 text-center text-xl font-black">{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span>
            <Portrait id={AVATARS[i % AVATARS.length]} size={36} />
            <span className="flex-1 font-bold">{r.nickname}</span>
            <span className="font-black tabular-nums">{metric === "coins" ? `🪙 ${r.value}` : `🔥 ${r.value}日`}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="p-6 text-center text-[var(--ink-2)]">まだデータがありません</li>}
      </ol>
    </div>
  );
}
