"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WorldMap } from "@/components/map/WorldMap";
import { StatusBoard } from "@/components/game/StatusBoard";
import { TreasureAlertModal } from "@/components/common/TreasureAlertModal";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { HeroScene } from "@/components/scene/HeroScene";
import { PeekCharacter } from "@/components/scene/Peek";
import { Portrait } from "@/components/characters/CharacterArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { apiDelete, apiGet } from "@/lib/api/client";
import { DEFAULT_USER, MapResponseSchema, TreasureAlertResponseSchema, type MapResponse, type TreasureAlertResponse } from "@/lib/api/contracts";
import { companionLine, OFFLINE_LINE } from "@/lib/game/companion";

type NodeType = MapResponse["nodes"][number]["type"];

const QUEST: Record<NodeType, { text: (n: number) => string; icon: React.ReactNode }> = {
  LESSON: { text: (n) => `Lesson ${n} を探検する`, icon: <Portrait id="haru" size={48} /> },
  CHECK: { text: (n) => `Lesson ${n} の翌日テスト`, icon: <Portrait id="riko" size={48} ring="#ff8a3d" /> },
  MINI: { text: () => "宝箱のまとめテスト", icon: <Portrait id="kiko" size={48} ring="#9b6bff" /> },
  BOSS: { text: () => "遺跡のボスにいどむ！", icon: <MonsterFigure id="mon-006" size={52} /> },
};

export default function MapPage() {
  const [data, setData] = useState<MapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<TreasureAlertResponse | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet("/api/map", MapResponseSchema).then((r) => {
      if (!alive) return;
      setData(r.data); // 失敗しても data は空の安全な形
      setError(r.error);
    });
    // ログイン（マップ表示）時にお宝復習アラートを判定
    apiGet("/api/treasure-alert", TreasureAlertResponseSchema).then((r) => {
      if (alive && r.ok && r.data.show && r.data.alert) setAlert(r.data);
    });
    return () => { alive = false; };
  }, []);

  if (!data) return <p className="rpg-title p-8 text-center text-xl">ぼうけんの じゅんびちゅう…</p>;

  const nodes = data.nodes ?? [];
  const user = data.user ?? DEFAULT_USER;
  const cur = data.current ?? null;
  const lessonsCleared = nodes.filter((n) => n.type === "LESSON" && n.status === "CLEARED").length;
  const totalLessons = nodes.filter((n) => n.type === "LESSON").length;
  const line = error ? OFFLINE_LINE : companionLine({
    playerName: user.nickname,
    streakDays: user.streakDays,
    coins: user.coins,
    lessonsCleared,
    current: cur,
    hasTreasureAlert: !!alert?.alert,
    hour: new Date().getHours(),
  });

  return (
    <div className="space-y-5">
      <HeroScene title="英語クエスト" subtitle="ハルたちと えいごの遺跡を探検しよう！" variant="map" />

      <ErrorBanner message={error} />

      <StatusBoard playerName={user.nickname} coins={user.coins} streakDays={user.streakDays}
        lessonsCleared={lessonsCleared} totalLessons={totalLessons} line={line} />

      {cur && (
        <div className="card rpg-rivets relative mt-10 flex items-center justify-between gap-3 p-4">
          <PeekCharacter id="riko" pose="point" place="top-right" />
          <div className="flex items-center gap-3">
            <span className="shrink-0">{QUEST[cur.type].icon}</span>
            <div>
              <p className="font-title text-xs text-[var(--gold-dark)]">きょうのクエスト</p>
              <p className="text-base font-black leading-snug">{QUEST[cur.type].text(cur.lessonNo)}</p>
            </div>
          </div>
          {cur.status === "WAIT_TOMORROW" ? (
            <span className="text-sm font-bold text-[var(--ink-2)]">あしたまで<br />まってね 🌙</span>
          ) : (
            <Link className={`btn shrink-0 whitespace-nowrap px-4 ${cur.type === "BOSS" ? "btn-berry" : "btn-primary"}`}
              href={cur.type === "LESSON" ? `/lesson/${cur.lessonNo}` : `/test/${cur.assessmentId ?? ""}`}>しゅっぱつ！</Link>
          )}
        </div>
      )}

      {nodes.length > 0 ? (
        <div className="overflow-hidden rounded-[24px] border-4 border-[var(--gold)] shadow-[0_6px_0_var(--gold-deep),0_14px_28px_rgba(0,0,0,.45)]">
          <WorldMap nodes={nodes} />
        </div>
      ) : (
        <div className="card rpg-rivets p-6 text-center font-bold">マップを よみこめなかったよ。ページを読みこみなおしてね。</div>
      )}

      {alert?.alert && (
        <TreasureAlertModal alert={alert.alert} message={alert.messageJa} onClose={() => {
          void apiDelete(`/api/treasure-alert?id=${encodeURIComponent(alert.alert!.id)}`, TreasureAlertResponseSchema);
          setAlert(null);
        }} />
      )}
    </div>
  );
}

