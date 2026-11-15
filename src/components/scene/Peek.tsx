/**
 * カードのふち・すき間からキャラクターがのぞく演出。
 * 親要素（relative）のふちに absolute で重ね、pointer-events-none なのでボタン操作のじゃまをしない。
 * キャラは「カードの外側」に半分以上出すので、カードの中の文字には重ならない。
 */
import { StandingFigure, type Pose } from "@/components/characters/StandingArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";

type Place = "top-right" | "top-left";

const PLACE: Record<Place, string> = {
  "top-right": "-top-14 right-3",
  "top-left": "-top-14 left-3",
};

export function PeekCharacter({ id, pose, mood, place = "top-right", height = 76, flip }: { id: CharacterId; pose?: Pose; mood?: Mood; place?: Place; height?: number; flip?: boolean }) {
  return (
    <div className={`pointer-events-none absolute z-10 ${PLACE[place]}`} aria-hidden>
      {/* 立ち絵の上半分だけ見せる（カードの後ろに体がかくれている感じ） */}
      <div className="overflow-hidden" style={{ height: height * 0.62 }}>
        <StandingFigure id={id} pose={pose} mood={mood} height={height} flip={flip} />
      </div>
    </div>
  );
}

export function PeekMonster({ id, place = "top-right", size = 56, flip, letter }: { id: string; place?: Place; size?: number; flip?: boolean; letter?: string }) {
  return (
    <div className={`pointer-events-none absolute z-10 ${place === "top-right" ? "-top-10 right-4" : "-top-10 left-4"}`} aria-hidden>
      <MonsterFigure id={id} size={size} flip={flip} letter={letter} className="drop-shadow-[0_3px_0_rgba(0,0,0,.25)]" />
    </div>
  );
}
