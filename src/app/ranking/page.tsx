"use client";
import { useEffect, useState } from "react";

type Row = { rank: number; userId: string; nickname: string; value: number };

export default function RankingPage() {
  const [scope, setScope] = useState<"national" | "friends">("national");
  const [metric, setMetric] = useState<"coins" | "streak">("coins");
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { fetch(`/api/ranking?scope=${scope}&metric=${metric}`).then((r) => r.json()).then((d) => setRows(d.rows)); }, [scope, metric]);

  const Tab = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} className={`flex-1 rounded-full py-2 text-sm font-black ${on ? "bg-[var(--accent)] text-white" : "bg-[var(--surface)]"}`}>{children}</button>
  );
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-black">🏆 ランキング</h1>
      <div className="flex gap-2"><Tab on={scope === "national"} onClick={() => setScope("national")}>ぜんこく</Tab><Tab on={scope === "friends"} onClick={() => setScope("friends")}>フレンド</Tab></div>
      <div className="flex gap-2"><Tab on={metric === "coins"} onClick={() => setMetric("coins")}>こんしゅうのコイン</Tab><Tab on={metric === "streak"} onClick={() => setMetric("streak")}>れんぞく日数</Tab></div>
      <ol className="card divide-y divide-black/5">
        {rows.map((r) => (
          <li key={r.userId} className="flex items-center gap-3 p-3">
            <span className="w-8 text-center text-xl font-black">{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span>
            <span className="flex-1 font-bold">{r.nickname}</span>
            <span className="font-black tabular-nums">{metric === "coins" ? `🪙 ${r.value}` : `🔥 ${r.value}日`}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="p-6 text-center text-[var(--ink-2)]">まだデータがありません</li>}
      </ol>
    </div>
  );
}
