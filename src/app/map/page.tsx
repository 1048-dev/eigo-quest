"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { WorldMap } from "@/components/map/WorldMap";
import { StatusBoard } from "@/components/game/StatusBoard";
import { TreasureAlertModal } from "@/components/common/TreasureAlertModal";
import { OfflineNote } from "@/components/common/OfflineNote";
import { AnnouncementsPanel } from "@/components/common/AnnouncementsPanel";
import { HeroScene } from "@/components/scene/HeroScene";
import { PeekCharacter } from "@/components/scene/Peek";
import { Portrait } from "@/components/characters/CharacterArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { apiDelete, apiGet, isUnreachable } from "@/lib/api/client";
import { offlineMap } from "@/lib/offline";
import { readLocalProgress } from "@/lib/offline/localProgress";
import { DEFAULT_USER, MapResponseSchema, TreasureAlertResponseSchema, type MapResponse, type TreasureAlertResponse } from "@/lib/api/contracts";
import { companionLine, OFFLINE_LINE } from "@/lib/game/companion";
import { COIN_RULES } from "@/lib/domain/config";

type NodeType = MapResponse["nodes"][number]["type"];

const QUEST: Record<NodeType, { text: (n: number) => string; icon: React.ReactNode }> = {
  LESSON: { text: (n) => `Lesson ${n} を探検する`, icon: <Portrait id="haru" size={48} /> },
  CHECK: { text: (n) => `Lesson ${n} の復習クエスト`, icon: <Portrait id="riko" size={48} ring="#ff8a3d" /> },
  MINI: { text: () => "宝箱のまとめテスト", icon: <Portrait id="kiko" size={48} ring="#9b6bff" /> },
  BOSS: { text: () => "遺跡のボスにいどむ！", icon: <MonsterFigure id="mon-006" size={52} /> },
};

export default function MapPage() {
  const [data, setData] = useState<MapResponse | null>(null);
  const [offline, setOffline] = useState(false);
  const [alert, setAlert] = useState<TreasureAlertResponse | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet("/api/map", MapResponseSchema).then((r) => {
      if (!alive) return;
      // サーバーに届かない・中身が空 → 内蔵データ（Lesson 1 から遊べるマップ）に切り替える
      const usable = r.ok && (r.data.nodes ?? []).length > 0;
      // サーバーが「おためしモード」の マップを返したときも、この ブラウザで クリアした分を のせて 作りなおす
      const d = usable && !r.data.offline ? r.data : usable || isUnreachable(r) || (r.data.nodes ?? []).length === 0 ? offlineMap(new Date(), readLocalProgress()) : r.data;
      setData(d);
      setOffline(!!d.offline);
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
  // いちばん新しく クリアした レッスン（きょうのまとめ用）
  const latestCleared = nodes.reduce((m, n) => (n.type === "LESSON" && n.status === "CLEARED" ? Math.max(m, n.lessonNo) : m), 0);
  const line = offline ? OFFLINE_LINE : companionLine({
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

      <OfflineNote show={offline} note="きろくは つながったら また つけられるよ" />

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

      {latestCleared > 0 && (
        <Link href={`/recap/${latestCleared}`} className="card rpg-rivets flex items-center justify-between gap-3 p-3">
          <span className="flex items-center gap-3">
            <Portrait id="birimo" size={44} />
            <span>
              <span className="block text-base font-black">🎬 きょうのまとめを見る</span>
              <span className="block text-xs text-[var(--ink-2)]">Lesson {latestCleared} を 2ぷんで おさらい（1日1かい 🪙+5）</span>
            </span>
          </span>
          <span className="btn btn-primary shrink-0 px-3 py-2 text-sm">▶</span>
        </Link>
      )}

      <Link href="/library" className="card rpg-rivets flex items-center justify-between gap-3 p-3">
        <span className="flex items-center gap-3">
          <Portrait id="kiko" size={44} />
          <span>
            <span className="block text-base font-black">📚 えいごの としょかん</span>
            <span className="block text-xs text-[var(--ink-2)]">おはなし・うた・フリートーク（1日1かい 🪙+{COIN_RULES.libraryDaily}）</span>
          </span>
        </span>
        <span className="btn btn-primary shrink-0 px-3 py-2 text-sm">▶</span>
      </Link>

      <Link href="/yearly" className="card flex items-center justify-between gap-3 p-3">
        <span className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🏆</span>
          <span>
            <span className="block text-base font-black">年に1回の 力だめし</span>
            <span className="block text-xs text-[var(--ink-2)]">聞く・読む・話す・書く で 1年の のびを たしかめよう</span>
          </span>
        </span>
        <span className="btn btn-ghost shrink-0 px-3 py-2 text-sm">▶</span>
      </Link>

      <div className="overflow-hidden rounded-[24px] border-4 border-[var(--gold)] shadow-[0_6px_0_var(--gold-deep),0_14px_28px_rgba(0,0,0,.45)]">
        <WorldMap nodes={nodes.length > 0 ? nodes : offlineMap(new Date(), readLocalProgress()).nodes} />
      </div>

      <AnnouncementsPanel />

      {alert?.alert && (
        <TreasureAlertModal alert={alert.alert} message={alert.messageJa} onClose={() => {
          void apiDelete(`/api/treasure-alert?id=${encodeURIComponent(alert.alert!.id)}`, TreasureAlertResponseSchema);
          setAlert(null);
        }} />
      )}
    </div>
  );
}

