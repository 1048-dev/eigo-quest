"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WorldMap } from "@/components/map/WorldMap";
import { CoinBadge } from "@/components/common/CoinBadge";
import { TreasureAlertModal, type TreasureAlert } from "@/components/common/TreasureAlertModal";
import type { StageNode } from "@/lib/domain/progression";

interface MapResponse {
  nodes: StageNode[];
  current: StageNode | null;
  user: { nickname: string; coins: number; streakDays: number; avatar: { emoji?: string } } | null;
}

export default function MapPage() {
  const [data, setData] = useState<MapResponse | null>(null);
  const [alert, setAlert] = useState<{ alert: TreasureAlert; messageJa: string } | null>(null);

  useEffect(() => {
    fetch("/api/map").then((r) => r.json()).then(setData);
    // ログイン（マップ表示）時にお宝復習アラートを判定
    fetch("/api/treasure-alert").then((r) => r.json()).then((r) => r.show && setAlert(r));
  }, []);

  if (!data) return <p className="p-8 text-center">よみこみちゅう…</p>;
  const cur = data.current;

  return (
    <div>
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-[var(--bg)]/90 px-4 py-2 backdrop-blur">
        <h1 className="text-lg font-black">🗺️ {data.user?.nickname ?? "ゲスト"} のぼうけん</h1>
        <CoinBadge coins={data.user?.coins ?? 0} streak={data.user?.streakDays} />
      </header>

      {cur && (
        <div className="card my-3 flex items-center justify-between p-4">
          <div>
            <p className="text-xs font-bold text-[var(--ink-2)]">きょうのクエスト</p>
            <p className="text-lg font-black">
              {cur.type === "LESSON" ? `Lesson ${cur.lessonNo}` : cur.type === "BOSS" ? "ボス戦！" : cur.type === "MINI" ? "まとめテスト" : `Lesson ${cur.lessonNo} の翌日テスト`}
            </p>
          </div>
          {cur.status === "WAIT_TOMORROW" ? (
            <span className="text-sm font-bold text-[var(--ink-2)]">あしたまで まってね 🌙</span>
          ) : (
            <Link className="btn btn-primary" href={cur.type === "LESSON" ? `/lesson/${cur.lessonNo}` : `/test/${cur.assessmentId}`}>スタート</Link>
          )}
        </div>
      )}

      <WorldMap nodes={data.nodes} avatar={data.user?.avatar?.emoji ?? "🧒"} />

      {alert && <TreasureAlertModal alert={alert.alert} message={alert.messageJa} onClose={() => {
        fetch(`/api/treasure-alert?id=${alert.alert.id}`, { method: "DELETE" });
        setAlert(null);
      }} />}
    </div>
  );
}
