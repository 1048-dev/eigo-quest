/**
 * ページの一番下（メニューの上）に、キャラクターとモンスターが草地に並ぶ帯。
 * 画面の下の空白を「冒険の仲間たち」で埋める。
 */
import { Standing } from "@/components/characters/StandingArt";
import { MonsterArt } from "@/components/characters/MonsterArt";
import { Bush, Flowers, Rock } from "./SceneryArt";

const W = 360;
const H = 120;
const G = 104;

export function CharacterParade() {
  const chars = [
    { id: "kiko" as const, x: 46, s: 0.5, pose: "wave" as const },
    { id: "haru" as const, x: 150, s: 0.56, pose: "cheer" as const },
    { id: "riko" as const, x: 206, s: 0.5, pose: "wave" as const },
    { id: "birimo" as const, x: 254, s: 0.4 },
  ];
  const mons = [
    { id: "m-penguin-pop", x: 98, s: 0.42 },
    { id: "m-sammy-snake", x: 302, s: 0.42, flip: true },
    { id: "m-slime-c", x: 340, s: 0.32 },
    { id: "m-ant-anty", x: 10, s: 0.34 },
  ];
  return (
    <div className="pointer-events-none -mx-4 mt-6 sm:mx-0" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <path d={`M0 ${G - 8} Q90 ${G - 22} 180 ${G - 10} Q270 ${G} 360 ${G - 16} L360 ${H} L0 ${H} Z`} fill="#4fae66" />
        <path d={`M0 ${G + 2} Q120 ${G - 6} 240 ${G + 2} Q300 ${G + 6} 360 ${G} L360 ${H} L0 ${H} Z`} fill="#3d9655" />
        <g transform={`translate(124 ${G + 2})`}><Bush s={0.5} /></g>
        <g transform={`translate(280 ${G + 4})`}><Flowers s={0.8} /></g>
        <g transform={`translate(74 ${G + 4})`}><Rock s={0.6} /></g>
        {mons.map((m) => (
          <g key={m.id} transform={`translate(${m.x - 50 * m.s} ${G - 100 * m.s + 4})`}>
            <g transform={`scale(${m.s})${m.flip ? " translate(100 0) scale(-1 1)" : ""}`}><MonsterArt id={m.id} flip={m.flip} /></g>
          </g>
        ))}
        {chars.map((c) => (
          <g key={c.id} transform={`translate(${c.x - 50 * c.s} ${G - 170 * c.s + 6})`}>
            <g transform={`scale(${c.s})`}><Standing id={c.id} pose={c.pose} mood="happy" /></g>
          </g>
        ))}
      </svg>
    </div>
  );
}
