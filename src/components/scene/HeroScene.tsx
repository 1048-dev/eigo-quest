/**
 * ページ上部の「映画のキービジュアル」風バナー。
 * 奥から: 夕暮れの空 → 神殿の門から差す光 → 巨大なボスのシルエット（光る目）→ ゴッドレイ →
 *         古代樹とレリーフ壁 → 魔法陣の広場 → ハルたちとモンスター（逆光のふち取り）→ ぼけた手前のシダ → 霧・光の粒・ビネット
 * タイトルはダークゴールドのメタル枠＋ガラスのプレートに載せるので、絵がにぎやかでも読みやすい。
 */
import { Standing, type Pose } from "@/components/characters/StandingArt";
import { MonsterArt } from "@/components/characters/MonsterArt";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";
import { AncientTree, At, ColorGrade, Fern, Fog, GodRays, KeyLight, MagicCircle, Motes, RuinRelief, TempleGate, Vignette } from "./CinematicScenery";

export type HeroVariant = "map" | "dashboard" | "arena" | "gacha" | "ranking" | "lesson";

interface Cast { kind: "char"; id: CharacterId; x: number; s: number; pose?: Pose; mood?: Mood; flip?: boolean; y?: number }
interface Mon { kind: "mon"; id: string; x: number; s: number; flip?: boolean; letter?: string; y?: number }

const W = 360;
const H = 270;
const GROUND = 246;

const CASTS: Record<HeroVariant, (Cast | Mon)[]> = {
  map: [
    { kind: "mon", id: "mon-044", x: 22, s: 0.5, y: -6 },
    { kind: "mon", id: "mon-028", x: 330, s: 0.45, flip: true, y: -8 },
    { kind: "char", id: "riko", x: 106, s: 0.79, pose: "wave" },
    { kind: "char", id: "kiko", x: 254, s: 0.76, pose: "cheer", flip: true },
    { kind: "mon", id: "mon-091", x: 300, s: 0.55, flip: true },
    { kind: "char", id: "haru", x: 180, s: 0.86, pose: "point" },
    { kind: "char", id: "birimo", x: 66, s: 0.52, mood: "excited" },
  ],
  dashboard: [
    { kind: "mon", id: "mon-055", x: 316, s: 0.5, flip: true, y: -40 },
    { kind: "mon", id: "mon-037", x: 28, s: 0.5 },
    { kind: "char", id: "kiko", x: 100, s: 0.76, pose: "wave" },
    { kind: "char", id: "riko", x: 258, s: 0.79, pose: "idle", flip: true },
    { kind: "char", id: "haru", x: 180, s: 0.86, pose: "cheer" },
    { kind: "char", id: "birimo", x: 320, s: 0.5, mood: "happy" },
  ],
  arena: [
    { kind: "mon", id: "mon-056", x: 250, s: 0.5, flip: true, y: -50 },
    { kind: "mon", id: "mon-028", x: 222, s: 0.55, flip: true },
    { kind: "mon", id: "mon-091", x: 330, s: 0.55, flip: true },
    { kind: "mon", id: "mon-006", x: 286, s: 0.75, flip: true, y: -6 },
    { kind: "char", id: "haru", x: 70, s: 0.86, pose: "point" },
    { kind: "char", id: "birimo", x: 140, s: 0.55, mood: "excited" },
  ],
  gacha: [
    { kind: "mon", id: "mon-019", x: 132, s: 0.46, letter: "A", y: -44 },
    { kind: "mon", id: "mon-080", x: 228, s: 0.46, letter: "B", y: -44 },
    { kind: "mon", id: "mon-055", x: 180, s: 0.6, y: -60 },
    { kind: "char", id: "kiko", x: 66, s: 0.72, pose: "cheer" },
    { kind: "char", id: "birimo", x: 296, s: 0.56, mood: "excited" },
    { kind: "mon", id: "mon-037", x: 180, s: 0.5 },
  ],
  ranking: [
    { kind: "mon", id: "mon-037", x: 28, s: 0.45 },
    { kind: "mon", id: "mon-091", x: 334, s: 0.45, flip: true },
    { kind: "char", id: "riko", x: 96, s: 0.83, pose: "cheer" },
    { kind: "char", id: "kiko", x: 264, s: 0.79, pose: "cheer", flip: true },
    { kind: "char", id: "haru", x: 180, s: 0.9, pose: "cheer" },
    { kind: "char", id: "birimo", x: 230, s: 0.45, mood: "excited", y: -110 },
  ],
  lesson: [
    { kind: "char", id: "riko", x: 68, s: 0.74, pose: "wave" },
    { kind: "char", id: "haru", x: 140, s: 0.8, pose: "point" },
    { kind: "char", id: "kiko", x: 214, s: 0.7, pose: "idle", flip: true },
    { kind: "char", id: "birimo", x: 290, s: 0.5, mood: "happy" },
  ],
};

/** 背景にそびえるボスのシルエット（ドラゴン型・光る目） */
function LoomingBoss({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={0.9}>
      <g stroke="#5fe0c8" strokeOpacity={0.45} strokeWidth={3} fill="none" filter="url(#f-dof-1)">
        <circle cx={0} cy={-30} r={47} /><path d="M-30 -66 L-40 -110 L-14 -76 M30 -66 L40 -110 L14 -76" />
      </g>
      <path d="M-120 60 Q-150 -10 -80 -30 L-40 10 Z M120 60 Q150 -10 80 -30 L40 10 Z" fill="#0c1a17" />
      <ellipse cx={0} cy={40} rx={70} ry={60} fill="#0c1a17" />
      <circle cx={0} cy={-30} r={46} fill="#0c1a17" />
      <path d="M-30 -66 L-40 -110 L-14 -76 Z M30 -66 L40 -110 L14 -76 Z" fill="#0c1a17" />
      <g filter="url(#f-bloom-gold)">
        <ellipse cx={-16} cy={-30} rx={7} ry={4} fill="#ffcf4a" />
        <ellipse cx={16} cy={-30} rx={7} ry={4} fill="#ffcf4a" />
      </g>
    </g>
  );
}

