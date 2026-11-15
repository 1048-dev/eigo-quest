/**
 * ページの一番下（メニューの上）。レリーフの壁を背に、スポットライトの当たる石の舞台に仲間とモンスターが並ぶ。
 */
import { Standing } from "@/components/characters/StandingArt";
import { MonsterArt } from "@/components/characters/MonsterArt";
import { At, Fog, MagicCircle, Motes, RuinRelief } from "./CinematicScenery";

const W = 360;
const H = 170;
const G = 150;

export function CharacterParade() {
  const chars = [
    { id: "kiko" as const, x: 78, s: 0.56, pose: "wave" as const },
    { id: "haru" as const, x: 180, s: 0.66, pose: "cheer" as const },
    { id: "riko" as const, x: 248, s: 0.56, pose: "wave" as const },
    { id: "birimo" as const, x: 300, s: 0.44 },
  ];
  const mons = [
    { id: "m-penguin-pop", x: 128, s: 0.44 },
    { id: "m-sammy-snake", x: 338, s: 0.4, flip: true },
    { id: "m-slime-c", x: 26, s: 0.36 },
  ];
  return (
    <div className="pointer-events-none -mx-4 mt-8 sm:mx-0" aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <defs>
          <radialGradient id="parade-spot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe7a8" stopOpacity=".42" /><stop offset="100%" stopColor="#ffe7a8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="parade-stage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5e4d31" stopOpacity=".95" /><stop offset="100%" stopColor="#1c150c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="parade-wall-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="45%" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="parade-wall-mask"><rect width={W} height={H} fill="url(#parade-wall-fade)" /></mask>
        </defs>
        <g mask="url(#parade-wall-mask)">
          <At x={70} y={G - 12} opacity={0.7}><RuinRelief w={120} h={70} glyphs={["A", "B", "C"]} /></At>
          <At x={292} y={G - 12} opacity={0.7}><RuinRelief w={130} h={64} glyphs={["D", "E"]} /></At>
        </g>
        <ellipse cx={W / 2} cy={G - 40} rx={W * 0.55} ry={90} fill="url(#parade-spot)" />
        <path d={`M0 ${G - 10} L${W} ${G - 10} L${W} ${H} L0 ${H} Z`} fill="url(#parade-stage)" />
        <path d={`M0 ${G - 10} L${W} ${G - 10}`} stroke="#f2c46a" strokeOpacity={0.5} strokeWidth={1.4} />
        <At x={180} y={G - 2}><MagicCircle rx={120} ry={10} /></At>
        <g filter="url(#f-rim)">
          {mons.map((m) => (
            <g key={m.id} transform={`translate(${m.x - 50 * m.s} ${G - 100 * m.s + 2})`}>
              <g transform={`scale(${m.s})${m.flip ? " translate(100 0) scale(-1 1)" : ""}`}><MonsterArt id={m.id} flip={m.flip} /></g>
            </g>
          ))}
          {chars.map((c) => (
            <g key={c.id} transform={`translate(${c.x - 50 * c.s} ${G - 170 * c.s + 4})`}>
              <g transform={`scale(${c.s})`}><Standing id={c.id} pose={c.pose} mood="happy" /></g>
            </g>
          ))}
        </g>
        <Fog y={G + 2} w={W} opacity={0.3} />
        <Motes w={W} h={G} n={10} seed={7} />
      </svg>
    </div>
  );
}
