"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WorldMap } from "@/components/map/WorldMap";
import { StatusBoard } from "@/components/game/StatusBoard";
import { TreasureAlertModal, type TreasureAlert } from "@/components/common/TreasureAlertModal";
import type { StageNode } from "@/lib/domain/progression";
import { companionLine } from "@/lib/game/companion";

interface MapResponse {
  nodes: StageNode[];
  current: StageNode | null;
  user: { nickname: string; coins: number; streakDays: number } | null;
}

const QUEST_LABEL: Record<StageNode["type"], { icon: string; text: (n: number) => string }> = {
  LESSON: { icon: "🗝️", text: (n) => `Lesson ${n} を探検する` },
  CHECK: { icon: "💎", text: (n) => `Lesson ${n} の翌日テスト` },
  MINI: { icon: "🧰", text: () => "宝箱のまとめテスト" },
  BOSS: { icon: "🐉", text: () => "遺跡のボスにいどむ！" },
};

export default function MapPage() {
  const [data, setData] = useState<MapResponse | null>(null);
  const [alert, setAlert] = useState<{ alert: TreasureAlert; messageJa: string } | null>(null);

  useEffect(() => {
    fetch("/api/map").then((r) => r.json()).then(setData);
    // ログイン（マップ表示）時にお宝復習アラートを判定
    fetch("/api/treasure-alert").then((r) => r.json()).then((r) => r.show && setAlert(r));
  }, []);

  if (!data) return <p className="rpg-title p-8 text-center text-xl">ぼうけんの じゅんびちゅう…</p>;
  const cur = data.current;
  const lessonsCleared = data.nodes.filter((n) => n.type === "LESSON" && n.status === "CLEARED").length;
  const totalLessons = data.nodes.filter((n) => n.type === "LESSON").length;
  const name = data.user?.nickname ?? "ハル";
  const line = companionLine({
    playerName: name,
    streakDays: data.user?.streakDays ?? 0,
    coins: data.user?.coins ?? 0,
    lessonsCleared,
    current: cur,
    hasTreasureAlert: !!alert,
    hour: new Date().getHours(),
  });

  return (
    <div className="space-y-4">
      <h1 className="rpg-title text-center text-2xl">⚔️ 英語クエスト ⚔️</h1>

      <StatusBoard playerName={name} coins={data.user?.coins ?? 0} streakDays={data.user?.streakDays ?? 0}
        lessonsCleared={lessonsCleared} totalLessons={totalLessons} line={line} />

      {cur && (
        <div className="card rpg-rivets flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[var(--gold-dark)] bg-[var(--bg)] text-3xl">{QUEST_LABEL[cur.type].icon}</span>
            <div>
              <p className="font-pixel text-xs text-[var(--gold-dark)]">きょうのクエスト</p>
              <p className="text-lg font-black">{QUEST_LABEL[cur.type].text(cur.lessonNo)}</p>
            </div>
          </div>
          {cur.status === "WAIT_TOMORROW" ? (
            <span className="text-sm font-bold text-[var(--ink-2)]">あしたまで<br />まってね 🌙</span>
          ) : (
            <Link className={`btn shrink-0 whitespace-nowrap px-4 ${cur.type === "BOSS" ? "btn-berry" : "btn-primary"}`} href={cur.type === "LESSON" ? `/lesson/${cur.lessonNo}` : `/test/${cur.assessmentId}`}>しゅっぱつ！</Link>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border-4 border-[var(--gold)] shadow-[0_6px_0_var(--gold-deep),0_14px_28px_rgba(0,0,0,.45)]">
        <WorldMap nodes={data.nodes} />
      </div>

      {alert && <TreasureAlertModal alert={alert.alert} message={alert.messageJa} onClose={() => {
        fetch(`/api/treasure-alert?id=${alert.alert.id}`, { method: "DELETE" });
        setAlert(null);
      }} />}
    </div>
  );
}