export function HeroScene({ title, subtitle, variant = "map" }: { title: string; subtitle?: string; variant?: HeroVariant }) {
  const v = variant;
  return (
    <header className="hero-frame relative -mx-4 overflow-hidden sm:mx-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`${title}：ハルたちとモンスターが古代遺跡を冒険している場面`}>
        <defs>
          <linearGradient id={`sky-${v}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1f2e" />
            <stop offset="40%" stopColor="#1d4a52" />
            <stop offset="72%" stopColor="#c98a3a" />
            <stop offset="100%" stopColor="#f2c46a" />
          </linearGradient>
          <linearGradient id={`plaza-${v}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6a5a3e" /><stop offset="100%" stopColor="#2a2216" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#sky-${v})`} />
        <radialGradient id={`moon-${v}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e0" /><stop offset="30%" stopColor="#ffe9b0" stopOpacity=".55" /><stop offset="100%" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
        <circle cx={292} cy={40} r={46} fill={`url(#moon-${v})`} />
        <circle cx={292} cy={40} r={11} fill="#fff6dc" />
        <path d="M-20 70 Q90 30 180 62 T380 50" stroke="#7ff5d6" strokeOpacity={0.22} strokeWidth={22} fill="none" filter="url(#f-glow-soft)" />
        <path d="M-20 92 Q110 60 200 84 T380 76" stroke="#b8a8ff" strokeOpacity={0.16} strokeWidth={16} fill="none" filter="url(#f-glow-soft)" />

        {/* 遠景: 神殿と光、そびえるボス */}
        {(v === "arena" || v === "map") && <LoomingBoss x={v === "arena" ? 250 : 286} y={120} s={0.9} />}
        <At x={180} y={196} filter="url(#f-dof-1)" opacity={0.95}><TempleGate s={0.95} /></At>
        <GodRays x={60} w={260} h={H} count={6} opacity={0.16} />
        <At x={24} y={210} opacity={0.9}><AncientTree s={0.85} depth="far" seed={1} /></At>
        <At x={340} y={214} opacity={0.9}><AncientTree s={0.9} depth="far" seed={3} /></At>

        {/* 中景: レリーフの壁と古代樹 */}
        <At x={56} y={226}><RuinRelief w={90} h={62} glyphs={["A", "B"]} glow={v === "lesson"} /></At>
        <At x={306} y={228}><RuinRelief w={96} h={58} glyphs={["C", "D"]} glow={v === "gacha"} /></At>
        <At x={-6} y={250}><AncientTree s={0.62} depth="mid" seed={2} /></At>
        <At x={368} y={252}><AncientTree s={0.58} depth="mid" seed={5} /></At>

        {/* 広場と魔法陣 */}
        <path d={`M0 ${GROUND - 18} Q180 ${GROUND - 34} 360 ${GROUND - 18} L360 ${H} L0 ${H} Z`} fill={`url(#plaza-${v})`} />
        <path d={`M0 ${GROUND - 18} Q180 ${GROUND - 34} 360 ${GROUND - 18}`} stroke="#f2c46a" strokeOpacity={0.35} strokeWidth={1.5} fill="none" />
        <At x={180} y={GROUND - 4}><MagicCircle rx={110} ry={16} /></At>
        <Fog y={GROUND - 22} w={W} opacity={0.28} />
        <KeyLight x={180} y={GROUND - 90} rx={150} ry={80} opacity={0.3} />

        {/* キャラクターとモンスター（逆光のふち取り＋影） */}
        <g filter="url(#f-rim)">
          {CASTS[v].map((c, i) => {
            if (c.kind === "char") {
              const h = 170 * c.s;
              return (
                <g key={i} transform={`translate(${c.x - 50 * c.s} ${GROUND - h + 6 + (c.y ?? 0)})`}>
                  <g transform={`scale(${c.s})${c.flip ? " translate(100 0) scale(-1 1)" : ""}`}><Standing id={c.id} pose={c.pose} mood={c.mood} /></g>
                </g>
              );
            }
            const h = 100 * c.s;
            return (
              <g key={i} transform={`translate(${c.x - 50 * c.s} ${GROUND - h + 4 + (c.y ?? 0)})`}>
                <g transform={`scale(${c.s})${c.flip ? " translate(100 0) scale(-1 1)" : ""}`}><MonsterArt id={c.id} letter={c.letter} flip={c.flip} /></g>
              </g>
            );
          })}
        </g>

        {/* 手前: ぼけたシダ・霧・光の粒・ビネット */}
        <At x={-10} y={H + 6}><Fern s={0.9} /></At>
        <At x={W + 10} y={H + 6}><Fern s={0.85} flip /></At>
        <Motes w={W} h={H - 40} n={16} seed={v.length} />
        <ColorGrade w={W} h={H} />
        <Vignette w={W} h={H} id={`vig-${v}`} />
      </svg>

      {/* タイトル: ダークゴールドのメタル枠＋ガラス */}
      <div className="absolute inset-x-0 top-3 flex justify-center px-4">
        <div className="title-plate px-6 py-2 text-center">
          <h1 className="title-metal text-[1.35rem] leading-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[11px] font-bold text-[var(--ink-2)]">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
